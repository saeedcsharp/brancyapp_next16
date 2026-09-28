"use client";
import { useSession } from "next-auth/react";
import NotPermission, { PermissionType } from "brancy/components/notOk/notPermission";
import PageComponent from "../../../../legacy-pages/message/Properties";
import { PartnerRole } from "brancy/models/enums";
import { RoleAccess } from "brancy/helper/loadingStatus";
import NotAllowed from "brancy/components/notOk/notAllowed";
export default function Page() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;
  if (status === "authenticated" && session && !session.user.messagePermission) {
    return <NotPermission permissionType={PermissionType.Messages} />;
  }
  if (!RoleAccess(session, PartnerRole.Automatics)) return <NotAllowed />;
  return <PageComponent />;
}
