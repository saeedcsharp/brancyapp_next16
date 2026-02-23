import { HubConnection } from "@microsoft/signalr";
import { t } from "i18next";
import { useSession } from "next-auth/react";
import router from "next/router";
import { MouseEvent, useEffect, useRef, useState } from "react";
import InputEmoji from "react-input-emoji";
import { DateObject } from "react-multi-date-picker";
import { AIButton } from "../../design/ai/AIButton";
import RingLoader from "../../design/loader/ringLoder";
import Tooltip from "../../design/tooltip/tooltip";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "../../notifications/notificationBox";
import Loading from "../../notOk/loading";
import { isRTL } from "../../../helper/checkRtl";
import initialzedTime from "../../../helper/manageTimer";
import { useInfiniteScroll } from "../../../helper/useInfiniteScroll";
import { LanguageKey } from "../../../i18n";
import { MethodType } from "../../../helper/api";
import { ActionType, MediaProductType } from "../../../models/messages/enum";
import { IComment, IMedia, IOwnerInbox } from "../../../models/messages/IMessage";
import { IMediaUpdateAutoReply } from "../../../models/page/post/posts";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import Dotmenu from "../../design/dotMenu/dotMenu";
import styles from "./commentChatBox.module.css";
import { clientFetchApi } from "../../../helper/clientFetchApi";
const CommentChatBox = (props: {
  userSelectId: string | null;
  hub: HubConnection | null;
  chatBox: IMedia;
  showIcon: string;
  ownerInbox: IOwnerInbox;
  replyLoading: boolean;
  vanishLoading: boolean;
  newComment: boolean;
  showUserList: () => void;
  handleShowIcon: (e: MouseEvent) => void;
  handleTurnOnCommenting: (postId: number) => void;
  fetchItemData: (mediaId: string, nextMaxId: string | null, vanishMode: boolean) => Promise<void>;
  handleReplyComment: (comment: IComment, answerBox: string, privateReply: boolean) => void;
  handleReplyLiveComment: (lastComment: IComment, comment: IComment, answerBox: string) => void;
  handleUpdateFeedAutoReply: (sendReply: IMediaUpdateAutoReply, mediaId: string, postId: number) => void;
  handleUpdateLiveAutoReply: (sendReply: IMediaUpdateAutoReply, liveMediaId: string) => void;
  handleResumeFeedAutoReply: (activeAutoReply: boolean, postId: number) => void;
  handleResumeLiveAutoReply: (activeAutoReply: boolean, mediaId: string) => void;
  onSettingsClick: () => void;
  onImageClick: (imageUrl: string) => void;
  onLotteryClick: () => void;
  onStatisticsClick: () => void;
}) => {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const inputRef = useRef<any>(null);
  const [apiLoading, setAiLoading] = useState(false);
  const [dateFormatToggle, setDateFormatToggle] = useState("");
  const toggleDateFormat = (itemId: string | null) => {
    if (!itemId) return;
    if (dateFormatToggle === itemId) setDateFormatToggle("");
    else setDateFormatToggle(itemId);
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
  const [foldedChats, setFoldedChats] = useState<{ [key: string]: boolean }>({});
  const toggleFold = (commentId: string) => {
    setFoldedChats((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [answerBox, setAnswerBox] = useState<string>("");
  const [backToButton, setBackToButton] = useState<boolean>(true);
  const [chatId, setChatId] = useState("");

  // استفاده از useInfiniteScroll برای لود کردن کامنت‌های بیشتر
  const { isLoadingMore } = useInfiniteScroll<IComment>({
    hasMore: !!props.chatBox.nextMaxId,
    fetchMore: async () => {
      await props.fetchItemData(props.chatBox.mediaId, props.chatBox.nextMaxId, props.chatBox.vanishMode);
      return [];
    },
    onDataFetched: () => {},
    getItemId: (comment) => comment.id,
    currentData: props.chatBox.comments || [],
    threshold: 100,
    useContainerScroll: true,
    reverseScroll: true,
    fetchDelay: 500,
    enableAutoLoad: true,
    containerRef: chatBoxRef,
  });

  const [replyBox, setReplyBox] = useState<{
    comment: IComment;
    private: boolean;
  } | null>(null);
  const replyBoxRef = useRef<{
    comment: IComment;
    private: boolean;
  } | null>(null);
  useEffect(() => {
    replyBoxRef.current = replyBox;
  }, [replyBox]);

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const handleInputOnChange = (value: string) => {
    if (value.length === 0) {
      unixTypingTime = 0;
      return;
    }
    if (Date.now() > unixTypingTime + 11000) {
      unixTypingTime = Date.now();
    }
    console.log("check conditions", props.chatBox.vanishMode, replyBox, props.chatBox.productType, /^@p\s/.test(value));
    if (
      props.chatBox.vanishMode &&
      replyBoxRef.current != null &&
      replyBoxRef.current.private == false &&
      /^@\S+\s+@p\s/.test(value)
    ) {
      value = value.replace(/^@\S+\s+@p\s*/, "");
      setReplyBox((prev) => {
        if (prev === null) return null;

        return {
          ...prev,
          private: true,
        };
      });
    }
    if (
      props.chatBox.vanishMode &&
      replyBoxRef.current != null &&
      replyBoxRef.current.private == true &&
      (props.chatBox.productType == MediaProductType.Feed || props.chatBox.productType == MediaProductType.Reels) &&
      /^@p\s/.test(value)
    ) {
      console.log("inside p");
      value = value.replace(/^@p\s*/, "");
      value = "@" + `${replyBoxRef.current.comment.username} ` + value;
      setReplyBox((prev) => {
        if (prev === null) return null;

        return {
          ...prev,
          private: false,
        };
      });
    }
    setAnswerBox(value);
  };

  // مدیریت backToButton با scroll
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

  const handleBackToButton = () => {
    const container = chatBoxRef.current;
    if (container) container.scrollTop = 0;
    setBackToButton(true);
  };
  const handleClickOnIcon = (e: MouseEvent) => {
    if (!props.chatBox.commentEnabled && props.chatBox.productType !== MediaProductType.Live) {
      internalNotify(InternalResponseType.CommentDisabled, NotifType.Warning);
      return;
    }
    setChatId(e.currentTarget.id);
    props.handleShowIcon(e);
  };

  // New function to handle clicks on unreadmessagecontainer for reply functionality
  const handleMessageContainerClick = (comment: IComment) => {
    if (!props.chatBox.commentEnabled && props.chatBox.productType !== MediaProductType.Live) {
      internalNotify(InternalResponseType.CommentDisabled, NotifType.Warning);
      return;
    }

    // Set the selected message ID for opacity effect
    setSelectedMessageId(comment.id);

    // Only allow reply if it's not sent by owner
    if (!comment.sentByOwner) {
      setReplyBox({ comment: comment, private: false });
      setAnswerBox("@" + `${comment.username} ` + answerBox.replace(/^@\S+\s*/, ""));
    }
  };

  // Function to clear message selection
  const clearMessageSelection = () => {
    setSelectedMessageId(null);
  };

  async function handleActionComment(comment: IComment, action: ActionType) {
    try {
      const funcName =
        props.chatBox.productType === MediaProductType.Live
          ? "SendInternalLiveCommentAction"
          : "SendInternalCommentAction";
      await props.hub?.send(
        funcName,
        JSON.stringify({
          actionType: action,
          commentId: comment.id,
          createdTime: comment.createdTime,
          mediaId: comment.mediaId,
          sign: comment.sign,
          signTime: comment.signTime,
        }).toString()
      );
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error, "socket error");
    } finally {
      setAnswerBox("");
    }
  }
  const handleClickSubIcon = async (iconId: string, commentId: string) => {
    console.log("commentId handleClickSubIcon", commentId);
    var item = props.chatBox.comments.find((x) => x.id === commentId);
    if (!item || !props.hub) return;
    const aimCom = props.chatBox.comments.find((c) => c.id === commentId);
    if (!aimCom) return;
    switch (iconId) {
      case t(LanguageKey.reply):
        if (answerBox.length == 0 || answerBox[0] != "@") setReplyBox({ comment: aimCom, private: false });
        setTimeout(() => {
          const usernamePart = "@" + `${aimCom.username} `;
          const rest = answerBox.replace(/^@\S+\s*/, "");
          setAnswerBox(usernamePart + rest);
        }, 10);

        break;
      case t(LanguageKey.PrivateReply):
        setReplyBox({ comment: aimCom, private: true });
        if (answerBox.length != 0 && answerBox[0] == "@") setAnswerBox(answerBox.replace(/^@\S+\s*/, ""));

        break;
      case t(LanguageKey.delete):
        handleActionComment(aimCom, ActionType.Delete);
        break;
      case t(LanguageKey.Hide):
        handleActionComment(aimCom, ActionType.Hide);
        break;
      case t(LanguageKey.copy):
        console.log("Copy " + commentId);
        break;
      case t(LanguageKey.UnHide):
        handleActionComment(aimCom, ActionType.UnHide);
        break;
      case t(LanguageKey.Ignore):
        handleActionComment(aimCom, ActionType.Ignore);
        break;
    }
  };
  const simulateTyping = (element: HTMLElement, text: string) => {
    element.focus();
    element.textContent = "";

    // ایجاد یک input event
    const inputEvent = new InputEvent("input", {
      inputType: "insertText",
      data: text,
      bubbles: true,
      cancelable: true,
    });

    // set کردن textContent
    element.textContent = text;

    // dispatch کردن event
    element.dispatchEvent(inputEvent);

    // trigger onChange manually اگر لازم بود
    const changeEvent = new Event("change", { bubbles: true });
    element.dispatchEvent(changeEvent);
  };
  //فانکشن های مربوط به دکمه ی AI
  const handleAIButtonClick = async () => {
    try {
      // Show loading state
      if (!replyBox) return;
      setAiLoading(true);

      // Call AI service to generate reply based on the comment
      const response = await clientFetchApi<boolean, string>("/api/comment/GenerateCommentBaseAI", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "comment", value: replyBox.comment.text },
          { key: "username", value: replyBox.comment.username },
          { key: "postId", value: props.chatBox.postId?.toString() },
        ], onUploadProgress: undefined });

      if (response.succeeded) {
        const aiReply = response.value;
        const usernamePart = `@${replyBox.comment.username} `;

        let finalReply = "";
        if (aiReply.includes("@")) {
          finalReply = aiReply;
        } else {
          finalReply = usernamePart + aiReply;
        }
        setAnswerBox(finalReply);
        setTimeout(() => {
          const editableDiv = wrapperRef.current?.querySelector('[contenteditable="true"]') as HTMLDivElement;

          if (editableDiv) {
            simulateTyping(editableDiv, finalReply);

            // cursor رو در انتها قرار بدید
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(editableDiv);
            range.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(range);
          }
        }, 100);
      } else {
        notify(response.info?.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleReplyByAI = async (event: MouseEvent<HTMLDivElement>): Promise<void> => {
    try {
      // Show loading state
      if (!replyBox) return;
      setAiLoading(true);
      const aiButton = event.currentTarget;
      const originalContent = aiButton.innerHTML;
      aiButton.innerHTML = '<div class="spinner"></div>';
      aiButton.style.pointerEvents = "none";

      // Call AI service to generate reply based on the comment
      const response = await clientFetchApi<boolean, string>("/api/comment/GenerateCommentBaseAI", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "comment", value: replyBox.comment.text },
          { key: "username", value: replyBox.comment.username },
          { key: "postId", value: props.chatBox.postId?.toString() },
        ], onUploadProgress: undefined });

      if (response.succeeded) {
        const aiReply = response.value;
        const usernamePart = `@${replyBox.comment.username} `;

        let finalReply = "";
        if (aiReply.includes("@")) {
          finalReply = aiReply;
        } else {
          finalReply = usernamePart + aiReply;
        }
        setAnswerBox(finalReply);
        setTimeout(() => {
          const editableDiv = wrapperRef.current?.querySelector('[contenteditable="true"]') as HTMLDivElement;

          if (editableDiv) {
            simulateTyping(editableDiv, finalReply);

            // cursor رو در انتها قرار بدید
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(editableDiv);
            range.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(range);
          }
        }, 100);
      } else {
        notify(response.info?.responseType, NotifType.Warning);
      }

      // Restore button state
      aiButton.innerHTML = originalContent;
      aiButton.style.pointerEvents = "auto";
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setAiLoading(false);
    }
  };
  //فانکشن های مربوط به دکمه ی AI

  const handleSendText = async () => {
    var text = answerBox.replaceAll("</br>", "\n");
    if (text.length === 0) return;
    setAnswerBox("");
    if (
      props.chatBox.productType === MediaProductType.Live &&
      props.chatBox.comments[0].createdTime < Date.now() * 1e3 - 600000000
    ) {
      internalNotify(InternalResponseType.ExceedPermittedLiveTime, NotifType.Warning);
      return;
    }
    if (replyBox && props.chatBox.productType !== MediaProductType.Live)
      props.handleReplyComment(replyBox.comment, answerBox, replyBox.private);
    else if (replyBox && props.chatBox.productType === MediaProductType.Live) {
      props.handleReplyLiveComment(
        props.chatBox.comments.filter((x) => !x.sentByOwner)[0],
        replyBox.comment,
        answerBox
      );
    }
    setReplyBox(null);
    clearMessageSelection();
  };
  const handleFindEmoji = (text: string | null) => {
    if (!text) return null;
    var emojiRegex =
      /[\u{1F000}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{2B55}\u{2E80}-\u{2E99}\u{2E9B}-\u{2EF3}\u{2F00}-\u{2FD5}\u{2FF0}-\u{2FFB}\u{3000}-\u{3037}\u{303D}\u{3190}-\u{319F}\u{3200}-\u{321C}\u{3220}-\u{3243}\u{3250}-\u{32FE}\u{3300}-\u{4DBF}\u{4E00}-\u{A48C}\u{A490}-\u{A4C6}\u{A960}-\u{A97C}\u{AC00}-\u{D7A3}\u{D7B0}-\u{D7C6}\u{D7CB}-\u{D7FB}\u{F900}-\u{FAFF}\u{FE00}-\u{FE0F}\u{FE10}-\u{FE19}\u{FE30}-\u{FE52}\u{FE54}-\u{FE66}\u{FE68}-\u{FE6B}\u{FF01}-\u{FF60}\u{FFFD}\u{10000}-\u{1FFFD}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}\u{50000}-\u{5FFFD}\u{60000}-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}\u{90000}-\u{9FFFD}\u{A0000}-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}\u{D0000}-\u{DFFFD}\u{E0000}-\u{EFFFD}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}\u{200D}]/gu;
    // Filter out non-emoji characters
    var nonEmojiText = text.replace(emojiRegex, "");
    return nonEmojiText.trim();
  };

  const [lock, setLock] = useState(false);
  const [seenItem, setSeenItem] = useState<IComment | null>(null);
  useEffect(() => {
    setReplyBox(null);
    setSelectedMessageId(null);
    setLock(false);
    // setAutoReplyAll(
    //   props.chatBox.automaticCommentReply === null ||
    //     props.chatBox.automaticCommentReply.items.length === 0
    // );
    // setAutoReplySpecific(
    //   props.chatBox.automaticCommentReply !== null &&
    //     props.chatBox.automaticCommentReply.items.length > 0
    // );
    // setQuickReply(
    //   !props.chatBox.automaticCommentReply ||
    //     props.chatBox.automaticCommentReply.pauseTime
    //     ? false
    //     : true
    // );
    handleBackToButton();
    if (!props.chatBox.comments.find((x) => x.createdTime > props.chatBox.lastSeenUnix)) {
      // console.log("lockkkkkkkkkk");
      setLock(true);
    }
    if (!props.hub) return;
    if (props.chatBox.vanishMode) {
      const replyComment = props.chatBox.comments.filter(
        (x) => !x.sentByOwner && x.replys?.length === 0 && !x.isHide && !x.privateReply
      );
      console.log("vanish modeeeeeeeeeeeeee", replyComment);
      if (replyComment.length > 0) {
        setReplyBox({
          comment: props.chatBox.comments.filter(
            (x) => !x.sentByOwner && x.replys?.length === 0 && !x.isHide && !x.privateReply
          )[0],
          private: false,
        });
        setAnswerBox("@" + `${replyComment[0].username} `);
      }
    }

    // console.log("last itemmmm", props.chatBox.items[0]);
    // console.log("ownerrrrrrr", props.chatBox.ownerLastSeenUnix);
    if (
      props.chatBox.comments.length > 0 &&
      !props.chatBox.comments[0].sentByOwner &&
      props.chatBox.comments[0].createdTime > props.chatBox.lastSeenUnix
    ) {
      const seenComments = props.chatBox.comments
        .filter((item) => item.createdTime > props.chatBox.lastSeenUnix && !item.sentByOwner)
        .sort((a, b) => a.createdTime - b.createdTime)[0];
      setSeenItem(seenComments);
    }
    return () => {
      const seenComments = props.chatBox.comments
        .filter((item) => item.createdTime > props.chatBox.lastSeenUnix && !item.sentByOwner)
        .sort((a, b) => a.createdTime - b.createdTime)[0];
      if (!seenComments) return;
      console.log("returnnnnnnnnnnnnnnnnnnnnnnnnnnn");
      handleActionComment(seenComments, ActionType.Read);
      setSeenItem(null);
    };
  }, [props.userSelectId]);
  useEffect(() => {
    console.log("new commenttttttttttttttttttt");
    if (props.chatBox.vanishMode) {
      const replyComment = props.chatBox.comments.filter(
        (x) => !x.sentByOwner && x.replys?.length === 0 && !x.isHide && !x.privateReply
      );
      console.log("vanish modeeeeeeeeeeeeee", replyComment);
      if (replyComment.length > 0) {
        if (!replyBox || replyComment.filter((x) => x.id == replyBox.comment.id).length == 0) {
          var comment = props.chatBox.comments.filter(
            (x) => !x.sentByOwner && x.replys?.length === 0 && !x.isHide && !x.privateReply
          )[0];
          if (comment != replyBox?.comment) {
            setReplyBox({
              comment: comment,
              private: false,
            });
            setAnswerBox("@" + `${replyComment[0].username} `);
          }
        }
      } else setReplyBox(null);
    }
  }, [props.newComment]);

  useEffect(() => {
    if (replyBox && inputRef.current) {
      // Focus when InputEmoji is shown
      inputRef.current.focus();
    }
  }, [replyBox]); // Run this effect whenever replyBox changes
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (replyBox) {
      setTimeout(() => {
        // پیدا کردن div که contentEditable هست
        const editableDiv = wrapperRef.current?.querySelector('[contenteditable="true"]') as HTMLDivElement;

        if (editableDiv) {
          editableDiv.focus(); // فوکوس
          // بردن کرسر به انتها
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(editableDiv);
          range.collapse(false);
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }, 50);
    }
  }, [replyBox, answerBox]);

  return (
    <>
      <div className={styles.header}>
        <div className={styles.rightrow}>
          <svg onClick={props.showUserList} className={styles.backicon} fill="none" viewBox="0 0 14 11">
            <path
              d="M13 4.4H3.3l3-3A1 1 0 0 0 5 0L.3 4.7A1 1 0 0 0 .3 6l4.6 4.7a1 1 0 0 0 1.4-1.4l-3-3H13a1 1 0 0 0 0-2"
              fill="var(--color-light-blue)"
            />
          </svg>
          <div className={styles.userchat}>
            {props.chatBox.users.map((v, index) => (
              <img
                key={v.username}
                className={`${styles.userphoto} ${styles[`userphoto${index + 1}`]}`}
                alt={`Profile photo of ${v.username}`}
                src={baseMediaUrl + v.profileUrl}
                onClick={() => props.onImageClick(baseMediaUrl + v.profileUrl)}
                title="Click to view profile photo"
                aria-label={`Profile photo of user ${v.username}`}
                role="button"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/no-profile.svg";
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.leftrow} role="complementary" aria-label="Settings and vanish mode controls">
          <img
            style={{
              cursor: "pointer",
              width: "30px",
              height: "30px",
            }}
            title="ℹ️ Settings"
            src="/more.svg"
            alt="Settings icon"
            aria-label="Settings button"
            role="button"
            onClick={props.onSettingsClick}
          />
          {props.chatBox.productType === MediaProductType.Live && (
            <img
              onClick={props.onLotteryClick}
              title="🔗 comment management"
              className={`${styles.shortcut} `}
              alt="link to comment page icon"
              src={"/shortcut.svg"}
            />
          )}
          <img
            style={{
              cursor: "pointer",
              width: "30px",
              height: "30px",
            }}
            title="ℹ️ statistics"
            src="/info.svg"
            alt="Statistics icon"
            aria-label="Statistics button"
            role="button"
            onClick={props.onStatisticsClick}
          />
        </div>
      </div>

      {/* ___chat___*/}
      {
        <>
          {props.vanishLoading && <Loading />}
          {!props.vanishLoading && (
            <div
              ref={chatBoxRef}
              className={styles.chat}
              onClick={(e) => {
                // اگر روی فضای خالی یا بیرون از کادر کامنت کلیک شد، حالت ریپلای و انتخاب پاک شود
                if (e.target === e.currentTarget) {
                  clearMessageSelection();
                  setReplyBox(null);
                }
              }}>
              {props.chatBox.comments
                .sort((a, b) => b.createdTime - a.createdTime)
                .map((v) => (
                  <div key={`comment-${v.id}`}>
                    {seenItem === v && !lock && (
                      <div id={`unread-${v.id}`} className={styles.unread}>
                        <div
                          style={{
                            width: "100%",
                            border: "1px solid var(--color-gray30)",
                            height: "1px",
                            boxSizing: "border-box",
                          }}></div>

                        <div style={{ width: "280px" }}>{t(LanguageKey.unreadcomment)}</div>
                        <div
                          style={{
                            width: "100%",
                            border: "1px solid var(--color-gray30)",
                            height: "1px",
                            boxSizing: "border-box",
                          }}></div>
                      </div>
                    )}
                    <div
                      key={`container-${v.id}`}
                      className={styles.unreadmessagecontainer}
                      onClick={() => handleMessageContainerClick(v)}
                      role="button"
                      tabIndex={!v.sentByOwner ? 0 : -1}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleMessageContainerClick(v);
                        }
                      }}
                      title={!v.sentByOwner ? "Click to reply" : ""}
                      style={{
                        ...(!v.sentByOwner && { cursor: "pointer" }),
                        ...(v.isHide ? { border: "1px dashed var(--color-gray60)" } : {}),
                        ...(selectedMessageId && selectedMessageId !== v.id && { opacity: 0.4 }),
                        ...(selectedMessageId === v.id && {
                          border: "1px solid var(--color-dark-blue)",
                        }),
                      }}>
                      <div className={styles.leftchatrow}>
                        {
                          <>
                            <div className={styles.leftchat}>
                              <div className={styles.maincomment}>
                                <div className="instagramprofile">
                                  <img
                                    className="instagramimage"
                                    alt="User profile"
                                    title="Click to view profile photo"
                                    src={baseMediaUrl + v.profileUrl}
                                    onClick={() => props.onImageClick(baseMediaUrl + v.profileUrl)}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/no-profile.svg";
                                    }}
                                  />
                                  <div className="instagramprofiledetail">
                                    <div className="instagramusername">{v.fullName ?? v.username}</div>
                                    {v.username && v.fullName && (
                                      <div className="instagramid">{v.username && `(@${v.username})`}</div>
                                    )}
                                  </div>
                                </div>

                                <div
                                  className={styles.chatdatemobile}
                                  onClick={() => toggleDateFormat(v.id)}
                                  role="button"
                                  aria-label="Toggle date format"
                                  title="Click to toggle date format">
                                  {formatDate1(v.createdTime / 1e3, v.id)}
                                </div>

                                <div className={styles.commentcontainer}>
                                  <div
                                    style={{
                                      ...(handleFindEmoji(v.text)
                                        ? {
                                            background: "var(--color-light-blue30)",
                                          }
                                        : {}),
                                      direction: v.text && isRTL(v.text) ? "rtl" : "ltr",
                                    }}
                                    className={styles.leftchatMSG}
                                    role="textbox"
                                    aria-label="Chat message">
                                    {v.text}
                                  </div>

                                  {(props.chatBox.productType !== MediaProductType.Live ||
                                    (props.chatBox.comments[0].createdTime > Date.now() * 1e3 - 600000000 &&
                                      !v.sentByOwner &&
                                      !v.privateReply)) &&
                                    (!selectedMessageId || selectedMessageId === v.id) && (
                                      <Dotmenu
                                        menuPosition="topRight"
                                        handleClickOnIcon={(iconId) => handleClickSubIcon(iconId, v.id)}
                                        data={[
                                          ...(props.chatBox.productType !== MediaProductType.Live
                                            ? [
                                                ...(!v.sentByOwner
                                                  ? [
                                                      {
                                                        icon: "/icon-reply.svg",
                                                        value: t(LanguageKey.reply),
                                                      },
                                                    ]
                                                  : []),
                                                ...(!v.privateReply &&
                                                !v.sentByOwner &&
                                                session?.user.messagePermission &&
                                                v.createdTime > (Date.now() - 596160000) * 1000
                                                  ? [
                                                      {
                                                        icon: "/icon-reply.svg",
                                                        value: t(LanguageKey.PrivateReply),
                                                      },
                                                    ]
                                                  : []),
                                                {
                                                  icon: "/copy.svg",
                                                  value: t(LanguageKey.copy),
                                                },
                                                {
                                                  icon: v.isHide ? "/view.svg" : "/hide.svg",
                                                  value: v.isHide ? t(LanguageKey.UnHide) : t(LanguageKey.Hide),
                                                },
                                                {
                                                  icon: "/delete.svg",
                                                  value: t(LanguageKey.delete),
                                                },
                                                {
                                                  icon: "/copy.svg",
                                                  value: t(LanguageKey.Ignore),
                                                },
                                              ]
                                            : [
                                                ...(!v.privateReply && session?.user.messagePermission
                                                  ? [
                                                      {
                                                        icon: "/icon-reply.svg",
                                                        value: t(LanguageKey.PrivateReply),
                                                      },
                                                    ]
                                                  : []),
                                              ]),
                                        ]}
                                      />
                                    )}
                                </div>
                              </div>
                            </div>

                            {((v.replys && v.replys.length > 0) || v.privateReply) && (
                              <div className={styles.replysection}>
                                <div className={styles.linedash}></div>
                                {foldedChats[v.id] && (
                                  <div className={styles.showreplies} onClick={() => toggleFold(v.id)}>
                                    Show +{(v.replys?.length || 0) + (v.privateReply ? 1 : 0)} Replies
                                  </div>
                                )}

                                <div
                                  className={styles.leftchatwithreply}
                                  style={{
                                    height: foldedChats[v.id] ? "0" : "auto",
                                    transition: "var(--transition3)",
                                  }}>
                                  {v.replys &&
                                    v.replys.map((p) => (
                                      <div className={styles.allreplymsg} key={p.id}>
                                        <div
                                          className={styles.userProfileSection}
                                          role="article"
                                          aria-label="User reply">
                                          <img
                                            className={styles.pictureIcon}
                                            alt="User profile picture"
                                            src={
                                              baseMediaUrl +
                                              (p.sentByOwner ? props.ownerInbox.profilePic : p.profileUrl)
                                            }
                                            onClick={() =>
                                              props.onImageClick(
                                                baseMediaUrl +
                                                  (p.sentByOwner ? props.ownerInbox.profilePic : p.profileUrl)
                                              )
                                            }
                                            loading="lazy"
                                            decoding="async"
                                            title="Click to view profile photo"
                                          />

                                          <div className={styles.replymsgperson} aria-label="User information">
                                            {p.fullName && p.username ? p.fullName : p.username}
                                            <div className={styles.usernamefold} aria-label="Username">
                                              {((p.username && p.fullName) || p.sentByOwner) &&
                                                `(@${p.sentByOwner ? props.ownerInbox.username : p.username})`}
                                            </div>
                                          </div>
                                        </div>

                                        <div className={styles.leftchatMSG}>{p.text}</div>
                                      </div>
                                    ))}
                                  {v.privateReply && (
                                    <div className={styles.allreplymsg} aria-label="Private reply message">
                                      <div className={styles.userProfileSection}>
                                        <img
                                          className={styles.pictureIcon}
                                          alt="User profile picture"
                                          src={baseMediaUrl + props.ownerInbox.profilePic}
                                          onClick={() => props.onImageClick(baseMediaUrl + props.ownerInbox.profilePic)}
                                          loading="lazy"
                                          decoding="async"
                                          title="Click to view profile photo"
                                        />
                                        <div className={styles.replymsgperson} aria-label="User information">
                                          {props.ownerInbox.name}
                                          <div className={styles.usernamefold} aria-label="Username">
                                            (@{props.ownerInbox.username})
                                          </div>
                                        </div>
                                      </div>

                                      <div
                                        title="🔇Answered as Private reply"
                                        aria-label="🔇Answered as Private reply"
                                        className={styles.leftchatMSG}
                                        style={{
                                          border: "1px dashed var(--color-dark-blue)",
                                        }}
                                        role="textbox">
                                        {v.privateReply.text}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        }
                      </div>
                      <div className={styles.rightchatrow}>
                        {v.isHide && (
                          <Tooltip tooltipValue={t(LanguageKey.hiddencommenttooltip)} position="left" onHover={true}>
                            <img
                              loading="lazy"
                              decoding="async"
                              style={{
                                cursor: "pointer",
                                width: "20px",
                                height: "20px",
                              }}
                              title="This comment has been hidden"
                              alt="Hidden comment indicator"
                              src="/hide.svg"
                              role="img"
                              aria-label="Hidden comment"
                            />
                          </Tooltip>
                        )}
                        <div className="headerandinput" style={{ gap: "1px" }}>
                          <div
                            className={styles.chatdate}
                            onClick={() => toggleDateFormat(v.id)}
                            role="button"
                            aria-label="Toggle date format"
                            title="Click to toggle date format">
                            {formatDate1(v.createdTime / 1e3, v.id)}
                          </div>
                          <div className={styles.chatdate}>
                            {v.replys && v.replys.length > 0 && (
                              <strong>
                                {v.replys.length} {t(LanguageKey.replies)}
                              </strong>
                            )}
                          </div>
                        </div>
                        {((v.replys && v.replys.length > 0) || v.privateReply) && (
                          <svg
                            className={styles.foldingicon}
                            width="21"
                            height="21"
                            viewBox="0 0 22 22"
                            fill="none"
                            onClick={() => toggleFold(v.id)}
                            style={{
                              transform: `rotate(${foldedChats[v.id] ? "90deg" : "-90deg"})`,
                              transition: "var(--transition3)",
                            }}>
                            <path stroke="var(--text-h2)" d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" opacity=".5" />
                            <path
                              fill="var(--text-h1)"
                              d="M10 14.6q-.4 0-.6-.2a1 1 0 0 1 0-1l2.1-2.2.2-.4-.2-.4-2.1-2.1a1 1 0 0 1 0-1q.5-.5 1 0l2.1 2q.6.8.6 1.5 0 .8-.6 1.5l-2 2.1z"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              {isLoadingMore && <RingLoader />}
            </div>
          )}
        </>
      }
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
      {replyBox && !props.replyLoading && (
        <div
          className={styles.replymsgbox}
          style={{
            border: replyBox.private ? "1px dashed var(--color-dark-blue)" : "none",
          }}>
          <div className={styles.replymsg}>
            <img className={styles.replymsgsvg} src="/icon-reply.svg" />
            <div className={styles.replymsgcontainer}>
              <div className={styles.userProfileSection}>
                <img
                  className={styles.pictureIcon}
                  alt="User profile"
                  src={
                    baseMediaUrl +
                    (replyBox.comment.sentByOwner ? props.ownerInbox.profilePic : replyBox.comment.profileUrl)
                  }
                  onClick={() =>
                    props.onImageClick(
                      baseMediaUrl +
                        (replyBox.comment.sentByOwner ? props.ownerInbox.profilePic : replyBox.comment.profileUrl)
                    )
                  }
                  loading="lazy"
                  decoding="async"
                  title="Click to view profile photo"
                />
                <div className={styles.replytomsgperson}>
                  <span className="explain">
                    @{replyBox.comment.sentByOwner ? props.ownerInbox.username : replyBox.comment.username}
                  </span>
                  {replyBox.comment.text}
                </div>
              </div>
            </div>
          </div>

          <svg
            onClick={() => {
              setReplyBox(null);
              setAnswerBox("");
              clearMessageSelection();
            }}
            className={styles.replymsgsvg}
            width="20"
            viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="10" fill="var(--color-white)"></circle>
            <g fill="none" stroke="var(--color-gray)" strokeLinecap="round" strokeWidth="2">
              <path d="M6 0 0 6" transform="translate(7 7)"></path>
              <path d="m0 0 6 6" transform="translate(7 7)"></path>
            </g>
          </svg>
        </div>
      )}
      {/* ___answer___*/}
      {(props.chatBox.productType !== MediaProductType.Live ||
        (props.chatBox.comments.length > 0 && props.chatBox.comments[0].createdTime > Date.now() * 1e3 - 600000000)) &&
        (props.chatBox.commentEnabled || props.chatBox.productType === MediaProductType.Live) && (
          <div className={`${styles.answer} translate`} ref={wrapperRef}>
            {(props.replyLoading || apiLoading) && <RingLoader />}
            {!props.replyLoading && !apiLoading && replyBox && (
              <>
                <InputEmoji
                  theme="auto"
                  ref={inputRef}
                  value={answerBox}
                  shouldReturn={true}
                  onChange={handleInputOnChange}
                  onEnter={handleSendText}
                  placeholder="Type a message"
                  searchMention={async (text) => {
                    return [];
                  }}
                  shouldConvertEmojiToImage={false}
                />
                <AIButton
                  className={styles.aibtn}
                  onClick={handleAIButtonClick}
                  loading={apiLoading}
                  title="AI Caption Generator"
                  ariaLabel="AI Caption Generator"
                />
                <svg onClick={handleSendText} className={styles.sendbtn} viewBox="-5 -2 25 25">
                  <path
                    fill="var(--color-ffffff)"
                    d="M19.3 11.2 2 20a1.4 1.4 0 0 1-2-2s2.2-4.3 2.8-5.4 1.2-1.4 7.5-2.2a.4.4 0 0 0 0-.8c-6.3-.8-7-1-7.5-2.2L0 2a1.4 1.4 0 0 1 2-2l17.3 8.7a1.3 1.3 0 0 1 0 2.4"
                  />
                </svg>
              </>
            )}
          </div>
        )}
      {!replyBox &&
        !props.replyLoading &&
        ((props.chatBox.commentEnabled && props.chatBox.productType !== MediaProductType.Live) ||
          (props.chatBox.productType === MediaProductType.Live &&
            props.chatBox.comments.length > 0 &&
            props.chatBox.comments[0].createdTime > Date.now() * 1e3 - 600000000)) && (
          <div className={styles.selectnew}>
            <div className={styles.selectnewmsg}>{t(LanguageKey.selectnewmessage)}</div>
          </div>
        )}
      {!props.chatBox.commentEnabled && props.chatBox.productType !== MediaProductType.Live && (
        <div className={styles.blockeduser}>
          <div onClick={() => props.handleTurnOnCommenting(props.chatBox.postId!)} className={styles.blockeduserbtn}>
            {t(LanguageKey.notactivemessage)}
          </div>
        </div>
      )}
      {props.chatBox.productType === MediaProductType.Live &&
        props.chatBox.comments.length > 0 &&
        props.chatBox.comments[0].createdTime < Date.now() * 1e3 - 600000000 && (
          <div className={styles.blockeduser}>
            <div className={styles.blockeduserbtn}>{t(LanguageKey.notactivemessage)}</div>
            <Tooltip
              tooltipValue={t(LanguageKey.notactivemessageexplain)}
              position="top"
              onClick={true}
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

      {/* ___end___*/}
    </>
  );
};

export default CommentChatBox;
