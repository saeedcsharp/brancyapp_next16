"use client";

import NotPermission, { PermissionType } from "brancy/components/notOk/notPermission";
import { useSession } from "next-auth/react";
import PageComponent from "../../../../../legacy-pages/page/stories/createstory";
import NotAllowed from "brancy/components/notOk/notAllowed";
import { RoleAccess } from "brancy/helper/loadingStatus";
import { PartnerRole } from "brancy/models/enums";
export default function Page() {
  const { data: session, status } = useSession();

  if (!RoleAccess(session, PartnerRole.PageView)) {
    return <NotAllowed />;
  }
  if (status === "loading") return null;
  if (status === "authenticated" && session && !session.user.publishPermission) {
    return <NotPermission permissionType={PermissionType.Content} />;
  }
  if (!RoleAccess(session, PartnerRole.Publish)) {
    return <PageComponent showNotAllowed />;
  }

  return <PageComponent />;
}
