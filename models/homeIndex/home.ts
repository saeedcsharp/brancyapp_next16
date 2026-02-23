import { t } from "i18next";
import { LanguageKey } from "brancy/i18n";
import { ItemType, MediaProductType } from "brancy/models/messages/enum";
import { EntryType, TopTileType } from "brancy/models/homeIndex/enum";

// const { t } = useTranslation();
export type ILastMessage = {
  directItemType: ItemType;
  directMediaType: MediaProductType | null;
  entryType: EntryType;
  mediaUrl: string | null;
  message: string | null;
  profileUrl: string;
  relativeUrl: string;
  timeStampUnix: number;
  username: string;
};
export interface IHomeHeader {
  profileUrl: string;
  followerNotif: number;
  likerNotif: number;
  messageNotif: number;
}
export type IHomeInfo = {
  messages: ILastMessage[];
  likers: ILastLike[];
  followers: ILastFollower[];
  homeHeader: IHomeHeader;
  tiles: IInstagramerHomeTiles;
};
export interface IInstagramerHomeTiles {
  items: IInstagramerHomeTileItem[];
  followerCount: number;
  followingCount: number;
  mediaCount: number;
}
export interface IInstagramerHomeTileItem {
  title: string;
  redirectUrl?: string;
  value: string;
  subValue: string;
  thumbnailMediaUrl: string;
  topTileType: TopTileType;
}
export interface IDemographicInsight {
  followerAge: IFollowerAge[];
  followerGender: IFollowerGender[];
  followerCountry: IFollowerCountry[];
  followerCity: IFollowerCity[];
}
export interface IFollowerGender {
  instagramerId: number;
  count: number;
  type: number;
}
export interface IFollowerAge {
  from: number;
  to: number;
  instagramerId: number;
  count: number;
}
export interface IFollowerCountry extends IFollowerCity {
  code: string;
}
export interface IFollowerCity {
  instagramerId: number;
  count: number;
  name: string;
}
export type IIngageInfo = {
  value: string | null;
  className: string;
  name: string;
  postUrl: string;
};
export type ILastFollower = {
  createdTime: number;
  fullName: string;
  username: string;
  date: string;
  profileUrl: string;
};
export type ILastLike = {
  profileUrl: string;
  postUrl: string;
  username: string;
  pk: number;
  fullName: string;
  postId: number;
};

export type ILastOrder = {
  username: string;
  profileUrl: string;
  fullName: string;
  orderPrice: string;
  orderId: string;
  date: string;
  orderUrl: string;
};
export type ILastTransaction = {
  transactionPaymentId: string;
  transactionDate: string;
  transactionPrice: string;
  income: boolean;
};
export interface IPageSummary {
  instagramerId: number;
  summary: string;
  createdTime: number;
}
export interface InitialSetupState {
  language: string;
  calendar: string;
  theme: string;
}
export default function entryTypeToStr(entryType: EntryType) {
  switch (entryType) {
    case EntryType.Direct:
      return t(LanguageKey.navbar_Direct);
    case EntryType.Comment:
      return t(LanguageKey.navbar_Comments);
    case EntryType.Ticket:
      return t(LanguageKey.navbar_Ticket);
    default:
      return t(LanguageKey.Unknown);
  }
}
