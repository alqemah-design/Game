/** Rules for: Little Market, What Changed?, Mirror, Waste Sorting. Pure functions of (level, rng). */
import { tier } from '../engine/difficulty';
import { clamp, int, pick, sample, shuffle, withDistractors, type Rng } from '../rng';
import type { ChoiceRound, GameSettings } from '../types';

// ── Little market ────────────────────────────────────────────────────────
export type MarketItem = { emoji: string; ar: string };
export const MARKET_ITEMS: readonly MarketItem[] = [
  { emoji: '🍎', ar: 'تفاحة' }, { emoji: '🍌', ar: 'موز' }, { emoji: '🧃', ar: 'عصير' }, { emoji: '🥛', ar: 'حليب' },
  { emoji: '🍞', ar: 'خبز' }, { emoji: '🧀', ar: 'جبنة' }, { emoji: '🍪', ar: 'بسكويت' }, { emoji: '🍦', ar: 'آيس كريم' },
  { emoji: '✏️', ar: 'قلم' }, { emoji: '📒', ar: 'دفتر' }, { emoji: '🎈', ar: 'بالون' }, { emoji: '⚽', ar: 'كرة' },
  { emoji: '🧸', ar: 'دبدوب' }, { emoji: '🪁', ar: 'طائرة ورقية' }, { emoji: '🎨', ar: 'ألوان' }, { emoji: '🚗', ar: 'سيارة لعبة' },
];

export type MarketRound =
  | { mode: 'pay'; item: MarketItem; price: number; money: number[] }
  | { mode: 'change'; item: MarketItem; price: number; paid: number; options: number[]; correctIndex: number };

/** Coins/notes available to pay with, growing with level. */
export const marketMoney = (level: number) =>
  tier([[1, [1, 2, 5]], [3, [1, 2, 5, 10]], [5, [1, 5, 10, 20]], [7, [1, 5, 10, 20, 50]]] as const, level).slice();

export function marketRound(level: number, rng: Rng): MarketRound {
  const item = pick(rng, MARKET_ITEMS);
  const maxPrice = tier([[1, 9], [3, 20], [5, 45], [7, 99]] as const, level);
  const price = int(rng, level <= 2 ? 2 : 3, maxPrice);
  // From level 4, some rounds ask for the change instead of paying.
  if (level >= 4 && rng() < 0.4) {
    const paid = [10, 20, 50, 100].find((n) => n > price)!;
    const change = paid - price;
    const near = [1, 2, 3, 5, 10].flatMap((d) => [change + d, change - d]).filter((x) => x > 0 && x !== change);
    const { options, correctIndex } = withDistractors(rng, change, near, 4);
    return { mode: 'change', item, price, paid, options, correctIndex };
  }
  return { mode: 'pay', item, price, money: marketMoney(level) };
}

/** Fewest coins making `amount` (used as the hint and to prove every price is payable). */
export function greedyPay(amount: number, money: readonly number[]): number[] {
  const out: number[] = [];
  let left = amount;
  for (const m of [...money].sort((a, b) => b - a)) while (left >= m) { out.push(m); left -= m; }
  return left === 0 ? out : [];
}

// ── What changed? ────────────────────────────────────────────────────────
const SCENE_POOL = ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐸', '🦁', '🐵', '🐧', '🐢', '🦋', '🍎', '🍌', '🍓', '🚗', '🚀', '⚽', '🎈', '⭐', '🌸', '🍄', '🎁', '🔔'];

export type ChangeKind = 'missing' | 'new' | 'swap';
export type ChangedRound = {
  before: string[];
  /** Empty string = the cell is now empty. */
  after: string[];
  kind: ChangeKind;
  /** Cells to tap for 'new' / 'swap' (either one counts for swap). */
  answerCells: number[];
  /** For 'missing': which item disappeared. */
  options: string[];
  correctIndex: number;
  studyMs: number;
  columns: number;
};

export function changedRound(level: number, rng: Rng): ChangedRound {
  const count = clamp(2 + level, 3, 9);
  const kind: ChangeKind = level <= 3 ? 'missing' : level <= 6 ? (rng() < 0.5 ? 'missing' : 'new') : pick(rng, ['missing', 'new', 'swap'] as const);
  const pool = shuffle(rng, SCENE_POOL);
  const before = pool.slice(0, count);
  const unused = pool.slice(count);
  const after = before.slice();
  let answerCells: number[] = [];
  let options: string[] = [];
  let correctIndex = -1;
  const i = int(rng, 0, count - 1);
  if (kind === 'missing') {
    after[i] = '';
    // Distractors are things that were never in the scene, so the child must remember.
    const r = withDistractors(rng, before[i], unused, count <= 4 ? 3 : 4);
    options = r.options;
    correctIndex = r.correctIndex;
  } else if (kind === 'new') {
    after[i] = unused[0];
    answerCells = [i];
  } else {
    let j = int(rng, 0, count - 2);
    if (j >= i) j++;
    [after[i], after[j]] = [after[j], after[i]];
    answerCells = [i, j];
  }
  return { before, after, kind, answerCells, options, correctIndex, studyMs: 2000 + count * 450, columns: count <= 4 ? 2 : 3 };
}

