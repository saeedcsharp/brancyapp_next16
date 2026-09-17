"use client";
import router from "next/router";
import PageComponent from "../../../../legacy-pages/wallet/statistics";
import NotAllowed from "brancy/components/notOk/notAllowed";
import { RoleAccess } from "brancy/helper/loadingStatus";
import { PartnerRole } from "brancy/models/enums";
import { useSession } from "next-auth/react";

export default function Page() {
  const { data: session, status } = useSession();
  if (!RoleAccess(session, PartnerRole.Transaction)) {
    return <NotAllowed />;
  }
  if (status === "loading") return null;
  return <PageComponent />;
}
