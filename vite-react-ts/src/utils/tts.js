/**
 * TTS 工具函数 - 支持 Node.js 环境
 */

// Node.js 环境下使用 Azure TTS SDK
export async function synthesizeSpeech(text, voice) {
  if (typeof window === 'undefined') {
    // Node.js 环境
    return await synthesizeSpeechNode(text, voice);
  } else {
    // 浏览器环境
    return await synthesizeSpeechBrowser(text, voice);
  }
}

// Node.js 环境实现
async function synthesizeSpeechNode(text, voice) {
  try {
    const SpeechSDK = await import('microsoft-cognitiveservices-speech-sdk');
    const sdk = SpeechSDK.default;
    
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.SPEECH_KEY,
      process.env.SPEECH_REGION
    );
    
    speechConfig.speechSynthesisVoiceName = voice;
    
    // 使用音频缓冲区输出（而不是文件）
    const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
    
    return new Promise((resolve, reject) => {
      let resolved = false;
      let audioBuffer = null;
      
      // 设置连接事件来获取音频数据
      synthesizer.synthesizing = (sender, event) => {
        // 累积音频数据
        if (!audioBuffer) {
          audioBuffer = Buffer.from(event.result.audioData);
        } else {
          audioBuffer = Buffer.concat([audioBuffer, Buffer.from(event.result.audioData)]);
        }
      };
      
      synthesizer.speakTextAsync(
        text,
        (result) => {
          if (resolved) return;
          
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            try {
              resolved = true;
              // 获取完整的音频数据
              if (result.audioData && result.audioData.byteLength > 0) {
                resolve(Buffer.from(result.audioData));
              } else if (audioBuffer) {
                resolve(audioBuffer);
              } else {
                // 如果没有得到音频数据，重新尝试用文件方式作为备选
                synthesizeSpeechWithFile(text, voice, sdk).then(resolve).catch(reject);
              }
            } catch (err) {
              reject(err);
            }
          } else if (result.reason === sdk.ResultReason.Canceled) {
            resolved = true;
            const cancellation = sdk.SpeechSynthesisCancellationDetails.fromResult(result);
            reject(new Error(`语音合成被取消: ${cancellation.reason} - ${cancellation.errorDetails}`));
          } else {
            resolved = true;
            reject(new Error(`语音合成失败: ${result.reason}`));
          }
        },
        (err) => {
          if (!resolved) {
            resolved = true;
            reject(err);
          }
        }
      );
    });
  } catch (error) {
    throw new Error(`TTS 初始化失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// 备选方案：使用文件输出
async function synthesizeSpeechWithFile(text, voice, sdk) {
  const { promises: fs } = await import('fs');
  const tempFile = `/tmp/tts_${Date.now()}.wav`;
  
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.SPEECH_KEY,
    process.env.SPEECH_REGION
  );
  speechConfig.speechSynthesisVoiceName = voice;
  
  const audioConfig = sdk.AudioConfig.fromAudioFileOutput(tempFile);
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
  
  return new Promise((resolve, reject) => {
    let resolved = false;
    
    synthesizer.speakTextAsync(
      text,
      async (result) => {
        if (resolved) return;
        
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          try {
            resolved = true;
            await new Promise(r => setTimeout(r, 300));
            const buffer = await fs.readFile(tempFile);
            await fs.unlink(tempFile).catch(() => {}); // 删除临时文件
            resolve(buffer);
          } catch (err) {
            reject(err);
          }
        } else if (result.reason === sdk.ResultReason.Canceled) {
          resolved = true;
          const cancellation = sdk.SpeechSynthesisCancellationDetails.fromResult(result);
          reject(new Error(`语音合成被取消: ${cancellation.errorDetails}`));
        } else {
          resolved = true;
          reject(new Error('语音合成失败'));
        }
      },
      (err) => {
        if (!resolved) {
          resolved = true;
          reject(err);
        }
      }
    );
  });
}

// 浏览器环境实现
export async function synthesizeSpeechBrowser(text, voice, lang = 'zh-TW') {
  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
    window.SPEECH_KEY,
    window.SPEECH_REGION
  );
  
  speechConfig.speechSynthesisVoiceName = voice;
  
  const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
  const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);
  
  return new Promise((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      (result) => {
        if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
          resolve(result.audioData);
        } else if (result.reason === SpeechSDK.ResultReason.Canceled) {
          const cancellation = SpeechSDK.SpeechSynthesisCancellationDetails.fromResult(result);
          reject(new Error(`语音合成被取消: ${cancellation.reason}`));
        }
      },
      (err) => {
        reject(err);
      }
    );
  });
}

/**
 * 浏览器 Web Speech API 实现（作为备用方案）
 */
export function synthesizeSpeechBrowserAPI(text, lang = 'zh-TW') {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.0;
    
    utterance.onend = () => {
      resolve();
    };
    
    utterance.onerror = (event) => {
      reject(new Error(`语音合成错误: ${event.error}`));
    };
    
    window.speechSynthesis.speak(utterance);
  });
}
