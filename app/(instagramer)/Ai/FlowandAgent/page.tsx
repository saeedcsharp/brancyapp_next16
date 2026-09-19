"use client";

import { RoleAccess } from "brancy/helper/loadingStatus";
import PageComponent from "../../../../legacy-pages/message/AIAndFlow/index";
import { useSession } from "next-auth/react";
import { PartnerRole } from "brancy/models/enums";
import NotAllowed from "brancy/components/notOk/notAllowed";
export default function Page() {
  const { data: session } = useSession();
  if (!RoleAccess(session, PartnerRole.Automatics)) return <NotAllowed />;
  return <PageComponent />;
}
