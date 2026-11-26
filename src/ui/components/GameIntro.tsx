import { useEffect } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Text } from '@/ui/components/Text';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import type { GameMeta } from '@/domain/games/catalog';
import { speak, stopSpeaking } from '@/audio/speech';
import { useI18n } from '@/i18n';
import { BigButton } from './BigButton';
import { Owl } from './Owl';
import { Pressy } from './Pressy';
import { font, radius, raised, useTheme } from '../theme/theme';

/** Bumi the owl explains a game out loud – shown on the first visit and from the "?" button. */
export function GameIntro({ visible, meta, onClose }: { visible: boolean; meta: GameMeta; onClose: () => void }) {
  const t = useTheme();
  const { t: tr, lang } = useI18n();
  const howTo = tr(`games.${meta.id}.howTo`);
  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(() => speak(howTo, lang), 450);
    return () => { clearTimeout(id); stopSpeaking(); };
  }, [visible, howTo, lang]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: t.overlay }]}>
        <Animated.View entering={ZoomIn.springify().damping(12)} style={[styles.card, { backgroundColor: t.card }]}>
          <View style={[styles.gameBadge, { backgroundColor: meta.color }]}>
            <Text style={styles.gameEmoji}>{meta.emoji}</Text>
            <Text style={styles.gameTitle}>{tr(`games.${meta.id}.title`)}</Text>
          </View>
          <View style={styles.row}>
            <Owl size={110} mood="wave" />
            <Animated.View entering={FadeInDown.delay(250)} style={[styles.bubble, { backgroundColor: t.cardAlt }]}>
              <Text style={[font.body, { color: t.text, lineHeight: 28 }]}>{howTo}</Text>
              <View style={[styles.tail, { borderTopColor: t.cardAlt }]} />
            </Animated.View>
          </View>
          <Pressy onPress={() => speak(howTo, lang)} accessibilityLabel={tr('game.replayExplanation')} style={[styles.again, raised(t, t.cardAlt)]}>
            <Text style={[font.body, { color: t.text }]}>🔊 {tr('game.replayExplanation')}</Text>
          </Pressy>
          <BigButton label={tr('common.letsPlay')} icon="🚀" onPress={onClose} color={t.success} style={{ alignSelf: 'stretch', marginTop: 12 }} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 440, borderRadius: radius.lg, padding: 20 },
  gameBadge: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'center', borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 6 },
  gameEmoji: { fontSize: 24, color: '#FFF', fontWeight: '900' },
  gameTitle: { fontSize: 18, color: '#FFF', fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  bubble: { flex: 1, borderRadius: radius.md, padding: 14 },
  tail: { position: 'absolute', bottom: 18, start: -12, width: 0, height: 0, borderTopWidth: 12, borderStartWidth: 14, borderStartColor: 'transparent', transform: [{ rotate: '90deg' }] },
  again: { alignSelf: 'center', borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 8, marginTop: 14 },
});
