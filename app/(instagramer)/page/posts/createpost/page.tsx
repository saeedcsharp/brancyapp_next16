"use client";

import PageComponent from "../../../../../legacy-pages/page/posts/createpost";
import { useSession } from "next-auth/react";
import { packageStatus } from "brancy/helper/loadingStatus";
import router from "next/router";
export default function Page() {
  const { data: session } = useSession();
  if (!packageStatus(session)) router.replace("/upgrade");
  return <PageComponent />;
}
