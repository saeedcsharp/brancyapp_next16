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
import Tooltip from "saeed/components/design/tooltip/tooltip";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import NotAllowed from "saeed/components/notOk/notAllowed";
import { isRTL } from "saeed/helper/checkRtl";
import { LoginStatus, RoleAccess } from "saeed/helper/loadingStatus";
import initialzedTime from "saeed/helper/manageTimer";
import { handleDecompress } from "saeed/helper/pako";
import { useInfiniteScroll } from "saeed/helper/useInfiniteScroll";
import { LanguageKey } from "saeed/i18n";
import { PartnerRole } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { MethodType, UploadFile } from "saeed/helper/apihelper";
import { CategoryType, ItemType, MediaType } from "saeed/models/messages/enum";
import {
  IGetDirectInbox,
  IGetDirectInboxItems,
  IHookItem,
  IHookReact,
  IHookRead,
  IInbox,
  IIsSendingMessage,
  IItem,
  IThread,
} from "saeed/models/messages/IMessage";
import SendFile from "../popups/sendFile";
import SendVideoFile from "../popups/sendVideoFile";
import { MediaModal, useMediaModal } from "../shared/utils";
import DirectChatBox from "./directChatBox";
import styles from "./directInbox.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
let firstTime = 0;
let touchMove = 0;
let touchStart = 0;
let firstPos = { x: 0, y: 0 };
let downFlagLeft = false;
let downFlagRight = false;
let hideDivIndex: string | null = null;
let constUserSelected: string | null = null;
const DirectInbox = () => {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const { t } = useTranslation();
  const { query } = router;
  let instagramerId = session?.user.instagramerIds[session?.user.currentIndex];
  const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
  const [generalInbox, setGeneralInbox] = useState<IInbox>();
  const [searchGeneralInbox, setSearchGeneralInbox] = useState<IInbox>();
  const [searchBusinessInbox, setSearchBusinessInbox] = useState<IInbox>();
  const gInbox = useRef(generalInbox);
  const [businessInbox, setBusinessInbox] = useState<IInbox>();
  const [hideInbox, setHideInbox] = useState<IInbox>();
  const [searchHideInbox, setSearchHideInbox] = useState<IInbox>();
  const bInbox = useRef(businessInbox);
  useEffect(() => {
    gInbox.current = generalInbox;
  }, [generalInbox]);
  useEffect(() => {
    bInbox.current = businessInbox;
  }, [businessInbox]);
  const [loading, setLoading] = useState(LoginStatus(session) && RoleAccess(session, PartnerRole.Message));

  const [searchbox, setSearchbox] = useState("");
  const [toggleOrder, setToggleOrder] = useState<CategoryType>(CategoryType.General);
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

  // استفاده از هوک جدید MediaModal
  const mediaModal = useMediaModal();

  // Modal state variables
  const [showPopup, setShowPopup] = useState(false);
  const [showSendFile, setShowSendFile] = useState<boolean>(false);
  const [showSendVideoFile, setShowSendVideoFile] = useState<boolean>(false);

  const [popupImage, setPopupImage] = useState("");
  const [fileContent, setFileContent] = useState<{
    file: File;
    threadId: string;
    igid: string;
  } | null>(null);

  const [showSearchThread, setShowSearchThread] = useState({
    searchMode: false,
    loading: false,
    noResult: false,
  });
  const [sendingMessages, setSendingMessages] = useState<IIsSendingMessage[]>([]);
  const [tempThreadIds, setTempThreadIds] = useState<{ threadId: string; toggle: CategoryType }[]>([]);
  const refTempThread = useRef(tempThreadIds);

  // استفاده از useInfiniteScroll برای General inbox
  const { isLoadingMore: isLoadingMoreGeneral } = useInfiniteScroll<IThread>({
    hasMore: !!generalInbox?.nextMaxId && !showSearchThread.searchMode,
    fetchMore: async () => {
      if (generalInbox?.nextMaxId) {
        await fetchData(CategoryType.General, generalInbox.nextMaxId, null);
      }
      return [];
    },
    onDataFetched: () => {},
    getItemId: (thread) => thread.threadId,
    currentData: generalInbox?.threads || [],
    threshold: 100,
    useContainerScroll: true,
    reverseScroll: false,
    fetchDelay: 300,
    enableAutoLoad: false,
    enabled: toggleOrder === CategoryType.General,
    containerRef: userListRef,
  });

  // استفاده از useInfiniteScroll برای Business inbox
  const { isLoadingMore: isLoadingMoreBusiness } = useInfiniteScroll<IThread>({
    hasMore: !!businessInbox?.nextMaxId && !showSearchThread.searchMode,
    fetchMore: async () => {
      if (businessInbox?.nextMaxId) {
        await fetchData(CategoryType.Business, businessInbox.nextMaxId, null);
      }
      return [];
    },
    onDataFetched: () => {},
    getItemId: (thread) => thread.threadId,
    currentData: businessInbox?.threads || [],
    threshold: 100,
    useContainerScroll: true,
    reverseScroll: false,
    fetchDelay: 300,
    enableAutoLoad: false,
    enabled: toggleOrder === CategoryType.Business,
    containerRef: userListRef,
  });

  const isLoadingMore = toggleOrder === CategoryType.General ? isLoadingMoreGeneral : isLoadingMoreBusiness;

  // تابع کمکی برای تشخیص direction متن و اعمال کلاس مناسب
  const getMessageDirectionClass = (text: string | null, baseClass: string) => {
    if (!text) return baseClass;
    const direction = isRTL(text) ? "rtl" : "ltr";
    return `${baseClass} ${direction}`;
  };

  const handleGetGeneralChats = async (thread: IThread) => {
    constUserSelected = null;
    let newTime = new Date().getTime();
    if (newTime - firstTime <= 110) {
      console.log("userSelectedId ", userSelectedId);
      //  console.log("First click");
      if (thread.threadId === showDivIndex) {
        setMoreSettingClassName("hideDiv");
        setTimeout(() => {
          hideDivIndex = thread.threadId;
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

      if (thread.threadId === userSelectedId) return;
      for (let item of thread.items) {
        if (item.repliedToItemId && !thread.items.find((x) => x.itemId === item.repliedToItemId)) {
          handleGetRepliedItems(thread, item.repliedToItemId, CategoryType.General);
        }
      }
      setUserSelectedId(thread.threadId);
    }
  };
  async function handleGetRepliedItems(thread: IThread, itemId: string, categoryType: CategoryType) {
    try {
      let res = await clientFetchApi<boolean, IItem>("Instagramer" + "" + "/Message/GetDirectParentItem", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "recpId", value: thread.recp.igId },
          { key: "itemId", value: itemId },
        ], onUploadProgress: undefined });
      if (res.succeeded && categoryType === CategoryType.General) {
        setGeneralInbox((prev) => ({
          ...prev!,
          threads: prev!.threads.map((x) =>
            x.threadId !== thread.threadId
              ? x
              : {
                  ...x,
                  items: x.items.map((rep) =>
                    rep.repliedToItemId !== itemId ? rep : { ...rep, repliedToItem: res.value }
                  ),
                }
          ),
        }));
      } else if (res.succeeded && categoryType === CategoryType.Business) {
        setBusinessInbox((prev) => ({
          ...prev!,
          threads: prev!.threads.map((x) =>
            x.threadId !== thread.threadId
              ? x
              : {
                  ...x,
                  items: x.items.map((rep) =>
                    rep.repliedToItemId !== itemId ? rep : { ...rep, repliedToItem: res.value }
                  ),
                }
          ),
        }));
      } else if (res.info.responseType === ResponseType.InvalidItemId && categoryType === CategoryType.General) {
        setGeneralInbox((prev) => ({
          ...prev!,
          threads: prev!.threads.map((x) =>
            x.threadId !== thread.threadId
              ? x
              : {
                  ...x,
                  items: x.items.map((rep) =>
                    rep.repliedToItemId !== itemId ? rep : { ...rep, repliedToItemId: null }
                  ),
                }
          ),
        }));
      } else if (res.info.responseType === ResponseType.InvalidItemId && categoryType === CategoryType.Business) {
        setBusinessInbox((prev) => ({
          ...prev!,
          threads: prev!.threads.map((x) =>
            x.threadId !== thread.threadId
              ? x
              : {
                  ...x,
                  items: x.items.map((rep) =>
                    rep.repliedToItemId !== itemId ? rep : { ...rep, repliedToItemId: null }
                  ),
                }
          ),
        }));
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
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
    // console.log(index);
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
  const handlePinDiv = async (threadId: string, recpId: string) => {
    setShowDivIndex(null);
    setShowMoreSettingDiv(false);
    var gThread = generalInbox?.threads.find((x) => x.threadId === threadId);
    var bTread = businessInbox?.threads.find((x) => x.threadId === threadId);
    if (gThread) {
      try {
        let gRes = await clientFetchApi<boolean, boolean>("Instagramer" + "/Message/PinThread", { methodType: MethodType.get, session: session, data: null, queries: [
            { key: "recpId", value: recpId },
            { key: "isPin", value: (!gThread.isPin).toString() },
          ], onUploadProgress: undefined });
        if (gRes.succeeded) {
          setGeneralInbox((prev) => ({
            ...prev!,
            threads: prev!.threads
              .map((x) => (x.threadId !== gThread?.threadId ? x : { ...x, isPin: !x.isPin }))
              .sort((a, b) => {
                if (a.isPin && !b.isPin) {
                  return -1;
                } else if (b.isPin && !a.isPin) {
                  return 1;
                } else {
                  return 0;
                }
              }),
          }));
        } else {
          notify(gRes.info.responseType, NotifType.Warning);
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    }
    if (bTread) {
      try {
        let bRes = await clientFetchApi<boolean, boolean>("Instagramer" + "/Message/PinThread", { methodType: MethodType.get, session: session, data: null, queries: [
            { key: "recpId", value: recpId },
            { key: "isPin", value: (!bTread.isPin).toString() },
          ], onUploadProgress: undefined });
        if (bRes.succeeded) {
          setBusinessInbox((prev) => ({
            ...prev!,
            threads: prev!.threads
              .map((x) => (x.threadId !== bTread?.threadId ? x : { ...x, isPin: !x.isPin }))
              .sort((a, b) => {
                if (a.isPin && !b.isPin) {
                  return -1;
                } else if (b.isPin && !a.isPin) {
                  return 1;
                } else {
                  return 0;
                }
              }),
          }));
        } else {
          notify(bRes.info.responseType, NotifType.Warning);
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    }
  };
  const handleMoveDiv = async (
    threadId: string,
    recpId: string,
    originCategoryType: CategoryType,
    destCategoryType: CategoryType
  ) => {
    try {
      let res = await clientFetchApi<boolean, boolean>("Instagramer" + "/Message/ChangeCategory", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "recpId", value: recpId.toString() },
          {
            key: "categoryId",
            value: destCategoryType.toString(),
          },
        ], onUploadProgress: undefined });
      // console.log("changeCategory ", categoryType.toString());
      if (res.succeeded) {
        setShowDivIndex(null);
        setShowMoreSettingDiv(false);
        if (originCategoryType === CategoryType.General) {
          var moveThread = generalInbox?.threads.find((x) => x.threadId === threadId);
          if (moveThread) {
            moveThread.isPin = false;
            if (userSelectedId === moveThread.threadId) setUserSelectedId(null);
            setGeneralInbox((prev) => ({
              ...prev!,
              threads: prev!.threads.filter((x) => x.threadId !== moveThread!.threadId),
            }));
            if (destCategoryType === CategoryType.Business)
              setBusinessInbox((prev) => ({
                ...prev!,
                threads: [moveThread!, ...prev!.threads].sort((a, b) => {
                  if (a.isPin && !b.isPin) {
                    return -1;
                  } else if (!a.isPin && b.isPin) {
                    return 1;
                  } else return 0;
                }),
              }));
            else if (destCategoryType === CategoryType.Hide)
              setHideInbox((prev) => ({
                ...prev!,
                threads: [...prev!.threads, moveThread!],
              }));
          }
        } else if (originCategoryType === CategoryType.Business) {
          var moveThread = businessInbox?.threads.find((x) => x.threadId === threadId);
          if (moveThread) {
            moveThread.isPin = false;
            if (userSelectedId === moveThread.threadId) setUserSelectedId(null);
            setBusinessInbox((prev) => ({
              ...prev!,
              threads: prev!.threads.filter((x) => x.threadId !== moveThread?.threadId),
            }));
            if (destCategoryType === CategoryType.General)
              setGeneralInbox((prev) => ({
                ...prev!,
                threads: [moveThread!, ...prev!.threads].sort((a, b) => {
                  if (a.isPin && !b.isPin) {
                    return -1;
                  } else if (!a.isPin && b.isPin) {
                    return 1;
                  } else return 0;
                }),
              }));
            else if (destCategoryType === CategoryType.Hide)
              setHideInbox((prev) => ({
                ...prev!,
                threads: [...prev!.threads, moveThread!],
              }));
          }
        } else if (originCategoryType === CategoryType.Hide) {
          var moveThread = hideInbox?.threads.find((x) => x.threadId === threadId);
          if (moveThread) {
            moveThread.isPin = false;
            if (userSelectedId === moveThread.threadId) setUserSelectedId(null);
            setHideInbox((prev) => ({
              ...prev!,
              threads: prev!.threads.filter((x) => x.threadId !== moveThread!.threadId),
            }));
            setGeneralInbox((prev) => ({
              ...prev!,
              threads: [moveThread!, ...prev!.threads].sort((a, b) => {
                if (a.isPin && !b.isPin) {
                  return -1;
                } else if (!a.isPin && b.isPin) {
                  return 1;
                } else return 0;
              }),
            }));
          }
        }
        //  console.log(index);
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  };
  const handleGetBusinessChats = async (thread: IThread) => {
    constUserSelected = null;
    let newTime = new Date().getTime();
    if (newTime - firstTime <= 110) {
      if (thread.threadId === showDivIndex) {
        setMoreSettingClassName("hideDiv");
        setTimeout(() => {
          hideDivIndex = thread.threadId;
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
      if (thread.threadId === userSelectedId) return;
      for (let item of thread.items) {
        if (item.repliedToItemId && !thread.items.find((x) => x.itemId === item.repliedToItemId)) {
          handleGetRepliedItems(thread, item.repliedToItemId, CategoryType.Business);
        }
      }
      setUserSelectedId(thread.threadId);
    }
  };
  const handleToggleChange = (order: CategoryType) => {
    const container = userListRef.current;
    if (container) {
      container.scrollTop = 0;
    }
    setUserSelectedId(null);
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

  // Modal handlers
  const handleImageClick = (imageUrl: string) => {
    setPopupImage(imageUrl);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupImage("");
  };

  const handleSendFile = (sendFile: { file: File; threadId: string; igid: string }) => {
    setFileContent(sendFile);
    setShowSendFile(true);
  };

  const handleSendVideoFile = (sendVideo: { file: File; threadId: string; igid: string }) => {
    setFileContent(sendVideo);
    setShowSendVideoFile(true);
  };

  const handleSendImage = async (sendImage: IIsSendingMessage) => {
    console.log("Sending image:", sendImage);
    handleSendMessage(sendImage);
    setShowSendFile(false);
    setFileContent(null);
    if (ws && ws.state === HubConnectionState.Connected)
      await ws.send("SendImageMessage", sendImage.igId, sendImage.imageUrl);
  };

  const handleSendVideo = async (sendVideo: IIsSendingMessage) => {
    // Handle send video logic here - this would need to be connected to the actual send message logic
    console.log("Sending video:", sendVideo);
    handleSendMessage(sendVideo);
    setShowSendVideoFile(false);
    setFileContent(null);
    if (ws && ws.state === HubConnectionState.Connected)
      await ws.send("SendVideoMessage", sendVideo.igId, sendVideo.imageUrl);
  };

  const fetchData = async (categoryType: CategoryType, oldestCursor: string | null, query: string | null) => {
    if (categoryType === CategoryType.General) {
      var generalDirectInbox: IGetDirectInbox = {
        categoryId: 0,
        oldCursor: oldestCursor,
        searchTerm: query ? query : null,
      };
      try {
        let generalRes = await clientFetchApi<IGetDirectInbox, IInbox>("/api/message/GetDirectInbox", { methodType: MethodType.post, session: session, data: generalDirectInbox, queries: undefined, onUploadProgress: undefined });
        console.log("generalResssssssssssss", generalRes);
        if (generalRes.succeeded && !query) {
          setGeneralInbox((prev) => {
            // Filter out duplicate threads before adding
            const existingThreadIds = new Set(prev!.threads.map((t) => t.threadId));
            const newThreads = generalRes.value.threads.filter((t) => !existingThreadIds.has(t.threadId));
            return {
              ...prev!,
              nextMaxId: generalRes.value.nextMaxId,
              threads: [...prev!.threads, ...newThreads],
            };
          });
        } else if (generalRes.succeeded && query) {
          if (generalRes.value.threads.length > 0) {
            setSearchGeneralInbox(generalRes.value);
            setShowSearchThread((prev) => ({ ...prev, loading: false }));
          } else
            setShowSearchThread((prev) => ({
              ...prev,
              loading: false,
              noResult: true,
            }));
        } else if (!generalRes.succeeded) {
          setShowSearchThread((prev) => ({
            ...prev,
            loading: false,
            noResult: true,
          }));
          notify(generalRes.info.responseType, NotifType.Warning);
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    }
    if (categoryType === CategoryType.Business) {
      var businessDirectInbox: IGetDirectInbox = {
        categoryId: 3,
        oldCursor: oldestCursor,
        searchTerm: "",
      };
      try {
        let businessRes = await clientFetchApi<IGetDirectInbox, IInbox>("/api/message/GetDirectInbox", { methodType: MethodType.post, session: session, data: businessDirectInbox, queries: undefined, onUploadProgress: undefined });
        console.log("businessRes ", businessRes.value);
        if (businessRes.succeeded && !query) {
          setBusinessInbox((prev) => {
            // Filter out duplicate threads before adding
            const existingThreadIds = new Set(prev!.threads.map((t) => t.threadId));
            const newThreads = businessRes.value.threads.filter((t) => !existingThreadIds.has(t.threadId));
            return {
              ...prev!,
              nextMaxId: businessRes.value.nextMaxId,
              threads: [...prev!.threads, ...newThreads],
            };
          });
        } else if (businessRes.succeeded && query) {
          if (businessRes.value.threads.length > 0) {
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
    }
    if (categoryType === CategoryType.Hide) {
      var businessDirectInbox: IGetDirectInbox = {
        categoryId: 2,
        oldCursor: oldestCursor,
        searchTerm: "",
      };
      try {
        let res = await clientFetchApi<IGetDirectInbox, IInbox>("Instagramer" + "/Message/GetDirectInbox", { methodType: MethodType.post, session: session, data: businessDirectInbox, queries: undefined, onUploadProgress: undefined });
        console.log("hideressss ", res.value);
        if (res.succeeded && !query) {
          setHideInbox((prev) => {
            // Filter out duplicate threads before adding
            const existingThreadIds = new Set(prev!.threads.map((t) => t.threadId));
            const newThreads = res.value.threads.filter((t) => !existingThreadIds.has(t.threadId));
            return {
              ...prev!,
              nextMaxId: res.value.nextMaxId,
              threads: [...prev!.threads, ...newThreads],
            };
          });
        } else if (res.succeeded && query) {
          if (res.value.threads.length > 0) {
            setSearchHideInbox(res.value);
            setShowSearchThread((prev) => ({ ...prev, loading: false }));
          } else
            setShowSearchThread((prev) => ({
              ...prev,
              loading: false,
              noResult: true,
            }));
        } else if (!res.succeeded) {
          setShowSearchThread((prev) => ({
            ...prev,
            loading: false,
            noResult: true,
          }));
          notify(res.info.responseType, NotifType.Warning);
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    }
  };
  async function fetchBusiness() {
    var businessDirectInbox: IGetDirectInbox = {
      categoryId: 3,
      oldCursor: null,
      searchTerm: "",
    };
    try {
      let businessRes = await clientFetchApi<IGetDirectInbox, IInbox>("/api/message/GetDirectInbox", { methodType: MethodType.post, session: session, data: businessDirectInbox, queries: undefined, onUploadProgress: undefined });
      if (businessRes.succeeded) setBusinessInbox(businessRes.value);
      else notify(businessRes.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Warning);
    }
  }
  async function fetchHides() {
    var businessDirectInbox: IGetDirectInbox = {
      categoryId: 2,
      oldCursor: null,
      searchTerm: "",
    };
    try {
      let res = await clientFetchApi<IGetDirectInbox, IInbox>("/api/message/GetDirectInbox", { methodType: MethodType.post, session: session, data: businessDirectInbox, queries: undefined, onUploadProgress: undefined });
      console.log(" ✅ Console ⋙ Hide", res.value);
      if (res.succeeded) setHideInbox(res.value);
      else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Warning);
    }
  }
  const fetchGeneral = async () => {
    var generalDirectInbox: IGetDirectInbox = {
      oldCursor: null,
      categoryId: 0,
      searchTerm: "",
    };
    var uniqueGeneralThreads: IThread[] = [];
    try {
      let generalRes = await clientFetchApi<IGetDirectInbox, IInbox>("/api/message/GetDirectInbox", { methodType: MethodType.post, session: session, data: generalDirectInbox, queries: undefined, onUploadProgress: undefined });
      setGeneralInbox(generalRes.value);
      console.log("generalRes.value ", generalRes.value);
      uniqueGeneralThreads = generalRes.value.threads;
    } catch (error) {}
    await handleSignalR();
    if (router.isReady && query.threadId !== undefined) {
      var threadIdRouter = query.threadId;
      if (threadIdRouter) {
        var oldGeneral = uniqueGeneralThreads.find((x) => x.threadId === threadIdRouter);
        if (oldGeneral) {
          setToggleOrder(CategoryType.General);
          setUserSelectedId(oldGeneral.threadId);
        }
      }
    }
    setLoading(false);
  };
  let onLoading = false;
  const fetchItemData = async (chatBox: IThread) => {
    console.log("oldestCursor", chatBox.nextMaxId);
    if (onLoading) return;
    onLoading = true;
    try {
      let newThread = await clientFetchApi<IGetDirectInboxItems, IThread>("/api/message/GetThread", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "recpId", value: chatBox.recp.igId },
          {
            key: "nextMaxId",
            value: !chatBox.onCurrentSnapShot ? undefined : chatBox.nextMaxId!.toString(),
          },
        ], onUploadProgress: undefined });
      console.log("newThreadFetch", newThread);
      if (newThread.succeeded) {
        var gthread = generalInbox?.threads.find((x) => x.threadId === chatBox.threadId);
        var bthread = businessInbox?.threads.find((x) => x.threadId === chatBox.threadId);
        if (gthread) {
          setGeneralInbox((prev) => ({
            ...prev!,
            threads: prev!.threads.map((x) =>
              x.threadId !== chatBox.threadId
                ? x
                : chatBox.onCurrentSnapShot
                ? {
                    ...x,
                    nextMaxId: newThread.value.nextMaxId,
                    items: [
                      ...newThread.value.items.filter(
                        (newItem) => !x.items.some((existingItem) => existingItem.itemId === newItem.itemId)
                      ),
                      ...x.items,
                    ],
                  }
                : newThread.value
            ),
          }));
        } else if (bthread) {
          setBusinessInbox((prev) => ({
            ...prev!,
            threads: prev!.threads.map((x) =>
              x.threadId !== chatBox.threadId
                ? x
                : chatBox.onCurrentSnapShot
                ? {
                    ...x,
                    nextMaxId: newThread.value.nextMaxId,
                    items: [
                      ...newThread.value.items.filter(
                        (newItem) => !x.items.some((existingItem) => existingItem.itemId === newItem.itemId)
                      ),
                      ...x.items,
                    ],
                  }
                : newThread.value
            ),
          }));
        }
        console.log("newItemsssssssssssssssssss", newThread.value.items);
        console.log("nextmaxid", newThread.value.nextMaxId);
      } else notify(newThread.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Warning);
    }
    setTimeout(() => {
      onLoading = false;
    }, 500);
  };
  function handleSendMessage(message: IIsSendingMessage) {
    console.log("IIsSendingMessage", message);
    setSendingMessages((prev) => [...prev, message]);
  }

  /* ___chat box___*/
  const handleShowIcon = (e: MouseEvent) => {
    e.stopPropagation();
    setShowIcon(e.currentTarget.id !== showIcon ? e.currentTarget.id : "");
  };
  const showUserList = () => {
    if (typeof window !== undefined && window.innerWidth <= 800 && displayLeft === "none") {
      setDisplayLeft("");
      setDisplayRight("none");
    }
    setUserSelectedId(null);
  };
  const handleRestartSignalR = () => {
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
      if (gInbox.current === undefined) {
        console.log("gInbox.current ", gInbox.current);
        console.log(" bInbox.current  ", bInbox.current);
        return;
      }
      let userSession = {
        accessToken: session?.user.socketAccessToken,
        instagramerId: instagramerId,
        role: PartnerRole.Message,
      };
      let str = JSON.stringify(userSession);
      var s = new HubConnectionBuilder()
        .withUrl("https://socket.brancy.app/Hubs/GraphClient?access_token=" + str)
        .build();
      s.start().catch((error) => {
        console.log(error);
        handleRestartSignalR();
      });
      s.on("Unknown", (message: string) => {
        setMessages((prevMessages) => [...prevMessages, "Unknown:" + message]);
      });
      s.on("graph_direct", async (message: string) => {
        var msgStr = handleDecompress(message);
        var obj: IHookItem = JSON.parse(msgStr!);
        console.log("graph_direct_obj", obj);
        if (obj.SentByOwner) {
          setSendingMessages((prev) => {
            let firstFound = false;
            return prev.filter((item) => {
              if (item.threadId === obj.ThreadId && !firstFound) {
                console.log("remove sending message", item);
                firstFound = true;
                return false;
              }
              return true;
            });
          });
        }
        if (obj.DirectItem && obj.DirectItem.IsDeleted) handleDeleteItem(obj);
        if (obj.DirectItem && !obj.DirectItem.IsDeleted) await handleAddMessageHook(obj);
        if (obj.MessageEdit) handleEditItem(obj);
        if (obj.Reaction) handleAddReaction(obj.Reaction);
        if (obj.Read) handleRead(obj.Read);
      });
      s.on("Error", (message: string, body: string) => {
        setMessages((prevMessages) => [...prevMessages, "Error:" + message]);
        console.log("Error", message, body);
      });
      s.onclose(() => handleRestartSignalR());
      console.log(s.state);
      setWs(s);
    }, 1000);
  };
  const handleLastMessage = (item: IItem) => {
    var response: string | null = "";
    switch (item.itemType) {
      case ItemType.PlaceHolder:
        response = "Need Instagram App";
        break;
      case ItemType.Text:
        response = item.text;
        break;
      case ItemType.AudioShare:
        response = "🔊 Voice";
        break;
      case ItemType.Media:
        if (item.medias[0].image !== null) {
          response = "🖼️ Image";
        } else if (item.medias[0].video !== null) {
          response = "▶️ Video";
        }
        break;
      case ItemType.MediaShare:
        response = "📂 Media";
      case ItemType.StoryMention:
        response = "📂 Story Mention";
      case ItemType.Generic:
        response = "▶️ Video";
    }
    return response;
  };
  function handleRead(read: IHookRead) {
    var gthread = gInbox.current!.threads.find((x) => x.threadId === read.ThreadId);
    var bthread = bInbox.current!.threads.find((x) => x.threadId === read.ThreadId);
    if (gthread) {
      setGeneralInbox((prev) => ({
        ...prev!,
        threads: prev!.threads.map((thread) =>
          thread.threadId !== read.ThreadId
            ? thread
            : {
                ...thread,
                recpLastSeenUnix: !read.SentByOwner ? Date.now() * 1000 : thread.recpLastSeenUnix,
                ownerLastSeenUnix: read.SentByOwner ? Date.now() * 1000 : thread.ownerLastSeenUnix,
              }
        ),
      }));
    }
    if (bthread) {
      setBusinessInbox((prev) => ({
        ...prev!,
        threads: prev!.threads.map((thread) =>
          thread.threadId !== read.ThreadId
            ? thread
            : {
                ...thread,
                recpLastSeenUnix: !read.SentByOwner ? Date.now() * 1000 : thread.recpLastSeenUnix,
                ownerLastSeenUnix: read.SentByOwner ? Date.now() * 1000 : thread.ownerLastSeenUnix,
              }
        ),
      }));
    }
  }
  function handleAddReaction(react: IHookReact) {
    var gthread = gInbox.current!.threads.find((x) => x.threadId === react.ThreadId);
    var bthread = bInbox.current!.threads.find((x) => x.threadId === react.ThreadId);
    if (gthread) {
      setGeneralInbox((prev) => ({
        ...prev!,
        threads: prev!.threads.map((thread) =>
          thread.threadId !== react.ThreadId
            ? thread
            : {
                ...thread,
                items: thread.items.map((item) =>
                  item.itemId !== react.ItemId
                    ? item
                    : {
                        ...item,
                        ownerEmojiReaction: react.SentByOwner
                          ? react.Action === "react"
                            ? react.Emoji
                            : null
                          : item.ownerEmojiReaction,
                        recpEmojiReaction: !react.SentByOwner
                          ? react.Action === "react"
                            ? react.Emoji
                            : null
                          : item.recpEmojiReaction,
                      }
                ),
              }
        ),
      }));
    } else if (bthread) {
      setBusinessInbox((prev) => ({
        ...prev!,
        threads: prev!.threads.map((thread) =>
          thread.threadId !== react.ThreadId
            ? thread
            : {
                ...thread,
                items: thread.items.map((item) =>
                  item.itemId !== react.ItemId
                    ? item
                    : {
                        ...item,
                        ownerEmojiReaction: react.SentByOwner
                          ? react.Action === "react"
                            ? react.Emoji
                            : null
                          : item.ownerEmojiReaction,
                        recpEmojiReaction: !react.SentByOwner
                          ? react.Action === "react"
                            ? react.Emoji
                            : null
                          : item.recpEmojiReaction,
                      }
                ),
              }
        ),
      }));
    }
  }
  function handleDeleteItem(item: IHookItem) {
    var gthread = gInbox.current!.threads.find((x) => x.threadId === item.ThreadId);
    var bthread = bInbox.current!.threads.find((x) => x.threadId === item.ThreadId);
    if (gthread) {
      setGeneralInbox((prev) => ({
        ...prev!,
        threads: prev!.threads.map((x) =>
          x.threadId !== item.ThreadId
            ? x
            : {
                ...x,
                items: x.items
                  .filter((x) => x.itemId !== item.DirectItem?.ItemId)
                  .map((z) => (z.repliedToItemId !== item.DirectItem!.ItemId ? z : { ...z, repliedToItemId: null })),
              }
        ),
      }));
    } else if (bthread) {
      setBusinessInbox((prev) => ({
        ...prev!,
        threads: prev!.threads.map((x) =>
          x.threadId !== item.ThreadId
            ? x
            : {
                ...x,
                items: x.items
                  .filter((x) => x.itemId !== item.DirectItem?.ItemId)
                  .map((z) => (z.repliedToItemId !== item.DirectItem!.ItemId ? z : { ...z, repliedToItemId: null })),
              }
        ),
      }));
    }
  }
  function handleEditItem(item: IHookItem) {
    var gthread = gInbox.current!.threads.find((x) => x.threadId === item.ThreadId);
    var bthread = bInbox.current!.threads.find((x) => x.threadId === item.ThreadId);
    if (gthread) {
      setGeneralInbox((prev) => ({
        ...prev!,
        threads: prev!.threads.map((x) =>
          x.threadId !== item.ThreadId
            ? x
            : {
                ...x,
                items: x.items.map((z) =>
                  z.itemId !== item.MessageEdit!.ItemId ? z : { ...z, text: item.MessageEdit!.Text }
                ),
              }
        ),
      }));
    } else if (bthread) {
      setBusinessInbox((prev) => ({
        ...prev!,
        threads: prev!.threads.map((x) =>
          x.threadId !== item.ThreadId
            ? x
            : {
                ...x,
                items: x.items.map((z) =>
                  z.itemId !== item.MessageEdit!.ItemId ? z : { ...z, text: item.MessageEdit!.Text }
                ),
              }
        ),
      }));
    }
  }
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  async function handleAddMessageHook(item: IHookItem) {
    if (!item.DirectItem) return;
    let respItem: IItem | null = null;
    if (item.DirectItem.RepliedToItemId) {
      try {
        let res = await clientFetchApi<boolean, IItem>("/api/message/GetDirectParentItem", { methodType: MethodType.get, session: session, data: null, queries: [
            { key: "recpId", value: item.RecpId },
            { key: "itemId", value: item.DirectItem.RepliedToItemId },
          ], onUploadProgress: undefined });
        if (res.succeeded) respItem = res.value;
        else if (res.info.responseType === ResponseType.InvalidItemId) item.DirectItem.RepliedToItemId = null;
      } catch (error) {}
    }
    const newItem: IItem = {
      repliedToItem: respItem,
      audio: item.DirectItem.Audio
        ? {
            externalUrl: item.DirectItem.Audio.ExternalUrl,
            id: item.DirectItem.Audio.Id,
            title: item.DirectItem.Audio.Title,
            url: item.DirectItem.Audio.Url,
          }
        : null,
      buttons: null,
      clientContext: null,
      createdTime: item.DirectItem.CreatedTime * 1000,
      graphItemId: item.DirectItem.GraphItemId,
      isUnsupporeted: item.DirectItem.IsUnsupporeted,
      itemId: item.DirectItem.ItemId,
      itemType: item.DirectItem.ItemType,
      mediaShares: item.DirectItem.MediaShares.map((x) => ({
        externalUrl: x.ExternalUrl,
        id: x.Id,
        title: x.Title,
        url: x.Url,
      })),
      storyMention: item.DirectItem.StoryMention,
      ownerEmojiReaction: null,
      payloadId: item.DirectItem.PayloadId,
      recpEmojiReaction: null,
      repliedToItemId: item.DirectItem.RepliedToItemId,
      replyStory: null,
      sentByOwner: item.DirectItem.SentByOwner,
      text: item.DirectItem.Text,
      userId: item.DirectItem.UserId,
      medias: item.DirectItem.Medias.map((x) => ({
        image: x.Image
          ? {
              height: x.Image.Height,
              isSticker: x.Image.IsSticker,
              maxHeight: x.Image.MaxHeight,
              maxWidth: x.Image.MaxWidth,
              previewUrl: {
                externalUrl: x.Image.PreviewUrl.ExternalUrl,
                id: x.Image.PreviewUrl.Id,
                title: x.Image.PreviewUrl.Title,
                url: x.Image.PreviewUrl.Url,
              },
              url: {
                externalUrl: x.Image.Url.ExternalUrl,
                id: x.Image.Url.Id,
                title: x.Image.Url.Title,
                url: x.Image.Url.Url,
              },
              width: x.Image.Width,
            }
          : null,
        video: x.Video
          ? {
              height: x.Video.Height,
              isSticker: x.Video.IsSticker,
              maxHeight: x.Video.MaxHeight,
              maxWidth: x.Video.MaxWidth,
              previewUrl: {
                externalUrl: x.Video.PreviewUrl.ExternalUrl,
                id: x.Video.PreviewUrl.Id,
                title: x.Video.PreviewUrl.Title,
                url: x.Video.PreviewUrl.Url,
              },
              url: {
                externalUrl: x.Video.Url.ExternalUrl,
                id: x.Video.Url.Id,
                title: x.Video.Url.Title,
                url: x.Video.Url.Url,
              },
              width: x.Video.Width,
            }
          : null,
      })),
    };
    var gthread = gInbox.current!.threads.find((x) => x.threadId === item.ThreadId);
    var bthread = bInbox.current!.threads.find((x) => x.threadId === item.ThreadId);
    console.log("userSelectedId read", refUserSelectId.current);
    console.log("read", item);
    if (item.ThreadId === refUserSelectId.current && !item.SentByOwner) {
      await refWs.current!.send("SendRead", item.RecpId, item.DirectItem.ItemId);
    }
    if (gthread !== undefined) {
      console.log("newIGeneral", newItem);
      setGeneralInbox((prev) => ({
        ...prev!,
        threads: prev!.threads
          .map((x) =>
            x.threadId !== item.ThreadId
              ? x
              : {
                  ...x,
                  isActive: item.SentByOwner ? x.isActive : true,
                  lastUpdate: item.DirectItem!.CreatedTime * 1e6,
                  items: x.items.some((existingItem) => existingItem.itemId === newItem.itemId)
                    ? x.items
                    : [newItem, ...x.items],
                  ownerLastSeenUnix:
                    refUserSelectId.current === item.ThreadId && !item.SentByOwner
                      ? item.DirectItem!.CreatedTime * 1e6
                      : x.ownerLastSeenUnix,
                }
          )
          .sort((a, b) => {
            if (a.isPin && !b.isPin) {
              return -1;
            }
            if (!a.isPin && b.isPin) {
              return 1;
            }
            return b.lastUpdate - a.lastUpdate;
          }),
      }));
    } else if (bthread !== undefined) {
      console.log("newIBusinessssssss", newItem);
      setBusinessInbox((prev) => ({
        ...prev!,
        threads: prev!.threads
          .map((x) =>
            x.threadId !== item.ThreadId
              ? x
              : {
                  ...x,
                  isActive: item.SentByOwner ? x.isActive : true,
                  lastUpdate: item.DirectItem!.CreatedTime * 1e6,
                  items: x.items.some((existingItem) => existingItem.itemId === newItem.itemId)
                    ? x.items
                    : [newItem, ...x.items],
                  ownerLastSeenUnix:
                    refUserSelectId.current === item.ThreadId
                      ? item.DirectItem!.CreatedTime * 1e6
                      : x.ownerLastSeenUnix,
                }
          )
          .sort((a, b) => {
            if (a.isPin && !b.isPin) {
              return -1;
            }
            if (!a.isPin && b.isPin) {
              return 1;
            }
            return b.lastUpdate - a.lastUpdate;
          }),
      }));
    } else {
      try {
        console.log("igiddddddddddddddd", item.RecpId);
        let newThread = await clientFetchApi<IGetDirectInboxItems, IThread>("Instagramer" + "/Message/GetThread", { methodType: MethodType.get, session: session, data: null, queries: [
            { key: "recpId", value: item.RecpId },
            { key: "nextMaxId", value: "null" },
          ], onUploadProgress: undefined });
        console.log("newThreadFetch", newThread);
        if (newThread.succeeded) {
          for (
            let i = 0;
            (i < 10 && newThread.value.recp.username == null) ||
            newThread.value.recp.username == undefined ||
            newThread.value.recp.username?.length == 0;
            i++
          ) {
            await delay(1000);
            newThread = await clientFetchApi<IGetDirectInboxItems, IThread>("Instagramer" + "/Message/GetThread", { methodType: MethodType.get, session: session, data: null, queries: [
                { key: "recpId", value: item.RecpId },
                { key: "nextMaxId", value: "null" },
              ], onUploadProgress: undefined });
          }
          console.log("threadId", newThread.value.threadId);
          console.log("tempThreadIds", tempThreadIds);
          if (refTempThread.current.find((x) => x.threadId === newThread.value.threadId)) {
            setShowSearchThread({
              loading: false,
              noResult: false,
              searchMode: false,
            });
            setSearchbox("");
            setTempThreadIds((prev) => prev.filter((x) => x.threadId !== newThread.value.threadId));
          }
          if (newThread.value.categoryId === CategoryType.General) {
            setGeneralInbox((prev) => {
              // Check if thread already exists to prevent duplicates
              const threadExists = prev!.threads.some((t) => t.threadId === newThread.value.threadId);
              if (threadExists) {
                return prev!;
              }
              return {
                ...prev!,
                threads: [newThread.value, ...prev!.threads].sort((a, b) => {
                  if (a.isPin && !b.isPin) {
                    return -1;
                  } else if (b.isPin && !a.isPin) {
                    return 1;
                  } else {
                    return 0;
                  }
                }),
              };
            });
          } else if (newThread.value.categoryId === CategoryType.Business) {
            setBusinessInbox((prev) => {
              // Check if thread already exists to prevent duplicates
              const threadExists = prev!.threads.some((t) => t.threadId === newThread.value.threadId);
              if (threadExists) {
                return prev!;
              }
              return {
                ...prev!,
                threads: [newThread.value, ...prev!.threads].sort((a, b) => {
                  if (a.isPin && !b.isPin) {
                    return -1;
                  } else if (b.isPin && !a.isPin) {
                    return 1;
                  } else {
                    return 0;
                  }
                }),
              };
            });
          }
        } else notify(newThread.info.responseType, NotifType.Warning);
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Warning);
      }
    }
  }
  function handleSpecifyChatBox() {
    if (toggleOrder === CategoryType.General && showSearchThread.searchMode) {
      return searchGeneralInbox?.threads.find((x) => x.threadId === userSelectedId);
    } else if (toggleOrder === CategoryType.Business && showSearchThread.searchMode) {
      return searchBusinessInbox?.threads.find((x) => x.threadId === userSelectedId);
    } else if (toggleOrder === CategoryType.General && !showSearchThread.searchMode) {
      return generalInbox?.threads.find((x) => x.threadId === userSelectedId);
    } else if (toggleOrder === CategoryType.Business && !showSearchThread.searchMode) {
      return businessInbox?.threads.find((x) => x.threadId === userSelectedId);
    }
  }
  const handleSearchThreads = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!LoginStatus(session)) return;
    setUserSelectedId(null);
    setShowSearchThread({ searchMode: true, loading: true, noResult: false });
    setSearchGeneralInbox((prev) => ({ ...prev!, threads: [] }));
    const query = e.target.value;
    setSearchbox(query);
    if (timoutId) clearTimeout(timoutId);
    if (query.length > 0) {
      let timeOutId = setTimeout(() => {
        if (query && query.length > 0) {
          if (searchLocked) return;
          console.log("searchhhchhhhhhh");
          setSearchLocked(true);
          fetchData(activeHideInbox ? CategoryType.Hide : toggleOrder, null, query);
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
  const handleSelectSearch = async (thread: IThread, toggle: CategoryType) => {
    setUserSelectedId(thread.threadId);
    if (
      generalInbox?.threads.find((x) => x.threadId === thread.threadId) ||
      businessInbox?.threads.find((x) => x.threadId === thread.threadId)
    ) {
      setSearchbox("");
      setShowSearchThread((prev) => ({ ...prev, searchMode: false }));
    } else setTempThreadIds((prev) => [...prev, { threadId: thread.threadId, toggle: toggle }]);
  };
  useEffect(() => {
    console.log("tempThreadIds", tempThreadIds);
    refTempThread.current = tempThreadIds;
  }, [tempThreadIds]);
  function handleSpecifyUnread(items: IItem[], thread: IThread) {
    let unSeenDiv = <></>;
    const newItems = items
      .filter((item) => item.createdTime > thread.ownerLastSeenUnix && !item.sentByOwner)
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
  const [messages, setMessages] = useState<string[]>([]);
  const [showGuide, setShowGuide] = useState<boolean>(true);

  useEffect(() => {
    const guideHidden = localStorage.getItem("hideDirectGuide");
    if (guideHidden === "true") {
      setShowGuide(false);
    }
  }, []);

  const handleHideGuide = () => {
    localStorage.setItem("hideDirectGuide", "true");
    setShowGuide(false);
  };

  useEffect(() => {
    console.log(" ✅ Console ⋙ Session", session, session?.user.username);
    if (
      session === undefined ||
      session?.user.username === undefined ||
      !LoginStatus(session) ||
      !RoleAccess(session, PartnerRole.Message)
    )
      return;
    fetchBusiness();
    fetchHides();
    fetchGeneral();
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
  async function handleReSendMessage() {
    for (let message of sendingMessages) {
      switch (message.itemType) {
        case ItemType.Text:
          await ws?.send("SendTextMessage", message.igId, message.message);
          break;
        case ItemType.Media:
          const res = await UploadFile(session, message.file);
          if (message.mediaType === MediaType.Image) await ws?.send("SendVideoMessage", message.igId, res.fileName);
          else if (message.mediaType === MediaType.Video)
            await ws?.send("SendVideoMessage", message.igId, res.fileName);
          break;
        case ItemType.AudioShare:
          const msg = message.message;
          const res2 = await UploadFile(session, message.file);
          await ws?.send("SendAudioMessage", message.igId, res2.fileName);
          break;
      }
    }
  }
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
    if (sendingMessages.length > 0 && refWs.current?.state === HubConnectionState.Connected) {
      handleReSendMessage();
    }
  }, [ws?.state]);

  return (
    <>
      {!RoleAccess(session, PartnerRole.Message) && <NotAllowed />}
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
                  name="Search from People or Keyword"
                />
              </div>
              {activeHideInbox && (
                <Tooltip tooltipValue="All Messages" position="bottom" onClick={true}>
                  <div
                    className={styles.readandunread}
                    onClick={() => setActiveHideInbox(false)}
                    style={activeReadState ? {} : { border: "1px solid var(--color-dark-blue)" }}>
                    <svg
                      className={styles.eyeIcon}
                      fill="var(--color-dark-blue)"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 36 36">
                      <path
                        opacity=".4"
                        d="M29.76 15.52c1.15.16 2.14.5 2.94 1.28.79.8 1.12 1.8 1.28 2.94.15 1.1.14 2.64.14 4.34l-.14 4.18a5 5 0 0 1-1.28 2.94 5 5 0 0 1-2.94 1.28c-1.1.15-2.48.15-4.18.15H10.42c-1.7 0-3.1 0-4.18-.15A5 5 0 0 1 3.3 31.2a5 5 0 0 1-1.28-2.94c-.15-1.1-.15-2.48-.15-4.18l.15-4.34A5 5 0 0 1 3.3 16.8a5 5 0 0 1 2.94-1.28c1.1-.14 2.48-.14 4.18-.14h15.16zm-16.86 6.3a1.13 1.13 0 0 0-1.57-.22 1.1 1.1 0 0 0-.23 1.57l.45.6.13.18c.75 1.01 1.36 1.8 2.23 2.24s1.87.44 3.12.44h1.94c1.25 0 2.24 0 3.12-.44s1.48-1.24 2.23-2.24l.13-.17.45-.6a1.13 1.13 0 0 0-1.8-1.35l-.45.6c-.96 1.26-1.22 1.58-1.56 1.75s-.75.2-2.34.2h-1.5c-1.6 0-2-.03-2.34-.2-.34-.16-.61-.49-1.56-1.76z"
                      />
                      <path d="M24.05 9.38h-12.1l-2.5.05c-.7.06-1.33.18-1.91.48a5 5 0 0 0-2.13 2.13 5 5 0 0 0-.47 1.82 9 9 0 0 1 1.05-.2c1.22-.16 2.7-.16 4.32-.16H25.7l4.32.16q.53.07 1.05.2a5 5 0 0 0-.47-1.82 5 5 0 0 0-2.13-2.13 5 5 0 0 0-1.9-.48q-1-.08-2.51-.05m-3.01-6h-6.1l-2.5.05c-.7.06-1.33.18-1.91.48A5 5 0 0 0 8.4 6.04c-.28.53-.4 1.1-.46 1.73q.7-.15 1.34-.2 1.14-.09 2.6-.07H24.1l2.6.06q.65.05 1.34.2a5 5 0 0 0-.46-1.72 5 5 0 0 0-2.13-2.13 5 5 0 0 0-1.9-.48 28 28 0 0 0-2.51-.06" />
                    </svg>
                  </div>
                </Tooltip>
              )}
              {!activeHideInbox && (
                <Tooltip tooltipValue="Archieved Messages" position="bottom" onClick={true}>
                  <div className={styles.readandunread} onClick={() => setActiveHideInbox(true)}>
                    <svg
                      className={styles.eyeIcon}
                      fill="var(--color-gray)"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 36 36">
                      <path
                        opacity=".4"
                        d="M29.76 15.52c1.15.16 2.14.5 2.94 1.28.79.8 1.12 1.8 1.28 2.94.15 1.1.14 2.64.14 4.34l-.14 4.18a5 5 0 0 1-1.28 2.94 5 5 0 0 1-2.94 1.28c-1.1.15-2.48.15-4.18.15H10.42c-1.7 0-3.1 0-4.18-.15A5 5 0 0 1 3.3 31.2a5 5 0 0 1-1.28-2.94c-.15-1.1-.15-2.48-.15-4.18l.15-4.34A5 5 0 0 1 3.3 16.8a5 5 0 0 1 2.94-1.28c1.1-.14 2.48-.14 4.18-.14h15.16zm-16.86 6.3a1.13 1.13 0 0 0-1.57-.22 1.1 1.1 0 0 0-.23 1.57l.45.6.13.18c.75 1.01 1.36 1.8 2.23 2.24s1.87.44 3.12.44h1.94c1.25 0 2.24 0 3.12-.44s1.48-1.24 2.23-2.24l.13-.17.45-.6a1.13 1.13 0 0 0-1.8-1.35l-.45.6c-.96 1.26-1.22 1.58-1.56 1.75s-.75.2-2.34.2h-1.5c-1.6 0-2-.03-2.34-.2-.34-.16-.61-.49-1.56-1.76z"
                      />
                      <path d="M24.05 9.38h-12.1l-2.5.05c-.7.06-1.33.18-1.91.48a5 5 0 0 0-2.13 2.13 5 5 0 0 0-.47 1.82 9 9 0 0 1 1.05-.2c1.22-.16 2.7-.16 4.32-.16H25.7l4.32.16q.53.07 1.05.2a5 5 0 0 0-.47-1.82 5 5 0 0 0-2.13-2.13 5 5 0 0 0-1.9-.48q-1-.08-2.51-.05m-3.01-6h-6.1l-2.5.05c-.7.06-1.33.18-1.91.48A5 5 0 0 0 8.4 6.04c-.28.53-.4 1.1-.46 1.73q.7-.15 1.34-.2 1.14-.09 2.6-.07H24.1l2.6.06q.65.05 1.34.2a5 5 0 0 0-.46-1.72 5 5 0 0 0-2.13-2.13 5 5 0 0 0-1.9-.48 28 28 0 0 0-2.51-.06" />
                    </svg>
                  </div>
                </Tooltip>
              )}
              <Tooltip tooltipValue="Unread message only" position="bottom" onClick={true}>
                <div
                  onClick={() => setActiveReadState(!activeReadState)}
                  className={styles.readandunread}
                  style={activeReadState ? { border: "1px solid var(--color-dark-blue)" } : {}}>
                  {activeReadState ? (
                    <svg
                      className={styles.eyeIcon}
                      width="36"
                      height="36"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 36 36">
                      <path
                        opacity=".4"
                        d="M21 3.8h-6c-5.7 0-8.5 0-10.2 1.7C3 7.3 3 10.1 3 15.8v.7c0 5.7 0 8.5 1.8 10.2a7 7 0 0 0 4.4 1.8c-.4 1.4-.6 2.9.3 3.5q.9.7 4.2-1.1 2.5-1.3 5.1-2.2l2.2-.2c5.7 0 8.5 0 10.2-1.8C33 25 33 22.2 33 16.5v-.7c0-5.7 0-8.5-1.8-10.3-1.7-1.7-4.5-1.7-10.2-1.7"
                        fill="var(--color-dark-blue)"
                      />
                      <path
                        d="M9.2 28.5q-3-.3-4.4-1.8C3 25 3 22.2 3 16.5v-.7C3 10 3 7.3 4.8 5.4 6.5 3.8 9.3 3.8 15 3.8h6c5.7 0 8.5 0 10.2 1.7C33 7.3 33 10.1 33 15.8v.7c0 5.7 0 8.5-1.8 10.2-1.7 1.8-4.5 1.8-10.2 1.8q-1.2 0-2.2.2c-1.8.4-3.4 1.4-5 2.2q-3.4 1.8-4.3 1.1c-1.4-1 0-4.2.3-5.7"
                        stroke="var(--color-dark-blue)"
                        fill="none"
                      />
                      <path d="M12 20.3h12Zm0-7.5h6Z" fill="var(--color-dark-blue)" stroke="var(--color-dark-blue)" />
                    </svg>
                  ) : (
                    <svg
                      className={styles.eyeIcon}
                      style={activeReadState ? {} : {}}
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 36 36">
                      <path d="M12 20.3h12m-12-7.5h6" stroke="var(--color-gray)" />
                      <path
                        opacity=".4"
                        d="M21 3.8h4.5a5 5 0 0 0 7.4 6.2l.1 5.8v.7c0 5.5 0 8.3-1.6 10l-.4.4c-1.7 1.6-4.5 1.6-10 1.6l-2.2.2a38 38 0 0 0-5.1 2.2q-3.3 1.8-4.2 1.1c-.9-.6-.7-2.1-.3-3.5a7 7 0 0 1-4.4-1.8C3 25 3 22.2 3 16.5v-.7c0-5.7 0-8.5 1.8-10.3C6.5 3.8 9.3 3.8 15 3.8z"
                        fill="var(--color-gray)"
                      />
                      <path
                        d="M21 3.3h4.8l-.5 1H15q-4.3 0-6.5.2T5.2 5.8 3.7 9.2a54 54 0 0 0-.2 6.6v2.7q0 2.8.2 4.5.3 2.2 1.3 3.2l.1.1q1.2 1.3 3.7 1.7l.1-.5.4-1.3 1 .2q0 .7-.4 1.4l-.4 1.6v1.4q0 .6.2.7l.1.1h1.1l2.7-1.1c1.5-.8 3.2-1.9 5-2.3h.1L21 28q4.3 0 6.5-.2t3.3-1.4 1.5-3.4.2-6.5v-.7l-.1-5.4 1-.7.1 6.1v.7q0 4.2-.2 6.7T31.5 27t-3.8 1.7q-2.5.2-6.7.2-1.2 0-2.1.2-2.5.8-4.9 2.1l-2.9 1.3q-1.1.3-1.9-.2a2 2 0 0 1-.8-1.4l.2-2a7 7 0 0 1-4.1-2l-.2-.1q-1.4-1.5-1.6-3.7l-.2-4.7v-2.7q0-4.2.2-6.7t1.7-4q1.5-1.4 4-1.6 2.4-.3 6.6-.2z"
                        fill="var(--color-gray)"
                      />
                      <circle cx="30.5" cy="5.5" r="4.5" fill="var(--color-gray)" />
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
                    label: t(LanguageKey.General),
                    unreadCount:
                    generalInbox &&
                      generalInbox?.threads.reduce((total, thread) => {
                        const unreadCount = thread.items.filter(
                          (item) => item.createdTime > thread.ownerLastSeenUnix
                        ).length;
                        return total + unreadCount;
                      }, 0) || 0,
                  },
                  {
                    id: 3,
                    label: t(LanguageKey.Business),
                    unreadCount:
                      businessInbox?.threads.reduce((total, thread) => {
                        const unreadCount = thread.items.filter(
                          (item) => item.createdTime > thread.ownerLastSeenUnix
                        ).length;
                        return total + unreadCount;
                      }, 0) || 0,
                  },
                ]}
              />
            )}

            {/* ___list of user ___*/}
            <div className={styles.userslist} ref={userListRef}>
              {showGuide && (
                <div className={styles.userguide} onClick={handleHideGuide}>
                  <div className={styles.picguide}></div>
                  <div className={styles.contentguide}>
                    <div className={styles.titleguide}></div>
                    <div className={styles.explainguide}></div>
                  </div>
                  <svg
                    className={styles.guideicon}
                    width="60"
                    height="60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24">
                    <path
                      opacity=".4"
                      d="M9.636 6.311A2.315 2.315 0 0 1 11.956 4a2.315 2.315 0 0 1 2.318 2.31l.003 4.237 2.087.337c.854.13 1.532.232 2.073.351.55.121 1.019.27 1.432.52 1.19.72 2.131 1.925 2.131 3.558 0 1.011-.242 1.743-.71 3.152-.318.968-.686 2.084-1.038 2.602a4.4 4.4 0 0 1-2.416 1.759c-.6.174-1.267.174-2.274.174h-1.234c-1.342 0-2.238 0-3.05-.337a4 4 0 0 1-.423-.204c-.77-.422-1.332-1.123-2.179-2.177L5.524 16.36a2.38 2.38 0 0 1-.011-2.965 2.344 2.344 0 0 1 3.377-.32l.002.002.744.65z M4.347 2.196a.75.75 0 0 1 1.096.091.85.85 0 0 1 .174.68v.942h2.346C8.536 3.91 9 4.398 9 5s-.464 1.09-1.037 1.09H5.617v.943a.85.85 0 0 1-.174.68.75.75 0 0 1-1.096.091l-1.249-1.12c-.257-.232-.506-.456-.685-.666C2.216 5.786 2 5.453 2 5s.216-.786.413-1.018c.179-.21.428-.434.685-.665z"
                      fill="var(--color-dark-blue)"
                    />
                    <path
                      d="M9 5.762c0-1.578 1.343-2.857 3-2.857s3 1.279 3 2.857a2.77 2.77 0 0 1-.747 1.887l.002 2.35q.085-.028.168-.071C15.958 9.117 17 7.556 17 5.762 17 3.132 14.761 1 12 1S7 3.132 7 5.762c0 1.794 1.042 3.355 2.577 4.166q.084.045.173.072V7.652A2.77 2.77 0 0 1 9 5.762"
                      fill="var(--color-dark-blue)"
                    />
                  </svg>
                </div>
              )}
              {/* ___users list___*/}
              {toggleOrder === CategoryType.General &&
                !showSearchThread.searchMode &&
                generalInbox &&
                !activeHideInbox &&
                generalInbox.threads.length === 0 && (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateText}>{t(LanguageKey.emptydirect)}</div>
                  </div>
                )}
              {toggleOrder === CategoryType.General &&
                !showSearchThread.searchMode &&
                generalInbox &&
                !activeHideInbox &&
                generalInbox.threads.length > 0 &&
                generalInbox.threads.map((v) => (
                  <div key={v.threadId}>
                    {((activeReadState &&
                      v.items
                        .filter((item) => item.createdTime > v.ownerLastSeenUnix)
                        .sort((a, b) => a.createdTime - b.createdTime).length > 0) ||
                      !activeReadState) && (
                      <div
                        key={v.threadId}
                        onMouseDown={() => handleMouseDown()}
                        onMouseUp={() => handleMouseUp()}
                        onMouseMove={() => handleMouseMove(v.threadId)}
                        onTouchEnd={() => handleTouchEnd(v.threadId)}
                        onClick={() => {
                          handleGetGeneralChats(v);
                        }}
                        className={
                          v.threadId === userSelectedId ? styles.selectedUserbackground : styles.userbackground
                        }>
                        <div className={styles.user} style={!v.isActive ? { opacity: "0.3" } : {}}>
                          <img
                            decoding="async"
                            loading="lazy"
                            draggable={false}
                            className={styles.pictureIcon}
                            title={v.recp.name ? v.recp.name : ""}
                            alt="instagram profile picture"
                            src={basePictureUrl + v.recp.profilePic}
                            onError={(e) => {
                              e.currentTarget.src = "/no-profile.svg";
                            }}
                          />

                          <div className={styles.profile}>
                            <div className={styles.username} title={v.recp.name ? v.recp.name : ""}>
                              {v.recp.username}
                            </div>
                            <div
                              className={getMessageDirectionClass(
                                v.items.length > 0
                                  ? handleLastMessage(v.items.sort((a, b) => b.createdTime - a.createdTime)[0])
                                  : "",
                                styles.messagetext
                              )}>
                              {v.items.length > 0
                                ? handleLastMessage(v.items.sort((a, b) => b.createdTime - a.createdTime)[0])
                                : ""}
                            </div>
                          </div>
                          <div className={styles.notifbox} title="ℹ️ Slide to more">
                            <div className={styles.settingbox}>
                              {handleSpecifyUnread(v.items, v)}
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
                              {v.items.length > 0
                                ? new DateObject({
                                    date: v.items[0].createdTime / 1e3,
                                    calendar: initialzedTime().calendar,
                                    locale: initialzedTime().locale,
                                  }).format("h:mm a")
                                : ""}
                            </div>
                          </div>
                        </div>
                        {showMoreSettingDiv && showDivIndex === v.threadId && (
                          <>
                            <div className={styles.moresetting}>
                              <div
                                title="ℹ️ Archive"
                                onClick={() =>
                                  handleMoveDiv(v.threadId, v.recp.igId, CategoryType.General, CategoryType.Hide)
                                }
                                className={styles[moreSettingClassName]}>
                                <svg
                                  fill="none"
                                  className={styles.dragicon}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 36 36">
                                  <path
                                    opacity=".4"
                                    d="M29.76 15.52c1.15.16 2.14.5 2.94 1.28.79.8 1.12 1.8 1.28 2.94.15 1.1.14 2.64.14 4.34l-.14 4.18a5 5 0 0 1-1.28 2.94 5 5 0 0 1-2.94 1.28c-1.1.15-2.48.15-4.18.15H10.42c-1.7 0-3.1 0-4.18-.15A5 5 0 0 1 3.3 31.2a5 5 0 0 1-1.28-2.94c-.15-1.1-.15-2.48-.15-4.18l.15-4.34A5 5 0 0 1 3.3 16.8a5 5 0 0 1 2.94-1.28c1.1-.14 2.48-.14 4.18-.14h15.16zm-16.86 6.3a1.13 1.13 0 0 0-1.57-.22 1.1 1.1 0 0 0-.23 1.57l.45.6.13.18c.75 1.01 1.36 1.8 2.23 2.24s1.87.44 3.12.44h1.94c1.25 0 2.24 0 3.12-.44s1.48-1.24 2.23-2.24l.13-.17.45-.6a1.13 1.13 0 0 0-1.8-1.35l-.45.6c-.96 1.26-1.22 1.58-1.56 1.75s-.75.2-2.34.2h-1.5c-1.6 0-2-.03-2.34-.2-.34-.16-.61-.49-1.56-1.76z"
                                  />
                                  <path d="M24.05 9.38h-12.1l-2.5.05c-.7.06-1.33.18-1.91.48a5 5 0 0 0-2.13 2.13 5 5 0 0 0-.47 1.82 9 9 0 0 1 1.05-.2c1.22-.16 2.7-.16 4.32-.16H25.7l4.32.16q.53.07 1.05.2a5 5 0 0 0-.47-1.82 5 5 0 0 0-2.13-2.13 5 5 0 0 0-1.9-.48q-1-.08-2.51-.05m-3.01-6h-6.1l-2.5.05c-.7.06-1.33.18-1.91.48A5 5 0 0 0 8.4 6.04c-.28.53-.4 1.1-.46 1.73q.7-.15 1.34-.2 1.14-.09 2.6-.07H24.1l2.6.06q.65.05 1.34.2a5 5 0 0 0-.46-1.72 5 5 0 0 0-2.13-2.13 5 5 0 0 0-1.9-.48 28 28 0 0 0-2.51-.06" />
                                </svg>

                                {/* Delete */}
                              </div>
                              <div
                                title="ℹ️ Pin"
                                onClick={() => handlePinDiv(v.threadId, v.recp.igId)}
                                className={styles[moreSettingClassName]}>
                                <svg
                                  className={styles.dragicon}
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 36 36">
                                  <path d="M26.56 3.83a9.3 9.3 0 0 1 5.61 5.6c.16.45.35.97.42 1.43.08.55.03 1.06-.18 1.63-.43 1.21-1.41 1.75-2.5 2.35l-2.12 1.19c-.77.43-1.28.71-1.64.96s-.45.38-.5.46c-.01.05-.08.25-.06.93.01.63.1 1.5.21 2.72a9 9 0 0 1-1.27 5.76c-.2.3-.44.7-.71.98q-.47.51-1.16.78-.7.29-1.4.25c-.4-.02-.86-.12-1.25-.21a17 17 0 0 1-8.04-4.63 17 17 0 0 1-4.63-8.04 8 8 0 0 1-.21-1.25 3 3 0 0 1 .25-1.4q.29-.7.78-1.16a9 9 0 0 1 6.69-2c1.25.1 2.13.19 2.78.2.32 0 .73.03.94-.08.08-.04.22-.14.46-.5.25-.35.54-.86.97-1.63l1.16-2.09c.6-1.08 1.14-2.06 2.35-2.5.57-.2 1.08-.25 1.63-.17.46.07.98.26 1.42.42" />
                                  <path
                                    opacity=".6"
                                    d="M10.96 22.92 3.8 30.06a1.5 1.5 0 1 0 2.13 2.12l7.14-7.14a19 19 0 0 1-2.12-2.12"
                                  />
                                </svg>

                                {/* Pin */}
                              </div>
                              <div
                                title="ℹ️ move to"
                                onClick={() =>
                                  handleMoveDiv(v.threadId, v.recp.igId, CategoryType.General, CategoryType.Business)
                                }
                                className={styles[moreSettingClassName]}>
                                <svg
                                  fill="none"
                                  className={styles.dragicon}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 36 36">
                                  <path
                                    opacity=".4"
                                    d="M6.65 15.98Q5.13 15.84 5 14.52v-5.2C5 4.93 11.36 4 16.44 4c5.09 0 10.18.93 10.18 5.32v1.34h-2.8V9.32c0-2.8-7.5-2.66-7.5-2.66s-8.01 0-8.01 2.66v5.2q-.13 1.32-1.66 1.46m16.53 5.6h6.1q2.05 0 2.8.4l.51.66q.51.66.38 2.8.13 3.72-.63 4.92l-.9.93q-1.13.8-4.57.67h-.89q-4.7.26-5.98-1.07c-1.27-1.33-1-2.93-1-6.39v-2.26q0-1.86.25-2.4.26-.53.9-.93.63-.4 2.28-.27l1.65.14q1.02.52 1.53 1.86l.38.93"
                                  />
                                  <path d="m21.28 10.55.51-.41.52-.14h5.78l.77.55a1.5 1.5 0 0 1 0 1.24h-.13l-2.3 3.02-.52.55-.9.27-.77-.27-.65-.55-1.02-1.24-1.29-1.65a1.5 1.5 0 0 1 0-1.23M5.86 22.36h5.65q1.94 0 2.57.41.26.15.39.55.51.7.39 2.75.12 3.3-.52 4.4l-.9.96q-.9.69-4.24.55h-.77c-3.08 0-4.5 0-5.53-.96-1.02-.97-.9-2.75-.9-5.91v-2.06q.01-1.92.26-2.34.26-.41.77-.82.52-.42 2.19-.28l1.41.14q1.04.41 1.29 1.79l.51.82" />
                                </svg>

                                {/* Move from general to business */}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              {toggleOrder === CategoryType.Business &&
                !activeHideInbox &&
                !showSearchThread.searchMode &&
                businessInbox &&
                !activeHideInbox &&
                businessInbox.threads.length === 0 && (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateText}>{t(LanguageKey.emptydirect)}</div>
                  </div>
                )}
              {toggleOrder === CategoryType.Business &&
                !activeHideInbox &&
                !showSearchThread.searchMode &&
                businessInbox &&
                !activeHideInbox &&
                businessInbox.threads.length > 0 &&
                businessInbox.threads.map((v) => (
                  <div key={v.threadId}>
                    {((activeReadState &&
                      v.items
                        .filter((item) => item.createdTime > v.ownerLastSeenUnix)
                        .sort((a, b) => a.createdTime - b.createdTime).length > 0) ||
                      !activeReadState) && (
                      <div
                        key={v.threadId}
                        onMouseDown={() => handleMouseDown()}
                        onMouseUp={() => handleMouseUp()}
                        onMouseMove={() => handleMouseMove(v.threadId)}
                        onTouchEnd={() => handleTouchEnd(v.threadId)}
                        onClick={() => handleGetBusinessChats(v)}
                        className={
                          v.threadId === userSelectedId ? styles.selectedUserbackground : styles.userbackground
                        }>
                        <div className={styles.user} style={!v.isActive ? { opacity: "0.3" } : {}}>
                          <img
                            decoding="async"
                            loading="lazy"
                            draggable={false}
                            className={styles.pictureIcon}
                            title={v.recp.name ? v.recp.name : ""}
                            alt="instagram profile picture"
                            src={basePictureUrl + v.recp.profilePic}
                            onError={(e) => {
                              e.currentTarget.src = "/no-profile.svg";
                            }}
                          />

                          <div className={styles.profile}>
                            <div className={styles.username} title={v.recp.username}>
                              {v.recp.username}
                            </div>
                            <div
                              className={getMessageDirectionClass(
                                handleLastMessage(v.items.sort((a, b) => b.createdTime - a.createdTime)[0]),
                                styles.messagetext
                              )}>
                              {handleLastMessage(v.items.sort((a, b) => b.createdTime - a.createdTime)[0])}
                            </div>
                          </div>

                          <div className={styles.notifbox} title="ℹ️ Slide to more">
                            <div className={styles.settingbox}>
                              {handleSpecifyUnread(v.items, v)}
                              {v.isPin && (
                                <svg
                                  className={styles.dragicon}
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
                              {new DateObject({
                                date: v.items[0].createdTime / 1e3,
                                calendar: initialzedTime().calendar,
                                locale: initialzedTime().locale,
                              }).format("h:MM a")}
                            </div>
                          </div>
                        </div>
                        {showMoreSettingDiv && showDivIndex === v.threadId && (
                          <>
                            <div className={styles.moresetting}>
                              <div
                                title="ℹ️ Archive"
                                onClick={() =>
                                  handleMoveDiv(v.threadId, v.recp.igId, CategoryType.Business, CategoryType.Hide)
                                }
                                className={styles[moreSettingClassName]}>
                                <svg
                                  fill="none"
                                  className={styles.dragicon}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 36 36">
                                  <path
                                    opacity=".4"
                                    d="M29.76 15.52c1.15.16 2.14.5 2.94 1.28.79.8 1.12 1.8 1.28 2.94.15 1.1.14 2.64.14 4.34l-.14 4.18a5 5 0 0 1-1.28 2.94 5 5 0 0 1-2.94 1.28c-1.1.15-2.48.15-4.18.15H10.42c-1.7 0-3.1 0-4.18-.15A5 5 0 0 1 3.3 31.2a5 5 0 0 1-1.28-2.94c-.15-1.1-.15-2.48-.15-4.18l.15-4.34A5 5 0 0 1 3.3 16.8a5 5 0 0 1 2.94-1.28c1.1-.14 2.48-.14 4.18-.14h15.16zm-16.86 6.3a1.13 1.13 0 0 0-1.57-.22 1.1 1.1 0 0 0-.23 1.57l.45.6.13.18c.75 1.01 1.36 1.8 2.23 2.24s1.87.44 3.12.44h1.94c1.25 0 2.24 0 3.12-.44s1.48-1.24 2.23-2.24l.13-.17.45-.6a1.13 1.13 0 0 0-1.8-1.35l-.45.6c-.96 1.26-1.22 1.58-1.56 1.75s-.75.2-2.34.2h-1.5c-1.6 0-2-.03-2.34-.2-.34-.16-.61-.49-1.56-1.76z"
                                  />
                                  <path d="M24.05 9.38h-12.1l-2.5.05c-.7.06-1.33.18-1.91.48a5 5 0 0 0-2.13 2.13 5 5 0 0 0-.47 1.82 9 9 0 0 1 1.05-.2c1.22-.16 2.7-.16 4.32-.16H25.7l4.32.16q.53.07 1.05.2a5 5 0 0 0-.47-1.82 5 5 0 0 0-2.13-2.13 5 5 0 0 0-1.9-.48q-1-.08-2.51-.05m-3.01-6h-6.1l-2.5.05c-.7.06-1.33.18-1.91.48A5 5 0 0 0 8.4 6.04c-.28.53-.4 1.1-.46 1.73q.7-.15 1.34-.2 1.14-.09 2.6-.07H24.1l2.6.06q.65.05 1.34.2a5 5 0 0 0-.46-1.72 5 5 0 0 0-2.13-2.13 5 5 0 0 0-1.9-.48 28 28 0 0 0-2.51-.06" />
                                </svg>

                                {/* Delete */}
                              </div>
                              <div
                                title="ℹ️ Pin"
                                onClick={() => handlePinDiv(v.threadId, v.recp.igId)}
                                className={styles[moreSettingClassName]}>
                                <svg
                                  className={styles.dragicon}
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 36 36">
                                  <path d="M26.56 3.83a9.3 9.3 0 0 1 5.61 5.6c.16.45.35.97.42 1.43.08.55.03 1.06-.18 1.63-.43 1.21-1.41 1.75-2.5 2.35l-2.12 1.19c-.77.43-1.28.71-1.64.96s-.45.38-.5.46c-.01.05-.08.25-.06.93.01.63.1 1.5.21 2.72a9 9 0 0 1-1.27 5.76c-.2.3-.44.7-.71.98q-.47.51-1.16.78-.7.29-1.4.25c-.4-.02-.86-.12-1.25-.21a17 17 0 0 1-8.04-4.63 17 17 0 0 1-4.63-8.04 8 8 0 0 1-.21-1.25 3 3 0 0 1 .25-1.4q.29-.7.78-1.16a9 9 0 0 1 6.69-2c1.25.1 2.13.19 2.78.2.32 0 .73.03.94-.08.08-.04.22-.14.46-.5.25-.35.54-.86.97-1.63l1.16-2.09c.6-1.08 1.14-2.06 2.35-2.5.57-.2 1.08-.25 1.63-.17.46.07.98.26 1.42.42" />
                                  <path
                                    opacity=".6"
                                    d="M10.96 22.92 3.8 30.06a1.5 1.5 0 1 0 2.13 2.12l7.14-7.14a19 19 0 0 1-2.12-2.12"
                                  />
                                </svg>
                                {/* Pin */}
                              </div>
                              <div
                                title="ℹ️ Move to"
                                onClick={() =>
                                  handleMoveDiv(v.threadId, v.recp.igId, CategoryType.Business, CategoryType.General)
                                }
                                className={styles[moreSettingClassName]}>
                                <svg
                                  fill="none"
                                  className={styles.dragicon}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 36 36">
                                  <path
                                    opacity=".4"
                                    d="M28.35 15.98q1.52-.14 1.65-1.46v-5.2C30 4.93 23.64 4 18.56 4c-5.09 0-10.18.93-10.18 5.32v1.34h2.8V9.32c0-2.8 7.5-2.66 7.5-2.66s8.01 0 8.01 2.66v5.2q.13 1.32 1.66 1.46m-16.53 5.6h-6.1q-2.04 0-2.8.4l-.51.66q-.51.66-.38 2.8-.13 3.72.63 4.92l.9.93q1.13.8 4.57.67h.89q4.7.26 5.98-1.07c1.27-1.33 1-2.93 1-6.39v-2.26a7 7 0 0 0-.25-2.4 2.3 2.3 0 0 0-.9-.93q-.63-.4-2.28-.27l-1.65.14q-1.02.52-1.53 1.86l-.38.93"
                                  />
                                  <path d="m13.72 10.55-.51-.41-.52-.14H6.91l-.77.55a1.5 1.5 0 0 0 0 1.24h.13l2.3 3.02.52.55.9.27.77-.27.65-.55 1.02-1.24 1.29-1.65a1.5 1.5 0 0 0 0-1.23m15.42 11.67h-5.65q-1.94 0-2.57.41-.26.15-.39.55-.51.7-.39 2.75-.12 3.3.52 4.4l.9.96q.9.69 4.24.55h.77c3.08 0 4.5 0 5.53-.96 1.02-.97.9-2.75.9-5.91v-2.06q-.01-1.92-.26-2.34a3 3 0 0 0-.77-.82q-.52-.42-2.19-.28l-1.41.14q-1.04.41-1.29 1.79l-.51.82" />
                                </svg>

                                {/* Move */}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              {showSearchThread.searchMode && !activeHideInbox && toggleOrder === CategoryType.General && (
                <>
                  {showSearchThread.loading && <RingLoader />}
                  {showSearchThread.noResult && (
                    <>
                      <div className={styles.emptylist}>
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
                    searchGeneralInbox &&
                    searchGeneralInbox.threads.length === 0 && (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyStateText}>{t(LanguageKey.emptydirect)}</div>
                      </div>
                    )}
                  {!showSearchThread.loading &&
                    !showSearchThread.noResult &&
                    searchGeneralInbox &&
                    searchGeneralInbox.threads.length > 0 &&
                    searchGeneralInbox?.threads.map(
                      (v) =>
                        ((activeReadState &&
                          v.items
                            .filter((item) => item.createdTime > v.ownerLastSeenUnix)
                            .sort((a, b) => a.createdTime - b.createdTime).length > 0) ||
                          !activeReadState) && (
                          <div
                            key={v.threadId}
                            onMouseDown={() => handleMouseDown()}
                            onMouseUp={() => handleMouseUp()}
                            onMouseMove={() => handleMouseMove(v.threadId)}
                            onTouchEnd={() => handleTouchEnd(v.threadId)}
                            onClick={() => handleSelectSearch(v, toggleOrder)}
                            className={
                              v.threadId === userSelectedId ? styles.selectedUserbackground : styles.userbackground
                            }>
                            <div className={styles.user} style={!v.isActive ? { opacity: "0.3" } : {}}>
                              <img
                                decoding="async"
                                loading="lazy"
                                draggable={false}
                                className={styles.pictureIcon}
                                title={v.recp.name!}
                                alt="instagram profile picture"
                                src={basePictureUrl + v.recp.profilePic}
                                onError={(e) => {
                                  e.currentTarget.src = "/no-profile.svg";
                                }}
                              />

                              <div className={styles.profile}>
                                <div className={styles.username} title={v.recp.username}>
                                  {v.recp.username}
                                </div>
                                <div
                                  className={getMessageDirectionClass(
                                    handleLastMessage(v.items.sort((a, b) => b.createdTime - a.createdTime)[0]),
                                    styles.messagetext
                                  )}>
                                  {handleLastMessage(v.items.sort((a, b) => b.createdTime - a.createdTime)[0])}
                                </div>
                              </div>
                              <div className={styles.notifbox} title="ℹ️ Slide to more">
                                {handleSpecifyUnread(v.items, v)}
                                <div className={styles.chattime}>
                                  {new DateObject({
                                    date: v.items[0].createdTime / 1e3,
                                    calendar: initialzedTime().calendar,
                                    locale: initialzedTime().locale,
                                  }).format("h:mm a")}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                    )}
                </>
              )}
              {showSearchThread.searchMode && !activeHideInbox && toggleOrder === CategoryType.Business && (
                <>
                  {showSearchThread.loading && <RingLoader />}
                  {showSearchThread.noResult && (
                    <>
                      <div className={styles.emptylist}>
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
                    searchBusinessInbox &&
                    searchBusinessInbox.threads.length === 0 && (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyStateText}>{t(LanguageKey.emptydirect)}</div>
                      </div>
                    )}
                  {!showSearchThread.loading &&
                    !showSearchThread.noResult &&
                    searchBusinessInbox &&
                    searchBusinessInbox.threads.length > 0 &&
                    searchBusinessInbox?.threads.map(
                      (v) =>
                        ((activeReadState &&
                          v.items
                            .filter((item) => item.createdTime > v.ownerLastSeenUnix)
                            .sort((a, b) => a.createdTime - b.createdTime).length > 0) ||
                          !activeReadState) && (
                          <div
                            key={v.threadId}
                            onMouseDown={() => handleMouseDown()}
                            onMouseUp={() => handleMouseUp()}
                            onMouseMove={() => handleMouseMove(v.threadId)}
                            onTouchEnd={() => handleTouchEnd(v.threadId)}
                            onClick={() => handleSelectSearch(v, toggleOrder)}
                            className={
                              v.threadId === userSelectedId ? styles.selectedUserbackground : styles.userbackground
                            }>
                            <div className={styles.user} style={!v.isActive ? { opacity: "0.3" } : {}}>
                              <img
                                decoding="async"
                                loading="lazy"
                                draggable={false}
                                className={styles.pictureIcon}
                                title={v.recp.username}
                                alt="instagram profile picture"
                                src={basePictureUrl + v.recp.profilePic}
                                onError={(e) => {
                                  e.currentTarget.src = "/no-profile.svg";
                                }}
                              />

                              <div className={styles.profile}>
                                <div className={styles.username} title={v.recp.username}>
                                  {v.recp.username}
                                </div>
                                <div className={getMessageDirectionClass(v.items[0].text, styles.messagetext)}>
                                  {v.items[0].text}
                                </div>
                              </div>
                              <div className={styles.notifbox} title="ℹ️ Slide to more">
                                <div className={styles.chattime}>
                                  {new DateObject({
                                    date: v.items[0].createdTime / 1e3,
                                    calendar: initialzedTime().calendar,
                                    locale: initialzedTime().locale,
                                  }).format("h:mm a")}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                    )}
                </>
              )}
              {activeHideInbox && !showSearchThread.searchMode && (
                <>
                  {hideInbox && hideInbox.threads.length === 0 && (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyStateText}>{t(LanguageKey.emptydirect)}</div>
                    </div>
                  )}
                  {hideInbox &&
                    hideInbox.threads.length > 0 &&
                    hideInbox.threads.map(
                      (v) =>
                        ((activeReadState &&
                          v.items
                            .filter((item) => item.createdTime > v.ownerLastSeenUnix)
                            .sort((a, b) => a.createdTime - b.createdTime).length > 0) ||
                          !activeReadState) && (
                          <div
                            key={v.threadId}
                            onMouseDown={() => handleMouseDown()}
                            onMouseUp={() => handleMouseUp()}
                            onMouseMove={() => handleMouseMove(v.threadId)}
                            onTouchEnd={() => handleTouchEnd(v.threadId)}
                            className={
                              v.threadId === userSelectedId ? styles.selectedUserbackground : styles.userbackground
                            }>
                            <div className={styles.user} style={!v.isActive ? { opacity: "0.3" } : {}}>
                              <img
                                decoding="async"
                                loading="lazy"
                                draggable={false}
                                className={styles.pictureIcon}
                                title={v.recp.username}
                                alt="instagram profile picture"
                                src={basePictureUrl + v.recp.profilePic}
                                onError={(e) => {
                                  e.currentTarget.src = "/no-profile.svg";
                                }}
                              />

                              <div className={styles.profile}>
                                <div className={styles.username} title={v.recp.username}>
                                  {v.recp.username}
                                </div>
                                <div className={getMessageDirectionClass(v.items[0].text, styles.messagetext)}>
                                  {v.items[0].text}
                                </div>
                              </div>
                              <div className={styles.notifbox} title="ℹ️ Slide to more">
                                {handleSpecifyUnread(v.items, v)}
                                <div className={styles.chattime}>
                                  {new DateObject({
                                    date: v.items[0].createdTime / 1e3,
                                    calendar: initialzedTime().calendar,
                                    locale: initialzedTime().locale,
                                  }).format("h:mm a")}
                                </div>
                              </div>
                            </div>
                            {showMoreSettingDiv && showDivIndex === v.threadId && (
                              <>
                                <div className={styles.moresetting}>
                                  <div
                                    title="ℹ️ Unarchive"
                                    onClick={() =>
                                      handleMoveDiv(v.threadId, v.recp.igId, CategoryType.Hide, CategoryType.General)
                                    }
                                    className={styles[moreSettingClassName]}>
                                    <svg
                                      fill="none"
                                      className={styles.dragicon}
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 25 25">
                                      <path
                                        opacity=".4"
                                        d="M19.7 11c.71 0 1.3-.49 1.3-1.1V6c0-3.33-4.99-4-8.95-4C8.08 2 4 2.74 4 6.07l.02.93h2.21V6c0-2.11 5.82-1.96 5.82-1.96s6.34-.15 6.34 1.96v3.9c0 .6.58 1.1 1.3 1.1"
                                      />
                                      <path d="M7.91 7.44a1 1 0 0 0-.28-.32A1 1 0 0 0 7.24 7h-4.5a.8.8 0 0 0-.67.44.9.9 0 0 0 .07.83v.01l.02.03.05.08a19 19 0 0 0 1.68 2.03q.21.2.45.36c.13.09.37.22.65.22s.52-.13.65-.22q.24-.16.45-.36c.27-.26.56-.59.81-.9q.48-.6.92-1.22l.02-.02c.17-.25.2-.57.07-.84" />
                                      <path
                                        opacity=".4"
                                        d="m22.1 16 1.4.06q.6.08 1.01.52.38.48.44 1.19c.05.44.05 1.07.05 1.76l-.05 1.7q-.05.68-.44 1.2-.42.43-1 .51-.55.07-1.42.06h-5.17q-.87 0-1.43-.06a1.6 1.6 0 0 1-1-.52 2.5 2.5 0 0 1-.44-1.2q-.06-.67-.05-1.68l.05-1.77q.05-.68.44-1.2.43-.45 1-.51.58-.07 1.43-.06z"
                                      />
                                      <path d="M17.16 19.08a.4.4 0 0 1 .3-.08.4.4 0 0 1 .25.15l.16.23c.34.5.43.61.55.68.13.06.26.07.83.07h.52c.56 0 .7 0 .83-.07.12-.08.2-.18.54-.67l.15-.22a.4.4 0 0 1 .52-.05q.14.08.18.25t-.05.3l-.16.23-.05.07c-.27.38-.48.7-.8.86-.3.17-.65.17-1.08.17h-.68c-.45 0-.8 0-1.1-.17-.32-.16-.53-.47-.8-.86l-.03-.07-.16-.22a.45.45 0 0 1 .08-.6M21.58 14h-4.16l-.86.03q-.37.02-.66.2-.41.26-.65.69t-.25.93l.36-.08q.64-.09 1.5-.07h5.29l1.49.07q.2.02.36.08-.01-.5-.25-.93a2 2 0 0 0-.65-.69q-.3-.2-.64-.2zm-1.03-2h-2.98q-.36.05-.65.2-.4.26-.65.67-.23.42-.25.91l.46-.08.9-.03h4.2q.52 0 .9.03l.47.08q-.03-.48-.26-.91-.24-.42-.64-.67-.3-.18-.65-.19z" />
                                      <path
                                        opacity=".4"
                                        d="M3.3 15.22h4.82c1.15 0 1.73 0 2.14.28q.28.18.46.47c.28.42.28 1 .28 2.17 0 1.95 0 2.93-.46 3.63q-.3.45-.77.76c-.68.47-1.65.47-3.59.47H5.5c-2.6 0-3.9 0-4.7-.81S0 20.07 0 17.44v-1.7c0-1 0-1.5.2-1.88q.24-.4.65-.65c.37-.21.88-.21 1.87-.21.63 0 .95 0 1.24.11.64.23.9.82 1.19 1.41l.35.7"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )
                    )}
                </>
              )}
              {activeHideInbox && showSearchThread.searchMode && (
                <>
                  {showSearchThread.loading && <RingLoader />}
                  {showSearchThread.noResult && (
                    <>
                      <div className={styles.emptylist}>
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
                    searchHideInbox &&
                    searchHideInbox.threads.length === 0 && (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyStateText}>{t(LanguageKey.emptydirect)}</div>
                      </div>
                    )}
                  {!showSearchThread.loading &&
                    !showSearchThread.noResult &&
                    searchHideInbox &&
                    searchHideInbox.threads.length > 0 &&
                    searchHideInbox &&
                    searchHideInbox.threads.map(
                      (v) =>
                        ((activeReadState &&
                          v.items
                            .filter((item) => item.createdTime > v.ownerLastSeenUnix)
                            .sort((a, b) => a.createdTime - b.createdTime).length > 0) ||
                          !activeReadState) && (
                          <div
                            key={v.threadId}
                            onMouseDown={() => handleMouseDown()}
                            onMouseUp={() => handleMouseUp()}
                            onMouseMove={() => handleMouseMove(v.threadId)}
                            onTouchEnd={() => handleTouchEnd(v.threadId)}
                            className={
                              v.threadId === userSelectedId ? styles.selectedUserbackground : styles.userbackground
                            }>
                            <div key={v.threadId} className={styles.user} style={!v.isActive ? { opacity: "0.3" } : {}}>
                              <img
                                decoding="async"
                                loading="lazy"
                                draggable={false}
                                className={styles.pictureIcon}
                                title={v.recp.username}
                                alt="instagram profile picture"
                                src={basePictureUrl + v.recp.profilePic}
                                onError={(e) => {
                                  e.currentTarget.src = "/no-profile.svg";
                                }}
                              />

                              <div className={styles.profile}>
                                <div className={styles.username} title={v.recp.username}>
                                  {v.recp.username}
                                </div>
                                <div className={getMessageDirectionClass(v.items[0].text, styles.messagetext)}>
                                  {v.items[0].text}
                                </div>
                              </div>
                              <div className={styles.notifbox} title="ℹ️ Slide to more">
                                {handleSpecifyUnread(v.items, v)}
                                <div className={styles.chattime}>
                                  {new DateObject({
                                    date: v.items[0].createdTime / 1e3,
                                    calendar: initialzedTime().calendar,
                                    locale: initialzedTime().locale,
                                  }).format("h:mm a")}
                                </div>
                              </div>
                            </div>
                            {showMoreSettingDiv && showDivIndex === v.threadId && (
                              <>
                                <div className={styles.moresetting}>
                                  <div
                                    title="ℹ️ Unarchive"
                                    onClick={() =>
                                      handleMoveDiv(v.threadId, v.recp.igId, CategoryType.Hide, CategoryType.General)
                                    }
                                    className={styles[moreSettingClassName]}>
                                    <svg
                                      className={styles.dragicon}
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 36 36">
                                      <path
                                        opacity=".4"
                                        d="M29.8 15.5a5 5 0 0 1 2.9 1.3 5 5 0 0 1 1.3 3V24l-.1 4.2a5 5 0 0 1-1.3 2.9 5 5 0 0 1-3 1.3l-4.1.1H10.4l-4.2-.1a5 5 0 0 1-2.9-1.3 5 5 0 0 1-1.3-3v-3.9l.1-4.4a5 5 0 0 1 1.3-2.9 5 5 0 0 1 3-1.3l4.1-.1h15.2zm-16.9 6.3a1 1 0 0 0-1.6-.2 1 1 0 0 0-.2 1.6l.5.6v.2q1 1.6 2.3 2.2c1.3.6 1.9.4 3.1.4h2q1.8.1 3-.4c1.3-.5 1.6-1.2 2.3-2.2l.2-.2.4-.6a1.1 1.1 0 0 0-1.8-1.4l-.4.6c-1 1.3-1.3 1.6-1.6 1.8s-.8.2-2.3.2h-1.5c-1.6 0-2 0-2.4-.2s-.6-.5-1.5-1.8z"
                                      />
                                      <path d="M24 9.4H9.6a5 5 0 0 0-2 .5 5 5 0 0 0-2 2.1 5 5 0 0 0-.6 1.9l1-.2q2-.2 4.4-.2h15.4l4.3.2 1 .2-.4-1.9a5 5 0 0 0-2.1-2 5 5 0 0 0-2-.6zm-3-6h-8.6a5 5 0 0 0-2 .5 5 5 0 0 0-2 2.1q-.4.8-.5 1.8l1.4-.2 2.6-.1h14.8l1.3.3-.4-1.8a5 5 0 0 0-2.1-2 5 5 0 0 0-2-.6z" />
                                    </svg>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )
                    )}
                </>
              )}

              {/* Empty state message */}
              {isLoadingMore && (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <DotLoaders />
                </div>
              )}
            </div>
          </div>
          {/* ___right ___*/}
          {userSelectedId &&
            ((toggleOrder === CategoryType.General && generalInbox) ||
              (toggleOrder === CategoryType.Business && businessInbox)) && (
              <div className={styles.right} style={{ display: displayRight }}>
                <DirectChatBox
                  userSelectId={userSelectedId}
                  chatBox={handleSpecifyChatBox()!}
                  ownerInbox={
                    toggleOrder === CategoryType.General ? generalInbox!.ownerInbox : businessInbox!.ownerInbox
                  }
                  hub={ws}
                  showUserList={showUserList}
                  fetchItemData={fetchItemData}
                  sendingMessages={sendingMessages.filter((x) => x.threadId === userSelectedId)}
                  handleSendMessage={handleSendMessage}
                  onImageClick={handleImageClick}
                  onImageContainerClick={(info: { url: string; height: number; width: number }) => {
                    mediaModal.openImage(info.url, info.width, info.height);
                  }}
                  onVideoContainerClick={(info: { url: string; height: number; width: number; isExpired: boolean }) => {
                    mediaModal.openVideo(info.url, info.width, info.height, info.isExpired);
                  }}
                  onSendFile={handleSendFile}
                  onSendVideoFile={handleSendVideoFile}
                />
              </div>
            )}
          {!userSelectedId && (
            <div className={styles.disableRight} style={{ display: displayRight }}>
              <img
                draggable={false}
                className={styles.disableRightimage}
                alt="instagram profile picture"
                src="/disableright.svg"
              />

              {t(LanguageKey.Welcometodirectmessages)}
            </div>
          )}
        </div>
      )}
      {/* Modal Components */}
      <MediaModal isOpen={mediaModal.isOpen} media={mediaModal.media} onClose={mediaModal.close} />

      <Modal closePopup={handleClosePopup} classNamePopup={"popupProfile"} showContent={showPopup}>
        <img
          style={{ width: "35px", cursor: "pointer" }}
          onClick={handleClosePopup}
          title="ℹ️ close"
          src="/close-box.svg"
        />
        <img className={styles.pictureprofile} loading="lazy" decoding="async" src={popupImage} alt="Popup profile" />
      </Modal>

      <Modal
        closePopup={() => setShowSendFile(false)}
        classNamePopup={"popupSendFile"}
        showContent={showSendFile && fileContent !== null}>
        {fileContent && (
          <SendFile removeMask={() => setShowSendFile(false)} data={fileContent} send={handleSendImage} />
        )}
      </Modal>

      <Modal
        closePopup={() => setShowSendVideoFile(false)}
        classNamePopup={"popupSendFile"}
        showContent={showSendVideoFile && fileContent !== null}>
        {fileContent && (
          <SendVideoFile removeMask={() => setShowSendVideoFile(false)} data={fileContent} send={handleSendVideo} />
        )}
      </Modal>
    </>
  );
};

export default DirectInbox;
