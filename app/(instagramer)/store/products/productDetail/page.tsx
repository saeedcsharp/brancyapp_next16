"use client";

import { Suspense } from "react";
import PageComponent from "../../../../../legacy-pages/store/products/productDetail";
import NotAllowedShopper from "brancy/components/notOk/notAllowedShopper";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { packageStatus } from "brancy/helper/loadingStatus";
import router from "next/router";
function ProductDetailRoute() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const tempId = searchParams.get("tempId");
  if (!packageStatus(session)) router.replace("/upgrade");
  if (session?.user.isInfluencer) return <NotAllowedShopper />;
  return <PageComponent tempId={tempId ?? ""} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <ProductDetailRoute />
    </Suspense>
  );
}
