//#region واردات کتابخانه‌ها و کامپوننت‌ها
import { HubConnection } from "@microsoft/signalr";
import { useSession } from "next-auth/react";
import router from "next/router";
import { ChangeEvent, KeyboardEvent, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import InputEmoji from "react-input-emoji";
import { DateObject } from "react-multi-date-picker";
import RingLoader from "saeed/components/design/loader/ringLoder";
import Tooltip from "saeed/components/design/tooltip/tooltip";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import { convertHeicToJpeg } from "saeed/helper/convertHeicToJPEG";
import { detectEmojiOnly } from "saeed/helper/emojiDetector";
import formatTimeAgo from "saeed/helper/formatTimeAgo";
import initialzedTime from "saeed/helper/manageTimer";
import { useInfiniteScroll } from "saeed/helper/useInfiniteScroll";
import { LanguageKey } from "saeed/i18n";
import { MethodType, UploadFile } from "saeed/helper/api";
import { ItemType, StatusReplied } from "saeed/models/messages/enum";
import {
  IItem,
  IOwnerInbox,
  IReplyTicket,
  IReplyTicket_Media,
  IThread_Ticket,
  IUploadVoice,
} from "saeed/models/messages/IMessage";
import VoiceRecorder from "../popups/voiceRecorder";
import { LeftChatWrapper } from "./chatComponents/LeftChatWrapper";
import { RightChatWrapper } from "./chatComponents/RightChatWrapper";
import { TicketPendingMessages } from "./chatComponents/shared/messageTypes/TicketPendingMessages";
import styles from "./ticketChatBox.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
//#endregion

//#region تعریف کامپوننت و Props
const DirectChatBox = (props: {
  userSelectId: number | null;
  hub: HubConnection | null;
  chatBox: IThread_Ticket;
  replyItems: IReplyTicket;
  showIcon: string;
  ownerInbox: IOwnerInbox;
  replyLoading: boolean;
  showUserList: () => void;
  handleShowIcon: (e: MouseEvent) => void;
  handlePendingReplies: (ticketId: number, media: IReplyTicket_Media) => void;
  fetchItemData: (chatBox: IThread_Ticket) => Promise<void>;
  handleSendReplies: (ticketId: number) => Promise<void>;
  handleEditText: (text: string, ticketId: number, index: number) => void;
  handleDeleteMedia: (ticketId: number, index: number) => void;
  onImageClick?: (imageUrl: string) => void;
  onImageContainerClick?: (info: { url: string; height: number; width: number }) => void;
  onVideoContainerClick?: (info: { url: string; height: number; width: number; isExpired: boolean }) => void;
  onSendFile?: (sendFile: { file: File; threadId: string; igid: string }) => void;
  onSendVideoFile?: (sendVideo: { file: File; threadId: string; igid: string }) => void;
}) => {
  //#endregion

  //#region Session و تنظیمات اولیه
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
  const useExternalUrl = process.env.NEXT_PUBLIC_USE_EXTERNAL_MESSAGE_URL === "true";
  const { t } = useTranslation();
  //#endregion

  //#region متغیرهای State و Ref
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dateFormatToggle, setDateFormatToggle] = useState("");
  const [answerBox, setAnswerBox] = useState<string>("");
  const [backToButton, setBackToButton] = useState<boolean>(true);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState<boolean>(false);
  const [lock, setLock] = useState(false);
  const [seenItem, setSeenItem] = useState<IItem | null>(null);
  const [editText, setEditText] = useState<{
    ticketId: number;
    index: number;
  } | null>(null);
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
    [dateFormatToggle],
  );
  //#endregion

  //#region تنظیمات Infinite Scroll
  const { isLoadingMore } = useInfiniteScroll<IItem>({
    hasMore: !!props.chatBox.nextMaxId,
    fetchMore: async () => {
      await props.fetchItemData(props.chatBox);
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

  //#region useMemo برای بهینه‌سازی
  const sortedItems = useMemo(
    () => [...props.chatBox.items].sort((a, b) => b.createdTime - a.createdTime),
    [props.chatBox.items],
  );
  //#endregion

  //#region توابع مدیریت ورودی و اسکرول
  const handleInputOnChange = (value: string) => {
    setAnswerBox(value);
  };

  const handleBackToButton = () => {
    const container = chatBoxRef.current;
    if (container) container.scrollTop = 0;
    setBackToButton(true);
  };
  //#endregion

  //#region توابع مدیریت پیام و رویدادها
  const handleClickSubIcon = useCallback(
    async (iconId: string, chatId: string) => {
      const item = props.chatBox.items.find((x) => x.itemId === chatId);
      if (!item || !props.hub) return;
      switch (iconId) {
        case "Copy":
          navigator.clipboard.writeText(item.text);
          break;
        case "Download":
          let mediaUrl = "";
          if (item.audio) {
            mediaUrl = item.audio.externalUrl || `https://ilink.influe.ir${item.audio.url}`;
          } else if (item.medias && item.medias.length > 0) {
            if (item.medias[0].image) {
              mediaUrl =
                item.medias[0].image.previewUrl.externalUrl ||
                `https://ilink.influe.ir${item.medias[0].image.previewUrl.url}`;
            } else if (item.medias[0].video) {
              mediaUrl =
                item.medias[0].video.previewUrl.externalUrl ||
                `https://ilink.influe.ir${item.medias[0].video.previewUrl.url}`;
            }
          } else if (item.mediaShares && item.mediaShares.length > 0) {
            mediaUrl = item.mediaShares[0].externalUrl || `https://ilink.influe.ir${item.mediaShares[0].url}`;
          }
          if (mediaUrl) {
            window.open(mediaUrl, "_blank");
          }
          break;
        case "React":
          await props.hub?.send("SendReaction", props.chatBox.recp.igId, item.itemId);
          break;
        case "UnReact":
          await props.hub?.send("SendUnReaction", props.chatBox.recp.igId, item.itemId);
          break;
      }
    },
    [props.chatBox.items, props.chatBox.recp.igId, props.hub],
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles: File[] = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      // Handle file drop if needed
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);
  //#endregion

  //#region توابع مدیریت رسانه (تصویر، ویدیو، صدا)
  const handleUploadImage = useCallback(() => {
    inputRef.current?.click();
  }, []);
  const handleImageChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      const fileInput = e.target.files?.[0];
      if (!fileInput) return;
      const file = await convertHeicToJpeg(fileInput);
      if (!file) return;
      if (file.type.startsWith("image/") || file.type.length === 0) {
        props.onSendFile?.({
          file,
          threadId: props.chatBox.threadId,
          igid: props.chatBox.recp.igId,
        });
      } else if (file.type === "video/mp4" || file.type === "video/quicktime") {
        props.onSendVideoFile?.({
          file,
          threadId: props.chatBox.threadId,
          igid: props.chatBox.recp.igId,
        });
      }
      e.target.value = "";
    },
    [props.chatBox.threadId, props.chatBox.recp.igId, props.onSendFile, props.onSendVideoFile],
  );
  const handleClickOnVoiceIcon = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setShowVoiceRecorder(true);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error, "Microphone access denied");
    }
  };

  const handleSendVoice = async (uploadVoice: IUploadVoice) => {
    setShowVoiceRecorder(false);
    const res = await UploadFile(session, uploadVoice.file);
    props.handlePendingReplies(props.chatBox.ticketId, {
      itemType: ItemType.AudioShare,
      mediaBase64: ("data:video/mp4;base64," + uploadVoice.voiceBase64) as string,
      mediaId: res.fileName,
      mediaType: null,
      text: null,
    });
  };
  //#endregion

  //#region توابع ارسال پیام
  const handleSendText = async () => {
    try {
      const text = answerBox.replaceAll("</br>", "\n");
      if (text.length === 0) return;
      if (!editText) {
        props.handlePendingReplies(props.chatBox.ticketId, {
          itemType: ItemType.Text,
          mediaBase64: null,
          mediaId: null,
          mediaType: null,
          text: text,
        });
      } else {
        props.handleEditText(text, editText.ticketId, editText.index);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error, "socket error");
    } finally {
      setEditText(null);
      setAnswerBox("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && editText) {
      setEditText(null);
      setAnswerBox("");
    }
    if (e.key === "Enter" && !e.shiftKey && answerBox.trim().length > 0) {
      e.preventDefault();
      handleSendText();
    }
  };
  //#endregion

  //#region توابع کمکی پاسخ و خواندن پیام استفاده از detectEmojiOnly برای تشخیص emoji
  const handleFindEmoji = (text: string | null) => {
    return detectEmojiOnly(text);
  };

  const handleSpecifyRepliedItemFullName = useMemo(
    () => (itemId: string, repItem: IItem | null) => {
      const item = repItem || props.chatBox.items.find((x) => x.itemId === itemId);
      if (!item) return "";
      return item.sentByOwner ? props.ownerInbox.username!! : props.chatBox.recp.username!!;
    },
    [props.ownerInbox.username, props.chatBox.recp.username, props.chatBox.items],
  );

  const handleSpecifyRepliedItemType = useMemo(
    () => (repItemId: string, repItem: IItem | null) => {
      const item = repItem || props.chatBox.items.find((x) => x.itemId === repItemId);
      if (!item) return "";
      return item.itemType === ItemType.Text ? item.text : ItemType[item.itemType];
    },
    [props.chatBox.items],
  );
  const handleSendRead = async () => {
    if (!props.hub) return;
    try {
      await clientFetchApi<boolean, boolean>("/api/ticket/ReadFbTicket", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [{ key: "ticketId", value: props.chatBox.ticketId.toString() }],
        onUploadProgress: undefined,
      });
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  };

  const handlEditText = (text: string, ticketId: number, index: number) => {
    setAnswerBox(text);
    setEditText({ index, ticketId });
  };
  //#endregion

  //#region useEffect ها - مدیریت backToButton و خواندن پیام
  // Manage backToButton with scroll
  useEffect(() => {
    const container = chatBoxRef.current;
    if (!container) return;
    const handleScrollForButton = () => {
      if (container.scrollTop < 0) {
        setBackToButton(false);
      } else {
        setBackToButton(true);
      }
    };
    container.addEventListener("scroll", handleScrollForButton);
    return () => container.removeEventListener("scroll", handleScrollForButton);
  }, []);
  useEffect(() => {
    setLock(false);
    handleBackToButton();
    if (!props.chatBox.items.find((x) => x.createdTime > props.chatBox.lastSeenTicketUnix)) {
      setLock(true);
    }
    if (!props.hub) return;
    if (
      props.chatBox.items.length > 0 &&
      !props.chatBox.items[0].sentByOwner &&
      props.chatBox.items[0].createdTime > props.chatBox.lastSeenTicketUnix
    ) {
      handleSendRead();
    }
    return () => {
      setSeenItem(null);
    };
  }, [props.userSelectId, props.chatBox, props.hub, handleBackToButton, handleSendRead]);
  //#endregion

  return (
    <>
      {
        //#region بخش هدر
      }
      <div className={styles.header}>
        <button onClick={props.showUserList} className={styles.backicon} aria-label="Back to user list" type="button">
          <svg fill="none" viewBox="0 0 14 11" aria-hidden="true">
            <path
              d="M13 4.4H3.3l3-3A1 1 0 0 0 5 0L.3 4.7A1 1 0 0 0 .3 6l4.6 4.7a1 1 0 0 0 1.4-1.4l-3-3H13a1 1 0 0 0 0-2"
              fill="var(--color-light-blue)"
            />
          </svg>
        </button>
        <div className="instagramprofile">
          <img
            className="instagramimage"
            alt="profile image"
            src={baseMediaUrl + props.chatBox.recp.profilePic}
            onClick={() => props.onImageClick?.(baseMediaUrl + props.chatBox.recp.profilePic)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/no-profile.svg";
            }}
          />
          <div className="instagramprofiledetail">
            <div className="instagramusername">{props.chatBox.recp.name || ""}</div>
            <div className="instagramid">@{props.chatBox.recp.username}</div>
          </div>
        </div>
      </div>
      {
        //#endregion
        //#region بخش چت
      }
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        ref={chatBoxRef}
        className={styles.chat}
        role="log"
        aria-live="polite"
        aria-label="Chat messages">
        {/* Pending Messages */}
        {props.replyItems && props.replyItems.medias.length > 0 && (
          <TicketPendingMessages
            replyItems={props.replyItems.medias}
            replyLoading={props.replyLoading}
            ticketId={props.chatBox.ticketId}
            handleEditText={handlEditText}
            handleDeleteMedia={props.handleDeleteMedia}
            handleSendReplies={props.handleSendReplies}
          />
        )}
        {/* Chat Items */}
        {sortedItems.map((v) => (
          <div key={v.itemId}>
            {!v.sentByOwner ? (
              <LeftChatWrapper
                item={v}
                chatBox={props.chatBox}
                ownerInbox={props.ownerInbox}
                seenItem={seenItem}
                lock={lock}
                baseMediaUrl={baseMediaUrl!}
                useExternalUrl={useExternalUrl}
                onClickSubIcon={handleClickSubIcon}
                onImageContainerClick={props.onImageContainerClick}
                onVideoContainerClick={props.onVideoContainerClick}
                dateFormatToggle={dateFormatToggle}
                toggleDateFormat={toggleDateFormat}
                formatDate={formatDate}
                handleFindEmoji={handleFindEmoji}
                handleSpecifyRepliedItemFullName={handleSpecifyRepliedItemFullName}
                handleSpecifyRepliedItemType={handleSpecifyRepliedItemType}
              />
            ) : (
              <RightChatWrapper
                item={v}
                chatBox={props.chatBox}
                ownerInbox={props.ownerInbox}
                baseMediaUrl={baseMediaUrl!}
                useExternalUrl={useExternalUrl}
                onClickSubIcon={handleClickSubIcon}
                onImageContainerClick={props.onImageContainerClick}
                onVideoContainerClick={props.onVideoContainerClick}
                dateFormatToggle={dateFormatToggle}
                toggleDateFormat={toggleDateFormat}
                formatDate={formatDate}
                handleFindEmoji={handleFindEmoji}
                handleSpecifyRepliedItemFullName={handleSpecifyRepliedItemFullName}
                handleSpecifyRepliedItemType={handleSpecifyRepliedItemType}
              />
            )}
          </div>
        ))}
        {isLoadingMore && <RingLoader />}
      </div>
      {
        //#endregion
        //#region بخش دکمه بازگشت به آخرین پیام
      }
      {!backToButton && (
        <button
          onClick={handleBackToButton}
          className={styles.goend}
          aria-label="Scroll to latest message"
          type="button">
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
      <>
        {!showVoiceRecorder && (
          <>
            {props.chatBox.isActive &&
              (props.chatBox.status === StatusReplied.JustCreated ||
                props.chatBox.status === StatusReplied.UserReplied) && (
                <div className={styles.answer} onKeyDown={handleKeyDown}>
                  <InputEmoji
                    theme="auto"
                    value={answerBox}
                    shouldReturn={true}
                    onChange={handleInputOnChange}
                    keepOpened={true}
                    onEnter={handleSendText}
                    placeholder={t("Type a message")}
                    shouldConvertEmojiToImage={false}
                  />
                  <button
                    className={styles.uploadbtn}
                    onClick={handleUploadImage}
                    aria-label="Upload file"
                    type="button">
                    <svg viewBox="0 0 13 24" aria-hidden="true">
                      <path d="M2.8 22.3a4 4 0 0 1-3-1.4 4 4 0 0 1-1.5-3 5 5 0 0 1 1.4-3.4l7.7-7.7a4 4 0 0 1 1.6-1 4 4 0 0 1 3.7 1 .7.7 0 1 1-1 1 2 2 0 0 0-2.2-.6l-1 .6-7.8 7.8a4 4 0 0 0-1 2.2 3 3 0 0 0 1 2 3 3 0 0 0 3 .8L5 20l8.3-8.4a4 4 0 0 0 1.3-3.1 5 5 0 0 0-1.4-3.1 4.5 4.5 0 0 0-6.3 0l-8.3 8.2a1 1 0 0 1-1 0 1 1 0 0 1 0-1L5.9 4A6 6 0 0 1 10 2.5a6 6 0 0 1 4.2 1.7 6 6 0 0 1 1.9 4.2 6 6 0 0 1-1.8 4.2l-8.2 8.3a5 5 0 0 1-2 1.2z" />
                    </svg>
                  </button>
                  <input
                    type="file"
                    accept="image/jpeg,video/mp4"
                    onChange={handleImageChange}
                    ref={inputRef}
                    style={{ display: "none" }}
                    aria-label="File input"
                  />

                  <button
                    onClick={handleClickOnVoiceIcon}
                    className={styles.voicebtn}
                    aria-label="Record voice message"
                    type="button">
                    <svg viewBox="0 0 15 22" aria-hidden="true">
                      <path d="M8 15.4a4.3 4.3 0 0 0 4.3-4.3V4.3a4.2 4.2 0 1 0-8.5 0v6.8a4.3 4.3 0 0 0 4.3 4.3m-2.8-11a2.9 2.9 0 0 1 5.8 0V11a2.9 2.9 0 0 1-5.8 0Zm10.4 6.3v.4A7.5 7.5 0 0 1 9 18.6h-.1v2h3.5l.5.3a.7.7 0 0 1-.5 1.2H3.8a.7.7 0 0 1 0-1.5h3.6v-2h-.2a7.5 7.5 0 0 1-6.6-7.5v-.4l.2-.5.5-.3.5.3.2.5v.4a6 6 0 1 0 12.2 0v-.4l.2-.5a1 1 0 0 1 1 0z" />
                    </svg>
                  </button>

                  <button
                    onClick={handleSendText}
                    className={styles.sendbtn}
                    aria-label="Send message"
                    type="button"
                    disabled={answerBox.trim().length === 0}>
                    <svg viewBox="-5 -2 25 25" aria-hidden="true">
                      <path
                        fill="var(--color-ffffff)"
                        d="M19.3 11.2 2 20a1.4 1.4 0 0 1-2-2s2.2-4.3 2.8-5.4 1.2-1.4 7.5-2.2a.4.4 0 0 0 0-.8c-6.3-.8-7-1-7.5-2.2L0 2a1.4 1.4 0 0 1 2-2l17.3 8.7a1.3 1.3 0 0 1 0 2.4"
                      />
                    </svg>
                  </button>
                </div>
              )}

            {props.chatBox.status === StatusReplied.InstagramerReplied && (
              <div className={styles.blockeduser}>
                <div className={styles.blockeduserbtn}>{t(LanguageKey.waitingforuserresponse)}</div>
              </div>
            )}
            {!props.chatBox.isActive &&
              props.chatBox.status !== StatusReplied.InstagramerClosed &&
              props.chatBox.status !== StatusReplied.UserClosed && (
                <div className={styles.blockeduser}>
                  <div className={styles.blockeduserbtn}>{t(LanguageKey.inactiveticketexpired)}</div>
                  <Tooltip
                    tooltipValue={t(LanguageKey.notactivemessageexplain)}
                    position="top"
                    onClick
                    className={styles.notactiveexplain}>
                    <svg width="25px" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                      <path
                        opacity=".3"
                        d="M18 1.88c-8.86 0-16.12 6.88-16.12 15.47a15 15 0 0 0 4.4 10.62c.4.4.53.83.47 1.14a7 7 0 0 1-1.4 3.02 1.13 1.13 0 0 0 .67 1.82c2.42.45 4.92.04 7.07-1.1l.75-.4a.5.5 0 0 1 .3-.04l.75.13q1.55.3 3.11.29c8.86 0 16.13-6.9 16.13-15.48 0-8.6-7.27-15.48-16.13-15.48"
                        fill="var(--color-dark-red)"
                      />
                      <path
                        d="M18 12.75c-1.02 0-1.5.68-1.5 1.14a1.5 1.5 0 1 1-3 0c0-2.46 2.2-4.14 4.5-4.14s4.5 1.68 4.5 4.14a4 4 0 0 1-.76 2.3q-.46.6-.88 1.05l-.16.17q-.34.36-.62.7c-.48.58-.58.88-.58 1.05v.66a1.5 1.5 0 1 1-3 0v-.66c0-1.28.71-2.3 1.27-2.97q.38-.45.74-.83l.14-.15q.41-.44.66-.78a1 1 0 0 0 .19-.54c0-.46-.48-1.14-1.5-1.14m-1.5 12c0-.83.67-1.5 1.5-1.5h.02a1.5 1.5 0 1 1 0 3H18a1.5 1.5 0 0 1-1.5-1.5"
                        fill="var(--color-dark-red)"
                      />
                    </svg>
                  </Tooltip>
                </div>
              )}
            {(props.chatBox.status === StatusReplied.InstagramerClosed ||
              props.chatBox.status === StatusReplied.UserClosed) && (
              <div className={styles.blockeduser}>
                <div className={styles.blockeduserbtn}>
                  {props.chatBox.status === StatusReplied.InstagramerClosed
                    ? `${t(LanguageKey.Ticketclosedby)} ${t(LanguageKey.admin)}`
                    : `${t(LanguageKey.Ticketclosedby)} ${t(LanguageKey.user)}`}
                </div>
              </div>
            )}
          </>
        )}
        {showVoiceRecorder && (
          <VoiceRecorder
            threadId={props.chatBox.threadId}
            closeVoiceRecorder={() => setShowVoiceRecorder(false)}
            sendVoice={handleSendVoice}
          />
        )}
      </>
      {
        //#endregion
      }
    </>
  );
};

export default DirectChatBox;
