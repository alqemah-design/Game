import Svg, { Circle, Defs, G, Path, Pattern, Rect, Ellipse } from 'react-native-svg';
import type { Avatar } from '@/domain/rewards/avatar';

/** Vector avatar assembled from parts; everything is SVG so it stays sharp at any size. */
export function AvatarView({ avatar: a, size = 96 }: { avatar: Avatar; size?: number }) {
  const outfitFill = a.pattern === 'plain' ? a.outfitColor : 'url(#pat)';
  const bodyR = a.body === 'tall' ? { rx: 26, ry: 34 } : { rx: 32, ry: 30 };
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <Pattern id="pat" patternUnits="userSpaceOnUse" width="12" height="12">
          <Rect width="12" height="12" fill={a.outfitColor} />
          {a.pattern === 'dots' && <Circle cx="6" cy="6" r="2.5" fill="rgba(255,255,255,0.7)" />}
          {a.pattern === 'stripes' && <Rect y="0" width="12" height="4" fill="rgba(255,255,255,0.6)" />}
          {a.pattern === 'stars' && <Path d="M6 1 L7.5 4.6 L11 4.8 L8.3 7.1 L9.2 10.6 L6 8.6 L2.8 10.6 L3.7 7.1 L1 4.8 L4.5 4.6 Z" fill="#FDE047" />}
        </Pattern>
      </Defs>
      <Circle cx="60" cy="60" r="58" fill="#FFFFFF" opacity={0.6} />
      {/* outfit / body */}
      {a.outfit === 'cape' && <Path d="M28 80 Q60 60 92 80 L100 118 L20 118 Z" fill="#DC2626" />}
      {a.outfit === 'dress'
        ? <Path d="M42 74 L78 74 L94 118 L26 118 Z" fill={outfitFill} />
        : <Ellipse cx="60" cy="104" rx={bodyR.rx + 4} ry={bodyR.ry - 4} fill={outfitFill} />}
      {a.outfit === 'hoodie' && <Path d="M36 80 Q60 66 84 80" stroke="rgba(0,0,0,0.25)" strokeWidth="5" fill="none" />}
      {/* head */}
      {a.body === 'bear' && (<G><Circle cx="34" cy="28" r="11" fill={a.skin} /><Circle cx="86" cy="28" r="11" fill={a.skin} /></G>)}
      {a.body === 'robot'
        ? <Rect x="30" y="20" width="60" height="58" rx="12" fill="#CBD5E1" stroke="#64748B" strokeWidth="3" />
        : <Ellipse cx="60" cy="50" rx={a.body === 'tall' ? 28 : 31} ry={a.body === 'tall' ? 32 : 29} fill={a.skin} />}
      {a.body === 'robot' && <Rect x="57" y="8" width="6" height="12" fill="#64748B" />}
      {/* hair */}
      {a.hair === 'short' && <Path d="M30 44 Q32 18 60 18 Q88 18 90 44 Q76 30 60 32 Q44 30 30 44 Z" fill={a.hairColor} />}
      {a.hair === 'curly' && <G fill={a.hairColor}>{[34, 44, 54, 66, 76, 86].map((x, i) => <Circle key={i} cx={x} cy={i % 2 ? 22 : 28} r="10" />)}</G>}
      {a.hair === 'long' && <Path d="M28 50 Q28 16 60 16 Q92 16 92 50 L94 84 L82 84 L84 46 Q60 30 36 46 L38 84 L26 84 Z" fill={a.hairColor} />}
      {a.hair === 'spiky' && <Path d="M30 40 L36 16 L46 30 L54 10 L62 28 L72 10 L78 30 L88 16 L90 40 Q60 28 30 40 Z" fill={a.hairColor} />}
      {/* face */}
      <Circle cx="49" cy="52" r="4.5" fill="#1F2937" />
      <Circle cx="71" cy="52" r="4.5" fill="#1F2937" />
      <Circle cx="50.5" cy="50.5" r="1.5" fill="#FFF" />
      <Circle cx="72.5" cy="50.5" r="1.5" fill="#FFF" />
      <Circle cx="42" cy="62" r="5" fill="#F9A8D4" opacity={0.6} />
      <Circle cx="78" cy="62" r="5" fill="#F9A8D4" opacity={0.6} />
      <Path d="M50 64 Q60 73 70 64" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* accessories */}
      {a.accessory === 'glasses' && <G stroke="#1F2937" strokeWidth="2.5" fill="none"><Circle cx="49" cy="52" r="9" /><Circle cx="71" cy="52" r="9" /><Path d="M58 52 L62 52" /></G>}
      {a.accessory === 'crown' && <Path d="M38 22 L44 6 L52 18 L60 2 L68 18 L76 6 L82 22 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />}
      {a.accessory === 'headphones' && <G><Path d="M28 50 Q28 14 60 14 Q92 14 92 50" stroke="#1F2937" strokeWidth="5" fill="none" /><Rect x="22" y="44" width="12" height="20" rx="5" fill="#EF4444" /><Rect x="86" y="44" width="12" height="20" rx="5" fill="#EF4444" /></G>}
    </Svg>
  );
}
