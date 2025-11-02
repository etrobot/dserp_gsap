import type { TopNotesData } from '@/components/slide/TopNotesChart';
import type { TopicDistributionData } from '@/components/slide/TopicDistributionChart';
import type { CumulativeTrendData } from '@/components/slide/CumulativeTrendChart';

export type featureContent = {
  type: 'feature';
  data: {
    title?: string;
    description?: string;
    icon?: string;
  };
  read_srt: string;
  duration: number;
};

export type ScriptSection = {
  id: string;
  title?: string;
  content?: featureContent[]; // feature objects with title, description, icon, read_srt (for narration), duration
  illustration?: string;
  layout?: 'cover' | 'chart' | 'keypoints' | 'flow' | 'multiline-type' | 'floating-lines';
  chartType?: 'topNotes' | 'topicDistribution' | 'cumulativeTrend' | 'echarts';
  chartData?: TopNotesData[] | TopicDistributionData[] | CumulativeTrendData[];
  chartDataUrl?: string; // URL to fetch chart data from
  chartConfig?: any; // For generic ECharts configuration
};

export type ScriptSpec = {
  title: string;
  language?: string; // 默认语言代码，如 'zh-CN', 'en-US'
  languages?: string[]; // 支持的语言列表，用于批量录制
  sections: ScriptSection[];
};

// TypeScript type definitions for presentation scripts
// The actual data should be stored in JSON files under /public/scripts/
// Example: /public/scripts/xiaLinScript.json, /public/scripts/memeCoinScript.json
