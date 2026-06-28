import { redirect, notFound } from "next/navigation";
const ALLOWED_DOMAINS = ["zarinpal.com", "podgetway.pod.ir", "stripe.com", "sandbox.zarinpal.com", "instagram.com"];
function isAllowedRedirectUrl(redirectUrl: string): boolean {
  try {
    const url = new URL(redirectUrl);
    return ALLOWED_DOMAINS.some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
  } catch {
    return false; // اگه redirectUrl یه URL معتبر نباشه
  }
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
  redirect(redirectUrl);
}
