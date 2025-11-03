#!/bin/bash
# 批量录制所有演示文稿脚本
# 使用方法: ./batch-record.sh
# 
# 会自动读取每个脚本 JSON 中的 language 字段（默认语言）

echo "🎬 开始批量录制..."

# 定义脚本列表（根据 public/scripts/ 目录中的实际文件）
scripts=(
  "ysjfTagInsightScript"
)

# 读取 JSON 中的语言配置
get_language() {
  local script_file="public/scripts/$1.json"
  if [ -f "$script_file" ]; then
    # 读取 language 字段
    local lang=$(node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync('$script_file'));console.log(d.language||'zh-CN')")
    echo "$lang"
  else
    echo "zh-CN"
  fi
}

# 循环录制
for script in "${scripts[@]}"; do
  lang=$(get_language "$script")
  
  echo ""
  echo "=================================="
  echo "📝 录制: $script"
  echo "🌐 语言: $lang"
  echo "=================================="
  
  npm run record "$script" "$lang"
  
  # 检查是否成功
  if [ $? -eq 0 ]; then
    echo "✅ $script ($lang) 录制完成"
  else
    echo "❌ $script ($lang) 录制失败"
  fi
  
  # 等待 2 秒再继续下一个
  sleep 2
done

echo ""
echo "🎉 批量录制完成！"
echo "📁 录制文件保存在: recordings/"
