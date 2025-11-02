#!/usr/bin/env node
/**
 * 无头浏览器录制脚本
 * 使用 Playwright 自动录制演示文稿（比 Puppeteer 更快更稳定）
 * 
 * 安装依赖:
 *   npm install --save-dev playwright
 * 
 * 运行:
 *   node scripts/record.mjs [scriptName] [language]
 * 
 * 示例:
 *   node scripts/record.mjs ysjfTagInsightScript zh-CN
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
  fps: 30,
  videoBitrate: 10000000, // 10 Mbps
  outputDir: path.join(__dirname, '../recordings'),
};

// 解析命令行参数
const scriptName = process.argv[2] || 'ysjfTagInsightScript';
let language = process.argv[3]; // 可以为空，从 JSON 读取

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
  console.log('🎬 启动录制...');
  console.log(`📝 脚本: ${scriptName}`);
  
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
  
  // 生成输出文件路径
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const outputPath = path.join(CONFIG.outputDir, `${scriptName}_${timestamp}.webm`);
  
  // 启动浏览器（Playwright 内置录制功能）
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--autoplay-policy=no-user-gesture-required',
    ],
  });

  const context = await browser.newContext({
    viewport: {
      width: CONFIG.width,
      height: CONFIG.height,
    },
    deviceScaleFactor: 2, // Retina 显示
    recordVideo: {
      dir: CONFIG.outputDir,
      size: { width: CONFIG.width, height: CONFIG.height },
    },
  });

  const page = await context.newPage();

  try {
    // 访问页面
    const url = `http://localhost:5173/?script=${scriptName}`;
    console.log(`🌐 打开页面: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle' });

    // 等待一秒让页面完全渲染
    await page.waitForTimeout(2000);

    // 设置语言
    console.log(`🗣️  设置语言为: ${language}`);
    const languageSelector = page.locator('select').first();
    await languageSelector.selectOption(language).catch(() => {
      console.log('⚠️  未找到语言选择器，使用默认语言');
    });

    console.log('📹 开始录制...');

    // 点击"朗读"按钮开始播放
    console.log('▶️  点击播放按钮...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const playButton = buttons.find(btn => 
        btn.textContent.includes('朗读') && 
        !btn.textContent.includes('录制')
      );
      if (playButton) {
        playButton.click();
        return true;
      }
      throw new Error('未找到播放按钮');
    });

    console.log('⏳ 等待播放完成...');

    // 监听播放状态
    await page.waitForFunction(
      () => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const playButton = buttons.find(btn => 
          btn.textContent.includes('朗读') && 
          !btn.textContent.includes('录制')
        );
        return playButton && playButton.textContent === '▶ 朗读';
      },
      { timeout: 600000, polling: 500 }
    );

    console.log('✅ 播放完成');

    // 额外等待 2 秒确保所有内容都录制完成
    await page.waitForTimeout(2000);

  } catch (error) {
    console.error('❌ 录制失败:', error);
    throw error;
  } finally {
    // 关闭页面和上下文会自动保存视频
    console.log('⏹️  停止录制...');
    await page.close();
    await context.close();
    await browser.close();

    // Playwright 会生成随机文件名，需要重命名
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
