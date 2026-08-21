import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LoginStatus } from "brancy/helper/loadingStatus";
import { numberToFormattedString } from "brancy/helper/numberFormater";
import { LanguageKey } from "brancy/i18n";
import Loading from "brancy/components/notOk/loading";
import styles from "./ingageInfo.module.css";
import { TopTileType } from "brancy/models/enums";
import { IInstagramerHomeTiles, IStoryContent } from "brancy/models/interfaces";
import Tooltip from "../design/tooltip/tooltip";
const basePictureUrl = getClientMediaBaseUrl();
const FIRST_LOGIN_KEY = "first-login-date";
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
}) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [loadingStatus, setLoadingStaus] = useState(LoginStatus(session));
  const [currentTime, setCurrentTime] = useState(0);
  const [firstLoginAt, setFirstLoginAt] = useState<number | null>(null);
  const [activeStatusIndex, setActiveStatusIndex] = useState(0);
  useEffect(() => {
    if (props.data && LoginStatus(session)) setLoadingStaus(false);
  }, [props.data, session]);
  useEffect(() => {
    if (!session) return;
    if (typeof window === "undefined") return;
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
  const subscriptionRemainingDays = Math.ceil(packageRemainingSeconds / (24 * 60 * 60));
  const statusMap: StatusItem[] = [
    {
      key: "firstLogin",
      type: "sync",
      priority: 1,
      condition: firstLoginRemaining > 0,
      content: (
        <>
          <div className="headerandinput" style={{ gap: "1px" }}>
            <div className="title2">
              {" "}
              {t(LanguageKey.syncingAccountTitle)}{" "}
              <Tooltip
                triggerType="tooltip"
                tooltipValue={t(LanguageKey.syncingAccountDescriptiontooltip)}
                position="bottom"
                onClick></Tooltip>{" "}
            </div>
            <div className="explain">{t(LanguageKey.syncingAccountDescription)}</div>
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
          <div className="headerandinput" style={{ gap: "1px" }}>
            <div className="title2">{t(LanguageKey.subscriptionExpiringTitle)}</div>
            <div className="explain">{t(LanguageKey.subscriptionExpiringDescription)}</div>
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
          <div className="headerandinput" style={{ gap: "1px" }}>
            <div className="title2">{t(LanguageKey.shoppertitle)}</div>
            <div className="explain">{t(LanguageKey.shopperdescription)}</div>
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
          <div className="headerandinput" style={{ gap: "1px" }}>
            <div className="title2">{t(LanguageKey.advertisertitle)}</div>
            <div className="explain">{t(LanguageKey.advertiserdescription)}</div>
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
          <div className="headerandinput" style={{ gap: "1px" }}>
            <div className="title2">{t(LanguageKey.upgradeyouraccount)}</div>
            <div className="explain">{t(LanguageKey.likeaprouser)}</div>
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
          <section className={styles.totaltile}>
            <svg
              className={styles.totaltilesvg}
              fill="var(--color-gray)"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 22 22">
              <path d="m11 .8 5.3.1q2.1.2 3.3 1.5 1.3 1.4 1.5 3.3.2 2 .1 5.2v.2l-.1 5.2q-.2 1.9-1.5 3.3t-3.3 1.5q-2 .2-5.2.1h-.2l-5.2-.1q-1.9-.2-3.3-1.5T.9 16.3t-.2-5.2v-.2q0-3.2.2-5.2.1-1.9 1.5-3.3T5.7.9 11 .7m0 5.7a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9m5.5-2a1 1 0 1 0 1 1.1v-.1a1 1 0 0 0-1-1" />
            </svg>
            <div className="headerandinput">
              <div className="instagramid">{t(LanguageKey.pageStatistics_stories)}</div>
              <div className="headerparent" style={{ justifyContent: "flex-start" }}>
                {props.activeStories.length > 0 ? (
                  props.activeStories.map((story) => (
                    <Link
                      href={`/page/stories/storyinfo/${story.storyId}`}
                      key={story.storyId}
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
                      />
                    </Link>
                  ))
                ) : (
                  <div className="instagramusername">{t(LanguageKey.notfound)}</div>
                )}
              </div>
            </div>
          </section>

          <section className={styles.totaltile}>
            <svg
              className={styles.totaltilesvg}
              fill="var(--color-gray)"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 15 15">
              <path d="M4.87.77q.66.03 1.3.24h.03q.04 0 .07.04.23.07.44.18l.27.12.3.2.22.14a4.4 4.4 0 0 1 4.04-.71c2.62.85 3.56 3.72 2.77 6.22a9 9 0 0 1-2.13 3.41 27 27 0 0 1-4.48 3.51l-.18.11-.18-.11Q4.9 12.6 2.83 10.6A9 9 0 0 1 .69 7.2C-.1 4.7.83 1.83 3.48.96q.3-.1.63-.15h.08q.3-.04.6-.04zm6.3 2.24a.57.57 0 0 0-.7.35c-.1.3.05.63.35.73.45.17.75.62.75 1.12v.02a.6.6 0 0 0 .14.44q.16.18.4.2c.3 0 .54-.24.56-.54v-.08c.02-1-.58-1.9-1.5-2.24" />
            </svg>

            <div className="headerandinput">
              <div className=" instagramid">{t(LanguageKey.lastLike)}</div>
              <div className="instagramusername">
                {numberToFormattedString(
                  props.data.items.find((x) => x.topTileType === TopTileType.LikeCount)?.value ?? 0,
                )}
              </div>
            </div>
          </section>
          <section className={styles.totaltile}>
            <svg className={styles.totaltilesvg} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 34">
              <path
                d="M22.6 22.3c-7 0-13 1.2-13 5.7s6 5.7 13 5.7 13-1.2 13-5.7-6-5.7-13-5.7m0-4.3c4.7 0 8.6-4 8.6-8.8 0-5-3.9-8.9-8.6-8.9-4.8 0-8.6 4-8.6 8.9 0 4.8 3.8 8.8 8.6 8.8m18.6-6.8c1.3-5-2.4-9.4-7-9.4q-.8 0-1.4.2h-.2v.3a12 12 0 0 1 .2 13.8q-.1.3.2.5h1a7 7 0 0 0 7.2-5.4m3.5 11.7q-.9-2.1-4.3-2.7a31 31 0 0 0-6.6-.5c1.2.6 6 3.4 5.4 9.1q0 .5.4.5c1.2-.2 4.2-.9 5.1-3a4 4 0 0 0 0-3.4M12.5 2l-1.4-.2a7.4 7.4 0 0 0-7 9.4 7 7 0 0 0 8.2 5.4q.3-.1.2-.5-2-3-2-6.8 0-4 2.2-7V2zM5 20.2q-3.5.6-4.4 2.7a4 4 0 0 0 0 3.4c1 2.1 4 2.8 5.1 3q.5 0 .5-.5c-.6-5.7 4.1-8.5 5.4-9v-.2a31 31 0 0 0-6.7.6"
                fill="var(--color-gray)"
              />
            </svg>

            <div className="headerandinput">
              <div className=" instagramid">{t(LanguageKey.pageStatistics_Reach)}</div>
              <div className="instagramusername">
                {props.data.items.find((x) => x.topTileType === TopTileType.Reach)?.value
                  ? numberToFormattedString(
                      props.data.items.find((x) => x.topTileType === TopTileType.Reach)?.value ?? 0,
                    )
                  : t(LanguageKey.notfound)}
              </div>
            </div>
          </section>
          <section className={styles.totaltile}>
            <svg
              className={styles.totaltilesvg}
              fill="var(--color-gray)"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 17">
              <path d="M10 9a1 1 0 0 1-1-.8q.1-.8 1-.9a.9.9 0 0 1 0 1.8M6 9a.9.9 0 0 1 0-1.7q.9 0 1 1-.1.7-1 .8m9.4-1.7A7.6 7.6 0 0 0 8.9.6Q5.8.2 3.3 2.3A8 8 0 0 0 .6 8c-.2 4.4 3.4 7.8 7 8.9l.8-.2q.3-.2.3-.7v-1.3c4.3-.5 7-3.6 6.7-7.4" />
            </svg>
            <div className="headerandinput">
              <div className="instagramid">{t(LanguageKey.unreadcomment)}</div>
              <div className="instagramusername">
                {numberToFormattedString(
                  props.data.items.find((x) => x.topTileType === TopTileType.NewCommentCount)?.value ?? 0,
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default IngageInfo;
