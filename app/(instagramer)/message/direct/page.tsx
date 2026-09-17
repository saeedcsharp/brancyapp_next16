"use client";

import { useSession } from "next-auth/react";
import NotPermission, { PermissionType } from "brancy/components/notOk/notPermission";
import PageComponent from "../../../../legacy-pages/message/direct";
import { PartnerRole } from "brancy/models/enums";
import NotAllowed from "brancy/components/notOk/notAllowed";
import { RoleAccess } from "brancy/helper/loadingStatus";
export default function Page() {
  const { data: session, status } = useSession();
  if (!RoleAccess(session, PartnerRole.Message)) {
    return <NotAllowed />;
  }
  if (status === "loading") return null;
  if (status === "authenticated" && session && !session.user.messagePermission) {
    return <NotPermission permissionType={PermissionType.Messages} />;
  }

  return <PageComponent />;
}
