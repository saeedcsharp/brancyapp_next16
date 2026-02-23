import { StatusReplied } from "brancy/models/messages/enum";
import { IOwnerInbox } from "brancy/models/messages/IMessage";
import { PlatformTicketItemType, PlatformTicketType } from "brancy/models/setting/enums";

export interface ILangauge {
  english: boolean;
  persian: boolean;
  arabic: boolean;
  french: boolean;
  russian: boolean;
  turkey: boolean;
  german: boolean;
  azerbaijani: boolean;
}
export interface ICalendar {
  Gregorian: boolean;
  shamsi: boolean;
  Hijri: boolean;
  Hindi: boolean;
}
export interface IPlatform {
  ownerInbox: IOwnerInbox;
  tickets: IPlatformTicket[];
  nextMaxId: string | null;
}
export interface ITicketInsights {
  actionStatus: StatusReplied;
  count: number;
}
// export interface IOwnerInbox {
//   userId: string
//   name: string
//   profilePic: string
//   followerCount: number
//   followsCount: number
//   mediaCount: number
//   accountType: number
//   website: any
//   biography: any
//   igId: any
//   username: string
// }

export interface IPlatformTicket {
  items: IPlatformItem[];
  fbId: string;
  ticketId: number;
  isPin: boolean;
  createdTime: number;
  actionTime: number;
  rate: number;
  actionStatus: StatusReplied;
  subject: string;
  isHide: boolean;
  fbLastSeenUnix: number;
  adminLastSeenUnix: number;
  unreadCount: number;
  type: PlatformTicketType;
  nextMaxId: string;
  isClosed: boolean;
}

export interface IPlatformItem {
  ticketId: number;
  itemId: string;
  timeStampUnix: number;
  userId: string | null;
  username: string;
  profileUrl: string;
  itemType: PlatformTicketItemType;
  text: string | null;
  imageUrl: string | null;
}
export interface ICreatePlatform {
  subject: string;
  type: PlatformTicketType;
  item: ICreateMedia;
}
export interface ICreateMedia {
  itemType: PlatformTicketItemType;
  text: string;
  imageUrl: string;
}
