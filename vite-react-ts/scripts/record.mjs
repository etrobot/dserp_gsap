#!/usr/bin/env node
/**
 * Playwright 无头录制脚本
 * 使用 Playwright 无头模式 + recordVideo API 录制整个页面
 * 注意：Playwright 的 recordVideo 不支持音频捕获
 * 
 * 安装依赖:
 *   npm install --save-dev playwright
 * 
 * 运行:
 *   node scripts/record.mjs [scriptName] [language]
 * 
 * 示例:
 *   node scripts/record.mjs ysjfTagInsightScript zh-CN
 * 
 * 如需音频，请使用浏览器内手动录制（pnpm dev 然后点击"朗读并录制"）
 */

import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONFIG = {
  width: 1280,
  height: 720,
  fps: 60,
  outputDir: path.join(__dirname, '../recordings'),
  devServerPort: 5566, // 独立端口，避免冲突
};

// 解析命令行参数
const scriptName = process.argv[2] || 'ysjfTagInsightScript';
let language = process.argv[3];

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

async function record() {
  console.log('🎬 启动无头录制（无音频）...');
  console.log(`📝 脚本: ${scriptName}`);
  console.log('⚠️  注意：Playwright recordVideo 不支持音频');
  console.log('💡 如需音频，请使用浏览器内录制（pnpm dev）');
  
  // 加载脚本配置
  const scriptConfig = await loadScriptConfig(scriptName);
  
  // 如果没有指定语言，使用 JSON 中的默认语言
  if (!language) {
    language = scriptConfig.language || 'zh-CN';
    console.log(`🌐 使用脚本默认语言: ${language}`);
  } else {
    console.log(`🌐 使用指定语言: ${language}`);
  }
  
  // 确保输出目录存在
  await fs.mkdir(CONFIG.outputDir, { recursive: true });
  
  // 检查开发服务器是否运行
  console.log(`🔍 检查开发服务器 (端口 ${CONFIG.devServerPort})...`);
  let serverStarted = false;
  let devServerProcess = null;

  try {
    const response = await fetch(`http://localhost:${CONFIG.devServerPort}/`);
    console.log('✅ 开发服务器已在运行');
  } catch (err) {
    console.log(`⚠️  开发服务器未运行，正在启动...`);
    const { spawn } = await import('child_process');
    devServerProcess = spawn('pnpm', ['dev', '--port', CONFIG.devServerPort.toString()], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
      shell: true
    });

    serverStarted = true;

    // 等待服务器启动
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('服务器启动超时'));
      }, 30000);

      devServerProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Local:') && output.includes(CONFIG.devServerPort.toString())) {
          clearTimeout(timeout);
          console.log('✅ 开发服务器已启动');
          setTimeout(resolve, 2000);
        }
      });

      devServerProcess.stderr.on('data', (data) => {
        console.error('服务器错误:', data.toString());
      });
    });
  }
  
  // 启动浏览器（无头模式）
  console.log('🌐 启动浏览器（无头模式，Canvas 录制）...');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--autoplay-policy=no-user-gesture-required',
      '--disable-dev-shm-usage',
    ],
  });

  const context = await browser.newContext({
    viewport: {
      width: CONFIG.width,
      height: CONFIG.height,
    },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: CONFIG.outputDir,
      size: { width: CONFIG.width, height: CONFIG.height },
    },
  });

  const page = await context.newPage();

  // 捕获控制台日志
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[Player]')) {
      console.log(`  📱 ${text}`);
    }
  });

  try {
    // 访问页面
    const url = `http://localhost:${CONFIG.devServerPort}/?script=${scriptName}&autoplay=true&recording=true`;
    console.log(`🌐 打开页面: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    console.log('⏳ 等待应用加载...');
    await page.waitForSelector('div[class*="rounded-lg"][class*="shadow-2xl"]', { timeout: 15000 });

    console.log('✅ 检测到 Player 容器');
    
    console.log('📹 自动播放已启用（通过 URL 参数 autoplay=true）');
    console.log('⏱️  等待自动播放开始（3秒）...');
    await page.waitForTimeout(3000);

    console.log('⏳ 基于脚本 duration 字段等待播放完成...');
    console.log('💡 提示：自动播放模式下，页面会根据 duration 字段自动切换');

    // 计算基于脚本 duration 字段的精确总播放时长
    let totalDuration = 0;

    scriptConfig.sections.forEach(section => {
      if (section.duration && section.duration > 0) {
        totalDuration += section.duration;
        console.log(`  📄 Section ${section.id}: duration=${section.duration}s`);
      } else {
        // 如果没有 duration，基于 content 数组的 showtime 计算
        const sectionShowtime = section.content?.reduce((sum, item) => {
          return sum + (item.showtime || 0);
        }, 0) || 0;

        if (sectionShowtime > 0) {
          totalDuration += sectionShowtime;
          console.log(`  📄 Section ${section.id}: showtime=${sectionShowtime}s (from content)`);
        } else {
          // 默认值：如果都没有，使用基于文本长度的估算
          const textLength = section.content?.map(item => item.read_srt || '').join(' ').length || 0;
          const estimated = Math.max(3, textLength * 0.1);
          totalDuration += estimated;
          console.log(`  📄 Section ${section.id}: estimated=${estimated.toFixed(1)}s (from text length)`);
        }
      }
    });

    // 添加缓冲时间
    const bufferTime = 5; // 5秒缓冲，确保完整录制
    totalDuration += bufferTime;

    const timeoutMs = Math.min(totalDuration * 1000, 600000); // 最多10分钟

    console.log(`📊 计算结果:`);
    console.log(`  - 总播放时长: ${totalDuration}s`);
    console.log(`  - 缓冲时间: ${bufferTime}s`);
    console.log(`  - 超时设置: ${timeoutMs / 1000}s`);
    console.log(`  - Section 数量: ${scriptConfig.sections.length}`);

    // 等待自动播放完成
    try {
      // 等待页面设置播放完成标志
      await page.waitForFunction(
        (sectionsCount) => {
          return window.__playbackCompleted === true || window.__currentPage === sectionsCount;
        },
        {
          timeout: timeoutMs,
          polling: 1000
        },
        scriptConfig.sections.length
      );
      console.log('✅ 播放完成（检测到播放完成标志）');
    } catch (timeoutError) {
      console.log('⚠️  等待播放完成超时，使用计算的总时长');
      // 超时后，等待计算的总时长
      await page.waitForTimeout(totalDuration * 1000);
    }

    console.log('⏱️  等待 2 秒以确保录制完整...');
    await page.waitForTimeout(2000);

  } catch (error) {
    console.error('❌ 录制失败:', error);
    throw error;
  } finally {
    console.log('⏹️  停止录制...');
    await page.close();
    await context.close();
    await browser.close();

    // Playwright 会生成视频文件，需要重命名
    console.log('📦 处理录制文件...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const outputPath = path.join(CONFIG.outputDir, `${scriptName}_${timestamp}.webm`);
    
    const files = await fs.readdir(CONFIG.outputDir);
    const videoFile = files.find(f => f.endsWith('.webm') && f !== path.basename(outputPath));
    
    if (videoFile) {
      const oldPath = path.join(CONFIG.outputDir, videoFile);
      await fs.rename(oldPath, outputPath);
      console.log(`🎉 录制完成！文件保存在: ${outputPath}`);
      
      const stats = await fs.stat(outputPath);
      const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`📦 文件大小: ${fileSizeMB} MB`);
    } else {
      console.error('❌ 未找到录制的视频文件');
      console.log('📁 输出目录中的文件:', files);
    }
    
    // 如果是脚本启动的服务器，关闭它
    if (serverStarted && devServerProcess) {
      console.log('🛑 关闭开发服务器...');
      devServerProcess.kill();
    }
  }
}

// 错误处理
process.on('unhandledRejection', (error) => {
  console.error('❌ 未处理的错误:', error);
  process.exit(1);
});

// 运行
record().catch((error) => {
  console.error('❌ 录制失败:', error);
  process.exit(1);
});
