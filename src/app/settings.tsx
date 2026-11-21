import { useState, type ReactNode } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { ALPHABET } from '@/domain/content/englishWords';
import type { Difficulty, MathOp } from '@/domain/types';
import { useActiveProfile, useProgress } from '@/data/progressStore';
import { clearParentPass, hasParentPass } from '@/data/parentGate';
import { ParentalGate } from '@/ui/components/ParentalGate';
import { goBack } from '@/ui/nav';
import { AvatarView } from '@/ui/components/AvatarView';
import { BigButton } from '@/ui/components/BigButton';
import { Pressy } from '@/ui/components/Pressy';
import { Screen } from '@/ui/components/Screen';
import { font, radius, useTheme } from '@/ui/theme/theme';

function Section({ title, children }: { title: string; children: ReactNode }) {
  const t = useTheme();
  return (
    <View style={[styles.section, { backgroundColor: t.card }]}>
      <Text style={[font.h2, { color: t.text, marginBottom: 8 }]}>{title}</Text>
      {children}
    </View>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const t = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[font.body, { color: t.text, flex: 1 }]}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: t.primary }} />
    </View>
  );
}

function Chips<T extends string>({ options, value, onPick }: { options: [T, string][]; value: T | T[]; onPick: (v: T) => void }) {
  const t = useTheme();
  const active = (v: T) => (Array.isArray(value) ? value.includes(v) : value === v);
  return (
    <View style={styles.chips}>
      {options.map(([v, label]) => (
        <Pressy key={v} onPress={() => onPick(v)} style={[styles.chip, { backgroundColor: active(v) ? t.primary : t.cardAlt }]}>
          <Text style={[font.small, { color: active(v) ? t.primaryText : t.text }]}>{label}</Text>
        </Pressy>
      ))}
    </View>
  );
}

