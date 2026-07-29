import React from "react";
import styles from "brancy/components/messages/direct/directChatBox.module.css";
import { ChatAudio } from "brancy/components/messages/direct/chatComponents/shared/messageTypes/ChatAudio";
import { ChatGeneric } from "brancy/components/messages/direct/chatComponents/shared/messageTypes/ChatGeneric";
import { ChatMedia } from "brancy/components/messages/direct/chatComponents/shared/messageTypes/ChatMedia";
import { ChatMediaShare } from "brancy/components/messages/direct/chatComponents/shared/messageTypes/ChatMediaShare";
import { ChatStoryMention } from "brancy/components/messages/direct/chatComponents/shared/messageTypes/ChatStoryMention";
import { ChatText } from "brancy/components/messages/direct/chatComponents/shared/messageTypes/ChatText";
import { ItemType } from "brancy/models/enums";
import {
  IDirectMessageItem,
  IThread,
  IDirectOwnerInbox,
  ImageClickInfo,
  VideoClickInfo,
} from "brancy/models/interfaces";
interface RightChatWrapperProps {
  item: IDirectMessageItem;
  chatBox: IThread;
  ownerInbox: IDirectOwnerInbox;
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
  handleSpecifyRepliedItemFullName: (itemId: string, repItem: IDirectMessageItem | null) => string;
  handleSpecifyRepliedItemType: (repItemId: string, repItem: IDirectMessageItem | null) => string;
}
export const RightChatWrapper: React.FC<RightChatWrapperProps> = (props) => {
  const { item } = props;
  const commonProps = {
    item,
    direction: "right" as const,
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
  return <div className={styles.rightchatrow}>{renderMessage()}</div>;
};
