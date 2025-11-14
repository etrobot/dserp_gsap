export type featureContent = {
  type: 'feature';
  data: {
    title?: string;
    description?: string;
    icon?: string;
  };
  read_srt: string;
  showtime?: number; // 每个动画项的显示时间（秒）
  duration?: number; // 别名，与 showtime 相同含义（向后兼容）
  audioFile?: string; // TTS 生成的音频文件名
};

export type ScriptSection = {
  // id 可选（如果使用 HTML 文件名作为内容，则可不需要 id）
  id?: string;
  title?: string;
  // 每个 section 一个 read_srt
  read_srt?: string;
  // content 现在既可以是布局数据数组，也可以是一个 HTML 文件名字符串
  content?: string | featureContent[];
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
