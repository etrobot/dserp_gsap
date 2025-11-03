export type featureContent = {
  type: 'feature';
  data: {
    title?: string;
    description?: string;
    icon?: string;
  };
  read_srt: string;
  duration: number;
  audioFile?: string; // TTS 生成的音频文件名
};

export type ScriptSection = {
  id: string;
  title?: string;
  content?: featureContent[];
  illustration?: string;
  layout?: 'cover' | 'chart' | 'keypoints' | 'flow' | 'multiline-type' | 'floating-lines';
  chartConfig?: any; // ECharts configuration for 'chart' layout
};

export type ScriptSpec = {
  title: string;
  language?: string;
  sections: ScriptSection[];
};

export interface ScriptsIndex {
  files: string[];
}
