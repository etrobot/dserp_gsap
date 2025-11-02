import React from 'react';
import TextType from '../TextType';
import FadeContent from '../FadeContent';
import StarBorder from '../StarBorder';

interface TweetProps {
  avatar: string;
  name: string;
  date: string;
  content: string;
  className?: string;
  borderColor?: string;
  borderSpeed?: string;
  borderThickness?: number;
  freeze?: boolean;
}

const Tweet: React.FC<TweetProps> = ({
  avatar,
  name,
  date,
  content,
  className = '',
  borderColor = 'white',
  borderSpeed = '6s',
  borderThickness = 1,
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
      <div className="flex flex-col gap-3 text-left">
        <div className="flex items-start gap-3">
            <img
              src={avatar}
              alt={name}
              className="w-12 h-12 rounded-full object-cover"
            />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <TextType
                text={name}
                as="span"
                className="font-bold text-white"
                showCursor={false}
                typingSpeed={50}
                loop={false}
                startOnVisible={true}
              />
            </div>
            
            <div className="text-gray-400 text-sm">{date}</div>
          </div>
        </div>
        
          <p className="text-white leading-relaxed">{content}</p>

      </div>
    </StarBorder>
    </FadeContent>
  );
};

export default Tweet;
