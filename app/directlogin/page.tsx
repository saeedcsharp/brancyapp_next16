import DirectLoginClient from "brancy/components/signIn/directLoginClient";
import { getInternalApiBaseUrl } from "brancy/helper/apiBaseUrl";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// app/directlogin/page.tsx  (Server Component - فقط دیتا میگیره)
export default async function DirectLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ bearer?: string; redirectUrl?: string; currentIndex?: string }>;
}) {
  const { bearer, redirectUrl, currentIndex } = await searchParams;
  const reqHeaders = await headers();
  const apiBase = getInternalApiBaseUrl(reqHeaders.get("host"));
  const res = await fetch(`${apiBase}SSO/RefreshToken`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${bearer}` },
  });
  if (res.status === 401 || res.status === 403) {
    console.warn("Unauthorized or forbidden response from refresh token endpoint, redirecting to login.");
    redirect("/");
  }
  const text = await res.json();
  console.log("Direct login API response:", { status: res.status, text });
  console.log("instagramerids:", text.value.role.instagramerIds);
  return <DirectLoginClient res={text} redirectUrl={redirectUrl} currentIndex={currentIndex} />;
}
