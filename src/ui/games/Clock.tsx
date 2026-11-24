import Svg, { Circle, Defs, G, Line, LinearGradient, Path, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';

/**
 * A wooden wall clock: wood-grain frame, cream face, glass reflection and shadowed hands.
 * The hour hand moves proportionally with the minutes, like a real clock.
 */
export function Clock({ h, m, size = 230, dark = false }: { h: number; m: number; size?: number; dark?: boolean }) {
  const hourAngle = ((h % 12) + m / 60) * 30;
  const minuteAngle = m * 6;
  const ink = '#2B2140';
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Defs>
        <LinearGradient id="clk-wood" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#D4A373" /><Stop offset="0.5" stopColor="#A0662E" /><Stop offset="1" stopColor="#6B3F1A" />
        </LinearGradient>
        <RadialGradient id="clk-face" cx="0.45" cy="0.4" r="0.65">
          <Stop offset="0" stopColor="#FFFFFF" /><Stop offset="1" stopColor={dark ? '#E9E3D3' : '#FDF6E3'} />
        </RadialGradient>
        <RadialGradient id="clk-cap" cx="0.35" cy="0.35" r="0.7"><Stop offset="0" stopColor="#FDE68A" /><Stop offset="1" stopColor="#B45309" /></RadialGradient>
      </Defs>
      <Circle cx={102} cy={106} r={96} fill="#000" opacity={0.18} />
      <Circle cx={100} cy={100} r={96} fill="url(#clk-wood)" />
      <Circle cx={100} cy={100} r={96} fill="none" stroke="#5B3412" strokeWidth={2} />
      <G stroke="#5B3412" strokeOpacity={0.25} strokeWidth={1.2} fill="none">
        <Circle cx={100} cy={100} r={90} /><Circle cx={100} cy={100} r={86} strokeDasharray="14 9" />
      </G>
      <Circle cx={100} cy={100} r={80} fill="url(#clk-face)" stroke="#7C4A1E" strokeWidth={3} />
      {Array.from({ length: 60 }, (_, i) => (
        <Line key={i} x1={100} y1={24} x2={100} y2={i % 5 === 0 ? 34 : 29} stroke={ink} strokeWidth={i % 5 === 0 ? 3 : 1} strokeLinecap="round" transform={`rotate(${i * 6} 100 100)`} />
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1, a = (n * 30 * Math.PI) / 180;
        return <SvgText key={n} x={100 + 54 * Math.sin(a)} y={100 - 54 * Math.cos(a) + 7} fontSize={19} fontWeight="bold" fill={ink} textAnchor="middle">{n}</SvgText>;
      })}
      {/* hand shadows, then hands */}
      <G opacity={0.18} transform="translate(2 3)">
        <Line x1={100} y1={108} x2={100} y2={56} stroke="#000" strokeWidth={8} strokeLinecap="round" transform={`rotate(${hourAngle} 100 100)`} />
        <Line x1={100} y1={112} x2={100} y2={34} stroke="#000" strokeWidth={5} strokeLinecap="round" transform={`rotate(${minuteAngle} 100 100)`} />
      </G>
      <G transform={`rotate(${hourAngle} 100 100)`}><Path d="M96 108 L100 54 L104 108 Z" fill="#DC2626" stroke="#7F1D1D" strokeWidth={1.5} strokeLinejoin="round" /></G>
      <G transform={`rotate(${minuteAngle} 100 100)`}><Path d="M97.5 112 L100 32 L102.5 112 Z" fill="#2563EB" stroke="#1E3A8A" strokeWidth={1.2} strokeLinejoin="round" /></G>
      <Circle cx={100} cy={100} r={7} fill="url(#clk-cap)" stroke="#78350F" strokeWidth={1} />
      {/* glass reflection */}
      <Path d="M44 70 Q60 36 104 28 Q72 46 58 88 Z" fill="#FFFFFF" opacity={0.35} />
    </Svg>
  );
}
