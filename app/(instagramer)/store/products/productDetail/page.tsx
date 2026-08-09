"use client";

import { Suspense } from "react";
import PageComponent from "../../../../../legacy-pages/store/products/productDetail";
import NotAllowedShopper from "brancy/components/notOk/notAllowedShopper";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function ProductDetailRoute() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const tempId = searchParams.get("tempId");
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
