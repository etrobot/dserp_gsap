import { useRef, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface FadeContentProps {
  children: ReactNode;
  blur?: boolean;
  duration?: number;
  easing?: string;
  delay?: number;
  initialOpacity?: number;
  className?: string;
  freeze?: boolean;
}

const FadeContent: React.FC<FadeContentProps> = ({
  children,
  blur = false,
  duration = 1000,
  easing = 'ease-out',
  delay = 0,
  initialOpacity = 0,
  className = '',
  freeze = false
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

  return (
    <div
      ref={ref}
      className={className}
      style={freeze ? undefined : {
        opacity: inView ? 1 : initialOpacity,
        transition: `opacity ${duration}ms ${easing}, filter ${duration}ms ${easing}`,
        transitionDelay: `${delay}ms`,
        filter: blur ? (inView ? 'blur(0px)' : 'blur(10px)') : 'none'
      }}
    >
      {children}
    </div>
  );
};

export default FadeContent;
