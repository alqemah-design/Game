import type { ReactNode } from 'react';
import type { GameId } from '@/domain/types';
import type { GameApi } from '../components/GameShell';
import * as C from './choice';
import * as B1 from './board1';
import * as B2 from './board2';
import { ArabicLettersScreen } from './ArabicLetters';

type Render = (api: GameApi) => ReactNode;

/**
 * GameId → board. Adding a game = a generator in src/domain/games, an entry in the catalog, and one line here.
 * Board games are keyed by roundKey so their local state resets every round.
 */
export const GAME_BOARDS: Partial<Record<GameId, Render>> = {
  soundLetter: (api) => <C.SoundLetterGame api={api} />,
  fruitsVeggies: (api) => <C.FruitsGame api={api} />,
  countryFlags: (api) => <C.FlagsGame api={api} />,
  tellingTime: (api) => <C.TimeGame api={api} />,
  mathChallenge: (api) => <C.MathGame api={api} />,
  patternCompletion: (api) => <C.PatternGame api={api} />,
  arabicLetters: (api) => <ArabicLettersScreen api={api} />,
  shapeMatch: (api) => <B1.ShapeMatchGame key={api.roundKey} api={api} />,
  capitalSmall: (api) => <B1.CapitalSmallGame key={api.roundKey} api={api} />,
  memoryCards: (api) => <B1.MemoryGame key={api.roundKey} api={api} />,
  wordBuilder: (api) => <B1.WordBuilderGame key={api.roundKey} api={api} />,
  sortingNumbers: (api) => <B1.SortingGame key={api.roundKey} api={api} />,
  ticTacToe: (api) => <B2.TicTacToeGame key={api.roundKey} api={api} />,
  maze: (api) => <B2.MazeGame key={api.roundKey} api={api} />,
  numberMemory: (api) => <B2.NumberMemoryGame key={api.roundKey} api={api} />,
  colorSequence: (api) => <B2.ColorSequenceGame key={api.roundKey} api={api} />,
};
