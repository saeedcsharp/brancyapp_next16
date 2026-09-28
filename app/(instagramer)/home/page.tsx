"use client";
import { useSession } from "next-auth/react";
import PageComponent from "../../../legacy-pages/home/index";
export default function Page() {
  const { data: session, status } = useSession();
  if (status !== "authenticated" || !session) return null;
  return <PageComponent />;
}
