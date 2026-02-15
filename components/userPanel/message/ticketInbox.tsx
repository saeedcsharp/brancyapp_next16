import { HubConnection } from "@microsoft/signalr";
import { t } from "i18next";
import { useSession } from "next-auth/react";
import router from "next/router";
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { DateObject } from "react-multi-date-picker";
import InputText from "saeed/components/design/inputText";
import RingLoader from "saeed/components/design/loader/ringLoder";
import Modal from "saeed/components/design/modal";
import SendFile from "saeed/components/messages/popups/sendFile";
import {
  MediaModal,
  useMediaModal,
} from "saeed/components/messages/shared/utils";
import {
  NotifType,
  notify,
  ResponseType,
} from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import initialzedTime from "saeed/helper/manageTimer";
import { LanguageKey } from "saeed/i18n";
import { MethodType, UploadFile } from "saeed/helper/apihelper";
import { IIsSendingMessage } from "saeed/models/messages/IMessage";
import {
  IItem,
  ISendTicketMessage,
  ITicket,
  ITicketMediaType,
  IUserPanelMessage,
} from "saeed/models/userPanel/message";
import ReportModal from "./popup/reportModal";
import UserPanelDirectChatBox from "./ticketChatBox";
import styles from "./ticketInbox.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";

let firstTime = 0;
let touchMove = 0;
let touchStart = 0;
let firstPos = { x: 0, y: 0 };
let downFlagLeft = false;
let downFlagRight = false;
let hideDivIndex: number | null = null;
let constUserSelected: string | null = null;
const UserPanelDirectInbox = () => {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const { query } = router;
  const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
  const [ticketInbox, setTicketInbox] = useState<IUserPanelMessage>();
  const [searchTicketInbox, setSearchTicketInbox] =
    useState<IUserPanelMessage>();
  const tInbox = useRef(ticketInbox);
  const [hideInbox, setHideInbox] = useState<IUserPanelMessage>();
  const [searchHideInbox, setSearchHideInbox] = useState<IUserPanelMessage>();
  useEffect(() => {
    tInbox.current = ticketInbox;
  }, [ticketInbox]);
  const [loading, setLoading] = useState(true);
  const [searchbox, setSearchbox] = useState("");
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
  const [showDivIndex, setShowDivIndex] = useState<number | null>(null);
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
  const [sendingMessages, setSendingMessages] = useState<ISendTicketMessage[]>(
    [],
  );
  const [tempTicketIds, setTempTicketIds] = useState<{ ticketId: number }[]>(
    [],
  );
  const refTempTicket = useRef(tempTicketIds);
  const mediaModal = useMediaModal();

  // SendFile Modal state
  const [showSendFile, setShowSendFile] = useState<boolean>(false);
  const [fileContent, setFileContent] = useState<{
    file: File;
    threadId: string;
    igid: string;
  } | null>(null);
  // Report Modal state
  const [showReport, setShowReport] = useState<boolean>(false);
  const [report, setReport] = useState<{
    title: string;
    message: string;
  }>({
    title: "",
    message: "",
  });
  const handleGetTicketChats = async (ticket: ITicket) => {
    constUserSelected = null;
    let newTime = new Date().getTime();
    if (newTime - firstTime <= 110) {
      console.log("userSelectedId ", userSelectedId);
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
      if (
        typeof window !== undefined &&
        window.innerWidth <= 800 &&
        displayRight === "none"
      ) {
        setDisplayLeft("none");
        setDisplayRight("");
      }

      if (ticket.ticketId === userSelectedId) return;
      // for (let item of thread.items) {
      //   if (
      //     item.repliedToItemId &&
      //     !thread.items.find((x) => x.itemId === item.repliedToItemId)
      //   ) {
      //     handleGetRepliedItems(
      //       thread,
      //       item.repliedToItemId,
      //       CategoryType.General
      //     );
      //   }
      // }
      setUserSelectedId(ticket.ticketId);
    }
  };
  const handleMouseMove = (index: string) => {
    if (downFlagLeft && mousePos.x - firstPos.x < -10) {
      setMoreSettingClassName("showDiv");
      setShowMoreSettingDiv(true);
      setShowDivIndex(parseInt(index));
      downFlagLeft = false;
      downFlagRight = false;
    }
    if (
      downFlagRight &&
      mousePos.x - firstPos.x > 10 &&
      showDivIndex !== null
    ) {
      setMoreSettingClassName("hideDiv");
      downFlagRight = false;
      downFlagLeft = false;
      setTimeout(() => {
        hideDivIndex = parseInt(index);
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
      setShowDivIndex(parseInt(index));
    } else if (touchMove - touchStart > 0) {
      setMoreSettingClassName("hideDiv");
      setTimeout(() => {
        hideDivIndex = parseInt(index);
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
  const handlePinDiv = async (ticketId: number) => {
    setShowDivIndex(null);
    setUserSelectedId(null);
    setShowMoreSettingDiv(false);
    var myTicket = ticketInbox?.tickets.find((x) => x.ticketId === ticketId);
    if (myTicket) {
      try {
        let tRes = await clientFetchApi<boolean, boolean>("/api/systemticket/UpdateSystemTicketPinStatus", { methodType: MethodType.get, session: session, data: null, queries: [
            { key: "ticketId", value: ticketId.toString() },
            { key: "isPin", value: (!myTicket.isPin).toString() },
          ], onUploadProgress: undefined });
        if (tRes.succeeded) {
          setTicketInbox((prev) => ({
            ...prev!,
            tickets: prev!.tickets
              .map((x) =>
                x.ticketId !== myTicket?.ticketId
                  ? x
                  : { ...x, isPin: !x.isPin },
              )
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
          notify(tRes.info.responseType, NotifType.Warning);
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    }
  };
  async function handleHideDiv(ticketId: number) {
    console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
    setShowDivIndex(null);
    setUserSelectedId(null);
    setShowMoreSettingDiv(false);
    var mainTicket = ticketInbox?.tickets.find((x) => x.ticketId === ticketId);
    var hideTicket = hideInbox?.tickets.find((x) => x.ticketId === ticketId);
    try {
      let tRes = await clientFetchApi<boolean, boolean>("/api/systemticket/UpdateSystemTicketHideStatus", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "ticketId", value: ticketId.toString() },
          {
            key: "isHide",
            value: mainTicket ? "true" : hideTicket ? "false" : "false",
          },
        ], onUploadProgress: undefined });
      if (tRes.succeeded && hideTicket) {
        setHideInbox((prev) => ({
          ...prev!,
          tickets: prev!.tickets.filter((x) => x.ticketId !== ticketId),
        }));
        setTicketInbox((prev) => ({
          ...prev!,
          tickets: [...prev!.tickets, hideTicket!],
        }));
      } else if (tRes.succeeded && mainTicket) {
        setTicketInbox((prev) => ({
          ...prev!,
          tickets: prev!.tickets.filter((x) => x.ticketId !== ticketId),
        }));
        setHideInbox((prev) => ({
          ...prev!,
          tickets: [...prev!.tickets, mainTicket!],
        }));
      } else {
        notify(tRes.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }

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
  const loadMoreItems = async () => {
    {
      if (!showSearchThread.searchMode && ticketInbox?.nextMaxId) {
        fetchData(true, ticketInbox.nextMaxId, null);
      }
    }
  };
  const handleScroll = () => {
    const container = userListRef.current;
    if (
      container &&
      container.scrollHeight - container.scrollTop === container.clientHeight
    ) {
      loadMoreItems();
    }
  };
  const fetchData = async (
    isHide: boolean,
    oldestCursor: string | null,
    query: string | null,
  ) => {
    try {
      let tRes = await clientFetchApi<boolean, IUserPanelMessage>("/api/systemticket/GetSystemInbox", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "isHide", value: isHide.toString() },
          { key: "nextMaxId", value: oldestCursor ? oldestCursor : undefined },
          { key: "query", value: query || "" },
        ], onUploadProgress: undefined });
      console.log("generalResssssssssssss", tRes);
      if (tRes.succeeded && !query) {
        setTicketInbox((prev) => ({
          nextMaxId: tRes.value.nextMaxId,
          tickets: [...prev!.tickets, ...tRes.value.tickets],
          ownerInbox: tRes.value.ownerInbox,
        }));
      } else if (tRes.succeeded && query) {
        if (tRes.value.tickets.length > 0 && !activeHideInbox) {
          setSearchTicketInbox(tRes.value);
          setShowSearchThread((prev) => ({ ...prev, loading: false }));
        } else if (tRes.value.tickets.length > 0 && activeHideInbox) {
          setSearchHideInbox(tRes.value);
          setShowSearchThread((prev) => ({ ...prev, loading: false }));
        } else
          setShowSearchThread((prev) => ({
            ...prev,
            loading: false,
            noResult: true,
          }));
      } else if (!tRes.succeeded) {
        setShowSearchThread((prev) => ({
          ...prev,
          loading: false,
          noResult: true,
        }));
        notify(tRes.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
      // handleDisConnectedNetwork();
    }
  };
  async function fetchHides() {
    try {
      let res = await clientFetchApi<boolean, IUserPanelMessage>("/api/systemticket/GetSystemInbox", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "isHide", value: "true" },
          { key: "query", value: undefined },
          { key: "nextMaxId", value: undefined },
        ], onUploadProgress: undefined });
      console.log(" ✅ Console ⋙ Hide", res.value);
      if (res.succeeded) setHideInbox(res.value);
      else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Warning);
    }
  }
  const fetchTicket = async () => {
    var uniqueTicket: ITicket[] = [];
    try {
      let res = await clientFetchApi<boolean, IUserPanelMessage>("/api/systemticket/GetSystemInbox", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
      setTicketInbox(res.value);
      console.log("res.value ", res.value);
      uniqueTicket = res.value.tickets;
    } catch (error) {}
    setLoading(false);
    if (router.isReady) {
      if (query.id === undefined) return;
      var ticketId = query.id;
      if (ticketId) {
        var oldTickets = uniqueTicket.find(
          (x) => x.ticketId === parseInt(ticketId as string),
        );
        // var oldBusiness = uniqeBusinessThreads.find(
        //   (x) => x.threadId === threadIdRouter
        // );
        if (oldTickets) {
          // setToggleOrder(CategoryType.General);
          setUserSelectedId(oldTickets.ticketId);
        }
        //else if (oldBusiness) {
        //   // setToggleOrder(CategoryType.Business);
        //   setUserSelectedId(oldBusiness.threadId);
        // }
      }
    }
  };
  let onLoading = false;
  const fetchItemData = async (ticket: ITicket) => {
    console.log("oldestCursor", ticket.nextMaxId);
    if (onLoading) return;
    onLoading = true;
    try {
      let newTicket = await clientFetchApi<boolean, ITicket>("/api/systemticket/GetSystemTicket", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "ticketId", value: ticket.ticketId.toString() },
          {
            key: "nextMaxId",
            value: ticket.nextMaxId!.toString(),
          },
        ], onUploadProgress: undefined });
      console.log("newThreadFetch", newTicket);
      if (newTicket.succeeded) {
        // updateInboxFromChatBox(
        //   chatBox.threadId,
        //   newThread.value.items,
        //   newThread.value.nextMaxId
        // );
        var myTicket = ticketInbox?.tickets.find(
          (x) => x.ticketId === ticket.ticketId,
        );
        if (myTicket) {
          setTicketInbox((prev) => ({
            ...prev!,
            tickets: prev!.tickets.map((x) =>
              x.ticketId !== ticket.ticketId
                ? x
                : {
                    ...x,
                    nextMaxId: newTicket.value.nextMaxId,
                    items: [...newTicket.value.items, ...x.items],
                  },
            ),
          }));
        }
        console.log("newItemsssssssssssssssssss", newTicket.value.items);
        console.log("nextmaxid", newTicket.value.nextMaxId);
      } else notify(newTicket.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Warning);
    }
    setTimeout(() => {
      onLoading = false;
    }, 500);

    // console.log("newThread", newThread);1
  };
  async function handleSendMessage(message: ISendTicketMessage) {
    console.log("IIsSendingMessage", message);
    var mainTicket = ticketInbox?.tickets.find(
      (x) => x.ticketId === message.ticketId,
    );
    var hideTicket = hideInbox?.tickets.find(
      (x) => x.ticketId === message.ticketId,
    );
    setSendingMessages((prev) => [...prev, message]);
    var uploadId = "";
    if (message.itemType === ITicketMediaType.Image) {
      const res1 = await UploadFile(session, message.file!);
      uploadId = res1.fileName;
    }
    try {
      const res = await clientFetchApi<ISendTicketMessage, IItem>("/api/systemticket/AddSystemTicketItem", { methodType: MethodType.post, session: session, data: {
          itemType: message.itemType,
          text: message.text,
          imageUrl:
            message.itemType === ITicketMediaType.Image ? uploadId : null,
        }, queries: [{ key: "ticketId", value: message.ticketId.toString() }], onUploadProgress: undefined });
      if (res.succeeded) {
        setSendingMessages((prev) =>
          prev.filter((x) => x.ticketId !== message.ticketId),
        );
        if (mainTicket)
          setTicketInbox((prev) => ({
            ...prev!,
            tickets: prev!.tickets.map((x) =>
              x.ticketId !== message.ticketId
                ? x
                : { ...x, items: [res.value, ...x.items] },
            ),
          }));
        else if (hideTicket) {
          setHideInbox((prev) => ({
            ...prev!,
            tickets: prev!.tickets.map((x) =>
              x.ticketId !== message.ticketId
                ? x
                : { ...x, items: [res.value, ...x.items] },
            ),
          }));
        }
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }

  const handleSendImage = async (sendImage: IIsSendingMessage) => {
    if (!userSelectedId) return;
    handleSendMessage({
      itemType: ITicketMediaType.Image,
      text: null,
      ticketId: userSelectedId,
      imageBase64: sendImage.imageBase64 || "",
      file: fileContent?.file || null,
      clientContext: "",
    });
    setShowSendFile(false);
    setFileContent(null);
  };
  const handleSendFile = (sendFile: {
    file: File;
    threadId: string;
    igid: string;
  }) => {
    console.log("sendFile", sendFile);
    setFileContent(sendFile);
    setShowSendFile(true);
  };
  async function handleSendRead(ticketId: number) {
    console.log("readdddddddddddddddddddddddddddddddd");
    try {
      const res = await clientFetchApi<boolean, boolean>("/api/systemticket/SeenSystemTicket", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "ticketId", value: ticketId.toString() }], onUploadProgress: undefined });
      if (res.succeeded) {
        setTicketInbox((prev) => ({
          ...prev!,
          tickets: prev!.tickets.map((x) =>
            x.ticketId !== ticketId
              ? x
              : { ...x, userLastSeenUnix: Date.now() * 1000 },
          ),
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
    if (
      typeof window !== undefined &&
      window.innerWidth <= 800 &&
      displayLeft === "none"
    ) {
      setDisplayLeft("");
      setDisplayRight("none");
    }
    // setChatBox(null);
    setUserSelectedId(null);
  };
  async function handleSendReport(
    report: { title: string; message: string },
    ticketId: number,
  ) {
    try {
      var mainTicket = ticketInbox?.tickets.find(
        (x) => x.ticketId === ticketId,
      );
      var hideTicket = hideInbox?.tickets.find((x) => x.ticketId === ticketId);
      const res = await clientFetchApi<{ title: string; message: string }, boolean>("/api/systemticket/ReportToAdmin", { methodType: MethodType.post, session: session, data: report, queries: [
        { key: "ticketId", value: ticketId.toString() },
      ], onUploadProgress: undefined });
      if (!res.succeeded) notify(res.info.responseType, NotifType.Warning);
      else if (res.succeeded && mainTicket) {
        setTicketInbox((prev) => ({
          ...prev!,
          tickets: prev!.tickets.map((x) =>
            x.ticketId !== ticketId
              ? x
              : {
                  ...x,
                  reportedToAdmin: true,
                  reportTimeToAdmin: Date.now() * 1000,
                },
          ),
        }));
      } else if (res.succeeded && hideTicket) {
        setHideInbox((prev) => ({
          ...prev!,
          tickets: prev!.tickets.map((x) =>
            x.ticketId !== ticketId
              ? x
              : {
                  ...x,
                  reportedToAdmin: true,
                  reportTimeToAdmin: Date.now() * 1000,
                },
          ),
        }));
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  const handleLastMessage = (item: IItem) => {
    var response: string | null = "";
    switch (item.itemType) {
      case ITicketMediaType.Text:
        response = item.text;
        break;
      case ITicketMediaType.Image:
        response = "Image";
        break;
    }
    return response;
  };

  function handleSpecifyChatBox() {
    if (showSearchThread.searchMode) {
      return searchTicketInbox?.tickets.find(
        (x) => x.ticketId === userSelectedId,
      );
    } else if (
      !showSearchThread.searchMode &&
      ticketInbox?.tickets.find((x) => x.ticketId === userSelectedId)
    ) {
      return ticketInbox?.tickets.find((x) => x.ticketId === userSelectedId);
    } else if (
      !showSearchThread.searchMode &&
      hideInbox?.tickets.find((x) => x.ticketId === userSelectedId)
    ) {
      return hideInbox?.tickets.find((x) => x.ticketId === userSelectedId);
    }
  }
  const handleSearchThreads = async (e: ChangeEvent<HTMLInputElement>) => {
    setUserSelectedId(null);
    setShowSearchThread({ searchMode: true, loading: true, noResult: false });
    setSearchTicketInbox((prev) => ({ ...prev!, tickets: [] }));
    const query = e.target.value;
    setSearchbox(query);
    if (timoutId) clearTimeout(timoutId);
    if (query.length > 0) {
      let timeOutId = setTimeout(() => {
        if (query && query.length > 0) {
          if (searchLocked) return;
          console.log("searchhhchhhhhhh");
          setSearchLocked(true);
          fetchData(activeHideInbox, null, query);
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
  const handleSelectSearch = async (ticket: ITicket) => {
    setUserSelectedId(ticket.ticketId);
    if (
      ticketInbox?.tickets.find((x) => x.ticketId === ticket.ticketId) ||
      hideInbox?.tickets.find((x) => x.ticketId === ticket.ticketId)
    ) {
      setSearchbox("");
      setShowSearchThread((prev) => ({ ...prev, searchMode: false }));
    } else setTempTicketIds((prev) => [...prev, { ticketId: ticket.ticketId }]);
  };
  useEffect(() => {
    console.log("tempThreadIds", tempTicketIds);
    refTempTicket.current = tempTicketIds;
  }, [tempTicketIds]);
  function handleSpecifyUnread(items: IItem[], ticket: ITicket) {
    let unSeenDiv = <></>;
    const newItems = items
      .filter(
        (item) => item.timeStampUnix > ticket.userLastSeenUnix && item.sentByFb,
      )
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
  useEffect(() => {
    console.log(" ✅ Console ⋙ Session", session, session?.user.username);
    if (session === undefined) return;
    fetchHides();
    fetchTicket();
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

  return (
    <>
      {loading && <Loading />}
      {!loading && (
        <div onClick={() => setShowIcon("")}>
          <div className={`${styles.pincontainer} translate`}>
            {/* ___left ___*/}
            <div className={styles.left} style={{ display: displayLeft }}>
              {/* ___search ___*/}
              <div className={styles.search}>
                <div className={styles.searchbox}>
                  <InputText
                    className={"serachMenuBar"}
                    placeHolder={"Search People or Keyword"}
                    handleInputChange={handleSearchThreads}
                    value={searchbox}
                    maxLength={undefined}
                    name=""
                  />
                </div>
                {activeHideInbox && (
                  <div
                    title="ℹ️ Archieved Messages"
                    className={styles.readandunread}
                    onClick={() => setActiveHideInbox(false)}
                    style={
                      activeReadState
                        ? {}
                        : { border: "1px solid var(--color-dark-blue)" }
                    }>
                    <svg
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 36 36"
                      className={styles.eyeIcon}>
                      <path
                        opacity=".4"
                        d="m25.58 15.38 4.18.14c1.15.16 2.14.5 2.94 1.28.79.8 1.12 1.8 1.28 2.94.15 1.1.14 2.64.14 4.34l-.14 4.18a5 5 0 0 1-1.28 2.94 5 5 0 0 1-2.94 1.28c-1.1.15-2.48.15-4.18.15H10.42c-1.7 0-3.1 0-4.18-.15A5 5 0 0 1 3.3 31.2a5 5 0 0 1-1.28-2.94c-.15-1.1-.15-2.48-.15-4.18l.15-4.34A5 5 0 0 1 3.3 16.8a5 5 0 0 1 2.94-1.28c1.1-.14 2.48-.14 4.18-.14z"
                        fill="var(--color-dark-blue)"
                      />
                      <path
                        d="M11.33 21.6c.5-.37 1.2-.27 1.57.22l.45.6c.95 1.27 1.22 1.6 1.56 1.76.34.17.75.2 2.34.2h1.5c1.59 0 2-.03 2.34-.2s.6-.49 1.56-1.75l.45-.6a1.13 1.13 0 0 1 1.8 1.35l-.45.6-.13.17c-.75 1-1.35 1.8-2.23 2.24s-1.87.44-3.12.44h-1.94c-1.25 0-2.25 0-3.12-.44s-1.48-1.23-2.23-2.24l-.13-.18-.45-.6c-.37-.5-.27-1.2.23-1.57"
                        fill="var(--color-dark-blue)"
                      />
                      <path
                        d="M24.05 9.38h-12.1q-1.5 0-2.5.05c-.7.06-1.33.18-1.91.48a5 5 0 0 0-2.13 2.13 5 5 0 0 0-.47 1.82q.52-.13 1.05-.2c1.22-.16 2.7-.16 4.32-.16H25.7l4.32.16q.53.07 1.05.2a5 5 0 0 0-.47-1.82 5 5 0 0 0-2.13-2.13 5 5 0 0 0-1.9-.48q-1-.08-2.51-.05m-3.01-6h-6.1q-1.5 0-2.5.05c-.7.06-1.33.18-1.91.48A5 5 0 0 0 8.4 6.04c-.28.53-.4 1.1-.46 1.73q.7-.15 1.34-.2 1.14-.09 2.6-.07H24.1q1.46 0 2.6.06.65.05 1.34.2a5 5 0 0 0-.46-1.72 5 5 0 0 0-2.13-2.13 5 5 0 0 0-1.9-.48q-1-.08-2.51-.06"
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
                      <path d="M11.33 21.6c.5-.37 1.2-.27 1.57.22l.45.6c.95 1.27 1.22 1.6 1.56 1.76.34.17.75.2 2.34.2h1.5c1.59 0 2-.03 2.34-.2s.6-.49 1.56-1.75l.45-.6a1.13 1.13 0 0 1 1.8 1.35l-.45.6-.13.17c-.75 1-1.35 1.8-2.23 2.24s-1.87.44-3.12.44h-1.94c-1.25 0-2.25 0-3.12-.44s-1.48-1.23-2.23-2.24l-.13-.18-.45-.6c-.37-.5-.27-1.2.23-1.57" />
                      <path d="M24.05 9.38h-12.1q-1.5 0-2.5.05c-.7.06-1.33.18-1.91.48a5 5 0 0 0-2.13 2.13 5 5 0 0 0-.47 1.82q.52-.13 1.05-.2c1.22-.16 2.7-.16 4.32-.16H25.7l4.32.16q.53.07 1.05.2a5 5 0 0 0-.47-1.82 5 5 0 0 0-2.13-2.13 5 5 0 0 0-1.9-.48q-1-.08-2.51-.05m-3.01-6h-6.1q-1.5 0-2.5.05c-.7.06-1.33.18-1.91.48A5 5 0 0 0 8.4 6.04c-.28.53-.4 1.1-.46 1.73q.7-.15 1.34-.2 1.14-.09 2.6-.07H24.1q1.46 0 2.6.06.65.05 1.34.2a5 5 0 0 0-.46-1.72 5 5 0 0 0-2.13-2.13 5 5 0 0 0-1.9-.48q-1-.08-2.51-.06" />
                    </svg>
                  </div>
                )}
                <div
                  onClick={() => setActiveReadState(!activeReadState)}
                  className={styles.readandunread}
                  title="ℹ️ Unread message only"
                  style={
                    activeReadState
                      ? { border: "1px solid var(--color-dark-blue)" }
                      : {}
                  }>
                  {activeReadState ? (
                    <svg
                      className={styles.eyeIcon}
                      width="36"
                      height="36"
                      viewBox="0 0 36 36"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        opacity="0.3"
                        d="M18.0008 1.87914C9.14084 1.87914 1.5 7.5 1.88084 17.3491C1.87995 19.3217 2 20.5 2.5 22C3.23638 24.2091 3.5 24.5 4.5 26C4.75817 26.3872 4.78268 27.1519 4.5 28C4 29.5 4 29.5 3.32907 30.5C3.20638 30.6521 3.19789 31 3.16617 31.1928C3.13444 31.3856 3.26157 31.8305 3.32907 32.0138C3.39657 32.1972 3.51045 32.3599 3.6596 32.4861C3.80875 32.6123 4.30801 32.9638 4.5 33C7.5 33.5 9.5 32.5 10.4756 31.88L11.2256 31.48C11.319 31.436 11.4238 31.422 11.5256 31.44L13 32C15.5 32.5 18.6439 32.2666 19.6839 32.26C28.2266 32.26 34.5 26 34.1308 17.3491C34.1308 8.74914 26.8608 1.86914 18.0008 1.86914"
                        fill="var(--color-dark-blue)"
                      />
                      <path
                        d="M12 21.62C12 22.24 12.5 22.75 13.12 22.75H23.62C23.9184 22.75 24.2045 22.6315 24.4155 22.4205C24.6265 22.2095 24.745 21.9234 24.745 21.625C24.745 21.3266 24.6265 21.0405 24.4155 20.8295C24.2045 20.6185 23.9184 20.5 23.62 20.5H13.12C12.5 20.5 12 21 12 21.62ZM12 14.12C12 14.74 12.5 15.25 13.12 15.25H18.37C18.6684 15.25 18.9545 15.1315 19.1655 14.9205C19.3765 14.7095 19.495 14.4234 19.495 14.125C19.495 13.8266 19.3765 13.5405 19.1655 13.3295C18.9545 13.1185 18.6684 13 18.37 13H13.12C12.5 13 12 13.5 12 14.12Z"
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
                        d="M26.25 1.88c-1.9 0-3.52.8-4.73 1.7S19.4 5.55 18.9 6.2c-.16.21-.54.7-.54 1.29s.38 1.08.54 1.29c.5.66 1.39 1.73 2.6 2.63s2.83 1.7 4.74 1.7c1.9 0 3.52-.8 4.73-1.7S33.1 9.45 33.6 8.8c.16-.21.53-.7.53-1.29s-.37-1.08-.53-1.29A13 13 0 0 0 31 3.58a8 8 0 0 0-4.74-1.7m-.01 3.37a2.25 2.25 0 1 0 0 4.5h.02a2.25 2.25 0 0 0 0-4.5z"
                        fill="var(--color-gray)"
                      />
                      <path
                        opacity=".4"
                        d="M17.12 4.85c.47-.63.7-.94.63-1.16l-.07-.14c-.14-.18-.5-.17-1.24-.15l-1.77.08a13.75 13.75 0 0 0-12.73 12.9 31 31 0 0 0 0 3.93c.16 2.57 1.29 4.9 2.54 6.78.37.72.17 1.8-.52 3.13l-.04.06-.6 1.26a1.9 1.9 0 0 0 .08 1.63c.33.57.87.78 1.3.86.35.07.8.08 1.2.1h.07a7.4 7.4 0 0 0 4.82-1.45l.14-.1c.18-.13.27-.2.39-.21.12-.02.22.02.42.1l.35.15q1.239.5 2.58.59c2.18.14 4.47.14 6.66 0a13.75 13.75 0 0 0 12.73-12.9 31 31 0 0 0 0-3.93 14 14 0 0 0-.46-2.77c-.12-.43-.17-.65-.33-.74l-.17-.06c-.18-.02-.38.12-.77.42a10.2 10.2 0 0 1-6.08 2.15 10.2 10.2 0 0 1-6.08-2.15 15 15 0 0 1-3.05-3.08l-.02-.01c-.18-.24-.98-1.25-.98-2.64s.8-2.4.98-2.63z"
                        fill="var(--color-gray)"
                      />
                      <path
                        d="M11.63 23.25c0 .62.5 1.13 1.12 1.13h10.5a1.125 1.125 0 0 0 0-2.25h-10.5c-.62 0-1.12.5-1.12 1.12m0-7.5c0 .62.5 1.13 1.12 1.13H18a1.125 1.125 0 0 0 0-2.25h-5.25c-.62 0-1.12.5-1.12 1.12"
                        fill="var(--color-gray)"
                      />
                    </svg>
                  )}
                </div>
              </div>
              {/* ___list of user ___*/}
              <div
                className={styles.userslist}
                ref={userListRef}
                onScroll={handleScroll}>
                {/* ___users list___*/}
                {!showSearchThread.searchMode &&
                  ticketInbox &&
                  !activeHideInbox &&
                  ticketInbox.tickets.map((v) => (
                    <div key={v.ticketId}>
                      {((activeReadState &&
                        v.items
                          .filter(
                            (item) => item.timeStampUnix > v.userLastSeenUnix,
                          )
                          .sort((a, b) => a.timeStampUnix - b.timeStampUnix)
                          .length > 0) ||
                        !activeReadState) && (
                        <div
                          key={v.ticketId}
                          onMouseDown={() => handleMouseDown()}
                          onMouseUp={() => handleMouseUp()}
                          onMouseMove={() =>
                            handleMouseMove(v.ticketId.toString())
                          }
                          onTouchEnd={() =>
                            handleTouchEnd(v.ticketId.toString())
                          }
                          onClick={() => {
                            handleGetTicketChats(v);
                          }}
                          className={
                            v.ticketId === userSelectedId
                              ? styles.selectedUserbackground
                              : styles.userbackground
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
                              />
                            </div>
                            <div className={styles.profile}>
                              <div
                                className={styles.username}
                                title={v.username ? v.username : ""}>
                                {v.username}
                              </div>
                              <div className={styles.messagetext}>
                                {v.subject}
                              </div>
                            </div>
                            <div
                              className={styles.notifbox}
                              title="ℹ️ Slide to more">
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
                                      date: v.items[0].timeStampUnix / 1e3,
                                      calendar: initialzedTime().calendar,
                                      locale: initialzedTime().locale,
                                    }).format("h:mm A")
                                  : ""}
                              </div>
                            </div>
                          </div>
                          {showMoreSettingDiv &&
                            showDivIndex === v.ticketId && (
                              <>
                                <div className={styles.moresetting}>
                                  <div
                                    title="ℹ️ Delete"
                                    onClick={() => handleHideDiv(v.ticketId)}
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
                                        d="m29.37 23.48-.39 4.57a7 7 0 0 1-1.1 3.13 7 7 0 0 1-2.14 2.02c-.92.56-1.94.8-3.16.92H13.4a7 7 0 0 1-3.16-.93 7 7 0 0 1-2.13-2.02 7 7 0 0 1-1.1-3.13 50 50 0 0 1-.4-4.57L5.62 7.13h24.75z"
                                      />
                                      <path d="M14.25 26.95a1.1 1.1 0 0 1-1.12-1.13v-9a1.13 1.13 0 0 1 2.24 0v9c0 .62-.5 1.13-1.12 1.13m7.5-11.25c.62 0 1.13.5 1.13 1.12v9a1.13 1.13 0 0 1-2.25 0v-9a1.1 1.1 0 0 1 1.12-1.12M20.02 1.92a4.5 4.5 0 0 1 2.33.85q.73.58 1.16 1.34.4.7.87 1.7l.64 1.32h6.48a1.5 1.5 0 0 1 0 3h-27a1.5 1.5 0 1 1 0-3h6.61l.54-1.17q.45-1.03.86-1.76c.3-.52.64-1 1.15-1.4q1.06-.77 2.37-.87A18 18 0 0 1 18 1.88q1.16-.01 2.02.04m-5.6 5.2h7.27a19 19 0 0 0-.76-1.47 1.4 1.4 0 0 0-1.18-.74c-.39-.03-.9-.03-1.7-.03l-1.74.03c-.56.05-.91.27-1.2.77-.19.33-.39.77-.7 1.45" />
                                    </svg>

                                    {/* Delete */}
                                  </div>
                                  <div
                                    title="ℹ️ Pin"
                                    onClick={() => handlePinDiv(v.ticketId)}
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
                {showSearchThread.searchMode && !activeHideInbox && (
                  <>
                    {showSearchThread.loading && <RingLoader />}
                    {showSearchThread.noResult && (
                      <h1 className="title2"> {t(LanguageKey.noresult)}</h1>
                    )}
                    {!showSearchThread.loading &&
                      !showSearchThread.noResult &&
                      searchTicketInbox?.tickets.map(
                        (v) =>
                          ((activeReadState &&
                            v.items
                              .filter(
                                (item) => item.timeStampUnix > v.createdTime,
                              )
                              .sort((a, b) => a.timeStampUnix - b.timeStampUnix)
                              .length > 0) ||
                            !activeReadState) && (
                            <div
                              key={v.ticketId}
                              onMouseDown={() => handleMouseDown()}
                              onMouseUp={() => handleMouseUp()}
                              onMouseMove={() =>
                                handleMouseMove(v.ticketId.toString())
                              }
                              onTouchEnd={() =>
                                handleTouchEnd(v.ticketId.toString())
                              }
                              onClick={() => handleSelectSearch(v)}
                              className={
                                v.ticketId === userSelectedId
                                  ? styles.selectedUserbackground
                                  : styles.userbackground
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
                                  />
                                </div>
                                <div className={styles.profile}>
                                  <div
                                    className={styles.username}
                                    title={v.username ? v.username : ""}>
                                    {v.username}
                                  </div>
                                  <div className={styles.messagetext}>
                                    {handleLastMessage(
                                      v.items.sort(
                                        (a, b) =>
                                          b.timeStampUnix - a.timeStampUnix,
                                      )[0],
                                    )}
                                  </div>
                                </div>
                                <div
                                  className={styles.notifbox}
                                  title="ℹ️ Slide to more">
                                  {handleSpecifyUnread(v.items, v)}
                                  <div className={styles.chattime}>
                                    {new DateObject({
                                      date: v.items[0].timeStampUnix / 1e3,
                                      calendar: initialzedTime().calendar,
                                      locale: initialzedTime().locale,
                                    }).format("h:mm A")}
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
                    {hideInbox &&
                      hideInbox.tickets.map(
                        (v) =>
                          ((activeReadState &&
                            v.items
                              .filter(
                                (item) =>
                                  item.timeStampUnix > v.userLastSeenUnix,
                              )
                              .sort((a, b) => a.timeStampUnix - b.timeStampUnix)
                              .length > 0) ||
                            !activeReadState) && (
                            <div
                              key={v.ticketId}
                              onMouseDown={() => handleMouseDown()}
                              onMouseUp={() => handleMouseUp()}
                              onMouseMove={() =>
                                handleMouseMove(v.ticketId.toString())
                              }
                              onTouchEnd={() =>
                                handleTouchEnd(v.ticketId.toString())
                              }
                              className={
                                v.ticketId === userSelectedId
                                  ? styles.selectedUserbackground
                                  : styles.userbackground
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
                                  />
                                </div>
                                <div className={styles.profile}>
                                  <div
                                    className={styles.username}
                                    title={v.username ? v.username : ""}>
                                    {v.username}
                                  </div>
                                  <div className={styles.messagetext}>
                                    {v.items[0].text}
                                  </div>
                                </div>
                                <div
                                  className={styles.notifbox}
                                  title="ℹ️ Slide to more">
                                  {handleSpecifyUnread(v.items, v)}
                                  <div className={styles.chattime}>
                                    {new DateObject({
                                      date: v.items[0].timeStampUnix / 1e3,
                                      calendar: initialzedTime().calendar,
                                      locale: initialzedTime().locale,
                                    }).format("h:mm A")}
                                  </div>
                                </div>
                              </div>
                              {showMoreSettingDiv &&
                                showDivIndex === v.ticketId && (
                                  <>
                                    <div className={styles.moresetting}>
                                      <div
                                        title="ℹ️ UnHide"
                                        onClick={() =>
                                          handleHideDiv(v.ticketId)
                                        }
                                        className={
                                          styles[moreSettingClassName]
                                        }>
                                        <svg
                                          width="23"
                                          height="25"
                                          fill="none"
                                          className={styles.dragicon}
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 36 36">
                                          <path
                                            opacity=".4"
                                            d="m29.37 23.48-.39 4.57a7 7 0 0 1-1.1 3.13 7 7 0 0 1-2.14 2.02c-.92.56-1.94.8-3.16.92H13.4a7 7 0 0 1-3.16-.93 7 7 0 0 1-2.13-2.02 7 7 0 0 1-1.1-3.13 50 50 0 0 1-.4-4.57L5.62 7.13h24.75z"
                                          />
                                          <path d="M14.25 26.95a1.1 1.1 0 0 1-1.12-1.13v-9a1.13 1.13 0 0 1 2.24 0v9c0 .62-.5 1.13-1.12 1.13m7.5-11.25c.62 0 1.13.5 1.13 1.12v9a1.13 1.13 0 0 1-2.25 0v-9a1.1 1.1 0 0 1 1.12-1.12M20.02 1.92a4.5 4.5 0 0 1 2.33.85q.73.58 1.16 1.34.4.7.87 1.7l.64 1.32h6.48a1.5 1.5 0 0 1 0 3h-27a1.5 1.5 0 1 1 0-3h6.61l.54-1.17q.45-1.03.86-1.76c.3-.52.64-1 1.15-1.4q1.06-.77 2.37-.87A18 18 0 0 1 18 1.88q1.16-.01 2.02.04m-5.6 5.2h7.27a19 19 0 0 0-.76-1.47 1.4 1.4 0 0 0-1.18-.74c-.39-.03-.9-.03-1.7-.03l-1.74.03c-.56.05-.91.27-1.2.77-.19.33-.39.77-.7 1.45" />
                                        </svg>
                                      </div>
                                    </div>
                                  </>
                                )}
                            </div>
                          ),
                      )}
                  </>
                )}
                {activeHideInbox && showSearchThread.searchMode && (
                  <>
                    {showSearchThread.loading && <RingLoader />}
                    {showSearchThread.noResult && (
                      <h1 className="title2"> {t(LanguageKey.noresult)}</h1>
                    )}
                    {!showSearchThread.loading &&
                      !showSearchThread.noResult &&
                      searchHideInbox &&
                      searchHideInbox.tickets.map(
                        (v) =>
                          ((activeReadState &&
                            v.items
                              .filter(
                                (item) => item.timeStampUnix > v.createdTime,
                              )
                              .sort((a, b) => a.timeStampUnix - b.timeStampUnix)
                              .length > 0) ||
                            !activeReadState) && (
                            <div
                              key={v.ticketId}
                              onMouseDown={() => handleMouseDown()}
                              onMouseUp={() => handleMouseUp()}
                              onMouseMove={() =>
                                handleMouseMove(v.ticketId.toString())
                              }
                              onTouchEnd={() =>
                                handleTouchEnd(v.ticketId.toString())
                              }
                              className={
                                v.ticketId === userSelectedId
                                  ? styles.selectedUserbackground
                                  : styles.userbackground
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
                                    title={v.username ? v.username : ""}
                                    alt="instagram profile picture"
                                    src={basePictureUrl + v.profileUrl}
                                  />
                                </div>
                                <div className={styles.profile}>
                                  <div
                                    className={styles.username}
                                    title={v.username ? v.username : ""}>
                                    {v.username}
                                  </div>
                                  <div className={styles.messagetext}>
                                    {v.items[0].text}
                                  </div>
                                </div>
                                <div
                                  className={styles.notifbox}
                                  title="ℹ️ Slide to more">
                                  {handleSpecifyUnread(v.items, v)}
                                  <div className={styles.chattime}>
                                    {new DateObject({
                                      date: v.items[0].timeStampUnix / 1e3,
                                      calendar: initialzedTime().calendar,
                                      locale: initialzedTime().locale,
                                    }).format("h:mm A")}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ),
                      )}
                  </>
                )}
              </div>
            </div>
            {/* ___right ___*/}
            {userSelectedId && (
              <div className={styles.right} style={{ display: displayRight }}>
                <UserPanelDirectChatBox
                  userSelectId={userSelectedId}
                  chatBox={handleSpecifyChatBox()!}
                  showIcon={showIcon}
                  ownerInbox={ticketInbox!.ownerInbox}
                  showUserList={showUserList}
                  handleShowIcon={handleShowIcon}
                  handleSendReport={handleSendReport}
                  fetchItemData={fetchItemData}
                  sendingMessages={sendingMessages.filter(
                    (x) => x.ticketId === userSelectedId,
                  )}
                  handleSendMessage={handleSendMessage}
                  handleSendRead={handleSendRead}
                  onImageContainerClick={(info: {
                    url: string;
                    width: number;
                    height: number;
                  }) => {
                    mediaModal.openImage(info.url, info.width, info.height);
                  }}
                  setShowReport={setShowReport}
                  setReport={setReport}
                  onSendFile={handleSendFile}
                />
              </div>
            )}
            {!userSelectedId && (
              <div
                className={styles.disableRight}
                style={{ display: displayRight }}>
                <img
                  className={styles.disableRightimage}
                  alt="instagram profile picture"
                  src="/disableright.svg"
                />
                Select a chat to start messaging
              </div>
            )}
          </div>
        </div>
      )}
      <MediaModal
        isOpen={mediaModal.isOpen}
        media={mediaModal.media}
        onClose={mediaModal.close}
      />
      {fileContent && (
        <Modal
          closePopup={() => setShowSendFile(false)}
          classNamePopup={"popupSendFile"}
          showContent={showSendFile && fileContent !== null}>
          <SendFile
            removeMask={() => setShowSendFile(false)}
            data={fileContent!}
            send={handleSendImage}
          />
        </Modal>
      )}
      <Modal
        closePopup={() => setShowReport(false)}
        classNamePopup={"popup"}
        showContent={showReport}>
        <ReportModal
          report={report}
          setReport={setReport}
          onClose={() => setShowReport(false)}
          onSubmit={(reportData) => {
            if (userSelectedId) {
              handleSendReport(reportData, userSelectedId);
            }
          }}
        />
      </Modal>
    </>
  );
};

export default UserPanelDirectInbox;
