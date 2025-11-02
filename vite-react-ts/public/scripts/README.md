# 📝 脚本配置说明

## JSON 字段说明

```json
{
  "title": "演示文稿标题",
  "language": "zh-CN",              // 默认语言（必填）
  "languages": ["zh-CN", "en-US"],  // 支持的语言列表（可选）
  "sections": [
    // ... 内容
  ]
}
```

### 字段解释

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | ✅ | 演示文稿标题 |
| `language` | string | ✅ | 默认语言代码（如：zh-CN, en-US） |
| `languages` | array | ❌ | 支持的语言列表，用于批量录制 |
| `sections` | array | ✅ | 演示内容 |

### 语言代码

常用语言代码：
- `zh-CN` - 简体中文
- `en-US` - 美式英语
- `ja-JP` - 日语
- `ko-KR` - 韩语
- `es-ES` - 西班牙语
- `fr-FR` - 法语
- `de-DE` - 德语

## 录制行为

### 单个脚本录制

```bash
# 使用脚本中的默认语言
npm run record ysjfTagInsightScript

# 指定语言（会覆盖 JSON 中的配置）
npm run record ysjfTagInsightScript en-US
```

### 批量录制

```bash
# 自动读取 languages 字段，为每个语言录制一次
./batch-record.sh
```

批量录制会按照 JSON 中的 `languages` 字段，为每个脚本录制多个语言版本：

**例如：**
```json
{
  "language": "zh-CN",
  "languages": ["zh-CN", "en-US", "ja-JP"]
}
```

批量录制会生成：
- `ysjfTagInsightScript_2024-11-02_20-30-00.webm` (zh-CN)
- `ysjfTagInsightScript_2024-11-02_20-35-00.webm` (en-US)
- `ysjfTagInsightScript_2024-11-02_20-40-00.webm` (ja-JP)

## 示例

### 单语言脚本

```json
{
  "title": "产品演示",
  "language": "zh-CN",
  "sections": [...]
}
```

批量录制只会录制一个版本（zh-CN）

### 多语言脚本

```json
{
  "title": "产品演示",
  "language": "zh-CN",
  "languages": ["zh-CN", "en-US"],
  "sections": [...]
}
```

批量录制会录制两个版本（zh-CN 和 en-US）

## 添加新脚本

1. 在 `public/scripts/` 目录创建新的 JSON 文件
2. 添加 `language` 和 `languages` 字段
3. 在 `batch-record.sh` 的 `scripts` 数组中添加文件名（不含 .json）

```bash
scripts=(
  "ysjfTagInsightScript"
  "yourNewScript"  # 添加这里
)
```

4. 运行批量录制：`./batch-record.sh`
