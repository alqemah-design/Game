import type { StateStorage } from 'zustand/middleware';

/** Web is only used as a development preview; the shipped app is native and uses storage.ts (SQLite). */
export const kvStorage: StateStorage = {
  getItem: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
  setItem: (key, value) => { try { localStorage.setItem(key, value); } catch {} },
  removeItem: (key) => { try { localStorage.removeItem(key); } catch {} },
};

/** "Delete all data" in the web preview: every key this app stored. */
export function wipeStorage() {
  try {
    Object.keys(localStorage).filter((k) => k.startsWith('kbg.')).forEach((k) => localStorage.removeItem(k));
  } catch {}
}
