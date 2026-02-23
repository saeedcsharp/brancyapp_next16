import { findDayName } from "brancy/helper/findDayName";
import { numbToAmAndPmTime } from "brancy/helper/numberFormater";
import { IBusinessHour } from "brancy/models/advertise/peoperties";
import styles from "brancy/components/customerAds/card/business.module.css";
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
