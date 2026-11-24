import { useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/ui/components/Text';
import Animated, { Easing, FadeInUp, ZoomIn, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, Path, RadialGradient, Stop } from 'react-native-svg';
import type { ProgressEvents } from '@/domain/progress';
import { play } from '@/audio/sfx';
import { BigButton } from './BigButton';
import { Confetti } from './Confetti';
import { font, radius, useTheme } from '../theme/theme';

type Props = {
  visible: boolean;
  level: number;
  points: number;
  perfect: boolean;
  events: ProgressEvents;
  effects: boolean;
  onNext: () => void;
  onReplay: () => void;
  onHome: () => void;
};

/** Big glossy star on a slowly turning burst of light. */
function StarBurst() {
  const spin = useSharedValue(0);
  useEffect(() => {
    spin.set(withRepeat(withTiming(360, { duration: 9000, easing: Easing.linear }), -1));
    return () => cancelAnimation(spin);
  }, [spin]);
  const rays = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));
  return (
    <View style={styles.burst}>
      <Animated.View style={[StyleSheet.absoluteFill, rays]}>
        <Svg width="100%" height="100%" viewBox="0 0 200 200">
          <Defs>
            <RadialGradient id="sb-glow" cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor="#FEF08A" stopOpacity="0.95" /><Stop offset="1" stopColor="#FEF08A" stopOpacity="0" /></RadialGradient>
          </Defs>
          <Circle cx="100" cy="100" r="100" fill="url(#sb-glow)" />
          <G fill="#FDE047" opacity={0.55}>
            {Array.from({ length: 12 }, (_, i) => <Path key={i} d="M100 100 L92 4 L108 4 Z" transform={`rotate(${i * 30} 100 100)`} />)}
          </G>
        </Svg>
      </Animated.View>
      <Animated.View entering={ZoomIn.springify().damping(8).delay(150)}>
        <Svg width={110} height={110} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="sb-star" cx="0.4" cy="0.3" r="0.75"><Stop offset="0" stopColor="#FFFBEB" /><Stop offset="0.45" stopColor="#FACC15" /><Stop offset="1" stopColor="#D97706" /></RadialGradient>
          </Defs>
          <Path d="M50 4 L62.5 36 L96 37.5 L69.5 58.5 L79 91 L50 72 L21 91 L30.5 58.5 L4 37.5 L37.5 36 Z" fill="url(#sb-star)" stroke="#B45309" strokeWidth="3" strokeLinejoin="round" />
          <Path d="M36 30 Q44 22 52 22" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity={0.7} fill="none" />
          <Circle cx="40" cy="52" r="4" fill="#7C2D12" /><Circle cx="60" cy="52" r="4" fill="#7C2D12" />
          <Path d="M42 62 Q50 70 58 62" stroke="#7C2D12" strokeWidth="3" strokeLinecap="round" fill="none" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const CHEERS = ['أحسنت!', 'رائع!', 'ممتاز!', 'بطل!', 'مذهل!'];

export function SuccessModal({ visible, level, points, perfect, events, effects, onNext, onReplay, onHome }: Props) {
  const t = useTheme();
  useEffect(() => {
    if (!visible) return;
    play('levelUp');
    if (events.stickers.length || events.achievements.length) setTimeout(() => play('sticker'), 900);
  }, [visible, events]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onHome}>
      <View style={[styles.backdrop, { backgroundColor: t.overlay }]}>
        {visible && effects && <Confetti />}
        <Animated.View entering={ZoomIn.springify().damping(12)} style={[styles.card, { backgroundColor: t.card }]}>
          <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
            <StarBurst />
            <Text style={[font.title, { color: t.text }]}>{CHEERS[level % CHEERS.length]}</Text>
            <Text style={[font.body, { color: t.textMuted, marginTop: 4 }]}>أكملت المستوى {level}</Text>
            <View style={styles.starsRow} accessibilityLabel={`${events.stars ?? 1} من 3 نجوم`}>
              {[0, 1, 2].map((i) => (
                <Animated.View key={i} entering={ZoomIn.delay(350 + i * 220).springify().damping(9)}>
                  <Svg width={i === 1 ? 54 : 44} height={i === 1 ? 54 : 44} viewBox="0 0 100 100">
                    <Path d="M50 4 L62.5 36 L96 37.5 L69.5 58.5 L79 91 L50 72 L21 91 L30.5 58.5 L4 37.5 L37.5 36 Z"
                      fill={i < (events.stars ?? 1) ? '#FACC15' : t.border} stroke={i < (events.stars ?? 1) ? '#B45309' : 'rgba(0,0,0,0.15)'} strokeWidth="5" strokeLinejoin="round" />
                  </Svg>
                </Animated.View>
              ))}
            </View>
            <View style={[styles.pill, { backgroundColor: t.cardAlt }]}>
              <Text style={[font.h2, { color: t.text }]}>+{points} نقطة</Text>
            </View>
            {events.dailyBonus && <Text style={[font.body, { color: t.primary }]}>✨ لعبة اليوم: نقاطك مضاعفة!</Text>}
            {perfect && <Text style={[font.body, { color: t.success }]}>🎯 بلا أي خطأ!</Text>}
            {events.adapted === 'jump' && <Text style={[font.body, { color: t.text, textAlign: 'center' }]}>🚀 أنت سريع! سنقفز مستوى للأمام</Text>}
            {events.adapted === 'repeat' && <Text style={[font.body, { color: t.text, textAlign: 'center' }]}>💪 لنتدرّب على هذا المستوى مرة أخرى</Text>}

            {events.stickers.map((s) => (
              <Animated.View key={s.points} entering={FadeInUp.delay(500)} style={[styles.reward, { backgroundColor: t.hintBg }]}>
                <Text style={{ fontSize: 44 }}>{s.emoji}</Text>
                <Text style={[font.body, { color: t.text }]}>ملصق جديد: {s.name}</Text>
              </Animated.View>
            ))}
            {events.achievements.map((a) => (
              <Animated.View key={a.id} entering={FadeInUp.delay(700)} style={[styles.reward, { backgroundColor: t.successBg }]}>
                <Text style={{ fontSize: 40 }}>{a.emoji}</Text>
                <View style={{ flexShrink: 1 }}>
                  <Text style={[font.body, { color: t.text }]}>إنجاز: {a.title}</Text>
                  {a.unlocks && (
                    <Text style={[font.small, { color: t.textMuted }]}>
                      {a.unlocks.kind === 'coloringPage' ? '🎨 فتحت صفحة تلوين جديدة' : '🎈 فتحت زينة جديدة للرئيسية'}
                    </Text>
                  )}
                </View>
              </Animated.View>
            ))}

            <View style={styles.actions}>
              <BigButton label={events.adapted === 'repeat' ? 'نتدرّب مرة أخرى' : 'المستوى التالي'} icon="▶" onPress={onNext} color={t.success} style={{ alignSelf: 'stretch' }} />
              <View style={styles.row}>
                <BigButton small label="إعادة" icon="↻" onPress={onReplay} color={t.cardAlt} textColor={t.text} style={{ flex: 1 }} />
                <BigButton small label="الرئيسية" icon="🏠" onPress={onHome} color={t.cardAlt} textColor={t.text} style={{ flex: 1 }} />
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 440, maxHeight: '90%', borderRadius: radius.lg, padding: 24 },
  burst: { width: 180, height: 150, alignItems: 'center', justifyContent: 'center', marginTop: -10 },
  starsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 8, direction: 'ltr' },
  pill: { borderRadius: radius.pill, paddingHorizontal: 20, paddingVertical: 8, marginVertical: 12 },
  reward: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radius.md, padding: 12, marginTop: 10, alignSelf: 'stretch' },
  actions: { alignSelf: 'stretch', gap: 10, marginTop: 20 },
  row: { flexDirection: 'row', gap: 10 },
});
