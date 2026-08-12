"use client";
import { useSession } from "next-auth/react";
import PageComponent from "../../../../legacy-pages/store/orders";
import NotAllowedShopper from "brancy/components/notOk/notAllowedShopper";

export default function Page() {
  const { data: session } = useSession();
  if (session?.user.isInfluencer) return <NotAllowedShopper />;
  return <PageComponent />;
}
