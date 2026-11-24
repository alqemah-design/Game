import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/ui/components/Text';
import { goBack } from '@/ui/nav';
import { AVATAR_OPTIONS, HAIR_COLORS, KIND_AR, PALETTE, SKIN_TONES, isUnlocked, optionsFor, withKind, type AvatarKind, type AvatarPart } from '@/domain/rewards/avatar';
import { useActiveProfile, useProgress } from '@/data/progressStore';
import { AvatarView } from '@/ui/components/AvatarView';
import { BigButton } from '@/ui/components/BigButton';
import { Pressy } from '@/ui/components/Pressy';
import { Screen } from '@/ui/components/Screen';
import { font, radius, raised, useTheme } from '@/ui/theme/theme';

const PART_AR: Record<AvatarPart, string> = { hair: 'الشعر', outfit: 'الملابس', pattern: 'النقشة', accessory: 'إكسسوار' };

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
    <Screen scenery="#C4B5FD">
      <ScrollView contentContainerStyle={{ padding: 16, alignItems: 'stretch' }}>
        <View style={{ alignItems: 'center' }}><AvatarView avatar={a} size={180} /></View>
        <Text style={[font.small, { color: t.textMuted, textAlign: 'center' }]}>💎 {p.points} – العناصر المقفلة تُفتح بجمع النقاط</Text>
        <View style={[styles.wrap, { justifyContent: 'center', marginTop: 12 }]}>
          {(['boy', 'girl'] as AvatarKind[]).map((k) => (
            <Pressy key={k} onPress={() => setA(withKind(a, k))} style={[styles.opt, raised(t, a.kind === k ? t.primary : t.card), { minWidth: 110, alignItems: 'center' }]}>
              <Text style={[font.body, { color: a.kind === k ? t.primaryText : t.text }]}>{k === 'boy' ? '👦' : '👧'} {KIND_AR[k]}</Text>
            </Pressy>
          ))}
        </View>
        {(Object.keys(AVATAR_OPTIONS) as AvatarPart[]).map((part) => (
          <View key={part} style={{ marginTop: 14 }}>
            <Text style={[font.body, { color: t.text }]}>{PART_AR[part]}</Text>
            <View style={styles.wrap}>
              {optionsFor(part, a.kind).map((o) => {
                const open = isUnlocked(o, p.points);
                const active = a[part] === o.id;
                return (
                  <Pressy key={o.id} disabled={!open} onPress={() => setA({ ...a, [part]: o.id })}
                    style={[styles.opt, raised(t, active ? t.primary : t.card), { opacity: open ? 1 : 0.55 }]}>
                    <Text style={[font.small, { color: active ? t.primaryText : t.text }]}>{open ? o.label : `🔒 ${o.label} · ${o.minPoints}`}</Text>
                  </Pressy>
                );
              })}
            </View>
          </View>
        ))}
        <Text style={[font.body, { color: t.text, marginTop: 14 }]}>لون البشرة</Text>
        <Swatches colors={SKIN_TONES} value={a.skin} onPick={(skin) => setA({ ...a, skin })} />
        <Text style={[font.body, { color: t.text, marginTop: 14 }]}>{a.hair === 'hijab' ? 'لون الحجاب' : 'لون الشعر'}</Text>
        <Swatches colors={a.hair === 'hijab' ? PALETTE : HAIR_COLORS} value={a.hairColor} onPick={(hairColor) => setA({ ...a, hairColor })} />
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
