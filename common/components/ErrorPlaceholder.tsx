/**
 * Error Placeholder Component
 * Shows an error state for React Query errors
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

interface ErrorPlaceholderProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorPlaceholder({
  message = 'Something went wrong',
  onRetry,
}: ErrorPlaceholderProps) {
  return (
    <View className="flex-1 items-center justify-center bg-[#FAF9F7] px-6">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <AlertCircle size={32} color="#EF4444" />
      </View>
      <Text className="mb-2 text-center text-xl font-bold text-black">Oops!</Text>
      <Text className="mb-6 text-center text-base text-gray-500">{message}</Text>
      {onRetry && (
        <TouchableOpacity
          className="rounded-xl bg-[#5DB075] px-6 py-3"
          onPress={onRetry}
          activeOpacity={0.7}>
          <Text className="text-base font-semibold text-white">Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
