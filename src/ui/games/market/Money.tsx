import { View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';

const METAL = {
  gold: ['#FEF3C7', '#F59E0B', '#92400E'],
  silver: ['#FFFFFF', '#CBD5E1', '#475569'],
} as const;

const NOTE = {
  10: ['#BBF7D0', '#16A34A', '#14532D'],
  20: ['#BAE6FD', '#0284C7', '#0C4A6E'],
  50: ['#E9D5FF', '#9333EA', '#581C87'],
  100: ['#FECACA', '#DC2626', '#7F1D1D'],
} as const;

function Coin({ value, size }: { value: number; size: number }) {
  const [hi, mid, lo] = value >= 5 ? METAL.gold : METAL.silver;
  const id = `coin-${value}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={`${id}-face`} cx="0.35" cy="0.3" r="0.8"><Stop offset="0" stopColor={hi} /><Stop offset="0.55" stopColor={mid} /><Stop offset="1" stopColor={lo} /></RadialGradient>
        <LinearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={hi} /><Stop offset="1" stopColor={lo} /></LinearGradient>
      </Defs>
      <Circle cx="50" cy="53" r="46" fill="#000" opacity={0.18} />
      <Circle cx="50" cy="50" r="46" fill={`url(#${id}-rim)`} />
      <Circle cx="50" cy="50" r="38" fill={`url(#${id}-face)`} stroke={lo} strokeOpacity={0.5} strokeWidth={1.5} />
      <G fill={lo} opacity={0.35}>
        {Array.from({ length: 24 }, (_, i) => <Circle key={i} cx={50 + 42 * Math.cos((i * Math.PI) / 12)} cy={50 + 42 * Math.sin((i * Math.PI) / 12)} r={1.6} />)}
      </G>
      <SvgText x="51.5" y="63.5" fontSize="36" fontWeight="bold" textAnchor="middle" fill="#FFFFFF" opacity={0.6}>{value}</SvgText>
      <SvgText x="50" y="62" fontSize="36" fontWeight="bold" textAnchor="middle" fill={lo}>{value}</SvgText>
      <Path d="M26 34 Q40 18 62 20" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity={0.5} fill="none" />
    </Svg>
  );
}

function Note({ value, width }: { value: number; width: number }) {
  const [hi, mid, lo] = NOTE[value as keyof typeof NOTE] ?? NOTE[10];
  const id = `note-${value}`;
  return (
    <Svg width={width} height={width * 0.56} viewBox="0 0 160 90">
      <Defs>
        <LinearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={hi} /><Stop offset="0.5" stopColor={mid} /><Stop offset="1" stopColor={lo} /></LinearGradient>
        <RadialGradient id={`${id}-seal`} cx="0.4" cy="0.35" r="0.7"><Stop offset="0" stopColor="#FFFFFF" /><Stop offset="1" stopColor={hi} /></RadialGradient>
      </Defs>
      <Rect x="3" y="6" width="156" height="84" rx="8" fill="#000" opacity={0.15} />
      <Rect x="0" y="2" width="156" height="84" rx="8" fill={`url(#${id}-bg)`} />
      <Rect x="7" y="9" width="142" height="70" rx="5" fill="none" stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth="2" strokeDasharray="5 3" />
      {/* guilloche-like waves */}
      <G stroke="#FFFFFF" strokeOpacity={0.28} strokeWidth="1.4" fill="none">
        {[0, 8, 16, 24].map((d) => <Path key={d} d={`M10 ${30 + d} Q40 ${18 + d} 70 ${30 + d} T130 ${30 + d} T150 ${30 + d}`} />)}
      </G>
      <Circle cx="112" cy="44" r="25" fill={`url(#${id}-seal)`} stroke="#FFFFFF" strokeWidth="2" />
      <SvgText x="112" y="54" fontSize="26" fontWeight="bold" textAnchor="middle" fill={lo}>{value}</SvgText>
      <SvgText x="16" y="28" fontSize="16" fontWeight="bold" fill="#FFFFFF">{value}</SvgText>
      <SvgText x="16" y="76" fontSize="16" fontWeight="bold" fill="#FFFFFF">{value}</SvgText>
      <Rect x="40" y="16" width="5" height="62" fill="#FFFFFF" opacity={0.35} />
    </Svg>
  );
}

/** Coins (1, 2, 5) and banknotes (10+) drawn with metal shine and paper texture. */
export function Money({ value, small }: { value: number; small?: boolean }) {
  const s = small ? 0.62 : 1;
  return (
    <View accessible accessibilityLabel={`${value}`}>
      {value >= 10 ? <Note value={value} width={92 * s} /> : <Coin value={value} size={(value >= 5 ? 66 : 58) * s} />}
    </View>
  );
}

/** Striped shop awning with a scalloped edge. */
export function Awning({ width }: { width: number }) {
  const stripes = 8;
  const w = 400 / stripes;
  return (
    <Svg width={width} height={width * 0.11} viewBox="0 0 400 44" preserveAspectRatio="none">
      {Array.from({ length: stripes }, (_, i) => (
        <Path key={i} d={`M${i * w} 0 H${(i + 1) * w} V30 Q${i * w + w / 2} 46 ${i * w} 30 Z`} fill={i % 2 ? '#FFFFFF' : '#EF4444'} />
      ))}
      <Rect x="0" y="0" width="400" height="6" fill="#B91C1C" />
    </Svg>
  );
}
