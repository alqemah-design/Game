/** Child profile + the pure rules that update it. Storage lives in src/data, not here. */
import { DEFAULT_AVATAR, normalizeAvatar, type Avatar } from './rewards/avatar';
import { STICKERS, newAchievements, type Achievement, type Sticker } from './rewards/rewards';
import { GAMES } from './games/catalog';
import { DEFAULT_GAME_SETTINGS, type GameId, type GameSettings } from './types';

export type GameProgress = {
  /** Level the child will play next. */
  level: number;
  /** Highest level completed. */
  completed: number;
  plays: number;
  correct: number;
  mistakes: number;
  lastPlayedAt: number;
};

export type ArtStroke = { d: string; color: string; width: number };
export type Artwork = {
  id: string;
  pageId: string;
  fills: Record<string, string>;
  strokes: ArtStroke[];
  stickers: { emoji: string; x: number; y: number }[];
  createdAt: number;
};

export type ProfileSettings = GameSettings & { sound: boolean; haptics: boolean; effects: boolean };

export type Profile = {
  id: string;
  name: string;
  avatar: Avatar;
  createdAt: number;
  points: number;
  stars: number;
  currentStreak: number;
  bestStreak: number;
  games: Partial<Record<GameId, GameProgress>>;
  achievements: string[];
  seenStickers: number[];
  artworks: Artwork[];
  /** Per local day: levels completed and points earned. */
  activity: Record<string, { levels: number; points: number }>;
  settings: ProfileSettings;
};

export const DEFAULT_PROFILE_SETTINGS: ProfileSettings = { ...DEFAULT_GAME_SETTINGS, sound: true, haptics: true, effects: true };

export function createProfile(id: string, name: string, now: number, avatar: Avatar = DEFAULT_AVATAR): Profile {
  return {
    id, name: name.trim() || 'بطل', avatar, createdAt: now,
    points: 0, stars: 0, currentStreak: 0, bestStreak: 0,
    games: {}, achievements: [], seenStickers: [], artworks: [], activity: {},
    settings: { ...DEFAULT_PROFILE_SETTINGS },
  };
}

export const emptyGameProgress = (): GameProgress => ({ level: 1, completed: 0, plays: 0, correct: 0, mistakes: 0, lastPlayedAt: 0 });

export const dayKey = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export type LevelResult = { gameId: GameId; level: number; points: number; rounds: number; mistakes: number; now: number };
export type ProgressEvents = { achievements: Achievement[]; stickers: Sticker[] };

export function snapshot(p: Profile) {
  return {
    points: p.points,
    stars: p.stars,
    bestStreak: p.bestStreak,
    levels: Object.fromEntries(Object.entries(p.games).map(([k, g]) => [k, g!.completed])),
    artworks: p.artworks.length,
  };
}

/** Apply a completed level: +1 star, points, streak, per-game stats, achievements. */
export function applyLevelComplete(p: Profile, r: LevelResult): { profile: Profile; events: ProgressEvents } {
  const prev = p.games[r.gameId] ?? emptyGameProgress();
  const perfect = r.mistakes === 0;
  const currentStreak = perfect ? p.currentStreak + 1 : 0;
  const day = dayKey(r.now);
  const today = p.activity[day] ?? { levels: 0, points: 0 };
  const next: Profile = {
    ...p,
    points: p.points + r.points,
    stars: p.stars + 1,
    currentStreak,
    bestStreak: Math.max(p.bestStreak, currentStreak),
    games: {
      ...p.games,
      [r.gameId]: {
        level: Math.max(prev.level, r.level + 1),
        completed: Math.max(prev.completed, r.level),
        plays: prev.plays + 1,
        correct: prev.correct + r.rounds,
        mistakes: prev.mistakes + r.mistakes,
        lastPlayedAt: r.now,
      },
    },
    activity: { ...p.activity, [day]: { levels: today.levels + 1, points: today.points + r.points } },
  };
  return withRewards(p, next);
}

/** Adds points outside the level loop (e.g. saving a drawing). */
export function addPoints(p: Profile, points: number, now: number) {
  const day = dayKey(now);
  const today = p.activity[day] ?? { levels: 0, points: 0 };
  return withRewards(p, { ...p, points: p.points + points, activity: { ...p.activity, [day]: { ...today, points: today.points + points } } });
}

