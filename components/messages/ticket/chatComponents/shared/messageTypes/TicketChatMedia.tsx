import React, { useCallback, useMemo } from "react";
import Dotmenu from "brancy/components/design/dotMenu/dotMenu";
import MediaDetector from "brancy/components/messages/shared/utils/MediaDetector";
import { TicketBaseChatProps } from "brancy/components/messages/ticket/chatComponents/types";
import { TicketChatDate, TicketMessageStatus, TicketReactionEmoji } from "brancy/components/messages/ticket/chatComponents/shared/utils";
import styles from "brancy/components/messages/ticket/chatComponents/shared/messageTypes/messageTypes.module.css";
// #region تعریف کامپوننت - نمایش رسانه‌ها
// این کامپوننت تصاویر یا ویدیوهای پیام را بسته به جهت، نمایش می‌دهد و منو/رویدادها را هندل می‌کند.
const TicketChatMediaComponent: React.FC<TicketBaseChatProps> = ({
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
}) => {
  // #region وضعیت و کمک‌کننده‌ها
  const isLeft = direction === "left";
  const hasImage = useMemo(() => item.medias.length > 0 && item.medias[0].image, [item.medias]);
  const hasVideo = useMemo(() => item.medias.length > 0 && item.medias[0].video, [item.medias]);
  const getMediaUrl = useCallback(
    (previewUrl: { url: string; externalUrl: string }) => {
      return useExternalUrl ? previewUrl.externalUrl : baseMediaUrl + previewUrl.url;
    },
    [useExternalUrl, baseMediaUrl]
  );
  // #endregion

  // #region هندل کلیک رسانه
  const handleMediaClick = useCallback(
    (media: any, isImage: boolean) => {
      if (isImage && media.image) {
        onImageContainerClick?.({
          height: media.image.height || 200,
          width: media.image.width || 200,
          url: getMediaUrl(media.image.previewUrl),
        });
      } else if (!isImage && media.video) {
        onVideoContainerClick?.({
          height: media.video.height || 200,
          width: media.video.width || 200,
          url: getMediaUrl(media.video.previewUrl),
          isExpired: item.createdTime + 259200000000 > Date.now() * 1e3,
        });
      }
    },
    [onImageContainerClick, onVideoContainerClick, getMediaUrl, item.createdTime]
  );
  // #endregion

  // #region هندل رویدادهای صفحه‌کلید و منو
  const handleKeyDown = useCallback(
    (isImage: boolean) => (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleMediaClick(item.medias[0], isImage);
      }
    },
    [handleMediaClick, item.medias]
  );
  const handleDotMenuClick = useCallback(
    (iconId: string) => {
      onClickSubIcon(iconId, item.itemId);
    },
    [item.itemId, onClickSubIcon]
  );
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
  // #endregion

  // #region بازگشت اولیه در صورت نداشتن رسانه
  if (item.medias.length === 0) return null;
  // #endregion

  // #region رندر تصویر دریافتی (سمت چپ)
  if (isLeft && hasImage) {
    return (
      <>
        <div className={styles.leftchat}>
          <div className={`${styles.imagebackground} ${styles.imagebackgroundLeft}`}>
            <MediaDetector
              src={getMediaUrl(item.medias[0].image!.previewUrl)}
              alt="Received image"
              mediaType="image"
              onImageClick={() => handleMediaClick(item.medias[0], true)}
              className={styles.mediaImageLeft}
            />
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
  // #endregion

  // #region رندر ویدیو دریافتی (سمت چپ)
  if (isLeft && hasVideo) {
    return (
      <>
        <div className={styles.leftchat}>
          <div className={`${styles.imagebackground} ${styles.imagebackgroundLeft}`}>
            <div className={styles.imagevideopreview}>
              <MediaDetector
                src={getMediaUrl(item.medias[0].video!.previewUrl)}
                alt="Received video"
                mediaType="video"
                onVideoClick={() => handleMediaClick(item.medias[0], false)}
                className={styles.mediaImageLeft}
              />
            </div>
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
  // #endregion

  // #region رندر تصویر ارسالی (سمت راست)
  if (hasImage) {
    return (
      <>
        <div className={`${styles.imagebackground} ${styles.imagebackgroundRight}`}>
          <MediaDetector
            src={getMediaUrl(item.medias[0].image!.previewUrl)}
            alt="Sent image"
            mediaType="image"
            onImageClick={() => handleMediaClick(item.medias[0], true)}
            className={styles.mediaImageRight}
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
  }
  return null;
};
export const TicketChatMedia = React.memo(TicketChatMediaComponent);
// #endregion
