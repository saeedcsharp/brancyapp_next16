import { IItem, IOwnerInbox, IThread } from "../../../../models/messages/IMessage";
export type ChatDirection = "left" | "right";
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
export interface BaseChatProps {
  item: IItem;
  direction: ChatDirection;
  chatBox: IThread;
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
  getMessageDirectionClass: (text: string | null, baseClass: string) => string;
  handleSpecifyRepliedItemFullName: (itemId: string, repItem: IItem | null) => string;
  handleSpecifyRepliedItemType: (repItemId: string, repItem: IItem | null) => string;
}
export interface ChatDateProps {
  createdTime: number;
  itemId: string;
  direction: ChatDirection;
  isToggled: boolean;
  onToggle: (itemId: string) => void;
  formatDate: (timestamp: number, itemId: string | null) => string;
}
export interface ReactionEmojiProps {
  item: IItem;
  direction: ChatDirection;
  chatBox: IThread;
  baseMediaUrl: string;
}
export interface MessageStatusProps {
  createdTime: number;
  recpLastSeenUnix: number;
  itemId: string;
  dateFormatToggle: string;
  toggleDateFormat: (itemId: string) => void;
  formatDate: (timestamp: number, itemId: string | null) => string;
}
export interface RepliedMessageProps {
  repliedToItemId: string;
  repliedToItem: IItem | null;
  direction: ChatDirection;
  handleSpecifyRepliedItemFullName: (itemId: string, repItem: IItem | null) => string;
  handleSpecifyRepliedItemType: (repItemId: string, repItem: IItem | null) => string;
}
