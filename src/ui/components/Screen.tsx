import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '../theme/theme';
import { Backdrop } from './Backdrop';

/** `scenery` draws the sky-and-hills backdrop (behind the status bar too), tinted with the given colour. */
export function Screen({ children, style, edges = ['top', 'left', 'right'], scenery }: { children: ReactNode; style?: ViewStyle; edges?: Edge[]; scenery?: string }) {
  const t = useTheme();
  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: t.bg }]}>
      {scenery && <Backdrop dark={t.dark} tint={scenery} />}
      <View style={[styles.root, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
