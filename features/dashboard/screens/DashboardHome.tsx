import { useApp } from '../../../contexts/AppContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScoreCardsRow } from '../../../common/components';
import { useDashboardData } from '../hooks/useDashboardData';
import TrendsChart from '../components/TrendsChart';
import { useArticles, ArticleCard } from '../../articles';

export default function DashboardHome() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { scanHistory } = useApp();
  const { data: dashboardData } = useDashboardData();
  const { data: articles } = useArticles();

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
            <TrendsChart />

            {/* Articles Section */}
            {articles && articles.length > 0 && (
              <View className="px-6" style={{ gap: 16 }}>
                {articles[0] && <ArticleCard article={articles[0]} />}
                {articles[1] && <ArticleCard article={articles[1]} />}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
