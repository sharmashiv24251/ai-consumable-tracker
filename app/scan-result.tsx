/**
 * Scan Result Screen
 * Displays detailed scan results for a product with tabs for Health and Environment
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import { ScoreCardsRow } from '../common/components';

type TabType = 'health' | 'environment';

interface CategoryPoints {
  good: string[];
  okay: string[];
  bad: string[];
}

interface ScanResultData {
  productName: string;
  healthScore: number;
  planetScore: number;
  health: CategoryPoints;
  environment: CategoryPoints;
}

export default function ScanResultScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('health');

  // Parse the result data from params
  const result: ScanResultData = params.result ? JSON.parse(params.result as string) : null;

  if (!result) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAF9F7]">
        <Text className="text-base text-[#8E8E93]">No scan result found</Text>
        <TouchableOpacity
          className="mt-4 rounded-xl bg-[#5DB075] px-6 py-3"
          onPress={() => router.back()}>
          <Text className="text-base font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get active category data
  const activeData = activeTab === 'health' ? result.health : result.environment;

  return (
    <View className="flex-1 bg-[#FAF9F7]">
      <View
        className="flex-row items-center justify-between px-5 pb-4"
        style={{ paddingTop: insets.top + 16 }}>
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center">
          <X size={28} color="#000" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold text-black" numberOfLines={1}>
          {result.productName}
        </Text>
        <View className="h-10 w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        {/* Score Cards as Tabs */}
        <ScoreCardsRow
          healthScore={result.healthScore}
          environmentScore={result.planetScore}
          isDashboard={false}
          activeTab={activeTab}
          onHealthPress={() => setActiveTab('health')}
          onEnvironmentPress={() => setActiveTab('environment')}
        />

        {/* Category Content */}
        <View className="mx-5" style={{ gap: 16 }}>
          {/* Good Points Card */}
          {activeData.good.length > 0 && (
            <View className="rounded-3xl bg-white p-6 shadow-sm" style={{ gap: 12 }}>
              <View className="self-start rounded-xl bg-[#5DB075] px-4 py-1.5">
                <Text className="text-[13px] font-bold text-white">Good</Text>
              </View>
              {activeData.good.map((point: string, index: number) => (
                <Text key={index} className="text-[15px] font-medium leading-[22px] text-black">
                  • {point}
                </Text>
              ))}
            </View>
          )}

          {/* Okay Points Card */}
          {activeData.okay.length > 0 && (
            <View className="rounded-3xl bg-white p-6 shadow-sm" style={{ gap: 12 }}>
              <View className="self-start rounded-xl bg-[#F0C674] px-4 py-1.5">
                <Text className="text-[13px] font-bold text-white">Okay</Text>
              </View>
              {activeData.okay.map((point: string, index: number) => (
                <Text key={index} className="text-[15px] font-medium leading-[22px] text-black">
                  • {point}
                </Text>
              ))}
            </View>
          )}

          {/* Bad Points Card */}
          {activeData.bad.length > 0 && (
            <View className="rounded-3xl bg-white p-6 shadow-sm" style={{ gap: 12 }}>
              <View className="self-start rounded-xl bg-[#E07A7A] px-4 py-1.5">
                <Text className="text-[13px] font-bold text-white">Bad</Text>
              </View>
              {activeData.bad.map((point: string, index: number) => (
                <Text key={index} className="text-[15px] font-medium leading-[22px] text-black">
                  • {point}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Action Button */}
        <View className="mb-5 mt-6 px-5">
          <TouchableOpacity
            className="items-center rounded-3xl bg-[#5DB075] py-4"
            onPress={() => router.push('/scan')}>
            <Text className="text-[17px] font-semibold text-white">Scan Another</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
