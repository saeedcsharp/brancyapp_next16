//#region واردات کتابخانه‌ها و کامپوننت‌ها
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { HubConnection } from "@microsoft/signalr";
import { useSession } from "next-auth/react";
import router from "next/router";
import { ChangeEvent, KeyboardEvent, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { EmojiClickData } from "emoji-picker-react";
import dynamic from "next/dynamic";
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });
import { DateObject } from "react-multi-date-picker";
import RingLoader from "brancy/components/design/loader/ringLoder";
import Tooltip from "brancy/components/design/tooltip/tooltip";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import { convertHeicToJpeg } from "brancy/helper/convertHeicToJPEG";
import { detectEmojiOnly } from "brancy/helper/emojiDetector";
import formatTimeAgo from "brancy/helper/formatTimeAgo";
import initialzedTime from "brancy/helper/manageTimer";
import { useInfiniteScroll } from "brancy/helper/useInfiniteScroll";
import { LanguageKey } from "brancy/i18n";
import { MethodType, UploadFile } from "brancy/helper/api";
import VoiceRecorder from "brancy/components/messages/popups/voiceRecorder";
import { LeftChatWrapper } from "brancy/components/messages/ticket/chatComponents/LeftChatWrapper";
import { RightChatWrapper } from "brancy/components/messages/ticket/chatComponents/RightChatWrapper";
import { TicketPendingMessages } from "brancy/components/messages/ticket/chatComponents/shared/messageTypes/TicketPendingMessages";
import styles from "./ticketChatBox.module.css";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import {
  IDirectMessageItem,
  IDirectOwnerInbox,
  IReplyTicket,
  IReplyTicket_Media,
  IThread_Ticket,
  IUploadVoice,
} from "brancy/models/interfaces";
import { ItemType, StatusReplied } from "brancy/models/enums";
import { setDraft, getDraft, removeDraft, draftKey } from "../../../helper/draftStorage";
//#endregion

