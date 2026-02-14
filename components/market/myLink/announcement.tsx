import { KeyboardEvent, memo, useCallback, useId, useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "saeed/i18n";
import { IClientAnnouncement } from "saeed/models/market/myLink";
import styles from "./announcement.module.css";
const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
type AnnouncementProps = {
  data: IClientAnnouncement | null;
};

const initialExpandedState = true;
const Announcement = memo(function Announcement({ data }: AnnouncementProps) {
  const { t } = useTranslation();
  const [isExpanded, toggleExpanded] = useReducer((state: boolean) => !state, initialExpandedState);
  const headingId = useId();
  const contentId = useId();

  const announcementTitle = useMemo(() => t(LanguageKey.marketPropertiesAnnouncements), [t]);

  const announcementDate = useMemo(() => {
    if (!data?.createdDate) {
      return null;
    }

    const parsedDate = new Date(data.createdDate);

    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }, [data?.createdDate]);

  const formattedDate = useMemo(() => {
    if (!announcementDate) {
      return t(LanguageKey.footer_LatestNews);
    }

    return announcementDate.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [announcementDate, t]);

  const announcementDateTime = useMemo(() => announcementDate?.toISOString(), [announcementDate]);

  const announcementText = useMemo(() => data?.text ?? "", [data?.text]);

  // Convert URLs in plain text to clickable links
  const convertLinksToClickable = useCallback((text?: string) => {
    if (!text) return null;
    const regex =
      /(https?:\/\/[\w\-._~:/?#\[\]@!$&'()*+,;=%]+|www\.[^\s]+|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
    const elements: Array<string | JSX.Element> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const url = match[0];
      if (start > lastIndex) {
        elements.push(text.slice(lastIndex, start));
      }
      const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      elements.push(
        <a key={`a-${start}`} href={href} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      );
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }
    return elements;
  }, []);

  const handleToggle = useCallback(() => {
    toggleExpanded();
  }, []);

  const handleToggleKeys = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Escape" && isExpanded) {
        event.preventDefault();
        toggleExpanded();
      }

      if (event.key === "ArrowDown" && !isExpanded) {
        event.preventDefault();
        toggleExpanded();
      }

      if (event.key === "ArrowUp" && isExpanded) {
        event.preventDefault();
        toggleExpanded();
      }
    },
    [isExpanded]
  );

  if (!data || !announcementText.trim()) {
    return null;
  }

  return (
    <section
      key="announcement"
      id="announcement"
      aria-labelledby={headingId}
      className={styles.all}
      dir="auto"
      role="region">
      <header className={styles.header}>
        <button
          // onClick={toggleContentVisibility}
          type="button"
          className={styles.Announcementsheader}
          onClick={handleToggle}
          onKeyDown={handleToggleKeys}
          aria-controls={contentId}
          aria-expanded={isExpanded}
          aria-label={announcementTitle}
          //  onClick={toggleContentVisibility}
        >
          <span className={styles.headertitle}>{announcementTitle}</span>
          <img
            title={announcementTitle}
            alt={announcementTitle}
            src="/marketlink/market-Announcements.webp"
            loading="lazy"
            decoding="async"
          />
        </button>
      </header>
      <div
        id={contentId}
        className={`${styles.content} ${isExpanded ? styles.show : styles.hidden}`}
        aria-hidden={!isExpanded}>
        <article className={styles.announcement}>
          <time dateTime={announcementDateTime} className={styles.announcementDate}>
            <svg
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false">
              <path
                d="m12.1 4.4-.6.6q-.6.8-.3 1.7.4 1-.3 1.6L9.6 9.7 9 10l-3.2 1a1.5 1.5 0 0 0-.6 2.5l5.3 5.3a1.5 1.5 0 0 0 2.5-.6l1-3.2.3-.6 1.4-1.3q.7-.7 1.6-.3 1 .2 1.7-.3l.6-.6c.5-.6.5-1.6 0-2.2l-5.3-5.3q-1.1-.7-2.2 0M7.8 16.2 4 20"
                stroke="var(--text-h2)"
                strokeWidth="1.5"
              />
            </svg>
            {formattedDate}
          </time>
          <p className={styles.announcementcontent}>{convertLinksToClickable(announcementText)}</p>
        </article>
      </div>
    </section>
  );
});
export default Announcement;
