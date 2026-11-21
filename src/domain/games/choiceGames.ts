/** Generators for every multiple-choice game. Pure functions of (level, settings, rng). */
import { ALPHABET } from '../content/englishWords';
import { ARABIC_LETTERS, type ArabicLetter } from '../content/arabicLetters';
import { COUNTRIES, type Country } from '../content/countries';
import { PRODUCE, type Produce } from '../content/produce';
import { COLORS, COLOR_NAMES, SHAPES, type ColorName, type ShapeKind } from '../content/shapes';
import { tier } from '../engine/difficulty';
import { clamp, int, pick, shuffle, withDistractors, type Rng } from '../rng';
import type { ChoiceRound, GameSettings, MathOp } from '../types';

// ── Sound → Letter (English) ─────────────────────────────────────────────
export function soundLetterRound(level: number, s: GameSettings, rng: Rng): ChoiceRound<{ letter: string }, string> {
  const span = tier([[1, 8], [3, 16], [5, 26]] as const, level);
  const focus = s.focusLetters.filter((l) => ALPHABET.includes(l));
  const pool = focus.length >= 2 ? focus : ALPHABET.slice(0, span);
  const optionCount = tier([[1, 4], [3, 6]] as const, level);
  const letter = pick(rng, pool);
  const { options, correctIndex } = withDistractors(rng, letter, pool.length >= optionCount ? pool : ALPHABET, optionCount);
  return { prompt: { letter }, options, correctIndex, speak: { text: letter, lang: 'en' } };
}

// ── Arabic letters: listen mode & first-letter mode ──────────────────────
function arabicPool(level: number) {
  const span = tier([[1, 7], [2, 14], [3, 21], [4, 28]] as const, level);
  return ARABIC_LETTERS.slice(0, span);
}

export function arabicListenRound(level: number, _s: GameSettings, rng: Rng): ChoiceRound<{ letter: ArabicLetter }, ArabicLetter> {
  const pool = arabicPool(level);
  const letter = pick(rng, pool);
  const n = tier([[1, 3], [3, 4], [6, 6]] as const, level);
  const { options, correctIndex } = withDistractors(rng, letter, pool, n, (l) => l.id);
  return { prompt: { letter }, options, correctIndex, speak: { text: letter.name, lang: 'ar' } };
}

export function arabicFirstLetterRound(level: number, _s: GameSettings, rng: Rng): ChoiceRound<{ letter: ArabicLetter }, ArabicLetter> {
  const pool = arabicPool(level);
  const letter = pick(rng, pool);
  const n = tier([[1, 3], [3, 4], [6, 6]] as const, level);
  const { options, correctIndex } = withDistractors(rng, letter, pool, n, (l) => l.id);
  return { prompt: { letter }, options, correctIndex, speak: { text: letter.word, lang: 'ar' } };
}

// ── Fruits & vegetables ──────────────────────────────────────────────────
export type ProducePrompt = { item: Produce; lang: 'ar' | 'en' };
export function produceRound(level: number, _s: GameSettings, rng: Rng): ChoiceRound<ProducePrompt, string> {
  const item = pick(rng, PRODUCE);
  const lang: 'ar' | 'en' = level <= 2 ? 'ar' : rng() < 0.5 ? 'ar' : 'en';
  const n = tier([[1, 3], [2, 4]] as const, level);
  // Later levels use same-kind distractors (harder: fruit vs fruit).
  const pool = level >= 5 ? PRODUCE.filter((p) => p.kind === item.kind) : PRODUCE;
  const { options, correctIndex } = withDistractors(rng, item, pool, n, (p) => p.id);
  return {
    prompt: { item, lang },
    options: options.map((o) => o[lang]),
    correctIndex,
    speak: { text: item[lang], lang },
  };
}
export const produceRounds = (level: number) => tier([[1, 5], [3, 7], [6, 10], [10, 12]] as const, level);

// ── Country flags ────────────────────────────────────────────────────────
export function flagRound(level: number, _s: GameSettings, rng: Rng): ChoiceRound<{ country: Country }, Country> {
  const span = tier([[1, 20], [3, 34], [5, 50], [7, COUNTRIES.length]] as const, level);
  const pool = COUNTRIES.slice(0, span);
  const country = pick(rng, pool);
  const n = tier([[1, 3], [3, 4], [6, 6]] as const, level);
  // From level 6, distractors come from the same continent.
  const distractorPool = level >= 6 ? COUNTRIES.filter((c) => c.continent === country.continent) : pool;
  const { options, correctIndex } = withDistractors(rng, country, distractorPool.length >= n ? distractorPool : pool, n, (c) => c.code);
  return { prompt: { country }, options, correctIndex };
}

