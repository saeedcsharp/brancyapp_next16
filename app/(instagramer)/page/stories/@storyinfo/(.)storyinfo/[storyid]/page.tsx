"use client";

import InterceptedRouteModal from "saeed/app/_compat/InterceptedRouteModal";
import PageComponent from "saeed/legacy-pages/page/stories/storyinfo";

export default function Page() {
  return (
    <InterceptedRouteModal fallbackPath="/page/stories">
      <PageComponent />
    </InterceptedRouteModal>
  );
}
