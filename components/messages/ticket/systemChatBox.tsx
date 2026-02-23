//#region واردات کتابخانه‌ها و کامپوننت‌ها
import { HubConnection } from "@microsoft/signalr";
import { useSession } from "next-auth/react";
import router from "next/router";
import { ChangeEvent, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import InputEmoji from "react-input-emoji";
import { DateObject } from "react-multi-date-picker";
import RingLoader from "brancy/components/design/loader/ringLoder";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import { detectEmojiOnly } from "brancy/helper/emojiDetector";
import formatTimeAgo from "brancy/helper/formatTimeAgo";
import initialzedTime from "brancy/helper/manageTimer";
import { useInfiniteScroll } from "brancy/helper/useInfiniteScroll";
import { MethodType } from "brancy/helper/api";
import { IItem, IOwnerInbox, ISendTicketMessage, ITicket } from "brancy/models/userPanel/message";
import { SystemSendingMessages } from "brancy/components/messages/ticket/chatComponents/shared/messageTypes/SystemSendingMessages";
import { SystemChatWrapper } from "brancy/components/messages/ticket/chatComponents/SystemChatWrapper";
import styles from "brancy/components/messages/ticket/ticketChatBox.module.css";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
//#endregion

//#region تعریف کامپوننت و Props
const SystemChatBox = (props: {
  userSelectId: number | null;
  hub: HubConnection | null;
  chatBox: ITicket;
  showIcon: string;
  ownerInbox: IOwnerInbox;
  showUserList: () => void;
  handleShowIcon: (e: MouseEvent) => void;
  fetchItemData: (ticketId: number, nextMaxId: string | null) => Promise<void>;
  handleSendTicketMessage: (message: ISendTicketMessage) => Promise<void>;
  sendingMessages: ISendTicketMessage[];
  onImageClick?: (imageUrl: string) => void;
  onImageContainerClick?: (info: { url: string; height: number; width: number }) => void;
  onVideoContainerClick?: (info: { url: string; height: number; width: number; isExpired: boolean }) => void;
  onSendFile?: (sendFile: { file: File; threadId: string; igid: string }) => void;
}) => {
  //#endregion

  //#region Session و تنظیمات اولیه
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const baseMediaUrl = useMemo(() => process.env.NEXT_PUBLIC_BASE_MEDIA_URL, []);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  //#endregion

  //#region متغیرهای State و Ref
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const sendButtonRef = useRef<HTMLButtonElement | null>(null);
  const [dateFormatToggle, setDateFormatToggle] = useState("");
  const [answerBox, setAnswerBox] = useState<string>("");
  const [backToButton, setBackToButton] = useState<boolean>(true);
  //#endregion

  //#region توابع فرمت‌دهی تاریخ
  const toggleDateFormat = useCallback((itemId: string | null) => {
    if (!itemId) return;
    setDateFormatToggle((prev) => (prev === itemId ? "" : itemId));
  }, []);
  const formatDate = useCallback(
    (timestamp: number, itemId: string | null) => {
      return dateFormatToggle === itemId
        ? new DateObject({
            date: timestamp,
            calendar: initialzedTime().calendar,
            locale: initialzedTime().locale,
          }).format("hh:mm a - dddd - DD/MM/YYYY")
        : formatTimeAgo(timestamp);
    },
    [dateFormatToggle]
  );
  //#endregion

  //#region تنظیمات Infinite Scroll
  const { isLoadingMore } = useInfiniteScroll<IItem>({
    hasMore: !!props.chatBox.nextMaxId,
    fetchMore: async () => {
      await props.fetchItemData(props.chatBox.ticketId, props.chatBox.nextMaxId);
      return [];
    },
    onDataFetched: () => {},
    getItemId: (item) => item.itemId,
    currentData: props.chatBox.items || [],
    threshold: 100,
    useContainerScroll: true,
    reverseScroll: true,
    fetchDelay: 500,
    enableAutoLoad: false,
    containerRef: chatBoxRef,
  });
  //#endregion

  //#region توابع مدیریت ورودی و اسکرول
  const handleInputOnChange = useCallback((value: string) => {
    setAnswerBox(value);
  }, []);
  const handleBackToButton = useCallback(() => {
    const container = chatBoxRef.current;
    if (container) container.scrollTop = 0;
    setBackToButton(true);
  }, []);
  //#endregion

  //#region توابع مدیریت رویدادها
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFiles: File[] = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        props.onSendFile?.({
          file: droppedFiles[0],
          threadId: props.chatBox.ticketId.toString(),
          igid: props.chatBox.ticketId.toString(),
        });
      }
    },
    [props.chatBox.ticketId, props.onSendFile]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);
  //#endregion

  //#region توابع مدیریت رسانه (تصویر و ویدیو)
  const handleUploadImage = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleImageChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      const file = e.target.files?.[0];

      if (!file) return;

      const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      const validVideoTypes = ["video/mp4"];
      const isValidFile = validImageTypes.includes(file.type) || validVideoTypes.includes(file.type);

      if (isValidFile) {
        props.onSendFile?.({
          file: file,
          threadId: props.chatBox.ticketId.toString(),
          igid: props.chatBox.ticketId.toString(),
        });
      } else {
        notify(ResponseType.Unexpected, NotifType.Warning, "Invalid file type");
      }

      e.target.value = "";
    },
    [props.chatBox.ticketId, props.onSendFile]
  );
  //#endregion

  //#region توابع ارسال پیام
  const handleSendText = useCallback(async () => {
    const text = answerBox.replaceAll("</br>", "\n").trim();
    if (text.length === 0) return;

    try {
      await props.handleSendTicketMessage({
        file: null,
        imageBase64: null,
        itemType: 0,
        text: text,
        ticketId: props.chatBox.ticketId,
        clientContext: crypto.randomUUID(),
      });
      setAnswerBox("");
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error, "Failed to send message");
    }
  }, [answerBox, props.handleSendTicketMessage, props.chatBox.ticketId]);
  //#endregion

  //#region توابع کمکی و محاسبات
  const handleFindEmoji = useCallback((text: string | null) => {
    return detectEmojiOnly(text);
  }, []);

  const sortedItems = useMemo(() => {
    return [...props.chatBox.items].sort((a, b) => b.timeStampUnix - a.timeStampUnix);
  }, [props.chatBox.items]);

  const shouldSendRead = useMemo(() => {
    return (
      props.chatBox.items.length > 0 &&
      !props.chatBox.items[0].sentByFb &&
      props.chatBox.items[0].timeStampUnix > props.chatBox.fbLastSeenUnix
    );
  }, [props.chatBox.items, props.chatBox.fbLastSeenUnix]);

  const handleSendRead = useCallback(async () => {
    if (!isMountedRef.current) return;

    abortControllerRef.current = new AbortController();

    try {
      const res = await clientFetchApi<boolean, boolean>("/api/ticket/SeenSystemTicket", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "ticketId", value: props.chatBox.ticketId.toString() }], onUploadProgress: undefined });

      if (isMountedRef.current && !res.succeeded) {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      if (isMountedRef.current) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    }
  }, [session, props.chatBox.ticketId]);
  //#endregion

  //#region useEffect ها - مدیریت lifecycle و scroll
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const container = chatBoxRef.current;
    if (!container) return;

    const handleScrollForButton = () => {
      setBackToButton(container.scrollTop >= 0);
    };

    container.addEventListener("scroll", handleScrollForButton, { passive: true });
    return () => container.removeEventListener("scroll", handleScrollForButton);
  }, []);

  useEffect(() => {
    handleBackToButton();

    return () => {
      if (shouldSendRead) {
        handleSendRead();
      }
    };
  }, [props.userSelectId, handleBackToButton, shouldSendRead, handleSendRead]);
  //#endregion

  return (
    <>
      {
        //#region بخش هدر
      }
      <header className={styles.header}>
        <button
          type="button"
          onClick={props.showUserList}
          className={styles.backicon}
          aria-label="Back to user list"
          title="Back to user list">
          <svg fill="none" viewBox="0 0 14 11" aria-hidden="true">
            <path
              d="M13 4.4H3.3l3-3A1 1 0 0 0 5 0L.3 4.7A1 1 0 0 0 .3 6l4.6 4.7a1 1 0 0 0 1.4-1.4l-3-3H13a1 1 0 0 0 0-2"
              fill="var(--color-light-blue)"
            />
          </svg>
        </button>
        <div className="instagramprofile">
          <button
            type="button"
            onClick={() => props.onImageClick?.(baseMediaUrl + props.chatBox.profileUrl)}
            aria-label={`View ${props.chatBox.username || props.chatBox.phoneNumber} profile picture`}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            <img
              loading="lazy"
              decoding="async"
              className="instagramimage"
              alt={`${props.chatBox.username || props.chatBox.phoneNumber} profile`}
              src={baseMediaUrl + props.chatBox.profileUrl}
              onError={(e) => {
                const target = e.currentTarget;
                target.src = "/no-profile.svg";
              }}
            />
          </button>
          <div className="instagramprofiledetail">
            <div className="instagramusername">{props.chatBox.username || `+${props.chatBox.phoneNumber}`}</div>
          </div>
        </div>
      </header>
      {
        //#endregion
        //#region بخش چت
      }
      <main
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        ref={chatBoxRef}
        className={styles.chat}
        role="log"
        aria-live="polite"
        aria-label="Chat messages">
        <SystemSendingMessages sendingMessages={props.sendingMessages} />

        {sortedItems.map((v) => (
          <SystemChatWrapper
            key={v.itemId}
            item={v}
            chatBox={props.chatBox}
            ownerInbox={props.ownerInbox}
            baseMediaUrl={baseMediaUrl!}
            onImageContainerClick={props.onImageContainerClick}
            onVideoContainerClick={props.onVideoContainerClick}
            dateFormatToggle={dateFormatToggle}
            toggleDateFormat={toggleDateFormat}
            formatDate={formatDate}
            handleFindEmoji={handleFindEmoji}
          />
        ))}
        {isLoadingMore && (
          <div role="status" aria-label="Loading more messages">
            <RingLoader />
          </div>
        )}
      </main>
      {
        //#endregion
        //#region بخش دکمه بازگشت به آخرین پیام
      }
      {!backToButton && (
        <button
          type="button"
          onClick={handleBackToButton}
          className={styles.goend}
          aria-label="Scroll to latest message"
          title="Scroll to latest message">
          <svg width="11" height="13" viewBox="0 0 11 13" aria-hidden="true">
            <path
              fill="var(--color-white)"
              d="m5.4 13-.8-.4L.3 8.4a1.1 1.1 0 1 1 1.6-1.6l4.2 4.3a1.1 1.1 0 0 1-.7 1.9m.1 0a1 1 0 0 1-1-1l-.1-5.5V1.1a1 1 0 0 1 1-1.1 1 1 0 0 1 1.2 1v10.9a1 1 0 0 1-1 1m0 .1a1.1 1.1 0 0 1-.7-2l4.3-4.2a1.1 1.1 0 0 1 1.5 1.6l-4.2 4.2z"
            />
          </svg>
        </button>
      )}
      {
        //#endregion
        //#region بخش جواب دادن و ارسال پیام
      }
      <footer className={styles.answer} role="form" aria-label="Message input">
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
        <button
          type="button"
          className={styles.uploadbtn}
          onClick={handleUploadImage}
          aria-label="Upload image or video"
          title="Upload image or video">
          <svg viewBox="0 0 13 24" aria-hidden="true">
            <path d="M2.8 22.3a4 4 0 0 1-3-1.4 4 4 0 0 1-1.5-3 5 5 0 0 1 1.4-3.4l7.7-7.7a4 4 0 0 1 1.6-1 4 4 0 0 1 3.7 1 .7.7 0 1 1-1 1 2 2 0 0 0-2.2-.6l-1 .6-7.8 7.8a4 4 0 0 0-1 2.2 3 3 0 0 0 1 2 3 3 0 0 0 3 .8L5 20l8.3-8.4a4 4 0 0 0 1.3-3.1 5 5 0 0 0-1.4-3.1 4.5 4.5 0 0 0-6.3 0l-8.3 8.2a1 1 0 0 1-1 0 1 1 0 0 1 0-1L5.9 4A6 6 0 0 1 10 2.5a6 6 0 0 1 4.2 1.7 6 6 0 0 1 1.9 4.2 6 6 0 0 1-1.8 4.2l-8.2 8.3a5 5 0 0 1-2 1.2z" />
          </svg>
        </button>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,video/mp4"
          onChange={handleImageChange}
          ref={inputRef}
          className={styles.hiddenFileInput}
          aria-label="File upload input"
        />
        <button
          type="button"
          onClick={handleSendText}
          className={styles.sendbtn}
          ref={sendButtonRef}
          disabled={!answerBox.trim()}
          aria-label="Send message"
          title="Send message (Enter)">
          <svg viewBox="-5 -2 25 25" aria-hidden="true">
            <path
              fill="var(--color-ffffff)"
              d="M19.3 11.2 2 20a1.4 1.4 0 0 1-2-2s2.2-4.3 2.8-5.4 1.2-1.4 7.5-2.2a.4.4 0 0 0 0-.8c-6.3-.8-7-1-7.5-2.2L0 2a1.4 1.4 0 0 1 2-2l17.3 8.7a1.3 1.3 0 0 1 0 2.4"
            />
          </svg>
        </button>
      </footer>
      {
        //#endregion
      }
    </>
  );
};

export default SystemChatBox;
