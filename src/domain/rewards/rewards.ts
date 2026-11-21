/** Sticker thresholds and achievements. Pure: given a progress snapshot, what is earned. */
export type Sticker = { points: number; emoji: string; name: string };

export const STICKERS: readonly Sticker[] = [
  { points: 50, emoji: '🐣', name: 'الكتكوت' },
  { points: 150, emoji: '🌟', name: 'النجمة اللامعة' },
  { points: 300, emoji: '🦋', name: 'الفراشة' },
  { points: 500, emoji: '🐬', name: 'الدلفين' },
  { points: 750, emoji: '🦄', name: 'الحصان السحري' },
  { points: 1000, emoji: '🚀', name: 'الصاروخ' },
  { points: 1500, emoji: '🦁', name: 'الأسد' },
  { points: 2000, emoji: '🌈', name: 'قوس قزح' },
  { points: 3000, emoji: '🐉', name: 'التنين' },
  { points: 4000, emoji: '👑', name: 'التاج' },
  { points: 5000, emoji: '🏰', name: 'القلعة' },
  { points: 7000, emoji: '🪐', name: 'الكوكب' },
  { points: 10000, emoji: '💎', name: 'الماسة' },
  { points: 15000, emoji: '🏆', name: 'الكأس الذهبي' },
  { points: 20000, emoji: '🧠', name: 'العبقري' },
];

export type ProgressSnapshot = {
  points: number;
  stars: number;
  bestStreak: number;
  levels: Record<string, number>; // highest completed level per game
  artworks: number;
};

export type Unlock = { kind: 'coloringPage'; id: string } | { kind: 'decoration'; id: string };

export type Achievement = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  test: (p: ProgressSnapshot) => boolean;
  unlocks?: Unlock;
};

const gamesAtLeast = (p: ProgressSnapshot, level: number) => Object.values(p.levels).filter((l) => l >= level).length;

export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: 'firstStar', title: 'أول نجمة', description: 'أكمل أول مستوى', emoji: '⭐', test: (p) => p.stars >= 1, unlocks: { kind: 'coloringPage', id: 'fish' } },
  { id: 'stars10', title: 'جامع النجوم', description: 'اجمع ١٠ نجوم', emoji: '🌟', test: (p) => p.stars >= 10, unlocks: { kind: 'decoration', id: 'balloon' } },
  { id: 'stars25', title: 'سماء مضيئة', description: 'اجمع ٢٥ نجمة', emoji: '✨', test: (p) => p.stars >= 25, unlocks: { kind: 'coloringPage', id: 'butterfly' } },
  { id: 'stars50', title: 'مجرّة النجوم', description: 'اجمع ٥٠ نجمة', emoji: '🌌', test: (p) => p.stars >= 50, unlocks: { kind: 'decoration', id: 'rainbow' } },
  { id: 'stars100', title: 'نجم النجوم', description: 'اجمع ١٠٠ نجمة', emoji: '💫', test: (p) => p.stars >= 100, unlocks: { kind: 'decoration', id: 'trophy' } },
  { id: 'explorer3', title: 'المستكشف', description: 'العب ٣ ألعاب مختلفة', emoji: '🧭', test: (p) => gamesAtLeast(p, 1) >= 3, unlocks: { kind: 'coloringPage', id: 'house' } },
  { id: 'explorer8', title: 'الرحّالة', description: 'أكمل مستوى في ٨ ألعاب', emoji: '🗺️', test: (p) => gamesAtLeast(p, 1) >= 8, unlocks: { kind: 'coloringPage', id: 'rocket' } },
  { id: 'level5', title: 'المثابر', description: 'صل للمستوى ٥ في لعبة', emoji: '🎯', test: (p) => gamesAtLeast(p, 5) >= 1, unlocks: { kind: 'decoration', id: 'medal' } },
  { id: 'level10', title: 'الخبير', description: 'صل للمستوى ١٠ في لعبة', emoji: '🥇', test: (p) => gamesAtLeast(p, 10) >= 1, unlocks: { kind: 'coloringPage', id: 'castle' } },
  { id: 'allRounder', title: 'متعدد المواهب', description: 'المستوى ٣ في ٥ ألعاب', emoji: '🎓', test: (p) => gamesAtLeast(p, 3) >= 5, unlocks: { kind: 'decoration', id: 'star' } },
  { id: 'streak3', title: 'سلسلة رائعة', description: '٣ مستويات متتالية بلا خطأ', emoji: '🔥', test: (p) => p.bestStreak >= 3 },
  { id: 'streak10', title: 'لا يُوقف', description: '١٠ مستويات متتالية بلا خطأ', emoji: '⚡', test: (p) => p.bestStreak >= 10, unlocks: { kind: 'coloringPage', id: 'dragon' } },
  { id: 'points1000', title: 'ألف نقطة', description: 'اجمع ١٠٠٠ نقطة', emoji: '💰', test: (p) => p.points >= 1000 },
  { id: 'points5000', title: 'خمسة آلاف', description: 'اجمع ٥٠٠٠ نقطة', emoji: '💎', test: (p) => p.points >= 5000 },
  { id: 'artist', title: 'الفنان الصغير', description: 'احفظ ٣ لوحات', emoji: '🖼️', test: (p) => p.artworks >= 3, unlocks: { kind: 'coloringPage', id: 'flower' } },
];

export const earnedStickers = (points: number) => STICKERS.filter((s) => points >= s.points);
export const nextSticker = (points: number) => STICKERS.find((s) => points < s.points);

/** Achievements earned now that were not earned before. */
export const newAchievements = (p: ProgressSnapshot, already: readonly string[]) =>
  ACHIEVEMENTS.filter((a) => !already.includes(a.id) && a.test(p));

export const BASE_COLORING_PAGES = ['cat', 'sun', 'car'];
export function unlockedColoringPages(achievementIds: readonly string[]) {
  const extra = ACHIEVEMENTS.filter((a) => achievementIds.includes(a.id) && a.unlocks?.kind === 'coloringPage').map((a) => a.unlocks!.id);
  return [...BASE_COLORING_PAGES, ...extra];
}
export function unlockedDecorations(achievementIds: readonly string[]) {
  return ACHIEVEMENTS.filter((a) => achievementIds.includes(a.id) && a.unlocks?.kind === 'decoration').map((a) => a.unlocks!.id);
}
