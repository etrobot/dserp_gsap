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
    
    // 创建文件输出以获取音频 buffer
    const tempFile = `/tmp/tts_${Date.now()}.wav`;
    const { promises: fs } = await import('fs');
    
    // 使用文件输出
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(tempFile);
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
    
    return new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            // 读取文件并返回 buffer
            setTimeout(async () => {
              try {
                const buffer = await fs.readFile(tempFile);
                await fs.unlink(tempFile); // 删除临时文件
                resolve(buffer);
              } catch (err) {
                reject(err);
              }
            }, 100);
          } else if (result.reason === sdk.ResultReason.Canceled) {
            const cancellation = sdk.SpeechSynthesisCancellationDetails.fromResult(result);
            reject(new Error(`语音合成被取消: ${cancellation.reason}`));
          } else {
            reject(new Error('语音合成失败'));
          }
        },
        (err) => {
          reject(err);
        }
      );
    });
  } catch (error) {
    throw new Error(`TTS 初始化失败: ${error instanceof Error ? error.message : String(error)}`);
  }
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
