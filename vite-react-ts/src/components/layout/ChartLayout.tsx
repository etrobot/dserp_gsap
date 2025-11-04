import TextType from '@/components/TextType';
import Chart from '@/components/slide/Chart';
import type { ScriptSection } from '@/types/scriptTypes';
import { useChartConfig } from '@/hooks/useChartConfig';

interface ChartLayoutProps {
  section: ScriptSection;
  index: number;
  total: number;
}

const ChartLayout = ({ section, index, total }: ChartLayoutProps) => {
  const { config: chartConfig, loading: chartLoading, error: chartError } = useChartConfig(
    section.chartPath,
    section.chartConfig
  );
  
  if (!chartConfig && !chartLoading) {
    console.error('No chartConfig found for chart section', section);
  }

  return (
    <div className="w-full h-full relative flex flex-col pb-8">
      {/* Pagination - consistent position */}
      <div className="absolute top-6 right-8 z-20 text-gray-400 text-sm">
        {index + 1}/{total}
      </div>

      {/* Header with absolute positioning */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-start px-8 pt-4 pb-2">
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
      </div>

      {/* Chart takes full height with top padding for header */}
      <div className="w-full h-full pt-16 px-4 pb-4">
        {chartLoading ? (
          <div className="flex items-center justify-center h-full text-white">
            Loading chart...
          </div>
        ) : chartError ? (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <p>Error loading chart</p>
              <p className="text-sm text-gray-400 mt-2">{chartError.message}</p>
            </div>
          </div>
        ) : chartConfig ? (
          <Chart config={chartConfig} />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            Chart config missing
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartLayout;
