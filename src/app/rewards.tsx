import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/ui/components/Text';
import { goBack } from '@/ui/nav';
import { ACHIEVEMENTS, STICKERS } from '@/domain/rewards/rewards';
import { useActiveProfile } from '@/data/progressStore';
import { BigButton } from '@/ui/components/BigButton';
import { Screen } from '@/ui/components/Screen';
import { font, radius, raised, useTheme } from '@/ui/theme/theme';

export default function Rewards() {
  const t = useTheme();
  const p = useActiveProfile();
  if (!p) return null;
  return (
    <Screen scenery="#FDE68A">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={[font.title, { color: t.text }]}>ملصقاتي 🏅</Text>
        <View style={styles.grid}>
          {STICKERS.map((s) => {
            const has = p.points >= s.points;
            return (
              <View key={s.points} style={[styles.sticker, raised(t, has ? t.hintBg : t.card)]} accessibilityLabel={has ? s.name : `مقفل حتى ${s.points} نقطة`}>
                <Text style={{ fontSize: 40, opacity: has ? 1 : 0.13 }}>{s.emoji}</Text>
                <Text style={[font.small, { color: has ? t.text : t.textMuted, fontSize: 11 }]}>{has ? s.name : `${s.points} 💎`}</Text>
              </View>
            );
          })}
        </View>
        <Text style={[font.title, { color: t.text, marginTop: 24 }]}>الإنجازات 🏆</Text>
        {ACHIEVEMENTS.map((a) => {
          const has = p.achievements.includes(a.id);
          return (
            <View key={a.id} style={[styles.row, raised(t, has ? t.successBg : t.card)]}>
              <Text style={{ fontSize: 34, opacity: has ? 1 : 0.3 }}>{a.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[font.body, { color: t.text }]}>{a.title}</Text>
                <Text style={[font.small, { color: t.textMuted }]}>{a.description}</Text>
              </View>
              {has && <Text style={{ fontSize: 22 }}>✅</Text>}
            </View>
          );
        })}
        <BigButton label="رجوع" onPress={goBack} style={{ marginTop: 16 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  sticker: { width: 96, height: 96, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radius.md, padding: 12, marginTop: 10 },
});
