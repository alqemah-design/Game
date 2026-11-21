import { StyleSheet, Text, type ViewStyle } from 'react-native';
import { Pressy } from './Pressy';
import { font, radius, TOUCH, useTheme } from '../theme/theme';

type Props = { label: string; onPress: () => void; color?: string; textColor?: string; icon?: string; style?: ViewStyle; small?: boolean; accessibilityHint?: string };

export function BigButton({ label, onPress, color, textColor, icon, style, small, accessibilityHint }: Props) {
  const t = useTheme();
  return (
    <Pressy
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={[styles.btn, { backgroundColor: color ?? t.primary, minHeight: small ? 48 : TOUCH }, style]}
    >
      <Text style={[small ? font.body : font.h2, { color: textColor ?? t.primaryText }]}>
        {icon ? `${icon}  ` : ''}{label}
      </Text>
    </Pressy>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: radius.pill, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 4, borderBottomColor: 'rgba(0,0,0,0.18)' },
});
