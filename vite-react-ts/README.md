# Presentation Player & Recorder

一个基于 React + TypeScript + Vite 的演示文稿播放和录制系统，支持自动朗读和高质量视频录制。

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

浏览器访问: `http://localhost:5173`

## 📹 录制演示文稿

### 方法 1: 浏览器内录制（推荐，有音频）⭐⭐⭐⭐⭐

**最佳方案：支持音频、高质量、手动操作**

1. 启动开发服务器：`pnpm dev`
2. 打开浏览器访问：`http://localhost:5173/?script=ysjfTagInsightScript`
3. 点击 **"⬤ 朗读并录制"** 按钮
4. 在弹出窗口中：
   - ✅ 选择 **"Chrome 标签页"**
   - ✅ 勾选 **"分享音频"**
   - ✅ 点击 **"分享"**
5. 等待录制完成，视频会自动下载

**特点：**
- ✅ 包含音频（浏览器 TTS 或本地音频文件）
- ✅ 高质量（60fps，1280x720）
- ✅ 录制用户选择的内容（标签页）
- ✅ 全自动播放所有页面

### 方法 2: Playwright 自动化录制（无音频）

**适合批量录制，完全自动化，但不包含音频**

```bash
# 录制指定脚本
pnpm record ysjfTagInsightScript zh-CN

# 使用默认脚本
pnpm record
```

脚本会自动：
1. 启动无头浏览器
2. 自动播放所有页面
3. 录制整个页面内容
4. 保存到 `recordings/` 目录

**注意：** Playwright 的 `recordVideo` API 不支持音频捕获。如需音频，请使用方法 1。

### 详细文档

完整的录制指南请查看: [RECORDING_GUIDE.md](./RECORDING_GUIDE.md)

## 🎨 功能特性

- 📝 基于 JSON 的脚本配置
- 🎤 多语言 TTS 支持（中文、英文、日文等）
- 🎬 多种布局类型（封面、图表、双列、单列等）
- 📊 ECharts 图表集成
- 🎨 精美的动画效果
- 📹 高质量视频录制（支持音频）
- 🔄 自动化录制流程

## 📁 项目结构

```
├── public/
│   ├── scripts/          # JSON 脚本文件
│   ├── tts/              # TTS 音频文件
│   └── chart/            # 图表配置文件
├── src/
│   ├── components/       # React 组件
│   ├── hooks/            # 自定义 Hooks
│   └── types/            # TypeScript 类型定义
├── scripts/              # 工具脚本
│   ├── record.mjs        # Playwright 录制脚本
│   └── generate-tts.mjs  # TTS 生成脚本
└── recordings/           # 录制输出目录
```

## 🛠️ 可用命令

```bash
pnpm dev                    # 启动开发服务器
pnpm build                  # 构建生产版本
pnpm preview                # 预览生产版本
pnpm record [script] [lang] # 自动化录制（无音频）
pnpm record-audio [script]  # 实验性音频录制
pnpm tts                    # 生成 TTS 音频文件
pnpm validate-script        # 验证脚本格式
```

## 🐛 常见问题

### 录制没有声音？
- 确保勾选了 **"分享音频"** 复选框
- 使用浏览器内录制（方法 1）而不是 Playwright

### 录制很卡顿？
- 关闭其他占用 CPU 的程序
- 录制期间不要切换标签页
- 确保使用 Chrome 或 Edge 浏览器

### 只录制到第一页？
- 检查脚本的 `read_srt` 字段
- 查看浏览器控制台是否有错误
- 确保所有内容都有适当的 `duration`

更多问题请查看 [RECORDING_GUIDE.md](./RECORDING_GUIDE.md)

## 📚 技术栈

- React 19
- TypeScript 5
- Vite 7
- Playwright (录制)
- ECharts (图表)
- GSAP (动画)
- Tailwind CSS (样式)
- Web Speech API (TTS)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
