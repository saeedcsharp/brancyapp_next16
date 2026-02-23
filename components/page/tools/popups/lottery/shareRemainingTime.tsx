import { useTranslation } from "react-i18next";
import { LanguageKey } from "../../../../../i18n";
import { IShareremainingTime } from "../../../../../models/page/tools/tools";
import styles from "./shareRemainingTime.module.css";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
function convertUnixtimeToDHM(unixTime: number) {
  let unixNow = Date.now();
  const diffTime = Math.abs(unixTime - unixNow);
  const desDays = diffTime / (1000 * 60 * 60 * 24);
  const intdays = Math.floor(desDays);
  const desHoures = (desDays - intdays) * 24;
  const intHoures = Math.floor(desHoures);
  const desMinutes = (desHoures - intHoures) * 60;
  const intMinutes = Math.floor(desMinutes);
  return { intdays, intHoures, intMinutes };
}
const ShareRemainingTime = (props: {
  shareRemainingTimeInfo: IShareremainingTime;
  removeMask: () => void;
  backButton: () => void;
  shareRemainingTime: (lotteryId: number) => void;
}) => {
  const { t } = useTranslation();
  return (
    <>
      <div onClick={props.removeMask} className="dialogBg" />
      <div className="popup">
        <div className={styles.header}>{t(LanguageKey.pageLottery_ShareRemainingTime)}</div>
        <img
          style={{
            position: "relative",
            width: "max-content",
            height: "70%",
            alignSelf: "center",
            borderRadius: "15px",
          }}
          src={basePictureUrl + props.shareRemainingTimeInfo.backgroundUrl}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-around",
            left: "130px",
            top: "190px",
            padding: "10px",
          }}>
          <div className={styles.timerparent}>
            <div
              className={styles.timer}
              style={{
                backgroundColor: `#${props.shareRemainingTimeInfo.boxColor}`,
                color: `#${props.shareRemainingTimeInfo.textColor}`,
                opacity: `${props.shareRemainingTimeInfo.boxOpacity}`,
              }}>
              <div>{convertUnixtimeToDHM(props.shareRemainingTimeInfo.timeUnix * 1000).intdays}</div>
              <div className={styles.timerchild}>{t(LanguageKey.countdown_Days)}</div>
            </div>
            <div
              className={styles.timer}
              style={{
                backgroundColor: `#${props.shareRemainingTimeInfo.boxColor}`,
                color: `#${props.shareRemainingTimeInfo.textColor}`,
                opacity: `${props.shareRemainingTimeInfo.boxOpacity}`,
              }}>
              <div style={{ color: `${props.shareRemainingTimeInfo.textColor}` }}>
                {convertUnixtimeToDHM(props.shareRemainingTimeInfo.timeUnix * 1000).intHoures}
              </div>
              <div className={styles.timerchild}>{t(LanguageKey.countdown_Hours)}</div>
            </div>
            <div
              className={styles.timer}
              style={{
                backgroundColor: `#${props.shareRemainingTimeInfo.boxColor}`,
                color: `#${props.shareRemainingTimeInfo.textColor}`,
                opacity: `${props.shareRemainingTimeInfo.boxOpacity}`,
              }}>
              <div>{convertUnixtimeToDHM(props.shareRemainingTimeInfo.timeUnix * 1000).intMinutes}</div>
              <div className={styles.timerchild}>{t(LanguageKey.countdown_Minutes)}</div>
            </div>
          </div>
        </div>
        <div className="ButtonContainer">
          <button onClick={props.backButton} className="cancelButton">
            {t(LanguageKey.dismiss)}
          </button>
          <button
            onClick={() => props.shareRemainingTime(props.shareRemainingTimeInfo.lotteryId)}
            className="saveButton">
            {t(LanguageKey.shareStory)}
          </button>
        </div>
      </div>
    </>
  );
};

export default ShareRemainingTime;
