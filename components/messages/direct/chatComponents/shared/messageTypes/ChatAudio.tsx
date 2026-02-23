import React, { useMemo } from "react";
import Dotmenu from "brancy/components/design/dotMenu/dotMenu";
import { BaseChatProps } from "brancy/components/messages/direct/chatComponents/types";
import { ChatDate } from "brancy/components/messages/direct/chatComponents/shared/utils/ChatDate";
import { MessageStatus } from "brancy/components/messages/direct/chatComponents/shared/utils/ChatDateandseen";
import ReactionEmoji from "brancy/components/messages/direct/chatComponents/shared/utils/ReactionEmoji";
import { RepliedMessage } from "brancy/components/messages/direct/chatComponents/shared/utils/RepliedMessage";
import styles from "brancy/components/messages/direct/chatComponents/shared/messageTypes/messageTypes.module.css";
const ChatAudioComponent: React.FC<BaseChatProps> = ({
  item,
  direction,
  chatBox,
  baseMediaUrl,
  useExternalUrl,
  onClickSubIcon,
  dateFormatToggle,
  toggleDateFormat,
  formatDate,
  handleSpecifyRepliedItemFullName,
  handleSpecifyRepliedItemType,
}) => {
  // #region هوک‌ها — هوک‌ها و محاسبات اولیه مانند جهت پیام و مسیر صوت
  const isLeft = useMemo(() => direction === "left", [direction]);
  const audioSrc = useMemo(
    () => (item.audio && baseMediaUrl ? (useExternalUrl ? item.audio.externalUrl : baseMediaUrl + item.audio.url) : ""),
    [item.audio, baseMediaUrl, useExternalUrl]
  );
  const classes = useMemo(
    () => ({
      chat: isLeft ? styles.leftchat : styles.rightchat,
      chatWrapper: isLeft ? styles.leftchatwithreply : styles.rightchatwithreply,
      voice: styles.chatvoice,
      menuPosition: isLeft ? "topRight" : "topLeft",
    }),
    [isLeft]
  );
  // #endregion

  // #region هندلرها و داده‌های منو — هندلر منو و تعریف موارد منو (واکنش/دانلود)
  const handleMenuClick = useMemo(
    () => (iconId: string) => {
      if (iconId === "Download" && audioSrc) {
        window.open(audioSrc, "_blank");
      }
      onClickSubIcon(iconId, item.itemId);
    },
    [audioSrc, item.itemId, onClickSubIcon]
  );
  const menuData = useMemo(
    () => [
      {
        icon: "/msg-like.svg",
        value: item.ownerEmojiReaction ? "UnReact" : "React",
      },
      {
        icon: "/download.svg",
        value: "Download",
      },
    ],
    [item.ownerEmojiReaction]
  );
  if (!item.audio || !baseMediaUrl || !audioSrc) return null;
  // #endregion

  // #region المان‌های رندر صدا — ساخت المان <audio> و محتوای وابسته (با یا بدون پاسخ)
  const renderAudioElement = (voiceClassName: string) => (
    <audio
      preload="metadata"
      className={voiceClassName}
      controls
      aria-label={isLeft ? "Received audio message" : "Sent audio message"}
      title={isLeft ? "Audio message from contact" : "Your audio message"}>
      <source src={audioSrc} type="audio/wav" />
      Your browser does not support the audio element.
    </audio>
  );
  const renderAudioContent = () => {
    if (item.repliedToItemId) {
      return (
        <div className={classes.chatWrapper}>
          <RepliedMessage
            repliedToItemId={item.repliedToItemId}
            repliedToItem={item.repliedToItem}
            direction={direction}
            handleSpecifyRepliedItemFullName={handleSpecifyRepliedItemFullName}
            handleSpecifyRepliedItemType={handleSpecifyRepliedItemType}
          />
          {renderAudioElement(classes.voice)}
        </div>
      );
    }
    return renderAudioElement(classes.voice);
  };
  // #endregion

  // #region رندر چپ — JSX مربوط به نمایش پیام‌های دریافتی (سمت چپ)
  if (isLeft) {
    return (
      <>
        <div className={classes.chat}>
          {renderAudioContent()}
          <Dotmenu
            menuPosition={classes.menuPosition as "topRight"}
            data={menuData}
            handleClickOnIcon={handleMenuClick}
          />
        </div>
        <ReactionEmoji item={item} direction={direction} chatBox={chatBox} baseMediaUrl={baseMediaUrl} />
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
  // #endregion
  // #region رندر راست — JSX مربوط به نمایش پیام‌های ارسالی (سمت راست)
  return (
    <>
      <div className={classes.chat}>
        {renderAudioContent()}
        {item.itemId && (
          <Dotmenu
            menuPosition={classes.menuPosition as "topLeft"}
            data={menuData}
            handleClickOnIcon={handleMenuClick}
          />
        )}
      </div>
      <ReactionEmoji item={item} direction={direction} chatBox={chatBox} baseMediaUrl={baseMediaUrl} />
      {item.itemId && (
        <MessageStatus
          createdTime={item.createdTime}
          recpLastSeenUnix={chatBox.recpLastSeenUnix}
          itemId={item.itemId}
          dateFormatToggle={dateFormatToggle}
          toggleDateFormat={toggleDateFormat}
          formatDate={formatDate}
        />
      )}
    </>
  );
};
export const ChatAudio = React.memo(ChatAudioComponent);
