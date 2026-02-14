import { useTranslation } from "react-i18next";
import InlineBarChart from "saeed/components/design/chart/inlineBarChart";
import { numberToFormattedString } from "saeed/helper/numberFormater";
import useHideDiv from "saeed/hook/useHide";
import { LanguageKey } from "saeed/i18n";
import { ISaleShortMonth } from "../../../models/store/statistics";
import styles from "./statistics.module.css";
const TotalSalesStatistics = (props: { data: ISaleShortMonth[] }) => {
  const { hidePage, gridSpan, toggle } = useHideDiv(true, 47);
  const { t } = useTranslation();
  return (
    <section className={styles.statistics} style={gridSpan}>
      <div onClick={toggle} className="headerChild" title="↕ Resize the Card">
        <div className="circle"></div>
        <h2 className="Title">{t(LanguageKey.storestatistics_totalSalesstatistics)}</h2>
      </div>
      {hidePage && (
        <div className={`${styles.section3} translate`}>
          <div className={styles.totalchart}>
            {props.data.length > 0 && <InlineBarChart chartId={""} items={props.data} height="100%" />}
          </div>
        </div>
      )}
      {hidePage && (
        <div className={styles.section3}>
          <div className={styles.totalsummery}>
            <div className={styles.totalsummerychild}>
              <div className={styles.totalcounter}>{numberToFormattedString(888)}</div>
              <div className={styles.totalabel}>{t(LanguageKey.storestatistics_TotalSales)}</div>
            </div>
            <div className={styles.totalsummerychild}>
              <div className={styles.totalcounter}>${numberToFormattedString(888777)}</div>
              <div className={styles.totalabel}>{t(LanguageKey.storestatistics_TotalIncome)}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TotalSalesStatistics;
