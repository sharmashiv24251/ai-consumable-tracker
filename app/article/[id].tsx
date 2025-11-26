/**
 * Article Detail Screen
 * Displays full article with image carousel and content
 */

import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, Image, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import { useArticleDetail } from '../../features/articles';
import { LoadingPlaceholder, ErrorPlaceholder } from '../../common/components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH - 40; // 20px padding on each side

export default function ArticleDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const articleId = params.id as string;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const { data: article, isLoading, isError, error, refetch } = useArticleDetail(articleId);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / IMAGE_WIDTH);
    setActiveImageIndex(index);
  };

  if (isLoading) return <LoadingPlaceholder />;
  if (isError) return <ErrorPlaceholder error={error} onRetry={refetch} />;
  if (!article) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAF9F7]">
        <Text className="text-base text-[#8E8E93]">Article not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAF9F7]">
      {/* Header */}
      <View
        className="flex-row items-center justify-between bg-[#FAF9F7] px-5 pb-4"
        style={{ paddingTop: insets.top + 16 }}>
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center">
          <X size={28} color="#000" />
        </TouchableOpacity>
        <View className="h-10 w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View className="mb-6">
          <FlatList
            ref={flatListRef}
            data={article.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            snapToInterval={IMAGE_WIDTH + 20}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 20 }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={{ width: IMAGE_WIDTH, height: 240, marginRight: 20 }}
                className="rounded-3xl"
                resizeMode="cover"
              />
            )}
            keyExtractor={(item, index) => `image-${index}`}
          />

          {/* Pagination Dots */}
          {article.images.length > 1 && (
            <View className="mt-4 flex-row justify-center" style={{ gap: 8 }}>
              {article.images.map((_, index) => (
                <View
                  key={index}
                  className={`h-2 rounded-full ${
                    index === activeImageIndex ? 'w-6 bg-[#5DB075]' : 'w-2 bg-[#D1D1D6]'
                  }`}
                />
              ))}
            </View>
          )}
        </View>

        {/* Article Title */}
        <View className="px-6">
          <Text className="mb-4 text-3xl font-bold leading-9 text-black">{article.title}</Text>

          {/* Article Content */}
          <Text className="text-base font-normal leading-7 text-[#3C3C43]">{article.content}</Text>
        </View>
      </ScrollView>
    </View>
  );
}
