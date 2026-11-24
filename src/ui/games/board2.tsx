import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import Animated, { ZoomIn, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as B from '@/domain/games/boardGames';
import { aiMove, winner, type Board } from '@/domain/games/ticTacToe';
import { COLORS } from '@/domain/content/shapes';
import type { Difficulty } from '@/domain/types';
import { play } from '@/audio/sfx';
import type { GameApi } from '../components/GameShell';
import { Pressy } from '../components/Pressy';
import { BigButton } from '../components/BigButton';
import { font, radius, raised, useTheme } from '../theme/theme';

function Prompt({ children }: { children: string }) {
  const t = useTheme();
  return <Text style={[font.body, { color: t.textMuted, textAlign: 'center', marginVertical: 8, writingDirection: 'rtl' }]}>{children}</Text>;
}

// ── Tic-tac-toe vs Minimax ───────────────────────────────────────────────
/** X and O drawn as shapes with the same box and stroke, so they look equal on every device font. */
function Mark({ player }: { player: 'X' | 'O' }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 100">
      {player === 'X'
        ? <Path d="M18 18 L82 82 M82 18 L18 82" stroke="#EF4444" strokeWidth={14} strokeLinecap="round" />
        : <Circle cx={50} cy={50} r={34} stroke="#3B82F6" strokeWidth={14} fill="none" />}
    </Svg>
  );
}

export function TicTacToeGame({ api }: { api: GameApi }) {
  const t = useTheme();
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  // Child starts on odd rounds, robot on even ones – practising both openings.
  const robotStarts = api.roundKey % 2 === 0;
  const [thinking, setThinking] = useState(robotStarts);
  // The robot gets stronger with level (difficulty setting already folded into genLevel).
  const ai: Difficulty = api.genLevel <= 2 ? 'easy' : api.genLevel <= 5 ? 'normal' : 'hard';
  const aiTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(aiTimer.current), []);
  const result = winner(board);
  // A stable value for the effect: `winner()` returns a new object every render, which previously
  // re-ran the effect after each render and reported a loss hundreds of times per second.
  const outcome = result === null ? null : result === 'draw' ? 'draw' : result.player;

  useEffect(() => {
    if (robotStarts && board.every((c) => !c)) {
      const id = setTimeout(() => { setBoard((b) => { const n = b.slice(); n[aiMove(b, 'O', ai, api.rng)] = 'O'; return n; }); setThinking(false); }, 500);
      return () => clearTimeout(id);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!outcome) return;
    let id: ReturnType<typeof setTimeout>;
    if (outcome === 'draw') id = setTimeout(() => api.correct(Math.ceil(api.basePoints / 2)), 900);
    else if (outcome === 'X') id = setTimeout(() => api.correct(), 900);
    else { api.wrong(); id = setTimeout(api.restartRound, 1400); }
    return () => clearTimeout(id);
  }, [outcome]); // eslint-disable-line react-hooks/exhaustive-deps

  const tap = (i: number) => {
    if (board[i] || result || thinking) return;
    play('pop');
    const b = board.slice(); b[i] = 'X';
    setBoard(b);
    if (winner(b)) return;
    setThinking(true);
    aiTimer.current = setTimeout(() => {
      const m = aiMove(b, 'O', ai, api.rng);
      const n = b.slice(); n[m] = 'O';
      setBoard(n); setThinking(false);
    }, 450);
  };

  const line = result && result !== 'draw' ? result.line : [];
  const msg = result === 'draw' ? 'تعادل! أحسنت الدفاع 🤝' : result?.player === 'X' ? 'فزت! 🎉' : result ? 'فاز الروبوت هذه المرة، جرّب مجددًا 💪' : thinking ? 'الروبوت يفكر… 🤖' : 'دورك! أنت ❌';
  return (
    <View style={{ flex: 1, alignItems: 'center', padding: 16 }}>
      <Prompt>{msg}</Prompt>
      <View style={[styles.ttt, { backgroundColor: t.border }]}>
        {board.map((c, i) => (
          <Pressy key={i} sound={false} onPress={() => tap(i)} accessibilityLabel={c === 'X' ? 'إكس' : c === 'O' ? 'أو' : 'خانة فارغة'}
            style={[styles.tttCell, raised(t, line.includes(i) ? t.successBg : t.card)]}>
            {c && <Animated.View entering={ZoomIn} style={{ width: '62%', aspectRatio: 1 }}><Mark player={c} /></Animated.View>}
          </Pressy>
        ))}
      </View>
    </View>
  );
}

