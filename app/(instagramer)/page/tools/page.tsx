"use client";
import { useSession } from "next-auth/react";

import NotAllowed from "brancy/components/notOk/notAllowed";
import PageComponent from "../../../../legacy-pages/page/tools";
import { PartnerRole } from "brancy/models/enums";
import { RoleAccess } from "brancy/helper/loadingStatus";
export default function Page() {
  const { data: session } = useSession();
  if (!RoleAccess(session, PartnerRole.PageView)) return <NotAllowed />;
  return <PageComponent />;
}
