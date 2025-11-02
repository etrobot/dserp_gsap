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
    const delay = nextIndex === 0 ? initialDelay : linePause;

    const timer = setTimeout(() => {
      setVisibleLines(prev => [...prev, nextIndex]);
      
      // Animate the new line
      const lineElement = lineRefs.current[nextIndex];
      if (lineElement) {
        gsap.fromTo(
          lineElement,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        );
      }
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [isVisible, visibleLines, lines.length, durations, linePause, initialDelay, onComplete]);

  return (
    <div ref={containerRef} className={`flex flex-col items-center justify-center ${className}`}>
      <div className="flex flex-col gap-4 items-center">
        {lines.map((line, index) => (
          <div
            key={index}
            ref={el => { lineRefs.current[index] = el; }}
            className={`whitespace-pre-wrap ${lineClassName}`}
            style={{
              opacity: visibleLines.includes(index) ? 1 : 0,
              willChange: 'transform, opacity',
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FloatingLinesText;
