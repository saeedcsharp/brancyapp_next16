import { useSession } from "next-auth/react";
import { useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import Dotmenu from "brancy/components/design/dotMenu/dotMenu";
import Loading from "brancy/components/notOk/loading";
import { LoginStatus, RoleAccess } from "brancy/helper/loadingStatus";
import initialzedTime from "brancy/helper/manageTimer";
import { LanguageKey } from "brancy/i18n";
import { ILoadingStatus, IPartner } from "brancy/models/_AccountInfo/InstagramerAccountInfo";
import styles from "brancy/components/setting/subAdmin/general.module.css";

export default function Partners({
  partners,
  handleShowEditPartner,
  handleShowAddPartner,
  handleDeletePartner,
}: {
  partners: IPartner[] | null;
  handleShowEditPartner: (partner: IPartner) => void;
  handleShowAddPartner: () => void;
  handleDeletePartner: (userId: number) => void;
}) {
  const { t } = useTranslation();
  interface AutoReplyState {
    isHidden: boolean;
    showSetting: boolean;
    activeAutoDirect: boolean;
    loadingStatus: ILoadingStatus;
  }
  type AutoReplyAction =
    | { type: "TOGGLE_HIDDEN" }
    | { type: "TOGGLE_SETTINGS" }
    | { type: "SET_AUTO_DIRECT"; payload: boolean }
    | { type: "SET_LOADING_STATUS"; payload: Partial<ILoadingStatus> };

  const { data: session } = useSession();
  const [isHidden, setIsHidden] = useState(false);
  const [state, dispatch] = useReducer(autoReplyReducer, {
    isHidden: false,
    showSetting: false,
    activeAutoDirect: true,
    loadingStatus: {
      notShopper: false,
      notBasePackage: false,
      notFeature: false,
      loading: false,
      notPassword: false,
      ok: true,
      notBusiness: false,
      notLoginByFb: false,
    },
  });

  const [loading, setLoading] = useState(LoginStatus(session) && RoleAccess(session));
  const handleCircleClick = () => {
    setIsHidden(!isHidden);
  };

  function autoReplyReducer(state: AutoReplyState, action: AutoReplyAction): AutoReplyState {
    switch (action.type) {
      case "TOGGLE_HIDDEN":
        return { ...state, isHidden: !state.isHidden };
      case "TOGGLE_SETTINGS":
        return { ...state, showSetting: !state.showSetting };
      case "SET_AUTO_DIRECT":
        return { ...state, activeAutoDirect: action.payload };
      case "SET_LOADING_STATUS":
        return {
          ...state,
          loadingStatus: { ...state.loadingStatus, ...action.payload },
        };
      default:
        return state;
    }
  }
  useEffect(() => {
    if (!partners || !LoginStatus(session) || !RoleAccess(session)) return;
    setLoading(false);
  }, [partners]);
  // Function to convert country code to flag emoji
  const getCountryFlag = (countryCode: string) => {
    if (!countryCode || countryCode.length !== 2) return "";
    return countryCode
      .toUpperCase()
      .split("")
      .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
      .join("");
  };
  // Calculate time difference in a readable format
  const getTimeDifference = (timestamp: number, isPast: boolean): string => {
    const now = Math.floor(Date.now() / 1000);
    const diffSeconds = isPast ? now - timestamp : timestamp - now;

    if (diffSeconds < 0) return isPast ? t(LanguageKey.justnow) : t(LanguageKey.Expired);

    const seconds = diffSeconds;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
      return `${years} ${years === 1 ? t(LanguageKey.pageTools_year) : t(LanguageKey.pageTools_year)} ${
        isPast ? t(LanguageKey.ago) : t(LanguageKey.Remaining)
      }`;
    } else if (months > 0) {
      return `${months} ${months === 1 ? t(LanguageKey.pageTools_Month) : t(LanguageKey.pageTools_Month)} ${
        isPast ? t(LanguageKey.ago) : t(LanguageKey.Remaining)
      }`;
    } else if (days > 0) {
      return `${days} ${days === 1 ? t(LanguageKey.pageTools_Day) : t(LanguageKey.pageTools_Day)} ${
        isPast ? t(LanguageKey.ago) : t(LanguageKey.Remaining)
      }`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? t(LanguageKey.countdown_Hours) : t(LanguageKey.countdown_Hours)} ${
        isPast ? t(LanguageKey.ago) : t(LanguageKey.Remaining)
      }`;
    } else if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? t(LanguageKey.countdown_Minutes) : t(LanguageKey.countdown_Minutes)} ${
        isPast ? t(LanguageKey.ago) : t(LanguageKey.Remaining)
      }`;
    } else {
      return `${seconds} ${seconds === 1 ? seconds : "seconds"} ${
        isPast ? t(LanguageKey.ago) : t(LanguageKey.Remaining)
      }`;
    }
  };

  const [showSetting, setShowSetting] = useState<Record<string, boolean>>({});

  return (
    <div className="tooBigCard" style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}>
      <div className="headerChild" title="↕ Resize the Card" onClick={handleCircleClick}>
        <div className="circle"> </div>
        <div className="Title"> {t(LanguageKey.navbar_SubAdmin)}</div>
      </div>
      <main className={`${styles.all} ${isHidden ? "" : styles.show}`}>
        {loading && <Loading />}
        {!loading && partners && RoleAccess(session) && (
          <>
            <header
              className={`${styles.addnewlink} ${false && "fadeDiv"} ${
                partners && partners.length === 15 ? "fadeDiv" : ""
              }`}
              onClick={() => handleShowAddPartner()}
              title="◰ create new sub admin">
              <div className={styles.addnewicon}>
                <svg width="22" height="22" viewBox="0 0 22 22">
                  <path
                    d="M22 11q-.1 1.5-1.6 1.6h-7.8v7.8a1.6 1.6 0 1 1-3.2 0v-7.8H1.6a1.6 1.6 0 1 1 0-3.2h7.8V1.6a1.6 1.6 0 1 1 3.2 0v7.8h7.8q1.5.1 1.6 1.6"
                    fill="var(--color-dark-blue)"
                  />
                </svg>
              </div>
              <div className={styles.addnewcontent}>
                <div className={styles.addnewheader}>{t(LanguageKey.SettingGeneral_addSubAdmin)}</div>
                <div className="explain">{t(LanguageKey.SettingGeneral_addSubAdminExplain2)}</div>
              </div>
            </header>

            <section className={styles.subadminlist}>
              {partners.map((sess) => (
                <div className="headerandinput" key={sess.id}>
                  <div className="headerparent">
                    <div className="headertext">
                      {sess.name ? sess.name : `${t(LanguageKey.admin)} ${partners.indexOf(sess) + 1}`}
                    </div>
                    <div className="headertext">
                      {!sess.rejected && (
                        <Dotmenu
                          showSetting={showSetting[sess.id] || false}
                          onToggle={() =>
                            setShowSetting((prev) => ({
                              ...prev,
                              [sess.id]: !prev[sess.id],
                            }))
                          }
                          data={[
                            {
                              icon: "/edit-1.svg",
                              value: t(LanguageKey.edit),
                              onClick: () => {
                                handleShowEditPartner(sess);
                                setShowSetting((prev) => ({ ...prev, [sess.id]: false }));
                              },
                            },
                            {
                              icon: "/delete.svg",
                              value: t(LanguageKey.delete),
                              onClick: () => {
                                handleDeletePartner(sess.userId);
                                setShowSetting((prev) => ({ ...prev, [sess.id]: false }));
                              },
                            },
                          ]}
                        />
                      )}
                      {sess.rejected && (
                        <Dotmenu
                          showSetting={showSetting[sess.id] || false}
                          onToggle={() =>
                            setShowSetting((prev) => ({
                              ...prev,
                              [sess.id]: !prev[sess.id],
                            }))
                          }
                          data={[
                            {
                              icon: "/delete.svg",
                              value: t(LanguageKey.delete),
                              onClick: () => {
                                handleDeletePartner(sess.userId);
                                setShowSetting((prev) => ({ ...prev, [sess.id]: false }));
                              },
                            },
                          ]}
                        />
                      )}
                    </div>
                  </div>

                  <div className={styles.subadmincard}>
                    <div className={styles.subadmindata}>
                      <span>{t(LanguageKey.Storeorder_STATUS)}</span>
                      <span>
                        {sess.approved ? (
                          <span style={{ color: "var(--color-light-green)" }}>
                            {t(LanguageKey.active)} {sess.approved}
                          </span>
                        ) : sess.rejected ? (
                          <span style={{ color: "var(--color-light-red)" }}>
                            {t(LanguageKey.rejected)} {sess.rejected}
                          </span>
                        ) : (
                          <span style={{ color: "var(--color-dark-yellow)" }}>
                            {t(LanguageKey.Storeproduct_inQueue)}{" "}
                          </span>
                        )}
                      </span>
                    </div>

                    <div className={styles.subadmindata}>
                      <span>{t(LanguageKey.userpanel_MobileNumber)}</span>
                      <span className="translate">
                        {sess.phoneNumber
                          ? `${sess.phoneNumber.replace(/(\d{1,2})(\d{3})(\d{3})(\d{4})?/, (m, c, a, b, d) =>
                              d ? `+${c} ${a} ${b} ${d}` : `+${c} ${a} ${b}`
                            )} - ${getCountryFlag(sess.countryCode)}`
                          : "-"}
                      </span>
                    </div>
                    <div className={styles.subadmindata}>
                      <span>{t(LanguageKey.advertiseProperties_userID)}</span>
                      <span>{sess.id}</span>
                    </div>
                    <div className={styles.subadmindateparent}>
                      <div className={styles.subadmindate}>
                        <span>{t(LanguageKey.createtime)}</span>
                        <div className={styles.subadmindatedata}>
                          <div className="date" style={{ fontSize: "var(--font-12)" }}>
                            <span className="day">
                              {new DateObject({
                                date: sess.updateTime * 1000,
                                calendar: initialzedTime().calendar,
                                locale: initialzedTime().locale,
                              }).format("YYYY")}
                            </span>
                            /
                            <span className="day">
                              {new DateObject({
                                date: sess.updateTime * 1000,
                                calendar: initialzedTime().calendar,
                                locale: initialzedTime().locale,
                              }).format("MM")}
                            </span>
                            /
                            <span className="day">
                              {new DateObject({
                                date: sess.updateTime * 1000,
                                calendar: initialzedTime().calendar,
                                locale: initialzedTime().locale,
                              }).format("DD")}
                            </span>
                          </div>
                          <div className="date" style={{ fontSize: "var(--font-12)" }}>
                            <span className="hour">
                              {new DateObject({
                                date: sess.updateTime * 1000,
                                calendar: initialzedTime().calendar,
                                locale: initialzedTime().locale,
                              }).format("hh")}
                            </span>
                            :
                            <span className="hour">
                              {new DateObject({
                                date: sess.updateTime * 1000,
                                calendar: initialzedTime().calendar,
                                locale: initialzedTime().locale,
                              }).format("mm A")}
                            </span>
                          </div>
                          <div
                            style={{
                              marginTop: "3px",
                              fontSize: "12px",
                              color: "var(--text-h1)",
                            }}>
                            ({getTimeDifference(sess.createdTime, true)})
                          </div>
                        </div>
                      </div>
                      <div className={styles.subadmindate}>
                        <span>{t(LanguageKey.remainingTime)}</span>

                        {sess.expireTime ? (
                          <div className={styles.subadmindatedata}>
                            <div className="date" style={{ fontSize: "var(--font-12)" }}>
                              <span className="day">
                                {new DateObject({
                                  date: sess.expireTime * 1000,
                                  calendar: initialzedTime().calendar,
                                  locale: initialzedTime().locale,
                                }).format("YYYY")}
                              </span>
                              /
                              <span className="day">
                                {new DateObject({
                                  date: sess.expireTime * 1000,
                                  calendar: initialzedTime().calendar,
                                  locale: initialzedTime().locale,
                                }).format("MM")}
                              </span>
                              /
                              <span className="day">
                                {new DateObject({
                                  date: sess.expireTime * 1000,
                                  calendar: initialzedTime().calendar,
                                  locale: initialzedTime().locale,
                                }).format("DD")}
                              </span>
                            </div>
                            <div className="date" style={{ fontSize: "var(--font-12)" }}>
                              <span className="hour">
                                {new DateObject({
                                  date: sess.expireTime * 1000,
                                  calendar: initialzedTime().calendar,
                                  locale: initialzedTime().locale,
                                }).format("hh")}
                              </span>
                              :
                              <span className="hour">
                                {new DateObject({
                                  date: sess.expireTime * 1000,
                                  calendar: initialzedTime().calendar,
                                  locale: initialzedTime().locale,
                                }).format("mm A")}
                              </span>
                            </div>
                            <div
                              style={{
                                marginTop: "3px",
                                fontSize: "12px",
                                color: "var(--text-h1)",
                              }}>
                              ({getTimeDifference(sess.expireTime, false)})
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--text-h1)",
                            }}
                            className={styles.subadmindatedata}>
                            {t(LanguageKey.permanent)}
                            <div
                              style={{
                                marginTop: "3px",
                                fontSize: "12px",
                                color: "var(--text-h1)",
                              }}>
                              ({t(LanguageKey.product_UNLIMITEDTIME)}){" "}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
        {!loading && !RoleAccess(session) && (
          <div
            className="headerandinput"
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}>
            <img
              style={{ width: "60px", height: "60px", padding: "5px" }}
              title="ℹ️ not allowed"
              src="/Icon_NonFollower.svg"
            />

            <div className="headertext">{t(LanguageKey.notallowedExplain)}</div>
          </div>
        )}
      </main>
    </div>
  );
}
