import { AppState } from 'react-native';
import Storage from 'expo-sqlite/kv-store';
import type { StateStorage } from 'zustand/middleware';

/**
 * Synchronous SQLite-backed key/value storage (on-device, offline, no network ever).
 * Sync reads mean the store is hydrated before the first frame – no loading flicker.
 *
 * Writes are coalesced: a burst of changes (finish a level → points, stars, stats, play time)
 * becomes one write ~300 ms later instead of several full rewrites. Anything pending is written
 * immediately when the app leaves the foreground, so closing the app never loses progress.
 */
const WRITE_DELAY_MS = 300;
const pending = new Map<string, string>();
let timer: ReturnType<typeof setTimeout> | null = null;

export function flushStorage() {
  if (timer) { clearTimeout(timer); timer = null; }
  for (const [key, value] of pending) Storage.setItemSync(key, value);
  pending.clear();
}

AppState.addEventListener('change', (state) => {
  if (state !== 'active') flushStorage();
});

export const kvStorage: StateStorage = {
  getItem: (key) => {
    if (pending.has(key)) return pending.get(key)!;
    const value = Storage.getItemSync(key);
    if (value === null) return null;
    try {
      JSON.parse(value);
      return value;
    } catch {
      // Unreadable data: keep a copy for recovery instead of overwriting it silently, then start fresh.
      Storage.setItemSync(`${key}.corrupt.${Date.now()}`, value);
      return null;
    }
  },
  setItem: (key, value) => {
    pending.set(key, value);
    if (!timer) timer = setTimeout(flushStorage, WRITE_DELAY_MS);
  },
  removeItem: (key) => {
    pending.delete(key);
    Storage.removeItemSync(key);
  },
};

/** "Delete all data": every key this app stored on the device, including recovery copies. */
export function wipeStorage() {
  if (timer) { clearTimeout(timer); timer = null; }
  pending.clear();
  Storage.clearSync();
}
