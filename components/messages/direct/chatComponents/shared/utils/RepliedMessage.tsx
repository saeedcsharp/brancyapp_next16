import React, { useCallback, useMemo } from "react";
import styles from "./components/messages/direct/directChatBox.module.css";
import { RepliedMessageProps } from "brancy/components/messages/direct/chatComponents/types";
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
    const handleJumpToReplied = useCallback(() => {
      if (!repliedToItemId) return;
      try {
        const selector = `[data-itemid="${repliedToItemId}"]`;
        const target = document.querySelector<HTMLElement>(selector);
        if (!target) return;

        // find nearest scrollable ancestor (the chat container)
        let container: HTMLElement | null = target.parentElement;
        while (container) {
          const style = window.getComputedStyle(container);
          const overflowY = style.overflowY;
          if (overflowY === "auto" || overflowY === "scroll") break;
          container = container.parentElement;
        }

        if (container) {
          // compute offset of target relative to container
          const containerRect = container.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const offset = targetRect.top - containerRect.top;
          const scrollTop = container.scrollTop;
          const targetScroll = scrollTop + offset - container.clientHeight / 2 + target.clientHeight / 2;
          container.scrollTo({ top: targetScroll, behavior: "smooth" });
        } else {
          // fallback
          target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        }

        // add shake effect
        target.classList.add(styles.shake);
        const remove = () => target.classList.remove(styles.shake);
        target.addEventListener("animationend", remove, { once: true });
        setTimeout(remove, 900);
      } catch (e) {
        // ignore
      }
    }, [repliedToItemId]);

    return (
      <div className={repliedMsgClass} role="blockquote" aria-label="Replied message">
        <div
          className={styles.replymsgperson}
          role="button"
          tabIndex={0}
          onClick={handleJumpToReplied}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleJumpToReplied();
            }
          }}>
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
