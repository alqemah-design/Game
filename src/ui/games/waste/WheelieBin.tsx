import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import { BINS, type Bin } from '@/domain/games/newGames';

/** Paper / plastic / food / other: simple pictograms on the bin label. */
function LabelIcon({ bin }: { bin: Bin }) {
  switch (bin) {
    case 'paper':
      return (
        <G>
          <Rect x="49" y="58" width="22" height="28" rx="2" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="2" />
          <Line x1="53" y1="65" x2="67" y2="65" stroke="#1E3A8A" strokeWidth="2" /><Line x1="53" y1="71" x2="67" y2="71" stroke="#1E3A8A" strokeWidth="2" /><Line x1="53" y1="77" x2="62" y2="77" stroke="#1E3A8A" strokeWidth="2" />
        </G>
      );
    case 'plastic':
      return (
        <G>
          <Rect x="55" y="56" width="10" height="6" rx="1" fill="#A16207" />
          <Path d="M53 62 L67 62 L69 70 L69 86 Q69 89 66 89 L54 89 Q51 89 51 86 L51 70 Z" fill="#FFFFFF" stroke="#A16207" strokeWidth="2" />
          <Rect x="54" y="72" width="12" height="8" fill="#FDE68A" />
        </G>
      );
    case 'food':
      return (
        <G>
          <Path d="M60 64 Q48 56 46 70 Q45 86 60 88 Q75 86 74 70 Q72 56 60 64 Z" fill="#EF4444" stroke="#14532D" strokeWidth="1.5" />
          <Path d="M60 64 Q61 56 66 54" stroke="#14532D" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Path d="M62 58 Q70 52 72 58 Q66 62 62 58 Z" fill="#22C55E" />
        </G>
      );
    case 'other':
      return (
        <G>
          <Path d="M50 62 L70 62 L67 88 L53 88 Z" fill="#FFFFFF" stroke="#1F2937" strokeWidth="2" />
          <Rect x="48" y="58" width="24" height="4" rx="1" fill="#1F2937" />
          <Line x1="57" y1="67" x2="57" y2="84" stroke="#1F2937" strokeWidth="2" /><Line x1="63" y1="67" x2="63" y2="84" stroke="#1F2937" strokeWidth="2" />
        </G>
      );
  }
}

/** A wheelie bin drawn with light and shade. The lid is a separate layer so it can swing open. */
export function WheelieBin({ bin, width, open, wobble, glow }: { bin: Bin; width: number; open: number; wobble: number; glow?: boolean }) {
  const c = BINS[bin];
  const h = width * 1.25;
  const lid = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (open) lid.set(withSequence(withTiming(-38, { duration: 220, easing: Easing.out(Easing.quad) }), withDelay(450, withTiming(0, { duration: 260 }))));
  }, [open, lid]);
  useEffect(() => {
    if (wobble) shake.set(withSequence(withTiming(-7, { duration: 60 }), withTiming(7, { duration: 80 }), withTiming(-4, { duration: 60 }), withTiming(0, { duration: 60 })));
  }, [wobble, shake]);

  const lidStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${lid.value}deg` }] }));
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${shake.value}deg` }] }));
  const id = `bin-${bin}`;

  return (
    <Animated.View style={[{ width, alignItems: 'center' }, shakeStyle]}>
      <View style={{ width, height: h }}>
        {glow && <View style={[StyleSheet.absoluteFill, styles.glow]} />}
        <Svg width={width} height={h} viewBox="0 0 120 150">
          <Defs>
            <LinearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={c.dark} /><Stop offset="0.18" stopColor={c.light} /><Stop offset="0.45" stopColor={c.color} /><Stop offset="1" stopColor={c.dark} />
            </LinearGradient>
            <LinearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#000" stopOpacity="0.25" /><Stop offset="0.25" stopColor="#000" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Ellipse cx="60" cy="146" rx="54" ry="4" fill="#000" opacity={0.22} />
          {/* handle at the back, peeking over the lid */}
          <Rect x="22" y="6" width="76" height="7" rx="3.5" fill={c.dark} />
          {/* body */}
          <Path d="M9 28 L111 28 L103 134 Q102 138 98 138 L22 138 Q18 138 17 134 Z" fill={`url(#${id}-body)`} />
          <Path d="M9 28 L111 28 L103 134 Q102 138 98 138 L22 138 Q18 138 17 134 Z" fill={`url(#${id}-shade)`} />
          {[34, 86].map((x) => <Path key={x} d={`M${x} 36 L${x + (x < 60 ? 2 : -2)} 128`} stroke="#000" strokeOpacity="0.18" strokeWidth="4" strokeLinecap="round" />)}
          <Path d="M18 34 L22 130" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
          <Rect x="8" y="26" width="104" height="6" rx="2" fill={c.dark} opacity={0.9} />
          {/* label */}
          <Rect x="38" y="48" width="44" height="52" rx="8" fill="#FFFFFF" opacity={0.96} />
          <LabelIcon bin={bin} />
          <SvgText x="60" y="96" fontSize="7" fontWeight="bold" fill={c.dark} textAnchor="middle">♻</SvgText>
          {/* wheels */}
          <Rect x="14" y="128" width="92" height="6" rx="3" fill="#111827" />
          <Circle cx="24" cy="138" r="11" fill="#111827" /><Circle cx="24" cy="138" r="4.5" fill="#9CA3AF" />
          <Circle cx="96" cy="138" r="11" fill="#111827" /><Circle cx="96" cy="138" r="4.5" fill="#9CA3AF" />
        </Svg>
        {/* lid: rotates around its back-left hinge */}
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { transformOrigin: ['5%', '17%', 0] }, lidStyle]}>
          <Svg width={width} height={h} viewBox="0 0 120 150">
            <Path d="M4 27 L116 27 L114 17 Q60 9 6 17 Z" fill={c.color} />
            <Path d="M4 27 L116 27 L114 17 Q60 9 6 17 Z" fill="#FFFFFF" opacity={0.18} />
            <Rect x="3" y="25" width="114" height="5" rx="2.5" fill={c.dark} />
            <Rect x="48" y="12" width="24" height="5" rx="2.5" fill={c.dark} />
          </Svg>
        </Animated.View>
      </View>
      <View style={[styles.nameplate, { backgroundColor: c.dark }]}>
        <Text style={[styles.name, { fontSize: width < 95 ? 11 : 14 }]} numberOfLines={2}>{c.ar}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glow: { borderRadius: 24, backgroundColor: 'rgba(250,204,21,0.45)', transform: [{ scale: 1.08 }] },
  nameplate: { marginTop: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, maxWidth: '100%' },
  name: { color: '#FFFFFF', fontWeight: '800', textAlign: 'center' },
});
