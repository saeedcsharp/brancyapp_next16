"use client";

import NotAllowed from "brancy/components/notOk/notAllowed";
import { RoleAccess } from "brancy/helper/loadingStatus";
import { BusinessType, PartnerRole } from "brancy/models/enums";
import { useSession } from "next-auth/react";
import PageComponent from "../../../../components/wallet/payment";

export default function Page() {
  const { data: session, status } = useSession();
  if (session?.user.businessType === BusinessType.None || !RoleAccess(session, PartnerRole.Transaction)) {
    return <NotAllowed />;
  }

  if (status !== "authenticated" || !session) return null;
  return <PageComponent />;
}
