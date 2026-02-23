import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useId, useMemo, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import InputText from "brancy/components/design/inputText";
import Modal from "brancy/components/design/modal";
import Slider from "brancy/components/design/slider/slider";
import FlexibleToggleButton from "brancy/components/design/toggleButton/flexibleToggleButton";
import { ToggleOrder } from "brancy/components/design/toggleButton/types";
import ToggleCheckBoxButton from "brancy/components/design/toggleCheckBoxButton";
import Tooltip from "brancy/components/design/tooltip/tooltip";
import { MediaModal, useMediaModal } from "brancy/components/messages/shared/utils";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import NotAllowed from "brancy/components/notOk/notAllowed";
import NotPermission, { PermissionType } from "brancy/components/notOk/notPermission";
import LotteryPopup, { LotteryPopupType } from "brancy/components/page/popup/lottery";
import QuickStoryReplyPopup from "brancy/components/page/popup/quickStoryReply";
import { isRTL } from "brancy/helper/checkRtl";
import { convertArrayToLarray } from "brancy/helper/chunkArray";
import { handleCopyLink } from "brancy/helper/copyLink";
import formatTimeAgo from "brancy/helper/formatTimeAgo";
import { LoginStatus, packageStatus, RoleAccess } from "brancy/helper/loadingStatus";
import initialzedTime from "brancy/helper/manageTimer";
import { LanguageKey } from "brancy/i18n";
import { PartnerRole } from "brancy/models/_AccountInfo/InstagramerAccountInfo";
import { MethodType } from "brancy/helper/api";
import { AutoReplyPayLoadType, MediaProductType } from "brancy/models/messages/enum";
import { IItem } from "brancy/models/messages/IMessage";
import { IAutomaticReply, IMediaUpdateAutoReply } from "brancy/models/page/post/posts";
import { MediaType } from "brancy/models/page/post/preposts";
import {
  IReaction,
  ISendStoryAutomaticReply,
  IStory_Viewers,
  IStory_Viewers_Server,
  IStoryContent,
  IStoryInsight,
  IStoryReply,
  IStoryViewer,
} from "brancy/models/page/story/stories";
import MultiChart from "brancy/components/design/chart/Chart_month";
import styles from "./showStory.module.css";
import { clientFetchApi } from "brancy/helper/clientFetchApi";

