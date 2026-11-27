import { StyleSheet, Text as RNText, type TextProps } from 'react-native';

/**
 * App-wide text in Tajawal, a clear Arabic + Latin typeface (SIL Open Font License) that keeps letter
 * shapes identical on every device. Android needs one family per weight, so the weight picks the file.
 */
const FAMILY: Record<string, string> = {
  '100': 'Tajawal_300Light', '200': 'Tajawal_300Light', '300': 'Tajawal_300Light',
  '400': 'Tajawal_400Regular', normal: 'Tajawal_400Regular',
  '500': 'Tajawal_500Medium', '600': 'Tajawal_700Bold', '700': 'Tajawal_700Bold', bold: 'Tajawal_700Bold',
  '800': 'Tajawal_800ExtraBold', '900': 'Tajawal_900Black',
};

export const fontFor = (weight?: string | number) => FAMILY[String(weight ?? '400')] ?? FAMILY['400'];

/** Respect the system text size, but cap it so big tiles and buttons keep their shape. */
const MAX_FONT_SCALE = 1.3;

export function Text({ style, maxFontSizeMultiplier = MAX_FONT_SCALE, ...rest }: TextProps) {
  const flat = StyleSheet.flatten(style) ?? {};
  return <RNText {...rest} maxFontSizeMultiplier={maxFontSizeMultiplier} style={[style, { fontFamily: fontFor(flat.fontWeight), fontWeight: 'normal' }]} />;
}
