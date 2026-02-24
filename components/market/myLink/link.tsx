import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import CountdownTimerForLink from "brancy/components/design/counterDown/counterDownForLink";
import { LanguageKey } from "brancy/i18n";
import { ILink, IServerLink } from "brancy/models/market/myLink";
import styles from "./link.module.css";
interface LinkComponentProps {
  data: ILink | null;
}
interface LinkItemProps {
  link: IServerLink;
  baseMediaUrl: string;
  onLinkClick: (redirectUrl: string) => void;
}
const LinkItem = memo<LinkItemProps>(({ link, baseMediaUrl, onLinkClick }) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);

  const handleClick = useCallback(() => {
    onLinkClick(link.redirectUrl);
  }, [link.id, link.redirectUrl, onLinkClick]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);
  return (
    <article
      className={styles.shortcutlink}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`${link.title}: ${link.description}`}>
      <div className={styles.linkcontent} aria-hidden="true">
        <div className={link.isBold ? styles.linkcontentmaskbold : styles.linkcontentmask} />
        <div className={styles.linketitle}>
          <svg
            fill="var(--text-h1)"
            xmlns="http://www.w3.org/2000/svg"
            height="25"
            viewBox="0 0 24 25"
            aria-hidden="true">
            <path
              d="M9 22.5a7 7 0 0 1-7-7 7 7 0 0 1 2-4.9l1.2-1.1a1 1 0 1 1 1.4 1.4l-1.2 1.2a5 5 0 0 0 0 7 5 5 0 0 0 7 0l1.2-1.2a1 1 0 1 1 1.4 1.4l-1.1 1.2q-2 2-5 2m9.2-6.7a1 1 0 0 1-.7-1.7l1.2-1.2Q20 11.5 20 9.4A5 5 0 0 0 11.6 6l-1.2 1.2A1 1 0 1 1 9 5.7l1.1-1.2a7 7 0 0 1 9.9 9.9l-1.2 1.1z"
              opacity=".4"
            />
            <path d="M9.4 16.2a1 1 0 0 1-.7-1.7l5.2-5.2a1 1 0 0 1 1.4 1.4l-5.2 5.2z" />
          </svg>
          <span>{link.title}</span>
        </div>
        {link.expireTime > 0 && (
          <div className={styles.linkexpire}>
            <img
              style={{ cursor: "pointer", width: "20px", height: "20px" }}
              alt="Expire time icon"
              src="/expire-time.svg"
            />
            <CountdownTimerForLink
              expireTime={link.expireTime}
              className={styles.countdown}
              expiredClassName={styles.countdownExpired}
            />
          </div>
        )}
        <p className={styles.linkexplain}>{link.description}</p>
        {/* <p className={styles.linkexplain}>{link.redirectUrl}</p> */}
      </div>
      <div className={styles.linkcontentheader}>
        <div className={link.isBold ? styles.linkcontentheadermaskbold : styles.linkcontentheadermask} />
        {imageError ? (
          <svg className={styles.linkicon} viewBox="0 0 25 25" aria-label={`${link.title} icon`} role="img">
            <path
              fill="#000"
              d="M15 18.9a2 2 0 0 1-.1 2.5L13 23a7.6 7.6 0 0 1-11.1-1A9 9 0 0 1 0 16a9 9 0 0 1 2.7-5.8l1.8-1.6A1.6 1.6 0 0 1 7 9a2 2 0 0 1-.2 2.5L5 13a5 5 0 0 0-.4 6.8 4.4 4.4 0 0 0 6.4.5l1.8-1.6a1.6 1.6 0 0 1 2.3.2M12 2l-2 1.6a2 2 0 0 0-.1 2.5 1.6 1.6 0 0 0 2.3.2L14 4.7a4.4 4.4 0 0 1 5-.6q.9.3 1.4 1.1a5 5 0 0 1 1.1 3.5q0 2-1.5 3.3l-1.8 1.6A2 2 0 0 0 18 16a1.6 1.6 0 0 0 2.4.2l1.8-1.6A8.7 8.7 0 0 0 23 2.9 7.6 7.6 0 0 0 11.9 2m2.5 6.3L8.3 14a2 2 0 0 0-.2 2.5 2 2 0 0 0 1.3.6q.6 0 1.1-.5l6.2-5.6a2 2 0 0 0 .2-2.5 1.6 1.6 0 0 0-2.4-.2"></path>
          </svg>
        ) : (
          <img
            loading="lazy"
            decoding="async"
            className={styles.linkicon}
            alt={`${link.title} icon`}
            src={`${baseMediaUrl}${link.iconUrl}`}
            width="80"
            height="80"
            onError={handleImageError}
          />
        )}
      </div>
    </article>
  );
});
LinkItem.displayName = "LinkItem";
const Link = memo<LinkComponentProps>(({ data }) => {
  const { t } = useTranslation();
  const [isContentVisible, setIsContentVisible] = useState(true);
  const baseMediaUrl = useMemo(() => process.env.NEXT_PUBLIC_BASE_MEDIA_URL || "", []);
  const toggleContentVisibility = useCallback(() => {
    setIsContentVisible((prev) => !prev);
  }, []);
  const handleToggleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleContentVisibility();
      }
    },
    [toggleContentVisibility],
  );
  const sortedLinks = useMemo(() => {
    if (!data?.links?.length) return [];
    return [...data.links].sort((a, b) => a.orderId - b.orderId);
  }, [data?.links]);
  const headerText = useMemo(() => {
    const text = t(LanguageKey.marketPropertiesLinkShortcut);
    const words = text.split(" ");
    const highlighted = words.length >= 2 ? words[words.length - 2] : "";
    const rest = words.slice(0, -2).concat(words.slice(-1)).join(" ");
    return { full: text, highlighted, rest, words };
  }, [t]);
  const handleLinkClick = useCallback((redirectUrl: string) => {
    if (redirectUrl) {
      const url = /^https?:\/\//i.test(redirectUrl) ? redirectUrl : `https://${redirectUrl}`;
      window.location.href = url;
    }
  }, []);
  if (!data?.links?.length) return null;
  return (
    <div key="link" id="link" className={styles.all}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.headerbutton}
          onClick={toggleContentVisibility}
          onKeyDown={handleToggleKeyDown}
          aria-expanded={isContentVisible}
          aria-label={t(LanguageKey.marketPropertiesLinkShortcut)}
          aria-controls="link-content">
          <img
            className={styles.headerimg}
            title="ℹ️ header-banner"
            src="/marketlink/market-link.webp"
            alt="Market link header banner"
            loading="lazy"
            decoding="async"
          />
          <div className={styles.headertext}>
            {headerText.highlighted ? (
              <>
                {headerText.words.slice(0, -2).map((word, index) => (
                  <span key={index}>{word}</span>
                ))}
                <strong className={styles.headertextblue}>{headerText.highlighted}</strong>
                {headerText.words.slice(-1).map((word, index) => (
                  <span key={`last-${index}`}>{word}</span>
                ))}
              </>
            ) : (
              <span>{headerText.full}</span>
            )}
          </div>
        </button>
      </header>
      <main id="link-content" className={`${styles.content} ${isContentVisible ? styles.show : ""}`}>
        {sortedLinks.map((link) => (
          <LinkItem key={link.id} link={link} baseMediaUrl={baseMediaUrl} onLinkClick={handleLinkClick} />
        ))}
      </main>
    </div>
  );
});
Link.displayName = "Link";
export default Link;
