import React, { useEffect, useMemo, useState, useRef } from "react";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";

import Loading from "brancy/components/notOk/loading";
import { MethodType } from "brancy/helper/api";
import { clientFetchApiWithAccessToken } from "brancy/helper/clientFetchApi";
import { IRefreshToken, IVerifyCode } from "brancy/models/interfaces";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import styles from "./metaDirect.module.css";
const phrases = [
  "Initializing Brancy",
  "Loading your workspace",
  "Preparing your account",
  "Verifying your identity",
  "Checking account security",
  "Connecting to Instagram",
  "Syncing your profile",
  "Loading your content",
  "Fetching your posts",
  "Loading your stories",
  "Retrieving direct messages",
  "Loading your comments",
  "Updating analytics",
  "Analyzing engagement",
  "Preparing dashboard",
  "Loading AI services",
  "Optimizing performance",
  "Checking notifications",
  "Syncing media library",
  "Loading scheduled posts",
  "Preparing smart replies",
  "Loading saved templates",
  "Checking cloud storage",
  "Applying your preferences",
  "Securing your connection",
  "Finalizing setup",
  "Loading your experience",
  "Getting things ready",
  "Preparing your dashboard",
  "Loading your insights",
  "Syncing your data",
  "Optimizing your feed",
];
function shuffleArray(values: string[]) {
  const shuffled = [...values];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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
        setTimeout(() => {
          window.location.href =
            verifyCodeRes.value.origin +
            "/directlogin" +
            "?bearer=" +
            query.state +
            "&redirectUrl=" +
            "/home" +
            "&instagramerId=" +
            verifyCodeRes.value.instagramerId;
        }, 15000);
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
  const shuffledPhrases = useMemo(() => shuffleArray(phrases), []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [checkedIndex, setCheckedIndex] = useState(-1);
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setCheckedIndex(activeIndex);
      const timer2 = setTimeout(() => {
        setActiveIndex((prev) => {
          const next = (prev + 1) % shuffledPhrases.length;
          if (next === 0) {
            setCheckedIndex(-1);
          }
          return next;
        });
      }, 400);
      return () => clearTimeout(timer2);
    }, 2000);
    return () => clearTimeout(timer1);
  }, [activeIndex, shuffledPhrases.length]);
  const ROW_HEIGHT = 50;
  const BOX_HEIGHT = 130;

  const offset = BOX_HEIGHT / 2 - ROW_HEIGHT / 2;
  return (
    <>
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
            <Loading />
            <main className={`${styles.page} translate`}>
              <div className={styles.phraseBox}>
                <div
                  className={styles.phrases}
                  style={{
                    transform: `translateY(${offset - activeIndex * ROW_HEIGHT}px)`,
                  }}>
                  {shuffledPhrases.map((phrase, index) => (
                    <div key={index} className={styles.phraseRow}>
                      <svg className={styles.icon} width="32" height="32" viewBox="0 0 32 32">
                        <circle
                          cx="16"
                          cy="16"
                          r="15"
                          className={`${styles.loadingCheckCircle} ${checkedIndex >= index ? styles.activeCircle : ""}`}
                        />

                        <polygon
                          points="21.661,7.643 13.396,19.328 9.429,15.361 7.075,17.714 13.745,24.384 24.345,9.708"
                          className={`${styles.loadingCheck} ${checkedIndex >= index ? styles.activeCheck : ""}`}
                        />
                        <path
                          d="M16,0C7.163,0,0,7.163,0,16s7.163,16,16,16s16-7.163,16-16S24.837,0,16,0zM16,30C8.28,30,2,23.72,2,16C2,8.28,8.28,2,16,2c7.72,0,14,6.28,14,14C30,23.72,23.72,30,16,30z"
                          fill="var(--text-h1)"
                        />
                      </svg>
                      <div className={styles.text}>{phrase}...</div>
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
