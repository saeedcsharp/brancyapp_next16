import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Loading from "saeed/components/notOk/loading";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "saeed/components/notifications/notificationBox";
import formatTimeAgo from "saeed/helper/formatTimeAgo";
import { LanguageKey } from "saeed/i18n";
import { SendCodeResult } from "saeed/models/ApiModels/User/SendCodeResult";
import { MethodType } from "saeed/helper/api";
import { InstagramerAccountInfo } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { IIpCondition } from "saeed/models/userPanel/login";
import styles from "./notLogin.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
export default function NotLogin({ removeMask }: { removeMask: () => void }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session, update } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const [showVerificationCode, setshowVerificationCode] = useState(false);
  const [instagramers, setInstagramers] = useState<InstagramerAccountInfo[]>([]);
  const [instaId, setInstaId] = useState("");
  const [preInstaToken, setPreInstaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const formatNumber = useCallback((num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, []);
  const getRemainingTime = useCallback((unixTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    let remaining = unixTime - now;
    if (remaining <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const days = Math.floor(remaining / (24 * 3600));
    remaining %= 24 * 3600;
    const hours = Math.floor(remaining / 3600);
    remaining %= 3600;
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    return { days, hours, minutes, seconds };
  }, []);

  const getTimeClass = useCallback((days: number) => {
    return days < 3 ? styles.blinkRed : days < 10 ? styles.blinkYellow : "";
  }, []);

  const sendInstaId = useCallback(async () => {
    if (!session) return;

    setLoading(true);
    try {
      const response = await clientFetchApi<boolean, SendCodeResult>("/api/preinstagramer/SendCode", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "username", value: instaId }], onUploadProgress: undefined });

      if (response.statusCode !== 200) {
        if (response.info.responseType === ResponseType.ExceedLoginAttempt) {
          notify(response.info.responseType, NotifType.Error, formatTimeAgo(response.info.actionBlockEnd! * 1000));
        } else {
          notify(response.info.responseType, NotifType.Error);
        }
      } else {
        setshowVerificationCode(true);
        setPreInstaToken(response.value.token);
      }
    } catch (err) {
      internalNotify(InternalResponseType.Network, NotifType.Error);
    } finally {
      setLoading(false);
    }
  }, [session, instaId]);

  const redirectToInstagram = useCallback(async () => {
    if (!session) return;

    try {
      const response = await clientFetchApi<boolean, string>("/api/preinstagramer/GetInstagramRedirect", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });

      if (response.succeeded) {
        router.push(response.value);
      } else {
        notify(response.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, [session, router]);

  const handleRedirectToInstagram = useCallback(async () => {
    if (!session) return;

    try {
      const response = await clientFetchApi<boolean, IIpCondition>("/api/user/ip", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
      if (response.succeeded) {
        if (!response.value.isInstagramAuthorize) {
          internalNotify(InternalResponseType.TurnOnProxy, NotifType.Warning);
        } else {
          await redirectToInstagram();
        }
      } else {
        notify(response.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, [session, redirectToInstagram]);

  const getInstagramers = useCallback(async () => {
    if (!session) return;

    try {
      const res = await clientFetchApi<boolean, InstagramerAccountInfo[]>("/api/user/GetMyInstagramers", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });

      if (res.succeeded && res.value.length > 0) {
        setInstagramers(res.value);
      } else if (res.succeeded && res.value.length === 0) {
        handleSwitchToUser();
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const handleSwitchToUser = useCallback(async () => {
    if (!session) return;

    await update({
      ...session,
      user: {
        ...session?.user,
        currentIndex: -1,
      },
    });
    removeMask();
    router.push("/");
  }, [session, update, removeMask, router]);

  const handleSwitchToInstagramer = useCallback(
    async (instagramer: InstagramerAccountInfo, i: number) => {
      if (!session) return;

      await update({
        ...session,
        user: {
          ...session?.user,
          loginStatus: instagramer.loginStatus,
          lastUpdate: Date.now(),
          profileUrl: instagramer.profileUrl,
          username: instagramer.username,
          fullName: instagramer.fullName ?? "",
          isShopper: instagramer.isShopper,
          hasPackage: instagramer.packageExpireTime * 1000 > Date.now(),
          isPrivate: instagramer.isPrivate,
          isShopperOrInfluencer: instagramer.isShopperOrInfluencer,
          isVerified: instagramer.isVerified,
          packageExpireTime: instagramer.packageExpireTime,
          pk: instagramer.pk,
          isInfluencer: instagramer.isInfluencer,
          isBusiness: instagramer.isBusiness,
          loginByFb: instagramer.loginByFb,
          loginByInsta: instagramer.loginByInsta,
          roles: instagramer.roles,
          isPartner: instagramer.isPartner,
          currentIndex: i,
        },
      });
      removeMask();
      router.push("/");
    },
    [session, update, removeMask, router]
  );

  const handleSignOut = useCallback(async () => {
    try {
      // await sendSessionId();
    } catch (error) {}

    await signOut({ redirect: false });

    // Commented code for csrf token and custom signout
    // const res = await fetch("/api/auth/csrf");
    // const csrf = await res.text();
    // var res2 = await fetch("/api/auth/signout", {
    //   method: "POST",
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: csrf
    // });
    // console.log(res2);
    // await update(null);

    removeMask();
    router.replace("/");
  }, [removeMask, router]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      sendInstaId();
      removeMask();
    },
    [sendInstaId, removeMask]
  );

  const handleBackInstaId = useCallback(() => {
    setshowVerificationCode(false);
  }, []);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    (e.target as HTMLImageElement).src = "/no-profile.svg";
  }, []);

  const handleTooltipToggle = useCallback(() => {
    setShowTooltip(!showTooltip);
    setCurrentStep(1); // Reset to first step when opening
  }, [showTooltip]);

  const handleNextStep = useCallback(() => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleCloseTooltip = useCallback(() => {
    setShowTooltip(false);
    setCurrentStep(1);
  }, []);

  // Handle keyboard navigation for tooltip
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!showTooltip) return;

      if (event.key === "Escape") {
        handleCloseTooltip();
      } else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        if (event.key === "ArrowRight" && currentStep < 4) {
          handleNextStep();
        } else if (event.key === "ArrowLeft" && currentStep > 1) {
          handlePrevStep();
        }
      }
    },
    [showTooltip, currentStep, handleCloseTooltip, handleNextStep, handlePrevStep]
  );

  const instagramerItems = useMemo(() => {
    return instagramers.map((v, i) => {
      const days = getRemainingTime(v.packageExpireTime).days;
      const timeClass = getTimeClass(days);

      return (
        <div
          key={`${v.pk}-${i}`}
          onClick={() => handleSwitchToInstagramer(v, i)}
          className={`instagramprofile ${session?.user.currentIndex === i ? "" : ""}`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleSwitchToInstagramer(v, i);
            }
          }}
          aria-label={`Switch to ${v.fullName} account`}>
          <img
            className="instagramimage"
            src={baseMediaUrl + v.profileUrl}
            alt={`${v.fullName} profile picture`}
            onError={handleImageError}
            loading="lazy"
          />

          <div className="instagramprofiledetail">
            <div className="counter">
              <div className="instagramusername">{v.fullName}</div>
              {session?.user.currentIndex === i && <div className="IDred">{t(LanguageKey.deactive)}</div>}
            </div>
            <div className="counter">
              <div className="instagramid">
                <span>@{v.username}</span>
              </div>
              <span className="IDgray">
                ID:{" "}
                {Array.isArray(session?.user.instagramerIds)
                  ? session?.user.instagramerIds.join(", ")
                  : session?.user.instagramerIds ?? "N/A"}
              </span>
            </div>
            <div className={`remaining ${timeClass}`}>
              {t(LanguageKey.remainingTime)}: {formatNumber(days)} {t(LanguageKey.countdown_Days)}
            </div>
          </div>
        </div>
      );
    });
  }, [
    instagramers,
    getRemainingTime,
    getTimeClass,
    session?.user.currentIndex,
    handleSwitchToInstagramer,
    t,
    formatNumber,
    handleImageError,
  ]);

  useEffect(() => {
    if (!session) return;
    getInstagramers();
  }, [session, getInstagramers]);

  if (!session) return null;
  return (
    <div className="dialogBg">
      {!showVerificationCode && (
        <div className="popup">
          {loading && <Loading />}
          {!loading && (
            <>
              {instagramers.length <= 1 && (
                <div className="headerandinput" style={{ alignItems: "center" }}>
                  <svg
                    style={{ marginBottom: "30px" }}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    width="120px"
                    viewBox="0 0 212 212">
                    <path
                      d="M28.7 190.3c34.7 29.6 125.8 29.2 160.3-2.7 31.2-35 30.1-126.2-.1-160.4l-5.6-5.5C148.6-7.9 57.5-7.4 23 24.5c-31.3 35-30.1 126 .1 160.3z"
                      fill="#2977FF"
                    />
                    <path
                      d="M156.9 118q1.1-.6 2.1-.3t1.5 1.5l.3.6q.9 1.8 1.3 3.8l.2.7a2 2 0 0 1-.6 1.8q-.6.7-1.4 1c-10 5.2-21.2 10-31.8 14.9-18.4 8-37.1 19.9-45.3 39.2q-.3 1-1 1.7a3 3 0 0 1-2 .6h-5.7q-.8 0-1.3-.2t-.6-.9v-1q.3-.4.4-.9a76 76 0 0 1 35.8-39.3c7.7-4.5 15.9-8.2 24-12q12.4-5.3 24-11.2Zm5.7 21h.7q.5.1.8.5v.2l.4 2q0 1.6-.6 2.7a4 4 0 0 1-2 1.7q-10.5 4-20.4 9.2v.1l-.3.1c-12 6-22.4 14.8-30.3 25.7q-1.1 2-3.4 2.2h-1l-2.6-.1q-.6 0-1-.8l.1-.6.3-.5.2-.5.2-.4q8.7-13.7 23.8-24l1-.7c10-6.7 22-12.2 32.7-16.4zm-19.2-36.7q1 0 2 .3l.2.1 4.7 3.1.2.2q.8.5 1 1.4 0 1-1 1.8c-10.5 5.8-22.4 10.4-33.6 15-21.3 8.6-42.6 20.1-52 42.3q-3 7.4-4.7 15.3v.1q-.6.9-1.3 1.3-.8.3-1.7 0-1.6-.3-3.3-1.3a5 5 0 0 1-2.4-2.8v-2.2q1.3-6.3 3.7-12.3c9.4-25.2 34.3-40 55.8-48.5 10.2-4.2 20.9-8.4 30.3-13.1q1-.6 2.1-.7Zm17 54.7h.6q.3.2.5.6 0 .8-.2 1.4l-.8 1.2q-1 1.3-2.3 1.8a79 79 0 0 0-25.3 18.2q-1 1.2-2.3 1.7l-1.4.3q-.8.2-1.3.1l-.6-.2-.3-.7.3-.6.5-.7a82 82 0 0 1 20.4-17.3l.1-.1a111 111 0 0 1 10.7-5.4zm-3-92.4h.5q.4 0 .5.3.3.4.2 1v.9a38 38 0 0 1-1 11h-.1c-12.5 13-30.8 19.2-47.3 25.9-24 9.2-47.3 18.7-60.5 42.2l-1 1.7v-15.9c0-1.5.8-2.2 1.6-3.3 13.4-16.8 33.4-24.8 53.2-32.5s39.5-15 52.8-30.4zm-10.2-24.8q.8-.2 1.4.2l1 1 .5.5.3.5q1.4 1.5 1.8 3 .4 1.4-.8 3.3l-.6.9c-12 19-32.9 27.7-52.6 36-17 7.2-34.6 14.5-47.1 28.4l-.6.6q-.3.4-.7.6l-.4.2-.6-.2-.3-.6v-8.4q0-1 .4-2l.1-.2c13.3-13.2 31.3-20 48-27.3 20.3-8.5 39-17 49-35.2q.3-1.1 1.2-1.3ZM124 28.9q1-.5 2-.2h.4l.6.1.6.2q.8.1 1.3 1l.1.2v.2a51 51 0 0 1-19.7 24.5c-9 6.5-19.3 11.6-28.6 16.2-10.4 5.4-21 11-30 18.4l-1 .5h-.5l-.4-.3v-.1q-.4-1-.3-1.9v-3.5h.1q.1-1 .8-1.7t1.4-1.2c11.6-8.9 26.2-15 39.4-22.2 13.3-7.2 25.4-15.4 32.2-28.4q.7-1.2 1.6-1.8Zm-27.6-1.4h.8l.3.2q.3.1.3.4.3.8-.3 1.5C87.3 43.4 71 52.7 54.7 62.3l-3.6 2-1 .6h-.8l-.6-.6q-.3-.8 0-1.8 0-1 .9-1.8c7.8-4.8 16-9.4 23.5-14.5s14.3-10.5 19.5-17q.6-.8 1.7-1.3t2-.4Zm-25.1 0q.5 0 .9.5.2.5 0 .8l-.2.5-.4.3-.3.3a91 91 0 0 1-21.2 15.5q-.7.1-1.4-.4-.3-.6-.1-1 .1-.6.4-1l1.4-1.1A91 91 0 0 0 69.2 28l1-.4q.6-.2 1-.1Z"
                      fill="#fff"
                      stroke="#fff"
                    />
                  </svg>
                  <h1
                    className="title"
                    style={{
                      justifyContent: "center",
                    }}>
                    {t(LanguageKey.welcomeToBrancy)}
                  </h1>
                  <p
                    className="explain"
                    style={{
                      textAlign: "center",
                    }}>
                    {t(LanguageKey.notloginexplain)}
                  </p>
                </div>
              )}
              {instagramers.length > 0 && (
                <div className="headerandinput">
                  <h2 className="title">{t(LanguageKey.addedaccounts)}</h2>
                  <div className={styles.accountsGrid}>{instagramerItems}</div>
                </div>
              )}
              <div className="headerandinput">
                <div
                  className={styles.connecttooltip}
                  onClick={handleTooltipToggle}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleTooltipToggle();
                    }
                  }}>
                  <img style={{ width: "20px", height: "20px" }} src="/tooltip.svg" alt="Tooltip icon" />

                  {t(LanguageKey.connectTutorial)}
                </div>
                <button
                  className="saveButton"
                  onClick={handleRedirectToInstagram}
                  type="button"
                  aria-label={t(LanguageKey.instagramConnect)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 2.2h4.9q4.7.2 4.9 5a83 83 0 0 1 0 9.7q-.2 4.7-5 4.9a83 83 0 0 1-9.6 0q-4.8-.2-5-5a83 83 0 0 1 0-9.6q.2-4.8 5-5zM12 0H7Q.6.6 0 7a84 84 0 0 0 0 10q.5 6.5 7 7a86 86 0 0 0 10 0q6.5-.5 7-7a84 84 0 0 0 0-10q-.5-6.5-7-7zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8m6.4-11.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8"
                      fill="currentColor"
                    />
                  </svg>
                  {t(LanguageKey.instagramConnect)}
                </button>
                <div className={styles.line} />
                <div className="ButtonContainer">
                  {session?.user.currentIndex !== -1 && (
                    <button
                      className="cancelButton"
                      onClick={handleSwitchToUser}
                      type="button"
                      aria-label={t(LanguageKey.switchaccount)}>
                      <svg
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 36 36"
                        aria-hidden="true">
                        <path
                          d="m26.71 22.256.633.363c1.07.603 2.686 1.515 3.793 2.6.693.677 1.35 1.57 1.47 2.664.127 1.164-.38 2.256-1.399 3.226-1.757 1.674-3.866 3.016-6.593 3.016H11.387c-2.728 0-4.837-1.342-6.594-3.016-1.018-.97-1.526-2.062-1.399-3.226.12-1.094.778-1.987 1.47-2.665 1.108-1.084 2.724-1.996 3.793-2.599l.634-.363c5.331-3.175 12.088-3.175 17.42 0"
                          fill="var(--color-dark-blue)"
                        />
                        <path
                          opacity=".4"
                          d="M10.125 9.75a7.875 7.875 0 1 1 15.75 0 7.875 7.875 0 0 1-15.75 0"
                          fill="var(--color-dark-blue)"
                        />
                      </svg>
                      {t(LanguageKey.switchaccount)}
                    </button>
                  )}
                  <button
                    className="stopButton"
                    onClick={handleSignOut}
                    type="button"
                    aria-label={t(LanguageKey.signout)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="var(--color-dark-red)"
                      viewBox="0 0 20 20"
                      aria-hidden="true">
                      <path
                        opacity=".6"
                        d="M14.8 15.2a1 1 0 0 0-.8.8c0 1.7-1.5 2.3-2.7 2.3h-5a3 3 0 0 1-2.8-2.8V4.8A3 3 0 0 1 6.3 2h5c1.2 0 2.7.6 2.7 2.3a.8.8 0 1 0 1.7 0c0-2.2-2-4-4.4-4h-5A4.2 4.2 0 0 0 2 4.8v10.8A4.2 4.2 0 0 0 6.3 20h5c2.5 0 4.4-1.6 4.4-3.9a1 1 0 0 0-.9-.8"
                      />
                      <path d="M18.5 10.6 15.3 14a.7.7 0 1 1-1-1l1.8-2h-4.7a.8.8 0 1 1 0-1.5H16l-1.9-2a.7.7 0 1 1 1-1l3.3 3.2a1 1 0 0 1 0 1" />
                    </svg>
                    {t(LanguageKey.signout)}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tooltip Modal */}
      {showTooltip && (
        <div className="dialogBg" style={{ zIndex: "10000" }} onClick={handleCloseTooltip} onKeyDown={handleKeyDown}>
          <div
            className="popup"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tooltip-title">
            <div className="headerparent">
              <h3 className="title" id="tooltip-title">
                {t(LanguageKey.instagramTutorialTitle)}
              </h3>
              <img
                style={{ cursor: "pointer", width: "30px", height: "30px" }}
                onClick={handleCloseTooltip}
                aria-label="Close tutorial"
                title="ℹ️ close"
                src="/close-box.svg"
              />
            </div>

            {currentStep === 1 && (
              <div className={styles.step}>
                <img className={styles.stepImage} src="/instagramlogin.png" alt="Instagram Login" />

                <div className="headerandinput">
                  <h4 className="title">{t(LanguageKey.instagramTutorialStep1Title)}</h4>
                  <p className="explain">{t(LanguageKey.instagramTutorialStep1Text)}</p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className={styles.step}>
                <img className={styles.stepImage} src="/permission.png" alt="Permission Grant" />

                <div className="headerandinput">
                  <h4 className="title">{t(LanguageKey.instagramTutorialStep2Title)}</h4>
                  <p className="explain">{t(LanguageKey.instagramTutorialStep2Text)}</p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className={styles.step}>
                <img className={styles.stepImage} src="/remove1.png" alt="Remove Step 1" />

                <div className="headerandinput">
                  <h4 className="title">{t(LanguageKey.instagramremoveStep1Title)}</h4>
                  <p className="explain">{t(LanguageKey.instagramremoveStep1text)}</p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className={styles.step}>
                <img className={styles.stepImage} src="/remove2.png" alt="Remove Step 2" />

                <div className="headerandinput">
                  <h4 className="title">{t(LanguageKey.instagramremoveStep2Title)}</h4>
                  <p className="explain">{t(LanguageKey.instagramremoveStep2text)}</p>
                </div>
              </div>
            )}
            <div className="headerparent">
              <div className={styles.stepIndicator}>
                <span
                  className={currentStep === 1 ? styles.activeStep : styles.inactiveStep}
                  onClick={() => setCurrentStep(1)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setCurrentStep(1);
                    }
                  }}
                  aria-label="Go to step 1"
                  style={{ cursor: "pointer" }}>
                  1
                </span>
                <span
                  className={currentStep === 2 ? styles.activeStep : styles.inactiveStep}
                  onClick={() => setCurrentStep(2)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setCurrentStep(2);
                    }
                  }}
                  aria-label="Go to step 2"
                  style={{ cursor: "pointer" }}>
                  2
                </span>
                <span
                  className={currentStep === 3 ? styles.activeStep : styles.inactiveStep}
                  onClick={() => setCurrentStep(3)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setCurrentStep(3);
                    }
                  }}
                  aria-label="Go to step 3"
                  style={{ cursor: "pointer" }}>
                  3
                </span>
                <span
                  className={currentStep === 4 ? styles.activeStep : styles.inactiveStep}
                  onClick={() => setCurrentStep(4)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setCurrentStep(4);
                    }
                  }}
                  aria-label="Go to step 4"
                  style={{ cursor: "pointer" }}>
                  4
                </span>
              </div>

              <div className={styles.navigationButtons}>
                {currentStep > 1 && (
                  <button className="cancelButton" onClick={handlePrevStep}>
                    {t(LanguageKey.previous)}
                  </button>
                )}
                {currentStep < 4 && (
                  <button className="saveButton" onClick={handleNextStep}>
                    {t(LanguageKey.next)}
                  </button>
                )}
                {currentStep === 4 && (
                  <button className="saveButton" onClick={handleCloseTooltip}>
                    {t(LanguageKey.understood)}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
