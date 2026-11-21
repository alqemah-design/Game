import { Redirect, useLocalSearchParams } from 'expo-router';
import { GAME_BY_ID } from '@/domain/games/catalog';
import type { GameId } from '@/domain/types';
import { GameShell } from '@/ui/components/GameShell';
import { GAME_BOARDS } from '@/ui/games/registry';

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: GameId }>();
  if (id === 'coloring') return <Redirect href="/art" />;
  const board = GAME_BOARDS[id];
  if (!GAME_BY_ID[id] || !board) return <Redirect href="/" />;
  return <GameShell key={id} gameId={id}>{board}</GameShell>;
}
