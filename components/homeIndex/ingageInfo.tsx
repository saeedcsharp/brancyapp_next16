import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import formatTimeAgo from "brancy/helper/formatTimeAgo";
import { numberToFormattedString } from "brancy/helper/numberFormater";
import { LanguageKey } from "brancy/i18n";
import Loading from "brancy/components/notOk/loading";
import styles from "./ingageInfo.module.css";
import { PsgFeatureType, TopTileType } from "brancy/models/enums";
import { IInstagramerHomeTiles, IPageSummary, IStoryContent } from "brancy/models/interfaces";
import { getTotalFeatureCount } from "brancy/helper/checkFeature";
import Tooltip from "../design/tooltip/tooltip";
const basePictureUrl = getClientMediaBaseUrl();
const FIRST_LOGIN_DURATION_MS = 24 * 60 * 60 * 1000;
const SUBSCRIPTION_WARNING_SECONDS = 7 * 24 * 60 * 60;
type StatusIconType = "shopper" | "influencer" | "sync" | "warning";
type StatusType = StatusIconType | "upgrade";
type StatusItem = {
  key: string;
  type: StatusType;
  priority: number;
  condition: boolean;
  content: ReactNode;
};
const StatusIcon = ({ type }: { type: StatusIconType }) => {
  if (type === "shopper") {
    return (
      <svg className={styles.upgradeicon} fill="none" viewBox="0 0 42 42" aria-hidden="true">
        <path
          d="M3.5 38c3 3.3 10.1 3.4 17.3 3.5 7-.1 14.2-.2 17.2-3.5 3.3-3 3.4-10.1 3.5-17.2-.1-7.2-.2-14.3-3.5-17.3C35 .2 28 .1 20.8 0 13.6.1 6.5.2 3.5 3.5.2 6.5.1 13.6 0 20.8.1 27.8.2 35 3.5 38"
          fill="var(--color-light-green60)"
        />
        <path
          d="M25.2 9.3a6 6 0 0 1 6 5.4l1.1 10.5v.3a6.4 6.4 0 0 1-6.4 6.7H15.6a6.4 6.4 0 0 1-6.4-7l1.1-10.5a6 6 0 0 1 6-5.4zM16.3 12c-1.6 0-3 1.2-3.2 2.9L12 25.5c-.2 2.1 1.4 4 3.6 4h10.3c2.1 0 3.7-1.8 3.6-3.8v-.2l-1-10.5a3 3 0 0 0-3.3-3z M15.9 15.9a1.4 1.4 0 1 1 2.8 0 2.1 2.1 0 1 0 4.2 0 1.4 1.4 0 0 1 2.8 0 4.9 4.9 0 0 1-9.8 0"
          fill="var(--color-light-green)"
        />
      </svg>
    );
  }
  if (type === "influencer") {
    return (
      <svg className={styles.upgradeicon} fill="none" viewBox="0 0 42 42" aria-hidden="true">
        <path
          d="M14.3.5h12.9q2.1 0 3.7 1.5l9 9.1q1.5 1.6 1.6 3.7v12.9q0 2.1-1.5 3.7l-9.1 9Q29.3 42 27.2 42H14.3q-2.2 0-3.7-1.5l-9-9.1Q0 29.8 0 27.7V14.8q0-2.1 1.5-3.7l9.1-9Q12.1.5 14.3.4"
          fill="var(--color-purple60)"
        />
        <path
          d="m32.7 25-3.1-1.5c-.8-.4-1.8 0-2.1.7s-.1 1.7.6 2l3.2 1.6c.7.4 1.7 0 2-.7q.6-1.4-.6-2m-9.3-11.9q-1-.4-2 .1s-2 1.5-4.3 1.5h-3.7a5.4 5.4 0 0 0-1.8 10.5v2.1a1.8 1.8 0 0 0 3.6 0v-1.8h1.9c2.2 0 4.4 1.5 4.4 1.5q1 .6 1.9.1 1-.5 1-1.6V14.8q0-1-1-1.6m-2 10q-1.9-.9-4.2-1H13a2 2 0 0 1-2-2q.2-1.8 2-2h4.2q2.3 0 4.2-.9zm7.4-1.4H32q1.3-.1 1.5-1.6-.2-1.4-1.5-1.5h-3.2q-1.4.1-1.5 1.5.1 1.5 1.5 1.6m.7-4.8 3.2-1.6q1.1-.8.7-2-.8-1.3-2.2-.8l-3 1.6q-1.3.8-.8 2c.4.8 1.4 1.1 2.1.7"
          fill="var(--color-purple)"
        />
      </svg>
    );
  }
  if (type === "sync") {
    return (
      <svg
        stroke="var(--color-light-blue)"
        fill="none"
        className={styles.syncicon}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 22">
        <path d="M4.05 11.9a7.98 7.98 0 0 1 9.92-8.65 8 8 0 0 1 4.27 2.73m1.72 4.14q.04.45.04.88a7.98 7.98 0 0 1-10.18 7.7 8 8 0 0 1-4.05-2.67m9.8-9.47h.89c1.24 0 1.88 0 2.27-.39s.4-1.02.4-2.27V3M8.45 15.44h-.89c-1.26 0-1.89 0-2.28.4-.4.39-.38 1.02-.38 2.27V19" />
      </svg>
    );
  }
  if (type === "warning") {
    return (
      <svg
        className={styles.upgradeicon}
        fill="none"
        stroke="var(--color-dark-red)"
        viewBox="0 0 24 24"
        aria-hidden="true">
        <path d="M13.92 21h-3.84c-4.64 0-6.95 0-7.8-1.5-.86-1.51.33-3.5 2.7-7.5L6.9 8.75C9.18 4.92 10.31 3 12 3s2.82 1.92 5.1 5.75L19.02 12c2.37 4 3.56 5.99 2.7 7.5s-3.16 1.5-7.8 1.5M12 9v4" />
        <path d="M12.13 16.75H12m.25 0a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0" />
      </svg>
    );
  }
};
const IngageInfo = (props: {
  data: IInstagramerHomeTiles | null;
  collaboratePostNumber: number;
  activeStories: IStoryContent[] | [];
  onSummaryClick: () => void;
  onUpgradeClick: () => void;
  pageSummary: IPageSummary | null;
}) => {
  const { t, i18n } = useTranslation();
  const { data: session } = useSession();
  const loadingStatus = props.data === null;
  const [currentTime, setCurrentTime] = useState(0);
  const [firstLoginAt, setFirstLoginAt] = useState<number | null>(null);
  const [activeStatusIndex, setActiveStatusIndex] = useState(0);
  const [aiFeatureCount, setAiFeatureCount] = useState<number | null>(null);

  useEffect(() => {
    if (!session) return;
    getTotalFeatureCount(session, PsgFeatureType.AI).then(setAiFeatureCount);
  }, [session]);
  useEffect(() => {
    if (!session || session?.user.createdTime === null) return;
    if (typeof window === "undefined") return;
    console.log("loginTime", session?.user.createdTime);
    const loginTime = session?.user.createdTime ? session.user.createdTime * 1000 : Date.now();
    setFirstLoginAt(loginTime);
    setCurrentTime(Date.now());
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [session]);
  const firstLoginRemaining = firstLoginAt ? Math.max(0, FIRST_LOGIN_DURATION_MS - (currentTime - firstLoginAt)) : 0;
  const firstLoginProgress = (firstLoginRemaining / FIRST_LOGIN_DURATION_MS) * 100;
  const syncSeconds = Math.ceil(firstLoginRemaining / 1000);
  const syncHours = Math.floor(syncSeconds / 3600);
  const syncMinutes = Math.floor((syncSeconds % 3600) / 60);
  const syncRemainingSeconds = syncSeconds % 60;
  const packageRemainingSeconds = (session?.user.packageExpireTime ?? 0) - Math.floor(currentTime / 1000);
  const subscriptionRemainingDays = Math.max(0, Math.ceil(packageRemainingSeconds / (24 * 60 * 60)));
  const statusMap: StatusItem[] = [
    {
      key: "firstLogin",
      type: "sync",
      priority: 1,
      condition: firstLoginRemaining > 0,
      content: (
        <>
          <div className={styles.headerandinput} style={{ gap: "1px" }}>
            <div className={styles.title2}>
              {" "}
              {t(LanguageKey.syncingAccountTitle)}{" "}
              <Tooltip
                triggerType="tooltip"
                tooltipValue={t(LanguageKey.syncingAccountDescriptiontooltip)}
                position="bottom"
                onClick></Tooltip>{" "}
            </div>
            <div className={styles.explain}>{t(LanguageKey.syncingAccountDescription)}</div>
            <div
              className={styles.progressbar}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(firstLoginProgress)}>
              <div className={styles.progressvalue} style={{ width: `${firstLoginProgress}%` }} />
            </div>
            <div className={styles.countdown}>
              {syncHours.toString().padStart(2, "0")}:{syncMinutes.toString().padStart(2, "0")}:
              {syncRemainingSeconds.toString().padStart(2, "0")}
            </div>
          </div>
          <StatusIcon type="sync" />
        </>
      ),
    },
    {
      key: "subscriptionExpiring",
      type: "warning",
      priority: 2,
      condition: packageRemainingSeconds > 0 && packageRemainingSeconds < SUBSCRIPTION_WARNING_SECONDS,
      content: (
        <>
          <div className={styles.headerandinput} style={{ gap: "1px" }}>
            <div className={styles.title2}>{t(LanguageKey.subscriptionExpiringTitle)}</div>
            <div className={styles.explain}>{t(LanguageKey.subscriptionExpiringDescription)}</div>
            <div className="IDred">
              {t(LanguageKey.subscriptionDaysRemaining, { days: numberToFormattedString(subscriptionRemainingDays) })}
            </div>
          </div>
          <Link className={styles.upgradeicon} href="/upgrade" aria-label={t(LanguageKey.upgradeyouraccount)}>
            <StatusIcon type="warning" />
          </Link>
        </>
      ),
    },
    {
      key: "shopper",
      type: "shopper",
      priority: 3,
      condition: Boolean(session?.user.isShopper),
      content: (
        <>
          <div className={styles.headerandinput} style={{ gap: "1px" }}>
            <div className={styles.title2}>{t(LanguageKey.shoppertitle)}</div>
            <div className={styles.explain}>{t(LanguageKey.shopperdescription)}</div>
          </div>
          <Link className={styles.upgradeicon} href="/store" aria-label={t(LanguageKey.shoppertitle)}>
            <StatusIcon type="shopper" />
          </Link>
        </>
      ),
    },
    {
      key: "influencer",
      type: "influencer",
      priority: 4,
      condition: Boolean(session?.user.isInfluencer),
      content: (
        <>
          <div className={styles.headerandinput} style={{ gap: "1px" }}>
            <div className={styles.title2}>{t(LanguageKey.advertisertitle)}</div>
            <div className={styles.explain}>{t(LanguageKey.advertiserdescription)}</div>
          </div>
          <Link className={styles.upgradeicon} href="/advertise" aria-label={t(LanguageKey.advertisertitle)}>
            <StatusIcon type="influencer" />
          </Link>
        </>
      ),
    },
    {
      key: "upgrade",
      type: "upgrade",
      priority: 10,
      condition: !session?.user.isShopper && !session?.user.isInfluencer,
      content: (
        <>
          <div className={styles.headerandinput} style={{ gap: "1px" }}>
            <div className={styles.title2}>{t(LanguageKey.upgradeyouraccount)}</div>
            <div className={styles.explain}>{t(LanguageKey.likeaprouser)}</div>
          </div>
          <div className={styles.statusactions}>
            <Link className={styles.upgradeicon} href="/advertise" aria-label={t(LanguageKey.advertisertitle)}>
              <StatusIcon type="influencer" />
            </Link>
            <Link className={styles.upgradeicon} href="/store" aria-label={t(LanguageKey.shoppertitle)}>
              <StatusIcon type="shopper" />
            </Link>
          </div>
        </>
      ),
    },
  ];
  const activeStatuses = statusMap
    .filter((status) => status.condition)
    .sort((firstStatus, secondStatus) => firstStatus.priority - secondStatus.priority);
  const activeStatusKeys = activeStatuses.map((status) => status.key).join("|");
  const selectedStatus = activeStatuses[activeStatusIndex] ?? activeStatuses[0];
  useEffect(() => {
    setActiveStatusIndex(0);
  }, [activeStatusKeys]);
  const showNextStatus = () => {
    setActiveStatusIndex((currentIndex) => (currentIndex + 1) % activeStatuses.length);
  };
  const showPreviousStatus = () => {
    setActiveStatusIndex((currentIndex) => (currentIndex - 1 + activeStatuses.length) % activeStatuses.length);
  };
  const [activeUpgradeSlide, setActiveUpgradeSlide] = useState(0);
  const [activeStatisticsSlide, setActiveStatisticsSlide] = useState(0);
  const upgradeSlides = [
    {
      description: t(LanguageKey.ReserveToken),
      value: aiFeatureCount === null ? t(LanguageKey.upgradeyouraccount) : numberToFormattedString(aiFeatureCount),
      backdropColor: "var(--color-light-red60)",
      activeDotClassName: styles.paginationdotactive,
      icon: (
        <svg
          className={styles.totaltilesvg}
          xmlns="http://www.w3.org/2000/svg"
          color="var(--color-light-red)"
          fill="none"
          stroke="var(--color-light-red)"
          viewBox="0 0 24 24"
          aria-hidden="true">
          <path d="M11.54 7.25c.21-.33.7-.33.92 0l.62.98q1.05 1.64 2.69 2.69l.98.62c.33.21.33.7 0 .92l-.98.62q-1.64 1.05-2.69 2.69l-.62.98a.55.55 0 0 1-.92 0l-.62-.98q-1.05-1.64-2.69-2.69l-.98-.62a.55.55 0 0 1 0-.92l.98-.62q1.64-1.05 2.69-2.69z" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    },
    {
      description: t(LanguageKey.remainingTime),
      value: `${numberToFormattedString(subscriptionRemainingDays)} ${t(LanguageKey.pageTools_Day)}`,
      backdropColor: "var(--color-dark-red60)",
      activeDotClassName: styles.paginationdotactiveyellow,
      icon: (
        <svg
          className={styles.totaltilesvg}
          xmlns="http://www.w3.org/2000/svg"
          color="var(--color-dark-red)"
          fill="none"
          stroke="var(--color-dark-red)"
          viewBox="0 0 24 24">
          <path d="M12 17.88V18m.25 0a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0M12 13.88V14m.25 0a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0m-5 3.88V18m.25 0a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0m-.25-4.12V14m.25 0a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0m9.25-.12V14m.25 0a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0M16 2v4M8 2v4m-5 4h18" />
          <path d="M13 4h-2C7.23 4 5.34 4 4.17 5.17S3 8.23 3 12v2c0 3.77 0 5.66 1.17 6.83S7.23 22 11 22h2c3.77 0 5.66 0 6.83-1.17S21 17.77 21 14v-2c0-3.77 0-5.66-1.17-6.83S16.77 4 13 4" />
        </svg>
      ),
    },
  ];
  const statisticsSlides = [
    {
      description: t(LanguageKey.pageStatistics_stories),
      value: (
        <div className="headerparent" style={{ justifyContent: "flex-start" }}>
          {props.activeStories.length > 0 ? (
            props.activeStories.map((story) => (
              <Link
                href={`/page/stories/storyinfo/${story.storyId}`}
                key={story.storyId}
                onClick={(event) => event.stopPropagation()}
                style={{ position: "relative" }}>
                <img
                  style={{
                    aspectRatio: "9/16",
                    borderRadius: "5px",
                    backgroundColor: "var(--color-gray)",
                    maxHeight: "40px",
                    minHeight: "40px",
                  }}
                  src={basePictureUrl + story.thumbnailMediaUrl}
                  alt=""
                />
              </Link>
            ))
          ) : (
            <div className={styles.title2}>{t(LanguageKey.notfound)}</div>
          )}
        </div>
      ),
      backdropColor: "var(--color-purple60)",
      activeDotClassName: styles.paginationdotactivepurple,
      icon: (
        <svg
          className={styles.totaltilesvg}
          xmlns="http://www.w3.org/2000/svg"
          color="var(--color-purple)"
          fill="none"
          stroke="var(--color-purple)"
          viewBox="0 0 24 24">
          <path d="M3 12c0-4.24 0-6.36 1.32-7.68S7.76 3 12 3s6.36 0 7.68 1.32S21 7.76 21 12s0 6.36-1.32 7.68S16.24 21 12 21s-6.36 0-7.68-1.32S3 16.24 3 12" />
          <path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0m1.37-5.25h-.12m.25 0a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0" />
        </svg>
      ),
    },
    {
      description: t(LanguageKey.lastLike),
      value: numberToFormattedString(
        props.data?.items.find((x) => x.topTileType === TopTileType.LikeCount)?.value ?? 0,
      ),
      backdropColor: "var(--color-light-red60)",
      activeDotClassName: styles.paginationdotactivered,
      icon: (
        <svg
          className={styles.totaltilesvg}
          xmlns="http://www.w3.org/2000/svg"
          color="var(--color-light-red)"
          fill="none"
          stroke="var(--color-light-red)"
          viewBox="0 0 24 24">
          <path d="M10.4 20C7.6 17.9 2 13 2 8.7a5 5 0 0 1 5-5.2c1.5 0 3 .5 5 2.5 2-2 3.5-2.5 5-2.5a5 5 0 0 1 5 5.2c0 4.3-5.6 9.2-8.4 11.3q-1.6 1-3.2 0" />
        </svg>
      ),
    },
    {
      description: t(LanguageKey.pageStatistics_Reach),
      value: props.data?.items.find((x) => x.topTileType === TopTileType.Reach)?.value
        ? numberToFormattedString(props.data?.items.find((x) => x.topTileType === TopTileType.Reach)?.value ?? 0)
        : t(LanguageKey.notfound),
      backdropColor: "var(--color-firoze60)",
      activeDotClassName: styles.paginationdotactivefiroze,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={styles.totaltilesvg}
          color="var(--color-firoze)"
          fill="none"
          stroke="var(--color-firoze)"
          viewBox="0 0 24 24">
          <circle cx="12" cy="7" r="4" />
          <path d="M12 14c-5 0-8 2.5-8 5q.2 1.8 2 2h12a2 2 0 0 0 2-2c0-2.5-3-5-8-5" />
        </svg>
      ),
    },
    {
      description: t(LanguageKey.unreadcomment),
      value: numberToFormattedString(
        props.data?.items.find((x) => x.topTileType === TopTileType.NewCommentCount)?.value ?? 0,
      ),
      backdropColor: "var(--color-light-green60)",
      activeDotClassName: styles.paginationdotactivegreen,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={styles.totaltilesvg}
          color="var(--color-light-green)"
          fill="none"
          stroke="var(--color-light-green)"
          viewBox="0 0 24 24">
          <path d="m22 10.5-.04-2.25c-.08-2.37-.12-3.56-1.09-4.53s-2.19-1.03-4.63-1.13a100 100 0 0 0-8.48 0c-2.44.1-3.66.15-4.63 1.13s-1 2.16-1.1 4.53a64 64 0 0 0 0 4.5c.1 2.37.13 3.56 1.1 4.53s2.19 1.03 4.63 1.13q1.1.05 2.27.07c.74.02 1.11.02 1.44.15.32.12.6.36 1.15.83l2.18 1.86a.73.73 0 0 0 1.2-.55v-2.35h.24c2.44-.11 3.66-.16 4.63-1.14s1-2.16 1.1-4.53z" />
          <path d="M12.13 10.5H12m-3.87 0H8m8.13 0H16m-3.75 0a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0m-4 0a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0m8 0a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0" />
        </svg>
      ),
    },
  ];
  const selectedUpgradeSlide = upgradeSlides[activeUpgradeSlide];
  const selectedStatisticsSlide = statisticsSlides[activeStatisticsSlide];
  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveUpgradeSlide((currentIndex) => (currentIndex + 1) % upgradeSlides.length);
    }, 10000);

    return () => window.clearInterval(timer);
  }, [upgradeSlides.length]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStatisticsSlide((currentIndex) => (currentIndex + 1) % statisticsSlides.length);
    }, 10000);

    return () => window.clearInterval(timer);
  }, [statisticsSlides.length]);
  return (
    <>
      {loadingStatus && <Loading />}
      {!loadingStatus && props.data && (
        <>
          <section className={styles.personalinfosection}>
            <div className="headerparent" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className="instagramprofile ">
                <img
                  style={{ width: "40px", height: "40px" }}
                  loading="lazy"
                  decoding="async"
                  className="instagramimage"
                  alt="profile image"
                  src={session?.user?.profileUrl ? basePictureUrl + session?.user?.profileUrl : "/no-profile.svg"}
                />
                <div className="instagramprofiledetail">
                  <div className="instagramusername">{session?.user?.fullName ?? ""}</div>
                  <div className="instagramid translate">@{session?.user?.username ?? ""}</div>
                </div>
              </div>
              {activeStatuses.length > 1 && (
                <div className={`${styles.statusnavcontainer} translate`}>
                  <button
                    type="button"
                    className={styles.statusnav}
                    onClick={showPreviousStatus}
                    aria-label={t(LanguageKey.previous)}
                    title={t(LanguageKey.previous)}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m14 6-6 6 6 6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={styles.statusnav}
                    onClick={showNextStatus}
                    aria-label={t(LanguageKey.next)}
                    title={t(LanguageKey.next)}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m10 6 6 6-6 6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <div className={styles.status} aria-live="polite">
              <div className={styles.statuscontent}>{selectedStatus?.content}</div>
            </div>
          </section>
          <section
            className={styles.totaltile}
            role="button"
            tabIndex={0}
            onClick={props.onSummaryClick}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                props.onSummaryClick();
              }
            }}>
            <div className={styles.backdropfade} style={{ backgroundColor: "var(--color-light-blue60)" }} />
            <svg
              className={styles.totaltilesvg}
              xmlns="http://www.w3.org/2000/svg"
              color="var(--color-light-blue)"
              fill="none"
              stroke="var(--color-light-blue)"
              viewBox="0 0 24 24">
              <path d="m17 17 4 4M12 3.06A8 8 0 1 0 18.94 10M17.5 2.94V4.5m0 0v1.56m0-1.56h-1.25m1.25 0h1.25m1.25 0-1.08-.36c-.5-.17-.9-.56-1.06-1.06L17.5 2l-.36 1.08c-.17.5-.56.9-1.06 1.06L15 4.5l1.08.36c.5.17.9.56 1.06 1.06L17.5 7l.36-1.08c.17-.5.56-.9 1.06-1.06z" />
            </svg>

            <div className={styles.headerandinput} style={{ paddingInline: "10px" }}>
              <div className={styles.explain}>{t(LanguageKey.CreateYourDigitalVersion)}</div>
              <div className="headerparent">
                <div className={styles.title2}>{t(LanguageKey.SmartPageAnalysis)}</div>
                <svg
                  className={styles.shorticon}
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M2.3.9q0-.8 1-.9h7q.7 0 .8.9v7a.9.9 0 1 1-1.8 0v-5l-7.8 8A.9.9 0 0 1 .3 9.5L8 1.8H3.2a1 1 0 0 1-.9-1"
                    fill="var(--color-light-blue)"></path>
                </svg>
              </div>
            </div>
          </section>
          <section className={styles.totaltile}>
            <div className={styles.backdropfade} style={{ backgroundColor: selectedStatisticsSlide.backdropColor }} />
            <div className={styles.slideshowcontent} aria-live="polite">
              {selectedStatisticsSlide.icon}
              <div className={styles.slidecontentcontainer}>
                <div className={styles.pagination} onClick={(event) => event.stopPropagation()}>
                  {statisticsSlides.map((slide, index) => (
                    <button
                      type="button"
                      key={slide.description}
                      className={`${styles.paginationdot} ${
                        index === activeStatisticsSlide ? selectedStatisticsSlide.activeDotClassName : ""
                      }`}
                      aria-label={`${slide.description} ${index + 1}`}
                      aria-current={index === activeStatisticsSlide ? "true" : undefined}
                      onClick={() => setActiveStatisticsSlide(index)}
                    />
                  ))}
                </div>
                <div className={styles.headerandinput}>
                  <div className={styles.explain}>{selectedStatisticsSlide.description}</div>
                  <div className={styles.title2}>{selectedStatisticsSlide.value}</div>
                </div>
              </div>
            </div>
          </section>

          <section
            className={styles.totaltile}
            role="button"
            tabIndex={0}
            onClick={props.onUpgradeClick}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                props.onUpgradeClick();
              }
            }}>
            <div className={styles.backdropfade} style={{ backgroundColor: selectedUpgradeSlide.backdropColor }} />
            <div className={styles.slideshowcontent} aria-live="polite">
              {selectedUpgradeSlide.icon}
              <div className={styles.slidecontentcontainer}>
                <div className={styles.pagination} onClick={(event) => event.stopPropagation()}>
                  {upgradeSlides.map((slide, index) => (
                    <button
                      type="button"
                      key={slide.description}
                      className={`${styles.paginationdot} ${
                        index === activeUpgradeSlide ? selectedUpgradeSlide.activeDotClassName : ""
                      }`}
                      aria-label={`${slide.description} ${index + 1}`}
                      aria-current={index === activeUpgradeSlide ? "true" : undefined}
                      onClick={() => setActiveUpgradeSlide(index)}
                    />
                  ))}
                </div>
                <div className={styles.headerandinput}>
                  <div className={styles.explain}>{selectedUpgradeSlide.description}</div>
                  <div className={styles.title2}>{selectedUpgradeSlide.value}</div>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.totaltile}>
            <div className={styles.backdropfade} style={{ backgroundColor: "var(--color-light-yellow60)" }} />
            <svg
              className={styles.totaltilesvg}
              xmlns="http://www.w3.org/2000/svg"
              color="var(--color-light-yellow)"
              fill="none"
              stroke="var(--color-light-yellow)"
              viewBox="0 0 24 24">
              <path d="M15.48 16.9v-.27c0-1.04.13-1.34.86-2.08l.58-.57a7 7 0 1 0-9.84 0l.6.59c.7.73.82 1.01.84 2.04v.47a2 2 0 0 0 2.1 1.92h2.93a2 2 0 0 0 1.93-1.95z" />
              <path d="M10 19v1a2 2 0 1 0 4 0v-1m-5.5-3h7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>

            <div className={styles.headerandinput} style={{ paddingInline: "10px" }}>
              <div className={styles.explain}>{t(LanguageKey.EducationAndGuidance)}</div>
              <div className="headerparent">
                <div className={styles.title2}>{t(LanguageKey.HowToUseBrancy)}</div>
                <svg
                  className={styles.shorticon}
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M2.3.9q0-.8 1-.9h7q.7 0 .8.9v7a.9.9 0 1 1-1.8 0v-5l-7.8 8A.9.9 0 0 1 .3 9.5L8 1.8H3.2a1 1 0 0 1-.9-1"
                    fill="var(--color-light-yellow)"></path>
                </svg>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default IngageInfo;
