"use client";

import PageComponent from "../../../../legacy-pages/page/ai/index";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useSession } from "next-auth/react";

function AiCreatorRoute() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const initialType = type === "1" || type === "2" ? type : undefined;
  const { data: session, status } = useSession();
  if (status !== "authenticated" || !session) return null;
  return <PageComponent initialType={initialType} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <AiCreatorRoute />
    </Suspense>
  );
}
