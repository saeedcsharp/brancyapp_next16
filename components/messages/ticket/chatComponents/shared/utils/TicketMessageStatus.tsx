import React, { useCallback, useMemo } from "react";
import styles from "brancy/components/messages/ticket/ticketChatBox.module.css";
export interface TicketMessageStatusProps {
  createdTime: number;
  recpLastSeenUnix?: number;
  userLastSeenUnix?: number;
  itemId: string;
  dateFormatToggle: string;
  toggleDateFormat: (itemId: string) => void;
  formatDate: (timestamp: number, itemId: string | null) => string;
}
const CheckmarkIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = React.memo(
  ({ className, style }) => (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 7"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false">
      <path
        fill="var(--color-light-blue)"
        d="M10.2.7 4 6.5a1 1 0 0 1-.9 0L.5 4a1 1 0 0 1 0-.9 1 1 0 0 1 1 0l2 2.1L9.4-.2a1 1 0 0 1 .9 0 1 1 0 0 1 0 .9"
      />
    </svg>
  )
);
CheckmarkIcon.displayName = "CheckmarkIcon";
export const TicketMessageStatus: React.FC<TicketMessageStatusProps> = React.memo(
  ({ createdTime, recpLastSeenUnix, userLastSeenUnix, itemId, dateFormatToggle, toggleDateFormat, formatDate }) => {
    const handleDateClick = useCallback(() => {
      toggleDateFormat(itemId);
    }, [itemId, toggleDateFormat]);
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleDateFormat(itemId);
        }
      },
      [itemId, toggleDateFormat]
    );
    const formattedDate = useMemo(() => formatDate(createdTime / 1000, itemId), [createdTime, itemId, formatDate]);
    const isMessageSeen = useMemo(() => {
      const seenTimestamp = recpLastSeenUnix ?? userLastSeenUnix ?? 0;
      return seenTimestamp >= createdTime;
    }, [recpLastSeenUnix, userLastSeenUnix, createdTime]);
    const seenStatusLabel = isMessageSeen ? "Seen" : "Sent";
    const renderSeenStatus = useMemo(() => {
      if (isMessageSeen) {
        return (
          <>
            <CheckmarkIcon />
            <CheckmarkIcon style={{ position: "relative", right: "5px" }} />
          </>
        );
      }
      return <CheckmarkIcon />;
    }, [isMessageSeen]);
    return (
      <div className={styles.msgdetail} role="status" aria-label="Message status">
        <div
          className={styles.chatdate}
          onClick={handleDateClick}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-label={`Toggle date format: ${formattedDate}`}>
          {formattedDate}
        </div>
        <div className={styles.chatstatus} aria-label={seenStatusLabel}>
          <div className={styles.sent}>{renderSeenStatus}</div>
        </div>
      </div>
    );
  }
);
TicketMessageStatus.displayName = "TicketMessageStatus";
