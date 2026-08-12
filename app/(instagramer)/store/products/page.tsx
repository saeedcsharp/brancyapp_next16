"use client";

import NotAllowedShopper from "brancy/components/notOk/notAllowedShopper";
import PageComponent from "../../../../legacy-pages/store/products/index";
import { useSession } from "next-auth/react";
export default function Page() {
  const { data: session } = useSession();
  if (session?.user.isInfluencer) return <NotAllowedShopper />;
  return <PageComponent />;
}
