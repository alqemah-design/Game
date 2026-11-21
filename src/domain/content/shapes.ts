export type ShapeKind = 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'diamond' | 'hexagon' | 'oval';
export type ColorName = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'pink' | 'teal';

export const SHAPES: readonly ShapeKind[] = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond', 'hexagon', 'oval'];

export const SHAPE_AR: Record<ShapeKind, string> = {
  circle: 'دائرة', square: 'مربع', triangle: 'مثلث', star: 'نجمة',
  heart: 'قلب', diamond: 'معيّن', hexagon: 'سداسي', oval: 'بيضاوي',
};

export const COLORS: Record<ColorName, { hex: string; ar: string }> = {
  red: { hex: '#EF4444', ar: 'أحمر' },
  blue: { hex: '#3B82F6', ar: 'أزرق' },
  green: { hex: '#22C55E', ar: 'أخضر' },
  yellow: { hex: '#FACC15', ar: 'أصفر' },
  purple: { hex: '#A855F7', ar: 'بنفسجي' },
  orange: { hex: '#F97316', ar: 'برتقالي' },
  pink: { hex: '#EC4899', ar: 'وردي' },
  teal: { hex: '#14B8A6', ar: 'فيروزي' },
};

export const COLOR_NAMES = Object.keys(COLORS) as ColorName[];
