export type ShapeKind = 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'diamond' | 'hexagon' | 'oval';
export type ColorName = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'pink' | 'teal';

export const SHAPES: readonly ShapeKind[] = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond', 'hexagon', 'oval'];

export const COLORS: Record<ColorName, { hex: string }> = {
  red: { hex: '#EF4444' },
  blue: { hex: '#3B82F6' },
  green: { hex: '#22C55E' },
  yellow: { hex: '#FACC15' },
  purple: { hex: '#A855F7' },
  orange: { hex: '#F97316' },
  pink: { hex: '#EC4899' },
  teal: { hex: '#14B8A6' },
};

export const COLOR_NAMES = Object.keys(COLORS) as ColorName[];
