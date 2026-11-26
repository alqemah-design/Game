import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Avatar } from '@/domain/rewards/avatar';
import {
  addPlaySeconds, addPoints, applyLevelComplete, createProfile, grantBonusMinutes, normalizeProfiles,
  type Artwork, type LevelResult, type Profile, type ProfileSettings, type ProgressEvents,
} from '@/domain/progress';
import { kvStorage } from './storage';
import type { LanguagePref } from '@/i18n';

/**
 * The single source of truth for progress (replaces localStorage + the Base44 UserProgress entity).
 * Several children can share one device; each has an independent profile. No account, no server.
 */
type State = {
  profiles: Record<string, Profile>;
  activeId: string | null;
  colorScheme: 'system' | 'light' | 'dark';
  /** Interface language; Arabic by default (the app's home language). */
  language: LanguagePref;
};

type Actions = {
  addProfile: (name: string, avatar?: Avatar) => string;
  switchProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  renameProfile: (name: string) => void;
  setAvatar: (avatar: Avatar) => void;
  updateSettings: (patch: Partial<ProfileSettings>) => void;
  completeLevel: (r: Omit<LevelResult, 'now'>) => ProgressEvents;
  /** New drawing → +5 points once. Saving again (same id) updates it in place, no points. */
  saveArtwork: (art: Omit<Artwork, 'id' | 'createdAt'>, id?: string) => { id: string; isNew: boolean; events: ProgressEvents };
  deleteArtwork: (id: string) => void;
  markIntroSeen: (gameId: string) => void;
  addPlayTime: (seconds: number) => void;
  grantMinutes: (minutes: number) => void;
  resetProgress: () => void;
  wipeEverything: () => void;
  setColorScheme: (s: State['colorScheme']) => void;
  setLanguage: (l: LanguagePref) => void;
};

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const NO_EVENTS: ProgressEvents = { achievements: [], stickers: [] };
const MAX_ARTWORKS = 60;

export const useProgress = create<State & Actions>()(
  persist(
    (set, get) => {
      const updateActive = (fn: (p: Profile) => Profile) =>
        set((s) => {
          const p = s.activeId ? s.profiles[s.activeId] : undefined;
          return p ? { profiles: { ...s.profiles, [p.id]: fn(p) } } : s;
        });

      return {
        profiles: {},
        activeId: null,
        colorScheme: 'system',
        language: 'ar',

        addProfile: (name, avatar) => {
          const id = newId();
          set((s) => ({ profiles: { ...s.profiles, [id]: createProfile(id, name, Date.now(), avatar) }, activeId: id }));
          return id;
        },
        switchProfile: (id) => set((s) => (s.profiles[id] ? { activeId: id } : s)),
        deleteProfile: (id) =>
          set((s) => {
            const { [id]: _removed, ...rest } = s.profiles;
            return { profiles: rest, activeId: s.activeId === id ? (Object.keys(rest)[0] ?? null) : s.activeId };
          }),
        renameProfile: (name) => updateActive((p) => ({ ...p, name: name.trim() || p.name })),
        setAvatar: (avatar) => updateActive((p) => ({ ...p, avatar })),
        updateSettings: (patch) => updateActive((p) => ({ ...p, settings: { ...p.settings, ...patch } })),

        completeLevel: (r) => {
          const p = get().activeId ? get().profiles[get().activeId!] : undefined;
          if (!p) return NO_EVENTS;
          const { profile, events } = applyLevelComplete(p, { ...r, now: Date.now() });
          set((s) => ({ profiles: { ...s.profiles, [p.id]: profile } }));
          return events;
        },
        saveArtwork: (art, id) => {
          const p = get().activeId ? get().profiles[get().activeId!] : undefined;
          if (!p) return { id: id ?? '', isNew: false, events: NO_EVENTS };
          const existing = id ? p.artworks.find((a) => a.id === id) : undefined;
          if (existing) {
            const updated = { ...p, artworks: p.artworks.map((a) => (a.id === id ? { ...a, ...art } : a)) };
            set((s) => ({ profiles: { ...s.profiles, [p.id]: updated } }));
            return { id: existing.id, isNew: false, events: NO_EVENTS };
          }
          const now = Date.now();
          const artId = newId();
          const withArt = { ...p, artworks: [{ ...art, id: artId, createdAt: now }, ...p.artworks].slice(0, MAX_ARTWORKS) };
          const { profile, events } = addPoints(withArt, 5, now);
          set((s) => ({ profiles: { ...s.profiles, [p.id]: profile } }));
          return { id: artId, isNew: true, events };
        },
        deleteArtwork: (id) => updateActive((p) => ({ ...p, artworks: p.artworks.filter((a) => a.id !== id) })),
        addPlayTime: (seconds) => updateActive((p) => addPlaySeconds(p, seconds, Date.now())),
        grantMinutes: (minutes) => updateActive((p) => grantBonusMinutes(p, minutes, Date.now())),
        markIntroSeen: (gameId) => updateActive((p) => (p.seenIntros.includes(gameId) ? p : { ...p, seenIntros: [...p.seenIntros, gameId] })),
        resetProgress: () =>
          updateActive((p) => ({ ...createProfile(p.id, p.name, p.createdAt, p.avatar), settings: p.settings })),
        wipeEverything: () => set({ profiles: {}, activeId: null }),
        setColorScheme: (colorScheme) => set({ colorScheme }),
        setLanguage: (language) => set({ language }),
      };
    },
    {
      name: 'kbg.progress',
      version: 1,
      storage: createJSONStorage(() => kvStorage),
      partialize: ({ profiles, activeId, colorScheme, language }) => ({ profiles, activeId, colorScheme, language }),
      // Future schema changes go here, keyed by the persisted version.
      migrate: (persisted) => persisted as State,
      // Validate whatever is on disk before it reaches the UI.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        const profiles = normalizeProfiles(p.profiles);
        const activeId = p.activeId && profiles[p.activeId] ? p.activeId : (Object.keys(profiles)[0] ?? null);
        const colorScheme = p.colorScheme === 'light' || p.colorScheme === 'dark' ? p.colorScheme : 'system';
        const language = p.language === 'en' || p.language === 'system' ? p.language : 'ar';
        return { ...current, profiles, activeId, colorScheme, language };
      },
    },
  ),
);

export const useActiveProfile = () => useProgress((s) => (s.activeId ? s.profiles[s.activeId] : undefined));
export const useSettings = () => useProgress((s) => (s.activeId ? s.profiles[s.activeId]?.settings : undefined));
