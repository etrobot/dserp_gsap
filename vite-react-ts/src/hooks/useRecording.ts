import { useState, useCallback, useRef } from 'react';

interface UseRecordingOptions {
  onComplete?: (blob: Blob) => void;
  onError?: (error: Error) => void;
  fps?: number;
  targetElement?: HTMLElement | null;
}

/**
 * 录制 Hook - 使用 getDisplayMedia 捕获标签页（含音频）
 * 用户手动选择要录制的标签页
 */
export const useRecording = (options: UseRecordingOptions = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      console.log('[Recording] Starting screen and audio capture...');
      
      // 请求屏幕捕获权限（包含音频）
      // 用户需要选择"Chrome 标签页"并勾选"分享音频"
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: options.fps || 60 }
        },
        audio: true, // 捕获标签页音频
      } as MediaStreamConstraints);

      streamRef.current = displayStream;

      // 监听 track 状态
      const videoTrack = displayStream.getVideoTracks()[0];
      const audioTracks = displayStream.getAudioTracks();
      
      console.log('[Recording] Video track:', videoTrack.label);
      console.log('[Recording] Audio tracks:', audioTracks.length);
      
      audioTracks.forEach((track, index) => {
        console.log(`[Recording] Audio track ${index}:`, track.label);
      });

      // 监听用户停止共享
      videoTrack.onended = () => {
        console.log('[Recording] User stopped sharing');
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
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
        videoBitsPerSecond: 5000000, // 5 Mbps for 1280x720
        audioBitsPerSecond: 128000, // 128 kbps for audio
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
    console.log('[Recording] Stopping...');

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('[Recording] Stopping track:', track.kind);
        track.stop();
      });
      streamRef.current = null;
    }

    setIsRecording(false);
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
};
