import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import { useRecording } from '../hooks/useRecording';
import Hyperspeed from '@/components/background/highspeed';
import Squares from '@/components/background/squares';

interface PlayerProps {
  pages: ReactNode[];
  subtitleTexts?: string[];
  className?: string;
  scriptFiles?: string[];
  currentScript?: string;
  onScriptChange?: (fileName: string) => void;
  pageLayouts?: string[];
  defaultLanguage?: string; // 从 JSON 读取的默认语言
}

const Player: React.FC<PlayerProps> = ({ 
  pages, 
  subtitleTexts = [], 
  className = '',
  scriptFiles = [],
  currentScript = '',
  onScriptChange,
  pageLayouts = [],
  defaultLanguage = 'zh-CN'
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [inputPage, setInputPage] = useState('1');
  const [language, setLanguage] = useState<string>(defaultLanguage);
  const totalPages = pages.length;
  const { speak, stop, isSpeaking } = useSpeech();
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
    fps: 30,
    onComplete: (blob) => {
      console.log('[Player] Recording complete! Blob size:', blob.size, 'bytes');
      alert(`录制完成！视频大小: ${(blob.size / 1024 / 1024).toFixed(2)} MB\n即将开始下载...`);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presentation-${Date.now()}.webm`;
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
      alert('录制失败: ' + error.message);
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
    console.log(`[Player] speakContinuous called for page ${startPageIndex + 1}, isSpeaking:`, isSpeakingRef.current);
    
    if (startPageIndex >= totalPages || !isSpeakingRef.current) {
      console.log(`[Player] Stopping: reached end or speaking stopped`);
      isSpeakingRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
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

    setTimeout(() => {
      const text = extractPageText(startPageIndex);
      console.log(`[Player] Page ${startPageIndex + 1} text length: ${text.length}, preview:`, text.substring(0, 100));
      
      if (!text || !text.trim()) {
        console.log(`[Player] ⚠️ No text for page ${startPageIndex + 1}, stopping playback`);
        isSpeakingRef.current = false;
        if (timerRef.current) clearInterval(timerRef.current);
        // Auto stop recording when speech ends (only if it was auto-started)
        if (isRecording && shouldRecordRef.current) {
          console.log(`[Player] ✅ Stopping recording due to no text`);
          stopRecording();
          setShouldRecord(false);
          shouldRecordRef.current = false;
        }
        return;
      }

      console.log(`[Player] 🎤 Speaking page ${startPageIndex + 1}/${totalPages}`);
      speak(text, {
        onEnd: () => {
          console.log(`[Player] Finished speaking page ${startPageIndex + 1}`);
          console.log(`[Player] isSpeakingRef.current: ${isSpeakingRef.current}, startPageIndex: ${startPageIndex}, totalPages: ${totalPages}`);
          console.log(`[Player] isRecording: ${isRecording}, shouldRecord: ${shouldRecord}`);
          
          if (isSpeakingRef.current && startPageIndex < totalPages - 1) {
            console.log(`[Player] Moving to next page: ${startPageIndex + 2}`);
            speakContinuous(startPageIndex + 1);
          } else {
            console.log(`[Player] Reached end of presentation or stopped speaking`);
            isSpeakingRef.current = false;
            if (timerRef.current) clearInterval(timerRef.current);
            // Auto stop recording when speech ends (only if it was auto-started)
            console.log(`[Player] Checking recording status: isRecording=${isRecording}, shouldRecordRef.current=${shouldRecordRef.current}`);
            if (isRecording && shouldRecordRef.current) {
              console.log(`[Player] ✅ Calling stopRecording() after completion`);
              stopRecording();
              setShouldRecord(false);
              shouldRecordRef.current = false;
            } else {
              console.log(`[Player] ⚠️ NOT stopping recording: isRecording=${isRecording}, shouldRecordRef.current=${shouldRecordRef.current}`);
            }
          }
        },
        onError: (error) => {
          console.error('[Player] Speech error:', error);
          isSpeakingRef.current = false;
          if (timerRef.current) clearInterval(timerRef.current);
          // Auto stop recording on error (only if it was auto-started)
          if (isRecording && shouldRecordRef.current) {
            stopRecording();
            setShouldRecord(false);
            shouldRecordRef.current = false;
          }
        },
      }, { lang: language });
    }, 100);
  }, [extractPageText, speak, totalPages, isRecording, stopRecording, shouldRecord, language]);

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
        await startRecording();
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Failed to start recording:', error);
        setShouldRecord(false);
        shouldRecordRef.current = false;
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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-gray-800 p-8 ${className}`}>
      <div
        ref={containerRef}
        className="rounded-lg shadow-2xl overflow-hidden relative bg-black"
        style={{ width: '1280px', height: '720px' }}
      >
        {/* Fixed background - changes based on page layout */}
        <div className="absolute inset-0 overflow-hidden opacity-50 pointer-events-none flex items-center justify-center">
          <div className="w-full h-full">
            {pageLayouts[currentPage] === 'cover' ? (
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
              <Squares
                direction="diagonal"
                speed={0.005}
                borderColor="#999"
                squareSize={40}
                hoverFillColor="#222"
              />
            )}
          </div>
        </div>
        {/* Content layer */}
        <div
          ref={contentRef}
          className="relative z-10 w-full h-full overflow-hidden"
        >
          {pages[currentPage]}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 flex-wrap justify-center">
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
          title="Mac 用户：请选择'Chrome 窗口'（不要选整个屏幕），录制期间保持窗口在最前面"
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
    </div>
  );
};

export default Player;
