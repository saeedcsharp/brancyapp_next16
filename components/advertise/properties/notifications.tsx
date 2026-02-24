import { useState } from "react";
import { useTranslation } from "react-i18next";
import ToggleCheckBoxButton from "brancy/components/design/toggleCheckBoxButton";
import useHideDiv from "brancy/hook/useHide";
import { LanguageKey } from "brancy/i18n";
import { INotifications } from "brancy/models/advertise/peoperties";
import styles from "./propertiesComponent.module.css";
function notifications(props: { data: INotifications }) {
  const { t } = useTranslation();
  const { hidePage, gridSpan, toggle } = useHideDiv(true, 36);
  const [emailActive, setEmailActive] = useState<boolean>(props.data.email);
  const [smsActive, setSmsActive] = useState<boolean>(props.data.sms);
  const [systemNotifActive, setSystemNotifActive] = useState<boolean>(props.data.systemNotification);
  const [instaDirectActive, setInstaDirectActive] = useState<boolean>(props.data.instagramDirect);
  const [systemMsgActive, setSystemMsgActive] = useState<boolean>(props.data.systemMessage);
  const handleChangeSmsActive = () => {
    var newData = smsActive;
    newData = !newData;
    //Api to change sms based on <<< newData >>>
    setSmsActive(newData);
  };
  const handleChangeEmailActive = () => {
    var newData = emailActive;
    newData = !newData;
    //Api to change sms based on <<< newData >>>
    setEmailActive(newData);
  };
  const handleChangeSystemNotifActive = () => {
    var newData = systemNotifActive;
    newData = !newData;
    //Api to change sms based on <<< newData >>>
    setSystemNotifActive(newData);
  };
  const handleChangeInstaDirectActive = () => {
    var newData = instaDirectActive;
    newData = !newData;
    //Api to change sms based on <<< newData >>>
    setInstaDirectActive(newData);
  };
  const handleChangeSystemMsgActive = () => {
    var newData = systemMsgActive;
    newData = !newData;
    //Api to change sms based on <<< newData >>>
    setSystemMsgActive(newData);
  };
  return (
    <section className="bigcard" style={gridSpan}>
      <div className={styles.all}>
        <div className="frameParent">
          <div onClick={toggle} className="headerChild" title="↕ Resize the Card">
            <div className="circle"></div>
            <h2 className="Title">{t(LanguageKey.advertiseProperties_notifications)}</h2>
          </div>
        </div>
        {hidePage && (
          <>
            <div className={styles.section}>
              <div className={styles.headerparent}>
                <div className={styles.headertitle1}>{t(LanguageKey.advertiseProperties_notificationsSMS)}</div>
                <ToggleCheckBoxButton
                  name="smsNotification"
                  handleToggle={handleChangeSmsActive}
                  checked={smsActive}
                  title={"SMS Notification"}
                  role={"switch"}
                />
              </div>
            </div>
            <div className={styles.section}>
              <div className={styles.headerparent}>
                <div className={styles.headertitle1}>{t(LanguageKey.advertiseProperties_notificationsEmail)}</div>
                <ToggleCheckBoxButton
                  name="emailNotification"
                  handleToggle={handleChangeEmailActive}
                  checked={emailActive}
                  title={" Email Notification"}
                  role={"switch"}
                />
              </div>
            </div>
            <div className={styles.section}>
              <div className={styles.headerparent}>
                <div className={styles.headertitle1}>{t(LanguageKey.advertiseProperties_notificationssystem)}</div>
                <ToggleCheckBoxButton
                  name="systemNotification"
                  handleToggle={handleChangeSystemNotifActive}
                  checked={systemNotifActive}
                  title={" System Notification"}
                  role={" switch"}
                />
              </div>
            </div>
            <div className={styles.section}>
              <div className={styles.headerparent}>
                <div className={styles.headertitle1}>
                  {t(LanguageKey.advertiseProperties_notificationsinstagramdirect)}
                </div>
                <ToggleCheckBoxButton
                  name="instagramDirectNotification"
                  handleToggle={handleChangeInstaDirectActive}
                  checked={instaDirectActive}
                  title={" Instagram Direct Notification"}
                  role={" switch"}
                />
              </div>
            </div>
            <div className={styles.section}>
              <div className={styles.headerparent}>
                <div className={styles.headertitle1}>
                  {t(LanguageKey.advertiseProperties_notificationssystemticket)}
                </div>
                <ToggleCheckBoxButton
                  name="systemMessageNotification"
                  handleToggle={handleChangeSystemMsgActive}
                  checked={systemMsgActive}
                  title={" System Message Notification"}
                  role={" switch"}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default notifications;
