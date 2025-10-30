import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useSpeech } from '../hooks/useSpeech';

interface PlayerProps {
  pages: ReactNode[];
  readingTexts?: string[];
  className?: string;
}

const Player: React.FC<PlayerProps> = ({ pages, readingTexts = [], className = '' }) => {
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
    // Use reading text if available, otherwise extract from DOM
    if (readingTexts[pageIndex]) {
      return readingTexts[pageIndex];
    }
    if (!contentRef.current) return '';
    const paragraphs = contentRef.current.querySelectorAll('p');
    return Array.from(paragraphs).map(p => p.textContent || '').join(' ');
  }, [readingTexts]);

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
        <div
          ref={contentRef}
          className="w-full h-full overflow-hidden"
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
