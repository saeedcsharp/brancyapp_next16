"use client";
import { useSession } from "next-auth/react";
import PageComponent from "../../../../legacy-pages/wallet/payment";
import { useEffect } from "react";
import NotAllowed from "brancy/components/notOk/notAllowed";
import { RoleAccess } from "brancy/helper/loadingStatus";
import { PartnerRole } from "brancy/models/enums";

export default function Page() {
  const { data: session, status } = useSession();
  if (!RoleAccess(session, PartnerRole.Transaction)) {
    return <NotAllowed />;
  }

  if (status !== "authenticated" || !session) return null;
  return <PageComponent />;
}
