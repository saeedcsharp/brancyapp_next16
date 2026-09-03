"use client";

import { useSession } from "next-auth/react";
import PageComponent from "../../../../legacy-pages/advertise/calendar";
import NotAllowedAdvertiser from "brancy/components/notOk/notAllowedAdvertiser";
import Soon from "brancy/components/notOk/soon";
export default function Page() {
  const { data: session, status } = useSession();
  if (status !== "authenticated" || !session) return null;
  return <Soon />;
  if (session?.user.isShopper) return <NotAllowedAdvertiser />;
  return <PageComponent />;
}
