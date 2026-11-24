import { memo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

/**
 * Soft scenery behind games and the home screen: sky, sun, clouds and rolling hills by day;
 * moon and stars at night. `tint` colours the far hill so each game has its own world.
 */
export const Backdrop = memo(function Backdrop({ dark, tint = '#86EFAC' }: { dark: boolean; tint?: string }) {
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" pointerEvents="none">
      <Defs>
        <LinearGradient id="bd-sky" x1="0" y1="0" x2="0" y2="1">
          {dark
            ? [<Stop key="a" offset="0" stopColor="#0B1026" />, <Stop key="b" offset="0.7" stopColor="#1B1B2F" />]
            : [<Stop key="a" offset="0" stopColor="#BAE6FD" />, <Stop key="b" offset="0.55" stopColor="#FFF8E7" />]}
        </LinearGradient>
        <RadialGradient id="bd-sun" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor={dark ? '#FEF9C3' : '#FDE047'} /><Stop offset="0.6" stopColor={dark ? '#FEF9C3' : '#FACC15'} stopOpacity="0.9" />
          <Stop offset="1" stopColor={dark ? '#FEF9C3' : '#FACC15'} stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="bd-hill1" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={tint} stopOpacity={dark ? 0.25 : 0.45} /><Stop offset="1" stopColor={tint} stopOpacity={dark ? 0.1 : 0.2} /></LinearGradient>
        <LinearGradient id="bd-hill2" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={dark ? '#14532D' : '#86EFAC'} stopOpacity={dark ? 0.5 : 0.55} /><Stop offset="1" stopColor={dark ? '#14532D' : '#BBF7D0'} stopOpacity={dark ? 0.3 : 0.5} /></LinearGradient>
      </Defs>
      <Path d="M0 0 H400 V800 H0 Z" fill="url(#bd-sky)" />
      <Circle cx="62" cy="200" r="48" fill="url(#bd-sun)" />
      {dark ? (
        <G fill="#FFFFFF">
          {[[40, 60], [90, 150], [160, 40], [220, 120], [270, 50], [370, 220], [60, 260], [200, 230], [310, 300]].map(([x, y], i) => (
            <Circle key={i} cx={x} cy={y} r={i % 3 ? 1.4 : 2.2} opacity={0.8} />
          ))}
        </G>
      ) : (
        <G fill="#FFFFFF" opacity={0.9}>
          <Path d="M40 150 q10 -24 34 -16 q14 -20 38 -6 q24 -4 26 20 q14 8 0 18 h-92 q-20 -2 -6 -16 Z" />
          <Path d="M220 250 q8 -18 26 -12 q12 -16 30 -4 q20 -2 20 16 q10 6 0 14 h-70 q-16 -2 -6 -14 Z" opacity={0.8} />
        </G>
      )}
      <Path d="M0 640 Q90 570 190 620 T400 600 V800 H0 Z" fill="url(#bd-hill1)" />
      <Path d="M0 700 Q120 640 240 690 T400 680 V800 H0 Z" fill="url(#bd-hill2)" />
    </Svg>
  );
});
