import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./brushLineChart.module.css";

export interface BrushLineChartPoint {
  date: string | number | Date;
  count: number;
}

export interface BrushLineChartSeries {
  id: string;
  name: string;
  color?: string;
  items: BrushLineChartPoint[];
}

interface BrushLineChartProps {
  chartId: string;
  series: BrushLineChartSeries[];
  height?: string;
}

type CalendarId = "gregory" | "persian" | "islamic" | "indian";
type DragMode = "start" | "end" | "range" | null;

interface ChartPoint {
  dateKey: number;
  date: Date;
  x: number;
  y: number;
  value: number;
}

type VisibleGranularity = "year" | "month" | "day";

interface AggregatedPoint {
  key: string;
  date: Date;
  values: Map<string, number>;
}

interface AxisLabel {
  primary: string;
  secondary?: string;
}

const colors = [
  "var(--color-dark-blue)",
  "var(--color-purple)",

  "var(--color-firooze)",
  "var(--color-light-blue)",
  "var(--color-light-red)",
  "var(--color-dark-green)",
];

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

const round2 = (num: number) => Math.round(num * 10) / 10;

const formatNumber = (num: number) => {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "b";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "m";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "k";
  return Math.round(num).toLocaleString();
};

const toDateKey = (value: string | number | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};

const startOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate());

const startOfMonth = (value: Date) => new Date(value.getFullYear(), value.getMonth(), 1);

const startOfYear = (value: Date) => new Date(value.getFullYear(), 0, 1);

const getGranularityFromSpan = (spanDays: number): VisibleGranularity => {
  if (spanDays <= 31) return "day";
  if (spanDays <= 365) return "month";
  return "year";
};

const getGroupDate = (date: Date, granularity: VisibleGranularity) => {
  switch (granularity) {
    case "day":
      return startOfDay(date);
    case "month":
      return startOfMonth(date);
    case "year":
    default:
      return startOfYear(date);
  }
};

const getGroupKey = (date: Date, granularity: VisibleGranularity) => {
  switch (granularity) {
    case "day":
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    case "month":
      return `${date.getFullYear()}-${date.getMonth()}`;
    case "year":
    default:
      return `${date.getFullYear()}`;
  }
};

