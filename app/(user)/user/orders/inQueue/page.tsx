"use client";
import { useSession } from "next-auth/react";
import router from "next/router";
import PageComponent from "../../../../../legacy-pages/user/orders/inQueue/index";

export default function Page() {
  const { data: session } = useSession();
  if (session && session!.user.currentIndex > -1) router.push("/");
  return <PageComponent />;
}
