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

// ── What changed? (a room) ───────────────────────────────────────────────
/** Places in the room where things can sit. The UI maps each index to a position in the 3D room. */
export type SpotKind = 'wall' | 'surface' | 'floor';
export const ROOM_SPOTS: readonly SpotKind[] = [
  'surface', 'surface', 'surface', // shelf
  'wall', 'wall', // side walls
  'surface', 'surface', // table
  'floor', 'floor', 'floor', 'floor', 'floor',
];

export type RoomItem = { emoji: string; ar: string; kinds: SpotKind[] };
export const ROOM_ITEMS: readonly RoomItem[] = [
  { emoji: '📚', ar: 'كتب', kinds: ['surface'] }, { emoji: '⏰', ar: 'منبّه', kinds: ['surface'] },
  { emoji: '☕', ar: 'كوب', kinds: ['surface'] }, { emoji: '🍎', ar: 'تفاحة', kinds: ['surface'] },
  { emoji: '🤖', ar: 'روبوت', kinds: ['surface', 'floor'] }, { emoji: '🦆', ar: 'بطة', kinds: ['surface'] },
  { emoji: '🎲', ar: 'نرد', kinds: ['surface'] }, { emoji: '🎁', ar: 'هدية', kinds: ['surface', 'floor'] },
  { emoji: '🧩', ar: 'بازل', kinds: ['surface'] }, { emoji: '📻', ar: 'راديو', kinds: ['surface'] },
  { emoji: '🖍️', ar: 'ألوان', kinds: ['surface'] }, { emoji: '🏆', ar: 'كأس', kinds: ['surface'] },
  { emoji: '🖼️', ar: 'لوحة', kinds: ['wall'] }, { emoji: '🪞', ar: 'مرآة', kinds: ['wall'] },
  { emoji: '🗓️', ar: 'تقويم', kinds: ['wall'] }, { emoji: '🎯', ar: 'لوحة سهام', kinds: ['wall'] },
  { emoji: '🪁', ar: 'طائرة ورقية', kinds: ['wall'] }, { emoji: '🏅', ar: 'ميدالية', kinds: ['wall'] },
  { emoji: '⚽', ar: 'كرة', kinds: ['floor'] }, { emoji: '🏀', ar: 'كرة سلة', kinds: ['floor'] },
  { emoji: '🎒', ar: 'حقيبة', kinds: ['floor'] }, { emoji: '👟', ar: 'حذاء', kinds: ['floor'] },
  { emoji: '🚂', ar: 'قطار', kinds: ['floor'] }, { emoji: '🛹', ar: 'لوح تزلج', kinds: ['floor'] },
  { emoji: '🧸', ar: 'دبدوب', kinds: ['floor', 'surface'] }, { emoji: '🪴', ar: 'نبتة', kinds: ['floor', 'surface'] },
  { emoji: '🐈', ar: 'قطة', kinds: ['floor'] }, { emoji: '🥁', ar: 'طبل', kinds: ['floor'] },
];

export type ChangeKind = 'missing' | 'new' | 'swap';
export type ChangedRound = {
  /** One entry per ROOM_SPOTS index; '' = nothing there. */
  before: string[];
  after: string[];
  kind: ChangeKind;
  /** Spots to tap for 'new' / 'swap' (either one counts for swap). */
  answerCells: number[];
  /** For 'missing': which thing disappeared (and where it was, for the hint). */
  options: string[];
  correctIndex: number;
  studyMs: number;
};

const fits = (item: RoomItem, spot: number) => item.kinds.includes(ROOM_SPOTS[spot]);

