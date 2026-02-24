import React, { useCallback, useMemo } from "react";
import Dotmenu from "brancy/components/design/dotMenu/dotMenu";
import LinkifyText from "brancy/context/LinkifyText";
import { getMessageDirectionClass } from "brancy/helper/checkRtl";
import { detectEmojiOnly } from "brancy/helper/emojiDetector";
import { TicketBaseChatProps } from "brancy/components/messages/ticket/chatComponents/types";
import {
  TicketChatDate,
  TicketMessageStatus,
  TicketReactionEmoji,
} from "brancy/components/messages/ticket/chatComponents/shared/utils";
import styles from "./messageTypes.module.css";
// #region تعریف کامپوننت - نمایش متن بلیت
// این کامپوننت پیام متنی را برای هر دو جهت نمایش می‌دهد و منو/ایموجی را مدیریت می‌کند.
const TicketChatTextComponent: React.FC<TicketBaseChatProps> = ({
  item,
  direction,
  chatBox,
  baseMediaUrl,
  onClickSubIcon,
  dateFormatToggle,
  toggleDateFormat,
  formatDate,
}) => {
  // #region محاسبات وضعیت
  const isLeft = direction === "left";
  const isEmojiOnly = useMemo(() => detectEmojiOnly(item.text), [item.text]);
  const classes = useMemo(
    () => ({
      chat: isLeft ? styles.leftchat : styles.rightchat,
      msg: isLeft ? styles.leftchatMSG : styles.rightchatMSG,
    }),
    [isLeft],
  );
  const emojiStyle = useMemo(
    () => (isEmojiOnly ? { background: isLeft ? "var(--color-light-blue)" : "var(--color-dark-blue)" } : {}),
    [isEmojiOnly, isLeft],
  );
  // #endregion

  // #region منو و داده‌ها
  const handleDotMenuClick = useCallback(
    (iconId: string) => {
      onClickSubIcon(iconId, item.itemId);
    },
    [item.itemId, onClickSubIcon],
  );
  const dotMenuData = useMemo(
    () => [
      { icon: "/copy.svg", value: "Copy" },
      {
        icon: "/msg-like.svg",
        value: item.ownerEmojiReaction ? "UnReact" : "React",
      },
    ],
    [item.ownerEmojiReaction],
  );
  // #endregion

  // #region رندر پیام دریافتی
  if (isLeft) {
    return (
      <>
        <div className={classes.chat}>
          <div
            style={emojiStyle}
            className={getMessageDirectionClass(item.text, classes.msg)}
            role="article"
            aria-label="Received message">
            <LinkifyText text={item.text} />
          </div>
          <Dotmenu menuPosition="topRight" data={dotMenuData} handleClickOnIcon={handleDotMenuClick} />
        </div>
        <TicketReactionEmoji item={item} direction={direction} baseMediaUrl={baseMediaUrl} chatBox={chatBox} />
        <TicketChatDate
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
  // #endregion

  // #region رندر پیام ارسالی
  return (
    <>
      <div className={classes.chat}>
        <div
          style={emojiStyle}
          className={getMessageDirectionClass(item.text, classes.msg)}
          role="article"
          aria-label="Sent message">
          <LinkifyText text={item.text} />
        </div>
      </div>
      <TicketMessageStatus
        createdTime={item.createdTime}
        recpLastSeenUnix={"recpLastSeenUnix" in chatBox ? chatBox.recpLastSeenUnix : undefined}
        itemId={item.itemId}
        dateFormatToggle={dateFormatToggle}
        toggleDateFormat={toggleDateFormat}
        formatDate={formatDate}
      />
    </>
  );
  // #endregion
};

// #region اکسپورت با مقایسه پروپس برای جلوگیری از رندر غیرضروری
export const TicketChatText = React.memo(TicketChatTextComponent, (prevProps, nextProps) => {
  return (
    prevProps.item.text === nextProps.item.text &&
    prevProps.item.itemId === nextProps.item.itemId &&
    prevProps.item.createdTime === nextProps.item.createdTime &&
    prevProps.item.ownerEmojiReaction === nextProps.item.ownerEmojiReaction &&
    prevProps.item.recpEmojiReaction === nextProps.item.recpEmojiReaction &&
    prevProps.direction === nextProps.direction &&
    prevProps.dateFormatToggle === nextProps.dateFormatToggle
  );
});
// #endregion
