//#region واردات کتابخانه‌ها و کامپوننت‌ها
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { HubConnection, HubConnectionState } from "@microsoft/signalr";
import { t } from "i18next";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import router from "next/router";
import { ChangeEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EmojiClickData } from "emoji-picker-react";
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });
import { DateObject } from "react-multi-date-picker";
import { draftKey, getDraft, setDraft, removeDraft } from "brancy/helper/draftStorage";
import RingLoader from "brancy/components/design/loader/ringLoder";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "brancy/components/notifications/notificationBox";
import { getMessageDirectionClass } from "brancy/helper/checkRtl";
import { convertHeicToJpeg } from "brancy/helper/convertHeicToJPEG";
import { detectEmojiOnly } from "brancy/helper/emojiDetector";
import formatTimeAgo from "brancy/helper/formatTimeAgo";
import initialzedTime from "brancy/helper/manageTimer";
import { truncateTextToBytes } from "brancy/helper/textByteLength";
import { useInfiniteScroll } from "brancy/helper/useInfiniteScroll";
import { LanguageKey } from "brancy/i18n";
import { UploadFile } from "brancy/helper/api";
import Tooltip from "brancy/components/design/tooltip/tooltip";
import VoiceRecorder from "brancy/components/messages/popups/voiceRecorder";
import { LeftChatWrapper } from "brancy/components/messages/direct/chatComponents/LeftChatWrapper";
import { RightChatWrapper } from "brancy/components/messages/direct/chatComponents/RightChatWrapper";
import { ChatSending } from "brancy/components/messages/direct/chatComponents/shared/messageTypes/ChatSending";
import styles from "./directChatBox.module.css";
import { ItemType } from "brancy/models/enums";
import {
  IThread,
  IIsSendingMessage,
  IUploadVoice,
  IDirectOwnerInbox,
  IDirectMessageItem,
} from "brancy/models/interfaces";
//#endregion

//#region تعریف کامپوننت و Props
const MAX_MESSAGE_BYTES = 1000;

