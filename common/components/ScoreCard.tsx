import React from 'react';
import { View, Text, Image } from 'react-native';

type ScoreCardType = 'health' | 'environment';

interface ScoreCardProps {
  type: ScoreCardType;
  score: number;
}

const CARD_CONFIG = {
  health: {
    backgroundColor: '#F5E6D8',
    textColor: '#8B4513',
    progressColor: '#8B4513',
    icon: require('../../assets/icons/heart.png'),
    title: 'Health',
    emoji: '💚',
  },
  environment: {
    backgroundColor: '#D4E8D4',
    textColor: '#1E3A1E',
    progressColor: '#1E3A1E',
    icon: require('../../assets/icons/earth.png'),
    title: 'Environment',
    emoji: '🌍',
  },
};

export default function ScoreCard({ type, score }: ScoreCardProps) {
  const config = CARD_CONFIG[type];

  // Calculate progress bar width (max 100%)
  const progressWidth = Math.min(Math.max(score, 0), 100);

  return (
    <View
      className="mx-6 mb-4 min-h-[160px] rounded-2xl p-6"
      style={{ backgroundColor: config.backgroundColor }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="mb-2 text-lg font-semibold" style={{ color: config.textColor }}>
            {config.title}
          </Text>

          <Text className="text-[72px] font-extrabold" style={{ color: config.textColor }}>
            {score}
          </Text>

          {/* Progress Bar */}
          <View className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/30">
            <View
              className="h-full rounded-full"
              style={{
                width: `${progressWidth}%`,
                backgroundColor: config.progressColor,
              }}
            />
          </View>
        </View>

        {/* Icon */}
        <View className="h-[120px] w-[120px] items-center justify-center">
          {config.icon ? (
            <Image
              source={config.icon}
              style={{ height: '100%', width: '100%' }}
              resizeMode="contain"
            />
          ) : (
            <View className="h-[120px] w-[120px] items-center justify-center rounded-full bg-white">
              <Text style={{ fontSize: 60 }}>{config.emoji}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
