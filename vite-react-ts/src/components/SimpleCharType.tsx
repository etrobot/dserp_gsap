import { useEffect, useState } from 'react';

interface SimpleCharTypeProps {
  text: string;
  className?: string;
  speed?: number;
  initialDelay?: number;
  onComplete?: () => void;
}

const SimpleCharType = ({
  text,
  className = '',
  speed = 50,
  initialDelay = 0,
  onComplete,
}: SimpleCharTypeProps) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let currentIndex = 0;

    const typeNextChar = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
        timeout = setTimeout(typeNextChar, speed);
      } else if (onComplete) {
        onComplete();
      }
    };

    timeout = setTimeout(typeNextChar, initialDelay);

    return () => clearTimeout(timeout);
  }, [text, speed, initialDelay, onComplete]);

  return <div className={className}>{displayedText}</div>;
};

export default SimpleCharType;
