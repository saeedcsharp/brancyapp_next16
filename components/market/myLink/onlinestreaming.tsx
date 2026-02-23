import React, { memo, useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import { IOnlineStreaming } from "brancy/models/market/myLink";
import styles from "brancy/components/market/myLink/onlinestreaming.module.css";

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
const OnlineStreaming = memo(({ data }: { data: IOnlineStreaming }) => {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(streamReducer, initialState);
  const playerRef = useRef<any>(null);
  const activeOptionsCount = useMemo(() => {
    if (!data.onlineStream) return 0;
    let count = 0;
    if (data.onlineStream.youtubeChannel?.live) count++;
    if (data.onlineStream.twitchChannel?.live) count++;
    if (data.onlineStream.aparatChannel?.live) count++;
    return count;
  }, [data.onlineStream]);
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
    img.src = "/lmage_stream.png";
    img.alt = "live online stream";
    img.className = styles.streamlogo;
    target.parentNode?.insertBefore(img, target.nextSibling);
  }, []);
  const initializeSelectedStream = useCallback(() => {
    if (data.onlineStream?.youtubeChannel) {
      dispatch({ type: "INITIALIZE", payload: "youtubeEmbed" });
    } else if (data.onlineStream?.aparatChannel) {
      dispatch({ type: "INITIALIZE", payload: "aparatEmbed" });
    } else if (data.onlineStream?.twitchChannel) {
      dispatch({ type: "INITIALIZE", payload: "twitchEmbed" });
    }
  }, [data.onlineStream]);
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
    const videoUrl = data.onlineStream?.youtubeChannel?.live?.reDirectUrl;
    if (videoUrl) {
      window.location.href = videoUrl;
    }
  }, [data.onlineStream?.youtubeChannel?.live?.reDirectUrl]);
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
          const youtubeUrl = getFixedUrl(data.onlineStream?.youtubeChannel?.live?.reDirectUrl);
          if (youtubeUrl) openLinkSmart(youtubeUrl, "youtube");
          break;
        case "aparat":
          // OnClickPlayVideo("aparat", "play");
          const aparatUrl = getFixedUrl(data.onlineStream?.aparatChannel?.live?.reDirectUrl);
          if (aparatUrl) openLinkSmart(aparatUrl, "aparat");
          break;
        case "twitch":
          // OnClickPlayVideo("twitch", "play");
          const twitchUrl = getFixedUrl(data.onlineStream?.twitchChannel?.live?.reDirectUrl);
          if (twitchUrl) openLinkSmart(twitchUrl, "twitch");
          break;
        default:
          console.log("پلتفرم نامشخص");
      }
    },
    [data.onlineStream],
  );
  let lastUserInteraction = 0;
  if (typeof window !== "undefined") {
    ["click", "touchend", "pointerdown"].forEach((ev) => {
      window.addEventListener(ev, () => (lastUserInteraction = Date.now()), {
        passive: true,
      });
    });
  }
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
      window.open(fallbackUrl, "_blank");
      return;
    }
    if (isIOS) {
      window.location.href = fallbackUrl;
      return;
    }
    if (isAndroid) {
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
      if (data.onlineStream?.aparatChannel?.live?.thumbnailMediaUrl) {
        promises.push(checkStreamStatus("aparat", data.onlineStream.aparatChannel.live.thumbnailMediaUrl));
      }
      if (data.onlineStream?.youtubeChannel?.live?.frameUrl) {
        promises.push(checkStreamStatus("youtube", data.onlineStream.youtubeChannel.live.frameUrl));
      }
      if (data.onlineStream?.twitchChannel?.live?.frameUrl) {
        promises.push(checkStreamStatus("twitch", data.onlineStream.twitchChannel.live.frameUrl));
      }
      await Promise.allSettled(promises);
    };
    checkStreams();
  }, [data.onlineStream, initializeSelectedStream, checkStreamStatus]);
  useEffect(() => {
    if (data.onlineStream?.youtubeChannel?.live?.frameUrl) {
      ReactDOM.preinit("https://www.youtube.com/iframe_api", { as: "script" });
    }
  }, [data.onlineStream]);
  useEffect(() => {
    const initializePlayers = () => {
      if (data.onlineStream?.youtubeChannel?.live?.frameUrl) {
        setTimeout(() => {
          if (typeof window !== "undefined" && (window as any).YT === undefined) return;
          setTimeout(() => {
            let firstFetch = false;
            const videoId = data.onlineStream?.youtubeChannel?.live?.frameUrl.split("/").reverse()[0];
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
      if (data.onlineStream?.aparatChannel?.live?.frameUrl) {
        setTimeout(() => {
          const aparatFrame = document.getElementById("AparatLastVideo");
          if (aparatFrame) {
            aparatFrame.addEventListener("click", () => {
              console.log("Aparat video clicked");
              // OnClickPlayVideo("aparat", "play");
              const aparatUrl = data.onlineStream?.aparatChannel?.live?.reDirectUrl;
              if (aparatUrl) {
                window.open(aparatUrl, "_blank");
              }
            });
          }
        }, 500);
      }
      if (data.onlineStream?.twitchChannel?.live?.frameUrl) {
        setTimeout(() => {
          const twitchFrame = document.getElementById("TwitchLastVideo");
          if (twitchFrame) {
            twitchFrame.addEventListener("click", () => {
              console.log("Twitch video clicked");
              // OnClickPlayVideo("twitch", "play");
              const twitchUrl = data.onlineStream?.twitchChannel?.live?.reDirectUrl;
              if (twitchUrl) {
                window.open(twitchUrl, "_blank");
              }
            });
          }
        }, 500);
      }
    };
    initializePlayers();
    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [data.onlineStream, state.selectedEmbed]);
  const renderVideoOption = useCallback(
    (platform: "youtube" | "twitch" | "aparat", channel: any) => {
      console.log("renderVideoOption", channel?.live);
      if (!channel?.live) return null;
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

  // تبدیل خودکار URLهای داخل متن به لینک‌های قابل کلیک
  const convertLinksToClickable = useCallback((text?: string) => {
    if (!text) return null;
    const regex =
      /(https?:\/\/[\w\-._~:/?#\[\]@!$&'()*+,;=%]+|www\.[^\s]+|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const url = match[0];
      if (start > lastIndex) {
        elements.push(<React.Fragment key={`t-${start}`}>{text.slice(lastIndex, start)}</React.Fragment>);
      }
      const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      elements.push(
        <a key={`a-${start}`} href={href} target="_blank" rel="noopener noreferrer">
          {url}
        </a>,
      );
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      elements.push(<React.Fragment key={`t-${lastIndex}`}>{text.slice(lastIndex)}</React.Fragment>);
    }
    return elements;
  }, []);
  const renderVideoContent = useCallback(
    (platform: "youtube" | "twitch" | "aparat", channel: any, streamStatus: boolean) => {
      if (!channel?.live) return null;

      const embedId = `${platform}Embed`;
      if (state.selectedEmbed !== embedId) return null;
      // if (platform === "youtube") OnClickPlayVideo("youtube", "redirect");
      return (
        <div className={styles.embedvide} id={embedId} key={platform}>
          {streamStatus && channel.embedVideo && (
            <div style={{ position: "relative", cursor: "pointer" }}>
              <iframe
                id={`${platform.charAt(0).toUpperCase() + platform.slice(1)}LastVideo`}
                className={styles.embedvideofromtumb}
                onError={handleVideoError}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`${platform} video`}
                src={channel.live.frameUrl}
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
              src={channel.live.thumbnailMediaUrl}
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
                src={channel.live.filterThumbnailMediaUrl}
                width={800}
                height={500}
                style={{ cursor: "pointer" }}
              />
            </div>
          )}
          <div className={styles.videodetail}>
            <h3>{channel.live.title}</h3>
            <div className={styles.contentttext}>{convertLinksToClickable(channel.live.descryption)}</div>
          </div>
        </div>
      );
    },
    [state.selectedEmbed, handleVideoError, handleRedirectYoutube, handleVideoClick, convertLinksToClickable],
  );
  console.log("data.onlineStream", data.onlineStream);
  if (!data.onlineStream) return null;
  return (
    <div key="onlinestreaming" id="onlinestreaming" className={styles.all}>
      <div className={styles.header} onClick={toggleContentVisibility}>
        <div className={styles.ribonparent}>
          {(() => {
            const marqueeItems = [
              { type: "img" },
              { type: "text", key: LanguageKey.livestarted },
              { type: "img" },
              { type: "b", key: LanguageKey.live },
              { type: "img" },
              { type: "b", key: LanguageKey.livestarted },
              { type: "img" },
              { type: "text", key: LanguageKey.live },
              { type: "img" },
              { type: "b", key: LanguageKey.clickonstreamvideo },
            ];
            const renderMarquee = (className: string, id: string) => {
              return (
                <div className={className} id={id} aria-hidden="true">
                  {marqueeItems.map((item, idx) => {
                    if (item.type === "img") {
                      return (
                        <span key={idx}>
                          <img
                            className={styles.marqueeImg}
                            alt="onlinestream"
                            src="/onlinestream-start.svg"
                            loading="lazy"
                            decoding="async"
                          />
                        </span>
                      );
                    } else if (item.type === "b") {
                      return (
                        <span key={idx}>
                          <b>{item.key ? t(item.key as string) : ""}</b>
                        </span>
                      );
                    } else {
                      return <span key={idx}>{item.key ? t(item.key as string) : ""}</span>;
                    }
                  })}
                </div>
              );
            };
            return (
              <>
                <div className={styles.ribon1}>
                  {renderMarquee(styles.marquee1, "marquee1-1")}
                  {renderMarquee(`${styles.marquee} ${styles.marquee2}`, "marquee1-2")}
                </div>
                <div className={styles.ribon2}>
                  {renderMarquee(styles.marquee, "marquee2-1")}
                  {renderMarquee(`${styles.marquee} ${styles.marquee2}`, "marquee2-2")}
                </div>
              </>
            );
          })()}
        </div>
        {activeOptionsCount > 1 && (
          <div className={styles.radioinput} role="radiogroup" aria-label="Select video platform">
            {renderVideoOption("youtube", data.onlineStream.youtubeChannel)}
            {renderVideoOption("twitch", data.onlineStream.twitchChannel)}
            {renderVideoOption("aparat", data.onlineStream.aparatChannel)}
          </div>
        )}
      </div>
      <div className={`${styles.content} ${state.isContentVisible ? styles.show : ""}`}>
        {renderVideoContent("youtube", data.onlineStream.youtubeChannel, state.youtubeStream)}
        {renderVideoContent("aparat", data.onlineStream.aparatChannel, state.aparatStream)}
        {renderVideoContent("twitch", data.onlineStream.twitchChannel, state.twitchStream)}
      </div>
    </div>
  );
});
OnlineStreaming.displayName = "OnlineStreaming";
export default OnlineStreaming;
