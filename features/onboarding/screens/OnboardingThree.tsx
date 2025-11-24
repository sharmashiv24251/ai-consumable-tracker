import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../../auth/context/AuthContext';

export default function OnboardingThree() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace('/(auth)/sign-in');
  };

  return (
    <View className="flex-1 bg-white px-6">
      {/* Content */}
      <View className="flex-1 items-center justify-center">
        {/* Icon */}
        <View className="mb-8 h-32 w-32 items-center justify-center rounded-full bg-purple-100">
          <Heart size={64} color="#A855F7" strokeWidth={2} />
        </View>

        {/* Title */}
        <Text className="mb-4 text-center text-3xl font-bold text-gray-900">
          Make Better Choices
        </Text>

        {/* Description */}
        <Text className="text-center text-base leading-6 text-gray-600">
          Choose products that are good for you and the planet. Start your journey to healthier,
          sustainable living today
        </Text>
      </View>

      {/* Footer */}
      <View className="pb-12">
        {/* Pagination Dots */}
        <View className="mb-6 flex-row items-center justify-center space-x-2">
          <View className="h-2 w-2 rounded-full bg-gray-300" />
          <View className="h-2 w-2 rounded-full bg-gray-300" />
          <View className="h-2 w-8 rounded-full bg-purple-500" />
        </View>

        {/* Get Started Button */}
        <TouchableOpacity className="rounded-xl bg-purple-500 py-4" onPress={handleGetStarted}>
          <Text className="text-center text-base font-semibold text-white">Get Started</Text>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity className="mt-4 py-2" onPress={() => router.back()}>
          <Text className="text-center text-sm text-gray-500">Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
