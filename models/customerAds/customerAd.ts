import { AdsTimeType, AdsType } from "../advertise/AdEnums";
import { IBusinessHour } from "../advertise/peoperties";
import { IReview } from "../market/myLink";
import { IPostContent } from "../page/post/posts";
import { IImageMedia, MediaType } from "../page/post/preposts";

export interface FilterProps {
  title: FilterNames;
  options: React.ReactNode[];
}
export interface ISideBar {
  sortBy: SortByNum;
  category: ICategory;
  price: {
    min: number;
    max: number;
  };
  rating: {
    min: number;
    max: number;
  };
  followers: {
    min: number;
    max: number;
  };
}
export interface ICategory {
  teck: boolean;
  life: boolean;
  game: boolean;
  fashion: boolean;
}
export interface ICustomer {
  checkStatus: CheckStatus;
  customerAdId: number;
  adType: AdsType;
  adTimeType: AdsTimeType;
  adTime: number;
  confirmedTime: number | null;
  advertisers: IAdvertiserStatus[];
  isCampaign: boolean;
}
export interface IAdvertiserStatus extends IAdvertiseSummary {
  satus: AdvertiserStatus;
  terms: string;
}
export interface IAdvertiseSummary {
  asvertiseId: number;
  profileUrl: string;
  username: string;
  fullName: string;
  price: number;
}
export interface ICardAdvertiser extends IAdvertiseSummary {
  follower: number;
  following: number;
  postCount: number;
  rating: number;
  reach: number;
  engage: number;
  terms: string;
}
export interface IFullAdvertiser {
  userProfile: ICardAdvertiser;
  terms: string[];
  businessHour: IBusinessHour[];
  reviews: IReview[];
  posts: IPostContent[];
}
export interface IAdvertiserInfo {
  advertisers: ICardAdvertiser[];
  totalAdsCount: number;
}
export interface IShowMedia {
  media: string;
  mediaUri?: string;
  cover: string;
  coverUri?: string;
  mediaType: MediaType;
  error: string;
  tagPeaple: IMediaTag[];
  width: number;
  height: number;
}
export interface IMediaTag {
  Username: string;
  Pk: number;
  X: number;
  Y: number;
}
export interface ICreateCustomerAdPost {
  mediaType: MediaType;
  image: IImageMedia;
  video: IImageMedia;
  carousel: IImageMedia[];
  caption: string;
}
export interface IPageInfo {
  pk: number;
  profilePicUrl: string;
  userName: string;
  fullName: string;
  isVerified: boolean;
  isPrivate: boolean;
}
export interface IPaymentInfo {
  success: boolean;
  transactionNumber: string;
  orderCode: string;
}
export type FilterNames = "filter1" | "filter2" | "filter3" | "filter4" | "filter5" | "filter6";
export enum AdvertiserStatus {
  Verified = 0,
  Rejected = 1,
  Pending = 2,
}
export enum CategoryType {
  Tech = 0,
  Life = 1,
  Game = 2,
  Fashion = 3,
}
export enum SortBy {
  All = "all",
  OnlyVerified = "only verified",
  Price = "price",
  Follower = "follower",
  Rating = "rating",
  Reach = "reach",
  Engagement = "engagement",
}
export enum SortByNum {
  All = 0,
  OnlyVerified = 1,
  PriceUpToDown = 2,
  PriceDownToUp = 3,
  FollowerUpToDown = 4,
  FollowerDownToUp = 5,
  Rating = 6,
  Reach = 7,
  Engagement = 8,
}
export enum SortUp {
  UpToDown = 0,
  DownToUp = 1,
}
export enum Steps {
  Terms = 0,
  Specification = 1,
  Content = 2,
  Summary = 3,
  Confirmation = 4,
  Payment = 5,
  Publishing = 6,
  Final = 7,
  Final2 = 8,
}
export enum CheckStatus {
  Checking = 0,
  Verified = 1,
  Rejected = 2,
}
export enum SelectedCardContent {
  UserProfile = 0,
  Terms = 1,
  BusinessHours = 2,
  Reviews = 3,
}
