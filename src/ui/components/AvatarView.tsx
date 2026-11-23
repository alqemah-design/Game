import Svg, { Circle, Defs, Ellipse, G, Path, Pattern, Rect } from 'react-native-svg';
import type { Avatar } from '@/domain/rewards/avatar';

const INK = '#1F2937';

/** A boy or a girl, drawn as vector layers (back hair → body → head → front hair → face → accessories). */
export function AvatarView({ avatar: a, size = 96 }: { avatar: Avatar; size?: number }) {
  const girl = a.kind === 'girl';
  const hijab = girl && a.hair === 'hijab';
  const thobe = a.outfit === 'thobe';
  const outfitFill = thobe ? '#F8FAFC' : a.pattern === 'plain' ? a.outfitColor : 'url(#pat)';
  const brow = hijab ? INK : a.hairColor;

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <Pattern id="pat" patternUnits="userSpaceOnUse" width="12" height="12">
          <Rect width="12" height="12" fill={a.outfitColor} />
          {a.pattern === 'dots' && <Circle cx="6" cy="6" r="2.5" fill="rgba(255,255,255,0.75)" />}
          {a.pattern === 'stripes' && <Rect width="12" height="4" fill="rgba(255,255,255,0.6)" />}
          {a.pattern === 'stars' && <Path d="M6 1 L7.5 4.6 L11 4.8 L8.3 7.1 L9.2 10.6 L6 8.6 L2.8 10.6 L3.7 7.1 L1 4.8 L4.5 4.6 Z" fill="#FDE047" />}
        </Pattern>
      </Defs>
      <Circle cx="60" cy="60" r="58" fill="#FFFFFF" opacity={0.6} />

      {/* cape behind the shoulders */}
      {a.outfit === 'cape' && <Path d="M16 120 L28 90 Q60 78 92 90 L104 120 Z" fill="#DC2626" />}

      {/* hair that falls behind the head */}
      {girl && a.hair === 'long' && <Path d="M30 52 Q29 20 60 20 Q91 20 90 52 L93 98 Q80 104 72 94 L70 72 L50 72 L48 94 Q40 104 27 98 Z" fill={a.hairColor} />}
      {girl && a.hair === 'bob' && <Path d="M30 54 Q29 21 60 21 Q91 21 90 54 L91 78 Q82 84 75 77 L45 77 Q38 84 29 78 Z" fill={a.hairColor} />}
      {girl && a.hair === 'ponytail' && <Path d="M82 34 Q106 40 100 76 Q97 92 88 86 Q95 64 80 48 Z" fill={a.hairColor} />}
      {girl && a.hair === 'pigtails' && (
        <G fill={a.hairColor}>
          <Ellipse cx="24" cy="64" rx="10" ry="15" />
          <Ellipse cx="96" cy="64" rx="10" ry="15" />
        </G>
      )}

      {/* body */}
      <Path d="M18 120 Q20 92 60 88 Q100 92 102 120 Z" fill={outfitFill} stroke={thobe ? '#CBD5E1' : 'none'} strokeWidth={1.5} />
      {a.outfit === 'tshirt' && <Path d="M50 89 Q60 98 70 89" stroke="rgba(0,0,0,0.2)" strokeWidth="3" fill="none" />}
      {a.outfit === 'dress' && <Path d="M46 90 Q53 101 60 92 Q67 101 74 90 Z" fill="#FFFFFF" />}
      {thobe && (
        <G>
          <Path d="M52 89 L60 96 L68 89" stroke="#CBD5E1" strokeWidth="2.5" fill="none" />
          <Path d="M60 96 L60 120" stroke="#CBD5E1" strokeWidth="2" />
          <Circle cx="60" cy="103" r="1.6" fill="#94A3B8" />
          <Circle cx="60" cy="110" r="1.6" fill="#94A3B8" />
        </G>
      )}
      {a.outfit === 'hoodie' && (
        <G stroke="rgba(0,0,0,0.25)" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <Path d="M36 94 Q60 78 84 94" strokeWidth="6" />
          <Path d="M54 96 L53 108 M66 96 L67 108" />
        </G>
      )}

      {/* head */}
      {hijab ? (
        <G>
          <Path d="M60 16 Q93 16 95 54 Q97 78 86 92 L100 120 L20 120 L34 92 Q23 78 25 54 Q27 16 60 16 Z" fill={a.hairColor} />
          <Path d="M38 42 Q60 32 82 42" stroke="rgba(255,255,255,0.35)" strokeWidth="3" fill="none" />
          <Ellipse cx="60" cy="58" rx="22" ry="24" fill={a.skin} />
        </G>
      ) : (
        <G>
          <Rect x="52" y="72" width="16" height="18" rx="6" fill={a.skin} />
          <Circle cx="33" cy="57" r="6" fill={a.skin} />
          <Circle cx="87" cy="57" r="6" fill={a.skin} />
          <Ellipse cx="60" cy="54" rx="27" ry="29" fill={a.skin} />
        </G>
      )}

      {/* hair in front */}
      {!girl && a.hair === 'short' && <Path d="M33 50 Q31 23 60 22 Q89 23 87 50 Q84 37 72 34 Q60 40 48 34 Q37 37 33 50 Z" fill={a.hairColor} />}
      {!girl && a.hair === 'side' && <Path d="M33 52 Q30 21 62 21 Q90 23 87 50 Q80 33 58 35 Q45 36 39 44 Q35 48 33 52 Z" fill={a.hairColor} />}
      {!girl && a.hair === 'buzz' && <Path d="M34 48 Q34 25 60 25 Q86 25 86 48 Q74 36 60 36 Q46 36 34 48 Z" fill={a.hairColor} opacity={0.6} />}
      {!girl && a.hair === 'spiky' && <Path d="M32 46 L36 24 L44 34 L50 16 L58 30 L66 14 L72 30 L80 18 L84 34 L88 46 Q60 34 32 46 Z" fill={a.hairColor} />}
      {a.hair === 'curly' && (
        <G fill={a.hairColor}>
          {[34, 42, 50, 58, 66, 74, 82].map((x, i) => <Circle key={x} cx={x + 2} cy={i % 2 ? 26 : 31} r="9" />)}
          {girl && <><Circle cx="31" cy="48" r="8" /><Circle cx="89" cy="48" r="8" /><Circle cx="30" cy="63" r="8" /><Circle cx="90" cy="63" r="8" /></>}
        </G>
      )}
      {girl && ['long', 'bob', 'ponytail', 'pigtails'].includes(a.hair) && (
        <Path d="M33 50 Q32 23 60 23 Q88 23 87 50 Q80 35 66 33 Q62 44 50 40 Q40 40 33 50 Z" fill={a.hairColor} />
      )}
      {girl && a.hair === 'ponytail' && <Circle cx="84" cy="38" r="3.5" fill="#F472B6" />}
      {girl && a.hair === 'pigtails' && <G fill="#F472B6"><Circle cx="26" cy="50" r="3.5" /><Circle cx="94" cy="50" r="3.5" /></G>}

      {/* face */}
      <G>
        <Path d="M44 47 Q49 44 54 47 M66 47 Q71 44 76 47" stroke={brow} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Circle cx="49" cy="56" r="4.5" fill={INK} />
        <Circle cx="71" cy="56" r="4.5" fill={INK} />
        <Circle cx="50.5" cy="54.5" r="1.5" fill="#FFF" />
        <Circle cx="72.5" cy="54.5" r="1.5" fill="#FFF" />
        {girl && <Path d="M44.5 54 L41.5 52 M75.5 54 L78.5 52" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />}
        <Circle cx="42" cy="65" r="5" fill="#F9A8D4" opacity={0.6} />
        <Circle cx="78" cy="65" r="5" fill="#F9A8D4" opacity={0.6} />
        <Path d="M51 68 Q60 76 69 68" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      </G>

      {/* accessories */}
      {a.accessory === 'glasses' && (
        <G stroke={INK} strokeWidth="2.5" fill="none">
          <Circle cx="49" cy="56" r="8.5" />
          <Circle cx="71" cy="56" r="8.5" />
          <Path d="M57.5 56 L62.5 56" />
        </G>
      )}
      {a.accessory === 'cap' && (
        <G>
          <Path d="M32 42 Q33 17 60 17 Q87 17 88 42 Z" fill={a.outfitColor} />
          <Path d="M32 42 Q60 35 100 43 Q94 48 60 46 Q44 46 32 42 Z" fill={a.outfitColor} stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" />
          <Circle cx="60" cy="18" r="3" fill="rgba(0,0,0,0.25)" />
        </G>
      )}
      {a.accessory === 'bow' && (
        <G fill="#F43F5E">
          <Path d="M78 26 L66 18 L67 34 Z" />
          <Path d="M78 26 L90 18 L89 34 Z" />
          <Circle cx="78" cy="26" r="4" />
        </G>
      )}
      {a.accessory === 'crown' && <Path d="M40 24 L44 8 L52 18 L60 4 L68 18 L76 8 L80 24 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />}
      {a.accessory === 'headphones' && (
        <G>
          <Path d="M29 56 Q29 16 60 16 Q91 16 91 56" stroke={INK} strokeWidth="5" fill="none" />
          <Rect x="22" y="46" width="12" height="20" rx="5" fill="#EF4444" />
          <Rect x="86" y="46" width="12" height="20" rx="5" fill="#EF4444" />
        </G>
      )}
    </Svg>
  );
}
