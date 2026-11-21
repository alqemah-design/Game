import { effectiveLevel, tier } from '../engine/difficulty';
import { sessionReducer, startSession, shouldHint, isPerfectLevel } from '../engine/session';

const rounds = () => 3;
const reduce = sessionReducer(rounds);

describe('session engine', () => {
  it('completes a level after N correct rounds and never ends on mistakes', () => {
    let s = startSession(1, rounds);
    s = reduce(s, { type: 'wrong', roundKey: s.roundKey });
    s = reduce(s, { type: 'wrong', roundKey: s.roundKey });
    expect(shouldHint(s)).toBe(true);
    expect(s.phase).toBe('playing');
    s = reduce(s, { type: 'correct', points: 2, roundKey: s.roundKey }); // no first-try bonus
    s = reduce(s, { type: 'correct', points: 2, roundKey: s.roundKey }); // +1 bonus
    expect(s.phase).toBe('playing');
    s = reduce(s, { type: 'correct', points: 2, roundKey: s.roundKey });
    expect(s.phase).toBe('levelComplete');
    expect(s.pointsThisLevel).toBe(2 + 3 + 3);
    expect(isPerfectLevel(s)).toBe(false);
    // Answers after completion are ignored
    expect(reduce(s, { type: 'correct', points: 99, roundKey: s.roundKey })).toBe(s);
  });

  it('ignores late or duplicate reports from an earlier round', () => {
    let s = startSession(1, rounds);
    const first = s.roundKey;
    s = reduce(s, { type: 'correct', points: 2, roundKey: first });
    const after = reduce(s, { type: 'correct', points: 2, roundKey: first }); // duplicate
    expect(after).toBe(s);
    expect(reduce(s, { type: 'wrong', roundKey: first })).toBe(s); // stale mistake
    expect(s.round).toBe(1);
  });

  it('next advances the level, replay keeps it', () => {
    const done = { ...startSession(4, rounds), phase: 'levelComplete' as const };
    expect(reduce(done, { type: 'next' }).level).toBe(5);
    expect(reduce(done, { type: 'replay' }).level).toBe(4);
    expect(reduce(done, { type: 'next' }).phase).toBe('playing');
  });

  it('applies the difficulty multiplier to every level', () => {
    expect(effectiveLevel(10, 'easy')).toBe(7);
    expect(effectiveLevel(10, 'normal')).toBe(10);
    expect(effectiveLevel(10, 'hard')).toBe(15);
    expect(effectiveLevel(1, 'easy')).toBe(1);
  });

  it('tier picks the highest matching step', () => {
    const t = [[1, 'a'], [3, 'b'], [9, 'c']] as const;
    expect([1, 2, 3, 8, 9, 50].map((l) => tier(t, l))).toEqual(['a', 'a', 'b', 'b', 'c', 'c']);
  });
});
