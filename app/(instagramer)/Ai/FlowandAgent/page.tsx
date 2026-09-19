"use client";

import { useSession } from "next-auth/react";
import NotPermission, { PermissionType } from "brancy/components/notOk/notPermission";
import PageComponent from "../../../../legacy-pages/message/AIAndFlow/index";
export default function Page() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;
  if (status === "authenticated" && session && !session.user.messagePermission) {
    return <NotPermission permissionType={PermissionType.Messages} />;
  }

  return <PageComponent />;
}
