"use client";

import { useSession } from "next-auth/react";
import NotPermission, { PermissionType } from "brancy/components/notOk/notPermission";
import PageComponent from "../../../../legacy-pages/page/statistics";
export default function Page() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;
  if (status === "authenticated" && session && !session.user.insightPermission) {
    return <NotPermission permissionType={PermissionType.Insights} />;
  }

  return <PageComponent onComponentClick={() => {}} />;
}
