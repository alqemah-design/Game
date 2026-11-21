import type { GameId } from '../types';
import { produceRounds } from './choiceGames';

export type AgeBand = '3-5' | '5-7' | '7-9';
export type Skill = 'language' | 'math' | 'memory' | 'logic' | 'creativity' | 'knowledge';

export type GameMeta = {
  id: GameId;
  /** Field name in the old Base44 app, used only by the legacy-import migration. */
  legacyKey: `game${number}`;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  ages: AgeBand;
  skill: Skill;
  roundsPerLevel: (level: number) => number;
  /** Points per correct round (a first-try bonus is added by the engine). */
  pointsPerRound: (level: number) => number;
  /** Text direction of the board content (English / numbers are LTR). */
  contentDir: 'rtl' | 'ltr';
};

const five = () => 5;
const two = () => 2;

export const GAMES: readonly GameMeta[] = [
  { id: 'shapeMatch', legacyKey: 'game1', title: 'مطابقة الأشكال', subtitle: 'ضع كل شكل في مكانه', emoji: '🔷', color: '#60A5FA', ages: '3-5', skill: 'logic', roundsPerLevel: () => 3, pointsPerRound: (l) => 2 + Math.floor(l / 3), contentDir: 'rtl' },
  { id: 'fruitsVeggies', legacyKey: 'game14', title: 'الفواكه والخضروات', subtitle: 'ما اسم هذه؟', emoji: '🍎', color: '#F87171', ages: '3-5', skill: 'language', roundsPerLevel: produceRounds, pointsPerRound: two, contentDir: 'rtl' },
  { id: 'memoryCards', legacyKey: 'game4', title: 'لعبة الذاكرة', subtitle: 'اقلب وطابق', emoji: '🃏', color: '#A78BFA', ages: '3-5', skill: 'memory', roundsPerLevel: () => 1, pointsPerRound: (l) => 6 + l * 2, contentDir: 'rtl' },
  { id: 'arabicLetters', legacyKey: 'game19', title: 'الحروف العربية', subtitle: 'استمع واختر', emoji: 'أ', color: '#34D399', ages: '3-5', skill: 'language', roundsPerLevel: five, pointsPerRound: two, contentDir: 'rtl' },
  { id: 'coloring', legacyKey: 'game13', title: 'التلوين الإبداعي', subtitle: 'لوّن وارسم', emoji: '🎨', color: '#F472B6', ages: '3-5', skill: 'creativity', roundsPerLevel: () => 1, pointsPerRound: () => 5, contentDir: 'rtl' },
  { id: 'soundLetter', legacyKey: 'game2', title: 'تعلم الحروف', subtitle: 'اسمع الحرف واختره', emoji: '🔤', color: '#FBBF24', ages: '5-7', skill: 'language', roundsPerLevel: five, pointsPerRound: two, contentDir: 'ltr' },
  { id: 'capitalSmall', legacyKey: 'game3', title: 'Capital ↔ small', subtitle: 'طابق الكبير بالصغير', emoji: 'Aa', color: '#FB923C', ages: '5-7', skill: 'language', roundsPerLevel: () => 3, pointsPerRound: (l) => 3 + Math.floor(l / 2), contentDir: 'ltr' },
  { id: 'sortingNumbers', legacyKey: 'game7', title: 'ترتيب الأرقام', subtitle: 'من الأصغر للأكبر', emoji: '🔢', color: '#38BDF8', ages: '5-7', skill: 'math', roundsPerLevel: five, pointsPerRound: two, contentDir: 'ltr' },
  { id: 'patternCompletion', legacyKey: 'game8', title: 'إكمال الأنماط', subtitle: 'ما الذي يأتي هنا؟', emoji: '🔺', color: '#C084FC', ages: '5-7', skill: 'logic', roundsPerLevel: five, pointsPerRound: two, contentDir: 'ltr' },
  { id: 'wordBuilder', legacyKey: 'game5', title: 'تكوين الكلمات', subtitle: 'رتّب الحروف', emoji: '🧩', color: '#4ADE80', ages: '5-7', skill: 'language', roundsPerLevel: five, pointsPerRound: (l) => 2 + Math.floor(l / 3), contentDir: 'ltr' },
  { id: 'tellingTime', legacyKey: 'game9', title: 'تعلم الساعة', subtitle: 'كم الساعة الآن؟', emoji: '🕐', color: '#F59E0B', ages: '5-7', skill: 'math', roundsPerLevel: five, pointsPerRound: two, contentDir: 'ltr' },
  { id: 'mathChallenge', legacyKey: 'game6', title: 'تحدي الرياضيات', subtitle: 'جمع وطرح', emoji: '➕', color: '#EF4444', ages: '7-9', skill: 'math', roundsPerLevel: five, pointsPerRound: (l) => 2 + Math.floor(l / 4), contentDir: 'ltr' },
  { id: 'countryFlags', legacyKey: 'game11', title: 'أعلام الدول', subtitle: 'لمن هذا العلم؟', emoji: '🌍', color: '#22D3EE', ages: '7-9', skill: 'knowledge', roundsPerLevel: five, pointsPerRound: two, contentDir: 'rtl' },
  { id: 'ticTacToe', legacyKey: 'game12', title: 'X O', subtitle: 'تغلّب على الروبوت', emoji: '❌', color: '#818CF8', ages: '7-9', skill: 'logic', roundsPerLevel: () => 3, pointsPerRound: () => 5, contentDir: 'ltr' },
  { id: 'maze', legacyKey: 'game15', title: 'المتاهة', subtitle: 'أوصل النحلة للزهرة', emoji: '🌀', color: '#2DD4BF', ages: '7-9', skill: 'logic', roundsPerLevel: () => 2, pointsPerRound: (l) => 5 + l, contentDir: 'ltr' },
  { id: 'numberMemory', legacyKey: 'game16', title: 'التركيز', subtitle: 'احفظ الأرقام', emoji: '🧠', color: '#F43F5E', ages: '7-9', skill: 'memory', roundsPerLevel: five, pointsPerRound: (l) => 20 + l * 4, contentDir: 'ltr' },
  { id: 'colorSequence', legacyKey: 'game17', title: 'تذكر الألوان', subtitle: 'كرر التسلسل', emoji: '🌈', color: '#EAB308', ages: '7-9', skill: 'memory', roundsPerLevel: five, pointsPerRound: (l) => 20 + l * 5, contentDir: 'ltr' },
];

export const GAME_BY_ID = Object.fromEntries(GAMES.map((g) => [g.id, g])) as Record<GameId, GameMeta>;

export const SKILL_AR: Record<Skill, string> = {
  language: 'اللغة', math: 'الرياضيات', memory: 'الذاكرة', logic: 'التفكير', creativity: 'الإبداع', knowledge: 'المعرفة',
};
