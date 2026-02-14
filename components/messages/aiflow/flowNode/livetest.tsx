import { useSession } from "next-auth/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import InputText from "saeed/components/design/inputText";
import { LanguageKey } from "saeed/i18n/languageKeys";
import styles from "./livetest.module.css";
import { NodeData } from "./types";

// Define baseMediaUrl or import it from a config file
const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL || "";

interface Connection {
  id: string;
  sourceNodeId: string;
  sourceSocketId: string;
  targetNodeId: string;
  targetSocketId: string;
  protected?: boolean;
}

interface EditorStateLite {
  nodes: NodeData[];
  connections: Connection[];
}

type MessageKind =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "weblink"
  | "quickreply"
  | "generic"
  | "genericitem";

interface ChatMessageBase {
  id: string;
  role: "user" | "bot";
  kind: MessageKind;
  timestamp: number;
}

interface ChatMessageText extends ChatMessageBase {
  kind: "text";
  text: string;
}

interface ChatMessageImage extends ChatMessageBase {
  kind: "image" | "video";
  url: string;
}

interface ChatMessageAudio extends ChatMessageBase {
  kind: "audio";
  url: string;
}

interface ChatMessageWeblink extends ChatMessageBase {
  kind: "weblink";
  title?: string;
  url: string;
}

interface GenericItemView {
  id: string;
  nodeId: string;
  title?: string;
  subtitle?: string;
  image?: string | null;
  weblink?: string;
  buttons?: string[];
}

interface ChatMessageQuickReply extends ChatMessageBase {
  kind: "quickreply";
  options: string[];
  nodeId: string;
}

interface ChatMessageGeneric extends ChatMessageBase {
  kind: "generic";
  items: GenericItemView[];
  nodeId: string;
}

type ChatMessage =
  | ChatMessageText
  | ChatMessageImage
  | ChatMessageAudio
  | ChatMessageWeblink
  | ChatMessageQuickReply
  | ChatMessageGeneric;

interface LiveTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  editorState: EditorStateLite;
  title?: string;
  avatarUrl?: string;
}

function getNodeById(nodes: NodeData[], id: string) {
  return nodes.find((n) => n.id === id);
}

function getOutgoing(conns: Connection[], nodeId: string) {
  return conns.filter((c) => c.sourceNodeId === nodeId);
}

function getConnectionForOutput(
  conns: Connection[],
  nodeId: string,
  socketId: string,
) {
  return conns.find(
    (c) => c.sourceNodeId === nodeId && c.sourceSocketId === socketId,
  );
}

function isVideoUrl(url?: string | null) {
  if (!url) return false;
  return (
    /(\.mp4|\.webm|\.ogg|\.mov|\.avi|\.mkv)($|\?)/i.test(url) ||
    url.startsWith("data:video/")
  );
}

