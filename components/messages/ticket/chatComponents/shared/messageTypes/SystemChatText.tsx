import React, { useMemo } from "react";
import LinkifyText from "brancy/context/LinkifyText";
import { getMessageDirectionClass } from "brancy/helper/checkRtl";
import { detectEmojiOnly } from "brancy/helper/emojiDetector";
import { IItem, ITicket } from "brancy/models/userPanel/message";
import { TicketChatDate, TicketMessageStatus } from "brancy/components/messages/ticket/chatComponents/shared/utils";
import styles from "./messageTypes.module.css";
// #region تعریف اینترفیس - انواع پراپس
// تعریف `SystemChatTextProps` که ورودی‌های کامپوننت متن سیستم را مشخص می‌کند.
interface SystemChatTextProps {
  item: IItem;
  chatBox: ITicket;
  dateFormatToggle: string;
  toggleDateFormat: (itemId: string) => void;
  formatDate: (timestamp: number, itemId: string | null) => string;
}
// #endregion

// #region کامپوننت اصلی - نمایش متن سیستم
// این کامپوننت پیام متنی سیستم را نمایش می‌دهد و استایل/جهت و ایموجی را مدیریت می‌کند.
const SystemChatTextComponent: React.FC<SystemChatTextProps> = ({
  item,
  chatBox,
  dateFormatToggle,
  toggleDateFormat,
  formatDate,
}) => {
  // #region وضعیت پیام و محاسبات کمکی
  const isSentByFb = item.sentByFb;
  const isEmojiOnly = useMemo(() => detectEmojiOnly(item.text), [item.text]);
  const messageClass = useMemo(() => (isSentByFb ? styles.rightchatMSG : styles.leftchatMSG), [isSentByFb]);
  const directionClass = useMemo(() => getMessageDirectionClass(item.text, messageClass), [item.text, messageClass]);
  const emojiStyle = useMemo(
    () => (isEmojiOnly ? { background: isSentByFb ? "var(--color-dark-blue)" : "var(--color-light-blue)" } : {}),
    [isEmojiOnly, isSentByFb],
  );
  // #endregion

  // #region رندر پیام دریافتی
  if (!isSentByFb) {
    return (
      <>
        <div className={styles.leftchat}>
          <div style={emojiStyle} className={directionClass} role="article" aria-label="Received system message">
            <LinkifyText text={item.text} />
          </div>
        </div>
        <TicketChatDate
          createdTime={item.timeStampUnix}
          itemId={item.itemId}
          direction="system"
          isToggled={dateFormatToggle === item.itemId}
          onToggle={toggleDateFormat}
          formatDate={formatDate}
        />
      </>
    );
  }
  // #endregion

  // #region رندر پیام ارسالی
  return (
    <>
      <div className={styles.rightchat}>
        <div style={emojiStyle} className={directionClass} role="article" aria-label="Sent system message">
          <LinkifyText text={item.text} />
        </div>
      </div>
      {item.itemId && (
        <TicketMessageStatus
          createdTime={item.timeStampUnix}
          userLastSeenUnix={chatBox.userLastSeenUnix}
          itemId={item.itemId}
          dateFormatToggle={dateFormatToggle}
          toggleDateFormat={toggleDateFormat}
          formatDate={formatDate}
        />
      )}
    </>
  );
  // #endregion
};
export const SystemChatText = React.memo(SystemChatTextComponent);
// #endregion
