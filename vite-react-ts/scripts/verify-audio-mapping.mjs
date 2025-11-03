/**
 * 验证脚本：检查 JSON 中的 read_srt 和 audioFile 对应关系
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verify() {
  const scriptName = process.argv[2] || 'ysjfTagInsightScript';
  const scriptPath = path.join(__dirname, `../public/scripts/${scriptName}.json`);
  const ttsDir = path.join(__dirname, '../public/tts');
  
  console.log('🔍 验证 read_srt 和 audioFile 对应关系\n');
  
  // 读取 JSON
  const scriptContent = await fs.readFile(scriptPath, 'utf-8');
  const scriptData = JSON.parse(scriptContent);
  
  // 读取 TTS 目录
  let ttsFiles = [];
  try {
    ttsFiles = (await fs.readdir(ttsDir)).filter(f => f.endsWith('.wav')).sort();
  } catch (err) {
    console.log('⚠️  TTS 目录不存在或为空');
  }
  
  console.log(`📊 统计信息:`);
  console.log(`   JSON 脚本: ${scriptName}`);
  console.log(`   TTS 文件数: ${ttsFiles.length}`);
  
  // 统计 read_srt
  const readSrtMap = new Map(); // text -> [{ section, index }]
  const audioFileUsage = new Map(); // audioFile -> count
  
  for (const section of scriptData.sections) {
    if (!section.content) continue;
    
    for (let i = 0; i < section.content.length; i++) {
      const item = section.content[i];
      if (item.read_srt) {
        const text = item.read_srt.trim();
        const audioFile = item.audioFile;
        
        if (!readSrtMap.has(text)) {
          readSrtMap.set(text, []);
        }
        readSrtMap.get(text).push({
          section: section.id,
          index: i,
          audioFile,
          duration: item.duration,
        });
        
        if (audioFile) {
          audioFileUsage.set(audioFile, (audioFileUsage.get(audioFile) || 0) + 1);
        }
      }
    }
  }
  
  console.log(`\n📋 内容分析:`);
  console.log(`   不同的 read_srt: ${readSrtMap.size}`);
  console.log(`   不同的 audioFile: ${new Set(Array.from(readSrtMap.values()).flatMap(arr => arr.map(a => a.audioFile))).size}`);
  
  // 检查问题
  let issues = 0;
  
  console.log('\n🔎 检查潜在问题:\n');
  
  // 1. audioFile 为 null 或 undefined
  const noAudioFile = Array.from(readSrtMap.values()).flatMap(arr => arr).filter(a => !a.audioFile);
  if (noAudioFile.length > 0) {
    console.log(`❌ 有 ${noAudioFile.length} 个 read_srt 没有 audioFile`);
    issues++;
  }
  
  // 2. duration 为 null
  const noDuration = Array.from(readSrtMap.values()).flatMap(arr => arr).filter(a => a.duration === null || a.duration === undefined);
  if (noDuration.length > 0) {
    console.log(`⚠️  有 ${noDuration.length} 个 read_srt 的 duration 为 null`);
    issues++;
  }
  
  // 3. 检查 audioFile 是否存在
  const missingFiles = new Set();
  for (const [text, items] of readSrtMap.entries()) {
    for (const item of items) {
      if (item.audioFile && !ttsFiles.includes(item.audioFile)) {
        missingFiles.add(item.audioFile);
      }
    }
  }
  if (missingFiles.size > 0) {
    console.log(`❌ 有 ${missingFiles.size} 个 audioFile 在磁盘上不存在:`);
    missingFiles.forEach(f => console.log(`     ${f}`));
    issues++;
  }
  
  // 4. 检查是否有 TTS 文件没有被使用
  const usedFiles = new Set(audioFileUsage.keys());
  const unusedFiles = ttsFiles.filter(f => !usedFiles.has(f));
  if (unusedFiles.length > 0) {
    console.log(`⚠️  有 ${unusedFiles.length} 个 TTS 文件没有被使用:`);
    unusedFiles.slice(0, 5).forEach(f => console.log(`     ${f}`));
    if (unusedFiles.length > 5) {
      console.log(`     ... 还有 ${unusedFiles.length - 5} 个`);
    }
    issues++;
  }
  
  // 5. 检查重复使用的 audioFile
  const duplicates = Array.from(audioFileUsage.entries()).filter(([_, count]) => count > 1);
  if (duplicates.length > 0) {
    console.log(`\n📌 有 ${duplicates.length} 个 audioFile 被多个 read_srt 使用:`);
    duplicates.forEach(([file, count]) => {
      console.log(`   ${file}: 被使用 ${count} 次 ✅ (相同文本共用)`);
    });
  }
  
  if (issues === 0) {
    console.log('✅ 所有检查通过！mapping 完全正确');
  } else {
    console.log(`\n⚠️  发现 ${issues} 个问题，建议重新生成 TTS:`);
    console.log(`   npm run tts ${scriptName}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 详细统计:');
  console.log(`   总 read_srt 条数: ${Array.from(readSrtMap.values()).flatMap(arr => arr).length}`);
  console.log(`   不同 read_srt: ${readSrtMap.size}`);
  console.log(`   不同 audioFile: ${audioFileUsage.size}`);
  console.log(`   TTS 文件总数: ${ttsFiles.length}`);
}

verify().catch(err => {
  console.error('❌ 验证失败:', err.message);
  process.exit(1);
});
