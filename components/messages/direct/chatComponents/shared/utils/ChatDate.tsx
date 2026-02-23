import React, { useCallback, useMemo } from "react";
import styles from "brancy/components/messages/direct/directChatBox.module.css";
import { ChatDateProps } from "brancy/components/messages/direct/chatComponents/types";
export const ChatDate: React.FC<ChatDateProps> = React.memo(
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
ChatDate.displayName = "ChatDate";
