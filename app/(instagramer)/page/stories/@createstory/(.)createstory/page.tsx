"use client";

import InterceptedRouteModal from "../../../../../_compat/InterceptedRouteModal";
import PageComponent from "../../../../../../legacy-pages/page/stories/createstory";

export default function Page() {
  return (
    <InterceptedRouteModal fallbackPath="/page/stories">
      <PageComponent />
    </InterceptedRouteModal>
  );
}
