"use client";

import { useSession } from "next-auth/react";
import PageComponent from "../../../../legacy-pages/advertise/calendar";
import NotAllowedAdvertiser from "brancy/components/notOk/notAllowedAdvertiser";
import Soon from "brancy/components/notOk/soon";
import { packageStatus } from "brancy/helper/loadingStatus";
import router from "next/router";
export default function Page() {
  const { data: session } = useSession();
  return <Soon />;
  if (!packageStatus(session)) router.replace("/upgrade");
  if (session?.user.isShopper) return <NotAllowedAdvertiser />;
  return <PageComponent />;
}
