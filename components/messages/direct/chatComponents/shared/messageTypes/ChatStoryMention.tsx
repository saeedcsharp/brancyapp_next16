import React, { memo, useCallback, useMemo } from "react";
import Dotmenu from "saeed/components/design/dotMenu/dotMenu";
import MediaDetector from "saeed/components/messages/shared/utils/MediaDetector";
import { BaseChatProps } from "../../types";
import { ChatDate } from "../utils/ChatDate";
import { MessageStatus } from "../utils/ChatDateandseen";
import ReactionEmoji from "../utils/ReactionEmoji";
import { RepliedMessage } from "../utils/RepliedMessage";
import styles from "./messageTypes.module.css";

export const ChatStoryMention: React.FC<BaseChatProps> = memo(
  ({
    item,
    direction,
    chatBox,
    baseMediaUrl,
    useExternalUrl,
    onClickSubIcon,
    onVideoContainerClick,
    dateFormatToggle,
    toggleDateFormat,
    formatDate,
    handleSpecifyRepliedItemFullName,
    handleSpecifyRepliedItemType,
  }) => {
    // #region هوک‌ها — محاسبه URL استوری و وضعیت انقضا
    const isLeft = direction === "left";
    const storySrc = useMemo(() => {
      if (!item.storyMention?.previewUrl) return null;
      return useExternalUrl
        ? item.storyMention.previewUrl.externalUrl
        : baseMediaUrl + item.storyMention.previewUrl.url;
    }, [item.storyMention?.previewUrl, useExternalUrl, baseMediaUrl]);
    const videoContainerData = useMemo(() => {
      if (!item.storyMention || !storySrc) return null;
      const created = item.createdTime || 0;
      const currentMicros = Date.now() * 1000;
      return {
        height: item.storyMention.height || 200,
        width: item.storyMention.width || 200,
        url: storySrc,
        isExpired: currentMicros > created + 259200000000,
      };
    }, [item.storyMention, item.createdTime, storySrc]);
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
    // #endregion

    // #region هندلرها — هندلر کلیک، منو و هندلرهای صفحه‌کلید برای پیش‌نمایش
    const handleVideoClick = useCallback(() => {
      if (videoContainerData) onVideoContainerClick?.(videoContainerData);
    }, [videoContainerData, onVideoContainerClick]);
    const handleMenuClick = useCallback(
      (iconId: string) => {
        if (iconId === "Download" && storySrc) window.open(storySrc, "_blank");
        onClickSubIcon?.(iconId, item.itemId);
      },
      [storySrc, onClickSubIcon, item.itemId]
    );
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        const key = e.key;
        if (key === "Enter" || key === " ") {
          e.preventDefault();
          handleVideoClick();
          return;
        }
        if (key === "Escape") {
          (e.currentTarget as HTMLElement).blur();
          return;
        }
        if (key === "ArrowRight" || key === "ArrowLeft") {
          e.preventDefault();
          const dir = key === "ArrowRight" ? 1 : -1;
          const curr = (e.currentTarget as HTMLElement).dataset.storyIndex;
          const idx = curr ? Number(curr) : 0;
          const next = idx + dir;
          const selector = `[data-story-index="${next}"]`;
          const el = document.querySelector(selector) as HTMLElement | null;
          el?.focus();
        }
      },
      [handleVideoClick]
    );
    const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
      e.currentTarget.src = "/no-profile.svg";
    }, []);
    // #endregion

    // #region بازگشت زودهنگام — خروج اگر اطلاعات پیش‌نمایش استوری موجود نباشد
    if (!item.storyMention || !storySrc) return null;
    // #endregion

    // #region محتویات پاسخ و پیش‌نمایش — ساخت بلوک پاسخ و بلوک پیش‌نمایش رسانه
    const repliedContent = item.repliedToItemId ? (
      <RepliedMessage
        repliedToItemId={item.repliedToItemId}
        repliedToItem={item.repliedToItem}
        direction={direction}
        handleSpecifyRepliedItemFullName={handleSpecifyRepliedItemFullName}
        handleSpecifyRepliedItemType={handleSpecifyRepliedItemType}
      />
    ) : null;
    const mediaContent = (
      <div
        onClick={handleVideoClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        data-story-index={0}
        aria-label={`Story mention ${item.repliedToItemId ? "with reply" : ""}`}>
        <MediaDetector src={storySrc} />
      </div>
    );
    // #endregion

    // #region رندر سمت چپ — JSX برای نمایش منشن‌های دریافتی همراه منو و تاریخ
    if (isLeft) {
      return (
        <>
          <div className={styles.leftchat}>
            <div className={item.repliedToItemId ? styles.leftchatwithreply : ""}>
              {repliedContent}
              {mediaContent}
            </div>
            <Dotmenu menuPosition="topRight" data={menuData} handleClickOnIcon={handleMenuClick} />
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

    // #region رندر سمت راست — JSX برای نمایش منشن‌های ارسالی همراه وضعیت و منو
    return (
      <>
        <div className={styles.rightchat}>
          <div className={item.repliedToItemId ? styles.rightchatwithreply : ""}>
            {repliedContent}
            {mediaContent}
          </div>
          {item.itemId && <Dotmenu menuPosition="topLeft" data={menuData} handleClickOnIcon={handleMenuClick} />}
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
    // #endregion
  }
);
