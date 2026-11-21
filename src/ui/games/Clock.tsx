import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';

/** Analog clock face. The hour hand moves proportionally with minutes, like a real clock. */
export function Clock({ h, m, size = 220, dark = false }: { h: number; m: number; size?: number; dark?: boolean }) {
  const hourAngle = ((h % 12) + m / 60) * 30;
  const minuteAngle = m * 6;
  const ink = dark ? '#F4F1FF' : '#2B2140';
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Circle cx={100} cy={100} r={94} fill={dark ? '#262645' : '#FFFFFF'} stroke="#F59E0B" strokeWidth={8} />
      {Array.from({ length: 60 }, (_, i) => (
        <Line key={i} x1={100} y1={12} x2={100} y2={i % 5 === 0 ? 24 : 18} stroke={ink} strokeWidth={i % 5 === 0 ? 3 : 1} transform={`rotate(${i * 6} 100 100)`} />
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1, a = (n * 30 * Math.PI) / 180;
        return <SvgText key={n} x={100 + 62 * Math.sin(a)} y={100 - 62 * Math.cos(a) + 7} fontSize={20} fontWeight="bold" fill={ink} textAnchor="middle">{n}</SvgText>;
      })}
      <G transform={`rotate(${hourAngle} 100 100)`}><Line x1={100} y1={108} x2={100} y2={52} stroke="#EF4444" strokeWidth={8} strokeLinecap="round" /></G>
      <G transform={`rotate(${minuteAngle} 100 100)`}><Line x1={100} y1={112} x2={100} y2={26} stroke="#3B82F6" strokeWidth={5} strokeLinecap="round" /></G>
      <Circle cx={100} cy={100} r={7} fill={ink} />
    </Svg>
  );
}
