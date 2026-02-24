import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import MediaDetector from "brancy/components/messages/shared/utils/MediaDetector";
import LinkifyText from "brancy/context/LinkifyText";
import { detectEmojiOnly } from "brancy/helper/emojiDetector";
import { ItemType, MediaType } from "brancy/models/messages/enum";
import { IReplyTicket_Media } from "brancy/models/messages/IMessage";
import styles from "brancy/components/messages/ticket/chatComponents/shared/messageTypes/messageTypes.module.css";
// #region اینترفیس‌ها - ورودی‌های کامپوننت
// تعریف انواع پراپس برای پیام‌های در انتظار ارسال و آیتم‌های آن.
interface TicketPendingMessagesProps {
  replyItems: IReplyTicket_Media[];
  replyLoading: boolean;
  ticketId: number;
  handleEditText: (text: string, ticketId: number, index: number) => void;
  handleDeleteMedia: (ticketId: number, index: number) => void;
  handleSendReplies: (ticketId: number) => void;
}
interface PendingMessageItemProps {
  message: IReplyTicket_Media;
  index: number;
  replyLoading: boolean;
  ticketId: number;
  handleEditText: (text: string, ticketId: number, index: number) => void;
  handleDeleteMedia: (ticketId: number, index: number) => void;
}
// #endregion

// #region کامپوننت آیتم - نمایش یک پیام معلق
// نمایش یک پیام در صف ارسال (متن/تصویر/ویدیو/صدا) همراه با دکمه‌های ویرایش/حذف.
const PendingMessageItem: React.FC<PendingMessageItemProps> = React.memo(
  ({ message, index, replyLoading, ticketId, handleEditText, handleDeleteMedia }) => {
    const isEmojiOnly = useMemo(() => message.text && detectEmojiOnly(message.text), [message.text]);
    const emojiStyle = useMemo(() => (isEmojiOnly ? { background: "var(--color-dark-blue)" } : {}), [isEmojiOnly]);
    const handleEdit = useCallback(() => {
      handleEditText(message.text!, ticketId, index);
    }, [message.text, ticketId, index, handleEditText]);
    const handleDelete = useCallback(() => {
      handleDeleteMedia(ticketId, index);
    }, [ticketId, index, handleDeleteMedia]);
    const handleKeyDown = useCallback(
      (action: "edit" | "delete") => (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          action === "edit" ? handleEdit() : handleDelete();
        }
      },
      [handleEdit, handleDelete],
    );
    if (message.itemType === ItemType.Text) {
      return (
        <div className={styles.rightchatrow}>
          <div>
            <div className={styles.rightchat}>
              <div style={emojiStyle} className={styles.rightchatMSG}>
                <LinkifyText text={message.text} />
              </div>
              {!replyLoading && (
                <img
                  className={styles.actionIcon}
                  src="/edit-1.svg"
                  onClick={handleEdit}
                  onKeyDown={handleKeyDown("edit")}
                  tabIndex={0}
                  role="button"
                  title="Edit"
                  alt="Edit message"
                />
              )}
              {!replyLoading && (
                <img
                  className={styles.actionIcon}
                  src="/delete.svg"
                  onClick={handleDelete}
                  onKeyDown={handleKeyDown("delete")}
                  tabIndex={0}
                  role="button"
                  title="Delete"
                  alt="Delete message"
                />
              )}
            </div>
          </div>
        </div>
      );
    }
    if (message.itemType === ItemType.Media && message.mediaType === MediaType.Image) {
      const isActualBase64 = message.mediaBase64?.startsWith("data:image/");
      return (
        <div className={styles.rightchatrow}>
          <div className={styles.rightchat}>
            <MediaDetector
              src={message.mediaBase64!}
              alt="Pending image"
              mediaType="image"
              isBase64={isActualBase64}
              className={styles.mediaFixed200}
            />
            {!replyLoading && (
              <img
                className={styles.actionIcon}
                src="/delete.svg"
                onClick={handleDelete}
                onKeyDown={handleKeyDown("delete")}
                tabIndex={0}
                role="button"
                title="Delete"
                alt="Delete image"
              />
            )}
          </div>
        </div>
      );
    }
    if (message.itemType === ItemType.Media && message.mediaType === MediaType.Video) {
      // Check if mediaBase64 is an actual base64 string or a URL
      const isActualBase64 = message.mediaBase64?.startsWith("data:video/");

      return (
        <div className={styles.rightchatrow}>
          <div className={styles.rightchat}>
            <MediaDetector
              src={message.mediaBase64!}
              alt="Pending video"
              mediaType="video"
              isBase64={isActualBase64}
              className={styles.videoFixed200}
            />
            {!replyLoading && (
              <img
                className={styles.actionIcon}
                src="/delete.svg"
                onClick={handleDelete}
                onKeyDown={handleKeyDown("delete")}
                tabIndex={0}
                role="button"
                title="Delete"
                alt="Delete video"
              />
            )}
          </div>
        </div>
      );
    }
    if (message.itemType === ItemType.AudioShare) {
      return (
        <div className={styles.rightchatrow}>
          <div className={styles.rightchat}>
            <audio className={styles.leftchatvoice} controls>
              <source src={message.mediaBase64!} type="audio/wav" />
              Your browser does not support the audio tag.
            </audio>
            <img
              className={styles.actionIcon}
              src="/delete.svg"
              onClick={handleDelete}
              onKeyDown={handleKeyDown("delete")}
              tabIndex={0}
              role="button"
              title="Delete"
              alt="Delete audio"
            />
          </div>
        </div>
      );
    }

    return null;
  },
);

PendingMessageItem.displayName = "PendingMessageItem";
// #endregion

// #region کامپوننت لیست - نمایش پیام‌های معلق و دکمه ارسال
// این کامپوننت لیست پیام‌های در انتظار را برمی‌گرداند و عملیات ارسال را مدیریت می‌کند.
export const TicketPendingMessages: React.FC<TicketPendingMessagesProps> = ({
  replyItems,
  replyLoading,
  ticketId,
  handleEditText,
  handleDeleteMedia,
  handleSendReplies,
}) => {
  const { t } = useTranslation();

  const handleSend = useCallback(() => {
    handleSendReplies(ticketId);
  }, [ticketId, handleSendReplies]);

  const buttonText = useMemo(
    () => (replyLoading ? t(LanguageKey.sending) : `${t(LanguageKey.sendreplyticket)} (${replyItems.length})`),
    [replyLoading, t, replyItems.length],
  );

  const reversedItems = useMemo(() => [...replyItems].reverse(), [replyItems]);

  if (replyItems.length === 0) return null;

  return (
    <div className={styles.resendbox}>
      {reversedItems.map((message, index) => (
        <PendingMessageItem
          key={`pending-${replyItems.length - index - 1}-${message.itemType}-${message.text?.substring(0, 10) || ""}`}
          message={message}
          index={replyItems.length - index - 1}
          replyLoading={replyLoading}
          ticketId={ticketId}
          handleEditText={handleEditText}
          handleDeleteMedia={handleDeleteMedia}
        />
      ))}
      <button disabled={replyLoading} className="saveButton" onClick={handleSend}>
        {buttonText}
      </button>
    </div>
  );
};
// #endregion
