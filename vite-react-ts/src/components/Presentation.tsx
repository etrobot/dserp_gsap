import type { ScriptSection } from '@/types/scriptTypes';
import { useEffect, useState } from 'react';

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
 *       "layout": "two_cols",            // [可选] 布局类型，默认 "two_cols"
 *                                         // 可选值: cover | chart | two_cols | one_col | multiline-type | floating-lines
 *       "duration": 10,                   // [可选] 整个页面的显示时长（秒），用于自动播放时的页面切换
 * 
 *       "chartConfig": {                  // [条件可选] layout="chart" 时使用，ECharts 内联配置对象
 *         // 注意: 不要设置 backgroundColor 和 textStyle，使用播放器的深色主题
 *         "xAxis": { "type": "category", "data": [...] },
 *         "yAxis": [{ "type": "value", "name": "..." }],
 *         "series": [{ 
 *           "name": "...", 
 *           "type": "bar|line|pie|scatter|...",  // ECharts 支持的图表类型
 *           "data": [...] 
 *         }],
 *         // ❌ 不推荐设置:
 *         // "backgroundColor": "#ffffff",  // 与深色主题冲突
 *         // "textStyle": { "color": "#000" }  // 与深色主题冲突
 *       },
 * 
 *       "chartPath": "/chart/脚本名/chartFileName.json",  // [条件可选] layout="chart" 时使用，外部 ECharts 配置文件路径
 *                                         // 相对于 public/ 目录，优先级高于 chartConfig
 * 
 *       "content": [                      // [必填] 内容数组，每个元素代表一个动画片段
 *         {
 *           "data": {                     // [可选] 布局特定的数据对象，根据 layout 不同而不同
 *             "title": "内容标题",        // two_cols/one_col: 标题文本
 *             "description": "内容描述",  // two_cols/one_col: 描述文本
 *             "icon": "🎯"                // two_cols/one_col: 图标
 *           },
 *           "read_srt": "语音朗读文本",   // [可选] TTS 语音朗读的文本内容
 *           "showtime": 3                 // [可选] 该动画项的显示时间（秒），用于控制动画时长
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
 *   - chartPath: [可选] 外部 ECharts 配置文件路径（推荐用于大型配置）
 *   - chartConfig: [可选] 内联 ECharts 配置对象（作为 chartPath 的备选方案）
 *   - data: 不需要
 * 
 * - two_cols: 双列展示，偶数项首选
 *   - data.title: [必填] 要点标题
 *   - data.description: [可选] 要点描述
 *   - data.icon: [可选] 要点图标
 * 
 * - one_col: 瀑布流展示，奇数项首选
 *   - data.title: [必填] 步骤标题
 *   - data.description: [可选] 步骤描述
 *   - data.icon: [可选] 步骤图标
 * 
 * - multiline-type: 多行逐行打字机效果，适合短语
 *   - data.title: [必填] 要显示的文字内容
 * 
 * - floating-lines: 浮动文字效果，适合短句
 *   - data.title: [必填] 要显示的文字内容
 */
const Presentation = ({ section, index, total, scriptName }: { section: ScriptSection; index: number; total: number; scriptName?: string }) => {
  // Only handle HTML content rendering for now; ignore other layouts and fields
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [htmlTried, setHtmlTried] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadHtml() {
      if (!scriptName) {
        setHtmlTried(true);
        return;
      }
      const htmlFile = typeof section.content === 'string' && section.content.endsWith('.html')
        ? section.content
        : section.id ? `${section.id}.html` : '';
      if (!htmlFile) {
        setHtmlTried(true);
        return;
      }
      try {
        const url = `/scripts/${scriptName}/${htmlFile}`;
        console.log('[Presentation] Fetching HTML:', url);
        const res = await fetch(url);
        if (!cancelled) {
          if (res.ok) {
            const text = await res.text();
            setHtmlContent(text);
          } else {
            console.warn('[Presentation] Failed to load HTML:', res.status, url);
          }
          setHtmlTried(true);
        }
      } catch (e) {
        console.error('[Presentation] Error loading HTML:', e);
        if (!cancelled) setHtmlTried(true);
      }
    }
    loadHtml();
    return () => { cancelled = true };
  }, [scriptName, section.id, section.content]);

  if (htmlTried && htmlContent) {
    return (
      <div className="relative w-full h-full overflow-auto">
        <div className="html-section-container mx-auto max-w-5xl p-8">
          <div className="html-section-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      </div>
    );
  }

  // Fallback when no HTML is available: render an empty container
  return (
    <div className="relative w-full h-full" />
  );
};

export default Presentation;
