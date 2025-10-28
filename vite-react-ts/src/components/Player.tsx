import React, { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { PageProvider } from './PageContext';

interface PlayerProps {
  pages: ReactNode[];
  className?: string;
}

const Player: React.FC<PlayerProps> = ({ pages, className = '' }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [inputPage, setInputPage] = useState('1');
  const totalPages = pages.length;

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

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-black p-8 ${className}`}>
      <div 
        className="w-full max-w-7xl bg-gradient-to-b from-gray-900 to-black rounded-lg shadow-2xl overflow-hidden relative"
        style={{ aspectRatio: '16 / 10' }}
      >
        <div 
          className="w-full h-full p-8 overflow-hidden"
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
