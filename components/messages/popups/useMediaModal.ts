import { useCallback, useState } from "react";
import { ImageMediaData, MediaData, VideoMediaData } from "./MediaModal";

// #region اینترفیس خروجی هوک
export interface UseMediaModalReturn {
  isOpen: boolean;
  media: MediaData | null;
  openImage: (url: string, width?: number, height?: number) => void;
  openVideo: (url: string, width?: number, height?: number, isExpired?: boolean) => void;
  openMedia: (media: MediaData) => void;
  close: () => void;
}
// #endregion

// #region هوک اصلی useMediaModal
/**
 * هوک سفارشی برای مدیریت مودال رسانه
 * این هوک state و توابع لازم برای باز/بسته کردن مودال را فراهم می‌کند
 *
 * @example
 * ```tsx
 * const { isOpen, media, openImage, openVideo, close } = useMediaModal();
 *
 * // برای تصویر:
 * <img onClick={() => openImage(url, width, height)} />
 *
 * // برای ویدیو:
 * <video onClick={() => openVideo(url, width, height, isExpired)} />
 *
 * // رندر مودال:
 * <MediaModal isOpen={isOpen} media={media} onClose={close} />
 * ```
 */
export const useMediaModal = (): UseMediaModalReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [media, setMedia] = useState<MediaData | null>(null);

  // #region تابع باز کردن تصویر
  const openImage = useCallback((url: string, width?: number, height?: number) => {
    const imageMedia: ImageMediaData = {
      type: "image",
      url,
      width,
      height,
    };
    setMedia(imageMedia);
    setIsOpen(true);
  }, []);
  // #endregion

  // #region تابع باز کردن ویدیو
  const openVideo = useCallback((url: string, width?: number, height?: number, isExpired?: boolean) => {
    const videoMedia: VideoMediaData = {
      type: "video",
      url,
      width,
      height,
      isExpired,
    };
    setMedia(videoMedia);
    setIsOpen(true);
  }, []);
  // #endregion

  // #region تابع باز کردن رسانه عمومی
  const openMedia = useCallback((mediaData: MediaData) => {
    setMedia(mediaData);
    setIsOpen(true);
  }, []);
  // #endregion

  // #region تابع بستن مودال
  const close = useCallback(() => {
    setIsOpen(false);
    // پاکسازی media با تاخیر کوتاه برای جلوگیری از لرزش انیمیشن
    setTimeout(() => {
      setMedia(null);
    }, 300);
  }, []);
  // #endregion

  return {
    isOpen,
    media,
    openImage,
    openVideo,
    openMedia,
    close,
  };
};
// #endregion
