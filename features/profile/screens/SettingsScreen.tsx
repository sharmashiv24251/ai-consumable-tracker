import React from 'react';
import { View, Text, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings, useUpdateSettings } from '../hooks/useProfile';
import type { UserSettings } from '../types';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const userId = 'user_123'; // In real app, get from auth context

  const { data: settings, isLoading } = useSettings(userId);
  const updateMutation = useUpdateSettings(userId);

  const handleToggle = async (key: keyof UserSettings, value: boolean) => {
    if (!settings) return;
    await updateMutation.mutateAsync({ [key]: value });
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAF9F7]">
        <ActivityIndicator size="large" color="#5DB075" />
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
          <Text className="text-4xl font-extrabold text-black">Settings</Text>
        </View>

        <View className="mx-6 rounded-2xl bg-white p-6 shadow-sm">
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-black">Notifications</Text>
            <Switch
              value={settings?.notifications ?? false}
              onValueChange={(value) => handleToggle('notifications', value)}
              trackColor={{ false: '#E0E0E0', true: '#5DB075' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-black">Dark Mode</Text>
            <Switch
              value={settings?.darkMode ?? false}
              onValueChange={(value) => handleToggle('darkMode', value)}
              trackColor={{ false: '#E0E0E0', true: '#5DB075' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-black">Language</Text>
            <Text className="text-base text-gray-500">{settings?.language.toUpperCase()}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