const getSmoothPath = (points: ChartPoint[]) => {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length; index++) {
    const previous = points[index - 1];
    const current = points[index];
    const cpX1 = round2(previous.x + (current.x - previous.x) / 3);
    const cpY1 = previous.y;
    const cpX2 = round2(previous.x + ((current.x - previous.x) * 2) / 3);
    const cpY2 = current.y;
    path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${current.x} ${current.y}`;
  }

  return path;
};

const BrushLineChartComponent: React.FC<BrushLineChartProps> = ({ chartId, series }) => {
  const { i18n } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const brushRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ mode: DragMode; startX: number; startRange: [number, number] }>({
    mode: null,
    startX: 0,
    startRange: [0, 1],
  });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [visibleRange, setVisibleRange] = useState<[number, number]>([0, 1]);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [calendarId, setCalendarId] = useState<CalendarId>(() => {
    if (typeof window === "undefined") return "gregory";
    try {
      return mapCalendarNameToId(window.localStorage.getItem("calendar"));
    } catch {
      return "gregory";
    }
  });

  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    if (!width || !height) return;
    setDimensions((current) => {
      const next = { width: Math.round(width), height: Math.round(height) };
      return current.width === next.width && current.height === next.height ? current : next;
    });
  }, []);

  useEffect(() => {
    let frameId = 0;
    let secondFrameId = 0;

    const measureAfterLayout = () => {
      updateDimensions();
      secondFrameId = window.requestAnimationFrame(updateDimensions);
    };

    frameId = window.requestAnimationFrame(measureAfterLayout);
    if (typeof ResizeObserver === "undefined" || !containerRef.current) {
      window.addEventListener("resize", updateDimensions);
      return () => {
        window.cancelAnimationFrame(frameId);
        window.cancelAnimationFrame(secondFrameId);
        window.removeEventListener("resize", updateDimensions);
      };
    }

    const observer = new ResizeObserver(() => updateDimensions());
    observer.observe(containerRef.current);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.cancelAnimationFrame(secondFrameId);
      observer.disconnect();
    };
  }, [updateDimensions]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onCalendarChanged = (event: Event) => {
      const custom = event as CustomEvent<string>;
      setCalendarId(mapCalendarNameToId(custom.detail));
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

  const normalizedSeries = useMemo(() => {
    return series
      .map((serie, seriesIndex) => ({
        ...serie,
        color: serie.color || colors[seriesIndex % colors.length],
        items: serie.items
          .map((item) => {
            const dateKey = toDateKey(item.date);
            if (dateKey === null) return null;
            return {
              dateKey,
              date: new Date(dateKey),
              count: Math.max(0, item.count || 0),
            };
          })
          .filter((item): item is { dateKey: number; date: Date; count: number } => item !== null)
          .sort((a, b) => a.dateKey - b.dateKey),
      }))
      .filter((serie) => serie.items.length > 0);
  }, [series]);

  const activeSeries = useMemo(
    () => normalizedSeries.filter((serie) => !hiddenSeries.has(serie.id)),
    [normalizedSeries, hiddenSeries],
  );

  const timeline = useMemo(() => {
    const dateMap = new Map<number, Date>();
    normalizedSeries.forEach((serie) => {
      serie.items.forEach((item) => dateMap.set(item.dateKey, item.date));
    });
    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([dateKey, date]) => ({ dateKey, date }));
  }, [normalizedSeries]);

  useEffect(() => {
    setVisibleRange((current) => {
      if (current[0] === 0 && current[1] === 1) return current;
      return [0, 1];
    });
    setHoverIndex(null);
  }, [timeline.length, normalizedSeries.length]);

  const locale = i18n?.language || "en";
  const localeWithCalendar = useMemo(() => `${locale}-u-ca-${calendarId}`, [locale, calendarId]);
  const dateFormatter = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(localeWithCalendar, { month: "short", day: "numeric" });
    } catch {
      return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });
    }
  }, [localeWithCalendar, locale]);

  const padding = useMemo(() => {
    const left = Math.max(40, Math.min(70, Math.round(dimensions.width * 0.08)));
    const bottom = Math.max(28, Math.min(42, Math.round(dimensions.height * 0.12)));
    const top = Math.max(16, Math.min(28, Math.round(dimensions.height * 0.06)));
    return { top, right: 16, bottom, left };
  }, [dimensions.width, dimensions.height]);
  const brushPadding = useMemo(() => ({ top: 8, right: 16, bottom: 8, left: padding.left }), [padding.left]);
  const chartWidth = Math.max(1, dimensions.width - padding.left - padding.right);
  const brushAreaHeight = Math.max(54, Math.round(dimensions.height * 0.18));
  const chartHeight = Math.max(1, dimensions.height - brushAreaHeight - padding.top - padding.bottom);
  const brushWidth = Math.max(1, dimensions.width - brushPadding.left - brushPadding.right);
  const brushHeight = Math.max(34, Math.min(64, Math.round(brushAreaHeight * 0.55)));

  const visibleBounds = useMemo(() => {
    if (timeline.length <= 1) return { startIndex: 0, endIndex: Math.max(0, timeline.length - 1) };
    const maxIndex = timeline.length - 1;
    const startIndex = Math.max(0, Math.min(maxIndex, Math.floor(visibleRange[0] * maxIndex)));
    const endIndex = Math.max(startIndex, Math.min(maxIndex, Math.ceil(visibleRange[1] * maxIndex)));
    return { startIndex, endIndex };
  }, [timeline.length, visibleRange]);

  const visibleTimeline = useMemo(() => {
    return timeline.slice(visibleBounds.startIndex, visibleBounds.endIndex + 1);
  }, [timeline, visibleBounds]);

  const visibleSpanDays = useMemo(() => {
    if (visibleTimeline.length <= 1) return 0;
    const first = visibleTimeline[0].dateKey;
    const last = visibleTimeline[visibleTimeline.length - 1].dateKey;
    return Math.max(0, Math.round((last - first) / 86400000));
  }, [visibleTimeline]);

  const visibleGranularity = useMemo(() => getGranularityFromSpan(visibleSpanDays), [visibleSpanDays]);

  const valueBySeries = useMemo(() => {
    const map = new Map<string, Map<number, number>>();
    normalizedSeries.forEach((serie) => {
      const values = new Map<number, number>();
      serie.items.forEach((item) => values.set(item.dateKey, item.count));
      map.set(serie.id, values);
    });
    return map;
  }, [normalizedSeries]);

  const aggregatedTimeline = useMemo<AggregatedPoint[]>(() => {
    const grouped = new Map<string, AggregatedPoint>();

    visibleTimeline.forEach((item) => {
      const groupedDate = getGroupDate(item.date, visibleGranularity);
      const key = getGroupKey(groupedDate, visibleGranularity);
      const bucket = grouped.get(key) ?? { key, date: groupedDate, values: new Map<string, number>() };

      activeSeries.forEach((serie) => {
        const currentValue = bucket.values.get(serie.id) || 0;
        bucket.values.set(serie.id, currentValue + (valueBySeries.get(serie.id)?.get(item.dateKey) || 0));
      });

      grouped.set(key, bucket);
    });

    return Array.from(grouped.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [visibleTimeline, visibleGranularity, activeSeries, valueBySeries]);

  const fullAggregatedTimeline = useMemo<AggregatedPoint[]>(() => {
    const grouped = new Map<string, AggregatedPoint>();

    timeline.forEach((item) => {
      const groupedDate = getGroupDate(item.date, visibleGranularity);
      const key = getGroupKey(groupedDate, visibleGranularity);
      const bucket = grouped.get(key) ?? { key, date: groupedDate, values: new Map<string, number>() };

      activeSeries.forEach((serie) => {
        const currentValue = bucket.values.get(serie.id) || 0;
        bucket.values.set(serie.id, currentValue + (valueBySeries.get(serie.id)?.get(item.dateKey) || 0));
      });

      grouped.set(key, bucket);
    });

    return Array.from(grouped.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [timeline, visibleGranularity, activeSeries, valueBySeries]);

  const aggregatedMaxY = useMemo(() => {
    const values = fullAggregatedTimeline.flatMap((bucket) =>
      activeSeries.map((serie) => bucket.values.get(serie.id) || 0),
    );
    return Math.max(...values, 1);
  }, [fullAggregatedTimeline, activeSeries]);

  const getGroupedX = useCallback(
    (index: number) => round2(padding.left + (index / Math.max(aggregatedTimeline.length - 1, 1)) * chartWidth),
    [padding.left, aggregatedTimeline.length, chartWidth],
  );

  const getFullTimelineX = useCallback(
    (date: Date) => {
      const firstDate = aggregatedTimeline[0]?.date.getTime() ?? date.getTime();
      const lastDate = aggregatedTimeline[aggregatedTimeline.length - 1]?.date.getTime() ?? date.getTime();
      const dateRange = Math.max(lastDate - firstDate, 1);
      const relativePosition = (date.getTime() - firstDate) / dateRange;
      return round2(padding.left + relativePosition * chartWidth);
    },
    [aggregatedTimeline, padding.left, chartWidth],
  );

  const getY = useCallback(
    (value: number) => round2(padding.top + chartHeight - (value / aggregatedMaxY) * chartHeight),
    [padding.top, chartHeight, aggregatedMaxY],
  );

  const chartSeries = useMemo(() => {
    return activeSeries.map((serie) => {
      const points = fullAggregatedTimeline.map((bucket) => {
        const aggregatedValue = bucket.values.get(serie.id) || 0;

        return {
          dateKey: bucket.date.getTime(),
          date: bucket.date,
          x: getFullTimelineX(bucket.date),
          y: getY(aggregatedValue),
          value: aggregatedValue,
        };
      });

      return { ...serie, points, path: getSmoothPath(points) };
    });
  }, [activeSeries, fullAggregatedTimeline, getFullTimelineX, getY]);

  const yTicks = useMemo(() => {
    const tickCount = 4;
    return Array.from({ length: tickCount + 1 }, (_, index) => {
      const value = (aggregatedMaxY / tickCount) * index;
      return { value, y: getY(value), label: formatNumber(value) };
    });
  }, [aggregatedMaxY, getY]);

  const axisFormatter = useMemo(() => {
    try {
      switch (visibleGranularity) {
        case "year":
          return new Intl.DateTimeFormat(localeWithCalendar, { year: "numeric" });
        case "month":
          return new Intl.DateTimeFormat(localeWithCalendar, { month: "short", year: "numeric" });
        case "day":
        default:
          return new Intl.DateTimeFormat(localeWithCalendar, { month: "short", day: "numeric" });
      }
    } catch {
      switch (visibleGranularity) {
        case "year":
          return new Intl.DateTimeFormat(locale, { year: "numeric" });
        case "month":
          return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" });
        case "day":
        default:
          return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });
      }
    }
  }, [localeWithCalendar, locale, visibleGranularity]);

  const xTicks = useMemo(() => {
    const step = Math.max(1, Math.ceil(aggregatedTimeline.length / 6));
    return aggregatedTimeline
      .map((point, index) => ({ point, index }))
      .filter(({ index }) => index % step === 0 || index === aggregatedTimeline.length - 1)
      .map(({ point, index }) => {
        const label: AxisLabel =
          visibleGranularity === "day"
            ? {
                primary: new Intl.DateTimeFormat(localeWithCalendar, { day: "numeric" }).format(point.date),
                secondary: new Intl.DateTimeFormat(localeWithCalendar, { month: "short" }).format(point.date),
              }
            : visibleGranularity === "month"
              ? {
                  primary: new Intl.DateTimeFormat(localeWithCalendar, { month: "short" }).format(point.date),
                  secondary: new Intl.DateTimeFormat(localeWithCalendar, { year: "numeric" }).format(point.date),
                }
              : {
                  primary: axisFormatter.format(point.date),
                };

        return { x: getGroupedX(index), label };
      });
  }, [aggregatedTimeline, getGroupedX, axisFormatter]);

  const brushSeries = useMemo(() => {
    const allMax = Math.max(
      ...normalizedSeries.flatMap((serie) =>
        timeline.map((item) => valueBySeries.get(serie.id)?.get(item.dateKey) || 0),
      ),
      1,
    );

    return normalizedSeries.map((serie) => {
      const serieValues = valueBySeries.get(serie.id);
      const points = timeline.map((item, index) => ({
        dateKey: item.dateKey,
        date: item.date,
        x: round2(brushPadding.left + (index / Math.max(timeline.length - 1, 1)) * brushWidth),
        y: round2(brushPadding.top + brushHeight - ((serieValues?.get(item.dateKey) || 0) / allMax) * brushHeight),
        value: serieValues?.get(item.dateKey) || 0,
      }));
      return { ...serie, points, path: getSmoothPath(points) };
    });
  }, [normalizedSeries, timeline, valueBySeries, brushPadding.left, brushPadding.top, brushWidth]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || !aggregatedTimeline.length) return;
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const chartX = Math.max(padding.left, Math.min(padding.left + chartWidth, mouseX));
      const relativeX = (chartX - padding.left) / Math.max(chartWidth, 1);
      const closestIndex = Math.max(
        0,
        Math.min(aggregatedTimeline.length - 1, Math.round(relativeX * Math.max(aggregatedTimeline.length - 1, 1))),
      );

      setHoverIndex(closestIndex);
    },
    [aggregatedTimeline.length, chartWidth, padding.left],
  );

  const getHoverZone = useCallback(
    (index: number) => {
      const center = getGroupedX(index);
      const previousCenter = index > 0 ? getGroupedX(index - 1) : padding.left;
      const nextCenter = index < aggregatedTimeline.length - 1 ? getGroupedX(index + 1) : padding.left + chartWidth;
      return {
        left: index === 0 ? padding.left : (previousCenter + center) / 2,
        right: index === aggregatedTimeline.length - 1 ? padding.left + chartWidth : (center + nextCenter) / 2,
      };
    },
    [aggregatedTimeline.length, chartWidth, getGroupedX, padding.left],
  );

  const getRangeFromBrushEvent = useCallback(
    (clientX: number) => {
      if (!brushRef.current) return 0;
      const rect = brushRef.current.getBoundingClientRect();
      return Math.max(0, Math.min(1, (clientX - rect.left - brushPadding.left) / brushWidth));
    },
    [brushPadding.left, brushWidth],
  );

  const startDrag = useCallback(
    (mode: DragMode, clientX: number) => {
      dragRef.current = { mode, startX: clientX, startRange: visibleRange };
    },
    [visibleRange],
  );

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const { mode, startX, startRange } = dragRef.current;
      if (!mode) return;

      if (mode === "start") {
        const nextStart = Math.min(getRangeFromBrushEvent(event.clientX), startRange[1] - 0.05);
        setVisibleRange([Math.max(0, nextStart), startRange[1]]);
      } else if (mode === "end") {
        const nextEnd = Math.max(getRangeFromBrushEvent(event.clientX), startRange[0] + 0.05);
        setVisibleRange([startRange[0], Math.min(1, nextEnd)]);
      } else if (mode === "range") {
        const delta = (event.clientX - startX) / brushWidth;
        const rangeSize = startRange[1] - startRange[0];
        const nextStart = Math.max(0, Math.min(1 - rangeSize, startRange[0] + delta));
        setVisibleRange([nextStart, nextStart + rangeSize]);
      }
    };

    const onPointerUp = () => {
      dragRef.current.mode = null;
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [brushWidth, getRangeFromBrushEvent]);

  const toggleSeries = useCallback((id: string) => {
    setHiddenSeries((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const hoveredDate = hoverIndex === null ? null : aggregatedTimeline[hoverIndex];
  const brushStartX = round2(brushPadding.left + visibleRange[0] * brushWidth);
  const brushEndX = round2(brushPadding.left + visibleRange[1] * brushWidth);

  if (!normalizedSeries.length || !timeline.length) {
    return <div className={styles.empty}>No chart data</div>;
  }

  return (
    <div ref={containerRef} className={`${styles.container} translate`} role="figure">
      <div className={styles.chartWrap}>
        <svg
          ref={svgRef}
          id={chartId}
          width="100%"
          height="100%"
          className={styles.svg}
          role="img"
          aria-label={`Line chart with ${visibleGranularity} axis and count values`}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}>
          <defs>
            <clipPath id={`${chartId}-plot-clip`}>
              <rect x={padding.left} y={padding.top} width={chartWidth} height={chartHeight} />
            </clipPath>
          </defs>
          <g className={styles.grid}>
            {yTicks.map((tick, index) => (
              <line
                key={`grid-y-${index}`}
                x1={padding.left}
                y1={tick.y}
                x2={padding.left + chartWidth}
                y2={tick.y}
                stroke="var(--color-gray30)"
              />
            ))}
            {xTicks.map((tick, index) => (
              <line
                key={`grid-x-${index}`}
                x1={tick.x}
                y1={padding.top}
                x2={tick.x}
                y2={padding.top + chartHeight}
                stroke="var(--color-gray30)"
              />
            ))}
          </g>

          <g clipPath={`url(#${chartId}-plot-clip)`}>
            {chartSeries.map((serie) => (
              <path
                key={`${serie.id}-${serie.path}`}
                d={serie.path}
                className={styles.line}
                pathLength="1"
                stroke={serie.color}
                strokeWidth={2}
                opacity={serie.points.length ? 1 : 0}
              />
            ))}
          </g>

          <g className={styles.hoverZones}>
            {aggregatedTimeline.map((_, index) => {
              const zone = getHoverZone(index);
              return (
                <rect
                  key={`hover-zone-${index}`}
                  x={zone.left}
                  y={padding.top}
                  width={Math.max(1, zone.right - zone.left)}
                  height={chartHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoverIndex(index)}
                />
              );
            })}
          </g>

          {hoverIndex !== null && hoveredDate && (
            <g className={styles.hoverLine}>
              <line
                x1={getGroupedX(hoverIndex)}
                y1={padding.top}
                x2={getGroupedX(hoverIndex)}
                y2={padding.top + chartHeight}
                stroke="var(--text-h2)"
                strokeDasharray="4 4"
                opacity={0.45}
              />
              {chartSeries.map((serie) => {
                const point = serie.points.find((item) => item.dateKey === hoveredDate.date.getTime());
                if (!point) return null;
                return (
                  <circle
                    key={serie.id}
                    cx={point.x}
                    cy={point.y}
                    r={4}
                    fill={serie.color}
                    stroke="var(--color-white)"
                  />
                );
              })}
            </g>
          )}

          {yTicks.map((tick, index) => (
            <text
              key={`y-label-${index}`}
              x={padding.left - 10}
              y={tick.y + 4}
              textAnchor="end"
              fontSize="10"
              fill="var(--text-h2)">
              {tick.label}
            </text>
          ))}
          {xTicks.map((tick, index) => (
            <text
              key={`x-label-${index}`}
              x={tick.x}
              y={padding.top + chartHeight + 24}
              textAnchor="middle"
              fill="var(--text-h2)">
              <tspan fontSize="10">{tick.label.primary}</tspan>
              {tick.label.secondary && (
                <tspan x={tick.x} dy="12" fontSize="9">
                  {tick.label.secondary}
                </tspan>
              )}
            </text>
          ))}
        </svg>

        {hoverIndex !== null && hoveredDate && (
          <div
            className={styles.tooltip}
            style={{
              left: getGroupedX(hoverIndex),
              top: Math.max(64, Math.min(chartHeight + padding.top, 130)),
            }}>
            <div className={styles.tooltipDate}>{axisFormatter.format(hoveredDate.date)}</div>
            {chartSeries.map((serie) => {
              const point = serie.points.find((item) => item.dateKey === hoveredDate.date.getTime());
              if (!point) return null;
              return (
                <div key={serie.id} className={styles.tooltipRow}>
                  <span className={styles.tooltipName}>
                    <span className={styles.colorDot} style={{ backgroundColor: serie.color }} />
                    {serie.name}
                  </span>
                  <span>{formatNumber(point.value)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <svg ref={brushRef} width="100%" height={brushAreaHeight} className={styles.svg} aria-hidden="true">
        <rect
          x={brushPadding.left}
          y={brushPadding.top}
          width={brushWidth}
          height={brushHeight}
          rx="8"
          fill="var(--color-gray10)"
        />
        {brushSeries.map((serie) => (
          <path
            key={`${serie.id}-${serie.path}`}
            d={serie.path}
            className={styles.brushLine}
            pathLength="1"
            stroke={serie.color}
            strokeWidth={1.3}
            opacity={0.45}
          />
        ))}
        <rect
          className={styles.brushSelection}
          x={brushStartX}
          y={brushPadding.top}
          width={Math.max(8, brushEndX - brushStartX)}
          height={brushHeight}
          rx="8"
          fill="var(--color-light-blue)"
          opacity={0.15}
          onPointerDown={(event) => startDrag("range", event.clientX)}
        />
        {[brushStartX, brushEndX].map((x, index) => (
          <g
            key={index}
            className={styles.brushHandle}
            onPointerDown={(event) => startDrag(index === 0 ? "start" : "end", event.clientX)}>
            <rect
              x={x - 4}
              y={brushPadding.top - 2}
              width="8"
              height={brushHeight + 4}
              rx="4"
              fill="var(--color-light-blue)"
            />
            <line
              x1={x}
              y1={brushPadding.top + 10}
              x2={x}
              y2={brushPadding.top + brushHeight - 10}
              stroke="var(--color-white)"
            />
          </g>
        ))}
      </svg>

      {normalizedSeries.length > 10 && (
        <div className={styles.legend}>
          {normalizedSeries.map((serie) => {
            const isActive = !hiddenSeries.has(serie.id);
            return (
              <button
                key={serie.id}
                type="button"
                className={`${styles.legendButton} ${isActive ? styles.legendButtonActive : ""}`}
                style={{ color: isActive ? serie.color : undefined }}
                onClick={() => toggleSeries(serie.id)}>
                <span className={styles.colorDot} style={{ backgroundColor: serie.color }} />
                {serie.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const BrushLineChart = React.memo(BrushLineChartComponent);
export default BrushLineChart;
