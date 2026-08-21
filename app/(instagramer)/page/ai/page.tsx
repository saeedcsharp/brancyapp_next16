"use client";

import PageComponent from "../../../../legacy-pages/page/ai/index";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AiRoute() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const initialType = type === "1" || type === "2" ? type : undefined;

  return <PageComponent initialType={initialType} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <AiRoute />
    </Suspense>
  );
}
