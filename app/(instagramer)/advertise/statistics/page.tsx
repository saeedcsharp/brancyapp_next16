"use client";

import NotAllowedAdvertiser from "brancy/components/notOk/notAllowedAdvertiser";
import { useSession } from "next-auth/react";
import PageComponent from "../../../../legacy-pages/advertise/statistics";
import Soon from "brancy/components/notOk/soon";
import NotAllowed from "brancy/components/notOk/notAllowed";
import { RoleAccess } from "brancy/helper/loadingStatus";
import { PartnerRole } from "brancy/models/enums";

export default function Page() {
  const { data: session, status } = useSession();
  if (status !== "authenticated" || !session) return null;
  return <Soon />;
  if (session?.user.isShopper) return <NotAllowedAdvertiser />;
  if (!RoleAccess(session, PartnerRole.Ads)) {
    return <NotAllowed />;
  }
  return <PageComponent />;
}
