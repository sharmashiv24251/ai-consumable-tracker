/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,jsx,tsx}',
    './index.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './features/**/*.{js,ts,jsx,tsx}',
    './common/**/*.{js,ts,jsx,tsx}',
    './contexts/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      screens: {
        // Mobile-first breakpoints for common phone sizes
        // Use max-* prefix for mobile-down approach (e.g., max-xxs:text-xs)

        xxs: '360px',
        // Very small phones (320-360px width)
        // Devices: Older small Android phones, OnePlus Nord N10, Galaxy A series (smaller models)

        xs: '375px',
        // Small standard phones (375px width)
        // Devices: iPhone SE (2nd/3rd gen), iPhone 8, iPhone X, iPhone 11, small Android phones

        sm: '390px',
        // Standard phones (390-400px width)
        // Devices: iPhone 12/13/14/15, iPhone 12 Pro/13 Pro/14 Pro, Pixel 5/6/7, Galaxy S21/S22/S23

        md: '414px',
        // Large standard phones (414-420px width)
        // Devices: iPhone 11 Pro Max, iPhone XS Max, Pixel 7 Pro, Galaxy S20/S21+

        lg: '430px',
        // Extra large phones (428-440px width)
        // Devices: iPhone 14 Pro Max, iPhone 15 Pro Max, iPhone 15 Plus, Galaxy S23 Ultra, Galaxy S24 Ultra

        xl: '480px',
        // Very large phones and phablets (480px+ width)
        // Devices: Foldable phones (unfolded compact mode), very large phablets
      },
    },
  },
  plugins: [],
};
