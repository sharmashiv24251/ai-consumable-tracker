import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '../hooks/useProfile';
import { User, Settings, Award, Calendar } from 'lucide-react-native';

export default function ProfileHome() {
  const insets = useSafeAreaInsets();
  const userId = 'user_123'; // In real app, get from auth context

  const { data: profile, isLoading, error } = useProfile(userId);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAF9F7]">
        <ActivityIndicator size="large" color="#5DB075" />
        <Text className="mt-4 text-base text-gray-500">Loading profile...</Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAF9F7]">
        <Text className="text-base text-red-500">Failed to load profile</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAF9F7]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={[{ paddingTop: insets.top + 16, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}>
        <View className="mb-6 px-6">
          <Text className="text-4xl font-extrabold text-black">Profile</Text>
        </View>

        {/* Profile Header */}
        <View className="mx-6 mb-6 items-center rounded-2xl bg-white p-6 shadow-sm">
          <View className="mb-4 h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#E8F5E9]">
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} className="h-24 w-24 rounded-full" />
            ) : (
              <User size={48} color="#5DB075" />
            )}
          </View>

          <Text className="text-2xl font-bold text-black">{profile.name}</Text>
          <Text className="mt-1 text-base text-gray-500">{profile.email}</Text>

          <View className="mt-4 flex-row items-center">
            <Award size={20} color="#F0C674" />
            <Text className="ml-2 text-lg font-semibold text-black">
              {profile.coins} coins earned
            </Text>
          </View>
        </View>

        {/* Stats Card */}
        <View className="mx-6 mb-4 rounded-2xl bg-white p-6 shadow-sm">
          <Text className="mb-4 text-xl font-bold text-black">Your Impact</Text>

          <View className="flex-row items-center">
            <Calendar size={20} color="#5DB075" />
            <Text className="ml-2 text-base text-gray-700">
              Member since {new Date(profile.joinedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Settings Button */}
        <View className="mx-6">
          <TouchableOpacity className="flex-row items-center justify-between rounded-2xl bg-white p-6 shadow-sm">
            <View className="flex-row items-center">
              <Settings size={24} color="#5DB075" />
              <Text className="ml-3 text-lg font-semibold text-black">Settings</Text>
            </View>
            <Text className="text-2xl text-gray-400">›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
