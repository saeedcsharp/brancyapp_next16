import { useSession } from "next-auth/react";
import router from "next/router";
import { ChangeEvent, memo, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import InputEmoji from "react-input-emoji";
import { DateObject } from "react-multi-date-picker";
import RingLoader from "saeed/components/design/loader/ringLoder";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import LinkifyText from "saeed/context/LinkifyText";
import initialzedTime from "saeed/helper/manageTimer";
import { LanguageKey } from "saeed/i18n";
import { GetServerResult, MethodType } from "saeed/models/IResult";
import { StatusReplied } from "saeed/models/messages/enum";
import { PlatformTicketItemType, PlatformTicketType } from "saeed/models/setting/enums";
import { IPlatformTicket } from "saeed/models/setting/general";
import { IItem, IOwnerInbox, ISendTicketMessage, ITicketMediaType } from "saeed/models/userPanel/message";
import styles from "./adminChatBox.module.css";

const TicketTypeIcon = memo(({ type, size = 16 }: { type: string; size?: number }) => {
  const { t } = useTranslation();
  switch (type) {
    case "BugReport":
      return (
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-h1)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}>
          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="var(--text-h1)">
            <path
              opacity=".4"
              d="M21.68 8.82a7 7 0 0 1 1.97.37 6.5 6.5 0 0 1 3.84 3.83q.3.88.36 1.98.06 1.05.05 2.72v5a9.9 9.9 0 1 1-19.8 0v-5q-.01-1.65.04-2.72a7 7 0 0 1 .37-1.98 6.5 6.5 0 0 1 3.83-3.83c.6-.23 1.25-.32 1.98-.37a53 53 0 0 1 2.72-.04h1.92q1.64-.01 2.72.04"
            />
            <path d="M19.13 32.56a10 10 0 0 1-2.25 0v-7.81a1.13 1.13 0 0 1 2.25 0zM15.52 8.78q.15-1.05.57-1.78c.37-.6.9-1 1.91-1s1.54.4 1.9 1q.45.72.58 1.78.66 0 1.2.04a7 7 0 0 1 1.85.32 8 8 0 0 0-1.06-3.7A5 5 0 0 0 18 3a5 5 0 0 0-4.47 2.44 8 8 0 0 0-1.06 3.7 7 7 0 0 1 1.86-.32zM9.6 11.15l-.37-.05A3.23 3.23 0 0 1 6 7.88V7.5a1.5 1.5 0 1 0-3 0v.38c0 3.1 2.28 5.68 5.25 6.14a6 6 0 0 1 1.34-2.87m-1.49 6.7H4.5a1.5 1.5 0 1 0 0 3h3.6zm.21 6.93A6.9 6.9 0 0 0 3 31.5a1.5 1.5 0 0 0 3 0 3.9 3.9 0 0 1 3.4-3.87 10 10 0 0 1-1.09-2.85m18.29 2.85A3.9 3.9 0 0 1 30 31.5a1.5 1.5 0 1 0 3 0c0-3.27-2.27-6-5.31-6.72a10 10 0 0 1-1.09 2.85m1.3-6.78h3.6a1.5 1.5 0 1 0 0-3h-3.6zm-.15-6.83A6.2 6.2 0 0 0 33 7.88V7.5a1.5 1.5 0 1 0-3 0v.38a3.23 3.23 0 0 1-3.23 3.22q-.2 0-.36.05a6.5 6.5 0 0 1 1.34 2.87" />
          </svg>
          {t(LanguageKey.SettingGeneral_ReportBug)}
        </div>
      );
    case "Wallet":
      return (
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-h1)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}>
          <svg
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-h1)"
            strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          {t(LanguageKey.SettingGeneral_Walletandfinance)}
        </div>
      );
    case "Message":
      return (
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-h1)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}>
          <svg
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-h1)"
            strokeWidth="2">
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
          </svg>
          {t(LanguageKey.SettingGeneral_MessageingandComment)}
        </div>
      );
    case "CustomerSupport":
      return (
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-h1)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}>
          <svg
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-h1)"
            strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {t(LanguageKey.SettingGeneral_Customerservices)}
        </div>
      );
    case "Ad":
      return (
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-h1)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}>
          <svg
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-h1)"
            strokeWidth="2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          {t(LanguageKey.SettingGeneral_Advertise)}
        </div>
      );
    case "Shop":
      return (
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-h1)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}>
          <svg
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-h1)"
            strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {t(LanguageKey.SettingGeneral_Store)}
        </div>
      );
    case "LinkMarket":
      return (
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-h1)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}>
          <svg
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-h1)"
            strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          {t(LanguageKey.SettingGeneral_Marketlink)}
        </div>
      );
    case "Other":
      return (
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-h1)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}>
          <svg
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-h1)"
            strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          {t(LanguageKey.SettingGeneral_GeneralSupport)}
        </div>
      );
    default:
      return null;
  }
});

