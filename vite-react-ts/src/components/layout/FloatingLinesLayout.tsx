import FadeContent from '@/components/FadeContent';
import FloatingLinesText from '@/components/FloatingLinesText';
import type { ScriptSection } from '@/types/scriptTypes';

interface FloatingLinesLayoutProps {
  section: ScriptSection;
  index: number;
  total: number;
}

const FloatingLinesLayout = ({ section, index, total }: FloatingLinesLayoutProps) => {
  const lines = section.content?.map(item => item.data?.title || '').filter(Boolean) || [];
  const durations = section.content?.map(item => item.duration) || [];
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative px-8 pt-8 pb-8">
      {/* Pagination - consistent position */}
      <div className="absolute top-6 right-8 z-20 text-gray-400 text-sm">
        {index + 1}/{total}
      </div>

      {section.title && (
        <FadeContent duration={600} fill={false}>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            {section.title}
          </h1>
        </FadeContent>
      )}

      {section.illustration && (
        <FadeContent duration={600} delay={200} fill={false}>
          <div className="text-8xl">{section.illustration}</div>
        </FadeContent>
      )}

      <div className="relative w-full flex-1 flex items-center justify-center min-h-0">
        {lines.length > 0 && (
          <FloatingLinesText
            lines={lines}
            durations={durations}
            className="w-full"
            lineClassName="text-white text-xl md:text-2xl font-semibold text-center px-8"
            linePause={0.3}
            initialDelay={section.illustration ? 1 : 0.5}
            startOnVisible={true}
          />
        )}
      </div>
    </div>
  );
};

export default FloatingLinesLayout;
