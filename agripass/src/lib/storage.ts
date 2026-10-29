import type { StateStorage } from 'zustand/middleware';

/** localStorage that never throws (private windows, blocked site data, sandboxed previews). */
const mem = new Map<string, string>();

export const safeStorage: StateStorage = {
  getItem: (k) => {
    try {
      return window.localStorage.getItem(k) ?? mem.get(k) ?? null;
    } catch {
      return mem.get(k) ?? null;
    }
  },
  setItem: (k, v) => {
    mem.set(k, v);
    try {
      window.localStorage.setItem(k, v);
    } catch {
      /* in-memory fallback */
    }
  },
  removeItem: (k) => {
    mem.delete(k);
    try {
      window.localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  },
};

export const storageAvailable = (() => {
  try {
    const k = '__agp';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
})();
