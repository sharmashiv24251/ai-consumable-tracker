import { useApp } from 'contexts/AppContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import '../../global.css';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { scores, scanHistory } = useApp();

  const hasData = scanHistory.length > 0;

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
            <View className="mb-3 h-64 w-64">
              <Image
                source={require('../../assets/NUBO/NUBO_SNAP.png')}
                resizeMode="contain"
                style={{ width: '100%', height: '100%' }}
              />
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
            <View className="mx-6 mb-4 min-h-[160px] min-w-[300px] rounded-2xl bg-[#D4E8D4] p-6">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="mb-2 text-lg font-semibold text-[#1E3A1E]">
                    Environment Score
                  </Text>
                  <Text className="text-[72px] font-extrabold text-[#1E3A1E]">{scores.planet}</Text>
                </View>

                <View className="h-[120px] w-[120px]">
                  <Image
                    source={require('../../assets/NUBO/NUBO_ENVIRONMENT.png')}
                    resizeMode="contain"
                    style={{ width: '100%', height: '100%' }}
                  />
                </View>
              </View>
            </View>

            <View className="mx-6 mb-4 min-h-[160px] min-w-[300px] rounded-2xl bg-[#F5E6D8] p-6">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="mb-2 text-lg font-semibold text-[#8B4513]">Health Score</Text>
                  <Text className="text-[72px] font-extrabold text-[#8B4513]">{scores.health}</Text>
                </View>

                <View className=" h-[140px] w-[140px]">
                  <Image
                    source={require('../../assets/NUBO/NUBO_HEALTH.png')}
                    resizeMode="contain"
                    style={{ width: '100%', height: '100%' }}
                  />
                </View>
              </View>
            </View>

            <View className="mx-6 mb-4 max-h-16 overflow-hidden rounded-xl bg-white p-5 shadow-sm">
              <View className="flex-row items-center ">
                <View className="absolute h-[60px] w-[60px] translate-y-[15px] ">
                  <Image
                    source={require('../../assets/NUBO/NUBO_HI.png')}
                    resizeMode="contain"
                    style={{ width: '100%', height: '100%' }}
                  />
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