function withRewards(before: Profile, after: Profile): { profile: Profile; events: ProgressEvents } {
  const achievements = newAchievements(snapshot(after), after.achievements);
  const stickers = STICKERS.filter((s) => before.points < s.points && after.points >= s.points && !after.seenStickers.includes(s.points));
  return {
    profile: {
      ...after,
      achievements: [...after.achievements, ...achievements.map((a) => a.id)],
      seenStickers: [...after.seenStickers, ...stickers.map((s) => s.points)],
    },
    events: { achievements, stickers },
  };
}

/** Best-effort import of the old web app's `kidsGamesProgress` JSON (gameN_level fields). */
export function importLegacy(p: Profile, legacy: Record<string, unknown>): Profile {
  const num = (k: string) => (typeof legacy[k] === 'number' ? (legacy[k] as number) : 0);
  const games = { ...p.games };
  for (const g of GAMES) {
    const lvl = num(`${g.legacyKey}_level`);
    if (lvl > 1) games[g.id] = { ...(games[g.id] ?? emptyGameProgress()), level: lvl, completed: lvl - 1 };
  }
  return {
    ...p,
    games,
    points: Math.max(p.points, num('points')),
    stars: Math.max(p.stars, num('stars_total')),
    bestStreak: Math.max(p.bestStreak, num('best_streak')),
  };
}

// ── Loading persisted data safely ────────────────────────────────────────
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const num = (v: unknown, d = 0) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : d);
const KNOWN_GAMES = new Set<string>(GAMES.map((g) => g.id));

/**
 * Repairs a profile loaded from disk: fills fields added in later versions, drops unknown games
 * and invalid numbers. A damaged or older save never crashes the app or loses valid progress.
 */
export function normalizeProfile(raw: unknown): Profile | null {
  if (!isObj(raw) || typeof raw.id !== 'string' || !raw.id) return null;
  const base = createProfile(raw.id, typeof raw.name === 'string' ? raw.name : '', num(raw.createdAt, Date.now()));
  const games: Profile['games'] = {};
  if (isObj(raw.games)) {
    for (const [k, g] of Object.entries(raw.games)) {
      if (!KNOWN_GAMES.has(k) || !isObj(g)) continue;
      const e = emptyGameProgress();
      games[k as GameId] = {
        level: Math.max(1, Math.floor(num(g.level, 1))), completed: Math.floor(num(g.completed)),
        plays: num(g.plays), correct: num(g.correct), mistakes: num(g.mistakes), lastPlayedAt: num(g.lastPlayedAt, e.lastPlayedAt),
      };
    }
  }
  const s = isObj(raw.settings) ? raw.settings : {};
  const math = isObj(s.math) ? s.math : {};
  const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
  return {
    ...base,
    avatar: normalizeAvatar(raw.avatar),
    points: num(raw.points), stars: num(raw.stars), currentStreak: num(raw.currentStreak), bestStreak: num(raw.bestStreak),
    games,
    achievements: strings(raw.achievements),
    seenStickers: Array.isArray(raw.seenStickers) ? raw.seenStickers.filter((x): x is number => typeof x === 'number') : [],
    artworks: Array.isArray(raw.artworks) ? (raw.artworks.filter((a) => isObj(a) && typeof a.id === 'string' && typeof a.pageId === 'string') as Artwork[]) : [],
    activity: isObj(raw.activity) ? (raw.activity as Profile['activity']) : {},
    settings: {
      ...DEFAULT_PROFILE_SETTINGS,
      ...(s as Partial<ProfileSettings>),
      math: { ...DEFAULT_PROFILE_SETTINGS.math, ...(math as Partial<ProfileSettings['math']>) },
      focusLetters: strings(s.focusLetters),
    },
  };
}

export function normalizeProfiles(raw: unknown): Record<string, Profile> {
  const out: Record<string, Profile> = {};
  if (isObj(raw)) for (const v of Object.values(raw)) { const p = normalizeProfile(v); if (p) out[p.id] = p; }
  return out;
}
