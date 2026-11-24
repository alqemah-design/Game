import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/ui/components/Text';
import { GAMES, SKILL_AR, type Skill } from '@/domain/games/catalog';
import { dayKey } from '@/domain/progress';
import { useActiveProfile } from '@/data/progressStore';
import { Screen } from '@/ui/components/Screen';
import { font, radius, raised, useTheme } from '@/ui/theme/theme';
import { Owl } from '@/ui/components/Owl';

const DAYS_AR = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

export default function Stats() {
  const t = useTheme();
  const p = useActiveProfile()!;
  const [now] = useState(() => Date.now());
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = now - (6 - i) * 86400000;
    return { label: DAYS_AR[new Date(d).getDay()], ...(p.activity[dayKey(d)] ?? { levels: 0, points: 0 }) };
  });
  const maxLevels = Math.max(1, ...week.map((d) => d.levels));
  const played = GAMES.filter((g) => p.games[g.id]);
  const skills = (Object.keys(SKILL_AR) as Skill[]).map((s) => ({
    skill: s,
    levels: GAMES.filter((g) => g.skill === s).reduce((n, g) => n + (p.games[g.id]?.completed ?? 0), 0),
  }));
  const maxSkill = Math.max(1, ...skills.map((s) => s.levels));

  return (
    <Screen scenery="#93C5FD">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Text style={[font.title, { color: t.text }]}>إنجازاتي 📊</Text>
        {played.length === 0 && (
          <View style={[styles.card, raised(t), { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
            <Owl size={90} mood="wave" />
            <Text style={[font.body, { color: t.text, flex: 1, lineHeight: 26 }]}>أهلًا! العب أول لعبة، وسأرسم لك هنا نجومك ومهاراتك وأيامك 🌟</Text>
          </View>
        )}
        <View style={styles.tiles}>
          {[['⭐', p.stars, 'نجمة'], ['💎', p.points, 'نقطة'], ['🔥', p.bestStreak, 'أفضل سلسلة'], ['🎮', played.length, 'لعبة']].map(([e, v, l]) => (
            <View key={String(l)} style={[styles.tile, raised(t)]}>
              <Text style={{ fontSize: 28 }}>{e}</Text>
              <Text style={[font.h2, { color: t.text }]}>{v}</Text>
              <Text style={[font.small, { color: t.textMuted }]}>{l}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, raised(t)]}>
          <Text style={[font.body, { color: t.text, marginBottom: 12 }]}>مستويات هذا الأسبوع</Text>
          <View style={styles.chart}>
            {week.map((d, i) => (
              <View key={i} style={styles.col} accessibilityLabel={`${d.label}: ${d.levels} مستوى`}>
                <Text style={[font.small, { color: t.textMuted }]}>{d.levels || ''}</Text>
                <View style={[styles.barTrack, { backgroundColor: t.border }]}>
                  <View style={{ height: `${(d.levels / maxLevels) * 100}%`, backgroundColor: i === 6 ? t.primary : t.hint, borderRadius: 6 }} />
                </View>
                <Text style={[font.small, { color: t.textMuted, fontSize: 11 }]}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, raised(t)]}>
          <Text style={[font.body, { color: t.text, marginBottom: 12 }]}>المهارات</Text>
          {skills.map((s) => (
            <View key={s.skill} style={styles.skillRow}>
              <Text style={[font.small, { color: t.text, width: 80 }]}>{SKILL_AR[s.skill]}</Text>
              <View style={[styles.hTrack, { backgroundColor: t.border }]}>
                <View style={{ width: `${(s.levels / maxSkill) * 100}%`, height: '100%', backgroundColor: t.success, borderRadius: 6 }} />
              </View>
              <Text style={[font.small, { color: t.textMuted, width: 32, textAlign: 'center' }]}>{s.levels}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, raised(t)]}>
          <Text style={[font.body, { color: t.text, marginBottom: 8 }]}>كل لعبة</Text>
          {played.length === 0 && <Text style={[font.small, { color: t.textMuted }]}>العب أي لعبة لتظهر هنا ✨</Text>}
          {played.map((g) => {
            const gp = p.games[g.id]!;
            const acc = gp.correct + gp.mistakes ? Math.round((gp.correct / (gp.correct + gp.mistakes)) * 100) : 0;
            return (
              <View key={g.id} style={[styles.gameRow, { borderColor: t.border }]}>
                <Text style={{ fontSize: 24 }}>{g.emoji}</Text>
                <Text style={[font.small, { color: t.text, flex: 1 }]}>{g.title}</Text>
                <Text style={[font.small, { color: t.textMuted }]}>مستوى {gp.completed} • دقة {acc}%</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { flexGrow: 1, minWidth: '45%', borderRadius: radius.md, padding: 12, alignItems: 'center' },
  card: { borderRadius: radius.lg, padding: 16 },
  chart: { flexDirection: 'row', height: 160, gap: 6, direction: 'ltr' },
  col: { flex: 1, alignItems: 'center', gap: 4 },
  barTrack: { flex: 1, width: '70%', borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 5 },
  hTrack: { flex: 1, height: 12, borderRadius: 6, overflow: 'hidden' },
  gameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
});
