/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#FF8C42';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#FF8C42',
    primaryLight: '#FFB380',
    primaryDark: '#E07612',
    secondary: '#FFC2A0',
    accent: '#FF6B1A',
    surface: '#F8F8F8',
    textPrimary: '#2C2C2C',
    textSecondary: '#666666',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#FF8C42',
    primaryLight: '#FFB380',
    primaryDark: '#E07612',
    secondary: '#FFC2A0',
    accent: '#FF6B1A',
    surface: '#1E1E1E',
    textPrimary: '#ECEDEE',
    textSecondary: '#9BA1A6',
  },
};
