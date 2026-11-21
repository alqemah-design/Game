import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { COLORING_PAGES } from '@/domain/content/coloringPages';
import { ACHIEVEMENTS, unlockedColoringPages } from '@/domain/rewards/rewards';
import { useActiveProfile, useProgress } from '@/data/progressStore';
import { ArtThumb } from '@/ui/coloring/ArtThumb';
import { Pressy } from '@/ui/components/Pressy';
import { Screen } from '@/ui/components/Screen';
import { font, radius, useTheme } from '@/ui/theme/theme';

export default function Art() {
  const t = useTheme();
  const p = useActiveProfile()!;
  const deleteArtwork = useProgress((s) => s.deleteArtwork);
  const unlocked = unlockedColoringPages(p.achievements);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={[font.title, { color: t.text }]}>التلوين الإبداعي 🎨</Text>
        <Text style={[font.body, { color: t.textMuted, marginVertical: 8 }]}>اختر صفحة</Text>
        <View style={styles.grid}>
          {COLORING_PAGES.map((page) => {
            const open = unlocked.includes(page.id);
            const how = ACHIEVEMENTS.find((a) => a.unlocks?.kind === 'coloringPage' && a.unlocks.id === page.id);
            return (
              <Pressy key={page.id} disabled={!open} accessibilityLabel={open ? page.title : `مقفلة: ${how?.description}`}
                onPress={() => router.push({ pathname: '/coloring/[page]', params: { page: page.id } })}
                style={[styles.page, { backgroundColor: open ? t.card : t.cardAlt, opacity: open ? 1 : 0.6 }]}>
                <Text style={{ fontSize: 48 }}>{open ? page.emoji : '🔒'}</Text>
                <Text style={[font.small, { color: t.text }]}>{page.title}</Text>
                {!open && how && <Text style={[font.small, { color: t.textMuted, fontSize: 11, textAlign: 'center' }]}>{how.description}</Text>}
              </Pressy>
            );
          })}
        </View>

        <Text style={[font.h2, { color: t.text, marginTop: 24, marginBottom: 8 }]}>معرضي 🖼️</Text>
        {p.artworks.length === 0 && <Text style={[font.body, { color: t.textMuted }]}>لوحاتك المحفوظة ستظهر هنا</Text>}
        <View style={styles.grid}>
          {p.artworks.map((a) => (
            <Pressy key={a.id} style={[styles.art, { backgroundColor: '#FFF' }]}
              onPress={() => router.push({ pathname: '/coloring/[page]', params: { page: a.pageId, art: a.id } })}
              onLongPress={() => Alert.alert('حذف اللوحة؟', '', [{ text: 'إلغاء', style: 'cancel' }, { text: 'حذف', style: 'destructive', onPress: () => deleteArtwork(a.id) }])}>
              <ArtThumb art={a} size={140} />
            </Pressy>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-start' },
  page: { width: 104, height: 128, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', padding: 6 },
  art: { borderRadius: radius.md, overflow: 'hidden', padding: 4 },
});
