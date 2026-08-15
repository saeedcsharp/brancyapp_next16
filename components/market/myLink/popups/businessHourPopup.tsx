import { useTranslation } from "react-i18next";
import { findDayName } from "brancy/helper/findDayName";
import { numbToAmAndPmTime } from "brancy/helper/numberFormater";
import styles from "./businessPopup.module.css";
import { IBusinessHour } from "brancy/models/interfaces";
import { BusinessDay } from "brancy/models/enums";
import { LanguageKey } from "brancy/i18n";
export default function BusinessHourPopup(props: { businessInfo: IBusinessHour[]; removeMask: () => void }) {
  const { t } = useTranslation();
  return (
    <>
      <div className="headerandinput">
        <div className="title">{t(LanguageKey.marketProperties_bussinessHours)}</div>
      </div>
      {props.businessInfo.map((v, i) => (
        <div key={i} className={styles.section}>
          <div className={styles.headerparent}>
            <div className={styles.headertitle1}>
              {t(findDayName((v as IBusinessHour & { weekDay?: BusinessDay }).weekDay ?? v.weekday))}
            </div>
            {(v.beginTime > 0 || v.endTime > 0) && (
              <div className={styles.active}>
                <div className={styles.activehour}>
                  <div className={styles.amhour}>{numbToAmAndPmTime(v.beginTime)}</div>-
                  <div className={styles.pmhour}>{numbToAmAndPmTime(v.endTime)}</div>
                </div>
              </div>
            )}
            {v.beginTime === 0 && v.endTime === 0 && <div className={styles.close}>{t(LanguageKey.close)}</div>}
          </div>
        </div>
      ))}
    </>
  );
}
