"use client";

import { useSession } from "next-auth/react";
import NotAllowed from "brancy/components/notOk/notAllowed";
import PageComponent from "../../../../legacy-pages/message/ticket";
import { PartnerRole } from "brancy/models/enums";
import { RoleAccess } from "brancy/helper/loadingStatus";
export default function Page() {
  const { data: session, status } = useSession();
  if (!RoleAccess(session, PartnerRole.SystemTicket)) {
    return <NotAllowed />;
  }
  if (status === "loading") return null;
  return <PageComponent />;
}
