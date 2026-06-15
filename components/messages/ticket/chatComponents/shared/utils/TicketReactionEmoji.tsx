import styles from "brancy/components/messages/ticket/ticketChatBox.module.css";
import { IDirectMessageItem, IThread_Ticket, ITicket } from "brancy/models/interfaces";
import React, { useCallback, useMemo } from "react";
export interface TicketReactionEmojiProps {
  item: IDirectMessageItem;
  direction: "left" | "right" | "system";
  chatBox: IThread_Ticket | ITicket;
  baseMediaUrl: string;
}
const TicketReactionEmoji: React.FC<TicketReactionEmojiProps> = ({ item, direction, chatBox, baseMediaUrl }) => {
  const isLeft = useMemo(() => direction === "left", [direction]);
  const profileSrc = useMemo(() => {
    // Check if chatBox has recp property (IThread_Ticket)
    if ("recp" in chatBox && chatBox.recp?.profilePic) {
      return `${baseMediaUrl}${chatBox.recp.profilePic}`;
    }
    return "/no-profile.svg";
  }, [baseMediaUrl, chatBox]);
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/no-profile.svg";
  }, []);
  const emojiReactionClassName = useMemo(() => styles.emojireaction, []);
  const hasOwnerReaction = Boolean(item?.ownerEmojiReaction);
  const hasRecpReaction = Boolean(item?.recpEmojiReaction);
  if (!hasOwnerReaction && !hasRecpReaction) {
    return null;
  }
  return (
    <div className={styles.emojireactionParent}>
      {/* Recipient Emoji Reaction */}
      {hasRecpReaction && (
        <div className={emojiReactionClassName} role="img" aria-label={`Recipient reaction: ${item.recpEmojiReaction}`}>
          <img
            className={styles.profilereactionpicture}
            src={profileSrc}
            alt={`${"recp" in chatBox && chatBox.recp?.username ? chatBox.recp.username : "User"} profile picture`}
            title={`${"recp" in chatBox && chatBox.recp?.username ? chatBox.recp.username : "User"} reaction`}
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />
          {item.recpEmojiReaction}
        </div>
      )}
      {/* Owner Emoji Reaction */}
      {hasOwnerReaction && (
        <div className={emojiReactionClassName} role="img" aria-label={`Owner reaction: ${item.ownerEmojiReaction}`}>
          {item.ownerEmojiReaction}
        </div>
      )}
    </div>
  );
};
export default React.memo(TicketReactionEmoji, (prevProps, nextProps) => {
  const prevRecp = "recp" in prevProps.chatBox ? prevProps.chatBox.recp?.profilePic : undefined;
  const nextRecp = "recp" in nextProps.chatBox ? nextProps.chatBox.recp?.profilePic : undefined;
  return (
    prevProps.item?.ownerEmojiReaction === nextProps.item?.ownerEmojiReaction &&
    prevProps.item?.recpEmojiReaction === nextProps.item?.recpEmojiReaction &&
    prevProps.direction === nextProps.direction &&
    prevRecp === nextRecp &&
    prevProps.baseMediaUrl === nextProps.baseMediaUrl
  );
});
