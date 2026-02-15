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
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import NotAllowed from "saeed/components/notOk/notAllowed";
import { LoginStatus, RoleAccess } from "saeed/helper/loadingStatus";
import initialzedTime from "saeed/helper/manageTimer";
import { handleDecompress } from "saeed/helper/pako";
import { useInfiniteScroll } from "saeed/helper/useInfiniteScroll";
import { LanguageKey } from "saeed/i18n";
import { PartnerRole } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { MethodType, UploadFile } from "saeed/helper/apihelper";
import { ItemType, MediaType, StatusReplied, TicketType } from "saeed/models/messages/enum";
import {
  IFbTicketInfo,
  IGetDirectInbox,
  IIsSendingMessage,
  IReplyTicket,
  IReplyTicket_Media,
  IReplyTicket_Media_Server,
  IThread_Ticket,
  ITicketInbox,
} from "saeed/models/messages/IMessage";
import {
  ISendTicketMessage,
  ITicket,
  ITicketMediaType,
  IUserPanelMessage,
  IItem as userItem,
} from "saeed/models/userPanel/message";
import SendFile from "../popups/sendFile";
import SendVideoFile from "../popups/sendVideoFile";
import { MediaModal, useMediaModal } from "../shared/utils";
import DirectChatBox from "./directChatBox";
import SystemChatBox from "./systemChatBox";
import styles from "./ticketInbox.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
let firstTime = 0;
let touchMove = 0;
let touchStart = 0;
let firstPos = { x: 0, y: 0 };
let downFlagLeft = false;
let downFlagRight = false;
let hideDivIndex: string | number | null = null;
let constUserSelected: string | null = null;
const TicketInbox = () => {
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
  const [fbInbox, setFbInbox] = useState<ITicketInbox>();
  const refFbInbox = useRef(fbInbox);
  useEffect(() => {
    refFbInbox.current = fbInbox;
  }, [fbInbox]);
  const [searchFbInbox, setSearchFbInbox] = useState<ITicketInbox>();
  const [searchSystemInbox, setSearchBusinessInbox] = useState<IUserPanelMessage>();
  const fbResInbox = useRef(fbInbox);
  const [systemInbox, setSystemInbox] = useState<IUserPanelMessage>();
  const [hideInbox, setHideInbox] = useState<ITicketInbox>();
  const [hideSystemInbox, setHideSystemInbox] = useState<IUserPanelMessage>();
  const refHideInbox = useRef(hideInbox);
  const refHideSystemInbox = useRef(hideSystemInbox);
  useEffect(() => {
    refHideInbox.current = hideInbox;
  }, [hideInbox]);
  useEffect(() => {
    refHideSystemInbox.current = hideSystemInbox;
  }, [hideSystemInbox]);
  const [searchHideInbox, setSearchHideInbox] = useState<ITicketInbox>();
  const [searchHideSystemInbox, setSearchHideSystemInbox] = useState<IUserPanelMessage>();
  const sInbox = useRef(systemInbox);
  useEffect(() => {
    fbResInbox.current = fbInbox;
  }, [fbInbox]);
  useEffect(() => {
    sInbox.current = systemInbox;
  }, [systemInbox]);
  const [loading, setLoading] = useState(LoginStatus(session) && RoleAccess(session, PartnerRole.SystemTicket));
  const [searchbox, setSearchbox] = useState("");
  const [toggleOrder, setToggleOrder] = useState<TicketType>(TicketType.Direct);
  const [userSelectedId, setUserSelectedId] = useState<number | null>(null);
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
  const [showDivIndex, setShowDivIndex] = useState<string | number | null>(null);
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
  const [sendingMessages, setSendingMessages] = useState<ISendTicketMessage[]>([]);
  const [replyItems, setReplyItems] = useState<IReplyTicket[]>([]);
  const [tempThreadIds, setTempThreadIds] = useState<{ threadId: string | number; toggle: TicketType }[]>([]);
  const refTempThread = useRef(tempThreadIds);
  // const [ticketId, setTicketId] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  // استفاده از useInfiniteScroll برای FB/Direct tickets
  const { isLoadingMore: isLoadingMoreFb } = useInfiniteScroll<any>({
    hasMore: !!fbInbox?.nextMaxId && !showSearchThread.searchMode,
    fetchMore: async () => {
      if (fbInbox?.nextMaxId) {
        await fetchData(TicketType.Direct, fbInbox.nextMaxId, null);
      }
      return [];
    },
    onDataFetched: () => {},
    getItemId: (thread) => thread.threadId,
    currentData: fbInbox?.threads || [],
    threshold: 100,
    useContainerScroll: true,
    reverseScroll: false,
    fetchDelay: 300,
    enableAutoLoad: false,
    enabled: toggleOrder === TicketType.Direct,
    containerRef: userListRef,
  });

  // استفاده از useInfiniteScroll برای System tickets
  const { isLoadingMore: isLoadingMoreSystem } = useInfiniteScroll<any>({
    hasMore: !!systemInbox?.nextMaxId && !showSearchThread.searchMode,
    fetchMore: async () => {
      if (systemInbox?.nextMaxId) {
        await fetchData(TicketType.InSys, systemInbox.nextMaxId, null);
      }
      return [];
    },
    onDataFetched: () => {},
    getItemId: (ticket) => ticket.ticketId,
    currentData: systemInbox?.tickets || [],
    threshold: 100,
    useContainerScroll: true,
    reverseScroll: false,
    fetchDelay: 300,
    enableAutoLoad: false,
    enabled: toggleOrder === TicketType.InSys,
    containerRef: userListRef,
  });

  const isLoadingMore = toggleOrder === TicketType.Direct ? isLoadingMoreFb : isLoadingMoreSystem;

  // استفاده از هوک جدید MediaModal
  const mediaModal = useMediaModal();

  // Modal state variables
  const [showPopup, setShowPopup] = useState(false);
  const [popupImage, setPopupImage] = useState("");
  const [showSendFile, setShowSendFile] = useState<boolean>(false);
  const [showSendVideoFile, setShowSendVideoFile] = useState<boolean>(false);
  const [fileContent, setFileContent] = useState<{
    file: File;
    threadId: string;
    igid: string;
  } | null>(null);
  const handleGetGeneralChats = async (thread: IThread_Ticket) => {
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

      if (thread.ticketId === userSelectedId) return;
      setUserSelectedId(thread.ticketId);
    }
  };
  const handleMouseMove = (index: string | number) => {
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
  const handleTouchEnd = (index: string | number) => {
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
  const handlePinDiv = async (threadId?: string, recpId?: string, ticketId?: number) => {
    setShowDivIndex(null);
    setShowMoreSettingDiv(false);
    var gThread = fbInbox?.threads.find((x) => x.threadId === threadId);
    var sTicket = systemInbox?.tickets.find((x) => x.ticketId === ticketId);
    if (gThread) {
      try {
        let gRes = await clientFetchApi<boolean, boolean>("Instagramer" + "/Message/PinThread", { methodType: MethodType.get, session: session, data: null, queries: [
            { key: "recpId", value: recpId },
            { key: "isPin", value: (!gThread.isPin).toString() },
          ], onUploadProgress: undefined });
        if (gRes.succeeded) {
          setFbInbox((prev) => ({
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
    if (sTicket) {
      try {
        let bRes = await clientFetchApi<boolean, boolean>("/api/ticket/UpdateSystemTicketPinStatus", { methodType: MethodType.get, session: session, data: null, queries: [
            { key: "ticketId", value: ticketId?.toString() },
            { key: "isPin", value: (!sTicket.isPin).toString() },
          ], onUploadProgress: undefined });
        if (bRes.succeeded) {
          setSystemInbox((prev) => ({
            ...prev!,
            tickets: prev!.tickets
              .map((x) => (x.ticketId !== sTicket?.ticketId ? x : { ...x, isPin: !x.isPin }))
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
  const handleGetTicketChats = async (ticket: ITicket) => {
    constUserSelected = null;
    let newTime = new Date().getTime();
    if (newTime - firstTime <= 110) {
      //  console.log("First click");
      if (ticket.ticketId === showDivIndex) {
        setMoreSettingClassName("hideDiv");
        setTimeout(() => {
          hideDivIndex = ticket.ticketId;
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
      if (ticket.ticketId === userSelectedId) return;

      setUserSelectedId(ticket.ticketId);
    }
  };
  const handleToggleChange = (order: TicketType) => {
    const container = userListRef.current;
    if (container) {
      container.scrollTop = 0;
    }
    setUserSelectedId(null);
    hideDivIndex = null;
    setToggleOrder(order);
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

  // SendFile handlers
  const handleSendFile = (sendFile: { file: File; threadId: string; igid: string }) => {
    setFileContent(sendFile);
    setShowSendFile(true);
  };
  const handleSendVideoFile = (sendVideo: { file: File; threadId: string; igid: string }) => {
    setFileContent(sendVideo);
    setShowSendVideoFile(true);
  };
  const handleSendImage = async (sendImage: IIsSendingMessage) => {
    if (userSelectedId && toggleOrder === TicketType.InSys) {
      const systemTicket = handleSpecifySystemTicketBox();
      if (systemTicket) {
        await handleSendTicketMessage({
          itemType: ITicketMediaType.Image,
          text: null,
          ticketId: systemTicket.ticketId,
          imageBase64: sendImage.imageBase64 || "",
          file: fileContent?.file || null,
          clientContext: crypto.randomUUID(),
        });
      }
    } else if (userSelectedId && toggleOrder === TicketType.Direct) {
      handlePendingReplies(userSelectedId, {
        itemType: ItemType.Media,
        mediaBase64: sendImage.imageBase64 || "",
        mediaId: sendImage.imageUrl || "",
        mediaType: MediaType.Image,
        text: null,
      });
    }
    setShowSendFile(false);
    setFileContent(null);
  };
  const handleSendVideo = async (sendVideo: IIsSendingMessage) => {
    // Handle send video logic here - this would need to be connected to the actual send message logic
    console.log("Sending video:", sendVideo);
    if (userSelectedId) {
      handlePendingReplies(userSelectedId, {
        itemType: ItemType.Media,
        mediaBase64: sendVideo.imageBase64 || "",
        mediaId: sendVideo.imageUrl || "",
        mediaType: MediaType.Video,
        text: null,
      });
    }
    setShowSendVideoFile(false);
    setFileContent(null);
  };
  const handleResize = () => {
    if (typeof window !== undefined) {
      var width = window.innerWidth;
      if (width < 800 && userSelectedId) {
        // console.log(chatBox);
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

  // Helper function to remove duplicate threads based on threadId
  const removeDuplicateThreads = (threads: IThread_Ticket[]) => {
    const seen = new Set<string>();
    return threads.filter((thread) => {
      if (seen.has(thread.threadId)) {
        return false;
      }
      seen.add(thread.threadId);
      return true;
    });
  };

  // Helper function to remove duplicate tickets based on ticketId
  const removeDuplicateTickets = (tickets: ITicket[]) => {
    const seen = new Set<number>();
    return tickets.filter((ticket) => {
      if (seen.has(ticket.ticketId)) {
        return false;
      }
      seen.add(ticket.ticketId);
      return true;
    });
  };

  // Helper function to remove duplicate items based on itemId
  const removeDuplicateItems = (items: userItem[] | any[]) => {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.itemId)) {
        return false;
      }
      seen.add(item.itemId);
      return true;
    });
  };

  const fetchData = async (ticketType: TicketType, oldestCursor: string | null, query: string | null) => {
    if (ticketType === TicketType.Direct && !activeHideInbox) {
      // console.log(oldestCursor);
      var generalDirectInbox: IFbTicketInfo = {
        oldCursor: oldestCursor,
        searchTerm: query ? query : null,
        isHidden: false,
      };
      try {
        let fbRes = await clientFetchApi<IFbTicketInfo, ITicketInbox>("Instagramer" + "/Ticket/GetFbInbox", { methodType: MethodType.post, session: session, data: generalDirectInbox, queries: undefined, onUploadProgress: undefined });
        console.log("not hides Fb inboxxxxxxxxxxxxxxxxxxx", fbRes);
        if (fbRes.succeeded && !query) {
          setFbInbox((prev) => ({
            ...prev!,
            nextMaxId: fbRes.value.nextMaxId,
            threads: removeDuplicateThreads([...prev!.threads, ...fbRes.value.threads]),
          }));
        } else if (fbRes.succeeded && query) {
          if (fbRes.value.threads.length > 0) {
            setSearchFbInbox(fbRes.value);
            setShowSearchThread((prev) => ({ ...prev, loading: false }));
          } else
            setShowSearchThread((prev) => ({
              ...prev,
              loading: false,
              noResult: true,
            }));
        } else if (!fbRes.succeeded) {
          setShowSearchThread((prev) => ({
            ...prev,
            loading: false,
            noResult: true,
          }));
          notify(fbRes.info.responseType, NotifType.Warning);
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    } else if (ticketType === TicketType.InSys && !activeHideInbox) {
      try {
        let sTicket = await clientFetchApi<boolean, IUserPanelMessage>("/api/ticket/GetSystemInbox", { methodType: MethodType.get, session: session, data: null, queries: [
            { key: "query", value: query ? query : undefined },
            {
              key: "nextMaxId",
              value: oldestCursor ? oldestCursor : undefined,
            },
            { key: "isHide", value: "false" },
          ], onUploadProgress: undefined });
        console.log("businessRes ", sTicket.value);
        if (sTicket.succeeded && !query) {
          setSystemInbox((prev) => ({
            ...prev!,
            nextMaxId: sTicket.value.nextMaxId,
            tickets: removeDuplicateTickets([...prev!.tickets, ...sTicket.value.tickets]),
          }));
        } else if (sTicket.succeeded && query) {
          if (sTicket.value.tickets.length > 0) {
            setSearchBusinessInbox(sTicket.value);
            setShowSearchThread((prev) => ({ ...prev, loading: false }));
          } else
            setShowSearchThread((prev) => ({
              ...prev,
              loading: false,
              noResult: true,
            }));
        } else if (!sTicket.succeeded) {
          setShowSearchThread((prev) => ({
            ...prev,
            loading: false,
            noResult: true,
          }));
          notify(sTicket.info.responseType, NotifType.Warning);
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    } else if (ticketType === TicketType.Direct && activeHideInbox) {
      var generalDirectInbox: IFbTicketInfo = {
        oldCursor: oldestCursor,
        searchTerm: query ? query : null,
        isHidden: true,
      };
      try {
        let hideFb = await clientFetchApi<IFbTicketInfo, ITicketInbox>("Instagramer" + "/Ticket/GetFbInbox", { methodType: MethodType.post, session: session, data: generalDirectInbox, queries: undefined, onUploadProgress: undefined });
        console.log("Hide Fb inboxxxxxxxxxxxxxxxxxxx ", hideFb.value);
        if (hideFb.succeeded && !query) {
          setHideInbox((prev) => ({
            ...prev!,
            nextMaxId: hideFb.value.nextMaxId,
            threads: removeDuplicateThreads([...prev!.threads, ...hideFb.value.threads]),
          }));
        } else if (hideFb.succeeded && query) {
          if (hideFb.value.threads.length > 0) {
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
    } else if (ticketType === TicketType.InSys && activeHideInbox) {
      try {
        let hideSys = await clientFetchApi<boolean, IUserPanelMessage>("/api/ticket/GetSystemInbox", { methodType: MethodType.get, session: session, data: null, queries: [
            { key: "query", value: query ? query : undefined },
            {
              key: "nextMaxId",
              value: oldestCursor ? oldestCursor : undefined,
            },
            { key: "isHide", value: "true" },
          ], onUploadProgress: undefined });
        console.log("Hide Fb inboxxxxxxxxxxxxxxxxxxx ", hideSys.value);
        if (hideSys.succeeded && !query) {
          setHideSystemInbox((prev) => ({
            ...prev!,
            nextMaxId: hideSys.value.nextMaxId,
            tickets: removeDuplicateTickets([...prev!.tickets, ...hideSys.value.tickets]),
          }));
        } else if (hideSys.succeeded && query) {
          if (hideSys.value.tickets.length > 0) {
            setSearchHideSystemInbox(hideSys.value);
            setShowSearchThread((prev) => ({ ...prev, loading: false }));
          } else
            setShowSearchThread((prev) => ({
              ...prev,
              loading: false,
              noResult: true,
            }));
        } else if (!hideSys.succeeded) {
          setShowSearchThread((prev) => ({
            ...prev,
            loading: false,
            noResult: true,
          }));
          notify(hideSys.info.responseType, NotifType.Warning);
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    }
  };
  async function fetchSystemTicket() {
    try {
      let inSysRes = await clientFetchApi<boolean, IUserPanelMessage>("/api/ticket/GetSystemInbox", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "isHide", value: "false" }], onUploadProgress: undefined });
      console.log("GetSystemInboxxxxxxxxxxxxxxx", inSysRes.value);
      if (inSysRes.succeeded) {
        setSystemInbox(inSysRes.value);
        if (router.isReady && query.id !== undefined && query.type !== undefined) {
          var ticketId = query.id as string;
          var type = query.type as string;
          if (ticketId && type === "systemTicket") {
            var oldSys = inSysRes.value.tickets.find((x) => x.ticketId === parseInt(ticketId));
            console.log("oldGeneral", oldSys);
            if (oldSys) {
              setToggleOrder(TicketType.InSys);
              setUserSelectedId(parseInt(ticketId));
            }
          }
        }
      } else notify(inSysRes.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Warning);
    }
  }
  async function fetchHideSystemTicket() {
    try {
      let inSysRes = await clientFetchApi<boolean, IUserPanelMessage>("/api/ticket/GetSystemInbox", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "isHide", value: "true" }], onUploadProgress: undefined });
      console.log("GetSystemInboxxxxxxxxxxxxxxxHideeeeeeeeee", inSysRes.value);
      if (inSysRes.succeeded) {
        setHideSystemInbox(inSysRes.value);
      } else notify(inSysRes.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Warning);
    }
  }
  const fetchFbTicket = async () => {
    var fbTicket: IFbTicketInfo = {
      oldCursor: null,
      searchTerm: null,
      isHidden: false,
    };
    try {
      let fbRes = await clientFetchApi<IFbTicketInfo, ITicketInbox>("/api/ticket/GetFbInbox", { methodType: MethodType.post, session: session, data: fbTicket, queries: undefined, onUploadProgress: undefined });
      if (fbRes.succeeded) {
        setFbInbox(fbRes.value);
        if (router.isReady && query.ticketId !== undefined) {
          var threadIdRouter = query.ticketId as string;
          var isFb = query.isFb as string;
          if (threadIdRouter && isFb === "true") {
            var oldGeneral = fbRes.value.threads.find((x) => x.ticketId === parseInt(threadIdRouter));
            console.log("oldGeneral", oldGeneral);
            if (oldGeneral) {
              setToggleOrder(TicketType.Direct);
              setUserSelectedId(parseInt(threadIdRouter));
            }
          }
        }
        console.log("fbRes.value ", fbRes.value);
      } else notify(fbRes.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
    await handleSignalR();
  };
  async function fetchHides() {
    var businessDirectInbox: IFbTicketInfo = {
      isHidden: true,
      oldCursor: null,
      searchTerm: null,
    };
    try {
      let res = await clientFetchApi<IFbTicketInfo, ITicketInbox>("Instagramer" + "/Ticket/GetFbInbox", { methodType: MethodType.post, session: session, data: businessDirectInbox, queries: undefined, onUploadProgress: undefined });
      console.log(" ✅ Console ⋙ Hide", res.value);
      if (res.succeeded) setHideInbox(res.value);
      else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Warning);
    }
  }
  const fetchItemData = async (chatBox: IThread_Ticket) => {
    console.log("oldestCursor", chatBox.nextMaxId);
    if (onLoading) return;
    onLoading = true;
    try {
      let res = await clientFetchApi<boolean, IThread_Ticket>("Instagramer" + "/Ticket/GetFbTicket", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "ticketId", value: chatBox.ticketId.toString() },
          {
            key: "nextMaxId",
            value: !chatBox.onCurrentSnapShot ? undefined : chatBox.nextMaxId!.toString(),
          },
        ], onUploadProgress: undefined });
      if (res.succeeded) {
        setFbInbox((prev) => ({
          ...prev!,
          threads: prev!.threads.map((x) =>
            x.threadId !== res.value.threadId
              ? x
              : {
                  ...x,
                  items: removeDuplicateItems([...x.items, ...res.value.items]),
                  nextMaxId: res.value.nextMaxId,
                }
          ),
        }));
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
    setTimeout(() => {
      onLoading = false;
    }, 500);

    // console.log("newThread", newThread);1
  };
  async function handleSendTicketMessage(message: ISendTicketMessage) {
    console.log("IIsSendingMessage", message);
    setSendingMessages((prev) => [...prev, message]);
    var uploadId = "";
    if (message.itemType === ITicketMediaType.Image) {
      const res = await UploadFile(session, message.file!);
      uploadId = res.fileName;
    }
    try {
      const res = await clientFetchApi<ISendTicketMessage, userItem>("/api/ticket/AddSystemTicketItem", { methodType: MethodType.post, session: session, data: {
          itemType: message.itemType,
          text: message.text,
          imageUrl: message.itemType === ITicketMediaType.Image ? uploadId : null,
        }, queries: [
          { key: "ticketId", value: message.ticketId.toString() },
          { key: "clientContext", value: message.clientContext },
        ], onUploadProgress: undefined });
      if (res.succeeded) {
        setSendingMessages((prev) => prev.filter((x) => x.clientContext !== message.clientContext));
        setSystemInbox((prev) => ({
          ...prev!,
          tickets: prev!.tickets.map((x) =>
            x.ticketId !== message.ticketId ? x : { ...x, items: removeDuplicateItems([...x.items, res.value]) }
          ),
        }));
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleGetSystemItemDataFromGraph(ticketId: number) {
    try {
      let res = await clientFetchApi<boolean, ITicket>("/api/ticket/GetSystemTicket", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "ticketId", value: ticketId.toString() },
          {
            key: "nextMaxId",
            value: undefined,
          },
        ], onUploadProgress: undefined });
      if (res.succeeded) {
        setSystemInbox((prev) => {
          const existingTicket = prev!.tickets.find((t) => t.ticketId === res.value.ticketId);
          if (existingTicket) {
            // اگر تیکت قبلا وجود داشت، آن را آپدیت کن
            return {
              ...prev!,
              tickets: prev!.tickets.map((t) => (t.ticketId === res.value.ticketId ? res.value : t)),
            };
          } else {
            // اگر تیکت جدید است، به ابتدای لیست اضافه کن
            return {
              ...prev!,
              tickets: [res.value, ...prev!.tickets],
            };
          }
        });
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  const fetchSystemItemData = async (ticketId: number, nextMaxId: string | null) => {
    console.log("oldestCursor", nextMaxId);
    if (onLoading) return;
    onLoading = true;
    try {
      let res = await clientFetchApi<boolean, ITicket>("/api/ticket/GetSystemTicket", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "ticketId", value: ticketId.toString() },
          {
            key: "nextMaxId",
            value: nextMaxId === null ? undefined : nextMaxId,
          },
        ], onUploadProgress: undefined });
      if (res.succeeded) {
        setSystemInbox((prev) => ({
          ...prev!,
          tickets: prev!.tickets.map((x) =>
            x.ticketId !== ticketId
              ? x
              : {
                  ...x,
                  items: removeDuplicateItems([...x.items, ...res.value.items]),
                  nextMaxId: res.value.nextMaxId,
                }
          ),
        }));
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
    setTimeout(() => {
      onLoading = false;
    }, 500);

    // console.log("newThread", newThread);1
  };
  function handlePendingReplies(ticketId: number, media: IReplyTicket_Media) {
    console.log("media_handleSendMessage", media);
    console.log("ticketId_handleSendMessage", ticketId);
    const repliesMedia = replyItems.find((x) => x.ticketId === ticketId);
    if (!repliesMedia) setReplyItems((prev) => [...prev, { medias: [media], ticketId: ticketId }]);
    else if (repliesMedia.medias.length <= 4) {
      setReplyItems((prev) => prev.map((x) => (x.ticketId !== ticketId ? x : { ...x, medias: [...x.medias, media] })));
    } else {
      internalNotify(InternalResponseType.CannotCreatePrePostNow, NotifType.Info);
    }
  }
  async function handleSendReplies(ticketId: number) {
    const medias = replyItems.find((x) => x.ticketId === ticketId);
    if (!medias) return;
    const replyObj: IReplyTicket_Media_Server[] = [];
    const currentTicket = replyItems.find((x) => x.ticketId === ticketId);
    if (!currentTicket) return;
    console.log("currentTicket", currentTicket);
    console.log("ticketId", ticketId);
    for (let item of currentTicket.medias) {
      replyObj.push({
        itemType: item.itemType,
        mediaId: item.mediaId,
        mediaType: item.mediaType,
        text: item.text,
      });
    }
    setReplyLoading(true);
    try {
      let res = await clientFetchApi<IReplyTicket_Media_Server[], IThread_Ticket>("/api/ticket/UpdateFbTicketItems", { methodType: MethodType.post, session: session, data: replyObj, queries: [{ key: "ticketId", value: ticketId.toString() }], onUploadProgress: undefined });
      if (!res.succeeded) notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setReplyLoading(false);
    }
  }
  async function handleCloseTicket(ticketId: number) {
    try {
      if (ticketId === userSelectedId) setUserSelectedId(null);
      let res = await clientFetchApi<IGetDirectInbox, ITicketInbox>("/api/ticket/CloseFbTicket", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "ticketId", value: ticketId.toString() }], onUploadProgress: undefined });
      if (!res.succeeded) notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleHideTicket(ticketId: number, hidden: boolean) {
    setUserSelectedId(null);
    setShowSearchThread({ loading: false, noResult: false, searchMode: false });
    setSearchbox("");
    try {
      if (ticketId === userSelectedId) setUserSelectedId(null);
      let res = await clientFetchApi<IGetDirectInbox, ITicketInbox>("Instagramer" + "/Ticket/UpdateFbTicketHiddenStatus", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "ticketId", value: ticketId.toString() },
          { key: "isHidden", value: (!hidden).toString() },
        ], onUploadProgress: undefined });
      if (res.succeeded && !hidden) {
        const thread = fbInbox?.threads.find((x) => x.ticketId === ticketId);
        if (!thread) return;
        thread.isHide = !hidden;
        setFbInbox((prev) => ({
          ...prev!,
          threads: prev!.threads.filter((x) => x.ticketId !== ticketId),
        }));
        setHideInbox((prev) => ({
          ...prev!,
          threads: [thread, ...prev!.threads],
        }));
      } else if (res.succeeded && hidden) {
        const thread = hideInbox?.threads.find((x) => x.ticketId === ticketId);
        console.log("threadddddd", thread);
        if (!thread) return;
        thread.isHide = !hidden;
        setHideInbox((prev) => ({
          ...prev!,
          threads: prev!.threads.filter((x) => x.ticketId !== ticketId),
        }));
        setFbInbox((prev) => ({
          ...prev!,
          threads: [thread, ...prev!.threads],
        }));
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
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
      if (fbResInbox.current === undefined) {
        console.log("gInbox.current ", fbResInbox.current);
        console.log(" bInbox.current  ", sInbox.current);
        return;
      }
      //  console.log(instagramerId);
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
      s.on("ticket/createdfbticket", async (ticketId: string) => {
        console.log("createdfbticket", ticketId);
        handleGetTicket(ticketId);
      });
      s.on("ticket/CloseTicketByOwner", async (ticketId: number) => {
        console.log("CloseTicketByOwner", ticketId);
        if (ticketId === refUserSelectId.current) setUserSelectedId(null);
        const fbTicket = refFbInbox.current?.threads.find((x) => x.ticketId === ticketId);
        if (fbTicket) {
          console.log("fbTicket", fbTicket);
          fbTicket.isHide = true;
          fbTicket.isSatisfied = null;
          fbTicket.status = StatusReplied.InstagramerClosed;
          setFbInbox((prev) => ({
            ...prev!,
            threads: prev!.threads.filter((x) => x.ticketId !== ticketId),
          }));
          setHideInbox((prev) => ({
            ...prev!,
            threads: [fbTicket, ...prev!.threads],
          }));
        }

        setFbInbox((prev) => ({
          ...prev!,
          threads: prev!.threads.filter((x) => x.ticketId !== ticketId),
        }));
      });
      s.on("ticket/CloseTicketByUser", async (ticketId: number, respId: string) => {
        console.log("CloseTicketByUser", ticketId);
        if (ticketId === refUserSelectId.current) setUserSelectedId(null);
        const fbThread = refFbInbox.current?.threads.find((x) => x.ticketId === ticketId && x.recp.igId === respId);
        if (fbThread) {
          fbThread.isHide = true;
          fbThread.isSatisfied = null;
          fbThread.status = StatusReplied.UserClosed;
          setFbInbox((prev) => ({
            ...prev!,
            threads: prev!.threads.filter((x) => x.ticketId !== ticketId && x.recp.igId === respId),
          }));
          setHideInbox((prev) => ({
            ...prev!,
            threads: [fbThread, ...prev!.threads],
          }));
        } else {
          setHideInbox((prev) => ({
            ...prev!,
            threads: prev!.threads.map((x) =>
              x.ticketId !== ticketId
                ? x
                : {
                    ...x,
                    status: StatusReplied.UserClosed,
                    isSatisfied: null,
                  }
            ),
          }));
        }
      });
      s.on("ticket/UpdateTicketSatisfaction", async (ticketId: number, satisfact: string) => {
        console.log("UpdateTicketSatisfaction", ticketId, satisfact);
        console.log("closeeeeeeeeeeee", refHideInbox.current);
        const hideTicket = refHideInbox.current?.threads.find((x) => x.ticketId === ticketId);
        if (hideTicket) {
          setHideInbox((prev) => ({
            ...prev!,
            threads: prev!.threads.map((x) =>
              x.ticketId !== ticketId ? x : { ...x, isSatisfied: satisfact === "True" ? true : false }
            ),
          }));
        }
      });
      s.on("ticket/RepliedFbTicketByOwner", async (ticket: string) => {
        const reply = handleDecompress(ticket);
        console.log("decompress RepliedFbTicketByOwner", reply);
        const obj: { TicketId: number; BodyItemIds: string[] } = JSON.parse(reply!);
        setReplyItems((prev) => prev.filter((x) => x.ticketId !== obj.TicketId));
        setTimeout(async () => {
          await handleGetReplyItems(obj.TicketId, obj.BodyItemIds);
        }, 1500);
      });
      s.on("ticket/RepliedFbTicketByUser", async (ticket: string) => {
        const reply = handleDecompress(ticket);
        console.log("decompress RepliedFbTicketByUser", reply);
        const obj: { TicketId: number; BodyItemIds: string[] } = JSON.parse(reply!);
        // setReplyItems((prev) =>
        //   prev.filter((x) => x.ticketId !== obj.TicketId)
        // );
        setTimeout(async () => {
          await handleGetReplyItems(obj.TicketId, obj.BodyItemIds);
        }, 1500);
      });
      s.on("ticket/ReadFbTicket", async (ticketId: string) => {
        setFbInbox((prev) => ({
          ...prev!,
          threads: prev!.threads.map((x) =>
            x.ticketId !== parseInt(ticketId) ? x : { ...x, lastSeenTicketUnix: Date.now() * 1e3 }
          ),
        }));
      });
      s.on("ticket/CreateSystemTicket", async (ticketId: string) => {
        handleGetSystemItemDataFromGraph(parseInt(ticketId));
      });
      s.on("Ticket/UpdatedSystemTicket", async (ticketId: string, clientContext: string, compressItem: string) => {
        console.log("clientContext", clientContext);
        console.log("ticketId", ticketId);
        const newItem = handleDecompress(compressItem);
        if (!newItem) return;
        const obj: userItem = JSON.parse(newItem);
        console.log("userSelectedId", userSelectedId);
        console.log("parseInt(ticketId)", parseInt(ticketId));
        console.log("obj", obj);
        setSystemInbox((prev) => ({
          ...prev!,
          tickets: prev!.tickets.map((x) =>
            x.ticketId != parseInt(ticketId)
              ? x
              : {
                  ...x,
                  items: removeDuplicateItems([obj, ...x.items]),
                  userLastSeenUnix:
                    refUserSelectId.current === parseInt(ticketId) && !obj.sentByFb
                      ? Date.now() * 1000
                      : x.userLastSeenUnix,
                  fbLastSeenUnix:
                    refUserSelectId.current === parseInt(ticketId) && !obj.sentByFb
                      ? Date.now() * 1000
                      : x.fbLastSeenUnix,
                }
          ),
        }));
      });
      s.on("Ticket/SystemTicketFbSeen", async (ticketId: string) => {
        setSystemInbox((prev) => ({
          ...prev!,
          tickets: prev!.tickets.map((x) =>
            x.ticketId !== parseInt(ticketId) ? x : { ...x, fbLastSeenUnix: Date.now() * 1000 }
          ),
        }));
      });
      s.on("Ticket/SystemTicketUserSeen", async (ticketId: string) => {
        console.log("Ticket/SystemTicketUserSeen", ticketId);
        setSystemInbox((prev) => ({
          ...prev!,
          tickets: prev!.tickets.map((x) =>
            x.ticketId !== parseInt(ticketId) ? x : { ...x, userLastSeenUnix: Date.now() * 1000 }
          ),
        }));
      });
      s.on("Error", (message: string, body: string) => {
        setMessages((prevMessages) => [...prevMessages, "Error:" + message]);
        console.log("Error", message, body);
      });
      s.onclose(() => handleRestartSignalR());
      console.log(s.state);
      setWs(s);
    }, 500);
  };
  async function handleGetReplyItems(ticketId: number, itemIds: string[]) {
    console.log("ticketId", ticketId);
    console.log("itemIds", itemIds);
    try {
      let res = await clientFetchApi<string[], IThread_Ticket>("/api/ticket/GetFbTicketItems", { methodType: MethodType.post, session: session, data: itemIds, queries: [{ key: "ticketId", value: ticketId.toString() }], onUploadProgress: undefined });
      console.log("ressssssss", res.value);
      if (res.succeeded) {
        const hideTicket = refHideInbox.current!.threads.find((x) => x.ticketId === ticketId);
        if (hideTicket) {
          hideTicket.items = [...res.value.items, ...hideTicket.items];
          hideTicket.status = res.value.status;
          setHideInbox((prev) => ({
            ...prev!,
            threads: prev!.threads.filter((x) => x.ticketId !== ticketId),
          }));
        } else {
          setFbInbox((prev) => {
            const updatedThreads = prev!.threads
              .map((x) =>
                x.ticketId !== ticketId
                  ? x
                  : {
                      ...x,
                      items: removeDuplicateItems([...res.value.items, ...x.items]),
                      status: res.value.status,
                      lastSeenTicketUnix:
                        refUserSelectId.current === ticketId ? Date.now() * 1e3 : x.lastSeenTicketUnix,
                    }
              )
              .sort((a, b) => b.actionTime - a.actionTime);
            return {
              ...prev!,
              threads: removeDuplicateThreads(updatedThreads),
            };
          });
        }
        if (res.value.nullItems && res.value.nullItems.length > 0) {
          setTimeout(async () => {
            await handleGetReplyItems(ticketId, res.value.nullItems!);
          }, 1000);
        }
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setReplyLoading(false);
    }
  }
  function handleSpecifyChatBox() {
    if (toggleOrder === TicketType.Direct && showSearchThread.searchMode) {
      return searchFbInbox?.threads.find((x) => x.ticketId === userSelectedId);
    } else if (toggleOrder === TicketType.Direct && !showSearchThread.searchMode) {
      return fbInbox?.threads.find((x) => x.ticketId === userSelectedId);
    }
  }
  function handleSpecifySystemTicketBox() {
    if (toggleOrder === TicketType.InSys && showSearchThread.searchMode) {
      return searchSystemInbox?.tickets.find((x) => x.ticketId === userSelectedId);
    } else if (toggleOrder === TicketType.InSys && !showSearchThread.searchMode) {
      return systemInbox?.tickets.find((x) => x.ticketId === userSelectedId);
    }
  }
  const handleSearchThreads = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!LoginStatus(session)) return;
    setUserSelectedId(null);
    setShowSearchThread({ searchMode: true, loading: true, noResult: false });
    setSearchFbInbox((prev) => ({ ...prev!, threads: [] }));
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
  const handleSelectSearch = async (toggle: TicketType, thread?: IThread_Ticket, ticket?: ITicket) => {
    setUserSelectedId(thread ? thread.ticketId : ticket ? ticket.ticketId : null);
    if (
      (thread && fbInbox?.threads.find((x) => x.threadId === thread.threadId)) ||
      (ticket && systemInbox?.tickets.find((x) => x.ticketId === ticket.ticketId))
    ) {
      setSearchbox("");
      setShowSearchThread((prev) => ({ ...prev, searchMode: false }));
    } else
      setTempThreadIds((prev) => [
        ...prev,
        {
          threadId: thread ? thread.threadId : ticket ? ticket.ticketId : "",
          toggle: toggle,
        },
      ]);
  };
  async function handleGetTicket(ticketId: string) {
    console.log("handleGetTicket", ticketId);
    try {
      let res = await clientFetchApi<boolean, IThread_Ticket>("Instagramer" + "/Ticket/GetFbTicket", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "ticketId", value: ticketId },
          { key: "nextMaxId", value: undefined },
        ], onUploadProgress: undefined });
      if (res.succeeded) {
        setFbInbox((prev) => {
          const existingThread = prev!.threads.find((t) => t.threadId === res.value.threadId);
          if (existingThread) {
            // اگر ترد قبلا وجود داشت، آن را آپدیت کن
            return {
              ...prev!,
              threads: prev!.threads.map((t) => (t.threadId === res.value.threadId ? res.value : t)),
            };
          } else {
            // اگر ترد جدید است، به ابتدای لیست اضافه کن
            return {
              ...prev!,
              threads: [res.value, ...prev!.threads],
            };
          }
        });
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  function handleEditText(text: string, ticketId: number, index: number): void {
    setReplyItems((prev) =>
      prev.map((x) =>
        x.ticketId !== ticketId
          ? x
          : {
              ...x,
              medias: x.medias.map((z) => (x.medias.indexOf(z) !== index ? z : { ...z, text: text })),
            }
      )
    );
  }
  function handleDeleteMedia(ticketId: number, index: number): void {
    setReplyItems((prev) =>
      prev.map((x) =>
        x.ticketId !== ticketId
          ? x
          : {
              ...x,
              medias: x.medias.filter((z) => x.medias.indexOf(z) !== index),
            }
      )
    );
  }
  async function handleHideSystemTicket(ticketId: number) {
    setUserSelectedId(null);
    setShowSearchThread({ loading: false, noResult: false, searchMode: false });
    setSearchbox("");
    const hideTicket = systemInbox?.tickets.find((x) => x.ticketId === ticketId);
    const unHideTicket = hideSystemInbox?.tickets.find((x) => x.ticketId === ticketId);
    try {
      const res = await clientFetchApi<boolean, boolean>("/api/ticket/UpdateSystemTicketHideStatus", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "ticketId", value: ticketId.toString() },
          {
            key: "isHide",
            value: hideTicket ? "true" : "false",
          },
        ], onUploadProgress: undefined });
      if (res.succeeded && hideTicket) {
        setSystemInbox((prev) => ({
          ...prev!,
          tickets: prev!.tickets.filter((x) => x.ticketId !== ticketId),
        }));
        setHideSystemInbox((prev) => ({
          ...prev!,
          tickets: [...prev!.tickets, hideTicket],
        }));
      } else if (res.succeeded && unHideTicket) {
        setHideSystemInbox((prev) => ({
          ...prev!,
          tickets: prev!.tickets.filter((x) => x.ticketId !== ticketId),
        }));
        setSystemInbox((prev) => ({
          ...prev!,
          tickets: [...prev!.tickets, unHideTicket],
        }));
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  useEffect(() => {
    refTempThread.current = tempThreadIds;
  }, [tempThreadIds]);
  function handleSpecifyUnread(thread: IThread_Ticket) {
    let unSeenDiv = <></>;
    const newItems = thread.items
      .filter((item) => item.createdTime > thread.lastSeenTicketUnix && !item.sentByOwner)
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
  function handleSpecifySystemUnread(ticket: ITicket) {
    let unSeenDiv = <></>;
    const newItems = ticket.items
      .filter((item) => item.timeStampUnix > ticket.fbLastSeenUnix && !item.sentByFb)
      .sort((a, b) => a.timeStampUnix - b.timeStampUnix);
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
  useEffect(() => {
    console.log(" ✅ Console ⋙ Session", session, session?.user.username);
    if (
      session === undefined ||
      session?.user.username === undefined ||
      !LoginStatus(session) ||
      !RoleAccess(session, PartnerRole.SystemTicket)
    )
      return;
    fetchSystemTicket();
    if (session.user.messagePermission) fetchHides();
    fetchHideSystemTicket();
    if (session.user.messagePermission) fetchFbTicket();
    setLoading(false);

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
      {!RoleAccess(session, PartnerRole.SystemTicket) && <NotAllowed />}
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
                  </svg>
                </div>
              )}
              {!activeHideInbox && (
                <div
                  title="ℹ️ Archieved Messages"
                  className={styles.readandunread}
                  onClick={() => setActiveHideInbox(true)}>
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
              )}

              <div
                onClick={() => setActiveReadState(!activeReadState)}
                className={styles.readandunread}
                title="ℹ️ Unread message only"
                style={activeReadState ? { border: "1px solid var(--color-dark-blue)" } : {}}>
                {activeReadState ? (
                  <svg
                    className={styles.eyeIcon}
                    width="36"
                    height="36"
                    viewBox="0 0 36 36"
                    fill="var(--color-dark-blue)"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      opacity=".4"
                      d="M21 3.75h-6c-5.66 0-8.49 0-10.24 1.76C3 7.26 3 10.09 3 15.75v.75c0 5.66 0 8.49 1.76 10.24q1.47 1.47 4.39 1.76c-.35 1.4-.55 2.9.32 3.55.74.53 1.91-.04 4.25-1.18 1.65-.8 3.31-1.72 5.11-2.14A11 11 0 0 1 21 28.5c5.66 0 8.49 0 10.24-1.76C33 25 33 22.16 33 16.5v-.75c0-5.66 0-8.49-1.76-10.24C29.5 3.75 26.66 3.75 21 3.75"
                      fill="var(--color-dark-blue)"
                    />
                    <path
                      d="M9.15 28.5q-2.92-.3-4.4-1.76C3 25 3 22.16 3 16.5v-.75c0-5.66 0-8.49 1.76-10.24C6.5 3.75 9.34 3.75 15 3.75h6c5.66 0 8.49 0 10.24 1.76C33 7.26 33 10.09 33 15.75v.75c0 5.66 0 8.49-1.76 10.24C29.5 28.5 26.66 28.5 21 28.5c-.84.02-1.51.08-2.17.23-1.8.42-3.46 1.34-5.1 2.14-2.35 1.14-3.52 1.71-4.26 1.18-1.4-1.05-.03-4.3.28-5.8"
                      stroke="var(--color-dark-blue)"
                      strokeWidth="2"
                      fill="var(--color-dark-blue30)"
                    />
                    <path
                      d="M12 20.25h12m-12-7.5h6"
                      stroke="var(--color-dark-blue)"
                      strokeWidth="2"
                      fill="var(--color-dark-blue)"
                    />
                  </svg>
                ) : (
                  <svg
                    fill="none"
                    className={styles.eyeIcon}
                    style={activeReadState ? {} : {}}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 36 36">
                    <path
                      opacity=".4"
                      d="M23.41 3.73h-7.98c-5.79 0-8.69 0-10.48 1.74-1.8 1.73-1.8 4.52-1.8 10.11v.75c0 5.59 0 8.38 1.8 10.11q1.5 1.45 4.5 1.74c-.36 1.39-.57 2.87.32 3.51.76.52 1.96-.04 4.35-1.17l.85-.4a21 21 0 0 1 4.38-1.71q1.1-.22 2.22-.23c5.8 0 8.69 0 10.48-1.74 1.8-1.72 1.8-4.52 1.8-10.11v-.75l-.01-2.96a7.3 7.3 0 0 1-9.14-.8 6.8 6.8 0 0 1-1.29-8.09"
                    />
                    <path d="M34.97 11.69 35 15.5v.91l-.24 6.57c-.24 1.74-.75 3.14-1.9 4.25-1.14 1.11-2.6 1.6-4.4 1.84-1.74.23-3.98.23-6.8.23h-.08c-.8.01-1.4.07-1.97.2-1.4.31-2.7.94-4.12 1.61l-.85.41-.1.05-2.85 1.21c-.78.25-1.74.4-2.59-.18l-.02-.02a2.7 2.7 0 0 1-1.05-1.86 6 6 0 0 1 .04-1.61 7.7 7.7 0 0 1-3.94-1.87c-1.15-1.1-1.66-2.52-1.9-4.25C2 21.29 2 19.14 2 16.4v-.9l.24-6.58c.24-1.74.75-3.14 1.9-4.25 1.14-1.1 2.6-1.6 4.4-1.84 1.74-.22 3.98-.22 6.8-.22h8.82q-.82.99-1.23 2.22h-7.5l-6.59.2c-1.55.2-2.43.59-3.07 1.21-.66.63-1.05 1.49-1.25 2.98a51 51 0 0 0-.22 6.36v.74l.22 6.36c.2 1.5.6 2.35 1.23 2.96a5.5 5.5 0 0 0 2.85 1.3l.05-.2.28-1.01c.13-.6.74-1 1.36-.87s1.02.71.9 1.31c-.08.36-.2.79-.33 1.21l-.07.25-.21.75-.04.13-.15.67a4 4 0 0 0-.08 1.23c.03.22.08.31.12.36.06 0 .22 0 .55-.11.6-.19 1.41-.57 2.65-1.14l.77-.38c1.41-.68 3-1.44 4.69-1.82a13 13 0 0 1 2.45-.26h.03l6.59-.2c1.55-.2 2.43-.58 3.07-1.2v-.01c.66-.63 1.05-1.48 1.25-2.97.21-1.53.22-3.53.22-6.36v-3.08a7 7 0 0 0 2.27-1.56" />
                    <path d="M29.76 11.88a5.03 5.03 0 0 0 5.11-4.94A5.03 5.03 0 0 0 29.76 2a5.03 5.03 0 0 0-5.12 4.94 5.03 5.03 0 0 0 5.12 4.94" />
                    <path d="M12.36 20.03h12.28m-12.28-7.4h6.14" stroke="var(--color-gray)" strokeWidth="2" />
                  </svg>
                )}
              </div>
            </div>
            {/* ___switch button ___*/}
            {!activeHideInbox && (
              <FlexibleToggleButton
                onChange={handleToggleChange}
                selectedValue={toggleOrder}
                options={[
                  {
                    id: 0,
                    label: t(LanguageKey.navbar_Direct),
                    unreadCount:
                      fbInbox?.threads.reduce((total, thread) => {
                        const unreadCount = thread.items.filter(
                          (item) => item.createdTime > thread.ownerLastSeenUnix && !item.sentByOwner
                        ).length;
                        return total + unreadCount;
                      }, 0) || 0,
                  },
                  {
                    id: 1,
                    label: t(LanguageKey.inSystem),
                    unreadCount:
                      systemInbox?.tickets.reduce((total, ticket) => {
                        const unreadCount = ticket.items.filter(
                          (item) => item.timeStampUnix > ticket.fbLastSeenUnix && !item.sentByFb
                        ).length;
                        return total + unreadCount;
                      }, 0) || 0,
                  },
                ]}
              />
            )}

            {/* ___list of user ___*/}
            <div className={styles.userslist} ref={userListRef}>
              {/* ___users list___*/}
              {toggleOrder === TicketType.Direct && !session?.user.messagePermission && (
                <div className={styles.userbackground}>Not Permission</div>
              )}
              {toggleOrder === TicketType.Direct &&
                !showSearchThread.searchMode &&
                !activeHideInbox &&
                fbInbox &&
                session?.user.messagePermission &&
                fbInbox.threads.map((v) => (
                  <div key={v.ticketId}>
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
                          v.ticketId === userSelectedId ? styles.selectedUserbackground : styles.userbackground
                        }>
                        <div className={styles.user} style={!v.isActive ? { opacity: "0.3" } : {}}>
                          <img
                            loading="lazy"
                            decoding="async"
                            className={styles.pictureIcon}
                            title={v.recp.name ? v.recp.name : ""}
                            alt="instagram profile picture"
                            src={basePictureUrl + v.recp.profilePic}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/no-profile.svg";
                            }}
                          />

                          <div className={styles.profile}>
                            <div className={styles.username} title={v.recp.name ? v.recp.name : ""}>
                              @{v.recp.username}
                            </div>

                            <div className={styles.messagetext} title={v.subject}>
                              {v.subject}
                            </div>
                            <div className={styles.ticketdetails}>
                              <div className={styles.closed}>
                                {(v.status === StatusReplied.InstagramerClosed ||
                                  v.status === StatusReplied.UserClosed) &&
                                  `${t(LanguageKey.Ticketclosedby)} ${
                                    v.status === StatusReplied.InstagramerClosed
                                      ? t(LanguageKey.admin)
                                      : t(LanguageKey.user)
                                  }`}
                                {v.status === StatusReplied.InstagramerReplied && (
                                  <>{t(LanguageKey.waitingforuserresponse)}</>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className={styles.notifbox} title="ℹ️ Slide to more">
                            <div className={styles.settingbox}>
                              {handleSpecifyUnread(v)}
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
                              <div className={styles.ticketid} title="ℹ️ ticket ID">
                                <img
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                  }}
                                  title="ℹ️ ticket ID"
                                  src="/adticket.svg"
                                />
                                ({v.ticketId})
                              </div>
                            </div>
                          </div>
                        </div>
                        {showMoreSettingDiv && showDivIndex === v.threadId && (
                          <>
                            <div className={styles.moresetting}>
                              {v.status !== StatusReplied.InstagramerClosed &&
                                v.status !== StatusReplied.UserClosed && (
                                  <div
                                    title="ℹ️ Archive"
                                    onClick={() => handleCloseTicket(v.ticketId)}
                                    className={styles[moreSettingClassName]}>
                                    <svg
                                      width="23"
                                      height="25"
                                      fill="none"
                                      className={styles.dragicon}
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 36 36">
                                      <path
                                        opacity=".4"
                                        d="m25.58 15.38 4.18.14c1.15.16 2.14.5 2.94 1.28.79.8 1.12 1.8 1.28 2.94.15 1.1.14 2.64.14 4.34l-.14 4.18a5 5 0 0 1-1.28 2.94 5 5 0 0 1-2.94 1.28c-1.1.15-2.48.15-4.18.15H10.42c-1.7 0-3.1 0-4.18-.15A5 5 0 0 1 3.3 31.2a5 5 0 0 1-1.28-2.94c-.15-1.1-.15-2.48-.15-4.18l.15-4.34A5 5 0 0 1 3.3 16.8a5 5 0 0 1 2.94-1.28c1.1-.14 2.48-.14 4.18-.14z"
                                      />
                                      <path d="M11.33 21.6c.5-.37 1.2-.27 1.57.22l.45.6c.95 1.27 1.22 1.6 1.56 1.76.34.17.75.2 2.34.2h1.5c1.59 0 2-.03 2.34-.2s.6-.49 1.56-1.75l.45-.6a1.13 1.13 0 0 1 1.8 1.35l-.45.6-.13.17c-.75 1-1.35 1.8-2.23 2.24s-1.87.44-3.12.44h-1.94c-1.25 0-2.25 0-3.12-.44s-1.48-1.23-2.23-2.24l-.13-.18-.45-.6c-.37-.5-.27-1.2.23-1.57" />
                                      <path d="M24.05 9.38h-12.1q-1.5 0-2.5.05c-.7.06-1.33.18-1.91.48a5 5 0 0 0-2.13 2.13 5 5 0 0 0-.47 1.82q.52-.13 1.05-.2c1.22-.16 2.7-.16 4.32-.16H25.7l4.32.16q.53.07 1.05.2a5 5 0 0 0-.47-1.82 5 5 0 0 0-2.13-2.13 5 5 0 0 0-1.9-.48q-1-.08-2.51-.05m-3.01-6h-6.1q-1.5 0-2.5.05c-.7.06-1.33.18-1.91.48A5 5 0 0 0 8.4 6.04c-.28.53-.4 1.1-.46 1.73q.7-.15 1.34-.2 1.14-.09 2.6-.07H24.1q1.46 0 2.6.06.65.05 1.34.2a5 5 0 0 0-.46-1.72 5 5 0 0 0-2.13-2.13 5 5 0 0 0-1.9-.48q-1-.08-2.51-.06" />
                                    </svg>

                                    {/* Delete */}
                                  </div>
                                )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              {toggleOrder === TicketType.InSys &&
                !activeHideInbox &&
                !showSearchThread.searchMode &&
                systemInbox &&
                systemInbox.tickets.map((v) => (
                  <div key={v.ticketId}>
                    {((activeReadState &&
                      v.items
                        .filter((item) => item.timeStampUnix > v.fbLastSeenUnix)
                        .sort((a, b) => a.timeStampUnix - b.timeStampUnix).length > 0) ||
                      !activeReadState) && (
                      <div
                        key={v.ticketId}
                        onMouseDown={() => handleMouseDown()}
                        onMouseUp={() => handleMouseUp()}
                        onMouseMove={() => handleMouseMove(v.ticketId)}
                        onTouchEnd={() => handleTouchEnd(v.ticketId)}
                        onClick={() => handleGetTicketChats(v)}
                        className={
                          v.ticketId === userSelectedId ? styles.selectedUserbackground : styles.userbackground
                        }>
                        <div
                          className={styles.user}
                          // style={!v.isActive ? { opacity: "0.3" } : {}}
                        >
                          <div className={styles.onlinering}>
                            <img
                              loading="lazy"
                              decoding="async"
                              className={styles.pictureIcon}
                              title={v.username ? v.username : ""}
                              alt="instagram profile picture"
                              src={basePictureUrl + v.profileUrl}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/no-profile.svg";
                              }}
                            />
                          </div>
                          <div className={styles.profile}>
                            <div className={styles.username} title={v.username ? v.username : ""}>
                              {v.username}
                            </div>
                            <div className={styles.username} title={v.subject}>
                              Subject:{v.subject}
                            </div>
                          </div>
                          <div className={styles.notifbox} title="ℹ️ Slide to more">
                            <div className={styles.settingbox}>
                              {handleSpecifySystemUnread(v)}
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
                              {new DateObject({
                                date: v.items[0].timeStampUnix / 1e3,
                                calendar: initialzedTime().calendar,
                                locale: initialzedTime().locale,
                              }).format("h:MM a")}
                            </div>
                          </div>
                        </div>
                        {showMoreSettingDiv && showDivIndex === v.ticketId && (
                          <>
                            <div className={styles.moresetting}>
                              <div
                                title="ℹ️ Delete"
                                onClick={() => {
                                  handleHideSystemTicket(v.ticketId);
                                }}
                                className={styles[moreSettingClassName]}>
                                <svg
                                  width="23"
                                  height="25"
                                  fill="none"
                                  className={styles.dragicon}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 36 36">
                                  <path
                                    opacity=".4"
                                    d="m25.58 15.38 4.18.14c1.15.16 2.14.5 2.94 1.28.79.8 1.12 1.8 1.28 2.94.15 1.1.14 2.64.14 4.34l-.14 4.18a5 5 0 0 1-1.28 2.94 5 5 0 0 1-2.94 1.28c-1.1.15-2.48.15-4.18.15H10.42c-1.7 0-3.1 0-4.18-.15A5 5 0 0 1 3.3 31.2a5 5 0 0 1-1.28-2.94c-.15-1.1-.15-2.48-.15-4.18l.15-4.34A5 5 0 0 1 3.3 16.8a5 5 0 0 1 2.94-1.28c1.1-.14 2.48-.14 4.18-.14z"
                                  />
                                  <path d="M11.33 21.6c.5-.37 1.2-.27 1.57.22l.45.6c.95 1.27 1.22 1.6 1.56 1.76.34.17.75.2 2.34.2h1.5c1.59 0 2-.03 2.34-.2s.6-.49 1.56-1.75l.45-.6a1.13 1.13 0 0 1 1.8 1.35l-.45.6-.13.17c-.75 1-1.35 1.8-2.23 2.24s-1.87.44-3.12.44h-1.94c-1.25 0-2.25 0-3.12-.44s-1.48-1.23-2.23-2.24l-.13-.18-.45-.6c-.37-.5-.27-1.2.23-1.57" />
                                  <path d="M24.05 9.38h-12.1q-1.5 0-2.5.05c-.7.06-1.33.18-1.91.48a5 5 0 0 0-2.13 2.13 5 5 0 0 0-.47 1.82q.52-.13 1.05-.2c1.22-.16 2.7-.16 4.32-.16H25.7l4.32.16q.53.07 1.05.2a5 5 0 0 0-.47-1.82 5 5 0 0 0-2.13-2.13 5 5 0 0 0-1.9-.48q-1-.08-2.51-.05m-3.01-6h-6.1q-1.5 0-2.5.05c-.7.06-1.33.18-1.91.48A5 5 0 0 0 8.4 6.04c-.28.53-.4 1.1-.46 1.73q.7-.15 1.34-.2 1.14-.09 2.6-.07H24.1q1.46 0 2.6.06.65.05 1.34.2a5 5 0 0 0-.46-1.72 5 5 0 0 0-2.13-2.13 5 5 0 0 0-1.9-.48q-1-.08-2.51-.06" />
                                </svg>

                                {/* Delete */}
                              </div>
                              <div
                                title="ℹ️ Pin"
                                onClick={() => handlePinDiv(undefined, undefined, v.ticketId)}
                                className={styles[moreSettingClassName]}>
                                <svg
                                  className={styles.dragicon}
                                  width="20"
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
                                {/* Pin */}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              {showSearchThread.searchMode &&
                !activeHideInbox &&
                toggleOrder === TicketType.Direct &&
                session?.user.messagePermission && (
                  <>
                    {showSearchThread.loading && <RingLoader />}
                    {showSearchThread.noResult && <h1 className="title2"> {t(LanguageKey.noresult)}</h1>}
                    {!showSearchThread.loading &&
                      !showSearchThread.noResult &&
                      searchFbInbox &&
                      searchFbInbox.threads.map(
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
                              onClick={() => handleSelectSearch(toggleOrder, v)}
                              style={
                                v.isSatisfied === null
                                  ? {}
                                  : v.isSatisfied
                                  ? { backgroundColor: "green" }
                                  : { backgroundColor: "red" }
                              }
                              className={
                                v.ticketId === userSelectedId ? styles.selectedUserbackground : styles.userbackground
                              }>
                              <div className={styles.user} style={!v.isActive ? { opacity: "0.3" } : {}}>
                                <div className={styles.onlinering}>
                                  <img
                                    loading="lazy"
                                    decoding="async"
                                    className={styles.pictureIcon}
                                    title={v.recp.name!}
                                    alt="instagram profile picture"
                                    src={basePictureUrl + v.recp.profilePic}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/no-profile.svg";
                                    }}
                                  />
                                </div>
                                <div className={styles.profile}>
                                  <div className={styles.username} title={v.recp.username}>
                                    {v.recp.username}
                                  </div>
                                  <div className={styles.username} title={v.subject}>
                                    Subject:{v.subject}
                                  </div>
                                </div>
                                <div className={styles.notifbox} title="ℹ️ Slide to more">
                                  {handleSpecifyUnread(v)}
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
              {showSearchThread.searchMode && !activeHideInbox && toggleOrder === TicketType.InSys && (
                <>
                  {showSearchThread.loading && <RingLoader />}
                  {showSearchThread.noResult && <h1 className="title2"> {t(LanguageKey.noresult)}</h1>}
                  {!showSearchThread.loading &&
                    !showSearchThread.noResult &&
                    searchSystemInbox?.tickets.map(
                      (v) =>
                        ((activeReadState &&
                          v.items
                            .filter((item) => item.timeStampUnix > v.fbLastSeenUnix)
                            .sort((a, b) => a.timeStampUnix - b.timeStampUnix).length > 0) ||
                          !activeReadState) && (
                          <div
                            key={v.ticketId}
                            onMouseDown={() => handleMouseDown()}
                            onMouseUp={() => handleMouseUp()}
                            onMouseMove={() => handleMouseMove(v.ticketId)}
                            onTouchEnd={() => handleTouchEnd(v.ticketId)}
                            onClick={() => handleSelectSearch(toggleOrder, undefined, v)}
                            className={
                              v.ticketId === userSelectedId ? styles.selectedUserbackground : styles.userbackground
                            }>
                            <div
                              className={styles.user}
                              // style={!v.isActive ? { opacity: "0.3" } : {}}
                            >
                              <div className={styles.onlinering}>
                                <img
                                  loading="lazy"
                                  decoding="async"
                                  className={styles.pictureIcon}
                                  title={v.username ? v.username : ""}
                                  alt="instagram profile picture"
                                  src={basePictureUrl + v.profileUrl}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/no-profile.svg";
                                  }}
                                />
                              </div>
                              <div className={styles.profile}>
                                <div className={styles.username} title={v.username ? v.username : ""}>
                                  {v.username}
                                </div>
                                <div className={styles.messagetext}>{v.items[0].text}</div>
                              </div>
                              <div className={styles.notifbox} title="ℹ️ Slide to more">
                                {/* <div className={styles.new}>{v.unSeenCount}</div> */}
                                <div className={styles.chattime}>
                                  {new DateObject({
                                    date: v.items[0].timeStampUnix / 1e3,
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
                  {hideInbox &&
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
                              v.ticketId === userSelectedId ? styles.selectedUserbackground : styles.userbackground
                            }
                            style={
                              v.isSatisfied === null
                                ? {}
                                : v.isSatisfied
                                ? { backgroundColor: "green" }
                                : { backgroundColor: "red" }
                            }>
                            <div className={styles.user} style={!v.isActive ? { opacity: "0.3" } : {}}>
                              <div className={styles.onlinering}>
                                <img
                                  loading="lazy"
                                  decoding="async"
                                  className={styles.pictureIcon}
                                  title={v.recp.username}
                                  alt="instagram profile picture"
                                  src={basePictureUrl + v.recp.profilePic}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/no-profile.svg";
                                  }}
                                />
                              </div>
                              <div className={styles.profile}>
                                <div className={styles.username} title={v.recp.username}>
                                  {v.recp.username}
                                </div>
                                <div className={styles.username} title={v.recp.username}>
                                  subject: {v.subject}
                                </div>
                              </div>
                              <div className={styles.notifbox} title="ℹ️ Slide to more">
                                {handleSpecifyUnread(v)}
                                <div className={styles.chattime}>
                                  {new DateObject({
                                    date: v.items[0].createdTime / 1e3,
                                    calendar: initialzedTime().calendar,
                                    locale: initialzedTime().locale,
                                  }).format("h:mm a")}
                                </div>
                                {(v.status === StatusReplied.InstagramerClosed ||
                                  v.status === StatusReplied.UserClosed) && (
                                  <div className={styles.chattime}>
                                    {`Ticket is closed by ${
                                      v.status === StatusReplied.InstagramerClosed ? "You" : "User"
                                    }`}
                                  </div>
                                )}
                              </div>
                            </div>
                            {showMoreSettingDiv && showDivIndex === v.threadId && (
                              <>
                                <div className={styles.moresetting}>
                                  <div
                                    title="ℹ️ UnHide"
                                    onClick={() => handleHideTicket(v.ticketId, v.isHide)}
                                    className={styles[moreSettingClassName]}>
                                    <svg
                                      className={styles.dragicon}
                                      fill="none"
                                      width="36"
                                      height="36"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 36 36">
                                      <path
                                        opacity=".4"
                                        d="M3.3 11C2.6 11 2 10.51 2 9.9V6c0-3.33 4.99-4 8.95-4C14.92 2 19 2.74 19 6.07l-.02.93h-2.21V6c0-2.11-5.82-1.96-5.82-1.96S4.61 3.89 4.61 6v3.9c0 .6-.58 1.1-1.3 1.1"
                                      />
                                      <path d="M15.09 7.44a1 1 0 0 1 .28-.32 1 1 0 0 1 .39-.12h4.5a.8.8 0 0 1 .67.44.9.9 0 0 1-.07.83v.01l-.02.03-.05.08a19 19 0 0 1-1.68 2.03q-.21.2-.45.36c-.13.09-.37.22-.65.22s-.52-.13-.65-.22q-.24-.16-.45-.36c-.27-.26-.56-.59-.81-.9q-.48-.6-.92-1.22l-.02-.02a.8.8 0 0 1-.07-.84" />
                                      <path
                                        opacity=".4"
                                        d="M16.3 15.22h4.82c1.15 0 1.72 0 2.14.28q.28.18.46.47c.28.42.28 1 .28 2.17 0 1.95 0 2.93-.46 3.63q-.3.45-.77.76c-.68.47-1.65.47-3.59.47h-.68c-2.6 0-3.9 0-4.7-.81s-.8-2.12-.8-4.75v-1.7c0-1 0-1.5.2-1.88q.24-.4.65-.65c.37-.21.88-.21 1.87-.21.63 0 .95 0 1.24.11.64.23.9.82 1.19 1.41l.35.7"
                                      />
                                      <path d="M3 16h4.38c1.05 0 1.58 0 1.95.25q.25.16.42.42c.25.38.25.9.25 1.95 0 1.76 0 2.64-.42 3.27q-.28.4-.7.69c-.62.42-1.5.42-3.26.42H5c-2.36 0-3.54 0-4.27-.73S0 20.36 0 18v-1.53c0-.9 0-1.36.19-1.7q.21-.36.58-.58c.34-.19.8-.19 1.7-.19.58 0 .87 0 1.13.1.58.21.82.74 1.08 1.27L5 16" />
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
              {activeHideInbox && !showSearchThread.searchMode && (
                <>
                  {hideSystemInbox &&
                    hideSystemInbox.tickets.map(
                      (v) =>
                        ((activeReadState &&
                          v.items
                            .filter((item) => item.timeStampUnix > v.fbLastSeenUnix)
                            .sort((a, b) => a.timeStampUnix - b.timeStampUnix).length > 0) ||
                          !activeReadState) && (
                          <div
                            key={v.ticketId}
                            onMouseDown={() => handleMouseDown()}
                            onMouseUp={() => handleMouseUp()}
                            onMouseMove={() => handleMouseMove(v.ticketId)}
                            onTouchEnd={() => handleTouchEnd(v.ticketId)}
                            className={
                              v.ticketId === userSelectedId ? styles.selectedUserbackground : styles.userbackground
                            }
                            style={
                              v.isSatisfied === null
                                ? {}
                                : v.isSatisfied
                                ? { backgroundColor: "green" }
                                : { backgroundColor: "red" }
                            }>
                            <div className={styles.user}>
                              <div className={styles.onlinering}>
                                <img
                                  loading="lazy"
                                  decoding="async"
                                  className={styles.pictureIcon}
                                  title={v.username ? v.username : v.phoneNumber}
                                  alt="instagram profile picture"
                                  src={basePictureUrl + v.profileUrl}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/no-profile.svg";
                                  }}
                                />
                              </div>
                              <div className={styles.profile}>
                                <div className={styles.username} title={v.username ? v.username : v.phoneNumber}>
                                  {v.username ? v.username : v.phoneNumber}
                                </div>
                                <div className={styles.username} title={v.username ? v.username : v.phoneNumber}>
                                  subject: {v.subject}
                                </div>
                              </div>
                              <div className={styles.notifbox} title="ℹ️ Slide to more">
                                {handleSpecifySystemUnread(v)}
                                <div className={styles.chattime}>
                                  {new DateObject({
                                    date: v.items[0].timeStampUnix / 1e3,
                                    calendar: initialzedTime().calendar,
                                    locale: initialzedTime().locale,
                                  }).format("h:mm a")}
                                </div>
                                {/* {(v.status ===
                                    StatusReplied.InstagramerClosed ||
                                    v.status === StatusReplied.UserClosed) && (
                                    <div className={styles.chattime}>
                                      {`Ticket is closed by ${
                                        v.status ===
                                        StatusReplied.InstagramerClosed
                                          ? "You"
                                          : "User"
                                      }`}
                                    </div>
                                  )} */}
                              </div>
                            </div>
                            {showMoreSettingDiv && showDivIndex === v.ticketId && (
                              <>
                                <div className={styles.moresetting}>
                                  <div
                                    title="ℹ️ UnHide"
                                    onClick={() => handleHideSystemTicket(v.ticketId)}
                                    className={styles[moreSettingClassName]}>
                                    <svg
                                      className={styles.dragicon}
                                      fill="none"
                                      width="36"
                                      height="36"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 36 36">
                                      <path
                                        opacity=".4"
                                        d="M3.3 11C2.6 11 2 10.51 2 9.9V6c0-3.33 4.99-4 8.95-4C14.92 2 19 2.74 19 6.07l-.02.93h-2.21V6c0-2.11-5.82-1.96-5.82-1.96S4.61 3.89 4.61 6v3.9c0 .6-.58 1.1-1.3 1.1"
                                      />
                                      <path d="M15.09 7.44a1 1 0 0 1 .28-.32 1 1 0 0 1 .39-.12h4.5a.8.8 0 0 1 .67.44.9.9 0 0 1-.07.83v.01l-.02.03-.05.08a19 19 0 0 1-1.68 2.03q-.21.2-.45.36c-.13.09-.37.22-.65.22s-.52-.13-.65-.22q-.24-.16-.45-.36c-.27-.26-.56-.59-.81-.9q-.48-.6-.92-1.22l-.02-.02a.8.8 0 0 1-.07-.84" />
                                      <path
                                        opacity=".4"
                                        d="M16.3 15.22h4.82c1.15 0 1.72 0 2.14.28q.28.18.46.47c.28.42.28 1 .28 2.17 0 1.95 0 2.93-.46 3.63q-.3.45-.77.76c-.68.47-1.65.47-3.59.47h-.68c-2.6 0-3.9 0-4.7-.81s-.8-2.12-.8-4.75v-1.7c0-1 0-1.5.2-1.88q.24-.4.65-.65c.37-.21.88-.21 1.87-.21.63 0 .95 0 1.24.11.64.23.9.82 1.19 1.41l.35.7"
                                      />
                                      <path d="M3 16h4.38c1.05 0 1.58 0 1.95.25q.25.16.42.42c.25.38.25.9.25 1.95 0 1.76 0 2.64-.42 3.27q-.28.4-.7.69c-.62.42-1.5.42-3.26.42H5c-2.36 0-3.54 0-4.27-.73S0 20.36 0 18v-1.53c0-.9 0-1.36.19-1.7q.21-.36.58-.58c.34-.19.8-.19 1.7-.19.58 0 .87 0 1.13.1.58.21.82.74 1.08 1.27L5 16" />
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
              {activeHideInbox &&
                showSearchThread.searchMode &&
                toggleOrder === TicketType.Direct &&
                session?.user.messagePermission && (
                  <>
                    {showSearchThread.loading && <RingLoader />}
                    {showSearchThread.noResult && <h1 className="title2"> {t(LanguageKey.noresult)}</h1>}
                    {!showSearchThread.loading &&
                      !showSearchThread.noResult &&
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
                                v.ticketId === userSelectedId ? styles.selectedUserbackground : styles.userbackground
                              }>
                              <div
                                key={v.threadId}
                                className={styles.user}
                                style={!v.isActive ? { opacity: "0.3" } : {}}>
                                <div className={styles.onlinering}>
                                  <img
                                    loading="lazy"
                                    decoding="async"
                                    className={styles.pictureIcon}
                                    title={v.recp.username}
                                    alt="instagram profile picture"
                                    src={basePictureUrl + v.recp.profilePic}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/no-profile.svg";
                                    }}
                                  />
                                </div>
                                <div className={styles.profile}>
                                  <div className={styles.username} title={v.recp.username}>
                                    {v.recp.username}
                                  </div>
                                  <div className={styles.messagetext}>{v.items[0].text}</div>
                                </div>
                                <div className={styles.notifbox} title="ℹ️ Slide to more">
                                  {handleSpecifyUnread(v)}
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
                                      title="ℹ️ UnHide"
                                      onClick={() => handleHideTicket(v.ticketId, v.isHide)}
                                      className={styles[moreSettingClassName]}>
                                      <svg
                                        className={styles.dragicon}
                                        fill="none"
                                        width="36"
                                        height="36"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 36 36">
                                        <path
                                          opacity=".4"
                                          d="M3.3 11C2.6 11 2 10.51 2 9.9V6c0-3.33 4.99-4 8.95-4C14.92 2 19 2.74 19 6.07l-.02.93h-2.21V6c0-2.11-5.82-1.96-5.82-1.96S4.61 3.89 4.61 6v3.9c0 .6-.58 1.1-1.3 1.1"
                                        />
                                        <path d="M15.09 7.44a1 1 0 0 1 .28-.32 1 1 0 0 1 .39-.12h4.5a.8.8 0 0 1 .67.44.9.9 0 0 1-.07.83v.01l-.02.03-.05.08a19 19 0 0 1-1.68 2.03q-.21.2-.45.36c-.13.09-.37.22-.65.22s-.52-.13-.65-.22q-.24-.16-.45-.36c-.27-.26-.56-.59-.81-.9q-.48-.6-.92-1.22l-.02-.02a.8.8 0 0 1-.07-.84" />
                                        <path
                                          opacity=".4"
                                          d="M16.3 15.22h4.82c1.15 0 1.72 0 2.14.28q.28.18.46.47c.28.42.28 1 .28 2.17 0 1.95 0 2.93-.46 3.63q-.3.45-.77.76c-.68.47-1.65.47-3.59.47h-.68c-2.6 0-3.9 0-4.7-.81s-.8-2.12-.8-4.75v-1.7c0-1 0-1.5.2-1.88q.24-.4.65-.65c.37-.21.88-.21 1.87-.21.63 0 .95 0 1.24.11.64.23.9.82 1.19 1.41l.35.7"
                                        />
                                        <path d="M3 16h4.38c1.05 0 1.58 0 1.95.25q.25.16.42.42c.25.38.25.9.25 1.95 0 1.76 0 2.64-.42 3.27q-.28.4-.7.69c-.62.42-1.5.42-3.26.42H5c-2.36 0-3.54 0-4.27-.73S0 20.36 0 18v-1.53c0-.9 0-1.36.19-1.7q.21-.36.58-.58c.34-.19.8-.19 1.7-.19.58 0 .87 0 1.13.1.58.21.82.74 1.08 1.27L5 16" />
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
              {activeHideInbox && showSearchThread.searchMode && toggleOrder === TicketType.InSys && (
                <>
                  {showSearchThread.loading && <RingLoader />}
                  {showSearchThread.noResult && <h1 className="title2"> {t(LanguageKey.noresult)}</h1>}
                  {!showSearchThread.loading &&
                    !showSearchThread.noResult &&
                    searchHideSystemInbox &&
                    searchHideSystemInbox.tickets.map(
                      (v) =>
                        ((activeReadState &&
                          v.items
                            .filter((item) => item.timeStampUnix > v.fbLastSeenUnix)
                            .sort((a, b) => a.timeStampUnix - b.timeStampUnix).length > 0) ||
                          !activeReadState) && (
                          <div
                            key={v.ticketId}
                            onMouseDown={() => handleMouseDown()}
                            onMouseUp={() => handleMouseUp()}
                            onMouseMove={() => handleMouseMove(v.ticketId)}
                            onTouchEnd={() => handleTouchEnd(v.ticketId)}
                            className={
                              v.ticketId === userSelectedId ? styles.selectedUserbackground : styles.userbackground
                            }>
                            <div
                              key={v.ticketId}
                              className={styles.user}
                              // style={!v.isActive ? { opacity: "0.3" } : {}}
                            >
                              <div className={styles.onlinering}>
                                <img
                                  loading="lazy"
                                  decoding="async"
                                  className={styles.pictureIcon}
                                  title={v.username ? v.username : v.phoneNumber}
                                  alt="instagram profile picture"
                                  src={basePictureUrl + v.profileUrl}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/no-profile.svg";
                                  }}
                                />
                              </div>
                              <div className={styles.profile}>
                                <div className={styles.username} title={v.username ? v.username : v.phoneNumber}>
                                  {v.username ? v.username : v.phoneNumber}
                                </div>
                                <div className={styles.messagetext}>{v.items[0].text}</div>
                              </div>
                              <div className={styles.notifbox} title="ℹ️ Slide to more">
                                {handleSpecifySystemUnread(v)}
                                <div className={styles.chattime}>
                                  {new DateObject({
                                    date: v.items[0].timeStampUnix / 1e3,
                                    calendar: initialzedTime().calendar,
                                    locale: initialzedTime().locale,
                                  }).format("h:mm a")}
                                </div>
                              </div>
                            </div>
                            {showMoreSettingDiv && showDivIndex === v.ticketId && (
                              <>
                                <div className={styles.moresetting}>
                                  <div
                                    title="ℹ️ UnHide"
                                    onClick={() => handleHideSystemTicket(v.ticketId)}
                                    className={styles[moreSettingClassName]}>
                                    <svg
                                      className={styles.dragicon}
                                      fill="none"
                                      width="36"
                                      height="36"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 36 36">
                                      <path
                                        opacity=".4"
                                        d="M3.3 11C2.6 11 2 10.51 2 9.9V6c0-3.33 4.99-4 8.95-4C14.92 2 19 2.74 19 6.07l-.02.93h-2.21V6c0-2.11-5.82-1.96-5.82-1.96S4.61 3.89 4.61 6v3.9c0 .6-.58 1.1-1.3 1.1"
                                      />
                                      <path d="M15.09 7.44a1 1 0 0 1 .28-.32 1 1 0 0 1 .39-.12h4.5a.8.8 0 0 1 .67.44.9.9 0 0 1-.07.83v.01l-.02.03-.05.08a19 19 0 0 1-1.68 2.03q-.21.2-.45.36c-.13.09-.37.22-.65.22s-.52-.13-.65-.22q-.24-.16-.45-.36c-.27-.26-.56-.59-.81-.9q-.48-.6-.92-1.22l-.02-.02a.8.8 0 0 1-.07-.84" />
                                      <path
                                        opacity=".4"
                                        d="M16.3 15.22h4.82c1.15 0 1.72 0 2.14.28q.28.18.46.47c.28.42.28 1 .28 2.17 0 1.95 0 2.93-.46 3.63q-.3.45-.77.76c-.68.47-1.65.47-3.59.47h-.68c-2.6 0-3.9 0-4.7-.81s-.8-2.12-.8-4.75v-1.7c0-1 0-1.5.2-1.88q.24-.4.65-.65c.37-.21.88-.21 1.87-.21.63 0 .95 0 1.24.11.64.23.9.82 1.19 1.41l.35.7"
                                      />
                                      <path d="M3 16h4.38c1.05 0 1.58 0 1.95.25q.25.16.42.42c.25.38.25.9.25 1.95 0 1.76 0 2.64-.42 3.27q-.28.4-.7.69c-.62.42-1.5.42-3.26.42H5c-2.36 0-3.54 0-4.27-.73S0 20.36 0 18v-1.53c0-.9 0-1.36.19-1.7q.21-.36.58-.58c.34-.19.8-.19 1.7-.19.58 0 .87 0 1.13.1.58.21.82.74 1.08 1.27L5 16" />
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
              {!activeHideInbox && !showSearchThread.searchMode && (
                <>
                  {/* Empty state for Direct tickets */}
                  {toggleOrder === TicketType.Direct &&
                    session?.user.messagePermission &&
                    (!fbInbox || !fbInbox.threads || fbInbox.threads.length === 0) && (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyStateText}>{t(LanguageKey.emptyticketdirect)}</div>
                      </div>
                    )}
                  {/* Empty state for System tickets */}
                  {toggleOrder === TicketType.InSys &&
                    (!systemInbox || !systemInbox.tickets || systemInbox.tickets.length === 0) && (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyStateText}>{t(LanguageKey.emptysystemticket)}</div>
                      </div>
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
          {userSelectedId && fbInbox && toggleOrder === TicketType.Direct && (
            <div className={styles.right} style={{ display: displayRight }}>
              <DirectChatBox
                userSelectId={userSelectedId}
                chatBox={handleSpecifyChatBox()!}
                showIcon={showIcon}
                ownerInbox={fbInbox!.ownerInbox}
                hub={ws}
                replyLoading={replyLoading}
                showUserList={showUserList}
                handleShowIcon={handleShowIcon}
                fetchItemData={fetchItemData}
                replyItems={replyItems.find((x) => x.ticketId === userSelectedId)!}
                handlePendingReplies={handlePendingReplies}
                handleSendReplies={handleSendReplies}
                handleEditText={handleEditText}
                handleDeleteMedia={handleDeleteMedia}
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
          {userSelectedId && systemInbox && toggleOrder === TicketType.InSys && (
            <div className={styles.right} style={{ display: displayRight }}>
              <SystemChatBox
                userSelectId={userSelectedId}
                chatBox={handleSpecifySystemTicketBox()!}
                showIcon={showIcon}
                ownerInbox={systemInbox!.ownerInbox}
                hub={ws}
                showUserList={showUserList}
                handleShowIcon={handleShowIcon}
                fetchItemData={fetchSystemItemData}
                handleSendTicketMessage={handleSendTicketMessage}
                sendingMessages={sendingMessages}
                onImageClick={handleImageClick}
                onImageContainerClick={(info: { url: string; height: number; width: number }) => {
                  mediaModal.openImage(info.url, info.width, info.height);
                }}
                onVideoContainerClick={(info: { url: string; height: number; width: number; isExpired: boolean }) => {
                  mediaModal.openVideo(info.url, info.width, info.height, info.isExpired);
                }}
                onSendFile={handleSendFile}
              />
            </div>
          )}
          {!userSelectedId && (
            <div className={styles.disableRight} style={{ display: displayRight }}>
              <img className={styles.disableRightimage} alt="Welcome illustration" src="/disableright.svg" />
              <div>
                <h3>{t(LanguageKey.ticketmanagement)}</h3>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Components */}
      <MediaModal isOpen={mediaModal.isOpen} media={mediaModal.media} onClose={mediaModal.close} />

      <Modal closePopup={handleClosePopup} classNamePopup={"popupProfile"} showContent={showPopup}>
        <img
          onClick={handleClosePopup}
          style={{ width: "35px", cursor: "pointer" }}
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

export default TicketInbox;
