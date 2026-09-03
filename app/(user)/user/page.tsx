"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function Page() {
  const router = useRouter();
  const { data: session } = useSession();
  if (session && session!.user.currentIndex > -1) router.push("/");
  useEffect(() => {
    router.push("/user/home");
  }, [router]);

  return null;
}
