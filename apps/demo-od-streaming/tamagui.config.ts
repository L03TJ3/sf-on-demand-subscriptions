import { createTamagui, createFont } from 'tamagui';
import { tokens, themes as baseThemes } from '@tamagui/themes';
import { createAnimations } from '@tamagui/animations-react-native';
import { createThemeBuilder } from '@tamagui/theme-builder';

const orbitronFont = createFont({
  family: 'Orbitron, sans-serif',
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 48,
  },
  lineHeight: {
    1: 16,
    2: 20,
    3: 22,
    4: 24,
    5: 28,
    6: 32,
    7: 36,
    8: 40,
    9: 44,
    10: 56,
  },
  weight: {
    4: '400',
    5: '500',
    7: '700',
  },
  letterSpacing: {
    4: 0,
  },
});

const themeBuilder = createThemeBuilder().addThemes({
  dark_neon: {
    parent: 'dark',
    theme: {
      background: '#0d0d0d',
      backgroundHover: '#1a1a1a',
      backgroundPress: '#262626',
      color: '#e0e0e0',
      colorHover: '#ffffff',
      colorPress: '#ffffff',
      borderColor: '#a855f7',
      borderColorHover: '#c084fc',
      shadowColor: '#a855f7',
      shadowColorHover: '#c084fc',
      placeholderColor: '#7e7e7e',
    },
  },
});

const themes = { ...baseThemes, ...themeBuilder.build() } as const;

const config = createTamagui({
  tokens,
  themes,
  defaultTheme: 'dark_neon',
  fonts: {
    heading: orbitronFont,
    body: orbitronFont,
  },
  animations: createAnimations({
    fast: 'ease-in 150ms',
    medium: 'ease-out 300ms',
    slow: 'ease-out 450ms'
  })
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
