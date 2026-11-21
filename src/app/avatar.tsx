import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { goBack } from '@/ui/nav';
import { AVATAR_OPTIONS, PALETTE, SKIN_TONES, isUnlocked, type AvatarPart } from '@/domain/rewards/avatar';
import { useActiveProfile, useProgress } from '@/data/progressStore';
import { AvatarView } from '@/ui/components/AvatarView';
import { BigButton } from '@/ui/components/BigButton';
import { Pressy } from '@/ui/components/Pressy';
import { Screen } from '@/ui/components/Screen';
import { font, radius, useTheme } from '@/ui/theme/theme';

const PART_AR: Record<AvatarPart, string> = { body: 'الشكل', hair: 'الشعر', outfit: 'الملابس', pattern: 'النقشة', accessory: 'إكسسوار' };

function Swatches({ colors, value, onPick }: { colors: string[]; value: string; onPick: (c: string) => void }) {
  const t = useTheme();
  return (
    <View style={styles.wrap}>
      {colors.map((c) => <Pressy key={c} onPress={() => onPick(c)} style={[styles.sw, { backgroundColor: c, borderColor: value === c ? t.primary : t.border }]} />)}
    </View>
  );
}

export default function AvatarEditor() {
  const t = useTheme();
  const p = useActiveProfile();
  const setAvatar = useProgress((s) => s.setAvatar);
  const [a, setA] = useState(p?.avatar);
  if (!p || !a) return null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, alignItems: 'stretch' }}>
        <View style={{ alignItems: 'center' }}><AvatarView avatar={a} size={180} /></View>
        <Text style={[font.small, { color: t.textMuted, textAlign: 'center' }]}>💎 {p.points} – العناصر المقفلة تُفتح بجمع النقاط</Text>
        {(Object.keys(AVATAR_OPTIONS) as AvatarPart[]).map((part) => (
          <View key={part} style={{ marginTop: 14 }}>
            <Text style={[font.body, { color: t.text }]}>{PART_AR[part]}</Text>
            <View style={styles.wrap}>
              {AVATAR_OPTIONS[part].map((o) => {
                const open = isUnlocked(o, p.points);
                const active = a[part] === o.id;
                return (
                  <Pressy key={o.id} disabled={!open} onPress={() => setA({ ...a, [part]: o.id })}
                    style={[styles.opt, { backgroundColor: active ? t.primary : t.card, opacity: open ? 1 : 0.5 }]}>
                    <Text style={[font.small, { color: active ? t.primaryText : t.text }]}>{open ? o.label : `🔒 ${o.minPoints}`}</Text>
                  </Pressy>
                );
              })}
            </View>
          </View>
        ))}
        <Text style={[font.body, { color: t.text, marginTop: 14 }]}>لون البشرة</Text>
        <Swatches colors={SKIN_TONES} value={a.skin} onPick={(skin) => setA({ ...a, skin })} />
        <Text style={[font.body, { color: t.text, marginTop: 14 }]}>لون الشعر</Text>
        <Swatches colors={PALETTE} value={a.hairColor} onPick={(hairColor) => setA({ ...a, hairColor })} />
        <Text style={[font.body, { color: t.text, marginTop: 14 }]}>لون الملابس</Text>
        <Swatches colors={PALETTE} value={a.outfitColor} onPick={(outfitColor) => setA({ ...a, outfitColor })} />
        <BigButton label="حفظ" icon="✅" color={t.success} onPress={() => { setAvatar(a); goBack(); }} style={{ marginTop: 24 }} />
        <BigButton small label="إلغاء" color={t.card} textColor={t.text} onPress={goBack} style={{ marginTop: 10 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  opt: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.pill, minHeight: 48, justifyContent: 'center' },
  sw: { width: 44, height: 44, borderRadius: 22, borderWidth: 3 },
});
