import { useEffect } from 'react';
import { useFonts, Tajawal_300Light, Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold, Tajawal_800ExtraBold, Tajawal_900Black } from '@expo-google-fonts/tajawal';
import { StatusBar } from 'expo-status-bar';
import { LocaleProvider, Stack, SplashScreen } from 'expo-router';
import { useI18n } from '@/i18n';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initAudio } from '@/audio/sfx';
import { checkArabicVoice } from '@/audio/speech';
import { useTheme } from '@/ui/theme/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const t = useTheme();
  const { dir } = useI18n();
  // Fonts ship inside the app (no network); keep the splash screen until they are ready.
  const [fontsLoaded, fontError] = useFonts({ Tajawal_300Light, Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold, Tajawal_800ExtraBold, Tajawal_900Black });
  const ready = fontsLoaded || !!fontError;
  useEffect(() => {
    initAudio();
    checkArabicVoice();
  }, []);
  useEffect(() => {
    // Progress is read synchronously from on-device SQLite, so the first frame is already correct.
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);
  if (!ready) return null;

  return (
    // Layout direction follows the chosen language instantly (Arabic RTL, English LTR), no restart.
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: t.bg, direction: dir }}>
      <LocaleProvider direction={dir}>
      <SafeAreaProvider>
        <StatusBar style={t.dark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="welcome" options={{ animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="game/[id]" options={{ gestureEnabled: true }} />
          <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
        </Stack>
      </SafeAreaProvider>
      </LocaleProvider>
    </GestureHandlerRootView>
  );
}
