"use client";

import NotAllowed from "brancy/components/notOk/notAllowed";
import { RoleAccess } from "brancy/helper/loadingStatus";
import { PartnerRole } from "brancy/models/enums";
import { useSession } from "next-auth/react";
import PageComponent from "../../../../legacy-pages/page/posts/index";
export default function Page() {
  const { data: session } = useSession();
  if (!RoleAccess(session, PartnerRole.PageView)) {
    return <NotAllowed />;
  }

  return <PageComponent />;
}
