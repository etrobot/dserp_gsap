import React, { useRef, useEffect, useCallback } from 'react';

type CanvasStrokeStyle = string | CanvasGradient | CanvasPattern;

interface Dot {
  cx: number;
  cy: number;
  xOffset: number;
  yOffset: number;
  _inertiaApplied: boolean;
}

interface DotGridProps {
  direction?: 'diagonal' | 'diagonal-reverse' | 'up' | 'right' | 'down' | 'left';
  speed?: number;
  dotColor?: CanvasStrokeStyle;
  dotSize?: number;
  gap?: number;
  hoverFillColor?: CanvasStrokeStyle;
}

const DotGrid: React.FC<DotGridProps> = ({
  direction = 'right',
  speed = 1,
  dotColor = '#999',
  dotSize = 4,
  gap = 20,
  hoverFillColor = '#fff'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const gridOffsetRef = useRef({ x: 0, y: 0 });
  const hoveredDotRef = useRef<Dot | null>(null);

  const buildGrid = useCallback(() => {
    const wrap = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const { width, height } = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    const cols = Math.floor((width + gap) / (dotSize + gap));
    const rows = Math.floor((height + gap) / (dotSize + gap));
    const cell = dotSize + gap;

    const gridW = cell * cols - gap;
    const gridH = cell * rows - gap;

    const extraX = width - gridW;
    const extraY = height - gridH;

    const startX = extraX / 2 + dotSize / 2;
    const startY = extraY / 2 + dotSize / 2;

    const dots: Dot[] = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cx = startX + x * cell;
        const cy = startY + y * cell;
        dots.push({ cx, cy, xOffset: 0, yOffset: 0, _inertiaApplied: false });
      }
    }
    dotsRef.current = dots;
  }, [dotSize, gap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    buildGrid();

    const handleResize = () => {
      buildGrid();
    };

    window.addEventListener('resize', handleResize);

    const drawDots = () => {
      const wrap = wrapperRef.current;
      if (!wrap) return;

      const { width, height } = wrap.getBoundingClientRect();

      ctx.clearRect(0, 0, width, height);

      const dots = dotsRef.current;
      for (const dot of dots) {
        const x = dot.cx + dot.xOffset;
        const y = dot.cy + dot.yOffset;

        if (dot === hoveredDotRef.current) {
          ctx.fillStyle = hoverFillColor;
          ctx.beginPath();
          ctx.arc(x, y, dotSize / 2 + 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.sqrt(width ** 2 + height ** 2) / 2
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, '#060010');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };

    const updateAnimation = () => {
      const effectiveSpeed = Math.max(speed, 0.1);
      const cell = dotSize + gap;

      switch (direction) {
        case 'right':
          gridOffsetRef.current.y = (gridOffsetRef.current.y - effectiveSpeed + cell) % cell;
          break;
        case 'left':
          gridOffsetRef.current.y = (gridOffsetRef.current.y + effectiveSpeed + cell) % cell;
          break;
        case 'up':
          gridOffsetRef.current.x = (gridOffsetRef.current.x + effectiveSpeed + cell) % cell;
          break;
        case 'down':
          gridOffsetRef.current.x = (gridOffsetRef.current.x - effectiveSpeed + cell) % cell;
          break;
        case 'diagonal':
          gridOffsetRef.current.x = (gridOffsetRef.current.x - effectiveSpeed + cell) % cell;
          gridOffsetRef.current.y = (gridOffsetRef.current.y - effectiveSpeed + cell) % cell;
          break;
        case 'diagonal-reverse':
          gridOffsetRef.current.x = (gridOffsetRef.current.x - effectiveSpeed + cell) % cell;
          gridOffsetRef.current.y = (gridOffsetRef.current.y + effectiveSpeed + cell) % cell;
          break;
        default:
          break;
      }

      for (const dot of dotsRef.current) {
        dot.xOffset = gridOffsetRef.current.x;
        dot.yOffset = gridOffsetRef.current.y;
      }

      drawDots();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      let nearest: Dot | null = null;
      let minDistance = dotSize + 4;

      for (const dot of dotsRef.current) {
        const x = dot.cx + dot.xOffset;
        const y = dot.cy + dot.yOffset;
        const distance = Math.sqrt((x - mouseX) ** 2 + (y - mouseY) ** 2);

        if (distance < minDistance) {
          minDistance = distance;
          nearest = dot;
        }
      }

      hoveredDotRef.current = nearest;
    };

    const handleMouseLeave = () => {
      hoveredDotRef.current = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    requestRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [direction, speed, dotColor, dotSize, gap, hoverFillColor, buildGrid]);

  return (
    <div ref={wrapperRef} className="w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full border-none block"></canvas>
    </div>
  );
};

export default DotGrid;
