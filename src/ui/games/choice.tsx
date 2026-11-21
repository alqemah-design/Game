import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as G from '@/domain/games/choiceGames';
import { COLORS } from '@/domain/content/shapes';
import { CONTINENT_AR } from '@/domain/content/countries';
import { ChoiceGame } from '../components/ChoiceGame';
import type { GameApi } from '../components/GameShell';
import { Pressy } from '../components/Pressy';
import { ShapeIcon } from '../components/ShapeIcon';
import { font, radius, useTheme } from '../theme/theme';
import { Clock } from './Clock';

function ListenButton({ onPress, label = 'استمع' }: { onPress: () => void; label?: string }) {
  const t = useTheme();
  return (
    <Pressy sound={false} onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={[styles.listen, { backgroundColor: t.primary }]}>
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
      renderPrompt={(r, replay) => (
        <Pressy sound={false} onPress={replay} style={{ alignItems: 'center' }} accessibilityLabel="استمع للاسم">
          <Text style={{ fontSize: 120 }}>{r.prompt.item.emoji}</Text>
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
          <Text style={{ fontSize: 140 }}>{r.prompt.country.flag}</Text>
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
  listen: { width: 160, height: 160, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  pattern: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 6, padding: 8 },
  blank: { borderWidth: 4, borderStyle: 'dashed', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
