import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

const COLORS = ['#EF4444', '#F59E0B', '#22C55E', '#3B82F6', '#A855F7', '#EC4899', '#FACC15'];
const { width: W, height: H } = Dimensions.get('window');

function Piece({ i }: { i: number }) {
  const [cfg] = useState(() => ({
    x: Math.random() * W, drift: (Math.random() - 0.5) * 160, delay: Math.random() * 400,
    dur: 1800 + Math.random() * 1200, spin: (Math.random() - 0.5) * 1080, size: 8 + Math.random() * 8,
    color: COLORS[i % COLORS.length], round: Math.random() < 0.4,
  }));
  const p = useSharedValue(0);
  useEffect(() => {
    p.set(withDelay(cfg.delay, withTiming(1, { duration: cfg.dur, easing: Easing.out(Easing.quad) })));
  }, [cfg, p]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - p.value * p.value,
    transform: [
      { translateX: cfg.x + cfg.drift * p.value },
      { translateY: -40 + (H + 80) * p.value },
      { rotate: `${cfg.spin * p.value}deg` },
    ],
  }));
  return <Animated.View style={[styles.piece, { width: cfg.size, height: cfg.size * (cfg.round ? 1 : 1.6), borderRadius: cfg.round ? cfg.size : 2, backgroundColor: cfg.color }, style]} />;
}

/** Lightweight confetti on the UI thread (Reanimated); no Lottie file needed. */
export function Confetti({ count = 60 }: { count?: number }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: count }, (_, i) => <Piece key={i} i={i} />)}
    </View>
  );
}

const styles = StyleSheet.create({ piece: { position: 'absolute', top: 0, left: 0 } });
