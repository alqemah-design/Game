import { Text } from '@/ui/components/Text';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { useActiveProfile } from '@/data/progressStore';
import { useI18n } from '@/i18n';
import { useTheme } from '@/ui/theme/theme';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: focused ? 28 : 24, opacity: focused ? 1 : 0.6 }}>{emoji}</Text>;
}
const icon = (emoji: string) => function TabBarIcon({ focused }: { focused: boolean }) {
  return <TabIcon emoji={emoji} focused={focused} />;
};

export default function TabsLayout() {
  const { t: tr } = useI18n();
  const t = useTheme();
  const profile = useActiveProfile();
  // No login: the first launch simply asks for the child's name.
  if (!profile) return <Redirect href="/welcome" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.textMuted,
        tabBarStyle: { backgroundColor: t.card, borderTopColor: t.border, height: 72, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 13, fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: tr('tabs.home'), tabBarIcon: icon('🏠') }} />
      <Tabs.Screen name="stats" options={{ title: tr('tabs.stats'), tabBarIcon: icon('📊') }} />
      <Tabs.Screen name="art" options={{ title: tr('tabs.art'), tabBarIcon: icon('🎨') }} />
    </Tabs>
  );
}
