"use client";
import { signOut, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import Loading from "../notOk/loading";
import { IRefreshToken } from "brancy/models/interfaces";
type DirectLogin = {
  res: IRefreshToken;
  redirectUrl: string;
  instagramerId: number;
};
export default function DirectLoginClient({ res, redirectUrl, instagramerId }: DirectLogin) {
  const router = useRouter();
  const hasRun = useRef(false);
  const currentIndex = res.role.instagramerIds.indexOf(instagramerId);
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    (async () => {
      await signOut({ redirect: false });
      const result = await signIn("direct-token", {
        token: res.token,
        expireTime: res.expireTime,
        socketAccessToken: res.socketAccessToken,
        currentIndex: currentIndex,
        instagramerIds: JSON.stringify(res.role.instagramerIds),
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
