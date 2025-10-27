import React from 'react';
import StarBorder from '../StarBorder';
import TextType from '../TextType';
import FadeContent from '../FadeContent';

export interface Feature {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
}

export interface NColFeaturesProps {
  features: Feature[];
  columns?: number;
  className?: string;
  featureClassName?: string;
  starBorderColor?: string;
  starBorderSpeed?: React.CSSProperties['animationDuration'];
  title?: string | string[];
  titleClassName?: string;
  showTitle?: boolean;
  typingSpeed?: number;
  pauseDuration?: number;
  fadeBlur?: boolean;
  fadeDuration?: number;
  fadeEasing?: string;
  fadeDelay?: number;
  staggerDelay?: number;
  // Speech control
  visibleIndices?: number[];
  controlledAppearance?: boolean;
}

const NColFeatures: React.FC<NColFeaturesProps> = ({
  features,
  columns = 3,
  className = '',
  featureClassName = '',
  starBorderColor = 'white',
  starBorderSpeed = '6s',
  title,
  titleClassName = '',
  showTitle = true,
  typingSpeed = 50,
  pauseDuration = 2000,
  fadeBlur = false,
  fadeDuration = 800,
  fadeEasing = 'ease-out',
  fadeDelay = 100,
  staggerDelay = 100,
  visibleIndices = [],
  controlledAppearance = false,
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  } as const;

  const colClass = gridCols[columns as keyof typeof gridCols] || 'grid-cols-3';

  return (
    <div className={`w-full ${className}`}>
      {showTitle && title && (
        <div className="mb-12">
          <TextType
            text={title}
            as="h1"
            className={`text-4xl md:text-5xl font-bold text-white mb-4 ${titleClassName}`}
            typingSpeed={typingSpeed}
            pauseDuration={pauseDuration}
            showCursor={true}
          />
        </div>
      )}
      <div className={`grid ${colClass} gap-6 md:gap-4 w-full ${featureClassName}`}>
        {features.map((feature, index) => {
          const isVisible = controlledAppearance ? visibleIndices.includes(index) : true;
          
          return (
            <div
              key={index}
              className="flex h-full"
              style={{
                opacity: isVisible ? 1 : 0,
                visibility: isVisible ? 'visible' : 'hidden',
                transition: 'opacity 0.5s ease-out, visibility 0.5s ease-out',
              }}
            >
              <FadeContent
                blur={fadeBlur && !controlledAppearance}
                duration={fadeDuration}
                easing={fadeEasing}
                delay={controlledAppearance ? 0 : fadeDelay + index * staggerDelay}
                className="flex h-full w-full"
              >
                <StarBorder
                  as="div"
                  className="w-full h-full"
                  color={starBorderColor}
                  speed={starBorderSpeed}
                >
                  <div className="flex flex-col h-full gap-3">
                    {feature.icon && (
                      <div className="flex justify-center">
                        {feature.icon}
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-white text-center">
                      {feature.title}
                    </h3>
                    {feature.description && (
                      <p className="text-sm text-gray-300 text-center flex-grow">
                        {feature.description}
                      </p>
                    )}
                    {feature.content && (
                      <div className="text-sm text-gray-200">
                        {feature.content}
                      </div>
                    )}
                  </div>
                </StarBorder>
              </FadeContent>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NColFeatures;
