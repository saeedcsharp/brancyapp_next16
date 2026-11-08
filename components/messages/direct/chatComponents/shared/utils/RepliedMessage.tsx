import React, { useCallback, useMemo } from "react";
import styles from "brancy/components/messages/direct/directChatBox.module.css";
import { RepliedMessageProps } from "brancy/models/interfaces";
export const JUMP_TO_ITEM_EVENT = "direct:jumpToItem";
export const RepliedMessage: React.FC<RepliedMessageProps> = React.memo(
  ({ repliedToItemId, repliedToItem, direction, handleSpecifyRepliedItemFullName, handleSpecifyRepliedItemType }) => {
    const isLeft = direction === "left";
    const repliedMsgClass = useMemo(() => (isLeft ? styles.leftrepliedmsg : styles.rightrepliedmsg), [isLeft]);
    const repliedMsgDiscriptionClass = useMemo(
      () => (isLeft ? styles.leftrepliedmsgdiscription : styles.rightrepliedmsgdiscription),
      [isLeft],
    );
    const fullName = useMemo(
      () => handleSpecifyRepliedItemFullName(repliedToItemId, repliedToItem),
      [repliedToItemId, repliedToItem, handleSpecifyRepliedItemFullName],
    );
    const itemType = useMemo(
      () => handleSpecifyRepliedItemType(repliedToItemId, repliedToItem),
      [repliedToItemId, repliedToItem, handleSpecifyRepliedItemType],
    );
    // DirectChatBox handles the event so it can load older pages when the target is not rendered yet.
    const handleJumpToReplied = useCallback(
      (e: React.SyntheticEvent<HTMLElement>) => {
        if (!repliedToItemId) return;
        e.stopPropagation();
        e.currentTarget.dispatchEvent(
          new CustomEvent<string>(JUMP_TO_ITEM_EVENT, { bubbles: true, detail: repliedToItemId }),
        );
      },
      [repliedToItemId],
    );

    return (
      <div
        className={repliedMsgClass}
        style={{ cursor: "pointer" }}
        role="button"
        tabIndex={0}
        aria-label="Replied message"
        onClick={handleJumpToReplied}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleJumpToReplied(e);
          }
        }}>
        <div className={styles.replymsgperson}>
          <img
            title="reply icon"
            alt="Reply indicator"
            className={styles.replymsgsvg}
            src="/icon-reply.svg"
            loading="lazy"
            decoding="async"
          />
          {fullName}
        </div>
        <div className={repliedMsgDiscriptionClass}>{itemType}</div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.repliedToItemId === nextProps.repliedToItemId &&
      prevProps.direction === nextProps.direction &&
      prevProps.repliedToItem === nextProps.repliedToItem
    );
  },
);
RepliedMessage.displayName = "RepliedMessage";
