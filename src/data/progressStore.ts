import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Avatar } from '@/domain/rewards/avatar';
import {
  addPoints, applyLevelComplete, createProfile,
  type Artwork, type LevelResult, type Profile, type ProfileSettings, type ProgressEvents,
} from '@/domain/progress';
import { kvStorage } from './storage';

/**
 * The single source of truth for progress (replaces localStorage + the Base44 UserProgress entity).
 * Several children can share one device; each has an independent profile. No account, no server.
 */
type State = {
  profiles: Record<string, Profile>;
  activeId: string | null;
  colorScheme: 'system' | 'light' | 'dark';
};

type Actions = {
  addProfile: (name: string, avatar?: Avatar) => string;
  switchProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  renameProfile: (name: string) => void;
  setAvatar: (avatar: Avatar) => void;
  updateSettings: (patch: Partial<ProfileSettings>) => void;
  completeLevel: (r: Omit<LevelResult, 'now'>) => ProgressEvents;
  saveArtwork: (art: Omit<Artwork, 'id' | 'createdAt'>) => ProgressEvents;
  deleteArtwork: (id: string) => void;
  resetProgress: () => void;
  wipeEverything: () => void;
  setColorScheme: (s: State['colorScheme']) => void;
};

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const NO_EVENTS: ProgressEvents = { achievements: [], stickers: [] };

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
        saveArtwork: (art) => {
          const p = get().activeId ? get().profiles[get().activeId!] : undefined;
          if (!p) return NO_EVENTS;
          const now = Date.now();
          const withArt = { ...p, artworks: [{ ...art, id: newId(), createdAt: now }, ...p.artworks].slice(0, 60) };
          const { profile, events } = addPoints(withArt, 5, now);
          set((s) => ({ profiles: { ...s.profiles, [p.id]: profile } }));
          return events;
        },
        deleteArtwork: (id) => updateActive((p) => ({ ...p, artworks: p.artworks.filter((a) => a.id !== id) })),
        resetProgress: () =>
          updateActive((p) => ({ ...createProfile(p.id, p.name, p.createdAt, p.avatar), settings: p.settings })),
        wipeEverything: () => set({ profiles: {}, activeId: null }),
        setColorScheme: (colorScheme) => set({ colorScheme }),
      };
    },
    {
      name: 'kbg.progress',
      version: 1,
      storage: createJSONStorage(() => kvStorage),
      partialize: ({ profiles, activeId, colorScheme }) => ({ profiles, activeId, colorScheme }),
      // Future schema changes go here, keyed by the persisted version.
      migrate: (persisted) => persisted as State,
    },
  ),
);

export const useActiveProfile = () => useProgress((s) => (s.activeId ? s.profiles[s.activeId] : undefined));
export const useSettings = () => useProgress((s) => (s.activeId ? s.profiles[s.activeId]?.settings : undefined));
