import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type HostInstance } from 'react-native';
import { Text } from '@/ui/components/Text';
import Animated, { FadeIn, ZoomIn, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming, Easing } from 'react-native-reanimated';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import * as N from '@/domain/games/newGames';
import { play } from '@/audio/sfx';
import { speak } from '@/audio/speech';
import { OptionTile, type OptionState } from '../components/ChoiceGame';
import type { GameApi } from '../components/GameShell';
import { Pressy } from '../components/Pressy';
import { BigButton } from '../components/BigButton';
import { font, radius, useTheme } from '../theme/theme';
import { RoomScene } from './room/RoomScene';
import { WheelieBin } from './waste/WheelieBin';
import { Awning, Money } from './market/Money';

function Prompt({ children }: { children: string }) {
  const t = useTheme();
  return <Text style={[font.body, { color: t.textMuted, textAlign: 'center', marginVertical: 8 }]}>{children}</Text>;
}

// ── Little market ────────────────────────────────────────────────────────
export function MarketGame({ api }: { api: GameApi }) {
  const t = useTheme();
  const [round] = useState(() => N.marketRound(api.genLevel, api.rng));
  const [tray, setTray] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [wrongOpts, setWrongOpts] = useState<number[]>([]);
  const [over, setOver] = useState(false);
  const [shopW, setShopW] = useState(0);
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
    <Animated.View entering={FadeIn} style={[styles.shop, { backgroundColor: t.card }]} onLayout={(e) => setShopW(e.nativeEvent.layout.width)}>
      {shopW > 0 && <Awning width={shopW} />}
      <View style={styles.shelfRow}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 84 }}>{round.item.emoji}</Text>
          <View style={styles.counter} />
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={[font.h2, { color: t.text }]}>{round.item.ar}</Text>
          <View style={styles.priceTag}>
            <View style={styles.tagHole} />
            <Text style={[font.h2, { color: '#7C2D12' }]}>السعر {round.price}</Text>
          </View>
        </View>
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
  const [wrongSpots, setWrongSpots] = useState<number[]>([]);
  const [wrongOpts, setWrongOpts] = useState<number[]>([]);
  const [found, setFound] = useState<number | null>(null);
  const [w, setW] = useState(0);

  useEffect(() => {
    if (phase === 'study') { const id = setTimeout(() => setPhase('cover'), round.studyMs); return () => clearTimeout(id); }
    if (phase === 'cover') { const id = setTimeout(() => setPhase('answer'), 1100); return () => clearTimeout(id); }
  }, [phase, round.studyMs]);

  const tapSpot = (i: number) => {
    if (phase !== 'answer' || round.kind === 'missing' || found !== null || wrongSpots.includes(i)) return;
    if (round.answerCells.includes(i)) { play('pop'); setFound(i); setTimeout(() => api.correct(), 800); }
    else { setWrongSpots([...wrongSpots, i]); api.wrong(); }
  };
  const choose = (i: number) => {
    if (found !== null || wrongOpts.includes(i)) return;
    if (i === round.correctIndex) { setFound(i); setTimeout(() => api.correct(), 650); }
    else { setWrongOpts([...wrongOpts, i]); api.wrong(); }
  };

  const question = phase === 'study' ? 'انظر إلى الغرفة جيدًا وتذكّر أين كل شيء…'
    : phase === 'cover' ? ' '
    : round.kind === 'missing' ? 'شيء اختفى من الغرفة! ما هو؟'
    : round.kind === 'new' ? 'شيء جديد ظهر في الغرفة! المسه'
    : 'شيئان تبادلا مكانيهما، المس أحدهما';
  const shownFound = found === null ? [] : round.kind === 'missing' ? [] : round.answerCells;

  return (
    <View style={{ flex: 1, padding: 12, alignItems: 'center' }} onLayout={(e) => setW(Math.min(e.nativeEvent.layout.width - 24, 560))}>
      <Prompt>{question}</Prompt>
      {phase === 'study' && <StudyBar ms={round.studyMs} />}
      {w > 0 && (
        <RoomScene
          width={w}
          scene={phase === 'study' ? round.before : round.after}
          dark={phase === 'cover'}
          onTap={tapSpot}
          found={shownFound}
          wrong={wrongSpots}
          hintSpot={phase === 'answer' && api.hint && found === null ? round.answerCells[0] : undefined}
        />
      )}
      {phase === 'answer' && round.kind === 'missing' && (
        <View style={[styles.grid, { marginTop: 16 }]}>
          {round.options.map((o, i) => {
            const state: OptionState = found === i ? 'correct' : wrongOpts.includes(i) ? 'wrong' : api.hint && i === round.correctIndex ? 'hint' : 'idle';
            return (
              <OptionTile key={i} state={state} width={round.options.length === 3 ? '30%' : '22%'} height={84} onPress={() => choose(i)}>
                <Text style={{ fontSize: 40 }}>{o}</Text>
                <Text style={[font.small, { color: t.textMuted, fontSize: 11 }]} numberOfLines={1}>{N.roomItemName(o)}</Text>
              </OptionTile>
            );
          })}
        </View>
      )}
      {phase === 'answer' && found === null && (
        <BigButton small label="أرني الغرفة مرة أخرى" icon="👀" color={t.card} textColor={t.text} onPress={() => setPhase('study')} style={{ marginTop: 14 }} />
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
type Box = { x: number; y: number; w: number; h: number };

/** Drag the thing into the right wheelie bin (or tap the bin). The lid opens and swallows it. */
export function RecyclingGame({ api }: { api: GameApi }) {
  const t = useTheme();
  const [round] = useState(() => N.recyclingRound(api.genLevel, api.settings, api.rng));
  const bins = round.options;
  const [area, setArea] = useState(0);
  const [opened, setOpened] = useState<number[]>(() => bins.map(() => 0));
  const [wobble, setWobble] = useState<number[]>(() => bins.map(() => 0));
  const [done, setDone] = useState(false);
  const binViews = useRef<(HostInstance | null)[]>([]);
  const binBoxes = useRef<(Box | null)[]>([]);
  const itemView = useRef<HostInstance | null>(null);
  const tx = useSharedValue(0), ty = useSharedValue(0), sc = useSharedValue(1);
  const binW = area ? Math.min(118, (area - (bins.length - 1) * 10) / bins.length) : 0;

  useEffect(() => {
    const id = setTimeout(() => speak(round.prompt.item.ar, 'ar'), 300);
    return () => clearTimeout(id);
  }, [round]);

  const measureBins = () => binViews.current.forEach((v, i) => v?.measureInWindow((x, y, w, h) => { binBoxes.current[i] = { x, y, w, h }; }));
  const bump = (arr: number[], i: number) => arr.map((n, j) => (j === i ? n + 1 : n));
  const back = () => { tx.set(withSpring(0)); ty.set(withSpring(0)); };

  const drop = (i: number, from: { x: number; y: number }) => {
    if (done) return;
    if (i !== round.correctIndex) {
      setWobble((w) => bump(w, i)); api.wrong(); back();
      return;
    }
    setDone(true);
    setOpened((o) => bump(o, i));
    const box = binBoxes.current[i];
    if (box) {
      tx.set(withTiming(tx.value + box.x + box.w / 2 - from.x, { duration: 320 }));
      ty.set(withTiming(ty.value + box.y + box.h * 0.12 - from.y, { duration: 320 }));
    }
    sc.set(withDelay(160, withTiming(0.1, { duration: 260 })));
    setTimeout(() => play('pop'), 300);
    setTimeout(() => api.correct(), 950);
  };

  // Tapping a bin works too (accessibility, very young children).
  const tapBin = (i: number) => {
    measureBins();
    itemView.current?.measureInWindow((x, y, w, h) => setTimeout(() => drop(i, { x: x + w / 2, y: y + h / 2 }), 30));
  };

  const pan = usePanGesture({
    runOnJS: true,
    minDistance: 4,
    enabled: !done,
    onActivate: () => measureBins(),
    onUpdate: (e) => { tx.set(e.translationX); ty.set(e.translationY); },
    onDeactivate: (e) => {
      const hit = binBoxes.current.findIndex((b) => b && e.absoluteX >= b.x - 12 && e.absoluteX <= b.x + b.w + 12 && e.absoluteY >= b.y - 30 && e.absoluteY <= b.y + b.h);
      if (hit >= 0) drop(hit, { x: e.absoluteX, y: e.absoluteY }); else back();
    },
  });
  const itemStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: sc.value }] }));

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'space-between' }} onLayout={(e) => setArea(e.nativeEvent.layout.width - 32)}>
      {/* zIndex keeps the dragged item above the bins */}
      <View style={{ alignItems: 'center', zIndex: 10, elevation: 10 }}>
        <Prompt>اسحب الشيء إلى الحاوية الصحيحة</Prompt>
        <View ref={itemView} collapsable={false}>
          <GestureDetector gesture={pan}>
            <Animated.View style={[styles.wasteItem, { backgroundColor: t.card }, itemStyle]} accessibilityLabel={round.prompt.item.ar}>
              <Text style={{ fontSize: 76 }}>{round.prompt.item.emoji}</Text>
              <Text style={[font.body, { color: t.text }]}>{round.prompt.item.ar}</Text>
            </Animated.View>
          </GestureDetector>
        </View>
      </View>
      <View style={[styles.ground, { backgroundColor: t.dark ? '#334155' : '#D6D3D1' }]}>
        <View style={styles.binsRow}>
          {binW > 0 && bins.map((b, i) => (
            <Pressy key={b} sound={false} onPress={() => tapBin(i)} accessibilityLabel={`حاوية ${N.BINS[b].ar}`}>
              <View ref={(v) => { binViews.current[i] = v; }} collapsable={false}>
                <WheelieBin bin={b} width={binW} open={opened[i]} wobble={wobble[i]} glow={api.hint && i === round.correctIndex && !done} />
              </View>
            </Pressy>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shop: { borderRadius: radius.lg, overflow: 'hidden', paddingBottom: 12, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  shelfRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingTop: 6 },
  counter: { width: 110, height: 10, borderRadius: 5, backgroundColor: '#B07D4F', marginTop: -6 },
  priceTag: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FED7AA', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 4, marginTop: 8, borderWidth: 2, borderColor: '#FB923C', transform: [{ rotate: '-4deg' }] },
  tagHole: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF' },
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
  wasteItem: { alignItems: 'center', borderRadius: radius.lg, paddingHorizontal: 22, paddingVertical: 10, marginTop: 8, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 5 }, elevation: 5, zIndex: 10 },
  ground: { borderRadius: radius.lg, paddingTop: 14, paddingBottom: 10, paddingHorizontal: 8, borderTopWidth: 6, borderTopColor: 'rgba(0,0,0,0.08)' },
  binsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 10 },
});
