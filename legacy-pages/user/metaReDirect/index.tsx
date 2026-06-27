import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "brancy/components/notifications/notificationBox";
import { MethodType } from "brancy/helper/api";
import styles from "./metaDirect.module.css";
import { clientFetchApi, clientFetchApiWithAccessToken } from "brancy/helper/clientFetchApi";
import { IRefreshToken } from "brancy/models/interfaces";
import DirectLoginClient from "brancy/components/signIn/directLoginClient";

export default function MetaRedirect() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { query } = router;
  const [onLogin, setOnLogin] = useState(false);
  const onLoginRef = useRef(onLogin);
  useEffect(() => {
    onLoginRef.current = onLogin;
  }, [onLogin]);

  async function createInstagramerAccount() {
    console.log("createInstagramerAccount");
    try {
      const verifyCodeRes = await clientFetchApiWithAccessToken<boolean, number>("/api/preinstagramer/VerifyCode", {
        methodType: MethodType.get,
        accessToken: "Bearer" + " " + query.state,
        data: null,
        queries: [{ key: "code", value: query.code as string }],
        onUploadProgress: undefined,
      });
      if (verifyCodeRes.succeeded && session != null) {
        try {
          const refreshRes = await clientFetchApi<boolean, IRefreshToken>("/api/user/RefreshToken", {
            methodType: MethodType.get,
            session: session,
            data: undefined,
            queries: undefined,
            onUploadProgress: undefined,
          });
          if (refreshRes.succeeded) {
            <DirectLoginClient res={refreshRes.value} redirectUrl={"/home"} instagramerId={verifyCodeRes.value} />;
          }
          router.replace("/");
        } catch (error) {
          console.log("error on redirect", error);
        }
      } else {
        notify(verifyCodeRes.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      router.push("/");
    }
  }
  useEffect(() => {
    console.log("OnLogin", onLoginRef);
    console.log("session", session);
    if (!session || onLoginRef.current) return;
    console.log("after sesionnnnnnnnnnn", session);
    if (router.isReady) {
      if (query.state === undefined || query.code === undefined) router.push("/");
      else {
        setOnLogin(true);
        createInstagramerAccount();
      }
    }
  }, [router.isReady, session]);
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
