import { useSession } from "next-auth/react";
import React, {
  memo,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import Dotmenu from "brancy/components/design/dotMenu/dotMenu";
import Loading from "brancy/components/notOk/loading";
import { LoginStatus } from "brancy/helper/loadingStatus";
import { LanguageKey } from "brancy/i18n";
import multiStyles from "./Chart_month.module.css";

export interface IHourCountItem {
  hourValue: number;
  count: number;
  createdTime: number;
  relationHour?: number;
  day?: number;
  month?: number;
  year?: number;
}

export interface IHourChartSeries {
  id: string;
  name: string;
  hours: IHourCountItem[];
}

interface ISeriesData {
  name: string;
  color: string;
  items: IHourCountItem[];
}

interface Point {
  x: number;
  y: number;
}

interface HourChartProps {
  id: string;
  name: string;
  seriesData: IHourChartSeries[];
  splitByDay?: boolean;
  objectNavigators?: Array<{
    title?: string;
    firstIndexes: string[];
    secondIndexes?: string[][];
    initialFirstIndex?: number;
    initialSecondIndex?: number;
  }>;
  onObjectNavigatorChange?: (navIndex: number, firstIndex: number, secondIndex?: number) => void;
}

const generateColor = (index: number): string => {
  const colors = [
    "#2977ff",
    "#2699fb",
    "#00c1d4",
    "#2eac65",
    "#44cb8c",
    "#9d6dff",
    "#ec4466",
    "#ff4e85",
    "#ff9a4d",
    "#ffb700",
    "#33B2DF",
    "#546E7A",
    "#D4526E",
    "#13D8AA",
    "#A5978B",
    "#2B908F",
    "#F9A3A4",
    "#90EE7E",
    "#FA4443",
    "#69D2E7",
  ];
  return colors[index % colors.length];
};

const getLocalDayKey = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

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

const getSmoothPath = (points: Point[]): string => {
  if (points.length < 2) return "";
  const fmt = (n: number) => {
    if (!isFinite(n)) return "0";
    const rounded = Math.abs(n - Math.round(n)) < 0.0001 ? Math.round(n) : Number(n.toFixed(1));
    return String(rounded);
  };
  let path = `M${fmt(points[0].x)} ${fmt(points[0].y)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const dx = p2.x - p1.x;
    const cp1x = p1.x + dx / 3;
    const cp1y = p1.y;
    const cp2x = p2.x - dx / 3;
    const cp2y = p2.y;
    path += ` C${fmt(cp1x)} ${fmt(cp1y)},${fmt(cp2x)} ${fmt(cp2y)},${fmt(p2.x)} ${fmt(p2.y)}`;
  }
  return path;
};

const HourChartComponent: React.FC<HourChartProps> = (props) => {
  const { data: session } = useSession();
  const { t, i18n } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  type HoverPoint = { x: number; y: number; timestamp: number; dataIndex: number } | null;
  type State = {
    svgDimensions: { width: number; height: number };
    hiddenSeries: Set<string>;
    hoveredPoint: HoverPoint;
    tooltipPos: { x: number; y: number } | null;
    loadingStatus: boolean;
    animationKey: number;
  };

  const initialState: State = {
    svgDimensions: { width: 800, height: 230 },
    hiddenSeries: new Set(),
    hoveredPoint: null,
    tooltipPos: null,
    loadingStatus: true,
    animationKey: 0,
  };

  type Action =
    | { type: "SET_DIMENSIONS"; payload: { width: number; height: number } }
    | { type: "TOGGLE_SERIES"; payload: string }
    | { type: "SET_HOVER"; payload: HoverPoint }
    | { type: "SET_TOOLTIP"; payload: { x: number; y: number } | null }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "TRIGGER_ANIMATION" };

  const reducer = (s: State, a: Action): State => {
    switch (a.type) {
      case "SET_DIMENSIONS":
        return { ...s, svgDimensions: a.payload };
      case "TOGGLE_SERIES": {
        const newSet = new Set(s.hiddenSeries);
        if (newSet.has(a.payload)) newSet.delete(a.payload);
        else newSet.add(a.payload);
        return { ...s, hiddenSeries: newSet };
      }
      case "SET_HOVER":
        return { ...s, hoveredPoint: a.payload };
      case "SET_TOOLTIP":
        return { ...s, tooltipPos: a.payload };
      case "SET_LOADING":
        return { ...s, loadingStatus: a.payload };
      case "TRIGGER_ANIMATION":
        return { ...s, animationKey: s.animationKey + 1 };
      default:
        return s;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const pendingRaf = useRef<number | null>(null);
  const measuredLabelCache = useRef<Map<string, number>>(new Map());
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [calendarId, setCalendarId] = useState<CalendarId>("gregory");

  useEffect(() => {
    const updateCalendar = (calendarName?: string | null) => {
      setCalendarId(mapCalendarNameToId(calendarName));
    };
    const onCalendarChanged = (event: Event) => {
      updateCalendar((event as CustomEvent<string>).detail);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "calendar") updateCalendar(event.newValue);
    };

    updateCalendar(window.localStorage.getItem("calendar"));
    window.addEventListener("brancy:calendar-changed", onCalendarChanged as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("brancy:calendar-changed", onCalendarChanged as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const dayLabelFormatter = useMemo(() => {
    const locale = i18n.language || "en";
    try {
      return new Intl.DateTimeFormat(`${locale}-u-ca-${calendarId}`, { dateStyle: "medium" });
    } catch {
      return new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
    }
  }, [calendarId, i18n.language]);

  const availableDays = useMemo(() => {
    if (!props.splitByDay) return [];
    const days = new Map<string, number>();
    props.seriesData.forEach((series) => {
      series.hours.forEach((item) => {
        const timestamp = item.createdTime * 1000;
        const key = getLocalDayKey(timestamp);
        if (!days.has(key)) {
          const date = new Date(timestamp);
          days.set(key, new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime());
        }
      });
    });
    return Array.from(days, ([key, timestamp]) => ({ key, timestamp })).sort((a, b) => a.timestamp - b.timestamp);
  }, [props.seriesData, props.splitByDay]);
  const availableDayKeys = availableDays.map((day) => day.key).join("|");

  useEffect(() => {
    setSelectedDayIndex(Math.max(0, availableDays.length - 1));
  }, [availableDayKeys, availableDays.length]);

  const selectedDayKey = props.splitByDay ? availableDays[selectedDayIndex]?.key : undefined;

  const [objectNavState, setObjectNavState] = useState<{ firstIndex: number; secondIndex?: number }[]>(() => {
    if (!props.objectNavigators) return [];
    return props.objectNavigators.map((n) => ({
      firstIndex: n.initialFirstIndex ?? 0,
      secondIndex: n.initialSecondIndex,
    }));
  });

  // objectNavState is initialized once from props and then managed internally.
  // External sync happens via onObjectNavigatorChange callback.

  useLayoutEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth || 800;
        dispatch({ type: "SET_DIMENSIONS", payload: { width, height: 230 } });
      }
    };
    const timer = setTimeout(updateDimensions, 100);
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  useEffect(() => {
    if (props.seriesData && LoginStatus(session)) {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [props.seriesData, session]);

  useEffect(() => {
    const timer = setTimeout(() => dispatch({ type: "TRIGGER_ANIMATION" }), 40);
    return () => clearTimeout(timer);
  }, [props.seriesData]);

  const formatNumber = (num: number) => {
    if (Math.abs(num) < 0.00001) return "0";
    if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.?0+$/, "") + " B";
    if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.?0+$/, "") + " M";
    if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.?0+$/, "") + " K";
    return num % 1 === 0 ? Math.floor(num).toString() : num.toFixed(1).replace(/\.?0+$/, "");
  };

  const formatHourLabel = useCallback((timestamp: number) => {
    const d = new Date(timestamp);
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  }, []);

  const visibleSeriesData = useMemo<ISeriesData[]>(() => {
    return props.seriesData
      .filter((s) => !state.hiddenSeries.has(s.id))
      .map((s, i) => ({
        name: s.name,
        color: generateColor(i),
        items: selectedDayKey
          ? s.hours.filter((item) => getLocalDayKey(item.createdTime * 1000) === selectedDayKey)
          : s.hours,
      }));
  }, [props.seriesData, selectedDayKey, state.hiddenSeries]);

  const totalCount = useMemo(() => {
    return props.seriesData.reduce(
      (sum, series) =>
        sum +
        series.hours.reduce(
          (seriesSum, item) =>
            seriesSum +
            (!selectedDayKey || getLocalDayKey(item.createdTime * 1000) === selectedDayKey ? item.count : 0),
          0,
        ),
      0,
    );
  }, [props.seriesData, selectedDayKey]);

  const chartData = useMemo(() => {
    if (!visibleSeriesData || visibleSeriesData.length === 0) return null;

    const seriesMaps: Map<number, number>[] = visibleSeriesData.map(
      (s) => new Map(s.items.map((it) => [it.createdTime * 1000, it.count])),
    );

    const tsSet = new Set<number>();
    for (const m of seriesMaps) m.forEach((_, k) => tsSet.add(k));
    const allTimestamps = Array.from(tsSet).sort((a, b) => a - b);
    if (allTimestamps.length === 0) return null;

    const minX = allTimestamps[0];
    const maxX = allTimestamps[allTimestamps.length - 1];

    const stackedValuesArr = new Array(allTimestamps.length).fill(0);
    for (let si = 0; si < seriesMaps.length; si++) {
      for (let ti = 0; ti < allTimestamps.length; ti++) {
        stackedValuesArr[ti] += seriesMaps[si].get(allTimestamps[ti]) || 0;
      }
    }

    const dataMaxY = Math.max(...stackedValuesArr, 0);
    const dataMinY = Math.min(...stackedValuesArr, 0);
    const maxY = dataMaxY + 2;
    const minY = dataMinY < 0 ? dataMinY - 2 : 0;
    const rangeY = maxY - minY || 1;

    const basePadding = { top: 10, right: 10, bottom: 40, left: 10 };
    const chartHeight = state.svgDimensions.height - basePadding.top - basePadding.bottom;

    const yLabelValues: string[] = [];
    for (let i = 0; i <= 6; i++) yLabelValues.push(formatNumber(maxY - (rangeY / 6) * i));

    let measuredLabelWidth = 0;
    try {
      const cacheKey = yLabelValues.join("|");
      const cached = measuredLabelCache.current.get(cacheKey);
      if (cached !== undefined) {
        measuredLabelWidth = cached;
      } else if (typeof document !== "undefined") {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.font = "12px Arial, Helvetica, sans-serif";
          for (const v of yLabelValues) {
            const w = ctx.measureText(v).width;
            if (w > measuredLabelWidth) measuredLabelWidth = w;
          }
        }
        measuredLabelCache.current.set(cacheKey, measuredLabelWidth);
      }
    } catch {}

    const leftPadding = Math.max(0, Math.ceil(measuredLabelWidth) + 18);
    const padding = { top: basePadding.top, right: basePadding.right, bottom: basePadding.bottom, left: leftPadding };
    const chartWidth = state.svgDimensions.width - padding.left - padding.right;

    const scaleX = (x: number) => padding.left + ((x - minX) / Math.max(maxX - minX, 1)) * chartWidth;
    const scaleY = (y: number) => padding.top + chartHeight - ((y - minY) / rangeY) * chartHeight;

    const ySteps = 6;
    const yGridLines = [];
    const yLabels = [];
    for (let i = 0; i <= ySteps; i++) {
      const y = padding.top + (chartHeight / ySteps) * i;
      const value = maxY - (rangeY / ySteps) * i;
      yGridLines.push({ y, value });
      yLabels.push({ y: y + 4, value: formatNumber(Math.abs(value) < 0.00001 ? 0 : value) });
    }

    const xStepCount = Math.min(12, allTimestamps.length);
    const xGridLines: { x: number }[] = [];
    const xLabels: { x: number; timestamp: number; label: string }[] = [];
    for (let i = 0; i <= xStepCount; i++) {
      const x = padding.left + (chartWidth / xStepCount) * i;
      const timestamp = minX + ((maxX - minX) / xStepCount) * i;
      xGridLines.push({ x });
      xLabels.push({ x, timestamp, label: formatHourLabel(timestamp) });
    }

    const seriesPaths: any[] = [];
    for (let si = visibleSeriesData.length - 1; si >= 0; si--) {
      const dataMap = seriesMaps[si];
      const points: Point[] = allTimestamps.map((ts, ti) => {
        let stackedY = 0;
        for (let j = si; j < seriesMaps.length; j++) stackedY += seriesMaps[j].get(ts) || 0;
        return { x: scaleX(ts), y: scaleY(stackedY) };
      });
      const linePath = getSmoothPath(points);
      const areaPath =
        linePath +
        ` L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;
      seriesPaths.push({
        name: visibleSeriesData[si].name,
        color: visibleSeriesData[si].color,
        linePath,
        areaPath,
        points: points.map((p, idx) => ({
          x: p.x,
          y: p.y,
          timestamp: allTimestamps[idx],
          value: dataMap.get(allTimestamps[idx]) || 0,
        })),
      });
    }

    const findClosestIndex = (arr: number[], target: number) => {
      let lo = 0,
        hi = arr.length - 1;
      if (target <= arr[0]) return 0;
      if (target >= arr[hi]) return hi;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
      }
      if (lo >= arr.length) return arr.length - 1;
      if (hi < 0) return 0;
      return Math.abs(arr[lo] - target) < Math.abs(arr[hi] - target) ? lo : hi;
    };

    return {
      padding,
      chartWidth,
      chartHeight,
      yGridLines,
      yLabels,
      xGridLines,
      xLabels,
      seriesPaths,
      scaleX,
      scaleY,
      minX,
      maxX,
      allTimestamps,
      findClosestIndex,
    };
  }, [visibleSeriesData, state.svgDimensions, formatHourLabel]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || !chartData) return;
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const { padding, chartWidth, chartHeight } = chartData;
      if (
        mouseX < padding.left ||
        mouseX > padding.left + chartWidth ||
        mouseY < padding.top ||
        mouseY > padding.top + chartHeight
      ) {
        if (pendingRaf.current) cancelAnimationFrame(pendingRaf.current);
        dispatch({ type: "SET_HOVER", payload: null });
        dispatch({ type: "SET_TOOLTIP", payload: null });
        return;
      }
      const hoveredTimestamp =
        chartData.minX + ((mouseX - padding.left) / chartWidth) * (chartData.maxX - chartData.minX);
      const closestIndex = chartData.findClosestIndex(chartData.allTimestamps, hoveredTimestamp);
      const closestDist = Math.abs(chartData.allTimestamps[closestIndex] - hoveredTimestamp);
      if (closestDist < (chartData.maxX - chartData.minX) / 20) {
        const timestamp = chartData.allTimestamps[closestIndex];
        const x = chartData.scaleX(timestamp);
        if (pendingRaf.current) cancelAnimationFrame(pendingRaf.current);
        pendingRaf.current = requestAnimationFrame(() => {
          dispatch({ type: "SET_HOVER", payload: { x, y: mouseY, timestamp, dataIndex: closestIndex } });
          dispatch({ type: "SET_TOOLTIP", payload: { x: mouseX, y: mouseY } });
          pendingRaf.current = null;
        });
      } else {
        if (pendingRaf.current) cancelAnimationFrame(pendingRaf.current);
        dispatch({ type: "SET_HOVER", payload: null });
        dispatch({ type: "SET_TOOLTIP", payload: null });
      }
    },
    [chartData],
  );

  const handleMouseLeave = useCallback(() => {
    if (pendingRaf.current) cancelAnimationFrame(pendingRaf.current);
    dispatch({ type: "SET_HOVER", payload: null });
    dispatch({ type: "SET_TOOLTIP", payload: null });
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<SVGSVGElement>) => {
      if (!svgRef.current || !chartData || e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = touch.clientX - rect.left;
      const mouseY = touch.clientY - rect.top;
      const { padding, chartWidth, chartHeight } = chartData;
      if (
        mouseX < padding.left ||
        mouseX > padding.left + chartWidth ||
        mouseY < padding.top ||
        mouseY > padding.top + chartHeight
      ) {
        dispatch({ type: "SET_HOVER", payload: null });
        dispatch({ type: "SET_TOOLTIP", payload: null });
        return;
      }
      const hoveredTimestamp =
        chartData.minX + ((mouseX - padding.left) / chartWidth) * (chartData.maxX - chartData.minX);
      const closestIndex = chartData.findClosestIndex(chartData.allTimestamps, hoveredTimestamp);
      const closestDist = Math.abs(chartData.allTimestamps[closestIndex] - hoveredTimestamp);
      if (closestDist < (chartData.maxX - chartData.minX) / 20) {
        const timestamp = chartData.allTimestamps[closestIndex];
        const x = chartData.scaleX(timestamp);
        if (pendingRaf.current) cancelAnimationFrame(pendingRaf.current);
        pendingRaf.current = requestAnimationFrame(() => {
          dispatch({ type: "SET_HOVER", payload: { x, y: mouseY, timestamp, dataIndex: closestIndex } });
          dispatch({ type: "SET_TOOLTIP", payload: { x: mouseX, y: mouseY } });
          pendingRaf.current = null;
        });
      } else {
        dispatch({ type: "SET_HOVER", payload: null });
        dispatch({ type: "SET_TOOLTIP", payload: null });
      }
    },
    [chartData],
  );

  const handleTouchEnd = useCallback(() => {
    if (pendingRaf.current) cancelAnimationFrame(pendingRaf.current);
    dispatch({ type: "SET_HOVER", payload: null });
    dispatch({ type: "SET_TOOLTIP", payload: null });
  }, []);

  const exportChartAsJpeg = useCallback(async () => {
    try {
      const svgEl = svgRef.current;
      if (!svgEl || typeof window === "undefined") return;
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgEl);
      if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
        svgString = svgString.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const rect = svgEl.getBoundingClientRect();
          canvas.width = Math.max(1, Math.round(rect.width || 800));
          canvas.height = Math.max(1, Math.round(rect.height || 230));
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (outBlob) => {
              if (!outBlob) return;
              const a = document.createElement("a");
              const objectUrl = URL.createObjectURL(outBlob);
              a.href = objectUrl;
              a.download = `${props.id ?? "chart"}-${Date.now()}.jpg`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(objectUrl);
            },
            "image/jpeg",
            0.92,
          );
        } finally {
          URL.revokeObjectURL(url);
        }
      };
      img.onerror = () => URL.revokeObjectURL(url);
      img.src = url;
    } catch {}
  }, [props.id]);

  const toggleSeriesVisibility = useCallback(
    (seriesId: string) => {
      const isHidden = state.hiddenSeries.has(seriesId);
      if (isHidden) {
        dispatch({ type: "TOGGLE_SERIES", payload: seriesId });
        return;
      }
      if (props.seriesData.length - state.hiddenSeries.size > 1) {
        dispatch({ type: "TOGGLE_SERIES", payload: seriesId });
      }
    },
    [props.seriesData.length, state.hiddenSeries],
  );

  const objectNavPrev = useCallback(
    (navIdx: number) => {
      if (!props.objectNavigators) return;
      const nav = props.objectNavigators[navIdx];
      if (!nav) return;
      setObjectNavState((prev) => {
        const next = prev.slice();
        const newFirst = Math.max(0, (next[navIdx]?.firstIndex ?? 0) - 1);
        next[navIdx] = { firstIndex: newFirst, secondIndex: 0 };
        props.onObjectNavigatorChange?.(navIdx, newFirst, 0);
        return next;
      });
    },
    [props.objectNavigators, props.onObjectNavigatorChange],
  );

  const objectNavNext = useCallback(
    (navIdx: number) => {
      if (!props.objectNavigators) return;
      const nav = props.objectNavigators[navIdx];
      if (!nav) return;
      setObjectNavState((prev) => {
        const next = prev.slice();
        const newFirst = Math.min(nav.firstIndexes.length - 1, (next[navIdx]?.firstIndex ?? 0) + 1);
        next[navIdx] = { firstIndex: newFirst, secondIndex: 0 };
        props.onObjectNavigatorChange?.(navIdx, newFirst, 0);
        return next;
      });
    },
    [props.objectNavigators, props.onObjectNavigatorChange],
  );

  const handleObjectNavSelect = useCallback(
    (navIdx: number, firstIdx: number, secondIdx?: number) => {
      setObjectNavState((prev) => {
        const next = prev.slice();
        next[navIdx] = { firstIndex: firstIdx, secondIndex: secondIdx };
        return next;
      });
      props.onObjectNavigatorChange?.(navIdx, firstIdx, secondIdx);
    },
    [props.onObjectNavigatorChange],
  );

  const hasData = props.seriesData.length > 0 && props.seriesData.some((s) => s.hours.length > 0);

  return (
    <>
      {state.loadingStatus && <Loading />}
      {!state.loadingStatus && hasData && (
        <div className={`${multiStyles.multiChart} translate`}>
          <div ref={containerRef} className={multiStyles.chartContainer} tabIndex={0}>
            {/* Legend Dotmenu */}
            {props.seriesData.length > 1 && (
              <div className={multiStyles.legendMenu}>
                <Dotmenu
                  data={[
                    ...props.seriesData.map((series, index) => {
                      const isHidden = state.hiddenSeries.has(series.id);
                      return {
                        icon: (
                          <div
                            className={isHidden ? multiStyles.legendIconHidden : multiStyles.legendIcon}
                            style={{
                              backgroundColor: isHidden ? undefined : generateColor(index),
                              boxShadow: isHidden ? undefined : `0 0 0 2px ${generateColor(index)}33`,
                            }}
                          />
                        ),
                        value: series.name,
                        onClick: () => toggleSeriesVisibility(series.id),
                        style: {
                          opacity: isHidden ? 0.5 : 1,
                          textDecoration: isHidden ? "line-through" : "none",
                          color: isHidden ? "var(--color-gray40)" : "var(--text-h2)",
                        },
                      };
                    }),
                    {
                      icon: "/jpg.svg",
                      value: t(LanguageKey.exportJPG),
                      onClick: exportChartAsJpeg,
                      style: { color: "var(--text-h2)" },
                    },
                  ]}
                />
              </div>
            )}

            <svg
              ref={svgRef}
              width={state.svgDimensions.width}
              height={state.svgDimensions.height}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              className={multiStyles.chartSvg}>
              {chartData && (
                <>
                  {/* Y-axis labels */}
                  <g fill="var(--text-h2)" fontSize="12" fontWeight="400" textAnchor="end">
                    {chartData.yLabels.map((label, i) => (
                      <text key={`y-${i}`} x={Math.round(chartData.padding.left - 10)} y={Math.round(label.y)}>
                        {label.value}
                      </text>
                    ))}
                  </g>

                  {/* X-axis labels */}
                  <g fill="var(--text-h2)" fontWeight="400">
                    {chartData.xLabels.map((label, i) => {
                      const x = Math.round(label.x);
                      const y = Math.round(state.svgDimensions.height - 20);
                      return (
                        <text key={`x-${i}`} x={x} y={y} textAnchor="middle" style={{ fontSize: 10 }}>
                          {label.label}
                        </text>
                      );
                    })}
                  </g>

                  {/* Area & line paths */}
                  <defs>
                    {chartData.seriesPaths.map((series: any, idx: number) => (
                      <linearGradient key={idx} id={`hg-${props.id}-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={series.color} stopOpacity="0.6" />
                        <stop offset="100%" stopColor={series.color} stopOpacity="0" />
                      </linearGradient>
                    ))}
                  </defs>
                  <g>
                    {chartData.seriesPaths.map((series: any, idx: number) => (
                      <g key={`series-${state.animationKey}-${idx}`}>
                        <path
                          d={series.areaPath}
                          fill={`url(#hg-${props.id}-${idx})`}
                          className={multiStyles.animatedArea}
                        />
                        <path
                          d={series.linePath}
                          fill="none"
                          stroke={series.color}
                          strokeWidth="1.5"
                          className={multiStyles.animatedPath}
                        />
                        {state.hoveredPoint && series.points[state.hoveredPoint.dataIndex] && (
                          <circle
                            cx={series.points[state.hoveredPoint.dataIndex].x}
                            cy={series.points[state.hoveredPoint.dataIndex].y}
                            r={4}
                            fill={series.color}
                            stroke="white"
                            strokeWidth={1.5}
                          />
                        )}
                      </g>
                    ))}
                  </g>

                  {/* Crosshair */}
                  {state.hoveredPoint && chartData && (
                    <g>
                      <line
                        x1={Math.round(state.hoveredPoint.x)}
                        y1={Math.round(chartData.padding.top)}
                        x2={Math.round(state.hoveredPoint.x)}
                        y2={Math.round(chartData.padding.top + chartData.chartHeight)}
                        stroke="var(--color-gray60)"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                      />
                      {chartData.seriesPaths.map((series: any, idx: number) => {
                        const point = series.points[state.hoveredPoint!.dataIndex];
                        if (!point) return null;
                        return (
                          <line
                            key={`hl-${idx}`}
                            x1={Math.round(chartData.padding.left)}
                            y1={Math.round(point.y)}
                            x2={Math.round(chartData.padding.left + chartData.chartWidth)}
                            y2={Math.round(point.y)}
                            stroke="var(--color-gray60)"
                            strokeWidth="1"
                            strokeDasharray="4,4"
                          />
                        );
                      })}
                    </g>
                  )}
                </>
              )}
            </svg>

            {/* HTML overlay: grid lines + hover labels */}
            {chartData && (
              <div
                className={multiStyles.overlay}
                style={{ width: state.svgDimensions.width, height: state.svgDimensions.height }}>
                {chartData.yGridLines.map((line: any, i: number) => (
                  <div
                    key={`hgrid-${state.animationKey}-${i}`}
                    className={`${multiStyles.gridLine} ${multiStyles.animatedGridLine}`}
                    style={{
                      top: Math.round(line.y),
                      left: Math.round(chartData.padding.left),
                      width: Math.round(chartData.chartWidth),
                    }}
                  />
                ))}
                {chartData.xGridLines.map((line: any, i: number) => (
                  <div
                    key={`vgrid-${state.animationKey}-${i}`}
                    className={`${multiStyles.gridLineV} ${multiStyles.animatedGridLine}`}
                    style={{
                      left: Math.round(line.x),
                      top: Math.round(chartData.padding.top),
                      height: Math.round(chartData.chartHeight),
                    }}
                  />
                ))}
                {state.hoveredPoint &&
                  chartData.seriesPaths.map((series: any, idx: number) => {
                    const point = series.points[state.hoveredPoint!.dataIndex];
                    if (!point) return null;
                    return (
                      <div
                        key={`yl-${idx}`}
                        className={multiStyles.hoverLabelRect}
                        style={{ left: Math.round(chartData.padding.left - 35), top: Math.round(point.y) }}>
                        {formatNumber(point.value)}
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Tooltip */}
            {state.hoveredPoint && state.tooltipPos && chartData && (
              <div
                className={`${multiStyles.tooltip} ${
                  state.tooltipPos.x > state.svgDimensions.width / 2
                    ? multiStyles.tooltipLeft
                    : multiStyles.tooltipRight
                }`}
                style={{ left: state.tooltipPos.x + 15, top: state.tooltipPos.y + 15 }}>
                <div className={multiStyles.tooltipHeader}>{formatHourLabel(state.hoveredPoint.timestamp)}</div>
                {chartData.seriesPaths.map((series: any, idx: number) => {
                  const point = series.points[state.hoveredPoint!.dataIndex];
                  if (!point) return null;
                  return (
                    <div key={idx} className={multiStyles.tooltipRow}>
                      <div className={multiStyles.tooltipRowLeft}>
                        {chartData.seriesPaths.length > 1 && (
                          <div className={multiStyles.tooltipColorDot} style={{ backgroundColor: series.color }} />
                        )}
                        <span className={multiStyles.tooltipSeriesName}>{series.name}</span>
                      </div>
                      <span className={multiStyles.tooltipSeriesValue} style={{ color: series.color }}>
                        {Math.round(point.value).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
                {chartData.seriesPaths.length > 1 && (
                  <div className={multiStyles.tooltipTotal}>
                    <span className={multiStyles.tooltipTotalLabel}>{t(LanguageKey.total)}</span>
                    <span className={multiStyles.tooltipTotalValue}>
                      {Math.round(
                        chartData.seriesPaths.reduce((sum: number, s: any) => {
                          const p = s.points[state.hoveredPoint!.dataIndex];
                          return sum + (p?.value || 0);
                        }, 0),
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {props.splitByDay && availableDays.length > 1 && (
            <div className={multiStyles.objectDatenavigator}>
              <div className={multiStyles.firstList}>
                <img
                  alt="Previous day"
                  src="/back-forward.svg"
                  className={`${multiStyles.backForwardIcon} ${selectedDayIndex === 0 ? multiStyles.disabledNav : ""}`}
                  onClick={() => setSelectedDayIndex((current) => Math.max(0, current - 1))}
                />
                <div className={multiStyles.inlineNavigator}>
                  <div className={multiStyles.textWrapper} style={{ color: "var(--color-light-blue)" }}>
                    <strong style={{ fontWeight: 600 }}>
                      {dayLabelFormatter.format(new Date(availableDays[selectedDayIndex].timestamp))}
                    </strong>
                  </div>
                </div>
                <img
                  alt="Next day"
                  src="/back-forward1.svg"
                  className={`${multiStyles.forwardIcon} ${
                    selectedDayIndex === availableDays.length - 1 ? multiStyles.disabledNav : ""
                  }`}
                  onClick={() => setSelectedDayIndex((current) => Math.min(availableDays.length - 1, current + 1))}
                />
              </div>
            </div>
          )}

          {/* Object Navigators (firstIndexes / secondIndexes) */}
          {props.objectNavigators &&
            props.objectNavigators.length > 0 &&
            props.objectNavigators.map((nav, navIdx) => {
              const stateForNav = objectNavState[navIdx] ?? { firstIndex: 0 };
              const firstIdx = stateForNav.firstIndex ?? 0;
              const secondList = nav.secondIndexes?.[firstIdx];
              return (
                <React.Fragment key={`nav-${navIdx}`}>
                  <div className={multiStyles.objectDatenavigatorsecond}>
                    {nav.firstIndexes.length > 1 && (
                      <div className={multiStyles.firstList}>
                        <img
                          alt="back"
                          src="/back-forward.svg"
                          className={`${multiStyles.backForwardIcon} ${firstIdx === 0 ? multiStyles.disabledNav : ""}`}
                          onClick={() => objectNavPrev(navIdx)}
                        />
                        <div className={multiStyles.inlineNavigator}>
                          <div className={multiStyles.textWrapper} style={{ color: "var(--color-light-blue)" }}>
                            <strong style={{ fontWeight: 600 }}>{nav.firstIndexes[firstIdx]}</strong>
                          </div>
                        </div>
                        <img
                          src="/back-forward1.svg"
                          alt="forward"
                          onClick={() => objectNavNext(navIdx)}
                          className={`${multiStyles.forwardIcon} ${firstIdx === nav.firstIndexes.length - 1 ? multiStyles.disabledNav : ""}`}
                        />
                      </div>
                    )}
                    {secondList && secondList.length > 1 && (
                      <div className={multiStyles.secondList}>
                        {secondList.map((txt, si) => (
                          <button
                            key={`s-${navIdx}-${si}`}
                            onClick={() => handleObjectNavSelect(navIdx, firstIdx, si)}
                            style={{
                              padding: "0px 5px",
                              borderRadius: 10,
                              border: "1px solid transparent",
                              cursor: "pointer",
                              background: stateForNav.secondIndex === si ? "var(--color-light-blue30)" : "transparent",
                              color: stateForNav.secondIndex === si ? "var(--color-dark-blue)" : "var(--text-h2)",
                            }}>
                            {txt.split("\n")[0]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}

          {/* Total stats */}
          <div className="headerparent">
            <div className="headerandinput" style={{ alignItems: "center" }}>
              <span className="title">{totalCount.toLocaleString()}</span>
              <span className={`${multiStyles.totalcounter} translate`}>{t(LanguageKey.total)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(HourChartComponent);
