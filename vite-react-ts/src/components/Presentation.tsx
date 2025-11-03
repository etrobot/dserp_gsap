import type { ScriptSection } from '@/types/scriptTypes';
import {
  CoverLayout,
  ChartLayout,
  FlowLayout,
  KeypointsLayout,
  MultilineTypeLayout,
  FloatingLinesLayout,
} from '@/components/layout';

/**
 * Generic Presentation Component
 * Renders different slide layouts based on the section configuration
 * 
 * JSON Script Configuration Reference:
 * {
 *   "title": "演示文稿标题",              // [必填] 演示文稿总标题
 *   "language": "zh-CN",                  // [必填] 朗读语言，默认 "zh-CN"
 *   "sections": [                         // [必填] 章节数组
 *     {
 *       "id": "unique_section_id",        // [必填] 章节唯一标识符
 *       "title": "章节标题",              // [必填] 章节标题
 *       "illustration": "📊",             // [可选] 章节插图或表情符号
 *       "layout": "keypoints",            // [可选] 布局类型，默认 "keypoints"
 *                                         // 可选值: cover | chart | keypoints | flow | multiline-type | floating-lines
 * 
 *       "chartConfig": {                  // [条件必填] 仅 layout="chart" 时必填，ECharts 配置对象
 *         "xAxis": { "type": "category", "data": [...] },
 *         "yAxis": [{ "type": "value", "name": "..." }],
 *         "series": [{ 
 *           "name": "...", 
 *           "type": "bar|line|pie|scatter|...",  // ECharts 支持的图表类型
 *           "data": [...] 
 *         }]
 *       },
 * 
 *       "content": [                      // [必填] 内容数组，每个元素代表一个动画片段
 *         {
 *           "data": {                     // [可选] 布局特定的数据对象，根据 layout 不同而不同
 *             "title": "内容标题",        // keypoints/flow: 标题文本
 *             "description": "内容描述",  // keypoints/flow: 描述文本
 *             "icon": "🎯"                // keypoints/flow: 图标
 *           },
 *           "read_srt": "语音朗读文本",   // [可选] TTS 语音朗读的文本内容
 *           "duration": 3                 // [可选] 动画持续时间（秒），默认根据 read_srt 长度计算
 *         }
 *       ]
 *     }
 *   ]
 * }
 * 
 * Supported Layouts (布局类型说明):
 * - cover: 封面页，显示标题和插图
 *   - data: 不需要
 * 
 * - chart: 图表页，支持 ECharts 配置（柱状图、折线图、饼图等）
 *   - chartConfig: [必填] ECharts 配置对象
 *   - data: 不需要
 * 
 * - keypoints: 关键点列表，显示带图标的要点卡片
 *   - data.title: [必填] 要点标题
 *   - data.description: [可选] 要点描述
 *   - data.icon: [可选] 要点图标
 * 
 * - flow: 流程图，展示步骤流程
 *   - data.title: [必填] 步骤标题
 *   - data.description: [可选] 步骤描述
 *   - data.icon: [可选] 步骤图标
 * 
 * - multiline-type: 多行文字打字机效果
 *   - data.title: [必填] 要显示的文字内容
 * 
 * - floating-lines: 浮动文字效果
 *   - data.title: [必填] 要显示的文字内容
 */
const Presentation = ({ section, index, total }: { section: ScriptSection; index: number; total: number }) => {
  const layout = section.layout || 'keypoints';

  let content;

  switch (layout) {
    case 'chart':
      content = <ChartLayout section={section} index={index} total={total} />;
      break;
    case 'cover':
      content = <CoverLayout section={section} />;
      break;
    case 'flow':
      content = <FlowLayout section={section} index={index} total={total} />;
      break;
    case 'keypoints':
      content = <KeypointsLayout section={section} index={index} total={total} />;
      break;
    case 'multiline-type':
      content = <MultilineTypeLayout section={section} index={index} total={total} />;
      break;
    case 'floating-lines':
      content = <FloatingLinesLayout section={section} index={index} total={total} />;
      break;
    default:
      content = <KeypointsLayout section={section} index={index} total={total} />;
  }

  return (
    <div className="relative w-full h-full">
      {content}
    </div>
  );
};

export default Presentation;
