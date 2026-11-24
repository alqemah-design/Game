import { createRng } from '../rng';
import { DEFAULT_GAME_SETTINGS } from '../types';
import * as N from '../games/newGames';

const LEVELS = [1, 2, 3, 4, 5, 7, 10, 20, 60];
const each = (fn: (level: number, seed: number) => void) => { for (const l of LEVELS) for (let s = 0; s < 40; s++) fn(l, s * 7919 + l); };

describe('little market', () => {
  it('every price can be paid exactly with the coins on offer', () => {
    each((l, seed) => {
      const r = N.marketRound(l, createRng(seed));
      expect(r.price).toBeGreaterThan(0);
      if (r.mode === 'pay') expect(N.greedyPay(r.price, r.money).reduce((a, b) => a + b, 0)).toBe(r.price);
    });
  });
  it('change rounds only from level 4, with the right answer and unique positive options', () => {
    each((l, seed) => {
      const r = N.marketRound(l, createRng(seed));
      if (r.mode !== 'change') return;
      expect(l).toBeGreaterThanOrEqual(4);
      expect(r.paid).toBeGreaterThan(r.price);
      expect(r.options[r.correctIndex]).toBe(r.paid - r.price);
      expect(new Set(r.options).size).toBe(r.options.length);
      expect(r.options.every((o) => o > 0)).toBe(true);
    });
  });
});

describe('what changed (room)', () => {
  it('describes exactly one change, with things only where they belong', () => {
    each((l, seed) => {
      const r = N.changedRound(l, createRng(seed));
      expect(r.before.length).toBe(N.ROOM_SPOTS.length);
      for (const scene of [r.before, r.after])
        scene.forEach((e, i) => e && expect(N.ROOM_ITEMS.find((it) => it.emoji === e)!.kinds).toContain(N.ROOM_SPOTS[i]));
      const filled = r.before.filter(Boolean);
      expect(new Set(filled).size).toBe(filled.length);
      const diff = r.before.map((b, i) => (b !== r.after[i] ? i : -1)).filter((i) => i >= 0);
      if (r.kind === 'missing') {
        expect(diff).toEqual(r.answerCells);
        expect(r.after[diff[0]]).toBe('');
        expect(r.options[r.correctIndex]).toBe(r.before[diff[0]]);
        r.options.forEach((o, i) => i !== r.correctIndex && expect(r.before).not.toContain(o));
      } else if (r.kind === 'new') {
        expect(diff).toEqual(r.answerCells);
        expect(r.before).not.toContain(r.after[diff[0]]);
      } else {
        expect(diff.sort()).toEqual([...r.answerCells].sort());
      }
      if (l <= 3) expect(r.kind).toBe('missing');
    });
  });
});

describe('mirror', () => {
  it('targets are the exact reflection of the given cells, on the other half', () => {
    each((l, seed) => {
      const r = N.mirrorRound(l, createRng(seed));
      expect(r.targets.length).toBe(r.given.length);
      expect(r.given.length).toBeGreaterThanOrEqual(2);
      for (const g of r.given) {
        const m = N.mirrorOf(r, g);
        expect(r.targets).toContain(m);
        expect(r.given).not.toContain(m);
        expect(N.mirrorOf(r, m)).toBe(g);
      }
      expect(r.rows * r.cols).toBeLessThanOrEqual(48);
    });
  });
});

describe('waste sorting', () => {
  it('the right bin is always on offer and bins keep a fixed order', () => {
    each((l, seed) => {
      const r = N.recyclingRound(l, DEFAULT_GAME_SETTINGS, createRng(seed));
      expect(r.options).toEqual(N.binsFor(l));
      expect(r.options[r.correctIndex]).toBe(r.prompt.item.bin);
    });
  });
  it('every bin has items, and the four bins are paper, plastic, food and other', () => {
    expect(Object.keys(N.BINS).sort()).toEqual(['food', 'other', 'paper', 'plastic']);
    for (const b of Object.keys(N.BINS)) expect(N.WASTE.filter((w) => w.bin === b).length).toBeGreaterThanOrEqual(5);
    expect(N.binsFor(9)).toHaveLength(4);
  });
});
