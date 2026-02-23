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
import Dotmenu from "../dotMenu/dotMenu";
import Loading from "../../notOk/loading";
import { LoginStatus } from "../../../helper/loadingStatus";
import { LanguageKey } from "../../../i18n";
import { DayCountUnix, IMonthGraph } from "../../../models/page/statistics/statisticsContent/GraphIngageBoxes/graphLikes";
import multiStyles from "./Chart_month.module.css";
interface ISeriesData {
  name: string;
  color: string;
  items: DayCountUnix[];
}

interface Point {
  x: number;
  y: number;
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
    //
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
const getCurvePoint = (p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point => {
  const cX = 3 * (p1.x - p0.x);
  const bX = 3 * (p2.x - p1.x) - cX;
  const aX = p3.x - p0.x - cX - bX;
  const cY = 3 * (p1.y - p0.y);
  const bY = 3 * (p2.y - p1.y) - cY;
  const aY = p3.y - p0.y - cY - bY;
  const tSquared = t * t;
  const tCubed = tSquared * t;
  return {
    x: aX * tCubed + bX * tSquared + cX * t + p0.x,
    y: aY * tCubed + bY * tSquared + cY * t + p0.y,
  };
};
const getSmoothPath = (points: Point[]): string => {
  if (points.length < 2) return "";
  const fmt = (n: number) => {
    if (!isFinite(n)) return "0";
    const rounded = Math.abs(n - Math.round(n)) < 0.0001 ? Math.round(n) : Number(n.toFixed(1));
    return String(rounded).replace(/\.00?$|(?<=\.[0-9]*?)0+$/g, (m) => m.replace("0", ""));
  };
  let path = `M${fmt(points[0].x)} ${fmt(points[0].y)}`;
  let curX = points[0].x;
  let curY = points[0].y;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const tolerance = 0.75;
    const reductionFactor = 0;
    const isSameLevel = Math.abs(p1.y - p2.y) < tolerance;
    if (isSameLevel) {
      const dx = p2.x - curX;
      if (Math.abs(p2.y - curY) < tolerance) {
        path += ` h${fmt(dx)}`;
        curX = p2.x;
        curY = p2.y;
      } else {
        path += ` L${fmt(p2.x)} ${fmt(p2.y)}`;
        curX = p2.x;
        curY = p2.y;
      }
    } else {
      const dx1 = p2.x - p1.x;
      const dy1 = p2.y - p1.y;
      const dx0 = p1.x - p0.x;
      const dy0 = p1.y - p0.y;
      const dx2 = p3.x - p2.x;
      const dy2 = p3.y - p2.y;
      const m0 = dx0 !== 0 ? dy0 / dx0 : 0;
      const m1 = dx1 !== 0 ? dy1 / dx1 : 0;
      const m2 = dx2 !== 0 ? dy2 / dx2 : 0;
      let tangent1 = 0;
      let tangent2 = 0;
      if (m0 * m1 > 0) {
        tangent1 = (m0 + m1) / 2;
        if (Math.abs(tangent1) > Math.abs(3 * m0) || Math.abs(tangent1) > Math.abs(3 * m1)) {
          tangent1 = 3 * Math.sign(tangent1) * Math.min(Math.abs(m0), Math.abs(m1));
        }
      }
      if (m1 * m2 > 0) {
        tangent2 = (m1 + m2) / 2;
        if (Math.abs(tangent2) > Math.abs(3 * m1) || Math.abs(tangent2) > Math.abs(3 * m2)) {
          tangent2 = 3 * Math.sign(tangent2) * Math.min(Math.abs(m1), Math.abs(m2));
        }
      }
      tangent1 = tangent1 * reductionFactor;
      tangent2 = tangent2 * reductionFactor;
      const cp1x = p1.x + dx1 / 3;
      const cp1y = p1.y + tangent1 * (dx1 / 3);
      const cp2x = p2.x - dx1 / 3;
      const cp2y = p2.y - tangent2 * (dx1 / 3);

      path += ` C${fmt(cp1x)} ${fmt(cp1y)},${fmt(cp2x)} ${fmt(cp2y)},${fmt(p2.x)} ${fmt(p2.y)}`;
      curX = p2.x;
      curY = p2.y;
    }
  }
  return path;
};
export interface IChartSeries {
  id: string;
  name: string;
  data: IMonthGraph[];
}
interface MultiChartProps {
  id: string;
  name: string;
  seriesData: IChartSeries[];
  showAverage?: boolean;
  averageValue?: number | null;
  displayShow?: boolean;
  unshowContent?: boolean;
  objectNavigators?: Array<{
    title?: string;
    firstIndexes: string[];
    secondIndexes?: string[][];
    initialFirstIndex?: number;
    initialSecondIndex?: number;
  }>;
  onObjectNavigatorChange?: (navIndex: number, firstIndex: number, secondIndex?: number) => void;
  allowShowAll?: boolean;
}
const MultiChart: React.FC<MultiChartProps> = (props) => {
  const { data: session } = useSession();
  const { t, i18n } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  type HoverPoint = { x: number; y: number; timestamp: number; dataIndex: number } | null;
  type State = {
    svgDimensions: { width: number; height: number };
    hiddenLinks: Set<string>;
    hoveredPoint: HoverPoint;
    tooltipPos: { x: number; y: number } | null;
    indexValue: number;
    loadingStatus: boolean;
    onReachEnd: boolean;
    onReachBegin: boolean;
    showAll: boolean;
    animationKey: number;
  };
  const initialState: State = {
    svgDimensions: { width: 800, height: 230 },
    hiddenLinks: new Set(),
    hoveredPoint: null,
    tooltipPos: null,
    indexValue: 0,
    loadingStatus: true,
    onReachEnd: true,
    onReachBegin: true,
    showAll: false,
    animationKey: 0,
  };
  type Action =
    | { type: "SET_DIMENSIONS"; payload: { width: number; height: number } }
    | { type: "TOGGLE_LINK"; payload: string }
    | { type: "RESET_HIDDEN" }
    | { type: "SET_HOVER"; payload: HoverPoint }
    | { type: "SET_TOOLTIP"; payload: { x: number; y: number } | null }
    | { type: "SET_INDEX"; payload: number }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_REACH_FLAGS"; payload: { begin: boolean; end: boolean } }
    | { type: "SET_SHOW_ALL"; payload: boolean }
    | { type: "TRIGGER_ANIMATION" };
  const reducer = (s: State, a: Action): State => {
    switch (a.type) {
      case "SET_DIMENSIONS":
        return { ...s, svgDimensions: a.payload };
      case "TOGGLE_LINK": {
        const newSet = new Set(s.hiddenLinks);
        if (newSet.has(a.payload)) newSet.delete(a.payload);
        else newSet.add(a.payload);
        return { ...s, hiddenLinks: newSet };
      }
      case "RESET_HIDDEN":
        return { ...s, hiddenLinks: new Set() };
      case "SET_HOVER":
        return { ...s, hoveredPoint: a.payload };
      case "SET_TOOLTIP":
        return { ...s, tooltipPos: a.payload };
      case "SET_INDEX":
        // Only trigger animation if index actually changes
        if (a.payload !== s.indexValue) {
          return { ...s, indexValue: a.payload, animationKey: s.animationKey + 1 };
        }
        return { ...s, indexValue: a.payload };
      case "SET_SHOW_ALL":
        return { ...s, showAll: a.payload, animationKey: s.animationKey + 1 };
      case "SET_LOADING":
        return { ...s, loadingStatus: a.payload };
      case "SET_REACH_FLAGS":
        return { ...s, onReachBegin: a.payload.begin, onReachEnd: a.payload.end };
      case "TRIGGER_ANIMATION":
        return { ...s, animationKey: s.animationKey + 1 };
      default:
        return s;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const measuredLabelCache = useRef<Map<string, number>>(new Map());
  const measuredLabelKeys = useRef<string[]>([]);
  type CalendarId = "gregory" | "persian" | "islamic" | "indian";
  const mapCalendarNameToId = useCallback((name?: string): CalendarId => {
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
  }, []);
  const [calendarId, setCalendarId] = useState<CalendarId>("gregory");
  const refs = {
    navigationPrev: useRef(null),
    navigationNext: useRef(null),
  };
  const pendingRaf = useRef<number | null>(null);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          dispatch({ type: "SET_INDEX", payload: Math.max(0, state.indexValue - 1) });
          break;
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          dispatch({
            type: "SET_INDEX",
            payload: Math.min(state.indexValue + 1, Math.max(0, allMonthsData.length - 1)),
          });
          break;
        case "Home":
          e.preventDefault();
          dispatch({ type: "SET_INDEX", payload: 0 });
          break;
        case "End":
          e.preventDefault();
          dispatch({ type: "SET_INDEX", payload: Math.max(0, allMonthsData.length - 1) });
          break;
        case "Escape":
          dispatch({ type: "SET_HOVER", payload: null });
          dispatch({ type: "SET_TOOLTIP", payload: null });
          break;
        default:
          break;
      }
    },
    [state.indexValue]
  );
  useEffect(() => {
    try {
      const cal = typeof window !== "undefined" ? window.localStorage.getItem("calendar") ?? undefined : undefined;
      setCalendarId(mapCalendarNameToId(cal));
    } catch {}
    const onCalendarChanged = (e: Event) => {
      const custom = e as CustomEvent<string>;
      const val = custom?.detail;
      setCalendarId(mapCalendarNameToId(val));
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === "calendar") {
        setCalendarId(mapCalendarNameToId(e.newValue ?? undefined));
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("brancy:calendar-changed", onCalendarChanged as EventListener);
      window.addEventListener("storage", onStorage);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("brancy:calendar-changed", onCalendarChanged as EventListener);
        window.removeEventListener("storage", onStorage);
      }
    };
  }, [mapCalendarNameToId]);
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
  const allMonthsData = useMemo(() => {
    if (!props.seriesData || props.seriesData.length === 0) return [];
    const monthsMap = new Map<string, { month: number; year: number; data: Map<string, IMonthGraph> }>();
    props.seriesData.forEach((series) => {
      if (!series.data || series.data.length === 0) return;
      series.data.forEach((monthData) => {
        const key = `${monthData.year}-${monthData.month}`;
        if (!monthsMap.has(key)) {
          monthsMap.set(key, {
            month: monthData.month,
            year: monthData.year,
            data: new Map(),
          });
        }
        monthsMap.get(key)!.data.set(series.id, monthData);
      });
    });
    return Array.from(monthsMap.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  }, [props.seriesData]);
  const currentMonthData = useMemo(() => {
    return allMonthsData.length > state.indexValue ? allMonthsData[state.indexValue] : null;
  }, [allMonthsData, state.indexValue]);
  const locale = i18n?.language || "en";
  const localeWithCalendar = useMemo(() => {
    try {
      return `${locale}-u-ca-${calendarId}`;
    } catch {
      return locale;
    }
  }, [locale, calendarId]);
  const dayFormatter = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(localeWithCalendar, { day: "numeric" });
    } catch {
      return new Intl.DateTimeFormat(locale, { day: "numeric" });
    }
  }, [localeWithCalendar, locale]);
  const monthFormatter = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(localeWithCalendar, { month: "long" });
    } catch {
      return new Intl.DateTimeFormat(locale, { month: "long" });
    }
  }, [localeWithCalendar, locale]);
  const yearFormatter = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(localeWithCalendar, { year: "numeric" });
    } catch {
      return new Intl.DateTimeFormat(locale, { year: "numeric" });
    }
  }, [localeWithCalendar, locale]);
  const getMonthYearLabels = useCallback(
    (year: number, month: number) => {
      const d = new Date(year, Math.max(0, month - 1), 1);
      return {
        month: monthFormatter.format(d),
        year: yearFormatter.format(d),
      };
    },
    [monthFormatter, yearFormatter]
  );
  const monthYearLabels = useMemo(() => {
    return allMonthsData?.map((v) => getMonthYearLabels(v.year, v.month)) ?? [];
  }, [allMonthsData, getMonthYearLabels]);
  const seriesData = useMemo<ISeriesData[]>(() => {
    if (state.showAll) {
      return props.seriesData
        .map((series, index) => {
          const items = (allMonthsData || [])
            .flatMap((m) => {
              const md = m.data.get(series.id);
              return md ? md.dayList : [];
            })
            .sort((a, b) => a.createdTime - b.createdTime);
          if (!items || items.length === 0) return null;
          return {
            name: series.name,
            color: generateColor(index),
            items,
          };
        })
        .filter((item): item is ISeriesData => item !== null);
    }

    if (!currentMonthData) return [];
    return props.seriesData
      .map((series, index) => {
        const monthData = currentMonthData.data.get(series.id);
        if (!monthData) return null;
        return {
          name: series.name,
          color: generateColor(index),
          items: monthData.dayList,
        };
      })
      .filter((item): item is ISeriesData => item !== null);
  }, [currentMonthData, props.seriesData, state.showAll, allMonthsData]);
  const visibleSeriesData = useMemo<ISeriesData[]>(() => {
    return seriesData.filter((series) => {
      const seriesItem = props.seriesData.find((s) => s.name === series.name);
      return seriesItem && !state.hiddenLinks.has(seriesItem.id);
    });
  }, [seriesData, props.seriesData, state.hiddenLinks]);
  const totalCount = useMemo(() => {
    if (!currentMonthData) return 0;
    return Array.from(currentMonthData.data.values()).reduce((sum, monthData) => sum + monthData.totalCount, 0);
  }, [currentMonthData]);
  const plusCount = useMemo(() => {
    if (!currentMonthData || state.indexValue === 0) return 0;
    const prevMonthData = allMonthsData[state.indexValue - 1];
    if (!prevMonthData) return 0;
    const prevTotal = Array.from(prevMonthData.data.values()).reduce((sum, monthData) => sum + monthData.totalCount, 0);
    return totalCount - prevTotal;
  }, [currentMonthData, state.indexValue, allMonthsData, totalCount]);
  useEffect(() => {
    if (props.seriesData && LoginStatus(session)) {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [props.seriesData, session]);
  const initialIndexSet = useRef(false);
  useEffect(() => {
    if (!props.seriesData || props.seriesData.length === 0) return;
    const refresh = () => {
      try {
        if (containerRef.current) {
          const width = containerRef.current.clientWidth || 800;
          dispatch({ type: "SET_DIMENSIONS", payload: { width, height: 230 } });
        } else {
          dispatch({ type: "SET_DIMENSIONS", payload: state.svgDimensions });
        }
      } catch (e) {}
      dispatch({ type: "SET_HOVER", payload: null });
      dispatch({ type: "SET_TOOLTIP", payload: null });
      dispatch({ type: "RESET_HIDDEN" });
      if (!initialIndexSet.current && allMonthsData && allMonthsData.length > 0) {
        dispatch({ type: "SET_INDEX", payload: allMonthsData.length - 1 });
        initialIndexSet.current = true;
      }
    };
    const timer = setTimeout(refresh, 60);
    return () => clearTimeout(timer);
  }, [props.seriesData]);
  useEffect(() => {
    if (allMonthsData.length === 0) return;
    const maxIndex = Math.max(0, allMonthsData.length - 1);
    if (state.indexValue < 0 || state.indexValue > maxIndex) {
      dispatch({ type: "SET_INDEX", payload: maxIndex });
    }
  }, [allMonthsData.length, state.indexValue]);
  const formatNumber = (num: number) => {
    if (Math.abs(num) < 0.00001) return "0";
    if (num < 1000) {
      return num % 1 === 0 ? Math.floor(num).toString() : num.toFixed(1).replace(/\.?0+$/, "");
    }
    if (num >= 1e9) {
      const value = num / 1e9;
      return value % 1 === 0 ? value.toFixed(0) + " B" : value.toFixed(1).replace(/\.?0+$/, "") + " B";
    }
    if (num >= 1e6) {
      const value = num / 1e6;
      return value % 1 === 0 ? value.toFixed(0) + " M" : value.toFixed(1).replace(/\.?0+$/, "") + " M";
    }
    if (num >= 1e3) {
      const value = num / 1e3;
      return value % 1 === 0 ? value.toFixed(0) + " K" : value.toFixed(1).replace(/\.?0+$/, "") + " K";
    }
    return Math.floor(num).toString();
  };
  const roundDataValue = (value: number) => {
    return Math.abs(value) < 0.00001 ? 0 : value;
  };
  const chartData = useMemo(() => {
    if (!visibleSeriesData || visibleSeriesData.length === 0) return null;
    const seriesMaps: Map<number, number>[] = visibleSeriesData.map(
      (s) => new Map(s.items.map((it) => [it.createdTime * 1000, it.count]))
    );
    const tsSet = new Set<number>();
    for (let i = 0; i < seriesMaps.length; i++) {
      seriesMaps[i].forEach((_, k) => tsSet.add(k));
    }
    const allTimestamps = Array.from(tsSet).sort((a, b) => a - b);
    if (allTimestamps.length === 0) return null;
    const minX = allTimestamps[0];
    const maxX = allTimestamps[allTimestamps.length - 1];
    const stackedValuesArr: number[] = new Array(allTimestamps.length).fill(0);
    for (let si = 0; si < seriesMaps.length; si++) {
      const m = seriesMaps[si];
      for (let ti = 0; ti < allTimestamps.length; ti++) {
        stackedValuesArr[ti] += m.get(allTimestamps[ti]) || 0;
      }
    }
    const values = stackedValuesArr;
    const dataMaxY = Math.max(...values, 0);
    const dataMinY = Math.min(...values, 0);
    let maxY = dataMaxY + 2;
    let minY = dataMinY < 0 ? dataMinY - 2 : 0;
    const rangeY = maxY - minY || 1;
    const basePadding = { top: 10, right: 10, bottom: 40, left: 10 };
    const chartHeight = state.svgDimensions.height - basePadding.top - basePadding.bottom;
    const measureSteps = 10;
    const yLabelValuesForMeasure: string[] = [];
    for (let i = 0; i <= measureSteps; i++) {
      const value = maxY - (rangeY / measureSteps) * i;
      yLabelValuesForMeasure.push(formatNumber(roundDataValue(value)));
    }
    let measuredLabelWidth = 0;
    try {
      const cacheKey = yLabelValuesForMeasure.join("|");
      const cached = measuredLabelCache.current.get(cacheKey);
      if (cached !== undefined) {
        measuredLabelWidth = cached;
      } else if (typeof document !== "undefined") {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.font = "12px Arial, Helvetica, sans-serif";
          for (let i = 0; i < yLabelValuesForMeasure.length; i++) {
            const w = ctx.measureText(yLabelValuesForMeasure[i]).width;
            if (w > measuredLabelWidth) measuredLabelWidth = w;
          }
        }
        measuredLabelCache.current.set(cacheKey, measuredLabelWidth);
      }
    } catch {}
    const leftPadding = Math.max(0, Math.ceil(measuredLabelWidth) + 18);
    const padding = { top: basePadding.top, right: basePadding.right, bottom: basePadding.bottom, left: leftPadding };
    const chartWidth = state.svgDimensions.width - padding.left - padding.right;
    const scaleX = (x: number) => padding.left + ((x - minX) / (maxX - minX)) * chartWidth;
    const scaleY = (y: number) => padding.top + chartHeight - ((y - minY) / rangeY) * chartHeight;
    const computedAverage = values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0;
    const averageValue =
      props.averageValue !== undefined && props.averageValue !== null ? props.averageValue : computedAverage;
    const averageY = scaleY(averageValue);
    const ySteps = 6;
    const yGridLines = [];
    const yLabels = [];
    for (let i = 0; i <= ySteps; i++) {
      const y = padding.top + (chartHeight / ySteps) * i;
      const value = maxY - (rangeY / ySteps) * i;
      yGridLines.push({ y, value });
      yLabels.push({
        y: y + 4,
        value: formatNumber(roundDataValue(value)),
      });
    }
    const xSteps = state.showAll ? Math.min(6, allTimestamps.length) : Math.min(15, allTimestamps.length);
    const xGridLines = [];
    const xLabels = [];
    for (let i = 0; i <= xSteps; i++) {
      const x = padding.left + (chartWidth / xSteps) * i;
      const timestamp = minX + ((maxX - minX) / xSteps) * i;
      xGridLines.push({ x });
      xLabels.push({
        x,
        timestamp,
        label: state.showAll ? monthFormatter.format(new Date(timestamp)) : dayFormatter.format(new Date(timestamp)),
      });
    }
    const seriesPaths: any[] = [];
    for (let seriesIndex = visibleSeriesData.length - 1; seriesIndex >= 0; seriesIndex--) {
      const series = visibleSeriesData[seriesIndex];
      const dataMap = seriesMaps[seriesIndex];
      const points: Point[] = [];
      for (let ti = 0; ti < allTimestamps.length; ti++) {
        const timestamp = allTimestamps[ti];
        let stackedY = 0;
        for (let j = seriesIndex; j < seriesMaps.length; j++) {
          stackedY += seriesMaps[j].get(timestamp) || 0;
        }
        const x = scaleX(timestamp);
        const y = scaleY(stackedY);
        points.push({ x, y });
      }
      const linePath = getSmoothPath(points);
      const areaPath =
        linePath +
        ` L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${
          padding.top + chartHeight
        } Z`;
      seriesPaths.push({
        name: series.name,
        color: series.color,
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
      let lo = 0;
      let hi = arr.length - 1;
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
      averageValue,
      averageY,
      findClosestIndex,
    };
  }, [visibleSeriesData, state.svgDimensions, dayFormatter, monthFormatter, state.showAll, props.averageValue]);
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || !chartData || !containerRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
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
      const invScaleX = (screenX: number) =>
        chartData.minX + ((screenX - padding.left) / chartWidth) * (chartData.maxX - chartData.minX);
      const hoveredTimestamp = invScaleX(mouseX);
      const closestIndex = chartData.findClosestIndex(chartData.allTimestamps, hoveredTimestamp);
      const closestDist = Math.abs(chartData.allTimestamps[closestIndex] - hoveredTimestamp);

      if (closestDist < (chartData.maxX - chartData.minX) / 30) {
        const timestamp = chartData.allTimestamps[closestIndex];
        const x = chartData.scaleX(timestamp);
        const tooltipX = mouseX;
        const tooltipY = mouseY;
        if (pendingRaf.current) cancelAnimationFrame(pendingRaf.current);
        pendingRaf.current = requestAnimationFrame(() => {
          dispatch({ type: "SET_HOVER", payload: { x, y: mouseY, timestamp, dataIndex: closestIndex } });
          dispatch({ type: "SET_TOOLTIP", payload: { x: tooltipX, y: tooltipY } });
          pendingRaf.current = null;
        });
      } else {
        if (pendingRaf.current) cancelAnimationFrame(pendingRaf.current);
        dispatch({ type: "SET_HOVER", payload: null });
        dispatch({ type: "SET_TOOLTIP", payload: null });
      }
    },
    [chartData]
  );
  const handleMouseLeave = useCallback(() => {
    if (pendingRaf.current) cancelAnimationFrame(pendingRaf.current);
    dispatch({ type: "SET_HOVER", payload: null });
    dispatch({ type: "SET_TOOLTIP", payload: null });
  }, []);
  const handleTouchMove = useCallback(
    (e: React.TouchEvent<SVGSVGElement>) => {
      if (!svgRef.current || !chartData || !containerRef.current || e.touches.length === 0) return;
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
        if (pendingRaf.current) cancelAnimationFrame(pendingRaf.current);
        dispatch({ type: "SET_HOVER", payload: null });
        dispatch({ type: "SET_TOOLTIP", payload: null });
        return;
      }
      const invScaleX = (screenX: number) =>
        chartData.minX + ((screenX - padding.left) / chartWidth) * (chartData.maxX - chartData.minX);
      const hoveredTimestamp = invScaleX(mouseX);
      const closestIndex = chartData.findClosestIndex(chartData.allTimestamps, hoveredTimestamp);
      const closestDist = Math.abs(chartData.allTimestamps[closestIndex] - hoveredTimestamp);
      if (closestDist < (chartData.maxX - chartData.minX) / 30) {
        const timestamp = chartData.allTimestamps[closestIndex];
        const x = chartData.scaleX(timestamp);
        const tooltipX = mouseX;
        const tooltipY = mouseY;
        if (pendingRaf.current) cancelAnimationFrame(pendingRaf.current);
        pendingRaf.current = requestAnimationFrame(() => {
          dispatch({ type: "SET_HOVER", payload: { x, y: mouseY, timestamp, dataIndex: closestIndex } });
          dispatch({ type: "SET_TOOLTIP", payload: { x: tooltipX, y: tooltipY } });
          pendingRaf.current = null;
        });
      } else {
        if (pendingRaf.current) cancelAnimationFrame(pendingRaf.current);
        dispatch({ type: "SET_HOVER", payload: null });
        dispatch({ type: "SET_TOOLTIP", payload: null });
      }
    },
    [chartData]
  );
  const handleTouchEnd = useCallback(() => {
    if (pendingRaf.current) cancelAnimationFrame(pendingRaf.current);
    dispatch({ type: "SET_HOVER", payload: null });
    dispatch({ type: "SET_TOOLTIP", payload: null });
  }, []);
  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || !chartData || !containerRef.current) return;
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
      const invScaleX = (screenX: number) =>
        chartData.minX + ((screenX - padding.left) / chartWidth) * (chartData.maxX - chartData.minX);
      const hoveredTimestamp = invScaleX(mouseX);
      const closestIndex = chartData.findClosestIndex(chartData.allTimestamps, hoveredTimestamp);
      const closestDist = Math.abs(chartData.allTimestamps[closestIndex] - hoveredTimestamp);
      if (closestDist < (chartData.maxX - chartData.minX) / 30) {
        const timestamp = chartData.allTimestamps[closestIndex];
        const x = chartData.scaleX(timestamp);
        const tooltipX = mouseX;
        const tooltipY = mouseY;
        if (pendingRaf.current) cancelAnimationFrame(pendingRaf.current);
        pendingRaf.current = requestAnimationFrame(() => {
          dispatch({ type: "SET_HOVER", payload: { x, y: mouseY, timestamp, dataIndex: closestIndex } });
          dispatch({ type: "SET_TOOLTIP", payload: { x: tooltipX, y: tooltipY } });
          pendingRaf.current = null;
        });
      }
    },
    [chartData]
  );
  const setFromEdge = useCallback(() => {
    dispatch({ type: "SET_REACH_FLAGS", payload: { begin: false, end: false } });
  }, []);
  const goPrev = useCallback(() => {
    dispatch({ type: "SET_INDEX", payload: Math.max(0, state.indexValue - 1) });
  }, [state.indexValue]);

  const goNext = useCallback(() => {
    dispatch({ type: "SET_INDEX", payload: Math.min(state.indexValue + 1, Math.max(0, allMonthsData.length - 1)) });
  }, [state.indexValue, allMonthsData.length]);
  const objectNavPrev = useCallback(
    (navIdx: number) => {
      if (!props.objectNavigators) return;
      const nav = props.objectNavigators[navIdx];
      if (!nav) return;
      setObjectNavState((prev) => {
        const next = prev.slice();
        const cur = next[navIdx] || { firstIndex: 0 };
        const newFirst = Math.max(0, (cur.firstIndex || 0) - 1);
        next[navIdx] = { firstIndex: newFirst, secondIndex: 0 };
        try {
          props.onObjectNavigatorChange?.(navIdx, newFirst, 0);
        } catch {}
        return next;
      });
    },
    [props.objectNavigators]
  );
  const objectNavNext = useCallback(
    (navIdx: number) => {
      if (!props.objectNavigators) return;
      const nav = props.objectNavigators[navIdx];
      if (!nav) return;
      setObjectNavState((prev) => {
        const next = prev.slice();
        const cur = next[navIdx] || { firstIndex: 0 };
        const newFirst = Math.min(nav.firstIndexes.length - 1, (cur.firstIndex || 0) + 1);
        next[navIdx] = { firstIndex: newFirst, secondIndex: 0 };
        try {
          props.onObjectNavigatorChange?.(navIdx, newFirst, 0);
        } catch {}
        return next;
      });
    },
    [props.objectNavigators]
  );
  useEffect(() => {
    dispatch({
      type: "SET_REACH_FLAGS",
      payload: { begin: state.indexValue === 0, end: state.indexValue === Math.max(0, allMonthsData.length - 1) },
    });
  }, [state.indexValue, allMonthsData.length]);
  const touchStartX = useRef<number | null>(null);
  const handleNavigatorTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }, []);
  const handleNavigatorTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
      const threshold = 40; // px
      if (Math.abs(dx) > threshold) {
        if (dx < 0) goNext();
        else goPrev();
      }
      touchStartX.current = null;
    },
    [goNext, goPrev]
  );
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
      const url = (window.URL || (window as any).webkitURL).createObjectURL(blob);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const rect = svgEl.getBoundingClientRect();
          const width = Math.max(1, Math.round(rect.width || Number(svgEl.getAttribute("width") || 800)));
          const height = Math.max(1, Math.round(rect.height || Number(svgEl.getAttribute("height") || 230)));
          canvas.width = width;
          canvas.height = height;
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
            0.92
          );
        } finally {
          try {
            (window.URL || (window as any).webkitURL).revokeObjectURL(url);
          } catch {}
        }
      };
      img.onerror = () => {
        try {
          (window.URL || (window as any).webkitURL).revokeObjectURL(url);
        } catch {}
      };
      img.src = url;
    } catch (e) {}
  }, [props.id]);
  const mouseStartX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const handleMouseDownNav = useCallback((e: React.MouseEvent) => {
    mouseStartX.current = e.clientX;
    isDragging.current = true;
    try {
      const el = containerRef.current;
      if (el) el.classList.add(multiStyles.dragging || "");
    } catch {}
  }, []);
  const handleMouseMoveNav = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || mouseStartX.current === null) return;
    e.preventDefault();
  }, []);
  const handleMouseUpNav = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging.current || mouseStartX.current === null) {
        isDragging.current = false;
        mouseStartX.current = null;
        return;
      }
      const dx = e.clientX - mouseStartX.current;
      const threshold = 40;
      if (Math.abs(dx) > threshold) {
        if (dx < 0) goNext();
        else goPrev();
      }
      isDragging.current = false;
      mouseStartX.current = null;
      try {
        const el = containerRef.current;
        if (el) el.classList.remove(multiStyles.dragging || "");
      } catch {}
    },
    [goNext, goPrev]
  );
  const toggleLinkVisibility = useCallback(
    (seriesId: string) => {
      const currentlyHidden = state.hiddenLinks.has(seriesId);
      if (currentlyHidden) {
        dispatch({ type: "TOGGLE_LINK", payload: seriesId });
        return;
      }
      const visibleCount = props.seriesData.length - state.hiddenLinks.size;
      if (visibleCount > 1) {
        dispatch({ type: "TOGGLE_LINK", payload: seriesId });
      }
    },
    [props.seriesData.length, state.hiddenLinks]
  );
  const unshowContent = props.unshowContent !== undefined ? props.unshowContent : true;
  const hasData = allMonthsData && allMonthsData.length > 0;
  const [objectNavState, setObjectNavState] = useState<{ firstIndex: number; secondIndex?: number }[]>(() => {
    if (!props.objectNavigators) return [];
    return props.objectNavigators.map((n) => ({
      firstIndex: n.initialFirstIndex ?? 0,
      secondIndex: n.initialSecondIndex,
    }));
  });
  useEffect(() => {
    if (!props.objectNavigators) return;
    setObjectNavState(
      props.objectNavigators.map((n) => ({ firstIndex: n.initialFirstIndex ?? 0, secondIndex: n.initialSecondIndex }))
    );
  }, [props.objectNavigators]);
  // Ensure animations run when the chart is first rendered or when visible series change.
  useEffect(() => {
    if (!chartData) return;
    // small delay to ensure DOM is mounted before triggering animation
    const timer = setTimeout(() => dispatch({ type: "TRIGGER_ANIMATION" }), 40);
    return () => clearTimeout(timer);
  }, [chartData?.seriesPaths.length, state.showAll]);
  useEffect(() => {
    if (!props.allowShowAll && state.showAll) {
      dispatch({ type: "SET_SHOW_ALL", payload: false });
    }
  }, [props.allowShowAll]);
  const handleObjectNavSelect = useCallback(
    (navIdx: number, firstIdx: number, secondIdx?: number) => {
      setObjectNavState((prev) => {
        const next = prev.slice();
        next[navIdx] = { firstIndex: firstIdx, secondIndex: secondIdx };
        return next;
      });
      try {
        props.onObjectNavigatorChange?.(navIdx, firstIdx, secondIdx);
      } catch {}
    },
    [props]
  );
  return (
    <>
      {/* Header */}
      {state.loadingStatus && unshowContent && <Loading />}
      {!state.loadingStatus && unshowContent && hasData && currentMonthData && (
        <div className={`${multiStyles.multiChart} translate`}>
          {/* SVG Chart */}
          <div ref={containerRef} className={multiStyles.chartContainer} tabIndex={0} onKeyDown={handleKeyDown}>
            {/* Legend Dotmenu */}
            {props.seriesData.length > 0 && (
              <div className={multiStyles.legendMenu}>
                <Dotmenu
                  data={[
                    ...(props.seriesData.length > 1
                      ? props.seriesData.map((series, index) => {
                          const isHidden = state.hiddenLinks.has(series.id);
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
                            onClick: () => toggleLinkVisibility(series.id),
                            style: {
                              opacity: isHidden ? 0.5 : 1,
                              textDecoration: isHidden ? "line-through" : "none",
                              color: isHidden ? "var(--color-gray40)" : "var(--text-h2)",
                            },
                          };
                        })
                      : []),
                    ...(props.allowShowAll
                      ? [
                          {
                            icon: state.showAll ? (
                              <svg
                                fill="var(--color-gray)"
                                stroke="var(--color-gray)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 36 36">
                                <path d="M29.2 18h-8m0 0 3.8 3.8M21.2 18l3.8-3.8M7 18h8m0 0-4 4m4-4-4-4" />
                                <path opacity=".6" d="M2 28V8m32.2 20V8" />
                              </svg>
                            ) : (
                              <svg
                                fill="var(--color-gray)"
                                stroke="var(--color-gray)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 36 36">
                                <path d="M26.2 18h8m0 0-3.8-3.8m3.8 3.8-3.8 3.8M10 18H2m0 0 4-4m-4 4 4 4" />
                                <path opacity=".4" d="M15 28V8m6.2 20V8" />
                              </svg>
                            ),
                            value: state.showAll ? t(LanguageKey.toggleShowmonthly) : t(LanguageKey.toggleShowAll),
                            onClick: () => dispatch({ type: "SET_SHOW_ALL", payload: !state.showAll }),
                          },
                        ]
                      : []),
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
              onClick={handleClick}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              className={multiStyles.chartSvg}>
              {chartData && (
                <>
                  {/* Y-axis labels */}
                  <g fill="var(--text-h2)" fontSize="12" fontWeight="400" textAnchor="end">
                    {chartData.yLabels.map((label, i) => (
                      <text key={`y-label-${i}`} x={Math.round(chartData.padding.left - 10)} y={Math.round(label.y)}>
                        {label.value}
                      </text>
                    ))}
                  </g>

                  {/* X-axis labels */}
                  <g fill="var(--text-h2)" fontWeight="400">
                    {chartData.xLabels.map((label, i) => {
                      const x = Math.round(label.x);
                      const y = state.showAll
                        ? Math.round(state.svgDimensions.height - 25)
                        : Math.round(state.svgDimensions.height - 20);
                      if (state.showAll) {
                        // rotated, fewer labels
                        return (
                          <text
                            key={`x-label-${i}`}
                            x={x}
                            y={y}
                            transform={`rotate(-25 ${x} ${y})`}
                            style={{ fontSize: 10 }}
                            textAnchor="end">
                            {label.label}
                          </text>
                        );
                      }
                      return (
                        <text key={`x-label-${i}`} x={x} y={y} textAnchor="middle">
                          {label.label}
                        </text>
                      );
                    })}
                  </g>
                  {/* Area paths (stacked) */}
                  <g>
                    <defs>
                      {chartData.seriesPaths.map((series: any, idx: number) => (
                        <linearGradient key={idx} id={`gradient-${props.id}-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor={series.color} stopOpacity="0.6" />
                          <stop offset="100%" stopColor={series.color} stopOpacity="0" />
                        </linearGradient>
                      ))}
                    </defs>
                    {chartData.seriesPaths.map((series: any, idx: number) => (
                      <g key={`series-${state.animationKey}-${idx}`}>
                        {/* Area fill */}
                        <path
                          d={series.areaPath}
                          fill={`url(#gradient-${props.id}-${idx})`}
                          className={multiStyles.animatedArea}
                        />
                        {/* Line stroke */}
                        <path
                          d={series.linePath}
                          fill="none"
                          stroke={series.color}
                          strokeWidth="1"
                          className={multiStyles.animatedPath}
                        />
                        {/* Hover point: access by dataIndex to avoid scanning all points */}
                        {state.hoveredPoint && series.points[state.hoveredPoint.dataIndex] && (
                          <circle
                            cx={series.points[state.hoveredPoint.dataIndex].x}
                            cy={series.points[state.hoveredPoint.dataIndex].y}
                            r={3}
                            fill={series.color}
                            stroke="white"
                            strokeWidth={1.5}
                            style={{ zIndex: 10, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
                          />
                        )}
                      </g>
                    ))}
                  </g>
                  {/* Crosshair lines */}
                  {state.hoveredPoint && (
                    <g>
                      {/* Vertical line */}
                      <line
                        x1={Math.round(state.hoveredPoint.x)}
                        y1={Math.round(chartData.padding.top)}
                        x2={Math.round(state.hoveredPoint.x)}
                        y2={Math.round(chartData.padding.top + chartData.chartHeight)}
                        stroke="var(--color-gray60)"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                      />
                      {/* Horizontal lines for each series - based on actual data points */}
                      {chartData.seriesPaths.map((series: any, idx: number) => {
                        const point = series.points[state.hoveredPoint!.dataIndex];
                        if (!point) return null;
                        return (
                          <line
                            key={`h-line-${idx}`}
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
            {/* HTML overlay for grid lines and average (styles from CSS module) */}
            {chartData && (
              <div
                className={multiStyles.overlay}
                style={{ width: state.svgDimensions.width, height: state.svgDimensions.height }}>
                {/* horizontal grid lines */}
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
                {/* vertical grid lines */}
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
                {/* average line + label */}
                {props.showAverage && typeof chartData.averageY === "number" && (
                  <>
                    <div
                      className={multiStyles.averageLine}
                      style={{
                        top: Math.round(chartData.averageY),
                        left: Math.round(chartData.padding.left),
                        width: Math.round(chartData.chartWidth),
                      }}
                    />
                    <div
                      className={multiStyles.averageLabel}
                      style={{
                        top: Math.round(chartData.averageY - 0),
                        right: Math.round(chartData.padding.right + chartData.chartWidth),
                      }}>
                      {formatNumber(chartData.averageValue)}
                    </div>
                  </>
                )}
                {/* Y-axis crosshair value labels */}
                {state.hoveredPoint &&
                  chartData.seriesPaths.map((series: any, idx: number) => {
                    const point = series.points[state.hoveredPoint!.dataIndex];
                    if (!point) return null;
                    return (
                      <div
                        key={`y-label-${idx}`}
                        className={multiStyles.hoverLabelRect}
                        style={{
                          left: Math.round(chartData.padding.left - 35),
                          top: Math.round(point.y),
                        }}>
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
                  state.tooltipPos!.x > state.svgDimensions.width / 2
                    ? multiStyles.tooltipLeft
                    : multiStyles.tooltipRight
                }`}
                style={{
                  left: state.tooltipPos!.x + 15,
                  top: state.tooltipPos!.y + 15,
                }}>
                <div className={multiStyles.tooltipHeader}>
                  {dayFormatter.format(new Date(state.hoveredPoint!.timestamp))}  
                  {monthFormatter.format(new Date(state.hoveredPoint!.timestamp))}
                </div>
                {chartData.seriesPaths.map((series: any, idx: number) => {
                  const point = series.points[state.hoveredPoint!.dataIndex];
                  if (!point) return null;
                  return (
                    <div key={idx} className={multiStyles.tooltipRow}>
                      <div className={multiStyles.tooltipRowLeft}>
                        {/* Hide color dot when only one series is visible */}
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
                {/* Hide total when only one series is visible */}
                {chartData.seriesPaths.length > 1 && (
                  <div className={multiStyles.tooltipTotal}>
                    <span className={multiStyles.tooltipTotalLabel}>{t(LanguageKey.total)}</span>
                    <span className={multiStyles.tooltipTotalValue}>
                      {Math.round(
                        chartData.seriesPaths.reduce((sum: number, series: any) => {
                          const point = series.points[state.hoveredPoint!.dataIndex];
                          return sum + (point?.value || 0);
                        }, 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Optional Object Navigators (first/second levels) */}
          {props.objectNavigators && props.objectNavigators.length > 0 && (
            <>
              {props.objectNavigators.map((nav, navIdx) => {
                const stateForNav = objectNavState[navIdx] ?? { firstIndex: 0 };
                const firstIdx = stateForNav.firstIndex ?? 0;
                const secondList =
                  nav.secondIndexes && nav.secondIndexes[firstIdx] ? nav.secondIndexes[firstIdx] : undefined;
                return (
                  <React.Fragment key={`obj-nav-wrapper-${navIdx}`}>
                    <div key={`obj-nav-${navIdx}`} className={multiStyles.objectDatenavigatorsecond}>
                      {/* {nav.title && (
                        <div style={{ fontWeight: 600, marginInlineEnd: 8, color: "var(--text-h2)" }}>{nav.title}</div>
                      )} */}
                      <div className={multiStyles.firstList}>
                        <img
                          alt="back"
                          src="/back-forward.svg"
                          className={`${multiStyles.backForwardIcon} ${
                            stateForNav.firstIndex === 0 ? multiStyles.disabledNav : ""
                          }`}
                          onClick={() => objectNavPrev(navIdx)}
                        />
                        <div
                          className={multiStyles.inlineNavigator}
                          onTouchStart={handleNavigatorTouchStart}
                          onTouchEnd={handleNavigatorTouchEnd}
                          onMouseDown={handleMouseDownNav}
                          onMouseMove={handleMouseMoveNav}
                          onMouseUp={handleMouseUpNav}
                          onMouseLeave={handleMouseUpNav}>
                          <div
                            className={multiStyles.textWrapper}
                            style={{ color: "var(--color-light-blue)", display: "flex", alignItems: "center", gap: 8 }}>
                            <strong style={{ fontWeight: 600 }}>{nav.firstIndexes[firstIdx]}</strong>
                          </div>
                        </div>
                        <img
                          src="/back-forward1.svg"
                          alt="forward"
                          onClick={() => objectNavNext(navIdx)}
                          className={`${multiStyles.forwardIcon} ${
                            stateForNav.firstIndex === nav.firstIndexes.length - 1 ? multiStyles.disabledNav : ""
                          }`}
                        />{" "}
                      </div>
                      {/* second level */}
                      {secondList && (
                        <div className={multiStyles.secondList}>
                          {secondList.map((txt, si) => (
                            <button
                              key={`second-${navIdx}-${si}`}
                              onClick={() => handleObjectNavSelect(navIdx, firstIdx, si)}
                              style={{
                                padding: "0px 5px",
                                borderRadius: 10,
                                border: "1px solid transparent",
                                cursor: "pointer",
                                background:
                                  objectNavState[navIdx]?.secondIndex === si
                                    ? "var(--color-light-blue30)"
                                    : "transparent",
                                color:
                                  objectNavState[navIdx]?.secondIndex === si
                                    ? "var(--color-dark-blue)"
                                    : "var(--text-h2)",
                              }}>
                              {txt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </>
          )}
          {/* Month Navigator */}
          <div className={`${multiStyles.objectDatenavigator} translate`}>
            <img
              ref={refs.navigationPrev}
              alt="back"
              src="/back-forward.svg"
              className={`${multiStyles.backForwardIcon} ${
                state.onReachBegin || state.showAll ? multiStyles.disabledNav : ""
              }`}
              onClick={state.showAll ? undefined : goPrev}
            />
            <div
              className={multiStyles.inlineNavigator}
              //  className={`${multiStyles.inlineNavigator} ${state.showAll ? multiStyles.disabledNav : ""}`}
              onTouchStart={handleNavigatorTouchStart}
              onTouchEnd={handleNavigatorTouchEnd}
              onMouseDown={handleMouseDownNav}
              onMouseMove={handleMouseMoveNav}
              onMouseUp={handleMouseUpNav}
              onMouseLeave={handleMouseUpNav}>
              <div className={multiStyles.textWrapper} style={{ color: "var(--color-light-blue)" }}>
                <strong>{monthYearLabels[state.indexValue]?.month ?? allMonthsData[state.indexValue]?.month}</strong>
                <span className="explain" style={{ color: "inherit" }}>
                  {monthYearLabels[state.indexValue]?.year ?? allMonthsData[state.indexValue]?.year}
                </span>

                {/*
                  {state.showAll ? (
                  <strong>{t(LanguageKey.toggleShowAll)}</strong>
                ) : (
                  <>
                    <strong>
                      {monthYearLabels[state.indexValue]?.month ?? allMonthsData[state.indexValue]?.month}
                    </strong>
                    <span className="explain" style={{ color: "inherit" }}>
                      {monthYearLabels[state.indexValue]?.year ?? allMonthsData[state.indexValue]?.year}
                    </span>
                  </>
                )}
  */}
              </div>
              {/* <div className={multiStyles.monthDots}>
                  {allMonthsData.map((_, i) => (
                    <button
                      key={i}
                      className={i === state.indexValue ? multiStyles.activeDot : multiStyles.dot}
                      onClick={() => dispatch({ type: "SET_INDEX", payload: i })}
                      aria-label={`month-${i}`}
                    />
                  ))}
                </div> */}
            </div>
            <img
              ref={refs.navigationNext}
              className={`${multiStyles.forwardIcon} ${
                state.onReachEnd || state.showAll ? multiStyles.disabledNav : ""
              }`}
              alt="forward"
              src="/back-forward1.svg"
              onClick={state.showAll ? undefined : goNext}
            />
          </div>
          {/* Statistics */}
          <div className="headerparent">
            <div className="headerandinput" style={{ alignItems: "center" }}>
              <span className="title">{totalCount.toLocaleString()}</span>
              <span className={`${multiStyles.totalcounter} translate`}>{t(LanguageKey.total)}</span>
            </div>
            {state.indexValue > 0 && (
              <div className="headerandinput" style={{ alignItems: "center" }}>
                <span className="title" style={{ color: "var(--color-dark-blue)" }}>
                  {plusCount === 0 ? "0" : (plusCount > 0 ? "+" : "") + plusCount.toLocaleString()}
                </span>
                <span className={`${multiStyles.totalcounter} translate`} style={{ color: "var(--color-dark-blue)" }}>
                  {t(LanguageKey.pageStatistics_from)}
                  {(() => {
                    const base = new Date(currentMonthData.year, Math.max(0, currentMonthData.month - 1), 1);
                    const prev = new Date(base.getFullYear(), base.getMonth() - 1, 1);
                    return <strong>{monthFormatter.format(prev)}</strong>;
                  })()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
export default memo(MultiChart);
