import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import { useSpeechWithFallback } from '../hooks/useSpeechWithFallback';
import { useRecording } from '../hooks/useRecording';
import Hyperspeed from '@/components/background/highspeed';
import DotGrid from '@/components/background/DotGrid';

interface PageDuration {
  sectionId: string;
  duration?: number; // 页面显示时长（秒）
}

interface PlayerProps {
  pages: ReactNode[];
  subtitleTexts?: string[];
  className?: string;
  scriptFiles?: string[];
  currentScript?: string;
  onScriptChange?: (fileName: string) => void;
  pageLayouts?: string[];
  defaultLanguage?: string; // 从 JSON 读取的默认语言
  pageDurations?: PageDuration[]; // 每页的显示时长
  scriptName?: string; // 脚本名称，用于构建音频路径
  autoplay?: boolean; // 是否自动播放
}

const Player: React.FC<PlayerProps> = ({
  pages,
  subtitleTexts = [],
  className = '',
  scriptFiles = [],
  currentScript = '',
  onScriptChange,
  pageLayouts = [],
  defaultLanguage = 'zh-CN',
  pageDurations = [],
  scriptName = '',
  autoplay = false
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [inputPage, setInputPage] = useState('1');
  const [language, setLanguage] = useState<string>(defaultLanguage);
  const totalPages = pages.length;

  // 检测是否为录制模式（通过 URL 参数）
  const isRecordingMode = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('recording') === 'true';
  }, []);
  const { speak: speakWithDefault, stop: stopDefault } = useSpeech();
  const { speak: speakWithFallback, stop: stopFallback, isSpeaking } = useSpeechWithFallback();
  
  // 动态生成音频文件路径：/tts/脚本名/section-id-索引.wav
  const getAudioPath = useCallback((sectionId: string, contentIndex: number) => {
    if (!scriptName) return null;
    const filename = `${sectionId}-${String(contentIndex + 1).padStart(2, '0')}.wav`;
    return `/tts/${scriptName}/${filename}`;
  }, [scriptName]);

  // 页面播放函数 - 基于 section.duration 或 content.showtime，支持预生成音频和 TTS
  const speakPage = useCallback((
    pageDuration: PageDuration | undefined,
    text: string,
    lang: string,
    onEnd?: () => void,
    onError?: (error: string) => void,
    onTimerEnd?: () => void  // 新增：定时器结束回调（用于录制模式）
  ) => {
    // 检测是否为无头模式或自动播放模式
    const isHeadless = !window.speechSynthesis || navigator.webdriver;

    console.log(`[Player] speakPage: pageDuration=`, pageDuration, `autoplay=${autoplay}, isHeadless=${isHeadless}`);

    let duration = pageDuration?.duration;

    if (!duration) {
      // 如果没有设置 duration，根据文本长度估算
      duration = Math.max(2, text.length * 0.1); // 每个字符约0.1秒，最少2秒
      console.log(`[Player] No duration found, estimated ${duration}s from text length ${text.length}`);
    }

    // 尝试获取预生成的音频文件
    const audioPath = pageDuration?.sectionId ? getAudioPath(pageDuration.sectionId, 0) : null;

    if (isHeadless || autoplay) {
      // 无头/自动播放模式：基于时间的页面切换（跳过音频播放）
      const durationMs = duration * 1000;
      console.log(`[Player] Autoplay mode: page will display for ${duration}s (${durationMs}ms)`);
      console.log(`[Player] Setting up page timer with timeout: ${durationMs}ms`);
      console.log(`[Player] Audio playback skipped in recording mode`);

      // 启动基于时间的页面切换定时器
      const pageTimer = setTimeout(() => {
        console.log(`[Player] 🔔 Page timer completed after ${duration}s (timeout fired)`);
        // 在录制模式下，使用 onTimerEnd 而不是 onEnd
        onTimerEnd?.();
        onEnd?.();
      }, durationMs);

      console.log(`[Player] Page timer created with ID:`, pageTimer);

      // 返回清理函数
      return () => {
        console.log(`[Player] Clearing page timer`);
        clearTimeout(pageTimer);
      };
    }

    // 有头模式：使用音频/TTS 控制页面切换
    console.log(`[Player] Interactive mode: Audio/TTS will control page timing`);

    if (audioPath) {
      // 优先使用预生成的音频文件
      console.log(`[Player] Using pre-generated audio: ${audioPath}`);
      return speakWithFallback(text, {
        audioFile: audioPath,
        lang,
        onEnd,
        onError: (err) => {
          console.log(`[Player] Audio playback failed:`, err);
          onError?.(err.message);
        },
      });
    } else {
      // 回退到 TTS
      console.log(`[Player] No pre-generated audio, using TTS`);
      return speakWithDefault(text, { onEnd, onError }, { lang });
    }
  }, [speakWithDefault, speakWithFallback, autoplay, getAudioPath]);

  // 使用新的 speak 和 stop，支持本地音频和 TTS 备用方案
  const speak = useCallback((text: string, options: Record<string, unknown>, voiceOptions?: Record<string, unknown>, pageIndex?: number) => {
    const idx = pageIndex !== undefined ? pageIndex : currentPage;
    const pageDuration = pageDurations[idx];
    const lang = (voiceOptions?.lang as string) || language;

    console.log(`[Player] speak called for pageIndex=${idx}, pageDuration=`, pageDuration);

    // 检测是否为无头模式或自动播放模式
    const isHeadless = !window.speechSynthesis || navigator.webdriver;

    // 避免在无头/自动播放模式下调用清理函数
    const result = speakPage(
      pageDuration,
      text,
      lang,
      options?.onEnd as (() => void) | undefined,
      options?.onError ? (error: string) => (options.onError as (error: Error) => void)(new Error(error)) : undefined,
      // 在录制模式下，提供 onTimerEnd 回调
      isHeadless || autoplay ? (options?.onEnd as (() => void) | undefined) : undefined
    );

    // 在无头或自动播放模式下，不返回清理函数，避免清理页面切换定时器
    if (isHeadless || autoplay) {
      return undefined;
    }

    return result;
  }, [currentPage, pageDurations, language, speakPage, autoplay]);
  
  const stop = useCallback(() => {
    stopDefault();
    stopFallback();
  }, [stopDefault, stopFallback]);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isSpeakingRef = useRef(false);
  const currentPageRef = useRef(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const speakStartTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [shouldRecord, setShouldRecord] = useState(false);
  const shouldRecordRef = useRef(false); // 用 ref 避免闭包问题

  const { isRecording, startRecording, stopRecording } = useRecording({
    fps: 60,
    targetElement: containerRef.current,
    onComplete: (blob) => {
      console.log('[Player] Recording complete! Blob size:', blob.size, 'bytes');

      const sizeMB = (blob.size / 1024 / 1024).toFixed(2);
      const filename = `${scriptName || 'presentation'}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;

      console.log(`✅ 录制完成！\n\n视频大小: ${sizeMB} MB\n文件名: ${filename}\n\n即将开始下载...`);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // 延迟释放 URL
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    },
    onError: (error) => {
      console.error('Recording error:', error);
      console.error(`❌ 录制失败:\n\n${error.message}\n\n请确保：\n1. 选择了"Chrome 标签页"\n2. 勾选了"分享音频"\n3. 录制期间不要切换标签页`);
    },
  });

  const goToPage = useCallback((pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      setCurrentPage(pageIndex);
      setInputPage(String(pageIndex + 1));
    }
  }, [totalPages]);

  const handlePrevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const handleNextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const extractPageText = useCallback((pageIndex: number): string => {
    // Use subtitle text if available, otherwise extract from DOM
    if (subtitleTexts[pageIndex]) {
      const text = subtitleTexts[pageIndex];
      console.log(`[Player] Page ${pageIndex + 1} text:`, text.substring(0, 100) + '...');
      return text;
    }
    if (!contentRef.current) return '';
    const paragraphs = contentRef.current.querySelectorAll('p');
    return Array.from(paragraphs).map(p => p.textContent || '').join(' ');
  }, [subtitleTexts]);

  const speakContinuous = useCallback((startPageIndex: number) => {
    console.log(`[Player] speakContinuous called for page ${startPageIndex + 1}/${totalPages}, isSpeaking:`, isSpeakingRef.current);

    // 设置全局变量供录制脚本检测
    if (typeof window !== 'undefined') {
      (window as any).__currentPage = startPageIndex + 1;
    }

    if (startPageIndex >= totalPages || !isSpeakingRef.current) {
      console.log(`[Player] Stopping: reached end (${startPageIndex >= totalPages}) or speaking stopped (!${isSpeakingRef.current})`);
      isSpeakingRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      // 设置播放完成标志
      if (typeof window !== 'undefined') {
        (window as any).__playbackCompleted = true;
      }
      // Auto stop recording when speech ends (only if it was auto-started)
      if (isRecording && shouldRecordRef.current) {
        console.log(`[Player] Auto-stopping recording`);
        stopRecording();
        setShouldRecord(false);
        shouldRecordRef.current = false;
      }
      return;
    }

    currentPageRef.current = startPageIndex;
    setCurrentPage(startPageIndex);
    setInputPage(String(startPageIndex + 1));
    console.log(`[Player] ✅ Switched to page ${startPageIndex + 1}/${totalPages}`);

    setTimeout(() => {
      const text = extractPageText(startPageIndex);
      const pageDurationData = pageDurations[startPageIndex];
      const duration = pageDurationData?.duration || 0;

      console.log(`[Player] 📄 Page ${startPageIndex + 1}: text length=${text.length}, duration=${duration}s, sectionId=${pageDurationData?.sectionId}`);

      if (!text || !text.trim()) {
        console.log(`[Player] ⚠️ No text for page ${startPageIndex + 1}, skipping to next`);
        // 即使没有文本也继续下一页
        if (isSpeakingRef.current && startPageIndex < totalPages - 1) {
          speakContinuous(startPageIndex + 1);
        } else {
          isSpeakingRef.current = false;
          if (timerRef.current) clearInterval(timerRef.current);
          // 设置播放完成标志
          if (typeof window !== 'undefined') {
            (window as any).__playbackCompleted = true;
          }
        }
        return;
      }

      console.log(`[Player] 🎤 Speaking page ${startPageIndex + 1}/${totalPages} (estimated ${duration}s)`);
      speak(text, {
        onEnd: () => {
          console.log(`[Player] ✅ Finished speaking page ${startPageIndex + 1}/${totalPages}`);

          if (isSpeakingRef.current && startPageIndex < totalPages - 1) {
            console.log(`[Player] ➡️  Moving to next page: ${startPageIndex + 2}/${totalPages}`);
            speakContinuous(startPageIndex + 1);
          } else {
            console.log(`[Player] 🏁 Reached end of presentation (page ${startPageIndex + 1}/${totalPages})`);
            isSpeakingRef.current = false;
            if (timerRef.current) clearInterval(timerRef.current);
            // 设置播放完成标志
            if (typeof window !== 'undefined') {
              (window as any).__playbackCompleted = true;
            }
            // Auto stop recording when speech ends (only if it was auto-started)
            if (isRecording && shouldRecordRef.current) {
              console.log(`[Player] ✅ Auto-stopping recording after completion`);
              stopRecording();
              setShouldRecord(false);
              shouldRecordRef.current = false;
            }
          }
        },
        onError: (error: SpeechSynthesisErrorEvent) => {
          console.error('[Player] ❌ Speech error on page', startPageIndex + 1, ':', error);
          isSpeakingRef.current = false;
          if (timerRef.current) clearInterval(timerRef.current);
          // 设置播放完成标志（出错时也要设置，避免无限等待）
          if (typeof window !== 'undefined') {
            (window as any).__playbackCompleted = true;
          }
          // Auto stop recording on error (only if it was auto-started)
          if (isRecording && shouldRecordRef.current) {
            stopRecording();
            setShouldRecord(false);
            shouldRecordRef.current = false;
          }
        },
      }, { lang: language }, startPageIndex);
    }, 100);
  }, [extractPageText, speak, totalPages, isRecording, stopRecording, shouldRecord, language, pageDurations]);

  const handlePlayAudio = useCallback(() => {
    isSpeakingRef.current = true;
    speakStartTimeRef.current = Date.now();
    setElapsedTime(0);
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - speakStartTimeRef.current) / 1000);
      setElapsedTime(elapsed);
    }, 100);
    
    speakContinuous(currentPage);
  }, [currentPage, speakContinuous]);

  const handlePlayAudioAndRecord = useCallback(async () => {
    // Start recording first
    if (!isRecording) {
      try {
        setShouldRecord(true);
        shouldRecordRef.current = true;
        console.log('[Player] Starting recording, shouldRecordRef set to true');

        console.log('📹 准备开始录制\n\n请在弹出的窗口中：\n1. 选择 "Chrome 标签页"（不是整个屏幕）\n2. 勾选 "分享音频" 复选框\n3. 点击"分享"\n\n录制期间请不要切换标签页。');

        await startRecording();
        console.log('[Player] Recording started, waiting 1 second before playback...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Failed to start recording:', error);
        setShouldRecord(false);
        shouldRecordRef.current = false;
        return;
      }
    }
    
    // Then start speech
    isSpeakingRef.current = true;
    speakStartTimeRef.current = Date.now();
    setElapsedTime(0);
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - speakStartTimeRef.current) / 1000);
      setElapsedTime(elapsed);
    }, 100);
    
    speakContinuous(currentPage);
  }, [currentPage, speakContinuous, isRecording, startRecording]);

  const handleStopAudio = useCallback(() => {
    isSpeakingRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    stop();
    // Stop recording immediately when user clicks stop
    if (isRecording) {
      stopRecording();
      setShouldRecord(false);
      shouldRecordRef.current = false;
    }
  }, [stop, isRecording, stopRecording]);

  const handleReload = useCallback(() => {
    if (currentScript) {
      localStorage.setItem('selectedScript', currentScript);
    }
    window.location.reload();
  }, [currentScript]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputPage(value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNum = parseInt(inputPage, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        goToPage(pageNum - 1);
      } else {
        setInputPage(String(currentPage + 1));
      }
    }
  };

  const handleInputBlur = () => {
    const pageNum = parseInt(inputPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      goToPage(pageNum - 1);
    } else {
      setInputPage(String(currentPage + 1));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevPage, handleNextPage]);

  // 当脚本切换时，自动更新语言为新脚本的默认语言
  useEffect(() => {
    setLanguage(defaultLanguage);
  }, [defaultLanguage]);

  // 重载后恢复已保存的脚本选择
  useEffect(() => {
    const savedScript = localStorage.getItem('selectedScript');
    if (savedScript && onScriptChange) {
      onScriptChange(savedScript);
      localStorage.removeItem('selectedScript');
    }
  }, [onScriptChange]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 自动播放逻辑
  useEffect(() => {
    if (autoplay && pages.length > 0) {
      console.log('[Player] Autoplay enabled, starting playback...');
      // 延迟一下，确保页面完全加载
      const timer = setTimeout(() => {
        handlePlayAudio();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoplay, pages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-gray-800 ${className}`}>
      <div
        ref={containerRef}
        className="rounded-lg shadow-2xl overone_col-hidden relative bg-black"
        style={{ width: '1280px', height: '720px' }}
      >
        {/* Fixed background - changes based on page layout */}
        <div className="absolute inset-0 overone_col-hidden opacity-50 pointer-events-none flex items-center justify-center">
          <div className="w-full h-full">
            {pageLayouts[currentPage] === 'cover' && !isRecordingMode ? (
              <Hyperspeed
                effectOptions={{
                  onSpeedUp: () => { },
                  onSlowDown: () => { },
                  distortion: 'turbulentDistortion',
                  length: 400,
                  roadWidth: 9,
                  islandWidth: 1.5,
                  lanesPerRoad: 3,
                  fov: 80,
                  fovSpeedUp: 150,
                  speedUp: 2,
                  carLightsFade: 0.4,
                  totalSideLightSticks: 20,
                  lightPairsPerRoadWay: 30,
                  shoulderLinesWidthPercentage: 0.05,
                  brokenLinesWidthPercentage: 0.1,
                  brokenLinesLengthPercentage: 0.5,
                  lightStickWidth: [0.12, 0.5],
                  lightStickHeight: [1.3, 1.7],
                  movingAwaySpeed: [60, 80],
                  movingCloserSpeed: [-120, -160],
                  carLightsLength: [400 * 0.03, 400 * 0.2],
                  carLightsRadius: [0.05, 0.14],
                  carWidthPercentage: [0.3, 0.5],
                  carShiftX: [-0.2, 0.2],
                  carFloorSeparation: [0, 5],
                  colors: {
                    roadColor: 0x080808,
                    islandColor: 0x0a0a0a,
                    background: 0x000000,
                    shoulderLines: 0xFFFFFF,
                    brokenLines: 0xFFFFFF,
                    leftCars: [0xD856BF, 0x6750A2, 0xC247AC],
                    rightCars: [0x03B3C3, 0x0E5EA5, 0x324555],
                    sticks: 0x03B3C3,
                  }
                }}
              />
            ) : (
              <DotGrid
                direction="diagonal-reverse"
                speed={0.005}
                dotColor="#999"
                dotSize={4}
                gap={20}
                hoverFillColor="#fff"
              />
            )}
          </div>
        </div>
        {/* Content layer */}
        <div
          ref={contentRef}
          className="relative z-10 w-full h-full overone_col-hidden"
        >
          {pages[currentPage]}
        </div>
      </div>

      {/* 控制按钮 - 在录制模式下隐藏 */}
      {!isRecordingMode && (
        <div className="mt-3 flex items-center gap-4 flex-wrap justify-center">
          <button
            onClick={handleReload}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            title="重新加载页面"
          >
            ↻ 重载
          </button>

          {scriptFiles.length > 0 && onScriptChange && (
            <select
              value={currentScript}
              onChange={(e) => onScriptChange(e.target.value)}
              className="px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 hover:bg-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">选择脚本...</option>
              {scriptFiles.map((file) => (
                <option key={file} value={file}>
                  {file.replace('.json', '')}
                </option>
              ))}
            </select>
          )}

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isSpeaking}
            className="px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 hover:bg-gray-600 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="zh-CN">🇨🇳 中文</option>
            <option value="en-US">🇺🇸 English</option>
            <option value="ja-JP">🇯🇵 日本語</option>
            <option value="ko-KR">🇰🇷 한국어</option>
            <option value="es-ES">🇪🇸 Español</option>
            <option value="fr-FR">🇫🇷 Français</option>
            <option value="de-DE">🇩🇪 Deutsch</option>
          </select>

          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ←
          </button>

          <button
            onClick={isSpeaking ? handleStopAudio : handlePlayAudio}
            disabled={isRecording}
            className={`px-4 py-2 rounded text-white transition-colors ${
              isSpeaking && !isRecording
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {elapsedTime > 0 && !isRecording
              ? formatTime(elapsedTime)
              : '▶ 朗读'
            }
          </button>

          <button
            onClick={isSpeaking ? handleStopAudio : handlePlayAudioAndRecord}
            className={`px-4 py-2 rounded text-white transition-colors relative ${
              isSpeaking
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-green-600 hover:bg-green-500'
            }`}
            title="点击后选择'Chrome 标签页'并勾选'分享音频'，录制期间不要切换标签页"
          >
            {isRecording && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
            {elapsedTime > 0 && isRecording
              ? formatTime(elapsedTime)
              : '⬤ 朗读并录制'
            }
          </button>

          <div className="flex items-center gap-2 text-white">
            <input
              type="text"
              value={inputPage}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onBlur={handleInputBlur}
              className="w-16 px-2 py-1 text-center bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            />
            <span className="text-gray-400">/</span>
            <span className="text-gray-400">{totalPages}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

export default Player;
