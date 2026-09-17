"use client";

import { useSession } from "next-auth/react";
import NotPermission, { PermissionType } from "brancy/components/notOk/notPermission";
import PageComponent from "../../../../legacy-pages/message/comments";
import NotAllowed from "brancy/components/notOk/notAllowed";
import { RoleAccess } from "brancy/helper/loadingStatus";
import { PartnerRole } from "brancy/models/enums";
export default function Page() {
  const { data: session, status } = useSession();
  if (!RoleAccess(session, PartnerRole.Comment)) {
    return <NotAllowed />;
  }
  if (status === "loading") return null;
  if (status === "authenticated" && session && !session.user.commentPermission) {
    return <NotPermission permissionType={PermissionType.Comments} />;
  }

  return <PageComponent />;
}