// ── Maze ─────────────────────────────────────────────────────────────────
export function MazeGame({ api }: { api: GameApi }) {
  const maze = useMemo(() => B.generateMaze(api.genLevel, api.rng), [api.roundKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const best = useMemo(() => B.shortestPath(maze), [maze]);
  const [pos, setPos] = useState<[number, number]>(maze.start);
  const [steps, setSteps] = useState(0);
  const [trail, setTrail] = useState<Set<number>>(new Set([maze.start[0] * maze.size + maze.start[1]]));
  const [w, setW] = useState(0);
  const [boxH, setBoxH] = useState(0);
  const won = useRef(false);
  const cell = w / maze.size;
  // Static layer: drawn once per maze/size, not on every step (up to 361 cells at 19×19).
  // Garden: sandy path, hedges with a lit top edge and leaf texture.
  const walls = useMemo(() => (
    <Svg style={{ position: 'absolute', left: 0, top: 0 }} width={w} height={w} viewBox={`0 0 ${maze.size} ${maze.size}`}>
      <Defs>
        <LinearGradient id="mz-path" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#FEF3C7" /><Stop offset="1" stopColor="#FDE68A" /></LinearGradient>
        <LinearGradient id="mz-hedge" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#4ADE80" /><Stop offset="0.45" stopColor="#16A34A" /><Stop offset="1" stopColor="#14532D" /></LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={maze.size} height={maze.size} fill="url(#mz-path)" />
      {maze.walls.flatMap((row, r) => row.map((wall, c) => wall && (
        <Rect key={r * maze.size + c} x={c - 0.02} y={r - 0.02} width={1.04} height={1.04} fill="url(#mz-hedge)" />
      )))}
      <G fill="#BBF7D0" opacity={0.5}>
        {maze.walls.flatMap((row, r) => row.map((wall, c) => wall && (r + c) % 2 === 0 && (
          <Circle key={`l${r * maze.size + c}`} cx={c + 0.3 + ((r * 7 + c * 3) % 5) * 0.1} cy={r + 0.35} r={0.09} />
        )))}
      </G>
    </Svg>
  ), [maze, w]);

  const move = (d: [number, number]) => {
    if (won.current) return;
    if (!B.canMove(maze, pos, d)) { play('tryAgain'); return; }
    const n: [number, number] = [pos[0] + d[0], pos[1] + d[1]];
    play('tap');
    setPos(n); setSteps((s) => s + 1);
    setTrail((tr) => new Set(tr).add(n[0] * maze.size + n[1]));
    if (n[0] === maze.goal[0] && n[1] === maze.goal[1]) {
      won.current = true;
      const efficient = steps + 1 <= best * 1.3;
      setTimeout(() => api.correct(efficient ? api.basePoints + 3 : undefined), 500);
    }
  };

  const swipe = usePanGesture({
    minDistance: 20,
    runOnJS: true,
    onDeactivate: (e) => {
      if (e.canceled) return;
      const horizontal = Math.abs(e.translationX) > Math.abs(e.translationY);
      move(horizontal ? [0, e.translationX > 0 ? 1 : -1] : [e.translationY > 0 ? 1 : -1, 0]);
    },
  });

  const bee = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(pos[1] * cell, { damping: 18 }) }, { translateY: withSpring(pos[0] * cell, { damping: 18 }) }],
  }));

  return (
    <View style={{ flex: 1, padding: 16, alignItems: 'center' }} onLayout={(e) => setBoxH(e.nativeEvent.layout.height)}>
      <Prompt>{`اسحب أو استخدم الأسهم • الخطوات: ${steps}`}</Prompt>
      <GestureDetector gesture={swipe}>
        {/* Square board that leaves room for the arrow pad (~300pt) on short screens. */}
        <View style={[styles.garden, { maxWidth: boxH ? Math.max(160, Math.min(520, boxH - 300)) : 520 }]} onLayout={(e) => setW(e.nativeEvent.layout.width - 8 /* frame */)}>
          {w > 0 && walls}
          {w > 0 && [...trail].map((k) => (
            <View key={k} style={{ position: 'absolute', left: (k % maze.size) * cell, top: Math.floor(k / maze.size) * cell, width: cell + 0.5, height: cell + 0.5, backgroundColor: 'rgba(251,191,36,0.45)', borderRadius: cell / 3 }} />
          ))}
          {w > 0 && <Text style={{ position: 'absolute', left: maze.goal[1] * cell, top: maze.goal[0] * cell, width: cell, fontSize: cell * 0.75, textAlign: 'center' }}>🌸</Text>}
          {w > 0 && <Animated.Text style={[{ position: 'absolute', left: 0, top: 0, width: cell, fontSize: cell * 0.75, textAlign: 'center' }, bee]}>🐝</Animated.Text>}
        </View>
      </GestureDetector>
      <View style={styles.pad}>
        <Arrow label="↑" onPress={() => move([-1, 0])} />
        <View style={{ flexDirection: 'row', gap: 64 }}>
          <Arrow label="←" onPress={() => move([0, -1])} />
          <Arrow label="→" onPress={() => move([0, 1])} />
        </View>
        <Arrow label="↓" onPress={() => move([1, 0])} />
      </View>
    </View>
  );
}

