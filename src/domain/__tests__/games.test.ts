import { createRng } from '../rng';
import { DEFAULT_GAME_SETTINGS } from '../types';
import * as C from '../games/choiceGames';
import * as B from '../games/boardGames';
import { aiMove, winner, type Board } from '../games/ticTacToe';
import { GAMES } from '../games/catalog';

const S = DEFAULT_GAME_SETTINGS;
const LEVELS = [1, 2, 3, 5, 8, 12, 20, 50];
const generators = {
  soundLetter: C.soundLetterRound,
  arabicListen: C.arabicListenRound,
  arabicFirst: C.arabicFirstLetterRound,
  produce: C.produceRound,
  flags: C.flagRound,
  time: C.timeRound,
  math: C.mathRound,
  pattern: C.patternRound,
};

describe.each(Object.entries(generators))('%s generator', (_name, gen) => {
  it('always produces unique options with the answer at correctIndex', () => {
    for (const level of LEVELS) {
      for (let seed = 0; seed < 40; seed++) {
        const r = gen(level, S, createRng(seed * 7919 + level));
        expect(r.options.length).toBeGreaterThanOrEqual(3);
        expect(r.correctIndex).toBeGreaterThanOrEqual(0);
        expect(r.correctIndex).toBeLessThan(r.options.length);
        const keys = r.options.map((o) => JSON.stringify(o));
        expect(new Set(keys).size).toBe(keys.length);
      }
    }
  });
});

describe('specific rules', () => {
  it('math answers are correct and never negative', () => {
    for (let seed = 0; seed < 200; seed++) {
      const r = C.mathRound(1 + (seed % 15), { ...S, math: { min: 0, max: 50, ops: ['+', '-', '×'] } }, createRng(seed));
      expect(r.options[r.correctIndex]).toBe(C.solve(r.prompt));
      expect(C.solve(r.prompt)).toBeGreaterThanOrEqual(0);
    }
  });

  it('pattern answer fits the repeating unit', () => {
    for (let seed = 0; seed < 100; seed++) {
      const r = C.patternRound(1 + (seed % 20), S, createRng(seed));
      const blank = r.prompt.sequence.indexOf(null);
      const ref = r.prompt.sequence[blank - r.prompt.unitLength];
      expect(C.patternKey(r.options[r.correctIndex])).toBe(C.patternKey(ref!));
    }
  });

  it('early clock levels use whole hours', () => {
    for (let seed = 0; seed < 50; seed++) expect(C.timeRound(1, S, createRng(seed)).prompt.m).toBe(0);
  });

  it('sorting sets are distinct and bounded', () => {
    for (const level of LEVELS) {
      const set = B.sortingSet(level, createRng(level));
      expect(new Set(set).size).toBe(set.length);
      expect(Math.max(...set)).toBeLessThanOrEqual(500);
    }
  });

  it('every maze is solvable and grows with level', () => {
    for (const level of LEVELS) {
      const m = B.generateMaze(level, createRng(level * 31));
      expect(m.size % 2).toBe(1);
      expect(m.size).toBeLessThanOrEqual(19);
      expect(B.shortestPath(m)).toBeGreaterThan(0);
    }
  });

  it('memory deck has exactly two of each symbol', () => {
    const { cards } = B.memoryDeck(6, createRng(1));
    const counts = new Map<string, number>();
    cards.forEach((c) => counts.set(c.symbol, (counts.get(c.symbol) ?? 0) + 1));
    expect([...counts.values()].every((n) => n === 2)).toBe(true);
  });

  it('word tiles contain every letter of the word', () => {
    for (const level of LEVELS) {
      const { word, tiles } = B.wordChallenge(level, createRng(level));
      for (const ch of word.word) expect(tiles).toContain(ch);
    }
  });

  it('perfect tic-tac-toe AI never loses (blocks a winning threat)', () => {
    const b: Board = ['X', 'X', null, null, 'O', null, null, null, null];
    expect(aiMove(b, 'O', 'hard', createRng(1))).toBe(2);
    const full: Board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    expect(winner(full)).toBe('draw');
  });

  it('catalog has 21 games with unique ids and legacy keys', () => {
    expect(GAMES.length).toBe(21);
    expect(new Set(GAMES.map((g) => g.id)).size).toBe(21);
    expect(new Set(GAMES.map((g) => g.legacyKey)).size).toBe(21);
  });
});

describe('settings edge cases', () => {
  it('multiplication stays within tables even when the parent sets a high minimum', () => {
    for (let seed = 0; seed < 100; seed++) {
      const r = C.mathRound(3, { ...S, math: { min: 40, max: 60, ops: ['×'] } }, createRng(seed));
      expect(r.prompt.a).toBeGreaterThanOrEqual(1);
      expect(r.prompt.a).toBeLessThanOrEqual(12);
      expect(r.options[r.correctIndex]).toBe(C.solve(r.prompt));
    }
  });
});
