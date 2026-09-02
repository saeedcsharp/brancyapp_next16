"use client";

import NotAllowedShopper from "brancy/components/notOk/notAllowedShopper";
import PageComponent from "../../../../legacy-pages/store/statistics";
import { useSession } from "next-auth/react";
import { packageStatus } from "brancy/helper/loadingStatus";
import router from "next/router";

export default function Page() {
  const { data: session } = useSession();
  if (!packageStatus(session)) router.replace("/upgrade");
  if (session?.user.isInfluencer) return <NotAllowedShopper />;
  return <PageComponent />;
}
