import React, { useCallback, useMemo } from "react";
import styles from "brancy/components/messages/ticket/ticketChatBox.module.css";
export interface TicketChatDateProps {
  createdTime: number;
  itemId: string;
  direction: "left" | "right" | "system";
  isToggled: boolean;
  onToggle: (itemId: string) => void;
  formatDate: (timestamp: number, itemId: string | null) => string;
}
export const TicketChatDate: React.FC<TicketChatDateProps> = React.memo(
  ({ createdTime, itemId, direction, isToggled, onToggle, formatDate }) => {
    const formattedTimestamp = useMemo(() => createdTime / 1e3, [createdTime]);
    const handleClick = useCallback(() => {
      onToggle(itemId);
    }, [onToggle, itemId]);
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(itemId);
        }
      },
      [onToggle, itemId]
    );
    const textAlignStyle = useMemo(
      () => (direction === "right" ? { textAlign: "right" as const } : undefined),
      [direction]
    );
    return (
      <button
        className={styles.chatdate}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        style={textAlignStyle}
        role="button"
        tabIndex={0}
        aria-label={`Toggle date: ${formatDate(formattedTimestamp, itemId)}`}
        aria-pressed={isToggled}>
        {formatDate(formattedTimestamp, itemId)}
      </button>
    );
  }
);
TicketChatDate.displayName = "TicketChatDate";
