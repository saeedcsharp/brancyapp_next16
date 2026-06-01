import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { LoginStatus } from "brancy/helper/loadingStatus";
import { LanguageKey } from "brancy/i18n";
import entryTypeToStr, { ILastMessage } from "brancy/models/homeIndex/home";
import { ItemType } from "brancy/models/messages/enum";
import Loading from "brancy/components/notOk/loading";
import styles from "./lastMessage.module.css";

interface LastMessageState {
  isLoading: boolean;
  isHidden: boolean;
  popup: {
    show: boolean;
    image: string;
    username: string;
  };
}

type LastMessageAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "TOGGLE_HIDDEN" }
  | { type: "SHOW_POPUP"; payload: { image: string; username: string } }
  | { type: "HIDE_POPUP" };

const initialState: LastMessageState = {
  isLoading: true,
  isHidden: false,
  popup: {
    show: false,
    image: "",
    username: "",
  },
};

const lastMessageReducer = (state: LastMessageState, action: LastMessageAction): LastMessageState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "TOGGLE_HIDDEN":
      return { ...state, isHidden: !state.isHidden };
    case "SHOW_POPUP":
      return {
        ...state,
        popup: {
          show: true,
          image: action.payload.image,
          username: action.payload.username,
        },
      };
    case "HIDE_POPUP":
      return {
        ...state,
        popup: {
          show: false,
          image: "",
          username: "",
        },
      };
    default:
      return state;
  }
};

const basePictureUrl = getClientMediaBaseUrl();

const isRTL = (text: string): boolean => {
  const rtlChars = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F]/;
  return rtlChars.test(text);
};

interface MessageItemProps {
  item: ILastMessage & { isReply: boolean };
  basePictureUrl: string;
  onImageClick: (imageUrl: string, username: string) => void;
  getItemTypeEmoji: (itemType: ItemType) => string;
  entryTypeClass: string;
  entryTypeLabel: string;
}

const MessageItem = memo(
  ({ item, basePictureUrl, onImageClick, getItemTypeEmoji, entryTypeClass, entryTypeLabel }: MessageItemProps) => (
    <div className={`${styles.groupWrapper} translate`}>
      <img
        title="◰ resize the picture"
        className={styles.imageProfile}
        loading="lazy"
        alt="instagram profile picture"
        src={`${basePictureUrl}${item.profileUrl}`}
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          const fallback = "/no-profile.svg";
          if (target.src !== fallback) target.src = fallback;
        }}
        onClick={() => onImageClick(`${basePictureUrl}${item.profileUrl}`, item.username)}
      />

      <div className="headerandinput">
        <div className="headerparent">
          <div className="instagramusername" title={item.username}>
            {item.username}
          </div>
        </div>
        <div
          title={item.message ?? ""}
          //className={`${styles.message} ${isRTL(item.message ?? "") ? "rtl" : "ltr"}`}
          className={styles.message}>
          {item.directItemType === ItemType.Text && item.message}
          {item.directItemType !== ItemType.Media &&
            item.directItemType !== ItemType.Text &&
            getItemTypeEmoji(item.directItemType)}
          {item.directItemType === ItemType.Media &&
            item.directMediaType !== null &&
            getItemTypeEmoji(item.directItemType)}
        </div>
      </div>
      <div className={styles.profile}>
        <div className={entryTypeClass} title="ℹ️ message type">
          {entryTypeLabel}
        </div>
        <Link className={styles.replyicon} href={item.relativeUrl}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M2.3.9q0-.8 1-.9h7q.7 0 .8.9v7a.9.9 0 1 1-1.8 0v-5l-7.8 8A.9.9 0 0 1 .3 9.5L8 1.8H3.2a1 1 0 0 1-.9-1"
              fill="var(--text-h2)"
            />
          </svg>

          {/* <img
            loading="lazy"
            title="🔗 Reply message"
            className={styles.replyicon}
            alt="Reply message icon"
            src={item.isReply ? "/icon-reply.svg" : "/shortcut.svg"}
            width={20}
            height={20}
          /> */}
        </Link>
      </div>
    </div>
  ),
);

