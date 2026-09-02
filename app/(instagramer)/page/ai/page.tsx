"use client";

import PageComponent from "../../../../legacy-pages/page/ai/index";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { packageStatus } from "brancy/helper/loadingStatus";
import router from "next/router";

function AiRoute() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const initialType = type === "1" || type === "2" ? type : undefined;
  const { data: session } = useSession();
  if (!packageStatus(session)) router.replace("/upgrade");
  return <PageComponent initialType={initialType} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <AiRoute />
    </Suspense>
  );
}
