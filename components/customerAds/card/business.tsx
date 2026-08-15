import { useTranslation } from "react-i18next";
import { findDayName } from "brancy/helper/findDayName";
import { numbToAmAndPmTime } from "brancy/helper/numberFormater";
import styles from "./business.module.css";
import { IBusinessHour } from "brancy/models/interfaces";
function BusinessHour(props: { businessHour: IBusinessHour[] }) {
  const { t } = useTranslation();
  return (
    <>
      {props.businessHour.map((v, i) => (
        <div className={styles.section}>
          <div key={i} className={styles.headerparent}>
            <div className={styles.headertitle1}>{t(findDayName(v.weekday))}</div>
            {
              <div className={styles.active}>
                <div className={styles.activehour}>
                  <div className={styles.amhour}>{numbToAmAndPmTime(v.beginTime)}</div>-
                  <div className={styles.pmhour}>{numbToAmAndPmTime(v.endTime)}</div>
                </div>
              </div>
            }
            {<div className={styles.close}>close</div>}
          </div>
        </div>
      ))}
    </>
  );
}

export default BusinessHour;
