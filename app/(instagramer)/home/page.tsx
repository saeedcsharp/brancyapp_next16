"use client";

import { packageStatus } from "brancy/helper/loadingStatus";
import PageComponent from "../../../legacy-pages/home/index";
import { useSession } from "next-auth/react";
import router from "next/router";
export default function Page() {
  const { data: session, status } = useSession();
  if (!packageStatus(session) && (session?.user?.loginByInsta || session?.user.loginByInsta)) {
    router.push("/upgrade");
    return;
  }
  if (status !== "authenticated" || !session) return null;
  return <PageComponent />;
}
