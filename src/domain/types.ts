export type GameId =
  | 'shapeMatch'
  | 'soundLetter'
  | 'capitalSmall'
  | 'memoryCards'
  | 'wordBuilder'
  | 'mathChallenge'
  | 'sortingNumbers'
  | 'patternCompletion'
  | 'tellingTime'
  | 'countryFlags'
  | 'ticTacToe'
  | 'coloring'
  | 'fruitsVeggies'
  | 'maze'
  | 'numberMemory'
  | 'colorSequence'
  | 'arabicLetters';

export type Difficulty = 'easy' | 'normal' | 'hard';
export type MathOp = '+' | '-' | '×';

export type GameSettings = {
  difficulty: Difficulty;
  /** When true no game uses a countdown. */
  noTimers: boolean;
  math: { min: number; max: number; ops: MathOp[] };
  /** Empty = all letters. */
  focusLetters: string[];
};

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  difficulty: 'normal',
  noTimers: false,
  math: { min: 0, max: 20, ops: ['+', '-'] },
  focusLetters: [],
};

/** A multiple-choice round: the shape every "pick the right answer" game produces. */
export type ChoiceRound<P = unknown, O = unknown> = {
  prompt: P;
  options: O[];
  correctIndex: number;
  /** Optional text spoken when the round starts / when the child taps "listen". */
  speak?: { text: string; lang: 'ar' | 'en' };
};
