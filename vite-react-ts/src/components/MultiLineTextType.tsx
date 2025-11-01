'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface MultiLineTextTypeProps {
  lines: string[];
  className?: string;
  lineClassName?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseAfterTyping?: number;
  pauseAfterDeleting?: number;
  initialDelay?: number;
  showCursor?: boolean;
  cursorCharacter?: string;
  cursorClassName?: string;
  cursorBlinkDuration?: number;
  startOnVisible?: boolean;
  onComplete?: () => void;
}

const MultiLineTextType = ({
  lines,
  className = '',
  lineClassName = '',
  typingSpeed = 50,
  deletingSpeed = 30,
  pauseAfterTyping = 1500,
  pauseAfterDeleting = 500,
  initialDelay = 0,
  showCursor = true,
  cursorCharacter = '|',
  cursorClassName = '',
  cursorBlinkDuration = 0.5,
  startOnVisible = false,
  onComplete,
}: MultiLineTextTypeProps) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVisible, setIsVisible] = useState(!startOnVisible);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  // Intersection Observer for startOnVisible
  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasStarted) {
            setIsVisible(true);
            setHasStarted(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [startOnVisible, hasStarted]);

  // Cursor blink animation
  useEffect(() => {
    if (showCursor && cursorRef.current) {
      gsap.set(cursorRef.current, { opacity: 1 });
      gsap.to(cursorRef.current, {
        opacity: 0,
        duration: cursorBlinkDuration,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
      });
    }
  }, [showCursor, cursorBlinkDuration]);

  // Main typing/deleting logic
  useEffect(() => {
    if (!isVisible || currentLineIndex >= lines.length) {
      if (currentLineIndex >= lines.length && onComplete) {
        onComplete();
      }
      return;
    }

    let timeout: NodeJS.Timeout;
    const currentLine = lines[currentLineIndex];
    const isLastLine = currentLineIndex === lines.length - 1;

    const executeAnimation = () => {
      if (isDeleting) {
        // Deleting phase
        if (displayedText === '') {
          // Finished deleting, move to next line
          setIsDeleting(false);
          setCurrentLineIndex(prev => prev + 1);
          timeout = setTimeout(() => {}, pauseAfterDeleting);
        } else {
          // Continue deleting
          timeout = setTimeout(() => {
            setDisplayedText(prev => prev.slice(0, -1));
          }, deletingSpeed);
        }
      } else {
        // Typing phase
        if (displayedText.length < currentLine.length) {
          // Continue typing
          timeout = setTimeout(() => {
            setDisplayedText(prev => prev + currentLine[prev.length]);
          }, typingSpeed);
        } else {
          // Finished typing
          if (isLastLine) {
            // Last line: don't delete, just complete
            if (onComplete) {
              timeout = setTimeout(() => {
                onComplete();
              }, pauseAfterTyping);
            }
          } else {
            // Not last line: start deleting after pause
            timeout = setTimeout(() => {
              setIsDeleting(true);
            }, pauseAfterTyping);
          }
        }
      }
    };

    // Initial delay only for the first line
    if (currentLineIndex === 0 && displayedText === '' && !isDeleting) {
      timeout = setTimeout(executeAnimation, initialDelay);
    } else {
      executeAnimation();
    }

    return () => clearTimeout(timeout);
  }, [
    isVisible,
    currentLineIndex,
    displayedText,
    isDeleting,
    lines,
    typingSpeed,
    deletingSpeed,
    pauseAfterTyping,
    pauseAfterDeleting,
    initialDelay,
    onComplete
  ]);

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      <span className={`inline-block whitespace-pre-wrap ${lineClassName}`}>
        {displayedText}
      </span>
      {showCursor && (
        <span
          ref={cursorRef}
          className={`inline-block opacity-100 ${cursorClassName}`}
        >
          {cursorCharacter}
        </span>
      )}
    </div>
  );
};

export default MultiLineTextType;
