import { useState } from 'react';
import { Text, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { PAGE_BY_ID } from '@/domain/content/coloringPages';
import type { ProgressEvents } from '@/domain/progress';
import { useActiveProfile, useProgress } from '@/data/progressStore';
import { play } from '@/audio/sfx';
import { ColoringCanvas } from '@/ui/coloring/ColoringCanvas';
import { Confetti } from '@/ui/components/Confetti';
import { Pressy } from '@/ui/components/Pressy';
import { Screen } from '@/ui/components/Screen';
import { font, radius, useTheme } from '@/ui/theme/theme';

export default function ColoringScreen() {
  const t = useTheme();
  const { page: pageId, art: artId } = useLocalSearchParams<{ page: string; art?: string }>();
  const p = useActiveProfile();
  const saveArtwork = useProgress((s) => s.saveArtwork);
  const [saved, setSaved] = useState<ProgressEvents | null>(null);
  const page = PAGE_BY_ID[pageId];
  if (!page || !p) return <Redirect href="/art" />;
  const initial = artId ? p.artworks.find((a) => a.id === artId) : undefined;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 }}>
        <Pressy onPress={() => router.back()} accessibilityLabel="رجوع" style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: t.card, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 26, color: t.text }}>→</Text>
        </Pressy>
        <Text style={[font.h2, { color: t.text }]}>{page.emoji} {page.title}</Text>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        <ColoringCanvas page={page} initial={initial} onSave={(art) => {
          setSaved(saveArtwork({ pageId: page.id, ...art }));
          play('levelUp');
          setTimeout(() => setSaved(null), 2500);
        }} />
      </View>
      {saved && (
        <>
          {p.settings.effects && <Confetti count={40} />}
          <View pointerEvents="none" style={{ position: 'absolute', top: 100, alignSelf: 'center', backgroundColor: t.successBg, borderRadius: radius.pill, paddingHorizontal: 20, paddingVertical: 10 }}>
            <Text style={[font.body, { color: t.text }]}>حُفظت اللوحة في معرضك! +٥ 💎 {saved.achievements.map((a) => a.emoji).join('')}</Text>
          </View>
        </>
      )}
    </Screen>
  );
}
