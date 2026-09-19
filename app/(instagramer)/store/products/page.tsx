"use client";

import NotAllowed from "brancy/components/notOk/notAllowed";
import NotAllowedShopper from "brancy/components/notOk/notAllowedShopper";
import { RoleAccess } from "brancy/helper/loadingStatus";
import { PartnerRole } from "brancy/models/enums";
import { useSession } from "next-auth/react";
import PageComponent from "../../../../legacy-pages/store/products/index";
export default function Page() {
  const { data: session, status } = useSession();
  if (status !== "authenticated" || !session) return null;
  if (!RoleAccess(session, PartnerRole.Products)) {
    return <NotAllowed />;
  }
  if (session.user.isInfluencer) return <NotAllowedShopper />;
  return <PageComponent />;
}
