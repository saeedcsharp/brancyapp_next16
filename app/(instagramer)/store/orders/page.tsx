"use client";
import { useSession } from "next-auth/react";
import { packageStatus } from "brancy/helper/loadingStatus";
import router from "next/router";
import PageComponent from "../../../../legacy-pages/store/orders";
import NotAllowedShopper from "brancy/components/notOk/notAllowedShopper";

export default function Page() {
  const { data: session } = useSession();
  if (!packageStatus(session)) router.replace("/upgrade");
  if (session?.user.isInfluencer) return <NotAllowedShopper />;
  return <PageComponent />;
}
