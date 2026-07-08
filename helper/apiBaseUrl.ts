// =============================================================================
// ✏️  ONLY EDIT THIS SECTION — everything else updates automatically
// =============================================================================
const baseIRUrl = "brancy.ir";
const baseAppUrl = "patran.ir";
const baseLocalUrl = "patran.ir";
const CONFIG = {
  // ── brancy.ir (داخل ایران) ───────────────────────────────────────────────
  ir: {
    api: `https://api.${baseIRUrl}/`,
    media: `https://ilink.${baseIRUrl}/`,
    upload: `https://uupload.${baseIRUrl}/file`,
    socket: `https://minisocket.${baseIRUrl}`,
    graph: `https://socket.${baseIRUrl}`,
  },

  // ── brancy.app (پیش‌فرض / خارج از ایران) ────────────────────────────────
  app: {
    api: `https://api.${baseAppUrl}/`,
    media: `https://ilink.${baseAppUrl}/`,
    upload: `https://uupload.${baseAppUrl}/file`,
    socket: `https://minisocket.${baseAppUrl}`,
    graph: `https://socket.${baseAppUrl}`,
  },

  // ── patran.ir (localhost / محیط توسعه) ───────────────────────────────────
  local: {
    api: `https://api.${baseLocalUrl}/`,
    media: `https://ilink.${baseLocalUrl}/`,
    upload: `https://uupload.${baseLocalUrl}/file`,
    socket: `https://minisocket.${baseLocalUrl}`,
    graph: `https://socket.${baseLocalUrl}`,
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

function isLocalHost(hostname: string): boolean {
  const h = hostname.toLowerCase().split(":")[0];
  return h === "localhost" || h === "127.0.0.1" || h === "::1";
}

// ── Server-side ───────────────────────────────────────────────────────────────
/**
 * Internal (server-to-server) API base URL resolver for use inside Docker.
 * On localhost returns the dev API, otherwise returns the internal Docker service URL.
 */
export function getInternalApiBaseUrl(host: string | null | undefined): string {
  if (!host) return "http://api:8080/";
  if (isLocalHost(host)) return CONFIG.local.api;
  return "http://api:8080/";
}

// ── Client-side ───────────────────────────────────────────────────────────────

function clientIsIr(): boolean {
  if (typeof window === "undefined") return false;
  return isIrHost(window.location.hostname);
}

function clientIsLocal(): boolean {
  if (typeof window === "undefined") return false;
  return isLocalHost(window.location.hostname);
}

function getClientConfig() {
  if (clientIsLocal()) return CONFIG.local;
  if (clientIsIr()) return CONFIG.ir;
  return CONFIG.app;
}

/** Direct browser → backend API base URL. */
export function getClientApiBaseUrl(): string {
  return getClientConfig().api;
}

/** Media/image CDN base URL (replaces NEXT_PUBLIC_BASE_MEDIA_URL at runtime). */
export function getClientMediaBaseUrl(): string {
  return getClientConfig().media;
}

/** Upload endpoint URL (replaces NEXT_PUBLIC_UPLOAD_BASE_URL at runtime). */
export function getClientUploadBaseUrl(): string {
  return getClientConfig().upload;
}

/** SignalR socket base URL. */
export function getClientSocketBaseUrl(): string {
  return getClientConfig().socket;
}

/** SignalR graph base URL. */
export function getClientGraphBaseUrl(): string {
  return getClientConfig().graph;
}

/**
 * Returns true only when the selected API base URL supports direct
 * browser → backend calls (i.e. CORS is configured on that server).
 * When false, all calls should be routed through the Next.js proxy.
 */
export function supportsDirectCalls(): boolean {
  return clientIsIr() || clientIsLocal();
}
export function redirectHostUrl() {
  return "patran.ir";
}
