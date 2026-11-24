import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { goBack } from '../nav';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { GAME_BY_ID } from '@/domain/games/catalog';
import { effectiveLevel } from '@/domain/engine/difficulty';
import { isPerfectLevel, sessionReducer, shouldHint, startSession } from '@/domain/engine/session';
import { emptyGameProgress, DEFAULT_PROFILE_SETTINGS, type ProfileSettings, type ProgressEvents } from '@/domain/progress';
import { createRng, type Rng } from '@/domain/rng';
import type { GameId } from '@/domain/types';
import { useActiveProfile, useProgress } from '@/data/progressStore';
import { play } from '@/audio/sfx';
import { stopSpeaking } from '@/audio/speech';
import { Pressy } from './Pressy';
import { Screen } from './Screen';
import { SuccessModal } from './SuccessModal';
import { font, radius, raised, useTheme } from '../theme/theme';
import Svg, { Path } from 'react-native-svg';

export type GameApi = {
  /** Level number the child sees. */
  level: number;
  /** Level after the difficulty multiplier – pass this to generators. */
  genLevel: number;
  /** Changes for every new round; use as React key. */
  roundKey: number;
  /** Fresh deterministic RNG for this round. */
  rng: Rng;
  settings: ProfileSettings;
  /** Default points for a correct round at this level. */
  basePoints: number;
  /** True after repeated mistakes: show the answer gently. */
  hint: boolean;
  correct: (points?: number) => void;
  wrong: () => void;
  /** Regenerate the current round without counting anything (e.g. lost a tic-tac-toe match). */
  restartRound: () => void;
};

const NO_EVENTS: ProgressEvents = { achievements: [], stickers: [] };
/** Boards driven by swipe gestures size themselves to the screen instead of scrolling. */
const NO_SCROLL = new Set<GameId>(['maze', 'recycling']);

/**
 * Every game renders inside this shell. It owns the level/round loop, scoring, saving and the
 * success screen, so a game only has to draw its board and report correct/wrong.
 */
export function GameShell({ gameId, children }: { gameId: GameId; children: (api: GameApi) => ReactNode }) {
  const meta = GAME_BY_ID[gameId];
  const t = useTheme();
  const profile = useActiveProfile();
  const completeLevel = useProgress((s) => s.completeLevel);
  const settings = profile?.settings ?? DEFAULT_PROFILE_SETTINGS;
  const startLevel = (profile?.games[gameId] ?? emptyGameProgress()).level;

  const reducer = useMemo(() => sessionReducer(meta.roundsPerLevel), [meta]);
  const [s, dispatch] = useReducer(reducer, startLevel, (l) => startSession(l, meta.roundsPerLevel));
  const [events, setEvents] = useState<ProgressEvents>(NO_EVENTS);
  const saved = useRef<string>('');
  const [seed] = useState(() => Date.now() % 1e9);

  // Persist exactly once per completed level.
  useEffect(() => {
    if (s.phase !== 'levelComplete') return;
    const key = `${s.level}:${s.roundKey}`;
    if (saved.current === key) return;
    saved.current = key;
    setEvents(completeLevel({ gameId, level: s.level, points: s.pointsThisLevel, rounds: s.rounds, mistakes: s.mistakesThisLevel }));
  }, [s, gameId, completeLevel]);

  useEffect(() => () => { stopSpeaking(); }, []);

  // Callbacks are tagged with the round they were handed out for; the engine drops stale ones
  // (late timers, duplicate reports), so a round can never be counted twice or skipped.
  const roundKey = s.roundKey;
  const correct = useCallback((points?: number) => {
    play('correct');
    dispatch({ type: 'correct', points: points ?? meta.pointsPerRound(s.level), roundKey });
  }, [roundKey, meta, s.level]);
  const wrong = useCallback(() => { play('tryAgain'); dispatch({ type: 'wrong', roundKey }); }, [roundKey]);
  const restartRound = useCallback(() => dispatch({ type: 'restartRound', roundKey }), [roundKey]);

  const rng = useMemo(() => createRng(seed + s.roundKey * 7919), [seed, s.roundKey]);
  const api: GameApi = {
    level: s.level,
    genLevel: effectiveLevel(s.level, settings.difficulty),
    roundKey: s.roundKey,
    rng,
    settings,
    basePoints: meta.pointsPerRound(s.level),
    hint: shouldHint(s),
    correct, wrong, restartRound,
  };

  return (
    <Screen scenery={meta.color}>
      <View style={styles.header}>
        <Pressy accessibilityRole="button" accessibilityLabel="رجوع" onPress={goBack} style={[styles.iconBtn, raised(t)]}>
          <Text style={{ fontSize: 26 }}>→</Text>
        </Pressy>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[font.h2, { color: t.text }]} numberOfLines={1}>{meta.title}</Text>
          <Text style={[font.small, { color: t.textMuted }]}>المستوى {s.level}</Text>
        </View>
        <View style={[styles.score, raised(t)]}>
          <Text style={[font.body, { color: t.text }]}>⭐ {profile?.stars ?? 0}</Text>
        </View>
      </View>
      {s.rounds > 1 && <RoundDots total={s.rounds} done={s.round} color={meta.color} track={t.border} />}
      {NO_SCROLL.has(gameId) ? (
        <View style={{ flex: 1, direction: meta.contentDir }}>{children(api)}</View>
      ) : (
        // Scrolls only when the board is taller than the screen (small phones, large text).
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, direction: meta.contentDir }} bounces={false} keyboardShouldPersistTaps="handled">
          {children(api)}
        </ScrollView>
      )}
      <SuccessModal
        visible={s.phase === 'levelComplete'}
        level={s.level}
        points={s.pointsThisLevel}
        perfect={isPerfectLevel(s)}
        events={events}
        effects={settings.effects}
        onNext={() => { setEvents(NO_EVENTS); dispatch({ type: 'next' }); }}
        onReplay={() => { setEvents(NO_EVENTS); dispatch({ type: 'replay' }); }}
        onHome={goBack}
      />
    </Screen>
  );
}

/** One star per round: grey until the round is done, then gold with a little pop. */
function Dot({ filled, track }: { filled: boolean; color: string; track: string }) {
  const style = useAnimatedStyle(() => ({ transform: [{ scale: withSpring(filled ? 1.2 : 1) }] }));
  return (
    <Animated.View style={style}>
      <Svg width={22} height={22} viewBox="0 0 100 100">
        <Path d="M50 4 L62.5 36 L96 37.5 L69.5 58.5 L79 91 L50 72 L21 91 L30.5 58.5 L4 37.5 L37.5 36 Z"
          fill={filled ? '#FACC15' : track} stroke={filled ? '#B45309' : 'rgba(0,0,0,0.15)'} strokeWidth={6} strokeLinejoin="round" />
      </Svg>
    </Animated.View>
  );
}

function RoundDots({ total, done, color, track }: { total: number; done: number; color: string; track: string }) {
  return (
    <View style={styles.dots} accessibilityLabel={`الجولة ${Math.min(done + 1, total)} من ${total}`}>
      {Array.from({ length: total }, (_, i) => <Dot key={i} filled={i < done} color={color} track={track} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  iconBtn: { width: 52, height: 52, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  score: { borderRadius: radius.pill, paddingHorizontal: 14, height: 44, justifyContent: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 12, flexWrap: 'wrap', paddingHorizontal: 24 },
  dot: { width: 14, height: 14, borderRadius: 7 },
});
