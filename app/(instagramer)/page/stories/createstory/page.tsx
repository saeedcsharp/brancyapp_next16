"use client";

import PageComponent from "../../../../../legacy-pages/page/stories/createstory";
export default function Page() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;
  if (status === "authenticated" && session && !session.user.publishPermission) {
    return <NotPermission permissionType={PermissionType.Content} />;
  }

  return <PageComponent />;
}
