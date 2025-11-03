import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
    console.log('✅ 环境变量已加载');
  } catch (err) {
    console.error('❌ 无法读取 .env 文件:', err.message);
  }
}

async function test() {
  await loadEnv();
  
  // 检查环境变量
  const speechKey = process.env.VITE_AZURE_SPEECH_KEY || process.env.SPEECH_KEY;
  const speechRegion = process.env.VITE_AZURE_SPEECH_REGION || process.env.SPEECH_REGION;
  
  console.log('🔍 环境变量检查:');
  console.log(`   VITE_AZURE_SPEECH_KEY: ${speechKey ? '✅ 已设置' : '❌ 未设置'}`);
  console.log(`   VITE_AZURE_SPEECH_REGION: ${speechRegion ? '✅ 已设置 (' + speechRegion + ')' : '❌ 未设置'}`);
  
  // 检查脚本文件
  const scriptPath = path.join(__dirname, '../public/scripts/ysjfTagInsightScript.json');
  try {
    const scriptContent = await fs.readFile(scriptPath, 'utf-8');
    const scriptData = JSON.parse(scriptContent);
    console.log(`\n✅ 脚本文件已读取`);
    console.log(`   标题: ${scriptData.title}`);
    console.log(`   语言: ${scriptData.language}`);
    console.log(`   章节数: ${scriptData.sections.length}`);
    
    // 统计 read_srt
    let readSrtCount = 0;
    scriptData.sections.forEach(section => {
      if (section.content) {
        section.content.forEach(item => {
          if (item.read_srt) readSrtCount++;
        });
      }
    });
    console.log(`   read_srt 条数: ${readSrtCount}`);
  } catch (err) {
    console.error('❌ 无法读取脚本文件:', err.message);
  }
  
  // 检查输出目录
  const outputDir = path.join(__dirname, '../public/tts');
  try {
    const files = await fs.readdir(outputDir);
    console.log(`\n📁 TTS 目录检查:`);
    console.log(`   路径: ${outputDir}`);
    console.log(`   文件数: ${files.length}`);
    if (files.length > 0) {
      console.log(`   文件列表: ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}`);
    }
  } catch (err) {
    console.log(`\n📁 TTS 目录不存在，需要创建`);
  }
}

test().catch(err => {
  console.error('❌ 测试失败:', err);
  process.exit(1);
});
