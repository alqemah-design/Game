import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/ui/components/Text';
import { goBack } from '@/ui/nav';
import { useI18n, type TKey } from '@/i18n';
import { ACHIEVEMENTS, STICKERS } from '@/domain/rewards/rewards';
import { useActiveProfile } from '@/data/progressStore';
import { BigButton } from '@/ui/components/BigButton';
import { Screen } from '@/ui/components/Screen';
import { font, radius, raised, useTheme } from '@/ui/theme/theme';

export default function Rewards() {
  const { t: tr } = useI18n();
  const t = useTheme();
  const p = useActiveProfile();
  if (!p) return null;
  return (
    <Screen scenery="#FDE68A">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={[font.title, { color: t.text }]}>{tr('rewards.stickersTitle')}</Text>
        <View style={styles.grid}>
          {STICKERS.map((s) => {
            const has = p.points >= s.points;
            return (
              <View key={s.points} style={[styles.sticker, raised(t, has ? t.hintBg : t.card)]} accessibilityLabel={has ? tr(`stickers.s${s.points}` as TKey) : tr('rewards.lockedUntil', { points: s.points })}>
                <Text style={{ fontSize: 40, opacity: has ? 1 : 0.13 }}>{s.emoji}</Text>
                <Text style={[font.small, { color: has ? t.text : t.textMuted, fontSize: 11 }]}>{has ? tr(`stickers.s${s.points}` as TKey) : `${s.points} 💎`}</Text>
              </View>
            );
          })}
        </View>
        <Text style={[font.title, { color: t.text, marginTop: 24 }]}>{tr('rewards.achievementsTitle')}</Text>
        {ACHIEVEMENTS.map((a) => {
          const has = p.achievements.includes(a.id);
          return (
            <View key={a.id} style={[styles.row, raised(t, has ? t.successBg : t.card)]}>
              <Text style={{ fontSize: 34, opacity: has ? 1 : 0.3 }}>{a.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[font.body, { color: t.text }]}>{tr(`achievements.${a.id}.title` as TKey)}</Text>
                <Text style={[font.small, { color: t.textMuted }]}>{tr(`achievements.${a.id}.desc` as TKey)}</Text>
              </View>
              {has && <Text style={{ fontSize: 22 }}>✅</Text>}
            </View>
          );
        })}
        <BigButton label={tr('common.back')} onPress={goBack} style={{ marginTop: 16 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  sticker: { width: 96, height: 96, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radius.md, padding: 12, marginTop: 10 },
});
