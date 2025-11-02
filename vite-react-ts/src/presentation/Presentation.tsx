import { useState, useEffect, type ReactNode } from 'react';
import TextType from '@/components/TextType';
import MultiLineTextType from '@/components/MultiLineTextType';
import FloatingLinesText from '@/components/FloatingLinesText';
import FadeContent from '@/components/FadeContent';
import type { ScriptSection } from '@/content/xlinDataInsghtScript';
import TopNotesChart from '@/components/slide/TopNotesChart';
import TopicDistributionChart from '@/components/slide/TopicDistributionChart';
import CumulativeTrendChart from '@/components/slide/CumulativeTrendChart';
import GenericEChart from '@/components/slide/GenericEChart';
import { Feature } from '@/components/slide';

/**
 * Generic Presentation Component
 * Renders different slide layouts based on the section configuration
 * Supports: cover, chart, keypoints, flow, multiline-type, floating-lines
 */
const Presentation = ({ section, index, total }: { section: ScriptSection; index: number; total: number }) => {
  const layout = section.layout || 'keypoints';
  const [chartData, setChartData] = useState<any>(section.chartData);
  const [loadingChart, setLoadingChart] = useState(false);
  
  // Load chart data from URL if needed
  useEffect(() => {
    if (layout === 'chart' && section.chartDataUrl && !section.chartData) {
      setLoadingChart(true);
      fetch(section.chartDataUrl)
        .then(res => res.json())
        .then(data => {
          setChartData(data);
          setLoadingChart(false);
        })
        .catch(err => {
          console.error('Failed to load chart data:', err);
          setLoadingChart(false);
        });
    }
  }, [layout, section.chartDataUrl, section.chartData]);

  let content: ReactNode;

  // Chart layout - display data visualizations
  if (layout === 'chart') {
    const renderChart = () => {
      if (loadingChart) {
        return <div className="flex items-center justify-center h-full text-white">Loading chart...</div>;
      }
      
      switch (section.chartType) {
        case 'topNotes':
          if (!chartData) return null;
          return <TopNotesChart data={chartData as any} />;
        case 'topicDistribution':
          if (!chartData) return null;
          return <TopicDistributionChart data={chartData as any} />;
        case 'cumulativeTrend':
          if (!chartData) return null;
          return <CumulativeTrendChart data={chartData as any} />;
        case 'echarts':
          const chartConfig = (section as any).chartConfig;
          if (!chartConfig) {
            console.error('No chartConfig found for echarts', section);
            return <div className="flex items-center justify-center h-full text-white">Chart config missing</div>;
          }
          console.log('Rendering echarts with config:', chartConfig);
          return <GenericEChart config={chartConfig} />;
        default:
          return null;
      }
    };

    content = (
      <div className="w-full h-full relative flex flex-col pb-8">
        {/* Header with absolute positioning */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 pt-4 pb-2">
          <div className="flex items-center gap-3">
            {section.title && (
              <TextType
                text={section.title}
                as="h1"
                className="text-2xl md:text-3xl font-bold text-white"
                showCursor={false}
                typingSpeed={30}
                startOnVisible={true}
              />
            )}
          </div>
          <span className="text-gray-400 text-sm">
            {index + 1}/{total} 
          </span>
        </div>

        {/* Chart takes full height with top padding for header */}
        <div className="w-full h-full pt-16 px-4 pb-4">
          {renderChart()}
        </div>
      </div>
    );
  }

  // Cover layout - title page with emoji and subtitle
  else if (layout === 'cover') {
    content = (
      <div className="w-full h-full flex flex-col items-center justify-center relative px-8 pb-8">
        <FadeContent duration={600} fill={false}>
          <div className="text-9xl mb-8">{section.illustration}</div>
        </FadeContent>
        
        {section.title && (
          <FadeContent duration={800} delay={200} fill={false}>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-12 text-center">
              {section.title}
            </h1>
          </FadeContent>
        )}

        <div className="w-full max-w-3xl space-y-4">
          {section.content?.map((item, i) => (
            <div key={i} className="py-2">
              {item.data && (
                <Feature
                  icon={item.data.icon}
                  title={item.data.title}
                  subtitle={item.data.description}
                  layout="vertical"
                  borderColor="#8b5cf6"
                  borderSpeed={`${4 + i}s`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Flow layout - steps/process (emoji on left, content on right)
  else if (layout === 'flow') {
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

    content = (
      <div className="w-full h-full flex items-center relative px-12 pb-8">
        <div className="absolute top-6 right-6 text-gray-500 text-sm">
          {index + 1}/{total} 
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-6xl mx-auto items-start">
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
  }

  // Keypoints layout - key points/bullets list
  else if (layout === 'keypoints') {
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

    content = (
      <div className="w-full h-full flex flex-col relative px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{section.illustration}</span>
            {section.title && (
              <TextType
                text={section.title}
                as="h1"
                className="text-3xl md:text-4xl font-bold text-white"
                showCursor={false}
                typingSpeed={30}
                startOnVisible={true}
              />
            )}
          </div>
          <span className="text-gray-400 text-sm">
            {index + 1}/{total} 
          </span>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 content-center">
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
    );
  }

  // MultiLine Type layout - cycling through lines with type and reverse animation
  else if (layout === 'multiline-type') {
    const lines = section.content?.map(item => item.data?.title || '').filter(Boolean) || [];
    
    content = (
      <div className="w-full h-full flex flex-col items-center justify-center relative px-8 pb-8">
        <div className="absolute top-6 right-6 text-gray-400 text-sm">
          {index + 1}/{total} 
        </div>

        {section.illustration && (
          <FadeContent duration={600} fill={false}>
            <div className="text-9xl mb-8">{section.illustration}</div>
          </FadeContent>
        )}

        <div className="w-full max-w-4xl">
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
  }

  // Floating Lines layout - lines float up continuously and fade out
  else if (layout === 'floating-lines') {
    const lines = section.content?.map(item => item.data?.title || '').filter(Boolean) || [];
    const durations = section.content?.map(item => item.duration) || [];
    
    content = (
      <div className="w-full h-full flex flex-col items-center justify-center relative px-8 pt-8 pb-8">
        <div className="absolute top-6 right-6 text-gray-400 text-sm">
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
            <div className="text-8xl mb-12">{section.illustration}</div>
          </FadeContent>
        )}

        <div className="relative w-full max-w-6xl flex-1 flex items-center justify-center min-h-0">
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
  }



  return (
    <div className="relative w-full h-full">
      {content}
    </div>
  );
};

export default Presentation;
