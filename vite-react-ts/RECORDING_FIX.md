# 录制功能优化说明

## 问题描述
之前的录制功能使用 `html-to-image` 库每秒捕获 30 次 DOM 截图，导致：
- 切换窗口时界面卡死
- 占用大量主线程资源
- 无法后台录制
- 像素质量低

## 解决方案
使用浏览器原生的 **Screen Capture API** (`getDisplayMedia`)，优势：
- ✅ 不占用主线程，性能最佳
- ✅ 支持后台录制，切换窗口不会卡顿
- ✅ 录制质量更高，完全流畅
- ✅ 2K Retina 分辨率 (2560x1440)
- ✅ 视频码率提升到 10 Mbps
- ✅ 自动保存提示和下载

## 使用方法

1. 点击 **"⬤ 朗读并录制"** 按钮
2. 浏览器会弹出屏幕共享选择框
3. 选择 **"标签页"** 选项，然后选择当前标签页
4. 点击 **"共享"** 开始录制
5. 录制完成后会自动下载视频文件

## 技术细节

### 修改的文件
- `src/hooks/useRecording.ts` - 重写录制逻辑，使用 `getDisplayMedia` API
- `src/components/Player.tsx` - 更新调用方式，添加用户提示

### 新增功能
- 支持两种录制模式：
  - **屏幕捕获模式**（默认，推荐）：使用 `getDisplayMedia`
  - **Canvas 捕获模式**（备用）：保留旧逻辑作为后备方案

### API 使用
```typescript
const { isRecording, startRecording, stopRecording } = useRecording({
  fps: 30,
  useScreenCapture: true, // 使用屏幕捕获模式
  onComplete: (blob) => {
    // 处理录制完成的视频
  },
  onError: (error) => {
    // 处理错误
  },
});
```

## 新功能
1. **高清录制** - 2560x1440 分辨率，2x Retina 显示效果
2. **智能提示** - 录制完成后会显示视频大小和下载提示
3. **调试日志** - 控制台会显示详细的录制状态和事件
4. **自动停止** - 播放完最后一页后自动停止录制并保存

## 注意事项
- 用户需要手动选择录制的标签页
- 需要浏览器支持 `getDisplayMedia` API（现代浏览器都支持）
- 如果用户拒绝共享权限，录制会失败
- 录制过程中朗读会继续进行，互不干扰
- 视频文件较大（10 Mbps码率），请确保有足够的磁盘空间

## 调试指南
如果录制没有正常保存，请：
1. 打开浏览器开发者工具 (F12)
2. 查看控制台日志，搜索 `[Recording]` 和 `[Player]` 标记
3. 确认是否看到 `✅ Calling stopRecording() after completion`
4. 检查是否有错误信息

## 测试
运行以下命令测试：
```bash
cd vite-react-ts
npm run dev
```

然后访问页面，点击 **"⬤ 朗读并录制"** 按钮测试功能。
