import { BrowserType, DeviceType, OsType } from "brancy/models/setting/enums";
import { LoginStatus } from "brancy/models/_AccountInfo/LoginStatus";

export interface InstagramerAccountInfo {
  loginStatus: LoginStatus;
  isVerified: boolean;
  isPrivate: boolean;
  isBusiness: boolean;
  isShopperOrInfluencer: boolean;
  pk: number;
  isShopper: boolean;
  isInfluencer: boolean;
  profileUrl: string;
  username: string;
  packageExpireTime: number;
  fullName: string;
  hasPackage: boolean;
  loginByFb: boolean;
  loginByInsta: boolean;
  roles: PartnerRole[];
  isPartner: boolean;
  instagramerIds: number[];
  commentPermission: boolean;
  insightPermission: boolean;
  messagePermission: boolean;
  publishPermission: boolean;
  website: string | null;
  biography: string | null;
}
export interface IRefreshToken {
  id: number;
  role: {
    userId: number;
    instagramerIds: number[];
    isPartners: boolean[];
    isInstagramer: boolean;
  };
  token: string;
  socketAccessToken: string;
  expireTime: number;
}
export interface ILoadingStatus {
  notShopper: boolean;
  notBusiness: boolean;
  loading: boolean;
  notPassword: boolean;
  ok: boolean;
  notFeature: boolean;
  notBasePackage: boolean;
  notLoginByFb: boolean;
}
export interface ISession {
  createdTime: number;
  sessionId: string;
  countryCode: string;
  userId: number;
  isCurrent: boolean;
  expireTime: number;
  osType: OsType;
  deviceType: DeviceType;
  browserType: BrowserType;
}
export interface IPartner {
  approved: boolean;
  rejected: boolean;
  createdTime: number;
  updateTime: number;
  userId: number;
  instagramerId: number;
  pk: string;
  id: string;
  expireTime: number | null;
  roles: PartnerRole[];
  phoneNumber: string;
  countryCode: string;
  name?: string;
}
export interface ICreatePartner {
  phoneNumber: string;
  countryCode: string;
  expireTime: number | null;
  roles: PartnerRole[];
  name?: string;
}
export interface IUpdatePartner {
  expireTime: number | null;
  roles: PartnerRole[];
  userId: number;
  name?: string;
}
export interface IError {
  message: string | null;
}
export enum PartnerRole {
  Message,
  Comment,
  PageView,
  Transaction,
  Ads,
  Orders,
  Bio,
  Publish,
  SystemTicket,
  Products,
  Automatics,
}
