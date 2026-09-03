"use client";

import PageComponent from "../../../../legacy-pages/market/statistics";
import { useSession } from "next-auth/react";
export default function Page() {
  const { status } = useSession();
  if (status !== "authenticated") return null;
  return <PageComponent />;
}
