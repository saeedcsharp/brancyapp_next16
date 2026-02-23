import { useMemo, useRef, useState } from "react";
import styles from "brancy/components/design/chart/radarChart.module.css";

export interface IPlatformData {
  name: string;
  color: string;
  data: number[];
}

export interface IRadarChartProps {
  chartId: string;
  categories: string[];
  platformsData: IPlatformData[];
  height?: string;
  showLegend?: boolean;
}

export const RadarChart = (props: IRadarChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { categories, platformsData, showLegend = true } = props;
  const [visiblePlatforms, setVisiblePlatforms] = useState<Set<number>>(new Set(platformsData.map((_, idx) => idx)));

  const togglePlatform = (index: number) => {
    setVisiblePlatforms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // محاسبه حداکثر مقدار برای نرمال‌سازی
  const maxValue = useMemo(() => {
    if (!platformsData || platformsData.length === 0) return 1;
    const allValues = platformsData.flatMap((p) => p.data);
    return Math.max(...allValues, 1);
  }, [platformsData]);

  // تبدیل مقدار به مختصات قطبی
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // تولید path برای یک پلتفرم
  const generatePath = (data: number[], maxRadius: number, centerX: number, centerY: number) => {
    const angleStep = 360 / data.length;
    const points = data.map((value, index) => {
      const normalizedValue = (value / maxValue) * maxRadius;
      const angle = angleStep * index;
      return polarToCartesian(centerX, centerY, normalizedValue, angle);
    });

    const pathData = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
    return pathData + " Z";
  };

  const centerX = 200;
  const centerY = 200;
  const maxRadius = 150;
  const gridLevels = 5;

  return (
    <>
      <svg ref={svgRef} viewBox="0 0 400 400" className={styles.svg}>
        {/* Grid circles */}
        {Array.from({ length: gridLevels }).map((_, i) => {
          const radius = (maxRadius / gridLevels) * (i + 1);
          return <circle key={`grid-${i}`} className={styles.gridCircle} cx={centerX} cy={centerY} r={radius} />;
        })}

        {/* Axis lines */}
        {categories.map((_, index) => {
          const angle = (360 / categories.length) * index;
          const point = polarToCartesian(centerX, centerY, maxRadius, angle);
          return (
            <line
              key={`axis-${index}`}
              className={styles.axisLine}
              x1={centerX}
              y1={centerY}
              x2={point.x}
              y2={point.y}
            />
          );
        })}

        {/* Data polygons */}
        {platformsData.map(
          (platform, idx) =>
            visiblePlatforms.has(idx) && (
              <g key={`platform-${idx}`}>
                {/* Fill area */}
                <path
                  className={styles.dataPath}
                  d={generatePath(platform.data, maxRadius, centerX, centerY)}
                  fill={platform.color}
                  stroke={platform.color}
                />
                {/* Data points */}
                {platform.data.map((value, i) => {
                  const normalizedValue = (value / maxValue) * maxRadius;
                  const angle = (360 / platform.data.length) * i;
                  const point = polarToCartesian(centerX, centerY, normalizedValue, angle);
                  return (
                    <circle
                      key={`point-${idx}-${i}`}
                      className={styles.dataPoint}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill={platform.color}>
                      {/* <title>
                    {platform.name} - {categories[i]}: {value.toLocaleString()}
                  </title> */}
                    </circle>
                  );
                })}
              </g>
            )
        )}

        {/* Category labels */}
        {categories.map((category, index) => {
          const angle = (360 / categories.length) * index;
          const labelRadius = maxRadius + 30;
          const point = polarToCartesian(centerX, centerY, labelRadius, angle);

          // محاسبه مجموع مقادیر برای این دسته از پلتفرم‌های نمایش داده شده
          const totalValue = platformsData.reduce((sum, platform, idx) => {
            return visiblePlatforms.has(idx) ? sum + platform.data[index] : sum;
          }, 0);

          return (
            <g key={`label-${index}`} className={styles.categoryGroup}>
              {/* عنوان دسته */}
              <text className={styles.categoryLabel} x={point.x} y={point.y - 10}>
                {category}
              </text>
              {/* مقدار کل */}
              <text className={styles.valueLabel} x={point.x} y={point.y + 10}>
                {totalValue.toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* Legend */}
      </svg>

      {showLegend && (
        <div className={styles.legend}>
          {platformsData.map((platform, idx) => (
            <div
              key={`legend-${idx}`}
              className={styles.legendItem}
              onClick={() => togglePlatform(idx)}
              style={{
                cursor: "pointer",
                opacity: visiblePlatforms.has(idx) ? 1 : 0.5,
              }}>
              <div className={styles.legendCircle} style={{ backgroundColor: platform.color }} />
              <span className={styles.legendText}>{platform.name}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default RadarChart;
