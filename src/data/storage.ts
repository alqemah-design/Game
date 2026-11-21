import Storage from 'expo-sqlite/kv-store';
import type { StateStorage } from 'zustand/middleware';

/**
 * Synchronous SQLite-backed key/value storage (on-device, offline, no network ever).
 * Sync reads mean the store is hydrated before the first frame – no loading flicker.
 */
export const kvStorage: StateStorage = {
  getItem: (key) => {
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
  setItem: (key, value) => Storage.setItemSync(key, value),
  removeItem: (key) => {
    Storage.removeItemSync(key);
  },
};
