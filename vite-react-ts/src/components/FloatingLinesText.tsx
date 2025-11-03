'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface FloatingLinesTextProps {
  lines: string[];
  durations?: number[]; // Duration for each line in seconds (from content[].duration)
  className?: string;
  lineClassName?: string;
  linePause?: number;
  initialDelay?: number;
  startOnVisible?: boolean;
  onComplete?: () => void;
}

const FloatingLinesText = ({
  lines,
  durations,
  className = '',
  lineClassName = '',
  linePause = 0.5,
  initialDelay = 0,
  startOnVisible = false,
  onComplete,
}: FloatingLinesTextProps) => {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [isVisible, setIsVisible] = useState(!startOnVisible);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  // Progressive line display logic
  useEffect(() => {
    if (!isVisible || visibleLines.length >= lines.length) {
      if (visibleLines.length >= lines.length && onComplete) {
        onComplete();
      }
      return;
    }

    const nextIndex = visibleLines.length;
    let delay: number;
    
    if (nextIndex === 0) {
      // First line uses initialDelay
      delay = initialDelay;
    } else {
      // Use duration from previous line, or fall back to linePause
      const prevLineDuration = durations && durations[nextIndex - 1];
      delay = prevLineDuration !== undefined ? prevLineDuration : linePause;
    }

    const timer = setTimeout(() => {
      setVisibleLines(prev => [...prev, nextIndex]);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [isVisible, visibleLines, lines.length, durations, linePause, initialDelay, onComplete]);

  // Animate newly visible lines
  useEffect(() => {
    if (visibleLines.length === 0) return;
    
    const lastIndex = visibleLines[visibleLines.length - 1];
    const newLineElement = lineRefs.current[lastIndex];
    
    // Animate all existing lines moving up
    const allVisibleElements = visibleLines.map(i => lineRefs.current[i]).filter(Boolean);
    
    if (allVisibleElements.length > 0) {
      // Move all existing lines up
      allVisibleElements.forEach((el, idx) => {
        if (el && idx < allVisibleElements.length - 1) {
          gsap.to(el, {
            y: '-=36', // Move up by gap-2 (8px) + text height estimate
            duration: 0.4,
            ease: 'power2.out'
          });
        }
      });
      
      // Fade in the new line from bottom
      if (newLineElement) {
        gsap.fromTo(
          newLineElement,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        );
      }
    }
  }, [visibleLines]);

  return (
    <div ref={containerRef} className={`flex flex-col items-center justify-center ${className}`}>
      <div className="flex flex-col gap-1 items-center justify-center">
        {lines.map((line, index) => 
          visibleLines.includes(index) ? (
            <div
              key={index}
              ref={el => { lineRefs.current[index] = el; }}
              className={`whitespace-pre-wrap ${lineClassName}`}
              style={{
                willChange: 'transform, opacity',
              }}
            >
              {line}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

export default FloatingLinesText;
