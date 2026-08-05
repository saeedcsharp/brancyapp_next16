"use client";

import { useSession } from "next-auth/react";
import PageComponent from "../../../../legacy-pages/advertise/Properties";
import NotAllowedAdvertiser from "brancy/components/notOk/notAllowedShopper";

export default function Page() {
  const { data: session } = useSession();
  if (session?.user.isShopper) return <NotAllowedAdvertiser />;
  return <PageComponent />;
}
