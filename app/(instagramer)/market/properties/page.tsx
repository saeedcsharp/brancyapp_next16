"use client";

import { packageStatus } from "brancy/helper/loadingStatus";
import router from "next/router";
import PageComponent from "../../../../legacy-pages/market/properties";
import { useSession } from "next-auth/react";

export default function Page() {
  const { data: session } = useSession();
  if (!packageStatus(session)) router.replace("/upgrade");
  return <PageComponent />;
}
