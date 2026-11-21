import { applyLevelComplete, createProfile, importLegacy } from '../progress';

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
