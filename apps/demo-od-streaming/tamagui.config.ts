import { createTamagui } from 'tamagui';
import { tokens, themes } from '@tamagui/themes';
import { createAnimations } from '@tamagui/animations-react-native';

const config = createTamagui({
  tokens,
  themes,
  defaultTheme: 'light',
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
