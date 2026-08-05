"use client";

import NotAllowedAdvertiser from "brancy/components/notOk/notAllowedShopper";
import PageComponent from "../../../../legacy-pages/advertise/statistics";
import { useSession } from "next-auth/react";

export default function Page() {
  const { data: session } = useSession();
  if (session?.user.isShopper) return <NotAllowedAdvertiser />;
  return <PageComponent />;
}
