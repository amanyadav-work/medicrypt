'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { reports } from '@/app/data/reportdata';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function PieChart() {
  const typeCounts = reports.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});

  // ✅ Define gradient colors FIRST
  const gradientColors = [
    ['#3B82F6', '#60A5FA'], // Blue
    ['#10B981', '#34D399'], // Green
    ['#F59E0B', '#FBBF24'], // Amber
    ['#EF4444', '#F87171'], // Red
    ['#8B5CF6', '#A78BFA'], // Violet
    ['#EC4899', '#F472B6'], // Pink
  ];

  const option = {
    title: {
      text: 'Report Type Distribution',
      left: 'center',
      top: 10,
      textStyle: {
        fontFamily: 'Outfit',
        fontWeight: 'bold',
        fontSize: 18,
        color: '#333',
      },
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      bottom: '0%',
      left: 'center',
      textStyle: {
        fontFamily: 'Outfit',
        fontSize: 14,
      },
    },
    series: [
      {
        name: 'Type',
        type: 'pie',
        radius: ['45%', '70%'], // Donut style
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            fontFamily: 'Outfit',
          },
        },
        labelLine: {
          show: false,
        },
        data: Object.entries(typeCounts).map(([type, count], index) => ({
          name: type,
          value: count,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: gradientColors[index % gradientColors.length][0],
                },
                {
                  offset: 1,
                  color: gradientColors[index % gradientColors.length][1],
                },
              ],
            },
          },
        })),
      },
    ],
  };

  return (
    <Card className="w-full shadow-xl bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white">
      <CardHeader>
        <CardTitle className="text-lg font-bold font-[Outfit]">
          Report Type Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ReactECharts
          option={option}
          style={{ height: 400 }}
          notMerge={true}
          lazyUpdate={true}
        />
      </CardContent>
    </Card>
  );
}