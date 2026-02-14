import { CustomDomainStatus, FeatureType } from "./enums";
import { IBanner, IBaseProfile } from "./myLink";

export interface INewLink {
  title: string;
  description: string;
  isBold: boolean;
  expireTime: number;
  type: number;
  customLink: string | null;
  redirectUrl: string;
}
export interface ISaveLink {
  title: string | null;
  description: string;
  isBold: boolean;
  expireTime: number;
  type: number;
  customLink: string | null;
  redirectUrl: string;
}
export interface IUpdateLink extends ISaveLink {
  linkId: number;
}
export interface IUpdateOrderLink {
  items: number[];
}
export interface ILink extends INewLink {
  id: number;
  orderId: number;
  iconUrl: string;
  clickCount: number;
}
export enum PersonalType {
  InstagramProfile = 0,
  CustomeName = 1,
}
export enum BiographyType {
  InstagramProfile = 0,
  CustomBio = 1,
}
export enum DomainType {
  BrancyDefault = 0,
  CustomeName = 1,
}
export interface IOrderFeatures {
  isActiveFeatureBox: boolean;
  orderItems: IFeatureItem[];
}
export interface IFeatureItem {
  featureType: FeatureType;
  isActive: boolean;
}
export interface IUpdateFeatureOrder {
  orderItems: IFeatureItem[];
}
export interface IQuestion {
  id: string;
  question: string;
  answer: string;
  instagramerId: number;
  orderId: number;
}
export interface IUpdateFAQ {
  items: { id?: string; question: string; answer: string }[];
}
export interface IAnnouncementInfo {
  str: string;
  lastUpdate: number;
  instagramerId: number;
}

export interface ICantactMap extends IUpdateContactMap {
  instagramerId: number;
  lastUpdate: number;
}
export interface IUpdateContactMap {
  phoneNumber: string | null;
  email: string;
  address: string;
  lat: number;
  lng: number;
  showMap: boolean;
  isActiveSaveContact: boolean;
}
export interface IProfileBanner {
  customFullName: IProfileBannerCustomeFullName;
  customCaption: IProfileBannerCustomCaption;
}
export interface IProfileBannerCustomeFullName {
  fullName: string;
  lastUpdate: number;
  instagramerId: number;
  isActive: boolean;
}
export interface IProfileBannerCustomCaption {
  instagramerId: number;
  caption: string;
  isActive: boolean;
  lastUpdate: number;
}
export interface IBannerInfo {
  banners: IBanner[];
  profile: IBaseProfile;
}
export interface ICustomeBannerInfo {
  items: {
    url: string;
    base64Url: string;
    bannerType: number;
  }[];
}
export interface IBannerSelectedImage {
  id1: string | null;
  id2: string | null;
  id3: string | null;
  imgStr1: string | null;
  imgStr2: string | null;
  imgStr3: string | null;
  imgUrl1: string | null;
  imgUrl2: string | null;
  imgUrl3: string | null;
}
export interface IUpdateProfileBanner {
  customFullName: {
    isActive: boolean;
    fullName: string;
  };
  customCaption: {
    isActive: boolean;
    caption: string;
  };
}
export interface IUpdateBanner {
  items: {
    imageUri: string | null;
    uploadImageUrl: string | null;
  }[];
}
export interface IChannelInfo {
  channelTitle: string;
  channelId: string;
  lastVideoTitle: string | null;
  lastPublishTime: number | null;
  channelUsername: string | null;
  profilePicture: string | null;
  lastVideoThumbnail: string | null;
}
export interface ISearchChannel {
  activeYoutube: boolean;
  activeAparat: boolean;
  activeTwitch: boolean;
  embedYoutube: boolean;
  embedAparat: boolean;
  embedTwitch: boolean;
  searchYoutubePage: string;
  searchAparatPage: string;
  searchTwitchPage: string;
  youTubeThumbnailUrl: string;
  twitchThumbnailUrl: string;
  aparatThumbnailUrl: string;
}
export interface IUpdateChannel {
  id: string | null;
  username: string | null;
  embedVideo: boolean;
  isActive: boolean;
}

export interface IChannel {
  youtubeChannel: IChannelBody | null;
  aparatChannel: IChannelBody | null;
  twitchChannel: IChannelBody | null;
}
export interface IChannelBox {
  peopleLocked: boolean;
  showAddPeapleBox: boolean;
  channelInfo: IChannelInfo[];
  loading: boolean;
  notFound: boolean;
}
export interface IChannelBody {
  video: IChannelContent | null;
  live: IChannelContent | null;
  embedVideo: boolean;
  isActive: boolean;
  id: string;
}
export interface IChannelContent {
  filterThumbnailMediaUrl: string;
  thumbnailMediaUrl: string;
  title: string;
  descryption: string;
  frameUrl: string;
  reDirectUrl: string;
  channelTitle: string;
}
export interface ICustomeDomainInfo {
  instagramerId: number;
  lastUpdate: number;
  createdTime: number;
  url: string;
  isActive: boolean;
  status: CustomDomainStatus;
}
