import React from 'react';
import ReactECharts from 'echarts-for-react';
import FadeContent from '../FadeContent';

export interface CumulativeTrendData {
  rank: number;
  singleLikes: number;
  cumulativeLikes: number;
  cumulativePercent: number;
}

interface CumulativeTrendChartProps {
  data: CumulativeTrendData[];
  title?: string;
  freeze?: boolean;
}

const CumulativeTrendChart: React.FC<CumulativeTrendChartProps> = ({ 
  data, 
  title = '点赞量累积趋势',
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
        type: 'cross'
      },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#777',
      textStyle: {
        color: '#fff'
      }
    },
    legend: {
      data: ['单篇点赞', '累积点赞', '累积占比'],
      bottom: 10,
      textStyle: {
        color: '#fff'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      name: '笔记排名',
      nameTextStyle: {
        color: '#aaa'
      },
      data: data.map(item => item.rank),
      axisLabel: {
        interval: Math.floor(data.length / 10),
        color: '#aaa'
      },
      axisLine: {
        lineStyle: {
          color: '#555'
        }
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '点赞量',
        position: 'left',
        nameTextStyle: {
          color: '#aaa'
        },
        axisLabel: {
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
      {
        type: 'value',
        name: '累积占比(%)',
        position: 'right',
        nameTextStyle: {
          color: '#aaa'
        },
        axisLabel: {
          formatter: '{value}%',
          color: '#aaa'
        },
        axisLine: {
          lineStyle: {
            color: '#555'
          }
        },
        max: 100,
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: '单篇点赞',
        type: 'bar',
        data: data.map(item => item.singleLikes),
        itemStyle: {
          color: '#5470c6'
        }
      },
      {
        name: '累积点赞',
        type: 'line',
        yAxisIndex: 0,
        data: data.map(item => item.cumulativeLikes),
        lineStyle: {
          width: 3,
          color: '#91cc75'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(145, 204, 117, 0.5)'
              },
              {
                offset: 1,
                color: 'rgba(145, 204, 117, 0)'
              }
            ]
          }
        }
      },
      {
        name: '累积占比',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(item => item.cumulativePercent),
        lineStyle: {
          width: 3,
          type: 'dashed',
          color: '#ee6666'
        },
        itemStyle: {
          color: '#ee6666'
        }
      }
    ],
    color: ['#5470c6', '#91cc75', '#ee6666']
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

export default CumulativeTrendChart;
