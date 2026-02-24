import React, { useMemo } from "react";
import { IItem, IOwnerInbox, IThread_Ticket } from "brancy/models/messages/IMessage";
import { ItemType } from "brancy/models/messages/enum";
import styles from "brancy/components/messages/ticket/ticketChatBox.module.css";
import { TicketChatAudio } from "brancy/components/messages/ticket/chatComponents/shared/messageTypes/TicketChatAudio";
import { TicketChatMedia } from "brancy/components/messages/ticket/chatComponents/shared/messageTypes/TicketChatMedia";
import { TicketChatMediaShare } from "brancy/components/messages/ticket/chatComponents/shared/messageTypes/TicketChatMediaShare";
import { TicketChatText } from "brancy/components/messages/ticket/chatComponents/shared/messageTypes/TicketChatText";
import { ImageClickInfo, VideoClickInfo } from "brancy/components/messages/ticket/chatComponents/types";

interface RightChatWrapperProps {
  item: IItem;
  chatBox: IThread_Ticket;
  ownerInbox: IOwnerInbox;
  baseMediaUrl: string;
  useExternalUrl: boolean;
  onClickSubIcon: (iconId: string, itemId: string) => void;
  onImageContainerClick?: (info: ImageClickInfo) => void;
  onVideoContainerClick?: (info: VideoClickInfo) => void;
  dateFormatToggle: string;
  toggleDateFormat: (itemId: string) => void;
  formatDate: (timestamp: number, itemId: string | null) => string;
  handleFindEmoji: (text: string | null) => string | null;
  handleSpecifyRepliedItemFullName: (itemId: string, repItem: IItem | null) => string;
  handleSpecifyRepliedItemType: (repItemId: string, repItem: IItem | null) => string;
}

export const RightChatWrapper: React.FC<RightChatWrapperProps> = React.memo((props) => {
  const { item } = props;

  const commonProps = useMemo(
    () => ({
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
      handleSpecifyRepliedItemFullName: props.handleSpecifyRepliedItemFullName,
      handleSpecifyRepliedItemType: props.handleSpecifyRepliedItemType,
    }),
    [
      item,
      props.chatBox,
      props.ownerInbox,
      props.baseMediaUrl,
      props.useExternalUrl,
      props.onClickSubIcon,
      props.onImageContainerClick,
      props.onVideoContainerClick,
      props.dateFormatToggle,
      props.toggleDateFormat,
      props.formatDate,
      props.handleFindEmoji,
      props.handleSpecifyRepliedItemFullName,
      props.handleSpecifyRepliedItemType,
    ],
  );

  const renderMessage = useMemo(() => {
    switch (item.itemType) {
      case ItemType.Text:
      case ItemType.ReplyStory:
        return <TicketChatText {...commonProps} />;
      case ItemType.AudioShare:
        return <TicketChatAudio {...commonProps} />;
      case ItemType.Media:
        return <TicketChatMedia {...commonProps} />;
      case ItemType.MediaShare:
        return <TicketChatMediaShare {...commonProps} />;
      default:
        return null;
    }
  }, [item.itemType, commonProps]);

  return <div className={styles.rightchatrow}>{renderMessage}</div>;
});
