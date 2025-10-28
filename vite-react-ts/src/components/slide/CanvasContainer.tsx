import React from 'react';
import StarBorder from '../StarBorder';
import FadeContent from '../FadeContent';
interface CanvasContainerProps {
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
  borderSpeed?: string;
  borderThickness?: number;
  freeze?: boolean;
}

const CanvasContainer: React.FC<CanvasContainerProps> = ({
  children,
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
    >
      <div className="w-full h-full">
        {children}
      </div>
    </StarBorder>
    </FadeContent>
  );
};

export default CanvasContainer;
