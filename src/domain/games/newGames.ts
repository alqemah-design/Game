/** Rules for: Little Market, What Changed?, Mirror, Waste Sorting. Pure functions of (level, rng). */
import { tier } from '../engine/difficulty';
import { clamp, int, pick, sample, shuffle, withDistractors, type Rng } from '../rng';
import type { ChoiceRound, GameSettings } from '../types';

// ── Little market ────────────────────────────────────────────────────────
export type MarketItem = { emoji: string; ar: string; en: string };
export const MARKET_ITEMS: readonly MarketItem[] = [
  { emoji: '🍎', ar: 'تفاحة', en: 'apple' }, { emoji: '🍌', ar: 'موز', en: 'bananas' }, { emoji: '🧃', ar: 'عصير', en: 'juice' }, { emoji: '🥛', ar: 'حليب', en: 'milk' },
  { emoji: '🍞', ar: 'خبز', en: 'bread' }, { emoji: '🧀', ar: 'جبنة', en: 'cheese' }, { emoji: '🍪', ar: 'بسكويت', en: 'biscuits' }, { emoji: '🍦', ar: 'آيس كريم', en: 'ice cream' },
  { emoji: '✏️', ar: 'قلم', en: 'pencil' }, { emoji: '📒', ar: 'دفتر', en: 'notebook' }, { emoji: '🎈', ar: 'بالون', en: 'balloon' }, { emoji: '⚽', ar: 'كرة', en: 'ball' },
  { emoji: '🧸', ar: 'دبدوب', en: 'teddy bear' }, { emoji: '🪁', ar: 'طائرة ورقية', en: 'kite' }, { emoji: '🎨', ar: 'ألوان', en: 'paints' }, { emoji: '🚗', ar: 'سيارة لعبة', en: 'toy car' },
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

export type RoomItem = { emoji: string; ar: string; en: string; kinds: SpotKind[] };
export const ROOM_ITEMS: readonly RoomItem[] = [
  { emoji: '📚', ar: 'كتب', en: 'books', kinds: ['surface'] }, { emoji: '⏰', ar: 'منبّه', en: 'alarm clock', kinds: ['surface'] },
  { emoji: '☕', ar: 'كوب', en: 'mug', kinds: ['surface'] }, { emoji: '🍎', ar: 'تفاحة', en: 'apple', kinds: ['surface'] },
  { emoji: '🤖', ar: 'روبوت', en: 'robot', kinds: ['surface', 'floor'] }, { emoji: '🦆', ar: 'بطة', en: 'duck', kinds: ['surface'] },
  { emoji: '🎲', ar: 'نرد', en: 'dice', kinds: ['surface'] }, { emoji: '🎁', ar: 'هدية', en: 'present', kinds: ['surface', 'floor'] },
  { emoji: '🧩', ar: 'بازل', en: 'puzzle', kinds: ['surface'] }, { emoji: '📻', ar: 'راديو', en: 'radio', kinds: ['surface'] },
  { emoji: '🖍️', ar: 'ألوان', en: 'crayons', kinds: ['surface'] }, { emoji: '🏆', ar: 'كأس', en: 'trophy', kinds: ['surface'] },
  { emoji: '🖼️', ar: 'لوحة', en: 'painting', kinds: ['wall'] }, { emoji: '🪞', ar: 'مرآة', en: 'mirror', kinds: ['wall'] },
  { emoji: '🗓️', ar: 'تقويم', en: 'calendar', kinds: ['wall'] }, { emoji: '🎯', ar: 'لوحة سهام', en: 'dartboard', kinds: ['wall'] },
  { emoji: '🪁', ar: 'طائرة ورقية', en: 'kite', kinds: ['wall'] }, { emoji: '🏅', ar: 'ميدالية', en: 'medal', kinds: ['wall'] },
  { emoji: '⚽', ar: 'كرة', en: 'ball', kinds: ['floor'] }, { emoji: '🏀', ar: 'كرة سلة', en: 'basketball', kinds: ['floor'] },
  { emoji: '🎒', ar: 'حقيبة', en: 'backpack', kinds: ['floor'] }, { emoji: '👟', ar: 'حذاء', en: 'shoe', kinds: ['floor'] },
  { emoji: '🚂', ar: 'قطار', en: 'train', kinds: ['floor'] }, { emoji: '🛹', ar: 'لوح تزلج', en: 'skateboard', kinds: ['floor'] },
  { emoji: '🧸', ar: 'دبدوب', en: 'teddy bear', kinds: ['floor', 'surface'] }, { emoji: '🪴', ar: 'نبتة', en: 'plant', kinds: ['floor', 'surface'] },
  { emoji: '🐈', ar: 'قطة', en: 'cat', kinds: ['floor'] }, { emoji: '🥁', ar: 'طبل', en: 'drum', kinds: ['floor'] },
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

export const roomItem = (emoji: string) => ROOM_ITEMS.find((it) => it.emoji === emoji);

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
export type Bin = 'paper' | 'plastic' | 'food' | 'general';
/** Bin colours; names live in the i18n dictionaries under bins.<id>. */
export const BINS: Record<Bin, { color: string; dark: string; light: string; icon: string }> = {
  paper: { color: '#2563EB', dark: '#1E3A8A', light: '#60A5FA', icon: '📄' },
  plastic: { color: '#EAB308', dark: '#A16207', light: '#FDE047', icon: '🧴' },
  food: { color: '#16A34A', dark: '#14532D', light: '#4ADE80', icon: '🍎' },
  general: { color: '#4B5563', dark: '#1F2937', light: '#9CA3AF', icon: '🗑️' },
};
export type WasteItem = { emoji: string; ar: string; en: string; bin: Bin };
export const WASTE: readonly WasteItem[] = [
  { emoji: '🍌', ar: 'قشر موز', en: 'banana peel', bin: 'food' }, { emoji: '🍏', ar: 'بقايا تفاحة', en: 'apple core', bin: 'food' }, { emoji: '🥕', ar: 'جزرة', en: 'carrot', bin: 'food' },
  { emoji: '🦴', ar: 'عظمة', en: 'bone', bin: 'food' }, { emoji: '🥚', ar: 'قشر بيض', en: 'eggshells', bin: 'food' }, { emoji: '🍉', ar: 'قشر بطيخ', en: 'watermelon rind', bin: 'food' },
  { emoji: '📰', ar: 'جريدة', en: 'newspaper', bin: 'paper' }, { emoji: '📦', ar: 'كرتونة', en: 'cardboard box', bin: 'paper' }, { emoji: '📄', ar: 'ورقة', en: 'sheet of paper', bin: 'paper' },
  { emoji: '✉️', ar: 'ظرف', en: 'envelope', bin: 'paper' }, { emoji: '🗞️', ar: 'مجلة', en: 'magazine', bin: 'paper' },
  { emoji: '🧴', ar: 'علبة شامبو', en: 'shampoo bottle', bin: 'plastic' }, { emoji: '🥤', ar: 'كوب بلاستيك', en: 'plastic cup', bin: 'plastic' }, { emoji: '🍼', ar: 'رضّاعة', en: 'baby bottle', bin: 'plastic' },
  { emoji: '🪣', ar: 'دلو', en: 'bucket', bin: 'plastic' }, { emoji: '🛍️', ar: 'كيس', en: 'bag', bin: 'plastic' },
  { emoji: '🧽', ar: 'إسفنجة مستعملة', en: 'used sponge', bin: 'general' }, { emoji: '🪥', ar: 'فرشاة أسنان قديمة', en: 'old toothbrush', bin: 'general' },
  { emoji: '🧦', ar: 'جورب ممزق', en: 'torn sock', bin: 'general' }, { emoji: '🖍️', ar: 'قلم شمع مكسور', en: 'broken crayon', bin: 'general' }, { emoji: '🩹', ar: 'لاصق مستعمل', en: 'used plaster', bin: 'general' },
];

/** Bins in use at a level, in a fixed order (they stay in place so the child learns where they are). */
export const binsFor = (level: number): Bin[] =>
  tier([[1, ['food', 'paper']], [3, ['paper', 'plastic', 'food']], [5, ['paper', 'plastic', 'food', 'general']]] as const, level).slice();

export function recyclingRound(level: number, _s: GameSettings, rng: Rng): ChoiceRound<{ item: WasteItem }, Bin> {
  const bins = binsFor(level);
  const item = pick(rng, WASTE.filter((w) => bins.includes(w.bin)));
  return { prompt: { item }, options: bins, correctIndex: bins.indexOf(item.bin), speak: { text: item.ar, lang: 'ar' } };
}
