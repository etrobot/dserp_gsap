import type { TopNotesData } from '@/components/slide/TopNotesChart';
import type { TopicDistributionData } from '@/components/slide/TopicDistributionChart';
import type { CumulativeTrendData } from '@/components/slide/CumulativeTrendChart';

export type ScriptSection = {
  id: string;
  title?: string;
  content_parts?: string[];
  illustration?: string;
  layout?: 'cover' | 'chart' | 'keypoints' | 'flow' | 'multiline-type' | 'floating-lines';
  scripts?: string[]; // Array of narration scripts in reading order, can include empty strings
  chartType?: 'topNotes' | 'topicDistribution' | 'cumulativeTrend';
  chartData?: TopNotesData[] | TopicDistributionData[] | CumulativeTrendData[];
};

export type ScriptSpec = {
  title: string;
  sections: ScriptSection[];
};

import { topNotesData, topicDistributionData, cumulativeTrendData } from './xlinchartData';

export const xiaLinScript: ScriptSpec = {
  title: "小lin说点赞数据分析报告",
  sections: [
    {
      id: "cover",
      title: "小lin说点赞数据分析报告",
      illustration: "📊💡🚀",
      layout: "cover",
      content_parts: [
        "数据驱动的内容分析与策略建议",
        "📈 数据分析 • 💰 财经内容 • 🎯 策略建议"
      ],
      scripts: [
        "大家好，今天给大家带来的是小林说账号的点赞数据分析报告。",
        "我们将从数据的角度，为大家分析这个账号的内容策略。",
        "让我们一起开始吧。"
      ]
    },
    {
      id: "summary",
      illustration: "📊",
      layout: "multiline-type",
      content_parts: [
        "本报告基于82条笔记的点赞数据进行全面分析",
        "总点赞量达1,248,091，覆盖137个不同话题",
        "财经类内容最受欢迎，少数高赞笔记贡献了大部分点赞量"
      ],
      scripts: [
        "大家好，今天我们来看看小林说账号的点赞数据分析报告。",
        "这次分析基于82条笔记，总点赞量超过124万，覆盖了137个不同话题。",
        "从数据来看，财经类内容最受欢迎，而且有个很有意思的现象，就是少数几篇高赞笔记贡献了大部分的点赞量。"
      ]
    },
    {
      id: "key_findings",
      title: "关键发现",
      illustration: "🔍",
      layout: "keypoints",
      content_parts: [
        "总笔记数量：82条",
        "总点赞量：1,248,091",
        "平均每条点赞量：约15,221",
        "Top 10笔记贡献：30.37%的总点赞量",
        "最热话题：财经视频创作人出道计划（345,000点赞）",
        "长尾效应：前20%笔记贡献超60%点赞量"
      ],
      scripts: [
        "先来看几个关键数据。",
        "总共82条笔记，获得了124万8千多个点赞，平均每条笔记大约有1万5千个赞。",
        "",
        "但是这里面有个很明显的二八定律，前10名的笔记就贡献了30%的点赞量。",
        "最热门的话题是财经视频创作人出道计划，单个话题就有34万5千个赞。",
        "而且前20%的笔记贡献了超过60%的点赞量，这就是典型的长尾效应。"
      ]
    },
    {
      id: "top_notes",
      title: "热门笔记分析",
      illustration: "🔥",
      layout: "chart",
      chartType: "topNotes",
      chartData: topNotesData,
      scripts: [
        "再来看看最火的几篇笔记。",
        "第一名是关于美国大选，特朗普对阵哈里斯的经济政策分析，拿到了7万2千个赞。",
        "第二名是一口气了解洗钱，5万6千个赞。",
        "第三名是中国经济2025的小结，4万个赞。",
        "可以看出来，政治和金融类的话题特别受关注，尤其是时事热点，能够快速吸引大量互动。"
      ]
    },
    {
      id: "topic_distribution",
      title: "话题点赞量分布",
      illustration: "🎯",
      layout: "chart",
      chartType: "topicDistribution",
      chartData: topicDistributionData,
      scripts: [
        "从话题分布来看，财经视频创作人出道计划是最热门的话题，拿到了34万5千个赞，占了总点赞量的27%多。",
        "第二名是花60天学理财，19万多个赞。",
        "第三名是财经知识，13万多个赞。",
        "前5个财经话题加起来就超过了70%的点赞量。",
        "这说明账号的内容定位非常清晰，受众对财经类内容的兴趣特别浓厚。"
      ]
    },
    {
      id: "trend_analysis",
      title: "点赞量累积趋势",
      illustration: "📈",
      layout: "chart",
      chartType: "cumulativeTrend",
      chartData: cumulativeTrendData,
      scripts: [
        "接下来看点赞量的累积趋势，这是个很典型的长尾分布。",
        "前10篇笔记贡献了30%的点赞量，前20篇笔记贡献了将近47%，前40篇笔记就贡献了69%。",
        "这说明什么呢？",
        "就是少数几篇高赞笔记才是点赞量的主要来源，大部分笔记其实点赞量相对比较低。"
      ]
    },
    {
      id: "conclusion_1",
      title: "核心结论（一）",
      illustration: "💡",
      layout: "floating-lines",
      content_parts: [
        "账号内容以财经类为主，定位明确",
        "受众对财经内容有较高的兴趣和关注度",
        "点赞量分布不均，呈现典型的长尾效应",
        "热门话题集中在财经领域的多个细分方向"
      ],
      scripts: [
        "根据数据分析，我们可以得出几个核心结论。",
        "首先，这个账号的内容定位非常明确，就是做财经类的内容。",
        "受众对财经内容的兴趣和关注度都很高。",
        "点赞量分布不均匀，就是我们刚才说的长尾效应。",
        "而且热门话题都集中在财经领域的多个细分方向，比如理财教育、经济政策、金融知识等等。"
      ]
    },
    {
      id: "conclusion_2",
      title: "核心结论（二）",
      illustration: "🎓",
      layout: "floating-lines",
      content_parts: [
        "政治和金融类话题在特定时期能获得极高关注",
        "如美国大选相关内容成为点赞量冠军",
        "时效性热点话题是流量突破的关键",
        "内容质量与话题选择同样重要"
      ],
      scripts: [
        "第二个结论是关于热点话题的。",
        "政治和金融类的话题，在特定时期能获得特别高的关注。",
        "比如说美国大选相关的内容就成了点赞量冠军。",
        "这说明时效性的热点话题是流量突破的关键。",
        "当然了，内容质量和话题选择同样重要，不是说随便追个热点就能火。"
      ]
    },
    {
      id: "strategy_content",
      title: "内容策略建议",
      illustration: "✍️",
      layout: "keypoints",
      content_parts: [
        "深耕财经领域：继续专注热门话题如'财经视频创作人出道计划'",
        "关注热点：适当追踪政治和金融类的时事热点",
        "话题组合：尝试将多个热门话题结合，提高覆盖度",
        "系列内容：如'花60天学理财'系列获得持续关注"
      ],
      scripts: [
        "基于这些结论，我给出几个内容策略建议。",
        "第一，继续深耕财经领域，专注那些已经被验证的热门话题，像财经视频创作人出道计划这种。",
        "第二，要关注热点，适当追踪政治和金融类的时事热点。",
        "第三，可以尝试话题组合，把多个热门话题结合起来，提高覆盖面。",
        "第四，做系列内容，像花60天学理财这种系列能获得持续关注。"
      ]
    },
    {
      id: "strategy_quality",
      title: "质量提升策略",
      illustration: "⭐",
      layout: "flow",
      content_parts: [
        "重点打造前20%的高质量内容",
        "这些内容贡献了超过60%的点赞量",
        "提升选题质量，关注用户真实需求",
        "优化内容呈现方式，提高信息密度和可读性"
      ],
      scripts: [
        "关于质量提升，我的建议是重点打造前20%的高质量内容。",
        "因为数据显示，这部分内容贡献了超过60%的点赞量。",
        "要提升选题质量，真正关注用户的需求，而不是自己想写什么就写什么。",
        "同时要优化内容的呈现方式，提高信息密度和可读性，让用户能快速获取有价值的信息。"
      ]
    },
    {
      id: "strategy_interaction",
      title: "互动策略建议",
      illustration: "💬",
      layout: "keypoints",
      content_parts: [
        "针对高赞笔记加强与受众的互动",
        "积极回复评论，建立社区氛围",
        "发起话题讨论，鼓励用户参与",
        "利用互动数据优化内容方向",
        "建立粉丝粘性，提高内容传播效果"
      ],
      scripts: [
        "互动策略也很重要。",
        "要针对那些高赞笔记加强与受众的互动，积极回复评论，建立良好的社区氛围。",
        "可以主动发起话题讨论，鼓励用户参与进来。",
        "同时要利用互动数据来优化内容方向，看看用户对什么话题更感兴趣。",
        "",
        "这样能建立粉丝粘性，提高内容的传播效果。"
      ]
    },
    {
      id: "action_plan",
      title: "行动计划",
      illustration: "🚀",
      layout: "flow",
      content_parts: [
        "短期：紧跟财经热点，快速产出相关内容",
        "中期：建立内容系列，培养用户观看习惯",
        "长期：打造个人IP，建立专业影响力"
      ],
      scripts: [
        "最后说说行动计划。",
        "短期来说，要紧跟财经热点，快速产出相关内容，抓住流量红利。",
        "中期要建立内容系列，培养用户的观看习惯，让他们定期来看你的内容。",
        "长期目标是打造个人品牌，建立专业影响力，成为财经领域的知名博主。"
      ]
    },
    {
      id: "final_summary",
      title: "总结",
      illustration: "🎯",
      layout: "keypoints",
      content_parts: [
        "数据显示：财经类内容具有巨大潜力",
        "策略方向：深耕垂直领域 + 追踪热点",
        "执行重点：质量优先 + 互动为王",
        "通过以上策略，有望进一步提高账号影响力和受众粘性"
      ],
      scripts: [
        "好了，我们来总结一下。",
        "数据显示，财经类内容具有巨大的潜力，市场需求很旺盛。",
        "策略方向就是深耕垂直领域加上追踪热点。",
        "执行重点是质量优先和互动为王。",
        "通过这些策略，相信能够进一步提高账号的影响力和受众粘性。",
        "感谢大家观看，我们下次见！"
      ]
    }
  ]
};
