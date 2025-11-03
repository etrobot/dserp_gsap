/**
 * 更新脚本：从现有 WAV 文件读取时长，更新 JSON 中的 duration 字段
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取 WAV 文件的时长（秒）
function getWavDuration(buffer) {
  if (buffer.length < 44) return 0;
  
  try {
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.length);
    const byteRate = view.getUint32(28, true); // 字节 28-31 是字节速率
    
    const audioDataSize = buffer.length - 44; // 除去 WAV 头部
    const duration = audioDataSize / byteRate;
    
    return Math.round(duration * 100) / 100; // 保留两位小数
  } catch (err) {
    console.error('❌ 解析 WAV 文件失败:', err.message);
    return 0;
  }
}

async function updateDurations() {
  const scriptName = process.argv[2] || 'ysjfTagInsightScript';
  const scriptPath = path.join(__dirname, `../public/scripts/${scriptName}.json`);
  const ttsDir = path.join(__dirname, '../public/tts', scriptName);
  
  console.log('⏱️  更新音频时长\n');
  
  // 读取 JSON
  const scriptContent = await fs.readFile(scriptPath, 'utf-8');
  const scriptData = JSON.parse(scriptContent);
  
  // 构建 (sectionId, contentIndex) -> duration 的映射
  const durationMap = new Map();
  
  try {
    const ttsFiles = await fs.readdir(ttsDir);
    
    console.log(`📁 读取 TTS 文件 (${scriptName})...\n`);
    
    for (const file of ttsFiles.sort()) {
      if (!file.endsWith('.wav')) continue;
      
      try {
        const filePath = path.join(ttsDir, file);
        const buffer = await fs.readFile(filePath);
        const duration = getWavDuration(buffer);
        
        // 从文件名解析 section-id 和 index: section-id-01.wav
        const match = file.match(/^(.+?)-(\d+)\.wav$/);
        if (match) {
          const sectionId = match[1];
          const index = parseInt(match[2], 10) - 1; // 转换为 0-based
          const key = `${sectionId}:${index}`;
          durationMap.set(key, duration);
          console.log(`✅ ${file}: ${duration}s (section: ${sectionId}, index: ${index})`);
        }
      } catch (err) {
        console.error(`❌ ${file}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error('❌ 无法读取 TTS 目录:', err.message);
    process.exit(1);
  }
  
  console.log(`\n🔄 更新 JSON 中的 duration 字段...\n`);
  
  // 更新 JSON 中的 duration
  let updateCount = 0;
  for (const section of scriptData.sections) {
    if (!section.content) continue;
    
    for (let contentIndex = 0; contentIndex < section.content.length; contentIndex++) {
      const item = section.content[contentIndex];
      const key = `${section.id}:${contentIndex}`;
      
      if (durationMap.has(key)) {
        const newDuration = durationMap.get(key);
        if (item.duration !== newDuration) {
          item.duration = newDuration;
          updateCount++;
          console.log(`   更新: ${key} -> ${newDuration}s`);
        }
      }
    }
  }
  
  // 保存更新后的 JSON
  await fs.writeFile(scriptPath, JSON.stringify(scriptData, null, 2));
  
  console.log(`\n✅ 已更新 ${updateCount} 项的 duration`);
  console.log(`✅ 脚本配置已保存: ${scriptPath}`);
  console.log(`\n🎉 完成！`);
}

updateDurations().catch(err => {
  console.error('❌ 更新失败:', err.message);
  process.exit(1);
});
