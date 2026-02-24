import React, { useCallback, useId, useMemo } from "react";
import Dotmenu from "brancy/components/design/dotMenu/dotMenu";
import MediaDetector from "brancy/components/messages/shared/utils/MediaDetector";
import { BaseChatProps } from "brancy/components/messages/direct/chatComponents/types";
import { ChatDate } from "brancy/components/messages/direct/chatComponents/shared/utils/ChatDate";
import { MessageStatus } from "brancy/components/messages/direct/chatComponents/shared/utils/ChatDateandseen";
import ReactionEmoji from "brancy/components/messages/direct/chatComponents/shared/utils/ReactionEmoji";
import { RepliedMessage } from "brancy/components/messages/direct/chatComponents/shared/utils/RepliedMessage";
import styles from "./messageTypes.module.css";
// #region ثابت‌ها — مقادیر ثابت برای تصویر جایگزین و اندازه‌های پیش‌فرض
const FALLBACK_IMAGE = "/cover.svg";
const FALLBACK_SIZE = "50px";
// #endregion
export const ChatMedia: React.FC<BaseChatProps> = ({
  item,
  direction,
  chatBox,
  baseMediaUrl,
  useExternalUrl,
  onClickSubIcon,
  onImageContainerClick,
  onVideoContainerClick,
  dateFormatToggle,
  toggleDateFormat,
  formatDate,
  handleSpecifyRepliedItemFullName,
  handleSpecifyRepliedItemType,
}) => {
  // #region هوک‌ها و بازگشت زودهنگام — شناسه کانتینر، تشخیص جهت و بازگشت در صورت نبود رسانه
  const mediaContainerId = useId();
  const isLeft = direction === "left";
  if (!item.medias || item.medias.length === 0) return null;
  // #endregion

  // #region توابع کمکی — تولید URL رسانه و هندل‌کردن خطاهای تصویر/ویدیو
  const getMediaUrl = useCallback(
    (previewUrl: { url: string; externalUrl: string }) => {
      return useExternalUrl ? previewUrl.externalUrl : baseMediaUrl + previewUrl.url;
    },
    [useExternalUrl, baseMediaUrl],
  );
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.src = FALLBACK_IMAGE;
    target.style.width = FALLBACK_SIZE;
    target.style.height = FALLBACK_SIZE;
    if (target.style.maxWidth) {
      target.style.maxWidth = FALLBACK_SIZE;
    }
  }, []);
  const handleVideoError = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const target = e.currentTarget;
    const parent = target.parentElement;
    if (!parent) return;
    target.style.display = "none";
    const existingFallback = parent.querySelector('img[alt="Video unavailable"]');
    if (existingFallback) return;
    const img = document.createElement("img");
    img.src = FALLBACK_IMAGE;
    img.style.width = FALLBACK_SIZE;
    img.style.height = FALLBACK_SIZE;
    img.alt = "Video unavailable";
    parent.appendChild(img);
  }, []);
  // #endregion
  // #region هندلر کلیک بر روی رسانه — باز و ارسال داده برای نمایش تصویر/ویدیو
  const handleMediaClick = useCallback(
    (media: any, index: number) => {
      if (media.image) {
        onImageContainerClick?.({
          height: media.image.height || 200,
          width: media.image.width || 200,
          url: getMediaUrl(media.image.previewUrl),
        });
        return;
      }
      if (media.video) {
        onVideoContainerClick?.({
          height: media.video.height || 200,
          width: media.video.width || 200,
          url: getMediaUrl(media.video.previewUrl),
          isExpired: false,
        });
      }
    },
    [onImageContainerClick, onVideoContainerClick, getMediaUrl],
  );
  // #endregion
  // #region هندلر کلیدها — پشتیبانی از ناوبری صفحه‌کلید بین رسانه‌ها
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, media: any, index: number) => {
      const key = e.key;
      if (key === "Enter" || key === " ") {
        e.preventDefault();
        handleMediaClick(media, index);
        return;
      }
      const medias = item.medias || [];
      if (key === "ArrowRight") {
        e.preventDefault();
        const nextIndex = Math.min(medias.length - 1, index + 1);
        const next = medias[nextIndex];
        if (next) handleMediaClick(next, nextIndex);
        return;
      }
      if (key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex = Math.max(0, index - 1);
        const prev = medias[prevIndex];
        if (prev) handleMediaClick(prev, prevIndex);
        return;
      }
      if (key === "Escape") {
        (e.currentTarget as HTMLElement).blur();
      }
    },
    [handleMediaClick, item.medias],
  );
  // #endregion
  // #region هندلر آیکن — عملکرد دکمه‌های منوی دانلود و ارسال آیکن‌ها
  const handleIconClick = useCallback(
    (iconId: string) => {
      if (iconId === "Download" && item.medias && item.medias.length > 0) {
        const media = item.medias[0];
        let mediaUrl = "";
        if (media.image) {
          mediaUrl = getMediaUrl(media.image.previewUrl);
        } else if (media.video) {
          mediaUrl = getMediaUrl(media.video.previewUrl);
        }
        if (mediaUrl) {
          window.open(mediaUrl, "_blank");
        }
      }
      if (item.itemId) {
        onClickSubIcon(iconId, item.itemId);
      }
    },
    [item.itemId, item.medias, onClickSubIcon, getMediaUrl],
  );
  // #endregion
  // #region منوی سه‌نقطه — تعریف آیتم‌های منو برای واکنش و دانلود
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
  // #region رندر رسانه‌ها (عکس/ویدیو) — کامپوننت‌های کمکی برای رندر عکس و ویدیو
  const renderImage = useCallback(
    (media: any, hasReply: boolean) => {
      const imageUrl = getMediaUrl(media.image.previewUrl);

      return (
        <MediaDetector
          src={imageUrl}
          alt={hasReply ? "Shared media image, includes replied message" : "Shared media image"}
          mediaType="image"
        />
      );
    },
    [getMediaUrl],
  );
  const renderVideo = useCallback(
    (media: any, index: number) => {
      const videoUrl = getMediaUrl(media.video.previewUrl);

      return <MediaDetector src={videoUrl} alt={`Video message ${index + 1}`} mediaType="video" />;
    },
    [getMediaUrl],
  );
  const renderMediaContent = useCallback(
    (media: any, index: number, hasReply: boolean) => {
      if (media.image) return renderImage(media, hasReply);
      if (media.video) return renderVideo(media, index);
      return null;
    },
    [renderImage, renderVideo],
  );
  // #endregion

  // #region رندر چپ — تولید JSX مخصوص پیام‌های دریافتی (چندرسانه‌ای)
  const renderLeftMedia = useMemo(() => {
    return (
      <div className={styles.leftchat} role="article" aria-label="Received message">
        <div className={styles.multiChatRow}>
          <div className={styles.multiChatRow} role="list" aria-label="Shared media list">
            {item.medias.map((media, i) => (
              <div className={styles.leftchat} key={`${mediaContainerId}-left-${i}`} role="listitem">
                <div
                  className={styles.multimedia}
                  onClick={() => handleMediaClick(media, i)}
                  onKeyDown={(e) => handleKeyDown(e, media, i)}
                  role="button"
                  tabIndex={0}
                  data-index={i}
                  aria-label={`View ${media.image ? "image" : "video"} ${i + 1} of ${item.medias.length}`}>
                  {item.repliedToItemId ? (
                    <div className={styles.leftchatwithreply}>
                      <RepliedMessage
                        repliedToItemId={item.repliedToItemId}
                        repliedToItem={item.repliedToItem}
                        direction={direction}
                        handleSpecifyRepliedItemFullName={handleSpecifyRepliedItemFullName}
                        handleSpecifyRepliedItemType={handleSpecifyRepliedItemType}
                      />
                      {renderMediaContent(media, i, true)}
                    </div>
                  ) : (
                    renderMediaContent(media, i, false)
                  )}
                </div>
              </div>
            ))}
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
        <Dotmenu menuPosition="topRight" data={dotMenuData} handleClickOnIcon={handleIconClick} />
      </div>
    );
  }, [
    item.medias,
    item.repliedToItemId,
    item.repliedToItem,
    item.createdTime,
    item.itemId,
    chatBox,
    direction,
    mediaContainerId,
    dateFormatToggle,
    baseMediaUrl,
    handleMediaClick,
    handleKeyDown,
    renderMediaContent,
    toggleDateFormat,
    formatDate,
    handleSpecifyRepliedItemFullName,
    handleSpecifyRepliedItemType,
    dotMenuData,
    handleIconClick,
  ]);
  // #endregion

  // #region رندر راست — تولید JSX مخصوص پیام‌های ارسالی (چندرسانه‌ای)
  const renderRightMedia = useMemo(() => {
    return (
      <div role="article" aria-label="Sent message">
        <div className={styles.rightchat}>
          <div className={styles.multiChatRow} role="list" aria-label="Shared media list">
            {item.medias.map((media, i) => (
              <div
                key={`${mediaContainerId}-right-${i}`}
                onClick={() => handleMediaClick(media, i)}
                onKeyDown={(e) => handleKeyDown(e, media, i)}
                role="button"
                tabIndex={0}
                data-index={i}
                aria-label={`View ${media.image ? "image" : "video"} ${i + 1} of ${item.medias.length}`}>
                {item.repliedToItemId ? (
                  <div className={styles.rightchatwithreply}>
                    <RepliedMessage
                      repliedToItemId={item.repliedToItemId}
                      repliedToItem={item.repliedToItem}
                      direction={direction}
                      handleSpecifyRepliedItemFullName={handleSpecifyRepliedItemFullName}
                      handleSpecifyRepliedItemType={handleSpecifyRepliedItemType}
                    />
                    {item.itemId && renderMediaContent(media, i, true)}
                  </div>
                ) : (
                  item.itemId && renderMediaContent(media, i, false)
                )}
              </div>
            ))}
            <ReactionEmoji item={item} direction={direction} chatBox={chatBox} baseMediaUrl={baseMediaUrl} />
          </div>
          {item.itemId && <Dotmenu menuPosition="topLeft" data={dotMenuData} handleClickOnIcon={handleIconClick} />}
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
      </div>
    );
  }, [
    item.medias,
    item.repliedToItemId,
    item.repliedToItem,
    item.itemId,
    item.createdTime,
    chatBox.recpLastSeenUnix,
    direction,
    baseMediaUrl,
    mediaContainerId,
    dateFormatToggle,
    handleMediaClick,
    handleKeyDown,
    renderMediaContent,
    handleSpecifyRepliedItemFullName,
    handleSpecifyRepliedItemType,
    toggleDateFormat,
    formatDate,
    dotMenuData,
    handleIconClick,
  ]);
  // #endregion

  // #region خروجی — بازگرداندن JSX نهایی برای نمایش رسانه‌ها
  return <>{isLeft ? renderLeftMedia : renderRightMedia}</>;
  // #endregion
};

export default React.memo(ChatMedia);
