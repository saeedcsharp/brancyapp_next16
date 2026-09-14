"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    router.replace((session?.user.currentIndex ?? -1) > -1 ? "/" : "/user/home");
  }, [router, session, status]);

  return null;
}
