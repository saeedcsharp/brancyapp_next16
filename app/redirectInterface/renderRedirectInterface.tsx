import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import ReloadTimer from "./ReloadTimer";
import EscapeInAppBrowser from "./EscapeInAppBrowser";
import ClientRedirect from "./ClientRedirect";

const ALLOWED_DOMAINS = [
  "zarinpal.com",
  "pod.ir",
  "stripe.com",
  "instagram.com",
  "instagramer.com",
  "zibal.ir",
  "ig.me",
];
const IRAN_ONLY_DOMAINS = ["zarinpal.com", "pod.ir", "zibal.ir"];
// Filtered in Iran: visitors from Iran-equivalent countries must enable a VPN first.
const VPN_REQUIRED_DOMAINS = ["ig.me"];

function matchesDomainList(hostname: string, domainList: string[]): boolean {
  return domainList.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

function isAllowedRedirectUrl(redirectUrl: string): boolean {
  try {
    const url = new URL(redirectUrl);
    return matchesDomainList(url.hostname, ALLOWED_DOMAINS);
  } catch {
    return false;
  }
}

function isIranOnlyDomain(redirectUrl: string): boolean {
  try {
    const url = new URL(redirectUrl);
    return matchesDomainList(url.hostname, IRAN_ONLY_DOMAINS);
  } catch {
    return false;
  }
}

function isVpnRequiredDomain(redirectUrl: string): boolean {
  try {
    const url = new URL(redirectUrl);
    return matchesDomainList(url.hostname, VPN_REQUIRED_DOMAINS);
  } catch {
    return false;
  }
}

function VpnBlockPage({ message }: { message: string }) {
  return (
    <div
      data-vpn-block=""
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        padding: "1rem",
      }}>
      <ReloadTimer />
      <p>{message}</p>
    </div>
  );
}

async function getCountryCode(): Promise<string | null> {
  const headersList = await headers();
  const cloudflareCountry = headersList.get("cf-ipcountry");
  const arvanCountry = headersList.get("X-Country-Code") || headersList.get("ar-real-ip-country");
  return (cloudflareCountry || arvanCountry)?.toUpperCase() || null;
}

type InAppBrowserInfo = {
  isInAppBrowser: boolean;
  platform: "android" | "ios" | "other";
};

/**
 * Detect whether the request comes from an in-app browser (WebView) such as
 * the Instagram / Facebook embedded browser, which breaks payment and OAuth
 * flows. Detection is based on the User-Agent header.
 */
async function getInAppBrowserInfo(): Promise<InAppBrowserInfo> {
  const headersList = await headers();
  const ua = headersList.get("user-agent") || "";

  const isInAppBrowser = /Instagram|FBAN|FBAV|FB_IAB|FBIOS/i.test(ua);

  let platform: "android" | "ios" | "other" = "other";
  if (/Android/i.test(ua)) {
    platform = "android";
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    platform = "ios";
  }

  return { isInAppBrowser, platform };
}

export function encodeRedirectTarget(redirectUrl: string): string {
  return Buffer.from(redirectUrl, "utf8").toString("base64url");
}

export function decodeRedirectTarget(target: string): string | undefined {
  try {
    return Buffer.from(decodeURIComponent(target), "base64url").toString("utf8");
  } catch {
    return undefined;
  }
}

async function getAbsoluteUrl(path: string): Promise<string | null> {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  if (!host) return null;
  const proto = headersList.get("x-forwarded-proto") || "https";
  return `${proto}://${host}${path}`;
}

export async function renderRedirectInterface(redirectUrl: string | undefined, isPathForm: boolean) {
  if (!redirectUrl || !isAllowedRedirectUrl(redirectUrl)) {
    notFound();
  }

  // Must run AFTER the domain check and BEFORE the country check.
  const { isInAppBrowser, platform } = await getInAppBrowserInfo();
  if (isInAppBrowser) {
    // Instagram iOS "Open in external browser" drops the query string, so the target is carried in the path.
    const pathFormUrl = `/redirectInterface/${encodeRedirectTarget(redirectUrl)}`;
    if (!isPathForm) {
      redirect(pathFormUrl);
    }
    const openUrl = (await getAbsoluteUrl(pathFormUrl)) || redirectUrl;
    return <EscapeInAppBrowser openUrl={openUrl} platform={platform} />;
  }

  const countryCode = await getCountryCode();
  // Comma-separated extra country codes treated as Iran (e.g. "AZ,TR").
  const extraIranCountryCodes = (process.env.IRAN_EXTRA_COUNTRY_CODES || "")
    .split(",")
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean);
  const isIran = countryCode === "IR" || (!!countryCode && extraIranCountryCodes.includes(countryCode));

  if (!isIran && isIranOnlyDomain(redirectUrl)) {
    return <VpnBlockPage message="لطفاً فیلترشکن خود را خاموش کنید و دوباره تلاش کنید." />;
  }
  if (isIran && isVpnRequiredDomain(redirectUrl)) {
    return <VpnBlockPage message="لطفاً فیلترشکن خود را روشن کنید تا به صورت خودکار منتقل شوید." />;
  }
  // HTTP redirects keep the previous page's Referer; navigating from this document sends the brancy.app origin.
  return <ClientRedirect url={redirectUrl} />;
}
