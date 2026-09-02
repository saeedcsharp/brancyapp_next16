"use client";

import PageComponent from "../../../legacy-pages/home/index";
import { useSession } from "next-auth/react";
import { packageStatus } from "brancy/helper/loadingStatus";
import router from "next/router";
export default function Page() {
  const { data: session } = useSession();
  if (!packageStatus(session) && (session?.user?.loginByInsta || session?.user?.loginByFb)) router.replace("/upgrade");
  return <PageComponent />;
}
