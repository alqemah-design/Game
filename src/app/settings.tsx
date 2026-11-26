import { useState, type ReactNode } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { Text } from '@/ui/components/Text';
import { router } from 'expo-router';
import { ALPHABET } from '@/domain/content/englishWords';
import type { Difficulty, MathOp } from '@/domain/types';
import { useActiveProfile, useProgress } from '@/data/progressStore';
import { clearParentPass, hasParentPass } from '@/data/parentGate';
import { ParentalGate } from '@/ui/components/ParentalGate';
import { goBack } from '@/ui/nav';
import { useI18n, type LanguagePref } from '@/i18n';
import { minutesLeftToday, weeklyReport } from '@/domain/progress';
import { checkArabicVoice, useArabicVoice } from '@/audio/speech';
import { AvatarView } from '@/ui/components/AvatarView';
import { BigButton } from '@/ui/components/BigButton';
import { Pressy } from '@/ui/components/Pressy';
import { Screen } from '@/ui/components/Screen';
import { font, radius, raised, useTheme } from '@/ui/theme/theme';

function Section({ title, children }: { title: string; children: ReactNode }) {
  const t = useTheme();
  return (
    <View style={[styles.section, raised(t)]}>
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

/** This week at a glance, with what to practise together. */
function WeeklyReportCard() {
  const { t: tr } = useI18n();
  const t = useTheme();
  const p = useActiveProfile();
  const [now] = useState(() => Date.now());
  if (!p) return null;
  const r = weeklyReport(p, now);
  const left = minutesLeftToday(p, now);
  const tile = (emoji: string, value: string | number, label: string) => (
    <View style={[styles.stat, raised(t, t.cardAlt)]}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={[font.h2, { color: t.text }]}>{value}</Text>
      <Text style={[font.small, { color: t.textMuted, fontSize: 12 }]}>{label}</Text>
    </View>
  );
  return (
    <Section title={tr('settings.report', { name: p.name })}>
      <View style={styles.stats}>
        {tile('⏱️', r.minutes, tr('settings.minutesPlayed'))}
        {tile('📅', `${r.activeDays}/7`, tr('settings.activeDays'))}
        {tile('🎯', r.levels, tr('settings.levels'))}
        {tile('⭐', r.stars, tr('settings.stars'))}
      </View>
      {p.settings.dailyLimitMin > 0 && <Text style={[font.small, { color: t.textMuted, marginTop: 8 }]}>{tr('settings.leftToday', { count: Math.ceil(left) })}</Text>}
      {r.strong.length > 0 && (
        <Text style={[font.body, { color: t.text, marginTop: 10 }]}>{tr('settings.strong', { games: r.strong.slice(0, 3).map((id) => tr(`games.${id}.title`)).join(tr('common.listSep')) })}</Text>
      )}
      {r.practice.length > 0 ? (
        <Text style={[font.body, { color: t.text, marginTop: 6 }]}>{tr('settings.practice', { games: r.practice.slice(0, 3).map((id) => tr(`games.${id}.title`)).join(tr('common.listSep')) })}</Text>
      ) : r.levels > 0 ? (
        <Text style={[font.small, { color: t.textMuted, marginTop: 6 }]}>{tr('settings.noStruggle')}</Text>
      ) : (
        <Text style={[font.small, { color: t.textMuted, marginTop: 6 }]}>{tr('settings.notPlayed', { name: p.name })}</Text>
      )}
    </Section>
  );
}

/** Tells parents whether the device can speak Arabic, and how to fix it if not. */
function VoiceStatus() {
  const { t: tr } = useI18n();
  const t = useTheme();
  const ok = useArabicVoice();
  if (ok === null) return null;
  return (
    <View style={[styles.voice, { backgroundColor: ok ? t.successBg : t.hintBg }]}>
      <Text style={[font.body, { color: t.text }]}>{tr(ok ? 'settings.voiceOk' : 'settings.voiceMissing')}</Text>
      {!ok && (
        <>
          <Text style={[font.small, { color: t.text, lineHeight: 22, marginTop: 6 }]}>
            {tr('settings.voiceHelp')}
          </Text>
          <BigButton small label={tr('settings.recheck')} icon="↻" color={t.card} textColor={t.text} onPress={() => { checkArabicVoice(); }} style={{ marginTop: 8, alignSelf: 'flex-start' }} />
        </>
      )}
    </View>
  );
}

/** Parent area – only reachable through the parental gate on the home screen. */
export default function Settings() {
  const { t: tr } = useI18n();
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
    Alert.alert(title, msg, [{ text: tr('common.cancel'), style: 'cancel' }, { text: tr('common.confirm'), style: 'destructive', onPress: action }]);
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
    <Screen edges={['top', 'bottom', 'left', 'right']} scenery="#CBD5E1" calm>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <View style={styles.row}>
          <Text style={[font.title, { color: t.text, flex: 1 }]}>{tr('settings.title')}</Text>
          <BigButton small label={tr('common.done')} onPress={() => { clearParentPass(); goBack(); }} />
        </View>

        <Section title={tr('settings.children')}>
          {Object.values(s.profiles).map((c) => (
            <Pressy key={c.id} onPress={() => s.switchProfile(c.id)} style={[styles.child, { backgroundColor: c.id === p.id ? t.successBg : t.cardAlt }]}>
              <AvatarView avatar={c.avatar} size={44} />
              <Text style={[font.body, { color: t.text, flex: 1 }]}>{c.name}</Text>
              <Text style={[font.small, { color: t.textMuted }]}>⭐ {c.stars}</Text>
              {c.id === p.id && <Text>✅</Text>}
            </Pressy>
          ))}
          <BigButton small label={tr('settings.addChild')} icon="➕" color={t.cardAlt} textColor={t.text} onPress={() => router.push('/welcome')} style={{ marginTop: 8 }} />
          <View style={[styles.row, { marginTop: 12 }]}>
            <TextInput value={name} onChangeText={setName} maxLength={20} style={[styles.input, { color: t.text, borderColor: t.border, backgroundColor: t.bg }]} />
            <BigButton small label={tr('settings.saveName')} onPress={() => s.renameProfile(name)} />
          </View>
        </Section>

        <WeeklyReportCard />

        <Section title={tr('settings.language')}>
          <Chips<LanguagePref> options={[['ar', 'العربية'], ['en', 'English'], ['system', tr('settings.langSystem')]]} value={s.language} onPick={s.setLanguage} />
          <Text style={[font.small, { color: t.textMuted, marginTop: 6 }]}>{tr('settings.languageNote')}</Text>
        </Section>

        <Section title={tr('settings.dailyTime')}>
          <Chips<string> options={[['0', tr('settings.noLimit')], ['15', tr('settings.minutesShort', { count: 15 })], ['30', tr('settings.minutesShort', { count: 30 })], ['45', tr('settings.minutesShort', { count: 45 })], ['60', tr('settings.hour')]]} value={String(st.dailyLimitMin)} onPick={(v) => set({ dailyLimitMin: Number(v) })} />
          <Text style={[font.small, { color: t.textMuted, marginTop: 6 }]}>
            {tr('settings.dailyNote')}
          </Text>
        </Section>

        <Section title={tr('settings.soundEffects')}>
          <VoiceStatus />
          <Toggle label={tr('settings.sounds')} value={st.sound} onChange={(v) => set({ sound: v })} />
          <Toggle label={tr('settings.haptics')} value={st.haptics} onChange={(v) => set({ haptics: v })} />
          <Toggle label={tr('settings.effects')} value={st.effects} onChange={(v) => set({ effects: v })} />
          <Text style={[font.body, { color: t.text, marginTop: 8 }]}>{tr('settings.appearance')}</Text>
          <Chips<'system' | 'light' | 'dark'> options={[['system', tr('settings.themeSystem')], ['light', tr('settings.themeLight')], ['dark', tr('settings.themeDark')]]} value={s.colorScheme} onPick={s.setColorScheme} />
        </Section>

        <Section title={tr('settings.difficulty')}>
          <Chips<Difficulty> options={[['easy', tr('settings.easy')], ['normal', tr('settings.normal')], ['hard', tr('settings.hard')]]} value={st.difficulty} onPick={(d) => set({ difficulty: d })} />
          <Text style={[font.small, { color: t.textMuted, marginTop: 6 }]}>{tr('settings.difficultyNote')}</Text>
          <Toggle label={tr('settings.noTimers')} value={st.noTimers} onChange={(v) => set({ noTimers: v })} />
          <Toggle label={tr('settings.adaptive')} value={st.adaptive} onChange={(v) => set({ adaptive: v })} />
          <Text style={[font.small, { color: t.textMuted }]}>{tr('settings.adaptiveNote')}</Text>
        </Section>

        <Section title={tr('settings.math')}>
          <Chips<MathOp> options={[['+', tr('settings.add')], ['-', tr('settings.subtract')], ['×', tr('settings.multiply')]]} value={st.math.ops} onPick={toggleOp} />
          {(['min', 'max'] as const).map((k) => (
            <View key={k} style={styles.row}>
              <Text style={[font.body, { color: t.text, flex: 1 }]}>{tr(k === 'min' ? 'settings.minNumber' : 'settings.maxNumber')}</Text>
              <BigButton small label="−" onPress={() => range(k, -5)} color={t.cardAlt} textColor={t.text} />
              <Text style={[font.h2, { color: t.text, width: 64, textAlign: 'center' }]}>{st.math[k]}</Text>
              <BigButton small label="+" onPress={() => range(k, 5)} color={t.cardAlt} textColor={t.text} />
            </View>
          ))}
        </Section>

        <Section title={tr('settings.focusLetters')}>
          <Text style={[font.small, { color: t.textMuted }]}>{tr('settings.focusNote')}</Text>
          <View style={[styles.chips, { direction: 'ltr' }]}>
            {ALPHABET.map((l) => (
              <Pressy key={l} onPress={() => toggleLetter(l)} style={[styles.letter, { backgroundColor: st.focusLetters.includes(l) ? t.primary : t.cardAlt }]}>
                <Text style={[font.body, { color: st.focusLetters.includes(l) ? t.primaryText : t.text }]}>{l}</Text>
              </Pressy>
            ))}
          </View>
        </Section>

        <Section title={tr('settings.privacy')}>
          <Text style={[font.small, { color: t.textMuted, lineHeight: 22 }]}>
            {tr('settings.privacyText')}
          </Text>
        </Section>

        <Section title={tr('settings.data')}>
          <BigButton small label={tr('settings.resetChild', { name: p.name })} color={t.hintBg} textColor={t.text}
            onPress={() => confirm(tr('settings.resetTitle'), tr('settings.resetMsg'), s.resetProgress)} />
          <BigButton small label={tr('settings.deleteChild', { name: p.name })} color={t.soft} textColor={t.text} style={{ marginTop: 8 }}
            onPress={() => confirm(tr('settings.deleteTitle'), tr('settings.deleteMsg'), () => { s.deleteProfile(p.id); router.replace('/'); })} />
          <BigButton small label={tr('settings.wipe')} color="#DC2626" style={{ marginTop: 8 }}
            onPress={() => confirm(tr('settings.wipeTitle'), tr('settings.wipeMsg'), () => { s.wipeEverything(); router.replace('/welcome'); })} />
        </Section>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: { flexGrow: 1, minWidth: '22%', alignItems: 'center', borderRadius: radius.md, padding: 8 },
  voice: { borderRadius: radius.md, padding: 12, marginBottom: 8 },
  section: { borderRadius: radius.lg, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 52 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.pill, minHeight: 44, justifyContent: 'center' },
  letter: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  child: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: radius.md, marginBottom: 6 },
  input: { fontFamily: 'Tajawal_700Bold', flex: 1, minWidth: 0, borderWidth: 2, borderRadius: radius.pill, paddingHorizontal: 16, height: 48, fontSize: 18 },
});