/** Parent area – only reachable through the parental gate on the home screen. */
export default function Settings() {
  const t = useTheme();
  const p = useActiveProfile();
  const s = useProgress();
  const [name, setName] = useState(p?.name ?? '');
  const [unlocked, setUnlocked] = useState(hasParentPass);
  if (!p) return null;
  if (!unlocked) {
    // Reached without passing the gate (deep link etc.): ask here.
    return (
      <Screen>
        <ParentalGate visible onPass={() => setUnlocked(true)} onCancel={goBack} />
      </Screen>
    );
  }
  const set = s.updateSettings;
  const st = p.settings;

  const confirm = (title: string, msg: string, action: () => void) =>
    Alert.alert(title, msg, [{ text: 'إلغاء', style: 'cancel' }, { text: 'تأكيد', style: 'destructive', onPress: action }]);
  const toggleOp = (op: MathOp) => {
    const ops = st.math.ops.includes(op) ? st.math.ops.filter((o) => o !== op) : [...st.math.ops, op];
    if (ops.length) set({ math: { ...st.math, ops } });
  };
  const toggleLetter = (l: string) =>
    set({ focusLetters: st.focusLetters.includes(l) ? st.focusLetters.filter((x) => x !== l) : [...st.focusLetters, l] });
  const range = (k: 'min' | 'max', d: number) => {
    const v = Math.max(0, Math.min(1000, st.math[k] + d));
    if (k === 'min' ? v < st.math.max : v > st.math.min) set({ math: { ...st.math, [k]: v } });
  };

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <View style={styles.row}>
          <Text style={[font.title, { color: t.text, flex: 1 }]}>إعدادات الأهل</Text>
          <BigButton small label="تم" onPress={() => { clearParentPass(); goBack(); }} />
        </View>

        <Section title="الأطفال">
          {Object.values(s.profiles).map((c) => (
            <Pressy key={c.id} onPress={() => s.switchProfile(c.id)} style={[styles.child, { backgroundColor: c.id === p.id ? t.successBg : t.cardAlt }]}>
              <AvatarView avatar={c.avatar} size={44} />
              <Text style={[font.body, { color: t.text, flex: 1 }]}>{c.name}</Text>
              <Text style={[font.small, { color: t.textMuted }]}>⭐ {c.stars}</Text>
              {c.id === p.id && <Text>✅</Text>}
            </Pressy>
          ))}
          <BigButton small label="إضافة طفل" icon="➕" color={t.cardAlt} textColor={t.text} onPress={() => router.push('/welcome')} style={{ marginTop: 8 }} />
          <View style={[styles.row, { marginTop: 12 }]}>
            <TextInput value={name} onChangeText={setName} maxLength={20} style={[styles.input, { color: t.text, borderColor: t.border, backgroundColor: t.bg }]} />
            <BigButton small label="تغيير الاسم" onPress={() => s.renameProfile(name)} />
          </View>
        </Section>

        <Section title="الصوت والمؤثرات">
          <Toggle label="الأصوات والنطق" value={st.sound} onChange={(v) => set({ sound: v })} />
          <Toggle label="الاهتزاز" value={st.haptics} onChange={(v) => set({ haptics: v })} />
          <Toggle label="الاحتفالات المتحركة" value={st.effects} onChange={(v) => set({ effects: v })} />
          <Text style={[font.body, { color: t.text, marginTop: 8 }]}>المظهر</Text>
          <Chips<'system' | 'light' | 'dark'> options={[['system', 'تلقائي'], ['light', 'نهاري'], ['dark', 'ليلي']]} value={s.colorScheme} onPick={s.setColorScheme} />
        </Section>

        <Section title="الصعوبة">
          <Chips<Difficulty> options={[['easy', 'سهل'], ['normal', 'عادي'], ['hard', 'صعب']]} value={st.difficulty} onPick={(d) => set({ difficulty: d })} />
          <Text style={[font.small, { color: t.textMuted, marginTop: 6 }]}>تُطبَّق على كل الألعاب.</Text>
          <Toggle label="بلا مؤقتات (وقت مفتوح)" value={st.noTimers} onChange={(v) => set({ noTimers: v })} />
        </Section>

        <Section title="تحدي الرياضيات">
          <Chips<MathOp> options={[['+', 'جمع +'], ['-', 'طرح −'], ['×', 'ضرب ×']]} value={st.math.ops} onPick={toggleOp} />
          {(['min', 'max'] as const).map((k) => (
            <View key={k} style={styles.row}>
              <Text style={[font.body, { color: t.text, flex: 1 }]}>{k === 'min' ? 'أصغر رقم' : 'أكبر رقم'}</Text>
              <BigButton small label="−" onPress={() => range(k, -5)} color={t.cardAlt} textColor={t.text} />
              <Text style={[font.h2, { color: t.text, width: 64, textAlign: 'center' }]}>{st.math[k]}</Text>
              <BigButton small label="+" onPress={() => range(k, 5)} color={t.cardAlt} textColor={t.text} />
            </View>
          ))}
        </Section>

        <Section title="حروف التركيز (تعلم الحروف)">
          <Text style={[font.small, { color: t.textMuted }]}>اختر حرفين أو أكثر للتركيز عليها، أو اتركها فارغة لكل الحروف.</Text>
          <View style={[styles.chips, { direction: 'ltr' }]}>
            {ALPHABET.map((l) => (
              <Pressy key={l} onPress={() => toggleLetter(l)} style={[styles.letter, { backgroundColor: st.focusLetters.includes(l) ? t.primary : t.cardAlt }]}>
                <Text style={[font.body, { color: st.focusLetters.includes(l) ? t.primaryText : t.text }]}>{l}</Text>
              </Pressy>
            ))}
          </View>
        </Section>

        <Section title="الخصوصية">
          <Text style={[font.small, { color: t.textMuted, lineHeight: 22 }]}>
            لا حساب، لا إعلانات، لا تتبع، ولا اتصال بالإنترنت. كل البيانات محفوظة على هذا الجهاز فقط وتُحذف بحذف التطبيق.
          </Text>
        </Section>

        <Section title="البيانات">
          <BigButton small label={`إعادة تقدم ${p.name}`} color={t.hintBg} textColor={t.text}
            onPress={() => confirm('إعادة التقدم؟', 'ستعود كل المستويات والنقاط إلى البداية.', s.resetProgress)} />
          <BigButton small label={`حذف ${p.name}`} color={t.soft} textColor={t.text} style={{ marginTop: 8 }}
            onPress={() => confirm('حذف ملف الطفل؟', 'سيُحذف الملف وكل لوحاته.', () => { s.deleteProfile(p.id); router.replace('/'); })} />
          <BigButton small label="حذف كل البيانات" color="#DC2626" style={{ marginTop: 8 }}
            onPress={() => confirm('حذف كل شيء؟', 'سيُحذف كل الأطفال والتقدم واللوحات من هذا الجهاز.', () => { s.wipeEverything(); router.replace('/welcome'); })} />
        </Section>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { borderRadius: radius.lg, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 52 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.pill, minHeight: 44, justifyContent: 'center' },
  letter: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  child: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: radius.md, marginBottom: 6 },
  input: { flex: 1, borderWidth: 2, borderRadius: radius.pill, paddingHorizontal: 16, height: 48, fontSize: 18 },
});
