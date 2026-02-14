import React from "react";
import RingLoader from "saeed/components/design/loader/ringLoder";
import MediaDetector from "saeed/components/messages/shared/utils/MediaDetector";
import LinkifyText from "saeed/context/LinkifyText";
import { getMessageDirectionClass } from "saeed/helper/checkRtl";
import { detectEmojiOnly } from "saeed/helper/emojiDetector";
import { IIsSendingMessage } from "saeed/models/messages/IMessage";
import { ItemType, MediaType } from "saeed/models/messages/enum";
import styles from "./messageTypes.module.css";

// #region تایپ‌ها — تعریف تایپ‌های ورودی برای کامپوننت ChatSending
interface ChatSendingProps {
  sendingMessage: IIsSendingMessage;
}
// #endregion
export const ChatSending: React.FC<ChatSendingProps> = ({ sendingMessage }) => {
  // #region رندر پیام در حال ارسال — تولید JSX برای انواع پیام‌های در حال ارسال
  const renderSendingMessage = () => {
    if (sendingMessage.itemType === ItemType.Text) {
      return (
        <div>
          <div className={styles.rightchat}>
            <div
              style={detectEmojiOnly(sendingMessage.message) ? { background: "var(--color-dark-blue)" } : {}}
              className={getMessageDirectionClass(sendingMessage.message, styles.rightchatMSG)}>
              <LinkifyText text={sendingMessage.message} />
            </div>
            <RingLoader style={{ width: "15px", height: "15px" }} />
          </div>
        </div>
      );
    }
    if (sendingMessage.itemType === ItemType.Media && sendingMessage.mediaType === MediaType.Image) {
      const isActualBase64 = sendingMessage.imageBase64?.startsWith("data:image/");
      return (
        <div>
          <div className={styles.rightchat}>
            <MediaDetector
              src={sendingMessage.imageBase64 || ""}
              alt="Sending image"
              mediaType="image"
              isBase64={isActualBase64}
            />
            <RingLoader style={{ width: "15px", height: "15px" }} />
          </div>
        </div>
      );
    }
    if (sendingMessage.itemType === ItemType.Media && sendingMessage.mediaType === MediaType.Video) {
      const isActualBase64 = sendingMessage.imageBase64?.startsWith("data:video/");
      return (
        <div>
          <div className={styles.rightchat}>
            <MediaDetector
              src={sendingMessage.imageBase64 || ""}
              alt="Sending video"
              mediaType="video"
              isBase64={isActualBase64}
            />
            <RingLoader style={{ width: "15px", height: "15px" }} />
          </div>
        </div>
      );
    }
    if (sendingMessage.itemType === ItemType.AudioShare) {
      return (
        <div>
          <div className={styles.rightchat}>
            <audio preload="metadata" className={styles.chatvoice} controls>
              <source src={sendingMessage.message} type="audio/wav" />
            </audio>
            <RingLoader style={{ width: "15px", height: "15px" }} />
          </div>
        </div>
      );
    }
    return null;
  };
  // #endregion

  return renderSendingMessage();
};
