import { useSession } from "next-auth/react";
import { KeyboardEvent, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import InputText from "brancy/components/design/inputText";
import TextArea from "brancy/components/design/textArea/textArea";
import { LanguageKey } from "brancy/i18n";

import styles from "brancy/components/setting/general/general.module.css";
function Profile() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [isHidden, setIsHidden] = useState(false);

  const basePictureUrl = useMemo(() => process.env.NEXT_PUBLIC_BASE_MEDIA_URL, []);

  const userData = useMemo(
    () => ({
      profileUrl: session?.user?.profileUrl || "",
      fullName: session?.user?.fullName || "",
      username: session?.user?.username || "",
      biography: session?.user?.biography || "",
    }),
    [session?.user]
  );

  const handleCircleClick = useCallback(() => {
    setIsHidden((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsHidden((prev) => !prev);
    }
  }, []);
  return (
    <section className="tooBigCard" style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}>
      <header
        className="headerChild"
        title="↕ Resize the Card"
        onClick={handleCircleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={!isHidden}
        aria-label={t(LanguageKey.SettingGeneralProfileTitle)}>
        <div className="circle" aria-hidden="true">
          {" "}
        </div>
        <h2 className="Title">{t(LanguageKey.SettingGeneralProfileTitle)}</h2>
      </header>
      <div className={`${styles.all} ${isHidden ? "" : styles.show}`}>
        <div className={`headerandinput ${styles.profileHeader}`}>
          <img
            className={`instagramimage ${styles.profileImage}`}
            src={basePictureUrl + userData.profileUrl}
            alt={`${userData.fullName} profile picture`}
            loading="lazy"
          />

          <div className={`instagramusername ${styles.profileName}`}>{userData.fullName}</div>
          <div className={`instagramid ${styles.profileUsername}`}>@{userData.username}</div>
        </div>
        <div className={styles.attention} role="alert" aria-live="polite">
          <img className={styles.attentionIcon} src="/attention.svg" alt="Attention icon" aria-hidden="true" />
          <p className="explain">{t(LanguageKey.usersettingexplain)}</p>
        </div>
        <div className="headerandinput">
          <label className="headertext" htmlFor="user-fullname">
            {t(LanguageKey.user)}
          </label>
          <InputText
            id="user-fullname"
            className="textinputbox"
            disabled={true}
            handleInputChange={() => {}}
            value={userData.fullName}
            aria-readonly="true"
          />
        </div>
        <div className="headerandinput">
          <label className="headertext" htmlFor="user-username">
            {t(LanguageKey.InstagramID)}
          </label>
          <div className="headerparent">
            <InputText
              id="user-username"
              className="textinputbox"
              disabled={true}
              value={userData.username}
              handleInputChange={() => {}}
              aria-readonly="true"
            />
          </div>
        </div>
        <div className={`headerandinput ${styles.biographySection}`}>
          <label className="headertext" htmlFor="user-biography">
            {t(LanguageKey.advertiseProperties_biography)}
          </label>
          <div className={styles.biographyContainer}>
            <TextArea
              id="user-biography"
              name="biography"
              placeHolder="bio"
              className="captiontextarea"
              maxLength={2200}
              value={userData.biography}
              readOnly={true}
              role="textbox"
              title={t(LanguageKey.advertiseProperties_biography)}
              aria-readonly="true"
              aria-label={t(LanguageKey.advertiseProperties_biography)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;
