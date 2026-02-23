// React core
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

// Next.js
import { useSession } from "next-auth/react";

// Third-party
import { t } from "i18next";

// Local components
import InputText from "brancy/components/design/inputText";
import {
  NotifType,
  notify,
  ResponseType,
} from "brancy/components/notifications/notificationBox";

// Local types & models
import { LanguageKey } from "brancy/i18n";
import {
  ICreateLiveChat,
  ICreatePrompt,
  ILiveChat,
} from "brancy/models/AI/prompt";
import { MethodType } from "brancy/helper/api";
import { ItemType } from "brancy/models/messages/enum";

// Styles
import styles from "brancy/components/messages/aiflow/popup/AI_liveChat.module.css";
import { clientFetchApi } from "brancy/helper/clientFetchApi";

type ChatState = {
  messages: ILiveChat[];
  isLoading: boolean;
  isFirstMessage: boolean;
  userInput: string;
};

type ChatAction =
  | { type: "SET_USER_INPUT"; payload: string }
  | { type: "ADD_MESSAGE"; payload: ILiveChat }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_FIRST_MESSAGE"; payload: boolean }
  | { type: "RESET" };

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case "SET_USER_INPUT":
      return { ...state, userInput: action.payload };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_FIRST_MESSAGE":
      return { ...state, isFirstMessage: action.payload };
    case "RESET":
      return {
        messages: [],
        isLoading: false,
        isFirstMessage: true,
        userInput: "",
      };
    default:
      return state;
  }
};

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  isFirstMessage: true,
  userInput: "",
};

