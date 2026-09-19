"use client";

import PageComponent from "../../../../legacy-pages/page/ai/index";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { RoleAccess } from "brancy/helper/loadingStatus";
import { PartnerRole } from "brancy/models/enums";

function AiCreatorRoute() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const initialType = type === "1" || type === "2" ? type : undefined;
  if (!RoleAccess(session, PartnerRole.Automatics)) return null;
  return <PageComponent initialType={initialType} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <AiCreatorRoute />
    </Suspense>
  );
}
