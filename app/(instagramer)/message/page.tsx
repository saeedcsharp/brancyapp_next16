"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  useEffect(() => {
    if (session?.user.currentIndex === -1) {
      router.push("/user");
    } else {
      router.push("/message/direct");
    }
  }, [router, session]);

  return null;
}
