import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, Platform } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

interface CircularScoreProps {
  score: number;
  label: string;
  color: string;
  delta?: number;
  size?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function CircularScore({
  score,
  label,
  color,
  delta,
  size = 120,
}: CircularScoreProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Animated.spring(animatedValue, {
      toValue: score,
      useNativeDriver: false,
      tension: 40,
      friction: 7,
    }).start();
  }, [score, animatedValue]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View className="relative items-center justify-center" style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F2F2F7"
          strokeWidth={8}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={8}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View className="items-center" style={{ gap: 2 }}>
        <Text className="text-[32px] font-extrabold text-black">{Math.round(score)}</Text>
        <Text className="text-[12px] font-semibold text-[#8E8E93]">{label}</Text>

        {delta !== undefined && (
          <View
            className="mt-1 rounded-md px-2 py-1"
            style={{ backgroundColor: delta >= 0 ? '#E8F5E9' : '#FFEBEE' }}>
            <Text
              className="text-[11px] font-semibold"
              style={{ color: delta >= 0 ? '#34C759' : '#FF453A' }}>
              {delta >= 0 ? '+' : ''}
              {delta}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
