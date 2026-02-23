"use client";

import InterceptedRouteModal from "brancy/app/_compat/InterceptedRouteModal";
import PageComponent from "../../../../../../../legacy-pages/page/posts/postinfo";

export default function Page() {
  return (
    <InterceptedRouteModal fallbackPath="/page/posts">
      <PageComponent />
    </InterceptedRouteModal>
  );
}
