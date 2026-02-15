"use client";

import InterceptedRouteModal from "saeed/app/_compat/InterceptedRouteModal";
import PageComponent from "saeed/legacy-pages/page/posts/postinfo";

export default function Page() {
  return (
    <InterceptedRouteModal fallbackPath="/page/posts">
      <PageComponent />
    </InterceptedRouteModal>
  );
}
