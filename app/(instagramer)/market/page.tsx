"use client";

import { packageStatus } from "brancy/helper/loadingStatus";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();
  const { data: session } = useSession();
  if (!packageStatus(session)) router.replace("/upgrade");

  useEffect(() => {
    router.push("/market/statistics");
  }, [router]);

  return null;
}
