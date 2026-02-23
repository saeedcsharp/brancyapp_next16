import { findDayName } from "../../../helper/findDayName";
import { numbToAmAndPmTime } from "../../../helper/numberFormater";
import { IBusinessHour } from "../../../models/advertise/peoperties";
import styles from "./business.module.css";
function BusinessHour(props: { businessHour: IBusinessHour[] }) {
  return (
    <>
      {props.businessHour.map((v, i) => (
        <div className={styles.section}>
          <div key={i} className={styles.headerparent}>
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

export default BusinessHour;
