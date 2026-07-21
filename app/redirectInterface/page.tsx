import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import ReloadTimer from "./ReloadTimer";
import EscapeInAppBrowser from "./EscapeInAppBrowser";

const ALLOWED_DOMAINS = ["zarinpal.com", "pod.ir", "stripe.com", "instagram.com", "instagramer.com", "zibal.ir"];
const IRAN_ONLY_DOMAINS = ["zarinpal.com", "pod.ir", "zibal.ir"];

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

/**
 * Reconstruct the full URL of THIS redirect page (including its query string)
 * from the incoming request headers. This is the URI we want the real system
 * browser to open, so the whole flow re-runs there instead of jumping straight
 * to the payment/OAuth redirect target.
 */
async function getCurrentPageUrl(search: string): Promise<string | null> {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  if (!host) return null;
  const proto = headersList.get("x-forwarded-proto") || "https";
  const query = search ? `?${search}` : "";
  return `${proto}://${host}/redirectInterface${query}`;
}

export default async function RedirectInterfacePage({
  searchParams,
}: {
  searchParams: Promise<{ redirectUrl?: string }>;
}) {
  const { redirectUrl } = await searchParams;

  if (!redirectUrl || !isAllowedRedirectUrl(redirectUrl)) {
    notFound();
  }

  // If opened inside the Instagram/Facebook in-app browser, force the link to
  // open in the real system browser (Chrome / Safari). This must run AFTER the
  // domain check and BEFORE the country check.
  const { isInAppBrowser, platform } = await getInAppBrowserInfo();
  if (isInAppBrowser) {
    // Open the ORIGINAL page URI (this redirect interface) in the real browser,
    // not the final redirectUrl, so the full check flow runs again outside the
    // Instagram in-app browser. Fall back to redirectUrl if we cannot rebuild it.
    const search = new URLSearchParams({ redirectUrl }).toString();
    const currentPageUrl = (await getCurrentPageUrl(search)) || redirectUrl;
    return <EscapeInAppBrowser openUrl={currentPageUrl} platform={platform} />;
  }

  const countryCode = await getCountryCode();
  const isIran = countryCode === "IR" || countryCode === "AZ";

  if (!isIran && isIranOnlyDomain(redirectUrl)) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          textAlign: "center",
          padding: "1rem",
        }}>
        <ReloadTimer />
        <p>لطفاً فیلترشکن خود را خاموش کنید و دوباره تلاش کنید.</p>
      </div>
    );
  }

  redirect(redirectUrl);
}
