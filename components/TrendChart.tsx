import { TrendPoint } from 'contexts/AppContext';
import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Line, Circle as SvgCircle, Polyline } from 'react-native-svg';

interface TrendChartProps {
  data: TrendPoint[];
}

export default function TrendChart({ data }: TrendChartProps) {
  const width = 320;
  const height = 140;
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxValue = 100;
  const stepX = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;

  const getY = (value: number) => {
    return padding + chartHeight - (value / maxValue) * chartHeight;
  };

  const healthPoints = data.map((point, index) => ({
    x: padding + index * stepX,
    y: getY(point.health),
  }));

  const planetPoints = data.map((point, index) => ({
    x: padding + index * stepX,
    y: getY(point.planet),
  }));

  const healthPath = healthPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const planetPath = planetPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View className="space-y-3 rounded-xl bg-white p-4">
      <View className="flex-row justify-center space-x-5">
        <View className="flex-row items-center space-x-2">
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF6B6B' }} />
          <Text className="text-sm font-semibold text-[#8E8E93]">Health</Text>
        </View>

        <View className="flex-row items-center space-x-2">
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#34C759' }} />
          <Text className="text-sm font-semibold text-[#8E8E93]">Planet</Text>
        </View>
      </View>

      <Svg width={width} height={height}>
        {[0, 25, 50, 75, 100].map((value) => (
          <Line
            key={value}
            x1={padding}
            y1={getY(value)}
            x2={width - padding}
            y2={getY(value)}
            stroke="#F2F2F7"
            strokeWidth={1}
          />
        ))}

        <Polyline points={healthPath} fill="none" stroke="#FF6B6B" strokeWidth={2.5} />
        <Polyline points={planetPath} fill="none" stroke="#34C759" strokeWidth={2.5} />

        {healthPoints.map((point, index) => (
          <SvgCircle key={`health-${index}`} cx={point.x} cy={point.y} r={4} fill="#FF6B6B" />
        ))}

        {planetPoints.map((point, index) => (
          <SvgCircle key={`planet-${index}`} cx={point.x} cy={point.y} r={4} fill="#34C759" />
        ))}
      </Svg>

      <View className="flex-row justify-between px-5">
        {data.map((point, index) => (
          <Text key={index} className="text-xs font-medium text-[#8E8E93]">
            {point.day}
          </Text>
        ))}
      </View>
    </View>
  );
}
