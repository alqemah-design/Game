import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { ARABIC_LETTERS, type ArabicLetter } from '@/domain/content/arabicLetters';
import { speak } from '@/audio/speech';
import type { GameApi } from '../components/GameShell';
import { Pressy } from '../components/Pressy';
import { font, radius, useTheme } from '../theme/theme';
import { ArabicLettersGame, type ArabicMode } from './choice';

const MODES: { id: ArabicMode; label: string }[] = [
  { id: 'listen', label: '🔊 استمع' },
  { id: 'first', label: '🐰 الكلمة' },
  { id: 'explore', label: '🔍 استكشف' },
];

/** Three modes on one screen: listening challenge, first-letter challenge, free exploration. */
export function ArabicLettersScreen({ api }: { api: GameApi }) {
  const t = useTheme();
  const [mode, setMode] = useState<ArabicMode>('listen');
  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.seg, { backgroundColor: t.card }]}>
        {MODES.map((m) => (
          <Pressy key={m.id} onPress={() => setMode(m.id)} style={[styles.segBtn, mode === m.id && { backgroundColor: t.primary }]}>
            <Text style={[font.small, { color: mode === m.id ? t.primaryText : t.text }]}>{m.label}</Text>
          </Pressy>
        ))}
      </View>
      {mode === 'explore' ? <Explore /> : <ArabicLettersGame key={mode} api={api} mode={mode} />}
    </View>
  );
}

function Explore() {
  const t = useTheme();
  const [open, setOpen] = useState<ArabicLetter | null>(null);
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {open && (
        <Animated.View key={open.id} entering={ZoomIn} style={[styles.detail, { backgroundColor: t.cardAlt }]}>
          <Text style={{ fontSize: 72, fontWeight: '800', color: t.text }}>{open.char}</Text>
          <Pressy sound={false} onPress={() => speak(open.word, 'ar')} style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 64 }}>{open.emoji}</Text>
            <Text style={[font.h2, { color: t.text }]}>{open.word}</Text>
          </Pressy>
        </Animated.View>
      )}
      <View style={styles.grid}>
        {ARABIC_LETTERS.map((l) => (
          <Pressy key={l.id} sound={false} accessibilityLabel={l.name}
            onPress={() => { setOpen(l); speak(l.name, 'ar'); }}
            style={[styles.cell, { backgroundColor: open?.id === l.id ? t.successBg : t.card }]}>
            <Text style={{ fontSize: 36, fontWeight: '800', color: t.text }}>{l.char}</Text>
          </Pressy>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  seg: { flexDirection: 'row', margin: 12, borderRadius: radius.pill, padding: 4 },
  segBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.pill },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  cell: { width: 68, height: 68, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  detail: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderRadius: radius.lg, padding: 16, marginBottom: 16 },
});
