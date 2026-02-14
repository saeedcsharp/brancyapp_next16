import React, { useCallback, useMemo } from "react";
import Dotmenu from "saeed/components/design/dotMenu/dotMenu";
import MediaDetector from "saeed/components/messages/shared/utils/MediaDetector";
import { TicketBaseChatProps } from "../../types";
import { TicketChatDate, TicketReactionEmoji } from "../utils";
import styles from "./messageTypes.module.css";
// #endregion
// #region تعریف کامپوننت - اشتراک رسانه
// این کامپوننت محتوای به اشتراک‌گذاشته‌شده را نمایش می‌دهد و رویداد کلیک/کیبورد را هندل می‌کند.
const TicketChatMediaShareComponent: React.FC<TicketBaseChatProps> = ({
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
}) => {
  const isLeft = direction === "left";
  const mediaSrc = useMemo(() => {
    if (!item.mediaShares?.[0]) return "";
    return useExternalUrl ? item.mediaShares[0].externalUrl : baseMediaUrl + item.mediaShares[0].url;
  }, [item.mediaShares, useExternalUrl, baseMediaUrl]);
  const videoData = useMemo(() => {
    if (!item.medias?.[0]?.video) return null;
    const video = item.medias[0].video;
    const currentTimeNanos = Date.now() * 1e3;
    return {
      height: video.height,
      width: video.width,
      url: useExternalUrl ? video.previewUrl.externalUrl : baseMediaUrl + video.previewUrl.url,
      isExpired: item.createdTime + 259200000000 > currentTimeNanos,
    };
  }, [item.medias, item.createdTime, useExternalUrl, baseMediaUrl]);
  // #endregion

  // #region منو و هندل‌ها
  const dotMenuData = useMemo(
    () => [
      { icon: "/download.svg", value: "Download" },
      {
        icon: "/msg-like.svg",
        value: item.ownerEmojiReaction ? "UnReact" : "React",
      },
    ],
    [item.ownerEmojiReaction]
  );
  const handleVideoClick = useCallback(() => {
    if (videoData) onVideoContainerClick?.(videoData);
  }, [videoData, onVideoContainerClick]);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleVideoClick();
      }
    },
    [handleVideoClick]
  );
  const handleDotMenuClick = useCallback(
    (iconId: string) => {
      onClickSubIcon(iconId, item.itemId);
    },
    [onClickSubIcon, item.itemId]
  );
  // #endregion

  if (item.mediaShares.length === 0) return null;

  // #region رندر برای پیام دریافتی
  if (isLeft) {
    return (
      <>
        <div className={styles.leftchat}>
          <div
            className={`${styles.imagebackground} ${styles.imagebackgroundLeft}`}
            onClick={handleVideoClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label="View media share">
            <MediaDetector src={mediaSrc} />
            <Dotmenu menuPosition="topRight" data={dotMenuData} handleClickOnIcon={handleDotMenuClick} />
          </div>
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
  return null;
};
export const TicketChatMediaShare = React.memo(TicketChatMediaShareComponent);
// #endregion
