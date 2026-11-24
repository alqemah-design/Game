import { applyLevelComplete, createProfile, importLegacy, normalizeProfiles } from '../progress';

const NOW = new Date(2026, 10, 21, 10).getTime();

describe('progress rules', () => {
  it('awards a star, points, unlocks first-star achievement and the 50-point sticker once', () => {
    let p = createProfile('a', 'سارة', NOW);
    const r1 = applyLevelComplete(p, { gameId: 'shapeMatch', level: 1, points: 60, rounds: 3, mistakes: 0, now: NOW });
    p = r1.profile;
    expect(p.stars).toBe(1);
    expect(p.games.shapeMatch).toMatchObject({ level: 2, completed: 1, plays: 1 });
    expect(r1.events.achievements.map((a) => a.id)).toContain('firstStar');
    expect(r1.events.stickers.map((s) => s.points)).toEqual([50]);
    const r2 = applyLevelComplete(p, { gameId: 'shapeMatch', level: 2, points: 10, rounds: 3, mistakes: 1, now: NOW });
    expect(r2.events.achievements.map((a) => a.id)).not.toContain('firstStar');
    expect(r2.events.stickers).toEqual([]);
    expect(r2.profile.currentStreak).toBe(0);
    expect(r2.profile.bestStreak).toBe(1);
    expect(r2.profile.activity['2026-11-21']).toEqual({ levels: 2, points: 70 });
  });

  it('replaying an old level never lowers progress', () => {
    let p = createProfile('a', 'x', NOW);
    p = applyLevelComplete(p, { gameId: 'maze', level: 5, points: 1, rounds: 2, mistakes: 0, now: NOW }).profile;
    p = applyLevelComplete(p, { gameId: 'maze', level: 2, points: 1, rounds: 2, mistakes: 0, now: NOW }).profile;
    expect(p.games.maze).toMatchObject({ level: 6, completed: 5 });
  });

  it('imports legacy gameN_level fields', () => {
    const p = importLegacy(createProfile('a', 'x', NOW), { game1_level: 4, game19_level: 7, points: 900, stars_total: 12 });
    expect(p.games.shapeMatch?.level).toBe(4);
    expect(p.games.arabicLetters?.level).toBe(7);
    expect(p.points).toBe(900);
    expect(p.stars).toBe(12);
  });
});

describe('loading saved data', () => {
  it('repairs old or damaged profiles without losing valid progress', () => {
    const out = normalizeProfiles({
      a: { id: 'a', name: 'سارة', points: 120, stars: 'x', games: { maze: { level: 4, completed: 3 }, oldGame10: { level: 9 } }, settings: { sound: false, math: { max: 50 } } },
      broken: 42,
      b: { name: 'no id' },
    });
    expect(Object.keys(out)).toEqual(['a']);
    const p = out.a;
    expect(p.points).toBe(120);
    expect(p.stars).toBe(0);
    expect(p.games.maze).toMatchObject({ level: 4, completed: 3, plays: 0 });
    expect(Object.keys(p.games)).toEqual(['maze']);
    expect(p.settings.sound).toBe(false);
    expect(p.settings.math).toEqual({ min: 0, max: 50, ops: ['+', '-'] });
    expect(p.settings.difficulty).toBe('normal');
    expect(Array.isArray(p.artworks)).toBe(true);
  });
});

describe('stars, adaptive difficulty and game of the day', () => {
  const { gameOfTheDay, dayKey } = jest.requireActual('../progress');
  const run = (p: ReturnType<typeof createProfile>, level: number, mistakes: number, stars = 1) =>
    applyLevelComplete(p, { gameId: 'maze', level, points: 10, rounds: 2, mistakes, now: NOW, stars });

  it('adds the stars earned (1–3)', () => {
    const r = run(createProfile('a', 'x', NOW), 1, 0, 3);
    expect(r.profile.stars).toBe(3);
    expect(r.profile.games.maze?.stars).toBe(3);
    expect(r.events.stars).toBe(3);
  });

  it('skips a level after two perfect levels in a row', () => {
    let p = createProfile('a', 'x', NOW);
    p = run(p, 1, 0).profile;
    const r = run(p, 2, 0);
    expect(r.events.adapted).toBe('jump');
    expect(r.events.nextLevel).toBe(4);
    expect(r.profile.games.maze?.level).toBe(4);
  });

  it('repeats a level after two hard ones, and never when adaptive is off', () => {
    let p = createProfile('a', 'x', NOW);
    p = run(p, 1, 3).profile;
    const r = run(p, 2, 3);
    expect(r.events.adapted).toBe('repeat');
    expect(r.profile.games.maze?.level).toBe(2);
    const off = { ...createProfile('b', 'y', NOW) };
    off.settings = { ...off.settings, adaptive: false };
    const r2 = run(run(off, 1, 0).profile, 2, 0);
    expect(r2.events.adapted).toBeUndefined();
    expect(r2.events.nextLevel).toBe(3);
  });

  it('doubles points for the game of the day only', () => {
    const p = createProfile('kid', 'x', NOW);
    const today = gameOfTheDay(dayKey(NOW), 'kid');
    const bonus = applyLevelComplete(p, { gameId: today, level: 1, points: 10, rounds: 5, mistakes: 1, now: NOW });
    expect(bonus.events.dailyBonus).toBe(true);
    expect(bonus.profile.points).toBe(20);
    const other = today === 'maze' ? 'shapeMatch' : 'maze';
    expect(applyLevelComplete(p, { gameId: other, level: 1, points: 10, rounds: 5, mistakes: 1, now: NOW }).profile.points).toBe(10);
    expect(gameOfTheDay('2026-11-24', 'kid')).toBe(gameOfTheDay('2026-11-24', 'kid'));
  });
});

describe('play time and weekly report', () => {
  const P = jest.requireActual('../progress');
  it('counts minutes left against the daily limit, including parent bonus', () => {
    let p = createProfile('a', 'x', NOW);
    expect(P.minutesLeftToday(p, NOW)).toBe(Infinity);
    p = { ...p, settings: { ...p.settings, dailyLimitMin: 30 } };
    p = P.addPlaySeconds(p, 25 * 60, NOW);
    expect(P.minutesLeftToday(p, NOW)).toBe(5);
    p = P.addPlaySeconds(p, 10 * 60, NOW);
    expect(P.minutesLeftToday(p, NOW)).toBe(0);
    p = P.grantBonusMinutes(p, 15, NOW);
    expect(P.minutesLeftToday(p, NOW)).toBe(10);
    expect(P.minutesLeftToday(p, NOW + 86400000)).toBe(30); // new day, fresh limit
  });
  it('summarises the week and flags games to practise', () => {
    let p = createProfile('a', 'x', NOW);
    p = P.addPlaySeconds(p, 600, NOW);
    p = P.addPlaySeconds(p, 300, NOW - 2 * 86400000);
    p = applyLevelComplete(p, { gameId: 'maze', level: 1, points: 10, rounds: 5, mistakes: 0, now: NOW }).profile;
    for (let i = 0; i < 2; i++) p = applyLevelComplete(p, { gameId: 'mathChallenge', level: 1 + i, points: 5, rounds: 5, mistakes: 4, now: NOW }).profile;
    const r = P.weeklyReport(p, NOW);
    expect(r.minutes).toBe(15);
    expect(r.activeDays).toBe(2);
    expect(r.levels).toBe(3);
    expect(r.strong).toContain('maze');
    expect(r.practice).toEqual(['mathChallenge']);
  });
});
