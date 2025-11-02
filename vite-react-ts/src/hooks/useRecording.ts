import { useState, useCallback, useRef } from 'react';

interface UseRecordingOptions {
  onComplete?: (blob: Blob) => void;
  onError?: (error: Error) => void;
  fps?: number;
}

/**
 * 录制 Hook - 使用屏幕捕获 API (getDisplayMedia)
 * 用户需要手动选择要录制的浏览器标签页/窗口
 */
export const useRecording = (options: UseRecordingOptions = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      console.log('[Recording] Starting screen capture...');
      
      // 请求屏幕捕获权限
      // Mac 用户注意：
      // 1. 必须选择"Chrome 窗口"（或浏览器窗口）
      // 2. 不要选"整个屏幕"（会录制其他内容）
      // 3. 录制期间保持浏览器窗口在最前面
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 2560 },
          height: { ideal: 1440 },
          frameRate: { ideal: options.fps || 30 }
        },
        audio: false,
      } as MediaStreamConstraints);

      streamRef.current = displayStream;

      // 监听 track 状态变化
      const videoTrack = displayStream.getVideoTracks()[0];
      console.log('[Recording] Video track info:', {
        id: videoTrack.id,
        label: videoTrack.label,
        readyState: videoTrack.readyState,
        enabled: videoTrack.enabled
      });

      // 监听页面可见性变化，提醒用户不要切换窗口
      const handleVisibilityChange = () => {
        if (document.hidden) {
          console.warn('[Recording] ⚠️ 页面不可见！录制可能已暂停或录制了其他内容');
        } else {
          console.log('[Recording] ✅ 页面恢复可见');
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // 监听用户停止共享（例如点击浏览器的"停止共享"按钮）
      videoTrack.onended = () => {
        console.warn('[Recording] ⚠️ User stopped sharing - auto stopping recording');
        console.log('[Recording] Track final state:', {
          readyState: videoTrack.readyState,
          enabled: videoTrack.enabled
        });
        console.log('[Recording] MediaRecorder state:', mediaRecorderRef.current?.state);
        
        // 清理监听器
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        
        // 用户主动停止共享时，自动停止录制
        // 这是正常的用户操作，应该结束录制
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          console.log('[Recording] Stopping recording due to user action');
          stopRecording();
        }
      };

      // 创建 MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
        ? 'video/webm;codecs=vp8'
        : 'video/webm';
      
      console.log('[Recording] Using MIME type:', mimeType);
      
      const mediaRecorder = new MediaRecorder(displayStream, {
        mimeType,
        videoBitsPerSecond: 10000000, // 10 Mbps for 2K resolution (2560x1440)
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log('[Recording] Data chunk received:', event.data.size, 'bytes');
        }
      };

      mediaRecorder.onstop = () => {
        console.log('[Recording] ✅ MediaRecorder onstop event fired');
        console.log('[Recording] Recording stopped, total chunks:', chunksRef.current.length);
        const blob = new Blob(chunksRef.current, { type: mimeType });
        console.log('[Recording] Final blob size:', blob.size, 'bytes');
        
        // 清理流
        if (streamRef.current) {
          console.log('[Recording] Cleaning up stream tracks...');
          streamRef.current.getTracks().forEach(track => {
            console.log('[Recording] Stopping track:', track.kind, track.label);
            track.stop();
          });
          streamRef.current = null;
        }
        
        // 先更新状态，再触发回调
        setIsRecording(false);
        console.log('[Recording] isRecording set to false');
        
        // 最后触发完成回调
        options.onComplete?.(blob);
        console.log('[Recording] onComplete callback executed');
      };

      mediaRecorder.onerror = (event) => {
        console.error('[Recording] MediaRecorder error:', event);
        const error = new Error(`MediaRecorder error: ${event}`);
        options.onError?.(error);
        setIsRecording(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // 每秒收集一次数据
      setIsRecording(true);
      
      console.log('[Recording] Recording started successfully');
    } catch (error) {
      console.error('[Recording] Failed to start screen capture:', error);
      const err = error instanceof Error ? error : new Error('Unknown recording error');
      options.onError?.(err);
      setIsRecording(false);
    }
  }, [options]);

  const stopRecording = useCallback(() => {
    console.log('[Recording] Stopping recording...');
    console.log('[Recording] Current MediaRecorder state:', mediaRecorderRef.current?.state);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // 不要在这里立即设置 setIsRecording(false)
      // 让 onstop 回调来处理状态更新，确保数据处理完成
      mediaRecorderRef.current.stop();
      console.log('[Recording] MediaRecorder.stop() called, waiting for onstop event...');
    } else {
      console.log('[Recording] MediaRecorder is already inactive or null');
      // 只有当 MediaRecorder 已经是 inactive 状态时才立即更新状态
      setIsRecording(false);
      
      // 清理流
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
};
