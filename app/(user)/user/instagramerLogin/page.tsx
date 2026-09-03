"use client";
import { useSession } from "next-auth/react";
import router from "next/router";
import PageComponent from "../../../../legacy-pages/user/instagramerLogin/index";

export default function Page() {
  const {} = useSession();
  return <PageComponent removeMask={() => {}} />;
}
