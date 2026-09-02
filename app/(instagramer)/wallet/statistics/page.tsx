"use client";
import { useSession } from "next-auth/react";
import { packageStatus } from "brancy/helper/loadingStatus";
import router from "next/router";
import PageComponent from "../../../../legacy-pages/wallet/statistics";

export default function Page() {
  const { data: session } = useSession();
  if (!packageStatus(session)) router.replace("/upgrade");
  return <PageComponent />;
}
