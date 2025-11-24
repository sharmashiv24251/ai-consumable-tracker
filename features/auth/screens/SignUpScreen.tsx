import { Link, useRouter } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';
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
import { useRegister } from '../hooks/useRegister';
import { signUpSchema, type SignUpInput } from '../validation';

export default function SignUpScreen() {
  const router = useRouter();
  const { mutate: register, isPending, error } = useRegister();

  const [formData, setFormData] = useState<SignUpInput>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SignUpInput, string>>>({});

  const handleSignUp = () => {
    // Validate form
    const result = signUpSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignUpInput, string>> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof SignUpInput] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Clear errors and submit
    setErrors({});
    register(
      {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      },
      {
        onSuccess: () => {
          router.replace('/(tabs)');
        },
      }
    );
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
          <Text className="text-3xl font-bold text-gray-900">Create Account</Text>
          <Text className="mt-2 text-base text-gray-600">Sign up to get started</Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          {/* Name Input */}
          <View>
            <Text className="mb-2 text-sm font-medium text-gray-700">Name</Text>
            <View
              className={`flex-row items-center rounded-xl border px-4 py-3 ${
                errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
              }`}>
              <User size={20} color={errors.name ? '#EF4444' : '#9CA3AF'} />
              <TextInput
                className="ml-3 flex-1 text-base text-gray-900"
                placeholder="John Doe"
                placeholderTextColor="#9CA3AF"
                value={formData.name}
                onChangeText={(text) => {
                  setFormData({ ...formData, name: text });
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                autoCapitalize="words"
                autoComplete="name"
                editable={!isPending}
              />
            </View>
            {errors.name && <Text className="mt-1 text-sm text-red-500">{errors.name}</Text>}
          </View>

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
                placeholder="Min. 8 characters"
                placeholderTextColor="#9CA3AF"
                value={formData.password}
                onChangeText={(text) => {
                  setFormData({ ...formData, password: text });
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
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

          {/* Confirm Password Input */}
          <View>
            <Text className="mb-2 text-sm font-medium text-gray-700">Confirm Password</Text>
            <View
              className={`flex-row items-center rounded-xl border px-4 py-3 ${
                errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
              }`}>
              <Lock size={20} color={errors.confirmPassword ? '#EF4444' : '#9CA3AF'} />
              <TextInput
                className="ml-3 flex-1 text-base text-gray-900"
                placeholder="Confirm your password"
                placeholderTextColor="#9CA3AF"
                value={formData.confirmPassword}
                onChangeText={(text) => {
                  setFormData({ ...formData, confirmPassword: text });
                  if (errors.confirmPassword)
                    setErrors({ ...errors, confirmPassword: undefined });
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                editable={!isPending}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text className="mt-1 text-sm text-red-500">{errors.confirmPassword}</Text>
            )}
          </View>

          {/* Error Message */}
          {error && (
            <View className="rounded-lg bg-red-50 p-3">
              <Text className="text-sm text-red-600">
                {error.message || 'Sign up failed. Please try again.'}
              </Text>
            </View>
          )}

          {/* Sign Up Button */}
          <TouchableOpacity
            className={`mt-2 rounded-xl py-4 ${
              isPending ? 'bg-green-400' : 'bg-green-500'
            }`}
            onPress={handleSignUp}
            disabled={isPending}>
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center text-base font-semibold text-white">
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Sign In Link */}
          <View className="mt-6 flex-row items-center justify-center">
            <Text className="text-sm text-gray-600">Already have an account? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity disabled={isPending}>
                <Text className="text-sm font-semibold text-green-600">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
