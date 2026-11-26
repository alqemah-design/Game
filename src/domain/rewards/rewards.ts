/** Sticker thresholds and achievements. Pure: given a progress snapshot, what is earned. */
/** Sticker and achievement names live in the i18n dictionaries (stickers.s<points>, achievements.<id>). */
export type Sticker = { points: number; emoji: string };

export const STICKERS: readonly Sticker[] = [
  { points: 50, emoji: '🐣' },
  { points: 150, emoji: '🌟' },
  { points: 300, emoji: '🦋' },
  { points: 500, emoji: '🐬' },
  { points: 750, emoji: '🦄' },
  { points: 1000, emoji: '🚀' },
  { points: 1500, emoji: '🦁' },
  { points: 2000, emoji: '🌈' },
  { points: 3000, emoji: '🐉' },
  { points: 4000, emoji: '👑' },
  { points: 5000, emoji: '🏰' },
  { points: 7000, emoji: '🪐' },
  { points: 10000, emoji: '💎' },
  { points: 15000, emoji: '🏆' },
  { points: 20000, emoji: '🧠' },
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
  emoji: string;
  test: (p: ProgressSnapshot) => boolean;
  unlocks?: Unlock;
};

const gamesAtLeast = (p: ProgressSnapshot, level: number) => Object.values(p.levels).filter((l) => l >= level).length;

export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: 'firstStar', emoji: '⭐', test: (p) => p.stars >= 1, unlocks: { kind: 'coloringPage', id: 'fish' } },
  { id: 'stars10', emoji: '🌟', test: (p) => p.stars >= 10, unlocks: { kind: 'decoration', id: 'balloon' } },
  { id: 'stars25', emoji: '✨', test: (p) => p.stars >= 25, unlocks: { kind: 'coloringPage', id: 'butterfly' } },
  { id: 'stars50', emoji: '🌌', test: (p) => p.stars >= 50, unlocks: { kind: 'decoration', id: 'rainbow' } },
  { id: 'stars100', emoji: '💫', test: (p) => p.stars >= 100, unlocks: { kind: 'decoration', id: 'trophy' } },
  { id: 'explorer3', emoji: '🧭', test: (p) => gamesAtLeast(p, 1) >= 3, unlocks: { kind: 'coloringPage', id: 'house' } },
  { id: 'explorer8', emoji: '🗺️', test: (p) => gamesAtLeast(p, 1) >= 8, unlocks: { kind: 'coloringPage', id: 'rocket' } },
  { id: 'level5', emoji: '🎯', test: (p) => gamesAtLeast(p, 5) >= 1, unlocks: { kind: 'decoration', id: 'medal' } },
  { id: 'level10', emoji: '🥇', test: (p) => gamesAtLeast(p, 10) >= 1, unlocks: { kind: 'coloringPage', id: 'castle' } },
  { id: 'allRounder', emoji: '🎓', test: (p) => gamesAtLeast(p, 3) >= 5, unlocks: { kind: 'decoration', id: 'star' } },
  { id: 'streak3', emoji: '🔥', test: (p) => p.bestStreak >= 3 },
  { id: 'streak10', emoji: '⚡', test: (p) => p.bestStreak >= 10, unlocks: { kind: 'coloringPage', id: 'dragon' } },
  { id: 'points1000', emoji: '💰', test: (p) => p.points >= 1000 },
  { id: 'points5000', emoji: '💎', test: (p) => p.points >= 5000 },
  { id: 'artist', emoji: '🖼️', test: (p) => p.artworks >= 3, unlocks: { kind: 'coloringPage', id: 'flower' } },
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
