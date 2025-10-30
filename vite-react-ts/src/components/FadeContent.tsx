import { useRef, useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

interface FadeContentProps {
  children: ReactNode;
  blur?: boolean;
  duration?: number;
  easing?: string;
  delay?: number;
  initialOpacity?: number;
  className?: string;
  freeze?: boolean;
  style?: CSSProperties;
  fill?: boolean;
}

const FadeContent: React.FC<FadeContentProps> = ({
  children,
  blur = false,
  duration = 1000,
  easing = 'ease-out',
  delay = 0,
  initialOpacity = 0,
  className = '',
  freeze = false,
  style,
  fill = true
}) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (freeze) {
      setInView(true);
      return;
    }

    // Immediately show content without animation to prevent layout shift during page transitions
    setInView(true);
  }, [freeze]);

  const transitionStyles = freeze ? {} : {
    opacity: inView ? 1 : initialOpacity,
    transition: `opacity ${duration}ms ${easing}, filter ${duration}ms ${easing}`,
    transitionDelay: `${delay}ms`,
    filter: blur ? (inView ? 'blur(0px)' : 'blur(10px)') : 'none'
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...(fill && { width: '100%', height: '100%' }),
        ...transitionStyles,
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default FadeContent;
