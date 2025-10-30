import type { ReactNode } from 'react';
import TextType from '@/components/TextType';
import StarBorder from '@/components/StarBorder';
import FadeContent from '@/components/FadeContent';
import type { ScriptSection } from '@/content/xlinDataInsghtScript';
import TopNotesChart from '@/components/slide/TopNotesChart';
import TopicDistributionChart from '@/components/slide/TopicDistributionChart';
import CumulativeTrendChart from '@/components/slide/CumulativeTrendChart';
import Squares from '@/components/background/squares';
import { CheckCircle2, Star, Zap, TrendingUp } from 'lucide-react';

const Presentation = ({ section, index, total }: { section: ScriptSection; index: number; total: number }) => {
  const layout = section.layout || 'keypoints';
  let content: ReactNode;

  // Chart layout - display data visualizations
  if (layout === 'chart') {
    const renderChart = () => {
      if (!section.chartData) return null;
      
      switch (section.chartType) {
        case 'topNotes':
          return <TopNotesChart data={section.chartData as any} />;
        case 'topicDistribution':
          return <TopicDistributionChart data={section.chartData as any} />;
        case 'cumulativeTrend':
          return <CumulativeTrendChart data={section.chartData as any} />;
        default:
          return null;
      }
    };

    content = (
      <div className="w-full h-full relative flex flex-col pb-8">
        {/* Header with absolute positioning */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <TextType
              text={section.title}
              as="h1"
              className="text-2xl md:text-3xl font-bold text-white"
              showCursor={false}
              typingSpeed={30}
              startOnVisible={true}
            />
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
        
        <FadeContent duration={800} delay={200} fill={false}>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-12 text-center">
            {section.title}
          </h1>
        </FadeContent>

        <div className="w-full max-w-3xl space-y-4">
          {section.content_parts.map((line, i) => (
            <FadeContent key={i} duration={600} delay={400 + i * 100} fill={false}>
              <p className="text-white text-lg md:text-xl leading-relaxed text-center">
                {line}
              </p>
            </FadeContent>
          ))}
        </div>
      </div>
    );
  }

  // Flow layout - steps/process (emoji on left, content on right)
  else if (layout === 'flow') {
    content = (
      <div className="w-full h-full flex items-center relative px-12 pb-8">
        <div className="absolute top-6 right-6 text-gray-500 text-sm">
          {index + 1}/{total} 
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-6xl mx-auto items-center">
          <FadeContent duration={600}>
            <div className="flex flex-col items-center justify-center">
              <div className="text-9xl mb-6">{section.illustration}</div>
              <h1 className="text-4xl md:text-5xl font-black text-white text-center">
                {section.title}
              </h1>
            </div>
          </FadeContent>

          <div className="space-y-5">
            {section.content_parts.map((line, i) => (
              <FadeContent key={i} duration={600} delay={300 + i * 120} fill={false}>
                <StarBorder as="div" color="#8b5cf6" speed={`${4 + i}s`} thickness={1}>
                  <div className="px-6 py-4">
                    <p className="text-white text-lg leading-relaxed">{line}</p>
                  </div>
                </StarBorder>
              </FadeContent>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Keypoints layout - key points/bullets list
  else if (layout === 'keypoints') {
    const getIcon = (index: number) => {
      const icons = [CheckCircle2, Star, Zap, TrendingUp];
      const Icon = icons[index % icons.length];
      return <Icon className="w-6 h-6 flex-shrink-0" />;
    };

    const getIconColor = (index: number) => {
      return index % 3 === 0 ? 'text-emerald-400' : index % 3 === 1 ? 'text-blue-400' : 'text-pink-400';
    };

    content = (
      <div className="w-full h-full flex flex-col relative px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{section.illustration}</span>
            <TextType
              text={section.title}
              as="h1"
              className="text-3xl md:text-4xl font-bold text-white"
              showCursor={false}
              typingSpeed={30}
              startOnVisible={true}
            />
          </div>
          <span className="text-gray-400 text-sm">
            {index + 1}/{total} 
          </span>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 content-center">
          {section.content_parts.map((line, i) => (
            <FadeContent key={i} duration={500} delay={100 + i * 80} fill={false}>
              <StarBorder 
                as="div" 
                color={i % 3 === 0 ? "#10b981" : i % 3 === 1 ? "#3b82f6" : "#ec4899"} 
                speed={`${3 + i * 0.3}s`} 
                thickness={1}
              >
                <div className="h-full flex items-center gap-4 px-6 py-4">
                  <div className={getIconColor(i)}>
                    {getIcon(i)}
                  </div>
                  <p className="text-white text-base md:text-lg leading-relaxed">{line}</p>
                </div>
              </StarBorder>
            </FadeContent>
          ))}
        </div>
      </div>
    );
  }



  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <div className="absolute inset-0 overflow-hidden opacity-50">
        <Squares />
      </div>
      <div className="relative z-10 w-full h-full">
        {content}
      </div>
    </div>
  );
};

export default Presentation;