// ── Telling time ─────────────────────────────────────────────────────────
export type ClockTime = { h: number; m: number };
export const formatTime = ({ h, m }: ClockTime) => `${h}:${String(m).padStart(2, '0')}`;

export function timeRound(level: number, _s: GameSettings, rng: Rng): ChoiceRound<ClockTime, string> {
  const step = tier([[1, 60], [3, 30], [5, 15], [7, 5], [10, 1]] as const, level);
  const randTime = (): ClockTime => ({ h: int(rng, 1, 12), m: step === 60 ? 0 : int(rng, 0, 60 / step - 1) * step });
  const t = randTime();
  const pool: string[] = [];
  // Plausible distractors: swapped hands, ±1 hour, random.
  pool.push(formatTime({ h: ((t.h % 12) + 1), m: t.m }));
  if (t.m % 5 === 0 && t.m !== 0) pool.push(formatTime({ h: (t.m / 5) || 12, m: (t.h % 12) * 5 }));
  for (let i = 0; i < 10; i++) pool.push(formatTime(randTime()));
  const { options, correctIndex } = withDistractors(rng, formatTime(t), pool, 4);
  return { prompt: t, options, correctIndex };
}

// ── Math challenge ───────────────────────────────────────────────────────
export type MathPrompt = { a: number; b: number; op: MathOp };
export const solve = ({ a, b, op }: MathPrompt) => (op === '+' ? a + b : op === '-' ? a - b : a * b);

export function mathRound(level: number, s: GameSettings, rng: Rng): ChoiceRound<MathPrompt, number> {
  const ops = s.math.ops.length ? s.math.ops : (['+'] as MathOp[]);
  const lo = Math.max(0, s.math.min);
  const hi = Math.max(lo + 2, Math.min(s.math.max, 5 + level * 5));
  const op = pick(rng, ops);
  let a = int(rng, lo, hi);
  let b = int(rng, lo, hi);
  if (op === '-' && b > a) [a, b] = [b, a]; // never negative results for kids
  if (op === '×') {
    // Times tables stay within 1–12 whatever the +/− range is (a high "min" used to produce min > max).
    const top = clamp(2 + level, 2, 12);
    a = int(rng, 1, top);
    b = int(rng, 1, top);
  }
  const prompt = { a, b, op };
  const answer = solve(prompt);
  const near = [-3, -2, -1, 1, 2, 3, 10, -10].map((d) => answer + d).filter((x) => x >= 0);
  const { options, correctIndex } = withDistractors(rng, answer, near, 4);
  return { prompt, options, correctIndex };
}

// ── Pattern completion ───────────────────────────────────────────────────
export type PatternItem = { shape: ShapeKind; color: ColorName };
export const patternKey = (p: PatternItem) => `${p.shape}-${p.color}`;
export type PatternPrompt = { sequence: (PatternItem | null)[]; unitLength: number };

export function patternRound(level: number, _s: GameSettings, rng: Rng): ChoiceRound<PatternPrompt, PatternItem> {
  const unitLength = clamp(2 + Math.floor((level - 1) / 3), 2, 6);
  const length = clamp(Math.max(unitLength * 2, 4 + level), 4, 16);
  // Early levels vary only colour on circles; later both shape and colour.
  const varyShape = level >= 4;
  const colors = shuffle(rng, COLOR_NAMES);
  const shapes = shuffle(rng, SHAPES);
  const unit: PatternItem[] = Array.from({ length: unitLength }, (_, i) => ({
    shape: varyShape ? shapes[i % shapes.length] : 'circle',
    color: colors[i % colors.length],
  }));
  const full = Array.from({ length }, (_, i) => unit[i % unitLength]);
  // Blank must be after at least one full unit so the rule is visible.
  const blank = int(rng, unitLength, length - 1);
  const answer = full[blank];
  const pool: PatternItem[] = [
    ...unit,
    ...COLOR_NAMES.map((c) => ({ shape: answer.shape, color: c })),
    ...SHAPES.map((sh) => ({ shape: sh, color: answer.color })),
  ];
  const n = tier([[1, 3], [5, 4]] as const, level);
  const { options, correctIndex } = withDistractors(rng, answer, pool, n, patternKey);
  return { prompt: { sequence: full.map((x, i) => (i === blank ? null : x)), unitLength }, options, correctIndex };
}

export { COLORS };
