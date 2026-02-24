import { useTranslation } from "react-i18next";
import { findDayName } from "brancy/helper/findDayName";
import { numbToAmAndPmTime } from "brancy/helper/numberFormater";
import useHideDiv from "brancy/hook/useHide";
import { LanguageKey } from "brancy/i18n";
import { IBusinessHour } from "brancy/models/advertise/peoperties";
import styles from "./propertiesComponent.module.css";
function BusinessHours(props: {
  businessInfo: IBusinessHour[];
  setShowBusinessHoursPopup: (showPopup: boolean) => void;
}) {
  const { t } = useTranslation();
  const { hidePage, gridSpan, toggle } = useHideDiv(true, 46);
  return (
    <section className="tooBigCard" style={gridSpan}>
      <div className={styles.all} style={{ justifyContent: "space-between" }}>
        <div className="frameParent">
          <div onClick={toggle} className="headerChild" title="↕ Resize the Card">
            <div className="circle"></div>
            <h2 className="Title">{t(LanguageKey.advertiseProperties_businesshours)}</h2>
          </div>
          <div
            title="◰ Edit price business hours"
            onClick={() => props.setShowBusinessHoursPopup(true)}
            className="twoDotIconContainer">
            <svg className="twoDotIcon" fill="none" viewBox="0 0 14 5">
              <path
                fill="var(--color-gray)"
                d="M2.5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m9 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"
              />
            </svg>
          </div>
        </div>
        {hidePage &&
          props.businessInfo.map((v, i) => (
            <div className={styles.section} key={i}>
              <div className={styles.headerparent}>
                <div className={styles.headertitle1}>{t(findDayName(v.dayName))}</div>
                {v.timerInfo ? (
                  numbToAmAndPmTime(v.timerInfo?.startTime) === "12:00 AM" &&
                  numbToAmAndPmTime(v.timerInfo?.endTime) === "11:30 PM" ? (
                    <div className={styles.open} title="ℹ️ active all day long">
                      {t(LanguageKey.advertiseProperties_24hours)}
                    </div>
                  ) : (
                    <div className={styles.active}>
                      <div className={styles.activehour}>
                        <div className={styles.amhour}>{numbToAmAndPmTime(v.timerInfo?.startTime)}</div>-
                        <div className={styles.pmhour}>{numbToAmAndPmTime(v.timerInfo?.endTime)}</div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className={styles.close} title="ℹ️ deactive all day long">
                    {t(LanguageKey.advertiseProperties_close)}
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}

export default BusinessHours;
