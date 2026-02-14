import { t } from "i18next";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import RingLoader from "saeed/components/design/loader/ringLoder";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import { LanguageKey } from "saeed/i18n";
import { ICreateLiveChat, ICreatePrompt, ILiveChat } from "saeed/models/AI/prompt";
import { GetServerResult, MethodType } from "saeed/models/IResult";
import { ItemType } from "saeed/models/messages/enum";
import styles from "./supportChat.module.scss";
export default function SupportChat({
  promptInfo,
  setShowLiveChatPopup,
}: {
  promptInfo: ICreatePrompt;
  setShowLiveChatPopup: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { data: session } = useSession();
  const [username, setUsername] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [messages, setMessages] = useState<ILiveChat[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingResumeChat, setLoadingResumeChat] = useState(false);
  const checkStartLiveChat = useCallback(() => {
    return username.trim().length > 0 && firstMessage.trim().length > 0;
  }, [username, firstMessage]);
  const [userInput, setUserInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  async function handleSendMessage() {
    setLoadingChat(true);
    setMessages((prev) => [
      ...prev,
      {
        imageUrl: null,
        isStopped: false,
        itemType: ItemType.Text,
        quickReplies: [],
        text: firstMessage,
        type: "user",
        voiceUrl: null,
      },
    ]);
    try {
      const createPromptInfo: ICreateLiveChat = {
        promptInfo: promptInfo,
        text: firstMessage,
        username: username,
      };
      console.log("createPromptInfo", createPromptInfo);
      const res = await GetServerResult<ICreateLiveChat, ILiveChat>(
        MethodType.post,
        session,
        "Instagramer/AI/SendTestMessage",
        createPromptInfo,
        [{ key: "isStart", value: "true" }]
      );
      if (res.succeeded) {
        setMessages((prev) => [...prev, res.value]);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoadingChat(false);
    }
  }
  async function handleResumeChat(message: string) {
    try {
      setLoadingResumeChat(true);
      const createPromptInfo: ICreateLiveChat = {
        promptInfo: promptInfo,
        text: message,
        username: username,
      };
      console.log("resume chat", createPromptInfo);
      const res = await GetServerResult<ICreateLiveChat, ILiveChat>(
        MethodType.post,
        session,
        "Instagramer/AI/SendTestMessage",
        createPromptInfo,
        [{ key: "isStart", value: "false" }]
      );
      if (res.succeeded) setMessages((prev) => [...prev, res.value]);
      else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoadingResumeChat(false);
    }
  }
  const handleUserInput = () => {
    if (userInput.trim()) {
      addMessage("user", userInput, ItemType.Text);
      handleResumeChat(userInput.trim());
      setUserInput("");
    }
  };
  const addMessage = (type: "user" | "object", content: string, itemType: ItemType) => {
    const newMessage: ILiveChat = {
      type,
      imageUrl: "",
      isStopped: false,
      itemType: itemType,
      quickReplies: [],
      text: content,
      voiceUrl: null,
    };
    setMessages((prev) => [...prev, newMessage]);
  };
  const playVoiceMessage = (voiceData: Blob | string) => {
    try {
      if (voiceData instanceof Blob) {
        const audioUrl = URL.createObjectURL(voiceData);
        const audio = new Audio(audioUrl);
        audio.play();
      } else if (typeof voiceData === "string") {
        const audio = new Audio(voiceData);
        audio.play();
      }
    } catch (error) {
      console.error("Error playing voice:", error);
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  return (
    <>
      {loadingChat && <Loading />}
      {!loadingChat && (
        <>
          <div className={styles.flowTestHeader}>
            {t(LanguageKey.AIFlow_live_test_block)}
            <div className={styles.flowTestControls}>
              <div title="Reset 🔄" role="button" onClick={() => {}} className={styles.flowTestheaderBtn}>
                <svg
                  width="40"
                  height="40"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  color="var(--color-gray)"
                  viewBox="0 0 24 24">
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
              <div
                title="close ✖️"
                role="button"
                onClick={() => {
                  setShowLiveChatPopup(false);
                }}
                className={styles.flowTestheaderBtn}>
                <img
                  src="/close-box.svg"
                  width="40"
                  height="40"
                  className="flowTestheaderBtn"
                  alt="close"
                  role="button"
                />
              </div>
            </div>
          </div>
          <div className={`${styles.flowTestMessages} translate`}>
            {messages.map((message, index) => (
              <div key={index} className={`${styles.flowTestMessage} ${styles[message.type]}`}>
                <div className={styles.messageContent}>
                  {message.itemType === ItemType.Text && <div className={styles.textMessage}>{message.text}</div>}
                  {message.itemType === ItemType.Media && message.imageUrl && (
                    <div className={styles.imageMessage}>
                      <img src={message.imageUrl} alt="Flow Image" className={styles.messageImage} />
                    </div>
                  )}
                  {message.itemType === ItemType.AudioShare && message.voiceUrl && (
                    <div className={styles.voiceMessage}>
                      <button
                        className={styles.voicePlayBtn}
                        onClick={() => {
                          if (!message.voiceUrl) return;
                          playVoiceMessage(message.voiceUrl);
                        }}>
                        {t(LanguageKey.AIFlow_play_voice)}
                      </button>
                    </div>
                  )}
                </div>
                {/* <div className={styles.messageTimestamp}>
                    {message.timestamp.toLocaleTimeString()}
                  </div> */}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.flowTestInput}>
            {loadingResumeChat && <RingLoader />}
            {!loadingResumeChat && (
              <>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleUserInput()}
                  placeholder={t(LanguageKey.pageToolspopup_typehere)}
                  className={styles.userInput}
                />
                <button onClick={handleUserInput} className={styles.sendBtn}>
                  ➤
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
