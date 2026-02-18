import { useSession } from "next-auth/react";
import Link from "next/link";
import router from "next/router";
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import CounterDown2 from "saeed/components/design/counterDown/counterDown2";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import { InstaInfoContext } from "saeed/context/instaInfoContext";
import { LoginStatus, RoleAccess } from "saeed/helper/loadingStatus";
import { LanguageKey } from "saeed/i18n";
import { PartnerRole } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { MethodType } from "saeed/helper/api";
import { IPrePost, IScheduledPost } from "saeed/models/page/post/preposts";
import { ShowRings } from "../../design/counterDown/counterDown";
import DeletePrePost from "./deletePrePost";
import styles from "./schedulePost.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const ScheduledPost = (props: { data: IPrePost[] | null }) => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const context = use(InstaInfoContext);
  const [loadingStatus, setLoadingStaus] = useState(LoginStatus(session) && RoleAccess(session, PartnerRole.PageView));
  const [scheduledPosts, setScheduledPosts] = useState<IScheduledPost | null>(null);
  const [deletePrePost, setDeletePrePost] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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
  function generateTestData(): IPrePost[] {
    const unixNow = Math.floor(Date.now() / 1000);
    const testPosts: IPrePost[] = [];
    const testImages = [
      "/test/post1.jpg",
      "/test/post2.jpg",
      "/test/post3.jpg",
      "/test/post4.jpg",
      "/test/post5.jpg",
      "/test/post6.jpg",
      "/test/post7.jpg",
      "/test/post8.jpg",
      "/test/post9.jpg",
      "/test/post10.jpg",
      "/test/post11.jpg",
      "/test/post12.jpg",
      "/test/post13.jpg",
      "/test/post14.jpg",
      "/test/post15.jpg",
      "/test/post16.jpg",
      "/test/post17.jpg",
      "/test/post18.jpg",
      "/test/post19.jpg",
      "/test/post20.jpg",
    ];
    for (let i = 0; i < 20; i++) {
      testPosts.push({
        prePostId: i + 1000,
        mediaType: i === 0 ? 0 : 1, // First one is ad, others are normal posts
        thumbnailMediaUrl: testImages[i],
        upingTime: unixNow + (i + 1) * 3600 * 6, // Each post 6 hours apart
        caption: `Test post ${i + 1}`,
        createdTime: unixNow,
        instagramerId: 0,
      } as IPrePost);
    }
    return testPosts;
  }
  // test mode for styling
  // Convert server data to client object
  function convertServerToClient(server: IPrePost[]) {
    const unixNow = Math.floor(Date.now() / 1000);
    const posts: IScheduledPost = { info: [], totalPostCount: server.length };
    server.forEach((element) => {
      const diffTime = Math.abs(element.upingTime - unixNow);
      const intdays = Math.floor(diffTime / 86400);
      const intHoures = Math.floor(diffTime / 3600);
      const intMinutes = Math.floor(diffTime / 60);
      const intSecons = diffTime % 60;
      posts.info.push({
        second: intSecons,
        day: intdays,
        hour: intHoures,
        minute: intMinutes,
        postNumber: element.prePostId,
        postType: element.mediaType as number,
        postUrl: element.thumbnailMediaUrl,
        upingTime: element.upingTime,
        prePostId: element.prePostId,
      });
    });
    return posts;
  }
  const scheduledPostsMemo = useMemo(() => {
    // test mode for styling
    if (testMode) {
      return convertServerToClient(generateTestData());
    }
    // test mode for styling
    if (!props.data) return null;
    return convertServerToClient(props.data);
    //test mode for styling
  }, [props.data, testMode]);
  //test mode for styling

  //original code
  //  }, [props.data]);
  //original code
  const handleDeletePrepost = useCallback(async () => {
    if (deletePrePost === null) return;
    try {
      setDeletePrePost(null);
      const userId = session?.user.instagramerIds[session.user.currentIndex];
      const res = await clientFetchApi<boolean, boolean>(`/api/${userId}/Post`, {
        methodType: MethodType.get,
        session: session,
        data: undefined,
        queries: [{ key: "prePostId", value: deletePrePost.toString() }],
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        setScheduledPosts((prev) => ({
          ...prev!,
          info: prev!.info.filter((x) => x.prePostId !== deletePrePost),
        }));
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, [deletePrePost, session]);
  useEffect(() => {
    if (scheduledPostsMemo) {
      setScheduledPosts(scheduledPostsMemo);
      setLoadingStaus(false);
    }
  }, [scheduledPostsMemo, context]);
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
    const cardWidth = 180 + 10;
    const effectiveDirection = isRTL ? (direction === "left" ? "right" : "left") : direction;
    const scrollAmount = effectiveDirection === "right" ? cardWidth : -cardWidth;
    scrollContainerRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };
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
  }, [checkScrollPosition, scheduledPosts]);
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
    const cardWidth = 180 + 10; // card width + gap
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
  return (
    <>
      <section className={styles.schedulPosts}>
        <div className="headerChild" title="↕ Resize the Card">
          <div className="circle" />
          <div className="Title">{t(LanguageKey.ScheduledPost)}</div>
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
          <div className={styles.thereAreNoPostsParent}>
            {t(LanguageKey.thereAreNoPost)}
            <button
              title="🔗 New Scheduled Post"
              role="button"
              className="saveButton"
              style={{ paddingLeft: "20px", paddingRight: "20px" }}>
              <svg viewBox="0 0 550 560" width="20px" height="20px" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill="#fff"
                  d="M458 80c-6-46-45-80-91-80H92C42 0 0 41 0 92v275c0 42 30 80 70 90v3c0 52 43 95 95 95h286c52 0 95-43 95-95V174c0-50-39-91-88-95ZM92 425a60 60 0 0 1-60-60V93a60 60 0 0 1 60-60h275a60 60 0 0 1 60 60v275a60 60 0 0 1-60 60H92Zm421 35c0 34-28 62-62 62H165a62 62 0 0 1-62-62v-1h264c50 0 92-41 92-92V112c30 4 54 30 54 62zM358 230c0 10-8 17-17 17h-94v94a18 18 0 1 1-35 0v-94h-94a18 18 0 1 1 0-35h94v-94a18 18 0 1 1 35 0v94h94c10 0 17 8 17 17Z"
                />
              </svg>
              {t(LanguageKey.NewScheduledPost)}
            </button>
          </div>
        )}
        {}
        {!loadingStatus && scheduledPosts && (
          <>
            {scheduledPosts.info.length === 0 ? (
              <div className={styles.thereAreNoPostsParent}>
                {t(LanguageKey.thereAreNoPost)}
                <button
                  title="🔗 New Scheduled Post"
                  onClick={() => router.push("/page/posts/createpost?newschedulepost=true")}
                  role="button"
                  className="saveButton">
                  <svg viewBox="0 0 550 560" width="20px" height="20px" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fill="#fff"
                      d="M458 80c-6-46-45-80-91-80H92C42 0 0 41 0 92v275c0 42 30 80 70 90v3c0 52 43 95 95 95h286c52 0 95-43 95-95V174c0-50-39-91-88-95ZM92 425a60 60 0 0 1-60-60V93a60 60 0 0 1 60-60h275a60 60 0 0 1 60 60v275a60 60 0 0 1-60 60H92Zm421 35c0 34-28 62-62 62H165a62 62 0 0 1-62-62v-1h264c50 0 92-41 92-92V112c30 4 54 30 54 62zM358 230c0 10-8 17-17 17h-94v94a18 18 0 1 1-35 0v-94h-94a18 18 0 1 1 0-35h94v-94a18 18 0 1 1 35 0v94h94c10 0 17 8 17 17Z"
                    />
                  </svg>
                  {t(LanguageKey.NewScheduledPost)}
                </button>
              </div>
            ) : (
              <div className={styles.ScheduledPostsWrapper}>
                <button
                  className={`${styles.navButton} ${styles.navButtonLeft}`}
                  onClick={() => scrollToDirection("left")}
                  disabled={!canScrollLeft}
                  aria-label="Previous posts"
                  title="قبلی">
                  <img
                    style={{ width: "30px", height: "30px", padding: "8px" }}
                    alt=" back button"
                    src="/back-white.svg"
                  />
                </button>
                <div
                  ref={scrollContainerRef}
                  className={styles.ScheduledPosts}
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                  style={{
                    scrollSnapType: isDragging ? "none" : "x mandatory",
                    scrollBehavior: isDragging ? "auto" : "smooth",
                  }}>
                  {scheduledPosts.info
                    .slice()
                    .sort((a, b) => a.upingTime - b.upingTime)
                    .map((v, i) => (
                      <Link
                        key={v.prePostId}
                        className={styles.cardPost}
                        href={`/page/posts/createpost?newschedulepost=false&prePostId=${v.prePostId}`}
                        onClick={(e) => {
                          if (hasDragged) {
                            e.preventDefault();
                          }
                        }}
                        style={{ scrollSnapAlign: "start" }}
                        draggable={false}>
                        <img
                          className={styles.postimage}
                          loading="lazy"
                          decoding="async"
                          alt="post image"
                          draggable={false}
                          //test mode for styling
                          src={testMode ? v.postUrl : `${basePictureUrl}${v.postUrl}`}
                          //test mode for styling

                          //original code
                          //src={`${basePictureUrl}${v.postUrl}`}
                          //original code
                        />
                        <div className={styles.CounterDown}>
                          <CounterDown2
                            upingTime={v.upingTime}
                            isDead={() => {
                              setScheduledPosts((prev) => ({
                                ...prev!,
                                info: prev!.info.filter((item) => item.prePostId !== v.prePostId),
                                totalPostCount: prev!.totalPostCount - 1,
                              }));
                            }}
                            classNamewrapper="countdownWrapperPost"
                            colorSvg="var(--text-h2)"
                            colorTimeTitle="var(--text-h2)"
                            showRings={ShowRings.All}
                          />
                        </div>
                        {v.postType === 0 ? (
                          <img className={styles.advertiseIcon} alt="advertise" src="/icon-advertise.svg" />
                        ) : (
                          <div className={styles.PostCount}>
                            [{i + 1} / {scheduledPosts.totalPostCount}]
                          </div>
                        )}
                        {/* <img
                        className={styles.deleteIcon}
                        onClick={(e) => {
                          e.preventDefault();
                          setDeletePrePost(v.prePostId);
                        }}
                        alt="Delete media button"
                        src="/delete-red.svg"
                      /> */}
                      </Link>
                    ))}
                </div>
                <button
                  className={`${styles.navButton} ${styles.navButtonRight}`}
                  onClick={() => scrollToDirection("right")}
                  disabled={!canScrollRight}
                  aria-label="Next posts"
                  title="next">
                  <img
                    style={{ width: "30px", height: "30px", padding: "8px", transform: "rotate(180deg)" }}
                    alt=" next button"
                    src="/back-white.svg"
                  />
                </button>
              </div>
            )}
          </>
        )}
      </section>
      {deletePrePost !== null && (
        <DeletePrePost removeMask={() => setDeletePrePost(null)} deletePrePost={handleDeletePrepost} />
      )}
    </>
  );
};

export default ScheduledPost;
