const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Only apply NativeWind for native platforms (not during web-only builds)
if (process.env.EXPO_PUBLIC_PLATFORM !== 'web') {
  const { withNativeWind } = require('nativewind/metro');
  module.exports = withNativeWind(config, { input: './global.css' });
} else {
  module.exports = config;
}
