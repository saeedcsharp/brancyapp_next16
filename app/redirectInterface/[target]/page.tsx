import type { Metadata } from "next";
import { decodeRedirectTarget, renderRedirectInterface } from "../renderRedirectInterface";

export const metadata: Metadata = {
  referrer: "origin",
};

export default async function RedirectInterfaceTargetPage({ params }: { params: Promise<{ target: string }> }) {
  const { target } = await params;
  return renderRedirectInterface(decodeRedirectTarget(target), true);
}
