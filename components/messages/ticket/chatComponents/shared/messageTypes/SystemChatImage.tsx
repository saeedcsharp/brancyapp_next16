import React, { useCallback, useMemo } from "react";
import MediaDetector from "brancy/components/messages/shared/utils/MediaDetector";
import { IItem, ITicket } from "brancy/models/userPanel/message";
import { TicketChatDate, TicketMessageStatus } from "brancy/components/messages/ticket/chatComponents/shared/utils";
import styles from "./messageTypes.module.css";
// #region تعریف اینترفیس‌ها - انواع پراپس
interface SystemChatImageProps {
  item: IItem;
  chatBox: ITicket;
  baseMediaUrl: string;
  onImageContainerClick?: (info: { url: string; height: number; width: number }) => void;
  dateFormatToggle: string;
  toggleDateFormat: (itemId: string) => void;
  formatDate: (timestamp: number, itemId: string | null) => string;
}
// #endregion

// #region تعریف کامپوننت - این بخش کامپوننت تابعی را تعریف می‌کند که مسئول نمایش تصویر سیستم است
const SystemChatImageComponent: React.FC<SystemChatImageProps> = ({
  item,
  chatBox,
  baseMediaUrl,
  onImageContainerClick,
  dateFormatToggle,
  toggleDateFormat,
  formatDate,
}) => {
  // #region استخراج پراپس و مقداردهی اولیه
  // گرفتن مقادیر پایه مانند اینکه پیام ارسالی است یا دریافتی و URL تصویر.
  const isSentByFb = item.sentByFb;
  const imageUrl = useMemo(() => baseMediaUrl + item.imageUrl, [baseMediaUrl, item.imageUrl]);
  // #endregion

  // #region هندلر کلیک تصویر
  // تابع باز کردن کانتینر تصویر هنگام کلیک یا فشردن کلید Enter/Space.
  const handleImageClick = useCallback(() => {
    if (item.imageUrl) {
      onImageContainerClick?.({
        height: 200,
        width: 200,
        url: imageUrl,
      });
    }
  }, [item.imageUrl, imageUrl, onImageContainerClick]);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleImageClick();
      }
    },
    [handleImageClick],
  );
  // #endregion

  // #region رندر برای پیام‌های دریافتی (سمت چپ)
  // ساختار JSX مربوط به نمایش تصویر دریافتی و تاریخ کنار آن.
  if (!isSentByFb) {
    return (
      <>
        <div className={styles.leftchat}>
          {item.imageUrl && (
            <MediaDetector
              src={imageUrl}
              alt="Received image"
              mediaType="image"
              onImageClick={handleImageClick}
              className={styles.mediaImageLeft}
            />
          )}
        </div>
        <TicketChatDate
          createdTime={item.timeStampUnix}
          itemId={item.itemId}
          direction="system"
          isToggled={dateFormatToggle === item.itemId}
          onToggle={toggleDateFormat}
          formatDate={formatDate}
        />
      </>
    );
  }
  // #endregion

  // #region رندر برای پیام‌های ارسالی (سمت راست)
  // ساختار JSX مربوط به نمایش تصویر ارسالی و وضعیت پیام (مانند دیده شدن).
  return (
    <>
      <div className={`${styles.imagebackground} ${styles.imagebackgroundRight}`}>
        {item.imageUrl && (
          <MediaDetector
            src={imageUrl}
            alt="Sent image"
            mediaType="image"
            onImageClick={handleImageClick}
            className={styles.mediaImageRight}
          />
        )}
      </div>
      {item.itemId && (
        <TicketMessageStatus
          createdTime={item.timeStampUnix}
          userLastSeenUnix={chatBox.userLastSeenUnix}
          itemId={item.itemId}
          dateFormatToggle={dateFormatToggle}
          toggleDateFormat={toggleDateFormat}
          formatDate={formatDate}
        />
      )}
    </>
  );
  // #endregion
};
export const SystemChatImage = React.memo(SystemChatImageComponent);
// #endregion
