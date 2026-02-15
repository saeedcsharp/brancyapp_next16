import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "saeed/i18n";
import { GetServerResult, MethodType } from "saeed/helper/apihelper";
import { InstagramerAccountInfo } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { IIpCondition } from "saeed/models/userPanel/login";
import { IPartner_User } from "saeed/models/userPanel/setting";
import Loading from "../notOk/loading";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "../notifications/notificationBox";
import styles from "./switchAccount.module.css";
const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
function SwitchAccount(props: { removeMask: () => void }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session, update } = useSession();
  const [instagramers, setInstagramers] = useState<InstagramerAccountInfo[]>([]);
  const [partners, setPartners] = useState<IPartner_User[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnersLoading, setPartnersLoading] = useState(true);
  async function handleSwitchToUser() {
    await update({
      ...session,
      user: {
        ...session?.user,
        currentIndex: -1,
      },
    });
    props.removeMask();
    router.push("/");
  }
  async function getInstagramers() {
    try {
      const res = await GetServerResult<boolean, InstagramerAccountInfo[]>(
        MethodType.get,
        session,
        "user/GetMyInstagramers"
      );
      if (res.succeeded) {
        await getPartners(res.value);
        if (res.value.length > 0) setInstagramers(res.value);
        else handleSwitchToUser();
      }
      // if (res.succeeded && res.value.length > 0) setInstagramers(res.value);
      // else if (res.succeeded && res.value.length === 0) handleSwitchToUser();
      else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoading(false);
    }
  }

  async function getPartners(instagramers: InstagramerAccountInfo[]) {
    try {
      setPartnersLoading(true);
      const res = await GetServerResult<boolean, IPartner_User[]>(MethodType.get, session, "user/Session/GetPartners");
      if (res.succeeded) {
        const newIns = res.value.filter((x) => !instagramers.map((i) => i.username).includes(x.username));
        console.log("instagramersss", newIns);
        setPartners(newIns);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setPartnersLoading(false);
    }
  }

  async function handleApprovePartner(id: number) {
    try {
      const res = await GetServerResult<boolean, boolean>(
        MethodType.get,
        session,
        "user/Session/ApprovePartnerRequest",
        null,
        [{ key: "instagramerId", value: id.toString() }]
      );
      if (res.succeeded) {
        await getInstagramers();
        notify(ResponseType.Ok, NotifType.Success);
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }

  async function handleRejectPartner(id: number) {
    try {
      const res = await GetServerResult<boolean, boolean>(
        MethodType.get,
        session,
        "user/Session/RejectPartnerRequest",
        null,
        [{ key: "instagramerId", value: id.toString() }]
      );
      if (res.succeeded) {
        setPartners((x) => x.filter((p) => p.instagramerId !== id));
        notify(ResponseType.Ok, NotifType.Success);
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleSwitchToInstagramer(instagramer: InstagramerAccountInfo, i: number) {
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
    props.removeMask();
    router.push("/");
  }

  async function handleRedirectToInstagram() {
    try {
      const response = await GetServerResult<boolean, IIpCondition>(MethodType.get, session, "user/ip");
      if (response.succeeded) {
        if (!response.value.isInstagramAuthorize) internalNotify(InternalResponseType.TurnOnProxy, NotifType.Warning);
        else {
          await redirectToInstagram();
        }
      } else {
        notify(response.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }

  async function redirectToInstagram() {
    try {
      const response = await GetServerResult<boolean, string>(
        MethodType.get,
        session,
        "PreInstagramer/GetInstagramRedirect"
      );
      if (response.succeeded) {
        router.push(response.value);
      } else {
        notify(response.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }

  async function handleSwitchBackToInstagramer() {
    if (instagramers.length > 0) {
      const firstInstagramer = instagramers[0];
      await handleSwitchToInstagramer(firstInstagramer, 0);
    } else router.push("/user/instagramerLogin");
  }

  useEffect(() => {
    if (!session) return;
    getInstagramers();
  }, [session]);
  const getRemainingTime = (unixTime: number) => {
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
  };
  const getTimeClass = (days: number) => {
    return days < 3 ? styles.blinkRed : days < 10 ? styles.blinkYellow : "";
  };
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  const getAccountType = (instagramer: InstagramerAccountInfo): string => {
    return instagramer.isPartner ? t(LanguageKey.navbar_SubAdmin) : t(LanguageKey.admin);
  };

  return (
    <>
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ {t(LanguageKey.accountmanagement)}</title>
        <meta name="description" content="Manage your orders efficiently with Bran.cy" />
        <meta name="theme-color"></meta>
        <meta name="keywords" content="orders, manage, tools, Brancy, products, cart, checkout" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/orders" />
        {/* Add other meta tags as needed */}
      </Head>
      <div className="dialogBg" onClick={props.removeMask} />
      <main className={styles.popupmain}>
        <header className={styles.header}>
          <div className="headerparent">
            <div className="title">{t(LanguageKey.accountmanagement)}</div>
            <img
              onClick={props.removeMask}
              style={{
                cursor: "pointer",
                width: "30px",
                height: "30px",
                alignSelf: "end",
              }}
              title="ℹ️ close"
              src="/close-box.svg"
            />
          </div>
          <div className="headerparent">
            <div className="instagramprofile" style={{ height: "70px" }}>
              <img
                className="instagramimage"
                src={session?.user.profileUrl ? baseMediaUrl + session.user.profileUrl : "/no-profile.svg"}
                alt="Current user profile"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/no-profile.svg";
                }}
              />
              <div className={`${styles.instagramprofiledetail} instagramprofiledetail`}>
                <div className="instagramusername" style={{ display: "flex", gap: "8px", textAlign: "start" }}>
                  <div className={`${styles.accounttype} ${session?.user.isPartner ? styles.subadmin : styles.admin}`}>
                    <svg fill="none" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 17 17">
                      <path
                        d="M8.39 7.15a1.95 1.95 0 1 0 0 3.9 1.95 1.95 0 0 0 0-3.9
                                M11.95 6.32a.73.73 0 0 1-.74-.73.73.73 0 0 1 1.47 0c0 .4-.33.73-.73.73M8.39 12.1a3.01 3.01 0 1 1 0-6.02 3.01 3.01 0 0 1 0 6.02m3.1-9.97H5.5c-2.23 0-3.74 1.57-3.74 3.92v5.62c0 2.34 1.5 3.92 3.74 3.92h5.98c2.24 0 3.74-1.58 3.74-3.92V6.05c0-2.35-1.5-3.92-3.74-3.92"
                      />
                    </svg>
                    {session?.user.isPartner ? t(LanguageKey.navbar_SubAdmin) : t(LanguageKey.admin)}
                  </div>{" "}
                  {session?.user.fullName || session?.user.username}
                </div>
                <div className="instagramid" style={{ textAlign: "start" }}>
                  @{session?.user.username}{" "}
                  <span className="IDgray">
                    ID:{" "}
                    {Array.isArray(session?.user.instagramerIds)
                      ? session?.user.instagramerIds.join(", ")
                      : session?.user.instagramerIds ?? "N/A"}
                  </span>
                </div>
                <div className={`${styles.remainingTime}`}>
                  {t(LanguageKey.remainingTime)}:{" "}
                  <strong>
                    {session?.user.packageExpireTime
                      ? (() => {
                          const days = getRemainingTime(session.user.packageExpireTime).days;
                          return `${formatNumber(days)} ${t(LanguageKey.pageTools_Day)}`;
                        })()
                      : "--"}
                  </strong>
                </div>
              </div>
            </div>
            {session?.user.currentIndex === -1 && (
              <div
                className="cancelButton"
                style={{
                  minHeight: "48px",
                  width: "fit-content",
                  cursor: "pointer",
                }}
                onClick={handleSwitchBackToInstagramer}>
                <svg width="26px" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                  <path
                    d="m26.71 22.256.633.363c1.07.603 2.686 1.515 3.793 2.6.693.677 1.35 1.57 1.47 2.664.127 1.164-.38 2.256-1.399 3.226-1.757 1.674-3.866 3.016-6.593 3.016H11.387c-2.728 0-4.837-1.342-6.594-3.016-1.018-.97-1.526-2.062-1.399-3.226.12-1.094.778-1.987 1.47-2.665 1.108-1.084 2.724-1.996 3.793-2.599l.634-.363c5.331-3.175 12.088-3.175 17.42 0"
                    fill="var(--color-dark-blue)"
                  />
                  <path
                    opacity=".4"
                    d="M10.125 9.75a7.875 7.875 0 1 1 15.75 0 7.875 7.875 0 0 1-15.75 0"
                    fill="var(--color-dark-blue)"
                  />
                </svg>{" "}
                {t(LanguageKey.switchaccount)}
              </div>
            )}
            {session?.user.currentIndex !== -1 && (
              <div
                className="cancelButton"
                style={{ minHeight: "48px", width: "fit-content" }}
                onClick={handleSwitchToUser}>
                <svg width="26px" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
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
                {t(LanguageKey.SwitchtoUserpanel)}
              </div>
            )}
          </div>
        </header>
        <section className={styles.content}>
          <div className="headerparent">
            <div> </div>
            <div className={styles.addnewaccount} onClick={() => handleRedirectToInstagram()}>
              <svg
                width="24"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 32 32"
                stroke="var(--text-h1)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path opacity=".4" d="M16.7 4a12 12 0 1 1 0 24 12 12 0 0 1 0-24" />
                <path d="M21 16h-8.7m4.4-4.4v8.8" />
              </svg>
              {t(LanguageKey.addnewaccount)}
            </div>
          </div>
          <div className={styles.maincontent}>
            {loading && <Loading />}
            {!loading && (
              <>
                {/* Partnership Requests Section */}
                {!partnersLoading && partners && partners.length > 0 && (
                  <>
                    <div className="headerandinput">
                      <div className="title">{t(LanguageKey.subadmininvitation)}</div>
                      <div className="explain">
                        {t(LanguageKey.subadmininvitationexplain)} ({partners.length > 0 ? instagramers.length - 0 : 0})
                      </div>
                    </div>
                    {partners.map((partner) => (
                      <div key={partner.id} className={styles.accountlist}>
                        <div className="headerparent">
                          <div className="instagramprofile" style={{ height: "70px" }}>
                            <img
                              title="instagram profile picture"
                              className="instagramimage"
                              alt="instagram profile picture"
                              src={partner.profileUrl ? baseMediaUrl + partner.profileUrl : "/no-profile.svg"}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/no-profile.svg";
                              }}
                            />
                            <div className={`${styles.instagramprofiledetail} instagramprofiledetail`}>
                              <div className="instagramusername" style={{ display: "flex", gap: "8px" }}>
                                {partner.fullName || partner.username}
                              </div>
                              <div className="instagramid" style={{ textAlign: "start" }}>
                                @{partner.username}{" "}
                                <span className="IDgray">
                                  ID:{" "}
                                  {Array.isArray(session?.user.instagramerIds)
                                    ? session?.user.instagramerIds.join(", ")
                                    : session?.user.instagramerIds ?? "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="ButtonContainer" style={{ maxWidth: "fit-content" }}>
                            {!partner.approved && (
                              <div className="saveButton" onClick={() => handleApprovePartner(partner.instagramerId)}>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  width="24"
                                  stroke="#fff"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  fill="none">
                                  <path opacity=".4" d="M22 12a10 10 0 1 0-20 0 10 10 0 0 0 20 0Z" />
                                  <path d="m8 12.5 2.5 2.5L16 9" />
                                </svg>
                                {t(LanguageKey.accept)}
                              </div>
                            )}
                            <div className="stopButton" onClick={() => handleRejectPartner(partner.instagramerId)}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="24"
                                stroke="var(--color-dark-red)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none">
                                <path d="M22 12a10 10 0 1 0-20 0 10 10 0 0 0 20 0" opacity=".4" />
                                <path d="M15 15 9 9m0 6 6-6" />
                              </svg>
                              {t(LanguageKey.reject)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {instagramers.length > 1 ? (
                  <>
                    <div className={styles.headertext}>
                      {t(LanguageKey.addedaccounts)} ({instagramers.length > 0 ? instagramers.length - 1 : 0})
                    </div>
                    <div className={styles.accountlist}>
                      {instagramers.map((v, i) => {
                        // Don't show the current active account
                        if (session?.user.currentIndex === i) return null;

                        const days = getRemainingTime(v.packageExpireTime).days;
                        const timeClass = getTimeClass(days);
                        return (
                          <div key={i} className={styles.accountlistItem}>
                            <div
                              key={i}
                              className="instagramprofile"
                              onClick={() => handleSwitchToInstagramer(v, i)}
                              style={{ height: "70px" }}>
                              <img
                                title="instagram profile picture"
                                className="instagramimage"
                                alt="instagram profile picture"
                                src={baseMediaUrl + v.profileUrl}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/no-profile.svg";
                                }}
                              />
                              <div className={`${styles.instagramprofiledetail} instagramprofiledetail`}>
                                <div className="counter">
                                  <div
                                    className={`${styles.accounttype} ${v.isPartner ? styles.subadmin : styles.admin}`}>
                                    <svg
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="15"
                                      height="15"
                                      viewBox="0 0 17 17">
                                      <path
                                        d="M8.39 7.15a1.95 1.95 0 1 0 0 3.9 1.95 1.95 0 0 0 0-3.9
                                    M11.95 6.32a.73.73 0 0 1-.74-.73.73.73 0 0 1 1.47 0c0 .4-.33.73-.73.73M8.39 12.1a3.01 3.01 0 1 1 0-6.02 3.01 3.01 0 0 1 0 6.02m3.1-9.97H5.5c-2.23 0-3.74 1.57-3.74 3.92v5.62c0 2.34 1.5 3.92 3.74 3.92h5.98c2.24 0 3.74-1.58 3.74-3.92V6.05c0-2.35-1.5-3.92-3.74-3.92"
                                      />
                                    </svg>
                                    {getAccountType(v)}
                                  </div>{" "}
                                  <div className="instagramusername">{v.fullName}</div>
                                  {/* {session?.user.currentIndex !== i && (
                                    <div className="IDred">{t(LanguageKey.deactive)}</div>
                                  )} */}
                                </div>

                                <div className="counter">
                                  <div className="instagramid" title={v.username}>
                                    @{v.username}
                                  </div>
                                  <span className="IDgray">
                                    ID:{" "}
                                    {Array.isArray(session?.user.instagramerIds)
                                      ? session?.user.instagramerIds.join(", ")
                                      : session?.user.instagramerIds ?? "N/A"}
                                  </span>
                                </div>
                                <div className={`${styles.remainingTime} ${timeClass}`}>
                                  {t(LanguageKey.remainingTime)}:{" "}
                                  <strong>
                                    {formatNumber(days)} {t(LanguageKey.pageTools_Day)}
                                  </strong>
                                </div>
                              </div>
                            </div>
                            <div
                              onClick={() => handleSwitchToInstagramer(v, i)}
                              className="cancelButton"
                              style={{ maxWidth: "fit-content" }}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                width="24"
                                stroke="var(--color-dark-blue)"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round">
                                <path d="M5 19.6v-2.2h2.3m13-12v2.2h-2.2" />
                                <path
                                  opacity=".6"
                                  d="m15.4 11-1.2-1.2c-.8-.8-2.2-.8-3 0L10 11c-.9.9-.9 2.3 0 3.1l1.1 1.2c.9.8 2.3.8 3.1 0l1.2-1.2a2 2 0 0 0 0-3"
                                />
                                <path d="M5.3 17.4A9 9 0 0 0 21.7 13M20 7.6A9 9 0 0 0 3.8 12" />
                              </svg>
                              {t(LanguageKey.SwitchtoAccount)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="explain" style={{ textAlign: "center", marginTop: "20px" }}>
                    {t(LanguageKey.SwitchtoAccountexplain)}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default SwitchAccount;
