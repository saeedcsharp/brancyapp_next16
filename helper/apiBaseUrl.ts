/**
 * Resolves the correct backend API base URL based on the current host.
 *
 * Routing rules:
 *   brancy.ir  (or any *.brancy.ir subdomain)  →  https://api.brancy.ir/
 *   brancy.app (default / fallback)              →  https://api.brancy.app/
 */

const IR_HOST = "brancy.ir";
const IR_API = "https://api.brancy.ir/";
const APP_API = "https://api.patran.ir/";

/**
 * Server-side resolver — pass the value of the `host` request header.
 * Safe to call from Next.js API routes, middleware, and NextAuth handlers.
 *
 * @param host  e.g. "brancy.ir", "www.brancy.ir", "brancy.app"
 */
export function getServerApiBaseUrl(host: string | null | undefined): string {
  if (!host) return APP_API;
  const h = host.toLowerCase().split(":")[0]; // strip port
  return h === IR_HOST || h.endsWith(`.${IR_HOST}`) ? IR_API : APP_API;
}

/**
 * Client-side resolver — reads window.location.hostname.
 * Must only be called in browser contexts (useEffect, event handlers, etc.).
 */
export function getClientApiBaseUrl(): string {
  if (typeof window === "undefined") return APP_API;
  const h = window.location.hostname.toLowerCase();
  return h === IR_HOST || h.endsWith(`.${IR_HOST}`) ? IR_API : APP_API;
}
