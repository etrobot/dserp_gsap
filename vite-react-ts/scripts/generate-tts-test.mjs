/**
 * TTS 生成测试脚本 - 只生成前 3 条用于测试
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { synthesizeSpeech } from '../src/utils/tts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载 .env 文件
async function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  try {
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
  } catch (err) {
    console.warn('⚠️  无法读取 .env 文件');
  }
}

async function generateTest() {
  await loadEnv();
  
  const speechKey = process.env.VITE_AZURE_SPEECH_KEY || process.env.SPEECH_KEY;
  const speechRegion = process.env.VITE_AZURE_SPEECH_REGION || process.env.SPEECH_REGION;
  
  if (!speechKey || !speechRegion) {
    console.error('❌ 缺少环境变量');
    process.exit(1);
  }
  
  process.env.SPEECH_KEY = speechKey;
  process.env.SPEECH_REGION = speechRegion;
  
  const outputDir = path.join(__dirname, '../public/tts');
  await fs.mkdir(outputDir, { recursive: true });
  
  const testTexts = [
    '标签数据学习分析报告',
    '专业内容标签位于第二象限，需要优化内容质量以提升互动率。',
    '四象限矩阵是Tim访谈中提到的分析方法',
  ];
  
  console.log('🎤 TTS 测试生成 (前3条)\n');
  
  for (let i = 0; i < testTexts.length; i++) {
    const text = testTexts[i];
    const filename = `tts_test_${String(i + 1).padStart(3, '0')}.wav`;
    
    try {
      console.log(`[${i + 1}/3] 生成: "${text.substring(0, 50)}..."`);
      const audioBuffer = await synthesizeSpeech(text, 'zh-TW-YunJheNeural');
      
      const filepath = path.join(outputDir, filename);
      await fs.writeFile(filepath, audioBuffer);
      
      // 验证文件
      const stats = await fs.stat(filepath);
      const header = audioBuffer.slice(0, 12);
      const isValid = header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46; // "RIFF"
      
      console.log(`   ✅ 保存: ${filename} (${stats.size} bytes)${isValid ? ' - 格式有效' : ' - ⚠️ 格式可能有问题'}\n`);
    } catch (err) {
      console.error(`❌ 生成失败: ${err.message}\n`);
    }
  }
  
  console.log('🎉 测试完成');
}

generateTest().catch(err => {
  console.error('❌ 测试失败:', err);
  process.exit(1);
});
