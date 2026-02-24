import React, { useCallback, useMemo } from "react";
import Dotmenu from "brancy/components/design/dotMenu/dotMenu";
import MediaDetector from "brancy/components/messages/shared/utils/MediaDetector";
import LinkifyText from "brancy/context/LinkifyText";
import { ItemType } from "brancy/models/messages/enum";
import { BaseChatProps } from "brancy/components/messages/direct/chatComponents/types";
import { ChatDate } from "brancy/components/messages/direct/chatComponents/shared/utils/ChatDate";
import { MessageStatus } from "brancy/components/messages/direct/chatComponents/shared/utils/ChatDateandseen";
import ReactionEmoji from "brancy/components/messages/direct/chatComponents/shared/utils/ReactionEmoji";
import { RepliedMessage } from "brancy/components/messages/direct/chatComponents/shared/utils/RepliedMessage";
import styles from "./messageTypes.module.css";

const ChatTextComponent: React.FC<BaseChatProps> = ({
  item,
  direction,
  chatBox,
  baseMediaUrl,
  onClickSubIcon,
  dateFormatToggle,
  toggleDateFormat,
  formatDate,
  handleFindEmoji,
  getMessageDirectionClass,
  handleSpecifyRepliedItemFullName,
  handleSpecifyRepliedItemType,
}) => {
  // #region هوک‌ها — محاسبات وضعیت پیام (جهت، پاسخ، اموجی فقط)
  const isLeft = useMemo(() => direction === "left", [direction]);
  const isReplyStory = useMemo(() => item.itemType === ItemType.ReplyStory, [item.itemType]);
  const hasReply = useMemo(() => !!item.repliedToItemId, [item.repliedToItemId]);
  const classes = useMemo(
    () => ({
      container: isLeft ? styles.multiChatRow : undefined,
      chat: isLeft ? styles.leftchat : styles.rightchat,
      chatWrapper: isLeft ? styles.leftchatwithreply : styles.rightchatwithreply,
      msg: isLeft ? styles.leftchatMSG : styles.rightchatMSG,
      repliedMsg: isLeft ? styles.leftrepliedmsg : styles.rightrepliedmsg,
      repliedMsgDescription: isLeft ? styles.leftrepliedmsgdiscription : styles.rightrepliedmsgdiscription,
    }),
    [isLeft],
  );

  // #endregion

  // #region هندلرها و منو — هندلر منوی سه‌نقطه و مدیریت کلیک/کپی
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/no-profile.svg";
  }, []);
  const handleDotMenuClick = useCallback(
    (iconId: string) => {
      if (iconId === "Copy") {
        navigator.clipboard.writeText(item.text).catch((err) => {
          console.error("Failed to copy text:", err);
        });
      }
      if (item.itemId) {
        onClickSubIcon(iconId, item.itemId);
      }
    },
    [item.itemId, item.text, onClickSubIcon],
  );
  const dotMenuData = useMemo(
    () => [
      {
        icon: "/msg-like.svg",
        value: item.ownerEmojiReaction ? "UnReact" : "React",
      },
      {
        icon: "/copy.svg",
        value: "Copy",
      },
    ],
    [item.ownerEmojiReaction],
  );
  // #endregion

  // #region رندرهای فرعی (پاسخ/متن) — کامپوننت‌های کوچک برای نمایش متن و پاسخ به استوری
  const renderStoryReply = useCallback(() => {
    if (!item.replyStory || !baseMediaUrl) {
      return (
        <div className={classes.repliedMsg}>
          <div className={classes.repliedMsgDescription}>
            {item.repliedToItemId ? "Replied to a story" : "Reply to story"}
          </div>
          <MediaDetector src="/cover.svg" alt="Story expired or unavailable" mediaType="image" />
        </div>
      );
    }
    // ساخت URL واقعی استوری
    const storyUrl = item.replyStory.externalUrl || baseMediaUrl + item.replyStory.link;
    return (
      <div className={classes.repliedMsg}>
        <div className={classes.repliedMsgDescription}>Reply to story</div>
        <MediaDetector src={storyUrl} alt="Reply to story" />
      </div>
    );
  }, [classes.repliedMsg, classes.repliedMsgDescription, item.replyStory, item.repliedToItemId, baseMediaUrl]);
  const renderMessageText = useCallback(
    () => (
      <div className={getMessageDirectionClass(item.text, classes.msg)}>
        <LinkifyText text={item.text} />
      </div>
    ),
    [getMessageDirectionClass, item.text, classes.msg],
  );
  // #endregion

  // #region رندر پیام دریافتی/پاسخ — تولید JSX برای پیام دریافتی و حالات پاسخ
  const renderLeftMessage = useCallback(() => {
    if (!hasReply && !isReplyStory) {
      return renderMessageText();
    }
    if (!hasReply && isReplyStory) {
      return (
        <div className={classes.chatWrapper}>
          {renderStoryReply()}
          {renderMessageText()}
        </div>
      );
    }
    return (
      <div className={classes.chatWrapper}>
        <RepliedMessage
          repliedToItemId={item.repliedToItemId!}
          repliedToItem={item.repliedToItem}
          direction={direction}
          handleSpecifyRepliedItemFullName={handleSpecifyRepliedItemFullName}
          handleSpecifyRepliedItemType={handleSpecifyRepliedItemType}
        />
        {renderMessageText()}
      </div>
    );
  }, [
    hasReply,
    isReplyStory,
    renderMessageText,
    classes.chatWrapper,
    renderStoryReply,
    item.repliedToItemId,
    item.repliedToItem,
    direction,
    handleSpecifyRepliedItemFullName,
    handleSpecifyRepliedItemType,
  ]);
  // #endregion

  // #region رندر پیام ارسالی — تولید JSX برای پیام‌های ارسالی و قرارگیری منو
  const renderRightMessage = useCallback(() => {
    if (!hasReply && !isReplyStory) {
      return (
        <div className={classes.chat} data-itemid={item.itemId ?? ""}>
          {renderMessageText()}
          {item.itemId && <Dotmenu menuPosition="topLeft" data={dotMenuData} handleClickOnIcon={handleDotMenuClick} />}
        </div>
      );
    }
    if (!hasReply && isReplyStory) {
      return (
        <div className={classes.chatWrapper} data-itemid={item.itemId ?? ""}>
          {renderStoryReply()}
          {renderMessageText()}
        </div>
      );
    }
    return (
      <div className={classes.chatWrapper} data-itemid={item.itemId ?? ""}>
        <RepliedMessage
          repliedToItemId={item.repliedToItemId!}
          repliedToItem={item.repliedToItem}
          direction={direction}
          handleSpecifyRepliedItemFullName={handleSpecifyRepliedItemFullName}
          handleSpecifyRepliedItemType={handleSpecifyRepliedItemType}
        />
        {renderMessageText()}
        {item.itemId && <Dotmenu menuPosition="topLeft" data={dotMenuData} handleClickOnIcon={handleDotMenuClick} />}
      </div>
    );
  }, [
    hasReply,
    isReplyStory,
    classes.chat,
    classes.chatWrapper,
    renderMessageText,
    renderStoryReply,
    item,
    direction,
    dotMenuData,
    handleDotMenuClick,
    handleSpecifyRepliedItemFullName,
    handleSpecifyRepliedItemType,
  ]);
  // #endregion

  // #region رندر نهایی — تولید خروجی نهایی JSX بر اساس جهت پیام (چپ)
  if (isLeft) {
    return (
      <div className={classes.container} data-itemid={item.itemId ?? ""}>
        <div className={classes.chat} role="article" aria-label="Received message">
          {renderLeftMessage()}
          <Dotmenu menuPosition="topRight" data={dotMenuData} handleClickOnIcon={handleDotMenuClick} />
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
      </div>
    );
  }
  // #endregion
  // #region رندر نهایی — تولید خروجی نهایی JSX بر اساس جهت پیام (راست)
  return (
    <>
      {renderRightMessage()}
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
// #endregion
export const ChatText = React.memo(ChatTextComponent, (prevProps, nextProps) => {
  return (
    prevProps.item.itemId === nextProps.item.itemId &&
    prevProps.item.text === nextProps.item.text &&
    prevProps.item.createdTime === nextProps.item.createdTime &&
    prevProps.item.ownerEmojiReaction === nextProps.item.ownerEmojiReaction &&
    prevProps.item.recpEmojiReaction === nextProps.item.recpEmojiReaction &&
    prevProps.item.repliedToItemId === nextProps.item.repliedToItemId &&
    prevProps.direction === nextProps.direction &&
    prevProps.dateFormatToggle === nextProps.dateFormatToggle &&
    prevProps.chatBox.recpLastSeenUnix === nextProps.chatBox.recpLastSeenUnix
  );
});
