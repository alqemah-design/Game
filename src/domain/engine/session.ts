/**
 * The one level/round state machine shared by every game.
 *
 *   playing ──correct──▶ (round+1) ──last round──▶ levelComplete ──next──▶ playing(level+1)
 *      └──wrong──▶ playing (same round, mistakes+1; hint after HINT_AFTER mistakes; never a "game over")
 *
 * Pure: no React, no storage. UI drives it with useReducer; persistence listens to `levelComplete`.
 */
export const HINT_AFTER = 2;
export const FIRST_TRY_BONUS = 1;

export type SessionPhase = 'playing' | 'levelComplete';

export type SessionState = {
  level: number;
  rounds: number;
  /** Rounds completed in this level. */
  round: number;
  phase: SessionPhase;
  mistakesThisRound: number;
  mistakesThisLevel: number;
  pointsThisLevel: number;
  /** Changes every time a fresh round should be generated (used as React key / generator seed). */
  roundKey: number;
};

/**
 * In-round actions carry the roundKey they belong to. Anything tagged with an old round
 * (a late timer, a duplicate report) is ignored, so a round can never be counted twice or skipped.
 */
export type SessionAction =
  | { type: 'correct'; points: number; roundKey: number }
  | { type: 'wrong'; roundKey: number }
  | { type: 'restartRound'; roundKey: number }
  | { type: 'next' }
  | { type: 'replay' };

export function startSession(level: number, roundsPerLevel: (level: number) => number): SessionState {
  return {
    level,
    rounds: Math.max(1, roundsPerLevel(level)),
    round: 0,
    phase: 'playing',
    mistakesThisRound: 0,
    mistakesThisLevel: 0,
    pointsThisLevel: 0,
    roundKey: 1,
  };
}

export function sessionReducer(roundsPerLevel: (level: number) => number) {
  return (s: SessionState, a: SessionAction): SessionState => {
    if ('roundKey' in a && a.roundKey !== s.roundKey) return s;
    switch (a.type) {
      case 'correct': {
        if (s.phase !== 'playing') return s;
        const bonus = s.mistakesThisRound === 0 ? FIRST_TRY_BONUS : 0;
        const round = s.round + 1;
        return {
          ...s,
          round,
          pointsThisLevel: s.pointsThisLevel + Math.max(0, a.points) + bonus,
          mistakesThisRound: 0,
          phase: round >= s.rounds ? 'levelComplete' : 'playing',
          roundKey: s.roundKey + 1,
        };
      }
      case 'wrong':
        if (s.phase !== 'playing') return s;
        return { ...s, mistakesThisRound: s.mistakesThisRound + 1, mistakesThisLevel: s.mistakesThisLevel + 1 };
      case 'restartRound':
        return { ...s, mistakesThisRound: 0, roundKey: s.roundKey + 1 };
      case 'next':
        return { ...startSession(s.level + 1, roundsPerLevel), roundKey: s.roundKey + 1 };
      case 'replay':
        return { ...startSession(s.level, roundsPerLevel), roundKey: s.roundKey + 1 };
    }
  };
}

export const shouldHint = (s: SessionState) => s.mistakesThisRound >= HINT_AFTER;
export const isPerfectLevel = (s: SessionState) => s.phase === 'levelComplete' && s.mistakesThisLevel === 0;
