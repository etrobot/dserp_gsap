'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface FloatingLinesTextProps {
  lines: string[];
  className?: string;
  lineClassName?: string;
  floatDuration?: number;
  linePause?: number;
  initialDelay?: number;
  startY?: number;
  endY?: number;
  fadeOutStart?: number;
  ease?: string;
  startOnVisible?: boolean;
  onComplete?: () => void;
}

const FloatingLinesText = ({
  lines,
  className = '',
  lineClassName = '',
  floatDuration = 3,
  linePause = 0.5,
  initialDelay = 0,
  startY = 100,
  endY = -150,
  fadeOutStart = 0.7,
  ease = 'power2.inOut',
  startOnVisible = false,
  onComplete,
}: FloatingLinesTextProps) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

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

  // Main animation logic
  useEffect(() => {
    if (!isVisible || !lineRef.current || currentLineIndex >= lines.length) {
      if (currentLineIndex >= lines.length && onComplete) {
        onComplete();
      }
      return;
    }

    const line = lineRef.current;
    
    // Create timeline for this line
    const tl = gsap.timeline({
      delay: currentLineIndex === 0 ? initialDelay : linePause,
      onComplete: () => {
        setCurrentLineIndex(prev => prev + 1);
      }
    });

    // Set initial state
    gsap.set(line, {
      y: startY,
      opacity: 0,
    });

    // Animate: fade in, float up, fade out
    tl.to(line, {
      y: endY,
      duration: floatDuration,
      ease: ease,
    })
    .to(line, {
      opacity: 1,
      duration: floatDuration * 0.2,
      ease: 'power2.in',
    }, 0)
    .to(line, {
      opacity: 0,
      duration: floatDuration * (1 - fadeOutStart),
      ease: 'power2.out',
    }, floatDuration * fadeOutStart);

    timelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [
    isVisible,
    currentLineIndex,
    lines.length,
    floatDuration,
    linePause,
    initialDelay,
    startY,
    endY,
    fadeOutStart,
    ease,
    onComplete
  ]);

  if (currentLineIndex >= lines.length) {
    return null;
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <div
        ref={lineRef}
        className={`absolute left-0 right-0 whitespace-pre-wrap ${lineClassName}`}
        style={{
          willChange: 'transform, opacity',
        }}
      >
        {lines[currentLineIndex]}
      </div>
    </div>
  );
};

export default FloatingLinesText;
