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
  /** Spoken by the owl the first time the child opens the game. */
  howTo: string;
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
  { id: 'shapeMatch', howTo: 'اختر شكلًا، ثم المس مكانه المرسوم بخط منقط.', legacyKey: 'game1', title: 'مطابقة الأشكال', subtitle: 'ضع كل شكل في مكانه', emoji: '🔷', color: '#60A5FA', ages: '3-5', skill: 'logic', roundsPerLevel: () => 3, pointsPerRound: (l) => 2 + Math.floor(l / 3), contentDir: 'rtl' },
  { id: 'fruitsVeggies', howTo: 'انظر إلى الصورة، واختر اسمها الصحيح.', legacyKey: 'game14', title: 'الفواكه والخضروات', subtitle: 'ما اسم هذه؟', emoji: '🍎', color: '#F87171', ages: '3-5', skill: 'language', roundsPerLevel: produceRounds, pointsPerRound: two, contentDir: 'rtl' },
  { id: 'memoryCards', howTo: 'اقلب بطاقتين. إذا تشابهتا تبقيان مكشوفتين. تذكّر أماكن الصور!', legacyKey: 'game4', title: 'لعبة الذاكرة', subtitle: 'اقلب وطابق', emoji: '🃏', color: '#A78BFA', ages: '3-5', skill: 'memory', roundsPerLevel: () => 1, pointsPerRound: (l) => 6 + l * 2, contentDir: 'rtl' },
  { id: 'arabicLetters', howTo: 'استمع إلى اسم الحرف، ثم المس الحرف الذي سمعته.', legacyKey: 'game19', title: 'الحروف العربية', subtitle: 'استمع واختر', emoji: 'أ', color: '#34D399', ages: '3-5', skill: 'language', roundsPerLevel: five, pointsPerRound: two, contentDir: 'rtl' },
  { id: 'recycling', howTo: 'اسحب الشيء بإصبعك وضعه في الحاوية الصحيحة.', legacyKey: 'game23', title: 'فرز النفايات', subtitle: 'كل شيء في حاويته', emoji: '♻️', color: '#16A34A', ages: '3-5', skill: 'knowledge', roundsPerLevel: () => 6, pointsPerRound: two, contentDir: 'rtl' },
  { id: 'coloring', howTo: 'اختر لونًا ثم المس جزءًا من الرسمة لتلوّنه.', legacyKey: 'game13', title: 'التلوين الإبداعي', subtitle: 'لوّن وارسم', emoji: '🎨', color: '#F472B6', ages: '3-5', skill: 'creativity', roundsPerLevel: () => 1, pointsPerRound: () => 5, contentDir: 'rtl' },
  { id: 'soundLetter', howTo: 'استمع إلى الحرف الإنجليزي، ثم اختره.', legacyKey: 'game2', title: 'تعلم الحروف', subtitle: 'اسمع الحرف واختره', emoji: '🔤', color: '#FBBF24', ages: '5-7', skill: 'language', roundsPerLevel: five, pointsPerRound: two, contentDir: 'ltr' },
  { id: 'capitalSmall', howTo: 'المس الحرف الكبير، ثم المس الحرف الصغير الذي يشبهه.', legacyKey: 'game3', title: 'Capital ↔ small', subtitle: 'طابق الكبير بالصغير', emoji: 'Aa', color: '#FB923C', ages: '5-7', skill: 'language', roundsPerLevel: () => 3, pointsPerRound: (l) => 3 + Math.floor(l / 2), contentDir: 'ltr' },
  { id: 'sortingNumbers', howTo: 'المس الأرقام بالترتيب، من الأصغر إلى الأكبر.', legacyKey: 'game7', title: 'ترتيب الأرقام', subtitle: 'من الأصغر للأكبر', emoji: '🔢', color: '#38BDF8', ages: '5-7', skill: 'math', roundsPerLevel: five, pointsPerRound: two, contentDir: 'ltr' },
  { id: 'patternCompletion', howTo: 'انظر إلى النمط وهو يتكرر، واختر ما يأتي مكان علامة السؤال.', legacyKey: 'game8', title: 'إكمال الأنماط', subtitle: 'ما الذي يأتي هنا؟', emoji: '🔺', color: '#C084FC', ages: '5-7', skill: 'logic', roundsPerLevel: five, pointsPerRound: two, contentDir: 'ltr' },
  { id: 'wordBuilder', howTo: 'انظر إلى الصورة، ورتّب الحروف لتكتب اسمها.', legacyKey: 'game5', title: 'تكوين الكلمات', subtitle: 'رتّب الحروف', emoji: '🧩', color: '#4ADE80', ages: '5-7', skill: 'language', roundsPerLevel: five, pointsPerRound: (l) => 2 + Math.floor(l / 3), contentDir: 'ltr' },
  { id: 'whatChanged', howTo: 'انظر إلى الغرفة جيدًا. ستُطفأ الأنوار، ثم اكتشف ما الذي تغيّر.', legacyKey: 'game21', title: 'ما الذي تغيّر؟', subtitle: 'انظر جيدًا وتذكّر', emoji: '🔍', color: '#0EA5E9', ages: '5-7', skill: 'memory', roundsPerLevel: five, pointsPerRound: (l) => 3 + Math.floor(l / 2), contentDir: 'rtl' },
  { id: 'mirror', howTo: 'لوّن المربعات في النصف الآخر لتصبح الرسمة مثل المرآة.', legacyKey: 'game22', title: 'المرآة', subtitle: 'أكمل النصف الآخر', emoji: '🦋', color: '#D946EF', ages: '5-7', skill: 'logic', roundsPerLevel: () => 3, pointsPerRound: (l) => 4 + Math.floor(l / 2), contentDir: 'ltr' },
  { id: 'tellingTime', howTo: 'العقرب القصير للساعات والطويل للدقائق. كم الساعة؟', legacyKey: 'game9', title: 'تعلم الساعة', subtitle: 'كم الساعة الآن؟', emoji: '🕐', color: '#F59E0B', ages: '5-7', skill: 'math', roundsPerLevel: five, pointsPerRound: two, contentDir: 'ltr' },
  { id: 'mathChallenge', howTo: 'احسب الجواب واختره. كلما أسرعت ربحت نقاطًا أكثر.', legacyKey: 'game6', title: 'تحدي الرياضيات', subtitle: 'جمع وطرح', emoji: '➕', color: '#EF4444', ages: '7-9', skill: 'math', roundsPerLevel: five, pointsPerRound: (l) => 2 + Math.floor(l / 4), contentDir: 'ltr' },
  { id: 'market', howTo: 'المس النقود لتدفع السعر بالضبط، لا أكثر ولا أقل.', legacyKey: 'game20', title: 'السوق الصغير', subtitle: 'ادفع الثمن بالضبط', emoji: '🛒', color: '#F97316', ages: '7-9', skill: 'math', roundsPerLevel: five, pointsPerRound: (l) => 3 + Math.floor(l / 3), contentDir: 'rtl' },
  { id: 'countryFlags', howTo: 'انظر إلى العلم، واختر اسم الدولة.', legacyKey: 'game11', title: 'أعلام الدول', subtitle: 'لمن هذا العلم؟', emoji: '🌍', color: '#22D3EE', ages: '7-9', skill: 'knowledge', roundsPerLevel: five, pointsPerRound: two, contentDir: 'rtl' },
  { id: 'ticTacToe', howTo: 'أنت إكس. ضع ثلاث علامات في خط واحد قبل الروبوت.', legacyKey: 'game12', title: 'X O', subtitle: 'تغلّب على الروبوت', emoji: '❌', color: '#818CF8', ages: '7-9', skill: 'logic', roundsPerLevel: () => 3, pointsPerRound: () => 5, contentDir: 'ltr' },
  { id: 'maze', howTo: 'حرّك النحلة بالأسهم أو بسحب إصبعك حتى تصل إلى الزهرة.', legacyKey: 'game15', title: 'المتاهة', subtitle: 'أوصل النحلة للزهرة', emoji: '🌀', color: '#2DD4BF', ages: '7-9', skill: 'logic', roundsPerLevel: () => 2, pointsPerRound: (l) => 5 + l, contentDir: 'ltr' },
  { id: 'numberMemory', howTo: 'احفظ الأرقام قبل أن تختفي، ثم اكتبها بنفس الترتيب.', legacyKey: 'game16', title: 'التركيز', subtitle: 'احفظ الأرقام', emoji: '🧠', color: '#F43F5E', ages: '7-9', skill: 'memory', roundsPerLevel: five, pointsPerRound: (l) => 20 + l * 4, contentDir: 'ltr' },
  { id: 'colorSequence', howTo: 'راقب الألوان وهي تضيء، ثم المسها بنفس الترتيب.', legacyKey: 'game17', title: 'تذكر الألوان', subtitle: 'كرر التسلسل', emoji: '🌈', color: '#EAB308', ages: '7-9', skill: 'memory', roundsPerLevel: five, pointsPerRound: (l) => 20 + l * 5, contentDir: 'ltr' },
];

export const GAME_BY_ID = Object.fromEntries(GAMES.map((g) => [g.id, g])) as Record<GameId, GameMeta>;

export const SKILL_AR: Record<Skill, string> = {
  language: 'اللغة', math: 'الرياضيات', memory: 'الذاكرة', logic: 'التفكير', creativity: 'الإبداع', knowledge: 'المعرفة',
};
