import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Text } from '@/ui/components/Text';
import { router, useFocusEffect } from 'expo-router';
import { TimeUp } from '@/ui/components/TimeUp';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GAMES, GAME_BY_ID, type AgeBand, type GameMeta } from '@/domain/games/catalog';
import { dayKey, gameOfTheDay, minutesLeftToday } from '@/domain/progress';
import type { GameId } from '@/domain/types';
import { earnedStickers, nextSticker, unlockedDecorations } from '@/domain/rewards/rewards';
import { useActiveProfile } from '@/data/progressStore';
import { issueParentPass } from '@/data/parentGate';
import { useArabicVoice } from '@/audio/speech';
import { AvatarView } from '@/ui/components/AvatarView';
import { ParentalGate } from '@/ui/components/ParentalGate';
import { Pressy } from '@/ui/components/Pressy';
import { Screen } from '@/ui/components/Screen';
import { font, radius, raised, useTheme } from '@/ui/theme/theme';

const AGE_TITLES: Record<AgeBand, string> = { '3-5': 'للصغار ٣–٥ 🧸', '5-7': 'للمتعلمين ٥–٧ 📚', '7-9': 'للأذكياء ٧–٩ 🚀' };
const DECOR: Record<string, string> = { balloon: '🎈', rainbow: '🌈', trophy: '🏆', medal: '🏅', star: '🌟' };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'صباح الخير' : h < 18 ? 'مرحبًا' : 'مساء الخير';
}

const openGame = (id: GameId) => router.push(id === 'coloring' ? '/art' : { pathname: '/game/[id]', params: { id } });

/** Big shortcut card: continue the last game, or the game of the day. */
function HeroCard({ game, kicker, note }: { game: GameMeta; kicker: string; note: string }) {
  return (
    <Pressy onPress={() => openGame(game.id)} accessibilityLabel={`${kicker}: ${game.title}`} style={[styles.hero, { backgroundColor: game.color }]}>
      <View pointerEvents="none" style={styles.shine} />
      <View style={[styles.badge, { width: 50, height: 50 }]}><Text style={[styles.cardEmoji, { fontSize: 28 }]}>{game.emoji}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.heroKicker}>{kicker}</Text>
        <Text style={styles.cardTitle} numberOfLines={1}>{game.title}</Text>
        <Text style={styles.cardSub} numberOfLines={1}>{note}</Text>
      </View>
    </Pressy>
  );
}

export default function Home() {
  const t = useTheme();
  const p = useActiveProfile()!;
  const [gate, setGate] = useState(false);
  const hasArabic = useArabicVoice();
  const { width } = useWindowDimensions();
  const cols = width >= 900 ? 4 : width >= 600 ? 3 : 2;
  const stickers = earnedStickers(p.points);
  const next = nextSticker(p.points);
  const prevThreshold = stickers.at(-1)?.points ?? 0;
  const pct = next ? (p.points - prevThreshold) / (next.points - prevThreshold) : 1;
  const decorations = unlockedDecorations(p.achievements);
  const [now, setNow] = useState(() => Date.now());
  // Re-read the clock each time Home comes back into view (daily limit, game of the day).
  useFocusEffect(useCallback(() => { setNow(Date.now()); }, []));
  const timeUp = minutesLeftToday(p, now) <= 0;
  const today = GAME_BY_ID[gameOfTheDay(dayKey(now), p.id)];
  const last = GAMES.filter((g) => (p.games[g.id]?.lastPlayedAt ?? 0) > 0 && g.id !== today.id)
    .sort((a, b) => (p.games[b.id]?.lastPlayedAt ?? 0) - (p.games[a.id]?.lastPlayedAt ?? 0))[0];

  return (
    <Screen scenery="#86EFAC">
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
            {hasArabic === false && <View style={styles.alertDot} accessibilityLabel="تنبيه للأهل" />}
          </Pressy>
        </View>

        <View style={styles.heroRow}>
          {last && <HeroCard game={last} kicker="▶ تابع اللعب" note={`المستوى ${p.games[last.id]?.level ?? 1}`} />}
          <HeroCard game={today} kicker="✨ لعبة اليوم" note="نقاط مضاعفة ×٢" />
        </View>

        <Pressy onPress={() => router.push('/rewards')} style={[styles.rewards, raised(t)]} accessibilityLabel="الملصقات والإنجازات">
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
                      onPress={() => openGame(g.id)}
                      accessibilityLabel={`${g.title}، المستوى ${level}`}
                      style={[styles.card, { backgroundColor: g.color }]}
                    >
                      <View pointerEvents="none" style={styles.bubbleBig} />
                      <View pointerEvents="none" style={styles.bubbleSmall} />
                      <View pointerEvents="none" style={styles.shine} />
                      <View style={styles.badge}><Text style={styles.cardEmoji}>{g.emoji}</Text></View>
                      <Text style={styles.cardTitle} numberOfLines={2}>{g.title}</Text>
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
      {timeUp && <TimeUp />}
      <ParentalGate visible={gate} onCancel={() => setGate(false)} onPass={() => { setGate(false); issueParentPass(); router.push('/settings'); }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  gear: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  rewards: { marginTop: 16, borderRadius: radius.lg, padding: 16 },
  alertDot: { position: 'absolute', top: 2, end: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#FFF' },
  heroRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  hero: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: radius.lg, padding: 12, overflow: 'hidden', minHeight: 84,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.45)', borderBottomWidth: 7, borderBottomColor: 'rgba(0,0,0,0.22)',
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 5 }, elevation: 5,
  },
  heroKicker: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.95)' },
  rewardsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bar: { height: 12, borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  card: {
    borderRadius: radius.lg, padding: 14, minHeight: 156, justifyContent: 'space-between', overflow: 'hidden',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.45)', borderBottomWidth: 7, borderBottomColor: 'rgba(0,0,0,0.22)',
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 5 }, elevation: 5,
  },
  badge: {
    width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.92)',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  bubbleBig: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.14)', top: -40, left: -36 },
  bubbleSmall: { position: 'absolute', width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.12)', bottom: -14, left: 30 },
  shine: { position: 'absolute', top: 0, left: 0, right: 0, height: '45%', backgroundColor: 'rgba(255,255,255,0.12)' },
  cardEmoji: { fontSize: 36, fontWeight: '900', color: '#4C1D95' },
  cardTitle: { fontSize: 16, lineHeight: 21, fontWeight: '800', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  cardSub: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  levelPill: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, marginTop: 6 },
  levelText: { fontSize: 12, fontWeight: '800', color: '#FFF' },
});
