import React, { useMemo } from "react";
import { IItem, IOwnerInbox, ITicket, ITicketMediaType } from "brancy/models/userPanel/message";
import styles from "brancy/components/messages/ticket/ticketChatBox.module.css";
import { SystemChatImage } from "brancy/components/messages/ticket/chatComponents/shared/messageTypes/SystemChatImage";
import { SystemChatText } from "brancy/components/messages/ticket/chatComponents/shared/messageTypes/SystemChatText";
import { ImageClickInfo, VideoClickInfo } from "brancy/components/messages/ticket/chatComponents/types";

interface SystemChatWrapperProps {
  item: IItem;
  chatBox: ITicket;
  ownerInbox: IOwnerInbox;
  baseMediaUrl: string;
  onImageContainerClick?: (info: ImageClickInfo) => void;
  onVideoContainerClick?: (info: VideoClickInfo) => void;
  dateFormatToggle: string;
  toggleDateFormat: (itemId: string) => void;
  formatDate: (timestamp: number, itemId: string | null) => string;
  handleFindEmoji: (text: string | null) => string | null;
}

export const SystemChatWrapper: React.FC<SystemChatWrapperProps> = React.memo((props) => {
  const { item } = props;

  const commonProps = useMemo(
    () => ({
      item,
      direction: "system" as const,
      chatBox: props.chatBox,
      ownerInbox: props.ownerInbox,
      baseMediaUrl: props.baseMediaUrl,
      onImageContainerClick: props.onImageContainerClick,
      onVideoContainerClick: props.onVideoContainerClick,
      dateFormatToggle: props.dateFormatToggle,
      toggleDateFormat: props.toggleDateFormat,
      formatDate: props.formatDate,
      handleFindEmoji: props.handleFindEmoji,
    }),
    [
      item,
      props.chatBox,
      props.ownerInbox,
      props.baseMediaUrl,
      props.onImageContainerClick,
      props.onVideoContainerClick,
      props.dateFormatToggle,
      props.toggleDateFormat,
      props.formatDate,
      props.handleFindEmoji,
    ],
  );

  const renderMessage = useMemo(() => {
    switch (item.itemType) {
      case ITicketMediaType.Text:
        return <SystemChatText {...commonProps} />;
      case ITicketMediaType.Image:
        return <SystemChatImage {...commonProps} />;
      default:
        return null;
    }
  }, [item.itemType, commonProps]);

  return <div className={styles.rightchatrow}>{renderMessage}</div>;
});
