import React, { useCallback, useMemo } from "react";
import Dotmenu from "brancy/components/design/dotMenu/dotMenu";
import { TicketBaseChatProps } from "brancy/components/messages/ticket/chatComponents/types";
import { TicketChatDate, TicketMessageStatus, TicketReactionEmoji } from "brancy/components/messages/ticket/chatComponents/shared/utils";
import styles from "brancy/components/messages/ticket/chatComponents/shared/messageTypes/messageTypes.module.css";
// #region تعریف کامپوننت - نمایش پیام صوتی
// کامپوننتی که پیام‌های صوتی را بسته به جهت (چپ/راست) رندر می‌کند.
const TicketChatAudioComponent: React.FC<TicketBaseChatProps> = ({
  item,
  direction,
  chatBox,
  baseMediaUrl,
  useExternalUrl,
  onClickSubIcon,
  dateFormatToggle,
  toggleDateFormat,
  formatDate,
}) => {
  // #region محاسبات اولیه
  const isLeft = direction === "left";
  const audioSrc = useMemo(
    () => (item.audio && baseMediaUrl ? (useExternalUrl ? item.audio.externalUrl : baseMediaUrl + item.audio.url) : ""),
    [item.audio, baseMediaUrl, useExternalUrl]
  );
  const classes = useMemo(
    () => ({
      chat: isLeft ? styles.leftchat : styles.rightchat,
      voice: isLeft ? styles.leftchatvoice : styles.rightchatvoice,
      menuPosition: isLeft ? "topRight" : "topLeft",
    }),
    [isLeft]
  );
  // #endregion

  // #region هندلر منو و داده‌های منو
  const handleMenuClick = useCallback(
    (iconId: string) => {
      onClickSubIcon(iconId, item.itemId);
    },
    [item.itemId, onClickSubIcon]
  );
  const menuData = useMemo(
    () => [
      { icon: "/download.svg", value: "Download" },
      {
        icon: "/msg-like.svg",
        value: item.ownerEmojiReaction ? "UnReact" : "React",
      },
    ],
    [item.ownerEmojiReaction]
  );
  // #endregion

  // #region چک کردن داده‌ها
  if (!item.audio || !baseMediaUrl || !audioSrc) return null;
  // #endregion

  // #region رندر پیام دریافتی (سمت چپ)
  if (isLeft) {
    return (
      <>
        <div className={classes.chat}>
          <div className={classes.voice}>
            <audio
              preload="metadata"
              className={classes.voice}
              controls
              aria-label="Received audio message"
              title="Audio message from contact"
              src={audioSrc}
            />
          </div>
          <Dotmenu
            menuPosition={classes.menuPosition as "topRight" | "topLeft"}
            data={menuData}
            handleClickOnIcon={handleMenuClick}
          />
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

  // #region رندر پیام ارسالی (سمت راست)
  return (
    <>
      <div className={classes.chat}>
        <audio
          preload="metadata"
          className={classes.voice}
          controls
          aria-label="Sent audio message"
          title="Your audio message"
          src={audioSrc}
        />
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
};
export const TicketChatAudio = React.memo(TicketChatAudioComponent);
// #endregion
