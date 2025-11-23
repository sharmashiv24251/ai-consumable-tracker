import { useApp } from '../../../contexts/AppContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScoreCardsRow } from '../../../common/components';
import { useDashboardData } from '../hooks/useDashboardData';

export default function DashboardHome() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { scanHistory } = useApp();
  const { data: dashboardData } = useDashboardData();

  const hasData = scanHistory.length > 0;

  // Use scores from React Query or fall back to 0
  const healthScore = dashboardData?.scores.health ?? 0;
  const environmentScore = dashboardData?.scores.environment ?? 0;

  return (
    <View className="flex-1 bg-[#FAF9F7]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={[{ paddingTop: insets.top + 16, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}>
        <View className="mb-6 px-6">
          <Text className="text-4xl font-extrabold text-black">Dashboard</Text>
        </View>

        {!hasData ? (
          <View className="items-center space-y-5 px-10 pt-20">
            <View className="mb-3 h-64 w-64 items-center justify-center rounded-full bg-[#E8F5E9]">
              <Text style={{ fontSize: 120 }}>📸</Text>
            </View>

            <Text className="text-center text-2xl font-extrabold text-black">
              Start Your Journey
            </Text>
            <Text className="px-6 text-center text-base font-medium leading-6 text-[#8E8E93]">
              Scan your first product to see your health and environmental impact scores!
            </Text>

            <TouchableOpacity
              className="mt-4 rounded-2xl bg-[#5DB075] px-10 py-4"
              onPress={() => router.push('/scan')}>
              <Text className="text-lg font-semibold text-white">Scan Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScoreCardsRow environmentScore={environmentScore} healthScore={healthScore} />

            <View className="mx-6 mb-4 max-h-16 overflow-hidden rounded-xl bg-white p-5 shadow-sm">
              <View className="flex-row items-center ">
                <View className="absolute h-[60px] w-[60px] translate-y-[15px] items-center justify-center rounded-full bg-[#E8F5E9]">
                  <Text style={{ fontSize: 30 }}>👋</Text>
                </View>
                <Text
                  numberOfLines={1}
                  className="flex-1 pl-20 text-base font-semibold leading-6 text-black">
                  You could try using a reusable water bottle!
                </Text>
              </View>
            </View>

            <View className="relative mx-6 mb-4 overflow-hidden rounded-xl bg-[#E8F4F8] p-6">
              <Text className="mb-2 text-lg font-bold text-black">Today's Green Tip</Text>
              <Text className="text-base font-semibold text-black">Buy organic produce</Text>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop',
                }}
                className="absolute bottom-4 right-4 h-20 w-20 rounded-full"
              />
            </View>

            <View className="mx-6 mb-6 rounded-xl bg-white p-6 shadow-sm">
              <Text className="text-center text-lg font-bold text-black">
                Broccoli is the New Superfood
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
