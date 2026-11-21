/** Seedable PRNG so round generation is deterministic in tests. */
export type Rng = () => number;

export function createRng(seed: number = Date.now()): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const int = (rng: Rng, min: number, max: number) =>
  min + Math.floor(rng() * (max - min + 1));

export const pick = <T>(rng: Rng, items: readonly T[]): T => items[Math.floor(rng() * items.length)];

export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const sample = <T>(rng: Rng, items: readonly T[], n: number): T[] =>
  shuffle(rng, items).slice(0, Math.min(n, items.length));

/** Correct answer + (n-1) distinct distractors, shuffled. Returns options and the index of the answer. */
export function withDistractors<T>(
  rng: Rng,
  answer: T,
  pool: readonly T[],
  n: number,
  key: (t: T) => string | number = (t) => String(t),
): { options: T[]; correctIndex: number } {
  const k = key(answer);
  const seen = new Set([k]);
  const distractors: T[] = [];
  for (const item of shuffle(rng, pool)) {
    if (distractors.length >= n - 1) break;
    const ik = key(item);
    if (seen.has(ik)) continue;
    seen.add(ik);
    distractors.push(item);
  }
  const options = shuffle(rng, [answer, ...distractors]);
  return { options, correctIndex: options.findIndex((o) => key(o) === k) };
}

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
