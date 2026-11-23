import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn, useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import * as N from '@/domain/games/newGames';
import { play } from '@/audio/sfx';
import { speak } from '@/audio/speech';
import { ChoiceGame, OptionTile, type OptionState } from '../components/ChoiceGame';
import type { GameApi } from '../components/GameShell';
import { Pressy } from '../components/Pressy';
import { BigButton } from '../components/BigButton';
import { font, radius, useTheme } from '../theme/theme';

function Prompt({ children }: { children: string }) {
  const t = useTheme();
  return <Text style={[font.body, { color: t.textMuted, textAlign: 'center', marginVertical: 8 }]}>{children}</Text>;
}

// ── Little market ────────────────────────────────────────────────────────
function Money({ value, small }: { value: number; small?: boolean }) {
  const note = value >= 10;
  const s = small ? 0.62 : 1;
  return (
    <View style={[note ? styles.note : styles.coin, {
      width: (note ? 78 : 56) * s, height: (note ? 46 : 56) * s,
      backgroundColor: note ? (value >= 50 ? '#7C3AED' : value >= 20 ? '#0EA5E9' : '#22C55E') : value >= 5 ? '#F59E0B' : '#CBD5E1',
    }]}>
      <Text style={{ fontSize: 22 * s, fontWeight: '900', color: note ? '#FFF' : '#1F2937' }}>{value}</Text>
    </View>
  );
}

export function MarketGame({ api }: { api: GameApi }) {
  const t = useTheme();
  const [round] = useState(() => N.marketRound(api.genLevel, api.rng));
  const [tray, setTray] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [wrongOpts, setWrongOpts] = useState<number[]>([]);
  const [over, setOver] = useState(false);
  const total = tray.reduce((a, b) => a + b, 0);

  useEffect(() => {
    const id = setTimeout(() => speak(round.item.ar, 'ar'), 300);
    return () => clearTimeout(id);
  }, [round]);

  const add = (v: number) => {
    if (done || round.mode !== 'pay') return;
    const sum = total + v;
    if (sum === round.price) {
      play('pop'); setTray([...tray, v]); setDone(true);
      setTimeout(() => api.correct(), 600);
    } else if (sum > round.price) {
      // Too much: gentle feedback, the purse empties so the child can try again.
      api.wrong(); setOver(true); setTray([]);
      setTimeout(() => setOver(false), 1200);
    } else { play('pop'); setTray([...tray, v]); }
  };

  const header = (
    <Animated.View entering={FadeIn} style={[styles.shelf, { backgroundColor: t.card }]}>
      <Text style={{ fontSize: 84 }}>{round.item.emoji}</Text>
      <View style={{ alignItems: 'center' }}>
        <Text style={[font.h2, { color: t.text }]}>{round.item.ar}</Text>
        <View style={[styles.tag, { backgroundColor: t.hintBg }]}><Text style={[font.h2, { color: t.text }]}>السعر {round.price}</Text></View>
      </View>
    </Animated.View>
  );

  if (round.mode === 'change') {
    const r = round;
    const choose = (i: number) => {
      if (done || wrongOpts.includes(i)) return;
      if (i === r.correctIndex) { setDone(true); setTimeout(() => api.correct(), 650); }
      else { setWrongOpts([...wrongOpts, i]); api.wrong(); }
    };
    return (
      <View style={{ flex: 1, padding: 16 }}>
        {header}
        <View style={styles.row}><Text style={[font.body, { color: t.text }]}>دفعت</Text><Money value={r.paid} /></View>
        <Prompt>كم الباقي؟</Prompt>
        <View style={styles.grid}>
          {r.options.map((o, i) => {
            const state: OptionState = done && i === r.correctIndex ? 'correct' : wrongOpts.includes(i) ? 'wrong' : api.hint && i === r.correctIndex ? 'hint' : 'idle';
            return <OptionTile key={i} state={state} width="46%" height={80} onPress={() => choose(i)}><Text style={[font.title, { color: t.text }]}>{o}</Text></OptionTile>;
          })}
        </View>
      </View>
    );
  }

  const hint = api.hint ? N.greedyPay(round.price, round.money) : [];
  return (
    <View style={{ flex: 1, padding: 16 }}>
      {header}
      <View style={[styles.purse, { backgroundColor: done ? t.successBg : over ? t.soft : t.cardAlt, borderColor: t.border }]}>
        <Text style={[font.small, { color: t.textMuted }]}>{over ? 'أكثر من السعر! جرّب مرة أخرى' : `في يدك: ${total}`}</Text>
        <View style={styles.trayRow}>
          {tray.map((v, i) => <Animated.View key={i} entering={ZoomIn}><Money value={v} small /></Animated.View>)}
        </View>
      </View>
      {hint.length > 0 && <Text style={[font.small, { color: t.hint, textAlign: 'center' }]}>تلميح: {hint.join(' + ')}</Text>}
      <Prompt>اضغط على النقود لتدفع السعر بالضبط</Prompt>
      <View style={styles.wallet}>
        {round.money.map((v) => (
          <Pressy key={v} sound={false} onPress={() => add(v)} accessibilityLabel={`${v}`} style={{ padding: 4 }}>
            <Money value={v} />
          </Pressy>
        ))}
      </View>
      {tray.length > 0 && !done && (
        <BigButton small label="أرجع آخر قطعة" icon="↩" color={t.card} textColor={t.text} onPress={() => setTray(tray.slice(0, -1))} style={{ alignSelf: 'center', marginTop: 12 }} />
      )}
    </View>
  );
}

