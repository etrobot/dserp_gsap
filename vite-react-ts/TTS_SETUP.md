# TTS 批量生成使用指南

## 功能说明

本脚本可以：
1. **批量生成语音文件** - 为 JSON 脚本中的所有 `read_srt` 内容生成 TTS 音频
2. **自动检测时长** - 根据生成的音频长度自动更新 JSON 中的 `duration` 字段
3. **支持本地播放** - Player 组件优先播放本地音频文件
4. **智能备用方案** - 如果本地音频不存在或失败，自动降级到浏览器 TTS

## 前置要求

### 1. Azure 认证信息
需要在 `.env` 文件中配置（已从 `.env.example` 创建）：
```
VITE_AZURE_SPEECH_KEY=your_azure_speech_key
VITE_AZURE_SPEECH_REGION=eastasia
```

生成脚本会自动读取 `.env` 文件中的这些变量。

### 2. 检查依赖
```bash
npm list microsoft-cognitiveservices-speech-sdk
```

如果未安装，请先安装：
```bash
npm install microsoft-cognitiveservices-speech-sdk
```

## 使用方法

### 1. 生成 TTS 音频文件

```bash
# 为默认脚本生成 TTS（ysjfTagInsightScript）
npm run tts

# 为指定脚本生成 TTS
npm run tts ysjfTagInsightScript
```

### 2. 执行过程

脚本会：
1. 读取 JSON 脚本文件中的所有 `read_srt` 内容
2. 使用 Azure TTS (zh-TW-YunJheNeural 声音) 合成语音
3. 将音频文件保存到 `public/tts/` 目录，命名为 `tts_0001.wav`、`tts_0002.wav` 等
4. 检测每个音频文件的时长
5. 更新原始 JSON 文件：
   - 添加 `audioFile` 字段（文件名）
   - 更新 `duration` 字段（单位：秒）

### 3. 输出示例

```
🎤 TTS 批量生成脚本
📝 脚本: ysjfTagInsightScript
🎵 声音: zh-TW-YunJheNeural

📄 找到 25 条需要合成的文本

[1/25] 合成: "标签数据学习分析报告"
✅ 保存: tts_0001.wav (3.20s)
...
[25/25] 合成: "影视剧情标签已有一定基础，为未来的内容拓展提供了良好的起点。"
✅ 保存: tts_0025.wav (5.10s)

🔄 更新脚本配置文件...
✅ 更新了 25 项的 duration 和音频文件引用
✅ 脚本配置已保存: /path/to/public/scripts/ysjfTagInsightScript.json

🎉 完成！生成了 25 个音频文件
```

## 文件组织结构

```
public/tts/
├── ysjfTagInsightScript/          # 脚本名称文件夹
│   ├── cover-01.wav               # section-id-索引.wav
│   ├── cover-02.wav
│   ├── report_note-01.wav
│   ├── report_note-02.wav
│   ├── report_note-03.wav
│   ├── quadrant_analysis-01.wav
│   ├── ...
│   └── strategy_recommendations-05.wav
└── otherScript/                   # 其他脚本（可扩展）
    └── *.wav
```

## JSON 格式变化

### 生成前
```json
{
  "id": "cover",
  "content": [
    {
      "read_srt": "标签数据学习分析报告",
      "duration": 1
    }
  ]
}
```

### 生成后（无需添加 audioFile 字段）
```json
{
  "id": "cover",
  "content": [
    {
      "read_srt": "标签数据学习分析报告",
      "duration": 2.9
    }
  ]
}
```

**注意**：`audioFile` 字段不需要手动添加，Player 会根据 `section.id` 和内容索引自动计算：
- 文件路径: `/tts/脚本名/section-id-索引.wav`
- 例如: `/tts/ysjfTagInsightScript/cover-01.wav`

## Player 播放流程

1. **优先播放本地音频**
   - 检查是否有 `audioFile` 字段
   - 尝试从 `public/tts/` 目录加载音频

2. **音频加载失败时降级**
   - 如果本地音频加载失败，自动切换到浏览器 TTS
   - 使用 Web Speech API 的 `SpeechSynthesisUtterance`

3. **完整备用链**
   - 本地音频文件 → 浏览器 Web Speech API → 错误处理

## 故障排除

### 问题 1: 环境变量未设置
```
❌ 错误: 缺少环境变量
   请在 .env 中配置:
   VITE_AZURE_SPEECH_KEY=xxx
   VITE_AZURE_SPEECH_REGION=xxx
```

**解决方案：**
编辑 `.env` 文件：
```
VITE_AZURE_SPEECH_KEY=your_key
VITE_AZURE_SPEECH_REGION=eastasia
```

然后运行：
```bash
npm run tts ysjfTagInsightScript
```

### 问题 2: 音频文件没有生成
检查：
1. Azure Speech Service 配额是否用尽
2. 网络连接是否正常
3. 环境变量是否正确设置

### 问题 3: 播放时没有声音
1. 检查浏览器音量设置
2. 检查 `public/tts/` 目录是否存在音频文件
3. 打开浏览器开发者工具查看网络请求

## 脚本文件位置

- **TTS 生成脚本**: `scripts/generate-tts.mjs`
- **TTS 工具函数**: `src/utils/tts.js`
- **音频播放 Hook**: `src/hooks/useAudio.ts`
- **TTS 加备用 Hook**: `src/hooks/useSpeechWithFallback.ts`
- **生成的音频文件**: `public/tts/`

## 高级用法

### 手动更新 duration

如果只想更新 duration 而不重新生成音频：
1. 修改 `generate-tts.mjs` 中的 `CONFIG.outputDir`
2. 将现有 WAV 文件放入该目录
3. 运行脚本

### 切换 TTS 声音

修改 `generate-tts.mjs` 中的配置：
```javascript
const CONFIG = {
  outputDir: path.join(__dirname, '../public/tts'),
  voice: 'zh-TW-HsiaoChenNeural', // 改为其他声音
};
```

可用的繁体中文声音：
- `zh-TW-YunJheNeural` (女性，默认)
- `zh-TW-HsiaoChenNeural` (女性)
- `zh-TW-HsiaoYuNeural` (女性)

## 相关资源

- [Azure Text-to-Speech 文档](https://docs.microsoft.com/azure/cognitive-services/speech-service/text-to-speech)
- [支持的语言列表](https://docs.microsoft.com/azure/cognitive-services/speech-service/language-support?tabs=tts)
- [Speech SDK for JavaScript](https://github.com/microsoft/cognitive-services-speech-sdk-js)
