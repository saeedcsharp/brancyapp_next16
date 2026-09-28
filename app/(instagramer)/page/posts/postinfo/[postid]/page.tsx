"use client";

import NotAllowed from "brancy/components/notOk/notAllowed";
import NotPermission, { PermissionType } from "brancy/components/notOk/notPermission";
import PageComponent from "../../../../../../legacy-pages/page/posts/postinfo";
import { PartnerRole } from "brancy/models/enums";
import { useSession } from "next-auth/react";
import { RoleAccess } from "brancy/helper/loadingStatus";
export default function Page() {
  const { data: session, status } = useSession();
  if (status === "loading") return null;
  if (!RoleAccess(session, PartnerRole.PageView)) {
    return <NotAllowed />;
  }
  if (status === "authenticated" && session && !session.user.publishPermission) {
    return <NotPermission permissionType={PermissionType.Content} />;
  }
  return <PageComponent />;
}
