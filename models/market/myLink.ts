import { BusinessDay, FeatureType } from "./enums";
export interface IFeatureInfo {
  featureType: FeatureType;
  orderId: number;
  title: string;
  isActive: boolean;
}
export interface IFeatureResult {
  features: IFeatureInfo;
  checkBox: boolean;
}
export interface IClientBanner {
  banners: IBanner[];
  profile: IBaseProfile;
  caption: {
    caption: string;
    instagramerId: number;
  } | null;
}
export interface IBaseProfile {
  profileUrl: string;
  username: string;
  fullName: string;
}
export interface IFeatureBox {
  followers: number;
  workHours: IBusinessHour[] | null;
  rate: number | null;
  enemad: string;
  terms: string[] | null;
  teriif: IInfluencerTeriffe | null;
  adsView: number | null;
  salesSuccess: number | null;
  isShopper: boolean;
  isInfluencer: boolean;
}
export interface IClientAnnouncement extends IFeatureInfo {
  profileUrl: string;
  text: string;
  name: string;
  createdDate?: number; // timestamp
}
export interface IReviews extends IFeatureInfo {
  reviews: IReview[];
}
export interface IOnlineStreaming extends IFeatureInfo {
  onlineStream: ILiveChannel | null;
}
export interface ILastVideo extends IFeatureInfo {
  lastVideo: IVideoChannel | null;
}
export interface IProducts extends IFeatureInfo {}
export interface ITimeline extends IFeatureInfo {}
export interface IFaq extends IFeatureInfo {
  faqs: IFaqServer[];
}
export interface ILink extends IFeatureInfo {
  links: IServerLink[];
}
export interface IContactAndMap extends IFeatureInfo {
  contact: IContact;
}
export interface IMyLink {
  // url:string,
  // userHost:string,
  // headers:string[],
  //  featureBox: IFeatureBox | null;
  announcement: IClientAnnouncement | null;
  reviews: IReviews | null;
  onlineStreaming: IOnlineStreaming;
  lastVideo: ILastVideo;
  products: IProducts | null;
  timeline: ITimeline | null;
  faq: IFaq | null;
  link: ILink | null;
  contactAndMap: IContactAndMap | null;
  orderItems: IOrderItems;
}
export interface IBusinessHour {
  dayName: BusinessDay;
  timerInfo: ITimerInfo | null;
}
export interface ITimerInfo {
  startTime: number;
  endTime: number;
}
export interface IVideoChannel {
  youtubeChannel: IVideoBodyChannel | null;
  aparatChannel: IVideoBodyChannel | null;
  twitchChannel: IVideoBodyChannel | null;
}
export interface IVideoBodyChannel {
  video: IChannelContent | null;
  embedVideo: boolean;
}
export interface ILiveChannel {
  youtubeChannel: ILiveBodyChannel | null;
  aparatChannel: ILiveBodyChannel | null;
  twitchChannel: ILiveBodyChannel | null;
}
export interface ILiveBodyChannel {
  live: IChannelContent | null;
  embedVideo: boolean;
}
export interface IClientChannelContent {
  filterThumbnailMediaUrl: string;
  thumbnailMediaUrl: string;
  title: string;
  descryption: string;
  frameUrl: string;
  reDirectUrl: string;
}

export { BusinessDay };

// server models//

export interface IInstagramer {
  username: string;
  fullname: string;
  pk: number;
  profileUrl: string;
  isShopper: boolean;
  isInfluencer: boolean;
  followerCount: number;
}
export interface IContact {
  phoneNumber: string;
  countryCode: number;
  email: string;
  address: string;
  lat: number;
  lng: number;
  showMap: boolean;
}
export interface IServerLink {
  id: number;
  orderId: number;
  title: string;
  description: string;
  redirectUrl: string;
  isBold: boolean;
  expireTime: number;
  type: number;
  iconUrl: string;
}
export interface IWorkHourItem {
  weekDay: number;
  beginTime: number;
  endTime: number;
}
export interface IInfluencerTeriffe {
  today12HPost: number;
  today24HPost: number;
  today12HStory: number;
  today24HStory: number;
  basic12HPost: number;
  basic24HPost: number;
  basic12HStory: number;
  basic24HStory: number;
  campaign24HPost: number;
  campaign24HStory: number;
  lastUpdate: number;
}
export interface IAnnouncement {
  str: string;
}
export interface IReview {
  profileUrl: string;
  username: string;
  str: string;
}
export interface IChannel {
  youtubeChannel: IChannelBody | null;
  aparatChannel: IChannelBody | null;
  twitchChannel: IChannelBody | null;
}
export interface IChannelBody {
  video: IChannelContent | null;
  live: IChannelContent | null;
  embedVideo: boolean;
}
export interface IChannelContent {
  filterThumbnailMediaUrl: string;
  thumbnailMediaUrl: string;
  title: string;
  descryption: string;
  frameUrl: string;
  reDirectUrl: string;
}
export interface IFaqServer {
  question: string;
  answer: string;
  orderId: number;
}
export interface IBanner {
  url: string;
  orderId: number;
}
export interface ICaption {
  caption: string;
}
export interface IOrderItems {
  isActiveFeatureBox: boolean;
  orderItems: {
    featureType: FeatureType;
    orderId: number;
    isActive: boolean;
  }[];
}

export interface ISmartLink {
  instagramer: IInstagramer;
  contact: IContact;
  links: IServerLink[];
  workHourItems: IWorkHourItem[] | null;
  influencerTeriffe: IInfluencerTeriffe | null;
  announcement: IAnnouncement;
  reviews: IReview[];
  channel: IChannel;
  faqs: IFaqServer[];
  banners: IBanner[];
  caption: ICaption;
  featureOrders: IOrderItems;
  terms: string[] | null;
  // url:string;
  // userHost:string;
  // headers:string[];
}
