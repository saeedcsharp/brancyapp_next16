import { t } from "i18next";
import React, { useMemo } from "react";
import { LanguageKey } from "brancy/i18n";
import { IItem, IOwnerInbox, IThread_Ticket } from "brancy/models/messages/IMessage";
import { ItemType } from "brancy/models/messages/enum";
import styles from "brancy/components/messages/ticket/ticketChatBox.module.css";
import { TicketChatAudio } from "brancy/components/messages/ticket/chatComponents/shared/messageTypes/TicketChatAudio";
import { TicketChatMedia } from "brancy/components/messages/ticket/chatComponents/shared/messageTypes/TicketChatMedia";
import { TicketChatMediaShare } from "brancy/components/messages/ticket/chatComponents/shared/messageTypes/TicketChatMediaShare";
import { TicketChatText } from "brancy/components/messages/ticket/chatComponents/shared/messageTypes/TicketChatText";
import { ImageClickInfo, VideoClickInfo } from "brancy/components/messages/ticket/chatComponents/types";

interface LeftChatWrapperProps {
  item: IItem;
  chatBox: IThread_Ticket;
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
  handleSpecifyRepliedItemFullName: (itemId: string, repItem: IItem | null) => string;
  handleSpecifyRepliedItemType: (repItemId: string, repItem: IItem | null) => string;
}

export const LeftChatWrapper: React.FC<LeftChatWrapperProps> = React.memo((props) => {
  const { item } = props;

  const commonProps = useMemo(
    () => ({
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
    ]
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

  return (
    <>
      {props.seenItem === item && !props.lock && (
        <div id="unread" className={styles.unread}>
          <div
            style={{
              width: "100%",
              border: "1px solid var(--color-gray30)",
              height: "1px",
              boxSizing: "border-box",
            }}
          />
          <div style={{ width: "280px" }}>{t(LanguageKey.unreadmessage)}</div>
          <div
            style={{
              width: "100%",
              border: "1px solid var(--color-gray30)",
              height: "1px",
              boxSizing: "border-box",
            }}
          />
        </div>
      )}
      <div className={styles.leftchatrow}>{renderMessage}</div>
    </>
  );
});
