import { IItem, IOwnerInbox, IThread_Ticket } from "brancy/models/messages/IMessage";
import { ITicket } from "brancy/models/userPanel/message";
export type ChatDirection = "left" | "right" | "system";
export interface ImageClickInfo {
  url: string;
  height: number;
  width: number;
}
export interface VideoClickInfo {
  url: string;
  height: number;
  width: number;
  isExpired: boolean;
}
export interface TicketBaseChatProps {
  item: IItem;
  direction: ChatDirection;
  chatBox: IThread_Ticket | ITicket;
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
export interface TicketChatDateProps {
  createdTime: number;
  itemId: string;
  direction: ChatDirection;
  isToggled: boolean;
  onToggle: (itemId: string) => void;
  formatDate: (timestamp: number, itemId: string | null) => string;
}
export interface TicketReactionEmojiProps {
  item: IItem;
  direction: ChatDirection;
  baseMediaUrl: string;
  chatBox: IThread_Ticket | ITicket;
}
export interface TicketMessageStatusProps {
  createdTime: number;
  recpLastSeenUnix?: number;
  userLastSeenUnix?: number;
  itemId: string;
  dateFormatToggle: string;
  toggleDateFormat: (itemId: string) => void;
  formatDate: (timestamp: number, itemId: string | null) => string;
}
export interface TicketRepliedMessageProps {
  repliedToItemId: string;
  repliedToItem: IItem | null;
  direction: ChatDirection;
  handleSpecifyRepliedItemFullName: (itemId: string, repItem: IItem | null) => string;
  handleSpecifyRepliedItemType: (repItemId: string, repItem: IItem | null) => string;
}
