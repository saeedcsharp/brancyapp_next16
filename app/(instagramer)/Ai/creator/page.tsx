"use client";

import PageComponent from "../../../../legacy-pages/page/ai/index";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { RoleAccess } from "brancy/helper/loadingStatus";
import { PartnerRole } from "brancy/models/enums";
import NotAllowed from "brancy/components/notOk/notAllowed";

function AiCreatorRoute() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const initialType = type === "1" || type === "2" ? type : undefined;

  return <PageComponent initialType={initialType} />;
}

export default function Page() {
  const { data: session } = useSession();
  if (!RoleAccess(session, PartnerRole.Publish)) return <NotAllowed />;
  return (
    <Suspense fallback={<div />}>
      <AiCreatorRoute />
    </Suspense>
  );
}
