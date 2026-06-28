import { redirect, notFound } from "next/navigation";

const ALLOWED_DOMAINS = ["zarinpal.com", "podgetway.pod.ir", "stripe.com", "sandbox.zarinpal.com"];

function isAllowedRedirectUrl(redirectUrl: string): boolean {
  try {
    const url = new URL(redirectUrl);
    return ALLOWED_DOMAINS.some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
  } catch {
    return false; // اگه redirectUrl یه URL معتبر نباشه
  }
}

export default function RedirectInterfacePage({ searchParams }: { searchParams: { redirectUrl?: string } }) {
  const redirectUrl = searchParams.redirectUrl;
  if (!redirectUrl || !isAllowedRedirectUrl(redirectUrl)) {
    notFound();
  }
  redirect(redirectUrl);
}
