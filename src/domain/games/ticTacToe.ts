import type { Difficulty } from '../types';
import type { Rng } from '../rng';

export type Cell = 'X' | 'O' | null;
export type Board = Cell[];
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

export function winner(b: Board): { player: 'X' | 'O'; line: number[] } | 'draw' | null {
  for (const line of LINES) {
    const [a, c, d] = line;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { player: b[a]!, line };
  }
  return b.every(Boolean) ? 'draw' : null;
}

function minimax(b: Board, turn: 'X' | 'O', ai: 'X' | 'O', depth: number): number {
  const w = winner(b);
  if (w === 'draw') return 0;
  if (w) return w.player === ai ? 10 - depth : depth - 10;
  const scores: number[] = [];
  b.forEach((cell, i) => {
    if (cell) return;
    b[i] = turn;
    scores.push(minimax(b, turn === 'X' ? 'O' : 'X', ai, depth + 1));
    b[i] = null;
  });
  return turn === ai ? Math.max(...scores) : Math.min(...scores);
}

/** Probability the AI plays a random move instead of the optimal one. */
export const AI_RANDOMNESS: Record<Difficulty, number> = { easy: 0.5, normal: 0.3, hard: 0 };

export function aiMove(board: Board, ai: 'X' | 'O', difficulty: Difficulty, rng: Rng): number {
  const free = board.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0);
  if (!free.length) return -1;
  if (rng() < AI_RANDOMNESS[difficulty]) return free[Math.floor(rng() * free.length)];
  const human = ai === 'X' ? 'O' : 'X';
  let best = -Infinity, move = free[0];
  for (const i of free) {
    const b = board.slice(); b[i] = ai;
    const score = minimax(b, human, ai, 0);
    if (score > best) { best = score; move = i; }
  }
  return move;
}
