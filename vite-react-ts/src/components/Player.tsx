import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import Hyperspeed from '@/components/background/highspeed';

interface PlayerProps {
  pages: ReactNode[];
  subtitleTexts?: string[];
  className?: string;
}

const Player: React.FC<PlayerProps> = ({ pages, subtitleTexts = [], className = '' }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [inputPage, setInputPage] = useState('1');
  const totalPages = pages.length;
  const { speak, stop, isSpeaking } = useSpeech();
  const contentRef = useRef<HTMLDivElement>(null);
  const isSpeakingRef = useRef(false);
  const currentPageRef = useRef(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const speakStartTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
      return subtitleTexts[pageIndex];
    }
    if (!contentRef.current) return '';
    const paragraphs = contentRef.current.querySelectorAll('p');
    return Array.from(paragraphs).map(p => p.textContent || '').join(' ');
  }, [subtitleTexts]);

  const speakContinuous = useCallback((startPageIndex: number) => {
    if (startPageIndex >= totalPages || !isSpeakingRef.current) {
      isSpeakingRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    currentPageRef.current = startPageIndex;
    setCurrentPage(startPageIndex);
    setInputPage(String(startPageIndex + 1));

    setTimeout(() => {
      const text = extractPageText(startPageIndex);
      if (!text) {
        isSpeakingRef.current = false;
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }

      speak(text, {
        onEnd: () => {
          if (isSpeakingRef.current && startPageIndex < totalPages - 1) {
            speakContinuous(startPageIndex + 1);
          } else {
            isSpeakingRef.current = false;
            if (timerRef.current) clearInterval(timerRef.current);
          }
        },
        onError: (error) => {
          console.error('Speech error:', error);
          isSpeakingRef.current = false;
          if (timerRef.current) clearInterval(timerRef.current);
        },
      });
    }, 100);
  }, [extractPageText, speak, totalPages]);

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

  const handleStopAudio = useCallback(() => {
    isSpeakingRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    stop();
  }, [stop]);

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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-black p-8 ${className}`}>
      <div
        className="w-full max-w-7xl rounded-lg shadow-2xl overflow-hidden relative bg-black"
        style={{ aspectRatio: '16 / 10' }}
      >
        {/* Fixed background - never unmounts */}
        <div className="absolute inset-0 overflow-hidden opacity-50 pointer-events-none flex items-center justify-center">
          <div className="w-full h-full">
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

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ←
        </button>

        <button
          onClick={isSpeaking ? handleStopAudio : handlePlayAudio}
          className={`px-4 py-2 rounded text-white transition-colors ${
            isSpeaking
              ? 'bg-red-600 hover:bg-red-500'
              : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          {elapsedTime > 0 
            ? formatTime(elapsedTime)
            : '▶ 朗读'
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
