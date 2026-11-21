import { useColorScheme } from 'react-native';
import { useProgress } from '@/data/progressStore';

const light = {
  bg: '#FFF8E7',
  card: '#FFFFFF',
  cardAlt: '#FFF1CC',
  text: '#2B2140',
  textMuted: '#6B6385',
  primary: '#7C3AED',
  primaryText: '#FFFFFF',
  success: '#22C55E',
  successBg: '#DCFCE7',
  hint: '#F59E0B',
  hintBg: '#FEF3C7',
  soft: '#FDE2E2',
  border: '#EADFC8',
  overlay: 'rgba(30,20,50,0.55)',
  shadow: '#000000',
};

const dark: typeof light = {
  bg: '#1B1B2F',
  card: '#262645',
  cardAlt: '#30305A',
  text: '#F4F1FF',
  textMuted: '#B4AED0',
  primary: '#A78BFA',
  primaryText: '#1B1B2F',
  success: '#4ADE80',
  successBg: '#14532D',
  hint: '#FBBF24',
  hintBg: '#4A3B12',
  soft: '#4C1D2B',
  border: '#3B3B66',
  overlay: 'rgba(0,0,0,0.65)',
  shadow: '#000000',
};

export type Theme = typeof light;

export function useTheme(): Theme & { dark: boolean } {
  const system = useColorScheme();
  const pref = useProgress((s) => s.colorScheme);
  const isDark = pref === 'system' ? system === 'dark' : pref === 'dark';
  return { ...(isDark ? dark : light), dark: isDark };
}

export const radius = { sm: 12, md: 20, lg: 28, pill: 999 };
export const space = (n: number) => n * 4;
/** Minimum touch target – bigger than the 48dp guideline because users are small children. */
export const TOUCH = 64;
export const font = {
  title: { fontSize: 28, fontWeight: '800' as const },
  h2: { fontSize: 22, fontWeight: '800' as const },
  body: { fontSize: 18, fontWeight: '600' as const },
  small: { fontSize: 14, fontWeight: '600' as const },
};
