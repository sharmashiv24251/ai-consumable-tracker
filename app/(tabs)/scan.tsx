import { useApp } from 'contexts/AppContext';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X, Upload } from 'lucide-react-native';
import React, { useState, useRef, useEffect } from 'react';
import { Text, View, TouchableOpacity, Animated, ScrollView, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

type ScanState = 'idle' | 'processing' | 'result';

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [result, setResult] = useState<any>(null);
  const cameraRef = useRef<CameraView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { addScanResult, updateScores } = useApp();

  // Cleanup effect for when screen loses focus
  useEffect(() => {
    if (!isFocused) {
      if (scanState === 'processing') {
        stopPulse();
        setScanState('idle');
      }
    }
  }, [isFocused, scanState]);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopPulse = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const analyzeProduct = async (imageUri: string) => {
    setScanState('processing');
    startPulse();

    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const prompt = `You are Nubo — a friendly, smart, and balanced AI analyst specializing in health and environmental impact of **consumable products**.

You are NOT a harsh critic or inspector. You think like a human friend: honest, practical, and fair. You give realistic scores — most everyday items should fall between 60–90 unless something is genuinely unsafe or highly wasteful.

CRITICAL VALIDATION — REJECT IF NOT CONSUMABLE:
Analyze ONLY these categories:
✓ Food & Beverages (packaged or fresh)
✓ Personal care: cosmetics, perfumes, lotions, creams, shampoos, soaps
✓ Health products: vitamins, supplements, first aid
✓ Household consumables: cleaning products, detergents, air fresheners
✓ Packaging for any of the above (bottles, jars, tubes, boxes)

Reject these non-consumables (electronics, clothes, furniture, tools, decor, books, etc.)
If non-consumable: respond only with:
{"error": "This item is not a consumable product. Please scan food, beverages, cosmetics, personal care, or household consumables."}

SCORING PHILOSOPHY:
- **Health Score (0–100):** Represents *safety and human well-being* during normal use, not dietary nutrition.  
  - 90–100: Excellent — safe, skin-friendly, beneficial ingredients or minimal risk.
  - 70–89: Good — generally safe, minor irritants possible for some people.
  - 50–69: Average — contains synthetics, alcohol, or potential allergens, but still normal consumer safety.
  - Below 50: Unsafe or contains potentially harmful substances (e.g., banned ingredients, mislabeling, contamination).

- **Planet Score (0–100):** Reflects *environmental responsibility* in packaging, ingredients, and company practices.
  - 90–100: Outstanding — refillable, biodegradable, certified sustainable.
  - 70–89: Good — recyclable, moderately low carbon impact.
  - 50–69: Average — standard packaging, no major harm.
  - Below 50: Poor — heavy single-use plastic, non-recyclable waste, or irresponsible sourcing.

BALANCE YOUR TONE:
- Do NOT penalize normal cosmetic or fragrance ingredients like alcohol, fragrance compounds, or safe synthetics.
- Do NOT assume all chemicals are bad — focus on real-world relevance.
- Give proportional scores — a common perfume should NOT fall below 60 unless unsafe.

STRUCTURE YOUR RESPONSE AS JSON ONLY:
{
  "productName": "Brand Name - Product Name (Size if visible)",
  "healthScore": 0-100,
  "planetScore": 0-100,
  "goodPoints": ["specific benefit 1", "specific benefit 2", "specific benefit 3"],
  "okayPoints": ["balanced observation 1", "optional observation 2"],
  "badPoints": ["specific concern 1", "specific concern 2"]
}

ADDITIONAL INSTRUCTIONS:
- If product is unclear, say: {"error": "Image unclear or product obscured. Please upload a clear photo."}
- Be concise, realistic, and avoid moral judgment.
- Avoid repeating obvious statements like “for external use only.”
- When mentioning brand, include it only if confidently visible.
- Always use everyday, conversational tone — simple, easy-to-understand language.

Now, analyze the provided image and respond ONLY with JSON in the above format.
`;

      const google = createGoogleGenerativeAI({
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY,
      });

      const { text: response } = await generateText({
        model: google('gemini-2.0-flash-exp'),
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image', image: imageUri },
            ],
          },
        ],
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const data = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      if (data?.error) {
        alert(data.error);
        setScanState('idle');
        stopPulse();
        return;
      }

      if (data) {
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
        addScanResult(scanResult);
        updateScores(data.healthScore, data.planetScore);
        setScanState('result');

        if (Platform.OS !== 'web')
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      setScanState('idle');
      if (Platform.OS !== 'web')
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      stopPulse();
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: true });
      if (photo?.uri) {
        const base64Image = photo.uri.startsWith('data:')
          ? photo.uri
          : photo.base64
            ? `data:image/jpeg;base64,${photo.base64}`
            : photo.uri;
        await analyzeProduct(base64Image);
      }
    } catch (error) {
      console.error('Failed to take picture:', error);
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
        const base64Image = asset.uri.startsWith('data:')
          ? asset.uri
          : asset.base64
            ? `data:image/jpeg;base64,${asset.base64}`
            : asset.uri;
        await analyzeProduct(base64Image);
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
    }
  };

  const reset = () => {
    setScanState('idle');
    setResult(null);
  };

  // Only render camera when screen is focused and in idle state
  const shouldShowCamera = isFocused && scanState === 'idle' && permission?.granted;

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
        <View className="items-center px-10" style={{ gap: 20 }}>
          <View className="h-24 w-24 items-center justify-center rounded-full bg-[#E8F5E9]">
            <Camera size={48} color="#34C759" strokeWidth={1.5} />
          </View>
          <Text className="text-center text-2xl font-bold text-black">Camera Access Needed</Text>
          <Text className="text-center text-base font-medium leading-6 text-[#8E8E93]">
            We need your permission to use the camera to scan product packaging
          </Text>
          <TouchableOpacity
            className="mt-3 rounded-xl bg-[#34C759] px-8 py-3.5"
            onPress={requestPermission}>
            <Text className="text-base font-semibold text-white">Grant Permission</Text>
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
          <Text className="flex-1 text-center text-xl font-bold text-black" numberOfLines={1}>
            {result.productName}
          </Text>
          <View className="h-10 w-10" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}>
          <View className="items-center p-6" style={{ gap: 20 }}>
            {/* Score Cards */}
            <View className="w-full flex-row" style={{ gap: 16 }}>
              <View
                className="flex-1 items-center rounded-2xl bg-white p-5 shadow-sm"
                style={{ gap: 8 }}>
                <Text className="text-sm font-semibold text-[#8E8E93]">Health</Text>
                <Text className="text-5xl font-bold text-[#5DB075]">{result.healthScore}</Text>
                <Text className="text-sm font-semibold text-[#8E8E93]">/ 100</Text>
              </View>

              <View
                className="flex-1 items-center rounded-2xl bg-white p-5 shadow-sm"
                style={{ gap: 8 }}>
                <Text className="text-sm font-semibold text-[#8E8E93]">Environment</Text>
                <Text className="text-5xl font-bold text-[#5DB075]">{result.planetScore}</Text>
                <Text className="text-sm font-semibold text-[#8E8E93]">/ 100</Text>
              </View>
            </View>

            {/* Mascot */}
            <Image
              source={{
                uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/30vn8v0fxcvo71pq0vu4u',
              }}
              className="h-36 w-36"
              resizeMode="contain"
            />
          </View>

          {/* Overview Card */}
          <View className="mx-5 mb-6 rounded-3xl bg-white p-6 shadow-sm" style={{ gap: 20 }}>
            <Text className="mb-2 text-xl font-bold text-black">Here's an overview.</Text>

            {result.goodPoints.length > 0 && (
              <View style={{ gap: 12 }}>
                <View className="self-start rounded-xl bg-[#5DB075] px-4 py-1.5">
                  <Text className="text-[13px] font-bold text-white">Health</Text>
                </View>
                {result.goodPoints.map((point: string, index: number) => (
                  <Text key={index} className="text-[15px] font-medium leading-[22px] text-black">
                    • {point}
                  </Text>
                ))}
              </View>
            )}

            {result.okayPoints.length > 0 && (
              <View style={{ gap: 12 }}>
                <View className="self-start rounded-xl bg-[#F0C674] px-4 py-1.5">
                  <Text className="text-[13px] font-bold text-white">Okay</Text>
                </View>
                {result.okayPoints.map((point: string, index: number) => (
                  <Text key={index} className="text-[15px] font-medium leading-[22px] text-black">
                    • {point}
                  </Text>
                ))}
              </View>
            )}

            {result.badPoints.length > 0 && (
              <View style={{ gap: 12 }}>
                <View className="self-start rounded-xl bg-[#E07A7A] px-4 py-1.5">
                  <Text className="text-[13px] font-bold text-white">Bad</Text>
                </View>
                {result.badPoints.map((point: string, index: number) => (
                  <Text key={index} className="text-[15px] font-medium leading-[22px] text-black">
                    • {point}
                  </Text>
                ))}
              </View>
            )}
          </View>

          {/* Action Button */}
          <View className="mb-5 px-5">
            <TouchableOpacity
              className="items-center rounded-3xl bg-[#5DB075] py-4"
              onPress={reset}>
              <Text className="text-[17px] font-semibold text-white">Scan Another</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (scanState === 'processing') {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAF9F7]" style={{ gap: 16 }}>
        <Animated.View style={{ marginBottom: 20, transform: [{ scale: pulseAnim }] }}>
          <View className="h-[200px] w-[200px] items-center justify-center">
            <Image
              source={require('../../assets/NUBO/NUBO_PROCESSING.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </View>
        </Animated.View>
        <Text className="text-base font-medium text-[#8E8E93]">analyzing packaging</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {shouldShowCamera ? (
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing={'back' as CameraType}>
          <View className="flex-1 bg-black/30" style={{ paddingTop: insets.top + 16 }}>
            <View className="items-center px-5 pt-5" style={{ gap: 8 }}>
              <Text className="text-2xl font-bold text-white">AI Scan</Text>
              <Text className="text-[15px] font-medium text-white/80">
                Hold steady... analyzing packaging 🍃🩺
              </Text>
            </View>

            <View className="mx-10 my-14 flex-1 rounded-3xl border-[3px] border-dashed border-white" />

            <View className="flex-row items-center justify-between px-10 pb-10">
              <TouchableOpacity className="items-center" style={{ gap: 4 }} onPress={pickImage}>
                <Upload size={24} color="#FFFFFF" />
                <Text className="text-[13px] font-semibold text-white">Upload</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="h-20 w-20 items-center justify-center rounded-full border-4 border-[#34C759] bg-white"
                onPress={takePicture}>
                <View className="h-16 w-16 rounded-full bg-[#34C759]" />
              </TouchableOpacity>

              <View className="h-6 w-6" />
            </View>
          </View>
        </CameraView>
      ) : (
        <View className="flex-1 items-center justify-center bg-black">
          <Text className="text-white">Camera paused</Text>
        </View>
      )}
    </View>
  );
}
