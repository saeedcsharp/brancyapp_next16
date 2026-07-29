// localStorage-based draft storage with cleanup + versioning
type DraftEntry = {
  version: number;
  text: string;
  attachments?: string[];
  replyTo?: string;
  updatedAt: number;
};
const PREFIX = "draft_ticket_";
const DAY_MS = 24 * 60 * 60 * 1000;
/* -------------------- KEY -------------------- */
export function draftKey(ticketId: string | number) {
  return `${PREFIX}${ticketId}`;
}
/* -------------------- SAVE -------------------- */
export function setDraft(key: string, text: string) {
  try {
    // remove empty drafts
    if (!text || !text.trim()) {
      removeDraft(key);
      return;
    }
    const entry: DraftEntry = {
      version: 1,
      text,
      updatedAt: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to save draft", e);
    }
  }
}
/* -------------------- GET -------------------- */
export function getDraft(key: string, maxAgeDays = 30): DraftEntry | null {
  try {
    const v = localStorage.getItem(key);
    if (!v) return null;
    const parsed = JSON.parse(v);
    // basic validation
    const hasValidBase = typeof parsed?.text === "string" && typeof parsed?.updatedAt === "number";
    if (!hasValidBase) {
      localStorage.removeItem(key);
      return null;
    }
    const version = typeof parsed?.version === "number" ? parsed.version : 0;
    const maxAge = maxAgeDays * DAY_MS;
    if (Date.now() - parsed.updatedAt > maxAge) {
      localStorage.removeItem(key);
      return null;
    }
    // safe attachments validation
    const attachments =
      Array.isArray(parsed.attachments) && parsed.attachments.every((x: unknown) => typeof x === "string")
        ? parsed.attachments
        : undefined;
    // safe replyTo validation
    const replyTo = typeof parsed.replyTo === "string" && parsed.replyTo.trim().length > 0 ? parsed.replyTo : undefined;
    const normalized: DraftEntry = {
      version: version || 1,
      text: parsed.text,
      updatedAt: parsed.updatedAt,
      ...(attachments ? { attachments } : {}),
      ...(replyTo ? { replyTo } : {}),
    };
    // migrate legacy drafts
    if (version === 0) {
      try {
        localStorage.setItem(key, JSON.stringify(normalized));
      } catch {}
    }
    return normalized;
  } catch (e) {
    try {
      localStorage.removeItem(key);
    } catch {}
    return null;
  }
}
/* -------------------- REMOVE -------------------- */
export function removeDraft(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
}
/* -------------------- CLEANUP -------------------- */
export function cleanupOldDrafts(days = 30) {
  if (typeof window === "undefined") return;
  try {
    const now = Date.now();
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(PREFIX)) continue;
      const v = localStorage.getItem(k);
      if (!v) continue;
      try {
        const entry = JSON.parse(v) as DraftEntry;
        const invalid = typeof entry.updatedAt !== "number" || now - entry.updatedAt > days * DAY_MS;
        if (invalid) keysToRemove.push(k);
      } catch {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}
}
/* -------------------- PREVIEW -------------------- */
export function getDraftPreview(key: string, maxLength = 40) {
  const d = getDraft(key);
  if (!d) return null;
  return d.text.length > maxLength ? d.text.slice(0, maxLength) + "..." : d.text;
}
/* -------------------- CHECK -------------------- */
export function hasDraft(ticketId: string | number) {
  return !!getDraft(draftKey(ticketId));
}
