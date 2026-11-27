import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/ui/components/Text';
import Animated, {
  FadeIn, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, cancelAnimation, Easing,
} from 'react-native-reanimated';
import type { ChoiceRound, GameSettings } from '@/domain/types';
import type { Rng } from '@/domain/rng';
import { speak, useArabicVoice } from '@/audio/speech';
import type { GameApi } from './GameShell';
import { Pressy } from './Pressy';
import { radius, raised, TOUCH, useTheme } from '../theme/theme';

export type OptionState = 'idle' | 'correct' | 'wrong' | 'hint';

type Props<P, O> = {
  api: GameApi;
  generate: (level: number, s: GameSettings, rng: Rng) => ChoiceRound<P, O>;
  renderPrompt: (round: ChoiceRound<P, O>, replay: () => void) => ReactNode;
  renderOption: (option: O, state: OptionState) => ReactNode;
  columns?: number;
  optionHeight?: number;
  autoSpeak?: boolean;
  /** Seconds before the answer is gently revealed; finishing in time earns a bonus. Ignored when noTimers is on. */
  timeLimit?: number;
  /** Called when the child picks the right answer (e.g. to say the word as reinforcement). */
  onSolved?: (round: ChoiceRound<P, O>) => void;
  /** Spoken label for options that are pictures only (screen readers). */
  optionLabel?: (option: O) => string;
};

/** Generic multiple-choice board used by every "pick the right answer" game. */
export function ChoiceGame<P, O>(props: Props<P, O>) {
  // Keyed by round: every round mounts with fresh state (no manual resets).
  return <ChoiceRoundView key={props.api.roundKey} {...props} />;
}

function ChoiceRoundView<P, O>({ api, generate, renderPrompt, renderOption, columns = 2, optionHeight = 96, autoSpeak = true, timeLimit, onSolved, optionLabel }: Props<P, O>) {
  const t = useTheme();
  const [round] = useState(() => generate(api.genLevel, api.settings, api.rng));
  const [wrongSet, setWrongSet] = useState<number[]>([]);
  const [solved, setSolved] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const replay = () => round.speak && speak(round.speak.text, round.speak.lang);

  useEffect(() => {
    if (!autoSpeak || !round.speak) return;
    const { text, lang } = round.speak;
    const id = setTimeout(() => speak(text, lang), 350);
    return () => clearTimeout(id);
  }, [autoSpeak, round]);

  const useTimer = !!timeLimit && !api.settings.noTimers;

  const choose = (i: number) => {
    if (solved !== null || wrongSet.includes(i)) return;
    if (i === round.correctIndex) {
      setSolved(i);
      onSolved?.(round);
      const fast = useTimer && !timedOut; // answered before the timer ran out
      setTimeout(() => api.correct(fast ? api.basePoints + 2 : undefined), 650); // speed bonus, never a penalty
    } else {
      setWrongSet((w) => [...w, i]);
      api.wrong();
    }
  };

  const showHint = api.hint || timedOut;
  // Without an Arabic voice a listening question would be silent: show the word instead.
  const hasArabic = useArabicVoice();
  const silentFallback = autoSpeak && round.speak?.lang === 'ar' && hasArabic === false;

  return (
    <View style={styles.root}>
      <Animated.View entering={FadeIn.duration(250)} style={styles.prompt}>
        {renderPrompt(round, replay)}
        {silentFallback && (
          <Text style={[styles.fallback, { color: t.text, backgroundColor: t.hintBg }]}>🔇 {round.speak!.text}</Text>
        )}
      </Animated.View>
      {useTimer && <TimerBar seconds={timeLimit!} paused={solved !== null} onDone={() => setTimedOut(true)} />}
      <View style={styles.grid}>
        {round.options.map((o, i) => {
          const state: OptionState = solved === i ? 'correct' : wrongSet.includes(i) ? 'wrong' : showHint && i === round.correctIndex ? 'hint' : 'idle';
          return (
            <OptionTile key={i} state={state} width={`${100 / columns - 3}%`} height={optionHeight} onPress={() => choose(i)} label={optionLabel?.(o)}>
              {renderOption(o, state)}
            </OptionTile>
          );
        })}
      </View>
      <View style={{ height: 8, backgroundColor: t.bg }} />
    </View>
  );
}

export function OptionTile({ state, children, onPress, width, height, label }: { state: OptionState; children: ReactNode; onPress: () => void; width: `${number}%`; height: number; label?: string }) {
  const t = useTheme();
  const x = useSharedValue(0);
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (state === 'wrong') x.set(withSequence(withTiming(-10, { duration: 50 }), withTiming(10, { duration: 70 }), withTiming(-6, { duration: 60 }), withTiming(0, { duration: 50 })));
    if (state === 'hint') pulse.set(withRepeat(withTiming(1.06, { duration: 500, easing: Easing.inOut(Easing.quad) }), -1, true));
    else { cancelAnimation(pulse); pulse.set(withTiming(1)); }
  }, [state, x, pulse]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { scale: pulse.value }] }));
  const bg = state === 'correct' ? t.successBg : state === 'hint' ? t.hintBg : t.card;
  const edge = state === 'correct' ? t.success : state === 'hint' ? t.hint : t.edge;
  return (
    <Animated.View style={[{ width, minHeight: Math.max(height, TOUCH) }, anim, state === 'wrong' && { opacity: 0.35 }]}>
      <Pressy
        sound={false}
        onPress={onPress}
        disabled={state === 'wrong'}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[styles.tile, raised(t, bg, edge), state !== 'idle' && { borderColor: edge }, { minHeight: Math.max(height, TOUCH) }]}
      >
        {children}
      </Pressy>
    </Animated.View>
  );
}

function TimerBar({ seconds, paused, onDone }: { seconds: number; paused: boolean; onDone: () => void }) {
  const t = useTheme();
  const w = useSharedValue(1);
  useEffect(() => {
    w.set(withTiming(0, { duration: seconds * 1000, easing: Easing.linear }));
    const id = setTimeout(onDone, seconds * 1000);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (paused) cancelAnimation(w); }, [paused, w]);
  const style = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={[styles.timer, { backgroundColor: t.border }]}>
      <Animated.View style={[styles.timerFill, { backgroundColor: t.hint }, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 16 },
  prompt: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 160 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, paddingBottom: 16 },
  tile: { flex: 1, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', padding: 8 },
  fallback: { marginTop: 10, fontSize: 22, fontWeight: '800', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 4, overflow: 'hidden' },
  timer: { height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 12 },
  timerFill: { height: '100%', borderRadius: 5 },
});
