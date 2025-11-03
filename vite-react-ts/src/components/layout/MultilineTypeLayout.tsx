import FadeContent from '@/components/FadeContent';
import MultiLineTextType from '@/components/MultiLineTextType';
import type { ScriptSection } from '@/types/scriptTypes';

interface MultilineTypeLayoutProps {
  section: ScriptSection;
  index: number;
  total: number;
}

const MultilineTypeLayout = ({ section, index, total }: MultilineTypeLayoutProps) => {
  const lines = section.content?.map(item => item.data?.title || '').filter(Boolean) || [];
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative px-8 pb-8">
      {/* Pagination - consistent position */}
      <div className="absolute top-6 right-8 z-20 text-gray-400 text-sm">
        {index + 1}/{total}
      </div>

      {section.illustration && (
        <FadeContent duration={600} fill={false}>
          <div className="text-9xl mb-8">{section.illustration}</div>
        </FadeContent>
      )}

      <div className="w-full">
        {lines.length > 0 && (
          <MultiLineTextType
            lines={lines}
            className="text-white text-2xl md:text-4xl font-bold text-center leading-relaxed"
            lineClassName="tracking-tight"
            typingSpeed={60}
            deletingSpeed={20}
            pauseAfterTyping={1000}
            pauseAfterDeleting={400}
            initialDelay={0}
            showCursor={true}
            cursorCharacter="|"
            cursorClassName="text-purple-400"
            startOnVisible={true}
          />
        )}
      </div>
    </div>
  );
};

export default MultilineTypeLayout;
