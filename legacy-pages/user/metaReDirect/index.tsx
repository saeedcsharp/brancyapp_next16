import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "saeed/components/notifications/notificationBox";
import { IRefreshToken } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { MethodType } from "saeed/helper/apihelper";
import styles from "./metaDirect.module.css";
import { clientFetchApi, clientFetchApiWithAccessToken } from "saeed/helper/clientFetchApi";

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
      const response = await clientFetchApiWithAccessToken<boolean, number>("/api/preinstagramer/VerifyCode", { methodType: MethodType.get, accessToken: "Bearer" + " " + query.state, data: null, queries: [{ key: "code", value: query.code as string }], onUploadProgress: undefined });
      if (response.succeeded && session != null) {
        try {
          if (
            session.user.currentIndex > -1 &&
            session?.user.instagramerIds[session.user.currentIndex] == response.value
          ) {
            await update({
              ...session,
              user: {
                ...session.user,
                loginByInsta: true,
                lastUpdate: null,
              },
            });
          } else if (session.user.instagramerIds.indexOf(response.value) != -1) {
            await update({
              ...session,
              user: {
                ...session.user,
                currentIndex: session.user.instagramerIds.indexOf(response.value),
                lastUpdate: 0,
                loginByInsta: true,
              },
            });
          } else {
            {
              try {
                const res = await clientFetchApi<boolean, IRefreshToken>("/api/user/RefreshToken", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
                if (res.succeeded) {
                  await update({
                    ...session,
                    user: {
                      // ...session?.user,
                      expireTime: res.value.expireTime,
                      id: res.value.id,
                      instagramerIds: res.value.role.instagramerIds,
                      accessToken: res.value.token,
                      socketAccessToken: res.value.socketAccessToken,
                      currentIndex: res.value.role.instagramerIds.indexOf(response.value),
                      lastUpdate: 0,
                    },
                  });
                  internalNotify(InternalResponseType.FetchingYourData, NotifType.Success);

                  // Add 5 second delay
                  await new Promise((resolve) => setTimeout(resolve, 5000));
                }
              } catch (error) {
                console.log(error);
              }
            }
          }
          router.replace("/");
        } catch (error) {
          console.log("error on redirect", error);
        }
      } else {
        notify(response.info.responseType, NotifType.Warning);
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
