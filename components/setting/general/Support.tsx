import React, {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useRef,
  useTransition,
} from "react";
import { useTranslation } from "react-i18next";
import Dotmenu from "saeed/components/design/dotMenu/dotMenu";
import RingLoader from "saeed/components/design/loader/ringLoder";
import formatTimeAgo from "saeed/helper/formatTimeAgo";
import { convertToSeconds } from "saeed/helper/manageTimer";
import { LanguageKey } from "saeed/i18n";
import { StatusReplied } from "saeed/models/messages/enum";
import { PlatformTicketType } from "saeed/models/setting/enums";
import { IPlatform, ITicketInsights } from "saeed/models/setting/general";
import styles from "./general.module.css";

interface SupportProps {
  isDataLoaded: boolean;
  platform: IPlatform;
  ticketInsights: ITicketInsights[];
  onOpenCreateTicket: () => void;
  onOpenRespondedTicket: (ticketId: number) => void;
  onLoadMore: () => void;
  pinTicket: (ticketId: number) => void;
  closeTicket: (ticketId: number) => void;
  changeStatusRepled: (status: StatusReplied[]) => void;
  hasMore: boolean;
}

const TicketTypeIcon = memo(
  ({ type, size = 16 }: { type: PlatformTicketType; size?: number }) => {
    switch (type) {
      case PlatformTicketType.BugReport:
        return (
          <svg
            width={size}
            height={size}
            xmlns="http://www.w3.org/2000/svg"
            fill="var(--text-h1)"
            viewBox="0 0 36 36">
            <path
              opacity=".4"
              d="M21.68 8.82a7 7 0 0 1 1.97.37 6.5 6.5 0 0 1 3.84 3.83q.3.88.36 1.98.06 1.05.05 2.72v5a9.9 9.9 0 1 1-19.8 0v-5q-.01-1.65.04-2.72a7 7 0 0 1 .37-1.98 6.5 6.5 0 0 1 3.83-3.83c.6-.23 1.25-.32 1.98-.37a53 53 0 0 1 2.72-.04h1.92q1.64-.01 2.72.04"
            />
            <path d="M19.13 32.56a10 10 0 0 1-2.25 0v-7.81a1.13 1.13 0 0 1 2.25 0zM15.52 8.78q.15-1.05.57-1.78c.37-.6.9-1 1.91-1s1.54.4 1.9 1q.45.72.58 1.78.66 0 1.2.04a7 7 0 0 1 1.85.32 8 8 0 0 0-1.06-3.7A5 5 0 0 0 18 3a5 5 0 0 0-4.47 2.44 8 8 0 0 0-1.06 3.7 7 7 0 0 1 1.86-.32zM9.6 11.15l-.37-.05A3.23 3.23 0 0 1 6 7.88V7.5a1.5 1.5 0 1 0-3 0v.38c0 3.1 2.28 5.68 5.25 6.14a6 6 0 0 1 1.34-2.87m-1.49 6.7H4.5a1.5 1.5 0 1 0 0 3h3.6zm.21 6.93A6.9 6.9 0 0 0 3 31.5a1.5 1.5 0 0 0 3 0 3.9 3.9 0 0 1 3.4-3.87 10 10 0 0 1-1.09-2.85m18.29 2.85A3.9 3.9 0 0 1 30 31.5a1.5 1.5 0 1 0 3 0c0-3.27-2.27-6-5.31-6.72a10 10 0 0 1-1.09 2.85m1.3-6.78h3.6a1.5 1.5 0 1 0 0-3h-3.6zm-.15-6.83A6.2 6.2 0 0 0 33 7.88V7.5a1.5 1.5 0 1 0-3 0v.38a3.23 3.23 0 0 1-3.23 3.22q-.2 0-.36.05a6.5 6.5 0 0 1 1.34 2.87" />
          </svg>
        );
      case PlatformTicketType.Wallet:
        return (
          <svg
            width={size}
            height={size}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-h1)"
            strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        );
      case PlatformTicketType.Message:
        return (
          <svg
            width={size}
            height={size}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-h1)"
            strokeWidth="2">
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
          </svg>
        );
      case PlatformTicketType.CustomerSupport:
        return (
          <svg
            width={size}
            height={size}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-h1)"
            strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      case PlatformTicketType.Ad:
        return (
          <svg
            width={size}
            height={size}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-h1)"
            strokeWidth="2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        );
      case PlatformTicketType.Shop:
        return (
          <svg
            width={size}
            height={size}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-h1)"
            strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        );
      case PlatformTicketType.LinkMarket:
        return (
          <svg
            width={size}
            height={size}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-h1)"
            strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        );
      case PlatformTicketType.Other:
        return (
          <svg
            width={size}
            height={size}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-h1)"
            strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        );
      default:
        return null;
    }
  }
);

