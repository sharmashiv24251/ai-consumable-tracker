import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X, Upload } from 'lucide-react-native';
import React, { useState, useRef } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Animated,
  ScrollView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

/**
 * TEMP: paste your Vercel AI Gateway API key here for now.
 * Move to secure env / backend in production.
 */
const API_KEY = 'AIzaSyCYo2oYyrUpeaDuD0qAN0WT7c8zX7MEWHM';
const MODEL_ID = 'google/gemini-2.5-flash';

type ScanState = 'idle' | 'processing' | 'result';

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [result, setResult] = useState<any>(null);
  const cameraRef = useRef<CameraView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulse = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  async function analyzeProduct(imageUri: string) {
    setScanState('processing');
    startPulse();

    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const prompt = `You are analyzing product images for health and environmental impact. ...`;

      const messagesForApi = [
        {
          role: 'system',
          content:
            'You are an expert nutritionist and environmental analyst. Provide concise JSON responses following the schema given.',
        },
        {
          role: 'user',
          content: `${prompt}\n\nIMAGE_DATA_URI_START\n${imageUri.substring(0, 2500)}\nIMAGE_DATA_URI_END\n\n(You can ignore the full data URI beyond the start; use the image visually when possible.)`,
        },
      ];

      const body = {
        model: MODEL_ID,
        messages: messagesForApi.map((m) => ({ role: m.role, content: m.content })),
        stream: false,
        temperature: 0.1,
        max_tokens: 800,
      };

      const res = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Vercel AI error ${res.status}: ${text}`);
      }

      const json = await res.json();

      const assistantContent =
        json?.choices?.[0]?.message?.content ??
        json?.choices?.[0]?.message ??
        json?.choices?.[0]?.text ??
        JSON.stringify(json);

      const parsed = tryExtractJSON(assistantContent);

      if (!parsed) {
        throw new Error(
          'Model did not return valid JSON. Response: ' + String(assistantContent).slice(0, 500)
        );
      }

      if (parsed.error) {
        Alert.alert('Not a consumable', parsed.error);
        setScanState('idle');
        stopPulse();
        return;
      }

      const dataSchema = z.object({
        productName: z.string(),
        healthScore: z.number(),
        planetScore: z.number(),
        goodPoints: z.array(z.string()),
        okayPoints: z.array(z.string()),
        badPoints: z.array(z.string()),
      });

      const data = dataSchema.parse(parsed);

      const scanResult = {
        id: Date.now().toString(),
        productName: data.productName,
        healthScore: data.healthScore,
        planetScore: data.planetScore,
        goodPoints: data.goodPoints,
        okayPoints: data.okayPoints,
        badPoints: data.badPoints,
        timestamp: Date.now(),
        imageUri,
      };

      setResult(scanResult);
      // addScanResult & updateScores should be wired up in your AppContext; call them here if available
      setScanState('result');

      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error: any) {
      console.error('Analysis failed:', error);
      Alert.alert('Analysis failed', error?.message ?? 'Unknown error');
      setScanState('idle');

      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      stopPulse();
    }
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: true });
      if (photo?.uri) {
        const base64Image = photo.base64 ? `data:image/jpeg;base64,${photo.base64}` : photo.uri;
        await analyzeProduct(base64Image);
      }
    } catch (error) {
      console.error('Failed to take picture:', error);
      Alert.alert('Camera error', 'Failed to take picture');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const base64Image = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        await analyzeProduct(base64Image);
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
      Alert.alert('Image pick error', 'Failed to pick image');
    }
  };

  const reset = () => {
    setScanState('idle');
    setResult(null);
  };

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAFAFA]">
        <View className="items-center space-y-5 px-10">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-[#E8F5E9]">
            <Camera size={48} color="#34C759" strokeWidth={1.5} />
          </View>
          <Text className="text-center text-2xl font-bold text-black">Camera Access Needed</Text>
          <Text className="text-center text-base font-medium leading-6 text-[#8E8E93]">
            We need your permission to use the camera to scan product packaging
          </Text>
          <TouchableOpacity
            className="mt-3 rounded-xl bg-[#34C759] px-8 py-3"
            onPress={requestPermission}>
            <Text className="font-semibold text-white">Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (scanState === 'result' && result) {
    return (
      <View className="flex-1 bg-[#FAF9F7]">
        <View
          className="flex-row items-center justify-between px-5 pb-4"
          style={{ paddingTop: insets.top + 16 }}>
          <TouchableOpacity onPress={reset} className="h-10 w-10 items-center justify-center">
            <X size={28} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-black">{result.productName}</Text>
          <View className="h-10 w-10" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}>
          <View className="items-center space-y-5 px-6">
            <View className="w-full flex-row space-x-4">
              <View className="flex-1 items-center rounded-lg bg-white p-5 shadow-sm">
                <Text className="text-sm font-semibold text-[#8E8E93]">Health</Text>
                <Text className="text-5xl font-extrabold text-[#5DB075]">{result.healthScore}</Text>
                <Text className="text-sm font-semibold text-[#8E8E93]">/ 100</Text>
              </View>

              <View className="flex-1 items-center rounded-lg bg-white p-5 shadow-sm">
                <Text className="text-sm font-semibold text-[#8E8E93]">Environment</Text>
                <Text className="text-5xl font-extrabold text-[#5DB075]">{result.planetScore}</Text>
                <Text className="text-sm font-semibold text-[#8E8E93]">/ 100</Text>
              </View>
            </View>

            <Image
              source={{
                uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/30vn8v0fxcvo71pq0vu4u',
              }}
              style={{ width: 140, height: 140 }}
            />

            <View className="mx-5 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
              <Text className="text-xl font-bold text-black">Here's an overview.</Text>

              {result.goodPoints.length > 0 && (
                <View className="space-y-2">
                  <View className="self-start rounded-md bg-[#5DB075] px-4 py-1">
                    <Text className="text-xs font-bold text-white">Health</Text>
                  </View>
                  {result.goodPoints.map((point: string, index: number) => (
                    <Text key={index} className="text-base font-medium text-black">
                      • {point}
                    </Text>
                  ))}
                </View>
              )}

              {result.okayPoints.length > 0 && (
                <View className="space-y-2">
                  <View className="self-start rounded-md bg-[#F0C674] px-4 py-1">
                    <Text className="text-xs font-bold text-white">Okay</Text>
                  </View>
                  {result.okayPoints.map((point: string, index: number) => (
                    <Text key={index} className="text-base font-medium text-black">
                      • {point}
                    </Text>
                  ))}
                </View>
              )}

              {result.badPoints.length > 0 && (
                <View className="space-y-2">
                  <View className="self-start rounded-md bg-[#E07A7A] px-4 py-1">
                    <Text className="text-xs font-bold text-white">Bad</Text>
                  </View>
                  {result.badPoints.map((point: string, index: number) => (
                    <Text key={index} className="text-base font-medium text-black">
                      • {point}
                    </Text>
                  ))}
                </View>
              )}
            </View>

            <View className="-mt-24 w-full px-5">
              <TouchableOpacity
                className="items-center rounded-2xl bg-[#5DB075] py-4"
                onPress={reset}>
                <Text className="text-lg font-semibold text-white">Scan Another</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (scanState === 'processing') {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAF9F7]">
        <Animated.View style={{ marginBottom: 20, transform: [{ scale: pulseAnim }] }}>
          <View className="h-48 w-48 items-center justify-center">
            <Animated.Image
              source={{
                uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/30vn8v0fxcvo71pq0vu4u',
              }}
              style={{ width: 200, height: 200, transform: [{ scale: pulseAnim }] }}
            />
          </View>
        </Animated.View>
        <Text className="text-2xl font-bold text-black">Hold steady...</Text>
        <Text className="text-base font-medium text-[#8E8E93]">analyzing packaging</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing={'back' as CameraType}>
        <View className="flex-1 bg-[rgba(0,0,0,0.3)]" style={{ paddingTop: insets.top + 16 }}>
          <View className="items-center gap-y-2 px-5 pt-5">
            <Text className="text-2xl font-bold text-white">AI Scan</Text>
            <Text className="text-base font-medium text-white opacity-80">
              Hold steady... analyzing packaging 🍃🩺
            </Text>
          </View>

          <View className="mx-10 my-14 flex-1 rounded-2xl border-2 border-dashed border-white" />

          <View className="flex-row items-center justify-between px-10 pb-10">
            <TouchableOpacity className="items-center gap-y-1" onPress={pickImage}>
              <View className="h-12 w-12 items-center justify-center rounded-full bg-[#34C759]">
                <Upload size={24} color="#FFFFFF" />
              </View>
              <Text className="mt-2 text-xs font-semibold text-white">Upload</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="h-20 w-20 items-center justify-center rounded-full border-4 border-[#34C759] bg-white"
              onPress={takePicture}>
              <View className="h-16 w-16 rounded-full bg-[#34C759]" />
            </TouchableOpacity>

            <View className="h-12 w-12" />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

/** helpers **/

function tryExtractJSON(text: string) {
  if (!text || typeof text !== 'string') return null;
  const codeFenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = codeFenceMatch ? codeFenceMatch[1] : text;
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const jsonText = raw.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(jsonText);
    } catch (e) {
      return null;
    }
  }
  return null;
}

function getScoreColor(score: number): string {
  if (score >= 75) return '#34C759';
  if (score >= 50) return '#FFB800';
  return '#FF453A';
}

function getVerdict(health: number, planet: number): string {
  const avg = (health + planet) / 2;
  if (avg >= 75) return 'Great choice for health and the planet!';
  if (avg >= 50) return 'Moderate choice; some concerns to consider';
  return 'Consider alternatives for better health and environmental impact';
}
