"use client";

import InterceptedRouteModal from "brancy/app/_compat/InterceptedRouteModal";
import PageComponent from "../../../../../legacy-pages/page/stories/createstory";

export default function Page() {
  return (
    <InterceptedRouteModal fallbackPath="/page/stories">
      <PageComponent />
    </InterceptedRouteModal>
  );
}
