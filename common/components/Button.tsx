/**
 * Reusable Button Component
 * Consistent styling across the app
 */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
}: ButtonProps) {
  const baseClasses = 'items-center justify-center rounded-xl';

  const variantClasses = {
    primary: 'bg-[#5DB075]',
    secondary: 'bg-[#F0C674]',
    outline: 'bg-transparent border-2 border-[#5DB075]',
  };

  const sizeClasses = {
    small: 'px-4 py-2',
    medium: 'px-6 py-3',
    large: 'px-8 py-4',
  };

  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-[#5DB075]',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        isDisabled ? 'opacity-50' : ''
      }`}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#5DB075' : '#FFFFFF'} />
      ) : (
        <Text
          className={`font-semibold ${textVariantClasses[variant]} ${textSizeClasses[size]}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
