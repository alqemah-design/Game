import type { Difficulty } from '../types';

export const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = { easy: 0.7, normal: 1, hard: 1.5 };

/**
 * The level a generator should build content for. Every game goes through this,
 * so the parent's difficulty setting applies uniformly (the old app only honoured it in 2 games).
 */
export function effectiveLevel(level: number, difficulty: Difficulty): number {
  const m = DIFFICULTY_MULTIPLIER[difficulty];
  return Math.max(1, Math.round(level * m));
}

/** Step function helper: `tiers([[1,3],[4,5],[9,7]], level)` → value of the highest tier whose start ≤ level. */
export function tier<T>(table: readonly (readonly [number, T])[], level: number): T {
  let value = table[0][1];
  for (const [from, v] of table) if (level >= from) value = v;
  return value;
}
