"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();
  const { data: session } = useSession();
  if (session && session!.user.currentIndex > -1) router.push("/");

  useEffect(() => {
    router.push("/user/orders/cart");
  }, [router]);

  return null;
}
