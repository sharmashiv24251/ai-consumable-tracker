/**
 * TrendsChart Component
 * Displays health and environment score trends over time with filtering
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LoadingPlaceholder, ErrorPlaceholder } from '../../../common/components';
import { useTrendsData } from '../hooks/useTrendsData';
import type { TrendFilter } from '../types';

export default function TrendsChart() {
  const [activeFilter, setActiveFilter] = useState<TrendFilter>('all');
  const { data: trendsData, isLoading, isError, error, refetch } = useTrendsData();

  // Show loading state
  if (isLoading) {
    return (
      <View className="mx-6 mb-4 h-[350px] rounded-2xl bg-white p-4 shadow-sm">
        <LoadingPlaceholder />
      </View>
    );
  }

  // Show error state
  if (isError || !trendsData) {
    return (
      <View className="mx-6 mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <ErrorPlaceholder
          message={error?.message || 'Failed to load trends data'}
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  // Prepare data based on active filter
  const prepareChartData = () => {
    const labels = trendsData.dataPoints.map((point) => point.month);

    const datasets: Array<{
      data: number[];
      color?: (opacity?: number) => string;
      strokeWidth?: number;
    }> = [];

    if (activeFilter === 'all' || activeFilter === 'health') {
      datasets.push({
        data: trendsData.dataPoints.map((point) => point.healthScore),
        color: (opacity = 1) => `rgba(93, 176, 117, ${opacity})`, // softer green
        strokeWidth: 2.5,
      });
    }

    if (activeFilter === 'all' || activeFilter === 'environment') {
      datasets.push({
        data: trendsData.dataPoints.map((point) => point.environmentScore),
        color: (opacity = 1) => `rgba(239, 107, 107, ${opacity})`, // softer red
        strokeWidth: 2.5,
      });
    }

    return { labels, datasets };
  };

  const chartData = prepareChartData();
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 48; // Account for mx-6 + p-4 padding

  return (
    <View className="mx-6 mb-4 overflow-hidden rounded-2xl bg-white p-4 shadow-sm">
      {/* Header */}
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-black">Trends</Text>
        <Text className="text-sm font-semibold text-[#5DB075]">
          +{trendsData.percentageChange}%{' '}
          <Text className="text-xs font-normal text-[#AEAEB2]">{trendsData.period}</Text>
        </Text>
      </View>

      {/* Legend */}
      <View className="mb-3 flex-row items-center">
        {(activeFilter === 'all' || activeFilter === 'health') && (
          <View className="mr-4 flex-row items-center">
            <View className="mr-1.5 h-0.5 w-4 bg-[#5DB075]" />
            <Text className="text-xs font-medium text-[#AEAEB2]">Health</Text>
          </View>
        )}
        {(activeFilter === 'all' || activeFilter === 'environment') && (
          <View className="flex-row items-center">
            <View className="mr-1.5 h-0.5 w-4 bg-[#EF6B6B]" />
            <Text className="text-xs font-medium text-[#AEAEB2]">Environment</Text>
          </View>
        )}
      </View>

      {/* Chart */}
      <View className="mb-3 items-center">
        <LineChart
          data={chartData}
          width={chartWidth}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(174, 174, 178, ${opacity * 0.8})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '3',
              strokeWidth: '2',
            },
            propsForBackgroundLines: {
              strokeDasharray: '',
              stroke: '#F5F5F5',
              strokeWidth: 1,
            },
          }}
          bezier
          style={{
            borderRadius: 16,
            marginLeft: -10,
          }}
          withVerticalLabels={false}
          withInnerLines={true}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines={true}
          withDots={true}
          withShadow={false}
          segments={4}
        />
      </View>

      {/* Filter Buttons */}
      <View className="flex-row gap-2">
        <TouchableOpacity
          className={`flex-1 rounded-lg px-3 py-2 ${
            activeFilter === 'all' ? 'bg-[#F5F5F5]' : 'bg-transparent'
          }`}
          onPress={() => setActiveFilter('all')}>
          <Text numberOfLines={1} className="text-center text-sm font-medium text-[#8E8E93]">
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 rounded-lg px-3 py-2 ${
            activeFilter === 'health' ? 'bg-[#F5F5F5]' : 'bg-transparent'
          }`}
          onPress={() => setActiveFilter('health')}>
          <Text numberOfLines={1} className="text-center text-sm font-medium text-[#8E8E93]">
            Health
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 rounded-lg px-3 py-2 ${
            activeFilter === 'environment' ? 'bg-[#F5F5F5]' : 'bg-transparent'
          }`}
          onPress={() => setActiveFilter('environment')}>
          <Text numberOfLines={1} className="text-center text-sm font-medium text-[#8E8E93]">
            Environment
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