const AdminChatBox = (props: {
  sendingMessages: ISendTicketMessage[];
  chatBox: IPlatformTicket;
  ownerInbox: IOwnerInbox;
  fetchItemData: (ticketId: number, nextMaxId: string | null) => Promise<void>;
  handleSendTicketMessage: (message: ISendTicketMessage) => Promise<void>;
  handleCloseTicket: (ticketId: number) => Promise<void>;
  onImageClick?: (imageUrl: string) => void;
  onImageContainerClick?: (info: { url: string; height: number; width: number }) => void;
}) => {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const [headerExpanded, setHeaderExpanded] = useState(false);
  const [dateFormatToggle, setDateFormatToggle] = useState("");
  const toggleDateFormat = (itemId: string | null) => {
    if (!itemId) return;
    if (dateFormatToggle === itemId) setDateFormatToggle("");
    else setDateFormatToggle(itemId);
  };
  const formatDate = (timestamp: number, itemId: string | null) => {
    return dateFormatToggle === itemId
      ? new DateObject({
          date: timestamp,
          calendar: initialzedTime().calendar,
          locale: initialzedTime().locale,
        }).format("DD/MM/YYYY - dddd - hh:mm A")
      : new DateObject({
          date: timestamp,
          calendar: initialzedTime().calendar,
          locale: initialzedTime().locale,
        }).format("ddd - hh:mm A");
  };
  const formatDate1 = (timestamp: number, itemId: string | null) => {
    return dateFormatToggle === itemId
      ? new DateObject({
          date: timestamp,
          calendar: initialzedTime().calendar,
          locale: initialzedTime().locale,
        }).format("hh:mm A - dddd - DD/MM/YYYY")
      : new DateObject({
          date: timestamp,
          calendar: initialzedTime().calendar,
          locale: initialzedTime().locale,
        }).format("hh:mm A - ddd");
  };
  const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
  var unixTypingTime = 0;
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [answerBox, setAnswerBox] = useState<string>("");
  const [backToButton, setBackToButton] = useState<boolean>(true);
  const [chatId, setChatId] = useState("");
  const loading = useRef(false);
  const [moreItemLoading, setMoreItemLoading] = useState(false);
  const { t } = useTranslation();
  const [editText, setEditText] = useState<{
    ticketId: number;
    index: number;
  } | null>(null);
  const handleInputOnChange = (value: string) => {
    if (value.length === 0) {
      unixTypingTime = 0;

      return;
    }
    if (Date.now() > unixTypingTime + 11000) {
      unixTypingTime = Date.now();
    }
    setAnswerBox(value);
  };
  const handleScroll = async () => {
    if (loading.current) return;
    const container = chatBoxRef.current;
    const atBottom = (container!.scrollHeight + container!.scrollTop) / container!.clientHeight - 1 < 0.3;
    if (container && container?.scrollTop < 0) setBackToButton(false);
    if (container && container?.scrollTop >= 0) setBackToButton(true);
    if (atBottom && !loading.current && props.chatBox.nextMaxId) {
      setMoreItemLoading(true);
      loading.current = true; // Block further calls
      console.log("Fetching more items...", props.chatBox.nextMaxId);
      await props.fetchItemData(props.chatBox.ticketId, props.chatBox.nextMaxId).finally(() => {
        setTimeout(() => {
          loading.current = false;
        }, 500); // Reset after fetching
        setMoreItemLoading(false);
      });
    }
  };
  const handleBackToButton = () => {
    const container = chatBoxRef.current;
    if (container) container.scrollTop = 0;
    setBackToButton(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles: File[] = Array.from(e.dataTransfer.files);
    if (droppedFiles) {
      props.handleSendTicketMessage({
        itemType: PlatformTicketItemType.Image,
        text: null,
        imageBase64: droppedFiles[0] ? URL.createObjectURL(droppedFiles[0]) : "",
        ticketId: props.chatBox.ticketId,
        clientContext: crypto.randomUUID(),
        file: droppedFiles[0],
      });
    }
  };
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };
  const handleUploadImage = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file && file.type === "image/jpeg") {
      props.handleSendTicketMessage({
        itemType: PlatformTicketItemType.Image,
        text: null,
        imageBase64: file ? URL.createObjectURL(file) : "",
        ticketId: props.chatBox.ticketId,
        clientContext: crypto.randomUUID(),
        file: file,
      });
    }
    e.target.value = "";
  };

  const handleSendText = async () => {
    try {
      var text = answerBox.replaceAll("</br>", "\n");
      if (text.length === 0) return;
      props.handleSendTicketMessage({
        itemType: PlatformTicketItemType.Text,
        text: text,
        imageBase64: "",
        ticketId: props.chatBox.ticketId,
        clientContext: crypto.randomUUID(),
        file: null,
      });
    } catch (error) {
    } finally {
      setEditText(null);
      setAnswerBox("");
    }
  };
  const getTicketTypeLabel = (type: PlatformTicketType): string => {
    switch (type) {
      case PlatformTicketType.BugReport:
        return "Bug Report";
      case PlatformTicketType.Wallet:
        return "Wallet";
      case PlatformTicketType.Message:
        return "Message";
      case PlatformTicketType.CustomerSupport:
        return "Customer Support";
      case PlatformTicketType.Ad:
        return "Ad";
      case PlatformTicketType.Shop:
        return "Shop";
      case PlatformTicketType.LinkMarket:
        return "Link Market";
      case PlatformTicketType.Other:
        return "Other";
      default:
        return "Unknown";
    }
  };

  const getStatusLabel = (status: StatusReplied): string => {
    switch (status) {
      case StatusReplied.JustCreated:
        return t(LanguageKey.JustCreated);
      case StatusReplied.InstagramerReplied:
        return t(LanguageKey.AdminReplied);
      case StatusReplied.UserReplied:
        return t(LanguageKey.UserReplied);
      case StatusReplied.InstagramerClosed:
        return t(LanguageKey.AdminClosed);
      case StatusReplied.UserClosed:
        return t(LanguageKey.UserClosed);
      case StatusReplied.TimerClosed:
        return t(LanguageKey.TimerClosed);
      default:
        return "Unknown";
    }
  };

  const handleFindEmoji = (text: string | null) => {
    if (!text) return null;
    var emojiRegex =
      /[\u{1F000}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{2B55}\u{2E80}-\u{2E99}\u{2E9B}-\u{2EF3}\u{2F00}-\u{2FD5}\u{2FF0}-\u{2FFB}\u{3000}-\u{3037}\u{303D}\u{3190}-\u{319F}\u{3200}-\u{321C}\u{3220}-\u{3243}\u{3250}-\u{32FE}\u{3300}-\u{4DBF}\u{4E00}-\u{A48C}\u{A490}-\u{A4C6}\u{A960}-\u{A97C}\u{AC00}-\u{D7A3}\u{D7B0}-\u{D7C6}\u{D7CB}-\u{D7FB}\u{F900}-\u{FAFF}\u{FE00}-\u{FE0F}\u{FE10}-\u{FE19}\u{FE30}-\u{FE52}\u{FE54}-\u{FE66}\u{FE68}-\u{FE6B}\u{FF01}-\u{FF60}\u{FFFD}\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E0000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}\u{200D}]/gu;
    // Filter out non-emoji characters
    var nonEmojiText = text.replace(emojiRegex, "");
    return nonEmojiText.trim();
  };
  async function handleSendRead() {
    try {
      const res = await GetServerResult<boolean, boolean>(
        MethodType.get,
        session,
        "Instagramer/Ticket/SeenPlatformTicket",
        null,
        [{ key: "ticketId", value: props.chatBox.ticketId.toString() }]
      );
      if (!res.succeeded) notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  const [lock, setLock] = useState(false);
  const [seenItem, setSeenItem] = useState<IItem | null>(null);
  useEffect(() => {
    setLock(false);
    setMoreItemLoading(false);
    handleBackToButton();
    if (!props.chatBox.items.find((x) => x.timeStampUnix > props.chatBox.fbLastSeenUnix)) {
      // console.log("lockkkkkkkkkk");
      setLock(true);
    }
    console.log("last itemmmm", props.chatBox.items[0]);
    console.log("ownerrrrrrr", props.chatBox.fbLastSeenUnix);
    return () => {
      if (
        props.chatBox.items.length > 0 &&
        props.chatBox.items[0].userId !== null &&
        props.chatBox.items[0].timeStampUnix > props.chatBox.fbLastSeenUnix
      ) {
        handleSendRead();
      }
      setSeenItem(null);
    };
  }, []);
  useEffect(() => {
    console.log("Next max ID changed:", props.chatBox.nextMaxId);
  }, [props.chatBox]);
  // #region JSX
  return (
    <>
      {/* ___header ___*/}
      <div className={`${styles.header} ${headerExpanded ? styles.headerExpanded : ""}`}>
        <div className={styles.headerContent}>
          <div className={styles.headerMainRow}>
            <div className="instagramprofile">
              <div className="instagramprofiledetail">
                <div className="instagramusername">{props.chatBox.subject}</div>

                <TicketTypeIcon type={PlatformTicketType[props.chatBox.type]} size={20} />
              </div>
            </div>

            <div className={styles.expandButton} onClick={() => setHeaderExpanded(!headerExpanded)}>
              <svg
                className={`${styles.expandIcon} ${headerExpanded ? styles.expandIconRotated : ""}`}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none">
                <path
                  d="M4 6L8 10L12 6"
                  stroke="var(--text-h1)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          {headerExpanded && (
            <div className={styles.headerDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t(LanguageKey.ticketID)}</span>
                <span className={styles.detailValue}>{props.chatBox.ticketId}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t(LanguageKey.createtime)}</span>
                <span className={styles.detailValue}>
                  {new DateObject({
                    date: props.chatBox.createdTime / 1000,
                    calendar: initialzedTime().calendar,
                    locale: initialzedTime().locale,
                  }).format("DD/MM/YYYY - hh:mm A")}
                </span>
              </div>
              {/* <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Rate:</span>
                <span className={styles.detailValue}>{props.chatBox.rate}</span>
              </div> */}
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t(LanguageKey.Storeorder_STATUS)}</span>
                <span className={styles.detailValue}>{getStatusLabel(props.chatBox.actionStatus)}</span>
              </div>

              <div className={styles.detailRow}>
                <button
                  onClick={() => props.handleCloseTicket(props.chatBox.ticketId)}
                  style={{ marginTop: "10px" }}
                  className="stopButton">
                  {t(LanguageKey.closethisticket)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* ___chat___*/}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onScroll={handleScroll}
        ref={chatBoxRef}
        className={styles.chat}>
        {props.sendingMessages.length > 0 && (
          <>
            {props.sendingMessages
              .map((v, i) => (
                <div key={v.clientContext} className={styles.rightchatrow}>
                  {v.itemType === ITicketMediaType.Text && (
                    <div key={i}>
                      <div className={styles.rightchat}>
                        <div
                          style={handleFindEmoji(v.text) ? { background: "var(--color-dark-blue)" } : {}}
                          className={styles.rightchatMSG}>
                          <LinkifyText text={v.text} />
                        </div>
                      </div>
                    </div>
                  )}
                  {v.itemType === ITicketMediaType.Image && (
                    <div className={styles.rightchat}>
                      <img
                        style={{
                          borderRadius: "var(--br5)",
                        }}
                        src={v.imageBase64 ? v.imageBase64 : ""}
                        alt="Image"
                        width={200}
                        height={200}
                      />
                    </div>
                  )}
                </div>
              ))
              .reverse()}
          </>
        )}
        {props.chatBox.items
          .sort((a, b) => b.timeStampUnix - a.timeStampUnix)
          .map((v) => (
            <div key={v.itemId}>
              {/* ___left chat___*/}
              {v.userId && (
                <>
                  {props.chatBox.fbLastSeenUnix < v.timeStampUnix &&
                    props.chatBox.items
                      .filter((item) => item.timeStampUnix > props.chatBox.fbLastSeenUnix)
                      .sort((a, b) => a.timeStampUnix - b.timeStampUnix)
                      .indexOf(v) === 0 &&
                    !lock && (
                      <div id="unread" className={styles.unread}>
                        <div
                          style={{
                            width: "100%",
                            border: "1px solid var(--color-gray30)",
                            height: "1px",
                            boxSizing: "border-box",
                          }}></div>

                        <div style={{ width: "280px" }}>Unread Messages</div>
                        <div
                          style={{
                            width: "100%",
                            border: "1px solid var(--color-gray30)",
                            height: "1px",
                            boxSizing: "border-box",
                          }}></div>
                      </div>
                    )}
                  <div className={styles.leftchatrow}>
                    {v.itemType === PlatformTicketItemType.Text && (
                      <>
                        <div className={styles.leftchat}>
                          {
                            <div
                              style={
                                handleFindEmoji(v.text)
                                  ? {
                                      background: "var(--color-light-blue30)",
                                    }
                                  : {}
                              }
                              className={styles.leftchatMSG}>
                              <LinkifyText text={v.text} />
                            </div>
                          }
                        </div>
                        <div className={styles.chatdate} onClick={() => toggleDateFormat(v.itemId)}>
                          {formatDate1(v.timeStampUnix / 1e3, v.itemId)}
                        </div>
                      </>
                    )}
                    {v.itemType === PlatformTicketItemType.Image && v.imageUrl && (
                      <>
                        <div className={styles.leftchat}>
                          <div
                            className={styles.imagebackground}
                            style={{ flexDirection: "row" }}
                            onClick={() => {
                              props.onImageContainerClick?.({
                                height: 200,
                                width: 200,
                                url: baseMediaUrl + v.imageUrl!,
                              });
                            }}>
                            {
                              <img
                                style={{
                                  borderRadius: "var(--br5)",
                                }}
                                src={baseMediaUrl + v.imageUrl!}
                                alt="Image"
                                width={200}
                                height={200}
                              />
                            }
                          </div>
                        </div>
                        <div className={styles.chatdate} onClick={() => toggleDateFormat(v.itemId)}>
                          {formatDate1(v.timeStampUnix / 1e3, v.itemId)}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
              {/* ___right chat___*/}
              {v.userId === null && (
                <>
                  <div className={styles.rightchatrow}>
                    {v.itemType === PlatformTicketItemType.Text && (
                      <>
                        {
                          <div className={styles.rightchat}>
                            <div
                              style={handleFindEmoji(v.text) ? { background: "var(--color-dark-blue)" } : {}}
                              className={styles.rightchatMSG}>
                              <LinkifyText text={v.text} />
                            </div>
                          </div>
                        }
                        {v.itemId && (
                          <div className={styles.msgdetail}>
                            <div className={styles.chatdate} onClick={() => toggleDateFormat(v.itemId)}>
                              {formatDate(v.timeStampUnix / 1e3, v.itemId)}
                            </div>
                            <div className={styles.chatstatus}>
                              <div className={styles.sent}>
                                <svg width="10" height="10" viewBox="0 0 10 7">
                                  <path
                                    fill="var(--color-light-blue)"
                                    d="M10.2.7 4 6.5a1 1 0 0 1-.9 0L.5 4a1 1 0 0 1 0-.9 1 1 0 0 1 1 0l2 2.1L9.4-.2a1 1 0 0 1 .9 0 1 1 0 0 1 0 .9"
                                  />
                                </svg>
                                {props.chatBox.adminLastSeenUnix >= v.timeStampUnix && (
                                  <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 10 7"
                                    style={{
                                      position: "relative",
                                      right: "5px",
                                    }}>
                                    <path
                                      fill="var(--color-light-blue)"
                                      d="M10.2.7 4 6.5a1 1 0 0 1-.9 0L.5 4a1 1 0 0 1 0-.9 1 1 0 0 1 1 0l2 2.1L9.4-.2a1 1 0 0 1 .9 0 1 1 0 0 1 0 .9"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {v.itemType === PlatformTicketItemType.Image && v.imageUrl && (
                      <>
                        <div className={styles.imagebackground} style={{ flexDirection: "row-reverse" }}>
                          <div
                            onClick={() => {
                              props.onImageContainerClick?.({
                                height: 200,
                                width: 200,
                                url: baseMediaUrl + v.imageUrl!,
                              });
                            }}>
                            <img
                              style={{
                                borderRadius: "var(--br15)",
                              }}
                              src={baseMediaUrl + v.imageUrl!}
                              alt="Image"
                              width={200}
                              height={200}
                            />
                          </div>
                        </div>
                        {v.itemId && (
                          <div
                            style={{
                              display: "flex",
                              gap: "var(--gap-5)",
                            }}>
                            <div className={styles.chatdate} onClick={() => toggleDateFormat(v.itemId)}>
                              {formatDate1(v.timeStampUnix / 1e3, v.itemId)}
                            </div>
                            <div className={styles.chatstatus}>
                              <div className={styles.sent}>
                                <svg width="10" height="10" viewBox="0 0 10 7">
                                  <path
                                    fill="var(--color-light-blue)"
                                    d="M10.2.7 4 6.5a1 1 0 0 1-.9 0L.5 4a1 1 0 0 1 0-.9 1 1 0 0 1 1 0l2 2.1L9.4-.2a1 1 0 0 1 .9 0 1 1 0 0 1 0 .9"
                                  />
                                </svg>
                                {props.chatBox.adminLastSeenUnix >= v.timeStampUnix && (
                                  <svg width="10" height="10" viewBox="0 0 10 7">
                                    <path
                                      fill="var(--color-light-blue)"
                                      d="M10.2.7 4 6.5a1 1 0 0 1-.9 0L.5 4a1 1 0 0 1 0-.9 1 1 0 0 1 1 0l2 2.1L9.4-.2a1 1 0 0 1 .9 0 1 1 0 0 1 0 .9"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        {moreItemLoading && <RingLoader />}
      </div>

      {/* ___detail___*/}
      {!backToButton && (
        <div onClick={handleBackToButton} className={styles.goend}>
          <svg width="11" height="13" viewBox="0 0 11 13">
            <path
              fill="var(--color-white)"
              d="m5.4 13-.8-.4L.3 8.4a1.1 1.1 0 1 1 1.6-1.6l4.2 4.3a1.1 1.1 0 0 1-.7 1.9m.1 0a1 1 0 0 1-1-1l-.1-5.5V1.1a1 1 0 0 1 1-1.1 1 1 0 0 1 1.2 1v10.9a1 1 0 0 1-1 1m0 .1a1.1 1.1 0 0 1-.7-2l4.3-4.2a1.1 1.1 0 0 1 1.5 1.6l-4.2 4.2z"
            />
          </svg>
        </div>
      )}
      {/* ___answer___*/}
      {(props.chatBox.actionStatus === StatusReplied.InstagramerReplied ||
        props.chatBox.actionStatus === StatusReplied.JustCreated ||
        props.chatBox.actionStatus === StatusReplied.UserReplied) && (
        <>
          <div className={`${styles.answer} translate`}>
            <InputEmoji
              theme="auto"
              value={answerBox}
              shouldReturn={true}
              onChange={handleInputOnChange}
              keepOpened={true}
              onEnter={handleSendText}
              placeholder="Type a message"
              shouldConvertEmojiToImage={false}
            />

            <svg className={styles.uploadbtn} onClick={handleUploadImage} viewBox="0 0 13 24">
              <path d="M2.8 22.3a4 4 0 0 1-3-1.4 4 4 0 0 1-1.5-3 5 5 0 0 1 1.4-3.4l7.7-7.7a4 4 0 0 1 1.6-1 4 4 0 0 1 3.7 1 .7.7 0 1 1-1 1 2 2 0 0 0-2.2-.6l-1 .6-7.8 7.8a4 4 0 0 0-1 2.2 3 3 0 0 0 1 2 3 3 0 0 0 3 .8L5 20l8.3-8.4a4 4 0 0 0 1.3-3.1 5 5 0 0 0-1.4-3.1 4.5 4.5 0 0 0-6.3 0l-8.3 8.2a1 1 0 0 1-1 0 1 1 0 0 1 0-1L5.9 4A6 6 0 0 1 10 2.5a6 6 0 0 1 4.2 1.7 6 6 0 0 1 1.9 4.2 6 6 0 0 1-1.8 4.2l-8.2 8.3a5 5 0 0 1-2 1.2z" />
            </svg>
            <input
              type="file"
              accept="image/jpeg"
              onChange={handleImageChange}
              ref={inputRef}
              style={{ display: "none" }}
            />
            <svg onClick={handleSendText} className={styles.sendbtn} viewBox="-5 -2 25 25">
              <path
                fill="var(--color-ffffff)"
                d="M19.3 11.2 2 20a1.4 1.4 0 0 1-2-2s2.2-4.3 2.8-5.4 1.2-1.4 7.5-2.2a.4.4 0 0 0 0-.8c-6.3-.8-7-1-7.5-2.2L0 2a1.4 1.4 0 0 1 2-2l17.3 8.7a1.3 1.3 0 0 1 0 2.4"
              />
            </svg>
          </div>
        </>
      )}

      {/* ___end___*/}
    </>
  );
};

export default AdminChatBox;
