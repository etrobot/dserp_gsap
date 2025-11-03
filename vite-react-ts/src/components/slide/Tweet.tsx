import React from 'react';
import TextType from '../TextType';
import FadeContent from '../FadeContent';
import StarBorder from '../StarBorder';

interface TweetProps {
  icon?: string;
  title?: string;
  data?: string;
  className?: string;
  borderColor?: string;
  borderSpeed?: string;
  borderThickness?: number;
  freeze?: boolean;
}

const Tweet: React.FC<TweetProps> = ({
  icon,
  title,
  data,
  className = '',
  borderColor = 'white',
  borderSpeed = '6s',
  borderThickness = 3,
  freeze = false
}) => {
  
  return (
    <FadeContent duration={800} delay={300} freeze={freeze}>
      <StarBorder
        as="div"
        className={className}
        color={borderColor}
        speed={borderSpeed}
        thickness={borderThickness}
        freeze={freeze}
      >
        <div 
          className="flex items-start gap-8 text-left backdrop-blur-md bg-white/10"
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* Left Column: Icon */}
          {icon && (
            <div className="flex items-center justify-center w-24 flex-shrink-0">
              <div className="text-7xl">{icon}</div>
            </div>
          )}
          
          {/* Right Column: Text Content */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {title && (
              <TextType
                text={title}
                as="h3"
                className="text-3xl font-bold text-white leading-tight"
                showCursor={false}
                typingSpeed={50}
                loop={false}
                startOnVisible={true}
              />
            )}
            
            {data && (
              <p className="text-gray-200 text-xl leading-relaxed whitespace-pre-wrap">{data}</p>
            )}
          </div>
        </div>
      </StarBorder>
    </FadeContent>
  );
};

export default Tweet;
