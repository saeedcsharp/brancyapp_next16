import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./MediaDetector.module.css";
// استاندارد ابعاد پیش‌فرض برای تمام رسانه‌ها
const DEFAULT_MEDIA_WIDTH = 200;
const DEFAULT_MEDIA_HEIGHT = 200;
const MAX_MEDIA_WIDTH = 300;
const MAX_MEDIA_HEIGHT = 300;
export interface MediaDetectorProps {
  src: string;
  width?: number; // اختیاری - اگر مشخص نشود از مقدار پیش‌فرض استفاده می‌شود
  height?: number; // اختیاری - اگر مشخص نشود از مقدار پیش‌فرض استفاده می‌شود
  alt?: string;
  onImageClick?: () => void;
  onVideoClick?: () => void;
  className?: string;
  showPlayIcon?: boolean;
  mediaType?: "image" | "video"; // Force media type (skip detection)
  isBase64?: boolean; // For base64/data URL sources (skip API call)
}
export function MediaDetector({
  src,
  width = DEFAULT_MEDIA_WIDTH, // مقدار پیش‌فرض استاندارد
  height = DEFAULT_MEDIA_HEIGHT, // مقدار پیش‌فرض استاندارد
  alt = "Media content",
  onImageClick,
  onVideoClick,
  className = "",
  showPlayIcon = false,
  mediaType: forcedMediaType,
  isBase64 = false,
}: MediaDetectorProps) {
  const { data: session } = useSession();
  const [mediaType, setMediaType] = useState<"video" | "image" | "loading" | "error">(forcedMediaType || "loading");
  const hasRun = useRef(false);
  // نرمال‌سازی ابعاد - اگر 0 باشد از مقدار پیش‌فرض استفاده می‌شود
  const normalizedWidth = useMemo(() => (width === 0 ? DEFAULT_MEDIA_WIDTH : width), [width]);
  const normalizedHeight = useMemo(() => (height === 0 ? DEFAULT_MEDIA_HEIGHT : height), [height]);
  const checkMediaType = useCallback(async () => {
    // Skip API call if mediaType is forced or source is base64
    if (forcedMediaType || isBase64) {
      if (isBase64) {
        // Detect from data URL prefix
        if (src.startsWith("data:video/")) {
          setMediaType("video");
        } else if (src.startsWith("data:image/")) {
          setMediaType("image");
        } else {
          setMediaType("image"); // Default to image for unknown base64
        }
      }
      return;
    }
    if (!session?.user?.accessToken) {
      setMediaType("loading");
      return;
    }
    try {
      const content = await fetch(src + "/contenttype", {
        method: "GET",
        headers: {
          Authorization: session.user.accessToken,
        },
      });
      const res = await content.text();
      if (res.includes("video/mp4") || res.includes("video/")) {
        setMediaType("video");
      } else if (res.includes("image/")) {
        setMediaType("image");
      } else {
        setMediaType("image"); // Default to image if unclear
      }
    } catch (error) {
      console.error("Content type detection error:", error);
      setMediaType("image"); // Fallback to image on error
    }
  }, [src, session, forcedMediaType, isBase64]);
  useEffect(() => {
    if (!hasRun.current) {
      checkMediaType();
      hasRun.current = true;
    }
  }, [checkMediaType]);
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setMediaType("error");
  }, []);
  const handleVideoError = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    setMediaType("error");
  }, []);
  const handleImageKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && onImageClick) {
        e.preventDefault();
        onImageClick();
      }
    },
    [onImageClick]
  );
  const handleVideoKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && onVideoClick) {
        e.preventDefault();
        onVideoClick();
      }
    },
    [onVideoClick]
  );
  const containerStyle = useMemo(() => {
    if (mediaType === "loading" || mediaType === "error") {
      return {
        width: "100px",
        height: "100px",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
      };
    }
    return {
      maxWidth: `${MAX_MEDIA_WIDTH}px`,
      maxHeight: `${MAX_MEDIA_HEIGHT}px`,
    };
  }, [mediaType]);

  // Loading state
  if (mediaType === "loading") {
    return (
      <div className={`${styles.mediaContainer} ${styles.loadingContainer} ${className}`} style={containerStyle}>
        <div className={styles.spinner}></div>
      </div>
    );
  }
  // Error state
  if (mediaType === "error") {
    return (
      <div className={`${styles.mediaContainer} ${styles.errorContainer} ${className}`} style={containerStyle}>
        <img src="/cover.svg" alt="Loading failed" width={100} height={100} className={styles.errorIcon} />
        <span className={styles.errorText}>Loading Failed</span>
      </div>
    );
  }
  // Video
  if (mediaType === "video") {
    return (
      <div
        className={`${styles.mediaContainer} ${styles.videoWrapper} ${className}`}
        style={containerStyle}
        onClick={onVideoClick}
        onKeyDown={handleVideoKeyDown}
        tabIndex={onVideoClick ? 0 : undefined}
        role={onVideoClick ? "button" : undefined}
        aria-label={onVideoClick ? "Play video" : alt}>
        <video
          style={{ width: `${normalizedWidth}px`, height: `${normalizedHeight}px` }}
          className={styles.media}
          controls={!onVideoClick}
          preload="metadata"
          onError={handleVideoError}
          aria-label={alt}>
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {showPlayIcon && onVideoClick && (
          <div className={styles.playIconOverlay}>
            <img src="/icon-play.svg" alt="Play" width={48} height={48} />
          </div>
        )}
      </div>
    );
  }
  // Image
  return (
    <div
      className={`${styles.mediaContainer} ${className}`}
      style={containerStyle}
      onClick={onImageClick}
      onKeyDown={handleImageKeyDown}
      tabIndex={onImageClick ? 0 : undefined}
      role={onImageClick ? "button" : undefined}
      aria-label={alt}>
      <img
        src={src}
        alt={alt}
        width={normalizedWidth}
        height={normalizedHeight}
        style={{ width: `${normalizedWidth}px`, height: `${normalizedHeight}px` }}
        className={styles.media}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
}
export default MediaDetector;