// ── Mirror ───────────────────────────────────────────────────────────────
export type MirrorRound = {
  rows: number;
  cols: number;
  /** 'vertical' = left|right halves, 'horizontal' = top|bottom halves. */
  axis: 'vertical' | 'horizontal';
  given: number[];
  targets: number[];
};

export const mirrorOf = (m: Pick<MirrorRound, 'rows' | 'cols' | 'axis'>, idx: number) => {
  const r = Math.floor(idx / m.cols), c = idx % m.cols;
  return m.axis === 'vertical' ? r * m.cols + (m.cols - 1 - c) : (m.rows - 1 - r) * m.cols + c;
};

export function mirrorRound(level: number, rng: Rng): MirrorRound {
  const axis: MirrorRound['axis'] = level >= 6 && rng() < 0.5 ? 'horizontal' : 'vertical';
  const half = clamp(2 + Math.floor((level - 1) / 3), 2, 4);
  const other = clamp(3 + Math.floor(level / 2), 3, 6);
  const rows = axis === 'vertical' ? other : half * 2;
  const cols = axis === 'vertical' ? half * 2 : other;
  const source: number[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (axis === 'vertical' ? c < half : r < half) source.push(r * cols + c);
  const amount = clamp(Math.round(source.length * (0.3 + Math.min(level, 10) * 0.02)), 2, source.length - 1);
  const given = sample(rng, source, amount).sort((a, b) => a - b);
  const m = { rows, cols, axis };
  return { ...m, given, targets: given.map((g) => mirrorOf(m, g)).sort((a, b) => a - b) };
}

// ── Waste sorting ────────────────────────────────────────────────────────
export type Bin = 'food' | 'paper' | 'plastic' | 'glass' | 'metal';
export const BINS: Record<Bin, { ar: string; emoji: string; color: string }> = {
  food: { ar: 'طعام', emoji: '🍂', color: '#92400E' },
  paper: { ar: 'ورق', emoji: '📄', color: '#2563EB' },
  plastic: { ar: 'بلاستيك', emoji: '🧴', color: '#EAB308' },
  glass: { ar: 'زجاج', emoji: '🫙', color: '#16A34A' },
  metal: { ar: 'معادن', emoji: '🥫', color: '#6B7280' },
};
export type WasteItem = { emoji: string; ar: string; bin: Bin };
export const WASTE: readonly WasteItem[] = [
  { emoji: '🍌', ar: 'قشر موز', bin: 'food' }, { emoji: '🍏', ar: 'بقايا تفاحة', bin: 'food' }, { emoji: '🥕', ar: 'جزرة', bin: 'food' },
  { emoji: '🦴', ar: 'عظمة', bin: 'food' }, { emoji: '🥚', ar: 'قشر بيض', bin: 'food' }, { emoji: '🍉', ar: 'قشر بطيخ', bin: 'food' },
  { emoji: '📰', ar: 'جريدة', bin: 'paper' }, { emoji: '📦', ar: 'كرتونة', bin: 'paper' }, { emoji: '📄', ar: 'ورقة', bin: 'paper' },
  { emoji: '✉️', ar: 'ظرف', bin: 'paper' }, { emoji: '🗞️', ar: 'مجلة', bin: 'paper' },
  { emoji: '🧴', ar: 'علبة شامبو', bin: 'plastic' }, { emoji: '🥤', ar: 'كوب بلاستيك', bin: 'plastic' }, { emoji: '🍼', ar: 'رضّاعة', bin: 'plastic' },
  { emoji: '🪣', ar: 'دلو', bin: 'plastic' }, { emoji: '🛍️', ar: 'كيس', bin: 'plastic' },
  { emoji: '🫙', ar: 'مرطبان', bin: 'glass' }, { emoji: '🍾', ar: 'زجاجة', bin: 'glass' }, { emoji: '🥛', ar: 'كوب زجاج', bin: 'glass' },
  { emoji: '🥫', ar: 'علبة معلبات', bin: 'metal' }, { emoji: '🔩', ar: 'مسمار', bin: 'metal' }, { emoji: '📎', ar: 'مشبك ورق', bin: 'metal' },
];

/** Bins in use at a level, in a fixed order (bins stay in place so the child learns where they are). */
export const binsFor = (level: number): Bin[] =>
  tier([[1, ['food', 'paper']], [3, ['food', 'paper', 'plastic']], [5, ['food', 'paper', 'plastic', 'glass']], [7, ['food', 'paper', 'plastic', 'glass', 'metal']]] as const, level).slice();

export function recyclingRound(level: number, _s: GameSettings, rng: Rng): ChoiceRound<{ item: WasteItem }, Bin> {
  const bins = binsFor(level);
  const item = pick(rng, WASTE.filter((w) => bins.includes(w.bin)));
  return { prompt: { item }, options: bins, correctIndex: bins.indexOf(item.bin), speak: { text: item.ar, lang: 'ar' } };
}
