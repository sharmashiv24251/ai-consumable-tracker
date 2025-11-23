/**
 * ScanHistoryItem Component
 * Displays a single scan history item with image, name, and scores
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import type { ScanHistoryItem } from '../types';

interface ScanHistoryItemProps {
  item: ScanHistoryItem;
  onPress: () => void;
}

export default function ScanHistoryItemComponent({ item, onPress }: ScanHistoryItemProps) {
  // Format date to relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#5DB075'; // Green
    if (score >= 60) return '#F0C674'; // Yellow
    return '#EF6B6B'; // Red
  };

  return (
    <TouchableOpacity
      className="mb-3 flex-row overflow-hidden rounded-xl bg-white p-3 shadow-sm"
      onPress={onPress}
      activeOpacity={0.7}>
      {/* Product Image */}
      <Image source={{ uri: item.imageUrl }} className="h-20 w-20 rounded-lg" resizeMode="cover" />

      {/* Product Info */}
      <View className="ml-3 flex-1 justify-between">
        <View>
          <Text numberOfLines={1} className="text-base font-bold text-black">
            {item.productName}
          </Text>
          <Text className="mt-0.5 text-xs text-[#AEAEB2]">{getRelativeTime(item.scannedAt)}</Text>
        </View>

        {/* Scores */}
        <View className="flex-row items-center space-x-4">
          <View className="flex-row items-center">
            <View className="mr-1.5 h-2 w-2 rounded-full bg-[#5DB075]" />
            <Text className="text-xs font-medium text-[#8E8E93]">Health:</Text>
            <Text
              className="ml-1 text-sm font-bold"
              style={{ color: getScoreColor(item.scores.health) }}>
              {item.scores.health}
            </Text>
          </View>

          <View className="flex-row items-center">
            <View className="mr-1.5 h-2 w-2 rounded-full bg-[#EF6B6B]" />
            <Text className="text-xs font-medium text-[#8E8E93]">Planet:</Text>
            <Text
              className="ml-1 text-sm font-bold"
              style={{ color: getScoreColor(item.scores.environment) }}>
              {item.scores.environment}
            </Text>
          </View>
        </View>
      </View>

      {/* Arrow Icon */}
      <View className="items-center justify-center">
        <Text className="text-2xl text-[#D1D1D6]">›</Text>
      </View>
    </TouchableOpacity>
  );
}