function Arrow({ label, onPress }: { label: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressy sound={false} onPress={onPress} accessibilityLabel={label} style={[styles.arrow, raised(t)]}>
      <Text style={{ fontSize: 30, color: t.text, fontWeight: '800' }}>{label}</Text>
    </Pressy>
  );
}

// ── Number memory ────────────────────────────────────────────────────────
export function NumberMemoryGame({ api }: { api: GameApi }) {
  const t = useTheme();
  const { seq, showMs } = useMemo(() => B.numberSequence(api.genLevel, api.rng), [api.roundKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const [phase, setPhase] = useState<'show' | 'input'>('show');
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (phase !== 'show') return;
    const id = setTimeout(() => setPhase('input'), showMs + (api.hint ? 1500 : 0));
    return () => clearTimeout(id);
  }, [phase, showMs, api.hint]);

  const submit = () => {
    if (phase !== 'input' || shake) return;
    if (input === seq) return api.correct();
    api.wrong(); setShake(true);
    setTimeout(() => { setShake(false); setInput(''); setPhase('show'); }, 700);
  };
  const key = (k: string) => {
    if (k === '⌫') return setInput((v) => v.slice(0, -1));
    if (input.length < seq.length) { play('tap'); setInput((v) => v + k); }
  };

  return (
    <View style={{ flex: 1, padding: 16, alignItems: 'center' }}>
      <Prompt>{phase === 'show' ? 'احفظ هذه الأرقام…' : 'اكتب الأرقام بنفس الترتيب'}</Prompt>
      <View style={[styles.display, { backgroundColor: t.card, borderColor: shake ? '#F87171' : t.border }]}>
        <Text style={{ fontSize: seq.length > 7 ? 38 : 48, fontWeight: '900', letterSpacing: 6, color: t.text }}>
          {phase === 'show' ? seq : input.padEnd(seq.length, '•')}
        </Text>
      </View>
      {phase === 'input' && (
        <>
          <View style={styles.numpad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0'].map((k) => (
              <Pressy key={k} sound={false} onPress={() => key(k)} style={[styles.key, raised(t, t.cardAlt)]}>
                <Text style={{ fontSize: 30, fontWeight: '800', color: t.text }}>{k}</Text>
              </Pressy>
            ))}
            <Pressy onPress={submit} disabled={input.length !== seq.length} style={[styles.key, input.length === seq.length ? raised(t, t.success, '#15803D') : { backgroundColor: t.border }]}>
              <Text style={{ fontSize: 30, fontWeight: '800', color: '#FFF' }}>✓</Text>
            </Pressy>
          </View>
          <BigButton small label="أرني مرة أخرى" icon="👀" color={t.card} textColor={t.text} onPress={() => { setInput(''); setPhase('show'); }} style={{ marginTop: 12 }} />
        </>
      )}
    </View>
  );
}

