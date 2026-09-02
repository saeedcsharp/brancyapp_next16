"use client";

import InterceptedRouteModal from "brancy/app/_compat/InterceptedRouteModal";
import PageComponent from "../../../../../../../legacy-pages/page/stories/storyinfo";
import { useSession } from "next-auth/react";
import { packageStatus } from "brancy/helper/loadingStatus";
import router from "next/router";

export default function Page() {
  const { data: session } = useSession();
  if (!packageStatus(session)) router.replace("/upgrade");
  return (
    <InterceptedRouteModal fallbackPath="/page/stories">
      <PageComponent />
    </InterceptedRouteModal>
  );
}
