"use client";

import InterceptedRouteModal from "brancy/app/_compat/InterceptedRouteModal";
import PageComponent from "../../../../../../../legacy-pages/page/stories/storyinfo";
import { useSession } from "next-auth/react";

export default function Page() {
  const { status } = useSession();
  if (status !== "authenticated") return null;
  return (
    <InterceptedRouteModal fallbackPath="/page/stories">
      <PageComponent />
    </InterceptedRouteModal>
  );
}
