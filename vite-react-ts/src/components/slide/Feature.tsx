import React from 'react';
import TextType from '../TextType';
import FadeContent from '../FadeContent';
import StarBorder from '../StarBorder';

interface FeatureProps {
  icon?: React.ReactNode | string;
  title?: string;
  subtitle?: string;
  layout?: 'vertical' | 'horizontal';
  className?: string;
  borderColor?: string;
  borderSpeed?: string;
  borderThickness?: number;
  freeze?: boolean;
}

const Feature: React.FC<FeatureProps> = ({
  icon,
  title,
  subtitle,
  layout = 'vertical',
  className = '',
  borderColor = 'white',
  borderSpeed = '6s',
  borderThickness = 1,
  freeze = false
}) => {

  return (
    <FadeContent duration={400} delay={0} freeze={freeze}>
      <StarBorder
        as="div"
        className={className}
        color={borderColor}
        speed={borderSpeed}
        thickness={borderThickness}
        freeze={freeze}
      >
        <div
          className={`flex ${layout === 'vertical'
              ? 'flex-col items-center text-center gap-4'
              : 'flex-row items-center gap-4'
            }`}
        >
          {icon && (
            <div className="text-4xl">
              {typeof icon === 'string' && (icon.startsWith('http://') || icon.startsWith('https://')) ? (
                <img src={icon} alt="icon" className="w-12 h-12 object-cover" />
              ) : (
                icon
              )}
            </div>
          )}

          <div className={`flex flex-col ${layout === 'vertical' ? 'items-center text-center' : 'flex-1 items-start text-left'} gap-2`}>
            {title && (
              <TextType
                text={title}
                as="h3"
                className="text-xl font-bold text-white"
                showCursor={false}
                typingSpeed={50}
                loop={false}
                startOnVisible={true}
              />
            )}

            {subtitle && (
              <p className="text-gray-400 text-sm leading-relaxed">{subtitle}</p>
            )}
          </div>
        </div>
      </StarBorder>
    </FadeContent>
  );
};

export default Feature;
