import Svg, { Circle, Defs, Ellipse, Path, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { ShapeKind } from '@/domain/content/shapes';

/** Mix a #RRGGBB colour towards white (amt > 0) or black (amt < 0). */
function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.round(amt > 0 ? v + (255 - v) * amt : v * (1 + amt));
  const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function geometry(shape: ShapeKind, p: object) {
  switch (shape) {
    case 'circle': return <Circle cx={50} cy={50} r={42} {...p} />;
    case 'square': return <Rect x={10} y={10} width={80} height={80} rx={12} {...p} />;
    case 'triangle': return <Polygon points="50,8 93,88 7,88" strokeLinejoin="round" {...p} />;
    case 'star': return <Polygon points="50,6 62,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 38,38" strokeLinejoin="round" {...p} />;
    case 'heart': return <Path d="M50 88 C20 66 6 48 10 30 C14 12 38 8 50 26 C62 8 86 12 90 30 C94 48 80 66 50 88 Z" {...p} />;
    case 'diamond': return <Polygon points="50,5 92,50 50,95 8,50" strokeLinejoin="round" {...p} />;
    case 'hexagon': return <Polygon points="28,10 72,10 94,50 72,90 28,90 6,50" strokeLinejoin="round" {...p} />;
    case 'oval': return <Ellipse cx={50} cy={50} rx={44} ry={30} {...p} />;
  }
}

/**
 * Vector shapes that look like glossy plastic toy pieces (light from the top-left, a shine and a
 * darker rim). `outline` draws the dashed slot a piece fits into.
 */
export function ShapeIcon({ shape, color, size = 64, outline = false }: { shape: ShapeKind; color: string; size?: number; outline?: boolean }) {
  if (outline) {
    return <Svg width={size} height={size} viewBox="0 0 100 100">{geometry(shape, { fill: 'rgba(0,0,0,0.04)', stroke: color, strokeWidth: 5, strokeDasharray: '8 6' })}</Svg>;
  }
  const id = `gloss-${color.replace('#', '')}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={id} cx="0.35" cy="0.3" r="0.75">
          <Stop offset="0" stopColor={shade(color, 0.45)} />
          <Stop offset="0.55" stopColor={color} />
          <Stop offset="1" stopColor={shade(color, -0.3)} />
        </RadialGradient>
      </Defs>
      {geometry(shape, { fill: `url(#${id})`, stroke: shade(color, -0.35), strokeWidth: 3 })}
      <Ellipse cx={36} cy={30} rx={13} ry={7} fill="#FFFFFF" opacity={0.45} transform="rotate(-25 36 30)" />
    </Svg>
  );
}
