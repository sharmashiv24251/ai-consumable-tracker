import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider } from 'contexts/AppContext';
import { AuthProvider, useAuth } from 'features/auth/context/AuthContext';
import { queryClient } from './react-query/client';
import '../global.css';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, isLoading, hasCompletedOnboarding } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      // Don't navigate while loading auth state
      return;
    }

    // Hide splash screen once auth is initialized
    SplashScreen.hideAsync();

    const inOnboarding = segments[0] === '(onboarding)';
    const inAuth = segments[0] === '(auth)';

    // Navigation logic
    if (!hasCompletedOnboarding && !inOnboarding) {
      // User hasn't completed onboarding - redirect to onboarding
      router.replace('/(onboarding)');
    } else if (!isAuthenticated && !inAuth && hasCompletedOnboarding) {
      // User completed onboarding but not authenticated - redirect to sign-in
      router.replace('/(auth)/sign-in');
    } else if (isAuthenticated && (inAuth || inOnboarding)) {
      // User is authenticated but in auth/onboarding screens - redirect to app
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, hasCompletedOnboarding, segments]);

  // Show loading screen while initializing auth
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="scan-result" options={{ headerShown: false }} />
      <Stack.Screen name="all-scans" options={{ headerShown: false }} />
      <Stack.Screen name="article/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="dark" />
            <RootLayoutNav />
          </GestureHandlerRootView>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
