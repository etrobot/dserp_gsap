# 📹 演示文稿录制指南

本项目提供两种录制方式：

## 方式 1: 浏览器手动录制（适合快速测试）

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 在浏览器中打开应用

3. 点击"⬤ 朗读并录制"按钮

4. **Mac 用户注意**：
   - 在共享对话框中选择"Chrome 窗口"（不是整个屏幕）
   - 录制期间保持浏览器窗口在最前面
   - 不要切换到其他应用

5. 等待播放完成，视频会自动下载

### 缺点
- 录制期间不能做其他事情
- 需要手动操作
- 容易录制到其他内容

---

## 方式 2: 无头浏览器自动录制（推荐）⭐

### 安装依赖

```bash
npm install --save-dev playwright
npx playwright install chromium
```

### 使用方法

```bash
# 1. 启动开发服务器（在一个终端）
npm run dev

# 2. 运行录制脚本（在另一个终端）
npm run record

# 指定脚本和语言
npm run record ysjfTagInsightScript zh-CN
npm run record memeCoinScript en-US
```

### 录制流程

1. 脚本会自动启动无头浏览器
2. 访问指定的演示文稿页面
3. 自动点击播放按钮
4. 等待播放完成
5. 保存视频到 `recordings/` 目录

### 优点
- ✅ 完全自动化，无需人工干预
- ✅ 录制期间可以做其他事情
- ✅ 可以批量录制多个脚本
- ✅ 录制质量稳定
- ✅ 支持自定义分辨率和帧率

### 配置

编辑 `scripts/record.mjs` 中的 `CONFIG` 对象：

```javascript
const CONFIG = {
  width: 1280,      // 视频宽度
  height: 720,      // 视频高度
  fps: 30,          // 帧率
  videoBitrate: 10000000, // 比特率（10 Mbps）
  outputDir: './recordings', // 输出目录
};
```

### 批量录制

创建批量录制脚本：

```bash
#!/bin/bash
# batch-record.sh

scripts=(
  "ysjfTagInsightScript"
  "memeCoinScript"
  "xlinDataInsghtScript"
)

languages=("zh-CN" "en-US")

for script in "${scripts[@]}"; do
  for lang in "${languages[@]}"; do
    echo "录制: $script ($lang)"
    npm run record "$script" "$lang"
  done
done
```

---

## 故障排除

### 问题：录制视频为空或黑屏
**解决**：确保 TTS 音频已正确加载，检查浏览器控制台是否有错误

### 问题：Puppeteer 安装失败
**解决**：使用国内镜像
```bash
PUPPETEER_DOWNLOAD_HOST=https://npmmirror.com/mirrors npm install puppeteer
```

### 问题：录制中途崩溃
**解决**：增加超时时间，编辑 `record.mjs` 中的 `timeout` 参数

### 问题：音频未录制
**解决**：Puppeteer 默认不录制音频，需要额外配置或使用 FFmpeg 后期合成

---

## 高级选项

### 录制 4K 视频

```javascript
const CONFIG = {
  width: 3840,
  height: 2160,
  fps: 60,
  videoBitrate: 50000000, // 50 Mbps
};
```

### 添加音频

Puppeteer 原生不支持音频录制，建议：
1. 单独录制音频（使用 TTS API）
2. 用 FFmpeg 合成视频和音频

```bash
ffmpeg -i video.mp4 -i audio.mp3 -c:v copy -c:a aac output.mp4
```

---

## 对比表

| 特性 | 浏览器手动录制 | 无头浏览器自动录制 |
|------|--------------|------------------|
| 操作难度 | 简单 | 需要安装依赖 |
| 自动化 | ❌ 手动 | ✅ 全自动 |
| 后台运行 | ❌ 需要保持窗口可见 | ✅ 可以后台运行 |
| 批量录制 | ❌ 不支持 | ✅ 支持 |
| 稳定性 | 一般 | 高 |
| 适用场景 | 快速测试 | 批量生产 |

推荐使用**无头浏览器自动录制**进行批量生产！
