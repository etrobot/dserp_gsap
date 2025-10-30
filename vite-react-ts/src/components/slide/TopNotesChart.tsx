import React from 'react';
import ReactECharts from 'echarts-for-react';
import FadeContent from '../FadeContent';

export interface TopNotesData {
  title: string;
  likes: number;
}

interface TopNotesChartProps {
  data: TopNotesData[];
  title?: string;
  freeze?: boolean;
  className?: string;
}

const TopNotesChart: React.FC<TopNotesChartProps> = ({ 
  data, 
  title = '热门笔记点赞量Top 10',
  freeze = false, 
}) => {
  const option = {
    backgroundColor: 'transparent',
    textStyle: {
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#fff'
    },
    title: {
      text: title,
      left: 'center',
      top: 20,
      textStyle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c}w 点赞',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#777',
      textStyle: {
        color: '#fff'
      }
    },
    grid: {
      left: '12%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}w',
        color: '#aaa'
      },
      axisLine: {
        lineStyle: {
          color: '#555'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#333'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.title),
      inverse: true,
      axisLabel: {
        interval: 0,
        fontSize: 12,
        color: '#fff'
      },
      axisLine: {
        lineStyle: {
          color: '#555'
        }
      }
    },
    series: [
      {
        type: 'bar',
        data: data.map(item => ({
          value: item.likes / 10000, // Convert to 万
          itemStyle: {
            color: '#5470c6'
          }
        })),
        label: {
          show: true,
          position: 'right',
          formatter: '{c}w',
          color: '#fff'
        },
        barWidth: '60%'
      }
    ]
  };

  return (
    <FadeContent duration={800} delay={300} freeze={freeze}>
      <ReactECharts 
        option={option} 
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </FadeContent>
  );
};

export default TopNotesChart;
