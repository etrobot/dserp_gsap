import { useState, useEffect } from 'react';
import TextType from '@/components/TextType';
import { Feature } from '@/components/slide';
import type { ScriptSection } from '@/types/scriptTypes';

interface KeypointsLayoutProps {
  section: ScriptSection;
  index: number;
  total: number;
}

const KeypointsLayout = ({ section, index, total }: KeypointsLayoutProps) => {
  const getBorderColor = (index: number) => {
    return index % 3 === 0 ? "#10b981" : index % 3 === 1 ? "#3b82f6" : "#ec4899";
  };

  const [visibleItems, setVisibleItems] = useState<number>(0);

  useEffect(() => {
    if (!section.content || section.content.length === 0) return;
    
    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;
    setVisibleItems(0);

    const showNextItem = () => {
      if (currentIndex < section.content!.length) {
        setVisibleItems(currentIndex + 1);
        const currentItem = section.content![currentIndex];
        currentIndex++;
        
        if (currentIndex < section.content!.length) {
          // Calculate delay: duration - animation time
          // FadeContent: 400ms, TextType: ~50ms per char (estimate 20 chars = 1000ms)
          // Total animation time ≈ 400ms
          const itemDuration = (currentItem.duration || 1) * 1000; // duration in ms
          const animationTime = 400; // FadeContent duration only, TextType runs in parallel
          const delay = Math.max(50, itemDuration - animationTime); // minimum 50ms delay
          timeoutId = setTimeout(showNextItem, delay);
        }
      }
    };

    // Start immediately
    timeoutId = setTimeout(showNextItem, 100);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [section.content]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative px-8 py-12">
      {/* Pagination - consistent position */}
      <div className="absolute top-6 right-8 z-20 text-gray-400 text-sm">
        {index + 1}/{total}
      </div>

      <div className="w-full flex flex-col items-center">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="text-5xl mb-4">{section.illustration}</div>
          {section.title && (
            <TextType
              text={section.title}
              as="h1"
              className="text-3xl md:text-4xl font-bold text-white text-center"
              showCursor={false}
              typingSpeed={30}
              startOnVisible={true}
            />
          )}
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {section.content?.slice(0, visibleItems).map((item, i) => (
            <div key={i}>
              {item.data && (
                <Feature
                  icon={item.data.icon}
                  title={item.data.title}
                  subtitle={item.data.description}
                  layout="horizontal"
                  borderColor={getBorderColor(i)}
                  borderSpeed={`${3 + i * 0.3}s`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KeypointsLayout;
