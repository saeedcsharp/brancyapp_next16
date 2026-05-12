// =============================================================================
// ✏️  ONLY EDIT THIS SECTION — everything else updates automatically
// =============================================================================
const baseIRUrl = "brancy.ir";
const baseAppUrl = "brancy.ir";
const CONFIG = {
  // ── brancy.ir (داخل ایران) ───────────────────────────────────────────────
  ir: {
    api: `https://api.${baseIRUrl}/`,
    media: `https://ilink.${baseIRUrl}/`,
    upload: `https://uupload.${baseIRUrl}/file`,
    socket: `https://minisocket.${baseIRUrl}`,
  },

  // ── brancy.app (پیش‌فرض / خارج از ایران) ────────────────────────────────
  app: {
    api: `https://api.${baseAppUrl}/`,
    media: `https://ilink.${baseAppUrl}/`,
    upload: `https://uupload.${baseAppUrl}/file`,
    socket: `https://minisocket.${baseAppUrl}`,
  },
};

// =============================================================================
// ⚙️  Implementation — do not edit below this line
// =============================================================================

const IR_HOST = "brancy.ir";

function isIrHost(hostname: string): boolean {
  const h = hostname.toLowerCase().split(":")[0];
  return h === IR_HOST || h.endsWith(`.${IR_HOST}`);
}

// ── Server-side ───────────────────────────────────────────────────────────────

/**
 * Server-side API base URL resolver — pass the value of the `host` request header.
 * Safe to call from Next.js API routes, middleware, and NextAuth handlers.
 */
export function getServerApiBaseUrl(host: string | null | undefined): string {
  if (!host) return CONFIG.app.api;
  return isIrHost(host) ? CONFIG.ir.api : CONFIG.app.api;
}

// ── Client-side ───────────────────────────────────────────────────────────────

function clientIsIr(): boolean {
  if (typeof window === "undefined") return false;
  return isIrHost(window.location.hostname);
}

/** Direct browser → backend API base URL. */
export function getClientApiBaseUrl(): string {
  return clientIsIr() ? CONFIG.ir.api : CONFIG.app.api;
}

/** Media/image CDN base URL (replaces NEXT_PUBLIC_BASE_MEDIA_URL at runtime). */
export function getClientMediaBaseUrl(): string {
  return clientIsIr() ? CONFIG.ir.media : CONFIG.app.media;
}

/** Upload endpoint URL (replaces NEXT_PUBLIC_UPLOAD_BASE_URL at runtime). */
export function getClientUploadBaseUrl(): string {
  return clientIsIr() ? CONFIG.ir.upload : CONFIG.app.upload;
}

/** SignalR socket base URL. */
export function getClientSocketBaseUrl(): string {
  return clientIsIr() ? CONFIG.ir.socket : CONFIG.app.socket;
}

/**
 * Returns true only when the selected API base URL supports direct
 * browser → backend calls (i.e. CORS is configured on that server).
 * When false, all calls should be routed through the Next.js proxy.
 */
export function supportsDirectCalls(): boolean {
  return clientIsIr();
}
