# 🌐 语言配置说明

## 概述

演示文稿系统现在支持从 JSON 脚本中自动读取默认语言配置。

## JSON 配置格式

在每个脚本 JSON 文件中添加以下字段：

```json
{
  "title": "演示文稿标题",
  "language": "zh-CN",              // 默认语言（必填）
  "languages": ["zh-CN", "en-US"],  // 支持的语言列表（可选，用于批量录制）
  "sections": [
    // ... 内容
  ]
}
```

## 工作流程

### 1. 浏览器播放

当用户在浏览器中选择脚本时：

1. ✅ 自动读取脚本 JSON 中的 `language` 字段
2. ✅ 语言选择器自动设置为该语言
3. ✅ 用户仍可以手动切换语言
4. ✅ 切换脚本时，语言会自动更新为新脚本的默认语言

### 2. 录制脚本

**单个录制：**
```bash
# 使用脚本中的默认语言
npm run record ysjfTagInsightScript

# 指定语言（覆盖 JSON 配置）
npm run record ysjfTagInsightScript en-US
```

**批量录制：**
```bash
# 自动读取 languages 字段，为每种语言录制一次
./batch-record.sh
```

## 示例场景

### 场景 1: 中文单语脚本

```json
{
  "title": "产品演示",
  "language": "zh-CN",
  "sections": [...]
}
```

**效果：**
- 浏览器打开自动显示中文
- 批量录制只生成 1 个视频（zh-CN）

### 场景 2: 中英双语脚本

```json
{
  "title": "产品演示",
  "language": "zh-CN",
  "languages": ["zh-CN", "en-US"],
  "sections": [...]
}
```

**效果：**
- 浏览器打开默认显示中文
- 批量录制生成 2 个视频（zh-CN, en-US）

### 场景 3: 多语言国际化脚本

```json
{
  "title": "产品演示",
  "language": "en-US",
  "languages": ["zh-CN", "en-US", "ja-JP", "ko-KR", "es-ES"],
  "sections": [...]
}
```

**效果：**
- 浏览器打开默认显示英文
- 批量录制生成 5 个视频（覆盖主要市场）

## 代码实现

### 类型定义

```typescript
// src/content/xlinDataInsghtScript.ts
export type ScriptSpec = {
  title: string;
  language?: string;      // 默认语言
  languages?: string[];   // 支持的语言列表
  sections: ScriptSection[];
};
```

### Player 组件

```typescript
// src/components/Player.tsx
interface PlayerProps {
  defaultLanguage?: string; // 从 JSON 读取的默认语言
  // ... 其他属性
}

const Player: React.FC<PlayerProps> = ({ 
  defaultLanguage = 'zh-CN',
  // ...
}) => {
  const [language, setLanguage] = useState<string>(defaultLanguage);
  
  // 当脚本切换时，自动更新语言
  useEffect(() => {
    setLanguage(defaultLanguage);
  }, [defaultLanguage]);
}
```

### App 组件

```typescript
// src/App.tsx
<Player 
  defaultLanguage={scriptData?.language || 'zh-CN'}
  // ... 其他属性
/>
```

## 支持的语言代码

| 代码 | 语言 | 旗帜 |
|------|------|------|
| `zh-CN` | 简体中文 | 🇨🇳 |
| `en-US` | 美式英语 | 🇺🇸 |
| `ja-JP` | 日语 | 🇯🇵 |
| `ko-KR` | 韩语 | 🇰🇷 |
| `es-ES` | 西班牙语 | 🇪🇸 |
| `fr-FR` | 法语 | 🇫🇷 |
| `de-DE` | 德语 | 🇩🇪 |

## 最佳实践

1. **总是设置 `language` 字段**
   - 即使只支持一种语言，也要明确指定
   - 避免依赖默认值 `'zh-CN'`

2. **合理使用 `languages` 数组**
   - 只包含真正需要的语言
   - 每增加一种语言，批量录制时间会翻倍

3. **语言顺序**
   - `languages` 数组中第一个语言通常是主要语言
   - 建议与 `language` 字段保持一致

4. **国际化内容**
   - 确保 `read_srt` 字段的内容适合所选语言
   - 或者考虑为不同语言创建不同的脚本文件

## 故障排除

### 问题：切换脚本后语言没有更新

**原因：** 浏览器缓存或状态未刷新

**解决：** 刷新页面或检查 `defaultLanguage` prop 是否正确传递

### 问题：批量录制使用了错误的语言

**原因：** JSON 文件格式错误或 `languages` 字段缺失

**解决：** 验证 JSON 格式，确保 `languages` 是字符串数组

### 问题：TTS 语音不匹配选择的语言

**原因：** TTS 引擎需要支持该语言

**解决：** 检查浏览器 TTS 是否支持该语言，或使用外部 TTS 服务
