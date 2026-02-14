import { useTranslation } from "react-i18next";
import LineChart from "saeed/components/graphs/lineChart";
import useHideDiv from "saeed/hook/useHide";
import { LanguageKey } from "saeed/i18n";
import { chartxType, NumToMonth } from "saeed/models/page/statistics/statisticsContent/GraphIngageBoxes/graphLikes";
import { ISaleMonth } from "../../../models/store/statistics";
import styles from "./statistics.module.css";
const TwoMonth = (props: { data: ISaleMonth[] }) => {
  const { hidePage, gridSpan, toggle } = useHideDiv(true, 47);
  const numberToFormattedString = (number: { toLocaleString: () => any }) => {
    return number.toLocaleString();
  };
  // const [data, setData] = useState<IAdMonth[]>([
  //   {
  //     monthGraph: {
  //       dayList: [],
  //       month: 0,
  //       plusCount: 0,
  //       totalCount: 3800,
  //       users: [],
  //       year: 2024,
  //     },
  //     totalIncom: 18500,
  //   },
  //   {
  //     monthGraph: {
  //       dayList: [],
  //       month: 1,
  //       plusCount: 0,
  //       totalCount: 3699,
  //       users: [],
  //       year: 2024,
  //     },
  //     totalIncom: 900000000,
  //   },
  // ]);
  const roundToDecimal = (number: number, decimalPlaces: number) => {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(number * factor) / factor;
  };
  const calculatSalesRate = () => {
    var num = (props.data[1].totalCount - props.data[0].totalCount) / props.data[0].totalCount;
    var res = roundToDecimal(num, 2);
    return res;
  };
  const calculatIncomeRate = () => {
    var num = (props.data[1].totalIncom - props.data[0].totalIncom) / props.data[0].totalIncom;
    var res = roundToDecimal(num, 2);
    return res;
  };
  const { t } = useTranslation();
  return (
    <section className={styles.twomonth} style={gridSpan}>
      <div onClick={toggle} className="headerChild" title="↕ Resize the Card">
        <div className="circle"></div>
        <h2 className="Title">{t(LanguageKey.storestatistics_lasttwomonth)}</h2>
      </div>
      {hidePage && (
        <div className={styles.part}>
          {/* ___section1___*/}

          <div className={styles.section1}>
            <div className={styles.header}>
              <div className={styles.totalmonth}>
                <div className={styles.month}>
                  <div
                    className={styles.icon}
                    style={{
                      backgroundColor: "var(--color-light-blue60)",
                    }}></div>
                  <div className={styles.monthlabel}>
                    {t(LanguageKey.storestatistics_lastmonth)}(<strong>{NumToMonth(props.data[0].month)}</strong>)
                  </div>
                </div>
                <div className={styles.month}>
                  <div
                    className={styles.icon}
                    style={{
                      backgroundColor: "var(--color-light-blue)",
                    }}></div>
                  <div className={styles.monthlabel}>
                    {t(LanguageKey.storestatistics_thismonth)} (<strong>{NumToMonth(props.data[1].month)}</strong>)
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles.chart} translate`}>
              <LineChart chartId={""} items={[props.data[0], props.data[1]]} chartxType={chartxType.month} />
            </div>
          </div>
          {/* ___section2___*/}

          <div className={styles.section2}>
            <div className={styles.detail}>
              <svg className={styles.headericon} viewBox="0 0 50 50">
                <path
                  fill="var(--color-gray)"
                  d="M18.3 42.9a6 6 0 0 1-4.8 7 6 6 0 0 1-6.8-5L4.9 34.3a14 14 0 0 1-4.9-10C-.4 16.3 6.2 9.1 14.7 9h2.8v28.8ZM42.6 1.4a3.5 3.5 0 0 0-4.4-1L22 9v27.8l16.2 8.6a3.5 3.5 0 0 0 4.4-1 35 35 0 0 0 0-43"
                />
              </svg>

              <div className={styles.headercontent}>
                <div className={styles.summery} style={{ backgroundColor: "var(--color-light-blue30)" }}>
                  <div className={styles.summerycounter} style={{ color: "var(--color-light-blue60)" }}>
                    {numberToFormattedString(props.data[0].totalCount)}
                  </div>
                  <div className={styles.summerytype} style={{ color: "var(--color-light-blue60)" }}>
                    {t(LanguageKey.storestatistics_sales)}
                  </div>
                </div>
                <div className={styles.summery} style={{ backgroundColor: "var(--color-light-blue60)" }}>
                  <div className={styles.summerycounter} style={{ color: "var(--color-light-blue)" }}>
                    {numberToFormattedString(props.data[1].totalCount)}
                  </div>
                  <div className={styles.summerytype} style={{ color: "var(--color-light-blue)" }}>
                    {t(LanguageKey.storestatistics_sales)}
                  </div>
                </div>

                {calculatSalesRate() !== 0 && (
                  <div className={styles.summery} style={{ padding: "0px" }}>
                    <img
                      style={{ position: "relative", height: "12px" }}
                      alt="rate"
                      src={calculatSalesRate() < 0 ? "/decrease.svg" : "/increase.svg"}
                    />
                    <div
                      className={styles.percentage}
                      style={{
                        color: calculatSalesRate() < 0 ? "var(--color-light-red)" : "var(--color-light-green)",
                      }}>
                      <>
                        {calculatSalesRate()} {t(LanguageKey.storestatistics_fromlast)}
                      </>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.detail}>
              <svg className={styles.headericon} viewBox="0 0 50 50">
                <path
                  fill="var(--color-gray)"
                  d="M48.3 23.8H36a7.3 7.3 0 0 0-7.2 7.4 7.3 7.3 0 0 0 7.6 7.2h12a2 2 0 0 0 1.6-1.7v-11a2 2 0 0 0-1.7-1.9M36.5 34.3a3.1 3.1 0 1 1 3.1-3.2 3 3 0 0 1-3 3.2m-12-2a11.7 11.7 0 0 1 10.6-12.7h12.5V17a4.6 4.6 0 0 0-4.6-4.6h-3L37.9 1A1.5 1.5 0 0 0 36 0L5.5 6.8a7 7 0 0 0-5.6 7.6v24.1A11.4 11.4 0 0 0 11.3 50h31.6a4.7 4.7 0 0 0 4.7-4.7v-2.6h-11a12 12 0 0 1-12-10.3M7 11.4l25.4-5.5a1.5 1.5 0 0 1 1.8 1V7l.8 5.4H5.6a3 3 0 0 1 1.4-1"
                />
              </svg>

              <div className={styles.headercontent}>
                <div className={styles.summery} style={{ backgroundColor: "var(--color-light-blue30)" }}>
                  <div className={styles.summerytype} style={{ color: "var(--color-light-blue60)" }}>
                    $
                  </div>
                  <div className={styles.summerycounter} style={{ color: "var(--color-light-blue60)" }}>
                    {numberToFormattedString(props.data[0].totalIncom)}
                  </div>
                </div>
                <div className={styles.summery} style={{ backgroundColor: "var(--color-light-blue60)" }}>
                  <div className={styles.summerytype} style={{ color: "var(--color-light-blue)" }}>
                    $
                  </div>
                  <div className={styles.summerycounter} style={{ color: "var(--color-light-blue)" }}>
                    {numberToFormattedString(props.data[1].totalIncom)}
                  </div>
                </div>

                {calculatIncomeRate() !== 0 && (
                  <div className={styles.summery} style={{ padding: "0px" }}>
                    <img
                      style={{ position: "relative", height: "12px" }}
                      alt="rate"
                      src={calculatIncomeRate() < 0 ? "/decrease.svg" : "/increase.svg"}
                    />
                    <div
                      className={styles.percentage}
                      style={{
                        color: calculatIncomeRate() < 0 ? "var(--color-light-red)" : "var(--color-light-green)",
                      }}>
                      <>
                        {calculatIncomeRate()} {t(LanguageKey.storestatistics_fromlast)}
                      </>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TwoMonth;
