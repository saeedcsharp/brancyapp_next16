import { HubConnection, HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import { useSession } from "next-auth/react";
import router from "next/router";
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import InputText from "saeed/components/design/inputText";
import DotLoaders from "saeed/components/design/loader/dotLoaders";
import RingLoader from "saeed/components/design/loader/ringLoder";
import Modal from "saeed/components/design/modal";
import FlexibleToggleButton from "saeed/components/design/toggleButton/flexibleToggleButton";
import { ToggleOrder } from "saeed/components/design/toggleButton/types";
import ToggleCheckBoxButton from "saeed/components/design/toggleCheckBoxButton";
import Tooltip from "saeed/components/design/tooltip/tooltip";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import NotAllowed from "saeed/components/notOk/notAllowed";
import LotteryPopup, { LotteryPopupType } from "saeed/components/page/popup/lottery";
import { LoginStatus, RoleAccess } from "saeed/helper/loadingStatus";
import initialzedTime from "saeed/helper/manageTimer";
import { handleDecompress } from "saeed/helper/pako";
import { useInfiniteScroll } from "saeed/helper/useInfiniteScroll";
import { LanguageKey } from "saeed/i18n";
import { PartnerRole } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { MethodType } from "saeed/helper/apihelper";
import { ActionType, CommentType, ItemType, MediaProductType } from "saeed/models/messages/enum";
import {
  IComment,
  ICommetInbox,
  IGetCommentBoxInfo,
  IGetDirectInbox,
  IGetMediaCommentInfo,
  IHookAction,
  IHookComment,
  IHookPrivateReply,
  IMedia,
  IReplyCommentInfo,
  IReplyLiveCommentInfo,
  IReplyTicket,
} from "saeed/models/messages/IMessage";
import { IAutomaticReply, IMediaUpdateAutoReply } from "saeed/models/page/post/posts";
import CommentStatistics from "../popups/commentStatistics";
import EditAutoReplyForMedia from "../popups/editAutoReplyForMedia";
import CommentChatBox from "./commentChatBox";
import chatBoxStyles from "./commentChatBox.module.css";
import styles from "./commentInbox.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
let firstTime = 0;
let touchMove = 0;
let touchStart = 0;
let firstPos = { x: 0, y: 0 };
let downFlagLeft = false;
let downFlagRight = false;
let hideDivIndex: string | null = null;

const CommentInbox = () => {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const { t } = useTranslation();
  const { query } = router;
  let onLoading = false;
  let instagramerId = session?.user.instagramerIds[session?.user.currentIndex];
  const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
  const [postCommentInbox, setPostCommentInbox] = useState<ICommetInbox>();
  const refPostCommentInbox = useRef(postCommentInbox);
  useEffect(() => {
    refPostCommentInbox.current = postCommentInbox;
  }, [postCommentInbox]);
  const [searchPostCommentInbox, setSearchPostCommentInbox] = useState<ICommetInbox>();
  const [searchBusinessInbox, setSearchBusinessInbox] = useState<ICommetInbox>();
  const [storyCommentInbox, setStoryCommentInbox] = useState<ICommetInbox>();
  const [hideInbox, setHideInbox] = useState<ICommetInbox>();
  const refHideInbox = useRef(hideInbox);
  useEffect(() => {
    refHideInbox.current = hideInbox;
  }, [hideInbox]);
  const [searchHideInbox, setSearchHideInbox] = useState<ICommetInbox>();
  const refStoryCommentInbox = useRef(storyCommentInbox);
  useEffect(() => {
    refStoryCommentInbox.current = storyCommentInbox;
  }, [storyCommentInbox]);
  const [loading, setLoading] = useState(LoginStatus(session) && RoleAccess(session, PartnerRole.Comment));
  const [searchbox, setSearchbox] = useState("");
  const [toggleOrder, setToggleOrder] = useState<CommentType>(CommentType.Post);
  const [userSelectedId, setUserSelectedId] = useState<string | null>(null);
  const refUserSelectId = useRef(userSelectedId);
  useEffect(() => {
    refUserSelectId.current = userSelectedId;
  }, [userSelectedId]);
  const [searchLocked, setSearchLocked] = useState<boolean>(false);
  const [ws, setWs] = useState<HubConnection | null>(null);
  const refWs = useRef(ws);
  useEffect(() => {
    refWs.current = ws;
  }, [ws]);
  const [displayRight, setDisplayRight] = useState("");
  const [displayLeft, setDisplayLeft] = useState("");
  const userListRef = useRef<HTMLDivElement>(null);
  const [showIcon, setShowIcon] = useState("");
  const [showDivIndex, setShowDivIndex] = useState<string | null>(null);
  const [showMoreSettingDiv, setShowMoreSettingDiv] = useState(false);
  const [moreSettingClassName, setMoreSettingClassName] = useState("showDiv");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeReadState, setActiveReadState] = useState<boolean>(false);
  const [activeHideInbox, setActiveHideInbox] = useState(false);
  const [timoutId, setTimeoutId] = useState<any>();
  const [showSearchThread, setShowSearchThread] = useState({
    searchMode: false,
    loading: false,
    noResult: false,
  });
  const [replyItems, setReplyItems] = useState<IReplyTicket[]>([]);
  const [newCommentRefresh, setNewCommentRefresh] = useState(false);

  const [tempThreadIds, setTempThreadIds] = useState<{ mediaId: string; toggle: CommentType }[]>([]);
  const refTempThread = useRef(tempThreadIds);
  // const [ticketId, setTicketId] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [vanishLoading, setVanishLoading] = useState(false);

  // استفاده از useInfiniteScroll برای Post comments
  const { isLoadingMore: isLoadingMorePost } = useInfiniteScroll<IMedia>({
    hasMore: !!postCommentInbox?.oldestCursor && !showSearchThread.searchMode,
    fetchMore: async () => {
      if (postCommentInbox?.oldestCursor) {
        await fetchData(CommentType.Post, postCommentInbox.oldestCursor, null);
      }
      return [];
    },
    onDataFetched: () => {},
    getItemId: (media) => media.mediaId,
    currentData: postCommentInbox?.medias || [],
    threshold: 100,
    useContainerScroll: true,
    reverseScroll: false,
    fetchDelay: 300,
    enableAutoLoad: false,
    enabled: toggleOrder === CommentType.Post,
    containerRef: userListRef,
  });

  // استفاده از useInfiniteScroll برای Story comments
  const { isLoadingMore: isLoadingMoreStory } = useInfiniteScroll<IMedia>({
    hasMore: !!storyCommentInbox?.oldestCursor && !showSearchThread.searchMode,
    fetchMore: async () => {
      if (storyCommentInbox?.oldestCursor) {
        await fetchData(CommentType.Story, storyCommentInbox.oldestCursor, null);
      }
      return [];
    },
    onDataFetched: () => {},
    getItemId: (media) => media.mediaId,
    currentData: storyCommentInbox?.medias || [],
    threshold: 100,
    useContainerScroll: true,
    reverseScroll: false,
    fetchDelay: 300,
    enableAutoLoad: false,
    enabled: toggleOrder === CommentType.Story,
    containerRef: userListRef,
  });

  const isLoadingMore = toggleOrder === CommentType.Post ? isLoadingMorePost : isLoadingMoreStory;

  // Settings popup states
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [settingsToggleOrder, setSettingsToggleOrder] = useState(ToggleOrder.FirstToggle);
  const [vanishMode, setVanishMode] = useState(false);

  // Image popup states
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [popupImageUrl, setPopupImageUrl] = useState("");

  // Lottery popup state
  const [showLotteryPopup, setShowLotteryPopup] = useState(false);

  // Statistics popup state
  const [showStatisticsPopup, setShowStatisticsPopup] = useState(false);

  // Update vanish mode when selected user changes
  useEffect(() => {
    if (userSelectedId) {
      const currentChatBox = handleSpecifyChatBox();
      if (currentChatBox) {
        setVanishMode(currentChatBox.vanishMode);
      }
    }
  }, [userSelectedId, toggleOrder]);

  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  // Start or restart the timeout
  function startTimeout() {
    // Clear any existing one
    if (timeoutId) {
      clearTimeout(timeoutId);
      replyLoading;
    }

    // Define new one
    timeoutId = setTimeout(() => {
      if (replyLoading) setReplyLoading(false);
      timeoutId = null; // reset state
    }, 5000); // 5 seconds
  }
  const handleGetGeneralChats = async (thread: IMedia) => {
    if (userSelectedId === thread.mediaId) return;
    setReplyLoading(false);
    setUserSelectedId(null);
    let newTime = new Date().getTime();
    if (newTime - firstTime <= 110) {
      console.log("userSelectedId ", userSelectedId);
      if (thread.mediaId === showDivIndex) {
        setMoreSettingClassName("hideDiv");
        setTimeout(() => {
          hideDivIndex = thread.mediaId;
          touchMove = 0;
          setShowDivIndex(null);
          setShowMoreSettingDiv(false);
        }, 700);
        return;
      }
      if (typeof window !== undefined && window.innerWidth <= 800 && displayRight === "none") {
        setDisplayLeft("none");
        setDisplayRight("");
      }

      if (thread.mediaId === userSelectedId) return;
      setUserSelectedId(thread.mediaId);
    }
  };
  const handleMouseMove = (index: string) => {
    if (downFlagLeft && mousePos.x - firstPos.x < -10) {
      setMoreSettingClassName("showDiv");
      setShowMoreSettingDiv(true);
      setShowDivIndex(index);
      downFlagLeft = false;
      downFlagRight = false;
    }
    if (downFlagRight && mousePos.x - firstPos.x > 10 && showDivIndex !== null) {
      setMoreSettingClassName("hideDiv");
      downFlagRight = false;
      downFlagLeft = false;
      setTimeout(() => {
        hideDivIndex = index;
        setShowDivIndex(null);
        setShowMoreSettingDiv(false);
      }, 700);
    }
  };
  const handleTouchEnd = (index: string) => {
    if (touchMove === 0) return;
    if (touchMove - touchStart < -35) {
      setMoreSettingClassName("showDiv");
      setShowMoreSettingDiv(true);
      setShowDivIndex(index);
    } else if (touchMove - touchStart > 0) {
      setMoreSettingClassName("hideDiv");
      setTimeout(() => {
        hideDivIndex = index;
        setShowDivIndex(null);
        setShowMoreSettingDiv(false);
      }, 700);
    }
  };
  const handleMouseUp = () => {
    downFlagRight = false;
    downFlagLeft = false;
  };
  const handleMouseDown = () => {
    firstPos = mousePos;
    firstTime = new Date().getTime();
    downFlagLeft = true;
    downFlagRight = true;
  };

  const handleGetBusinessChats = async (thread: IMedia) => {
    setUserSelectedId(null);
    let newTime = new Date().getTime();
    if (newTime - firstTime <= 110) {
      if (thread.mediaId === showDivIndex) {
        setMoreSettingClassName("hideDiv");
        setTimeout(() => {
          hideDivIndex = thread.mediaId;
          touchMove = 0;
          setShowDivIndex(null);
          setShowMoreSettingDiv(false);
        }, 700);
        return;
      }
      if (typeof window !== undefined && window.innerWidth <= 800 && displayRight === "none") {
        setDisplayLeft("none");
        setDisplayRight("");
      }
      if (thread.mediaId === userSelectedId) return;

      setUserSelectedId(thread.mediaId);
    }
  };
  const handleToggleChange = (order: CommentType) => {
    const container = userListRef.current;
    if (container) {
      container.scrollTop = 0;
    }
    setUserSelectedId(null);
    setSearchbox("");
    setShowSearchThread({ searchMode: false, loading: false, noResult: false });
    hideDivIndex = null;
    setToggleOrder(order);
  };
  const handleResize = () => {
    if (typeof window !== undefined) {
      var width = window.innerWidth;
      if (width < 800 && userSelectedId) {
        setDisplayLeft("none");
        setDisplayRight("");
      } else if (width < 800 && !userSelectedId) {
        setDisplayRight("none");
        setDisplayLeft("");
      } else if (width >= 800) {
        setDisplayLeft("");
        setDisplayRight("");
      }
    }
  };

  const fetchData = async (ticketType: CommentType, nextMaxId: string | null, query: string | null) => {
    if (ticketType === CommentType.Post && !activeHideInbox) {
      console.log("nextMaxId", nextMaxId);
      console.log("searchTerm", query);
      try {
        const info: IGetCommentBoxInfo = {
          nextMaxId: nextMaxId,
          productType: MediaProductType.Feed,
          searchTerm: query,
        };
        let postComments = await clientFetchApi<IGetCommentBoxInfo, ICommetInbox>("Instagramer" + "/Comment/GetInbox", { methodType: MethodType.post, session: session, data: info, queries: undefined, onUploadProgress: undefined });
        console.log("not hides Fb inboxxxxxxxxxxxxxxxxxxx", postComments);
        if (postComments.succeeded && !query) {
          setPostCommentInbox((prev) => {
            // Create a Set of existing mediaIds for efficient lookup
            const existingMediaIds = new Set(prev!.medias.map((media) => media.mediaId));

            // Filter out medias that already exist
            const uniqueNewMedias = postComments.value.medias.filter((media) => !existingMediaIds.has(media.mediaId));

            return {
              ...prev!,
              oldestCursor: postComments.value.oldestCursor,
              medias: [...prev!.medias, ...uniqueNewMedias],
            };
          });
        } else if (postComments.succeeded && query) {
          if (postComments.value.medias.length > 0) {
            setSearchPostCommentInbox(postComments.value);
            setShowSearchThread((prev) => ({ ...prev, loading: false }));
          } else
            setShowSearchThread((prev) => ({
              ...prev,
              loading: false,
              noResult: true,
            }));
        } else if (!postComments.succeeded) {
          setShowSearchThread((prev) => ({
            ...prev,
            loading: false,
            noResult: true,
          }));
          notify(postComments.info.responseType, NotifType.Warning);
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
        // handleDisConnectedNetwork();
      }
      // mainNavOrderId = generalRes.value.mainNavOrderId;
    } else if (ticketType === CommentType.Story && !activeHideInbox) {
      try {
        const info: IGetCommentBoxInfo = {
          nextMaxId: nextMaxId,
          productType: MediaProductType.Live,
          searchTerm: query,
        };
        let businessRes = await clientFetchApi<IGetCommentBoxInfo, ICommetInbox>("Instagramer" + "/Comment/GetInbox", { methodType: MethodType.post, session: session, data: info, queries: undefined, onUploadProgress: undefined });
        console.log("businessRes ", businessRes.value);
        if (businessRes.succeeded && !query) {
          setStoryCommentInbox((prev) => ({
            ...prev!,
            oldestCursor: businessRes.value.oldestCursor,
            medias: [...prev!.medias, ...businessRes.value.medias],
          }));
        } else if (businessRes.succeeded && query) {
          if (businessRes.value.medias.length > 0) {
            setSearchBusinessInbox(businessRes.value);
            setShowSearchThread((prev) => ({ ...prev, loading: false }));
          } else
            setShowSearchThread((prev) => ({
              ...prev,
              loading: false,
              noResult: true,
            }));
        } else if (!businessRes.succeeded) {
          setShowSearchThread((prev) => ({
            ...prev,
            loading: false,
            noResult: true,
          }));
          notify(businessRes.info.responseType, NotifType.Warning);
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    } else if (ticketType === CommentType.Post && activeHideInbox) {
      try {
        let hideFb = await clientFetchApi<boolean, ICommetInbox>("Instagramer" + "/Comment/GetInbox", { methodType: MethodType.post, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
        console.log("Hide Fb inboxxxxxxxxxxxxxxxxxxx ", hideFb.value);
        if (hideFb.succeeded && !query) {
          setHideInbox((prev) => ({
            ...prev!,
            oldestCursor: hideFb.value.oldestCursor,
            medias: [...prev!.medias, ...hideFb.value.medias],
          }));
        } else if (hideFb.succeeded && query) {
          if (hideFb.value.medias.length > 0) {
            setSearchHideInbox(hideFb.value);
            setShowSearchThread((prev) => ({ ...prev, loading: false }));
          } else
            setShowSearchThread((prev) => ({
              ...prev,
              loading: false,
              noResult: true,
            }));
        } else if (!hideFb.succeeded) {
          setShowSearchThread((prev) => ({
            ...prev,
            loading: false,
            noResult: true,
          }));
          notify(hideFb.info.responseType, NotifType.Warning);
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    }
  };
  async function fetchStoryCpmments() {
    try {
      const info: IGetCommentBoxInfo = {
        nextMaxId: null,
        productType: MediaProductType.Live,
        searchTerm: null,
      };
      let postComments = await clientFetchApi<IGetCommentBoxInfo, ICommetInbox>("Instagramer" + "/Comment/GetInbox", { methodType: MethodType.post, session: session, data: info, queries: undefined, onUploadProgress: undefined });
      if (router.isReady && query.mediaId !== undefined && query.commentType === "story") {
        const mediaId = query.mediaId as string;
        const media = postComments.value.medias.find((x) => x.mediaId === mediaId);
        if (media) {
          setUserSelectedId(mediaId);
          setStoryCommentInbox(postComments.value);
        } else {
          try {
            const info: IGetMediaCommentInfo = {
              justUnAnswered: false,
              mediaId: mediaId,
              nextMaxId: null,
              searchInReplys: false,
              searchTerm: null,
            };
            let newThread = await clientFetchApi<IGetMediaCommentInfo, IMedia>("/api/comment/GetMediaComments", { methodType: MethodType.post, session: session, data: info, queries: undefined, onUploadProgress: undefined });
            if (newThread.succeeded) {
              setUserSelectedId(newThread.value.mediaId);
              setStoryCommentInbox((prev) => ({
                ...prev!,
                ownerInbox: postComments.value.ownerInbox,
                medias: [newThread.value, ...postComments.value.medias],
              }));
            } else notify(newThread.info.responseType, NotifType.Warning);
          } catch (error) {
            notify(ResponseType.Unexpected, NotifType.Error);
          }
        }
      } else setStoryCommentInbox(postComments.value);
      console.log("fbRes.value ", postComments.value);
    } catch (error) {}
  }
  const fetchPostComments = async () => {
    try {
      const info: IGetCommentBoxInfo = {
        nextMaxId: null,
        productType: MediaProductType.Feed,
        searchTerm: null,
      };
      let postComments = await clientFetchApi<IGetCommentBoxInfo, ICommetInbox>("/api/comment/GetInbox", { methodType: MethodType.post, session: session, data: info, queries: undefined, onUploadProgress: undefined });
      if (router.isReady && query.mediaId !== undefined && query.commentType === "post") {
        const mediaId = query.mediaId as string;
        const media = postComments.value.medias.find((x) => x.mediaId === mediaId);
        if (media) {
          setUserSelectedId(mediaId);
          setPostCommentInbox(postComments.value);
        } else {
          try {
            const info: IGetMediaCommentInfo = {
              justUnAnswered: false,
              mediaId: mediaId,
              nextMaxId: null,
              searchInReplys: false,
              searchTerm: null,
            };
            let newThread = await clientFetchApi<IGetMediaCommentInfo, IMedia>("Instagramer" + "/Comment/GetMediaComments", { methodType: MethodType.post, session: session, data: info, queries: undefined, onUploadProgress: undefined });
            if (newThread.succeeded) {
              setUserSelectedId(newThread.value.mediaId);
              setPostCommentInbox((prev) => ({
                ...prev!,
                ownerInbox: postComments.value.ownerInbox,
                medias: [newThread.value, ...postComments.value.medias],
              }));
            } else notify(newThread.info.responseType, NotifType.Warning);
          } catch (error) {
            notify(ResponseType.Unexpected, NotifType.Error);
          }
        }
      } else setPostCommentInbox(postComments.value);
      console.log("fbRes.value ", postComments.value);
    } catch (error) {}
    await handleSignalR();
    setLoading(false);
  };
  async function fetchHides() {
    try {
      let res = await clientFetchApi<boolean, ICommetInbox>("Instagramer" + "/Comment/GetInbox", { methodType: MethodType.post, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
      console.log(" ✅ Console ⋙ Hide ", res.value);
      if (res.succeeded) setHideInbox(res.value);
      else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Warning);
    }
  }
  const fetchItemData = async (mediaId: string, nextMaxId: string | null, vanishMode: boolean) => {
    console.log("nextMaxId", nextMaxId);
    console.log("vanishMode", vanishMode);
    console.log("mediaId", mediaId);
    if (onLoading) return;
    onLoading = true;
    try {
      if (!nextMaxId) setVanishLoading(true);
      const info: IGetMediaCommentInfo = {
        justUnAnswered: vanishMode,
        mediaId: mediaId,
        nextMaxId: nextMaxId,
        searchInReplys: false,
        searchTerm: null,
      };
      let newThread = await clientFetchApi<IGetMediaCommentInfo, IMedia>("Instagramer" + "/Comment/GetMediaComments", { methodType: MethodType.post, session: session, data: info, queries: undefined, onUploadProgress: undefined });
      console.log("newThreadFetch", newThread);
      if (newThread.succeeded) {
        var postCom = postCommentInbox?.medias.find((x) => x.mediaId === mediaId);
        var storyCom = storyCommentInbox?.medias.find((x) => x.mediaId === mediaId);
        if (postCom) {
          setPostCommentInbox((prev) => ({
            ...prev!,
            medias: prev!.medias.map((x) =>
              x.mediaId !== mediaId
                ? x
                : {
                    ...x,
                    vanishMode: vanishMode,
                    nextMaxId: newThread.value.nextMaxId,
                    comments: nextMaxId ? [...newThread.value.comments, ...x.comments] : newThread.value.comments,
                  },
            ),
          }));
        } else if (storyCom) {
          setStoryCommentInbox((prev) => ({
            ...prev!,
            medias: prev!.medias.map((x) =>
              x.mediaId !== mediaId
                ? x
                : {
                    ...x,
                    vanishMode: vanishMode,
                    nextMaxId: newThread.value.nextMaxId,
                    comments: nextMaxId ? [...newThread.value.comments, ...x.comments] : newThread.value.comments,
                  },
            ),
          }));
        }
        console.log("newItemsssssssssssssssssss", newThread.value);
        console.log("nextmaxid", newThread.value.nextMaxId);
      } else notify(newThread.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setVanishLoading(false);
    }

    // try {
    //   let res = await GetServerResult<boolean, IMedia>(
    //     MethodType.get,
    //     session,
    //     "Instagramer"+ "/Comment/GetF",
    //     null,
    //     [{ key: "ticketId", value: chatBox.mediaId.toString() }]
    //   );
    //   if (res.succeeded) {
    //     setPostCommentInbox((prev) => ({
    //       ...prev!,
    //       medias: [res.value, ...prev!.medias],
    //     }));
    //   } else notify(res.info.responseType, NotifType.Warning);
    // } catch (error) {
    //   notify(ResponseType.Unexpected, NotifType.Error);
    // }
    setTimeout(() => {
      onLoading = false;
    }, 500);

    // console.log("newThread", newThread);1
  };
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  async function fetchLiveMedia(mediaId: string) {
    try {
      for (let i = 0; i < 10; i++) {
        const info: IGetMediaCommentInfo = {
          justUnAnswered: false,
          mediaId: mediaId,
          nextMaxId: null,
          searchInReplys: false,
          searchTerm: null,
        };
        let newThread = await clientFetchApi<IGetMediaCommentInfo, IMedia>("Instagramer" + "/Comment/GetMediaComments", { methodType: MethodType.post, session: session, data: info, queries: undefined, onUploadProgress: undefined });
        console.log("newThreadFetch", newThread);
        if (newThread.succeeded) {
          if (
            newThread.value.productType === MediaProductType.Feed ||
            newThread.value.productType === MediaProductType.Reels
          ) {
            const media = refPostCommentInbox.current?.medias.find((x) => x.mediaId === mediaId);
            if (media) return;
            setPostCommentInbox((prev) => ({
              ...prev!,
              medias: [newThread.value, ...prev!.medias],
            }));
          } else {
            const media = refStoryCommentInbox.current?.medias.find((x) => x.mediaId === mediaId);
            if (media) return;
            setStoryCommentInbox((prev) => ({
              ...prev!,
              medias: [newThread.value, ...prev!.medias],
            }));

            console.log("newItemsssssssssssssssssss", newThread.value);
            console.log("nextmaxid", newThread.value.nextMaxId);
          }
          break;
        } else if (i == 9) notify(newThread.info.responseType, NotifType.Warning);
        else {
          await delay(1000);
        }
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleReplyComment(comment: IComment, answerBox: string, privateReply: boolean = false) {
    try {
      setReplyLoading(true);
      startTimeout();
      const info: IReplyCommentInfo = {
        private: privateReply,
        commentId: comment.id,
        mediaId: comment.mediaId,
        createdTime: comment.createdTime,
        sign: comment.sign,
        signTime: comment.signTime,
        text: answerBox,
      };
      console.log("infooooooooooooooooooo", info);
      await ws?.send("SendReplyComment", JSON.stringify(info).toString());
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleReplyLiveComment(lastComment: IComment, comment: IComment, answerBox: string) {
    try {
      setReplyLoading(true);
      startTimeout();
      const info: IReplyLiveCommentInfo = {
        private: true,
        commentId: comment.id,
        mediaId: lastComment.mediaId,
        sign: comment.sign,
        signTime: comment.signTime,
        text: answerBox,
        createdTime: comment.createdTime,
        lastCreatedTime: lastComment.createdTime,
        lastCommentId: lastComment.id,
        lastSign: lastComment.sign,
        lastSignTime: lastComment.signTime,
      };
      console.log("infooooooooooooooooooo", JSON.stringify(info));
      await ws?.send("SendLiveReplyComment", JSON.stringify(info).toString());
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleTurnOnCommenting(postId: number) {
    try {
      const res = await clientFetchApi<boolean, boolean>("Instagramer" + "/post/ChangeCommentingStatus", { methodType: MethodType.get, session: session, data: undefined, queries: [
          { key: "postId", value: postId.toString() },
          { key: "isEnable", value: "true" },
        ], onUploadProgress: undefined });
      if (res.succeeded) {
        setPostCommentInbox((prev) => ({
          ...prev!,
          medias: prev!.medias.map((x) => (x.postId !== postId ? x : { ...x, commentEnabled: true })),
        }));
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  // async function handleCloseTicket(ticketId: number) {
  //   try {
  //     if (ticketId === userSelectedId) setUserSelectedId(null);
  //     let res = await GetServerResult<IGetDirectInbox, ITicketInbox>(
  //       MethodType.get,
  //       session,
  //       "Instagramer"+ "/Ticket/CloseFbTicket",
  //       null,
  //       [{ key: "ticketId", value: ticketId.toString() }]
  //     );
  //     if (!res.succeeded) notify(res.info.responseType, NotifType.Warning);
  //   } catch (error) {
  //     notify(ResponseType.Unexpected, NotifType.Error);
  //   }
  // }
  // async function handleHideTicket(ticketId: number, hidden: boolean) {
  //   try {
  //     if (ticketId === userSelectedId) setUserSelectedId(null);
  //     let res = await GetServerResult<IGetDirectInbox, ITicketInbox>(
  //       MethodType.get,
  //       session,
  //       "Instagramer"+ "/Ticket/UpdateFbTicketHiddenStatus",
  //       null,
  //       [
  //         { key: "ticketId", value: ticketId.toString() },
  //         { key: "isHidden", value: (!hidden).toString() },
  //       ]
  //     );
  //     if (res.succeeded && !hidden) {
  //       const thread = fbInbox?.threads.find((x) => x.ticketId === ticketId);
  //       if (!thread) return;
  //       thread.isHide = !hidden;
  //       setFbInbox((prev) => ({
  //         ...prev!,
  //         threads: prev!.threads.filter((x) => x.ticketId !== ticketId),
  //       }));
  //       setHideInbox((prev) => ({
  //         ...prev!,
  //         threads: [thread, ...prev!.threads],
  //       }));
  //     } else if (res.succeeded && hidden) {
  //       const thread = hideInbox?.threads.find((x) => x.ticketId === ticketId);
  //       console.log("threadddddd", thread);
  //       if (!thread) return;
  //       thread.isHide = !hidden;
  //       setHideInbox((prev) => ({
  //         ...prev!,
  //         threads: prev!.threads.filter((x) => x.ticketId !== ticketId),
  //       }));
  //       setFbInbox((prev) => ({
  //         ...prev!,
  //         threads: [thread, ...prev!.threads],
  //       }));
  //     } else notify(res.info.responseType, NotifType.Warning);
  //   } catch (error) {
  //     notify(ResponseType.Unexpected, NotifType.Error);
  //   }
  // }
  /* ___chat box___*/
  const handleShowIcon = (e: MouseEvent) => {
    e.stopPropagation();
    setShowIcon(e.currentTarget.id !== showIcon ? e.currentTarget.id : "");
    // setServerHahstagListId(e.currentTarget.id);
  };
  const showUserList = () => {
    if (typeof window !== undefined && window.innerWidth <= 800 && displayLeft === "none") {
      setDisplayLeft("");
      setDisplayRight("none");
    }
    // setChatBox(null);
    setUserSelectedId(null);
  };

  // Settings popup functions
  function handleVanishModeSettings(e: ChangeEvent<HTMLInputElement>) {
    const vanish = e.target.checked;
    setVanishMode(vanish);
    if (userSelectedId) {
      fetchItemData(userSelectedId, null, vanish);
    }
  }

  async function handleUpdateAutoReplySettings(sendReply: IMediaUpdateAutoReply) {
    if (!userSelectedId) return;

    const currentChatBox = handleSpecifyChatBox();
    if (!currentChatBox) return;

    if (currentChatBox.productType === MediaProductType.Feed || currentChatBox.productType === MediaProductType.Reels) {
      handleUpdateFeedAutoReply(sendReply, currentChatBox.mediaId, currentChatBox.postId!);
    } else if (
      currentChatBox.productType === MediaProductType.Story ||
      currentChatBox.productType === MediaProductType.Live
    ) {
      handleUpdateLiveAutoReply(sendReply, currentChatBox.mediaId);
    }
  }

  async function handlePauseAutoReplySettings(e: ChangeEvent<HTMLInputElement>) {
    if (!userSelectedId) return;

    const currentChatBox = handleSpecifyChatBox();
    if (!currentChatBox) return;

    const qRrep = e.target.checked;
    if (currentChatBox.productType === MediaProductType.Feed || currentChatBox.productType === MediaProductType.Reels) {
      handleResumeFeedAutoReply(qRrep, currentChatBox.postId!);
    } else if (currentChatBox.productType === MediaProductType.Live) {
      handleResumeLiveAutoReply(qRrep, currentChatBox.mediaId);
    }
  }

  // Image popup handlers
  const handleImageClick = (imageUrl: string) => {
    setPopupImageUrl(imageUrl);
    setShowImagePopup(true);
  };

  const handleCloseImagePopup = () => {
    setShowImagePopup(false);
    setPopupImageUrl("");
  };

  const handleRestartSignalR = () => {
    // handleDisConnectedNetwork();
    setTimeout(() => {
      handleSignalR();
    }, 5000);
  };
  let handleSignalR = async () => {
    setTimeout(async () => {
      console.log(" ✅ Console ⋙ Hook ");
      if (
        refWs.current?.state === HubConnectionState.Connected ||
        refWs.current?.state === HubConnectionState.Connecting
      ) {
        console.log("HubConnectionState.Connected", refWs.current?.state);
        return;
      }
      if (session == null) {
        console.log("session ", session);

        return;
      }
      if (refPostCommentInbox.current === undefined) {
        console.log("gInbox.current ", refPostCommentInbox.current);
        console.log(" bInbox.current  ", refStoryCommentInbox.current);
        return;
      }
      //  console.log(instagramerId);
      let userSession = {
        accessToken: session?.user.socketAccessToken,
        instagramerId: instagramerId,
        role: PartnerRole.Comment,
      };
      let str = JSON.stringify(userSession);
      var s = new HubConnectionBuilder()
        .withUrl("https://socket.brancy.app/Hubs/GraphClient?access_token=" + str)
        .build();
      s.start().catch((error) => {
        console.log(error);
        handleRestartSignalR();
      });
      s.on("graph_comment", async (comment: string) => {
        const decopmressComment = handleDecompress(comment);
        console.log("graph_comment", decopmressComment);
        if (!decopmressComment) return;
        const newComent: IHookComment = JSON.parse(decopmressComment);
        console.log("newComentttttttt", newComent);
        if (
          newComent.MediaType === MediaProductType.Feed ||
          newComent.MediaType === MediaProductType.Reels ||
          newComent.MediaType === MediaProductType.Ad
        ) {
          if (
            (newComent.MediaType === MediaProductType.Feed || newComent.MediaType === MediaProductType.Reels) &&
            newComent.ParrentId
          ) {
            const media = refPostCommentInbox.current?.medias.find((x) => x.mediaId === newComent.MediaId);
            if (media) {
              setPostCommentInbox((prev) => ({
                ...prev!,
                medias: prev!.medias.map((x) =>
                  x.mediaId !== newComent.MediaId
                    ? x
                    : {
                        ...x,
                        commentEnabled: true,
                        commentCount: newComent.Username.length == 0 ? x.commentCount : x.commentCount + 1,
                        unSeenCount: newComent.SentByOwner ? 0 : x.unSeenCount,
                        unAnsweredCount:
                          newComent.SentByOwner &&
                          x.comments.find((c) => c.id === newComent.ParrentId)?.replys?.find((x) => x.sentByOwner)
                            ? x.unAnsweredCount
                            : x.unAnsweredCount - 1,
                        comments: !x.vanishMode
                          ? x.comments.map((z) =>
                              z.id !== newComent.ParrentId
                                ? z
                                : {
                                    ...z,
                                    replys: [
                                      ...z.replys!.filter((x) => x.id != newComent.CommentId),
                                      {
                                        privateReply: null,
                                        createdTime: newComent.CreatedTime * 1e6,
                                        fullName: newComent.Username,
                                        id: newComent.CommentId,
                                        isAnswered: false,
                                        isDeleted: false,
                                        isHide: false,
                                        isIgnored: false,
                                        likeCount: 0,
                                        mediaId: newComent.MediaId,
                                        parentId: newComent.ParrentId,
                                        profileUrl: newComent.ProfileUrl,
                                        replys: [],
                                        sentByOwner: newComent.SentByOwner,
                                        text: newComent.Text,
                                        threadId: newComent.ThreadId,
                                        username: newComent.Username,
                                        sign: newComent.Sign,
                                        signTime: newComent.SignTime,
                                      },
                                    ],
                                  },
                            )
                          : x.comments.filter((c) => c.id !== newComent.ParrentId),
                      },
                ),
              }));
              setNewCommentRefresh((prev) => !prev);
            }
            // else if (!newComent.SentByOwner) {
            //   console.log("Not exist media");
            //   setTimeout(() => {
            //     fetchLiveMedia(newComent.MediaId);
            //   }, 10000);

            // }
          } else if (
            (newComent.MediaType === MediaProductType.Feed || newComent.MediaType === MediaProductType.Reels) &&
            !newComent.ParrentId
          ) {
            const media = refPostCommentInbox.current?.medias.find((x) => x.mediaId === newComent.MediaId);
            if (media) {
              console.log("comeeeeentExistMedia", media);
              setPostCommentInbox((prev) => ({
                ...prev!,
                medias: prev!.medias
                  .map((x) =>
                    x.mediaId !== newComent.MediaId
                      ? x
                      : {
                          ...x,
                          commentCount: newComent.Username.length == 0 ? x.commentCount : x.commentCount + 1,
                          commentEnabled: true,
                          unSeenCount: newComent.SentByOwner
                            ? 0
                            : refUserSelectId.current !== newComent.MediaId
                              ? x.unSeenCount + 1
                              : 0,
                          lastCommentUnix: newComent.CreatedTime * 1e6,
                          lastSeenUnix: 0,
                          unAnsweredCount:
                            !newComent.SentByOwner && userSelectedId === x.mediaId
                              ? x.unAnsweredCount + 1
                              : x.unAnsweredCount,
                          comments: [
                            ...x.comments,
                            {
                              privateReply: null,
                              createdTime: newComent.CreatedTime * 1e6,
                              fullName:
                                x.comments.findLast((y) => y.username == newComent.Username)?.fullName ??
                                newComent.Username,
                              id: newComent.CommentId,
                              isAnswered: false,
                              isDeleted: false,
                              isHide: false,
                              isIgnored: false,
                              likeCount: 0,
                              mediaId: newComent.MediaId,
                              parentId: newComent.ParrentId,
                              profileUrl: newComent.ProfileUrl,
                              replys: [],
                              sentByOwner: newComent.SentByOwner,
                              text: newComent.Text,
                              threadId: newComent.ThreadId,
                              username: newComent.Username,
                              sign: newComent.Sign,
                              signTime: newComent.SignTime,
                            },
                          ],
                        },
                  )
                  .sort((a, b) => b.lastCommentUnix - a.lastCommentUnix),
              }));
              if (!newComent.SentByOwner) {
                setNewCommentRefresh((prev) => !prev);
              }
            } else if (!newComent.SentByOwner) {
              console.log("not exist");

              await fetchLiveMedia(newComent.MediaId);
            }
          }
        } else if (newComent.MediaType === MediaProductType.Live) {
          const media = refStoryCommentInbox.current?.medias.find((x) => x.mediaId === newComent.MediaId);
          console.log("liveeeeeeeeeeeeeee", media);
          if (media) {
            console.log("comeeeeent");
            setStoryCommentInbox((prev) => ({
              ...prev!,
              medias: prev!.medias
                .map((x) =>
                  x.mediaId !== newComent.MediaId
                    ? x
                    : {
                        ...x,
                        unSeenCount: newComent.SentByOwner
                          ? 0
                          : refUserSelectId.current !== newComent.MediaId
                            ? x.unSeenCount + 1
                            : 0,
                        commentEnabled: true,
                        lastSeenUnix: 0,
                        lastCommentUnix: newComent.CreatedTime * 1e6,
                        unAnsweredCount:
                          !newComent.SentByOwner && userSelectedId === x.mediaId
                            ? x.unAnsweredCount + 1
                            : x.unAnsweredCount,
                        comments: [
                          ...x.comments,
                          {
                            privateReply: null,
                            createdTime: newComent.CreatedTime * 1e6,
                            fullName:
                              x.comments.findLast((y) => y.username == newComent.Username)?.fullName ??
                              newComent.Username,
                            id: newComent.CommentId,
                            isAnswered: false,
                            isDeleted: false,
                            isHide: false,
                            isIgnored: false,
                            likeCount: 0,
                            mediaId: newComent.MediaId,
                            parentId: newComent.ParrentId,
                            profileUrl: newComent.ProfileUrl,
                            replys: [],
                            sentByOwner: newComent.SentByOwner,
                            text: newComent.Text,
                            threadId: newComent.ThreadId,
                            username: newComent.Username,
                            sign: newComent.Sign,
                            signTime: newComent.SignTime,
                          },
                        ],
                      },
                )
                .sort((a, b) => b.lastCommentUnix - a.lastCommentUnix),
            }));
            if (!newComent.SentByOwner) setNewCommentRefresh((prev) => !prev);
          } else if (!media) {
            await fetchLiveMedia(newComent.MediaId);
          }
        }
        setReplyLoading(false);
      });
      s.on("graph_CommentAction", async (comment: string) => {
        const decopmressComment = handleDecompress(comment);
        if (!decopmressComment) return;
        const action: IHookAction = JSON.parse(decopmressComment);
        console.log("graph_CommentAction", action);
        if (action.ActionType === ActionType.MediaDeleted || action.ActionType === ActionType.Delete) {
          setReplyLoading(false);
        }
        if (action.ActionType === ActionType.MediaDeleted)
          setPostCommentInbox((prev) => ({
            ...prev!,
            medias: prev!.medias.filter((x) => x.mediaId !== action.MediaId),
          }));
        else if (refPostCommentInbox.current?.medias.find((x) => x.mediaId === action.MediaId)) {
          setPostCommentInbox((prev) => ({
            ...prev!,
            medias: prev!.medias.map((x) =>
              x.mediaId !== action.MediaId
                ? x
                : {
                    ...x,
                    commentEnabled: action.ActionType === ActionType.CommentingDesabled ? false : x.commentEnabled,
                    unSeenCount: action.ActionType === ActionType.Read ? 0 : x.unSeenCount,
                    lastSeenUnix: action.ActionType === ActionType.Read ? Date.now() * 1e6 : x.lastSeenUnix,
                    comments: x.comments
                      .map((c) =>
                        c.id !== action.CommentId
                          ? c
                          : {
                              ...c,
                              isHide:
                                action.ActionType === ActionType.Hide
                                  ? true
                                  : action.ActionType === ActionType.UnHide
                                    ? false
                                    : c.isHide,
                            },
                      )
                      .filter((c) =>
                        action.ActionType === ActionType.Delete || action.ActionType === ActionType.Ignore
                          ? c.id !== action.CommentId
                          : true,
                      ),
                  },
            ),
          }));
        } else if (refStoryCommentInbox.current?.medias.find((x) => x.mediaId === action.MediaId)) {
          setStoryCommentInbox((prev) => ({
            ...prev!,
            medias: prev!.medias.map((x) =>
              x.mediaId !== action.MediaId
                ? x
                : {
                    ...x,
                    unSeenCount: action.ActionType === ActionType.Read ? 0 : x.unSeenCount,
                    lastSeenUnix: action.ActionType === ActionType.Read ? Date.now() * 1e6 : x.lastSeenUnix,
                  },
            ),
          }));
        }
      });
      s.on("graph_PrivateReplyComment", async (comment: string) => {
        const decopmressComment = handleDecompress(comment);
        if (!decopmressComment) return;
        const newComent: IHookPrivateReply = JSON.parse(decopmressComment);
        console.log("graph_PrivateReplyComment", newComent);
        if (newComent.IsLive) {
          setStoryCommentInbox((prev) => ({
            ...prev!,
            medias: prev!.medias.map((x) =>
              x.mediaId !== newComent.MediaId
                ? x
                : {
                    ...x,

                    unAnsweredCount: x.comments
                      .find((c) => c.id === newComent.ParentCommentId)
                      ?.replys?.find((x) => x.sentByOwner)
                      ? x.unAnsweredCount
                      : x.unAnsweredCount - 1,
                    comments: !x.vanishMode
                      ? x.comments.map((z) =>
                          z.id !== newComent.ParentCommentId
                            ? z
                            : {
                                ...z,
                                privateReply: {
                                  audio: null,
                                  createdTime: Date.now() * 1e6,
                                  clientContext: null,
                                  buttons: null,
                                  graphItemId: newComent.OwnerId,
                                  isUnsupporeted: false,
                                  itemId: newComent.OwnerId,
                                  itemType: ItemType.Text,
                                  medias: [],
                                  mediaShares: [],
                                  ownerEmojiReaction: null,
                                  payloadId: null,
                                  recpEmojiReaction: null,
                                  repliedToItemId: null,
                                  repliedToItem: null,
                                  replyStory: null,
                                  sentByOwner: true,
                                  text: newComent.Text,
                                  userId: newComent.OwnerId,
                                  storyMention: null,
                                },
                              },
                        )
                      : x.comments.filter((c) => c.id !== newComent.ParentCommentId),
                  },
            ),
          }));
        } else
          setPostCommentInbox((prev) => ({
            ...prev!,
            medias: prev!.medias.map((x) =>
              x.mediaId !== newComent.MediaId
                ? x
                : {
                    ...x,
                    unAnsweredCount: x.comments
                      .find((c) => c.id === newComent.ParentCommentId)
                      ?.replys?.find((x) => x.sentByOwner)
                      ? x.unAnsweredCount
                      : x.unAnsweredCount - 1,
                    comments: !x.vanishMode
                      ? x.comments.map((z) =>
                          z.id !== newComent.ParentCommentId
                            ? z
                            : {
                                ...z,
                                privateReply: {
                                  audio: null,
                                  createdTime: Date.now() * 1e6,
                                  clientContext: null,
                                  buttons: null,
                                  graphItemId: newComent.OwnerId,
                                  isUnsupporeted: false,
                                  itemId: newComent.OwnerId,
                                  itemType: ItemType.Text,
                                  medias: [],
                                  mediaShares: [],
                                  ownerEmojiReaction: null,
                                  payloadId: null,
                                  recpEmojiReaction: null,
                                  repliedToItemId: null,
                                  repliedToItem: null,
                                  replyStory: null,
                                  sentByOwner: true,
                                  text: newComent.Text,
                                  userId: newComent.OwnerId,
                                  storyMention: null,
                                },
                              },
                        )
                      : x.comments.filter((c) => c.id !== newComent.ParentCommentId),
                  },
            ),
          }));
        setNewCommentRefresh((prev) => !prev);
        setReplyLoading(false);
      });
      s.onclose(() => handleRestartSignalR());
      console.log(s.state);
      setWs(s);
    }, 500);
  };

  function handleSpecifyChatBox() {
    if (toggleOrder === CommentType.Post && showSearchThread.searchMode) {
      return searchPostCommentInbox?.medias?.find((x) => x.mediaId === userSelectedId);
    } else if (toggleOrder === CommentType.Story && showSearchThread.searchMode) {
      return storyCommentInbox?.medias?.find((x) => x.mediaId === userSelectedId);
    } else if (toggleOrder === CommentType.Post && !showSearchThread.searchMode) {
      return postCommentInbox?.medias?.find((x) => x.mediaId === userSelectedId);
    } else if (toggleOrder === CommentType.Story && !showSearchThread.searchMode) {
      return storyCommentInbox?.medias?.find((x) => x.mediaId === userSelectedId);
    }
  }
  const handleSearchThreads = async (e: ChangeEvent<HTMLInputElement>) => {
    setUserSelectedId(null);
    if (!LoginStatus(session)) return;
    setShowSearchThread({ searchMode: true, loading: true, noResult: false });
    setSearchPostCommentInbox((prev) => ({ ...prev!, threads: [] }));
    const query = e.target.value;
    setSearchbox(query);
    if (timoutId) clearTimeout(timoutId);
    if (query.length > 0) {
      let timeOutId = setTimeout(() => {
        if (query && query.length > 0) {
          if (searchLocked) return;
          console.log("searchhhchhhhhhh");
          setSearchLocked(true);
          fetchData(toggleOrder, null, query);
          setTimeout(() => {
            setSearchLocked(false);
          }, 2000);
        }
      }, 1000);
      setTimeoutId(timeOutId);
    } else {
      setShowSearchThread({
        searchMode: false,
        loading: false,
        noResult: false,
      });
    }
  };
  const handleSelectSearch = async (thread: IMedia, toggle: CommentType) => {
    setUserSelectedId(thread.mediaId);
    if (
      postCommentInbox?.medias.find((x) => x.mediaId === thread.mediaId) ||
      storyCommentInbox?.medias.find((x) => x.mediaId === thread.mediaId)
    ) {
      setSearchbox("");
      setShowSearchThread((prev) => ({ ...prev, searchMode: false }));
    } else setTempThreadIds((prev) => [...prev, { mediaId: thread.mediaId, toggle: toggle }]);
  };
  async function handleUpdateFeedAutoReply(sendReply: IMediaUpdateAutoReply, mediaId: string, postId: number) {
    console.log("sendAutoooooooFeed", sendReply);
    try {
      var res = await clientFetchApi<IMediaUpdateAutoReply, IAutomaticReply>("/api/post/UpdateAutoReply", { methodType: MethodType.post, session: session, data: sendReply, queries: [{ key: "postId", value: postId.toString() }], onUploadProgress: undefined });
      console.log("ressssssss", res, mediaId);
      if (res.succeeded) {
        setPostCommentInbox((prev) => ({
          ...prev!,
          medias: prev!.medias.map((x) =>
            x.mediaId !== mediaId
              ? x
              : {
                  ...x,
                  automaticCommentReply: res.value,
                },
          ),
        }));
        internalNotify(InternalResponseType.Ok, NotifType.Success);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error, "socket error");
    }
  }
  async function handleUpdateLiveAutoReply(sendReply: IMediaUpdateAutoReply, liveMediaId: string) {
    console.log("sendAutoooooooLive", sendReply);
    try {
      var res = await clientFetchApi<IMediaUpdateAutoReply, IAutomaticReply>("/api/comment/UpdateLiveAutoReply", { methodType: MethodType.post, session: session, data: sendReply, queries: [{ key: "liveMediaId", value: liveMediaId }], onUploadProgress: undefined });
      if (res.succeeded) {
        setPostCommentInbox((prev) => ({
          ...prev!,
          medias: prev!.medias.map((x) =>
            x.mediaId !== liveMediaId
              ? x
              : {
                  ...x,
                  automaticCommentReply: res.value,
                },
          ),
        }));
        internalNotify(InternalResponseType.Ok, NotifType.Success);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error, "socket error");
    }
  }
  async function handleResumeFeedAutoReply(activeAutoReply: boolean, postId: number) {
    try {
      var res = await clientFetchApi<boolean, boolean>("Instagramer" + `/Post/${!activeAutoReply ? "PauseAutoReply" : "ResumeAutoReply"}`, { methodType: MethodType.get, session: session, data: undefined, queries: [
          {
            key: "postId",
            value: postId.toString(),
          },
        ], onUploadProgress: undefined });
      if (res.succeeded)
        setPostCommentInbox((prev) => ({
          ...prev!,
          medias: prev!.medias.map((x) =>
            x.postId !== postId
              ? x
              : {
                  ...x,
                  automaticCommentReply: x.automaticCommentReply
                    ? {
                        ...x.automaticCommentReply!,
                        pauseTime: activeAutoReply ? null : Date.now(),
                      }
                    : {
                        automaticType: 0,
                        items: [],
                        masterFlow: null,
                        masterFlowId: null,
                        mediaId: "",
                        pauseTime: activeAutoReply ? null : Date.now(),
                        productType: 0,
                        replySuccessfullyDirected: false,
                        prompt: null,
                        promptId: null,
                        response: "",
                        sendCount: 0,
                        sendPr: false,
                        shouldFollower: false,
                      },
                },
          ),
        }));
      else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleResumeLiveAutoReply(activeAutoReply: boolean, mediaId: string) {
    try {
      var res = await clientFetchApi<boolean, boolean>("Instagramer" + `/Comment/${!activeAutoReply ? "PauseLiveAutoReply" : "ResumeLiveAutoReply"}`, { methodType: MethodType.get, session: session, data: undefined, queries: [
          {
            key: "liveMediaId",
            value: mediaId,
          },
        ], onUploadProgress: undefined });
      if (res.succeeded)
        setPostCommentInbox((prev) => ({
          ...prev!,
          medias: prev!.medias.map((x) =>
            x.mediaId !== mediaId
              ? x
              : {
                  ...x,
                  automaticCommentReply: x.automaticCommentReply
                    ? {
                        ...x.automaticCommentReply!,
                        pauseTime: activeAutoReply ? null : Date.now(),
                      }
                    : {
                        automaticType: 0,
                        items: [],
                        masterFlow: null,
                        replySuccessfullyDirected: false,
                        masterFlowId: null,
                        mediaId: "",
                        pauseTime: activeAutoReply ? null : Date.now(),
                        productType: 0,
                        prompt: null,
                        promptId: null,
                        response: "",
                        sendCount: 0,
                        sendPr: false,
                        shouldFollower: false,
                      },
                },
          ),
        }));
      else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  useEffect(() => {
    refTempThread.current = tempThreadIds;
  }, [tempThreadIds]);
  function handleSpecifyUnread(items: IComment[], thread: IMedia) {
    let unSeenDiv = <></>;
    const newItems = items
      .filter((item) => item.createdTime > thread.lastSeenUnix && !item.sentByOwner)
      .sort((a, b) => a.createdTime - b.createdTime);
    if (newItems.length > 0) {
      unSeenDiv = (
        <div className={styles.new} title={`ℹ️ ${newItems} Unread message`}>
          {newItems.length >= 1000 ? "+999" : newItems.length}
        </div>
      );
    }
    return unSeenDiv;
  }
  /* ___SingnalR start ___ */
  useEffect(() => {
    console.log(" ✅ Console ⋙ Session", session, session?.user.username);
    if (
      session === undefined ||
      session?.user.username === undefined ||
      !LoginStatus(session) ||
      !RoleAccess(session, PartnerRole.Comment)
    )
      return;
    fetchStoryCpmments();
    // fetchHides();
    fetchPostComments();
    const handleMouseMove = (event: { clientX: number; clientY: number }) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };
    const handleTouchMove = (e: TouchEvent) => {
      touchMove = e.touches[0].clientX;
    };
    const handleTouchStart = (e: TouchEvent) => {
      touchStart = e.touches[0].clientX;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchstart", handleTouchStart);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchstart", handleTouchStart);
      hideDivIndex = null;
    };
  }, []);
  /* ___dragDropSidebar___ */
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [userSelectedId]);
  useEffect(() => {
    if (!ws) return;
    if (setReplyItems.length > 0 && refWs.current?.state === HubConnectionState.Connected) {
      // handleReSendMessage();
    }
  }, [ws?.state]);

  return (
    <>
      {!RoleAccess(session, PartnerRole.Comment) && <NotAllowed />}
      {loading && <Loading />}
      {!loading && (
        <div onClick={() => setShowIcon("")} className={`pincontainerMSG translate`}>
          {/* ___left ___*/}
          <div className={styles.left} style={{ display: displayLeft }}>
            {/* ___search ___*/}
            <div className={styles.search}>
              <div className={styles.searchbox}>
                <InputText
                  className={"serachMenuBar"}
                  placeHolder={t(LanguageKey.searchMessage)}
                  handleInputChange={handleSearchThreads}
                  value={searchbox}
                  maxLength={undefined}
                  name="Search from Post or Keyword"
                />
              </div>
              {activeHideInbox && (
                <Tooltip tooltipValue="All Comments" position="bottom" onClick={true}>
                  <div
                    title="ℹ️ Archieved Messages"
                    className={styles.readandunread}
                    onClick={() => setActiveHideInbox(false)}
                    style={activeReadState ? {} : { border: "1px solid var(--color-dark-blue)" }}>
                    <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" className={styles.eyeIcon}>
                      <path
                        opacity=".4"
                        d="m25.58 15.38 4.18.14c1.15.16 2.14.5 2.94 1.28.79.8 1.12 1.8 1.28 2.94.15 1.1.14 2.64.14 4.34l-.14 4.18a5 5 0 0 1-1.28 2.94 5 5 0 0 1-2.94 1.28c-1.1.15-2.48.15-4.18.15H10.42c-1.7 0-3.1 0-4.18-.15A5 5 0 0 1 3.3 31.2a5 5 0 0 1-1.28-2.94c-.15-1.1-.15-2.48-.15-4.18l.15-4.34A5 5 0 0 1 3.3 16.8a5 5 0 0 1 2.94-1.28c1.1-.14 2.48-.14 4.18-.14z"
                        fill="var(--color-dark-blue)"
                      />
                      <path
                        d="M11.33 21.6c.5-.37 1.2-.27 1.57.22l.45.6c.95 1.27 1.22 1.6 1.56 1.76.34.17.75.2 2.34.2h1.5c1.59 0 2-.03 2.34-.2s.6-.49 1.56-1.75l.45-.6a1.13 1.13 0 0 1 1.8 1.35l-.45.6-.13.17c-.75 1-1.35 1.8-2.23 2.24s-1.87.44-3.12.44h-1.94c-1.25 0-2.25 0-3.12-.44s-1.48-1.23-2.23-2.24l-.13-.18-.45-.6c-.37-.5-.27-1.2.23-1.57 M24.05 9.38h-12.1q-1.5 0-2.5.05c-.7.06-1.33.18-1.91.48a5 5 0 0 0-2.13 2.13 5 5 0 0 0-.47 1.82q.52-.13 1.05-.2c1.22-.16 2.7-.16 4.32-.16H25.7l4.32.16q.53.07 1.05.2a5 5 0 0 0-.47-1.82 5 5 0 0 0-2.13-2.13 5 5 0 0 0-1.9-.48q-1-.08-2.51-.05m-3.01-6h-6.1q-1.5 0-2.5.05c-.7.06-1.33.18-1.91.48A5 5 0 0 0 8.4 6.04c-.28.53-.4 1.1-.46 1.73q.7-.15 1.34-.2 1.14-.09 2.6-.07H24.1q1.46 0 2.6.06.65.05 1.34.2a5 5 0 0 0-.46-1.72 5 5 0 0 0-2.13-2.13 5 5 0 0 0-1.9-.48q-1-.08-2.51-.06"
                        fill="var(--color-dark-blue)"
                      />
                    </svg>{" "}
                  </div>
                </Tooltip>
              )}
              {!activeHideInbox && (
                <Tooltip tooltipValue="Archieved Comments" position="bottom" onClick={true}>
                  <div className={styles.readandunread} onClick={() => setActiveHideInbox(true)}>
                    <svg
                      fill="var(--color-gray)"
                      className={styles.eyeIcon}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 36 36">
                      <path
                        opacity=".4"
                        d="m25.58 15.38 4.18.14c1.15.16 2.14.5 2.94 1.28.79.8 1.12 1.8 1.28 2.94.15 1.1.14 2.64.14 4.34l-.14 4.18a5 5 0 0 1-1.28 2.94 5 5 0 0 1-2.94 1.28c-1.1.15-2.48.15-4.18.15H10.42c-1.7 0-3.1 0-4.18-.15A5 5 0 0 1 3.3 31.2a5 5 0 0 1-1.28-2.94c-.15-1.1-.15-2.48-.15-4.18l.15-4.34A5 5 0 0 1 3.3 16.8a5 5 0 0 1 2.94-1.28c1.1-.14 2.48-.14 4.18-.14z"
                      />
                      <path d="M11.33 21.6c.5-.37 1.2-.27 1.57.22l.45.6c.95 1.27 1.22 1.6 1.56 1.76.34.17.75.2 2.34.2h1.5c1.59 0 2-.03 2.34-.2s.6-.49 1.56-1.75l.45-.6a1.13 1.13 0 0 1 1.8 1.35l-.45.6-.13.17c-.75 1-1.35 1.8-2.23 2.24s-1.87.44-3.12.44h-1.94c-1.25 0-2.25 0-3.12-.44s-1.48-1.23-2.23-2.24l-.13-.18-.45-.6c-.37-.5-.27-1.2.23-1.57 M24.05 9.38h-12.1q-1.5 0-2.5.05c-.7.06-1.33.18-1.91.48a5 5 0 0 0-2.13 2.13 5 5 0 0 0-.47 1.82q.52-.13 1.05-.2c1.22-.16 2.7-.16 4.32-.16H25.7l4.32.16q.53.07 1.05.2a5 5 0 0 0-.47-1.82 5 5 0 0 0-2.13-2.13 5 5 0 0 0-1.9-.48q-1-.08-2.51-.05m-3.01-6h-6.1q-1.5 0-2.5.05c-.7.06-1.33.18-1.91.48A5 5 0 0 0 8.4 6.04c-.28.53-.4 1.1-.46 1.73q.7-.15 1.34-.2 1.14-.09 2.6-.07H24.1q1.46 0 2.6.06.65.05 1.34.2a5 5 0 0 0-.46-1.72 5 5 0 0 0-2.13-2.13 5 5 0 0 0-1.9-.48q-1-.08-2.51-.06" />
                    </svg>
                  </div>
                </Tooltip>
              )}
              <Tooltip tooltipValue="Unread Comments only" position="bottom" onClick={true}>
                <div
                  onClick={() => setActiveReadState(!activeReadState)}
                  className={styles.readandunread}
                  title="ℹ️ Unread Comments only"
                  style={activeReadState ? { border: "1px solid var(--color-dark-blue)" } : {}}>
                  {activeReadState ? (
                    <svg className={styles.eyeIcon} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                      <path
                        opacity=".4"
                        d="m11.13 23.93-.13.47v.03zm3.03 3.55c-.9.43-1.57.76-2.1.93l.25.26c1.34 1.36 3.5 1.36 7.84 1.36.64.02 1.16.07 1.67.18q1.73.48 3.3 1.35l.61.3c1.8.88 2.7 1.32 3.26.91.53-.4.56-1.16.4-2v-.08q-.1-.43 0-.56.09-.13.58-.2c.98-.15 1.9-.59 2.63-1.26 1.35-1.35 1.35-3.53 1.35-7.9v-.57c0-4.37 0-6.55-1.35-7.91-.84-.85-2-1.17-3.8-1.29.15 1.23.15 2.8.15 4.88v.57c0 4.34 0 6.51-1.35 7.85-1.33 1.35-3.5 1.35-7.85 1.35a8 8 0 0 0-1.66.18c-1.16.27-2.24.8-3.3 1.34l-.61.3z"
                        fill="var(--color-dark-blue)"
                      />
                      <path
                        d="M8.72 24.1a5.4 5.4 0 0 1-3.38-1.35C4 21.4 4 19.2 4 14.85v-.59c0-4.37 0-6.55 1.35-7.9C6.68 5 8.86 5 13.2 5h4.6c4.34 0 6.5 0 7.85 1.36C27 7.7 27 9.89 27 14.26v.58c0 4.37 0 6.56-1.35 7.9-1.33 1.37-3.51 1.37-7.85 1.37-.64.01-1.16.06-1.66.17-1.38.33-2.66 1.04-3.91 1.65-1.8.89-2.7 1.32-3.27.92-1.07-.81-.02-3.32.21-4.48"
                        fill="var(--color-dark-blue)"
                        fillOpacity=".4"
                      />
                      <path
                        d="M8.72 24.1a5.4 5.4 0 0 1-3.38-1.35C4 21.4 4 19.2 4 14.85v-.59c0-4.37 0-6.55 1.35-7.9C6.68 5 8.86 5 13.2 5h4.6c4.34 0 6.5 0 7.85 1.36C27 7.7 27 9.89 27 14.26v.58c0 4.37 0 6.56-1.35 7.9-1.33 1.37-3.51 1.37-7.85 1.37-.64.01-1.16.06-1.66.17-1.38.33-2.66 1.04-3.91 1.65-1.8.89-2.7 1.32-3.27.92-1.07-.81-.02-3.32.21-4.48"
                        stroke="var(--color-dark-blue)"
                        strokeWidth="1.5"
                      />
                      <path d="M11 17h9m-9-5h4.5" stroke="var(--color-dark-blue)" strokeWidth="2" />
                    </svg>
                  ) : (
                    <svg fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.eyeIcon} viewBox="0 0 36 36">
                      <path
                        opacity=".4"
                        d="m11.13 23.93-.13.47v.03zm3.03 3.55c-.9.43-1.57.76-2.1.93l.25.26c1.34 1.36 3.5 1.36 7.84 1.36.64.02 1.16.07 1.67.18q1.73.48 3.3 1.35l.61.3c1.8.88 2.7 1.32 3.26.91.53-.4.56-1.16.4-2v-.08q-.1-.43 0-.56.09-.13.58-.2c.98-.15 1.9-.59 2.63-1.26 1.35-1.35 1.35-3.53 1.35-7.9v-.57c0-4.37 0-6.55-1.35-7.91-.84-.85-2-1.17-3.8-1.29.15 1.23.15 2.8.15 4.88v.57c0 4.34 0 6.51-1.35 7.85-1.33 1.35-3.5 1.35-7.85 1.35a8 8 0 0 0-1.66.18c-1.16.27-2.24.8-3.3 1.34l-.61.3z"
                        fill="var(--color-gray)"
                      />
                      <path
                        opacity=".4"
                        d="M18.88 5.28h-5.92c-4.3 0-6.44 0-7.77 1.3-1.34 1.28-1.34 3.35-1.34 7.5v.55c0 4.15 0 6.22 1.34 7.5a5.4 5.4 0 0 0 3.34 1.3c-.27 1.02-.43 2.12.24 2.6.56.38 1.45-.03 3.22-.87l.63-.3q1.57-.81 3.25-1.27.83-.15 1.65-.17c4.3 0 6.45 0 7.77-1.29 1.34-1.27 1.34-3.35 1.34-7.5v-2.76a5.4 5.4 0 0 1-6.79-.58 5.04 5.04 0 0 1-.96-6"
                        fill="var(--color-gray)"
                      />
                      <path
                        d="m27.46 11.19.02 2.82v.68l-.17 4.87a5 5 0 0 1-1.41 3.16 5.5 5.5 0 0 1-3.27 1.36c-1.29.17-2.95.17-5.04.17h-.06c-.6.01-1.04.05-1.46.15-1.04.23-2 .7-3.06 1.2l-.63.3-.08.04-2.11.9c-.58.18-1.3.3-1.92-.14l-.02-.01a2 2 0 0 1-.78-1.38q-.06-.6.03-1.2a5.7 5.7 0 0 1-2.92-1.39 5 5 0 0 1-1.4-3.15C3 18.31 3 16.72 3 14.68v-.67l.18-4.88a5 5 0 0 1 1.4-3.15 5.5 5.5 0 0 1 3.27-1.37c1.3-.16 2.96-.16 5.05-.16h6.54q-.6.74-.91 1.65h-5.57l-4.89.15c-1.15.14-1.8.43-2.27.9-.5.46-.78 1.1-.93 2.2q-.22 2.36-.16 4.72v.55l.16 4.72c.15 1.11.44 1.75.91 2.2q.92.79 2.12.96l.03-.15.21-.75a.86.86 0 0 1 1.01-.64c.46.1.76.53.67.97q-.1.42-.25.9l-.05.18-.15.56-.03.1-.12.5q-.1.45-.05.9.03.24.08.27.06.02.41-.08c.45-.14 1.05-.42 1.97-.84l.57-.29c1.05-.5 2.23-1.06 3.48-1.35q.9-.18 1.82-.19h.02l4.89-.15c1.15-.15 1.8-.43 2.28-.89.49-.47.78-1.1.92-2.2.16-1.14.17-2.63.17-4.73v-2.28a5 5 0 0 0 1.68-1.16"
                        fill="var(--color-gray)"
                      />
                      <path
                        d="M23.6 11.33a3.73 3.73 0 0 0 3.79-3.66A3.73 3.73 0 0 0 23.59 4a3.73 3.73 0 0 0-3.8 3.67 3.73 3.73 0 0 0 3.8 3.66"
                        fill="var(--color-gray)"
                      />
                      <path d="M10.69 17.38h9.1m-9.1-5.5h4.55" stroke="var(--color-gray)" strokeWidth="2" />
                    </svg>
                  )}
                </div>
              </Tooltip>
            </div>
            {/* ___switch button ___*/}
            {!activeHideInbox && (
              <FlexibleToggleButton
                onChange={handleToggleChange}
                selectedValue={toggleOrder}
                options={[
                  {
                    id: 0,
                    label: t(LanguageKey.navbar_Post),
                    unreadCount:
                      postCommentInbox?.medias.reduce((total, media) => {
                        const unreadCount = media.comments.filter(
                          (comment) => comment.createdTime > media.lastSeenUnix && !comment.sentByOwner,
                        ).length;
                        return total + unreadCount;
                      }, 0) || 0,
                  },
                  {
                    id: 1,
                    label: t(LanguageKey.navbar_Live),
                    unreadCount:
                      storyCommentInbox?.medias.reduce((total, media) => {
                        const unreadCount = media.comments.filter(
                          (comment) => comment.createdTime > media.lastSeenUnix && !comment.sentByOwner,
                        ).length;
                        return total + unreadCount;
                      }, 0) || 0,
                  },
                ]}
              />
            )}

            {/* ___list of user ___*/}
            <div className={styles.userslist} ref={userListRef}>
              {/* ___empty state for posts___*/}
              {toggleOrder === CommentType.Post &&
                !showSearchThread.searchMode &&
                !activeHideInbox &&
                postCommentInbox &&
                postCommentInbox.medias.length === 0 && (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateText}>{t(LanguageKey.emptycomment)}</div>
                  </div>
                )}
              {/* ___users list___*/}
              {toggleOrder === CommentType.Post &&
                !showSearchThread.searchMode &&
                !activeHideInbox &&
                postCommentInbox &&
                postCommentInbox.medias.length > 0 &&
                postCommentInbox.medias.map((v) => (
                  <div
                    style={{ cursor: "pointer" }}
                    key={v.mediaId}
                    onMouseDown={() => handleMouseDown()}
                    onMouseUp={() => handleMouseUp()}
                    onMouseMove={() => handleMouseMove(v.mediaId)}
                    onTouchEnd={() => handleTouchEnd(v.mediaId)}
                    onClick={() => {
                      handleGetGeneralChats(v);
                    }}
                    className={v.mediaId === userSelectedId ? styles.selectedUserbackground : styles.userbackground}>
                    {((activeReadState &&
                      v.comments
                        .filter((item) => item.createdTime > v.lastCommentUnix)
                        .sort((a, b) => a.createdTime - b.createdTime).length > 0) ||
                      !activeReadState) && (
                      <div
                        className={styles.user}
                        // style={!v.isActive ? { opacity: "0.3" } : {}}
                      >
                        <img
                          loading="lazy"
                          decoding="async"
                          className={styles.pictureIcon}
                          title={"🔗 View Post Details"}
                          alt="instagram profile picture"
                          src={basePictureUrl + v.thumbnailMediaUrl!}
                        />

                        <div className={styles.profile}>
                          <div className={styles.username} title={""}>
                            <img
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/page/posts/postinfo/${v.postId}`);
                              }}
                              title="🔗 View Post Details"
                              className={styles.shortcut}
                              alt="View post details icon"
                              src="/shortcut.svg"
                            />
                            {t(LanguageKey.navbar_Post)} #{v.tempId?.toLocaleString()}
                          </div>

                          <div className={styles.messagetext}>
                            {v.commentCount > 0
                              ? `${v.commentCount.toLocaleString()} ${t(LanguageKey.comment)}`
                              : t(LanguageKey.nocomment)}
                          </div>
                        </div>

                        <div className={styles.notifbox} title="ℹ️ Slide to more">
                          <div className={styles.settingbox}>
                            {v.unSeenCount > 0 && (
                              <div className={styles.new} title={`ℹ️ ${v.unSeenCount} Unread message`}>
                                {v.unSeenCount}
                              </div>
                            )}

                            {v.isPin && (
                              <svg
                                className={styles.dragicon}
                                width="18"
                                height="20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 36 36">
                                <path d="M26.56 3.83a9.3 9.3 0 0 1 5.61 5.6c.16.45.35.97.42 1.43.08.55.03 1.06-.18 1.63-.43 1.21-1.41 1.75-2.5 2.35l-2.12 1.19c-.77.43-1.28.71-1.64.96s-.45.38-.5.46c-.01.05-.08.25-.06.93.01.63.1 1.5.21 2.72a9 9 0 0 1-1.27 5.76c-.2.3-.44.7-.71.98q-.47.51-1.16.78-.7.29-1.4.25c-.4-.02-.86-.12-1.25-.21a17 17 0 0 1-8.04-4.63 17 17 0 0 1-4.63-8.04 8 8 0 0 1-.21-1.25 3 3 0 0 1 .25-1.4q.29-.7.78-1.16a9 9 0 0 1 6.69-2c1.25.1 2.13.19 2.78.2.32 0 .73.03.94-.08.08-.04.22-.14.46-.5.25-.35.54-.86.97-1.63l1.16-2.09c.6-1.08 1.14-2.06 2.35-2.5.57-.2 1.08-.25 1.63-.17.46.07.98.26 1.42.42" />
                                <path
                                  opacity=".6"
                                  d="M10.96 22.92 3.8 30.06a1.5 1.5 0 1 0 2.13 2.12l7.14-7.14a19 19 0 0 1-2.12-2.12"
                                />
                              </svg>
                            )}
                          </div>

                          <div className={styles.chattime}>
                            {v.comments.length > 0 && v.comments[0].createdTime
                              ? new DateObject({
                                  date: v.comments[0].createdTime / 1e3,
                                  calendar: initialzedTime().calendar,
                                  locale: initialzedTime().locale,
                                }).format("h:mm a")
                              : ""}
                          </div>
                          {/* {(v.status === StatusReplied.InstagramerClosed ||
                                v.status === StatusReplied.UserClosed) && (
                                <div className={styles.chattime}>
                                  {`Ticket is closed by ${
                                    v.status === StatusReplied.InstagramerClosed
                                      ? "You"
                                      : "User"
                                  }`}
                                </div>
                              )}
                              {v.status ===
                                StatusReplied.InstagramerReplied && (
                                <div className={styles.chattime}>
                                  {`watting for user answer`}
                                </div>
                              )} */}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              {toggleOrder === CommentType.Story &&
                !activeHideInbox &&
                !showSearchThread.searchMode &&
                storyCommentInbox &&
                storyCommentInbox.medias.length === 0 && (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateText}>{t(LanguageKey.emptycomment)}</div>
                  </div>
                )}
              {toggleOrder === CommentType.Story &&
                !activeHideInbox &&
                !showSearchThread.searchMode &&
                storyCommentInbox &&
                !activeHideInbox &&
                storyCommentInbox.medias.length > 0 &&
                storyCommentInbox.medias.map((v) => (
                  <div
                    style={{ cursor: "pointer" }}
                    key={v.mediaId}
                    onMouseDown={() => handleMouseDown()}
                    onMouseUp={() => handleMouseUp()}
                    onMouseMove={() => handleMouseMove(v.mediaId)}
                    onTouchEnd={() => handleTouchEnd(v.mediaId)}
                    onClick={() => handleGetBusinessChats(v)}
                    className={v.mediaId === userSelectedId ? styles.selectedUserbackground : styles.userbackground}>
                    {((activeReadState &&
                      v.comments
                        .filter((item) => item.createdTime > v.lastSeenUnix)
                        .sort((a, b) => a.createdTime - b.createdTime).length > 0) ||
                      !activeReadState) && (
                      <>
                        <div
                          className={styles.user}
                          // style={!v.isActive ? { opacity: "0.3" } : {}}
                        >
                          <div className={styles.onlinering}>
                            <img
                              draggable={false}
                              loading="lazy"
                              decoding="async"
                              className={styles.pictureIcon}
                              title={" 📸 View Story Details"}
                              alt="instagram profile picture"
                              src={basePictureUrl + ""}
                            />
                          </div>
                          <div className={styles.profile}>
                            <div className={styles.username} title={""}>
                              {t(LanguageKey.live)} #{storyCommentInbox.medias.indexOf(v).toLocaleString()}
                            </div>
                          </div>
                          <div className={styles.notifbox} title="ℹ️ Slide to more">
                            <div className={styles.settingbox}>
                              {v.unSeenCount > 0 && (
                                <div className={styles.new} title={`ℹ️ ${v.unSeenCount} Unread message`}>
                                  {v.unSeenCount}
                                </div>
                              )}
                              {v.isPin && (
                                <svg
                                  className={styles.dragicon}
                                  width="18"
                                  height="20"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 36 36">
                                  <path d="M26.56 3.83a9.3 9.3 0 0 1 5.61 5.6c.16.45.35.97.42 1.43.08.55.03 1.06-.18 1.63-.43 1.21-1.41 1.75-2.5 2.35l-2.12 1.19c-.77.43-1.28.71-1.64.96s-.45.38-.5.46c-.01.05-.08.25-.06.93.01.63.1 1.5.21 2.72a9 9 0 0 1-1.27 5.76c-.2.3-.44.7-.71.98q-.47.51-1.16.78-.7.29-1.4.25c-.4-.02-.86-.12-1.25-.21a17 17 0 0 1-8.04-4.63 17 17 0 0 1-4.63-8.04 8 8 0 0 1-.21-1.25 3 3 0 0 1 .25-1.4q.29-.7.78-1.16a9 9 0 0 1 6.69-2c1.25.1 2.13.19 2.78.2.32 0 .73.03.94-.08.08-.04.22-.14.46-.5.25-.35.54-.86.97-1.63l1.16-2.09c.6-1.08 1.14-2.06 2.35-2.5.57-.2 1.08-.25 1.63-.17.46.07.98.26 1.42.42" />
                                  <path
                                    opacity=".6"
                                    d="M10.96 22.92 3.8 30.06a1.5 1.5 0 1 0 2.13 2.12l7.14-7.14a19 19 0 0 1-2.12-2.12"
                                  />
                                </svg>
                              )}
                            </div>
                            {v.comments.length > 0 && (
                              <div className={styles.chattime}>
                                {new DateObject({
                                  date: v.comments[0].createdTime / 1e3,
                                  calendar: initialzedTime().calendar,
                                  locale: initialzedTime().locale,
                                }).format("h:MM a")}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              {showSearchThread.searchMode && !activeHideInbox && toggleOrder === CommentType.Post && (
                <>
                  {showSearchThread.loading && <RingLoader />}
                  {showSearchThread.noResult && (
                    <>
                      <div className={styles.emptyState}>
                        <svg opacity="0.6" fill="none" width="160" viewBox="0 0 160 122">
                          <path
                            fill="var(--color-dark-blue30)"
                            d="M153.3 38a6.7 6.7 0 0 1 0 13.4H115a6.7 6.7 0 0 1 0 13.4h21a6.7 6.7 0 1 1 0 13.4h-9.7c-4.7 0-8.5 3-8.5 6.7q0 3.7 5.8 6.7a6.7 6.7 0 0 1 0 13.4H44a6.7 6.7 0 0 1 0-13.4H6.7a6.7 6.7 0 0 1 0-13.4H45a6.7 6.7 0 1 0 0-13.4H21a6.7 6.7 0 1 1 0-13.4h38.4a6.7 6.7 0 0 1 0-13.4zm0 26.8a6.7 6.7 0 1 1 0 13.4 6.7 6.7 0 0 1 0-13.4"></path>
                          <path
                            fill="var(--background-root)"
                            d="m107 37.5 8.9 65.3.8 6.5a4 4 0 0 1-3.4 4.3l-56 7a4 4 0 0 1-4.4-3.4l-8.6-70.6a2 2 0 0 1 1.7-2.2l4.6-.5"></path>
                          <path
                            fill="var(--color-dark-blue)"
                            d="M108.2 37.4a1.3 1.3 0 0 0-1.4-1.1 1.3 1.3 0 0 0-1.1 1.4zm-57.4 7.7a1.3 1.3 0 0 0-.3-2.4zm3.5-2.9a1.3 1.3 0 0 0 .3 2.5zm4.6 2a1.3 1.3 0 0 0-.2-2.5zm46.8-6.5 9 65.3 2.4-.4-9-65.2zm9 65.2.7 6.6 2.5-.3-.8-6.6zm.7 6.6c.2 1.4-.8 2.7-2.2 2.9l.3 2.5a5 5 0 0 0 4.4-5.7zm-2.2 2.9L57 119.3l.3 2.5 56-7zM57 119.3c-1.4.2-2.7-.8-3-2.3l-2.4.3a5 5 0 0 0 5.7 4.5zm-3-2.3-8.6-70.6-2.4.3 8.6 70.6zm-8.6-70.6q0-.7.6-.7l-.3-2.5a3 3 0 0 0-2.7 3.5zm.6-.7 4.7-.6-.3-2.4-4.6.5zm8.5-1 4.3-.5-.2-2.5-4.4.5z"></path>
                          <path
                            fill="var(--color-dark-blue60)"
                            d="m104.5 41.6 8 59.2.8 6c.2 1.8-1 3.6-3 3.8l-50.2 6.2a3.5 3.5 0 0 1-3.8-3L48.5 50a2 2 0 0 1 1.7-2.2l6.1-.8"></path>
                          <path
                            fill="var(--color-white)"
                            stroke="var(--color-dark-blue)"
                            strokeWidth="2.5"
                            d="M66 25.3h43.3q1 0 2 .8l12.6 12.6q.8 1 .8 2V100c0 1.5-1.2 2.8-2.7 2.8H66a2.7 2.7 0 0 1-2.7-2.8V28c0-1.5 1.2-2.7 2.7-2.7Z"></path>
                          <path
                            stroke="var(--color-dark-blue)"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M110 26v11.1c0 1.6 1.2 2.9 2.7 2.9h7.3"></path>
                          <path
                            stroke="var(--color-dark-blue60)"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M73 89h24.8M73 40h24.8M73 51.5h41M73 64h41M73 76.5h41 M115 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M145 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6"></path>
                          <path
                            stroke="var(--color-dark-blue)"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="m122 14 7.9 8m.1-8-7.9 8M30 28l6 6m0-6-6 6"></path>
                          <path fill="var(--color-dark-blue60)" d="M43 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6"></path>
                        </svg>
                        {t(LanguageKey.noresult)}
                      </div>
                    </>
                  )}
                  {!showSearchThread.loading &&
                    !showSearchThread.noResult &&
                    searchPostCommentInbox &&
                    searchPostCommentInbox.medias.map(
                      (v) =>
                        ((activeReadState &&
                          v.comments
                            .filter((item) => item.createdTime > v.lastSeenUnix)
                            .sort((a, b) => a.createdTime - b.createdTime).length > 0) ||
                          !activeReadState) && (
                          <div
                            style={{ cursor: "pointer" }}
                            key={v.mediaId}
                            onMouseDown={() => handleMouseDown()}
                            onMouseUp={() => handleMouseUp()}
                            onMouseMove={() => handleMouseMove(v.mediaId)}
                            onTouchEnd={() => handleTouchEnd(v.mediaId)}
                            onClick={() => handleSelectSearch(v, toggleOrder)}
                            className={
                              v.mediaId === userSelectedId ? styles.selectedUserbackground : styles.userbackground
                            }>
                            <div
                              className={styles.user}
                              // style={!v.isActive ? { opacity: "0.3" } : {}}
                            >
                              <div className={styles.onlinering}>
                                <img
                                  draggable={false}
                                  loading="lazy"
                                  decoding="async"
                                  className={styles.pictureIcon}
                                  title={" 📸 View Post Details"}
                                  alt="instagram profile picture"
                                  src={basePictureUrl + v.thumbnailMediaUrl!}
                                />
                              </div>
                              <div className={styles.profile}>
                                <div className={styles.username} title={""}>
                                  {t(LanguageKey.navbar_Post)} #{v.tempId?.toLocaleString()}
                                </div>
                              </div>
                              <div className={styles.notifbox} title="ℹ️ Slide to more">
                                {v.unSeenCount > 0 && (
                                  <div className={styles.new} title={`ℹ️ ${v.unSeenCount} Unread message`}>
                                    {v.unSeenCount}
                                  </div>
                                )}
                                <div className={styles.chattime}>
                                  {v.comments.length > 0 && v.comments[0].createdTime
                                    ? new DateObject({
                                        date: v.comments[0].createdTime / 1e3,
                                        calendar: initialzedTime().calendar,
                                        locale: initialzedTime().locale,
                                      }).format("h:mm a")
                                    : ""}
                                </div>
                              </div>
                            </div>
                          </div>
                        ),
                    )}
                </>
              )}
              {showSearchThread.searchMode && !activeHideInbox && toggleOrder === CommentType.Story && (
                <>
                  {showSearchThread.loading && <RingLoader />}
                  {showSearchThread.noResult && (
                    <>
                      <div className={styles.emptyState}>
                        <svg opacity="0.6" fill="none" width="160" viewBox="0 0 160 122">
                          <path
                            fill="var(--color-dark-blue30)"
                            d="M153.3 38a6.7 6.7 0 0 1 0 13.4H115a6.7 6.7 0 0 1 0 13.4h21a6.7 6.7 0 1 1 0 13.4h-9.7c-4.7 0-8.5 3-8.5 6.7q0 3.7 5.8 6.7a6.7 6.7 0 0 1 0 13.4H44a6.7 6.7 0 0 1 0-13.4H6.7a6.7 6.7 0 0 1 0-13.4H45a6.7 6.7 0 1 0 0-13.4H21a6.7 6.7 0 1 1 0-13.4h38.4a6.7 6.7 0 0 1 0-13.4zm0 26.8a6.7 6.7 0 1 1 0 13.4 6.7 6.7 0 0 1 0-13.4"></path>
                          <path
                            fill="var(--background-root)"
                            d="m107 37.5 8.9 65.3.8 6.5a4 4 0 0 1-3.4 4.3l-56 7a4 4 0 0 1-4.4-3.4l-8.6-70.6a2 2 0 0 1 1.7-2.2l4.6-.5"></path>
                          <path
                            fill="var(--color-dark-blue)"
                            d="M108.2 37.4a1.3 1.3 0 0 0-1.4-1.1 1.3 1.3 0 0 0-1.1 1.4zm-57.4 7.7a1.3 1.3 0 0 0-.3-2.4zm3.5-2.9a1.3 1.3 0 0 0 .3 2.5zm4.6 2a1.3 1.3 0 0 0-.2-2.5zm46.8-6.5 9 65.3 2.4-.4-9-65.2zm9 65.2.7 6.6 2.5-.3-.8-6.6zm.7 6.6c.2 1.4-.8 2.7-2.2 2.9l.3 2.5a5 5 0 0 0 4.4-5.7zm-2.2 2.9L57 119.3l.3 2.5 56-7zM57 119.3c-1.4.2-2.7-.8-3-2.3l-2.4.3a5 5 0 0 0 5.7 4.5zm-3-2.3-8.6-70.6-2.4.3 8.6 70.6zm-8.6-70.6q0-.7.6-.7l-.3-2.5a3 3 0 0 0-2.7 3.5zm.6-.7 4.7-.6-.3-2.4-4.6.5zm8.5-1 4.3-.5-.2-2.5-4.4.5z"></path>
                          <path
                            fill="var(--color-dark-blue60)"
                            d="m104.5 41.6 8 59.2.8 6c.2 1.8-1 3.6-3 3.8l-50.2 6.2a3.5 3.5 0 0 1-3.8-3L48.5 50a2 2 0 0 1 1.7-2.2l6.1-.8"></path>
                          <path
                            fill="var(--color-white)"
                            stroke="var(--color-dark-blue)"
                            strokeWidth="2.5"
                            d="M66 25.3h43.3q1 0 2 .8l12.6 12.6q.8 1 .8 2V100c0 1.5-1.2 2.8-2.7 2.8H66a2.7 2.7 0 0 1-2.7-2.8V28c0-1.5 1.2-2.7 2.7-2.7Z"></path>
                          <path
                            stroke="var(--color-dark-blue)"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M110 26v11.1c0 1.6 1.2 2.9 2.7 2.9h7.3"></path>
                          <path
                            stroke="var(--color-dark-blue60)"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M73 89h24.8M73 40h24.8M73 51.5h41M73 64h41M73 76.5h41 M115 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M145 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6"></path>
                          <path
                            stroke="var(--color-dark-blue)"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="m122 14 7.9 8m.1-8-7.9 8M30 28l6 6m0-6-6 6"></path>
                          <path fill="var(--color-dark-blue60)" d="M43 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6"></path>
                        </svg>
                        {t(LanguageKey.noresult)}
                      </div>
                    </>
                  )}
                  {!showSearchThread.loading &&
                    !showSearchThread.noResult &&
                    searchBusinessInbox?.medias.map(
                      (v) =>
                        ((activeReadState &&
                          v.comments
                            .filter((item) => item.createdTime > v.lastSeenUnix)
                            .sort((a, b) => a.createdTime - b.createdTime).length > 0) ||
                          !activeReadState) && (
                          <div
                            style={{ cursor: "pointer" }}
                            key={v.mediaId}
                            onMouseDown={() => handleMouseDown()}
                            onMouseUp={() => handleMouseUp()}
                            onMouseMove={() => handleMouseMove(v.mediaId)}
                            onTouchEnd={() => handleTouchEnd(v.mediaId)}
                            onClick={() => handleSelectSearch(v, toggleOrder)}
                            className={
                              v.mediaId === userSelectedId ? styles.selectedUserbackground : styles.userbackground
                            }>
                            <div
                              className={styles.user}
                              // style={!v.isActive ? { opacity: "0.3" } : {}}
                            >
                              <div className={styles.onlinering}>
                                <img
                                  draggable={false}
                                  loading="lazy"
                                  decoding="async"
                                  className={styles.pictureIcon}
                                  title={" 📸 View Story Details"}
                                  alt="instagram profile picture"
                                  src={basePictureUrl + ""}
                                />
                              </div>
                              <div className={styles.profile}>
                                <div className={styles.username} title={""}>
                                  {t(LanguageKey.live)} #{searchBusinessInbox?.medias.indexOf(v).toLocaleString()}
                                </div>
                                <div className={styles.messagetext}>{v.comments[0].text}</div>
                              </div>
                              <div className={styles.notifbox} title="ℹ️ Slide to more">
                                {v.unSeenCount > 0 && (
                                  <div className={styles.new} title={`ℹ️ ${v.unSeenCount} Unread message`}>
                                    {v.unSeenCount}
                                  </div>
                                )}
                                <div className={styles.chattime}>
                                  {new DateObject({
                                    date: v.comments[2].createdTime / 1e3,
                                    calendar: initialzedTime().calendar,
                                    locale: initialzedTime().locale,
                                  }).format("h:mm a")}
                                </div>
                              </div>
                            </div>
                          </div>
                        ),
                    )}
                </>
              )}
              {activeHideInbox && !showSearchThread.searchMode && (
                <>
                  {hideInbox && hideInbox.medias.length === 0 && (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyStateText}>{t(LanguageKey.emptycomment)}</div>
                    </div>
                  )}
                  {hideInbox &&
                    hideInbox.medias.length > 0 &&
                    hideInbox.medias.map(
                      (v) =>
                        ((activeReadState &&
                          v.comments
                            .filter((item) => item.createdTime > v.lastSeenUnix)
                            .sort((a, b) => a.createdTime - b.createdTime).length > 0) ||
                          !activeReadState) && (
                          <div
                            style={{ cursor: "pointer" }}
                            key={v.mediaId}
                            onMouseDown={() => handleMouseDown()}
                            onMouseUp={() => handleMouseUp()}
                            onMouseMove={() => handleMouseMove(v.mediaId)}
                            onTouchEnd={() => handleTouchEnd(v.mediaId)}
                            className={
                              v.mediaId === userSelectedId ? styles.selectedUserbackground : styles.userbackground
                            }>
                            <div
                              className={styles.user}
                              // style={!v.isActive ? { opacity: "0.3" } : {}}
                            >
                              <div className={styles.onlinering}>
                                <img
                                  draggable={false}
                                  loading="lazy"
                                  decoding="async"
                                  className={styles.pictureIcon}
                                  title={" 📸 View Post Details"}
                                  alt="instagram profile picture"
                                  src={basePictureUrl + ""}
                                />
                              </div>
                              <div className={styles.profile}>
                                <div className={styles.username} title={"#Post"}>
                                  {""}
                                </div>
                              </div>
                              <div className={styles.notifbox} title="ℹ️ Slide to more">
                                {handleSpecifyUnread(v.comments, v)}
                                <div className={styles.chattime}>
                                  {new DateObject({
                                    date: v.comments[0].createdTime / 1e3,
                                    calendar: initialzedTime().calendar,
                                    locale: initialzedTime().locale,
                                  }).format("h:mm a")}
                                </div>
                              </div>
                            </div>
                          </div>
                        ),
                    )}
                </>
              )}
              {activeHideInbox && showSearchThread.searchMode && (
                <>
                  {showSearchThread.loading && <RingLoader />}
                  {showSearchThread.noResult && <h1 className="title2"> {t(LanguageKey.noresult)}</h1>}
                  {!showSearchThread.loading &&
                    !showSearchThread.noResult &&
                    searchHideInbox &&
                    searchHideInbox.medias.map(
                      (v) =>
                        ((activeReadState &&
                          v.comments
                            .filter((item) => item.createdTime > v.lastSeenUnix)
                            .sort((a, b) => a.createdTime - b.createdTime).length > 0) ||
                          !activeReadState) && (
                          <div
                            style={{ cursor: "pointer" }}
                            key={v.mediaId}
                            onMouseDown={() => handleMouseDown()}
                            onMouseUp={() => handleMouseUp()}
                            onMouseMove={() => handleMouseMove(v.mediaId)}
                            onTouchEnd={() => handleTouchEnd(v.mediaId)}
                            className={
                              v.mediaId === userSelectedId ? styles.selectedUserbackground : styles.userbackground
                            }>
                            <div
                              key={v.mediaId}
                              className={styles.user}
                              // style={!v.isActive ? { opacity: "0.3" } : {}}
                            >
                              <div className={styles.onlinering}>
                                <img
                                  draggable={false}
                                  loading="lazy"
                                  decoding="async"
                                  className={styles.pictureIcon}
                                  title={" 📸 View Post Details"}
                                  alt="instagram profile picture"
                                  src={basePictureUrl + ""}
                                />
                              </div>
                              <div className={styles.profile}>
                                <div className={styles.username} title={""}>
                                  {""}
                                </div>
                                <div className={styles.messagetext}>{v.comments[0].text}</div>
                              </div>
                              <div className={styles.notifbox} title="ℹ️ Slide to more">
                                {handleSpecifyUnread(v.comments, v)}
                                <div className={styles.chattime}>
                                  {new DateObject({
                                    date: v.comments[0].createdTime / 1e3,
                                    calendar: initialzedTime().calendar,
                                    locale: initialzedTime().locale,
                                  }).format("h:mm a")}
                                </div>
                              </div>
                            </div>
                          </div>
                        ),
                    )}
                </>
              )}
              {isLoadingMore && (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <DotLoaders />
                </div>
              )}
            </div>
          </div>
          {/* ___right ___*/}
          {userSelectedId && (postCommentInbox || storyCommentInbox) && (
            <div className={styles.right} style={{ display: displayRight }}>
              <CommentChatBox
                userSelectId={userSelectedId}
                chatBox={handleSpecifyChatBox()!}
                showIcon={showIcon}
                ownerInbox={
                  toggleOrder === CommentType.Post ? postCommentInbox!.ownerInbox : storyCommentInbox!.ownerInbox
                }
                hub={ws}
                replyLoading={replyLoading}
                vanishLoading={vanishLoading}
                newComment={newCommentRefresh}
                showUserList={showUserList}
                handleShowIcon={handleShowIcon}
                fetchItemData={fetchItemData}
                handleReplyComment={handleReplyComment}
                handleReplyLiveComment={handleReplyLiveComment}
                handleTurnOnCommenting={handleTurnOnCommenting}
                handleUpdateFeedAutoReply={handleUpdateFeedAutoReply}
                handleUpdateLiveAutoReply={handleUpdateLiveAutoReply}
                handleResumeLiveAutoReply={handleResumeLiveAutoReply}
                handleResumeFeedAutoReply={handleResumeFeedAutoReply}
                onSettingsClick={() => {
                  setSettingsToggleOrder(ToggleOrder.FirstToggle);
                  setShowSettingsPopup(true);
                }}
                onImageClick={handleImageClick}
                onLotteryClick={() => setShowLotteryPopup(true)}
                onStatisticsClick={() => setShowStatisticsPopup(true)}
              />
            </div>
          )}
          {!userSelectedId && (
            <div className={styles.disableRight} style={{ display: displayRight }}>
              <img
                draggable={false}
                className={styles.disableRightimage}
                alt="Welcome illustration"
                src="/disableright.svg"
              />
              <div>
                <h3>{t(LanguageKey.commentmanagement)}</h3>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings Modal */}
      <Modal closePopup={() => setShowSettingsPopup(false)} classNamePopup={"popup"} showContent={showSettingsPopup}>
        <>
          <div className={chatBoxStyles.autoreplyContent}>
            {(() => {
              const currentChatBox = handleSpecifyChatBox();
              if (!currentChatBox) return null;
              return (
                <>
                  <div className="headerandinput translate" style={{ marginBottom: "30px" }}>
                    <div className="headerparent" aria-labelledby="vanish-mode">
                      <div className="title" id="vanish-mode-title">
                        {t(LanguageKey.vanishmode)}
                      </div>
                      <ToggleCheckBoxButton
                        handleToggle={handleVanishModeSettings}
                        checked={vanishMode}
                        name="vanish-mode"
                        title="Toggle vanish mode"
                        aria-label="Toggle vanish mode"
                        role="switch"
                        aria-checked={vanishMode}
                      />
                    </div>
                    <div className="explain">{t(LanguageKey.vanishmodeexplain)}</div>
                  </div>
                  <EditAutoReplyForMedia
                    setShowQuickReplyPopup={setShowSettingsPopup}
                    handleSaveAutoReply={(sendReply: IMediaUpdateAutoReply) => {
                      setShowSettingsPopup(false);
                      handleUpdateAutoReplySettings(sendReply);
                    }}
                    handleActiveAutoReply={handlePauseAutoReplySettings}
                    autoReply={
                      currentChatBox.automaticCommentReply !== null
                        ? currentChatBox.automaticCommentReply
                        : {
                            automaticType: 0,
                            items: [],
                            masterFlow: null,
                            masterFlowId: null,
                            mediaId: currentChatBox.mediaId,
                            pauseTime: Date.now(),
                            productType: 0,
                            prompt: null,
                            promptId: null,
                            replySuccessfullyDirected: false,
                            response: "",
                            sendCount: 0,
                            sendPr: false,
                            shouldFollower: false,
                          }
                    }
                    productType={currentChatBox.productType}
                    showActiveAutoreply={true}
                  />
                </>
              );
            })()}
          </div>
        </>
      </Modal>

      {/* Image Popup Modal */}
      <Modal closePopup={handleCloseImagePopup} classNamePopup={"popupProfile"} showContent={showImagePopup}>
        <img
          draggable={false}
          onClick={handleCloseImagePopup}
          style={{ width: "35px", cursor: "pointer" }}
          title="ℹ️ close"
          src="/close-box.svg"
        />
        <img
          draggable={false}
          className={styles.pictureprofile}
          loading="lazy"
          decoding="async"
          src={popupImageUrl}
          alt="Popup profile"
        />
      </Modal>

      {/* Lottery Popup Modal */}
      <Modal
        closePopup={() => setShowLotteryPopup(false)}
        classNamePopup={"popup"}
        showContent={
          showLotteryPopup && userSelectedId !== null && handleSpecifyChatBox()?.productType === MediaProductType.Live
        }>
        <LotteryPopup
          setShowLotteryPopup={setShowLotteryPopup}
          lotteryType={LotteryPopupType.LiveLottery}
          liveId={handleSpecifyChatBox()?.mediaId || ""}
        />
      </Modal>

      {/* Statistics Popup Modal */}
      <Modal
        closePopup={() => setShowStatisticsPopup(false)}
        classNamePopup={"popup"}
        showContent={showStatisticsPopup && userSelectedId !== null}>
        <>
          <div className="headerandinput">
            <div className="headerparent">
              <div className="title">{t(LanguageKey.navbar_Statistics)}</div>
              <img
                draggable={false}
                style={{ cursor: "pointer" }}
                onClick={() => setShowStatisticsPopup(false)}
                src="/close-box.svg"
                alt="Close statistics"
                width="36"
                height="36"
                role="button"
                aria-label="Close statistics dialog"
                title="Close statistics"
              />
            </div>
          </div>
          {(() => {
            const currentChatBox = handleSpecifyChatBox();
            if (!currentChatBox) return null;

            return <CommentStatistics currentChatBox={currentChatBox} basePictureUrl={basePictureUrl} />;
          })()}
        </>
      </Modal>
    </>
  );
};

export default CommentInbox;
