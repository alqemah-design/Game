import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/ui/components/Text';
import Animated, { FadeIn, ZoomIn, useAnimatedStyle, useSharedValue, withTiming, interpolate } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, Pattern, Rect, Stop } from 'react-native-svg';
import * as B from '@/domain/games/boardGames';
import { useI18n } from '@/i18n';
import { COLORS } from '@/domain/content/shapes';
import { play } from '@/audio/sfx';
import { speak } from '@/audio/speech';
import type { GameApi } from '../components/GameShell';
import { Pressy } from '../components/Pressy';
import { ShapeIcon } from '../components/ShapeIcon';
import { font, radius, raised, useTheme } from '../theme/theme';

const PAIR_COLORS = ['#F87171', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#F472B6', '#2DD4BF', '#FB923C'];

function Prompt({ children }: { children: string }) {
  const t = useTheme();
  const { dir } = useI18n();
  return <Text style={[font.body, { color: t.textMuted, textAlign: 'center', marginVertical: 8, writingDirection: dir }]}>{children}</Text>;
}

// ── Shape match: tap a shape, then tap its outline ───────────────────────
export function ShapeMatchGame({ api }: { api: GameApi }) {
  const { t: tr } = useI18n();
  const t = useTheme();
  const board = useMemo(() => B.shapeBoard(api.genLevel, api.rng), [api.roundKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const [selected, setSelected] = useState<string | null>(null);
  const [placed, setPlaced] = useState<string[]>([]);
  const [hadMistake, setHadMistake] = useState(false);
  const size = board.pieces.length <= 4 ? 76 : board.pieces.length <= 6 ? 64 : 54;
  const hintId = api.hint ? selected ?? board.pieces.find((p) => !placed.includes(p.id))?.id : null;

  const tapSlot = (id: string) => {
    if (!selected || placed.includes(id)) return;
    if (selected === id) {
      play('pop');
      const next = [...placed, id];
      setPlaced(next);
      setSelected(null);
      if (next.length === board.pieces.length) setTimeout(() => api.correct(hadMistake ? api.basePoints - 1 : undefined), 400);
    } else {
      setHadMistake(true);
      api.wrong();
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Prompt>{tr('boards.shapePrompt')}</Prompt>
      <View style={[styles.area, { backgroundColor: t.card }]}>
        {board.slots.map((p) => (
          <Pressy key={p.id} sound={false} onPress={() => tapSlot(p.id)} accessibilityLabel={tr('boards.shapeSlot')} style={[styles.cell, hintId === p.id && { backgroundColor: t.hintBg }]}>
            {placed.includes(p.id)
              ? <Animated.View entering={ZoomIn}><ShapeIcon shape={p.shape} color={COLORS[p.color].hex} size={size} /></Animated.View>
              : <ShapeIcon shape={p.shape} color={api.genLevel >= 9 ? COLORS[p.color].hex : t.textMuted} size={size} outline />}
          </Pressy>
        ))}
      </View>
      <View style={[styles.area, { backgroundColor: 'transparent' }]}>
        {board.pieces.map((p) => !placed.includes(p.id) && (
          <Pressy key={p.id} onPress={() => setSelected(p.id)} accessibilityLabel={tr('boards.shape')}
            style={[styles.cell, { borderColor: selected === p.id ? t.primary : 'transparent', borderWidth: 4, borderRadius: radius.md }, hintId === p.id && { backgroundColor: t.hintBg }]}>
            <ShapeIcon shape={p.shape} color={COLORS[p.color].hex} size={size} />
          </Pressy>
        ))}
      </View>
    </View>
  );
}

function LetterTile({ l, onPress, active, matched, sel, hint }: { l: string; onPress: () => void; active: boolean; matched: string[]; sel: string | null; hint: boolean }) {
  const t = useTheme();
  const done = matched.includes(l.toUpperCase());
  const hinted = hint && sel && l.toUpperCase() === sel && !done;
  const color = PAIR_COLORS[matched.indexOf(l.toUpperCase()) % PAIR_COLORS.length];
  return (
    <Pressy onPress={onPress} accessibilityLabel={l}
      style={[styles.letter, raised(t, done ? color : hinted ? t.hintBg : t.card), active && { borderColor: t.primary, borderWidth: 4, borderBottomWidth: 6 }]}>
      <Text style={{ fontSize: 40, fontWeight: '800', color: done ? '#FFF' : t.text }}>{l}</Text>
    </Pressy>
  );
}

// ── Capital ↔ small ─────────────────────────────────────────────────────
export function CapitalSmallGame({ api }: { api: GameApi }) {
  const { t: tr } = useI18n();
  const { capitals, smalls } = useMemo(() => B.capitalPairs(api.genLevel, api.rng), [api.roundKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const [sel, setSel] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);

  const tapSmall = (s: string) => {
    if (!sel || matched.includes(s.toUpperCase())) return;
    if (s.toUpperCase() === sel) {
      play('pop'); speak(sel, 'en');
      const next = [...matched, sel];
      setMatched(next); setSel(null);
      if (next.length === capitals.length) setTimeout(() => api.correct(), 400);
    } else api.wrong();
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Prompt>{tr('boards.casePrompt')}</Prompt>
      <View style={styles.columns}>
        <View style={styles.col}>{capitals.map((c) => <LetterTile key={c} l={c} active={sel === c} matched={matched} sel={sel} hint={api.hint} onPress={() => !matched.includes(c) && setSel(c)} />)}</View>
        <View style={styles.col}>{smalls.map((s) => <LetterTile key={s} l={s} active={false} matched={matched} sel={sel} hint={api.hint} onPress={() => tapSmall(s)} />)}</View>
      </View>
    </View>
  );
}

// ── Memory cards ─────────────────────────────────────────────────────────
/** Playing-card back: purple gradient, star lattice and a centre medallion. */
function CardBack({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 1.2} viewBox="0 0 100 120">
      <Defs>
        <LinearGradient id="cb-bg" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#A78BFA" /><Stop offset="1" stopColor="#5B21B6" /></LinearGradient>
        <Pattern id="cb-pat" patternUnits="userSpaceOnUse" width="16" height="16">
          <Path d="M8 2 L9.6 6.4 L14 8 L9.6 9.6 L8 14 L6.4 9.6 L2 8 L6.4 6.4 Z" fill="#FFFFFF" opacity={0.22} />
        </Pattern>
      </Defs>
      <Rect x="0" y="0" width="100" height="120" rx="12" fill="url(#cb-bg)" />
      <Rect x="0" y="0" width="100" height="120" rx="12" fill="url(#cb-pat)" />
      <Rect x="6" y="6" width="88" height="108" rx="9" fill="none" stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth="2.5" />
      <Circle cx="50" cy="60" r="20" fill="#FDE047" stroke="#FFFFFF" strokeWidth="3" />
      <Path d="M50 46 L53.5 55.5 L63 56 L55.5 62 L58 71 L50 66 L42 71 L44.5 62 L37 56 L46.5 55.5 Z" fill="#F59E0B" />
      <Path d="M10 20 Q30 8 52 10" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity={0.35} fill="none" />
    </Svg>
  );
}

function Card({ symbol, up, done, onPress, size }: { symbol: string; up: boolean; done: boolean; onPress: () => void; size: number }) {
  const { t: tr } = useI18n();
  const t = useTheme();
  const v = useSharedValue(0);
  useEffect(() => { v.set(withTiming(up || done ? 1 : 0, { duration: 250 })); }, [up, done, v]);
  const front = useAnimatedStyle(() => ({ transform: [{ perspective: 600 }, { rotateY: `${interpolate(v.value, [0, 1], [180, 360])}deg` }], opacity: v.value > 0.5 ? 1 : 0 }));
  const back = useAnimatedStyle(() => ({ transform: [{ perspective: 600 }, { rotateY: `${interpolate(v.value, [0, 1], [0, 180])}deg` }], opacity: v.value > 0.5 ? 0 : 1 }));
  return (
    <Pressy sound={false} onPress={onPress} style={{ width: size, height: size * 1.2 }} accessibilityLabel={up || done ? symbol : tr('boards.cardDown')}>
      <Animated.View style={[styles.card, styles.cardBack, back]}><CardBack size={size} /></Animated.View>
      <Animated.View style={[styles.card, raised(t, done ? t.successBg : t.card), front]}><Text style={{ fontSize: size * 0.5 }}>{symbol}</Text></Animated.View>
    </Pressy>
  );
}

export function MemoryGame({ api }: { api: GameApi }) {
  const { t: tr } = useI18n();
  const t = useTheme();
  const { cards, columns } = useMemo(() => B.memoryDeck(api.genLevel, api.rng), [api.roundKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const [open, setOpen] = useState<number[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [moves, setMoves] = useState(0);
  const [w, setW] = useState(0);
  const size = w ? Math.min(110, (w - (columns - 1) * 10) / columns) : 0;

  const flip = (i: number) => {
    if (busy || open.includes(i) || done.includes(cards[i].symbol)) return;
    play('flip');
    const next = [...open, i];
    setOpen(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = next;
    if (cards[a].symbol === cards[b].symbol) {
      const d = [...done, cards[a].symbol];
      setBusy(true);
      setTimeout(() => { play('pop'); setDone(d); setOpen([]); setBusy(false); }, 300);
      if (d.length * 2 === cards.length) {
        // Points rise with level; fewer extra moves = more points.
        const extra = Math.max(0, moves + 1 - cards.length / 2);
        setTimeout(() => api.correct(Math.max(api.basePoints - extra, Math.ceil(api.basePoints / 2))), 700);
      }
    } else {
      setBusy(true);
      setTimeout(() => { setOpen([]); setBusy(false); }, 850);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }} onLayout={(e) => setW(e.nativeEvent.layout.width - 32)}>
      <Prompt>{tr('boards.memoryPrompt', { moves })}</Prompt>
      {size > 0 && (
        <View style={[styles.memGrid, { gap: 10 }]}>
          {cards.map((c, i) => <Card key={c.id} symbol={c.symbol} size={size} up={open.includes(i)} done={done.includes(c.symbol)} onPress={() => flip(i)} />)}
        </View>
      )}
      {api.hint && <Text style={[font.small, { color: t.textMuted, textAlign: 'center' }]}>{tr('boards.memoryHint')}</Text>}
    </View>
  );
}

// ── Word builder ─────────────────────────────────────────────────────────
export function WordBuilderGame({ api }: { api: GameApi }) {
  const { lang } = useI18n();
  const t = useTheme();
  const { word, tiles } = useMemo(() => B.wordChallenge(api.genLevel, api.rng), [api.roundKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const [picked, setPicked] = useState<number[]>([]);
  const [error, setError] = useState(false);
  const built = picked.map((i) => tiles[i]).join('');

  useEffect(() => {
    const id = setTimeout(() => speak(word.word.toLowerCase(), 'en'), 300);
    return () => clearTimeout(id);
  }, [word]);

  const tap = (i: number) => {
    if (picked.includes(i) || built.length >= word.word.length) return;
    const next = [...picked, i];
    const str = next.map((j) => tiles[j]).join('');
    if (!word.word.startsWith(str)) {
      setError(true); api.wrong();
      setTimeout(() => setError(false), 500);
      return;
    }
    play('pop');
    setPicked(next);
    if (str === word.word) { speak(word.word.toLowerCase(), 'en'); setTimeout(() => api.correct(), 700); }
  };
  const hintIndex = api.hint ? tiles.findIndex((l, i) => !picked.includes(i) && l === word.word[built.length]) : -1;

  return (
    <View style={{ flex: 1, padding: 16, alignItems: 'center' }}>
      <Pressy sound={false} onPress={() => speak(word.word.toLowerCase(), 'en')} style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 110 }}>{word.emoji}</Text>
        {lang === 'ar' && <Text style={[font.body, { color: t.textMuted }]}>{word.ar}</Text>}
      </Pressy>
      <View style={styles.slots}>
        {word.word.split('').map((_, i) => (
          <View key={i} style={[styles.slot, { borderColor: error && i === built.length ? '#F87171' : t.primary, backgroundColor: built[i] ? t.successBg : t.card }]}>
            <Text style={{ fontSize: 30, fontWeight: '800', color: t.text }}>{built[i] ?? ''}</Text>
          </View>
        ))}
      </View>
      <View style={styles.tiles}>
        {tiles.map((l, i) => (
          <Pressy key={i} sound={false} onPress={() => tap(i)} disabled={picked.includes(i)}
            style={[styles.tile, raised(t, i === hintIndex ? t.hintBg : t.cardAlt), { opacity: picked.includes(i) ? 0.25 : 1 }]}>
            <Text style={{ fontSize: 32, fontWeight: '800', color: t.text }}>{l}</Text>
          </Pressy>
        ))}
      </View>
      {picked.length > 0 && built !== word.word && <Pressy onPress={() => setPicked((p) => p.slice(0, -1))} style={[styles.undo, raised(t)]}><Text style={[font.body, { color: t.text }]}>⌫</Text></Pressy>}
    </View>
  );
}

// ── Sorting numbers ──────────────────────────────────────────────────────
export function SortingGame({ api }: { api: GameApi }) {
  const { t: tr } = useI18n();
  const t = useTheme();
  const nums = useMemo(() => B.sortingSet(api.genLevel, api.rng), [api.roundKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const sorted = useMemo(() => [...nums].sort((a, b) => a - b), [nums]);
  const [done, setDone] = useState<number[]>([]);
  const tap = (n: number) => {
    if (done.includes(n)) return;
    if (n !== sorted[done.length]) return api.wrong();
    play('pop');
    const next = [...done, n];
    setDone(next);
    if (next.length === nums.length) setTimeout(() => api.correct(), 500);
  };
  const big = nums.length <= 5;
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Prompt>{tr('boards.sortPrompt')}</Prompt>
      <View style={[styles.slots, { flexWrap: 'wrap', minHeight: 70 }]}>
        {done.map((n) => <Animated.View key={n} entering={ZoomIn} style={[styles.chip, { backgroundColor: t.successBg }]}><Text style={[font.h2, { color: t.text }]}>{n}</Text></Animated.View>)}
      </View>
      <View style={styles.tiles}>
        {nums.map((n) => !done.includes(n) && (
          <Pressy key={n} sound={false} onPress={() => tap(n)}
            style={[styles.numTile, raised(t, api.hint && n === sorted[done.length] ? t.hintBg : t.card), { width: big ? 96 : 76, height: big ? 96 : 76 }]}>
            <Text style={{ fontSize: big ? 36 : 28, fontWeight: '800', color: t.text }}>{n}</Text>
          </Pressy>
        ))}
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  area: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, borderRadius: radius.lg, padding: 12, marginVertical: 8 },
  cell: { padding: 6, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  columns: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  col: { justifyContent: 'space-evenly', gap: 10 },
  letter: { width: 84, height: 72, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  memGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  cardBack: { overflow: 'hidden', backgroundColor: 'transparent' },
  card: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backfaceVisibility: 'hidden' },
  slots: { flexDirection: 'row', gap: 8, marginVertical: 20, justifyContent: 'center' },
  slot: { width: 50, height: 60, borderRadius: 12, borderBottomWidth: 4, alignItems: 'center', justifyContent: 'center' },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  tile: { width: 66, height: 66, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  undo: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 10, borderRadius: radius.pill },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.md },
  numTile: { borderRadius: radius.md, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
});
export { FadeIn };
