"use client";

import { RoleAccess } from "brancy/helper/loadingStatus";
import PageComponent from "../../../../legacy-pages/message/AIAndFlow/index";
import { useSession } from "next-auth/react";
import { PartnerRole } from "brancy/models/enums";
export default function Page() {
  const { data: session } = useSession();
  if (!RoleAccess(session, PartnerRole.Publish)) return null;
  return <PageComponent />;
}
