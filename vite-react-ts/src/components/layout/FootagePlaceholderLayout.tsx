import FadeContent from '@/components/FadeContent';
import type { ScriptSection } from '@/types/scriptTypes';

interface FootagePlaceholderLayoutProps {
  section: ScriptSection;
  index: number;
  total: number;
}

// A simple macaron palette to add some friendly accent to the label tile
const macaronColors = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ec4899', // pink
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#a855f7', // purple
  '#ef4444', // red
  '#22c55e', // green
  '#64748b', // slate
];

const FootagePlaceholderLayout = ({ section, index, total }: FootagePlaceholderLayoutProps) => {
  const label = section.screen || 'Footage Placeholder';
  // Deterministic color pick based on title to avoid random flicker across renders
  const stableKey = (label || '').toLowerCase().trim();
  const hashString = (s: string) => {
    let h = 0 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) >>> 0; // 32-bit unsigned hash
    }
    return h >>> 0;
  };
  const colorIndex = stableKey ? hashString(stableKey) % macaronColors.length : 0;
  const accent = macaronColors[colorIndex];

  return (
    <div className="relative w-full h-full">
      {/* Pagination - consistent position */}
      <div className="absolute top-6 right-8 z-20 text-gray-400 text-sm">
        {index + 1}/{total}
      </div>

      <FadeContent duration={0} freeze fill={false}>
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-5xl rounded-2xl border-2 border-dashed bg-gray-900/50 shadow-2xl overflow-hidden"
          style={{ borderColor: accent }}
        >
          {/* Label tile */}
          <div
            className="absolute top-4 left-4 z-10 px-3 py-1 font-semibold"
            style={{ color: accent }}
          >
            {label}
          </div>

          {/* Video placeholder body */}
          <div className="relative w-full aspect-video bg-gray-900/50 flex items-center justify-center">
            {/* Play button glyph */}
            <div
              className="flex items-center justify-center w-24 h-24 rounded-full bg-black/30 backdrop-blur border border-white/20 shadow-lg"
              style={{ boxShadow: `0 0 40px ${accent}40` }}
            >
              <div
                className="ml-1"
                style={{
                  width: 0,
                  height: 0,
                  borderTop: '14px solid transparent',
                  borderBottom: '14px solid transparent',
                  borderLeft: `22px solid ${accent}`,
                }}
              />
            </div>

            {/* Optional illustration (emoji) at corner */}
            {section.illustration && (
              <div className="absolute bottom-4 right-4 text-4xl opacity-70 select-none">
                {section.illustration}
              </div>
            )}
          </div>
        </div>
      </FadeContent>
    </div>
  );
};

export default FootagePlaceholderLayout;
