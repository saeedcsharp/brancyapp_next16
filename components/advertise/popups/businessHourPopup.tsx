import { findDayName } from "saeed/helper/findDayName";
import { numbToAmAndPmTime } from "saeed/helper/numberFormater";
import { IBusinessHour } from "saeed/models/advertise/peoperties";
import styles from "./adPopupStyle.module.css";
export default function BusinessHourPopup(props: { businessInfo: IBusinessHour[]; removeMask: () => void }) {
  return (
    <>
      <div className="headerandinput">
        <div className="title">AD Terms</div>
      </div>
      {props.businessInfo.map((v, i) => (
        <div key={i} className={styles.section}>
          <div className={styles.headerparent}>
            <div className={styles.headertitle1}>{findDayName(v.dayName)}</div>
            {v.timerInfo && (
              <div className={styles.active}>
                <div className={styles.activehour}>
                  <div className={styles.amhour}>{numbToAmAndPmTime(v.timerInfo?.startTime)}</div>-
                  <div className={styles.pmhour}>{numbToAmAndPmTime(v.timerInfo?.endTime)}</div>
                </div>
              </div>
            )}
            {!v.timerInfo && <div className={styles.close}>close</div>}
          </div>
        </div>
      ))}
    </>
  );
}
