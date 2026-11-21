import Svg, { Circle, Ellipse, Path, Polygon, Rect } from 'react-native-svg';
import type { ShapeKind } from '@/domain/content/shapes';

/** Vector shapes (crisp at any size, no image assets). `outline` draws a dashed slot. */
export function ShapeIcon({ shape, color, size = 64, outline = false }: { shape: ShapeKind; color: string; size?: number; outline?: boolean }) {
  const p = outline
    ? { fill: 'transparent', stroke: color, strokeWidth: 5, strokeDasharray: '8 6' }
    : { fill: color, stroke: 'rgba(0,0,0,0.15)', strokeWidth: 3 };
  const el = (() => {
    switch (shape) {
      case 'circle': return <Circle cx={50} cy={50} r={42} {...p} />;
      case 'square': return <Rect x={10} y={10} width={80} height={80} rx={10} {...p} />;
      case 'triangle': return <Polygon points="50,8 93,88 7,88" strokeLinejoin="round" {...p} />;
      case 'star': return <Polygon points="50,6 62,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 38,38" strokeLinejoin="round" {...p} />;
      case 'heart': return <Path d="M50 88 C20 66 6 48 10 30 C14 12 38 8 50 26 C62 8 86 12 90 30 C94 48 80 66 50 88 Z" {...p} />;
      case 'diamond': return <Polygon points="50,5 92,50 50,95 8,50" strokeLinejoin="round" {...p} />;
      case 'hexagon': return <Polygon points="28,10 72,10 94,50 72,90 28,90 6,50" strokeLinejoin="round" {...p} />;
      case 'oval': return <Ellipse cx={50} cy={50} rx={44} ry={30} {...p} />;
    }
  })();
  return <Svg width={size} height={size} viewBox="0 0 100 100">{el}</Svg>;
}
