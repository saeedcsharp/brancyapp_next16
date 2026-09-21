"use client";
import { useSession } from "next-auth/react";
import InterceptedRouteModal from "brancy/app/_compat/InterceptedRouteModal";
import PageComponent from "../../../../../../legacy-pages/page/stories/storyinfo";
import NotAllowed from "brancy/components/notOk/notAllowed";
import { PartnerRole } from "brancy/models/enums";
import { RoleAccess } from "brancy/helper/loadingStatus";
import NotPermission, { PermissionType } from "brancy/components/notOk/notPermission";

export default function Page() {
  const { data: session, status } = useSession();

  if (!RoleAccess(session, PartnerRole.PageView)) {
    return <NotAllowed />;
  }
  if (status === "authenticated" && session && !session.user.publishPermission) {
    return <NotPermission permissionType={PermissionType.Content} />;
  }
  return (
    <InterceptedRouteModal fallbackPath="/page/stories">
      <PageComponent />
    </InterceptedRouteModal>
  );
}
