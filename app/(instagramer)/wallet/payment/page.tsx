"use client";

import PageComponent from "../../../../components/wallet/payment";

export default function Page() {
  const { data: session, status } = useSession();
  if (!RoleAccess(session, PartnerRole.Transaction)) {
    return <NotAllowed />;
  }

  if (status !== "authenticated" || !session) return null;
  return <PageComponent />;
}
