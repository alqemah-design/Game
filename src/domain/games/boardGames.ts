/** Pure logic for the games that have their own interactive board. */
import { ALPHABET, ENGLISH_WORDS, type EnglishWord } from '../content/englishWords';
import { COLOR_NAMES, SHAPES, type ColorName, type ShapeKind } from '../content/shapes';
import { tier } from '../engine/difficulty';
import { clamp, int, pick, sample, shuffle, type Rng } from '../rng';

// ── Shape match ──────────────────────────────────────────────────────────
export type ShapePiece = { id: string; shape: ShapeKind; color: ColorName };
export function shapeBoard(level: number, rng: Rng): { pieces: ShapePiece[]; slots: ShapePiece[] } {
  const count = tier([[1, 3], [2, 4], [4, 5], [6, 6], [9, 7], [12, 8]] as const, level);
  // Low levels: distinct shapes. High levels: same shape in different colours (must match colour too).
  const combos = SHAPES.flatMap((shape) => COLOR_NAMES.map((color) => ({ shape, color })));
  const pieces: ShapePiece[] =
    level < 9
      ? sample(rng, SHAPES, count).map((shape, i) => ({ id: `p${i}`, shape, color: COLOR_NAMES[i % COLOR_NAMES.length] }))
      : sample(rng, combos, count).map((c, i) => ({ id: `p${i}`, ...c }));
  return { pieces: shuffle(rng, pieces), slots: shuffle(rng, pieces) };
}

/** Letters whose capital and small forms look clearly different. */
export const DIFFERENT_CASE = 'ABDEGHQRNTFLMIJY'.split('');

// ── Capital ↔ small ──────────────────────────────────────────────────────
export function capitalPairs(level: number, rng: Rng) {
  const n = tier([[1, 3], [2, 4], [4, 5], [6, 6]] as const, level);
  // Pairs whose shapes differ (A/a, G/g) teach something; C/c or O/o look the same, so they
  // only join from level 5.
  const letters = sample(rng, level < 5 ? DIFFERENT_CASE : ALPHABET, n);
  return { capitals: shuffle(rng, letters), smalls: shuffle(rng, letters.map((l) => l.toLowerCase())) };
}

// ── Memory cards ─────────────────────────────────────────────────────────
const MEMORY_SETS = [
  ['🐶', '🐱', '🐰', '🐻', '🐼', '🦁', '🐸', '🐵', '🐷', '🐮', '🐔', '🦊'],
  ['🍎', '🍌', '🍇', '🍓', '🍉', '🍒', '🍑', '🍍', '🥝', '🥕', '🌽', '🍋'],
  ['🚗', '🚌', '🚀', '✈️', '🚲', '🚂', '⛵', '🚁', '🚜', '🛵', '🚒', '🚑'],
  ['⭐', '🌙', '☀️', '🌈', '⚡', '❄️', '🔥', '🌸', '🍀', '🎈', '🎁', '💎'],
];
export type MemoryCard = { id: number; symbol: string };
export function memoryDeck(level: number, rng: Rng): { cards: MemoryCard[]; columns: number } {
  const pairs = clamp(2 + level, 3, 12);
  const set = MEMORY_SETS[(level - 1) % MEMORY_SETS.length];
  const symbols = sample(rng, set, pairs);
  const cards = shuffle(rng, [...symbols, ...symbols]).map((symbol, id) => ({ id, symbol }));
  const columns = cards.length <= 6 ? 3 : cards.length <= 12 ? 4 : cards.length <= 20 ? 5 : 6;
  return { cards, columns };
}

