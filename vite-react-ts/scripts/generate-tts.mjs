#!/usr/bin/env node
/**
 * TTS 批量生成脚本
 * 使用 Azure TTS 为 read_srt 生成语音文件
 * 
 * 环境变量（来自 .env）:
 *   VITE_AZURE_SPEECH_KEY: Azure Speech Service key
 *   VITE_AZURE_SPEECH_REGION: Azure Speech Service region
 * 
 * 运行:
 *   npm run tts [scriptName]
 * 
 * 示例:
 *   npm run tts ysjfTagInsightScript
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { synthesizeSpeech } from '../src/utils/tts.js';

// 手动加载 .env 文件
async function loadEnv() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
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
    console.warn('⚠️  无法读取 .env 文件，将使用现有环境变量');
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONFIG = {
  outputDir: path.join(__dirname, '../public/tts'),
  voice: 'zh-TW-YunJheNeural', // 繁體中文聲音
};

// 解析命令行参数
const scriptName = process.argv[2] || 'ysjfTagInsightScript';

// 从 JSON 文件读取脚本配置
async function loadScriptConfig(scriptName) {
  try {
    const scriptPath = path.join(__dirname, `../public/scripts/${scriptName}.json`);
    const content = await fs.readFile(scriptPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ 无法读取脚本文件: ${scriptName}.json`);
    throw error;
  }
}

// 获取文件时长（秒）
function getAudioDuration(buffer) {
  // WAV 文件格式: 第 24-27 字节是采样率，第 28-29 字节是字节速率
  // 简化估算: PCM audio 时长 = 文件大小 / (采样率 * 字节每秒)
  // 对于 16-bit stereo: 时长 = (文件大小 - 44) / (采样率 * 4)
  // 假设 16000 Hz 采样率，则: 时长 = (文件大小 - 44) / 64000
  
  // 更准确的方式：读取 WAV 文件头
  if (buffer.length < 44) return 0;
  
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.length);
  const sampleRate = view.getUint32(24, true); // 字节 24-27
  const byteRate = view.getUint32(28, true);   // 字节 28-31
  const blockAlign = view.getUint16(32, true); // 字节 32-33
  const bitsPerSample = view.getUint16(34, true); // 字节 34-35
  
  const audioDataSize = buffer.length - 44;
  const duration = audioDataSize / byteRate;
  
  return Math.round(duration * 100) / 100; // 保留两位小数
}

// 提取所有需要合成的文本
function extractReadSrtItems(sections) {
  const items = [];
  const seen = new Set();
  
  for (const section of sections) {
    if (!section.content) continue;
    
    for (const item of section.content) {
      const text = item.read_srt?.trim();
      if (text && !seen.has(text)) {
        seen.add(text);
        items.push({
          text,
          sectionId: section.id,
          itemIndex: items.length,
        });
      }
    }
  }
  
  return items;
}

// 合成语音并保存文件
async function synthesizeAndSave(text, index, total) {
  console.log(`[${index}/${total}] 合成: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
  
  try {
    const audioBuffer = await synthesizeSpeech(text, CONFIG.voice);
    const duration = getAudioDuration(audioBuffer);
    
    const filename = `tts_${String(index).padStart(4, '0')}.wav`;
    const filepath = path.join(CONFIG.outputDir, filename);
    
    await fs.writeFile(filepath, audioBuffer);
    
    console.log(`✅ 保存: ${filename} (${duration.toFixed(2)}s)`);
    
    return { filename, duration, text };
  } catch (error) {
    console.error(`❌ 合成失败: ${error.message}`);
    throw error;
  }
}

// 更新 JSON 中的 duration 和添加音频文件引用
async function updateScriptConfig(scriptConfig, audioMap) {
  let updateCount = 0;
  
  for (const section of scriptConfig.sections) {
    if (!section.content) continue;
    
    for (const item of section.content) {
      const text = item.read_srt?.trim();
      if (text && audioMap.has(text)) {
        const audioInfo = audioMap.get(text);
        item.duration = audioInfo.duration;
        item.audioFile = audioInfo.filename;
        updateCount++;
      }
    }
  }
  
  console.log(`\n✅ 更新了 ${updateCount} 项的 duration 和音频文件引用`);
  return scriptConfig;
}

async function generate() {
  // 加载 .env 文件
  await loadEnv();
  
  console.log('🎤 TTS 批量生成脚本');
  console.log(`📝 脚本: ${scriptName}`);
  console.log(`🎵 声音: ${CONFIG.voice}`);
  
  // 检查环境变量（支持 VITE_ 前缀和不带前缀两种）
  const speechKey = process.env.VITE_AZURE_SPEECH_KEY || process.env.SPEECH_KEY;
  const speechRegion = process.env.VITE_AZURE_SPEECH_REGION || process.env.SPEECH_REGION;
  
  if (!speechKey || !speechRegion) {
    console.error('❌ 错误: 缺少环境变量');
    console.error('   请在 .env 中配置:');
    console.error('   VITE_AZURE_SPEECH_KEY=xxx');
    console.error('   VITE_AZURE_SPEECH_REGION=xxx');
    process.exit(1);
  }
  
  // 设置到 process.env 供后续使用
  process.env.SPEECH_KEY = speechKey;
  process.env.SPEECH_REGION = speechRegion;
  
  // 确保输出目录存在
  await fs.mkdir(CONFIG.outputDir, { recursive: true });
  
  // 清理旧的 TTS 文件
  console.log('🧹 清理旧文件...');
  try {
    const files = await fs.readdir(CONFIG.outputDir);
    for (const file of files) {
      if (file.endsWith('.wav')) {
        await fs.unlink(path.join(CONFIG.outputDir, file));
      }
    }
    console.log(`✅ 已删除 ${files.filter(f => f.endsWith('.wav')).length} 个旧 WAV 文件\n`);
  } catch (err) {
    console.warn('⚠️  清理文件时出错:', err.message);
  }
  
  // 加载脚本配置
  const scriptConfig = await loadScriptConfig(scriptName);
  
  // 提取所有需要合成的文本
  const readSrtItems = extractReadSrtItems(scriptConfig.sections);
  console.log(`\n📄 找到 ${readSrtItems.length} 条需要合成的文本\n`);
  
  if (readSrtItems.length === 0) {
    console.log('❌ 没有找到需要合成的文本');
    process.exit(1);
  }
  
  // 合成所有文本
  const audioMap = new Map();
  for (let i = 0; i < readSrtItems.length; i++) {
    const item = readSrtItems[i];
    const audioInfo = await synthesizeAndSave(item.text, i + 1, readSrtItems.length);
    audioMap.set(item.text, audioInfo);
  }
  
  console.log(`\n🔄 更新脚本配置文件...`);
  
  // 更新脚本配置
  const updatedConfig = await updateScriptConfig(scriptConfig, audioMap);
  
  // 保存更新后的配置
  const scriptPath = path.join(__dirname, `../public/scripts/${scriptName}.json`);
  await fs.writeFile(scriptPath, JSON.stringify(updatedConfig, null, 2));
  
  console.log(`✅ 脚本配置已保存: ${scriptPath}`);
  console.log(`\n🎉 完成！生成了 ${readSrtItems.length} 个音频文件`);
}

// 错误处理
process.on('unhandledRejection', (error) => {
  console.error('❌ 未处理的错误:', error);
  process.exit(1);
});

// 运行
generate().catch((error) => {
  console.error('❌ 脚本失败:', error);
  process.exit(1);
});
