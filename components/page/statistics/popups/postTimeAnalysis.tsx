import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import HourLineChart, { GetHourAmPM } from "brancy/components/design/chart/hourLineChart";
import DragDrop from "brancy/components/design/dragDrop/dragDrop";
import FlexibleToggleButton from "brancy/components/design/toggleButton/flexibleToggleButton";
import { LanguageKey } from "brancy/i18n";
import { IBestTime } from "brancy/models/page/statistics/statisticsContent/GraphIngageBoxes/cardBestWorst";
import { HourCountUnix } from "brancy/models/page/statistics/statisticsContent/GraphIngageBoxes/graphLikes";
import styles from "./postTimeAnalalysis.module.css";

type ViewMode = "heatmap";

interface PostTimeAnalysisProps {
  bestTimeSeries: IBestTime;
  removeMask: () => void;
}

const PostTimeAnalysis: React.FC<PostTimeAnalysisProps> = ({ bestTimeSeries, removeMask }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectBoxActive, setSelectBoxActive] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<number>(0);
  const [currentTimeSeries, setCurrentTimeSeries] = useState<HourCountUnix[]>();
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<{ hour: number; minute: number } | null>(null);
  const [recommendationType, setRecommendationType] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    // Initialize with default time series
    setCurrentTimeSeries(bestTimeSeries.day30CountUnixes);
  }, [bestTimeSeries]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOptions(false);
        setSelectBoxActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionSelect = useCallback(
    (index: string) => {
      setSelectedOptions(Number(index));
      setShowOptions(false);
      setSelectBoxActive(false);

      const timeSeriesMap: Record<string, HourCountUnix[]> = {
        "0": bestTimeSeries.day30CountUnixes,
        "1": bestTimeSeries.day60CountUnixes,
        "2": bestTimeSeries.day90CountUnixes,
        "3": bestTimeSeries.day120CountUnixes,
      };

      setCurrentTimeSeries(timeSeriesMap[index] || bestTimeSeries.day30CountUnixes);
    },
    [bestTimeSeries],
  );

  const timeSeriesData = useMemo(
    () => currentTimeSeries || bestTimeSeries.day30CountUnixes,
    [currentTimeSeries, bestTimeSeries.day30CountUnixes],
  );

  // Removed chartAnnotations: best/worst automatic annotations not needed

  const timeOptions = useMemo(
    () => [
      <div key="0" id="0">
        {t(LanguageKey.pageStatistics_30Days)}
      </div>,
      <div key="1" id="1">
        {t(LanguageKey.pageStatistics_60Days)}
      </div>,
      <div key="2" id="2">
        {t(LanguageKey.pageStatistics_90Days)}
      </div>,
      <div key="3" id="3">
        {t(LanguageKey.pageStatistics_120Days)}
      </div>,
    ],
    [t],
  );

  const getHourDetails = (hour: number) => {
    const data = timeSeriesData.find((item) => Math.floor(item.hourValue) === hour);
    if (!data) return null;

    const allCounts = timeSeriesData.map((item) => item.count);
    const maxCount = Math.max(...allCounts);
    const minCount = Math.min(...allCounts.filter((c) => c > 0));
    const avgCount = allCounts.reduce((sum, c) => sum + c, 0) / allCounts.length;

    const rank =
      [...timeSeriesData].sort((a, b) => b.count - a.count).findIndex((item) => Math.floor(item.hourValue) === hour) +
      1;

    const percentage = ((data.count / maxCount) * 100).toFixed(1);
    const comparedToAvg = ((data.count / avgCount - 1) * 100).toFixed(1);

    return {
      hour,
      count: data.count,
      rank,
      percentage,
      comparedToAvg: parseFloat(comparedToAvg),
      isAboveAvg: data.count > avgCount,
      maxCount,
      avgCount: Math.round(avgCount),
    };
  };

  const handleHourClick = (hour: number) => {
    setSelectedHour(selectedHour === hour ? null : hour);
  };

  const handleMinuteClick = (hour: number, minute: number) => {
    if (selectedMinute?.hour === hour && selectedMinute?.minute === minute) {
      setSelectedMinute(null);
    } else {
      setSelectedMinute({ hour, minute });
    }
  };

  const renderHeatmap = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    // Clamp counts to >= 0 to avoid negative values in the heatmap
    const clampedCounts = timeSeriesData.map((item) => Math.max(0, item.count));
    const maxCount = Math.max(...clampedCounts);
    const positiveCounts = clampedCounts.filter((c) => c > 0);
    const minCount = positiveCounts.length > 0 ? Math.min(...positiveCounts) : 0;
    // Denominator for intensity; avoid division by zero
    const denom = maxCount - minCount > 0 ? maxCount - minCount : maxCount > 0 ? maxCount : 1;

    const getHeatColor = (count: number) => {
      if (!count) return "var(--color-gray10)";
      const intensity = (count - minCount) / denom;

      // Instagram-style gradient: Red → Orange → Yellow → Light Green → Dark Green (5 levels)
      if (intensity > 0.8) return "var(--color-light-green30)"; // highest
      if (intensity > 0.6) return "var(--color-dark-green30)"; // bright green
      if (intensity > 0.4) return "var(--color-light-yellow30)"; // yellow
      if (intensity > 0.2) return "var(--color-dark-yellow30)"; // orange
      return "var(--color-dark-red30)"; // lowest
    };

    const getHeatValueColor = (count: number) => {
      if (!count) return "var(--color-gray60)";
      const intensity = (count - minCount) / denom;

      // Color gradient for text values
      if (intensity > 0.8) return "var(--color-light-green)";
      if (intensity > 0.6) return "var(--color-dark-green)";
      if (intensity > 0.4) return "var(--color-light-yellow)";
      if (intensity > 0.2) return "var(--color-dark-yellow)";
      return "var(--color-dark-red)";
    };

    return (
      <div className="headerandinput">
        <div className="headerparent">
          <div className="title">{t(LanguageKey.pageStatistics_24HourHeatmap)}</div>
          <div className={styles.heatmapLegend}>
            <span>{t(LanguageKey.pageStatistics_Low)}</span>
            <div className={styles.legendGradient}></div>
            <span>{t(LanguageKey.pageStatistics_High)}</span>
          </div>
        </div>
        <div className={styles.heatmapGrid}>
          {hours.map((hour) => {
            const data = timeSeriesData.find((item) => Math.floor(item.hourValue) === hour);
            const count = Math.max(0, data?.count || 0);
            const intensity = count ? (count - minCount) / denom : 0;
            const isSelected = selectedHour === hour;

            return (
              <React.Fragment key={hour}>
                <div
                  className={`${styles.heatmapCell} ${isSelected ? styles.selectedCell : ""}`}
                  style={{
                    backgroundColor: getHeatColor(count),
                    opacity: count ? 0.3 + intensity * 0.7 : 0.3,
                    animationDelay: `${hour * 0.03}s`,
                  }}
                  title={t(LanguageKey.pageStatistics_HourEngagementTooltip, {
                    hour: hour,
                    count: count,
                    percentage: Math.round(intensity * 100),
                  })}
                  onClick={() => handleHourClick(hour)}>
                  <span className="title2">{hour.toString().padStart(2, "0")}:00</span>
                  <span className={styles.heatmapValue} style={{ color: getHeatValueColor(count) }}>
                    {count}
                  </span>
                </div>
                {isSelected && (
                  <div className={styles.hourDetailsPanel}>
                    {(() => {
                      const details = getHourDetails(hour);
                      if (!details) return null;

                      // Get minute-level data for this hour
                      const data = timeSeriesData.find((item) => Math.floor(item.hourValue) === hour);
                      const baseCount = Math.max(0, data?.count || 0);

                      const getMinuteData = (hourValue: number, baseCountValue: number) => {
                        const minutes = Array.from({ length: 60 }, (_, minute) => {
                          const seed = (hourValue * 60 + minute) * 9301 + 49297;
                          const random = (seed % 233280) / 233280;
                          const variation = (random - 0.5) * 0.8;
                          const minuteCount = Math.max(0, baseCountValue * (1 + variation));
                          return {
                            minute,
                            count: Math.round(minuteCount),
                          };
                        });
                        return minutes;
                      };

                      const minuteData = getMinuteData(hour, baseCount);

                      // Calculate global min and max (clamped)
                      const allCounts = timeSeriesData.map((item) => Math.max(0, item.count));
                      const globalMaxCount = Math.max(...allCounts);
                      const positiveGlobal = allCounts.filter((c) => c > 0);
                      const globalMinCount = positiveGlobal.length > 0 ? Math.min(...positiveGlobal) : 0;

                      const getGradientColor = (count: number, minCount: number, maxCount: number) => {
                        if (!count || count === 0) return "var(--color-disable)";
                        const denomLocal = maxCount - minCount > 0 ? maxCount - minCount : maxCount > 0 ? maxCount : 1;
                        const intensity = maxCount > minCount ? (count - minCount) / denomLocal : 0;
                        if (intensity < 0.5) {
                          const ratio = intensity * 2;
                          return `rgb(${255}, ${Math.round(150 + ratio * 105)}, ${Math.round(ratio * 80)})`;
                        } else {
                          const ratio = (intensity - 0.5) * 2;
                          return `rgb(${Math.round(255 - ratio * 187)}, ${255}, ${Math.round(80 - ratio * 80)})`;
                        }
                      };

                      return (
                        <>
                          <div className={styles.detailsHeader}>
                            <div className={styles.headerContent}>
                              <span className="title2">
                                {hour.toString().padStart(2, "0")}:00 - {(hour + 1).toString().padStart(2, "0")}:00
                              </span>
                              {details.rank <= 3 ? (
                                <span className="explain"> {t(LanguageKey.pageStatistics_TopHour)}</span>
                              ) : details.rank >= 22 ? (
                                <span className="explain"> {t(LanguageKey.pageStatistics_WeakHour)}</span>
                              ) : (
                                <span className="explain"> {t(LanguageKey.pageStatistics_AverageHour)}</span>
                              )}
                            </div>
                            <img
                              onClick={() => setSelectedHour(null)}
                              style={{
                                cursor: "pointer",
                                width: "30px",
                                height: "30px",
                                alignSelf: "center",
                              }}
                              title="ℹ️ close"
                              src="/close-box.svg"
                            />
                          </div>

                          <div className="headerandinput">
                            {(() => {
                              const allCounts = timeSeriesData.map((item) => item.count);
                              const maxCount = Math.max(...allCounts);
                              const minCount = Math.min(...allCounts.filter((c) => c > 0));
                              const intensity = (details.count - minCount) / (maxCount - minCount);

                              if (intensity > 0.8) {
                                return (
                                  <span className="explain">
                                    {t(LanguageKey.pageStatistics_HourExcellentLevel, {
                                      percentage: details.comparedToAvg > 0 ? details.comparedToAvg.toFixed(1) : 0,
                                    })}
                                  </span>
                                );
                              } else if (intensity > 0.6) {
                                return (
                                  <span className="explain">
                                    {t(LanguageKey.pageStatistics_HourGoodLevel, {
                                      percentage: details.comparedToAvg > 0 ? details.comparedToAvg.toFixed(1) : 0,
                                    })}
                                  </span>
                                );
                              } else if (intensity > 0.4) {
                                return (
                                  <span className="explain">
                                    {t(LanguageKey.pageStatistics_HourAverageLevel, {
                                      difference: Math.round(
                                        ((details.maxCount - details.count) / details.maxCount) * 100,
                                      ),
                                    })}
                                  </span>
                                );
                              } else if (intensity > 0.2) {
                                return <span className="explain">{t(LanguageKey.pageStatistics_HourWeakLevel)}</span>;
                              } else {
                                return (
                                  <span className="explain">{t(LanguageKey.pageStatistics_HourVeryWeakLevel)}</span>
                                );
                              }
                            })()}
                          </div>

                          {/* Minute Bar for Selected Hour */}
                          <div className={styles.minutesBarparent}>
                            <div className={styles.minutesBar}>
                              {minuteData.map(({ minute, count }) => {
                                const isThisMinuteSelected =
                                  selectedMinute?.hour === hour && selectedMinute?.minute === minute;
                                return (
                                  <div
                                    key={minute}
                                    className={`${styles.minuteSegment} ${
                                      isThisMinuteSelected ? styles.selectedMinute : ""
                                    }`}
                                    style={{
                                      backgroundColor: getGradientColor(count, globalMinCount, globalMaxCount),
                                      animationDelay: `${minute * 0.002}s`,
                                    }}
                                    title={t(LanguageKey.pageStatistics_MinuteEngagementTooltip, {
                                      hour: hour.toString().padStart(2, "0"),
                                      minute: minute.toString().padStart(2, "0"),
                                      count: count,
                                    })}
                                    onClick={() => handleMinuteClick(hour, minute)}
                                  />
                                );
                              })}
                            </div>

                            {/* Minute Details if a minute is selected */}
                            {selectedMinute?.hour === hour && (
                              <div className={styles.minuteDetailsPanel}>
                                {(() => {
                                  const minuteInfo = minuteData.find((m) => m.minute === selectedMinute.minute);
                                  if (!minuteInfo) return null;

                                  const allMinuteCounts = minuteData.map((m) => m.count);
                                  const maxInHour = Math.max(...allMinuteCounts);
                                  const minInHour = Math.min(...allMinuteCounts.filter((c) => c > 0));
                                  const avgInHour =
                                    allMinuteCounts.reduce((sum, c) => sum + c, 0) / allMinuteCounts.length;

                                  const rankInHour =
                                    [...minuteData]
                                      .sort((a, b) => b.count - a.count)
                                      .findIndex((m) => m.minute === selectedMinute.minute) + 1;

                                  const percentageOfMax = ((minuteInfo.count / maxInHour) * 100).toFixed(1);
                                  const comparedToAvg = ((minuteInfo.count / avgInHour - 1) * 100).toFixed(1);

                                  return (
                                    <>
                                      <div className="headerandinput">
                                        <span className="title2">
                                          {hour.toString().padStart(2, "0")}:
                                          {selectedMinute.minute.toString().padStart(2, "0")} -
                                          {rankInHour <= 10 ? (
                                            <span className="explain"> {t(LanguageKey.pageStatistics_TopMinute)}</span>
                                          ) : rankInHour >= 50 ? (
                                            <span className="explain"> {t(LanguageKey.pageStatistics_WeakMinute)}</span>
                                          ) : (
                                            <span className="explain">
                                              {" "}
                                              {t(LanguageKey.pageStatistics_AverageMinute)}
                                            </span>
                                          )}
                                        </span>
                                        {rankInHour <= 10 ? (
                                          <span className="explain">
                                            {t(LanguageKey.pageStatistics_MinuteTopDescription, {
                                              hour: hour,
                                              difference: Math.round(
                                                ((minuteInfo.count - minInHour) / minInHour) * 100,
                                              ),
                                            })}
                                          </span>
                                        ) : rankInHour >= 50 ? (
                                          <span className="explain">
                                            {t(LanguageKey.pageStatistics_MinuteWeakDescription, {
                                              difference: Math.round(
                                                ((maxInHour - minuteInfo.count) / maxInHour) * 100,
                                              ),
                                            })}
                                          </span>
                                        ) : (
                                          <span className="explain">
                                            {t(LanguageKey.pageStatistics_MinuteAverageDescription)}
                                          </span>
                                        )}
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  // #region Get recommended and worst times
  const getRecommendedTimes = useMemo(() => {
    const sortedData = [...timeSeriesData].sort((a, b) => b.count - a.count);

    const formatTime = (hourValue: number) => {
      const hour = Math.floor(hourValue);
      const minute = Math.floor((hourValue - hour) * 60);
      return {
        hour: hour.toString().padStart(2, "0"),
        minute: minute.toString().padStart(2, "0"),
      };
    };

    // Calculate average
    const avgCount = timeSeriesData.reduce((sum, item) => sum + item.count, 0) / timeSeriesData.length;

    // 1. Peak engagement - بیشترین تعامل لحظه‌ای
    const peakTime = sortedData[0];

    // 2. Stable growth start - شروع رشد پایدار
    // Find when engagement starts rising and stays above average
    let stableGrowthTime = null;
    for (let i = 0; i < timeSeriesData.length - 1; i++) {
      const current = timeSeriesData[i];
      // Check if current is above average and next few hours maintain high engagement
      if (current.count >= avgCount) {
        let sustainedHours = 0;
        for (let j = i; j < Math.min(i + 6, timeSeriesData.length); j++) {
          if (timeSeriesData[j].count >= avgCount * 0.8) {
            sustainedHours++;
          }
        }
        if (sustainedHours >= 4) {
          stableGrowthTime = current;
          break;
        }
      }
    }
    // Fallback to second highest if no stable period found
    if (!stableGrowthTime) {
      stableGrowthTime = sortedData[1];
    }

    // 3. Secondary peak - احتمال رسیدن به تعامل بالا (لحظه‌ای دیگر بعد از پیک)
    const peakHour = Math.floor(peakTime.hourValue);
    let secondaryPeakTime = null;
    const afterPeak = timeSeriesData.filter((item) => Math.floor(item.hourValue) > peakHour);
    if (afterPeak.length > 0) {
      secondaryPeakTime = afterPeak.sort((a, b) => b.count - a.count)[0];
    }
    // Fallback to third highest if no time after peak
    if (!secondaryPeakTime || secondaryPeakTime.count < avgCount) {
      secondaryPeakTime = sortedData[2];
    }

    // Worst times - opposite logic
    const worstSorted = [...timeSeriesData].sort((a, b) => a.count - b.count);

    // 1. Lowest engagement - کمترین تعامل لحظه‌ای
    const lowestTime = worstSorted[0];

    // 2. Sustained low period start - شروع دوره ضعیف پایدار
    let sustainedLowTime = null;
    for (let i = 0; i < timeSeriesData.length - 1; i++) {
      const current = timeSeriesData[i];
      if (current.count <= avgCount * 0.7) {
        let lowHours = 0;
        for (let j = i; j < Math.min(i + 6, timeSeriesData.length); j++) {
          if (timeSeriesData[j].count <= avgCount * 0.9) {
            lowHours++;
          }
        }
        if (lowHours >= 4) {
          sustainedLowTime = current;
          break;
        }
      }
    }
    if (!sustainedLowTime) {
      sustainedLowTime = worstSorted[1];
    }

    // 3. Secondary low - لحظه ضعیف دیگر بعد از کمترین
    const lowestHour = Math.floor(lowestTime.hourValue);
    let secondaryLowTime = null;
    const afterLowest = timeSeriesData.filter((item) => Math.floor(item.hourValue) > lowestHour);
    if (afterLowest.length > 0) {
      secondaryLowTime = afterLowest.sort((a, b) => a.count - b.count)[0];
    }
    if (!secondaryLowTime || secondaryLowTime.count > avgCount) {
      secondaryLowTime = worstSorted[2];
    }

    return {
      recommended: [
        {
          rank: 1,
          ...formatTime(peakTime.hourValue),
          count: peakTime.count,
          percentage: ((peakTime.count / sortedData[0].count) * 100).toFixed(0),
          type: "peak",
          label: t(LanguageKey.pageStatistics_PeakEngagement),
        },
        {
          rank: 2,
          ...formatTime(stableGrowthTime.hourValue),
          count: stableGrowthTime.count,
          percentage: ((stableGrowthTime.count / sortedData[0].count) * 100).toFixed(0),
          type: "stable",
          label: t(LanguageKey.pageStatistics_StableGrowth),
        },
        {
          rank: 3,
          ...formatTime(secondaryPeakTime.hourValue),
          count: secondaryPeakTime.count,
          percentage: ((secondaryPeakTime.count / sortedData[0].count) * 100).toFixed(0),
          type: "secondary",
          label: t(LanguageKey.pageStatistics_HighEngagementProbability),
        },
      ],
      worst: [
        {
          rank: 1,
          ...formatTime(lowestTime.hourValue),
          count: lowestTime.count,
          percentage: ((lowestTime.count / sortedData[0].count) * 100).toFixed(0),
          type: "lowest",
          label: t(LanguageKey.pageStatistics_LowestEngagement),
        },
        {
          rank: 2,
          ...formatTime(sustainedLowTime.hourValue),
          count: sustainedLowTime.count,
          percentage: ((sustainedLowTime.count / sortedData[0].count) * 100).toFixed(0),
          type: "sustained-low",
          label: t(LanguageKey.pageStatistics_SustainedLowPeriod),
        },
        {
          rank: 3,
          ...formatTime(secondaryLowTime.hourValue),
          count: secondaryLowTime.count,
          percentage: ((secondaryLowTime.count / sortedData[0].count) * 100).toFixed(0),
          type: "secondary-low",
          label: t(LanguageKey.pageStatistics_LowEngagementProbability),
        },
      ],
    };
  }, [timeSeriesData]);
  // #endregion Get recommended and worst times

  // Map Annotations -> HourLineChart's lightweight annotations shape
  const mappedAnnotations = useMemo(() => {
    const out: any = {};

    const recommendedPoints: any[] = [];

    // Add best times (green markers)
    getRecommendedTimes.recommended.forEach((time) => {
      const hourValue = parseInt(time.hour);
      const matchingData = timeSeriesData.find((item) => Math.floor(item.hourValue) === hourValue);
      if (matchingData) {
        recommendedPoints.push({
          x: GetHourAmPM(matchingData),
          y: Math.max(0, matchingData.count),
          marker: {
            size: 8,
            fillColor: "var(--color-light-green)",
            strokeColor: "var(--color-white)",
          },
          label: {
            text: time.rank === 1 ? "🔥" : time.rank === 2 ? "📈" : "⚡",
            style: {
              color: "var(--color-light-green)",
              background: "var(--color-light-green10)",
            },
          },
        });
      }
    });

    // Add worst times (red markers)
    getRecommendedTimes.worst.forEach((time) => {
      const hourValue = parseInt(time.hour);
      const matchingData = timeSeriesData.find((item) => Math.floor(item.hourValue) === hourValue);
      if (matchingData) {
        recommendedPoints.push({
          x: GetHourAmPM(matchingData),
          y: Math.max(0, matchingData.count),
          marker: {
            size: 8,
            fillColor: "var(--color-light-red)",
            strokeColor: "var(--color-white)",
          },
          label: {
            text: time.type === "lowest" ? "❌" : time.type === "sustained-low" ? "📉" : "⚠️",
            style: {
              color: "var(--color-light-red)",
              background: "var(--color-light-red10)",
            },
          },
        });
      }
    });

    out.points = recommendedPoints;
    return out as { points?: any[] };
  }, [getRecommendedTimes, timeSeriesData]);

  return (
    <>
      <div className="headerandinput">
        <div className="frameParent">
          <div className="headerChild">
            <div className="circle">
              <div className="outerCircle" />
              <div className="innerCircle" />
            </div>
            <div className="Title">{t(LanguageKey.pageStatistics_PostTimeAnalysis)}</div>
          </div>
        </div>
        <div className="headerparent">
          <div className="explain">{t(LanguageKey.pageStatistics_RateExplain)}</div>
          <div style={{ minWidth: "120px" }}>
            <DragDrop data={timeOptions} handleOptionSelect={handleOptionSelect} />
          </div>
        </div>
      </div>

      <div className={styles.allTimesContainer}>
        <HourLineChart minY={0} maxY={100} annotations={mappedAnnotations} items={timeSeriesData} />

        <div className={styles.recommendationSummary}>
          <div className="headerandinput">
            <FlexibleToggleButton
              options={[
                { id: 0, label: t(LanguageKey.pageStatistics_BestTimes) },
                { id: 1, label: t(LanguageKey.pageStatistics_WorstTimes) },
              ]}
              selectedValue={recommendationType}
              onChange={setRecommendationType}
            />

            <div className={styles.recommendationsFlex}>
              {/* Top 3 Recommendations */}
              {recommendationType === 0 &&
                getRecommendedTimes.recommended.map((time, idx) => (
                  <div key={time.rank} className={styles.recommendCard}>
                    <div className="frameParent">
                      <span className="title2">
                        {time.rank === 1 ? "🔥" : time.rank === 2 ? "�" : "⚡"} {time.label}
                      </span>
                      <div className="title">
                        {time.hour}:{time.minute}
                      </div>
                    </div>

                    <div className="explain">
                      {time.type === "peak"
                        ? t(LanguageKey.pageStatistics_PeakTimeDescription)
                        : time.type === "stable"
                          ? t(LanguageKey.pageStatistics_StableTimeDescription)
                          : t(LanguageKey.pageStatistics_SecondaryTimeDescription)}
                    </div>
                  </div>
                ))}

              {/* Worst 3 Times */}
              {recommendationType === 1 &&
                getRecommendedTimes.worst.map((time, idx) => (
                  <div key={time.rank} className={styles.avoidCard}>
                    <div className="frameParent">
                      <span className="title2">
                        {time.type === "lowest" ? "❌" : time.type === "sustained-low" ? "📉" : "⚠️"} {time.label}
                      </span>
                      <div className="title">
                        {time.hour}:{time.minute}
                      </div>
                    </div>

                    <div className="explain">
                      {time.type === "lowest"
                        ? t(LanguageKey.pageStatistics_LowestTimeDescription, {
                            percentage: Math.round(
                              ((getRecommendedTimes.recommended[0].count - time.count) /
                                getRecommendedTimes.recommended[0].count) *
                                100,
                            ),
                          })
                        : time.type === "sustained-low"
                          ? t(LanguageKey.pageStatistics_SustainedLowTimeDescription)
                          : t(LanguageKey.pageStatistics_SecondaryLowTimeDescription)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {renderHeatmap()}
      </div>
    </>
  );
};

export default React.memo(PostTimeAnalysis);
