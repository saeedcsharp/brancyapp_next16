import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "saeed/i18n";
import styles from "./flowTest.module.scss";

interface FlowMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  messageType?: "text" | "image" | "voice" | "quickreply" | "generic" | "weblink";
  data?: any;
}
interface FlowTestProps {
  isOpen: boolean;
  onClose: () => void;
  flowData: any;
  nodes: any[];
  connections: any[];
}
interface QuickReplyOption {
  title: string;
  nextNodeId: string;
}
interface GenericItem {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  weblink?: string;
  buttons: Array<{
    title: string;
    nextNodeId: string;
  }>;
}
const FlowTest: React.FC<FlowTestProps> = ({ isOpen, onClose, flowData, nodes, connections }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<FlowMessage[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [isFlowActive, setIsFlowActive] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Ensure portal only runs on client
  useEffect(() => {
    setIsClient(true);
  }, []);
  const findOnMessageNode = () => {
    return nodes.find(
      (node) =>
        node.label === "OnMessage" ||
        (node as any).nodeType === "onmessage" ||
        node.label?.toLowerCase().includes("onmessage")
    );
  };
  const findConnectedNode = (fromNodeId: string, outputKey: string = "output") => {
    const connection = connections.find((conn) => conn.source === fromNodeId && conn.sourceOutput === outputKey);
    return connection ? nodes.find((node) => node.id === connection.target) : null;
  };
  const getNodeControlValue = (node: any, controlKey: string) => {
    const control = node.controls?.[controlKey];
    if (control?.value !== undefined && control.value !== null && control.value !== "") {
      return control.value;
    }
    return control?.initial || "";
  };
  const startFlow = () => {
    setMessages([]);
    setIsFlowActive(true);
    setWaitingForInput(false);
    console.log(
      "Available nodes:",
      nodes.map((n) => ({ id: n.id, label: n.label, nodeType: (n as any).nodeType }))
    );
    console.log("Available connections:", connections);

    const onMessageNode = findOnMessageNode();
    if (!onMessageNode) {
      addMessage("bot", "خطا: نود OnMessage یافت نشد. ابتدا نود OnMessage را اضافه کنید.", "text");
      setIsFlowActive(false);
      return;
    }
    console.log("Starting flow from OnMessage node:", onMessageNode);
    processNode(onMessageNode.id);
  };
  const addMessage = (type: "user" | "bot", content: string, messageType: string = "text", data?: any) => {
    const newMessage: FlowMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      messageType: messageType as any,
      data,
    };
    setMessages((prev) => [...prev, newMessage]);
  };
  const processNode = async (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setCurrentNodeId(nodeId);
    const nodeType = (node as any).nodeType;
    switch (nodeType) {
      case "onmessage":
        const nextFromOnMessage = findConnectedNode(nodeId);
        if (nextFromOnMessage) {
          setTimeout(() => processNode(nextFromOnMessage.id), 500);
        }
        break;
      case "text":
        await processTextNode(node);
        break;
      case "image":
        await processImageNode(node);
        break;
      case "voice":
        await processVoiceNode(node);
        break;
      case "quickreply":
        await processQuickReplyNode(node);
        break;
      case "generic":
        await processGenericNode(node);
        break;
      case "weblink":
        await processWeblinkNode(node);
        break;
      default:
        if (node.label === "OnMessage") {
          const nextFromOnMessage = findConnectedNode(nodeId);
          if (nextFromOnMessage) {
            setTimeout(() => processNode(nextFromOnMessage.id), 500);
          }
        } else {
          const nextNode = findConnectedNode(nodeId);
          if (nextNode) {
            setTimeout(() => processNode(nextNode.id), 500);
          }
        }
        break;
    }
  };
  const processTextNode = async (node: any) => {
    const textContent = getNodeControlValue(node, "text");
    if (textContent) {
      addMessage("bot", textContent, "text");
    }
    await new Promise((resolve) => setTimeout(resolve, 800));
    const nextNode = findConnectedNode(node.id);
    if (nextNode) {
      processNode(nextNode.id);
    }
  };
  const processImageNode = async (node: any) => {
    // aiFlow now stores upload id as `uploadId` and image data on controls when available
    const controls = (node as any).controls || {};
    const uploadId = (node as any).uploadId || (node as any).imageUploadId;
    const imageData =
      (node as any).imageData ||
      (controls.imageDisplay && (controls.imageDisplay as any).imageData) ||
      (controls.imageUpload && (controls.imageUpload as any).imageData);
    if (imageData || uploadId) {
      const imageUrl = imageData || (uploadId ? `${basePictureUrl}${uploadId}` : "");
      addMessage("bot", "تصویر", "image", { imageUrl });
    }
    await new Promise((resolve) => setTimeout(resolve, 800));
    const nextNode = findConnectedNode(node.id);
    if (nextNode) {
      processNode(nextNode.id);
    }
  };
  const processVoiceNode = async (node: any) => {
    // aiFlow now stores upload id as `uploadId` and may attach `voiceData` directly on node
    const uploadId = (node as any).uploadId || (node as any).voiceUploadId;
    const voiceData = (node as any).voiceData;
    if (voiceData || uploadId) {
      const voiceUrl = uploadId ? `${basePictureUrl}${uploadId}` : "";
      addMessage("bot", "پیام صوتی", "voice", { voiceUrl, voiceData });
    }
    await new Promise((resolve) => setTimeout(resolve, 800));
    const nextNode = findConnectedNode(node.id);
    if (nextNode) {
      processNode(nextNode.id);
    }
  };
  const processQuickReplyNode = async (node: any) => {
    const title = getNodeControlValue(node, "title");
    const outputCount = (node as any).outputCount || 1;

    if (title) {
      addMessage("bot", title, "text");
    }
    const options: QuickReplyOption[] = [];
    for (let i = 1; i <= outputCount; i++) {
      const optionTitle = getNodeControlValue(node, `output${i}_title`);
      const nextNode = findConnectedNode(node.id, `output${i}`);
      if (optionTitle && nextNode) {
        options.push({
          title: optionTitle,
          nextNodeId: nextNode.id,
        });
      }
    }
    if (options.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      addMessage("bot", "گزینه‌ای را انتخاب کنید:", "quickreply", { options });
    }
  };

  const processGenericNode = async (node: any) => {
    const outputCount = (node as any).outputCount || 1;
    const items: GenericItem[] = [];
    for (let i = 1; i <= outputCount; i++) {
      const connectedGenericItem = findConnectedNode(node.id, `output${i}`);
      if (connectedGenericItem && (connectedGenericItem as any).nodeType === "genericitem") {
        const item = await processGenericItemNode(connectedGenericItem);
        if (item) {
          items.push(item);
        }
      }
    }
    if (items.length > 0) {
      addMessage("bot", "آیتم‌های عمومی:", "generic", { items });
    }

    // Process default output connection after displaying generic items
    await new Promise((resolve) => setTimeout(resolve, 800));
    const nextNode = findConnectedNode(node.id, "output");
    if (nextNode) {
      processNode(nextNode.id);
    }
  };
  const processGenericItemNode = async (node: any): Promise<GenericItem | null> => {
    const title = getNodeControlValue(node, "title");
    const subtitle = getNodeControlValue(node, "sunTitle");
    const weblink = getNodeControlValue(node, "weblink");
    // Support both legacy `imageUploadId` and new `uploadId`; also read image data from controls
    const controls = (node as any).controls || {};
    const uploadId = (node as any).uploadId || (node as any).imageUploadId;
    const imageData =
      (node as any).imageData ||
      (controls.imageDisplay && (controls.imageDisplay as any).imageData) ||
      (controls.imageUpload && (controls.imageUpload as any).imageData);
    const imageUrl = imageData || (uploadId ? `${basePictureUrl}${uploadId}` : "");
    const buttons: Array<{ title: string; nextNodeId: string }> = [];
    for (let i = 1; i <= 3; i++) {
      const buttonTitle = getNodeControlValue(node, `output${i}_title`);
      const nextNode = findConnectedNode(node.id, `output${i}`);
      if (buttonTitle && nextNode) {
        buttons.push({
          title: buttonTitle,
          nextNodeId: nextNode.id,
        });
      }
    }
    if (title) {
      return {
        title,
        subtitle,
        imageUrl,
        weblink,
        buttons,
      };
    }
    return null;
  };
  const processWeblinkNode = async (node: any) => {
    const weblink = getNodeControlValue(node, "weblink");
    if (weblink) {
      addMessage("bot", weblink, "weblink", { url: weblink });
    }
    await new Promise((resolve) => setTimeout(resolve, 800));
    const nextNode = findConnectedNode(node.id);
    if (nextNode) {
      processNode(nextNode.id);
    }
  };
  const handleQuickReplyClick = (nextNodeId: string, optionTitle: string) => {
    addMessage("user", optionTitle, "text");
    setTimeout(() => {
      processNode(nextNodeId);
    }, 500);
  };
  const handleGenericButtonClick = (nextNodeId: string, buttonTitle: string) => {
    addMessage("user", buttonTitle, "text");
    setTimeout(() => {
      processNode(nextNodeId);
    }, 500);
  };
  const handleUserInput = () => {
    if (userInput.trim()) {
      addMessage("user", userInput, "text");
      setUserInput("");
      setWaitingForInput(false);
      if (currentNodeId) {
        const nextNode = findConnectedNode(currentNodeId);
        if (nextNode) {
          setTimeout(() => processNode(nextNode.id), 500);
        }
      }
    }
  };
  const resetFlow = () => {
    setMessages([]);
    setCurrentNodeId(null);
    setIsFlowActive(false);
    setWaitingForInput(false);
    setUserInput("");
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
  if (!isOpen) return null;

  const content = (
    <>
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ {t(LanguageKey.AIFlow_live_test_block)}</title>
        <meta
          name="description"
          content="Create intelligent automated chatbot flows with Bran.cy AI Flow editor. Design interactive conversations with text, images, voice messages, quick replies and dynamic content blocks for Instagram automation."
        />
        <meta name="theme-color"></meta>
        <meta
          name="keywords"
          content="AI chatbot, flow editor, Instagram automation, conversational AI, chatbot builder, automated messaging, social media automation, AI flow design, interactive chatbots, message automation"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/page/posts" />
        {/* Add other meta tags as needed */}
      </Head>
      <div className="dialogBg" onClick={onClose} role="dialog" aria-modal="true" />
      <div className="popup" style={{ gap: "0px", backgroundColor: "var(--background-root)" }}>
        <div className={styles.flowTestHeader}>
          {t(LanguageKey.AIFlow_live_test_block)}
          <div className={styles.flowTestControls}>
            <div title="Reset 🔄" role="button" onClick={resetFlow} className={styles.flowTestheaderBtn}>
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
            <div title="close ✖️" role="button" onClick={onClose} className={styles.flowTestheaderBtn}>
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
          {messages.map((message) => (
            <div key={message.id} className={`${styles.flowTestMessage} ${styles[message.type]}`}>
              <div className={styles.messageContent}>
                {message.messageType === "text" && <div className={styles.textMessage}>{message.content}</div>}
                {message.messageType === "image" && (
                  <div className={styles.imageMessage}>
                    <img src={message.data?.imageUrl} alt="Flow Image" className={styles.messageImage} />
                  </div>
                )}
                {message.messageType === "voice" && (
                  <div className={styles.voiceMessage}>
                    <button
                      className={styles.voicePlayBtn}
                      onClick={() => playVoiceMessage(message.data?.voiceData || message.data?.voiceUrl)}>
                      {t(LanguageKey.AIFlow_play_voice)}
                    </button>
                  </div>
                )}
                {message.messageType === "weblink" && (
                  <div className={styles.weblinkMessage}>
                    <a href={message.data?.url} target="_blank" rel="noopener noreferrer" className={styles.weblinkBtn}>
                      🔗 {message.content}
                    </a>
                  </div>
                )}
                {message.messageType === "quickreply" && (
                  <div className={styles.quickreplyMessage}>
                    <div className={styles.quickreplyTitle}>{message.content}</div>
                    <div className={styles.quickreplyOptions}>
                      {message.data?.options?.map((option: QuickReplyOption, index: number) => (
                        <button
                          key={index}
                          className={styles.quickreplyOptionBtn}
                          onClick={() => handleQuickReplyClick(option.nextNodeId, option.title)}>
                          {option.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {message.messageType === "generic" && (
                  <div className={styles.genericMessage}>
                    <div className="title">{message.content}</div>
                    <div className={styles.genericItems}>
                      {message.data?.items?.map((item: GenericItem, index: number) => (
                        <div key={index} className={styles.genericItem}>
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.title} className={styles.genericItemImage} />
                          )}
                          <div className={styles.genericItemContent}>
                            <h4 className="title">{item.title}</h4>
                            {item.subtitle && <p className={styles.genericItemSubtitle}>{item.subtitle}</p>}
                            {item.weblink && (
                              <a
                                href={item.weblink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.genericItemLink}>
                                🔗{t(LanguageKey.AIFlow_link)}
                              </a>
                            )}
                            <div className={styles.genericItemButtons}>
                              {item.buttons.map((button, btnIndex) => (
                                <button
                                  key={btnIndex}
                                  className={styles.genericItemBtn}
                                  onClick={() => handleGenericButtonClick(button.nextNodeId, button.title)}>
                                  {button.title}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.messageTimestamp}>{message.timestamp.toLocaleTimeString()}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {waitingForInput && (
          <div className={styles.flowTestInput}>
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
          </div>
        )}
        {!isFlowActive && (
          <button className="saveButton" onClick={startFlow}>
            {t(LanguageKey.start)} 🚀
          </button>
        )}
      </div>
    </>
  );

  // Prefer portal to escape any stacking contexts of parents
  if (isClient) return createPortal(content, document.body);
  return content;
};
export default FlowTest;
