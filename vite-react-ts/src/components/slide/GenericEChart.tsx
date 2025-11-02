import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import FadeContent from '../FadeContent';

interface GenericEChartProps {
  config: any;
  freeze?: boolean;
  className?: string;
}

const GenericEChart: React.FC<GenericEChartProps> = ({ 
  config, 
  freeze = false,
  className = ''
}) => {
  if (!config) {
    console.error('GenericEChart: config is undefined');
    return <div className="text-white">Chart config is missing</div>;
  }

  // Merge user config with default dark theme styles
  const mergedConfig = useMemo(() => {
    const defaultStyles = {
      backgroundColor: 'transparent',
      textStyle: {
        fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
        color: '#fff'
      },
      tooltip: {
        trigger: config.series?.[0]?.type === 'pie' ? 'item' : 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#666',
        textStyle: {
          color: '#fff'
        }
      },
      legend: {
        textStyle: {
          color: '#fff'
        },
        bottom: 20
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      }
    };

    // Deep merge function
    const merge = (target: any, source: any): any => {
      const result = { ...target };
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = merge(target[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
      return result;
    };

    const merged = merge(defaultStyles, config);

    // Apply dark theme styles to axes if they exist
    if (merged.xAxis) {
      merged.xAxis = {
        ...merged.xAxis,
        axisLabel: {
          ...merged.xAxis.axisLabel,
          color: '#fff'
        },
        axisLine: {
          lineStyle: { color: '#666' }
        }
      };
    }

    if (merged.yAxis) {
      const applyYAxisStyles = (axis: any) => ({
        ...axis,
        nameTextStyle: {
          color: '#fff'
        },
        axisLabel: {
          ...axis.axisLabel,
          color: '#fff'
        },
        axisLine: {
          lineStyle: { color: '#666' }
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#444'
          }
        }
      });

      if (Array.isArray(merged.yAxis)) {
        merged.yAxis = merged.yAxis.map(applyYAxisStyles);
      } else {
        merged.yAxis = applyYAxisStyles(merged.yAxis);
      }
    }

    // Apply styles to series
    if (merged.series) {
      merged.series = merged.series.map((s: any) => ({
        ...s,
        label: {
          show: true,
          color: '#fff',
          ...s.label
        }
      }));
    }

    return merged;
  }, [config]);

  return (
    <FadeContent duration={800} delay={300} freeze={freeze}>
      <div style={{ width: '100%', height: '100%', minHeight: '400px' }}>
        <ReactECharts 
          option={mergedConfig} 
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          className={className}
        />
      </div>
    </FadeContent>
  );
};

export default GenericEChart;
