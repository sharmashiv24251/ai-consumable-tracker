import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Animated } from 'react-native';

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
    iconSize: 50,
  },
  environment: {
    backgroundColor: '#D4E8D4',
    textColor: '#1E3A1E',
    icon: require('../../assets/icons/earth.png'),
    title: 'Environment',
    iconSize: 45,
  },
};

export default function ScoreCardsRow({ environmentScore, healthScore }: ScoreCardsRowProps) {
  // Animated values for each score
  const healthAnimatedValue = useRef(new Animated.Value(0)).current;
  const environmentAnimatedValue = useRef(new Animated.Value(0)).current;

  // Display values that update during animation
  const [displayHealthScore, setDisplayHealthScore] = useState(0);
  const [displayEnvironmentScore, setDisplayEnvironmentScore] = useState(0);

  // Track if animation has been triggered
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Add listeners to update display values
    const healthListener = healthAnimatedValue.addListener(({ value }) => {
      setDisplayHealthScore(Math.round(value));
    });

    const environmentListener = environmentAnimatedValue.addListener(({ value }) => {
      setDisplayEnvironmentScore(Math.round(value));
    });

    return () => {
      healthAnimatedValue.removeListener(healthListener);
      environmentAnimatedValue.removeListener(environmentListener);
    };
  }, []);

  useEffect(() => {
    // Trigger animation when scores are loaded (not 0) and haven't animated yet
    if ((healthScore > 0 || environmentScore > 0) && !hasAnimated) {
      setHasAnimated(true);

      // Animate health score
      Animated.timing(healthAnimatedValue, {
        toValue: healthScore,
        duration: 1200,
        useNativeDriver: false,
      }).start();

      // Animate environment score
      Animated.timing(environmentAnimatedValue, {
        toValue: environmentScore,
        duration: 1200,
        useNativeDriver: false,
      }).start();
    }
  }, [healthScore, environmentScore, hasAnimated]);

  const renderCard = (
    type: 'environment' | 'health',
    displayScore: number,
    animatedValue: Animated.Value
  ) => {
    const config = CARD_CONFIG[type];

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
              <Text
                className="text-5xl font-extrabold"
                style={{ color: config.textColor, fontVariant: ['tabular-nums'] }}>
                {String(displayScore).padStart(2, '0')}
              </Text>
              <Text
                className="ml-1 text-lg font-medium"
                style={{ color: config.textColor, opacity: 0.6 }}>
                / 100
              </Text>
            </View>

            {/* Progress Bar */}
            <View className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
              <Animated.View
                style={{
                  height: '100%',
                  borderRadius: 9999,
                  width: animatedValue.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                    extrapolate: 'clamp',
                  }),
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
                top: -10,
                right: -10,
                height: config.iconSize,
                width: config.iconSize,
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
      {renderCard('health', displayHealthScore, healthAnimatedValue)}
      {renderCard('environment', displayEnvironmentScore, environmentAnimatedValue)}
    </View>
  );
}
