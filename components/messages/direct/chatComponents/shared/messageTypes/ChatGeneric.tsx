import React, { useMemo } from "react";
import { BaseChatProps } from "brancy/components/messages/direct/chatComponents/types";
import { ChatDate } from "brancy/components/messages/direct/chatComponents/shared/utils/ChatDate";
import styles from "brancy/components/messages/direct/chatComponents/shared/messageTypes/messageTypes.module.css";
// #region کامپوننت — تعریف کامپوننت ساده برای پیام‌های غیرقابل‌شناسایی
export const ChatGeneric: React.FC<BaseChatProps> = React.memo(
  ({ item, direction, dateFormatToggle, toggleDateFormat, formatDate, getMessageDirectionClass }) => {
    // #region هوک‌ها
    const isLeft = useMemo(() => direction === "left", [direction]);
    const chatClass = useMemo(() => (isLeft ? styles.leftchat : styles.rightchat), [isLeft]);
    const msgClass = useMemo(() => (isLeft ? styles.leftchatMSG : styles.rightchatMSG), [isLeft]);
    const messageContent = useMemo(
      () => getMessageDirectionClass("Unsupported media", msgClass),
      [getMessageDirectionClass, msgClass]
    );
    // #endregion
    // #region رندر چپ — JSX مربوط به نمایش پیام‌های دریافتی (سمت چپ)
    return (
      <>
        <div className={chatClass} role="article" aria-label="Unsupported media message">
          <div className={messageContent}>Unsupported media</div>
        </div>
        <ChatDate
          createdTime={item.createdTime}
          itemId={item.itemId}
          direction={direction}
          isToggled={dateFormatToggle === item.itemId}
          onToggle={toggleDateFormat}
          formatDate={formatDate}
        />
      </>
    );
  }
);
ChatGeneric.displayName = "ChatGeneric";
// #endregion
