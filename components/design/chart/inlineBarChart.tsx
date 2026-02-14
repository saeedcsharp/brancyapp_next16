import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./inlineBarChart.module.css";

export interface IShortMonth {
  month: number;
  year: number;
  totalCount: number;
  plusCount?: number;
}

interface InlineBarChartProps {
  chartId: string;
  items: IShortMonth[];
  height: string;
}

type CalendarId = "gregory" | "persian" | "islamic" | "indian";

const mapCalendarNameToId = (name?: string): CalendarId => {
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

export const InlineBarChart = ({ chartId, items, height }: InlineBarChartProps) => {
  const { i18n } = useTranslation();
  const [currentCalendar, setCurrentCalendar] = useState<CalendarId>(() => {
    if (typeof window === "undefined") return "gregory";
    try {
      const cal = window.localStorage.getItem("calendar") ?? "Gregorian";
      return mapCalendarNameToId(cal);
    } catch {
      return "gregory";
    }
  });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [focusedBarIndex, setFocusedBarIndex] = useState<number>(-1);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number>(-1);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const cal = window.localStorage.getItem("calendar") ?? "Gregorian";
      setCurrentCalendar(mapCalendarNameToId(cal));
    } catch {}

    const onCalendarChanged = (e: Event) => {
      const custom = e as CustomEvent<string>;
      setCurrentCalendar(mapCalendarNameToId(custom?.detail));
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === "calendar") {
        setCurrentCalendar(mapCalendarNameToId(e.newValue ?? "Gregorian"));
      }
    };

    window.addEventListener("brancy:calendar-changed", onCalendarChanged as EventListener);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("brancy:calendar-changed", onCalendarChanged as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const locale = i18n?.language || "en";

  const localeWithCalendar = useMemo(() => {
    try {
      return `${locale}-u-ca-${currentCalendar}`;
    } catch {
      return locale;
    }
  }, [locale, currentCalendar]);

  const monthFormatter = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(localeWithCalendar, { month: "long" });
    } catch {
      return new Intl.DateTimeFormat(locale, { month: "long" });
    }
  }, [localeWithCalendar, locale]);

  const getMonthName = useCallback(
    (month: number, year?: number) => {
      const d = new Date(year || new Date().getFullYear(), month - 1, 1);
      return monthFormatter.format(d);
    },
    [monthFormatter]
  );

  const maxNumber = useMemo(() => {
    if (!items.length) return 100;
    const max = Math.max(...items.map((item) => item.totalCount));
    return max || 100;
  }, [items]);

  const formatNumber = useCallback((num: number) => {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(1) + "B";
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(1) + "M";
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(1) + "K";
    }
    return Math.round(num).toLocaleString();
  }, []);

  const padding = useMemo(() => ({ top: 10, right: 10, bottom: 40, left: 65 }), []);
  const barWidth = 25;
  const barGap = 30;
  const yAxisTicks = 5;

  const chartWidth = useMemo(() => {
    return items.length * (barWidth + barGap) + padding.left + padding.right;
  }, [items.length, padding.left, padding.right]);

  const yAxisValues = useMemo(() => {
    const values: number[] = [];
    for (let i = 0; i <= yAxisTicks; i++) {
      values.push((maxNumber / yAxisTicks) * i);
    }
    return values;
  }, [maxNumber]);

  const average = useMemo(() => {
    if (!items || !items.length) return 0;
    const sum = items.reduce((s, it) => s + (typeof it.totalCount === "number" ? it.totalCount : 0), 0);
    return sum / items.length;
  }, [items]);

  const avgDisplay = useMemo(() => {
    return formatNumber(average);
  }, [average, formatNumber]);

  const getYPosition = useCallback(
    (value: number, chartHeight: number) => {
      const availableHeight = chartHeight - padding.top - padding.bottom;
      return Math.round(chartHeight - padding.bottom - (value / maxNumber) * availableHeight);
    },
    [maxNumber, padding.top, padding.bottom]
  );

  const getXPosition = useCallback(
    (index: number) => {
      return Math.round(padding.left + index * (barWidth + barGap) + barGap / 2);
    },
    [padding.left]
  );

  const handleBarClick = useCallback((index: number) => {
    setSelectedBarIndex((prev) => (prev === index ? -1 : index));
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleBarClick(index);
      } else if (e.key === "Escape") {
        setFocusedBarIndex(-1);
        setSelectedBarIndex(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const nextIndex = Math.min(index + 1, items.length - 1);
        setFocusedBarIndex(nextIndex);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex = Math.max(index - 1, 0);
        setFocusedBarIndex(prevIndex);
      }
    },
    [handleBarClick]
  );

  const avgLineElement = useMemo(() => {
    if (items.length === 0) return null;
    const avgY = getYPosition(average, 300);
    const topPct = (avgY / 300) * 100;
    const x1 = Math.round(padding.left - 30);
    const x2 = Math.round(chartWidth - padding.right);
    const widthPx = Math.round(x2 - x1);
    return (
      <div
        key="avg-line-div"
        className={styles["avg-line-wrapper"]}
        style={{ left: 0, width: Math.round(chartWidth), top: `${topPct}%` }}>
        <div className={styles["avg-line"]} style={{ left: x1, width: widthPx }} />
        <div className={styles["avg-text"]}>{avgDisplay}</div>
      </div>
    );
  }, [items.length, average, avgDisplay, chartWidth, padding.left, padding.right, getYPosition]);

  const selectedBarLineElement = useMemo(() => {
    if (selectedBarIndex === -1 || selectedBarIndex >= items.length) return null;
    const selectedItem = items[selectedBarIndex];
    const selectedY = getYPosition(selectedItem.totalCount, 300);
    const topPct = (selectedY / 300) * 100;
    const x1 = Math.round(padding.left - 30);
    const x2 = Math.round(chartWidth - padding.right);
    const widthPx = Math.round(x2 - x1);
    return (
      <div
        key="selected-line-div"
        className={styles["selected-line-wrapper"]}
        style={{ left: 0, width: Math.round(chartWidth), top: `${topPct}%` }}>
        <div className={styles["selected-line"]} style={{ left: x1, width: widthPx }} />
        <div className={styles["selected-text"]}>{formatNumber(selectedItem.totalCount)}</div>
      </div>
    );
  }, [selectedBarIndex, items, chartWidth, padding.left, padding.right, getYPosition, formatNumber]);

  return (
    <div
      className="translate"
      style={{
        width: "100%",
        height: height,
        overflow: "hidden",
        position: "relative",
      }}
      ref={containerRef}
      role="img"
      aria-label="Bar chart showing monthly statistics">
      <svg
        id={chartId}
        width={chartWidth}
        height="100%"
        className={styles.chartSvg}
        viewBox={`0 0 ${chartWidth} 300`}
        preserveAspectRatio="none"
        role="presentation"
        aria-hidden="true">
        <defs>
          <linearGradient id={`bar-blue-grad-${chartId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-dark-blue)" />
            <stop offset="100%" stopColor="var(--color-dark-blue10)" />
          </linearGradient>
          <linearGradient id={`bar-gray-grad-${chartId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-gray10)" />
            <stop offset="100%" stopColor="var(--color-gray10)" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {yAxisValues.map((value, index) => {
          const y = getYPosition(value, 300);
          return (
            <line
              key={`grid-${index}`}
              x1={Math.round(padding.left - 30)}
              y1={y}
              x2={Math.round(chartWidth - padding.right)}
              y2={y}
              className={styles["grid-line"]}
            />
          );
        })}

        {/* Y-axis labels */}
        {yAxisValues.map((value, index) => {
          const y = getYPosition(value, 300);
          return (
            <text
              key={`y-label-${index}`}
              x={Math.round(padding.left - 20)}
              y={Math.round(y + 4)}
              className={styles["axis-text"]}
              textAnchor="end">
              {formatNumber(value)}
            </text>
          );
        })}

        {/* Bars */}
        {items.map((item, index) => {
          const x = getXPosition(index);
          const totalHeight = Math.round(300 - padding.bottom - getYPosition(item.totalCount, 300));
          const blueHeight = totalHeight;
          const innerHeight = Math.round(300 - padding.bottom - padding.top);
          const gapBetween = 5;
          const grayHeight = Math.max(0, innerHeight - blueHeight - gapBetween);
          const blueY = getYPosition(item.totalCount, 300);
          const grayY = Math.round(padding.top);
          const isFocused = focusedBarIndex === index;

          return (
            <g key={`${item.month}-${item.year}`} transform={`translate(-20,0)`}>
              <rect
                x={x}
                y={grayY}
                width={barWidth}
                height={grayHeight}
                className={styles["bar-gray"]}
                rx="8"
                ry="8"
                fill={`url(#bar-gray-grad-${chartId})`}
              />
              <rect
                x={x}
                y={blueY}
                width={barWidth}
                height={blueHeight}
                className={styles["bar-blue"]}
                rx="8"
                ry="8"
                fill={`url(#bar-blue-grad-${chartId})`}
                onClick={() => handleBarClick(index)}
                onFocus={() => setFocusedBarIndex(index)}
                onBlur={() => setFocusedBarIndex(-1)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                tabIndex={0}
                role="button"
                aria-label={`${getMonthName(Math.ceil(item.month), item.year)}: ${formatNumber(item.totalCount)}`}
                style={{
                  outline: isFocused ? "none" : "none",
                  outlineOffset: "0px",
                  cursor: "pointer",
                }}
              />
            </g>
          );
        })}

        {/* X-axis labels */}
        {items.map((item, index) => {
          const x = Math.round(getXPosition(index) + barWidth / 2 - 15);
          const monthName = getMonthName(Math.ceil(item.month), item.year);
          const labelY = Math.round(300 - padding.bottom + 10);
          return (
            <text
              key={`x-label-${item.month}-${item.year}`}
              x={x}
              y={labelY}
              transform={`rotate(-30 ${x} ${labelY})`}
              className={styles["axis-text"]}
              textAnchor="end"
              dominantBaseline="middle">
              {monthName}
            </text>
          );
        })}
      </svg>

      {avgLineElement}
      {selectedBarLineElement}
    </div>
  );
};

export default InlineBarChart;
