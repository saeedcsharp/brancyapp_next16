import React, { useMemo } from "react";
import MediaDetector from "brancy/components/messages/shared/utils/MediaDetector";
import LinkifyText from "brancy/context/LinkifyText";
import { getMessageDirectionClass } from "brancy/helper/checkRtl";
import { detectEmojiOnly } from "brancy/helper/emojiDetector";
import { ISendTicketMessage, ITicketMediaType } from "brancy/models/userPanel/message";
import styles from "brancy/components/messages/ticket/chatComponents/shared/messageTypes/messageTypes.module.css";
// #region تعریف اینترفیس‌ها
// انواع پراپس برای لیست پیام‌های در حال ارسال و آیتم‌های آن.
interface SystemSendingMessagesProps {
  sendingMessages: ISendTicketMessage[];
}
interface SendingMessageItemProps {
  message: ISendTicketMessage;
  index: number;
}
// #endregion

// #region کامپوننت آیتم - نمایش تک پیام در حال ارسال
// نمایش تک پیام (متن یا تصویر) که هنوز ارسال نشده یا در صف است.
const SendingMessageItem: React.FC<SendingMessageItemProps> = React.memo(({ message, index }) => {
  const isEmojiOnly = useMemo(() => detectEmojiOnly(message.text), [message.text]);
  const emojiStyle = useMemo(() => (isEmojiOnly ? { background: "var(--color-dark-blue)" } : {}), [isEmojiOnly]);
  if (message.itemType === ITicketMediaType.Text) {
    return (
      <div className={styles.rightchatrow}>
        <div>
          <div className={styles.rightchat}>
            <div
              style={emojiStyle}
              className={getMessageDirectionClass(message.text, styles.rightchatMSG)}
              role="article"
              aria-label="Sending message">
              <LinkifyText text={message.text} />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (message.itemType === ITicketMediaType.Image) {
    const isActualBase64 = message.imageBase64?.startsWith("data:image/");
    return (
      <div className={styles.rightchatrow}>
        <div className={styles.rightchat}>
          <MediaDetector
            src={message.imageBase64 || ""}
            alt="Sending image"
            mediaType="image"
            isBase64={isActualBase64}
            className={styles.mediaFixed200}
          />
        </div>
      </div>
    );
  }
  return null;
});
SendingMessageItem.displayName = "SendingMessageItem";
// #endregion

// #region کامپوننت لیست - نمایش مجموعه پیام‌های در حال ارسال
// این کامپوننت لیستی از پیام‌های در حال ارسال را رندر می‌کند یا null در صورت نبود.
const SystemSendingMessagesComponent: React.FC<SystemSendingMessagesProps> = ({ sendingMessages }) => {
  const renderedMessages = useMemo(
    () =>
      sendingMessages.map((message, index) => (
        <SendingMessageItem
          key={`sending-${index}-${message.itemType}-${Date.now()}`}
          message={message}
          index={index}
        />
      )),
    [sendingMessages]
  );
  if (sendingMessages.length === 0) return null;
  return <>{renderedMessages}</>;
};
export const SystemSendingMessages = React.memo(SystemSendingMessagesComponent);
// #endregion
