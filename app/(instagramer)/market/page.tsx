"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  useEffect(() => {}, [session, status]);
  if (status !== "authenticated" || !session) return null;

  useEffect(() => {
    router.push("/market/statistics");
  }, [router]);

  return null;
}
