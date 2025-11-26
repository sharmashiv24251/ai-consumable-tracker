/**
 * ArticleCard Component
 * Displays article preview card on dashboard
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import type { Article } from '../types';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/article/${article.id}`);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="flex-row rounded-3xl bg-white p-4 shadow-sm"
      activeOpacity={0.7}>
      {/* Left side: Text content */}
      <View className="flex-1 pr-4" style={{ gap: 8 }}>
        <Text className="text-xl font-bold leading-6 text-black" numberOfLines={2}>
          {article.title}
        </Text>
        <Text className="text-base font-medium leading-5 text-[#8E8E93]" numberOfLines={4}>
          {article.description}
        </Text>
      </View>

      {/* Right side: Image */}
      <Image
        source={{ uri: article.imageUrl }}
        className="h-32 w-32 rounded-2xl"
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}