// ── Word builder ─────────────────────────────────────────────────────────
export function wordChallenge(level: number, rng: Rng): { word: EnglishWord; tiles: string[] } {
  const maxLen = tier([[1, 3], [3, 4], [5, 5], [7, 8]] as const, level);
  const minLen = level >= 7 ? 4 : 3;
  const pool = ENGLISH_WORDS.filter((w) => w.word.length <= maxLen && w.word.length >= Math.min(minLen, maxLen));
  const word = pick(rng, pool);
  let tiles = shuffle(rng, word.word.split(''));
  for (let i = 0; i < 5 && tiles.join('') === word.word; i++) tiles = shuffle(rng, tiles);
  // From level 6 add one decoy letter.
  if (level >= 6) tiles = shuffle(rng, [...tiles, pick(rng, ALPHABET.filter((l) => !word.word.includes(l)))]);
  return { word, tiles };
}

// ── Sorting numbers ──────────────────────────────────────────────────────
export function sortingSet(level: number, rng: Rng): number[] {
  const count = clamp(3 + Math.floor(level / 2), 3, 10);
  const max = Math.min(500, 10 + level * 8);
  const set = new Set<number>();
  while (set.size < count) set.add(int(rng, 1, max));
  return shuffle(rng, [...set]);
}

// ── Number memory ────────────────────────────────────────────────────────
export function numberSequence(level: number, rng: Rng) {
  const digits = clamp(3 + Math.ceil(level / 2), 4, 9);
  const seq = Array.from({ length: digits }, (_, i) => (i === 0 ? int(rng, 1, 9) : int(rng, 0, 9))).join('');
  return { seq, showMs: 1500 + digits * 600 };
}

// ── Color sequence (Simon-style) ─────────────────────────────────────────
export function colorSequence(level: number, rng: Rng) {
  const colorCount = clamp(4 + Math.floor((level - 1) / 3), 4, 8);
  const length = clamp(2 + level, 3, 12);
  const palette = COLOR_NAMES.slice(0, colorCount);
  return { palette, sequence: Array.from({ length }, () => int(rng, 0, colorCount - 1)), stepMs: clamp(900 - level * 40, 450, 900) };
}

// ── Maze (iterative DFS / recursive backtracker) ─────────────────────────
/** Grid of odd size; true = wall. Start top-left (1,1), goal bottom-right. */
export type Maze = { size: number; walls: boolean[][]; start: [number, number]; goal: [number, number] };

export function generateMaze(level: number, rng: Rng): Maze {
  const size = clamp(5 + (level - 1) * 2, 5, 19);
  const walls = Array.from({ length: size }, () => Array(size).fill(true) as boolean[]);
  const stack: [number, number][] = [[1, 1]];
  walls[1][1] = false;
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const next = shuffle(rng, [[-2, 0], [2, 0], [0, -2], [0, 2]] as const)
      .map(([dr, dc]) => [r + dr, c + dc, dr, dc] as const)
      .find(([nr, nc]) => nr > 0 && nc > 0 && nr < size - 1 && nc < size - 1 && walls[nr][nc]);
    if (!next) { stack.pop(); continue; }
    const [nr, nc, dr, dc] = next;
    walls[r + dr / 2][c + dc / 2] = false;
    walls[nr][nc] = false;
    stack.push([nr, nc]);
  }
  return { size, walls, start: [1, 1], goal: [size - 2, size - 2] };
}

export function canMove(m: Maze, [r, c]: [number, number], [dr, dc]: [number, number]) {
  const nr = r + dr, nc = c + dc;
  return nr >= 0 && nc >= 0 && nr < m.size && nc < m.size && !m.walls[nr][nc];
}

/** BFS shortest path length (used by tests and to rate the child's path). */
export function shortestPath(m: Maze): number {
  const key = (p: [number, number]) => p[0] * m.size + p[1];
  const dist = new Map([[key(m.start), 0]]);
  const q: [number, number][] = [m.start];
  while (q.length) {
    const p = q.shift()!;
    if (p[0] === m.goal[0] && p[1] === m.goal[1]) return dist.get(key(p))!;
    for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]] as [number, number][]) {
      const n: [number, number] = [p[0] + d[0], p[1] + d[1]];
      if (canMove(m, p, d) && !dist.has(key(n))) { dist.set(key(n), dist.get(key(p))! + 1); q.push(n); }
    }
  }
  return -1;
}
