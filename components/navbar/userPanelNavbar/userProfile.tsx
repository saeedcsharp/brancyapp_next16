import { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "saeed/i18n";
import styles from "./userProfile.module.css";
const UserProfile = (props: {
  data: string;
  handleShowSignOut: (e: MouseEvent) => void;
  handleShowSwitch: (e: MouseEvent) => void;
}) => {
  const { t } = useTranslation();
  return (
    <>
      <div id="notifBar5" className={styles.menu} onClick={(e: MouseEvent) => e.stopPropagation()}>
        {/* {props.data} */}

        {/* <div onClick={props.handleShowUpgrade} className={styles.menuchild}>
          <svg
            className={styles.iconupgrade}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 11">
            <path d="M16.8 1.5a1.3 1.3 0 1 0-1.9 1l-.3.6a3 3 0 0 1-2.4 1.7A3 3 0 0 1 9.8 3l-.2-.6a1.3 1.3 0 1 0-1.3 0L8 3a3 3 0 0 1-2.4 1.7A3 3 0 0 1 3.2 3q0-.4-.3-.6a1.3 1.3 0 1 0-1.1.2V3l1.7 6.4a2 2 0 0 0 1.7 1.3h7.4a2 2 0 0 0 1.7-1.3L15.8 3v-.4a1.3 1.3 0 0 0 1-1.2" />
          </svg>

          <div className={styles.notifbody}>Upgrade</div>
        </div> */}

        {/* <div className={styles.menuchild}>
          <svg
            className={styles.icon}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 17">
            <path d="m13 15.8-.1.3a.9.9 0 0 1-1.7-.3.9.9 0 1 1 1.7 0m-5.5-.9a.9.9 0 1 0 .8 1.2v-.3a1 1 0 0 0-.8-.9m9.2-7.7L16 12q0 .7-.6 1.3a3 3 0 0 1-2 1H6.1a3 3 0 0 1-2-1q-.4-.6-.5-1.4L3 7.7l-.1-.5-.1-.3q-.2-.7-.8-1.1l-.7-.2H.5a1 1 0 0 1-.6-.7l.3-.4.6-.2h.7a3 3 0 0 1 2 1l.1-.1a3 3 0 0 1 2.1-.9h.6V4a3.5 3.5 0 1 1 7 .2h.4a3 3 0 0 1 3 3m-2 4.2.7-4.2a1.6 1.6 0 0 0-1.6-1.6H13a3.5 3.5 0 0 1-6.3 0h-.9a1.6 1.6 0 0 0-1.6 1.6l.6 3.7v.5l.2.4q0 .7.7 1l.8.2h6.6q.5 0 .8-.2.5-.3.7-1zM12 4a2.1 2.1 0 1 0-4.3 0A2.1 2.1 0 0 0 12 4" />
          </svg>

          <div className={styles.notifbody}>shop account</div>
        </div> */}
        <div onClick={props.handleShowSwitch} className={styles.menuchild}>
          <svg className={styles.icon} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 17">
            <path d="M3 3.8a1 1 0 0 1 0-1 1 1 0 0 1 1 0l.4.5V1.5a.7.7 0 0 1 1.4 0v1.8l.5-.5a1 1 0 0 1 1 0 1 1 0 0 1 0 1L5.6 5.4a1 1 0 0 1-1 0zm14 4.7a2 2 0 0 1-.6 1.6q-.7.6-1.6.6h-5q-.8 0-1.3-.4v.2l.6.4.7.8.3 1 .1.8v.8a2 2 0 0 1-.6 1.6q-.7.6-1.5.6H3q-1 0-1.7-.6a2 2 0 0 1-.6-1.6l.2-1.7.3-.9.7-.8.6-.4a3 3 0 0 1 1.7-4 3 3 0 0 1 3.4.7L8 5.9q.2-.5.6-.8l.7-.4a3 3 0 0 1 3-4.2 3 3 0 0 1 2.9 4.2l.7.4.6.8.3 1 .2.7zm-3-4.9a1.8 1.8 0 0 0-3-1.3 2 2 0 0 0 .1 2.7 2 2 0 0 0 2.3 0l.2-.1a2 2 0 0 0 .5-1.3m1.7 4.2-.4-1.3q0-.3-.3-.4l-.4-.2h-.2l-.3.2a3 3 0 0 1-3.8 0V6h-.1l-.2-.1-.5.2-.3.4L9 7l-.2 1.4.3.7.6.2h5.1q.4 0 .7-.2l.2-.7zM7.4 9.4a1.8 1.8 0 1 0-3 1.4 2 2 0 0 0 2.3 0h.1a2 2 0 0 0 .6-1.4m-3.8 2.4h-.4l-.4.1-.3.4-.2.6-.2 1.4.2.7.7.2h5q.5 0 .8-.2l.2-.7-.2-1.4-.2-.6-.3-.4-.4-.2h-.3l-.2.2a3 3 0 0 1-3.8 0m10.4-.1a1 1 0 0 0-1 0l-1.6 1.7a1 1 0 0 0 0 1 1 1 0 0 0 1 0l.5-.6v1.8a.7.7 0 0 0 1.3 0v-1.8l.5.5a1 1 0 0 0 1 0 1 1 0 0 0 0-1z" />
          </svg>

          <div className={styles.notifbody}>{t(LanguageKey.switchaccount)}</div>
        </div>
        <div className={styles.menuchild} onClick={props.handleShowSignOut}>
          <svg className={styles.iconsignout} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 19">
            <path d="m16.6 10.2-3.1 3a.7.7 0 0 1-1-1l1.8-1.8H9.8a.7.7 0 1 1 0-1.5h4.5l-1.8-1.8a.7.7 0 1 1 1-1l3.1 3a1 1 0 0 1 0 1m-3.5 4.3a1 1 0 0 0-.8.8c0 1.6-1.4 2.2-2.6 2.2H5a2.7 2.7 0 0 1-2.7-2.7V4.6A2.7 2.7 0 0 1 5 1.9h4.7c1.2 0 2.6.6 2.6 2.2a.8.8 0 0 0 1.6 0C13.9 2 12 .3 9.7.3H5A4 4 0 0 0 .8 4.6v10.2A4 4 0 0 0 5 19h4.7c2.4 0 4.2-1.5 4.2-3.7a1 1 0 0 0-.8-.8" />
          </svg>
          <div className={styles.notifbody}>{t(LanguageKey.signout)}</div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
