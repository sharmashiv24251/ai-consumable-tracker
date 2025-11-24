import { Link, useRouter } from 'expo-router';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLogin } from '../hooks/useLogin';
import { signInSchema, type SignInInput } from '../validation';

export default function SignInScreen() {
  const router = useRouter();
  const { bypassLogin } = useAuth();
  const { mutate: login, isPending, error } = useLogin();

  const [formData, setFormData] = useState<SignInInput>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SignInInput, string>>>({});

  const handleSignIn = () => {
    // Validate form
    const result = signInSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignInInput, string>> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof SignInInput] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Clear errors and submit
    setErrors({});
    login(formData, {
      onSuccess: () => {
        router.replace('/(tabs)');
      },
    });
  };

  const handleBypass = async () => {
    try {
      await bypassLogin();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Bypass login failed:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white">
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900">Welcome Back</Text>
          <Text className="mt-2 text-base text-gray-600">Sign in to continue</Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          {/* Email Input */}
          <View>
            <Text className="mb-2 text-sm font-medium text-gray-700">Email</Text>
            <View
              className={`flex-row items-center rounded-xl border px-4 py-3 ${
                errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
              }`}>
              <Mail size={20} color={errors.email ? '#EF4444' : '#9CA3AF'} />
              <TextInput
                className="ml-3 flex-1 text-base text-gray-900"
                placeholder="your@email.com"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(text) => {
                  setFormData({ ...formData, email: text });
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isPending}
              />
            </View>
            {errors.email && <Text className="mt-1 text-sm text-red-500">{errors.email}</Text>}
          </View>

          {/* Password Input */}
          <View>
            <Text className="mb-2 text-sm font-medium text-gray-700">Password</Text>
            <View
              className={`flex-row items-center rounded-xl border px-4 py-3 ${
                errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
              }`}>
              <Lock size={20} color={errors.password ? '#EF4444' : '#9CA3AF'} />
              <TextInput
                className="ml-3 flex-1 text-base text-gray-900"
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={formData.password}
                onChangeText={(text) => {
                  setFormData({ ...formData, password: text });
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                editable={!isPending}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text className="mt-1 text-sm text-red-500">{errors.password}</Text>
            )}
          </View>

          {/* Error Message */}
          {error && (
            <View className="rounded-lg bg-red-50 p-3">
              <Text className="text-sm text-red-600">
                {error.message || 'Sign in failed. Please try again.'}
              </Text>
            </View>
          )}

          {/* Sign In Button */}
          <TouchableOpacity
            className={`mt-2 rounded-xl py-4 ${
              isPending ? 'bg-green-400' : 'bg-green-500'
            }`}
            onPress={handleSignIn}
            disabled={isPending}>
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center text-base font-semibold text-white">Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Development Bypass Button */}
          {__DEV__ && (
            <TouchableOpacity
              className="mt-2 rounded-xl border-2 border-orange-500 bg-orange-50 py-4"
              onPress={handleBypass}
              disabled={isPending}>
              <Text className="text-center text-base font-semibold text-orange-600">
                Continue as Guest (Dev)
              </Text>
            </TouchableOpacity>
          )}

          {/* Sign Up Link */}
          <View className="mt-6 flex-row items-center justify-center">
            <Text className="text-sm text-gray-600">Don&apos;t have an account? </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity disabled={isPending}>
                <Text className="text-sm font-semibold text-green-600">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
