import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function OnboardingTwo() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white px-6">
      {/* Content */}
      <View className="flex-1 items-center justify-center">
        {/* Icon */}
        <View className="mb-8 h-32 w-32 items-center justify-center rounded-full bg-blue-100">
          <Sparkles size={64} color="#3B82F6" strokeWidth={2} />
        </View>

        {/* Title */}
        <Text className="mb-4 text-center text-3xl font-bold text-gray-900">
          Get Personalized Insights
        </Text>

        {/* Description */}
        <Text className="text-center text-base leading-6 text-gray-600">
          Receive tailored health and sustainability recommendations based on your scanning habits
        </Text>
      </View>

      {/* Footer */}
      <View className="pb-12">
        {/* Pagination Dots */}
        <View className="mb-6 flex-row items-center justify-center space-x-2">
          <View className="h-2 w-2 rounded-full bg-gray-300" />
          <View className="h-2 w-8 rounded-full bg-blue-500" />
          <View className="h-2 w-2 rounded-full bg-gray-300" />
        </View>

        {/* Next Button */}
        <TouchableOpacity
          className="rounded-xl bg-blue-500 py-4"
          onPress={() => router.push('/(onboarding)/step-3')}>
          <Text className="text-center text-base font-semibold text-white">Next</Text>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity className="mt-4 py-2" onPress={() => router.back()}>
          <Text className="text-center text-sm text-gray-500">Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
