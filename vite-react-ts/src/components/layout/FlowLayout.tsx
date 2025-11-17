import { useState, useEffect, useMemo } from 'react';
import FadeContent from '@/components/FadeContent';
import { Feature } from '@/components/slide';
import type { ScriptSection } from '@/types/scriptTypes';

interface One_colLayoutProps {
  section: ScriptSection;
  index: number;
  total: number;
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

const One_colLayout = ({ section, index, total }: One_colLayoutProps) => {
  const [visibleOne_colItems, setVisibleOne_colItems] = useState<number>(0);

  const itemColors = useMemo(() => {
    return section.content?.map(() => 
      macaronColors[Math.floor(Math.random() * macaronColors.length)]
    ) || [];
  }, [section.id]);

  useEffect(() => {
    if (!section.content || section.content.length === 0) return;
    
    let currentIndex = 0;
    setVisibleOne_colItems(0);

    const showNextItem = () => {
      if (currentIndex < section.content!.length) {
        setVisibleOne_colItems(currentIndex + 1);
        currentIndex++;
        
        if (currentIndex < section.content!.length) {
          const delay = (section.content![currentIndex - 1].duration || 2) * 1000;
          setTimeout(showNextItem, delay);
        }
      }
    };

    const initialTimer = setTimeout(showNextItem, 800);
    
    return () => {
      clearTimeout(initialTimer);
    };
  }, [section.content]);

  return (
    <div className="w-full h-full flex items-center relative px-12 pb-8">
      {/* Pagination - consistent position */}
      <div className="absolute top-6 right-8 z-20 text-gray-400 text-sm">
        {index + 1}/{total}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full mx-auto items-start">
        <FadeContent duration={600}>
          <div className="flex flex-col items-center justify-center sticky top-1/3">
            <div className="text-9xl mb-6">{section.illustration}</div>
            {(section.screen || section.title) && (
              <h1 className="text-4xl md:text-5xl font-black text-white text-center">
                {section.screen || section.title}
              </h1>
            )}
          </div>
        </FadeContent>

        <div className="space-y-5">
          {section.content?.slice(0, visibleOne_colItems).map((item, i) => (
            <div key={i}>
              {item.data && (
                <Feature
                  icon={item.data.icon}
                  title={item.data.title}
                  subtitle={item.data.description}
                  layout="horizontal"
                  borderColor={itemColors[i]}
                  borderSpeed={`${4 + i}s`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default One_colLayout;
