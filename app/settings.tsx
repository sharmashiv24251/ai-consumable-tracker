/**
 * Settings Screen
 * Allows users to configure app preferences and manage their account
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Moon, Trash2, LogOut } from 'lucide-react-native';
import { useLogout } from '../features/auth/hooks/useLogout';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const handleDarkModeToggle = (value: boolean) => {
    setIsDarkMode(value);
    // TODO: Implement actual dark mode functionality
    // This would typically update a context or async storage
    console.log('Dark mode:', value ? 'ON' : 'OFF');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            console.log('Account deletion confirmed');
            Alert.alert('Account Deleted', 'Your account has been deleted.');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#FAF9F7]">
      {/* Header */}
      <View
        className="flex-row items-center justify-between bg-[#FAF9F7] px-5 pb-4"
        style={{ paddingTop: insets.top + 16 }}>
        <Text className="text-3xl font-bold text-black">Settings</Text>
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center">
          <X size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <View className="px-6">
        {/* Dark Mode Setting */}
        <View className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#E8F5E9]">
                <Moon size={20} color="#5DB075" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-black">Dark Mode</Text>
                <Text className="mt-1 text-sm text-[#8E8E93]">
                  {isDarkMode ? 'Currently enabled' : 'Currently disabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#D1D1D6', true: '#5DB075' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#D1D1D6"
            />
          </View>
        </View>

        {/* Sign Out Button */}
        <View className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
          <TouchableOpacity
            onPress={() => logout()}
            disabled={isLoggingOut}
            className="flex-row items-center"
            activeOpacity={0.7}>
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <LogOut size={20} color="#F97316" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-orange-500">
                {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
              </Text>
              <Text className="mt-1 text-sm text-[#8E8E93]">
                Sign out of your account
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Delete Account Setting */}
        <View className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
          <TouchableOpacity
            onPress={handleDeleteAccount}
            className="flex-row items-center"
            activeOpacity={0.7}>
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Trash2 size={20} color="#EF4444" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-red-500">Delete Account</Text>
              <Text className="mt-1 text-sm text-[#8E8E93]">
                Permanently remove your account and data
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
