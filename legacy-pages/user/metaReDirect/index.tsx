import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import { MethodType } from "brancy/helper/api";
import { clientFetchApiWithAccessToken } from "brancy/helper/clientFetchApi";
import { IRefreshToken, IVerifyCode } from "brancy/models/interfaces";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import styles from "./metaDirect.module.css";

export default function MetaRedirect() {
  const router = useRouter();
  const { query } = router;
  const hasRun = useRef(false);
  async function createInstagramerAccount() {
    console.log("createInstagramerAccount");
    try {
      const verifyCodeRes = await clientFetchApiWithAccessToken<boolean, IVerifyCode>(
        "/api/preinstagramer/VerifyCode",
        {
          methodType: MethodType.get,
          accessToken: "Bearer" + " " + query.state,
          data: null,
          queries: [{ key: "code", value: query.code as string }],
          onUploadProgress: undefined,
        },
      );
      if (verifyCodeRes.succeeded) {
        const token: IRefreshToken = {
          token: "Bearer" + " " + query.state,
          expireTime: Date.now() + 1000 * 60 * 60,
          socketAccessToken: "",
          role: {
            instagramerIds: [verifyCodeRes.value.instagramerId],
            isInstagramer: false,
            isPartners: [false],
            userId: 0,
          },
          id: 0,
        };
        console.log("verifyCodeRes", verifyCodeRes);
        console.log("refresh token", token);

        const redirectUrl = verifyCodeRes.value.origin;
        const instagramerId = verifyCodeRes.value.instagramerId;
        const currentIndex = token.role.instagramerIds.indexOf(instagramerId);

        if (hasRun.current) return;
        hasRun.current = true;

        await signOut({ redirect: false });
        console.log("Direct login with token:", token, "redirectUrl:", redirectUrl, "instagramerId:", instagramerId);
        const result = await signIn("direct-token", {
          token: token.token,
          expireTime: token.expireTime,
          socketAccessToken: token.socketAccessToken,
          currentIndex: currentIndex,
          instagramerIds: JSON.stringify(token.role.instagramerIds),
          redirect: false,
        });
        if (result?.ok) {
          router.replace(redirectUrl || "/");
        } else {
          console.error("Direct login failed:", result?.error);
          router.push("/");
        }
      } else {
        console.log("verifyCodeRes.info.responseType", verifyCodeRes.info.responseType);
        notify(verifyCodeRes.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      console.error("Error in createInstagramerAccount:", error);
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  useEffect(() => {
    if (router.isReady) {
      if (query.state === undefined || query.code === undefined) router.push("/");
      else {
        createInstagramerAccount();
      }
    }
  }, [router.isReady]);

  return (
    <div
      className="dialogBg"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
      <div className={styles.colorring}>
        <img className={styles.colorring1} src="/ring.svg" />
        <img className={styles.colorring2} src="/ring.svg" />
        <img className={styles.colorring3} src="/ring.svg" />
        <img className={styles.colorring4} src="/ring.svg" />
      </div>
      <div className={styles.popupsignup} style={{ alignItems: "flex-end" }}>
        <div className={styles.form}>
          <div className="headerandinput" style={{ alignItems: "center", textAlign: "center" }}>
            <div className="explain" style={{ alignItems: "center", textAlign: "center" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
