import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { goBack } from '@/ui/nav';
import Animated, { FadeInDown, BounceIn } from 'react-native-reanimated';
import { useProgress } from '@/data/progressStore';
import { DEFAULT_AVATAR, SKIN_TONES, PALETTE } from '@/domain/rewards/avatar';
import { AvatarView } from '@/ui/components/AvatarView';
import { BigButton } from '@/ui/components/BigButton';
import { Pressy } from '@/ui/components/Pressy';
import { Screen } from '@/ui/components/Screen';
import { font, radius, useTheme } from '@/ui/theme/theme';

/** First launch / new child. No e-mail, no password – just a name and a face. */
export default function Welcome() {
  const t = useTheme();
  const addProfile = useProgress((s) => s.addProfile);
  const hasProfiles = useProgress((s) => Object.keys(s.profiles).length > 0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);

  const start = () => {
    addProfile(name, avatar);
    // From the parent area (add a child) unwind everything back to a clean Home; on first launch replace.
    if (router.canDismiss()) router.dismissTo('/');
    else router.replace('/');
  };

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
        <Animated.Text entering={BounceIn.duration(900)} style={{ fontSize: 72 }}>🧠</Animated.Text>
        <Animated.Text entering={FadeInDown.delay(200)} style={[font.title, { color: t.text }]}>ألعاب العقل</Animated.Text>
        <Animated.View entering={FadeInDown.delay(400)} style={{ alignItems: 'center' }}>
          <AvatarView avatar={avatar} size={140} />
          <View style={styles.row}>
            {SKIN_TONES.map((c) => (
              <Pressy key={c} onPress={() => setAvatar({ ...avatar, skin: c })} style={[styles.sw, { backgroundColor: c, borderColor: avatar.skin === c ? t.primary : 'transparent' }]} />
            ))}
          </View>
          <View style={styles.row}>
            {PALETTE.slice(0, 7).map((c) => (
              <Pressy key={c} onPress={() => setAvatar({ ...avatar, outfitColor: c })} style={[styles.sw, { backgroundColor: c, borderColor: avatar.outfitColor === c ? t.primary : 'transparent' }]} />
            ))}
          </View>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600)} style={{ alignSelf: 'stretch' }}>
          <Text style={[font.body, { color: t.textMuted, textAlign: 'center', marginBottom: 8 }]}>ما اسمك؟</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            maxLength={20}
            placeholder="اكتب اسمك هنا"
            placeholderTextColor={t.textMuted}
            style={[styles.input, { backgroundColor: t.card, color: t.text, borderColor: t.border }]}
            returnKeyType="done"
            onSubmitEditing={start}
          />
          <BigButton label="هيا نلعب!" icon="🚀" onPress={start} style={{ marginTop: 16 }} />
          {hasProfiles && <BigButton small label="رجوع" color={t.card} textColor={t.text} onPress={goBack} style={{ marginTop: 10 }} />}
        </Animated.View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  row: { flexDirection: 'row', gap: 8, marginTop: 10 },
  sw: { width: 36, height: 36, borderRadius: 18, borderWidth: 3 },
  input: { borderWidth: 2, borderRadius: radius.pill, paddingHorizontal: 20, height: 60, fontSize: 22, textAlign: 'center' },
});
