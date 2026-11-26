import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/ui/components/Text';
import { router } from 'expo-router';
import { COLORING_PAGES } from '@/domain/content/coloringPages';
import { ACHIEVEMENTS, unlockedColoringPages } from '@/domain/rewards/rewards';
import { useActiveProfile, useProgress } from '@/data/progressStore';
import { useI18n, type TKey } from '@/i18n';
import { ArtThumb } from '@/ui/coloring/ArtThumb';
import { Pressy } from '@/ui/components/Pressy';
import { Screen } from '@/ui/components/Screen';
import { font, radius, raised, useTheme } from '@/ui/theme/theme';

export default function Art() {
  const { t: tr } = useI18n();
  const t = useTheme();
  const p = useActiveProfile()!;
  const deleteArtwork = useProgress((s) => s.deleteArtwork);
  const unlocked = unlockedColoringPages(p.achievements);

  return (
    <Screen scenery="#F9A8D4">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={[font.title, { color: t.text }]}>{tr('art.title')}</Text>
        <Text style={[font.body, { color: t.textMuted, marginVertical: 8 }]}>{tr('art.choosePage')}</Text>
        <View style={styles.grid}>
          {COLORING_PAGES.map((page) => {
            const open = unlocked.includes(page.id);
            const how = ACHIEVEMENTS.find((a) => a.unlocks?.kind === 'coloringPage' && a.unlocks.id === page.id);
            return (
              <Pressy key={page.id} disabled={!open} accessibilityLabel={open ? tr(`art.pages.${page.id}` as TKey) : tr('art.locked', { how: how ? tr(`achievements.${how.id}.desc` as TKey) : '' })}
                onPress={() => router.push({ pathname: '/coloring/[page]', params: { page: page.id } })}
                style={[styles.page, raised(t, open ? t.card : t.cardAlt), { opacity: open ? 1 : 0.7 }]}>
                <Text style={{ fontSize: 48 }}>{open ? page.emoji : '🔒'}</Text>
                <Text style={[font.small, { color: t.text }]}>{tr(`art.pages.${page.id}` as TKey)}</Text>
                {!open && how && <Text style={[font.small, { color: t.textMuted, fontSize: 11, textAlign: 'center' }]}>{tr(`achievements.${how.id}.desc` as TKey)}</Text>}
              </Pressy>
            );
          })}
        </View>

        <Text style={[font.h2, { color: t.text, marginTop: 24, marginBottom: 8 }]}>{tr('art.gallery')}</Text>
        {p.artworks.length === 0 && <Text style={[font.body, { color: t.textMuted }]}>{tr('art.galleryEmpty')}</Text>}
        <View style={styles.grid}>
          {p.artworks.map((a) => (
            <Pressy key={a.id} style={[styles.art, { backgroundColor: '#FFF' }]}
              onPress={() => router.push({ pathname: '/coloring/[page]', params: { page: a.pageId, art: a.id } })}
              onLongPress={() => Alert.alert(tr('art.deleteTitle'), '', [{ text: tr('common.cancel'), style: 'cancel' }, { text: tr('common.delete'), style: 'destructive', onPress: () => deleteArtwork(a.id) }])}>
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