export function changedRound(level: number, rng: Rng): ChangedRound {
  const count = clamp(2 + level, 3, 9);
  let kind: ChangeKind = level <= 3 ? 'missing' : level <= 6 ? (rng() < 0.5 ? 'missing' : 'new') : pick(rng, ['missing', 'new', 'swap'] as const);
  // Fill `count` spots with distinct things that belong there (no ball on the wall).
  const spots = sample(rng, ROOM_SPOTS.map((_, i) => i), count);
  const used = new Set<string>();
  const before: string[] = ROOM_SPOTS.map(() => '');
  for (const sp of spots) {
    const item = shuffle(rng, ROOM_ITEMS).find((it) => fits(it, sp) && !used.has(it.emoji))!;
    used.add(item.emoji);
    before[sp] = item.emoji;
  }
  const after = before.slice();
  const byEmoji = (e: string) => ROOM_ITEMS.find((it) => it.emoji === e)!;
  let answerCells: number[] = [];
  let options: string[] = [];
  let correctIndex = -1;

  if (kind === 'swap') {
    const pairs: [number, number][] = [];
    for (const a of spots) for (const b of spots) if (a < b && fits(byEmoji(before[a]), b) && fits(byEmoji(before[b]), a)) pairs.push([a, b]);
    if (pairs.length) {
      const [a, b] = pick(rng, pairs);
      [after[a], after[b]] = [after[b], after[a]];
      answerCells = [a, b];
    } else kind = 'new';
  }
  if (kind === 'new') {
    const sp = pick(rng, spots);
    const fresh = shuffle(rng, ROOM_ITEMS).find((it) => fits(it, sp) && !used.has(it.emoji));
    if (fresh) { after[sp] = fresh.emoji; answerCells = [sp]; } else kind = 'missing';
  }
  if (kind === 'missing') {
    const sp = pick(rng, spots);
    after[sp] = '';
    answerCells = [sp];
    // Distractors were never in the room, so the child has to remember.
    const unused = ROOM_ITEMS.map((it) => it.emoji).filter((e) => !used.has(e));
    const r = withDistractors(rng, before[sp], unused, count <= 4 ? 3 : 4);
    options = r.options;
    correctIndex = r.correctIndex;
  }
  return { before, after, kind, answerCells, options, correctIndex, studyMs: 2500 + count * 500 };
}

export const roomItemName = (emoji: string) => ROOM_ITEMS.find((it) => it.emoji === emoji)?.ar ?? '';

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
export type Bin = 'paper' | 'plastic' | 'food' | 'other';
export const BINS: Record<Bin, { ar: string; color: string; dark: string; light: string; icon: string }> = {
  paper: { ar: 'ورق', color: '#2563EB', dark: '#1E3A8A', light: '#60A5FA', icon: '📄' },
  plastic: { ar: 'بلاستيك', color: '#EAB308', dark: '#A16207', light: '#FDE047', icon: '🧴' },
  food: { ar: 'طعام', color: '#16A34A', dark: '#14532D', light: '#4ADE80', icon: '🍎' },
  other: { ar: 'مخلفات أخرى', color: '#4B5563', dark: '#1F2937', light: '#9CA3AF', icon: '🗑️' },
};
export type WasteItem = { emoji: string; ar: string; bin: Bin };
export const WASTE: readonly WasteItem[] = [
  { emoji: '🍌', ar: 'قشر موز', bin: 'food' }, { emoji: '🍏', ar: 'بقايا تفاحة', bin: 'food' }, { emoji: '🥕', ar: 'جزرة', bin: 'food' },
  { emoji: '🦴', ar: 'عظمة', bin: 'food' }, { emoji: '🥚', ar: 'قشر بيض', bin: 'food' }, { emoji: '🍉', ar: 'قشر بطيخ', bin: 'food' },
  { emoji: '📰', ar: 'جريدة', bin: 'paper' }, { emoji: '📦', ar: 'كرتونة', bin: 'paper' }, { emoji: '📄', ar: 'ورقة', bin: 'paper' },
  { emoji: '✉️', ar: 'ظرف', bin: 'paper' }, { emoji: '🗞️', ar: 'مجلة', bin: 'paper' },
  { emoji: '🧴', ar: 'علبة شامبو', bin: 'plastic' }, { emoji: '🥤', ar: 'كوب بلاستيك', bin: 'plastic' }, { emoji: '🍼', ar: 'رضّاعة', bin: 'plastic' },
  { emoji: '🪣', ar: 'دلو', bin: 'plastic' }, { emoji: '🛍️', ar: 'كيس', bin: 'plastic' },
  { emoji: '🧽', ar: 'إسفنجة مستعملة', bin: 'other' }, { emoji: '🪥', ar: 'فرشاة أسنان قديمة', bin: 'other' },
  { emoji: '🧦', ar: 'جورب ممزق', bin: 'other' }, { emoji: '🖍️', ar: 'قلم شمع مكسور', bin: 'other' }, { emoji: '🩹', ar: 'لاصق مستعمل', bin: 'other' },
];

/** Bins in use at a level, in a fixed order (they stay in place so the child learns where they are). */
export const binsFor = (level: number): Bin[] =>
  tier([[1, ['food', 'paper']], [3, ['paper', 'plastic', 'food']], [5, ['paper', 'plastic', 'food', 'other']]] as const, level).slice();

export function recyclingRound(level: number, _s: GameSettings, rng: Rng): ChoiceRound<{ item: WasteItem }, Bin> {
  const bins = binsFor(level);
  const item = pick(rng, WASTE.filter((w) => bins.includes(w.bin)));
  return { prompt: { item }, options: bins, correctIndex: bins.indexOf(item.bin), speak: { text: item.ar, lang: 'ar' } };
}