const DirectChatBox = memo(
  (props: {
    userSelectId: string | null;
    hub: HubConnection | null;
    chatBox: IThread;
    sendingMessages: IIsSendingMessage[];
    ownerInbox: IDirectOwnerInbox;
    showUserList: () => void;
    handleSendMessage: (message: IIsSendingMessage) => void;
    fetchItemData: (chatBox: IThread) => Promise<void>;
    onImageClick?: (imageUrl: string) => void;
    onImageContainerClick?: (info: { url: string; height: number; width: number }) => void;
    onVideoContainerClick?: (info: { url: string; height: number; width: number; isExpired: boolean }) => void;
    onSendFile?: (sendFile: { file: File; threadId: string; igid: string }) => void;
    onSendVideoFile?: (sendVideo: { file: File; threadId: string; igid: string }) => void;
  }) => {
    //#endregion

    //#region Session و تنظیمات اولیه
    const { data: session } = useSession();
    //#endregion

    //#region متغیرهای State و Ref
    const baseMediaUrl = getClientMediaBaseUrl();
    const useExternalUrl = process.env.NEXT_PUBLIC_USE_EXTERNAL_MESSAGE_URL === "true";
    const unixTypingTimeRef = useRef<number>(0);
    const chatBoxRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [answerBox, setAnswerBox] = useState<string>("");
    const [backToButton, setBackToButton] = useState<boolean>(true);
    const [showVoiceRecorder, setShowVoiceRecorder] = useState<boolean>(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const [lock, setLock] = useState(false);
    const [seenItem, setSeenItem] = useState<IDirectMessageItem | null>(null);
    const [dateFormatToggle, setDateFormatToggle] = useState("");
    const prevUserSelectIdRef = useRef<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const emojiPickerContainerRef = useRef<HTMLDivElement | null>(null);
    // load draft for this thread when selected
    useEffect(() => {
      if (!props.chatBox) return;
      const key = draftKey(props.chatBox.threadId);
      const draft = getDraft(key);
      if (draft) setAnswerBox(truncateTextToBytes(draft.text, MAX_MESSAGE_BYTES));
    }, [props.chatBox?.threadId]);

    // save draft to localStorage with debounce
    useEffect(() => {
      if (!props.chatBox) return;
      const key = draftKey(props.chatBox.threadId);
      const t = setTimeout(() => {
        if (answerBox?.trim()) {
          setDraft(key, answerBox);
        } else {
          removeDraft(key);
        }
      }, 800);
      return () => clearTimeout(t);
    }, [answerBox, props.chatBox?.threadId]);
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
    // استفاده از useInfiniteScroll برای لود کردن پیام‌های بیشتر
    const { isLoadingMore } = useInfiniteScroll<IDirectMessageItem>({
      hasMore: !!props.chatBox.nextMaxId,
      fetchMore: async () => {
        await props.fetchItemData(props.chatBox);
        return []; // داده‌ها از طریق props.chatBox.items به‌روز می‌شود
      },
      onDataFetched: () => {
        // داده‌ها قبلاً از طریق props.chatBox به‌روز شده‌اند
      },
      getItemId: (item) => item.itemId,
      currentData: props.chatBox.items,
      threshold: 300,
      useContainerScroll: true,
      reverseScroll: true,
      fetchDelay: 500,
      enableAutoLoad: false,
      containerRef: chatBoxRef,
    });
    //#endregion

    //#region توابع مدیریت ورودی و اسکرول
    const handleInputOnChange = useCallback(
      (value: string) => {
        const limitedValue = truncateTextToBytes(value, MAX_MESSAGE_BYTES);
        const cleanValue = limitedValue.replace("\n", "").replace("</br>", "");
        if (value.length === 0 || cleanValue.length === 0) {
          if (Date.now() < unixTypingTimeRef.current + 8000) {
            if (props.hub?.state === HubConnectionState.Connected) {
              props.hub.send("SendTypingOff", props.chatBox.recp.igId);
            }
          }
          unixTypingTimeRef.current = 0;
          setAnswerBox(limitedValue);
          return;
        } else if (Date.now() > unixTypingTimeRef.current + 8000) {
          if (props.hub?.state === HubConnectionState.Connected) {
            props.hub.send("SendTypingOn", props.chatBox.recp.igId);
          }
          unixTypingTimeRef.current = Date.now();
        }
        setAnswerBox(limitedValue);
      },
      [props.hub, props.chatBox.recp.igId],
    );

    const handleBackToButton = useCallback(() => {
      const container = chatBoxRef.current;
      if (container) container.scrollTop = 0;
      setBackToButton(true);
    }, []);

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
        if (!item || !props.hub || props.hub.state !== HubConnectionState.Connected) return;
        switch (iconId) {
          case "Copy":
            break;
          case "React":
            await props.hub.send("SendReaction", props.chatBox.recp.igId, item.itemId);
            break;
          case "UnReact":
            await props.hub.send("SendUnReaction", props.chatBox.recp.igId, item.itemId);
            break;
        }
      },
      [props.chatBox.items, props.chatBox.recp.igId, props.hub],
    );

    const handleDrop = useCallback(
      async (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFiles: File[] = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
          const file = await convertHeicToJpeg(droppedFiles[0]);
          if (!file) return;
          props.onSendFile?.({
            file,
            threadId: props.chatBox.threadId,
            igid: props.chatBox.recp.igId,
          });
        }
      },
      [props.chatBox.threadId, props.chatBox.recp.igId, props.onSendFile],
    );

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
        } else {
          internalNotify(InternalResponseType.NotPermittedMediaType, NotifType.Warning);
        }
        e.target.value = "";
      },
      [props.chatBox.threadId, props.chatBox.recp.igId, props.onSendFile, props.onSendVideoFile],
    );

    const handleClickOnVoiceIcon = useCallback(async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setShowVoiceRecorder(true);
      } catch (error) {
        internalNotify(InternalResponseType.UnexpectedError, NotifType.Error);
      }
    }, []);

    const handleSendVoice = useCallback(
      async (uploadVoice: IUploadVoice) => {
        if (!props.hub || props.hub.state !== HubConnectionState.Connected) return;
        setShowVoiceRecorder(false);
        props.handleSendMessage({
          itemType: ItemType.AudioShare,
          message: ("data:video/mp4;base64," + uploadVoice.voiceBase64) as string,
          threadId: props.chatBox.threadId,
          igId: props.chatBox.recp.igId,
          file: uploadVoice.file,
        });
        const res = await UploadFile(session, uploadVoice.file);
        if (!props.hub || props.hub.state !== HubConnectionState.Connected) return;
        await props.hub.send("SendAudioMessage", props.chatBox.recp.igId, res.fileName);
      },
      [props.hub, props.chatBox.threadId, props.chatBox.recp.igId, props.handleSendMessage, session],
    );
    //#endregion

    //#region توابع ارسال پیام
    const handleSendText = useCallback(async () => {
      try {
        const text = truncateTextToBytes(answerBox.replaceAll("</br>", "\n"), MAX_MESSAGE_BYTES);
        if (text.length === 0) return;
        props.handleSendMessage({
          itemType: ItemType.Text,
          message: text,
          threadId: props.chatBox.threadId,
          igId: props.chatBox.recp.igId,
          file: new File([], "text.txt"),
        });
        if (props.hub?.state === HubConnectionState.Connected) {
          await props.hub.send("SendTextMessage", props.chatBox.recp.igId, text);
        }
        setAnswerBox("");
      } catch (error) {
        setAnswerBox("");
        notify(ResponseType.Unexpected, NotifType.Error, "socket error");
      }
    }, [answerBox, props.handleSendMessage, props.chatBox.threadId, props.chatBox.recp.igId, props.hub]);

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

    //#region توابع کمکی پاسخ و خواندن پیام
    const handleSpecifyRepliedItemFullName = useCallback(
      (itemId: string, repItem: IDirectMessageItem | null) => {
        if (repItem) {
          return repItem.sentByOwner ? (props.ownerInbox.username ?? "") : (props.chatBox.recp.username ?? "");
        }
        const item = props.chatBox.items.find((x) => x.itemId === itemId);
        if (item) {
          return item.sentByOwner ? (props.ownerInbox.username ?? "") : (props.chatBox.recp.username ?? "");
        }
        return "";
      },
      [props.ownerInbox.username, props.chatBox.recp.username, props.chatBox.items],
    );

    const handleSpecifyRepliedItemType = useCallback(
      (repItemId: string, repItem: IDirectMessageItem | null) => {
        if (repItem) {
          return repItem.itemType === ItemType.Text ? repItem.text : ItemType[repItem.itemType];
        }
        const item = props.chatBox.items.find((x) => x.itemId === repItemId);
        if (item) {
          return item.itemType === ItemType.Text ? item.text : ItemType[item.itemType];
        }
        return "";
      },
      [props.chatBox.items],
    );

    const handleSendRead = useCallback(async () => {
      if (!props.hub || props.hub.state !== HubConnectionState.Connected) return;
      if (props.chatBox.items.length > 0) {
        await props.hub.send("SendRead", props.chatBox.recp.igId, props.chatBox.items[0].itemId, true);
      }
    }, [props.hub, props.chatBox.recp.igId, props.chatBox.items]);
    //#endregion

    //#region useEffect ها مدیریت backToButton با scroll
    useEffect(() => {
      const container = chatBoxRef.current;
      if (!container) return;

      const handleScrollForButton = () => {
        setBackToButton(container.scrollTop >= 0);
      };
      container.addEventListener("scroll", handleScrollForButton);
      return () => container.removeEventListener("scroll", handleScrollForButton);
    }, []);

    useEffect(() => {
      const userIdChanged = prevUserSelectIdRef.current !== props.userSelectId;

      if (userIdChanged) {
        prevUserSelectIdRef.current = props.userSelectId;
        setLock(false);
        handleBackToButton();
      }

      const hasUnreadMessages = props.chatBox.items.some((x) => x.createdTime > props.chatBox.ownerLastSeenUnix);
      if (!hasUnreadMessages) {
        setLock(true);
      }

      if (
        props.hub?.state === HubConnectionState.Connected &&
        props.chatBox.items.length > 0 &&
        !props.chatBox.items[0].sentByOwner &&
        props.chatBox.items[0].createdTime > props.chatBox.ownerLastSeenUnix
      ) {
        const firstUnreadMessage = props.chatBox.items
          .filter((item) => item.createdTime > props.chatBox.ownerLastSeenUnix && !item.sentByOwner)
          .sort((a, b) => a.createdTime - b.createdTime)[0];
        setSeenItem(firstUnreadMessage);
        handleSendRead();
      }

      return () => {
        setSeenItem(null);
      };
    }, [
      props.userSelectId,
      props.chatBox.items,
      props.chatBox.ownerLastSeenUnix,
      props.hub,
      handleBackToButton,
      handleSendRead,
    ]);

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          if (showEmojiPicker) {
            setShowEmojiPicker(false);
          } else {
            props.showUserList();
          }
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [props.showUserList, showEmojiPicker]);

    useEffect(() => {
      if (!showEmojiPicker) return;
      const handleClickOutside = (event: MouseEvent) => {
        if (emojiPickerContainerRef.current && !emojiPickerContainerRef.current.contains(event.target as Node)) {
          setShowEmojiPicker(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showEmojiPicker]);

    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }, [answerBox]);
    //#endregion

    const sortedSendingMessages = useMemo(() => {
      return [...props.sendingMessages].reverse();
    }, [props.sendingMessages]);

    const sortedChatItems = useMemo(() => {
      return [...props.chatBox.items].sort((a, b) => b.createdTime - a.createdTime);
    }, [props.chatBox.items]);

    return (
      <>
        {
          //#region بخش هدر
        }
        <header className={styles.header}>
          <button
            onClick={props.showUserList}
            className={styles.backicon}
            aria-label={t(LanguageKey.backToUserList)}
            type="button">
            <svg fill="none" viewBox="0 0 14 11" aria-hidden="true">
              <path
                d="M13 4.4H3.3l3-3A1 1 0 0 0 5 0L.3 4.7A1 1 0 0 0 .3 6l4.6 4.7a1 1 0 0 0 1.4-1.4l-3-3H13a1 1 0 0 0 0-2"
                fill="var(--color-light-blue)"
              />
            </svg>
          </button>
          <div className="instagramprofile">
            <img
              style={{ cursor: "pointer" }}
              title={`${props.chatBox.recp.name || props.chatBox.recp.username} profile picture`}
              className="instagramimage"
              alt={`${props.chatBox.recp.name || props.chatBox.recp.username} profile picture`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/no-profile.svg";
              }}
              src={baseMediaUrl + props.chatBox.recp.profilePic}
              onClick={() => props.onImageClick?.(baseMediaUrl + props.chatBox.recp.profilePic)}
            />
            <div className="instagramprofiledetail">
              <div className="instagramusername">{props.chatBox.recp.name || ""}</div>
              <div className="instagramid">@{props.chatBox.recp.username}</div>
              {!props.chatBox.recp.isActive && (
                <span className="IDgray" title="ℹ️ Inactive user">
                  {t(LanguageKey.deactive)}
                </span>
              )}
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
          aria-label={t(LanguageKey.chatMessages)}>
          {sortedSendingMessages.length > 0 && (
            <>
              {sortedSendingMessages.map((v, i) => (
                <ChatSending key={i} sendingMessage={v} />
              ))}
            </>
          )}
          {sortedChatItems.map((item) => (
            <div key={item.itemId}>
              {!item.sentByOwner ? (
                <LeftChatWrapper
                  item={item}
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
                  handleFindEmoji={detectEmojiOnly}
                  getMessageDirectionClass={getMessageDirectionClass}
                  handleSpecifyRepliedItemFullName={handleSpecifyRepliedItemFullName}
                  handleSpecifyRepliedItemType={handleSpecifyRepliedItemType}
                />
              ) : (
                <RightChatWrapper
                  item={item}
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
                  handleFindEmoji={detectEmojiOnly}
                  getMessageDirectionClass={getMessageDirectionClass}
                  handleSpecifyRepliedItemFullName={handleSpecifyRepliedItemFullName}
                  handleSpecifyRepliedItemType={handleSpecifyRepliedItemType}
                />
              )}
            </div>
          ))}
          {isLoadingMore && <RingLoader />}
        </main>
        {
          //#endregion
          //#region بخش دکمه بازگشت به آخرین پیام
        }
        {!backToButton && (
          <button
            onClick={handleBackToButton}
            className={styles.goend}
            aria-label={t(LanguageKey.goToLatestMessage)}
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
        {
          <>
            {!showVoiceRecorder && (
              <>
                {/* active message */}
                {/* {props.chatBox.isActive && props.hub?.state === HubConnectionState.Connected && ( */}
                {props.hub?.state === HubConnectionState.Connected && props.chatBox.isActive && (
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
                          className={styles.chatTextarea}
                          ref={textareaRef}
                          value={answerBox}
                          onChange={(e) => handleInputOnChange(e.target.value)}
                          onKeyDown={handleTextareaKeyDown}
                          placeholder={t(LanguageKey.typeAMessage)}
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
                    {/* ----------------------------------------------- */}
                    {/* <form
                      className={styles.answer}
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendText();
                      }}>
                      <InputEmoji
                        value={answerBox}
                        theme="auto"
                        shouldReturn={true}
                        onChange={handleInputOnChange}
                        keepOpened={true}
                        onEnter={handleSendText}
                        shouldConvertEmojiToImage={false}
                        placeholder={t(LanguageKey.typeAMessage)}
                      />
                    <button
                        type="button"
                        className={styles.uploadbtn}
                        onClick={handleUploadImage}
                        aria-label={t(LanguageKey.uploadFile)}>
                        <svg viewBox="0 0 15 24" aria-hidden="true">
                          <path d="M2.8 22.3a4 4 0 0 1-3-1.4 4 4 0 0 1-1.5-3 5 5 0 0 1 1.4-3.4l7.7-7.7a4 4 0 0 1 1.6-1 4 4 0 0 1 3.7 1 .7.7 0 1 1-1 1 2 2 0 0 0-2.2-.6l-1 .6-7.8 7.8a4 4 0 0 0-1 2.2 3 3 0 0 0 1 2 3 3 0 0 0 3 .8L5 20l8.3-8.4a4 4 0 0 0 1.3-3.1 5 5 0 0 0-1.4-3.1 4.5 4.5 0 0 0-6.3 0l-8.3 8.2a1 1 0 0 1-1 0 1 1 0 0 1 0-1L5.9 4A6 6 0 0 1 10 2.5a6 6 0 0 1 4.2 1.7 6 6 0 0 1 1.9 4.2 6 6 0 0 1-1.8 4.2l-8.2 8.3a5 5 0 0 1-2 1.2z" />
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
                     <button
                        type="button"
                        onClick={handleClickOnVoiceIcon}
                        className={styles.voicebtn}
                        aria-label={t(LanguageKey.recordVoiceMessage)}>
                        <svg viewBox="0 0 15 22" aria-hidden="true">
                          <path d="M8 15.4a4.3 4.3 0 0 0 4.3-4.3V4.3a4.2 4.2 0 1 0-8.5 0v6.8a4.3 4.3 0 0 0 4.3 4.3m-2.8-11a2.9 2.9 0 0 1 5.8 0V11a2.9 2.9 0 0 1-5.8 0Zm10.4 6.3v.4A7.5 7.5 0 0 1 9 18.6h-.1v2h3.5l.5.3a.7.7 0 0 1-.5 1.2H3.8a.7.7 0 0 1 0-1.5h3.6v-2h-.2a7.5 7.5 0 0 1-6.6-7.5v-.4l.2-.5.5-.3.5.3.2.5v.4a6 6 0 1 0 12.2 0v-.4l.2-.5a1 1 0 0 1 1 0z" />
                        </svg>
                      </button>
                     <button
                        type="submit"
                        onClick={handleSendText}
                        className={styles.sendbtn}
                        aria-label={t(LanguageKey.sendMessage)}>
                        <svg viewBox="-5 -2 25 25" aria-hidden="true">
                          <path
                            fill="var(--color-ffffff)"
                            d="M19.3 11.2 2 20a1.4 1.4 0 0 1-2-2s2.2-4.3 2.8-5.4 1.2-1.4 7.5-2.2a.4.4 0 0 0 0-.8c-6.3-.8-7-1-7.5-2.2L0 2a1.4 1.4 0 0 1 2-2l17.3 8.7a1.3 1.3 0 0 1 0 2.4"
                          />
                        </svg>
                      </button>
                    </form> */}
                  </>
                )}
                {/* waiting for connection */}
                {props.hub?.state !== HubConnectionState.Connected && (
                  <div className={styles.blockeduser}>
                    <div className={styles.blockeduserbtn}>{t(LanguageKey.waitingforconnection)}</div>
                  </div>
                )}
                {/* not active message */}
                {props.hub?.state === HubConnectionState.Connected && !props.chatBox.isActive && (
                  <div className={styles.blockeduser}>
                    <div className={styles.blockeduserbtn}>{t(LanguageKey.notactivemessage)}</div>
                    <Tooltip tooltipValue={t(LanguageKey.notactivemessageexplain)} position="top" onClick>
                      <div className={styles.notactiveexplain}>
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
                      </div>
                    </Tooltip>
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
        }
        {
          //#endregion
        }
      </>
    );
  },
);

DirectChatBox.displayName = "DirectChatBox";

export default DirectChatBox;
