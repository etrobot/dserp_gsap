import React from 'react';
import StarBorder from '../StarBorder';
import FadeContent from '../FadeContent';
interface ImgContainerProps {
  src: string;
  alt?: string;
  className?: string;
  borderColor?: string;
  borderSpeed?: string;
  borderThickness?: number;
  imgClassName?: string;
  freeze?: boolean;
}

const ImgContainer: React.FC<ImgContainerProps> = ({
  src,
  alt = '',
  className = '',
  borderColor = 'white',
  borderSpeed = '6s',
  borderThickness = 1,
  imgClassName = '',
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
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${imgClassName}`}
      />
    </StarBorder>
    </FadeContent>
  );
};

export default ImgContainer;
