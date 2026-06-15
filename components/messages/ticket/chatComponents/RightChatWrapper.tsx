import React, { useMemo } from "react";
import styles from "brancy/components/messages/ticket/ticketChatBox.module.css";
import { TicketChatAudio } from "brancy/components/messages/ticket/chatComponents/shared/messageTypes/TicketChatAudio";
import { TicketChatMedia } from "brancy/components/messages/ticket/chatComponents/shared/messageTypes/TicketChatMedia";
import { TicketChatMediaShare } from "brancy/components/messages/ticket/chatComponents/shared/messageTypes/TicketChatMediaShare";
import { TicketChatText } from "brancy/components/messages/ticket/chatComponents/shared/messageTypes/TicketChatText";
import { ImageClickInfo, VideoClickInfo } from "brancy/components/messages/ticket/chatComponents/types";
import { IDirectMessageItem, IDirectOwnerInbox, IThread_Ticket } from "brancy/models/interfaces";
import { ItemType } from "brancy/models/enums";

interface RightChatWrapperProps {
  item: IDirectMessageItem;
  chatBox: IThread_Ticket;
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
  handleSpecifyRepliedItemFullName: (itemId: string, repItem: IDirectMessageItem | null) => string;
  handleSpecifyRepliedItemType: (repItemId: string, repItem: IDirectMessageItem | null) => string;
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
