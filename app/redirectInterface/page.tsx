import type { Metadata } from "next";
import { renderRedirectInterface } from "./renderRedirectInterface";

export const metadata: Metadata = {
  referrer: "origin",
};

export default async function RedirectInterfacePage({
  searchParams,
}: {
  searchParams: Promise<{ redirectUrl?: string }>;
}) {
  const { redirectUrl } = await searchParams;
  return renderRedirectInterface(redirectUrl, false);
}
