import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GAMES, type AgeBand } from '@/domain/games/catalog';
import { earnedStickers, nextSticker, unlockedDecorations } from '@/domain/rewards/rewards';
import { useActiveProfile } from '@/data/progressStore';
import { AvatarView } from '@/ui/components/AvatarView';
import { ParentalGate } from '@/ui/components/ParentalGate';
import { Pressy } from '@/ui/components/Pressy';
import { Screen } from '@/ui/components/Screen';
import { font, radius, useTheme } from '@/ui/theme/theme';

const AGE_TITLES: Record<AgeBand, string> = { '3-5': 'للصغار ٣–٥ 🧸', '5-7': 'للمتعلمين ٥–٧ 📚', '7-9': 'للأذكياء ٧–٩ 🚀' };
const DECOR: Record<string, string> = { balloon: '🎈', rainbow: '🌈', trophy: '🏆', medal: '🏅', star: '🌟' };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'صباح الخير' : h < 18 ? 'مرحبًا' : 'مساء الخير';
}

export default function Home() {
  const t = useTheme();
  const p = useActiveProfile()!;
  const [gate, setGate] = useState(false);
  const { width } = useWindowDimensions();
  const cols = width >= 900 ? 4 : width >= 600 ? 3 : 2;
  const stickers = earnedStickers(p.points);
  const next = nextSticker(p.points);
  const prevThreshold = stickers.at(-1)?.points ?? 0;
  const pct = next ? (p.points - prevThreshold) / (next.points - prevThreshold) : 1;
  const decorations = unlockedDecorations(p.achievements);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View style={styles.header}>
          <Pressy onPress={() => router.push('/avatar')} accessibilityLabel="تعديل الشخصية" style={[styles.avatar, { backgroundColor: t.cardAlt }]}>
            <AvatarView avatar={p.avatar} size={76} />
          </Pressy>
          <View style={{ flex: 1 }}>
            <Text style={[font.small, { color: t.textMuted }]}>{greeting()}</Text>
            <Text style={[font.title, { color: t.text }]} numberOfLines={1}>{p.name} {decorations.map((d) => DECOR[d]).join('')}</Text>
            <Text style={[font.body, { color: t.text }]}>⭐ {p.stars}   💎 {p.points}</Text>
          </View>
          <Pressy onPress={() => setGate(true)} accessibilityLabel="إعدادات الأهل" style={[styles.gear, { backgroundColor: t.card }]}>
            <Text style={{ fontSize: 26 }}>⚙️</Text>
          </Pressy>
        </View>

        <Pressy onPress={() => router.push('/rewards')} style={[styles.rewards, { backgroundColor: t.card }]} accessibilityLabel="الملصقات والإنجازات">
          <View style={styles.rewardsTop}>
            <Text style={[font.body, { color: t.text }]}>ملصقاتي {stickers.length}/15</Text>
            {next && <Text style={[font.small, { color: t.textMuted }]}>التالي {next.emoji} عند {next.points}</Text>}
          </View>
          <View style={[styles.bar, { backgroundColor: t.border }]}>
            <View style={[styles.barFill, { width: `${Math.round(pct * 100)}%`, backgroundColor: t.hint }]} />
          </View>
          <Text style={{ fontSize: 26, marginTop: 6 }} numberOfLines={1}>{stickers.map((s) => s.emoji).join(' ') || '🔒'}</Text>
        </Pressy>

        {(Object.keys(AGE_TITLES) as AgeBand[]).map((band, bi) => (
          <View key={band} style={{ marginTop: 20 }}>
            <Text style={[font.h2, { color: t.text, marginBottom: 10 }]}>{AGE_TITLES[band]}</Text>
            <View style={styles.grid}>
              {GAMES.filter((g) => g.ages === band).map((g, i) => {
                const level = p.games[g.id]?.level ?? 1;
                return (
                  <Animated.View key={g.id} entering={FadeInUp.delay(bi * 120 + i * 50)} style={{ width: `${100 / cols}%`, padding: 6 }}>
                    <Pressy
                      onPress={() => router.push(g.id === 'coloring' ? '/art' : { pathname: '/game/[id]', params: { id: g.id } })}
                      accessibilityLabel={`${g.title}، المستوى ${level}`}
                      style={[styles.card, { backgroundColor: g.color }]}
                    >
                      <Text style={styles.cardEmoji}>{g.emoji}</Text>
                      <Text style={styles.cardTitle} numberOfLines={1}>{g.title}</Text>
                      <Text style={styles.cardSub} numberOfLines={1}>{g.subtitle}</Text>
                      {g.id !== 'coloring' && <View style={styles.levelPill}><Text style={styles.levelText}>المستوى {level}</Text></View>}
                    </Pressy>
                  </Animated.View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
      <ParentalGate visible={gate} onCancel={() => setGate(false)} onPass={() => { setGate(false); router.push('/settings'); }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  gear: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  rewards: { marginTop: 16, borderRadius: radius.lg, padding: 16 },
  rewardsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bar: { height: 12, borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  card: { borderRadius: radius.lg, padding: 14, minHeight: 150, justifyContent: 'space-between', borderBottomWidth: 5, borderBottomColor: 'rgba(0,0,0,0.15)' },
  cardEmoji: { fontSize: 40, fontWeight: '900', color: '#FFF' },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  cardSub: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  levelPill: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, marginTop: 6 },
  levelText: { fontSize: 12, fontWeight: '800', color: '#FFF' },
});
