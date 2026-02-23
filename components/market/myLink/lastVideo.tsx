import { memo, useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import { ILastVideo } from "brancy/models/market/myLink";
import styles from "brancy/components/market/myLink/lastVideo.module.css";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
interface StreamState {
  isContentVisible: boolean;
  selectedEmbed: string;
  aparatStream: boolean;
  youtubeStream: boolean;
  twitchStream: boolean;
}
type StreamAction =
  | { type: "TOGGLE_VISIBILITY" }
  | { type: "SET_SELECTED_EMBED"; payload: string }
  | {
      type: "SET_STREAM_STATUS";
      payload: { platform: "aparat" | "youtube" | "twitch"; status: boolean };
    }
  | { type: "INITIALIZE"; payload: string };
const initialState: StreamState = {
  isContentVisible: true,
  selectedEmbed: "",
  aparatStream: false,
  youtubeStream: false,
  twitchStream: false,
};
function streamReducer(state: StreamState, action: StreamAction): StreamState {
  switch (action.type) {
    case "TOGGLE_VISIBILITY":
      return { ...state, isContentVisible: !state.isContentVisible };
    case "SET_SELECTED_EMBED":
      return { ...state, selectedEmbed: action.payload };
    case "SET_STREAM_STATUS":
      return {
        ...state,
        [`${action.payload.platform}Stream`]: action.payload.status,
      };
    case "INITIALIZE":
      return { ...state, selectedEmbed: action.payload };
    default:
      return state;
  }
}
const LastVideo = memo(({ data }: { data: ILastVideo }) => {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(streamReducer, initialState);
  const playerRef = useRef<any>(null);

  // Helpers: URL normalization and deep-linking
  const ensureAbsoluteHttpUrl = useCallback((url: string): string => {
    if (!url) return url;
    // Already absolute http(s)
    if (/^https?:\/\//i.test(url)) return url;
    // Protocol-relative
    if (/^\/\//.test(url)) return `https:${url}`;
    // Otherwise treat as https
    return `https://${url}`;
  }, []);

  const isAndroid = useCallback(() => {
    if (typeof navigator === "undefined") return false;
    return /Android/i.test(navigator.userAgent);
  }, []);
  const isIOS = useCallback(() => {
    if (typeof navigator === "undefined") return false;
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }, []);
  const isMobile = useCallback(() => {
    if (typeof navigator === "undefined") return false;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }, []);

  const parseYouTubeVideoId = useCallback(
    (inputUrl: string): string | null => {
      if (!inputUrl) return null;
      const abs = ensureAbsoluteHttpUrl(inputUrl);
      try {
        const u = new URL(abs);
        // youtu.be/<id>
        if (u.hostname.includes("youtu.be")) {
          const seg = u.pathname.split("/").filter(Boolean)[0];
          return seg || null;
        }
        // youtube.com/watch?v=<id>
        if (/youtube\.com$|youtube\.com\./.test(u.hostname)) {
          const v = u.searchParams.get("v");
          if (v) return v;
          // youtube.com/shorts/<id>
          const parts = u.pathname.split("/").filter(Boolean);
          const shortsIdx = parts.findIndex((p) => p.toLowerCase() === "shorts");
          if (shortsIdx !== -1 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];
        }
      } catch {
        // ignore
      }
      return null;
    },
    [ensureAbsoluteHttpUrl],
  );

  type OpenMode = "replace" | "new-tab";
  const navigateTo = useCallback(
    (url: string, mode: OpenMode) => {
      const finalUrl = ensureAbsoluteHttpUrl(url);
      if (mode === "new-tab") {
        window.open(finalUrl, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = finalUrl;
      }
    },
    [ensureAbsoluteHttpUrl],
  );

  const openExternalUrl = useCallback(
    (url: string, opts?: { preferAppFor?: "youtube"; mode?: OpenMode }) => {
      const mode: OpenMode = opts?.mode ?? "replace";
      const absolute = ensureAbsoluteHttpUrl(url);

      // Deep-link for YouTube on mobile
      if (opts?.preferAppFor === "youtube" && isMobile()) {
        const vid = parseYouTubeVideoId(absolute);
        if (vid) {
          let deepLink = "";
          if (isAndroid()) {
            // Android intent to open YouTube app
            deepLink = `intent://www.youtube.com/watch?v=${vid}#Intent;package=com.google.android.youtube;scheme=https;end`;
          } else if (isIOS()) {
            // iOS scheme
            deepLink = `youtube://www.youtube.com/watch?v=${vid}`;
          }
          if (deepLink) {
            let timer: number | undefined;
            const handleVisibility = () => {
              if (document.hidden && timer) {
                window.clearTimeout(timer);
                timer = undefined;
                document.removeEventListener("visibilitychange", handleVisibility);
              }
            };
            document.addEventListener("visibilitychange", handleVisibility);
            // Fallback if app not installed
            timer = window.setTimeout(() => {
              document.removeEventListener("visibilitychange", handleVisibility);
              navigateTo(absolute, mode);
            }, 1500);
            // Try opening the app
            window.location.href = deepLink;
            return;
          }
        }
      }
      // Default behavior: open normalized absolute URL
      navigateTo(absolute, mode);
    },
    [ensureAbsoluteHttpUrl, isMobile, isAndroid, isIOS, parseYouTubeVideoId, navigateTo],
  );
  const activeOptionsCount = useMemo(() => {
    if (!data.lastVideo) return 0;
    let count = 0;
    if (data.lastVideo.youtubeChannel?.video) count++;
    if (data.lastVideo.twitchChannel?.video) count++;
    if (data.lastVideo.aparatChannel?.video) count++;
    return count;
  }, [data.lastVideo]);
  const toggleContentVisibility = useCallback(() => {
    dispatch({ type: "TOGGLE_VISIBILITY" });
  }, []);

  const handleStreamSelection = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_SELECTED_EMBED", payload: event.target.value });
  }, []);
  const handleVideoError = useCallback((event: React.SyntheticEvent<HTMLIFrameElement>) => {
    const target = event.target as HTMLIFrameElement;
    target.style.display = "none";
    const img = document.createElement("img");
    img.src = "/marketlink/market-video.webp";
    img.alt = "live online stream";
    img.className = styles.streamlogo;
    target.parentNode?.insertBefore(img, target.nextSibling);
  }, []);
  const initializeSelectedStream = useCallback(() => {
    if (data.lastVideo?.youtubeChannel) {
      dispatch({ type: "INITIALIZE", payload: "youtubeEmbed" });
    } else if (data.lastVideo?.aparatChannel) {
      dispatch({ type: "INITIALIZE", payload: "aparatEmbed" });
    } else if (data.lastVideo?.twitchChannel) {
      dispatch({ type: "INITIALIZE", payload: "twitchEmbed" });
    }
  }, [data.lastVideo]);
  const checkStreamStatus = useCallback(async (platform: "aparat" | "youtube" | "twitch", url: string) => {
    try {
      await fetch(url, {
        method: "GET",
        mode: "no-cors",
      });
      dispatch({
        type: "SET_STREAM_STATUS",
        payload: { platform, status: true },
      });
    } catch {
      dispatch({
        type: "SET_STREAM_STATUS",
        payload: { platform, status: false },
      });
    }
  }, []);
  const handleRedirectYoutube = useCallback(() => {
    const videoUrl = data.lastVideo?.youtubeChannel?.video?.reDirectUrl;
    if (videoUrl) {
      openExternalUrl(videoUrl, { preferAppFor: "youtube", mode: "replace" });
    }
  }, [data.lastVideo?.youtubeChannel?.video?.reDirectUrl, openExternalUrl]);

  // فانکشن عمومی برای کلیک روی ویدیو
  const handleVideoClick = useCallback(
    (platform: "youtube" | "twitch" | "aparat") => {
      console.log(`ویدیو ${platform} کلیک شد!`);

      const getFixedUrl = (url?: string) => {
        if (!url) return "";
        if (!/^https?:\/\//i.test(url)) {
          return `https://${url}`;
        }
        return url;
      };

      switch (platform) {
        case "youtube":
          // OnClickPlayVideo("youtube", "play");
          const youtubeUrl = getFixedUrl(data.lastVideo?.youtubeChannel?.video?.reDirectUrl);
          if (youtubeUrl) openLinkSmart(youtubeUrl, "youtube");
          break;

        case "aparat":
          // OnClickPlayVideo("aparat", "play");
          const aparatUrl = getFixedUrl(data.lastVideo?.aparatChannel?.video?.reDirectUrl);
          if (aparatUrl) openLinkSmart(aparatUrl, "aparat");
          break;

        case "twitch":
          // OnClickPlayVideo("twitch", "play");
          const twitchUrl = getFixedUrl(data.lastVideo?.twitchChannel?.video?.reDirectUrl);
          if (twitchUrl) openLinkSmart(twitchUrl, "twitch");
          break;

        default:
          console.log("پلتفرم نامشخص");
      }
    },
    [data.lastVideo],
  );

  let lastUserInteraction = 0;

  // ثبت تعامل واقعی کاربر
  if (typeof window !== "undefined") {
    ["click", "touchend", "pointerdown"].forEach((ev) => {
      window.addEventListener(ev, () => (lastUserInteraction = Date.now()), {
        passive: true,
      });
    });
  }

  /**
   * باز کردن لینک هوشمند
   * @param url لینک ویدیو (HTTPS)
   * @param platform youtube | twitch | aparat
   */
  function openLinkSmart(url: string, platform: "youtube" | "twitch" | "aparat") {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(ua);
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isMobile = isAndroid || isIOS;
    const hasGesture = Date.now() - lastUserInteraction < 3000;

    const normalizeUrl = (u: string) => {
      if (!u) return "";
      if (!/^https?:\/\//i.test(u)) return `https://${u}`;
      return u;
    };

    const fallbackUrl = normalizeUrl(url);

    if (!isMobile || !hasGesture) {
      // دسکتاپ یا بدون تعامل → فقط تب جدید
      window.open(fallbackUrl, "_blank");
      return;
    }

    if (isIOS) {
      // ---- iOS: فقط Universal Link بدون fallback خودکار ----
      // اپ اگر نصب باشد باز می‌شود، در غیر اینصورت مرورگر
      window.location.href = fallbackUrl;
      return;
    }

    if (isAndroid) {
      // ---- Android: iframe برای scheme لینک ----
      let appUrl = "";
      switch (platform) {
        case "youtube":
          appUrl = fallbackUrl.replace(/^https?:\/\//, "youtube://");
          break;
        case "twitch":
          appUrl = fallbackUrl.replace(/^https?:\/\//, "twitch://");
          break;
        case "aparat":
          appUrl = fallbackUrl.replace(/^https?:\/\//, "aparat://");
          break;
      }

      const start = Date.now();
      let didHide = false;

      const handleVisibilityChange = () => {
        if (document.hidden) didHide = true;
      };
      document.addEventListener("visibilitychange", handleVisibilityChange, {
        once: true,
      });

      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = appUrl;
      document.body.appendChild(iframe);

      setTimeout(() => {
        if (!didHide && Date.now() - start < 2500) {
          // اپ نصب نیست → fallback
          window.location.href = fallbackUrl;
        }
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 2000);
    }
  }

  useEffect(() => {
    initializeSelectedStream();
    const checkStreams = async () => {
      const promises = [];
      if (data.lastVideo?.aparatChannel?.video?.thumbnailMediaUrl) {
        promises.push(checkStreamStatus("aparat", data.lastVideo.aparatChannel.video.thumbnailMediaUrl));
      }
      if (data.lastVideo?.youtubeChannel?.video?.frameUrl) {
        promises.push(checkStreamStatus("youtube", data.lastVideo.youtubeChannel.video.frameUrl));
      }
      if (data.lastVideo?.twitchChannel?.video?.frameUrl) {
        promises.push(checkStreamStatus("twitch", data.lastVideo.twitchChannel.video.frameUrl));
      }
      await Promise.allSettled(promises);
    };
    checkStreams();
  }, [data.lastVideo, initializeSelectedStream, checkStreamStatus]);

  // useEffect برای بارگذاری YouTube API
  useEffect(() => {
    if (data.lastVideo?.youtubeChannel?.video?.frameUrl) {
      ReactDOM.preinit("https://www.youtube.com/iframe_api", { as: "script" });
    }
  }, [data.lastVideo]);

  // useEffect برای مدیریت video player ها
  useEffect(() => {
    const initializePlayers = () => {
      // YouTube Player
      if (data.lastVideo?.youtubeChannel?.video?.frameUrl) {
        setTimeout(() => {
          if (typeof window !== "undefined" && (window as any).YT === undefined) return;
          setTimeout(() => {
            let firstFetch = false;
            const videoId = data.lastVideo?.youtubeChannel?.video?.frameUrl.split("/").reverse()[0];

            if (videoId && document.getElementById("YoutubeLastVideo")) {
              playerRef.current = new (window as any).YT.Player("YoutubeLastVideo", {
                videoId: videoId,
                width: "100%",
                height: "100%",
                playerVars: {
                  modestbranding: 1,
                  rel: 0,
                  controls: 1,
                  disablekb: 1,
                  fs: 0,
                },
                events: {
                  onStateChange: (event: any) => {
                    console.log("YouTube event", event.data);
                    if (event.data === (window as any).YT.PlayerState.PLAYING) {
                      firstFetch = false;
                      // OnClickPlayVideo("youtube", "play");
                    }
                    if (event.data === (window as any).YT.PlayerState.BUFFERING) {
                      console.log("YouTube buffering");
                      firstFetch = true;
                    }
                    if (event.data === (window as any).YT.PlayerState.UNSTARTED && firstFetch) {
                      handleRedirectYoutube();
                    }
                  },
                  onReady: () => {
                    const iframe = document.querySelector<HTMLIFrameElement>("#YoutubeLastVideo");
                    if (iframe) {
                      iframe.classList.add(styles.embedvideofromtumb);
                      iframe.style.width = "100%";
                      iframe.style.height = "100%";
                    }
                  },
                },
              });
            }
          }, 500);
        }, 500);
      }

      // Aparat Player - شبیه‌سازی رویدادها
      if (data.lastVideo?.aparatChannel?.video?.frameUrl) {
        setTimeout(() => {
          const aparatFrame = document.getElementById("AparatLastVideo");
          if (aparatFrame) {
            aparatFrame.addEventListener("click", () => {
              console.log("Aparat video clicked");
              // OnClickPlayVideo("aparat", "play");
              const aparatUrl = data.lastVideo?.aparatChannel?.video?.reDirectUrl;
              if (aparatUrl) {
                window.open(aparatUrl, "_blank");
              }
            });
          }
        }, 500);
      }

      // Twitch Player - شبیه‌سازی رویدادها
      if (data.lastVideo?.twitchChannel?.video?.frameUrl) {
        setTimeout(() => {
          const twitchFrame = document.getElementById("TwitchLastVideo");
          if (twitchFrame) {
            twitchFrame.addEventListener("click", () => {
              console.log("Twitch video clicked");
              // OnClickPlayVideo("twitch", "play");
              const twitchUrl = data.lastVideo?.twitchChannel?.video?.reDirectUrl;
              if (twitchUrl) {
                window.open(twitchUrl, "_blank");
              }
            });
          }
        }, 500);
      }
    };

    initializePlayers();

    // Cleanup function
    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [data.lastVideo, state.selectedEmbed]);
  const renderVideoOption = useCallback(
    (platform: "youtube" | "twitch" | "aparat", channel: any) => {
      if (!channel?.video) return null;
      const icons = {
        youtube: (
          <svg fill="red" viewBox="0 0 25 17" aria-label="YouTube">
            <path d="M24.5 2.7a3 3 0 0 0-.8-1.4L22.3.5c-2-.5-9.8-.5-9.8-.5S4.7 0 2.7.5q-.8.2-1.4.8a3 3 0 0 0-.8 1.4 33 33 0 0 0 0 11.6q.3.8.8 1.4t1.4.8c2 .5 9.8.5 9.8.5s7.8 0 9.8-.5q.8-.2 1.4-.8t.8-1.4a33 33 0 0 0 0-11.6M9.9 12V4.9l6.6 3.6z" />
          </svg>
        ),
        twitch: (
          <svg fill="var(--color-purple)" viewBox="0 0 25 25" aria-label="Twitch">
            <path d="M5.2 0H25v12.5h-.1l-9.4 8h-4l-.1.1L6.3 25v-4.5H0V4.3zm1 1.8v13.4H11v3.1h.1l3.7-3.1h4.1l4.1-3.7V1.8zm8 2.9v6.2h-2.4V4.7zm5.7 0v6.2h-2.5V4.7z" />
          </svg>
        ),
        aparat: (
          <svg fill="var(--color-dark-red)" viewBox="0 0 25 25" aria-label="Aparat">
            <path d="M12.5 1.7a10.8 10.8 0 1 0 0 21.6 10.8 10.8 0 0 0 0-21.6M6.4 7a3.1 3.1 0 1 1 6 1.1 3.1 3.1 0 0 1-6-1.1m4.5 9.3a3.1 3.1 0 1 1-6-1.2 3.1 3.1 0 0 1 6 1.2m1.3-2.5a1.4 1.4 0 1 1 .5-2.7 1.4 1.4 0 0 1-.5 2.7m6.5 4a3.1 3.1 0 1 1-6.1-1.2 3.1 3.1 0 0 1 6 1.2m-2-5.7a3.1 3.1 0 1 1 1-6 3.1 3.1 0 0 1-1 6m-2.5 12 2.3.7a4 4 0 0 0 4.8-2.8l.6-2.5a12 12 0 0 1-7.7 4.6m8-20.4L19.6 3a12 12 0 0 1 4.5 8l.7-2.6A4 4 0 0 0 22 3.7M.6 14.4l-.5 2.1a4 4 0 0 0 2.7 4.7l2.2.6Q1.5 19 .7 14.4M10.8.7 8.5.1A4 4 0 0 0 3.8 3l-.6 2q3-3.7 7.6-4.4" />
          </svg>
        ),
      };
      const platformNames = {
        youtube: "Youtube",
        twitch: "Twitch",
        aparat: "Aparat",
      };
      return (
        <label className={styles.option} key={platform}>
          <input
            value={`${platform}Embed`}
            name="value-radio-Embed"
            id={`${platform}Embed`}
            type="radio"
            onChange={handleStreamSelection}
            checked={state.selectedEmbed === `${platform}Embed`}
            aria-label={`Select ${platformNames[platform]} video`}
          />
          {icons[platform]}
          <span>{platformNames[platform]}</span>
        </label>
      );
    },
    [handleStreamSelection, state.selectedEmbed],
  );
  // تابع برای تبدیل لینک‌ها به عناصر قابل کلیک
  const convertLinksToClickable = useCallback((text: string) => {
    if (!text) return text;

    const urlRegex =
      /(https?:\/\/[^\s]+)|(www\.[^\s]+)|((?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+ [a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (!part) return "";

      // چک کردن اینکه آیا این قسمت یک لینک است
      if (urlRegex.test(part)) {
        let href = part;
        // اضافه کردن پروتکل اگر وجود نداشته باشد
        if (!href.startsWith("http")) {
          href = `https://${href}`;
        }

        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--color-dark-blue)",
              backgroundColor: "var(--color-dark-blue30)",
              padding: "0px 6px",
              borderRadius: "8px",
              textDecoration: "underline",

              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              console.log("Link clicked:", href);
            }}>
            {part}
          </a>
        );
      }

      return part;
    });
  }, []);

  const renderVideoContent = useCallback(
    (platform: "youtube" | "twitch" | "aparat", channel: any, streamStatus: boolean) => {
      if (!channel?.video) return null;

      const embedId = `${platform}Embed`;
      if (state.selectedEmbed !== embedId) return null;
      // if (platform === "youtube") OnClickPlayVideo("youtube", "redirect");
      return (
        <div className={styles.embedvide} id={embedId} key={platform}>
          {streamStatus && channel.embedVideo && (
            <div className={styles.embedvideofromtumbparent}>
              <iframe
                id={`${platform.charAt(0).toUpperCase() + platform.slice(1)}LastVideo`}
                className={styles.embedvideofromtumb}
                onError={handleVideoError}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`${platform} video`}
                src={channel.video.frameUrl}
                loading="lazy"
              />
            </div>
          )}
          {streamStatus && !channel.embedVideo && (
            <img
              loading="lazy"
              decoding="async"
              className={styles.embedvideofromtumb}
              alt={`${platform} thumbnail`}
              src={channel.video.thumbnailMediaUrl}
              onClick={() => handleVideoClick(platform)}
              style={{ cursor: "pointer" }}
            />
          )}
          {!streamStatus && (
            <div className={styles.embedvideofromtumb}>
              <img
                loading="lazy"
                decoding="async"
                onClick={() => handleVideoClick(platform)}
                alt={`${platform} thumbnail`}
                src={channel.video.filterThumbnailMediaUrl}
                width={800}
                height={500}
                style={{ cursor: "pointer" }}
              />
            </div>
          )}
          <div className={styles.videodetail}>
            <h3>{convertLinksToClickable(channel.video.title)}</h3>
            <div className={styles.contentttext}>{convertLinksToClickable(channel.video.descryption)}</div>
          </div>
        </div>
      );
    },
    [state.selectedEmbed, handleVideoError, handleRedirectYoutube, handleVideoClick, convertLinksToClickable],
  );
  if (!data.lastVideo) return null;
  return (
    <div key="LastVideo" id="LastVideo" className={styles.all}>
      <div className={styles.header} onClick={toggleContentVisibility}>
        <div className={styles.headerparent}>
          <img
            className={styles.headerimg}
            title="ℹ️ video"
            src="/marketlink/market-video.webp"
            loading="lazy"
            decoding="async"
            alt="Video section icon"
          />
          <div className={styles.headertext}>
            <span className={styles.headertextblue}>{t(LanguageKey.marketPropertiesLastVideo).split(" ")[0]}</span>{" "}
            {t(LanguageKey.marketPropertiesLastVideo).split(" ").slice(1).join(" ")}
          </div>
        </div>
        {activeOptionsCount > 1 && (
          <div className={styles.radioinput} role="radiogroup" aria-label="Select video platform">
            {renderVideoOption("youtube", data.lastVideo.youtubeChannel)}
            {renderVideoOption("twitch", data.lastVideo.twitchChannel)}
            {renderVideoOption("aparat", data.lastVideo.aparatChannel)}
          </div>
        )}
      </div>
      <div className={`${styles.content} ${state.isContentVisible ? styles.show : ""}`}>
        {renderVideoContent("youtube", data.lastVideo.youtubeChannel, state.youtubeStream)}
        {renderVideoContent("aparat", data.lastVideo.aparatChannel, state.aparatStream)}
        {renderVideoContent("twitch", data.lastVideo.twitchChannel, state.twitchStream)}
      </div>
    </div>
  );
});
LastVideo.displayName = "LastVideo";
export default LastVideo;
