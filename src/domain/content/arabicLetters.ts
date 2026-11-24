export type ArabicLetter = {
  id: string; // stable latin id, also the audio file name: assets/audio/ar/letters/<id>.mp3
  char: string;
  name: string; // spoken name of the letter
  word: string; // a word starting with the letter
  emoji: string;
};

export const ARABIC_LETTERS: readonly ArabicLetter[] = [
  { id: 'alif', char: 'ا', name: 'ألِف', word: 'أرنب', emoji: '🐰' },
  { id: 'ba', char: 'ب', name: 'باء', word: 'بطة', emoji: '🦆' },
  { id: 'ta', char: 'ت', name: 'تاء', word: 'تفاحة', emoji: '🍎' },
  { id: 'tha', char: 'ث', name: 'ثاء', word: 'ثعلب', emoji: '🦊' },
  { id: 'jim', char: 'ج', name: 'جيم', word: 'جمل', emoji: '🐫' },
  { id: 'ha', char: 'ح', name: 'حاء', word: 'حصان', emoji: '🐴' },
  { id: 'kha', char: 'خ', name: 'خاء', word: 'خروف', emoji: '🐑' },
  { id: 'dal', char: 'د', name: 'دال', word: 'دب', emoji: '🐻' },
  { id: 'dhal', char: 'ذ', name: 'ذال', word: 'ذرة', emoji: '🌽' },
  { id: 'ra', char: 'ر', name: 'راء', word: 'ريشة', emoji: '🪶' },
  { id: 'zay', char: 'ز', name: 'زاي', word: 'زرافة', emoji: '🦒' },
  { id: 'sin', char: 'س', name: 'سين', word: 'سمكة', emoji: '🐟' },
  { id: 'shin', char: 'ش', name: 'شين', word: 'شمس', emoji: '☀️' },
  { id: 'sad', char: 'ص', name: 'صاد', word: 'صقر', emoji: '🦅' },
  { id: 'dad', char: 'ض', name: 'ضاد', word: 'ضفدع', emoji: '🐸' },
  { id: 'taa', char: 'ط', name: 'طاء', word: 'طائرة', emoji: '✈️' },
  { id: 'zaa', char: 'ظ', name: 'ظاء', word: 'ظرف', emoji: '✉️' },
  { id: 'ayn', char: 'ع', name: 'عين', word: 'عنب', emoji: '🍇' },
  { id: 'ghayn', char: 'غ', name: 'غين', word: 'غيمة', emoji: '☁️' },
  { id: 'fa', char: 'ف', name: 'فاء', word: 'فيل', emoji: '🐘' },
  { id: 'qaf', char: 'ق', name: 'قاف', word: 'قطة', emoji: '🐱' },
  { id: 'kaf', char: 'ك', name: 'كاف', word: 'كلب', emoji: '🐶' },
  { id: 'lam', char: 'ل', name: 'لام', word: 'ليمون', emoji: '🍋' },
  { id: 'mim', char: 'م', name: 'ميم', word: 'موز', emoji: '🍌' },
  { id: 'nun', char: 'ن', name: 'نون', word: 'نحلة', emoji: '🐝' },
  { id: 'haa', char: 'ه', name: 'هاء', word: 'هلال', emoji: '🌙' },
  { id: 'waw', char: 'و', name: 'واو', word: 'وردة', emoji: '🌹' },
  { id: 'ya', char: 'ي', name: 'ياء', word: 'يد', emoji: '✋' },
];

/**
 * Teaching order: letters with clearly different shapes first, "sibling" letters that differ only by
 * dots later, so a beginner is never asked to tell ج from ح from خ on day one.
 */
export const TEACHING_ORDER: readonly string[] = [
  'alif', 'ba', 'jim', 'dal', 'ra', 'sin', 'mim', // stage 1: all distinct shapes
  'sad', 'taa', 'ayn', 'fa', 'kaf', 'lam', 'waw', // stage 2: still distinct
  'nun', 'haa', 'ya', 'ta', 'ha', 'zay', 'shin', // stage 3: first dot-siblings
  'tha', 'kha', 'dhal', 'dad', 'zaa', 'ghayn', 'qaf', // stage 4: the rest
];

/** Letters sharing a base shape and differing only by dots. */
export const LETTER_FAMILIES: readonly (readonly string[])[] = [
  ['ba', 'ta', 'tha', 'nun', 'ya'], ['jim', 'ha', 'kha'], ['dal', 'dhal'], ['ra', 'zay'], ['sin', 'shin'],
  ['sad', 'dad'], ['taa', 'zaa'], ['ayn', 'ghayn'], ['fa', 'qaf'],
];
export const familyOf = (id: string) => LETTER_FAMILIES.find((f) => f.includes(id)) ?? [id];
