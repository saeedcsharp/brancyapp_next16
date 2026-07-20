import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import BrushLineChart, { BrushLineChartSeries } from "brancy/components/design/chart/brushLineChart";
import { numberToFormattedString } from "brancy/helper/numberFormater";
import useHideDiv from "brancy/hook/useHide";
import { LanguageKey } from "brancy/i18n";
import styles from "./totalSalesStatistics.module.css";
import { ISaleShortMonth } from "brancy/models/interfaces";

type CalendarId = "gregory" | "persian" | "islamic" | "indian";

const mapCalendarNameToId = (name?: string | null): CalendarId => {
  switch (name) {
    case "shamsi":
      return "persian";
    case "Hijri":
      return "islamic";
    case "Hindi":
      return "indian";
    case "Gregorian":
    default:
      return "gregory";
  }
};

const TotalSalesStatistics = (props: { data: ISaleShortMonth[] }) => {
  const { hidePage, gridSpan, toggle } = useHideDiv(true, 47);
  const { t, i18n } = useTranslation();
  const [calendarId, setCalendarId] = useState<CalendarId>(() => {
    if (typeof window === "undefined") return "gregory";
    return mapCalendarNameToId(window.localStorage.getItem("calendar"));
  });

  useEffect(() => {
    const onCalendarChanged = (event: Event) => {
      setCalendarId(mapCalendarNameToId((event as CustomEvent<string>).detail));
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "calendar") setCalendarId(mapCalendarNameToId(event.newValue));
    };

    window.addEventListener("brancy:calendar-changed", onCalendarChanged as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("brancy:calendar-changed", onCalendarChanged as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const calendarLocale = `en-US-u-ca-${calendarId}`;
  const displayCalendarLocale = `${i18n.language || "en"}-u-ca-${calendarId}`;
  const calendarPartsFormatter = useMemo(
    () => new Intl.DateTimeFormat(calendarLocale, { year: "numeric", month: "numeric" }),
    [calendarLocale],
  );
  const monthNameFormatter = useMemo(
    () => new Intl.DateTimeFormat(displayCalendarLocale, { month: "long" }),
    [displayCalendarLocale],
  );
  const chartSeries: BrushLineChartSeries[] = [
    {
      id: "total-sales",
      name: t(LanguageKey.storestatistics_TotalSales),
      items: props.data.map((item) => ({
        date: new Date(item.year, item.month - 1, item.day || 1),
        count: item.totalCount,
      })),
    },
    {
      id: "new-sales",
      name: "+",

      items: props.data.map((item) => ({
        date: new Date(item.year, item.month - 1, item.day || 1),
        count: item.plusCount,
      })),
    },
  ];
  const totalSales = props.data.reduce((sum, item) => sum + item.totalCount, 0);
  const totalIncome = props.data.reduce((sum, item) => sum + item.totalIncome, 0);
  const monthlyStatistics = [...props.data].sort(
    (first, second) =>
      new Date(first.year, first.month - 1, first.day || 1).getTime() -
      new Date(second.year, second.month - 1, second.day || 1).getTime(),
  );
  const monthlyStatisticsByCalendar = monthlyStatistics.map((item) => {
    const date = new Date(item.year, item.month - 1, item.day || 1);
    const parts = calendarPartsFormatter.formatToParts(date);
    const year = Number(parts.find((part) => part.type === "year")?.value);
    const month = Number(parts.find((part) => part.type === "month")?.value);
    return { item, date, year, month, key: `${year}-${month}` };
  });
  const currentMonthStatistics = monthlyStatisticsByCalendar.at(-1);
  const previousMonthKey = currentMonthStatistics
    ? `${currentMonthStatistics.month === 1 ? currentMonthStatistics.year - 1 : currentMonthStatistics.year}-${
        currentMonthStatistics.month === 1 ? 12 : currentMonthStatistics.month - 1
      }`
    : undefined;
  const previousMonthStatistics = previousMonthKey
    ? monthlyStatisticsByCalendar.filter((entry) => entry.key === previousMonthKey).at(-1)
    : undefined;
  const currentMonthName = currentMonthStatistics ? monthNameFormatter.format(currentMonthStatistics.date) : "--";
  const calculateRate = (currentValue: number, previousValue: number | undefined) => {
    if (previousValue === undefined || previousValue === 0) return null;
    return Math.round(((currentValue - previousValue) / Math.abs(previousValue)) * 10000) / 100;
  };
  const incomeRate = currentMonthStatistics
    ? calculateRate(currentMonthStatistics.item.totalIncome, previousMonthStatistics?.item.totalIncome)
    : null;
  const salesRate = currentMonthStatistics
    ? calculateRate(currentMonthStatistics.item.totalCount, previousMonthStatistics?.item.totalCount)
    : null;
  const renderRate = (rate: number | null) => (
    <>
      {rate === null ? "--" : `${rate > 0 ? "+" : ""}${rate}%`}
      {rate !== null && rate !== 0 && (
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true">
          <path
            d={rate > 0 ? "M0.75 8.75L8.75 0.75M8.75 6.75V0.75H2.75" : "M0.75 0.75L8.75 8.75M8.75 2.75V8.75H2.75"}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </>
  );
  return (
    <section className={styles.statistics} style={gridSpan}>
      <div onClick={toggle} className="headerChild" title="↕ Resize the Card">
        <div className="circle"></div>
        <h2 className="Title">{t(LanguageKey.storestatistics_totalSalesstatistics)}</h2>
      </div>
      {hidePage && (
        <div className={styles.main}>
          <div className={styles.totalsummery}>
            {/*  */}
            <div className={styles.totalsummerychild}>
              <div className={styles.totalcounterparent}>
                <div className={styles.totalcounterrate} style={{ color: "var(--color-purple)" }}>
                  {renderRate(incomeRate)}
                </div>
                <div className={styles.totalcountercount}>{currentMonthName}</div>
              </div>
              <div className={styles.totalabel} style={{ color: "var(--color-purple)" }}>
                <strong>{numberToFormattedString(totalIncome)}</strong>
                {/* <span>{t(LanguageKey.navbar_Orders)}</span> */}
              </div>
            </div>
            {/*  */}
            <div className={styles.totalsummerychild}>
              <div className={styles.totalcounterparent}>
                <div className={styles.totalcounterrate} style={{ color: "#4a3aff" }}>
                  {renderRate(salesRate)}
                </div>
                <div className={styles.totalcountercount}>{currentMonthName}</div>
              </div>
              <div className={styles.totalabel} style={{ color: "#4a3aff" }}>
                <strong>{numberToFormattedString(totalSales)}</strong>
                {/* <span>{t(LanguageKey.navbar_Orders)}</span> */}
              </div>
            </div>
          </div>
          <div className={styles.totalchart}>
            <BrushLineChart chartId="total-sales-statistics-chart" series={chartSeries} />
          </div>
        </div>
      )}
    </section>
  );
};

export default TotalSalesStatistics;
