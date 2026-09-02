"use client";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { packageStatus } from "brancy/helper/loadingStatus";
import { useRouter } from "next/navigation";
export default function Page() {
  const { data: session } = useSession();
  const router = useRouter();
  if (!packageStatus(session)) router.replace("/upgrade");
  redirect("/store/products");
}
