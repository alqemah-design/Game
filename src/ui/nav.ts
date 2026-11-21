import { router } from 'expo-router';

/** Back that always works: falls back to Home when the screen was opened directly (deep link, restore). */
export function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}
