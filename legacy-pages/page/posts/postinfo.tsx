import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useTransition,
} from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import MultiChart from "saeed/components/design/chart/Chart_month";
import InputText from "saeed/components/design/inputText";
import Modal from "saeed/components/design/modal";
import Slider from "saeed/components/design/slider/slider";
import FlexibleToggleButton from "saeed/components/design/toggleButton/flexibleToggleButton";
import { ToggleOrder } from "saeed/components/design/toggleButton/types";
import ToggleCheckBoxButton from "saeed/components/design/toggleCheckBoxButton";
import Tooltip from "saeed/components/design/tooltip/tooltip";
import {
  MediaModal,
  useMediaModal,
} from "saeed/components/messages/shared/utils";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import NotAllowed from "saeed/components/notOk/notAllowed";
import NotPermission, {
  PermissionType,
} from "saeed/components/notOk/notPermission";
import LotteryPopup, {
  LotteryPopupType,
} from "saeed/components/page/popup/lottery";
import QuickReplyPopup from "saeed/components/page/popup/quickReply";
import FollowersNonFollowers from "saeed/components/page/posts/popup/followers&NonFollowers";
import { isRTL } from "saeed/helper/checkRtl";
import { handleCopyLink } from "saeed/helper/copyLink";
import formatTimeAgo from "saeed/helper/formatTimeAgo";
import {
  LoginStatus,
  packageStatus,
  RoleAccess,
} from "saeed/helper/loadingStatus";
import initialzedTime from "saeed/helper/manageTimer";
import { LanguageKey } from "saeed/i18n";
import { PartnerRole } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { GetServerResult, MethodType } from "saeed/models/IResult";
import { MediaProductType } from "saeed/models/messages/enum";
import { IGetMediaCommentInfo, IMedia } from "saeed/models/messages/IMessage";
import {
  IAutomaticReply,
  IDetailsPost,
  IInsightPost,
  IMediaUpdateAutoReply,
} from "saeed/models/page/post/posts";
import { MediaType } from "saeed/models/page/post/preposts";
import styles from "./showPost.module.css";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
function convertMillisecondsToTime(ms: number) {
  if (ms <= 0) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }
  const hours = Math.floor(ms / 3600000);
  ms %= 3600000;
  const minutes = Math.floor(ms / 60000);
  ms %= 60000;
  const seconds = Math.floor(ms / 1000);
  return { hours, minutes, seconds };
}
type SearchState = {
  searchMode: boolean;
  loading: boolean;
  noresult: boolean;
};
type ProfilePopupState = {
  showPopup: boolean;
  popupImage: string;
  popupUsername: string;
};
type SearchAction =
  | { type: "SET_SEARCH_MODE"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_NO_RESULT"; payload: boolean }
  | { type: "RESET_SEARCH" };
type ProfilePopupAction =
  | { type: "SHOW_POPUP"; payload: { imageUrl: string; username: string } }
  | { type: "CLOSE_POPUP" };
const searchReducer = (
  state: SearchState,
  action: SearchAction,
): SearchState => {
  switch (action.type) {
    case "SET_SEARCH_MODE":
      return { ...state, searchMode: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_NO_RESULT":
      return { ...state, noresult: action.payload };
    case "RESET_SEARCH":
      return { searchMode: false, loading: false, noresult: false };
    default:
      return state;
  }
};
const profilePopupReducer = (
  state: ProfilePopupState,
  action: ProfilePopupAction,
): ProfilePopupState => {
  switch (action.type) {
    case "SHOW_POPUP":
      return {
        showPopup: true,
        popupImage: action.payload.imageUrl,
        popupUsername: action.payload.username,
      };
    case "CLOSE_POPUP":
      return { showPopup: false, popupImage: "", popupUsername: "" };
    default:
      return state;
  }
};
const ShowPost = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { query } = router;
  const { data: session, status } = useSession();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const isFetchingRef = useRef(false);
  const lastSearchQuery = useRef("");
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
  }, [status, router]);
  const [searchState, searchDispatch] = useReducer(searchReducer, {
    searchMode: false,
    loading: false,
    noresult: false,
  });
  const [profilePopupState, profilePopupDispatch] = useReducer(
    profilePopupReducer,
    {
      showPopup: false,
      popupImage: "",
      popupUsername: "",
    },
  );
  const [quickReply, setQuickReply] = useState(false);
  const [showLotteryPopup, setShowLotteryPopup] = useState(false);
  const [loading, setLoading] = useState(
    LoginStatus(session) && RoleAccess(session, PartnerRole.PageView),
  );
  const [showFollowersNonFollowers, setShowFollowersNonFollowers] =
    useState(false);
  const [comments, setComments] = useState<IMedia>();
  const [searchComments, setSearchComments] = useState<IMedia>();
  const [detailPost, setDetailPost] = useState<IDetailsPost>({
    caption: "",
    children: [],
    commentCount: 0,
    createdTime: 0,
    hashtags: [],
    commentEnabled: false,
    isDeleted: false,
    deleteTimeUnix: null,
    isHideLikeViewCount: false,
    likeCount: 0,
    loginStatus: 0,
    mediaType: MediaType.Image,
    newCommentCount: 0,
    pk: "",
    instagramerId: 0,
    instaShareLink: "",
    lastSeenCommentTimeUnix: 0,
    nextUnSeenCommentId: 0,
    postId: 0,
    saveCount: 0,
    shareCount: 0,
    tempId: 0,
    thumbnailMediaUrl: "",
    viewCount: 0,
    videoViewAverageTime: null,
    videoViewTotalTime: null,
    reachCount: 0,
    canDownload: false,
    mediaUrl: "",
    reelsSkipRate: null,
  });
  const [insight, setInsight] = useState<IInsightPost | null>(null);
  const [toggleValue, setToggleValue] = useState<ToggleOrder>(
    ToggleOrder.FirstToggle,
  );
  const [showPopupComment, setShowPopupComment] = useState("");
  const peopleTimeOutId = useRef<NodeJS.Timeout | null>(null);
  const [peopleLocked, setPeopleLocked] = useState(false);
  const [searchPepaple, setSearchPeaple] = useState("");
  const [captionLength, setCaptionLength] = useState(0);
  const [showQuickReplyPopup, setShowQuickReplyPopup] = useState(false);
  const divArray = useMemo(() => {
    return Array.from(
      { length: 10 - detailPost.children.length },
      (_, index) => <div key={index} className={styles.posts1}></div>,
    );
  }, [detailPost.children.length]);
  const mediaModal = useMediaModal();
  const [isPlayingInlineVideo, setIsPlayingInlineVideo] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [activeChildUrl, setActiveChildUrl] = useState<string>("");
  const [autoReply, setAutoReply] = useState<IAutomaticReply>({
    items: [],
    response: "hi",
    sendPr: false,
    shouldFollower: false,
    automaticType: 0,
    masterFlowId: null,
    promptId: null,
    masterFlow: null,
    mediaId: "",
    pauseTime: Date.now(),
    productType: MediaProductType.Feed,
    prompt: null,
    sendCount: 0,
    replySuccessfullyDirected: false,
  });
  const [commentsPerSlide, setCommentsPerSlide] = useState<number>(5);
  const [isFetchingMoreComments, setIsFetchingMoreComments] = useState(false);
  const [multiSelections, setMultiSelections] = useState<
    { first: number; second?: number }[]
  >([]);
  useEffect(() => {
    if (!insight || !insight.superFigures) {
      setMultiSelections([]);
      return;
    }
    setMultiSelections(
      insight.superFigures.map((sf) => ({
        first: 0,
        second: sf.secondIndexes && sf.secondIndexes[0] ? 0 : undefined,
      })),
    );
  }, [insight]);
  const buildMultiChartProps = useCallback(
    (sfIndex: number) => {
      if (!insight || !insight.superFigures || !insight.superFigures[sfIndex])
        return null;
      const sf = insight.superFigures[sfIndex];
      const sel = multiSelections[sfIndex] || { first: 0, second: 0 };
      const firstKey = sf.firstIndexes?.[sel.first];
      const secondKey =
        sf.secondIndexes && sf.secondIndexes[sel.first]
          ? sf.secondIndexes[sel.first][sel.second ?? 0]
          : undefined;
      let targetFig = sf.figures?.find(
        (f) =>
          f.firstIndex == firstKey &&
          (secondKey === undefined || f.secondIndex == secondKey),
      );
      if (!targetFig)
        targetFig =
          sf.figures && sf.figures.length > 0 ? sf.figures[0] : undefined;
      const dayList = (targetFig && (targetFig.days ?? targetFig.hours)) || [];
      let year = new Date().getFullYear();
      let month = new Date().getMonth() + 1;
      if (dayList && dayList.length > 0 && (dayList[0] as any).createdTime) {
        const ts = (dayList[0] as any).createdTime * 1000;
        const d = new Date(ts);
        year = d.getFullYear();
        month = d.getMonth() + 1;
      }
      const totalCount = (dayList || []).reduce(
        (s: number, it: any) => s + (it.count || 0),
        0,
      );
      const seriesData = [
        {
          id: `${sfIndex}-0`,
          name: sf.title ?? `series-${sfIndex}`,
          data: [
            {
              year,
              month,
              dayList: dayList,
              totalCount,
            },
          ],
        },
      ];
      const objectNavigators = [
        {
          title: sf.title,
          firstIndexes: sf.firstIndexes || [],
          secondIndexes: sf.secondIndexes || [],
          initialFirstIndex: sel.first,
          initialSecondIndex: sel.second,
        },
      ];

      return { seriesData, objectNavigators };
    },
    [insight, multiSelections],
  );
  const handleImageClick = (imageUrl: string, username: string) => {
    profilePopupDispatch({
      type: "SHOW_POPUP",
      payload: { imageUrl, username },
    });
  };
  const handleClosePopup = () => {
    profilePopupDispatch({ type: "CLOSE_POPUP" });
  };
  const calculateCommentsPerSlide = () => {
    const availableHeight = window.innerHeight - 250;
    const averageCommentHeight = 75;
    const optimal = Math.max(
      3,
      Math.floor(availableHeight / averageCommentHeight),
    );
    return Math.min(5, optimal);
  };
  useEffect(() => {
    const handleResize = () => {
      setCommentsPerSlide(calculateCommentsPerSlide());
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  function handlePostPictureClick(
    url: string,
    childrenMediaType: number,
    childrenUrl: string,
  ) {
    setIsPlayingInlineVideo(false);
    setIsVideoLoading(false);
    setActiveChildUrl(url);
    setDetailPost((prev) => ({
      ...prev,
      thumbnailMediaUrl: url,
      mediaType: childrenMediaType,
      mediaUrl: childrenUrl,
    }));
  }
  const fetchComments = useCallback(
    async (mediaId: string, nextMaxId: string | null) => {
      if (nextMaxId === null || !session?.user.commentPermission) return;
      setIsFetchingMoreComments(true);
      try {
        const info: IGetMediaCommentInfo = {
          justUnAnswered: false,
          mediaId: mediaId,
          nextMaxId: nextMaxId,
          searchInReplys: false,
          searchTerm: null,
        };
        var newComments = await GetServerResult<IGetMediaCommentInfo, IMedia>(
          MethodType.post,
          session,
          "Instagramer/Comment/GetMediaComments",
          info,
        );
        if (newComments.succeeded) {
          setComments((prev) => ({
            ...prev!,
            unAnsweredCount: newComments.value.unAnsweredCount,
            nextMaxId: newComments.value.nextMaxId,
            comments: [...prev!.comments, ...newComments.value.comments],
          }));
          setLoading(false);
        } else notify(newComments.info.responseType, NotifType.Warning);
      } catch (error) {
        if (error instanceof Error) {
          notify(ResponseType.Unexpected, NotifType.Error, error.message);
        } else {
          notify(
            ResponseType.Unexpected,
            NotifType.Error,
            "An unexpected error occurred",
          );
        }
      } finally {
        setIsFetchingMoreComments(false);
      }
    },
    [session],
  );
  async function togglePopup(commentId: string) {
    setShowPopupComment(commentId);
  }
  const fetchData = useCallback(
    async (postId: string) => {
      if (isFetchingRef.current || !session) return;
      isFetchingRef.current = true;
      try {
        var res = await GetServerResult<Boolean, IDetailsPost>(
          MethodType.get,
          session,
          "Instagramer/Post/GetPostInfo",
          null,
          [{ key: "postId", value: postId }],
        );
        if (res.succeeded) {
          setDetailPost(res.value);
          setCaptionLength(res.value.caption ? res.value.caption.length : 0);
          if (res.value.commentMedia) {
            setComments((prev) => ({
              ...prev!,
              automaticCommentReply:
                res.value.commentMedia!.automaticCommentReply,
              unAnsweredCount: res.value.commentMedia!.unAnsweredCount,
              nextMaxId: res.value.commentMedia!.nextMaxId,
              comments: res.value.commentMedia!.comments,
            }));
            if (res.value.commentMedia!.automaticCommentReply) {
              setAutoReply({
                replySuccessfullyDirected:
                  res.value.commentMedia.automaticCommentReply
                    .replySuccessfullyDirected,
                items: res.value.commentMedia!.automaticCommentReply.items,
                response:
                  res.value.commentMedia!.automaticCommentReply.response || "",
                sendPr:
                  res.value.commentMedia!.automaticCommentReply.sendPr || false,
                shouldFollower:
                  res.value.commentMedia!.automaticCommentReply
                    .shouldFollower || false,
                automaticType:
                  res.value.commentMedia!.automaticCommentReply.automaticType,
                masterFlowId:
                  res.value.commentMedia!.automaticCommentReply.masterFlowId,
                promptId:
                  res.value.commentMedia!.automaticCommentReply.promptId,
                masterFlow:
                  res.value.commentMedia!.automaticCommentReply.masterFlow,
                mediaId: res.value.commentMedia!.automaticCommentReply.mediaId,
                pauseTime:
                  res.value.commentMedia!.automaticCommentReply.pauseTime,
                productType: MediaProductType.Feed,
                prompt: res.value.commentMedia!.automaticCommentReply.prompt,
                sendCount:
                  res.value.commentMedia!.automaticCommentReply.sendCount,
              });
              if (!res.value.commentMedia.automaticCommentReply.pauseTime)
                setQuickReply(true);
            }
          }
          setLoading(false);
          setIsDataLoaded(true);
        }
        if (session.user.insightPermission) {
          var res2 = await GetServerResult<Boolean, IInsightPost>(
            MethodType.get,
            session,
            "Instagramer/Post/GetPostInsightInfo",
            null,
            [{ key: "postId", value: postId }],
          );
          if (res2.succeeded) {
            setInsight(res2.value);
          }
        }
      } finally {
        isFetchingRef.current = false;
      }
    },
    [session],
  );
  async function handleSearchComment(e: ChangeEvent<HTMLInputElement>) {
    var query = e.currentTarget.value;
    lastSearchQuery.current = query;
    if (query.length <= 0) {
      handleCloseSearch();
      return;
    }
    searchDispatch({ type: "SET_SEARCH_MODE", payload: true });
    searchDispatch({ type: "SET_LOADING", payload: true });
    searchDispatch({ type: "SET_NO_RESULT", payload: false });
    setSearchPeaple(query);
    if (peopleTimeOutId.current) clearTimeout(peopleTimeOutId.current);
    if (query.length > 0) {
      peopleTimeOutId.current = setTimeout(() => {
        if (query && query.length > 0) {
          if (peopleLocked) return;
          setPeopleLocked(true);
          handleApiPeopleSearch(query);
          setTimeout(() => {
            setPeopleLocked(false);
          }, 200);
        }
      }, 300);
    }
  }
  const handleApiPeopleSearch = useCallback(
    async (searchQuery: string) => {
      try {
        const info: IGetMediaCommentInfo = {
          justUnAnswered: false,
          mediaId: detailPost.pk,
          nextMaxId: null,
          searchInReplys: false,
          searchTerm: searchQuery,
        };
        var res = await GetServerResult<IGetMediaCommentInfo, IMedia>(
          MethodType.post,
          session,
          "Instagramer" + "/Comment/GetMediaComments",
          info,
        );
        if (searchQuery !== lastSearchQuery.current) return;
        console.log(res);
        if (res.succeeded) {
          const filteredComments = res.value.comments.filter((c) =>
            c.text.toLowerCase().includes(searchQuery.toLowerCase()),
          );
          if (filteredComments.length > 0) {
            res.value.comments = filteredComments;
            setSearchComments(res.value);
            searchDispatch({ type: "SET_LOADING", payload: false });
            searchDispatch({ type: "SET_NO_RESULT", payload: false });
          } else {
            searchDispatch({ type: "SET_LOADING", payload: false });
            searchDispatch({ type: "SET_NO_RESULT", payload: true });
          }
        } else {
          searchDispatch({ type: "SET_LOADING", payload: false });
          searchDispatch({ type: "SET_NO_RESULT", payload: true });
        }
      } catch {
        if (searchQuery === lastSearchQuery.current) {
          searchDispatch({ type: "SET_LOADING", payload: false });
          searchDispatch({ type: "SET_NO_RESULT", payload: true });
        }
      }
    },
    [session, detailPost.pk],
  );
  function handleCloseSearch() {
    searchDispatch({ type: "RESET_SEARCH" });
    setSearchPeaple("");
  }
  const handleUpdateAtuoReply = useCallback(
    async (sendReply: IMediaUpdateAutoReply) => {
      try {
        const res = await GetServerResult<
          IMediaUpdateAutoReply,
          IAutomaticReply
        >(
          MethodType.post,
          session,
          "Instagramer/Post/UpdateAutoReply",
          sendReply,
          [{ key: "postId", value: detailPost.postId.toString() }],
        );
        if (res.succeeded) {
          setAutoReply(res.value);
          if (!comments?.automaticCommentReply) {
            setComments((prev) => ({
              ...prev!,
              automaticCommentReply: res.value,
            }));
          }
          internalNotify(InternalResponseType.Ok, NotifType.Success);
        } else notify(res.info.responseType, NotifType.Warning);
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    },
    [session, detailPost.postId, comments?.automaticCommentReply],
  );
  async function handleResumeFeedAutoReply(e: ChangeEvent<HTMLInputElement>) {
    try {
      const activeAutoReply = e.target.checked;
      var res = await GetServerResult<boolean, boolean>(
        MethodType.get,
        session,
        "Instagramer" +
          `/Post/${!activeAutoReply ? "PauseAutoReply" : "ResumeAutoReply"}`,
        null,
        [
          {
            key: "postId",
            value: query.postid ? (query.postid as string) : "-1",
          },
        ],
      );
      if (res.succeeded)
        setAutoReply((prev) => ({
          ...prev,
          pauseTime: activeAutoReply ? null : Date.now(),
        }));
      else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  useEffect(() => {
    if (!session || status !== "authenticated") return;
    if (router.isReady && query.postid) {
      if (!isDataLoaded) {
        fetchData(query.postid as string);
      }
    } else if (router.isReady && query.postid === undefined) {
      router.push("/page/posts");
    }
  }, [router.isReady, session, status, query.postid, isDataLoaded, fetchData]);
  if (session?.user.currentIndex === -1) router.push("/user");
  if (session && !packageStatus(session)) router.push("/upgrade");
  return (
    session &&
    session.user.currentIndex !== -1 &&
    query.postid && (
      <>
        {/* head for SEO */}
        <Head>
          <meta name="theme-color" content="#2977ff" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
          />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="black-translucent"
          />
          <meta name="msapplication-TileColor" content="#2977ff" />
          <meta name="msapplication-navbutton-color" content="#2977ff" />
          <title>Bran.cy ▸ Insight post #{detailPost.tempId}</title>
          <meta
            name="description"
            content="Advanced Instagram post management tool"
          />
          <meta
            name="keywords"
            content="instagram, manage, tools, Brancy, post create, story create, Lottery, insight, Graph, like, share, comment, view, tag, hashtag"
          />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://www.Brancy.app/page/posts" />
        </Head>
        {/* head for SEO */}
        <main className="fullScreenPupup_bg">
          <div className="fullScreenPupup_header">
            <div className={styles.ToggleButton}>
              <FlexibleToggleButton
                options={[
                  {
                    label: t(LanguageKey.details),
                    id: ToggleOrder.FirstToggle,
                  },
                  {
                    label: t(LanguageKey.Insights),
                    id: ToggleOrder.SecondToggle,
                  },
                ]}
                onChange={(val) => {
                  startTransition(() => {
                    setToggleValue(val);
                  });
                }}
                selectedValue={toggleValue}
              />
            </div>
            <div className={styles.titleCard}>
              <div
                className={styles.headerIconcontainer}
                onClick={() => handleCopyLink(detailPost.instaShareLink)}
                title="Share this page">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="var(--text-h1)"
                  viewBox="0 0 36 36">
                  <path d="M26.3 2.3a6 6 0 1 0 0 12 6 6 0 0 0 0-12m-18 9a6 6 0 1 0 0 12 6 6 0 0 0 0-12m19.5 10.5a6 6 0 1 0 0 12 6 6 0 0 0 0-12" />
                  <path
                    opacity=".4"
                    fillRule="evenodd"
                    d="M20 8.3c-4 0-7.5 2.2-9.3 5.4L8 12.3a14 14 0 0 1 14-6.9l-.4 3zm10.7 10.5q0-3.8-2.3-6.6l2.3-1.9a13 13 0 0 1 1.4 14.9l-2.6-1.5a10 10 0 0 0 1.2-5m-21 2.7a11 11 0 0 0 10.4 7.9q1.7 0 3.3-.6l.9 2.9q-2 .6-4.2.6c-6.4 0-11.8-4.3-13.3-10.1z"
                  />
                </svg>
              </div>
              <div
                title="Close"
                onClick={() => {
                  router.push("/page/posts");
                }}
                className={styles.headerIconcontainer}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 170 180">
                  <path
                    d="m100 85 66-67c2-2 3-5 3-8 0-5-5-10-10-10a10 10 0 0 0-8 3L84 70 18 3a10 10 0 0 0-8-3A10 10 0 0 0 0 10c0 3 1 6 3 8l67 67-4 3-63 65a10 10 0 0 0 7 17c3 0 6-1 8-3l12-13 54-54 67 67c4 5 10 5 15 0 4-4 4-10 0-15L99 85z"
                    fill="var(--text-h1)"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="fullScreenPupup_content">
            {!RoleAccess(session, PartnerRole.PageView) && <NotAllowed />}
            {toggleValue === ToggleOrder.FirstToggle && (
              <>
                {loading && <Loading />}
                {!loading && comments && (
                  <>
                    <div className={styles.container}>
                      <div className="headerparent">
                        <div className="title">
                          {t(LanguageKey.navbar_Post)}
                          <span
                            className="explain"
                            style={{ color: "var(--color-dark-blue)" }}
                            title={`ℹ️ Post no. ${detailPost.tempId}`}>
                            (
                            <strong>
                              {Number(detailPost.tempId).toLocaleString()}
                            </strong>
                            )
                          </span>
                        </div>
                        {(() => {
                          const t = initialzedTime();
                          const d = new DateObject({
                            date: detailPost.createdTime * 1000,
                            calendar: t.calendar,
                            locale: t.locale,
                          });
                          return (
                            <div
                              className="date translate"
                              title="ℹ️ post publish date">
                              <span className="day">
                                {d.format("YYYY/MM/DD")}
                              </span>{" "}
                              -
                              <span className="hour">
                                {d.format("hh:mm a")}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                      {detailPost.isDeleted && (
                        <div className="headerparent">
                          <div className="title">
                            {t(LanguageKey.DeletedPost)}
                          </div>
                          <div
                            className="date translate"
                            title="ℹ️ post deleted date">
                            {detailPost.deleteTimeUnix ? (
                              (() => {
                                const t = initialzedTime();
                                const d = new DateObject({
                                  date: detailPost.deleteTimeUnix * 1000,
                                  calendar: t.calendar,
                                  locale: t.locale,
                                });
                                return (
                                  <>
                                    <span className="day">
                                      {d.format("YYYY/MM/DD")}
                                    </span>{" "}
                                    -
                                    <span className="hour">
                                      {d.format("hh:mm a")}
                                    </span>
                                  </>
                                );
                              })()
                            ) : (
                              <span className="day">
                                {t(LanguageKey.Unavailable)}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      <div
                        className="headerandinput"
                        style={{ position: "relative" }}>
                        {!isPlayingInlineVideo ||
                        detailPost.mediaType !== MediaType.Video ? (
                          <>
                            <img
                              onClick={() => {
                                if (!detailPost.canDownload) {
                                  internalNotify(
                                    InternalResponseType.NotPermittedForDownload,
                                    NotifType.Warning,
                                  );
                                  return;
                                }
                                if (detailPost.mediaType === MediaType.Image)
                                  mediaModal.openImage(
                                    basePictureUrl + detailPost.mediaUrl,
                                  );
                                else if (
                                  detailPost.mediaType === MediaType.Video
                                ) {
                                  setIsPlayingInlineVideo(true);
                                  setIsVideoLoading(true);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  if (!detailPost.canDownload) {
                                    internalNotify(
                                      InternalResponseType.NotPermittedForDownload,
                                      NotifType.Warning,
                                    );
                                    return;
                                  }
                                  if (detailPost.mediaType === MediaType.Image)
                                    mediaModal.openImage(
                                      basePictureUrl + detailPost.mediaUrl,
                                    );
                                  else if (
                                    detailPost.mediaType === MediaType.Video
                                  ) {
                                    setIsPlayingInlineVideo(true);
                                    setIsVideoLoading(true);
                                  }
                                }
                              }}
                              tabIndex={0}
                              role="button"
                              className={styles.picture}
                              alt="instagram post picture"
                              src={
                                basePictureUrl + detailPost.thumbnailMediaUrl
                              }
                              style={{
                                cursor:
                                  detailPost.mediaType === MediaType.Video
                                    ? "pointer"
                                    : "default",
                              }}
                            />
                            {detailPost.mediaType === MediaType.Video &&
                              !isPlayingInlineVideo && (
                                <div
                                  onClick={() => {
                                    if (detailPost.canDownload) {
                                      setIsPlayingInlineVideo(true);
                                      setIsVideoLoading(true);
                                    } else {
                                      internalNotify(
                                        InternalResponseType.NotPermittedForDownload,
                                        NotifType.Warning,
                                      );
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      if (detailPost.canDownload) {
                                        setIsPlayingInlineVideo(true);
                                        setIsVideoLoading(true);
                                      } else {
                                        internalNotify(
                                          InternalResponseType.NotPermittedForDownload,
                                          NotifType.Warning,
                                        );
                                      }
                                    }
                                  }}
                                  tabIndex={0}
                                  role="button"
                                  style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    cursor: "pointer",
                                    zIndex: 5,
                                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                                    borderRadius: "50%",
                                    width: "80px",
                                    height: "80px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.3s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      "rgba(0, 0, 0, 0.8)";
                                    e.currentTarget.style.transform =
                                      "translate(-50%, -50%) scale(1.1)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      "rgba(0, 0, 0, 0.6)";
                                    e.currentTarget.style.transform =
                                      "translate(-50%, -50%) scale(1)";
                                  }}
                                  title="Play video">
                                  <svg
                                    width="40"
                                    height="40"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                      d="M8 5.14v13.72L19 12L8 5.14z"
                                      fill="white"
                                      stroke="white"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </div>
                              )}
                          </>
                        ) : (
                          <>
                            {isVideoLoading && (
                              <img
                                className={styles.picture}
                                alt="instagram post picture"
                                src={
                                  basePictureUrl + detailPost.thumbnailMediaUrl
                                }
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                }}
                              />
                            )}
                            {isVideoLoading && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "50%",
                                  left: "50%",
                                  transform: "translate(-50%, -50%)",
                                  zIndex: 10,
                                }}>
                                <div
                                  style={{
                                    border:
                                      "4px solid rgba(255, 255, 255, 0.3)",
                                    borderTop: "4px solid white",
                                    borderRadius: "50%",
                                    width: "60px",
                                    height: "60px",
                                    animation: "spin 1s linear infinite",
                                  }}
                                />
                                <style jsx>{`
                                  @keyframes spin {
                                    0% {
                                      transform: rotate(0deg);
                                    }
                                    100% {
                                      transform: rotate(360deg);
                                    }
                                  }
                                `}</style>
                              </div>
                            )}
                            <video
                              className={styles.picture}
                              controls
                              autoPlay
                              style={{
                                opacity: isVideoLoading ? 0 : 1,
                                transition: "opacity 0.3s ease",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              onLoadedData={() => {
                                setIsVideoLoading(false);
                              }}
                              onCanPlay={() => {
                                setIsVideoLoading(false);
                              }}
                              onEnded={() => {
                                setIsPlayingInlineVideo(false);
                                setIsVideoLoading(false);
                              }}
                              onPause={(e) => {
                                if (
                                  e.currentTarget.currentTime === 0 ||
                                  e.currentTarget.ended
                                ) {
                                  setIsPlayingInlineVideo(false);
                                  setIsVideoLoading(false);
                                }
                              }}>
                              <source
                                src={basePictureUrl + detailPost.mediaUrl}
                                type="video/mp4"
                              />
                              Your browser does not support the video tag.
                            </video>
                          </>
                        )}
                        <a
                          href={
                            basePictureUrl + detailPost.mediaUrl + "/download"
                          }
                          download
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            padding: "4px 6px",
                            color: "white",
                            fontSize: "12px",
                            borderRadius: "15px",
                            textDecoration: "none",
                            zIndex: 10,
                          }}
                          title="Download media">
                          <svg
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            viewBox="0 0 36 36">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M19.5 19.9a1.5 1.5 0 0 0-3 0v6.7h-1.7a2 2 0 0 0-1.5 1c-.4.9 0 1.6.1 1.8l.5.7 1.7 2 1 .8q.4.4 1.4.5 1-.1 1.5-.5l1-.9 1.5-1.8V30l.6-.7c0-.2.5-.9.1-1.8a2 2 0 0 0-1.5-1h-1.7z"
                              fill="var(--color-gray)"
                            />
                            <path
                              opacity=".4"
                              d="M1.9 18.8a9 9 0 0 1 6.3-8.3l.5-.3.2-.5A9.4 9.4 0 0 1 27.3 11q0 .5.2.6l.6.3a7.9 7.9 0 0 1-1.9 15.5l-.6-.1q-.2 0-.4-.6a4 4 0 0 0-2.6-2.2l-.8-.3v-4.3a3.8 3.8 0 0 0-7.6 0v4.3l-.9.3a4 4 0 0 0-2.6 2.2q-.1.5-.4.6h-.5a8.6 8.6 0 0 1-8-8.5"
                              fill="var(--color-gray)"
                            />
                          </svg>
                        </a>
                        {detailPost.children.length > 0 && (
                          <div className={styles.postpreview}>
                            {detailPost.children.map((v, i) => (
                              <img
                                key={i}
                                className={styles.postpicture}
                                alt="instagram post picture"
                                src={basePictureUrl + v.thumbnailMediaUrl}
                                onClick={() =>
                                  handlePostPictureClick(
                                    v.thumbnailMediaUrl,
                                    v.mediaType,
                                    v.mediaUrl,
                                  )
                                }
                                style={{
                                  boxShadow:
                                    activeChildUrl === v.thumbnailMediaUrl
                                      ? "0 0 0 3px var(--color-dark-blue60)"
                                      : "none",
                                }}
                              />
                            ))}
                            {divArray}
                          </div>
                        )}
                      </div>
                      <div className="headerparent">
                        <div className={styles.postdetail}>
                          <img
                            width="20px"
                            height="20px"
                            title="ℹ️ like count"
                            alt="like"
                            src={"/icon-like.svg"}
                          />
                          <span>{detailPost.likeCount.toLocaleString()}</span>
                        </div>
                        <div className={styles.postdetail}>
                          <img
                            title="ℹ️ comment count"
                            width="20px"
                            height="20px"
                            alt="comment"
                            src={"/icon-comment.svg"}
                          />
                          <span>
                            {detailPost.commentCount.toLocaleString()}
                          </span>
                        </div>
                        <div
                          className={
                            detailPost.saveCount > 0
                              ? styles.postdetail
                              : `${styles.postdetail} fadeDiv`
                          }>
                          <img
                            title="ℹ️ save count"
                            width="20px"
                            height="20px"
                            alt="save"
                            src={"/icon-save.svg"}
                          />
                          <span>
                            {detailPost.saveCount > 0
                              ? detailPost.saveCount.toLocaleString()
                              : "--"}
                          </span>
                        </div>
                        <div
                          className={
                            detailPost.shareCount > 0
                              ? styles.postdetail
                              : `${styles.postdetail} fadeDiv`
                          }>
                          <img
                            title="ℹ️ Send count"
                            width="20px"
                            height="20px"
                            alt="send"
                            src={"/icon-send.svg"}
                          />
                          <span>
                            {detailPost.shareCount > 0
                              ? detailPost.shareCount.toLocaleString()
                              : "--"}
                          </span>
                        </div>
                        <div
                          className={
                            detailPost.viewCount > 0
                              ? styles.postdetail
                              : `${styles.postdetail} fadeDiv`
                          }>
                          <img
                            title="ℹ️ Reach count"
                            width="20px"
                            height="20px"
                            alt="view"
                            src={"/icon-view.svg"}
                          />
                          <span>
                            {detailPost.viewCount > 0
                              ? detailPost.viewCount.toLocaleString()
                              : "--"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.container}>
                      {session.user.commentPermission && (
                        <>
                          <div className="headerandinput">
                            <div className="headerparent">
                              <div className="title2">
                                {t(
                                  LanguageKey.pageToolspopup_TurnoffCommenting,
                                )}
                              </div>
                              <ToggleCheckBoxButton
                                name=" TurnoffCommenting"
                                handleToggle={async (e) => {
                                  await GetServerResult<boolean, boolean>(
                                    MethodType.get,
                                    session,
                                    "Instagramer" +
                                      "/post/ChangeCommentingStatus",
                                    null,
                                    [
                                      {
                                        key: "postId",
                                        value: detailPost.postId.toString(),
                                      },
                                      {
                                        key: "isEnable",
                                        value: !e.target.checked
                                          ? "true"
                                          : "false",
                                      },
                                    ],
                                  );
                                  setDetailPost((prev) => ({
                                    ...prev,
                                    commentEnabled: e.target.checked,
                                  }));
                                }}
                                checked={!detailPost.commentEnabled}
                                title={" TurnoffCommenting"}
                                role={" switch"}
                              />
                            </div>
                            <div className="explain">
                              {t(
                                LanguageKey.pageToolspopup_TurnoffCommentingExplain,
                              )}
                            </div>
                          </div>
                          <div className="headerandinput">
                            <div className="headerparent">
                              <div
                                className="title2"
                                role="heading"
                                aria-level={3}>
                                {t(LanguageKey.autocommentReply)}
                              </div>
                              <ToggleCheckBoxButton
                                name="quick-reply"
                                handleToggle={(e) => {
                                  handleResumeFeedAutoReply(e);
                                  setQuickReply(!quickReply);
                                }}
                                checked={quickReply}
                                title="Toggle quick reply"
                                role="switch"
                                aria-checked={quickReply}
                                aria-label="Quick reply toggle"
                              />
                            </div>
                            <div className="explain">
                              {t(LanguageKey.QuickReplyexplain)}
                            </div>
                            <div
                              className="headerparent"
                              role="group"
                              aria-label="Product settings">
                              <button
                                disabled={!quickReply}
                                className={
                                  quickReply ? "cancelButton" : "disableButton"
                                }
                                onClick={() => setShowQuickReplyPopup(true)}>
                                {t(LanguageKey.marketstatisticsfeatures)}
                              </button>
                            </div>
                            {/* <div className="title2" role="heading" aria-level={3}>
                              {t(LanguageKey.autocommentReply)}
                            </div>
                            <div className="explain">{t(LanguageKey.QuickReplyexplain)}</div> */}
                            {/* <button
                            className={`cancelButton ${
                              QuickReply ? "" : "fadeDiv"
                            }`}
                            onClick={() => {
                              if (QuickReply) {
                                setShowQuickReplyPopup(true);
                              }
                            }}
                            disabled={!QuickReply}>
                            {t(LanguageKey.marketstatisticsfeatures)}
                          </button> */}
                            {/* <button className="cancelButton" onClick={() => setShowQuickReplyPopup(true)}>
                              {t(LanguageKey.marketstatisticsfeatures)}
                            </button> */}
                          </div>
                        </>
                      )}
                      <div className="headerandinput">
                        <div className="headerparent">
                          <div className="title">{t(LanguageKey.caption)}</div>
                          <div className={`counter translate`}>
                            <div className={styles.icon}>
                              <img
                                className={styles.hashtagicon}
                                alt="Character Count"
                                src={"/T.svg"}
                              />
                            </div>
                            (<strong>{captionLength.toLocaleString()}</strong> /{" "}
                            <strong>2,200</strong>)
                          </div>
                        </div>
                        <div
                          className={`${styles.captionfiled} ${isRTL(detailPost.caption) ? "rtl" : "ltr"}`}>
                          {detailPost.caption}
                        </div>
                      </div>
                      <div className="headerandinput">
                        <div className="headerparent">
                          <div className="title">
                            {t(LanguageKey.pageTools_hashtagList)}
                          </div>
                          <div className={`counter translate`}>
                            <div className={styles.icon}>
                              <img
                                className={styles.hashtagicon}
                                alt="Hashtag Icon"
                                src={"/icon-hashtag.svg"}
                              />
                            </div>
                            (
                            <strong>
                              {detailPost.hashtags
                                ? detailPost.hashtags.length
                                : 0}
                            </strong>
                            /<strong>30</strong>)
                          </div>
                        </div>
                        <div className="explain">
                          {t(LanguageKey.pageToolspopup_TopHashtagexplain)}
                        </div>
                        <div className={styles.tophashtagfield}>
                          {detailPost.hashtags?.map((u, j) => (
                            <div
                              key={j}
                              className={styles.tagHashtag}
                              title="ℹ️ Total hashtag usage in all posts">
                              <img
                                className={styles.hashtagicon}
                                alt="Hashtag Icon"
                                src={"/icon-hashtag.svg"}
                              />
                              {u.hashtag}
                              <div className={styles.usecount}>
                                ( <strong>{u.useCount.toLocaleString()}</strong>{" "}
                                )
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {session.user.commentPermission && (
                      <div className={styles.container}>
                        <div className="headerandinput">
                          <div className="headerparent">
                            <div
                              className="title"
                              style={{ gap: "var(--gap-5)" }}>
                              {t(LanguageKey.comments)}
                              <b className="explain" title="ℹ️ Total comments">
                                ({detailPost.commentCount.toLocaleString()})
                              </b>
                              |
                              <span
                                style={{
                                  color: "var(--color-dark-blue)",
                                  fontSize: "var(--font-12)",
                                }}
                                title="ℹ️ Total unread comments">
                                {t(LanguageKey.new)} (
                                <strong>
                                  {detailPost.newCommentCount.toLocaleString()}
                                </strong>
                                )
                              </span>
                            </div>
                            <div
                              className="headerparent"
                              style={{ width: "70px" }}>
                              <Tooltip
                                tooltipValue={
                                  t(LanguageKey.WinnerPicker) +
                                  "," +
                                  t(LanguageKey.exportXlxs)
                                }
                                position="bottom"
                                onClick={true}>
                                <img
                                  className={styles.Giveaway}
                                  onClick={() => {
                                    setShowLotteryPopup(true);
                                  }}
                                  alt="Lottery (Giveaway) icon"
                                  src={"/random.svg"}
                                />
                              </Tooltip>
                              <Tooltip
                                tooltipValue={t(LanguageKey.navbar_Comments)}
                                position="bottom"
                                onClick={true}>
                                <img
                                  onClick={() => {
                                    if (comments?.comments.length === 0) return;
                                    router.push(
                                      `/message/comments?mediaId=${detailPost.pk}&&commentType=post`,
                                    );
                                  }}
                                  className={`${styles.shortcut} ${comments?.comments.length === 0 && "fadeDiv"}`}
                                  alt="link to comment page icon"
                                  src={"/shortcut.svg"}
                                />
                              </Tooltip>
                            </div>
                          </div>
                          <div className={styles.commentbox}>
                            <InputText
                              className={"serachMenuBar"}
                              placeHolder={t(LanguageKey.search)}
                              value={searchPepaple}
                              handleInputChange={handleSearchComment}
                            />
                            {!searchState.searchMode &&
                              comments!.comments.length === 0 && (
                                <div
                                  className="explain"
                                  style={{ textAlign: "center" }}>
                                  {t(LanguageKey.emptycomment)}
                                </div>
                              )}
                            {!searchState.searchMode &&
                              comments!.comments.length > 0 && (
                                <Slider
                                  onReachEnd={() => {
                                    if (!comments?.nextMaxId) return;
                                    fetchComments(
                                      detailPost.pk,
                                      comments!.nextMaxId,
                                    );
                                  }}
                                  isLoading={isFetchingMoreComments}
                                  itemsPerSlide={commentsPerSlide}>
                                  {comments!.comments.map((u, i) => (
                                    <div
                                      key={u.id || i}
                                      className={styles.comment}>
                                      <img
                                        className="instagramimage"
                                        title="◰ resize the picture"
                                        onClick={() =>
                                          handleImageClick(
                                            basePictureUrl + u.profileUrl,
                                            u.username,
                                          )
                                        }
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src =
                                            "/no-profile.svg";
                                        }}
                                        style={{
                                          height: "40px",
                                          width: "40px",
                                          cursor: "pointer",
                                        }}
                                        alt="instagram profile picture"
                                        // quality={50}
                                        width={40}
                                        height={40}
                                        src={basePictureUrl + u.profileUrl}
                                      />
                                      <div className={styles.commentdetail}>
                                        <div
                                          className="headerandinput"
                                          style={{ gap: "2px" }}>
                                          <div
                                            className="instagramusername"
                                            style={{ fontSize: "12px" }}>
                                            {u.username}
                                          </div>
                                          <div className="explain">
                                            {new DateObject({
                                              date: u.createdTime / 1000,
                                              calendar:
                                                initialzedTime().calendar,
                                              locale: initialzedTime().locale,
                                            }).format(
                                              "YYYY/MM/DD - hh:mm a",
                                            )}{" "}
                                            •{" "}
                                            {formatTimeAgo(
                                              u.createdTime / 1000,
                                            )}
                                          </div>
                                        </div>
                                        <div
                                          className={`${styles.commenttext} ${isRTL(u.text) ? "rtl" : "ltr"}`}
                                          title={u.text}>
                                          {u.text}
                                        </div>
                                        {u.replys!.length > 0 && (
                                          <div
                                            title="◰ view replies"
                                            className={styles.commentreply}
                                            onClick={() => togglePopup(u.id)}>
                                            {t(LanguageKey.viewreplies)} 
                                            <strong>{u.replys?.length}</strong>
                                          </div>
                                        )}
                                      </div>
                                      {profilePopupState.showPopup && (
                                        <>
                                          <div
                                            className="dialogBg"
                                            onClick={handleClosePopup}
                                          />
                                          <div className={styles.popupContent}>
                                            <div className="headerparent">
                                              @{" "}
                                              {profilePopupState.popupUsername}
                                              <img
                                                title="Close popup"
                                                className="closepopup"
                                                alt="close button"
                                                src="/close-box.svg"
                                                onClick={handleClosePopup}
                                              />
                                            </div>
                                            <img
                                              className={styles.profileimagebig}
                                              src={profilePopupState.popupImage}
                                              alt="Popup profile"
                                              title="profile picture"
                                            />
                                          </div>
                                        </>
                                      )}
                                      {showPopupComment !== "" && (
                                        <>
                                          <div
                                            className="dialogBg"
                                            onClick={() => togglePopup("")}
                                          />
                                          <div className={styles.popupContent}>
                                            <div className="headerparent">
                                              {t(LanguageKey.viewreplies)}
                                              <img
                                                title="Close popup"
                                                className="closepopup"
                                                alt="close button"
                                                src="/close-box.svg"
                                                onClick={() => togglePopup("")}
                                              />
                                            </div>
                                            <div className={styles.commentall}>
                                              {comments!.comments
                                                .find(
                                                  (x) =>
                                                    x.id === showPopupComment,
                                                )!
                                                .replys!.map((u) => {
                                                  return (
                                                    <div
                                                      key={u.id}
                                                      className={
                                                        styles.comment
                                                      }>
                                                      <img
                                                        className="instagramimage"
                                                        style={{
                                                          height: "40px",
                                                          width: "40px",
                                                          cursor: "pointer",
                                                        }}
                                                        title="◰ resize the picture"
                                                        onClick={() =>
                                                          handleImageClick(
                                                            basePictureUrl +
                                                              u.profileUrl,
                                                            u.username,
                                                          )
                                                        }
                                                        alt="instagram profile picture"
                                                        src={
                                                          basePictureUrl +
                                                          u.profileUrl
                                                        }
                                                        onError={(e) => {
                                                          (
                                                            e.target as HTMLImageElement
                                                          ).src =
                                                            "/no-profile.svg";
                                                        }}
                                                      />
                                                      <div
                                                        className={
                                                          styles.commentdetail
                                                        }>
                                                        <div
                                                          className="instagramusername"
                                                          style={{
                                                            fontSize: "12px",
                                                          }}>
                                                          {" "}
                                                          {u.username}
                                                        </div>
                                                        <div
                                                          className={`${styles.replytext} ${
                                                            isRTL(u.text)
                                                              ? "rtl"
                                                              : "ltr"
                                                          }`}>
                                                          {" "}
                                                          {u.text}
                                                        </div>
                                                        <div className="explain">
                                                          {new DateObject({
                                                            date:
                                                              u.createdTime *
                                                              1000,
                                                            calendar:
                                                              initialzedTime()
                                                                .calendar,
                                                            locale:
                                                              initialzedTime()
                                                                .locale,
                                                          }).format(
                                                            "YYYY/MM/DD - hh:mm a",
                                                          )}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                            </div>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  ))}
                                </Slider>
                              )}
                            {searchState.searchMode && (
                              <>
                                {searchState.loading && (
                                  <div className={styles.noresult}>
                                    <img
                                      style={{ maxWidth: "200px" }}
                                      width="60%"
                                      alt="No result"
                                      src={"/noresult.svg"}
                                    />
                                    <div>{t(LanguageKey.searching)}</div>
                                  </div>
                                )}
                                {!searchState.loading &&
                                  searchState.noresult && (
                                    <div className={styles.noresult}>
                                      <img
                                        style={{ maxWidth: "200px" }}
                                        width="60%"
                                        alt="No result"
                                        src={"/noresult.svg"}
                                      />
                                      {t(LanguageKey.noresult)}
                                    </div>
                                  )}
                                {!searchState.loading &&
                                  !searchState.noresult && (
                                    <Slider
                                      slidesPerView={1}
                                      spaceBetween={1}
                                      navigation={true}
                                      pagination={{
                                        clickable: true,
                                        dynamicBullets: true,
                                      }}
                                      itemsPerSlide={5}>
                                      {searchComments!.comments.map((u, i) => (
                                        <div
                                          key={u.id || i}
                                          className={`${styles.comment} translate`}>
                                          <img
                                            className="instagramimage"
                                            style={{
                                              height: "40px",
                                              width: "40px",
                                              cursor: "pointer",
                                            }}
                                            title="◰ resize the picture"
                                            onClick={() =>
                                              handleImageClick(
                                                basePictureUrl + u.profileUrl,
                                                u.username,
                                              )
                                            }
                                            alt="instagram profile picture"
                                            // quality={50}
                                            width={40}
                                            height={40}
                                            src={basePictureUrl + u.profileUrl}
                                            onError={(e) => {
                                              (
                                                e.target as HTMLImageElement
                                              ).src = "/no-profile.svg";
                                            }}
                                          />
                                          <div className={styles.commentdetail}>
                                            <div
                                              className="instagramusername"
                                              style={{ fontSize: "12px" }}>
                                              {u.username}
                                            </div>
                                            <div
                                              className={`${styles.commenttext} ${isRTL(u.text) ? "rtl" : "ltr"}`}
                                              title={u.text}>
                                              {u.text}
                                            </div>
                                            <div
                                              className={styles.timeandreply}>
                                              <div className="explain">
                                                {new DateObject({
                                                  date: u.createdTime / 1000,
                                                  calendar:
                                                    initialzedTime().calendar,
                                                  locale:
                                                    initialzedTime().locale,
                                                }).format(
                                                  "YYYY/MM/DD - hh:mm A",
                                                )}
                                              </div>
                                              {u.replys!.length > 0 && (
                                                <div
                                                  title="◰ view replies"
                                                  className={
                                                    styles.commentreply
                                                  }
                                                  onClick={() =>
                                                    togglePopup(u.id)
                                                  }>
                                                  {t(LanguageKey.viewreplies)} (
                                                  <strong>
                                                    {u.replys?.length}
                                                  </strong>
                                                  )
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          {showPopupComment && (
                                            <>
                                              <div
                                                className="dialogBg"
                                                onClick={() => togglePopup("")}
                                              />
                                              <div
                                                className={`${styles.popupContent} translate`}>
                                                <div className="headerparent">
                                                  {t(
                                                    LanguageKey.allRepliedcomments,
                                                  )}
                                                  <img
                                                    title="Close popup"
                                                    className="closepopup"
                                                    alt="close button"
                                                    src="/close-box.svg"
                                                    onClick={() =>
                                                      togglePopup("")
                                                    }
                                                  />
                                                </div>
                                                <div
                                                  className={styles.commentall}>
                                                  {searchComments!.comments
                                                    .find(
                                                      (x) =>
                                                        x.id ===
                                                        showPopupComment,
                                                    )!
                                                    .replys!.map((u) => {
                                                      return (
                                                        <div
                                                          key={u.id}
                                                          className={
                                                            styles.comment
                                                          }>
                                                          <img
                                                            className="instagramimage"
                                                            style={{
                                                              height: "40px",
                                                              width: "40px",
                                                              cursor: "pointer",
                                                            }}
                                                            title="◰ resize the picture"
                                                            onClick={() =>
                                                              handleImageClick(
                                                                basePictureUrl +
                                                                  u.profileUrl,
                                                                u.username,
                                                              )
                                                            }
                                                            alt="instagram profile picture"
                                                            src={
                                                              basePictureUrl +
                                                              u.profileUrl
                                                            }
                                                            onError={(e) => {
                                                              (
                                                                e.target as HTMLImageElement
                                                              ).src =
                                                                "/no-profile.svg";
                                                            }}
                                                          />
                                                          <div
                                                            className={
                                                              styles.commentdetail
                                                            }>
                                                            <div
                                                              className="instagramusername"
                                                              style={{
                                                                fontSize:
                                                                  "12px",
                                                              }}>
                                                              {" "}
                                                              {u.username}
                                                            </div>
                                                            <div
                                                              className={`${styles.replytext} ${
                                                                isRTL(u.text)
                                                                  ? "rtl"
                                                                  : "ltr"
                                                              }`}>
                                                              {u.text}
                                                            </div>
                                                            <div className="explain">
                                                              {new DateObject({
                                                                date:
                                                                  u.createdTime *
                                                                  1000,
                                                                calendar:
                                                                  initialzedTime()
                                                                    .calendar,
                                                                locale:
                                                                  initialzedTime()
                                                                    .locale,
                                                              }).format(
                                                                "YYYY/MM/DD - hh:mm a",
                                                              )}
                                                            </div>
                                                          </div>
                                                        </div>
                                                      );
                                                    })}
                                                </div>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      ))}
                                    </Slider>
                                  )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
            {toggleValue === ToggleOrder.SecondToggle && (
              <>
                {!session?.user.insightPermission ? (
                  <NotPermission permissionType={PermissionType.Insights} />
                ) : (
                  <>
                    {loading && <Loading />}
                    {!loading && insight && (
                      <>
                        <div className={`${styles.container} translate`}>
                          {/* <div className={"headerparent"}>
                          {insight.engagmentFollowerType && (
                          <>
                            <div className={styles.header}>Engagement</div>
                            //!do not remove this code
                            <div className={styles.typeparent}>
                              <div className={styles.followertype}>
                                <img  className={styles.iconFollower}
                                  alt="follower icon"
                                  src="/Icon_follower.svg"
                                />
                                <div className={styles.totalcounter}>{insight.engagmentFollowerType.followerCount}</div>
                              </div>
                              <div className={styles.followertype}>
                                <img
                                  className={styles.iconFollower}
                                  alt="NonFollower icon"
                                  src="/Icon_NonFollower.svg"
                                />
                                <div className={styles.totalcounter}>{insight.engagmentFollowerType.followerCount}</div>
                              </div>
                            </div>
                          </>
                          )}
                          </div> */}
                          <div className="headerandinput">
                            <div className="title">Engagement</div>
                            <div className={styles.Tableheader}>
                              Interactions
                              <div>
                                {(
                                  (detailPost.commentCount > 0
                                    ? detailPost.commentCount
                                    : 0) +
                                  (detailPost.saveCount > 0
                                    ? detailPost.saveCount
                                    : 0) +
                                  (detailPost.shareCount > 0
                                    ? detailPost.shareCount
                                    : 0) +
                                  (detailPost.likeCount > 0
                                    ? detailPost.likeCount
                                    : 0)
                                ).toLocaleString()}
                              </div>
                            </div>
                            <div className={styles.row}>
                              <div className={styles.rowheader}>Like</div>
                              {(detailPost.likeCount > 0
                                ? detailPost.likeCount
                                : "--"
                              ).toLocaleString()}
                            </div>
                            <div className={styles.row}>
                              <div className={styles.rowheader}>Comment</div>
                              {(detailPost.commentCount > 0
                                ? detailPost.commentCount
                                : "--"
                              ).toLocaleString()}
                            </div>
                            <div className={styles.row}>
                              <div className={styles.rowheader}>Save</div>
                              {(detailPost.saveCount > 0
                                ? detailPost.saveCount
                                : "--"
                              ).toLocaleString()}
                            </div>
                            <div className={styles.row}>
                              <div className={styles.rowheader}>Share</div>
                              {(detailPost.shareCount > 0
                                ? detailPost.shareCount
                                : "--"
                              ).toLocaleString()}
                            </div>
                            <div className={styles.row}>
                              <div className={styles.rowheader}>
                                Reels Skip Rate{" "}
                              </div>
                              {detailPost.reelsSkipRate
                                ? detailPost.reelsSkipRate.toLocaleString() +
                                  "%"
                                : "--"}
                            </div>
                          </div>
                          {
                            <>
                              {/*  <div className={styles.Tableheader}>
                              <div className={styles.Tableheadertext}>Reach</div>
                              <div className={styles.Tableheadercounter}>
                                {(detailPost.reachCount >= 0 ? detailPost.reachCount : "--").toLocaleString()}
                              </div>
                            </div>
                           <div className={styles.Tableheader1}>
                              {
                                <div className={styles.row}>
                                  <div className={styles.rowheader}>
                                    <div className={styles.insightlabel}>
                                      Reach
                                    </div>
                                  </div>
                                  <div className={styles.insightlabel}>
                                    {insight.postImpressionInfo && insight.postImpressionInfo.home > 0
                                      ? insight.postImpressionInfo.home.toLocaleString()
                                      : "--"}
                                  </div>
                                </div>
                              }
                            </div> */}
                            </>
                          }
                          {
                            <div className="headerandinput">
                              <div className="headerparent">
                                <div className="title">Reach</div>
                                <div
                                  className="title"
                                  style={{ paddingInlineEnd: "20px" }}>
                                  {(detailPost.reachCount >= 0
                                    ? detailPost.reachCount
                                    : "--"
                                  ).toLocaleString()}
                                </div>
                              </div>
                              <div className={styles.Tableheader}>
                                Profile Activity
                                <div>
                                  {insight.profileActivityInfo &&
                                    insight.profileActivityInfo.totalCount.toLocaleString()}
                                </div>
                              </div>
                              <div className={styles.row}>
                                <div className={styles.rowheader}>
                                  Profile Visits
                                </div>
                                {(insight.profileActivityInfo &&
                                insight.profileActivityInfo.profileVisits > 0
                                  ? insight.profileActivityInfo.profileVisits
                                  : "--"
                                ).toLocaleString()}
                              </div>
                              <div className={styles.row}>
                                <div className={styles.rowheader}>Follows</div>
                                {(insight.profileActivityInfo &&
                                insight.profileActivityInfo.follows > 0
                                  ? insight.profileActivityInfo.follows
                                  : "--"
                                ).toLocaleString()}
                              </div>
                              <div className={styles.row}>
                                <div className={styles.rowheader}>
                                  BioLink Button Taps
                                </div>
                                {(insight.profileActivityInfo &&
                                insight.profileActivityInfo.externalLinkTaps > 0
                                  ? insight.profileActivityInfo.externalLinkTaps
                                  : "--"
                                ).toLocaleString()}
                              </div>
                              <div className={styles.row}>
                                <div className={styles.rowheader}>
                                  Bussiness Address Taps
                                </div>
                                {(insight.profileActivityInfo &&
                                insight.profileActivityInfo
                                  .bussinessAddressTaps > 0
                                  ? insight.profileActivityInfo
                                      .bussinessAddressTaps
                                  : "--"
                                ).toLocaleString()}
                              </div>
                              <div className={`headerandinput fadeDiv`}>
                                <div className={styles.row}>
                                  <div className={styles.rowheader}>
                                    Call Button Taps
                                  </div>
                                  {(insight.profileActivityInfo &&
                                  insight.profileActivityInfo.callButtonTaps > 0
                                    ? insight.profileActivityInfo.callButtonTaps
                                    : "--"
                                  ).toLocaleString()}
                                </div>
                                <div className={styles.row}>
                                  <div className={styles.rowheader}>
                                    Email Button Taps
                                  </div>
                                  {(insight.profileActivityInfo &&
                                  insight.profileActivityInfo.emailButtonTaps >
                                    0
                                    ? insight.profileActivityInfo
                                        .emailButtonTaps
                                    : "--"
                                  ).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          }
                          {/* <div className={`headerandinput fadeDiv`}>
                        <div className={styles.Tableheader}>
                          Imperssions
                          <div>
                            {insight.profileActivityInfo &&
                              insight.profileActivityInfo.totalCount.toLocaleString()}
                          </div>
                        </div>
                        <div className={"headerparent"}>
                          {
                            <>
                              <div className={styles.header}>Reach</div>
                              //!do not remove this code
                              <div className={styles.typeparent}>
                                <div className={styles.followertype}>
                                  <img
                                    className={styles.iconFollower}
                                    alt="follower icon"
                                    src="/icon_follower.svg"
                                  />
                                  <div className={styles.totalcounter}>
                                    {insight.reachFollowerType
                                      ? insight.reachFollowerType.followerCount.toLocaleString()
                                      : "--"}
                                  </div>
                                </div>
                                <div className={styles.followertype}>
                                  <img
                                    className={styles.iconFollower}
                                    alt="NonFollower icon"
                                    src="/Icon_NonFollower.svg"
                                  />
                                  <div className={styles.totalcounter}>
                                    {insight.reachFollowerType
                                      ? insight.reachFollowerType.nonFollowerCount.toLocaleString()
                                      : "--"}
                                  </div>
                                </div>
                              </div>
                            </>
                          }
                        </div>
                        <div className={styles.row}>
                          <div className={styles.rowheader}>From Profile</div>
                          {insight.postImpressionInfo &&
                          insight.postImpressionInfo.profile > 0
                            ? insight.postImpressionInfo.profile.toLocaleString()
                            : "--"}
                        </div>
                        <div className={styles.row}>
                          <div className={styles.rowheader}>From Hashtag</div>
                          {insight.postImpressionInfo &&
                          insight.postImpressionInfo.hashtag > 0
                            ? insight.postImpressionInfo.hashtag.toLocaleString()
                            : "--"}
                        </div>
                        <div className={styles.row}>
                          <div className={styles.rowheader}>From Explorer</div>
                          {insight.postImpressionInfo &&
                          insight.postImpressionInfo.explorer > 0
                            ? insight.postImpressionInfo.explorer.toLocaleString()
                            : "--"}
                        </div>
                        <div className={styles.row}>
                          <div className={styles.rowheader}>From Other</div>
                          {insight.postImpressionInfo
                            ? insight.postImpressionInfo.other.toLocaleString()
                            : "--"}
                        </div>
                      </div> */}
                          <div className="headerandinput">
                            <div className={styles.Tableheader}>
                              <div className="title">Watch Insight</div>
                              <div className={styles.watchtimeheader}>
                                HH:MM:SS
                              </div>
                            </div>
                            <div className={styles.row}>
                              <div className={styles.rowheader}>
                                Video Average Time
                              </div>
                              <div className={styles.watchtime}>
                                {detailPost.videoViewAverageTime &&
                                detailPost.videoViewAverageTime > 0
                                  ? (() => {
                                      const { hours, minutes, seconds } =
                                        convertMillisecondsToTime(
                                          detailPost.videoViewAverageTime,
                                        );
                                      const pad = (num: number) =>
                                        num.toString().padStart(2, "0");
                                      return `${hours}:${pad(minutes)}:${pad(seconds)}`;
                                    })()
                                  : "--"}
                              </div>
                            </div>
                            <div className={styles.row}>
                              <div className={styles.rowheader}>
                                Video Total Time
                              </div>
                              <div className={styles.watchtime}>
                                {detailPost.videoViewTotalTime &&
                                detailPost.videoViewTotalTime > 0
                                  ? (() => {
                                      const { hours, minutes, seconds } =
                                        convertMillisecondsToTime(
                                          detailPost.videoViewTotalTime,
                                        );
                                      const pad = (num: number) =>
                                        num.toString().padStart(2, "0");
                                      return `${hours}:${pad(minutes)}:${pad(seconds)}`;
                                    })()
                                  : "--"}
                              </div>
                            </div>
                          </div>
                          (
                          {insight.superFigures &&
                            insight.superFigures.length > 0}
                          )&&
                        </div>
                        <div className={styles.containergraph}>
                          <div className="headerandinput">
                            <div className="title">
                              {insight.superFigures[0] &&
                                (() => {
                                  const propsMulti = buildMultiChartProps(0);
                                  return propsMulti
                                    ? (propsMulti.objectNavigators[0].title ??
                                        "Super Figures")
                                    : "Super Figures";
                                })()}
                            </div>
                            {insight.superFigures[0] &&
                              (() => {
                                const propsMulti = buildMultiChartProps(0);
                                if (!propsMulti) return null;
                                return (
                                  <MultiChart
                                    id={`insight-0`}
                                    name={
                                      propsMulti.objectNavigators[0].title ||
                                      `insight-0`
                                    }
                                    seriesData={propsMulti.seriesData as any}
                                    objectNavigators={
                                      propsMulti.objectNavigators as any
                                    }
                                    onObjectNavigatorChange={(
                                      navIndex,
                                      firstIndex,
                                      secondIndex,
                                    ) => {
                                      setMultiSelections((prev) => {
                                        const next = prev.slice();
                                        next[0] = {
                                          first: firstIndex,
                                          second: secondIndex,
                                        };
                                        return next;
                                      });
                                    }}
                                  />
                                );
                              })()}
                          </div>
                          <div className="headerandinput">
                            <div className="title">
                              {insight.superFigures[1] &&
                                (() => {
                                  const propsMulti = buildMultiChartProps(1);
                                  return propsMulti
                                    ? (propsMulti.objectNavigators[0].title ??
                                        "Super Figures")
                                    : "Super Figures";
                                })()}
                            </div>
                            {insight.superFigures[1] &&
                              (() => {
                                const propsMulti = buildMultiChartProps(1);
                                if (!propsMulti) return null;
                                return (
                                  <MultiChart
                                    id={`insight-1`}
                                    name={
                                      propsMulti.objectNavigators[0].title ||
                                      `insight-1`
                                    }
                                    seriesData={propsMulti.seriesData as any}
                                    objectNavigators={
                                      propsMulti.objectNavigators as any
                                    }
                                    onObjectNavigatorChange={(
                                      navIndex,
                                      firstIndex,
                                      secondIndex,
                                    ) => {
                                      setMultiSelections((prev) => {
                                        const next = prev.slice();
                                        next[1] = {
                                          first: firstIndex,
                                          second: secondIndex,
                                        };
                                        return next;
                                      });
                                    }}
                                  />
                                );
                              })()}
                          </div>
                        </div>
                        <div className={styles.containergraph}>
                          <div className="headerandinput">
                            <div className="title">
                              {insight.superFigures[2] &&
                                (() => {
                                  const propsMulti = buildMultiChartProps(2);
                                  return propsMulti
                                    ? (propsMulti.objectNavigators[0].title ??
                                        "Super Figures")
                                    : "Super Figures";
                                })()}
                            </div>
                            {insight.superFigures[2] &&
                              (() => {
                                const propsMulti = buildMultiChartProps(2);
                                if (!propsMulti) return null;
                                return (
                                  <MultiChart
                                    id={`insight-2`}
                                    name={
                                      propsMulti.objectNavigators[0].title ||
                                      `insight-2`
                                    }
                                    seriesData={propsMulti.seriesData as any}
                                    objectNavigators={
                                      propsMulti.objectNavigators as any
                                    }
                                    onObjectNavigatorChange={(
                                      navIndex,
                                      firstIndex,
                                      secondIndex,
                                    ) => {
                                      setMultiSelections((prev) => {
                                        const next = prev.slice();
                                        next[2] = {
                                          first: firstIndex,
                                          second: secondIndex,
                                        };
                                        return next;
                                      });
                                    }}
                                  />
                                );
                              })()}
                          </div>
                          <div className="headerandinput">
                            <div className="title">
                              {insight.superFigures[3] &&
                                (() => {
                                  const propsMulti = buildMultiChartProps(3);
                                  return propsMulti
                                    ? (propsMulti.objectNavigators[0].title ??
                                        "Super Figures")
                                    : "Super Figures";
                                })()}
                            </div>
                            {insight.superFigures[3] &&
                              (() => {
                                const propsMulti = buildMultiChartProps(3);
                                if (!propsMulti) return null;
                                return (
                                  <MultiChart
                                    id={`insight-3`}
                                    name={
                                      propsMulti.objectNavigators[0].title ||
                                      `insight-3`
                                    }
                                    seriesData={propsMulti.seriesData as any}
                                    objectNavigators={
                                      propsMulti.objectNavigators as any
                                    }
                                    onObjectNavigatorChange={(
                                      navIndex,
                                      firstIndex,
                                      secondIndex,
                                    ) => {
                                      setMultiSelections((prev) => {
                                        const next = prev.slice();
                                        next[3] = {
                                          first: firstIndex,
                                          second: secondIndex,
                                        };
                                        return next;
                                      });
                                    }}
                                  />
                                );
                              })()}
                          </div>
                        </div>
                      </>
                    )}
                    {!loading && !insight && (
                      <img
                        style={{
                          display: "block",
                          margin: "0 auto",
                          width: "200px",
                          height: "200px",
                        }}
                        src="/no-data.svg"
                        alt="No Insight"
                      />
                    )}
                  </>
                )}
              </>
            )}
            {/* <div
              style={
                showAddPeapleBox.loading || showAddPeapleBox.noresult || toggleValue === ToggleOrder.SecondToggle
                  ? { display: "none" }
                  : { display: "" }
              }></div> */}
          </div>
        </main>
        <Modal
          closePopup={() => setShowFollowersNonFollowers(false)}
          classNamePopup={"popup"}
          showContent={showFollowersNonFollowers}>
          <FollowersNonFollowers
            removeMask={() => setShowFollowersNonFollowers(false)}
          />
        </Modal>
        <Modal
          closePopup={() => setShowQuickReplyPopup(false)}
          classNamePopup={"popup"}
          showContent={showQuickReplyPopup}>
          <QuickReplyPopup
            setShowQuickReplyPopup={setShowQuickReplyPopup}
            handleSaveAutoReply={(sendReply: IMediaUpdateAutoReply) =>
              handleUpdateAtuoReply(sendReply)
            }
            handleActiveAutoReply={handleResumeFeedAutoReply}
            autoReply={autoReply}
          />
        </Modal>
        <Modal
          closePopup={() => setShowLotteryPopup(false)}
          classNamePopup={"popup"}
          showContent={showLotteryPopup}>
          <LotteryPopup
            setShowLotteryPopup={setShowLotteryPopup}
            id={detailPost.postId}
            lotteryType={LotteryPopupType.PostLottery}
            commentCount={detailPost.commentCount}
          />
        </Modal>
        <MediaModal
          isOpen={mediaModal.isOpen}
          media={mediaModal.media}
          onClose={mediaModal.close}
        />
      </>
    )
  );
};
export default ShowPost;
