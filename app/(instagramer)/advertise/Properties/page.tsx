"use client";

import NotAllowedAdvertiser from "brancy/components/notOk/notAllowedAdvertiser";
import { useSession } from "next-auth/react";
import PageComponent from "../../../../legacy-pages/advertise/Properties";

export default function Page() {
  const { data: session } = useSession();
  if (session?.user.isShopper) return <NotAllowedAdvertiser />;
  return <PageComponent />;
}
