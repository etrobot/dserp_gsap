import { useState, useEffect } from 'react';
import FadeContent from '@/components/FadeContent';
import { Feature } from '@/components/slide';
import type { ScriptSection } from '@/types/scriptTypes';

interface FlowLayoutProps {
  section: ScriptSection;
  index: number;
  total: number;
}

const FlowLayout = ({ section, index, total }: FlowLayoutProps) => {
  const [visibleFlowItems, setVisibleFlowItems] = useState<number>(0);

  useEffect(() => {
    if (!section.content || section.content.length === 0) return;
    
    let currentIndex = 0;
    setVisibleFlowItems(0);

    const showNextItem = () => {
      if (currentIndex < section.content!.length) {
        setVisibleFlowItems(currentIndex + 1);
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
            {section.title && (
              <h1 className="text-4xl md:text-5xl font-black text-white text-center">
                {section.title}
              </h1>
            )}
          </div>
        </FadeContent>

        <div className="space-y-5">
          {section.content?.slice(0, visibleFlowItems).map((item, i) => (
            <div key={i}>
              {item.data && (
                <Feature
                  icon={item.data.icon}
                  title={item.data.title}
                  subtitle={item.data.description}
                  layout="horizontal"
                  borderColor="#8b5cf6"
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

export default FlowLayout;
