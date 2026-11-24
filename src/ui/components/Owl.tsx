import { useEffect } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

/** "بومي" the owl – the app's guide. Gently bobs; `mood` changes the eyes and wings. */
export function Owl({ size = 120, mood = 'happy', still = false }: { size?: number; mood?: 'happy' | 'wave' | 'think'; still?: boolean }) {
  const bob = useSharedValue(0);
  useEffect(() => {
    if (still) return;
    bob.set(withRepeat(withSequence(withTiming(-5, { duration: 900, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 900, easing: Easing.inOut(Easing.quad) })), -1));
    return () => cancelAnimation(bob);
  }, [bob, still]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));

  return (
    <Animated.View style={style}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          <RadialGradient id="owl-body" cx="0.4" cy="0.3" r="0.8"><Stop offset="0" stopColor="#A78BFA" /><Stop offset="1" stopColor="#6D28D9" /></RadialGradient>
          <LinearGradient id="owl-belly" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#FEF3C7" /><Stop offset="1" stopColor="#FDE68A" /></LinearGradient>
        </Defs>
        <Ellipse cx="60" cy="114" rx="30" ry="4" fill="#000" opacity={0.15} />
        {/* ear tufts */}
        <Path d="M30 30 L26 8 L46 24 Z" fill="#6D28D9" />
        <Path d="M90 30 L94 8 L74 24 Z" fill="#6D28D9" />
        {/* body */}
        <Ellipse cx="60" cy="64" rx="38" ry="46" fill="url(#owl-body)" />
        <Ellipse cx="60" cy="80" rx="24" ry="27" fill="url(#owl-belly)" />
        <G stroke="#F59E0B" strokeWidth="2" fill="none" opacity={0.6}>
          <Path d="M50 76 q5 4 10 0 q5 4 10 0" /><Path d="M48 88 q6 4 12 0 q6 4 12 0" />
        </G>
        {/* wings */}
        {mood === 'wave'
          ? <Path d="M98 56 Q118 36 112 20 Q100 34 90 52 Z" fill="#5B21B6" />
          : <Path d="M96 58 Q108 78 96 98 Q88 80 90 62 Z" fill="#5B21B6" />}
        <Path d="M24 58 Q12 78 24 98 Q32 80 30 62 Z" fill="#5B21B6" />
        {/* eyes */}
        <Circle cx="44" cy="46" r="15" fill="#FFFFFF" stroke="#4C1D95" strokeWidth="2" />
        <Circle cx="76" cy="46" r="15" fill="#FFFFFF" stroke="#4C1D95" strokeWidth="2" />
        {mood === 'think' ? (
          <G><Circle cx="48" cy="42" r="6.5" fill="#1F1235" /><Circle cx="80" cy="42" r="6.5" fill="#1F1235" /></G>
        ) : (
          <G>
            <Circle cx="45" cy="47" r="7" fill="#1F1235" /><Circle cx="77" cy="47" r="7" fill="#1F1235" />
            <Circle cx="47.5" cy="44.5" r="2.5" fill="#FFFFFF" /><Circle cx="79.5" cy="44.5" r="2.5" fill="#FFFFFF" />
          </G>
        )}
        {/* beak and cheeks */}
        <Path d="M54 58 L66 58 L60 68 Z" fill="#F97316" stroke="#C2410C" strokeWidth="1.5" strokeLinejoin="round" />
        <Circle cx="32" cy="60" r="5" fill="#F9A8D4" opacity={0.7} />
        <Circle cx="88" cy="60" r="5" fill="#F9A8D4" opacity={0.7} />
        {/* feet */}
        <G fill="#F97316"><Ellipse cx="50" cy="110" rx="7" ry="3.5" /><Ellipse cx="70" cy="110" rx="7" ry="3.5" /></G>
      </Svg>
    </Animated.View>
  );
}
