"use client";

import PageComponent from "../../../legacy-pages/home/index";
import { useSession } from "next-auth/react";
export default function Page() {
  const { data: session, status } = useSession();

  if (status !== "authenticated" || !session) return null;
  return <PageComponent />;
}
