import { useApp } from '../../../contexts/AppContext';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { Camera, Zap, ZapOff, X, Image as ImageIcon, ScanBarcode, Info } from 'lucide-react-native';
import React, { useState, useRef, useEffect } from 'react';
import { Text, View, TouchableOpacity, Animated, Platform, StyleSheet, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useUploadScan } from '../hooks/useUploadScan';
import type { ScanResult } from '../types';

type ScanState = 'idle' | 'processing';
type ScanMode = 'general' | 'barcode';

// Helper to transform API format to UI format
function transformScanResult(apiResult: ScanResult, imageUri: string) {
  return {
    id: apiResult.scanId,
    productName: 'Scanned Product',
    healthScore: apiResult.scores.health,
    planetScore: apiResult.scores.environment,
    health: {
      good: apiResult.health.good.map((p) => p.text),
      okay: apiResult.health.ok.map((p) => p.text),
      bad: apiResult.health.bad.map((p) => p.text),
    },
    environment: {
      good: apiResult.environment.good.map((p) => p.text),
      okay: apiResult.environment.ok.map((p) => p.text),
      bad: apiResult.environment.bad.map((p) => p.text),
    },
    timestamp: Date.now(),
    imageUri,
  };
}

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode>('general');
  const [showModeInfo, setShowModeInfo] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { addScanResult, updateScores } = useApp();

  // React Query mutation hook
  const uploadMutation = useUploadScan();

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
      // Call mock API via React Query mutation
      const apiResult = await uploadMutation.mutateAsync({
        imageUri,
        mode: scanMode,
      });

      // Transform to UI format
      const scanResult = transformScanResult(apiResult, imageUri);

      // Save to context
      addScanResult(scanResult);
      updateScores(scanResult.healthScore, scanResult.planetScore);

      if (Platform.OS !== 'web')
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to result screen
      setScanState('idle');
      router.push({
        pathname: '/scan-result',
        params: {
          result: JSON.stringify(scanResult),
        },
      });
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

  const handleClose = () => {
    router.back();
  };

  const toggleFlash = () => {
    setIsFlashOn(!isFlashOn);
  };

  const toggleMode = () => {
    setScanMode((prev) => (prev === 'general' ? 'barcode' : 'general'));
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const showModeInfoModal = () => {
    setShowModeInfo(true);
  };

  const closeModeInfoModal = () => {
    setShowModeInfo(false);
  };

  // Only render camera when screen is focused and in idle state
  const shouldShowCamera = isFocused && scanState === 'idle' && permission?.granted;

  if (!permission) {
    return (
      <View style={styles.centerFill}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centerFill, { backgroundColor: '#FAFAFA' }]}>
        <View style={{ alignItems: 'center', paddingHorizontal: 10, gap: 20 }}>
          <View style={styles.permissionIcon}>
            <Camera size={48} color="#34C759" strokeWidth={1.5} />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            We need your permission to use the camera to scan product packaging
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (scanState === 'processing') {
    return (
      <View style={[styles.centerFill, { gap: 16, backgroundColor: '#FAF9F7' }]}>
        <StatusBar style="dark" />
        <Animated.View style={{ marginBottom: 20, transform: [{ scale: pulseAnim }] }}>
          <View style={styles.pulseCircle}>
            <Text style={{ fontSize: 100 }}>🔍</Text>
          </View>
        </Animated.View>
        <Text style={styles.processingText}>analyzing packaging</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <StatusBar style="light" />
      {shouldShowCamera ? (
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={'back' as CameraType}
          enableTorch={isFlashOn}>
          {/* Full-screen overlay with center cutout effect */}
          <View style={{ flex: 1 }}>
            {/* Top blur overlay with controls */}
            <BlurView
              intensity={80}
              tint="dark"
              style={[styles.topGradient, { paddingTop: insets.top, zIndex: 20 }]}>
              <View style={styles.topRow}>
                {/* Left: Flash button */}
                <TouchableOpacity onPress={toggleFlash} style={styles.iconButton}>
                  {isFlashOn ? (
                    <Zap size={24} color="#FFFFFF" strokeWidth={2} fill="#FFFFFF" />
                  ) : (
                    <ZapOff size={24} color="#FFFFFF" strokeWidth={2} />
                  )}
                </TouchableOpacity>

                {/* Center: Mode indicator */}
                <TouchableOpacity onPress={showModeInfoModal} style={styles.scanIndicator}>
                  <Text style={styles.scanIndicatorText}>
                    {scanMode === 'general' ? 'general' : 'barcode'}
                  </Text>
                  <Info size={16} color="#FFFFFF" strokeWidth={2} style={{ marginLeft: 4 }} />
                </TouchableOpacity>

                {/* Right: Close button */}
                <TouchableOpacity onPress={handleClose} style={styles.iconButton}>
                  <X size={28} color="#FFFFFF" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </BlurView>

            {/* Scan area with rounded corners and corner indicators */}
            <View
              pointerEvents="none"
              style={[
                styles.scanArea,
                {
                  top: insets.top + 100,
                  left: 40,
                  right: 40,
                  bottom: 180 + (insets.bottom || 0),
                  zIndex: 5,
                },
              ]}>
              {/* Subtle rounded border */}
              <View style={styles.scanBorder} />

              {/* Corner indicators - Top Left */}
              <View style={[styles.corner, { left: 4, top: 4 }]}>
                <View
                  style={{ height: 32, width: 2, borderRadius: 999, backgroundColor: '#fff' }}
                />
                <View
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: 2,
                    width: 32,
                    borderRadius: 999,
                    backgroundColor: '#fff',
                  }}
                />
              </View>

              {/* Top Right */}
              <View style={[styles.corner, { right: 4, top: 4 }]}>
                <View
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    height: 32,
                    width: 2,
                    borderRadius: 999,
                    backgroundColor: '#fff',
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    height: 2,
                    width: 32,
                    borderRadius: 999,
                    backgroundColor: '#fff',
                  }}
                />
              </View>

              {/* Bottom Left */}
              <View style={[styles.corner, { left: 4, bottom: 4 }]}>
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: 32,
                    width: 2,
                    borderRadius: 999,
                    backgroundColor: '#fff',
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: 2,
                    width: 32,
                    borderRadius: 999,
                    backgroundColor: '#fff',
                  }}
                />
              </View>

              {/* Bottom Right */}
              <View style={[styles.corner, { right: 4, bottom: 4 }]}>
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    height: 32,
                    width: 2,
                    borderRadius: 999,
                    backgroundColor: '#fff',
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    height: 2,
                    width: 32,
                    borderRadius: 999,
                    backgroundColor: '#fff',
                  }}
                />
              </View>
            </View>

            {/* Bottom blur overlay with controls */}
            <BlurView
              intensity={80}
              tint="dark"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                paddingBottom: Math.max(insets.bottom || 0, 20) + 10,
                zIndex: 20,
              }}>
              <View style={styles.bottomRow}>
                {/* Left: Gallery button */}
                <TouchableOpacity style={styles.smallCircle} onPress={pickImage}>
                  <ImageIcon size={26} color="#FFFFFF" strokeWidth={2} />
                </TouchableOpacity>

                {/* Center: Shutter button */}
                <TouchableOpacity style={styles.shutterOuter} onPress={takePicture}>
                  <View style={styles.shutterInner} />
                </TouchableOpacity>

                {/* Right: Barcode button */}
                <TouchableOpacity
                  style={[
                    styles.smallCircle,
                    scanMode === 'barcode' && { backgroundColor: 'rgba(52, 199, 89, 0.5)' },
                  ]}
                  onPress={toggleMode}>
                  <ScanBarcode size={26} color="#FFFFFF" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </CameraView>
      ) : (
        <View style={styles.centerFill}>
          <Text style={{ color: 'white' }}>Camera paused</Text>
        </View>
      )}

      {/* Mode Info Modal */}
      <Modal
        visible={showModeInfo}
        transparent
        animationType="fade"
        onRequestClose={closeModeInfoModal}>
        <View style={styles.modalOverlay}>
          <BlurView intensity={80} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Scan Modes</Text>
                <TouchableOpacity onPress={closeModeInfoModal}>
                  <X size={24} color="#000" strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <View style={styles.modeSection}>
                <View style={styles.modeBadge}>
                  <Text style={styles.modeBadgeText}>General Mode</Text>
                </View>
                <Text style={styles.modeDescription}>
                  Uses AI to analyze product images. Provides quick results but may be less accurate for
                  packaged products.
                </Text>
              </View>

              <View style={styles.modeSection}>
                <View style={[styles.modeBadge, { backgroundColor: '#34C759' }]}>
                  <Text style={styles.modeBadgeText}>Barcode Mode</Text>
                </View>
                <Text style={styles.modeDescription}>
                  Scans product barcodes to fetch precise data from databases. More accurate for packaged
                  products with barcodes.
                </Text>
              </View>

              <TouchableOpacity style={styles.modalButton} onPress={closeModeInfoModal}>
                <Text style={styles.modalButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'black' },
  loadingText: { color: 'white' },
  permissionIcon: {
    height: 96,
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 48,
    backgroundColor: '#E8F5E9',
  },
  permissionTitle: { textAlign: 'center', fontSize: 20, fontWeight: '700', color: '#000' },
  permissionText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    color: '#8E8E93',
  },
  permissionButton: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#34C759',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  permissionButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  pulseCircle: {
    height: 200,
    width: 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    backgroundColor: '#E8F5E9',
  },
  processingText: { fontSize: 16, fontWeight: '500', color: '#8E8E93' },

  topGradient: { position: 'absolute', left: 0, right: 0, top: 0 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconButton: { height: 40, width: 40, alignItems: 'center', justifyContent: 'center' },
  scanIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scanIndicatorText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  scanArea: { position: 'absolute', overflow: 'hidden', borderRadius: 18 },
  scanBorder: {
    position: 'absolute',
    inset: 0 as any,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  corner: { position: 'absolute', width: 40, height: 40 },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 20,
    gap: 60,
  },
  smallCircle: {
    height: 56,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  shutterOuter: {
    height: 80,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  shutterInner: { height: 64, width: 64, borderRadius: 32, backgroundColor: 'white' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    margin: 20,
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    gap: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  modeSection: {
    gap: 8,
  },
  modeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#8E8E93',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modeBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modeDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#3C3C43',
  },
  modalButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