// ── Colour sequence (Simon) ──────────────────────────────────────────────
function Pad({ color, lit, onPress, disabled }: { color: string; lit: boolean; onPress: () => void; disabled: boolean }) {
  const style = useAnimatedStyle(() => ({ opacity: withSpring(lit ? 1 : 0.72), transform: [{ scale: withSpring(lit ? 1.08 : 1) }] }));
  return (
    <Animated.View style={[styles.padWrap, style, lit && { shadowColor: color, shadowOpacity: 0.9, shadowRadius: 18, shadowOffset: { width: 0, height: 0 }, elevation: 12 }]}>
      <Pressy sound={false} disabled={disabled} onPress={onPress} style={[styles.colorPad, { backgroundColor: color }]}>
        {/* glossy dome: shine on top, shade at the bottom */}
        <View pointerEvents="none" style={styles.padShine} />
        <View pointerEvents="none" style={styles.padShade} />
      </Pressy>
    </Animated.View>
  );
}

export function ColorSequenceGame({ api }: { api: GameApi }) {
  const { palette, sequence, stepMs } = useMemo(() => B.colorSequence(api.genLevel, api.rng), [api.roundKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const [phase, setPhase] = useState<'ready' | 'watch' | 'input'>('ready');
  const [lit, setLit] = useState(-1);
  const [pos, setPos] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const show = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase('watch'); setPos(0);
    const ms = api.hint ? stepMs * 1.4 : stepMs;
    sequence.forEach((c, i) => {
      timers.current.push(setTimeout(() => { setLit(c); play('flip'); }, 400 + i * ms));
      timers.current.push(setTimeout(() => setLit(-1), 400 + i * ms + ms * 0.6));
    });
    timers.current.push(setTimeout(() => setPhase('input'), 400 + sequence.length * ms));
  };

  const tap = (c: number) => {
    if (phase !== 'input') return;
    setLit(c); setTimeout(() => setLit(-1), 200);
    if (c !== sequence[pos]) {
      api.wrong();
      setPhase('watch'); // stop further taps until the replay starts
      timers.current.push(setTimeout(show, 900));
      return;
    }
    play('tap');
    if (pos + 1 === sequence.length) { setPhase('watch'); timers.current.push(setTimeout(() => api.correct(), 400)); }
    else setPos(pos + 1);
  };

  const cols = palette.length <= 4 ? 2 : palette.length <= 6 ? 3 : 4;
  return (
    <View style={{ flex: 1, padding: 16, alignItems: 'center' }}>
      <Prompt>{phase === 'watch' ? 'راقب الألوان…' : phase === 'input' ? `كرر التسلسل (${pos}/${sequence.length})` : `تسلسل من ${sequence.length} ألوان`}</Prompt>
      <View style={[styles.pads, { maxWidth: cols * 130 }]}>
        {palette.map((name, i) => <View key={name} style={{ width: `${100 / cols}%`, padding: 6 }}><Pad color={COLORS[name].hex} lit={lit === i} disabled={phase !== 'input'} onPress={() => tap(i)} /></View>)}
      </View>
      {phase === 'ready' && <BigButton label="ابدأ" icon="▶" onPress={show} style={{ marginTop: 24, minWidth: 200 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  ttt: { width: '100%', maxWidth: 360, aspectRatio: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 6, borderRadius: radius.lg },
  tttCell: { width: '31.9%', aspectRatio: 1, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  garden: { width: '100%', aspectRatio: 1, borderRadius: 14, overflow: 'hidden', borderWidth: 4, borderColor: '#14532D' },
  pad: { alignItems: 'center', gap: 6, marginTop: 12 },
  arrow: { width: 64, height: 64, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  display: { minWidth: '80%', minHeight: 100, borderRadius: radius.lg, borderWidth: 3, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginVertical: 16 },
  numpad: { flexDirection: 'row', flexWrap: 'wrap', width: 300, gap: 12, justifyContent: 'center' },
  key: { width: 88, height: 68, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  pads: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', justifyContent: 'center', marginTop: 16 },
  padWrap: { aspectRatio: 1 },
  colorPad: { flex: 1, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', borderBottomWidth: 8, borderBottomColor: 'rgba(0,0,0,0.25)' },
  padShine: { position: 'absolute', top: 6, left: '12%', right: '12%', height: '32%', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.4)' },
  padShade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', backgroundColor: 'rgba(0,0,0,0.12)' },
});
