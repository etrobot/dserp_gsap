import { useCallback, useRef, useState } from 'react';

interface UseAudioOptions {
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 播放本地音频文件
  const playAudio = useCallback((audioPath: string, options?: UseAudioOptions) => {
    return new Promise<void>((resolve, reject) => {
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }

        const audio = audioRef.current;
        audio.src = audioPath;

        const handleEnd = () => {
          setIsSpeaking(false);
          audio.removeEventListener('ended', handleEnd);
          audio.removeEventListener('error', handleError);
          options?.onEnd?.();
          resolve();
        };

        const handleError = (e: Event) => {
          setIsSpeaking(false);
          audio.removeEventListener('ended', handleEnd);
          audio.removeEventListener('error', handleError);
          const audioError = (e as ErrorEvent)?.error?.message || 'Unknown error';
          const error = new Error(`音频播放失败: ${audioError}`);
          options?.onError?.(error);
          reject(error);
        };

        setIsSpeaking(true);
        audio.addEventListener('ended', handleEnd);
        audio.addEventListener('error', handleError);
        audio.play().catch((err) => {
          setIsSpeaking(false);
          const error = new Error(`无法播放音频: ${err.message}`);
          options?.onError?.(error);
          reject(error);
        });
      } catch (error) {
        setIsSpeaking(false);
        const err = new Error(`音频播放异常: ${error instanceof Error ? error.message : String(error)}`);
        options?.onError?.(err);
        reject(err);
      }
    });
  }, []);

  // 使用浏览器 TTS
  const speakWithBrowserAPI = useCallback((text: string, lang: string, options?: UseAudioOptions) => {
    return new Promise<void>((resolve, reject) => {
      try {
        if (!('speechSynthesis' in window)) {
          reject(new Error('浏览器不支持语音合成'));
          return;
        }

        console.log(`[useAudio] speakWithBrowserAPI called, text: "${text.substring(0, 50)}...", lang: ${lang}`);
        console.log(`[useAudio] speechSynthesis.speaking: ${window.speechSynthesis.speaking}, pending: ${window.speechSynthesis.pending}`);

        // 不再自动调用 cancel()，让调用者在需要时显式调用 stop()
        // 这样可以支持连续播放多个语音而不会互相取消

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        const handleStart = () => {
          console.log(`[useAudio] TTS started`);
        };

        const handleEnd = () => {
          console.log(`[useAudio] TTS ended`);
          setIsSpeaking(false);
          options?.onEnd?.();
          resolve();
        };

        const handleError = (event: SpeechSynthesisErrorEvent) => {
          console.error(`[useAudio] TTS error: ${event.error}`);
          setIsSpeaking(false);
          // 忽略 canceled 错误（这是正常的页面切换）
          if (event.error === 'canceled') {
            console.log('[useAudio] TTS canceled (normal page transition)');
            resolve(); // 不作为错误处理
            return;
          }
          const error = new Error(`语音合成错误: ${event.error}`);
          options?.onError?.(error);
          reject(error);
        };

        utterance.onstart = handleStart;
        utterance.onend = handleEnd;
        utterance.onerror = handleError;

        setIsSpeaking(true);
        utteranceRef.current = utterance;
        console.log(`[useAudio] Calling window.speechSynthesis.speak()`);
        window.speechSynthesis.speak(utterance);
        
        // 检查是否真的加入队列
        setTimeout(() => {
          console.log(`[useAudio] After 100ms - speaking: ${window.speechSynthesis.speaking}, pending: ${window.speechSynthesis.pending}`);
        }, 100);
      } catch (error) {
        console.error(`[useAudio] Exception in speakWithBrowserAPI:`, error);
        setIsSpeaking(false);
        const err = new Error(`语音合成异常: ${error instanceof Error ? error.message : String(error)}`);
        options?.onError?.(err);
        reject(err);
      }
    });
  }, []);

  // 停止播放
  const stop = useCallback(() => {
    setIsSpeaking(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return {
    playAudio,
    speakWithBrowserAPI,
    stop,
    isSpeaking,
  };
}
