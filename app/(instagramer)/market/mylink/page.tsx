"use client";

import { useEffect } from "react";
import PageComponent from "../../../../legacy-pages/market/mylink";
import { useSession } from "next-auth/react";
import router from "next/router";
import NotAllowed from "brancy/components/notOk/notAllowed";
import { RoleAccess } from "brancy/helper/loadingStatus";
import { PartnerRole } from "brancy/models/enums";
export default function Page() {
  const { data: session, status } = useSession();

  if (!RoleAccess(session, PartnerRole.Bio)) {
    return <NotAllowed />;
  }
  useEffect(() => {
    if (status !== "authenticated" || !session) return;

    if (session.user.currentIndex === -1) {
      router.push("/user");
      return;
    }
  }, [session, status]);

  if (status !== "authenticated" || !session) return null;
  if (session.user.currentIndex === -1) return null;

  return <PageComponent />;
}
