'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function BarChart({reports}) {
  const option = {
    title: {
      text: 'Views per Report',
      left: 'center',
      textStyle: {
        fontFamily: 'Outfit',
        fontSize: 18,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
    },
    toolbox: {
      show: true,
      feature: {
        dataView: { show: true, readOnly: false },
        saveAsImage: { show: true },
      },
    },
    xAxis: {
      type: 'category',
      data: reports.map((r) => r.title),
      axisLabel: {
        rotate: 0,
        fontFamily: 'Outfit',
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Views',
        type: 'bar',
        data: reports.map((r) => r.views),
        itemStyle: {
          borderRadius: [10, 10, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#4F46E5' },
            { offset: 1, color: '#A5B4FC' },
          ]),
        },
        emphasis: {
          itemStyle: {
            opacity: 1,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
        },
      },
    ],
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold font-[Outfit]">
          Bar Chart
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ReactECharts option={option} style={{ height: 400 }} />
      </CardContent>
    </Card>
  );
}
