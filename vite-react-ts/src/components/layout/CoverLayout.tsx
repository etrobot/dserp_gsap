import FadeContent from '@/components/FadeContent';
import StarBorder from '@/components/StarBorder';
import SimpleCharType from '@/components/SimpleCharType';
import MultiLineTextType from '@/components/MultiLineTextType';
import type { ScriptSection } from '@/types/scriptTypes';
import { useMemo } from 'react';

interface CoverLayoutProps {
  section: ScriptSection;
}

const macaronColors = [
  '#FFB3BA', // Pink
  '#FFDFBA', // Peach
  '#FFFFBA', // Light Yellow
  '#BAFFC9', // Mint
  '#BAE1FF', // Sky Blue
  '#E0BBE4', // Lavender
  '#FEC8D8', // Light Pink
  '#D4F1F4', // Cyan
  '#FFD3B6', // Apricot
  '#A8E6CF', // Seafoam
];

const CoverLayout = ({ section }: CoverLayoutProps) => {
  const firstContent = section.content?.[0]?.data;
  const borderColor = useMemo(() => 
    macaronColors[Math.floor(Math.random() * macaronColors.length)],
    [section.id]
  );

  // Check if illustration is a URL (http/https) or local path (starts with /)
  const isImageUrl = section.illustration && 
    (section.illustration.startsWith('http://') || 
     section.illustration.startsWith('https://') || 
     section.illustration.startsWith('/'));
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative px-8">
      <FadeContent duration={1000} fill={false}>
        <StarBorder
          as="div"
          color={borderColor}
          speed="8s"
          className="max-w-6xl w-full"
        >
          <div className="py-16 px-12 flex items-center gap-12 min-h-[400px]">
            {/* Left Column: Icon or Image (50%) */}
            {section.illustration && (
              <div className="w-1/2 flex items-center justify-center">
                {isImageUrl ? (
                  <img 
                    src={section.illustration} 
                    alt={section.title || 'Cover illustration'}
                    className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg"
                    style={{
                      boxShadow: `0 0 20px ${borderColor}40`,
                    }}
                  />
                ) : (
                  <div className="text-9xl">{section.illustration}</div>
                )}
              </div>
            )}
            
            {/* Right Column: Title + Description (50%) */}
            <div className="w-1/2 flex flex-col gap-6 text-left">
              {section.title && (
                <div
                  style={{
                    textShadow: `0 0 10px ${borderColor}`,
                  }}
                >
                  <SimpleCharType
                    text={section.title}
                    className="text-5xl md:text-6xl font-black text-white leading-tight break-words"
                    speed={50}
                    initialDelay={0}
                  />
                </div>
              )}

              {firstContent?.description && (
                <MultiLineTextType
                  lines={[firstContent.description]}
                  lineClassName="text-xl md:text-2xl leading-relaxed"
                  style={{ color: borderColor }}
                  typingSpeed={30}
                  showCursor={false}
                  initialDelay={section.title ? section.title.length * 50 + 300 : 0}
                />
              )}
            </div>
          </div>
        </StarBorder>
      </FadeContent>
    </div>
  );
};

export default CoverLayout;
