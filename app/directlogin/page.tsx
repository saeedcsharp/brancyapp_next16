import DirectLoginClient from "brancy/components/signIn/directLoginClient";
import { getInternalApiBaseUrl } from "brancy/helper/apiBaseUrl";
import { IRefreshToken } from "brancy/models/interfaces";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// app/directlogin/page.tsx  (Server Component - فقط دیتا میگیره)
export default async function DirectLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ bearer?: string; redirectUrl?: string; instagramerId?: string }>;
}) {
  const { bearer, redirectUrl, instagramerId } = await searchParams;
  if (!bearer || !redirectUrl || !instagramerId) {
    redirect("/");
  }
  const reqHeaders = await headers();
  const apiBase = getInternalApiBaseUrl(reqHeaders.get("host"));
  const res = await fetch(`${apiBase}SSO/RefreshToken`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${bearer}` },
  });
  if (res.status === 401 || res.status === 403 || res.status === 500) {
    console.warn("Unauthorized or forbidden response from refresh token endpoint, redirecting to login.");
    redirect("/");
  }
  const response = await res.json();
  const refreshToken = response.value as IRefreshToken;
  console.log("Direct login API response:", { status: res.status, refreshToken });
  console.log("instagramerids:", refreshToken.role);
  return <DirectLoginClient res={refreshToken} redirectUrl={redirectUrl} instagramerId={Number(instagramerId)} />;
}
