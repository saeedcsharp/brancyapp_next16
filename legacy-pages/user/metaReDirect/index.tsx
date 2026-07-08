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
        window.location.href =
          verifyCodeRes.value.origin +
          "/directlogin" +
          "?bearer=" +
          query.state +
          "&redirectUrl=" +
          "/home" +
          "&instagramerId=" +
          verifyCodeRes.value.instagramerId;
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
