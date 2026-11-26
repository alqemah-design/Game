import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/ui/components/Text';
import { router } from 'expo-router';
import { goBack } from '@/ui/nav';
import Animated, { FadeInDown, BounceIn } from 'react-native-reanimated';
import { useProgress } from '@/data/progressStore';
import { AVATAR_KINDS, DEFAULT_AVATARS, SKIN_TONES, PALETTE, withKind } from '@/domain/rewards/avatar';
import { useI18n } from '@/i18n';
import { AvatarView } from '@/ui/components/AvatarView';
import { BigButton } from '@/ui/components/BigButton';
import { Pressy } from '@/ui/components/Pressy';
import { Screen } from '@/ui/components/Screen';
import { font, radius, raised, useTheme } from '@/ui/theme/theme';
import { Owl } from '@/ui/components/Owl';

/** First launch / new child. No e-mail, no password – just a name and a face. */
export default function Welcome() {
  const { t: tr } = useI18n();
  const t = useTheme();
  const addProfile = useProgress((s) => s.addProfile);
  const hasProfiles = useProgress((s) => Object.keys(s.profiles).length > 0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATARS.boy);

  const start = () => {
    addProfile(name.trim() || tr('welcome.defaultName'), avatar);
    // From the parent area (add a child) unwind everything back to a clean Home; on first launch replace.
    if (router.canDismiss()) router.dismissTo('/');
    else router.replace('/');
  };

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} scenery="#86EFAC">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
        <Animated.View entering={BounceIn.duration(900)}><Owl size={96} mood="wave" /></Animated.View>
        <Animated.Text entering={FadeInDown.delay(200)} style={[font.title, { color: t.text }]}>{tr('app.name')}</Animated.Text>
        <Animated.View entering={FadeInDown.delay(400)} style={{ alignItems: 'center' }}>
          <AvatarView avatar={avatar} size={140} />
          <View style={styles.kinds}>
            {AVATAR_KINDS.map((k) => (
              <Pressy key={k} onPress={() => setAvatar(withKind(avatar, k))} accessibilityRole="button" accessibilityState={{ selected: avatar.kind === k }}
                style={[styles.kind, { backgroundColor: avatar.kind === k ? t.primary : t.card, borderColor: t.border }]}>
                <Text style={[font.body, { color: avatar.kind === k ? t.primaryText : t.text }]}>{k === 'boy' ? '👦' : '👧'} {tr(`avatar.kind.${k}`)}</Text>
              </Pressy>
            ))}
          </View>
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
          <Text style={[font.body, { color: t.textMuted, textAlign: 'center', marginBottom: 8 }]}>{tr('welcome.whatsYourName')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            maxLength={20}
            placeholder={tr('welcome.namePlaceholder')}
            placeholderTextColor={t.textMuted}
            style={[styles.input, raised(t), { color: t.text }]}
            returnKeyType="done"
            onSubmitEditing={start}
          />
          <BigButton label={tr('common.letsPlay')} icon="🚀" onPress={start} style={{ marginTop: 16 }} />
          {hasProfiles && <BigButton small label={tr('common.back')} color={t.card} textColor={t.text} onPress={goBack} style={{ marginTop: 10 }} />}
        </Animated.View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  row: { flexDirection: 'row', gap: 8, marginTop: 10 },
  kinds: { flexDirection: 'row', gap: 12, marginTop: 8 },
  kind: { minWidth: 110, height: 52, borderRadius: radius.pill, borderWidth: 2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  sw: { width: 36, height: 36, borderRadius: 18, borderWidth: 3 },
  input: { fontFamily: 'Tajawal_700Bold', borderWidth: 2, borderRadius: radius.pill, paddingHorizontal: 20, height: 60, fontSize: 22, textAlign: 'center' },
});
