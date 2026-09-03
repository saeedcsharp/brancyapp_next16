"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  useEffect(() => {
    if (status !== "authenticated" || !session) return;
    if (session.user.currentIndex === -1) {
      router.push("/user");
    } else {
      router.push("/message/direct");
    }
  }, [router, session, status]);

  return null;
}
