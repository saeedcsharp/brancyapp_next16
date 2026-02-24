import { useSession } from "next-auth/react";
import Link from "next/link";
import router from "next/router";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import CounterDown2 from "brancy/components/design/counterDown/counterDown2";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import { InstaInfoContext } from "brancy/context/instaInfoContext";
import { LoginStatus, RoleAccess } from "brancy/helper/loadingStatus";
import { LanguageKey } from "brancy/i18n";
import { PartnerRole } from "brancy/models/_AccountInfo/InstagramerAccountInfo";
import { MethodType } from "brancy/helper/api";
import { IScheduledStoryClient, IScheduledStoryServer } from "brancy/models/page/story/preStories";
import { ShowRings } from "brancy/components/design/counterDown/counterDown";
import DeletePrePost from "brancy/components/page/scheduledPost/deletePrePost";
import styles from "./scheduledStory.module.css";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
let unixNow = Date.now();
const ScheduledStory = (props: { data: IScheduledStoryServer[] | null; totalCount: number }) => {
  const context = use(InstaInfoContext);
  const { data: session, update } = useSession();
  const { t } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [loadingStatus, setLoadingStaus] = useState(LoginStatus(session) && RoleAccess(session, PartnerRole.PageView));
  const [scheduledStories, setScheduledStories] = useState<IScheduledStoryClient | null>(null);
  const [deletePreStory, setDeletePreStory] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isRTL, setIsRTL] = useState(false);

  // test mode for styling
  const [testMode, setTestMode] = useState(false);

  // Generate test data for styling
  function generateTestData(): IScheduledStoryServer[] {
    const unixNow = Math.floor(Date.now() / 1000);
    const testStories: IScheduledStoryServer[] = [];
    const testImages = [
      "/test/story1.jpg",
      "/test/story2.jpg",
      "/test/story3.jpg",
      "/test/story4.jpg",
      "/test/story5.jpg",
      "/test/story6.jpg",
      "/test/story7.jpg",
      "/test/story8.jpg",
      "/test/story1.jpg",
      "/test/story2.jpg",
      "/test/story3.jpg",
      "/test/story4.jpg",
      "/test/story5.jpg",
      "/test/story6.jpg",
      "/test/story7.jpg",
    ];
    for (let i = 0; i < 15; i++) {
      testStories.push({
        preStoryId: i + 2000,
        mediaType: 1, // Story media type
        thumbnailMediaUrl: testImages[i],
        upingTime: unixNow + (i + 1) * 3600 * 4, // Each story 4 hours apart
        status: 0,
        instagramerId: 0,
      } as IScheduledStoryServer);
    }
    return testStories;
  }
  // test mode for styling

  function convertServerToClient(server: IScheduledStoryServer[], totalCount: number) {
    unixNow = Date.now() / 1000;
    let scheduledPosts: IScheduledStoryClient = {
      info: [],
      totalStoryCount: totalCount,
    };
    server.forEach((element) => {
      const diffTime = Math.abs(element.upingTime - unixNow);
      const intdays = (diffTime - (diffTime % 86400)) / 86400;
      const intHoures = (diffTime - (diffTime % 3600)) / 3600 - intdays * 24;
      const intMinutes = (diffTime - (diffTime % 60)) / 60 - intdays * 24 * 60 - intHoures * 60;
      const intSecons = diffTime % 60;
      scheduledPosts.info.push({
        second: intSecons,
        day: intdays,
        hour: intHoures,
        minute: intMinutes,
        preStoryId: element.preStoryId,
        mediaType: element.mediaType,
        mediaUrl: element.thumbnailMediaUrl,
        upingTime: element.upingTime,
        storyType: 1,
      });
    });
    scheduledPosts.totalStoryCount = totalCount;
    return scheduledPosts;
  }
  async function handleDeletePreStory() {
    if (!deletePreStory) return;
    try {
      const res = await clientFetchApi<boolean, boolean>("Instagramer" + "" + "/Story/DeletePreStory", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [{ key: "id", value: deletePreStory.toString() }],
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        setScheduledStories((prev) => ({
          ...prev!,
          info: prev!.info.filter((x) => x.preStoryId !== deletePreStory),
        }));
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }

  const checkScrollPosition = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const direction = scrollContainerRef.current.dir || document.dir || document.documentElement.dir || "ltr";
    const rtl = direction === "rtl";
    setIsRTL(rtl);
    if (rtl) {
      const maxScrollLeft = scrollWidth - clientWidth;
      setCanScrollRight(Math.abs(scrollLeft) < maxScrollLeft - 10);
      setCanScrollLeft(Math.abs(scrollLeft) > 10);
    } else {
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  const scrollToDirection = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const cardWidth = 120 + 10; // card width + gap for stories
    const effectiveDirection = isRTL ? (direction === "left" ? "right" : "left") : direction;
    const scrollAmount = effectiveDirection === "right" ? cardWidth : -cardWidth;
    scrollContainerRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      snapToNearestCard();
    }
    setIsDragging(false);
    setTimeout(() => setHasDragged(false), 100);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      snapToNearestCard();
    }
    setIsDragging(false);
    setTimeout(() => setHasDragged(false), 100);
  };

  const snapToNearestCard = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = 120 + 10; // card width + gap for stories
    const scrollPosition = Math.abs(container.scrollLeft);
    const nearestCardIndex = Math.round(scrollPosition / cardWidth);
    const targetScroll = nearestCardIndex * cardWidth;

    container.scrollTo({
      left: isRTL ? -targetScroll : targetScroll,
      behavior: "smooth",
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };
  useEffect(() => {
    // test mode for styling
    if (testMode) {
      const testData = generateTestData();
      setScheduledStories(convertServerToClient(testData, testData.length));
      setLoadingStaus(false);
      return;
    }
    // test mode for styling

    if (props.data && LoginStatus(session) && RoleAccess(session, PartnerRole.PageView)) {
      setScheduledStories(convertServerToClient(props.data, props.totalCount));
      setLoadingStaus(false);
    }
    //test mode for styling
  }, [props.data, session, context, testMode]);
  //test mode for styling

  //original code
  //  }, [props.data, session, context]);
  //original code

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    checkScrollPosition();
    container.addEventListener("scroll", checkScrollPosition);
    window.addEventListener("resize", checkScrollPosition);
    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [checkScrollPosition, scheduledStories]);

  return (
    <>
      <section className={styles.schedulStories}>
        <div className="headerChild" title="↕ Resize the Card" style={{ zIndex: "0" }}>
          <div className="circle"></div>
          <h2 className="Title">{t(LanguageKey.pageStory_ScheduledStories)}</h2>
          {/* test mode for styling */}
          {/* <button
            onClick={() => setTestMode(!testMode)}
            className="saveButton"
            style={{
              marginInlineStart: "auto",
              height: "15px",
              width: "110px",
              fontSize: "12px",
              backgroundColor: testMode ? "#e91e63" : "#4a90e2",
            }}
            title={testMode ? "Disable Test Mode" : "Enable Test Mode"}>
            {testMode ? "🔴 Test Mode ON" : "🧪 Test Mode off"}
          </button> */}
          {/* test mode for styling */}
        </div>
        {loadingStatus && <Loading />}
        {(!LoginStatus(session) || !RoleAccess(session, PartnerRole.PageView)) && (
          <div className={styles.cardStoryTimerParent}>
            <div className={styles.thereAreNostoryParent}>
              {t(LanguageKey.pageStory_ScheduledStories)}
              <div
                title="🔗 New Scheduled Story"
                className="saveButton"
                style={{ paddingLeft: "20px", paddingRight: "20px" }}>
                {t(LanguageKey.pageStory_CreateNewStories)}
              </div>
            </div>
          </div>
        )}
        {!loadingStatus && scheduledStories && (
          <>
            {scheduledStories.info.length === 0 ? (
              <div className={styles.thereAreNostoryParent}>
                {t(LanguageKey.pageStory_thereAreNoStories)}
                <button
                  onClick={() => router.push("/page/stories/createstory?newschedulestory=true")}
                  title="🔗 New Scheduled Story"
                  role="button"
                  className="saveButton"
                  style={{ paddingLeft: "20px", paddingRight: "20px" }}>
                  <svg viewBox="0 0 550 560" width="20px" height="20px" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fill="#fff"
                      d="M458 80c-6-46-45-80-91-80H92C42 0 0 41 0 92v275c0 42 30 80 70 90v3c0 52 43 95 95 95h286c52 0 95-43 95-95V174c0-50-39-91-88-95ZM92 425a60 60 0 0 1-60-60V93a60 60 0 0 1 60-60h275a60 60 0 0 1 60 60v275a60 60 0 0 1-60 60H92Zm421 35c0 34-28 62-62 62H165a62 62 0 0 1-62-62v-1h264c50 0 92-41 92-92V112c30 4 54 30 54 62zM358 230c0 10-8 17-17 17h-94v94a18 18 0 1 1-35 0v-94h-94a18 18 0 1 1 0-35h94v-94a18 18 0 1 1 35 0v94h94c10 0 17 8 17 17Z"
                    />
                  </svg>
                  {t(LanguageKey.pageStory_CreateNewStories)}
                </button>
              </div>
            ) : (
              <div className={styles.schedulStorysswiper}>
                <button
                  className={`${styles.backbutton}`}
                  onClick={() => scrollToDirection("left")}
                  disabled={!canScrollLeft}
                  aria-label="Previous stories"
                  title="ℹ️ Show previous story">
                  <img
                    style={{ width: "30px", height: "30px", padding: "8px" }}
                    alt="back button"
                    src="/back-white.svg"
                  />
                </button>
                <div
                  ref={scrollContainerRef}
                  className={styles.cardStoryTimerParent}
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                  style={{
                    scrollSnapType: isDragging ? "none" : "x mandatory",
                    scrollBehavior: isDragging ? "auto" : "smooth",
                  }}>
                  {scheduledStories.info
                    .slice()
                    .sort((a, b) => a.upingTime - b.upingTime)
                    .map((v, i) => (
                      <Link
                        key={v.preStoryId}
                        href={`/page/stories/createstory?newschedulestory=false&preStoryId=${v.preStoryId}`}
                        className={styles.cardStoryTimer}
                        onClick={(e) => {
                          if (hasDragged) {
                            e.preventDefault();
                          }
                        }}
                        style={{ scrollSnapAlign: "start" }}
                        draggable={false}>
                        <div className={styles.storyimageandcover}>
                          <img
                            loading="lazy"
                            decoding="async"
                            className={styles.storyimage}
                            alt="story image"
                            draggable={false}
                            //test mode for styling
                            src={testMode ? v.mediaUrl : basePictureUrl + v.mediaUrl}
                            //test mode for styling

                            //original code
                            //src={basePictureUrl + v.mediaUrl}
                            //original code
                          />
                          <div className={styles.cover} />
                        </div>

                        <div className={styles.storyconent}>
                          <CounterDown2
                            upingTime={v.upingTime}
                            isDead={() => {
                              setScheduledStories((prev) => ({
                                ...prev!,
                                info: prev!.info.filter((item) => item.preStoryId !== v.preStoryId),
                                totalStoryCount: prev!.totalStoryCount - 1,
                              }));
                            }}
                            classNamewrapper="countdownWrapperPost"
                            colorSvg="var(--color-ffffff)"
                            colorTimeTitle="var(--color-ffffff)"
                            showRings={ShowRings.All}
                          />
                          {/* <img
                            className={styles.deleteIcon}
                            onClick={(e) => {
                              e.preventDefault();
                              setDeletePreStory(v.preStoryId);
                            }}
                            alt="Delete media button"
                            src="/delete.svg"
                          /> */}
                          {v.storyType === 0 ? (
                            <img className={styles.advertiseIcon} alt="advertise" src="/icon-advertise.svg" />
                          ) : (
                            <div className={styles.StoryCount}>
                              [{i + 1} / {scheduledStories.totalStoryCount}]
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                </div>
                <button
                  className={`${styles.forwardbutton}`}
                  onClick={() => scrollToDirection("right")}
                  disabled={!canScrollRight}
                  aria-label="Next stories"
                  title="ℹ️ Show next story">
                  <img
                    style={{ width: "30px", height: "30px", padding: "8px", transform: "rotate(180deg)" }}
                    alt="next button"
                    src="/back-white.svg"
                  />
                </button>
              </div>
            )}
          </>
        )}
      </section>
      {deletePreStory !== null && (
        <DeletePrePost removeMask={() => setDeletePreStory(null)} deletePrePost={handleDeletePreStory} />
      )}
    </>
  );
};

export default ScheduledStory;
