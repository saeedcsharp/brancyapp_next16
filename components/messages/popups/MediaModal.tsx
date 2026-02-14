import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import RingLoader from "saeed/components/design/loader/ringLoder";
import Modal from "saeed/components/design/modal";
import { LanguageKey } from "saeed/i18n";
import styles from "./MediaModal.module.css";

// #region تایپ‌ها و اینترفیس‌ها
export interface ImageMediaData {
  type: "image";
  url: string;
  width?: number;
  height?: number;
}
export interface VideoMediaData {
  type: "video";
  url: string;
  width?: number;
  height?: number;
  isExpired?: boolean;
}
export type MediaData = ImageMediaData | VideoMediaData;
export interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaData | null;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
}
// #endregion
// #region ثابت‌های پیش‌فرض
const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;
const MAX_VIEWPORT_WIDTH_RATIO = 0.9;
const MAX_VIEWPORT_HEIGHT_RATIO = 0.85;
// #endregion
// #region کامپوننت اصلی MediaModal
const MediaModal: React.FC<MediaModalProps> = ({ isOpen, onClose, media, maxWidth, maxHeight, className = "" }) => {
  // #region State مدیریت بارگذاری و خطا
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const { t } = useTranslation();
  // #endregion
  // #region محاسبه ابعاد واقعی با توجه به سایز صفحه
  const calculatedDimensions = useMemo(() => {
    if (!media) return { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1920;
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 1080;
    const maxAllowedWidth = maxWidth || viewportWidth * MAX_VIEWPORT_WIDTH_RATIO;
    const maxAllowedHeight = maxHeight || viewportHeight * MAX_VIEWPORT_HEIGHT_RATIO;
    let targetWidth = media.width || DEFAULT_WIDTH;
    let targetHeight = media.height || DEFAULT_HEIGHT;
    // اگر ابعاد از حد مجاز بیشتر باشد، نسبت را حفظ کن و کوچک کن
    if (targetWidth > maxAllowedWidth || targetHeight > maxAllowedHeight) {
      const widthRatio = maxAllowedWidth / targetWidth;
      const heightRatio = maxAllowedHeight / targetHeight;
      const scaleFactor = Math.min(widthRatio, heightRatio);
      targetWidth = Math.floor(targetWidth * scaleFactor);
      targetHeight = Math.floor(targetHeight * scaleFactor);
    }
    return {
      width: targetWidth,
      height: targetHeight,
    };
  }, [media, maxWidth, maxHeight]);
  // #endregion
  // #region ریست کردن state هنگام تغییر رسانه
  useEffect(() => {
    if (isOpen && media) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [isOpen, media]);
  // #endregion
  // #region هندلرهای خطا و بارگذاری
  const handleMediaLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);
  const handleMediaError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);
  // #endregion
  // #region هندلر دانلود
  // #endregion
  // #region هندلر کلیدهای صفحه‌کلید

  // #endregion
  // #region هندلر جلوگیری از منوی راست کلیک (برای ویدیو)
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);
  // #endregion
  // #region رندر محتوای رسانه

  const renderMediaContent = useCallback(() => {
    if (!media) return null;
    if (hasError) {
      return (
        <div className={styles.errorContainer}>
          <img src="/no-data.svg" alt="Error" className={styles.errorIcon} />
          <p className="title">{t(LanguageKey.importJSON_error)}</p>
        </div>
      );
    }
    if (media.type === "image") {
      return (
        <>
          {isLoading && <RingLoader width={50} height={50} />}
          <img
            src={media.url}
            alt="Media content"
            width={calculatedDimensions.width}
            height={calculatedDimensions.height}
            className={styles.mediaImage}
            style={{ display: isLoading ? "none" : "block" }}
            onLoad={handleMediaLoad}
            onError={handleMediaError}
            draggable={false}
          />
        </>
      );
    }
    if (media.type === "video") {
      return (
        <>
          {isLoading && <RingLoader width={50} height={50} />}
          <video
            src={media.url}
            width={calculatedDimensions.width}
            height={calculatedDimensions.height}
            className={styles.mediaVideo}
            style={{ display: isLoading ? "none" : "block" }}
            controls
            autoPlay={false}
            preload="metadata"
            onLoadedData={handleMediaLoad}
            onError={handleMediaError}
            onContextMenu={handleContextMenu}
            controlsList="nodownload noplaybackrate"
            disablePictureInPicture>
            <source src={media.url} type="video/mp4" />
            {t(LanguageKey.UnSupportMediaType)}
          </video>
        </>
      );
    }
    return null;
  }, [media, hasError, isLoading, calculatedDimensions, handleMediaLoad, handleMediaError, handleContextMenu]);
  // #endregion
  // #region رندر اصلی
  return (
    <Modal closePopup={onClose} classNamePopup="popupMedia" showContent={isOpen && !!media}>
      <img onClick={onClose} src="/close-box.svg" alt="close" className={styles.closeIcon} role="button" tabIndex={0} />

      <div className={styles.mediaContentWrapper}>{renderMediaContent()}</div>
    </Modal>
  );
  // #endregion
};
export default React.memo(MediaModal);
// #endregion
