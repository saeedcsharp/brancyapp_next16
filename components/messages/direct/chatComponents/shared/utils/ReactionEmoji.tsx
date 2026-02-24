import React, { useCallback, useMemo } from "react";
import styles from "brancy/components/messages/direct/directChatBox.module.css";
import { ReactionEmojiProps } from "brancy/components/messages/direct/chatComponents/types";
const ReactionEmoji: React.FC<ReactionEmojiProps> = ({ item, direction, chatBox, baseMediaUrl }) => {
  const isLeft = useMemo(() => direction === "left", [direction]);
  const profileSrc = useMemo(
    () => (chatBox?.recp?.profilePic ? `${baseMediaUrl}${chatBox.recp.profilePic}` : "/no-profile.svg"),
    [baseMediaUrl, chatBox?.recp?.profilePic],
  );
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
      {/* Owner Emoji Reaction */}
      {hasOwnerReaction && (
        <div className={emojiReactionClassName} role="img" aria-label={`Owner reaction: ${item.ownerEmojiReaction}`}>
          {item.ownerEmojiReaction}
        </div>
      )}
      {/* Recipient Emoji Reaction */}
      {hasRecpReaction && chatBox?.recp && (
        <div className={emojiReactionClassName} role="img" aria-label={`Recipient reaction: ${item.recpEmojiReaction}`}>
          <img
            className={styles.profilereactionpicture}
            src={profileSrc}
            alt={`${chatBox.recp.username || "User"} profile picture`}
            title={`${chatBox.recp.username || "User"} reaction`}
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />
          {item.recpEmojiReaction}
        </div>
      )}
    </div>
  );
};
export default React.memo(ReactionEmoji, (prevProps, nextProps) => {
  return (
    prevProps.item?.ownerEmojiReaction === nextProps.item?.ownerEmojiReaction &&
    prevProps.item?.recpEmojiReaction === nextProps.item?.recpEmojiReaction &&
    prevProps.direction === nextProps.direction &&
    prevProps.chatBox?.recp?.profilePic === nextProps.chatBox?.recp?.profilePic &&
    prevProps.baseMediaUrl === nextProps.baseMediaUrl
  );
});
