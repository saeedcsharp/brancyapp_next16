import { useSession } from "next-auth/react";
import { MouseEvent, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "saeed/i18n";
import styles from "./profile.module.css";

const Profile = (props: {
  data: string;
  handleShowSignOut: (e: MouseEvent) => void;
  handleShowUpgrade: (e: MouseEvent) => void;
  handleShowSwitch: (e: MouseEvent) => void;
}) => {
  const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
  const { t } = useTranslation();
  const { data: session } = useSession();

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

  const remainingDays = useMemo(() => {
    return session?.user.packageExpireTime
      ? getRemainingTime(session.user.packageExpireTime).days
      : 0;
  }, [session?.user.packageExpireTime]);

  const timeClass = useMemo(() => {
    return remainingDays < 3
      ? styles.blinkRed
      : remainingDays < 10
      ? styles.blinkYellow
      : "";
  }, [remainingDays]);

  const handleUpgradeClick = (e: MouseEvent) => {
    if (session?.user.isPartner) return;
    props.handleShowUpgrade(e);
  };

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <>
      <div
        id="notifBar5"
        className={styles.menu}
        onClick={(e: MouseEvent) => e.stopPropagation()}
        aria-label="Profile menu"
        role="menu">
        {/* {props.data} */}

        <div className={styles.profile}>
          <img
            className="instagramimage"
            title="ℹ️ profile"
            alt="Your Instagram profile picture"
            aria-label="Open profile menu"
            role="button"
            src={
              session?.user.profileUrl
                ? baseMediaUrl + session.user.profileUrl
                : "/no-profile.svg"
            }
          />

          <div className="headerandinput" style={{ gap: "3px" }}>
            <div className="title" style={{ fontSize: "14px" }}>
              {session?.user.username}

              <br />
            </div>
            <div className="title2" style={{ fontSize: "14px" }}>
              {session?.user.fullName}{" "}
              <span className="IDgray">
                ID:{" "}
                {session?.user.instagramerIds
                  ? session?.user.instagramerIds[session.user.currentIndex]
                  : session?.user.instagramerIds ?? "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div
          onClick={handleUpgradeClick}
          className={styles.menuchild}
          role="menuitem">
          <svg
            className={styles.icon}
            xmlns="http://www.w3.org/2000/svg"
            fill="var(--color-light-yellow)"
            viewBox="0 0 17 11"
            aria-hidden="true">
            <path d="M16.8 1.5a1.3 1.3 0 1 0-1.9 1l-.3.6a3 3 0 0 1-2.4 1.7A3 3 0 0 1 9.8 3l-.2-.6a1.3 1.3 0 1 0-1.3 0L8 3a3 3 0 0 1-2.4 1.7A3 3 0 0 1 3.2 3q0-.4-.3-.6a1.3 1.3 0 1 0-1.1.2V3l1.7 6.4a2 2 0 0 0 1.7 1.3h7.4a2 2 0 0 0 1.7-1.3L15.8 3v-.4a1.3 1.3 0 0 0 1-1.2" />
          </svg>
          <div className="headerandinput" style={{ gap: "3px" }}>
            <div className="title2" style={{ fontSize: "14px" }}>
              {t(LanguageKey.upgrade)}
            </div>
            <div className={`${styles.remainingTime} ${timeClass}`}>
              {t(LanguageKey.remainingTime)}:{" "}
              <strong>
                {formatNumber(remainingDays)} {t(LanguageKey.pageTools_Day)}
              </strong>{" "}
            </div>
          </div>
        </div>

        <div
          onClick={props.handleShowSwitch}
          className={styles.menuchild}
          role="menuitem">
          <svg
            aria-hidden="true"
            className={styles.icon}
            fill="var(--color-gray)"
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 17 17">
            <path d="M1.97 3.76a.7.7 0 0 1 0-.96.7.7 0 0 1 .96 0l.52.52v-1.8a.68.68 0 0 1 1.36 0v1.8l.52-.52a.7.7 0 0 1 .96 0 .7.7 0 0 1 0 .96L4.61 5.44a.7.7 0 0 1-.96 0zm11.05 7.92a.7.7 0 0 0-.96 0l-1.68 1.68a.7.7 0 0 0 0 .96.7.7 0 0 0 .96 0l.52-.52v1.8a.68.68 0 0 0 1.36 0v-1.8l.52.52a.7.7 0 0 0 .96 0 .7.7 0 0 0 0-.96z" />
            <path
              opacity=".6"
              d="M16.2 8.52a2 2 0 0 1-.63 1.57c-.42.39-.99.6-1.57.58H8.94q-.67 0-1.24-.34l-.06.2q.38.15.68.4.4.34.62.8.22.43.33.9.1.41.15.82v.08q.04.4.04.82a2 2 0 0 1-.63 1.57c-.42.39-.99.6-1.57.57H2.2a2.2 2.2 0 0 1-1.57-.57A2 2 0 0 1 0 14.35q0-.43.03-.82a6 6 0 0 1 .49-1.8q.23-.45.62-.8.3-.25.68-.4A3.13 3.13 0 0 1 3.49 6.6a3.1 3.1 0 0 1 3.36.58 6 6 0 0 1 .4-1.26q.24-.45.62-.8.31-.25.68-.4a3.12 3.12 0 0 1 2.92-4.2 3.1 3.1 0 0 1 2.9 4.2q.38.15.68.4.4.35.62.8.23.43.33.9.1.4.15.82v.08q.05.39.05.8M13.28 3.6a1.8 1.8 0 0 0-3.06-1.3l-.03.02a1.8 1.8 0 0 0 .12 2.66l.06.05A2 2 0 0 0 12.6 5l.04-.03.1-.09a1.7 1.7 0 0 0 .54-1.28m1.6 4.21a5 5 0 0 0-.36-1.33 1 1 0 0 0-.31-.4 1 1 0 0 0-.4-.2h-.07a.4.4 0 0 0-.2.06l-.23.17A3.1 3.1 0 0 1 9.5 6l-.03-.02-.08-.05-.17-.05H9.1a1 1 0 0 0-.37.2q-.2.18-.32.4-.15.3-.22.64a5 5 0 0 0-.15 1.4.8.8 0 0 0 .22.63q.3.25.68.22H14q.4.03.68-.22a.8.8 0 0 0 .22-.63q0-.39-.03-.72M6.53 9.43a1.8 1.8 0 1 0-2.96 1.39l.05.04a2 2 0 0 0 2.23-.02l.04-.04.1-.09a1.7 1.7 0 0 0 .54-1.28m-3.79 2.4-.03-.02-.08-.05-.17-.05h-.1a1 1 0 0 0-.38.2q-.2.18-.32.4-.15.3-.22.63a5 5 0 0 0-.15 1.4.8.8 0 0 0 .22.63q.3.24.68.23h5.06q.4.01.68-.23a.8.8 0 0 0 .22-.63q0-.36-.03-.7a5 5 0 0 0-.35-1.33 1 1 0 0 0-.31-.4 1 1 0 0 0-.41-.2H7a.4.4 0 0 0-.2.06l-.22.17a3.1 3.1 0 0 1-3.83-.1z"
            />
          </svg>
          <div className="headerandinput" style={{ gap: "3px" }}>
            <div className="title2" style={{ fontSize: "14px" }}>
              {t(LanguageKey.accountmanagement)}
            </div>
            <div className="explain"></div>
          </div>{" "}
        </div>
        <div
          className={styles.menuchild}
          onClick={props.handleShowSignOut}
          role="menuitem">
          <svg
            className={styles.icon}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="var(--color-dark-red)"
            viewBox="0 0 20 20">
            <path
              opacity=".6"
              d="M14.8 15.2a1 1 0 0 0-.8.8c0 1.7-1.5 2.3-2.7 2.3h-5a3 3 0 0 1-2.8-2.8V4.8A3 3 0 0 1 6.3 2h5c1.2 0 2.7.6 2.7 2.3a.8.8 0 1 0 1.7 0c0-2.2-2-4-4.4-4h-5A4.2 4.2 0 0 0 2 4.8v10.8A4.2 4.2 0 0 0 6.3 20h5c2.5 0 4.4-1.6 4.4-3.9a1 1 0 0 0-.9-.8"
            />
            <path d="M18.5 10.6 15.3 14a.7.7 0 1 1-1-1l1.8-2h-4.7a.8.8 0 1 1 0-1.5H16l-1.9-2a.7.7 0 1 1 1-1l3.3 3.2a1 1 0 0 1 0 1" />
          </svg>
          <div className="headerandinput" style={{ gap: "3px" }}>
            <div className="title2" style={{ fontSize: "14px" }}>
              {t(LanguageKey.signout)}
            </div>
            <div className="explain"></div>
          </div>{" "}
        </div>
      </div>
    </>
  );
};

export default Profile;
