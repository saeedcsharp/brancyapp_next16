import { useTranslation } from "react-i18next";
import InlineBarChart from "brancy/components/design/chart/inlineBarChart";
import { numberToFormattedString } from "brancy/helper/numberFormater";
import useHideDiv from "brancy/hook/useHide";
import { LanguageKey } from "brancy/i18n";
import { IAdShortMonth } from "brancy/models/advertise/statistics";
import styles from "brancy/components/advertise/statistics/statistics.module.css";
const TotalAdsStatistics = (props: { data: IAdShortMonth[] }) => {
  const { hidePage, gridSpan, toggle } = useHideDiv(true, 47);
  const { t } = useTranslation();
  return (
    <section className={styles.statistics} style={gridSpan}>
      <div onClick={toggle} className="headerChild" title="↕ Resize the Card">
        <div className="circle"></div>
        <h2 className="Title">{t(LanguageKey.advertisestatistics_totalADSstatistics)}</h2>
      </div>
      {hidePage && (
        <div className={`${styles.section3} translate`}>
          <div className={styles.totalchart}>
            {props.data.length > 0 && <InlineBarChart chartId={""} items={props.data} height="260px" />}
          </div>
        </div>
      )}
      {hidePage && (
        <div className={styles.section3}>
          <div className={styles.totalsummery}>
            <div className={styles.totalsummerychild}>
              <div className={styles.totalcounter}>{numberToFormattedString(888)}</div>
              <div className={styles.totalabel}>{t(LanguageKey.advertisestatistics_TotalAds)}</div>
            </div>
            <div className={styles.totalsummerychild}>
              <div className={styles.totalcounter}>${numberToFormattedString(888777)}</div>
              <div className={styles.totalabel}>{t(LanguageKey.advertisestatistics_TotalIncome)}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TotalAdsStatistics;
