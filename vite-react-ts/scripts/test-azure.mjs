import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载 .env 文件
async function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  const envContent = await fs.readFile(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, value] = trimmed.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  });
}

async function testAzure() {
  await loadEnv();
  
  const speechKey = process.env.VITE_AZURE_SPEECH_KEY;
  const speechRegion = process.env.VITE_AZURE_SPEECH_REGION;
  
  console.log('🔍 测试 Azure 连接...');
  console.log(`   Key: ${speechKey.substring(0, 8)}...`);
  console.log(`   Region: ${speechRegion}`);
  
  try {
    const sdk = await import('microsoft-cognitiveservices-speech-sdk');
    const speechConfig = sdk.default.SpeechConfig.fromSubscription(
      speechKey,
      speechRegion
    );
    
    speechConfig.speechSynthesisVoiceName = 'zh-TW-YunJheNeural';
    
    console.log('✅ Azure Speech Config 已初始化');
    console.log('✅ 声音已设置为: zh-TW-YunJheNeural');
    
    // 创建临时文件用于测试
    const tempFile = `/tmp/test-tts-${Date.now()}.wav`;
    const audioConfig = sdk.default.AudioConfig.fromAudioFileOutput(tempFile);
    const synthesizer = new sdk.default.SpeechSynthesizer(speechConfig, audioConfig);
    
    console.log('🎤 开始合成语音测试...');
    
    return new Promise((resolve, reject) => {
      const testText = '这是一条测试文本';
      
      synthesizer.speakTextAsync(
        testText,
        (result) => {
          if (result.reason === sdk.default.ResultReason.SynthesizingAudioCompleted) {
            console.log('✅ 语音合成成功！');
            
            setTimeout(async () => {
              try {
                const stats = await fs.stat(tempFile);
                console.log(`✅ 音频文件生成成功`);
                console.log(`   文件大小: ${stats.size} bytes`);
                
                // 清理
                await fs.unlink(tempFile);
                resolve();
              } catch (err) {
                console.error('❌ 文件检查失败:', err.message);
                reject(err);
              }
            }, 100);
          } else if (result.reason === sdk.default.ResultReason.Canceled) {
            const cancellation = sdk.default.SpeechSynthesisCancellationDetails.fromResult(result);
            console.error('❌ 语音合成被取消:', cancellation.errorDetails);
            reject(new Error(cancellation.errorDetails));
          }
        },
        (err) => {
          console.error('❌ 错误:', err);
          reject(err);
        }
      );
    });
  } catch (err) {
    console.error('❌ 测试失败:', err.message);
    process.exit(1);
  }
}

testAzure().then(() => {
  console.log('\n✅ 所有测试通过！可以开始生成 TTS');
  console.log('   运行: npm run tts ysjfTagInsightScript');
}).catch(err => {
  console.error('\n❌ 测试失败');
  process.exit(1);
});
