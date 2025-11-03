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
    const { audioFile, lang = 'zh-TW', onEnd, onError } = options;

    try {
      // 如果提供了音频文件路径，优先使用
      if (audioFile) {
        try {
          await playAudio(audioFile, {
            onEnd,
            onError: (err) => {
              console.warn(`本地音频播放失败: ${err.message}，切换到浏览器 TTS`);
              // 音频播放失败，切换到浏览器 TTS
              speakWithBrowserAPI(text, lang, { onEnd, onError }).catch((e) => {
                setError(e);
                onError?.(e);
              });
            },
          });
          return;
        } catch (err) {
          console.warn(`本地音频播放异常: ${err}，切换到浏览器 TTS`);
          // 继续使用浏览器 TTS
        }
      }

      // 降级到浏览器 TTS
      await speakWithBrowserAPI(text, lang, {
        onEnd,
        onError: (err) => {
          setError(err);
          onError?.(err);
        },
      });
    } catch (err) {
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
