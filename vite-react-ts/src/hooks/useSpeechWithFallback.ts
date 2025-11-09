import { useCallback, useState } from 'react';
import { useAudio } from './useAudio';

interface SpeechOptions {
  onEnd?: () => void;
  onError?: (error: Error) => void;
  lang?: string;
  audioFile?: string; // 本地音频文件路径
}

export function useSpeechWithFallback() {
  const { playAudio, speakWithBrowserAPI, stop, isSpeaking } = useAudio();
  const [error, setError] = useState<Error | null>(null);

  /**
   * 播放语音，优先使用本地音频文件，如果不存在或失败则使用浏览器 TTS
   */
  const speak = useCallback(async (text: string, options: SpeechOptions = {}) => {
    setError(null);
    const { audioFile, lang = 'zh-CN', onEnd, onError } = options;

    // 如果提供了音频文件路径，优先尝试使用
    if (audioFile) {
      try {
        console.log(`[useSpeechWithFallback] 尝试播放音频文件: ${audioFile}`);
        await playAudio(audioFile, {
          onEnd,
          onError: (err) => {
            console.warn(`本地音频播放失败: ${err.message}`);
            // 不在这里处理，让它抛出异常
          },
        });
        console.log(`[useSpeechWithFallback] 音频播放成功`);
        return; // 音频播放成功，直接返回
      } catch (err) {
        console.warn(`[useSpeechWithFallback] 音频播放失败，切换到浏览器 TTS`);
        console.warn(`[useSpeechWithFallback] 错误详情:`, err);
        // 继续执行下面的 TTS fallback
      }
    }

    // 使用浏览器 TTS（要么没有音频文件，要么音频播放失败）
    console.log(`[useSpeechWithFallback] 使用浏览器 TTS, text: "${text.substring(0, 50)}...", lang: ${lang}`);
    try {
      await speakWithBrowserAPI(text, lang, {
        onEnd,
        onError: (err) => {
          console.error(`[useSpeechWithFallback] TTS 错误:`, err);
          setError(err);
          onError?.(err);
        },
      });
      console.log(`[useSpeechWithFallback] TTS 播放完成`);
    } catch (err) {
      console.error(`[useSpeechWithFallback] TTS 异常:`, err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      throw error;
    }
  }, [playAudio, speakWithBrowserAPI]);

  const stopSpeech = useCallback(() => {
    setError(null);
    stop();
  }, [stop]);

  return {
    speak,
    stop: stopSpeech,
    isSpeaking,
    error,
  };
}
