"use client";
import { signOut, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import Loading from "../notOk/loading";

export default function DirectLoginClient({ res, redirectUrl, currentIndex }: any) {
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    (async () => {
      await signOut({ redirect: false });
      const result = await signIn("direct-token", {
        token: res.value.token,
        expireTime: res.value.expireTime,
        socketAccessToken: res.value.socketAccessToken,
        currentIndex: currentIndex,
        instagramerIds: res.value.role.instagramerIds,
        redirect: false,
      });

      if (result?.ok) {
        console.log("instagrameridssssssssssssss", result);
        router.push(redirectUrl || "/");
      } else {
        console.error("Direct login failed:", result?.error);
        router.push("/");
      }
    })();
  }, []);

  return <Loading />;
}