export default function LiveChat({
  promptInfo,
}: {
  promptInfo: ICreatePrompt;
}) {
  const { data: session } = useSession();
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const username = useMemo(
    () => session?.user.fullName || session?.user.username || "User",
    [session?.user.fullName, session?.user.username]
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const playVoiceMessage = useCallback(
    (voiceData: Blob | string) => {
      try {
        cleanupAudio();

        if (voiceData instanceof Blob) {
          const audioUrl = URL.createObjectURL(voiceData);
          audioUrlRef.current = audioUrl;
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          audio.play();
        } else if (typeof voiceData === "string") {
          const audio = new Audio(voiceData);
          audioRef.current = audio;
          audio.play();
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    },
    [cleanupAudio]
  );

  const handleUserInput = useCallback(async () => {
    const trimmedInput = state.userInput.trim();
    if (!trimmedInput || state.isLoading) return;

    dispatch({ type: "SET_USER_INPUT", payload: "" });
    // Add user message to chat
    dispatch({
      type: "ADD_MESSAGE",
      payload: {
        imageUrl: null,
        isStopped: false,
        itemType: ItemType.Text,
        quickReplies: [],
        text: trimmedInput,
        type: "user",
        voiceUrl: null,
      },
    });

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const createPromptInfo: ICreateLiveChat = {
        promptInfo,
        text: trimmedInput,
        username,
      };

      const res = await clientFetchApi<ICreateLiveChat, ILiveChat>("/api/ai/SendTestMessage", { methodType: MethodType.post, session: session, data: createPromptInfo, queries: [{ key: "isStart", value: state.isFirstMessage ? "true" : "false" }], onUploadProgress: undefined });
      console.log("LiveChat response:", res);
      if (res.succeeded) {
        dispatch({ type: "ADD_MESSAGE", payload: res.value });
        if (state.isFirstMessage) {
          dispatch({ type: "SET_FIRST_MESSAGE", payload: false });
        }
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [
    state.userInput,
    state.isLoading,
    state.isFirstMessage,
    promptInfo,
    username,
    session,
  ]);

  const handleReset = useCallback(() => {
    cleanupAudio();
    dispatch({ type: "RESET" });
  }, [cleanupAudio]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_USER_INPUT", payload: e.target.value });
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !state.isLoading) {
        e.preventDefault();
        handleUserInput();
      } else if (e.key === "Escape") {
        e.preventDefault();
        dispatch({ type: "SET_USER_INPUT", payload: "" });
        (e.target as HTMLInputElement).blur();
      }
    },
    [state.isLoading, handleUserInput]
  );

  const handleResetKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleReset();
      }
    },
    [handleReset]
  );

  const renderMessage = useCallback(
    (message: ILiveChat, index: number) => (
      <div
        key={index}
        className={`${styles.flowTestMessage} ${styles[message.type]}`}
        role="article"
        aria-label={`${
          message.type === "user" ? "پیام کاربر" : "پیام سیستم"
        }: ${message.text || "رسانه"}`}>
        <div className={styles.messageContent}>
          {message.itemType === ItemType.Text && message.text && (
            <div className={styles.textMessage}>{message.text}</div>
          )}
          {message.itemType === ItemType.Media && message.imageUrl && (
            <img
              src={message.imageUrl}
              alt="تصویر پیام"
              className={styles.messageImage}
              loading="lazy"
            />
          )}
          {message.itemType === ItemType.AudioShare && message.voiceUrl && (
            <button
              type="button"
              className={styles.voicePlayBtn}
              onClick={() => playVoiceMessage(message.voiceUrl!)}
              aria-label="پخش پیام صوتی">
              {t(LanguageKey.AIFlow_play_voice)}
            </button>
          )}
        </div>
      </div>
    ),
    [playVoiceMessage]
  );

  useEffect(() => {
    scrollToBottom();
  }, [state.messages, scrollToBottom]);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  return (
    <>
      <header className={styles.flowTestHeader}>
        <h2 className="title">{t(LanguageKey.testlab)}</h2>
        <div className={styles.flowTestControls}>
          <div
            title="ریست کردن گفتگو"
            role="button"
            tabIndex={0}
            onClick={handleReset}
            onKeyDown={handleResetKeyDown}
            className={styles.flowTestheaderBtn}
            aria-label="ریست کردن گفتگو">
            <svg
              width="40"
              height="40"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              color="var(--color-gray)"
              viewBox="0 0 24 24"
              aria-hidden="true">
              <path
                opacity=".3"
                d="m12 1.8 5.3.1q2.1.2 3.3 1.5 1.3 1.3 1.5 3.3l.1 5.2v.2l-.1 5.2a6 6 0 0 1-1.5 3.3q-1.3 1.3-3.3 1.5l-5.2.1h-.2l-5.2-.1a6 6 0 0 1-3.3-1.5Q2 19.3 1.9 17.3q-.3-2-.1-5.2v-.2l.1-5.2q.2-2.1 1.5-3.3Q4.7 2 6.7 1.9q2-.3 5.2-.1z"
                fill="currentColor"
              />
              <path
                d="M14.2 6.4q.7-.3 1 .1l1.1 1.3.4.7q.2.2 0 .9a1 1 0 0 1-.7.6H9.3q-.9 0-.9.3-.1.2-.2 1.2a.8.8 0 0 1-1.4 0q0-1 .3-2 .8-1 2.2-1h4.6V7zM16.5 11.7q.7 0 .8.8a4 4 0 0 1-.4 2q-.8 1-2.2 1h-4.6V17a.7.7 0 0 1-1.4.5l-1-1.3-.4-.7a1 1 0 0 1 0-.9q.3-.5.7-.6h6.7q.9 0 .9-.3.1-.2.2-1.2 0-.8.7-.8"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </header>

      <main
        className={`${styles.flowTestMessages} translate`}
        role="log"
        aria-live="polite"
        aria-atomic="false">
        {state.messages.map(renderMessage)}
        <div ref={messagesEndRef} aria-hidden="true" />
      </main>

      <footer
        className="headerandinput"
        style={{ paddingBlock: "var(--padding-10)" }}>
        {state.isLoading && (
          <div
            className={styles.typingIndicator}
            role="status"
            aria-label="در حال تایپ">
            <span className={styles.dot1} aria-hidden="true">
              ●
            </span>
            <span className={styles.dot2} aria-hidden="true">
              ●
            </span>
            <span className={styles.dot3} aria-hidden="true">
              ●
            </span>
          </div>
        )}

        <div
          className={`${styles.flowTestInput} ${
            state.isLoading ? "fadeDiv" : ""
          }`}>
          <InputText
            value={state.userInput}
            handleInputChange={handleInputChange}
            placeHolder={t(LanguageKey.pageToolspopup_typehere)}
            className="textinputbox"
            onKeyDown={handleKeyDown}
            disabled={state.isLoading}
            aria-label="ورودی پیام"
          />
          <button
            type="button"
            onClick={handleUserInput}
            className="saveButton"
            style={{ width: "48px" }}
            disabled={state.isLoading || !state.userInput.trim()}
            aria-label="ارسال پیام">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true">
              <path
                opacity=".4"
                d="M12 4.8c4.7-1.6 7-2.5 8.4-1.2 1.3 1.3.4 3.7-1.2 8.5l-1.1 3.2c-1.2 3.7-1.9 5.5-2.9 5.7h-.8c-1-.4-1.6-2.4-2.7-6.2q-.2-1.2-.6-1.6l-.3-.3q-.4-.4-1.6-.6c-3.8-1.1-5.8-1.6-6.1-2.7q-.2-.3 0-.8 0-1.3 5.6-2.9z"
                fill="#fff"
              />
              <path
                d="M12 4.8c4.7-1.6 7-2.5 8.4-1.2 1.3 1.3.4 3.7-1.2 8.5l-1.1 3.2c-1.2 3.7-1.9 5.5-2.9 5.7h-.8c-1-.4-1.6-2.4-2.7-6.2q-.2-1.2-.6-1.6l-.3-.3q-.4-.4-1.6-.6c-3.8-1.1-5.8-1.6-6.1-2.7q-.2-.3 0-.8 0-1.3 5.6-2.9z"
                stroke="#fff"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>
      </footer>
    </>
  );
}