//#region تعریف کامپوننت و Props
const DirectChatBox = (props: {
  userSelectId: number | null;
  hub: HubConnection | null;
  chatBox: IThread_Ticket;
  replyItems: IReplyTicket;
  showIcon: string;
  ownerInbox: IDirectOwnerInbox;
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
  const baseMediaUrl = getClientMediaBaseUrl();
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
  const [seenItem, setSeenItem] = useState<IDirectMessageItem | null>(null);
  const [editText, setEditText] = useState<{
    ticketId: number;
    index: number;
  } | null>(null);
  const emojiPickerContainerRef = useRef<HTMLDivElement | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const showEmojiPickerRef = useRef(showEmojiPicker);
  const showUserListRef = useRef(props.showUserList);
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
  const { isLoadingMore } = useInfiniteScroll<IDirectMessageItem>({
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
  const handleEmojiClick = useCallback(
    (emojiData: EmojiClickData) => {
      const emoji = emojiData.emoji;
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart ?? answerBox.length;
        const end = textarea.selectionEnd ?? answerBox.length;
        const newValue = answerBox.slice(0, start) + emoji + answerBox.slice(end);
        handleInputOnChange(newValue);
        // restore cursor after emoji insertion
        requestAnimationFrame(() => {
          textarea.focus();
          const newPos = start + emoji.length;
          textarea.setSelectionRange(newPos, newPos);
        });
      } else {
        handleInputOnChange(answerBox + emoji);
      }
    },
    [answerBox, handleInputOnChange],
  );
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
            mediaUrl = item.audio.externalUrl || `${baseMediaUrl}${item.audio.url}`;
          } else if (item.medias && item.medias.length > 0) {
            if (item.medias[0].image) {
              mediaUrl =
                item.medias[0].image.previewUrl.externalUrl || `${baseMediaUrl}${item.medias[0].image.previewUrl.url}`;
            } else if (item.medias[0].video) {
              mediaUrl =
                item.medias[0].video.previewUrl.externalUrl || `${baseMediaUrl}${item.medias[0].video.previewUrl.url}`;
            }
          } else if (item.mediaShares && item.mediaShares.length > 0) {
            mediaUrl = item.mediaShares[0].externalUrl || `${baseMediaUrl}${item.mediaShares[0].url}`;
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
  const handleTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendText();
      }
    },
    [handleSendText],
  );
  //#endregion

  //#region توابع کمکی پاسخ و خواندن پیام استفاده از detectEmojiOnly برای تشخیص emoji
  const handleFindEmoji = (text: string | null) => {
    return detectEmojiOnly(text);
  };

  const handleSpecifyRepliedItemFullName = useMemo(
    () => (itemId: string, repItem: IDirectMessageItem | null) => {
      const item = repItem || props.chatBox.items.find((x) => x.itemId === itemId);
      if (!item) return "";
      return item.sentByOwner ? props.ownerInbox.username!! : props.chatBox.recp.username!!;
    },
    [props.ownerInbox.username, props.chatBox.recp.username, props.chatBox.items],
  );

  const handleSpecifyRepliedItemType = useMemo(
    () => (repItemId: string, repItem: IDirectMessageItem | null) => {
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
  // keep refs up-to-date so single listeners can read latest values
  useEffect(() => {
    showEmojiPickerRef.current = showEmojiPicker;
  }, [showEmojiPicker]);

  useEffect(() => {
    showUserListRef.current = props.showUserList;
  }, [props.showUserList]);

  // single robust listener for Escape and outside clicks (works with portals)
  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showEmojiPickerRef.current) {
          setShowEmojiPicker(false);
        } else {
          showUserListRef.current();
        }
      }
    };

    const handlePointerDown = (event: globalThis.MouseEvent | globalThis.PointerEvent) => {
      if (!showEmojiPickerRef.current) return;
      const container = emojiPickerContainerRef.current;
      if (!container) return;
      const target = event.target as Node;
      const path: EventTarget[] | undefined = (event as any).composedPath?.();
      if (path && path.length) {
        // if any element in the event path is the container, it's an inside click
        if (path.some((el) => el === container)) return;
      } else {
        if (container.contains(target)) return;
      }
      setShowEmojiPicker(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    // use pointerdown in capture to reliably detect outside clicks, even for portals
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [answerBox]);
  // localStorage-based draft storage
  useEffect(() => {
    if (!props.chatBox) return;
    const key = draftKey(props.chatBox.ticketId);
    const draft = getDraft(key);
    if (draft) setAnswerBox(draft.text);
  }, [props.chatBox?.ticketId]);
  useEffect(() => {
    if (!props.chatBox) return;
    const key = draftKey(props.chatBox.ticketId);
    const t = setTimeout(() => {
      if (answerBox?.trim()) {
        setDraft(key, answerBox);
      } else {
        removeDraft(key);
      }
    }, 800);
    return () => clearTimeout(t);
  }, [answerBox, props.chatBox?.ticketId]);

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
                <>
                  <div
                    className={styles.answercontainer}
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendText();
                    }}>
                    <button
                      type="button"
                      className={styles.answeruploadbtn}
                      onClick={handleUploadImage}
                      aria-label={t(LanguageKey.uploadFile)}>
                      <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                        <path d="M29.1 4.4a10 10 0 0 1 2.8 6.2v.4a9 9 0 0 1-2.8 6.7L15 31.8q-1.5 1.3-3.1 1.9l-1.8.3H10a7 7 0 0 1-4.8-2.1A7 7 0 0 1 2.8 27a8 8 0 0 1 2.3-5L18.3 8.8q1-.8 2.2-1.4l.3-.1a5 5 0 0 1 5.7 1.4.7.7 0 0 1-.2 1.3 1 1 0 0 1-.9-.2 4 4 0 0 0-3.7-1.2h-.3q-1.1.4-2 1.2L6.2 23a7 7 0 0 0-1.8 4.1 5 5 0 0 0 1.8 3.7 5 5 0 0 0 5.3 1.4 7 7 0 0 0 2.5-1.4l14-14.2a8 8 0 0 0 2.4-5.6v-.4a8 8 0 0 0-13.6-5.2l-14 14.1a.7.7 0 0 1-1.1-1l14-14.1a9.5 9.5 0 0 1 13.4 0Z" />
                      </svg>
                    </button>
                    <input
                      type="file"
                      accept="image/jpeg,video/mp4"
                      onChange={handleImageChange}
                      ref={inputRef}
                      style={{ display: "none" }}
                      aria-hidden="true"
                    />
                    <div className={styles.textareaWrapper} ref={emojiPickerContainerRef}>
                      {showEmojiPicker && (
                        <div className={styles.emojiPickerPopup}>
                          <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            theme={"auto" as any}
                            lazyLoadEmojis
                            reactionsDefaultOpen
                            allowExpandReactions
                            previewConfig={{ showPreview: false }}
                            height={350}
                            width={300}
                          />
                        </div>
                      )}
                      <textarea
                        ref={textareaRef}
                        value={answerBox}
                        onChange={(e) => handleInputOnChange(e.target.value)}
                        onKeyDown={handleTextareaKeyDown}
                        placeholder={t(LanguageKey.typeAMessage)}
                        className={styles.chatTextarea}
                        rows={1}
                        aria-label={t(LanguageKey.typeAMessage)}
                      />
                      <button
                        type="button"
                        className={styles.Emojiuploadbtn}
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                        aria-label="emoji picker">
                        <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                          <path
                            d="M10.45 21.32s2.82 3.29 6.58 3.29 6.58-3.3 6.58-3.3m-1.88-6.57a.47.47 0 1 1-.94 0 .47.47 0 0 1 .94 0Zm-8.46 0a.47.47 0 1 1-.94 0 .47.47 0 0 1 .94 0ZM33 18.5a15.5 15.5 0 1 1-31 0 15.5 15.5 0 0 1 31 0Z"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleClickOnVoiceIcon}
                      className={styles.answeruploadbtn}
                      aria-label={t(LanguageKey.recordVoiceMessage)}>
                      <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                        <path d="M29 16q0 5.1-3.4 8.7-3.3 3.7-8.1 3.7m0 0c-3 0-6-1.3-8.1-3.7A13 13 0 0 1 6 16m11.5 12.4V33m0 0h4.3m-4.3 0h-4.3M25 10.5v6a7.5 7.5 0 0 1-15 0v-6a7.5 7.5 0 0 1 15 0Z" />
                      </svg>
                    </button>

                    <svg
                      type="submit"
                      onClick={handleSendText}
                      className={styles.answersendbtn}
                      aria-label={t(LanguageKey.sendMessage)}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 36 36">
                      <path d="M18 36a18 18 0 1 0 0-36 18 18 0 0 0 0 36" fill="var(--color-dark-blue)" />
                      <path
                        d="m26.4 18.97-13.84 6.92a1.08 1.08 0 0 1-1.45-1.45l2.19-4.37c.47-.91 1.01-1.07 6.03-1.72a.35.35 0 0 0 0-.7c-5.02-.65-5.56-.8-6.03-1.71l-2.19-4.38a1.08 1.08 0 0 1 1.45-1.45l13.84 6.93a1.08 1.08 0 0 1 0 1.93"
                        fill="#fff"
                      />
                    </svg>
                  </div>
                </>
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