// ── What changed? ────────────────────────────────────────────────────────
function StudyBar({ ms }: { ms: number }) {
  const t = useTheme();
  const w = useSharedValue(1);
  useEffect(() => { w.set(withTiming(0, { duration: ms, easing: Easing.linear })); }, [ms, w]);
  const style = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return <View style={[styles.bar, { backgroundColor: t.border }]}><Animated.View style={[styles.barFill, { backgroundColor: t.primary }, style]} /></View>;
}

export function WhatChangedGame({ api }: { api: GameApi }) {
  const t = useTheme();
  const [round] = useState(() => N.changedRound(api.genLevel, api.rng));
  const [phase, setPhase] = useState<'study' | 'cover' | 'answer'>('study');
  const [wrongCells, setWrongCells] = useState<number[]>([]);
  const [wrongOpts, setWrongOpts] = useState<number[]>([]);
  const [found, setFound] = useState<number | null>(null);

  useEffect(() => {
    if (phase === 'study') { const id = setTimeout(() => setPhase('cover'), round.studyMs); return () => clearTimeout(id); }
    if (phase === 'cover') { const id = setTimeout(() => setPhase('answer'), 700); return () => clearTimeout(id); }
  }, [phase, round.studyMs]);

  const scene = phase === 'study' ? round.before : round.after;
  const tapCell = (i: number) => {
    if (phase !== 'answer' || round.kind === 'missing' || found !== null || wrongCells.includes(i)) return;
    if (round.answerCells.includes(i)) { setFound(i); setTimeout(() => api.correct(), 700); }
    else { setWrongCells([...wrongCells, i]); api.wrong(); }
  };
  const choose = (i: number) => {
    if (found !== null || wrongOpts.includes(i)) return;
    if (i === round.correctIndex) { setFound(i); setTimeout(() => api.correct(), 650); }
    else { setWrongOpts([...wrongOpts, i]); api.wrong(); }
  };

  const question = phase === 'study' ? 'انظر جيدًا وتذكّر…'
    : phase === 'cover' ? '👀'
    : round.kind === 'missing' ? 'ما الذي اختفى؟'
    : round.kind === 'new' ? 'ما الشيء الجديد؟ المسه'
    : 'شيئان تبادلا مكانيهما، المس أحدهما';

  return (
    <View style={{ flex: 1, padding: 16, alignItems: 'center' }}>
      <Prompt>{question}</Prompt>
      {phase === 'study' && <StudyBar ms={round.studyMs} />}
      <View style={[styles.scene, { backgroundColor: t.card, maxWidth: round.columns * 104 }]}>
        {phase === 'cover'
          ? <Animated.View entering={FadeIn} style={styles.curtain}><Text style={{ fontSize: 72 }}>🙈</Text></Animated.View>
          : scene.map((e, i) => {
            const hinted = phase === 'answer' && api.hint && round.answerCells.includes(i);
            const bg = found === i || (found !== null && round.answerCells.includes(i)) ? t.successBg : hinted ? t.hintBg : t.bg;
            return (
              <Pressy key={i} sound={false} onPress={() => tapCell(i)} accessibilityLabel={e || 'مكان فارغ'}
                style={[styles.sceneCell, { width: `${100 / round.columns - 4}%`, backgroundColor: bg, opacity: wrongCells.includes(i) ? 0.35 : 1, borderStyle: e ? 'solid' : 'dashed', borderColor: e ? 'transparent' : t.primary }]}>
                <Text style={{ fontSize: 44 }}>{e || '❔'}</Text>
              </Pressy>
            );
          })}
      </View>
      {phase === 'answer' && round.kind === 'missing' && (
        <View style={[styles.grid, { marginTop: 16 }]}>
          {round.options.map((o, i) => {
            const state: OptionState = found === i ? 'correct' : wrongOpts.includes(i) ? 'wrong' : api.hint && i === round.correctIndex ? 'hint' : 'idle';
            return <OptionTile key={i} state={state} width={round.options.length === 3 ? '30%' : '22%'} height={80} onPress={() => choose(i)}><Text style={{ fontSize: 40 }}>{o}</Text></OptionTile>;
          })}
        </View>
      )}
      {phase === 'answer' && found === null && (
        <BigButton small label="أرني مرة أخرى" icon="👀" color={t.card} textColor={t.text} onPress={() => setPhase('study')} style={{ marginTop: 16 }} />
      )}
    </View>
  );
}

