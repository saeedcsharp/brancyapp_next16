import { useSession } from "next-auth/react";
import { useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import Loading from "saeed/components/notOk/loading";
import { LoginStatus, RoleAccess } from "saeed/helper/loadingStatus";
import initialzedTime from "saeed/helper/manageTimer";
import { LanguageKey } from "saeed/i18n";
import { ILoadingStatus } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { IPartner_User } from "saeed/models/userPanel/setting";
import styles from "./general.module.css";
const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
export default function UserPartners({
  partners,
  handleRejectPartner,
  handleApprovePartner,
  handleGetNextPartners,
}: {
  partners: IPartner_User[] | null;
  handleRejectPartner: (id: number) => void;
  handleApprovePartner: (id: number) => Promise<void>;
  handleGetNextPartners: (id: string) => void;
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
    if (!partners) return;
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
  return (
    <div className="bigcard" style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}>
      <div className="headerChild" title="↕ Resize the Card" onClick={handleCircleClick}>
        <div className="circle"> </div>
        <div className="Title">{t(LanguageKey.navbar_SubAdmin)}</div>
      </div>
      <div className={`${styles.all} ${isHidden ? "" : styles.show}`}>
        {loading && <Loading />}
        {!loading && partners && (
          <>
            {partners.map((sess) => (
              <div className="headerandinput">
                <div className="instagramprofile translate" style={{ height: "30px" }}>
                  <img
                    className="instagramimage"
                    style={{
                      maxHeight: "30px",
                      minHeight: "30px",
                      minWidth: "30px",
                      maxWidth: "30px",
                    }}
                    src={baseMediaUrl + sess.profileUrl}
                  />
                  <div className="instagramprofiledetail" style={{ gap: "0px" }}>
                    <div className="instagramusername">{"@" + sess.username}</div>
                    <div className="instagramid">{sess.fullName}</div>
                  </div>
                </div>
                <div className={styles.partnercard} key={sess.id}>
                  <div className={styles.subadmindata}>
                    <span>{t(LanguageKey.Storeorder_STATUS)}</span>
                    <span>
                      {sess.approved ? (
                        <span style={{ color: "var(--color-light-green)" }}>
                          {t(LanguageKey.active)} {sess.approved}
                        </span>
                      ) : (
                        <span style={{ color: "var(--color-dark-yellow)" }}>
                          {t(LanguageKey.Storeproduct_inQueue)}{" "}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className={styles.subadmindata}>
                    <span>{t(LanguageKey.advertiseProperties_userID)}</span>
                    <span>
                      <span>{sess.id}</span>
                    </span>
                  </div>

                  <div className={styles.subadmindateparent}>
                    <div className={styles.subadmindate}>
                      <span>{t(LanguageKey.createtime)}</span>
                      <div className={styles.subadmindatedata}>
                        <div className="date">
                          <span className="day">
                            {new DateObject({
                              date: sess.createdTime * 1000,
                              calendar: initialzedTime().calendar,
                              locale: initialzedTime().locale,
                            }).format("YYYY")}
                          </span>
                          /
                          <span className="day">
                            {new DateObject({
                              date: sess.createdTime * 1000,
                              calendar: initialzedTime().calendar,
                              locale: initialzedTime().locale,
                            }).format("MM")}
                          </span>
                          /
                          <span className="day">
                            {new DateObject({
                              date: sess.createdTime * 1000,
                              calendar: initialzedTime().calendar,
                              locale: initialzedTime().locale,
                            }).format("DD")}
                          </span>
                        </div>
                        <div className="date">
                          <span className="hour">
                            {new DateObject({
                              date: sess.createdTime * 1000,
                              calendar: initialzedTime().calendar,
                              locale: initialzedTime().locale,
                            }).format("hh")}
                          </span>
                          :
                          <span className="hour">
                            {new DateObject({
                              date: sess.createdTime * 1000,
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
                          <div className="date">
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
                          <div className="date">
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
                  <div className="ButtonContainer" style={{ height: "30px" }}>
                    {!sess.approved && (
                      <div
                        style={{ height: "30px" }}
                        className="saveButton"
                        onClick={async () => {
                          await handleApprovePartner(sess.instagramerId);
                        }}>
                        {t(LanguageKey.accept)}
                      </div>
                    )}
                    <div
                      className="stopButton"
                      style={{ height: "30px" }}
                      onClick={() => {
                        handleRejectPartner(sess.instagramerId);
                      }}>
                      {t(LanguageKey.reject)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        {/* {!loading && !RoleAccess(session) && (
          <div className="headerandinput" style={{ alignItems: "center", justifyContent: "center" }}>
            <img
              style={{ width: "60px", height: "60px", padding: "5px" }}
              title="ℹ️ not allowed"
              src="/Icon_NonFollower.svg"
            />
            <div className="headertext">{t(LanguageKey.notallowedExplain)}</div>
          </div>
        )} */}
      </div>
    </div>
  );
}
