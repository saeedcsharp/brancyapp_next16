import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import MultiChart from "saeed/components/design/chart/Chart_month";
import RadarChart, {
  IPlatformData,
} from "saeed/components/design/chart/radarChart";
import {
  NotifType,
  notify,
  ResponseType,
} from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import { LoginStatus, packageStatus } from "saeed/helper/loadingStatus";
import { LanguageKey } from "saeed/i18n";
import { MethodType } from "saeed/helper/apihelper";
import { InsightPeriod } from "saeed/models/market/enums";
import {
  ILinkInsight,
  ITotalInsight,
  ITotalInsightFigures,
  IVideoInsight,
} from "saeed/models/market/statistics";
import styles from "./statistics.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
const Statistics = () => {
  //  return <Soon />;
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const [loadingStatus, setLoadingStatus] = useState(
    // LoginStatus(session) && RoleAccess(session, PartnerRole.Orders)
    true,
  );
  const [totalInsight, setTotalInsight] = useState<ITotalInsight>({
    avgTimeOnSite: 0,
    bounceCount: 0,
    bounceRate: "0",
    maxActions: 0,
    nbActions: 0,
    nbActionsPerVisit: 0,
    nbVisits: 0,
    nbVisitsConverted: 0,
    sumVisitLength: 0,
  });
  const [totalInsightFigures, setTotalInsightFigures] =
    useState<ITotalInsightFigures>({ nbVisit: [] });
  const [allLinkInsight, setAllLinkInsight] = useState<ILinkInsight[]>([]);
  const [lastVideo, setLastVideo] = useState<IVideoInsight>({
    lastPlayAparat: null,
    lastPlayTwitch: null,
    lastPlayYoutube: null,
    lastRedirectAparat: null,
    lastRedirectTwitch: null,
    lastRedirectYoutube: null,
  });

  // آماده‌سازی دیتا برای RadarChart
  const radarChartData = useMemo<IPlatformData[]>(() => {
    const youtubeData = [
      lastVideo.lastRedirectYoutube?.nbVisits || 0,
      lastVideo.lastRedirectYoutube?.nbEvents || 0,
      lastVideo.lastPlayYoutube?.nbVisits || 0,
      lastVideo.lastPlayYoutube?.nbEvents || 0,
      lastVideo.lastRedirectYoutube?.sumDailyNbUniqVisitors || 0,
    ];

    const aparatData = [
      lastVideo.lastRedirectAparat &&
      !Array.isArray(lastVideo.lastRedirectAparat)
        ? lastVideo.lastRedirectAparat.nbVisits
        : 0,
      lastVideo.lastRedirectAparat &&
      !Array.isArray(lastVideo.lastRedirectAparat)
        ? lastVideo.lastRedirectAparat.nbEvents
        : 0,
      lastVideo.lastPlayAparat && !Array.isArray(lastVideo.lastPlayAparat)
        ? lastVideo.lastPlayAparat.nbVisits
        : 0,
      lastVideo.lastPlayAparat && !Array.isArray(lastVideo.lastPlayAparat)
        ? lastVideo.lastPlayAparat.nbEvents
        : 0,
      lastVideo.lastRedirectAparat &&
      !Array.isArray(lastVideo.lastRedirectAparat)
        ? lastVideo.lastRedirectAparat.sumDailyNbUniqVisitors
        : 0,
    ];

    const twitchData = [
      lastVideo.lastRedirectTwitch?.nbVisits || 0,
      lastVideo.lastRedirectTwitch?.nbEvents || 0,
      lastVideo.lastPlayTwitch?.nbVisits || 0,
      lastVideo.lastPlayTwitch?.nbEvents || 0,
      lastVideo.lastRedirectTwitch?.sumDailyNbUniqVisitors || 0,
    ];

    return [
      { name: "یوتیوب", color: "#FF0000", data: youtubeData },
      { name: "آپارات", color: "#00A8E8", data: aparatData },
      { name: "توییچ", color: "#9146FF", data: twitchData },
    ];
  }, [lastVideo]);

  const radarCategories = [
    " ورود به پلتفرم ",
    "رویداد هدایت",
    "پخش ویدیو",
    "رویداد پخش",
    "بازدید یکتا",
  ];

  // فرمت ثانیه به HH:MM:SS
  const formatSeconds = (seconds?: number | null) => {
    if (seconds === null || seconds === undefined) return "00:00:00";
    const s = Math.max(0, Math.floor(seconds));
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  async function fetchData() {
    try {
      const [tiRes, tiFiguresRes, allLinkRes, lastVideoRes] = await Promise.all(
        [
          clientFetchApi<boolean, ITotalInsight>("/api/bio/GetTotalInsight", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "period", value: InsightPeriod.Daily.toString() }], onUploadProgress: undefined }),
          clientFetchApi<boolean, ITotalInsightFigures>("/api/bio/GetTotalInsightFigures", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined }),
          clientFetchApi<boolean, ILinkInsight[]>("/api/link/GetAllLinkInsight", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined }),
          clientFetchApi<boolean, IVideoInsight>("/api/bio/GetVideoInsight", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined }),
        ],
      );
      if (tiRes.succeeded) setTotalInsight(tiRes.value);
      else notify(tiRes.info.responseType, NotifType.Warning);
      if (tiFiguresRes.succeeded) setTotalInsightFigures(tiFiguresRes.value);
      if (allLinkRes.succeeded) setAllLinkInsight(allLinkRes.value);
      if (lastVideoRes.succeeded) setLastVideo(lastVideoRes.value);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoadingStatus(false);
    }
  }
  useEffect(() => {
    if (!session) return;
    if (session && !packageStatus(session)) router.push("/upgrade");
    if (!LoginStatus(session)) router.push("/");
    fetchData();
  }, [session]);
  if (session?.user.currentIndex === -1) router.push("/user");
  return (
    session &&
    session!.user.currentIndex !== -1 && (
      <>
        {/* head for SEO */}
        <Head>
          {" "}
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
          />
          <title>Bran.cy ▸ {t(LanguageKey.navbar_Statistics)}</title>
          <meta
            name="description"
            content="Advanced Instagram post management tool"
          />
          <meta name="theme-color"></meta>
          <meta
            name="keywords"
            content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
          />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://www.Brancy.app/page/posts" />
          {/* Add other meta tags as needed */}
        </Head>
        {/* head for SEO */}
        {/* <Soon /> */}
        <main>
          {loadingStatus && <Loading />}
          {!loadingStatus && (
            <>
              <div className={styles.inboxContainer}>
                <div className={styles.followers}>
                  <div className={styles.animation1}>
                    <div className={styles.gooli1}></div>
                    <div className={styles.gooli2}></div>
                    <div className={styles.gooli3}></div>
                    <div className={styles.gooli4}></div>
                  </div>
                  <div className="title" style={{ textAlign: "center" }}>
                    بازدیدها
                  </div>
                  <div className={styles.div}>{totalInsight!.nbVisits}</div>
                </div>

                <div className={styles.followers}>
                  <div className={styles.animation2}>
                    <div className={styles.gooli5}></div>
                    <div className={styles.gooli6}></div>
                    <div className={styles.gooli7}></div>
                    <div className={styles.gooli8}></div>
                  </div>
                  <div className="title" style={{ textAlign: "center" }}>
                    کلیک‌ها و تعاملات
                  </div>
                  <div className={styles.div}>{totalInsight!.nbActions}</div>
                </div>

                <div className={styles.newlikes}>
                  <div className="title" style={{ textAlign: "center" }}>
                    بازدیدهای منجر به کلیک
                  </div>
                  <div className={styles.div}>
                    {totalInsight!.nbVisitsConverted}
                  </div>
                </div>

                <div className={styles.newCommnet}>
                  <div className="title" style={{ textAlign: "center" }}>
                    خروج سریع کاربران پس از ورود
                  </div>
                  <div className={styles.div}>{totalInsight!.bounceCount}</div>
                </div>
                <div className={styles.postrequest}>
                  <div className="title" style={{ textAlign: "center" }}>
                    خروج افراد بدون تعامل
                  </div>
                  <div className={styles.div}>{totalInsight!.bounceRate}</div>
                </div>

                <div className={styles.postrequest}>
                  <div className="title" style={{ textAlign: "center" }}>
                    بیشترین کلیک یک کاربر در یک بازدید
                  </div>
                  <div className="title2" style={{ textAlign: "center" }}></div>

                  <div className={styles.div}>{totalInsight!.maxActions}</div>
                </div>

                <div className={styles.postrequest}>
                  <div className="title" style={{ textAlign: "center" }}>
                    میانگین کلیک و تعامل هر بازدیدکننده
                  </div>

                  <div className={styles.div}>
                    {totalInsight!.nbActionsPerVisit}
                  </div>
                </div>
                <div className={styles.postrequest}>
                  <div className="title" style={{ textAlign: "center" }}>
                    مجموع زمان بازدید کاربران
                  </div>

                  <div className={styles.div}>
                    {formatSeconds(totalInsight!.sumVisitLength)}
                  </div>
                </div>

                <div className={styles.postrequest}>
                  <div className="title" style={{ textAlign: "center" }}>
                    میانگین زمان حضور یک بازدیدکننده
                  </div>

                  <div className={styles.div}>
                    {formatSeconds(totalInsight!.avgTimeOnSite)}
                  </div>
                </div>
              </div>
              <div className="pinContainer">
                {/* نمودار Radar برای مقایسه پلتفرم‌های ویدیویی */}
                <div className="bigcard">
                  <div className="frameParent">
                    <div className="headerChild">
                      <div className="circle"></div>
                      <div className="Title">مقایسه پلتفرم‌های ویدیویی</div>
                    </div>
                  </div>
                  {/* مقایسه عملکرد یوتیوب، آپارات و توییچ در یک نمودار */}
                  <RadarChart
                    chartId="video-platforms-comparison"
                    categories={radarCategories}
                    platformsData={radarChartData}
                    height="450px"
                  />
                </div>

                {totalInsightFigures.nbVisit?.length > 0 && (
                  <div className="bigcard">
                    <div className="frameParent">
                      <div className="headerChild">
                        <div className="circle"></div>
                        <div className="Title"> بازدید از لینک اختصاصی</div>
                      </div>
                    </div>
                    {/* نمودار تعداد بازدیدها در طول زمان */}
                    <MultiChart
                      showAverage={true}
                      seriesData={[
                        {
                          id: "nbVisit",
                          name: "بازدیدها",
                          data: totalInsightFigures.nbVisit,
                        },
                      ]}
                      id={"nbVisit-chart"}
                      name={"بازدیدها"}
                    />
                  </div>
                )}
                {/* نمودار ترکیبی تمام لینک‌ها */}
                {allLinkInsight?.length > 0 && (
                  <div className="bigcard">
                    <div className="frameParent">
                      <div className="headerChild">
                        <div className="circle"></div>
                        <div className="Title">
                          نمودار ترکیبی بازدید لینک‌ها
                        </div>
                      </div>
                    </div>
                    <MultiChart
                      seriesData={allLinkInsight.map((link) => ({
                        id: link.id,
                        name: link.title,
                        data: link.insight,
                      }))}
                      id={"allLinks-chart"}
                      name={"نمودار ترکیبی بازدید لینک‌ها"}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </>
    )
  );
};

export default Statistics;