TicketTypeIcon.displayName = "TicketTypeIcon";

function Support({
  platform,
  isDataLoaded,
  ticketInsights,
  onOpenCreateTicket,
  onOpenRespondedTicket,
  onLoadMore,
  pinTicket,
  closeTicket,
  changeStatusRepled,
  hasMore,
}: SupportProps) {
  const { t } = useTranslation();
  const componentId = useId();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ticketListRef = useRef<HTMLDivElement>(null);
  const [isHidden, setIsHidden] = useReducer((s: boolean) => !s, false);
  const [isPending, startTransition] = useTransition();
  const [activeFilter, setActiveFilter] = useReducer(
    (state: StatusReplied[], payload: StatusReplied[]) => payload,
    [StatusReplied.InstagramerReplied]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getStatusClass = useCallback((status: StatusReplied) => {
    switch (status) {
      case StatusReplied.JustCreated:
      case StatusReplied.UserReplied:
        return styles.statusPending;
      case StatusReplied.InstagramerClosed:
      case StatusReplied.TimerClosed:
      case StatusReplied.UserClosed:
        return styles.statusClose;
      case StatusReplied.InstagramerReplied:
        return styles.statusResponded;
      default:
        return styles.statusPending;
    }
  }, []);

  const getStatusNames = useCallback(
    (status: StatusReplied) => {
      switch (status) {
        case StatusReplied.JustCreated:
        case StatusReplied.UserReplied:
          return t(LanguageKey.Pending);
        case StatusReplied.InstagramerClosed:
        case StatusReplied.TimerClosed:
        case StatusReplied.UserClosed:
          return t(LanguageKey.closed);
        case StatusReplied.InstagramerReplied:
          return t(LanguageKey.Responded);
        default:
          return "";
      }
    },
    [t]
  );
  const handleStatusChange = useCallback(
    async (status: StatusReplied[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      startTransition(() => {
        setActiveFilter(status);
      });
      await changeStatusRepled(status);
    },
    [changeStatusRepled]
  );
  const sortedTickets = useMemo(() => {
    return platform.tickets.slice().sort((a, b) => {
      const pinDiff = Number(b.isPin) - Number(a.isPin);
      if (pinDiff !== 0) return pinDiff;
      const timeA = convertToSeconds(a.actionTime);
      const timeB = convertToSeconds(b.actionTime);
      return timeB - timeA;
    });
  }, [platform.tickets]);

  const getEmptyStateMessage = useMemo(() => {
    if (activeFilter.includes(StatusReplied.InstagramerReplied)) {
      return t(LanguageKey.noNewAnsweredTickets);
    } else if (
      activeFilter.includes(StatusReplied.JustCreated) ||
      activeFilter.includes(StatusReplied.UserReplied)
    ) {
      return t(LanguageKey.noNewPendingTickets);
    } else if (
      activeFilter.includes(StatusReplied.UserClosed) ||
      activeFilter.includes(StatusReplied.InstagramerClosed) ||
      activeFilter.includes(StatusReplied.TimerClosed)
    ) {
      return t(LanguageKey.noNewClosedTickets);
    }
    return "";
  }, [activeFilter, t]);

  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        setIsHidden();
      }
    },
    []
  );

  const handleTicketKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, ticketId: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onOpenRespondedTicket(ticketId);
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const currentElement = e.currentTarget;
        const allTickets =
          ticketListRef.current?.querySelectorAll("[data-ticket-card]");
        if (!allTickets) return;

        const currentIndex = Array.from(allTickets).indexOf(currentElement);
        const nextIndex =
          e.key === "ArrowDown" ? currentIndex + 1 : currentIndex - 1;

        if (nextIndex >= 0 && nextIndex < allTickets.length) {
          (allTickets[nextIndex] as HTMLElement).focus();
        }
      }
    },
    [onOpenRespondedTicket]
  );

  const handlePinTicket = useCallback(
    (ticketId: number) => {
      pinTicket(ticketId);
    },
    [pinTicket]
  );

  const handleCloseTicket = useCallback(
    (ticketId: number) => {
      closeTicket(ticketId);
    },
    [closeTicket]
  );

  return (
    <div
      className="bigcard"
      style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}
      tabIndex={0}
      aria-labelledby={`${componentId}-title`}
      onKeyDown={handleCardKeyDown}>
      <div className="frameParent">
        <div
          id={`${componentId}-title`}
          className="headerChild"
          title="↕ Resize the Card"
          onClick={setIsHidden}
          role="button"
          tabIndex={0}
          aria-pressed={isHidden}
          aria-expanded={!isHidden}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
              e.preventDefault();
              setIsHidden();
            }
          }}>
          <div className="circle" />
          <div className="Title">{t(LanguageKey.SettingGeneral_Support)}</div>
        </div>
        <svg
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke="var(--text-h2)"
          width="24px"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          style={{ cursor: "pointer" }}
          onClick={onOpenCreateTicket}
          role="button"
          tabIndex={0}
          aria-label={`${t(
            LanguageKey.SettingGeneral_Support
          )} - ایجاد تیکت جدید`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenCreateTicket();
            }
          }}>
          <path d="M16.7 2H7.3C4 2 2 4.3 2 7.6v8.8C2 19.7 4 22 7.3 22h9.4c3.3 0 5.3-2.3 5.3-5.6V7.6C22 4.3 20 2 16.7 2 M12 8.3v7.4m3.7-3.7H8.3" />
        </svg>
      </div>
      <div className={`${styles.all} ${isHidden ? "" : styles.show}`}>
        <div className={styles.headersection}>
          <img
            style={{ height: "50px" }}
            src="/systemticket.svg"
            alt="system ticket"
          />
          <div
            onClick={() =>
              handleStatusChange([StatusReplied.InstagramerReplied])
            }
            className={styles.headerandinput}
            style={{ cursor: "pointer" }}
            role="button"
            tabIndex={0}
            aria-label={t(LanguageKey.Responded)}
            aria-pressed={
              activeFilter.includes(StatusReplied.InstagramerReplied) &&
              activeFilter.length === 1
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleStatusChange([StatusReplied.InstagramerReplied]);
              }
            }}>
            <span
              className="title"
              style={{
                color:
                  activeFilter.includes(StatusReplied.InstagramerReplied) &&
                  activeFilter.length === 1
                    ? "#007AFF"
                    : undefined,
              }}>
              {ticketInsights.length > 0
                ? ticketInsights
                    .filter(
                      (x) => x.actionStatus === StatusReplied.InstagramerReplied
                    )
                    .reduce((acc, curr) => acc + (curr.count || 0), 0)
                : "---"}
            </span>
            <span
              className="explain"
              style={{
                minHeight: "30px",
                textAlign: "center",
                color:
                  activeFilter.includes(StatusReplied.InstagramerReplied) &&
                  activeFilter.length === 1
                    ? "#007AFF"
                    : undefined,
              }}>
              {t(LanguageKey.Responded)}
            </span>
          </div>
          <div
            onClick={() =>
              handleStatusChange([
                StatusReplied.JustCreated,
                StatusReplied.UserReplied,
              ])
            }
            className={styles.headerandinput}
            style={{ cursor: "pointer" }}
            role="button"
            tabIndex={0}
            aria-label={t(LanguageKey.Pending)}
            aria-pressed={
              activeFilter.includes(StatusReplied.JustCreated) &&
              activeFilter.includes(StatusReplied.UserReplied)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleStatusChange([
                  StatusReplied.JustCreated,
                  StatusReplied.UserReplied,
                ]);
              }
            }}>
            <span
              className="title"
              style={{
                color:
                  activeFilter.includes(StatusReplied.JustCreated) &&
                  activeFilter.includes(StatusReplied.UserReplied)
                    ? "#007AFF"
                    : undefined,
              }}>
              {ticketInsights.length > 0
                ? ticketInsights
                    .filter(
                      (x) =>
                        x.actionStatus === StatusReplied.JustCreated ||
                        x.actionStatus === StatusReplied.UserReplied
                    )
                    .reduce((acc, curr) => acc + (curr.count || 0), 0)
                : "---"}
            </span>
            <span
              className="explain"
              style={{
                minHeight: "30px",
                textAlign: "center",
                color:
                  activeFilter.includes(StatusReplied.JustCreated) &&
                  activeFilter.includes(StatusReplied.UserReplied)
                    ? "#007AFF"
                    : undefined,
              }}>
              {t(LanguageKey.Pending)}
            </span>
          </div>
          <div
            onClick={() =>
              handleStatusChange([
                StatusReplied.UserClosed,
                StatusReplied.InstagramerClosed,
                StatusReplied.TimerClosed,
              ])
            }
            className={styles.headerandinput}
            style={{ cursor: "pointer" }}
            role="button"
            tabIndex={0}
            aria-label={t(LanguageKey.closed)}
            aria-pressed={
              activeFilter.includes(StatusReplied.UserClosed) &&
              activeFilter.includes(StatusReplied.InstagramerClosed) &&
              activeFilter.includes(StatusReplied.TimerClosed)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleStatusChange([
                  StatusReplied.UserClosed,
                  StatusReplied.InstagramerClosed,
                  StatusReplied.TimerClosed,
                ]);
              }
            }}>
            <span
              className="title"
              style={{
                color:
                  activeFilter.includes(StatusReplied.UserClosed) &&
                  activeFilter.includes(StatusReplied.InstagramerClosed) &&
                  activeFilter.includes(StatusReplied.TimerClosed)
                    ? "#007AFF"
                    : undefined,
              }}>
              {ticketInsights.length > 0
                ? ticketInsights
                    .filter(
                      (x) =>
                        x.actionStatus === StatusReplied.UserClosed ||
                        x.actionStatus === StatusReplied.InstagramerClosed ||
                        x.actionStatus === StatusReplied.TimerClosed
                    )
                    .reduce((acc, curr) => acc + (curr.count || 0), 0)
                : "---"}
            </span>
            <span
              className="explain"
              style={{
                minHeight: "30px",
                textAlign: "center",
                color:
                  activeFilter.includes(StatusReplied.UserClosed) &&
                  activeFilter.includes(StatusReplied.InstagramerClosed) &&
                  activeFilter.includes(StatusReplied.TimerClosed)
                    ? "#007AFF"
                    : undefined,
              }}>
              {t(LanguageKey.closed)}
            </span>
          </div>
        </div>

        <div
          ref={ticketListRef}
          className={`${styles.listsection}`}
          style={{ position: "relative", overflowY: "auto" }}
          role="list"
          aria-label={t(LanguageKey.SettingGeneral_Support)}
          aria-busy={isPending || isDataLoaded}>
          {(isPending || isDataLoaded) && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "var(--color-white)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}
              aria-live="polite"
              aria-label={t(LanguageKey.loading)}>
              <RingLoader />
            </div>
          )}

          {!isPending && !isDataLoaded && platform.tickets.length === 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                padding: "20px",
              }}>
              <span className="title2" style={{ textAlign: "center" }}>
                {getEmptyStateMessage}
              </span>
            </div>
          )}

          <div className={styles.ticketcardParent} role="list">
            {sortedTickets
              .filter((x) => activeFilter.includes(x.actionStatus))
              .map((p) => (
                <React.Fragment key={p.ticketId}>
                  <div
                    data-ticket-card
                    onClick={() => onOpenRespondedTicket(p.ticketId)}
                    className={styles.ticketcard}
                    tabIndex={0}
                    aria-label={`${p.subject} - ${getStatusNames(
                      p.actionStatus
                    )}`}
                    role="listitem"
                    onKeyDown={(e) => handleTicketKeyDown(e, p.ticketId)}>
                    <div className="frameParent">
                      <span className={styles.ticketIDParent}>
                        <TicketTypeIcon type={p.type} />
                        {t(LanguageKey.ticketID)}: #{p.ticketId}
                      </span>

                      {!p.isClosed && (
                        <Dotmenu
                          data={[
                            {
                              icon: p.isPin ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 36 36">
                                  <path
                                    fill="var(--color-gray)"
                                    fillRule="evenodd"
                                    d="M13.44 22.56a1.5 1.5 0 0 1 0 2.13l-7.5 7.5a1.5 1.5 0 0 1-2.13-2.13l7.5-7.5a1.5 1.5 0 0 1 2.13 0m-10-19.12a1.5 1.5 0 0 1 2.12 0l27 27a1.5 1.5 0 1 1-2.12 2.12l-27-27a1.5 1.5 0 0 1 0-2.12"
                                  />
                                  <path
                                    fill="var(--color-gray)"
                                    d="M26.56 3.83a9.3 9.3 0 0 1 5.61 5.6c.16.45.35.97.42 1.43.08.55.03 1.06-.18 1.63-.43 1.21-1.41 1.75-2.5 2.35l-2.12 1.19-1.64.96c-.36.25-.45.38-.5.46-.01.05-.08.25-.06.93l.01.4c.04.69.06 1.03-.13 1.12-.19.08-.43-.16-.9-.64L16.7 11.4c-.48-.47-.72-.71-.64-.9.09-.2.43-.17 1.11-.14l.45.02c.32 0 .73.03.94-.08.08-.04.22-.14.46-.5.25-.35.54-.86.97-1.63l1.16-2.09c.6-1.08 1.14-2.06 2.35-2.5.57-.2 1.08-.25 1.63-.17.46.07.98.26 1.42.42m-2.02 23.03c-.2.3-.44.7-.71.98q-.47.51-1.16.78-.7.29-1.4.25c-.4-.02-.86-.12-1.25-.21a17 17 0 0 1-8.04-4.63 17 17 0 0 1-4.63-8.04 8 8 0 0 1-.21-1.25 3 3 0 0 1 .25-1.4q.29-.7.78-1.16a9 9 0 0 1 2.19-1.33c.16-.08.24-.11.33-.1.1.02.16.1.3.23l14.05 14.05c.13.13.2.2.21.29.02.09-.01.17-.09.34q-.26.6-.62 1.2"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 36 36">
                                  <path
                                    fill="var(--color-gray)"
                                    fillRule="evenodd"
                                    d="M13.44 22.56a1.5 1.5 0 0 1 0 2.13l-7.5 7.5a1.5 1.5 0 1 1-2.13-2.13l7.5-7.5a1.5 1.5 0 0 1 2.13 0"
                                  />
                                  <path
                                    fill="var(--color-gray)"
                                    d="M26.56 3.83a9.3 9.3 0 0 1 5.61 5.6c.16.45.35.97.42 1.43.08.55.03 1.06-.18 1.63-.43 1.21-1.41 1.75-2.5 2.35l-2.12 1.19-1.64.96c-.36.25-.45.38-.5.46-.01.05-.08.25-.06.93.01.63.1 1.5.21 2.72a9 9 0 0 1-1.27 5.76c-.2.3-.44.7-.71.98q-.47.51-1.16.78-.7.29-1.4.25c-.4-.02-.86-.12-1.25-.21a17 17 0 0 1-8.04-4.63 17 17 0 0 1-4.63-8.04 8 8 0 0 1-.21-1.25 3 3 0 0 1 .25-1.4q.29-.7.78-1.16a9 9 0 0 1 6.69-2l2.78.2c.32 0 .73.03.94-.08.08-.04.22-.14.46-.5.25-.35.54-.86.97-1.63l1.16-2.09c.6-1.08 1.14-2.06 2.35-2.5.57-.2 1.08-.25 1.63-.17.46.07.98.26 1.42.42"
                                  />
                                </svg>
                              ),
                              value: p.isPin
                                ? t(LanguageKey.unpin)
                                : t(LanguageKey.pin),
                              onClick: () => handlePinTicket(p.ticketId),
                            },
                            {
                              icon: (
                                <img
                                  title="ℹ️ close ticket"
                                  src="/close-box.svg"
                                  alt="close ticket"
                                />
                              ),
                              value: t(LanguageKey.close),
                              onClick: () => handleCloseTicket(p.ticketId),
                            },
                          ]}
                        />
                      )}
                    </div>
                    <div className="frameParent">
                      <span className={styles.tickettitle}>{p.subject}</span>
                      {p.isPin && (
                        <svg
                          className={styles.settingbox}
                          width="16"
                          height="16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 36 36">
                          <path d="M26.56 3.83a9.3 9.3 0 0 1 5.61 5.6c.16.45.35.97.42 1.43.08.55.03 1.06-.18 1.63-.43 1.21-1.41 1.75-2.5 2.35l-2.12 1.19c-.77.43-1.28.71-1.64.96s-.45.38-.5.46c-.01.05-.08.25-.06.93.01.63.1 1.5.21 2.72a9 9 0 0 1-1.27 5.76c-.2.3-.44.7-.71.98q-.47.51-1.16.78-.7.29-1.4.25c-.4-.02-.86-.12-1.25-.21a17 17 0 0 1-8.04-4.63 17 17 0 0 1-4.63-8.04 8 8 0 0 1-.21-1.25 3 3 0 0 1 .25-1.4q.29-.7.78-1.16a9 9 0 0 1 6.69-2c1.25.1 2.13.19 2.78.2.32 0 .73.03.94-.08.08-.04.22-.14.46-.5.25-.35.54-.86.97-1.63l1.16-2.09c.6-1.08 1.14-2.06 2.35-2.5.57-.2 1.08-.25 1.63-.17.46.07.98.26 1.42.42" />
                          <path
                            opacity=".6"
                            d="M10.96 22.92 3.8 30.06a1.5 1.5 0 1 0 2.13 2.12l7.14-7.14a19 19 0 0 1-2.12-2.12"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="frameParent">
                      <span className={getStatusClass(p.actionStatus)}>
                        {getStatusNames(p.actionStatus)}
                      </span>
                      <span className={styles.time}>
                        {formatTimeAgo(convertToSeconds(p.actionTime))}
                      </span>
                    </div>
                  </div>
                  <div className={styles.divider} />
                </React.Fragment>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;
