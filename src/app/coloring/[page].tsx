import { useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/ui/components/Text';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { goBack } from '@/ui/nav';
import { useI18n, type TKey } from '@/i18n';
import { PAGE_BY_ID } from '@/domain/content/coloringPages';
import type { ProgressEvents } from '@/domain/progress';
import { useActiveProfile, useProgress } from '@/data/progressStore';
import { play } from '@/audio/sfx';
import { ColoringCanvas } from '@/ui/coloring/ColoringCanvas';
import { Confetti } from '@/ui/components/Confetti';
import { Pressy } from '@/ui/components/Pressy';
import { Screen } from '@/ui/components/Screen';
import { font, radius, raised, useTheme } from '@/ui/theme/theme';

const toast = { position: 'absolute' as const, top: 100, alignSelf: 'center' as const, borderRadius: radius.pill, paddingHorizontal: 20, paddingVertical: 10 };

export default function ColoringScreen() {
  const { t: tr, backArrow } = useI18n();
  const t = useTheme();
  const { page: pageId, art: artId } = useLocalSearchParams<{ page: string; art?: string }>();
  const p = useActiveProfile();
  const saveArtwork = useProgress((s) => s.saveArtwork);
  const [saved, setSaved] = useState<{ isNew: boolean; events: ProgressEvents } | null>(null);
  const [empty, setEmpty] = useState(false);
  // Once saved, further saves update the same artwork (no duplicate, no repeated points).
  const [savedId, setSavedId] = useState(artId);
  const page = PAGE_BY_ID[pageId];
  if (!page || !p) return <Redirect href="/art" />;
  const initial = artId ? p.artworks.find((a) => a.id === artId) : undefined;

  return (
    <Screen scenery="#F9A8D4" calm>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 }}>
        <Pressy onPress={goBack} accessibilityLabel={tr('common.back')} style={[{ width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' }, raised(t)]}>
          <Text style={{ fontSize: 26, color: t.text }}>{backArrow}</Text>
        </Pressy>
        <Text style={[font.h2, { color: t.text }]}>{page.emoji} {tr(`art.pages.${page.id}` as TKey)}</Text>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        <ColoringCanvas page={page} initial={initial} onSave={(art) => {
          if (!Object.keys(art.fills).length && !art.strokes.length && !art.stickers.length) {
            setEmpty(true); setTimeout(() => setEmpty(false), 2000);
            return;
          }
          const r = saveArtwork({ pageId: page.id, ...art }, savedId);
          setSavedId(r.id);
          setSaved(r);
          play(r.isNew ? 'levelUp' : 'pop');
          setTimeout(() => setSaved(null), 2500);
        }} />
      </View>
      {saved && (
        <>
          {saved.isNew && p.settings.effects && <Confetti count={40} />}
          <View pointerEvents="none" style={[toast, { backgroundColor: t.successBg }]}>
            <Text style={[font.body, { color: t.text }]}>
              {saved.isNew ? tr('art.saved', { emojis: saved.events.achievements.map((a) => a.emoji).join('') }) : tr('art.updated')}
            </Text>
          </View>
        </>
      )}
      {empty && (
        <View pointerEvents="none" style={[toast, { backgroundColor: t.hintBg }]}>
          <Text style={[font.body, { color: t.text }]}>{tr('art.colorFirst')}</Text>
        </View>
      )}
    </Screen>
  );
}
