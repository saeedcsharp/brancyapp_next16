import { StatusType } from "brancy/components/confirmationStatus/confirmationStatus";
import { MediaType } from "brancy/models/ApiModels/Instagramer/Page/FirstPostPage";
import { AdsTimeType, AdsType, RejectedType } from "brancy/models/advertise/AdEnums";
import { IAdvertisingTerms } from "brancy/models/advertise/peoperties";

export interface IWatingAds {
  advertiseId: number;
  expiredTime: number;
  adsType: AdsType;
}
export interface IBaseAds {
  adsId: number;
  adsType: AdsType;
  noPost: boolean;
  username: string;
  adsTimeType: AdsTimeType;
}
export interface IUpcomingAds extends IBaseAds {
  upingTime: number;
}
export interface IActiveAds extends IBaseAds {
  expiredTime: number;
}
export interface IRejectedAds extends IBaseAds {
  rejectedTime: number;
  rejectedType: RejectedType;
}

export interface IAdDetail {
  orderDate: number;
  profileUrl: string;
  advertiseId: string;
  username: string;
  fullName: string;
  adType: AdsType;
  duration: AdsTimeType;
  startAdDate: number;
  endAdDate: number;
  fee: number;
  status: number;
  terms: IAdvertisingTerms;
}
export interface IAdReport extends IAdDetail {
  statusType: StatusType;
  view: number;
  likes: number;
  engage: number;
  comments: number;
  share: number;
  impertion: number;
}
export interface IRejectTerms {
  advertiseId: number;
  terms: string[];
  customTerm: string;
  detailType: DetailType;
}

export interface IAdContent {
  medias: IShowMedia[];
  caption: string;
}
export interface IShowMedia {
  media: string;
  mediaUri?: string;
  cover: string;
  coverUri?: string;
  mediaType: MediaType;
  // error: string;
  // tagPeaple: IMediaTag[];
  width: number;
  height: number;
}
export enum DetailType {
  WatingList = 0,
  UpcomingList = 1,
}
