import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/ui/components/Text';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useProgress } from '@/data/progressStore';
import { useI18n } from '@/i18n';
import { BigButton } from './BigButton';
import { Owl } from './Owl';
import { ParentalGate } from './ParentalGate';
import { font, radius, useTheme } from '../theme/theme';

/** Friendly end-of-play screen for the daily limit. Only a parent (through the gate) can add time. */
export function TimeUp({ onHome }: { onHome?: () => void }) {
  const t = useTheme();
  const { t: tr } = useI18n();
  const grant = useProgress((s) => s.grantMinutes);
  const [gate, setGate] = useState(false);
  return (
    <Animated.View entering={FadeIn} style={[StyleSheet.absoluteFill, styles.root, { backgroundColor: t.dark ? 'rgba(11,16,38,0.97)' : 'rgba(224,242,254,0.97)' }]}>
      <Owl size={150} mood="think" />
      <View style={[styles.card, { backgroundColor: t.card }]}>
        <Text style={[font.title, { color: t.text, textAlign: 'center' }]}>{tr('timeUp.title')}</Text>
        <Text style={[font.body, { color: t.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 26 }]}>
          {tr('timeUp.body')}
        </Text>
        {onHome && <BigButton label={tr('common.home')} icon="🏠" onPress={onHome} style={{ marginTop: 16, alignSelf: 'stretch' }} />}
        <BigButton small label={tr('timeUp.parentExtra')} icon="🔒" color={t.cardAlt} textColor={t.text} onPress={() => setGate(true)} style={{ marginTop: 10, alignSelf: 'stretch' }} />
      </View>
      <ParentalGate visible={gate} onCancel={() => setGate(false)} onPass={() => { setGate(false); grant(15); }} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 50 },
  card: { width: '100%', maxWidth: 420, borderRadius: radius.lg, padding: 20, marginTop: 8 },
});
