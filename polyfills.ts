import { Platform } from 'react-native';
// @ts-ignore - no type definitions
import structuredClone from '@ungap/structured-clone';

if (Platform.OS !== 'web') {
  const setupPolyfills = async () => {
    // @ts-ignore - internal React Native module
    const { polyfillGlobal } = await import(
      // @ts-ignore - internal React Native module
      'react-native/Libraries/Utilities/PolyfillFunctions'
    );

    const { TextEncoderStream, TextDecoderStream } = await import(
      '@stardazed/streams-text-encoding'
    );

    if (!('structuredClone' in global)) {
      polyfillGlobal('structuredClone', () => structuredClone);
    }

    polyfillGlobal('TextEncoderStream', () => TextEncoderStream);
    polyfillGlobal('TextDecoderStream', () => TextDecoderStream);
  };

  setupPolyfills();
}

export {};
