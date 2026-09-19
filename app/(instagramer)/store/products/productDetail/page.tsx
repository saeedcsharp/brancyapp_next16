"use client";

import NotAllowedShopper from "brancy/components/notOk/notAllowedShopper";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { PartnerRole } from "brancy/models/enums";
import NotAllowed from "brancy/components/notOk/notAllowed";
import { Suspense } from "react";
import PageComponent from "../../../../../legacy-pages/store/products/productDetail";
import { RoleAccess } from "brancy/helper/loadingStatus";
function ProductDetailRoute() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const tempId = searchParams.get("tempId");
  if (status !== "authenticated" || !session) return null;
  if (session.user.isInfluencer) return <NotAllowedShopper />;
  if (!RoleAccess(session, PartnerRole.Products)) {
    return <NotAllowed />;
  }
  return <PageComponent tempId={tempId ?? ""} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <ProductDetailRoute />
    </Suspense>
  );
}
