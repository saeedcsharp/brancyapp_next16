import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./hourLineChart.module.css";

interface HourCountUnix {
  hourValue: number;
  count: number;
}

interface Annotation {
  x?: string;
  x2?: string;
  y?: number;
  y2?: number;
  strokeDashArray?: number;
  borderColor?: string;
  fillColor?: string;
  opacity?: number;
  label?: {
    text?: string;
    style?: {
      color?: string;
      background?: string;
    };
  };
}

interface HourLineChartProps {
  items: HourCountUnix[];
  minY?: number;
  maxY?: number;
  annotations?: {
    xaxis?: Annotation[];
    yaxis?: Annotation[];
    points?: Array<{
      x: string;
      y: number;
      marker?: {
        size?: number;
        fillColor?: string;
        strokeColor?: string;
      };
      label?: {
        text?: string;
        style?: {
          color?: string;
          background?: string;
        };
      };
    }>;
  };
}

const round2 = (num: number) => Math.round(num * 10) / 10;

const formatNumber = (num: number) => {
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + "m";
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + "k";
  }
  return num.toString();
};

export const GetHourAmPM = (maxIndex: HourCountUnix) => {
  const hour = Math.floor(maxIndex.hourValue);
  const minutes = Math.floor((maxIndex.hourValue - hour) * 60)
    .toString()
    .padStart(2, "0");
  return hour.toString().padStart(2, "0") + ":" + minutes;
};

