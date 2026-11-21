import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { PAGE_BY_ID } from '@/domain/content/coloringPages';
import type { Artwork } from '@/domain/progress';

/** Re-renders a saved artwork from its vector data (tiny on disk compared with Base64 PNGs). */
export function ArtThumb({ art, size }: { art: Artwork; size: number }) {
  const page = PAGE_BY_ID[art.pageId];
  if (!page) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 300 300">
      {page.regions.map((r) => <Path key={r.id} d={r.d} fill={art.fills[r.id] ?? '#FFFFFF'} stroke="#1F2937" strokeWidth={3} />)}
      {art.strokes.map((s, i) => <Path key={i} d={s.d} stroke={s.color} strokeWidth={s.width} strokeLinecap="round" strokeLinejoin="round" fill="none" />)}
      {art.stickers.map((s, i) => <SvgText key={i} x={s.x} y={s.y + 12} fontSize={34} textAnchor="middle">{s.emoji}</SvgText>)}
    </Svg>
  );
}
