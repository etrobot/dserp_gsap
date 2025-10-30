import React from 'react';
import ReactECharts from 'echarts-for-react';
import FadeContent from '../FadeContent';

export interface TopicDistributionData {
  name: string;
  value: number;
  color?: string;
}

interface TopicDistributionChartProps {
  data: TopicDistributionData[];
  title?: string;
  freeze?: boolean;
  className?: string;
}

const TopicDistributionChart: React.FC<TopicDistributionChartProps> = ({ 
  data, 
  title = '话题点赞量分布Top 10',
  freeze = false, 
}) => {
  const defaultColors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#5470c6'];

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
      trigger: 'item',
      formatter: '{b}: {c} 点赞 ({d}%)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#777',
      textStyle: {
        color: '#fff'
      }
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: {
        color: '#fff',
        fontSize: 11
      },
      data: data.map(item => item.name)
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: 'rgba(0, 0, 0, 0.5)',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}: {d}%',
          color: '#fff',
          fontSize: 11
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true,
          lineStyle: {
            color: '#555'
          }
        },
        data: data.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: item.color || defaultColors[index % defaultColors.length]
          }
        }))
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

export default TopicDistributionChart;
