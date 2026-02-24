import React, { memo, useCallback, useMemo } from "react";
import Dotmenu from "brancy/components/design/dotMenu/dotMenu";
import MediaDetector from "brancy/components/messages/shared/utils/MediaDetector";
import { BaseChatProps } from "brancy/components/messages/direct/chatComponents/types";
import { ChatDate } from "brancy/components/messages/direct/chatComponents/shared/utils/ChatDate";
import { MessageStatus } from "brancy/components/messages/direct/chatComponents/shared/utils/ChatDateandseen";
import ReactionEmoji from "brancy/components/messages/direct/chatComponents/shared/utils/ReactionEmoji";
import { RepliedMessage } from "brancy/components/messages/direct/chatComponents/shared/utils/RepliedMessage";
import styles from "./messageTypes.module.css";

// #region کامپوننت اصلی
export const ChatMediaShare: React.FC<BaseChatProps> = memo(
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
    // #region هوک‌ها و محاسبات اولیه — استخراج منابع اشتراک و تشخیص جهت پیام
    const isLeft = direction === "left";
    const shares = item.mediaShares || [];
    const mediaSrcs = useMemo(
      () => shares.map((s) => (useExternalUrl ? s.externalUrl : baseMediaUrl + s.url)),
      [shares, useExternalUrl, baseMediaUrl],
    );
    // #endregion

    // #region تابع تولید داده ویدیو — ساخت آبجکت ویدیویی برای پخش/باز شدن
    const videoDataFor = useCallback(
      (index: number) => {
        const video = item.medias?.[index]?.video;
        if (!video) return null;
        const currentTimeNanos = Date.now() * 1e3;
        return {
          height: video.height,
          width: video.width,
          url: useExternalUrl ? video.previewUrl.externalUrl : baseMediaUrl + video.previewUrl.url,
          isExpired: currentTimeNanos > (item.createdTime || 0) + 259200000000,
        };
      },
      [item.medias, item.createdTime, useExternalUrl, baseMediaUrl],
    );
    // #endregion

    // #region منوی سه نقطه — آیتم‌های منوی دات‌منو (واکنش، دانلود)
    const dotMenuData = useMemo(
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
      [item.ownerEmojiReaction],
    );
    // #endregion

    // #region هندلرها — هندلر کلیک/کی‌بورد برای باز کردن یا دانلود اشتراک‌ها
    const handleShareClick = useCallback(
      (index: number) => {
        const vd = videoDataFor(index);
        if (vd) {
          onVideoContainerClick?.(vd);
          return;
        }
        const src = mediaSrcs[index];
        if (src) window.open(src, "_blank");
      },
      [mediaSrcs, onVideoContainerClick, videoDataFor],
    );
    const handleShareKeyDown = useCallback(
      (e: React.KeyboardEvent, index: number) => {
        const key = e.key;
        if (key === "Enter" || key === " ") {
          e.preventDefault();
          handleShareClick(index);
          return;
        }
        if (key === "ArrowRight") {
          e.preventDefault();
          const next = Math.min(mediaSrcs.length - 1, index + 1);
          const el = document.querySelector(`[data-share-index="${next}"]`) as HTMLElement | null;
          el?.focus();
          return;
        }
        if (key === "ArrowLeft") {
          e.preventDefault();
          const prev = Math.max(0, index - 1);
          const el = document.querySelector(`[data-share-index="${prev}"]`) as HTMLElement | null;
          el?.focus();
          return;
        }
        if (key === "Escape") {
          (e.currentTarget as HTMLElement).blur();
        }
      },
      [mediaSrcs.length, handleShareClick],
    );
    const handleDotMenuClick = useCallback(
      (iconId: string, index?: number) => {
        if (iconId === "Download") {
          const src = mediaSrcs[index ?? 0];
          if (src) window.open(src, "_blank");
        }
        onClickSubIcon?.(iconId, item.itemId);
      },
      [mediaSrcs, onClickSubIcon, item.itemId],
    );
    const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
      e.currentTarget.src = "/no-profile.svg";
    }, []);
    if (!item.mediaShares?.length) return null;
    // #endregion

    // #region تولید محتوای رسانه‌ای — ساخت نمای پیش‌نمایش و محتوای همراه پاسخ
    const mediaContentFor = useCallback(
      (index: number) => (
        <div
          role="button"
          tabIndex={0}
          data-share-index={index}
          aria-label={`Play media preview ${index + 1} of ${mediaSrcs.length}`}
          onClick={() => handleShareClick(index)}
          onKeyDown={(e) => handleShareKeyDown(e, index)}>
          <MediaDetector src={mediaSrcs[index]} />
        </div>
      ),
      [mediaSrcs, handleShareClick, handleShareKeyDown],
    );

    const mediaWithReply = useCallback(
      (wrapperClass: string, index: number) => (
        <div className={wrapperClass}>
          <RepliedMessage
            repliedToItemId={item.repliedToItemId!}
            repliedToItem={item.repliedToItem}
            direction={direction}
            handleSpecifyRepliedItemFullName={handleSpecifyRepliedItemFullName}
            handleSpecifyRepliedItemType={handleSpecifyRepliedItemType}
          />
          <MediaDetector src={mediaSrcs[index]} />
        </div>
      ),
      [
        item.repliedToItemId,
        item.repliedToItem,
        direction,
        handleSpecifyRepliedItemFullName,
        handleSpecifyRepliedItemType,
        mediaSrcs,
      ],
    );
    // #endregion

    // #region رندر — ادامه‌ی تابع و خروجی JSX برای چپ/راست
    if (isLeft) {
      return (
        <>
          <div className={styles.leftchat}>
            {shares.map((_, i) => (
              <div key={`share-left-${i}`} role="listitem">
                {!item.repliedToItemId ? mediaContentFor(i) : mediaWithReply(styles.leftchatwithreply, i)}
              </div>
            ))}
            <Dotmenu menuPosition="topRight" data={dotMenuData} handleClickOnIcon={(id) => handleDotMenuClick(id, 0)} />
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

    // #region رندر راست — تولید JSX مخصوص پیام‌های ارسالی (چندرسانه‌ای)
    return (
      <>
        <div className={styles.rightchat} role="list" aria-label="Shared media list">
          {shares.map((_, i) => (
            <div key={`share-right-${i}`} role="listitem">
              <div
                role="button"
                tabIndex={0}
                data-share-index={i}
                aria-label={`Video message ${i + 1}`}
                onClick={() => handleShareClick(i)}
                onKeyDown={(e) => handleShareKeyDown(e, i)}>
                {!item.repliedToItemId ? mediaContentFor(i) : mediaWithReply(styles.rightchatwithreply, i)}
              </div>
            </div>
          ))}
          {item.itemId && (
            <Dotmenu menuPosition="topLeft" data={dotMenuData} handleClickOnIcon={(id) => handleDotMenuClick(id, 0)} />
          )}
          <ReactionEmoji item={item} direction={direction} chatBox={chatBox} baseMediaUrl={baseMediaUrl} />
        </div>
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
  },
);