const HourLineChartComponent: React.FC<HourLineChartProps> = ({ items, minY = 0, maxY, annotations }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; x: number; y: number } | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [updateDimensions]);

  const chartData = useMemo(() => {
    const dataPoints = items.map((item) => ({
      x: GetHourAmPM(item),
      y: Math.max(0, item.count),
      raw: item,
    }));

    const values = dataPoints.map((p) => p.y);
    const computedMinY = minY;
    const computedMaxY = maxY !== undefined ? maxY : Math.max(...values, 1);

    return {
      points: dataPoints,
      minY: computedMinY,
      maxY: computedMaxY,
      range: computedMaxY - computedMinY,
    };
  }, [items, minY, maxY]);

  const padding = useMemo(
    () => ({
      top: 40,
      right: 0,
      bottom: 30,
      left: 40,
    }),
    [],
  );

  const chartWidth = dimensions.width - padding.left - padding.right;
  const chartHeight = dimensions.height - padding.top - padding.bottom;

  const getX = useCallback(
    (index: number) => {
      return round2(padding.left + (index / Math.max(chartData.points.length - 1, 1)) * chartWidth);
    },
    [padding.left, chartData.points.length, chartWidth],
  );

  const getY = useCallback(
    (value: number) => {
      const normalized = (value - chartData.minY) / (chartData.range || 1);
      return round2(padding.top + chartHeight - normalized * chartHeight);
    },
    [chartData.minY, chartData.range, padding.top, chartHeight],
  );

  const linePath = useMemo(() => {
    if (chartData.points.length === 0) return "";

    let path = `M ${getX(0)} ${getY(chartData.points[0].y)}`;

    for (let i = 1; i < chartData.points.length; i++) {
      const prevX = getX(i - 1);
      const prevY = getY(chartData.points[i - 1].y);
      const currX = getX(i);
      const currY = getY(chartData.points[i].y);

      const cpX1 = round2(prevX + (currX - prevX) / 3);
      const cpY1 = prevY;
      const cpX2 = round2(prevX + (2 * (currX - prevX)) / 3);
      const cpY2 = currY;

      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${currX} ${currY}`;
    }

    return path;
  }, [chartData.points, getX, getY]);

  const areaPath = useMemo(() => {
    if (!linePath) return "";
    const lastX = getX(chartData.points.length - 1);
    const bottomY = round2(padding.top + chartHeight);
    return `${linePath} L ${lastX} ${bottomY} L ${round2(padding.left)} ${bottomY} Z`;
  }, [linePath, chartData.points.length, getX, padding.top, padding.left, chartHeight]);

  const yTicks = useMemo(() => {
    const tickCount = 10;
    const ticks = [];
    for (let i = 0; i <= tickCount; i++) {
      const value = round2(chartData.minY + (chartData.range * i) / tickCount);
      ticks.push({
        value,
        y: getY(value),
        label: formatNumber(Math.round(value)),
      });
    }
    return ticks;
  }, [chartData.minY, chartData.range, getY]);

  const xTicks = useMemo(() => {
    const step = Math.ceil(chartData.points.length / 12);
    return chartData.points
      .filter((_, i) => i % step === 0)
      .map((point) => ({
        x: getX(chartData.points.indexOf(point)),
        label: point.x,
      }));
  }, [chartData.points, getX]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;

      let closestIndex = 0;
      let closestDistance = Infinity;

      chartData.points.forEach((_, index) => {
        const x = getX(index);
        const distance = Math.abs(mouseX - x);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      if (closestDistance < 30) {
        setHoveredPoint({
          index: closestIndex,
          x: getX(closestIndex),
          y: getY(chartData.points[closestIndex].y),
        });
      } else {
        setHoveredPoint(null);
      }
    },
    [chartData.points, getX, getY],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredPoint(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (chartData.points.length === 0) return;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev < chartData.points.length - 1 ? prev + 1 : prev;
            if (next !== prev) {
              setHoveredPoint({
                index: next,
                x: getX(next),
                y: getY(chartData.points[next].y),
              });
            }
            return next;
          });
          break;
        case "ArrowLeft":
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev > 0 ? prev - 1 : 0;
            if (next !== prev) {
              setHoveredPoint({
                index: next,
                x: getX(next),
                y: getY(chartData.points[next].y),
              });
            }
            return next;
          });
          break;
        case "Home":
          e.preventDefault();
          setFocusedIndex(0);
          setHoveredPoint({
            index: 0,
            x: getX(0),
            y: getY(chartData.points[0].y),
          });
          break;
        case "End":
          e.preventDefault();
          const lastIndex = chartData.points.length - 1;
          setFocusedIndex(lastIndex);
          setHoveredPoint({
            index: lastIndex,
            x: getX(lastIndex),
            y: getY(chartData.points[lastIndex].y),
          });
          break;
        case "Escape":
          e.preventDefault();
          setHoveredPoint(null);
          setFocusedIndex(-1);
          break;
      }
    },
    [chartData.points, getX, getY],
  );

  const renderedAnnotations = useMemo(() => {
    if (!annotations) return null;

    const elements: React.JSX.Element[] = [];

    // Y-axis annotations (horizontal lines)
    annotations.yaxis?.forEach((ann, idx) => {
      if (ann.y !== undefined) {
        const y = getY(ann.y);
        elements.push(
          <line
            key={`yaxis-${idx}`}
            x1={padding.left}
            y1={y}
            x2={padding.left + chartWidth}
            y2={y}
            stroke={ann.borderColor || "var(--color-light-red)"}
            strokeWidth={2}
            strokeDasharray={ann.strokeDashArray || 0}
            opacity={ann.opacity || 0.5}
          />,
        );

        if (ann.label?.text) {
          elements.push(
            <text
              key={`yaxis-label-${idx}`}
              x={round2(padding.left + 5)}
              y={round2(y - 5)}
              fill={ann.label.style?.color || "var(--text-h1)"}
              fontSize="11"
              fontWeight="600">
              {ann.label.text}
            </text>,
          );
        }
      }

      // Y-axis range (box)
      if (ann.y !== undefined && ann.y2 !== undefined) {
        const y1 = getY(ann.y);
        const y2 = getY(ann.y2);
        elements.push(
          <rect
            key={`yaxis-box-${idx}`}
            x={round2(padding.left)}
            y={round2(Math.min(y1, y2))}
            width={round2(chartWidth)}
            height={round2(Math.abs(y1 - y2))}
            fill={ann.fillColor || "var(--color-light-green30)"}
            opacity={ann.opacity || 0.2}
          />,
        );
      }
    });

    // X-axis annotations (vertical lines)
    annotations.xaxis?.forEach((ann, idx) => {
      if (ann.x) {
        const pointIndex = chartData.points.findIndex((p) => p.x === ann.x);
        if (pointIndex !== -1) {
          const x = getX(pointIndex);
          elements.push(
            <line
              key={`xaxis-${idx}`}
              x1={x}
              y1={round2(padding.top)}
              x2={x}
              y2={round2(padding.top + chartHeight)}
              stroke={ann.borderColor || "var(--color-light-blue)"}
              strokeWidth={2}
              strokeDasharray={ann.strokeDashArray || 0}
              opacity={ann.opacity || 0.5}
            />,
          );

          if (ann.label?.text) {
            elements.push(
              <text
                key={`xaxis-label-${idx}`}
                x={round2(x + 5)}
                y={round2(padding.top + 15)}
                fill={ann.label.style?.color || "var(--text-h1)"}
                fontSize="11"
                fontWeight="600">
                {ann.label.text}
              </text>,
            );
          }
        }
      }
    });

    // Point annotations
    annotations.points?.forEach((ann, idx) => {
      const pointIndex = chartData.points.findIndex((p) => p.x === ann.x);
      if (pointIndex !== -1) {
        const x = getX(pointIndex);
        const y = getY(ann.y);

        elements.push(
          <circle
            key={`point-${idx}`}
            cx={x}
            cy={y}
            r={ann.marker?.size || 6}
            fill={ann.marker?.fillColor || "var(--color-dark-blue)"}
            stroke={ann.marker?.strokeColor || "var(--color-white)"}
            strokeWidth={2}
          />,
        );

        if (ann.label?.text) {
          elements.push(
            <g key={`point-label-${idx}`}>
              <rect
                x={round2(x - 15)}
                y={round2(y - 35)}
                width={30}
                height={24}
                fill={ann.label.style?.background || "var(--color-white)"}
                rx={6}
                opacity={0.95}
                stroke={ann.marker?.fillColor || "var(--color-dark-blue)"}
                strokeWidth={1.5}
              />
              <text
                x={x}
                y={round2(y - 18)}
                fill={ann.label.style?.color || "var(--text-h1)"}
                fontSize="14"
                fontWeight="600"
                textAnchor="middle">
                {ann.label.text}
              </text>
            </g>,
          );
        }
      }
    });

    return <g className={styles.annotations}>{elements}</g>;
  }, [annotations, chartData.points, getX, getY, padding, chartWidth, chartHeight]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} translate`}
      role="figure"
      aria-label="نمودار خطی ساعتی"
      tabIndex={0}
      onKeyDown={handleKeyDown}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={styles.svg}
        role="img"
        aria-label={`نمودار خطی با ${chartData.points.length} نقطه داده`}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-light-green)" stopOpacity="0.3" />
            <stop offset="80%" stopColor="var(--color-light-yellow)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--color-light-red)" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-light-green)" />
            <stop offset="80%" stopColor="var(--color-light-yellow)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--color-light-red)" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <g className={styles.grid}>
          {yTicks.map((tick, i) => (
            <line
              key={`grid-y-${i}`}
              x1={padding.left}
              y1={tick.y}
              x2={padding.left + chartWidth}
              y2={tick.y}
              stroke="var(--color-gray30)"
              strokeWidth={1}
            />
          ))}
          {xTicks.map((tick, i) => (
            <line
              key={`grid-x-${i}`}
              x1={tick.x}
              y1={padding.top}
              x2={tick.x}
              y2={padding.top + chartHeight}
              stroke="var(--color-gray30)"
              strokeWidth={1}
            />
          ))}
        </g>

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGradient)" />

        {renderedAnnotations}

        {/* Line */}
        <path d={linePath} fill="none" stroke="url(#lineGradient)" strokeWidth={1.5} className={styles.line} />

        {/* Data points */}
        {chartData.points.map((point, i) => (
          <circle
            key={`point-${i}`}
            cx={getX(i)}
            cy={getY(point.y)}
            r={0}
            fill="var(--color-dark-blue)"
            className={styles.dataPoint}
          />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((tick, i) => (
          <text
            key={`y-label-${i}`}
            x={round2(padding.left - 10)}
            y={round2(tick.y + 4)}
            textAnchor="end"
            fontSize="10"
            fill="var(--text-h2)"
            fontWeight="400">
            {tick.label} %
          </text>
        ))}

        {/* X-axis labels */}
        {xTicks.map((tick, i) => (
          <text
            key={`x-label-${i}`}
            x={round2(tick.x - 10)}
            y={round2(padding.top + chartHeight + 30)}
            textAnchor="start"
            fontSize="10"
            fill="var(--text-h2)"
            fontWeight="400"
            transform={`rotate(-45 ${round2(tick.x - 10)} ${round2(padding.top + chartHeight + 30)})`}>
            {tick.label}
          </text>
        ))}

        {/* Hover indicator and tooltip */}
        {hoveredPoint && (
          <g>
            {/* Vertical line */}
            <line
              x1={hoveredPoint.x}
              y1={round2(padding.top)}
              x2={hoveredPoint.x}
              y2={round2(padding.top + chartHeight)}
              stroke="var(--color-dark-blue)"
              strokeWidth={1}
              strokeDasharray="3,3"
              opacity={0.5}
            />

            {/* Highlight point */}
            <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r={6} fill="var(--color-dark-blue)" opacity={0.8} />
            <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r={4} fill="var(--color-white)" />
          </g>
        )}
      </svg>

      {/* Tooltip */}
      {hoveredPoint && (
        <div
          className={styles.tooltip}
          style={{
            left: round2(hoveredPoint.x),
            top: round2(hoveredPoint.y - 60),
          }}>
          <div className="explain">{Math.round(chartData.points[hoveredPoint.index].y).toLocaleString()} %</div>
          <div className="title2">{chartData.points[hoveredPoint.index].x}</div>
        </div>
      )}
    </div>
  );
};

export const HourLineChart = React.memo(HourLineChartComponent);
export default HourLineChart;