// ── Mirror ───────────────────────────────────────────────────────────────
export function MirrorGame({ api }: { api: GameApi }) {
  const t = useTheme();
  const round = useMemo(() => N.mirrorRound(api.genLevel, api.rng), [api.roundKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const [filled, setFilled] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [w, setW] = useState(0);
  const cell = w ? Math.min(64, (w - (round.cols - 1) * 4) / round.cols) : 0;
  const color = '#D946EF';
  const nextHint = api.hint ? round.targets.find((x) => !filled.includes(x)) : undefined;
  const isSource = (i: number) => {
    const r = Math.floor(i / round.cols), c = i % round.cols;
    return round.axis === 'vertical' ? c < round.cols / 2 : r < round.rows / 2;
  };

  const tap = (i: number) => {
    if (isSource(i) || filled.includes(i) || filled.length === round.targets.length) return;
    if (!round.targets.includes(i)) { api.wrong(); setWrong(i); setTimeout(() => setWrong(null), 500); return; }
    play('pop');
    const next = [...filled, i];
    setFilled(next);
    if (next.length === round.targets.length) setTimeout(() => api.correct(), 600);
  };

  return (
    <View style={{ flex: 1, padding: 16, alignItems: 'center' }} onLayout={(e) => setW(Math.min(e.nativeEvent.layout.width - 32, 420))}>
      <Prompt>{round.axis === 'vertical' ? 'لوّن النصف الأيمن ليطابق الأيسر كالمرآة' : 'لوّن النصف السفلي ليطابق العلوي كالمرآة'}</Prompt>
      {cell > 0 && (
        <View style={{ width: round.cols * cell + (round.cols - 1) * 4, flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {Array.from({ length: round.rows * round.cols }, (_, i) => {
            const src = isSource(i);
            const on = src ? round.given.includes(i) : filled.includes(i);
            const bg = on ? color : wrong === i ? t.soft : nextHint === i ? t.hintBg : src ? t.cardAlt : t.card;
            return <Pressy key={i} sound={false} onPress={() => tap(i)} accessibilityLabel={src ? 'نموذج' : 'خانة'}
              style={{ width: cell, height: cell, borderRadius: 8, backgroundColor: bg, borderWidth: 2, borderColor: src ? 'transparent' : t.border }} />;
          })}
          {/* mirror line */}
          <View pointerEvents="none" style={round.axis === 'vertical'
            ? { position: 'absolute', left: (round.cols / 2) * (cell + 4) - 4, top: -6, bottom: -6, width: 4, borderRadius: 2, backgroundColor: t.primary }
            : { position: 'absolute', top: (round.rows / 2) * (cell + 4) - 4, left: -6, right: -6, height: 4, borderRadius: 2, backgroundColor: t.primary }} />
        </View>
      )}
      <Text style={[font.small, { color: t.textMuted, marginTop: 14 }]}>{`${filled.length} / ${round.targets.length}`}</Text>
    </View>
  );
}

// ── Waste sorting ────────────────────────────────────────────────────────
export function RecyclingGame({ api }: { api: GameApi }) {
  const t = useTheme();
  const bins = N.binsFor(api.genLevel).length;
  return (
    <ChoiceGame api={api} generate={N.recyclingRound} columns={bins <= 3 ? bins : bins === 4 ? 2 : 3} optionHeight={110}
      renderPrompt={(r, replay) => (
        <Pressy sound={false} onPress={replay} style={{ alignItems: 'center' }} accessibilityLabel={r.prompt.item.ar}>
          <Text style={{ fontSize: 110 }}>{r.prompt.item.emoji}</Text>
          <Text style={[font.h2, { color: t.text }]}>{r.prompt.item.ar}</Text>
          <Text style={[font.small, { color: t.textMuted }]}>في أي حاوية نضعها؟</Text>
        </Pressy>
      )}
      renderOption={(b) => (
        <View style={{ alignItems: 'center', gap: 4 }}>
          <View style={[styles.bin, { backgroundColor: N.BINS[b].color }]}>
            <Text style={{ fontSize: 30 }}>{N.BINS[b].emoji}</Text>
            <Text style={{ fontSize: 18 }}>♻️</Text>
          </View>
          <Text style={[font.body, { color: t.text }]}>{N.BINS[b].ar}</Text>
        </View>
      )} />
  );
}

const styles = StyleSheet.create({
  shelf: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderRadius: radius.lg, padding: 12 },
  tag: { borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 4, marginTop: 6 },
  coin: { borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(0,0,0,0.15)' },
  note: { borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  purse: { minHeight: 92, borderRadius: radius.lg, borderWidth: 2, borderStyle: 'dashed', padding: 10, marginTop: 14, alignItems: 'center' },
  trayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 6 },
  wallet: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', direction: 'ltr' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', alignSelf: 'stretch' },
  bar: { height: 8, borderRadius: 4, overflow: 'hidden', alignSelf: 'stretch', marginBottom: 12 },
  barFill: { height: '100%', borderRadius: 4 },
  scene: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, borderRadius: radius.lg, padding: 12, width: '100%', minHeight: 200, alignItems: 'center' },
  sceneCell: { aspectRatio: 1, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  curtain: { flex: 1, minHeight: 200, alignItems: 'center', justifyContent: 'center' },
  bin: { width: 64, height: 70, borderTopLeftRadius: 10, borderTopRightRadius: 10, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