MessageItem.displayName = "MessageItem";

interface PopupProps {
  show: boolean;
  image: string;
  username: string;
  onClose: () => void;
}

const Popup = memo(({ show, image, username, onClose }: PopupProps) => {
  if (!show) return null;

  return (
    <>
      <div className="dialogBg" onClick={onClose} role="presentation" />
      <div className="popup" role="dialog" aria-modal="true" aria-labelledby="popup-title" style={{ height: "auto" }}>
        <div className="headerparent">
          <div id="popup-title">@ {username}</div>
          <img
            onClick={onClose}
            aria-label="Close popup"
            style={{
              cursor: "pointer",
              width: "30px",
              height: "30px",
              alignSelf: "end",
            }}
            title="ℹ️ close"
            src="/close-box.svg"
          />
        </div>
        <img
          loading="lazy"
          className={styles.profileimagebig}
          src={image}
          alt={`${username} profile picture`}
          title="profile picture"
          width={200}
          height={200}
          sizes="200px"
        />
      </div>
    </>
  );
});

Popup.displayName = "Popup";

interface LastMessageProps {
  data: ILastMessage[] | null;
  repliesData?: ILastMessage[] | null;
  unreadComments?: string | null;
}

const LastMessage = memo(({ data, repliesData, unreadComments }: LastMessageProps) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [state, dispatch] = useReducer(lastMessageReducer, initialState);

  const messageCounts = useMemo(() => {
    if (!data) return { direct: 0, ticket: 0, comments: 0 };

    const combinedData = [...(data || []), ...(repliesData || [])];

    return combinedData.reduce(
      (counts, item) => {
        const entryTypeStr = entryTypeToStr(item.entryType);
        if (entryTypeStr === t(LanguageKey.navbar_Direct)) {
          counts.direct++;
        } else if (entryTypeStr === t(LanguageKey.navbar_Ticket)) {
          counts.ticket++;
        } else if (entryTypeStr === t(LanguageKey.navbar_Comments)) {
          counts.comments++;
        }
        return counts;
      },
      { direct: 0, ticket: 0, comments: 0 },
    );
  }, [data, repliesData, t]);

  const repliesCount = useMemo(() => repliesData?.length || 0, [repliesData]);

  const sortedItems = useMemo(() => {
    const allItems = [
      ...(data || []).map((item) => ({ ...item, isReply: false })),
      // ...(repliesData || []).map((item) => ({ ...item, isReply: true })),
    ];
    return allItems.sort((a, b) => b.timeStampUnix - a.timeStampUnix);
  }, [data, repliesData]);

  const getItemTypeEmoji = useCallback(
    (itemType: ItemType): string => {
      switch (itemType) {
        case ItemType.Text:
          return " ";
        case ItemType.PlaceHolder:
          return "�" + t(LanguageKey.PlaceHolder);
        case ItemType.MediaShare:
          return "📺" + t(LanguageKey.media);
        case ItemType.ReplyStory:
          return "↩️" + t(LanguageKey.ReplyStory);
        case ItemType.Media:
          return "📷" + t(LanguageKey.photo);
        case ItemType.AudioShare:
          return "🎵" + t(LanguageKey.voice);
        case ItemType.Buttons:
          return "🔘" + t(LanguageKey.button);
        case ItemType.Generic:
          return "📄" + t(LanguageKey.Generic);
        case ItemType.StoryMention:
          return "👥" + t(LanguageKey.StoryMention);
        case ItemType.FileShare:
          return "📁" + t(LanguageKey.FileShare);
        default:
          return "❓" + t(LanguageKey.Unknown);
      }
    },
    [t],
  );

  const handleCircleClick = useCallback(() => {
    dispatch({ type: "TOGGLE_HIDDEN" });
  }, []);

  const handleImageClick = useCallback((imageUrl: string, username: string) => {
    dispatch({
      type: "SHOW_POPUP",
      payload: { image: imageUrl, username },
    });
  }, []);

  const handleClosePopup = useCallback(() => {
    dispatch({ type: "HIDE_POPUP" });
  }, []);

  const getEntryTypeClass = useCallback(
    (item: ILastMessage & { isReply: boolean }) => {
      const entryTypeStr = entryTypeToStr(item.entryType);
      let baseClass = "";

      if (entryTypeStr === t(LanguageKey.navbar_Ticket)) {
        baseClass = styles.ticket;
      } else if (entryTypeStr === t(LanguageKey.navbar_Direct)) {
        baseClass = styles.direct;
      } else if (entryTypeStr === t(LanguageKey.navbar_Comments)) {
        baseClass = styles.comment;
      } else {
        baseClass = styles.unknown;
      }

      return item.isReply ? `${baseClass} ${styles.reply}` : baseClass;
    },
    [t],
  );

  const getEntryTypeLabel = useCallback(
    (item: ILastMessage & { isReply: boolean }) => {
      return item.isReply ? t(LanguageKey.reply) : entryTypeToStr(item.entryType);
    },
    [t],
  );

  const containerStyle = useMemo(
    () => ({
      maxHeight: state.isHidden ? "0" : "100%",
      opacity: state.isHidden ? 0 : 1,
    }),
    [state.isHidden],
  );

  useEffect(() => {
    if ((data || repliesData) && LoginStatus(session)) {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [data, repliesData, session]);

  return (
    <section
      className={`${styles.tooBigCard} ${state.isHidden ? styles.toobigcardclose : ""} tooBigCard`}
      role="region"
      aria-label="Last Messages">
      <div className={styles.contactBox}>
        <header
          style={{ cursor: "pointer" }}
          className={styles.headersection}
          onClick={handleCircleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleCircleClick()}
          aria-label="Toggle messages visibility">
          <div className={styles.backdropfade} />
          <img style={{ height: "50px" }} src="/home-message.svg" alt="Messages icon" title="↕ Resize the Card" />
          <div className={styles.headerandinput}>
            <span className="title">
              {messageCounts.direct > 0 ? `${messageCounts.direct}+` : messageCounts.direct}
            </span>
            <span className="explain" style={{ textAlign: "center" }}>
              {t(LanguageKey.navbar_Direct)}
            </span>
          </div>
          <div className={styles.headerandinput}>
            <span className="title">
              {messageCounts.ticket > 0 ? `${messageCounts.ticket}+` : messageCounts.ticket}
            </span>
            <span className="explain" style={{ textAlign: "center" }}>
              {t(LanguageKey.navbar_Ticket)}
            </span>
          </div>
          {/* <div className={styles.headerandinput}>
            <span className="title">{unreadComments ? `${unreadComments}+` : "0"}</span>
            <span className="explain" style={{ textAlign: "center" }}>
              {t(LanguageKey.unreadcomment)}
            </span>
          </div> */}
        </header>

        {state.isLoading ? (
          <Loading />
        ) : (
          <div className={styles.frameContainer} style={containerStyle} role="feed" aria-label="Messages feed">
            {sortedItems.map((item, index) => (
              <MessageItem
                key={`${item.isReply ? "reply" : "message"}-${item.timeStampUnix}-${index}`}
                item={item}
                basePictureUrl={basePictureUrl}
                onImageClick={handleImageClick}
                getItemTypeEmoji={getItemTypeEmoji}
                entryTypeClass={getEntryTypeClass(item)}
                entryTypeLabel={getEntryTypeLabel(item)}
              />
            ))}
          </div>
        )}
      </div>

      <Popup
        show={state.popup.show}
        image={state.popup.image}
        username={state.popup.username}
        onClose={handleClosePopup}
      />
    </section>
  );
});

LastMessage.displayName = "LastMessage";

export default LastMessage;
