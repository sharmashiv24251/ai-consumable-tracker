/**
 * All Scans Screen
 * Displays complete scan history
 */

import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useScanHistory, ScanHistoryItem } from '../features/scan';
import { LoadingPlaceholder, ErrorPlaceholder } from '../common/components';

export default function AllScansScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const userId = 'user_123'; // In real app, get from auth context

  const { data: scans, isLoading, isError, error, refetch } = useScanHistory(userId);

  // Show loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-[#FAF9F7]">
        <View style={{ paddingTop: insets.top + 16 }} className="px-6 pb-4">
          <Text className="text-2xl font-bold text-black">All Scans</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <LoadingPlaceholder />
        </View>
      </View>
    );
  }

  // Show error state
  if (isError || !scans) {
    return (
      <View className="flex-1 bg-[#FAF9F7]">
        <View style={{ paddingTop: insets.top + 16 }} className="px-6 pb-4">
          <Text className="text-2xl font-bold text-black">All Scans</Text>
        </View>
        <View className="flex-1">
          <ErrorPlaceholder
            message={error?.message || 'Failed to load scan history'}
            onRetry={() => refetch()}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAF9F7]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={[{ paddingTop: insets.top + 16, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}>
        <View className="mb-4 px-6">
          <Text className="text-2xl font-bold text-black">All Scans</Text>
          <Text className="mt-1 text-sm text-[#8E8E93]">
            {scans.length} {scans.length === 1 ? 'product' : 'products'} scanned
          </Text>
        </View>

        {/* Scan List */}
        <View className="px-6">
          {scans.map((scan) => {
            // Transform scan history item to result format
            const resultData = {
              productName: scan.productName,
              healthScore: scan.scores.health,
              planetScore: scan.scores.environment,
              goodPoints: [
                ...scan.result.health.good.map((p) => p.text),
                ...scan.result.environment.good.map((p) => p.text),
              ],
              okayPoints: [
                ...scan.result.health.ok.map((p) => p.text),
                ...scan.result.environment.ok.map((p) => p.text),
              ],
              badPoints: [
                ...scan.result.health.bad.map((p) => p.text),
                ...scan.result.environment.bad.map((p) => p.text),
              ],
            };

            return (
              <ScanHistoryItem
                key={scan.id}
                item={scan}
                onPress={() => {
                  router.push({
                    pathname: '/scan-result',
                    params: {
                      result: JSON.stringify(resultData),
                    },
                  });
                }}
              />
            );
          })}
        </View>

        {scans.length === 0 && (
          <View className="items-center px-6 pt-20">
            <Text className="text-center text-base text-[#8E8E93]">
              No scans yet. Start scanning products to see your history!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
