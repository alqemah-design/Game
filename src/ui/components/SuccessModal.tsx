import { useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn, FadeInUp } from 'react-native-reanimated';
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
            <Text style={styles.star}>⭐</Text>
            <Text style={[font.title, { color: t.text }]}>{CHEERS[level % CHEERS.length]}</Text>
            <Text style={[font.body, { color: t.textMuted, marginTop: 4 }]}>أكملت المستوى {level}</Text>
            <View style={[styles.pill, { backgroundColor: t.cardAlt }]}>
              <Text style={[font.h2, { color: t.text }]}>+{points} نقطة</Text>
            </View>
            {perfect && <Text style={[font.body, { color: t.success }]}>🎯 بلا أي خطأ!</Text>}

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
              <BigButton label="المستوى التالي" icon="▶" onPress={onNext} color={t.success} style={{ alignSelf: 'stretch' }} />
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
  star: { fontSize: 84 },
  pill: { borderRadius: radius.pill, paddingHorizontal: 20, paddingVertical: 8, marginVertical: 12 },
  reward: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radius.md, padding: 12, marginTop: 10, alignSelf: 'stretch' },
  actions: { alignSelf: 'stretch', gap: 10, marginTop: 20 },
  row: { flexDirection: 'row', gap: 10 },
});