type SearchState = {
  searchMode: boolean;
  loading: boolean;
  noresult: boolean;
};
type SearchAction =
  | { type: "SET_SEARCH_MODE"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_NO_RESULT"; payload: boolean }
  | { type: "RESET_SEARCH" };
const searchReducer = (state: SearchState, action: SearchAction): SearchState => {
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
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const ShowStory = () => {
  const componentId = useId();
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session } = useSession();
  const { query } = router;
  const storyIdParam = useMemo(() => {
    const rawStoryId = query.storyid;
    if (typeof rawStoryId === "string" && rawStoryId.length > 0) return rawStoryId;
    if (Array.isArray(rawStoryId) && rawStoryId.length > 0) return rawStoryId[0];

    const match = router.asPath.match(/\/page\/stories\/storyinfo\/([^/?#]+)/);
    if (match?.[1]) return decodeURIComponent(match[1]);

    if (typeof window !== "undefined") {
      const pathMatch = window.location.pathname.match(/\/page\/stories\/storyinfo\/([^/?#]+)/);
      if (pathMatch?.[1]) return decodeURIComponent(pathMatch[1]);
    }

    return undefined;
  }, [query.storyid, router.asPath]);
  const closeStoryInfo = useCallback(() => {
    const modalWindow = window as Window & { __closeInterceptedModal?: () => void };
    if (modalWindow.__closeInterceptedModal) {
      modalWindow.__closeInterceptedModal();
      return;
    }
    router.push("/page/stories");
  }, [router]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const isFetchingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isAuthenticated = useMemo(() => session !== null && LoginStatus(session), [session]);
  const hasPageAccess = useMemo(() => session && RoleAccess(session, PartnerRole.PageView), [session]);
  const hasPackageAccess = useMemo(() => session && packageStatus(session), [session]);
  const isValidIndex = useMemo(() => session?.user.currentIndex !== -1, [session?.user.currentIndex]);
  const [loading, setLoading] = useState(false);
  const [toggleValue, setToggleValue] = useState<ToggleOrder>(ToggleOrder.FirstToggle);
  const [toggleFollowersValue, setToggleFollowersValue] = useState<ToggleOrder>(ToggleOrder.FirstToggle);
  const [followers, setFollowers] = useState<IStoryViewer[][]>([]);
  const [unFollowers, setUnFollowers] = useState<IStoryViewer[][]>([]);
  const [reaction, setReaction] = useState<IReaction[][]>([]);
  // const [replies, setReplies] = useState<IThread[][]>([]);
  const [storyReplies, setStoryReplies] = useState<IStoryReply>({
    nextMaxId: "",
    threads: [],
    hasOlder: false,
  });
  const [isFetchingMoreReplies, setIsFetchingMoreReplies] = useState(false);
  const mediaModal = useMediaModal();
  const [storyContent, setStoryContent] = useState<IStoryContent>({
    tempId: 0,
    createdTime: 0,
    expireTime: 0,
    mediaType: MediaType.Image,
    replyCount: 0,
    shareCount: 0,
    storyId: 0,
    thumbnailMediaUrl: "",
    viewCount: 0,
    instagramerId: 0,
    instaShareLink: "",
    pk: "",
    code: "",
    autoReplyCommentInfo: null,
    mediaUrl: "",
    // replies: null,
  });
  const [storyInsight, setStoryInsight] = useState<IStoryInsight>();
  const [SearchViewers, setSearchViewers] = useState<IStory_Viewers[][]>([]);
  const [searchPepaple, setSearchPeaple] = useState("");
  const [peopleLocked, setPeopleLocked] = useState(false);
  const [showQuickReplyPopup, setShowQuickReplyPopup] = useState(false);
  const [autoReply, setAutoReply] = useState<IAutomaticReply | null>(null);
  const [QuickReply, setQuickReply] = useState(false);
  const [showLotteryPopup, setShowLotteryPopup] = useState(false);
  const [profilePopup, setProfilePopup] = useState({
    show: false,
    image: "",
    username: "",
  });
  const [searchState, searchDispatch] = useReducer(searchReducer, {
    searchMode: false,
    loading: false,
    noresult: false,
  });
  const [commentsPerSlide, setCommentsPerSlide] = useState<number>(5);
  const [searchReplies, setSearchReplies] = useState<IStoryReply>({
    nextMaxId: "",
    threads: [],
    hasOlder: false,
  });
  const lastSearchQuery = useRef("");
  const handleImageClick = useCallback((imageUrl: string, username: string) => {
    setProfilePopup({ show: true, image: imageUrl, username });
  }, []);
  const handleClosePopup = useCallback(() => {
    setProfilePopup((prev) => ({ ...prev, show: false }));
  }, []);
  const calculateCommentsPerSlide = useCallback(() => {
    const availableHeight = window.innerHeight - 250;
    const averageCommentHeight = 75;
    const optimal = Math.max(3, Math.floor(availableHeight / averageCommentHeight));
    return Math.min(5, optimal);
  }, []);
  useEffect(() => {
    const handleResize = () => {
      setCommentsPerSlide(calculateCommentsPerSlide());
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [calculateCommentsPerSlide]);
  const handleApiReplySearch = useCallback(
    async (searchQuery: string) => {
      const q = searchQuery.toLowerCase();
      const filtered = storyReplies.threads.filter((t) => {
        const username = t.recp?.username ?? "";
        const byUsername = username.toLowerCase().includes(q);
        const byText = (t.items ?? []).some((i) => (i.text ?? "").toLowerCase().includes(q));
        return byUsername || byText;
      });
      setSearchReplies({ ...storyReplies, threads: filtered });
      searchDispatch({ type: "SET_LOADING", payload: false });
      searchDispatch({ type: "SET_NO_RESULT", payload: filtered.length === 0 });
    },
    [storyReplies],
  );
  const handleCloseSearch = useCallback(() => {
    setSearchPeaple("");
    searchDispatch({ type: "RESET_SEARCH" });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);
  const handleSearchReply = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const query = e.currentTarget.value;
      lastSearchQuery.current = query;
      if (query.length <= 0) {
        handleCloseSearch();
        return;
      }
      searchDispatch({ type: "SET_SEARCH_MODE", payload: true });
      searchDispatch({ type: "SET_LOADING", payload: true });
      searchDispatch({ type: "SET_NO_RESULT", payload: false });
      setSearchPeaple(query);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (query.length > 0) {
        timeoutRef.current = setTimeout(() => {
          if (query && query.length > 0 && !peopleLocked) {
            setPeopleLocked(true);
            handleApiReplySearch(query);
            setTimeout(() => setPeopleLocked(false), 200);
          }
        }, 300);
      }
    },
    [handleCloseSearch, handleApiReplySearch, peopleLocked],
  );
  const [multiSelections, setMultiSelections] = useState<{ first: number; second?: number }[]>([]);
  const initialMultiSelections = useMemo(() => {
    if (!storyInsight || !storyInsight.superFigures) return [];
    return storyInsight.superFigures.map((sf) => ({
      first: 0,
      second: sf.secondIndexes && sf.secondIndexes[0] ? 0 : undefined,
    }));
  }, [storyInsight]);
  useEffect(() => {
    setMultiSelections(initialMultiSelections);
  }, [initialMultiSelections]);
  const buildMultiChartProps = useMemo(
    () => (sfIndex: number) => {
      if (!storyInsight || !storyInsight.superFigures || !storyInsight.superFigures[sfIndex]) return null;
      const sf = storyInsight.superFigures[sfIndex];
      const sel = multiSelections[sfIndex] || { first: 0, second: 0 };
      const firstKey = sf.firstIndexes?.[sel.first];
      const secondKey =
        sf.secondIndexes && sf.secondIndexes[sel.first] ? sf.secondIndexes[sel.first][sel.second ?? 0] : undefined;
      let targetFig = sf.figures?.find(
        (f) => f.firstIndex == firstKey && (secondKey === undefined || f.secondIndex == secondKey),
      );
      if (!targetFig) targetFig = sf.figures && sf.figures.length > 0 ? sf.figures[0] : undefined;
      const dayList = (targetFig && (targetFig.days ?? targetFig.hours)) || [];
      // derive month/year from first timestamp if available
      let year = new Date().getFullYear();
      let month = new Date().getMonth() + 1;
      if (dayList && dayList.length > 0 && (dayList[0] as any).createdTime) {
        const ts = (dayList[0] as any).createdTime * 1000;
        const d = new Date(ts);
        year = d.getFullYear();
        month = d.getMonth() + 1;
      }
      const totalCount = (dayList || []).reduce((s: number, it: any) => s + (it.count || 0), 0);
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
    [storyInsight, multiSelections],
  );
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  const fetchData = useCallback(
    async (storyId: string) => {
      if (isFetchingRef.current || !session || !LoginStatus(session)) return;
      isFetchingRef.current = true;
      try {
        var [contentRes, insightReses, repliesRes] = await Promise.all([
          clientFetchApi<Boolean, IStoryContent>("/api/story/GetStory", {
            methodType: MethodType.get,
            session: session,
            data: null,
            queries: [{ key: "storyId", value: storyId }],
            onUploadProgress: undefined,
          }),
          session.user.insightPermission
            ? clientFetchApi<Boolean, IStoryInsight>("/api/story/GetStoryInsight", {
                methodType: MethodType.get,
                session: session,
                data: null,
                queries: [{ key: "storyId", value: storyId }],
                onUploadProgress: undefined,
              })
            : {
                succeeded: true,
                value: {},
                info: {
                  exception: null,
                  message: "",
                  needsChallenge: false,
                  actionBlockEnd: null,
                  responseType: 0,
                },
                statusCode: 200,
                errorMessage: "",
              },
          session.user.messagePermission
            ? clientFetchApi<Boolean, IStoryReply>("/api/story/GetStoryReplies", {
                methodType: MethodType.get,
                session: session,
                data: null,
                queries: [
                  { key: "storyId", value: storyId },
                  { key: "nextMaxId", value: undefined },
                ],
                onUploadProgress: undefined,
              })
            : {
                succeeded: true,
                value: { threads: [], nextMaxId: null, hasOlder: false },
                info: {
                  exception: null,
                  message: "",
                  needsChallenge: false,
                  actionBlockEnd: null,
                  responseType: 0,
                },
                statusCode: 200,
                errorMessage: "",
              },
        ]);
        if (contentRes.succeeded && insightReses.succeeded) {
          setStoryContent(contentRes.value);
          if (session.user.insightPermission) setStoryInsight(insightReses.value);
          if (session.user.messagePermission) setStoryReplies(repliesRes.value);
          if (contentRes.value.autoReplyCommentInfo) {
            setAutoReply({
              items: contentRes.value.autoReplyCommentInfo.items,
              response: contentRes.value.autoReplyCommentInfo.response || "",
              replySuccessfullyDirected: false,
              shouldFollower: contentRes.value.autoReplyCommentInfo.shouldFollower,
              automaticType: contentRes.value.autoReplyCommentInfo.automaticType,
              masterFlow: contentRes.value.autoReplyCommentInfo.masterFlow,
              masterFlowId: contentRes.value.autoReplyCommentInfo.masterFlowId,
              mediaId: contentRes.value.autoReplyCommentInfo.mediaId,
              pauseTime: contentRes.value.autoReplyCommentInfo.pauseTime,
              productType: contentRes.value.autoReplyCommentInfo.productType,
              prompt: contentRes.value.autoReplyCommentInfo.prompt,
              promptId: contentRes.value.autoReplyCommentInfo.promptId,
              sendCount: contentRes.value.autoReplyCommentInfo.sendCount,
              sendPr: contentRes.value.autoReplyCommentInfo.sendPr,
            });
            if (!contentRes.value.autoReplyCommentInfo.pauseTime) setQuickReply(true);
          }
          setLoading(false);
          setIsDataLoaded(true);
        } else notify(contentRes.info.responseType, NotifType.Warning);
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      } finally {
        isFetchingRef.current = false;
      }
    },
    [session],
  );
  async function handleResumeLiveAutoReply(e: ChangeEvent<HTMLInputElement>) {
    if (!autoReply) return;
    try {
      const activeAutoReply = e.target.checked;
      var res = await clientFetchApi<boolean, boolean>(
        "Instagramer" + `/Story/${!activeAutoReply ? "PauseAutoReply" : "ResumeAutoReply"}`,
        {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: [
            {
              key: "storyId",
              value: storyIdParam as string,
            },
          ],
          onUploadProgress: undefined,
        },
      );
      if (res.succeeded)
        setAutoReply((prev) => ({
          ...prev!,
          pauseTime: activeAutoReply ? null : Date.now(),
        }));
      else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  useEffect(() => {
    if (router.isReady) {
      if (!storyIdParam) {
        router.replace("/page/stories");
      } else if (!isDataLoaded && session && LoginStatus(session)) {
        fetchData(storyIdParam);
      }
    }
  }, [router.isReady, storyIdParam, isDataLoaded, session, fetchData, router]);
  const fetchReplies = useCallback(async () => {
    var nReplies = storyReplies.threads;
    try {
      if (nReplies.length > 0 && storyReplies.hasOlder) {
        setIsFetchingMoreReplies(true);
        var nextTime = storyReplies.nextMaxId;
        var storyId = storyContent.storyId;
        var res = await clientFetchApi<boolean, IStoryReply>("Instagramer" + "" + "/Story/GetStoryReplies", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: [
            { key: "storyId", value: storyId.toString() },
            { key: "nextMaxId", value: nextTime ? nextTime : undefined },
          ],
          onUploadProgress: undefined,
        });
        if (res.succeeded) {
          for (let i = 0; i < res.value.threads.length; i++) {
            nReplies.push(res.value.threads[i]);
          }
          setStoryReplies((prev) => ({
            ...prev,
            threads: nReplies,
            nextMaxId: res.value.nextMaxId,
            hasOlder: res.value.hasOlder,
          }));
        } else notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setIsFetchingMoreReplies(false);
    }
  }, [session, storyReplies.threads, storyReplies.hasOlder, storyReplies.nextMaxId, storyContent.storyId]);
  const handleApiPeopleSearch = useCallback(
    async (searchQuery: string) => {
      try {
        const res = await clientFetchApi<boolean, IStory_Viewers_Server>("/api/story/SearchViewers", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: [
            { key: "storyid", value: storyIdParam as string },
            { key: "query", value: searchQuery },
          ],
          onUploadProgress: undefined,
        });
        if (res.succeeded) {
          setSearchViewers(convertArrayToLarray<IStory_Viewers>(res.value.viewers, 5));
          searchDispatch({ type: "SET_LOADING", payload: false });
          searchDispatch({
            type: "SET_NO_RESULT",
            payload: res.value.viewers.length === 0,
          });
        } else {
          handleCloseSearch();
          notify(res.info.responseType, NotifType.Warning);
        }
      } catch (error) {
        handleCloseSearch();
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    },
    [session, storyIdParam, handleCloseSearch],
  );
  const handleSearchViewers = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const query = e.currentTarget.value;
      if (query.length <= 0) {
        handleCloseSearch();
        return;
      }
      searchDispatch({ type: "SET_SEARCH_MODE", payload: true });
      searchDispatch({ type: "SET_LOADING", payload: true });
      setSearchViewers([]);
      setSearchPeaple(query);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (query.length > 0) {
        timeoutRef.current = setTimeout(() => {
          if (query && query.length > 0 && !peopleLocked) {
            setPeopleLocked(true);
            handleApiPeopleSearch(query);
            setTimeout(() => setPeopleLocked(false), 200);
          }
        }, 1000);
      }
    },
    [handleCloseSearch, peopleLocked, handleApiPeopleSearch],
  );

  const handleReaction = useCallback(
    async (item: IItem, threadId: string) => {
      try {
        const res = await clientFetchApi<boolean, boolean>(
          "Instagramer" + "" + `/Message/${item.ownerEmojiReaction ? "SendUnReaction" : "SendReaction"}`,
          {
            methodType: MethodType.get,
            session: session,
            data: null,
            queries: [
              { key: "threadId", value: threadId },
              { key: "itemId", value: item.itemId },
            ],
            onUploadProgress: undefined,
          },
        );
        if (res.succeeded) {
          setStoryReplies((prev) => ({
            ...prev,
            threads: prev.threads.map((x) =>
              x.threadId !== threadId
                ? x
                : {
                    ...x,
                    items: x.items.map((y) =>
                      y.itemId !== item.itemId
                        ? y
                        : {
                            ...y,
                            ownerEmojiReaction: y.ownerEmojiReaction ? null : "reaction",
                          },
                    ),
                  },
            ),
          }));
        } else notify(res.info.responseType, NotifType.Warning);
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    },
    [session],
  );
  const handleUpdateAtuoReply = useCallback(
    async (sendReply: IMediaUpdateAutoReply) => {
      try {
        const res = await clientFetchApi<ISendStoryAutomaticReply, IAutomaticReply>("/api/story/UpdateAutoReply", {
          methodType: MethodType.post,
          session: session,
          data: sendReply,
          queries: [{ key: "storyId", value: storyContent.storyId.toString() }],
          onUploadProgress: undefined,
        });
        if (res.succeeded) {
          setAutoReply(res.value);
          if (!storyContent?.autoReplyCommentInfo)
            setStoryContent((prev) => ({
              ...prev,
              autoReplyCommentInfo: res.value,
            }));
        } else notify(res.info.responseType, NotifType.Warning);
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    },
    [session, storyContent.storyId, storyContent?.autoReplyCommentInfo],
  );

  useEffect(() => {
    if (isValidIndex === false) {
      router.push("/user");
    } else if (hasPackageAccess === false) {
      router.push("/upgrade");
    }
  }, [isValidIndex, hasPackageAccess, router]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (profilePopup.show) {
          handleClosePopup();
        } else if (mediaModal.isOpen) {
          mediaModal.close();
        } else if (showQuickReplyPopup) {
          setShowQuickReplyPopup(false);
        } else if (showLotteryPopup) {
          setShowLotteryPopup(false);
        } else {
          closeStoryInfo();
        }
      }
    },
    [
      profilePopup.show,
      mediaModal.isOpen,
      showQuickReplyPopup,
      showLotteryPopup,
      handleClosePopup,
      mediaModal,
      closeStoryInfo,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const storyTitle = useMemo(
    () => `Brancy - Story Insight #${storyContent.tempId || storyIdParam}`,
    [storyContent.tempId, storyIdParam],
  );

  const storyDescription = useMemo(
    () =>
      `View detailed insights for Instagram story #${
        storyContent.tempId || storyIdParam
      }. Track views, interactions, reach, and engagement analytics for your Instagram stories.`,
    [storyContent.tempId, storyIdParam],
  );

  const canonicalUrl = useMemo(() => `https://www.Brancy.app/page/stories/storyinfo/${storyIdParam}`, [storyIdParam]);

  if (!session || !isValidIndex || !storyIdParam) return null;

  return (
    <>
      <Head>
        <title>{storyTitle}</title>
        <meta name="description" content={storyDescription} />
        <meta
          name="keywords"
          content="instagram story insights, story analytics, instagram metrics, story views, story engagement, instagram management, brancy, story tracking"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:title" content={storyTitle} />
        <meta property="og:description" content={storyDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Brancy" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={storyTitle} />
        <meta name="twitter:description" content={storyDescription} />

        <meta name="theme-color" content="#2977ff" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#2977ff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1a1a1a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Brancy" />
        <meta name="msapplication-TileColor" content="#2977ff" />
        <meta name="msapplication-navbutton-color" content="#2977ff" />
      </Head>
      <main className="fullScreenPupup_bg" role="main" aria-label="Story insights">
        <div className="fullScreenPupup_header" role="banner">
          <div className={styles.ToggleButton} role="tablist" aria-label="View toggle">
            <FlexibleToggleButton
              options={[
                { label: t(LanguageKey.details), id: 0 },
                { label: t(LanguageKey.Insights), id: 1 },
              ]}
              onChange={setToggleValue}
              selectedValue={toggleValue}
            />
          </div>

          <div className={styles.titleCard}>
            <div
              className={styles.headerIconcontainer}
              onClick={() => handleCopyLink(storyContent.instaShareLink)}
              onKeyDown={(e) => e.key === "Enter" && handleCopyLink(storyContent.instaShareLink)}
              title="Share this page">
              <svg xmlns="http://www.w3.org/2000/svg" fill="var(--text-h1)" viewBox="0 0 36 36">
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
              onClick={closeStoryInfo}
              onKeyDown={(e) => e.key === "Enter" && closeStoryInfo()}
              className={styles.headerIconcontainer}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 170 180">
                <path
                  d="m100 85 66-67c2-2 3-5 3-8 0-5-5-10-10-10a10 10 0 0 0-8 3L84 70 18 3a10 10 0 0 0-8-3A10 10 0 0 0 0 10c0 3 1 6 3 8l67 67-4 3-63 65a10 10 0 0 0 7 17c3 0 6-1 8-3l12-13 54-54 67 67c4 5 10 5 15 0 4-4 4-10 0-15L99 85z"
                  fill="var(--text-h1)"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="fullScreenPupup_content" role="region" aria-label="Story content">
          {!hasPageAccess && <NotAllowed />}
          {toggleValue === ToggleOrder.FirstToggle && (
            <>
              {loading && <Loading />}
              {!loading && (
                <>
                  <div className={styles.container}>
                    <div className="headerparent">
                      <div className="title">
                        {t(LanguageKey.navbar_Story)}
                        <span className={styles.number} title={`ℹ️ Story no. ${storyContent.tempId}`}>
                          (<strong>{storyContent.tempId}</strong>)
                        </span>
                      </div>

                      {(() => {
                        const t = initialzedTime();
                        const d = new DateObject({
                          date: storyContent.createdTime * 1000,
                          calendar: t.calendar,
                          locale: t.locale,
                        });
                        return (
                          <div className="date translate" title="ℹ️ publish time">
                            <span className="day">{d.format("YYYY/MM/DD")}</span> -
                            <span className="hour">{d.format("hh:mm a")}</span>
                          </div>
                        );
                      })()}
                    </div>

                    <img
                      onClick={() => {
                        if (
                          storyContent.mediaType === MediaType.Video &&
                          storyContent.createdTime * 1e3 + 48 * 60 * 60 * 1000 < Date.now()
                        ) {
                          internalNotify(InternalResponseType.NotPermittedForDownload, NotifType.Warning);
                          return;
                        }
                        if (storyContent.mediaType === MediaType.Image)
                          mediaModal.openImage(basePictureUrl + storyContent.mediaUrl);
                        else if (storyContent.mediaType === MediaType.Video)
                          mediaModal.openVideo(basePictureUrl + storyContent.mediaUrl);
                      }}
                      className={styles.picture}
                      alt="instagram Story picture"
                      src={basePictureUrl + storyContent.thumbnailMediaUrl}
                    />
                    {!(
                      storyContent.mediaType === MediaType.Video &&
                      storyContent.createdTime * 1e3 + 48 * 60 * 60 * 1000 < Date.now()
                    ) && (
                      <a
                        href={basePictureUrl + storyContent.mediaUrl + "/download"}
                        download
                        style={{
                          position: "absolute",
                          top: "50px",
                          right: "50px",
                          padding: "4px 6px",
                          color: "white",
                          fontSize: "12px",
                          borderRadius: "15px",
                          textDecoration: "none",
                          zIndex: 10,
                        }}
                        title="Download media">
                        <svg fill="none" xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 36 36">
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
                    )}

                    <div className={styles.postpreview}>
                      <div className={storyContent.replyCount > 0 ? styles.postdetail : `${styles.postdetail} fadeDiv`}>
                        <img title="ℹ️ like count" width="20px" height="20px" alt="view" src={"/icon-like.svg"} />
                        <span>{storyContent.replyCount > 0 ? storyContent.replyCount.toLocaleString() : "--"}</span>
                      </div>
                      <div className={storyContent.shareCount > 0 ? styles.postdetail : `${styles.postdetail} fadeDiv`}>
                        <img title="ℹ️ Send count" width="20px" height="20px" alt="send" src={"/icon-send.svg"} />
                        <span>{storyContent.shareCount > 0 ? storyContent.shareCount.toLocaleString() : "--"}</span>
                      </div>
                      <div className={storyContent.viewCount > 0 ? styles.postdetail : `${styles.postdetail} fadeDiv`}>
                        <img title="ℹ️ Reach count" width="20px" height="20px" alt="view" src={"/icon-view.svg"} />
                        <span>{storyContent.viewCount > 0 ? storyContent.viewCount.toLocaleString() : "--"}</span>
                      </div>
                    </div>
                  </div>
                  {session.user.messagePermission && (
                    <div className={styles.container}>
                      <div className={`headerandinput ${storyContent.expireTime * 1000 < Date.now() && "fadeDiv"}`}>
                        <div className="headerparent" role="group" aria-label="Product settings">
                          <div className="title2" role="heading" aria-level={3}>
                            {t(LanguageKey.autocommentReply)}
                          </div>
                          <ToggleCheckBoxButton
                            name="quick-reply"
                            handleToggle={(e) => {
                              if (storyContent.expireTime * 1000 < Date.now()) return;
                              handleResumeLiveAutoReply(e);
                              setQuickReply(!QuickReply);
                            }}
                            checked={QuickReply}
                            title="Toggle quick reply"
                            role="switch"
                            aria-checked={QuickReply}
                            aria-label="Quick reply toggle"
                          />
                        </div>
                        <div className="explain">{t(LanguageKey.QuickReplyexplain)}</div>
                        <button
                          className={`cancelButton ${QuickReply ? "" : "fadeDiv"}`}
                          onClick={() => {
                            if (storyContent.expireTime * 1000 < Date.now() || !autoReply) return;
                            if (QuickReply) {
                              setShowQuickReplyPopup(true);
                            }
                          }}
                          disabled={!QuickReply}>
                          {t(LanguageKey.marketstatisticsfeatures)}
                        </button>
                      </div>
                    </div>
                  )}

                  {session.user.messagePermission && (
                    <div className={styles.container}>
                      <div className="headerandinput">
                        <div className="headerparent">
                          <div className="title">{t(LanguageKey.reply)}</div>
                          <Tooltip
                            tooltipValue={t(LanguageKey.WinnerPicker) + "," + t(LanguageKey.exportXlxs)}
                            position="bottom"
                            onClick={true}>
                            <img
                              className={`${styles.Giveaway} ${storyReplies.threads.length === 0 && "fadeDiv"}`}
                              onClick={() => {
                                if (storyReplies.threads.length === 0) return;
                                setShowLotteryPopup(true);
                              }}
                              alt="Lottery (Giveaway) icon"
                              src={"/random.svg"}
                            />
                          </Tooltip>
                        </div>
                        <div className={styles.commentbox}>
                          <InputText
                            className={"serachMenuBar"}
                            placeHolder={t(LanguageKey.search)}
                            value={searchPepaple}
                            handleInputChange={handleSearchReply}
                          />
                          {!searchState.searchMode && storyReplies.threads.length === 0 && (
                            <div className="explain" style={{ textAlign: "center" }}>
                              {t(LanguageKey.emptycomment)}
                            </div>
                          )}
                          {!searchState.searchMode && storyReplies.threads.length > 0 && (
                            <Slider
                              onReachEnd={() => {
                                if (!storyReplies.nextMaxId) return;
                                fetchReplies();
                              }}
                              isLoading={isFetchingMoreReplies}
                              itemsPerSlide={commentsPerSlide}>
                              {storyReplies.threads.map((u, i) => (
                                <div key={u.threadId || i} className={styles.comment}>
                                  <img
                                    className="instagramimage"
                                    title="◰ resize the picture"
                                    onClick={() =>
                                      handleImageClick(basePictureUrl + u.recp.profilePic, u.recp.username || "")
                                    }
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/no-profile.svg";
                                    }}
                                    style={{
                                      height: "40px",
                                      width: "40px",
                                      cursor: "pointer",
                                    }}
                                    width={40}
                                    height={40}
                                    alt="instagram profile picture"
                                    src={basePictureUrl + u.recp.profilePic}
                                  />
                                  <div className={styles.commentdetail}>
                                    <div className="headerandinput" style={{ gap: "2px" }}>
                                      <div className="headerparent">
                                        <div className="instagramusername" style={{ fontSize: "12px" }}>
                                          {u.recp.username}
                                        </div>
                                        <img
                                          onClick={() => {
                                            if (!u.isActive) return;
                                            handleReaction(u.items[0], u.threadId);
                                          }}
                                          className={`${styles.likeicon} ${!u.isActive && "fadeDiv"}`}
                                          alt="like icon"
                                          src={u.items[0].ownerEmojiReaction ? "/icon-isLiked.svg" : "/icon-like.svg"}
                                        />
                                      </div>
                                      <div
                                        className="explain "
                                        style={{
                                          display: "flex",
                                          gap: "var(--gap-5)",
                                        }}>
                                        <span>
                                          {new DateObject({
                                            date: u.items[0].createdTime / 1000,
                                            calendar: initialzedTime().calendar,
                                            locale: initialzedTime().locale,
                                          }).format("YYYY/MM/DD - hh:mm a")}
                                        </span>
                                        ●<span>{formatTimeAgo(u.items[0].createdTime / 1000)}</span>
                                      </div>
                                    </div>
                                    <div
                                      className={`${styles.commenttext} ${isRTL(u.items[0].text) ? "rtl" : "ltr"}`}
                                      title={u.items[0].text}>
                                      {u.items[0].text}
                                    </div>
                                  </div>
                                  {profilePopup.show && (
                                    <>
                                      <div
                                        className="dialogBg"
                                        onClick={handleClosePopup}
                                        onKeyDown={(e) => e.key === "Escape" && handleClosePopup()}
                                        role="button"
                                        tabIndex={0}
                                        aria-label="Close profile popup"
                                      />
                                      <div
                                        className={styles.popupContent}
                                        role="dialog"
                                        aria-modal="true"
                                        aria-labelledby={`profile-${componentId}`}>
                                        <div className="headerparent">
                                          <span id={`profile-${componentId}`}>@ {profilePopup.username}</span>
                                          <button
                                            type="button"
                                            title="Close popup (Esc)"
                                            className="closepopup"
                                            onClick={handleClosePopup}
                                            aria-label="Close profile popup"
                                            style={{
                                              background: "none",
                                              border: "none",
                                              cursor: "pointer",
                                            }}>
                                            <img alt="close button" src="/close-box.svg" />
                                          </button>
                                        </div>
                                        <img
                                          className={styles.profileimagebig}
                                          src={profilePopup.image}
                                          alt={`Profile picture of ${profilePopup.username}`}
                                          title="profile picture"
                                        />
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
                              {!searchState.loading && searchState.noresult && (
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
                              {!searchState.loading && !searchState.noresult && (
                                <Slider itemsPerSlide={6}>
                                  {searchReplies.threads.map((u, i) => (
                                    <div key={u.threadId || i} className={styles.comment}>
                                      <img
                                        className=" instagramimage"
                                        title="◰ resize the picture"
                                        onClick={() =>
                                          handleImageClick(basePictureUrl + u.recp.profilePic, u.recp.username || "")
                                        }
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = "/no-profile.svg";
                                        }}
                                        style={{
                                          height: "40px",
                                          width: "40px",
                                          cursor: "pointer",
                                        }}
                                        width={40}
                                        height={40}
                                        alt="instagram profile picture"
                                        src={basePictureUrl + u.recp.profilePic}
                                      />
                                      <div className={styles.commentdetail}>
                                        <div className="headerandinput" style={{ gap: "2px" }}>
                                          <div className="headerparent">
                                            <div className="instagramusername" style={{ fontSize: "12px" }}>
                                              {u.recp.username}
                                            </div>
                                            <img
                                              onClick={() => {
                                                if (!u.isActive) return;
                                                handleReaction(u.items[0], u.threadId);
                                              }}
                                              className={`${styles.likeicon} ${!u.isActive && "fadeDiv"}`}
                                              alt="like icon"
                                              src={
                                                u.items[0].ownerEmojiReaction ? "/icon-isLiked.svg" : "/icon-like.svg"
                                              }
                                            />
                                          </div>
                                          <div
                                            className="explain "
                                            style={{
                                              display: "flex",
                                              gap: "var(--gap-5)",
                                            }}>
                                            <span>
                                              {new DateObject({
                                                date: u.items[0].createdTime / 1000,
                                                calendar: initialzedTime().calendar,
                                                locale: initialzedTime().locale,
                                              }).format("YYYY/MM/DD - hh:mm a")}
                                            </span>
                                            ●<span>{formatTimeAgo(u.items[0].createdTime / 1000)}</span>
                                          </div>
                                        </div>
                                        <div
                                          className={`${styles.commenttext} ${isRTL(u.items[0].text) ? "rtl" : "ltr"}`}
                                          title={u.items[0].text}>
                                          {u.items[0].text}
                                        </div>
                                      </div>
                                      {profilePopup.show && (
                                        <>
                                          <div
                                            className="dialogBg"
                                            onClick={handleClosePopup}
                                            onKeyDown={(e) => e.key === "Escape" && handleClosePopup()}
                                            role="button"
                                            tabIndex={0}
                                            aria-label="Close profile popup"
                                          />
                                          <div className={styles.popupContent} role="dialog" aria-modal="true">
                                            <div className="headerparent">
                                              @ {profilePopup.username}
                                              <button
                                                type="button"
                                                title="Close popup (Esc)"
                                                className="closepopup"
                                                onClick={handleClosePopup}
                                                aria-label="Close profile popup"
                                                style={{
                                                  background: "none",
                                                  border: "none",
                                                  cursor: "pointer",
                                                }}>
                                                <img alt="close button" src="/close-box.svg" />
                                              </button>
                                            </div>
                                            <img
                                              className={styles.profileimagebig}
                                              src={profilePopup.image}
                                              alt={`Profile picture of ${profilePopup.username}`}
                                              title="profile picture"
                                            />
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
                  {!loading && storyInsight && (
                    <>
                      <div className={`${styles.container} translate`}>
                        <div className={styles.Section}>
                          <div className="headerparent">
                            <div className="title">Engagement</div>
                            <div className={styles.typeparent}>
                              <div className={styles.followertype}>
                                <svg
                                  className={styles.iconFollower}
                                  width="20px"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="var(--color-gray)"
                                  viewBox="0 0 36 36">
                                  <path
                                    fillRule="evenodd"
                                    d="M33.6 23.3q.8-1 0-2a1.4 1.4 0 0 0-2 .2l-6.7 7.1-2.5-2.4a1.4 1.4 0 0 0-2 0q-.7 1 0 2l3.5 3.4a1.4 1.4 0 0 0 2 0z"
                                  />
                                  <path
                                    opacity=".4"
                                    d="M17.8 1.9A7.9 7.9 0 1 0 16 17.6a7.9 7.9 0 0 0 1.8-15.7M14 20a17 17 0 0 1 11 2.5l-.5.8-.5.6-.5.5-.7-.3q-1-.4-2-.4a4 4 0 0 0-3.7 3c-.1 1-.1 1.4.9 2.4l2 2.3 1.1 1.2q1.2 1 1 1.3t-1.6.3H9.7a10 10 0 0 1-6.6-3Q1.6 29.7 1.7 28q.3-1.6 1.5-2.7c1-1 2.7-2 3.8-2.6l.6-.3q3-1.8 6.4-2.4"
                                  />
                                </svg>
                                <div className={styles.totalcounter}>
                                  {storyInsight.engagementFollowerType?.followEngaged ?? "--"}
                                </div>
                              </div>
                              <div className={styles.followertype}>
                                <svg
                                  className={styles.iconFollower}
                                  width="20px"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="var(--color-gray)"
                                  viewBox="0 0 36 36">
                                  <path
                                    fillRule="evenodd"
                                    d="M22.9 22.9a1.5 1.5 0 0 1 2 0l3.6 3.5 3.4-3.5a1.6 1.6 0 0 1 2.2 2.2l-3.5 3.4 3.5 3.4a1.6 1.6 0 1 1-2.2 2.2l-3.4-3.5-3.4 3.5a1.6 1.6 0 1 1-2.2-2.2l3.5-3.4-3.5-3.4a1.5 1.5 0 0 1 0-2.2"
                                  />
                                  <path
                                    opacity=".4"
                                    d="M18 2a8 8 0 0 0-3.3.2A7.9 7.9 0 0 0 18 17.6 7.9 7.9 0 0 0 18 2m-3.9 18.2a18 18 0 0 1 7.1.4q.5.3.1.8a4 4 0 0 0 0 5.4l1.3 1.2.4.6-.4.6-1.3 1.2q-1 1-1 2.6 0 1-.2 1.1l-.9.1H9.9a10 10 0 0 1-6.6-3Q1.8 29.7 1.9 28q.3-1.6 1.5-2.7c1-1 2.7-2 3.8-2.6l.6-.3a17 17 0 0 1 6.3-2.2"
                                  />
                                </svg>
                                <div className={styles.totalcounter}>
                                  {storyInsight.engagementFollowerType?.nonFollowEngaged ?? "--"}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className={styles.Tableheader}>
                            <div className={styles.Tableheadertext}>Interactions</div>
                            <div className={styles.Tableheadercounter}>{storyInsight.interaction?.total ?? "--"}</div>
                          </div>
                          <div className={styles.Tableheader1}>
                            <div className={styles.row}>
                              <div className={styles.rowheader}>
                                <div className={styles.bullet}></div>
                                <div className={styles.insightlabel}>Like</div>
                              </div>
                              <div className={styles.insightlabel}>{storyInsight.interaction?.likes ?? "--"}</div>
                            </div>

                            <div className={styles.row}>
                              <div className={styles.rowheader}>
                                <div className={styles.bullet}></div>
                                <div className={styles.insightlabel}>Share</div>
                              </div>
                              <div className={styles.insightlabel}>{storyInsight.interaction?.shares ?? "--"}</div>
                            </div>
                            <div className={styles.row}>
                              <div className={styles.rowheader}>
                                <div className={styles.bullet}></div>
                                <div className={styles.insightlabel}>Replies</div>
                              </div>
                              <div className={styles.insightlabel}>{storyInsight.interaction?.replies ?? "--"}</div>
                            </div>
                          </div>

                          <div className={styles.Tableheader}>
                            <div className={styles.Tableheadertext}>Navigation</div>
                            <div className={styles.Tableheadercounter}>{storyInsight.navigation?.total ?? "--"}</div>
                          </div>
                          <div className={styles.Tableheader1}>
                            <div className={styles.row}>
                              <div className={styles.rowheader}>
                                <div className={styles.bullet}></div>
                                <div className={styles.insightlabel}>Forward</div>
                              </div>
                              <div className={styles.insightlabel}>{storyInsight.navigation?.forward ?? "--"}</div>
                            </div>
                            <div className={styles.row}>
                              <div className={styles.rowheader}>
                                <div className={styles.bullet}></div>
                                <div className={styles.insightlabel}>Back</div>
                              </div>
                              <div className={styles.insightlabel}>{storyInsight.navigation?.backward ?? "--"}</div>
                            </div>
                            <div className={styles.row}>
                              <div className={styles.rowheader}>
                                <div className={styles.bullet}></div>
                                <div className={styles.insightlabel}>Exited</div>
                              </div>
                              <div className={styles.insightlabel}>{storyInsight.navigation?.exited ?? "--"}</div>
                            </div>
                            <div className={styles.row}>
                              <div className={styles.rowheader}>
                                <div className={styles.bullet}></div>
                                <div className={styles.insightlabel}>Next Story</div>
                              </div>
                              <div className={styles.insightlabel}>{storyInsight.navigation?.nextStory ?? "--"}</div>
                            </div>
                          </div>
                        </div>
                        <div className={styles.Section}>
                          <div className="headerparent">
                            <div className="title">Reach</div>
                            <div className={styles.typeparent}>
                              <div className={styles.followertype}>
                                <svg
                                  className={styles.iconFollower}
                                  width="20px"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="var(--color-gray)"
                                  viewBox="0 0 36 36">
                                  <path
                                    fillRule="evenodd"
                                    d="M33.6 23.3q.8-1 0-2a1.4 1.4 0 0 0-2 .2l-6.7 7.1-2.5-2.4a1.4 1.4 0 0 0-2 0q-.7 1 0 2l3.5 3.4a1.4 1.4 0 0 0 2 0z"
                                  />
                                  <path
                                    opacity=".4"
                                    d="M17.8 1.9A7.9 7.9 0 1 0 16 17.6a7.9 7.9 0 0 0 1.8-15.7M14 20a17 17 0 0 1 11 2.5l-.5.8-.5.6-.5.5-.7-.3q-1-.4-2-.4a4 4 0 0 0-3.7 3c-.1 1-.1 1.4.9 2.4l2 2.3 1.1 1.2q1.2 1 1 1.3t-1.6.3H9.7a10 10 0 0 1-6.6-3Q1.6 29.7 1.7 28q.3-1.6 1.5-2.7c1-1 2.7-2 3.8-2.6l.6-.3q3-1.8 6.4-2.4"
                                  />
                                </svg>
                                <div className={styles.totalcounter}>
                                  {storyInsight.reachFollowerType?.followReach ?? "--"}
                                </div>
                              </div>
                              <div className={styles.followertype}>
                                <svg
                                  className={styles.iconFollower}
                                  width="20px"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="var(--color-gray)"
                                  viewBox="0 0 36 36">
                                  <path
                                    fillRule="evenodd"
                                    d="M22.9 22.9a1.5 1.5 0 0 1 2 0l3.6 3.5 3.4-3.5a1.6 1.6 0 0 1 2.2 2.2l-3.5 3.4 3.5 3.4a1.6 1.6 0 1 1-2.2 2.2l-3.4-3.5-3.4 3.5a1.6 1.6 0 1 1-2.2-2.2l3.5-3.4-3.5-3.4a1.5 1.5 0 0 1 0-2.2"
                                  />
                                  <path
                                    opacity=".4"
                                    d="M18 2a8 8 0 0 0-3.3.2A7.9 7.9 0 0 0 18 17.6 7.9 7.9 0 0 0 18 2m-3.9 18.2a18 18 0 0 1 7.1.4q.5.3.1.8a4 4 0 0 0 0 5.4l1.3 1.2.4.6-.4.6-1.3 1.2q-1 1-1 2.6 0 1-.2 1.1l-.9.1H9.9a10 10 0 0 1-6.6-3Q1.8 29.7 1.9 28q.3-1.6 1.5-2.7c1-1 2.7-2 3.8-2.6l.6-.3a17 17 0 0 1 6.3-2.2"
                                  />
                                </svg>
                                <div className={styles.totalcounter}>
                                  {storyInsight.reachFollowerType?.nonFollowReach ?? "--"}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className={styles.Tableheader}>
                            <div className={styles.Tableheadertext}>Reach</div>
                            <div className={styles.Tableheadercounter}>{storyInsight.reach ?? "--"}</div>
                          </div>
                          <div className={styles.Tableheader1}>
                            {storyInsight.linkClicks && (
                              <div className={styles.row}>
                                <div className={styles.rowheader}>
                                  <div className={styles.bullet}></div>
                                  <div className={styles.insightlabel}>Link Clicks</div>
                                </div>
                                <div className={styles.insightlabel}>{storyInsight.linkClicks.count}</div>
                              </div>
                            )}
                            {storyInsight.stickerTapCounts &&
                              storyInsight.stickerTapCounts.map((v, i) => (
                                <div key={i} className={styles.row}>
                                  <div className={styles.rowheader}>
                                    <div className={styles.bullet}></div>
                                    <div className={styles.insightlabel}>{v.title}</div>
                                  </div>
                                  <div className={styles.insightlabel}>{v.tapCount}</div>
                                </div>
                              ))}
                          </div>
                          <div className={styles.Tableheader}>
                            <div className={styles.Tableheadertext}>Profile Activity</div>
                            <div className={styles.Tableheadercounter}>{storyInsight.profileActivity?.total}</div>
                          </div>
                          <div className={styles.Tableheader1}>
                            <div className={styles.row}>
                              <div className={styles.rowheader}>
                                <div className={styles.bullet}></div>
                                <div className={styles.insightlabel}>Profile Visits</div>
                              </div>
                              <div className={styles.insightlabel}>{storyInsight.profileActivity?.profileVisits}</div>
                            </div>
                            <div className={styles.row}>
                              <div className={styles.rowheader}>
                                <div className={styles.bullet}></div>
                                <div className={styles.insightlabel}>Follows</div>
                              </div>
                              <div className={styles.insightlabel}>{storyInsight.profileActivity?.follows}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.containergraph}>
                        <div className="headerandinput">
                          <div className="title">
                            {storyInsight.superFigures && storyInsight.superFigures[0]
                              ? storyInsight.superFigures[0].title
                              : ""}
                          </div>
                          {storyInsight.superFigures &&
                            storyInsight.superFigures[0] &&
                            (() => {
                              const propsMulti = buildMultiChartProps(0);
                              if (!propsMulti) return null;
                              return (
                                <MultiChart
                                  id={`insight-0`}
                                  name={propsMulti.objectNavigators[0].title || `insight-0`}
                                  seriesData={propsMulti.seriesData as any}
                                  objectNavigators={propsMulti.objectNavigators as any}
                                  onObjectNavigatorChange={(navIndex, firstIndex, secondIndex) => {
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
                            {storyInsight.superFigures && storyInsight.superFigures[1]
                              ? storyInsight.superFigures[1].title
                              : ""}
                          </div>
                          {storyInsight.superFigures &&
                            storyInsight.superFigures[1] &&
                            (() => {
                              const propsMulti = buildMultiChartProps(1);
                              if (!propsMulti) return null;
                              return (
                                <MultiChart
                                  id={`insight-1`}
                                  name={propsMulti.objectNavigators[0].title || `insight-1`}
                                  seriesData={propsMulti.seriesData as any}
                                  objectNavigators={propsMulti.objectNavigators as any}
                                  onObjectNavigatorChange={(navIndex, firstIndex, secondIndex) => {
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
                      {/* {session.user.loginStatus !== 0 && <NotPassword />} */}
                      {storyInsight.superFigures && storyInsight.superFigures.length > 0 && (
                        <div className={styles.containergraph}>
                          <div className="headerandinput">
                            <div className="title">
                              {storyInsight.superFigures && storyInsight.superFigures[2]
                                ? storyInsight.superFigures[2].title
                                : ""}
                            </div>
                            {storyInsight.superFigures[2] &&
                              (() => {
                                const propsMulti = buildMultiChartProps(2);
                                if (!propsMulti) return null;
                                return (
                                  <MultiChart
                                    id={`insight-2`}
                                    name={propsMulti.objectNavigators[0].title || `insight-2`}
                                    seriesData={propsMulti.seriesData as any}
                                    objectNavigators={propsMulti.objectNavigators as any}
                                    onObjectNavigatorChange={(navIndex, firstIndex, secondIndex) => {
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
                              {storyInsight.superFigures && storyInsight.superFigures[3]
                                ? storyInsight.superFigures[3].title
                                : ""}
                            </div>
                            {storyInsight.superFigures[3] &&
                              (() => {
                                const propsMulti = buildMultiChartProps(3);
                                if (!propsMulti) return null;
                                return (
                                  <MultiChart
                                    id={`insight-3`}
                                    name={propsMulti.objectNavigators[0].title || `insight-3`}
                                    seriesData={propsMulti.seriesData as any}
                                    objectNavigators={propsMulti.objectNavigators as any}
                                    onObjectNavigatorChange={(navIndex, firstIndex, secondIndex) => {
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
                      )}
                      {!loading && !storyInsight && (
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
            </>
          )}
        </div>
      </main>
      <Modal
        closePopup={() => setShowQuickReplyPopup(false)}
        classNamePopup={"popup"}
        showContent={showQuickReplyPopup}>
        <QuickStoryReplyPopup
          setShowQuickReplyPopup={setShowQuickReplyPopup}
          handleSaveAutoReply={handleUpdateAtuoReply}
          handleActiveAutoReply={handleResumeLiveAutoReply}
          autoReply={
            autoReply ?? {
              items: [],
              response: "",
              shouldFollower: false,
              automaticType: AutoReplyPayLoadType.KeyWord,
              masterFlow: null,
              masterFlowId: null,
              mediaId: "",
              pauseTime: Date.now(),
              productType: MediaProductType.Live,
              prompt: null,
              promptId: null,
              sendCount: 0,
              sendPr: false,
              replySuccessfullyDirected: true,
            }
          }
        />
      </Modal>
      <Modal closePopup={() => setShowLotteryPopup(false)} classNamePopup={"popup"} showContent={showLotteryPopup}>
        <LotteryPopup
          setShowLotteryPopup={setShowLotteryPopup}
          id={storyContent.storyId}
          lotteryType={LotteryPopupType.StoryLottery}
        />
      </Modal>
      <MediaModal isOpen={mediaModal.isOpen} media={mediaModal.media} onClose={mediaModal.close} />
    </>
  );
};

export default ShowStory;
