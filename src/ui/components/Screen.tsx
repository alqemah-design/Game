import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '../theme/theme';

export function Screen({ children, style, edges = ['top', 'left', 'right'] }: { children: ReactNode; style?: ViewStyle; edges?: Edge[] }) {
  const t = useTheme();
  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={[styles.root, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
