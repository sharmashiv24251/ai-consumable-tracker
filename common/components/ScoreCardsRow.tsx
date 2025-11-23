import React from 'react';
import { View, Text, Image } from 'react-native';

interface ScoreCardsRowProps {
  environmentScore: number;
  healthScore: number;
}

const CARD_CONFIG = {
  health: {
    backgroundColor: '#F5E6D8',
    textColor: '#8B4513',
    icon: require('../../assets/icons/heart.png'),
    title: 'Health',
  },
  environment: {
    backgroundColor: '#D4E8D4',
    textColor: '#1E3A1E',
    icon: require('../../assets/icons/earth.png'),
    title: 'Environment',
  },
};

export default function ScoreCardsRow({ environmentScore, healthScore }: ScoreCardsRowProps) {
  const renderCard = (type: 'environment' | 'health', score: number) => {
    const config = CARD_CONFIG[type];
    const progressWidth = Math.min(Math.max(score, 0), 100);

    return (
      <View
        className="flex-1 rounded-2xl p-4"
        style={{ backgroundColor: config.backgroundColor, minHeight: 140 }}>
        <View className="relative flex-1 flex-col justify-between">
          {/* Title at top */}
          <Text className="text-sm font-semibold" style={{ color: config.textColor }}>
            {config.title}
          </Text>

          {/* Score and Progress Bar at bottom */}
          <View>
            {/* Score Display: "85 / 100" format */}
            <View className="mb-2 flex-row items-baseline">
              <Text className="text-5xl font-extrabold" style={{ color: config.textColor }}>
                {score}
              </Text>
              <Text
                className="ml-1 text-lg font-medium"
                style={{ color: config.textColor, opacity: 0.6 }}>
                / 100
              </Text>
            </View>

            {/* Progress Bar */}
            <View className="h-2 w-full overflow-hidden rounded-full bg-white/30">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${progressWidth}%`,
                  backgroundColor: config.textColor,
                }}
              />
            </View>
          </View>

          {/* Icon - absolutely positioned in top right, smaller */}
          {config.icon && (
            <Image
              source={config.icon}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                height: 50,
                width: 50,
              }}
              resizeMode="contain"
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="mx-6 mb-4 flex-row" style={{ gap: 12 }}>
      {renderCard('health', healthScore)}
      {renderCard('environment', environmentScore)}
    </View>
  );
}
