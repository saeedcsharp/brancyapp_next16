import type { EditorDoc } from "../types";

const DEFAULT_KEY = "textedit_autosave";
const DEFAULT_TTL = 3 * 24 * 60 * 60 * 1000; // 3 days

interface SaveRecord {
  doc: EditorDoc;
  savedAt: number;
  expiresAt: number;
}

export function saveToStorage(doc: EditorDoc, key = DEFAULT_KEY, ttl = DEFAULT_TTL): number {
  try {
    const now = Date.now();
    const record: SaveRecord = { doc, savedAt: now, expiresAt: now + ttl };
    localStorage.setItem(key, JSON.stringify(record));
    return now;
  } catch {
    return 0;
  }
}

export function loadFromStorage(key = DEFAULT_KEY): { doc: EditorDoc; savedAt: number } | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const record: SaveRecord = JSON.parse(raw);
    if (Date.now() > record.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    return { doc: record.doc, savedAt: record.savedAt };
  } catch {
    return null;
  }
}

export function clearStorage(key = DEFAULT_KEY): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export interface AutoSaveTimer {
  trigger(): void;
  cancel(): void;
  flush(): void;
}

export function createAutoSaveTimer(
  getDoc: () => EditorDoc,
  onSave: (timestamp: number) => void,
  delay = 5000,
  key = DEFAULT_KEY,
  ttl = DEFAULT_TTL,
): AutoSaveTimer {
  let timer: ReturnType<typeof setTimeout> | null = null;

  function flush(): void {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    const ts = saveToStorage(getDoc(), key, ttl);
    onSave(ts);
  }

  function trigger(): void {
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, delay);
  }

  function cancel(): void {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  return { trigger, cancel, flush };
}