export const LiveTestModal: React.FC<LiveTestModalProps> = ({
  isOpen,
  onClose,
  editorState,
  title,
  avatarUrl,
}) => {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const lastUserIdRef = useRef<string | null>(null);
  const [seenUserId, setSeenUserId] = useState<string | null>(null);
  const [deliveredUserId, setDeliveredUserId] = useState<string | null>(null);
  const [clickedQuickReplies, setClickedQuickReplies] = useState<Set<string>>(
    new Set(),
  );
  const [clickedGenericButtons, setClickedGenericButtons] = useState<
    Set<string>
  >(new Set());
  const seenTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const nodes = editorState?.nodes || [];
  const connections = editorState?.connections || [];

  const userAvatar =
    avatarUrl || session?.user?.profileUrl || "/default-avatar.png";
  useEffect(() => {
    if (!isOpen) return;
    // Reset on open
    setMessages([]);
    setInput("");
    setTyping(false);
  }, [isOpen]);

  useEffect(() => {
    console.log("LiveTestModal mounted", editorState);
    return () => {
      if (seenTimerRef.current) clearTimeout(seenTimerRef.current);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const startNode = useMemo(
    () => nodes.find((n) => n.type === "onmessage"),
    [nodes],
  );

  // Accept a payload matching any bot message variant without base fields
  type BotPayload =
    | Omit<ChatMessageText, "id" | "role" | "timestamp">
    | Omit<ChatMessageImage, "id" | "role" | "timestamp">
    | Omit<ChatMessageAudio, "id" | "role" | "timestamp">
    | Omit<ChatMessageWeblink, "id" | "role" | "timestamp">
    | Omit<ChatMessageQuickReply, "id" | "role" | "timestamp">
    | Omit<ChatMessageGeneric, "id" | "role" | "timestamp">;

  const appendBot = useCallback((m: BotPayload) => {
    console.log("appendBot called with:", m);
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}_${Math.random()}`,
        role: "bot",
        timestamp: Date.now(),
        ...m,
      },
    ]);
    const uid = lastUserIdRef.current;
    if (uid) {
      setDeliveredUserId(uid);
      if (seenTimerRef.current) clearTimeout(seenTimerRef.current);
      seenTimerRef.current = setTimeout(() => {
        setSeenUserId(uid);
      }, 1200);
    }
  }, []);

  const appendUser = useCallback((text: string) => {
    const id = `${Date.now()}_${Math.random()}`;
    lastUserIdRef.current = id;
    setSeenUserId(null);
    setMessages((prev) => [
      ...prev,
      { id, role: "user", timestamp: Date.now(), kind: "text", text },
    ]);
  }, []);

  const runFromNode = useCallback(
    async (nodeId: string, visited = new Set<string>()) => {
      console.log("runFromNode:", nodes);
      const node = getNodeById(nodes, nodeId);
      if (!node || visited.has(node.id)) return;
      visited.add(node.id);

      // Small delay to simulate typing
      const delay = async (ms: number) =>
        new Promise((res) => setTimeout(res, ms));

      const cont = async () => {
        const outs = getOutgoing(connections, node.id);
        if (!outs.length) return;
        // For non-choice nodes, follow all outgoing
        for (const out of outs) {
          await runFromNode(out.targetNodeId, visited);
        }
      };

      switch (node.type) {
        case "onmessage": {
          await cont();
          break;
        }
        case "text": {
          const text = node.data?.text || "";
          if (text) {
            setTyping(true);
            await delay(Math.min(1200, Math.max(300, text.length * 20)));
            setTyping(false);
            appendBot({ kind: "text", text });
          }
          await cont();
          break;
        }
        case "image": {
          const url = node.data?.tempUrl || baseMediaUrl + node.data.imageUrl;
          if (url) {
            setTyping(true);
            await delay(500);
            setTyping(false);
            if (isVideoUrl(url)) appendBot({ kind: "video", url });
            else appendBot({ kind: "image", url });
          }
          await cont();
          break;
        }
        case "voice": {
          const url =
            node.data?.tempVoiceUrl || baseMediaUrl + node.data.voiceUrl;
          if (url) {
            setTyping(true);
            await delay(400);
            setTyping(false);
            appendBot({ kind: "audio", url });
          }
          await cont();
          break;
        }
        case "weblink": {
          const url = node.data?.url as string | undefined;
          if (url) {
            // Open link in new tab without showing message
            window.open(url, "_blank", "noopener,noreferrer");
            console.log("✅ Opened weblink in new tab:", url);
          }
          // Don't continue or show message
          break;
        }
        case "quickreply": {
          const buttons = node.data?.buttons;
          console.log("quickreply node.data?.buttons:", buttons);
          const options: string[] = Array.isArray(buttons) ? buttons : [];
          console.log("quickreply options:", options);
          if (!options.length) {
            // nothing to choose, just continue
            await cont();
            break;
          }
          appendBot({ kind: "quickreply", options, nodeId: node.id });
          // Wait for user action; do not auto-continue
          break;
        }
        case "generic": {
          // Collect connected genericitem nodes
          const outs = getOutgoing(connections, node.id);
          const genericItemNodes = outs
            .map((o) => getNodeById(nodes, o.targetNodeId))
            .filter(Boolean)
            .filter((n) => n!.type === "genericitem");

          const items: GenericItemView[] = genericItemNodes.map((n) => ({
            id: `itm_${n!.id}`,
            nodeId: n!.id,
            title: n!.data?.title,
            subtitle: n!.data?.subtitle,
            image:
              n!.data?.tempUrl ||
              (n!.data.imageUrl ? baseMediaUrl + n!.data.imageUrl : null),
            weblink: n!.data?.weblink,
            buttons: n!.data?.buttons || ["Button 1"],
          }));

          if (items.length) {
            setTyping(true);
            await delay(500);
            setTyping(false);
            appendBot({ kind: "generic", items, nodeId: node.id });
          }

          // Process non-genericitem blocks
          const otherBlocks = outs
            .map((o) => getNodeById(nodes, o.targetNodeId))
            .filter(Boolean)
            .filter((n) => n!.type !== "genericitem");

          for (const block of otherBlocks) {
            await runFromNode(block!.id, visited);
          }

          // Wait for user action on a card button only if there are items
          if (items.length) {
            break;
          }
          // Otherwise continue
          break;
        }
        case "genericitem": {
          // If flow lands directly on a generic item, show it as a single card
          const gi: GenericItemView = {
            id: `itm_${node.id}`,
            nodeId: node.id,
            title: node.data?.title,
            subtitle: node.data?.subtitle,
            image: node.data?.image || node.data?.imageUrl || null,
            weblink: node.data?.weblink,
            buttons: node.data?.buttons || ["Button 1"],
          };
          setTyping(true);
          await delay(450);
          setTyping(false);
          appendBot({ kind: "generic", items: [gi], nodeId: node.id });
          // Wait for click on button
          break;
        }
        default: {
          await cont();
        }
      }
    },
    [nodes, connections, appendBot],
  );

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    appendUser(text);
    if (startNode) {
      await runFromNode(startNode.id);
    }
  }, [input, appendUser, startNode, runFromNode]);

  const handlePickQuickReply = useCallback(
    async (nodeId: string, index: number, label: string, messageId: string) => {
      console.log("=== QUICKREPLY BUTTON CLICKED ===");
      console.log("Button label:", label);
      console.log("Button index:", index);
      console.log("Node ID:", nodeId);

      // Mark this quick reply message as clicked
      setClickedQuickReplies((prev) => new Set(prev).add(messageId));
      // Post user selection as message
      appendUser(label);

      // Find the node
      const node = getNodeById(nodes, nodeId);
      console.log("Node found:", node);

      // Get all connections from this node
      const allConnsFromNode = connections.filter(
        (c) => c.sourceNodeId === nodeId,
      );
      console.log("All connections from this node:", allConnsFromNode);

      // Try to find connection by index
      // Method 1: If connections are in order, use index directly
      const conn = allConnsFromNode[index];
      console.log("Connection at index", index, ":", conn);

      if (conn) {
        console.log("✅ Running from target node:", conn.targetNodeId);
        await runFromNode(conn.targetNodeId);
        console.log("✅ Finished running from target node:", conn.targetNodeId);
      } else {
        console.warn(
          "❌ No connection found for quickreply button index",
          index,
        );
        console.warn("Total connections from node:", allConnsFromNode.length);
        console.warn("All connections:", allConnsFromNode);
      }
    },
    [appendUser, nodes, connections, runFromNode],
  );

  const handlePickGenericButton = useCallback(
    async (
      itemNodeId: string,
      btnIndex: number,
      label: string,
      messageId: string,
    ) => {
      console.log("=== GENERIC BUTTON CLICKED ===");
      console.log("Button label:", label);
      console.log("Button index:", btnIndex);
      console.log("Item Node ID:", itemNodeId);

      // Show as user tap (Instagram shows tap but we show as user message)
      appendUser(label);

      const node = getNodeById(nodes, itemNodeId);
      console.log("Node found:", node);

      // Get all connections from this node
      const allConnsFromNode = connections.filter(
        (c) => c.sourceNodeId === itemNodeId,
      );
      console.log("All connections from this node:", allConnsFromNode);

      // Use index directly
      const conn = allConnsFromNode[btnIndex];
      console.log("Connection at index", btnIndex, ":", conn);

      if (conn) {
        console.log("✅ Running from target node:", conn.targetNodeId);
        await runFromNode(conn.targetNodeId);
        console.log("✅ Finished running from target node:", conn.targetNodeId);
      } else {
        console.warn(
          "❌ No connection found for generic button index",
          btnIndex,
        );
        console.warn("Total connections from node:", allConnsFromNode.length);
      }
    },
    [appendUser, nodes, connections, runFromNode],
  );

  const reset = useCallback(() => {
    setMessages([]);
    setInput("");
    setTyping(false);
    setSeenUserId(null);
    setDeliveredUserId(null);
    setClickedQuickReplies(new Set());
    setClickedGenericButtons(new Set());
    lastUserIdRef.current = null;
    if (seenTimerRef.current) clearTimeout(seenTimerRef.current);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="dialogBg" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className="instagramprofile">
            <img
              className="instagramimage"
              src={
                session?.user.profileUrl
                  ? baseMediaUrl + session.user.profileUrl
                  : "/no-profile.svg"
              }
              alt="avatar"
              width="28"
              height="28"
            />
            <div className="instagramprofiledetail">
              <div className="instagramusername">{session?.user.fullName}</div>
              <div className="instagramid">@{session?.user.username}</div>
            </div>
          </div>
          <div className={styles.BtnGroup}>
            <img
              role="button"
              onClick={reset}
              style={{ cursor: "pointer", width: "24px", height: "24px" }}
              title="ℹ️ reset"
              src="/icon-reply.svg"
            />
            <img
              role="button"
              onClick={onClose}
              style={{ cursor: "pointer", width: "24px", height: "24px" }}
              title="ℹ️ close"
              src="/close-box.svg"
            />
          </div>
        </div>

        <div className={styles.chat}>
          <div className={`${styles.messages} translate`}>
            {/* {!messages.length && (
              <div className={styles.placeholder}>
                {startNode ? "برای شروع یک پیام ارسال کنید" : "OnMessage node یافت نشد. لطفاً یک نود شروع اضافه کنید."}
              </div>
            )} */}

            {messages.map((m, idx) => {
              const isUser = m.role === "user";
              const isLastUser =
                isUser &&
                messages
                  .slice()
                  .reverse()
                  .find((x) => x.role === "user")?.id === m.id;
              const fmtTime = (ts: number) =>
                new Date(ts).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
              const prev = messages[idx - 1];
              const sameDay =
                prev &&
                new Date(prev.timestamp).toDateString() ===
                  new Date(m.timestamp).toDateString();
              return (
                <>
                  {!sameDay && (
                    <div className={styles.daySeparator}>
                      <span className={styles.dayText}>
                        {new Date(m.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {m.kind === "quickreply" &&
                    !clickedQuickReplies.has(m.id) && (
                      <div
                        key={m.id}
                        className={`${styles.row} ${
                          isUser ? styles.right : ""
                        }`}>
                        <div style={{ width: "100%", padding: "8px 0" }}>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "8px",
                              justifyContent: "flex-start",
                            }}>
                            {(m as ChatMessageQuickReply).options.map(
                              (opt, i) => {
                                console.log(`Rendering button ${i}: ${opt}`);
                                return (
                                  <button
                                    key={`qr_${i}`}
                                    className={styles.chip}
                                    style={{
                                      padding: "8px 16px",
                                      backgroundColor: "#007bff",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "20px",
                                      cursor: "pointer",
                                      fontSize: "14px",
                                      fontWeight: "500",
                                    }}
                                    onClick={() =>
                                      handlePickQuickReply(
                                        (m as ChatMessageQuickReply).nodeId,
                                        i,
                                        opt,
                                        m.id,
                                      )
                                    }>
                                    {opt}
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  {m.kind !== "quickreply" && (
                    <div
                      key={m.id}
                      className={`${styles.row} ${isUser ? styles.right : ""}`}>
                      <div
                        className={`${styles.bubble} ${
                          isUser ? styles.user : styles.bot
                        } ${m.kind === "generic" ? styles.fullWidth : ""}`}>
                        {m.kind === "text" && "text" in m && (
                          <span>{(m as ChatMessageText).text}</span>
                        )}
                        {(m.kind === "image" || m.kind === "video") &&
                          (m.kind === "video" ? (
                            <video
                              className={styles.media}
                              controls
                              src={(m as ChatMessageImage).url}
                            />
                          ) : (
                            <img
                              className={styles.media}
                              src={(m as ChatMessageImage).url}
                              alt="image"
                            />
                          ))}
                        {m.kind === "audio" && (
                          <audio
                            controls
                            src={(m as ChatMessageAudio).url}
                            style={{ maxWidth: 260 }}
                          />
                        )}
                        {m.kind === "weblink" && (
                          <div className={styles.linkCard}>
                            {(m as ChatMessageWeblink).title && (
                              <div className={styles.linkTitle}>
                                {(m as ChatMessageWeblink).title}
                              </div>
                            )}
                            <a
                              href={(m as ChatMessageWeblink).url}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.linkUrl}>
                              {(m as ChatMessageWeblink).url}
                            </a>
                          </div>
                        )}
                        {m.kind === "generic" && (
                          <div className={styles.carousel}>
                            {(m as ChatMessageGeneric).items.map((it) => (
                              <div key={it.id} className={styles.card}>
                                {it.image &&
                                  (isVideoUrl(it.image) ? (
                                    <video
                                      className={styles.media}
                                      controls
                                      src={it.image}
                                    />
                                  ) : (
                                    <img
                                      className={styles.media}
                                      src={it.image}
                                      alt={it.title || "item"}
                                    />
                                  ))}
                                <div className={styles.cardBody}>
                                  {it.title && (
                                    <div className={styles.cardTitle}>
                                      {it.title}
                                    </div>
                                  )}
                                  {it.subtitle && (
                                    <div className={styles.cardSubtitle}>
                                      {it.subtitle}
                                    </div>
                                  )}
                                  <div className={styles.cardButtons}>
                                    {(it.buttons || []).map((b, idx) => (
                                      <button
                                        key={`btn_${it.id}_${idx}`}
                                        className={styles.btn}
                                        onClick={() =>
                                          handlePickGenericButton(
                                            it.nodeId,
                                            idx,
                                            b,
                                            m.id,
                                          )
                                        }>
                                        {b}
                                      </button>
                                    ))}
                                    {it.weblink && (
                                      <a
                                        className={`${styles.btn} ${styles.secondary}`}
                                        href={it.weblink}
                                        target="_blank"
                                        rel="noreferrer">
                                        {it.weblink}
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Meta row */}
                  {m.kind !== "quickreply" && (
                    <div
                      className={`${styles.meta} ${
                        isUser ? styles.metaRight : styles.metaLeft
                      }`}>
                      {isLastUser
                        ? seenUserId === m.id
                          ? "Seen"
                          : deliveredUserId === m.id
                            ? "Delivered"
                            : fmtTime(m.timestamp)
                        : fmtTime(m.timestamp)}
                    </div>
                  )}
                </>
              );
            })}
            {typing && (
              <div className={styles.typingBubble}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
        <div className={styles.inputBar}>
          <div
            style={{ width: "100%" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}>
            <InputText
              className="textinputbox"
              placeHolder={t(LanguageKey.pageToolspopup_typehere)}
              value={input}
              handleInputChange={(e) => setInput(e.target.value)}
            />
          </div>
          <button
            className="saveButton"
            style={{ width: "fit-content" }}
            onClick={handleSend}>
            {t(LanguageKey.send)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveTestModal;
