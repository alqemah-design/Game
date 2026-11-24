import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as G from '@/domain/games/choiceGames';
import { COLORS } from '@/domain/content/shapes';
import { CONTINENT_AR } from '@/domain/content/countries';
import { ChoiceGame } from '../components/ChoiceGame';
import type { GameApi } from '../components/GameShell';
import { Pressy } from '../components/Pressy';
import { ShapeIcon } from '../components/ShapeIcon';
import { font, radius, raised, useTheme } from '../theme/theme';
import { Clock } from './Clock';
import { speak } from '@/audio/speech';

function ListenButton({ onPress, label = 'استمع' }: { onPress: () => void; label?: string }) {
  const t = useTheme();
  return (
    <Pressy sound={false} onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={[styles.listen, raised(t, t.primary, '#5B21B6'), { borderWidth: 6, borderColor: 'rgba(255,255,255,0.7)', borderBottomWidth: 10 }]}>
      <View pointerEvents="none" style={styles.listenShine} />
      <Text style={{ fontSize: 56 }}>🔊</Text>
      <Text style={[font.body, { color: t.primaryText }]}>{label}</Text>
    </Pressy>
  );
}

const Big = ({ children, size = 44 }: { children: string | number; size?: number }) => {
  const t = useTheme();
  return <Text style={{ fontSize: size, fontWeight: '800', color: t.text, textAlign: 'center' }}>{children}</Text>;
};

export function SoundLetterGame({ api }: { api: GameApi }) {
  return (
    <ChoiceGame api={api} generate={G.soundLetterRound} columns={3}
      renderPrompt={(_r, replay) => <ListenButton onPress={replay} label="Listen" />}
      renderOption={(o) => <Big size={48}>{o}</Big>} />
  );
}

export function FruitsGame({ api }: { api: GameApi }) {
  const t = useTheme();
  return (
    <ChoiceGame api={api} generate={G.produceRound} columns={2} optionHeight={80}
      // The name is the answer: say it after a correct pick, or on tap once the hint is showing.
      autoSpeak={false}
      onSolved={(r) => r.speak && speak(r.speak.text, r.speak.lang)}
      renderPrompt={(r, replay) => (
        <Pressy sound={false} disabled={!api.hint} onPress={replay} style={{ alignItems: 'center' }} accessibilityLabel={r.prompt.item.ar}>
          <Text style={{ fontSize: 110, zIndex: 1 }}>{r.prompt.item.emoji}</Text>
          <View style={styles.plate} />
          <Text style={[font.body, { color: t.textMuted }]}>{r.prompt.lang === 'en' ? 'What is it in English?' : 'ما اسم هذه؟'}</Text>
        </Pressy>
      )}
      renderOption={(o) => <Big size={24}>{o}</Big>} />
  );
}

export function FlagsGame({ api }: { api: GameApi }) {
  const t = useTheme();
  return (
    <ChoiceGame api={api} generate={G.flagRound} columns={2} optionHeight={72} autoSpeak={false}
      renderPrompt={(r) => (
        <View style={{ alignItems: 'center' }}>
          <View style={styles.flagRow}>
            <View style={styles.pole}><View style={styles.poleCap} /></View>
            <Text style={{ fontSize: 130, marginStart: -6 }}>{r.prompt.country.flag}</Text>
          </View>
          {api.hint && <Text style={[font.body, { color: t.textMuted }]}>تلميح: في {CONTINENT_AR[r.prompt.country.continent]}</Text>}
        </View>
      )}
      renderOption={(o) => <Big size={22}>{o.ar}</Big>} />
  );
}

export function TimeGame({ api }: { api: GameApi }) {
  const t = useTheme();
  return (
    <ChoiceGame api={api} generate={G.timeRound} columns={2} optionHeight={72}
      renderPrompt={(r) => <Clock h={r.prompt.h} m={r.prompt.m} dark={t.dark} />}
      renderOption={(o) => <Big size={32}>{o}</Big>} />
  );
}

export function MathGame({ api }: { api: GameApi }) {
  return (
    <ChoiceGame api={api} generate={G.mathRound} columns={2} timeLimit={30} autoSpeak={false}
      renderPrompt={(r) => <Big size={64}>{`${r.prompt.a} ${r.prompt.op} ${r.prompt.b} = ?`}</Big>}
      renderOption={(o) => <Big size={40}>{o}</Big>} />
  );
}

export function PatternGame({ api }: { api: GameApi }) {
  const t = useTheme();
  return (
    <ChoiceGame api={api} generate={G.patternRound} columns={4} optionHeight={84} autoSpeak={false}
      renderPrompt={(r) => {
        const n = r.prompt.sequence.length;
        const size = n <= 6 ? 52 : n <= 10 ? 40 : 30;
        return (
          <View style={styles.pattern}>
            {r.prompt.sequence.map((item, i) =>
              item ? <ShapeIcon key={i} shape={item.shape} color={COLORS[item.color].hex} size={size} />
                : <View key={i} style={[styles.blank, { width: size, height: size, borderColor: t.primary }]}><Text style={[font.h2, { color: t.primary }]}>?</Text></View>,
            )}
          </View>
        );
      }}
      renderOption={(o) => <ShapeIcon shape={o.shape} color={COLORS[o.color].hex} size={52} />} />
  );
}

type ArabicMode = 'listen' | 'first' | 'explore';
export function ArabicLettersGame({ api, mode }: { api: GameApi; mode: Exclude<ArabicMode, 'explore'> }) {
  const t = useTheme();
  if (mode === 'listen')
    return (
      <ChoiceGame api={api} generate={G.arabicListenRound} columns={3}
        renderPrompt={(_r, replay) => <ListenButton onPress={replay} />}
        renderOption={(o) => <Big size={52}>{o.char}</Big>} />
    );
  return (
    <ChoiceGame api={api} generate={G.arabicFirstLetterRound} columns={3}
      renderPrompt={(r, replay) => (
        <Pressy sound={false} onPress={replay} style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 110 }}>{r.prompt.letter.emoji}</Text>
          <Text style={[font.h2, { color: t.text }]}>{r.prompt.letter.word}</Text>
          <Text style={[font.small, { color: t.textMuted }]}>بأي حرف تبدأ الكلمة؟</Text>
        </Pressy>
      )}
      renderOption={(o) => <Big size={52}>{o.char}</Big>} />
  );
}

export function useArabicMode() {
  return useState<ArabicMode>('listen');
}
export type { ArabicMode };

const styles = StyleSheet.create({
  listen: { width: 170, height: 170, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  listenShine: { position: 'absolute', top: 8, left: 26, right: 26, height: 50, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.3)' },
  plate: { width: 190, height: 34, borderRadius: 95, backgroundColor: '#FFFFFF', marginTop: -34, borderWidth: 3, borderColor: '#E5E7EB', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 4 }, elevation: 3, marginBottom: 10 },
  flagRow: { flexDirection: 'row', alignItems: 'flex-start', direction: 'ltr' },
  pole: { width: 8, height: 200, borderRadius: 4, backgroundColor: '#9CA3AF', marginTop: 10, borderRightWidth: 3, borderRightColor: '#6B7280' },
  poleCap: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#FACC15', marginTop: -10, marginLeft: -4 },
  pattern: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 6, padding: 8 },
  blank: { borderWidth: 4, borderStyle: 'dashed', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
