import { PlatformTicketItemType } from "../setting/enums";

export interface IOwnerInbox {
  userId: string;
  name: string | null;
  profilePic: string;
  followerCount: number;
  followsCount: number;
  mediaCount: number;
  accountType: number;
  igId: string | null;
  username: string | null;
}

export interface IItem {
  ticketId: number;
  itemId: string;
  timeStampUnix: number;
  sentByFb: boolean;
  itemType: ITicketMediaType;
  text: string;
  imageUrl: string | null;
  audioUrl?: { url: string; externalUrl: string } | null;
}

export interface ITicket {
  items: IItem[];
  userId: number;
  fbId: string;
  ticketId: number;
  isPin: boolean;
  createdTime: number;
  actionTime: number;
  actionStatus: number;
  isSatisfied: boolean;
  subject: string;
  isHide: boolean;
  fbLastSeenUnix: number;
  followerCount: number;
  fullName: string | null;
  userLastSeenUnix: number;
  username: string | null;
  unreadCount: number;
  profileUrl: string;
  nextMaxId: string | null;
  reportTimeToAdmin: number | null;
  reportedToAdmin: boolean;
  instagramerId: number;
  phoneNumber: string;
}
export interface ITicketPushNotif {
  Items: IItem[];
  UserId: number;
  FbId: string;
  TicketId: number;
  IsPin: boolean;
  CreatedTime: number;
  ActionTime: number;
  ActionStatus: number;
  IsSatisfied: boolean;
  Subject: string;
  IsHide: boolean;
  FbLastSeenUnix: number;
  FollowerCount: number;
  FullName: string | null;
  UserLastSeenUnix: number;
  Username: string | null;
  UnreadCount: number;
  ProfileUrl: string;
  NextMaxId: string | null;
  ReportTimeToAdmin: number | null;
  ReportedToAdmin: boolean;
  InstagramerId: number;
  PhoneNumber: string;
}

export interface IUserPanelMessage {
  ownerInbox: IOwnerInbox;
  tickets: ITicket[];
  nextMaxId: string | null;
}
export interface ISendTicketMessage {
  itemType: ITicketMediaType | PlatformTicketItemType;
  text: string | null;
  imageBase64: string | null;
  ticketId: number;
  file: File | null;
  clientContext: string;
}
export enum ITicketMediaType {
  Text = 0,
  Image = 1,
}
export interface ICreateSystemTicket {
  text: string | null;
  imageUrl: string | null;
  itemType: ITicketMediaType;
}
