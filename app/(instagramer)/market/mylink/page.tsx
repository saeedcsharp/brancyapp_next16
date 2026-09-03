"use client";

import { useEffect } from "react";
import PageComponent from "../../../../legacy-pages/market/mylink";
import { useSession } from "next-auth/react";
import router from "next/router";
export default function Page() {
  const { data: session, status } = useSession();

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
