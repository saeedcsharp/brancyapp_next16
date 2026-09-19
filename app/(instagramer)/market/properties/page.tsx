"use client";

import NotAllowed from "brancy/components/notOk/notAllowed";
import { RoleAccess } from "brancy/helper/loadingStatus";
import { PartnerRole } from "brancy/models/enums";
import PageComponent from "../../../../legacy-pages/market/properties";
import { useSession } from "next-auth/react";

export default function Page() {
  const { data: session, status } = useSession();

  if (!RoleAccess(session, PartnerRole.Bio)) {
    return <NotAllowed />;
  }
  if (status !== "authenticated") return null;
  return <PageComponent />;
}
