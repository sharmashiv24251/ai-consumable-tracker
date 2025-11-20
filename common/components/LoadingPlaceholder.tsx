/**
 * Loading Placeholder Component
 * Shows a loading state for React Query fetching
 */

import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingPlaceholderProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

export default function LoadingPlaceholder({
  message = 'Loading...',
  size = 'large',
  color = '#5DB075',
}: LoadingPlaceholderProps) {
  return (
    <View className="flex-1 items-center justify-center bg-[#FAF9F7]">
      <ActivityIndicator size={size} color={color} />
      {message && <Text className="mt-4 text-base text-gray-500">{message}</Text>}
    </View>
  );
}
