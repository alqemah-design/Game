import { useSyncExternalStore } from 'react';
import * as Speech from 'expo-speech';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { useProgress } from '@/data/progressStore';

/**
 * Pronunciation.
 * 1) A recorded clip, if one is registered in RECORDINGS (best quality, identical on every device).
 * 2) Otherwise the device's text-to-speech (expo-speech) as a fallback.
 *
 * To add recordings: put e.g. assets/audio/ar/letters/alif.mp3 in the repo and register it below:
 *   'ar:ألِف': require('../../assets/audio/ar/letters/alif.mp3'),
 */
const RECORDINGS: Record<string, number> = {};

let voicePlayer: AudioPlayer | null = null;

export function speak(text: string, lang: 'ar' | 'en') {
  const s = useProgress.getState();
  const settings = s.activeId ? s.profiles[s.activeId]?.settings : undefined;
  if (settings?.sound === false) return;

  const clip = RECORDINGS[`${lang}:${text}`];
  if (clip) {
    Speech.stop();
    if (!voicePlayer) voicePlayer = createAudioPlayer(clip);
    else voicePlayer.replace(clip);
    voicePlayer.play();
    return;
  }
  Speech.stop();
  Speech.speak(text, { language: lang === 'ar' ? 'ar-SA' : 'en-US', rate: lang === 'ar' ? 0.8 : 0.75, pitch: 1.1 });
}

export const stopSpeaking = () => Speech.stop();

// ── Is there an Arabic voice on this device? ─────────────────────────────
// Some Android phones ship without one; listening games would then be silent.
let arabicVoice: boolean | null = null;
const listeners = new Set<() => void>();

export async function checkArabicVoice() {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    arabicVoice = voices.some((v) => (v.language ?? '').toLowerCase().startsWith('ar'));
  } catch {
    arabicVoice = false;
  }
  listeners.forEach((l) => l());
}

/** null = not checked yet, true/false = Arabic voice available. */
export function useArabicVoice(): boolean | null {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    () => arabicVoice,
  );
}
