import { t } from "i18next";
import React from "react";
import { LanguageKey } from "brancy/i18n";
import { IItem, IOwnerInbox, IThread } from "brancy/models/messages/IMessage";
import { ItemType } from "brancy/models/messages/enum";
import styles from "./components/messages/direct/directChatBox.module.css";
import { ChatAudio } from "brancy/components/messages/direct/chatComponents/shared/messageTypes/ChatAudio";
import { ChatGeneric } from "brancy/components/messages/direct/chatComponents/shared/messageTypes/ChatGeneric";
import { ChatMedia } from "brancy/components/messages/direct/chatComponents/shared/messageTypes/ChatMedia";
import { ChatMediaShare } from "brancy/components/messages/direct/chatComponents/shared/messageTypes/ChatMediaShare";
import { ChatStoryMention } from "brancy/components/messages/direct/chatComponents/shared/messageTypes/ChatStoryMention";
import { ChatText } from "brancy/components/messages/direct/chatComponents/shared/messageTypes/ChatText";
import { ImageClickInfo, VideoClickInfo } from "brancy/components/messages/direct/chatComponents/types";
interface LeftChatWrapperProps {
  item: IItem;
  chatBox: IThread;
  ownerInbox: IOwnerInbox;
  seenItem: IItem | null;
  lock: boolean;
  baseMediaUrl: string;
  useExternalUrl: boolean;
  onClickSubIcon: (iconId: string, itemId: string) => void;
  onImageContainerClick?: (info: ImageClickInfo) => void;
  onVideoContainerClick?: (info: VideoClickInfo) => void;
  dateFormatToggle: string;
  toggleDateFormat: (itemId: string) => void;
  formatDate: (timestamp: number, itemId: string | null) => string;
  handleFindEmoji: (text: string | null) => string | null;
  getMessageDirectionClass: (text: string | null, baseClass: string) => string;
  handleSpecifyRepliedItemFullName: (itemId: string, repItem: IItem | null) => string;
  handleSpecifyRepliedItemType: (repItemId: string, repItem: IItem | null) => string;
}
export const LeftChatWrapper: React.FC<LeftChatWrapperProps> = (props) => {
  const { item } = props;
  const commonProps = {
    item,
    direction: "left" as const,
    chatBox: props.chatBox,
    ownerInbox: props.ownerInbox,
    baseMediaUrl: props.baseMediaUrl,
    useExternalUrl: props.useExternalUrl,
    onClickSubIcon: props.onClickSubIcon,
    onImageContainerClick: props.onImageContainerClick,
    onVideoContainerClick: props.onVideoContainerClick,
    dateFormatToggle: props.dateFormatToggle,
    toggleDateFormat: props.toggleDateFormat,
    formatDate: props.formatDate,
    handleFindEmoji: props.handleFindEmoji,
    getMessageDirectionClass: props.getMessageDirectionClass,
    handleSpecifyRepliedItemFullName: props.handleSpecifyRepliedItemFullName,
    handleSpecifyRepliedItemType: props.handleSpecifyRepliedItemType,
  };
  const renderMessage = () => {
    switch (item.itemType) {
      case ItemType.Text:
      case ItemType.ReplyStory:
        return <ChatText {...commonProps} />;
      case ItemType.AudioShare:
        return <ChatAudio {...commonProps} />;
      case ItemType.Media:
        return <ChatMedia {...commonProps} />;
      case ItemType.MediaShare:
        return <ChatMediaShare {...commonProps} />;
      case ItemType.StoryMention:
        return <ChatStoryMention {...commonProps} />;
      case ItemType.Generic:
        return <ChatGeneric {...commonProps} />;
      default:
        return null;
    }
  };
  return (
    <>
      {/* نمایش خط "unread messages" */}
      {props.seenItem === item && !props.lock && (
        <div id="unread" className={styles.unread}>
          <div className={styles.unreadline} />
          <div style={{ width: "280px" }}>{t(LanguageKey.unreadmessage)}</div>
          <div className={styles.unreadline} />
        </div>
      )}
      <div className={styles.leftchatrow}>{renderMessage()}</div>
    </>
  );
};
