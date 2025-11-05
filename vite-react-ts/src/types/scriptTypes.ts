export type featureContent = {
  type: 'feature';
  data: {
    title?: string;
    description?: string;
    icon?: string;
  };
  read_srt: string;
  showtime?: number; // 每个动画项的显示时间（秒）
  audioFile?: string; // TTS 生成的音频文件名
};

export type ScriptSection = {
  id: string;
  title?: string;
  content?: featureContent[];
  illustration?: string;
  layout?: 'cover' | 'chart' | 'two_cols' | 'one_col' | 'multiline-type' | 'floating-lines';
  chartConfig?: any; // ECharts configuration for 'chart' layout (inline)
  chartPath?: string; // Path to external ECharts configuration file in public/chart/{scriptName}/
  duration?: number; // 整个页面的显示时长（秒），用于控制页面切换
};

export type ScriptSpec = {
  title: string;
  language?: string;
  sections: ScriptSection[];
};

export interface ScriptsIndex {
  files: string[];
}
