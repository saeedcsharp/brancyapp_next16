import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import ReloadTimer from "./ReloadTimer";

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

export default async function RedirectInterfacePage({
  searchParams,
}: {
  searchParams: Promise<{ redirectUrl?: string }>;
}) {
  const { redirectUrl } = await searchParams;
  const countryCode = await getCountryCode();
  const isIran = countryCode === "IR" || countryCode === "AZ";

  if (!redirectUrl || !isAllowedRedirectUrl(redirectUrl)) {
    notFound();
  }

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
