"use client";

import NotAllowedShopper from "brancy/components/notOk/notAllowedShopper";
import PageComponent from "../../../../../legacy-pages/store/products/selectproduct";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Page() {
  const { data: session, status } = useSession();
  if (status !== "authenticated" || !session) return null;
  if (session.user.isInfluencer) return <NotAllowedShopper />;
  return <PageComponent />;
}
