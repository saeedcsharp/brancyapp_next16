import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Loading from "saeed/components/notOk/loading";
import { GetTimeZoneOffset } from "saeed/helper/formatTimeAgo";
import { LoginStatus, RoleAccess } from "saeed/helper/loadingStatus";
import { LanguageKey } from "saeed/i18n";
import { GetServerResult, MethodType } from "saeed/models/IResult";
import { PartnerRole } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { IBestTime } from "saeed/models/page/statistics/statisticsContent/GraphIngageBoxes/cardBestWorst";
import { HourCountUnix } from "saeed/models/page/statistics/statisticsContent/GraphIngageBoxes/graphLikes";
import styles from "./cardBestWorst.module.css";
const formatTime = (hourValue: number): string => {
  let hour = Math.floor(hourValue);
  let minutes = Math.floor((hourValue - hour) * 60).toString();
  if (minutes.length < 2) minutes = minutes + "0";
  let suffix = "AM";
  if (hour >= 12) {
    suffix = "PM";
    if (hour > 12) hour -= 12;
  } else if (hour === 0) {
    hour = 12;
  }
  return `${hour}:${minutes} ${suffix}`;
};
const getBestOrWorstTime = (times: HourCountUnix[] | undefined, type: "best" | "worst"): string => {
  if (!times || times.length === 0) return "--";
  let target = times[0];
  for (let i = 1; i < times.length; i++) {
    const condition = type === "best" ? times[i].count > target.count : times[i].count < target.count;
    if (condition) target = times[i];
  }
  return formatTime(target.hourValue);
};
const sortHourCount = (hours: HourCountUnix[]) => {
  if (hours) {
    hours.sort((x, y) => x.relationHour - y.relationHour);
  }
};
const CardBestWorst = (props: {
  handleShowPopups: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  setCardBestTime: (bestTime: IBestTime) => void;
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [bestTimeSeries, setBestTimeSeries] = useState<IBestTime>();
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [activeDays, setActiveDays] = useState(90);
  const isFetchingRef = useRef(false);
  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  useEffect(() => {
    if (session && !LoginStatus(session)) {
      router.push("/");
    }
  }, [session, router]);
  useEffect(() => {
    if (!isDataLoaded && !isFetchingRef.current) {
      if (isMountedRef.current && !loadingStatus) {
      }
    }
  }, [isDataLoaded, loadingStatus]);
  const getTimeAnalysis = useCallback(async () => {
    if (!session || !LoginStatus(session) || !RoleAccess(session, PartnerRole.PageView)) return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const res = await GetServerResult<boolean, IBestTime>(
        MethodType.get,
        session,
        "Instagramer/Statistics/GetTimeAnalysis",
        null
      );
      if (!isMountedRef.current) return;
      if (res.succeeded) {
        setLoadingStatus(false);
        const timeAnalysis = res.value;
        const timezoneOffset = GetTimeZoneOffset() / 3600;
        const adjustAndSort = (timeData: HourCountUnix[]) => {
          if (!timeData || !Array.isArray(timeData)) return;
          for (let i = 0; i < timeData.length; i++) {
            timeData[i].hourValue += timezoneOffset;
            timeData[i].relationHour += timezoneOffset;
            if (timeData[i].hourValue > 24) timeData[i].hourValue -= 24;
            if (timeData[i].relationHour > 24) timeData[i].relationHour -= 24;
          }
          sortHourCount(timeData);
        };
        adjustAndSort(timeAnalysis.day30CountUnixes);
        adjustAndSort(timeAnalysis.day60CountUnixes);
        adjustAndSort(timeAnalysis.day90CountUnixes);
        adjustAndSort(timeAnalysis.day120CountUnixes);
        setBestTimeSeries(timeAnalysis);
        props.setCardBestTime(timeAnalysis);
        setIsDataLoaded(true);
      }
    } catch (error) {
    } finally {
      if (isMountedRef.current) {
        isFetchingRef.current = false;
      }
    }
  }, [session, props]);
  useEffect(() => {
    if (session && LoginStatus(session) && RoleAccess(session, PartnerRole.PageView) && !isDataLoaded) {
      getTimeAnalysis();
    }
  }, [session, getTimeAnalysis, isDataLoaded]);
  const { bestTime, worstTime } = useMemo(() => {
    let currentData: HourCountUnix[] = [];
    switch (activeDays) {
      case 30:
        currentData = bestTimeSeries?.day30CountUnixes ?? [];
        break;
      case 60:
        currentData = bestTimeSeries?.day60CountUnixes ?? [];
        break;
      case 90:
        currentData = bestTimeSeries?.day90CountUnixes ?? [];
        break;
      case 120:
        currentData = bestTimeSeries?.day120CountUnixes ?? [];
        break;
      default:
        currentData = bestTimeSeries?.day90CountUnixes ?? [];
    }
    return {
      bestTime: getBestOrWorstTime(currentData, "best"),
      worstTime: getBestOrWorstTime(currentData, "worst"),
    };
  }, [activeDays, bestTimeSeries]);
  const timePeriods = useMemo(
    () => [
      { days: 30, id: "thirdyDays", title: "Best & worst time in last 30 days" },
      { days: 60, id: "sixtyDays", title: "Best & worst time in last 60 days" },
      { days: 90, id: "nintyDays", title: "Best & worst time in last 90 days" },
      { days: 120, id: "oneTwoODays", title: "Best & worst time in last 120 days" },
    ],
    []
  );
  const handleKeyDown = (e: React.KeyboardEvent, days: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveDays(days);
    }
  };
  return (
    <section className={styles.all} aria-label="Best and worst posting times">
      {loadingStatus ? (
        <Loading />
      ) : (
        <>
          <div className="headerandinput">
            <div className="frameParent">
              <div className="headerChild">
                <div
                  className="circle"
                  style={{ backgroundColor: "var(--color-white)", boxShadow: "0 0 0 4px var(--color-white30)" }}>
                  <div className="outerCircle" />
                  <div className="innerCircle" />
                </div>
                <h2 className="Title" style={{ color: "var(--color-white)", margin: 0, fontSize: "inherit" }}>
                  {t(LanguageKey.pageStatistics_PostTimeAnalysis)}
                </h2>
              </div>
              <button
                className={styles.settingContainer}
                onClick={props.handleShowPopups}
                title="Best and Worst time in Graph"
                aria-label="Show best and worst time graph"
                type="button"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <svg className="twoDotIcon" fill="none" viewBox="0 0 14 5" width="14" height="5">
                  <path
                    fill="var(--color-white)"
                    d="M2.5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m9 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="headerparent" role="tablist" aria-label="Time period selection">
            {timePeriods.map((period) => (
              <button
                key={period.id}
                title={period.title}
                className={`${styles.dayBox} ${activeDays === period.days ? styles.activeDay : ""}`}
                onClick={() => setActiveDays(period.days)}
                onKeyDown={(e) => handleKeyDown(e, period.days)}
                role="tab"
                aria-selected={activeDays === period.days}
                aria-label={`Last ${period.days} days`}
                tabIndex={0}
                type="button">
                {activeDays === period.days
                  ? t(LanguageKey[`pageStatistics_${period.days}Days` as keyof typeof LanguageKey])
                  : period.days.toString()}
              </button>
            ))}
          </div>
          <div className="headerparent" role="tabpanel" aria-label="Selected time period data">
            <div
              className="headerparent"
              style={{ justifyContent: "center" }}
              role="group"
              aria-label="Best posting time">
              <span className={styles.title}>{t(LanguageKey.pageStatistics_BestTime)}</span>
              <span className={styles.time} aria-live="polite">
                {bestTime}
              </span>
            </div>
            <div
              className="headerparent"
              style={{ justifyContent: "center" }}
              role="group"
              aria-label="Worst posting time">
              <span className={styles.title}>{t(LanguageKey.pageStatistics_WorstTime)}</span>
              <span className={styles.time} aria-live="polite">
                {worstTime}
              </span>
            </div>
          </div>
        </>
      )}
    </section>
  );
};
export default CardBestWorst;
