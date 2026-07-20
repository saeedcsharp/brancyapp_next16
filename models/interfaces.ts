// ============================================================
// CENTRALIZED INTERFACES FILE
// All interfaces and type aliases from the models folder are consolidated here.
// Organized by region/domain for easy navigation.
// ============================================================

import {
  ActionType,
  AdsTimeType,
  AdsType,
  AdvertiserStatus,
  AiTextModel,
  AiVoiceModel,
  AutoReplyPayLoadType,
  AvailabilityStatus,
  BrowserType,
  BusinessDay,
  BusinessFilterNumberType,
  BusinessType,
  CategorySection,
  CheckStatus,
  CustomDomainStatus,
  DetailType,
  DeviceType,
  EntryType,
  ErrorPrePostType,
  FailLotteryStatus,
  FeatureType,
  FollowerLotteryType,
  GauranteeLength,
  GauranteeStatus,
  ITicketMediaType,
  ItemType,
  LoginStatus,
  LogisticType,
  LotteryGroupType,
  LotteryStatus,
  LotteryType,
  MarketAdsType,
  MarketType,
  MediaProductType,
  MediaType,
  MessageLanguage,
  OrderProcedure,
  OrderProcedureStatus,
  OrderStep,
  OrderType,
  OrginalityStatus,
  OsType,
  ParcelPocketDeliveryType,
  PartnerRole,
  PayloadType,
  PlatformTicketItemType,
  PlatformTicketType,
  ProductSortType,
  PromptType,
  PsgFeatureType,
  PushResponseType,
  RegisterType,
  RejectedType,
  ShippingRequestType,
  SortByNum,
  SpecialPayLoad,
  StatusReplied,
  StoreLanguage,
  TermsType,
  ToolType,
  TopTileType,
  UploadPostSteps,
} from "./enums";

import { StatusType } from "brancy/components/confirmationStatus/confirmationStatus";
import { PriceType } from "brancy/components/priceFormater";

// #region _AccountInfo
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

export interface IVerifyCode {
  instagramerId: number;
  origin: string;
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
// #endregion _AccountInfo

// #region ApiModels
export interface FirstPostPage {
  Posts: PagePost[];
  PrePosts: PagePrePost[];
}

export interface PagePost {
  PostId: number;
  MediaUrl: string;
  MediaType: MediaType;
  LikeCount: number;
  CommentCount: number | null;
  SaveCount: number | null;
  ShareCount: number | null;
  NewCommentCount: number;
  MextUnSeenCommentId: number | null;
  Pk: number;
}

export interface PagePrePost {
  PrePostId: number;
  MediaUrl: string;
  MediaType: MediaType;
  UpingTime: number;
}

export interface LoginResultInfo {
  token: string;
  role: UserRoll;
  id: number;
  socketAccessToken: string;
}

export interface UserRoll {
  instagramerIds: number[];
  shopperIds: number[];
  isPostBudget: boolean;
  isPostPeyk: boolean;
  fbIds: string[];
}

export interface SendCodeResult {
  token: string;
}
// #endregion ApiModels

// #region Advertise
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
  medias: IAdShowMedia[];
  caption: string;
}

/** Was IShowMedia in advertise/adList.ts */
export interface IAdShowMedia {
  media: string;
  mediaUri?: string;
  cover: string;
  coverUri?: string;
  mediaType: MediaType;
  width: number;
  height: number;
}

export interface IAdvertisingTerms {
  term1: string;
  activeTerm1: boolean;
  term2: string;
  activeTerm2: boolean;
  term3: string;
  activeTerm3: boolean;
  term4: string;
  activeTerm4: boolean;
}

export interface ITariff {
  todayTariff: IPriceNonCamp;
  basicTariif: IPriceNonCamp;
  campaign: IPriceCamp;
}

export interface IEditTariff {
  todayPostSemiDay: string;
  todayPostFullDay: string;
  todayStorySemiDay: string;
  todayStoryFullDay: string;
  basicPostSemiDay: string;
  basicPostFullday: string;
  basicStorySemiDay: string;
  basicStoryFullDay: string;
  campaignPostFullDay: string;
  campaignStoryFullDay: string;
}

export interface IBusinessHour {
  dayName: BusinessDay;
  timerInfo: ITimerInfo | null;
}

export interface IActiveBusinessHour {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface INotifications {
  sms: boolean;
  email: boolean;
  systemNotification: boolean;
  instagramDirect: boolean;
  systemMessage: boolean;
}

export interface IAdsOption {
  concurrentAds: number;
  AdsPageNumber: number;
  capmpaign: boolean;
}

interface IFullDayPrice {
  fullDayPrice: number;
}

interface IFullAndSemiDayPrice extends IFullDayPrice {
  semiDayPrice: number;
}

interface IPriceNonCamp {
  post: IFullAndSemiDayPrice;
  story: IFullAndSemiDayPrice;
}

interface IPriceCamp {
  post: IFullDayPrice;
  story: IFullDayPrice;
}

export interface ITimerInfo {
  startTime: number;
  endTime: number;
}

export interface ICaledarAds extends IBaseAds {
  date: number;
  fullName: string;
  profileUrl: string;
  adType: AdsType;
}

export interface IAdMonth extends IMonthGraph {
  totalIncom: number;
}

export interface IAdShortMonth extends IShortMonth {
  totalIncome: number;
}

/** Was IStatisticsInfo in advertise/statistics.ts */
export interface IAdStatisticsInfo {
  twoMonth: IAdMonth[];
  totalAdsStatistics: IAdShortMonth[];
  totalAdsReport: ITotalAdsReport[];
}

export interface ITotalAdsReport {
  advertiseId: number;
  advertiser: {
    profileUrl: string;
    fullname: string;
    username: string;
  };
  advertiseType: AdsType;
  statusType: StatusType;
  fee: number;
  date: number;
}
// #endregion Advertise

// #region AI
export interface ITotalPrompt {
  promptId: string;
  fbId: string;
  createdTime: number;
  updatedTime: number;
  title: string;
  reNewForThread: boolean;
  shouldFollower: boolean;
  customPromptAnalysis: IAnalysisPrompt | null;
}

export interface IDetailPrompt extends ITotalPrompt {
  promptStr: string;
}

export interface IPrompts {
  items: ITotalPrompt[];
  nextMaxId: string | null;
}

export interface ICreatePrompt {
  title: string;
  reNewForThread: boolean;
  shouldFollower: boolean;
  prompt: string;
  promptType: PromptType;
  promptAnalysis: IAnalysisPrompt | null;
  tools: ITool[];
  promptImageGen: IPromptImageGen | null;
}

export interface IAnalysisPrompt {
  description: string;
  tasks: string[];
  rules: string[];
  signature: string;
}

export interface IPromptImageGen {
  numberOfImage: number;
  numberOfGeneratePerThread: number;
}

export interface ITool {
  toolId: string;
  parameters: {
    name: string;
    value: string;
  }[];
}

export interface ICreateLiveChat {
  text: string;
  username: string;
  promptInfo: ICreatePrompt;
}

export interface IAITools {
  description: string;
  parameters: {
    type: string;
    description: string;
    isRequired: boolean;
    name: string;
    generateWithAI: boolean;
  }[];
  name: string;
  tokenUsage: number;
  completeDescription: string;
  toolType: ToolType;
}

export interface ILiveChatClient {
  imageUrl: string | null;
  isStopped: boolean;
  itemType: ItemType;
  quickReplies: [];
  text: string | null;
  voiceUrl: string | null;
  type: string;
}
export interface ILiveChat {
  items: {
    text: string;
    mediaId: null;
    buttons: null;
    itemType: ItemType;
    mediaType: null;
    itemId: null;
    templates: [];
    type: string;
  }[];
  isStopped: boolean;
}

export type MessageMap = {
  CONSOLE_ERRORS: {
    MEDIA_RECORDER_ERROR: string;
    VOICE_RECORD_ERROR: string;
    UPLOAD_ERROR: string;
    VOICE_FETCH_ERROR: string;
    ADD_OUTPUT_ERROR: string;
    EDITOR_INIT_ERROR: string;
    JSON_PARSE_ERROR: string;
    POSITION_ERROR: string;
    NODE_REMOVE_ERROR: string;
    CONNECTION_ERROR: string;
    GENERIC_CONNECTION_ERROR: string;
    VOICE_PLAY_ERROR: string;
    NODE_CONNECTION_WARNING: string;
    UNKNOWN_VALUE_TYPE: string;
    UNKNOWN_BLOCK_TYPE: string;
  };
  ALERTS: {
    MIN_OUTPUT_REQUIRED: string;
    GENERIC_ITEM_CONNECTION_ONLY: string;
    WEBLINK_GENERIC_ITEM_ONLY: string;
    VOICE_RECORD_FAILED: string;
    VOICE_RECORD_SUCCESS: string;
    VOICE_UPLOAD_FAILED: string;
    VOICE_RECORD_EMPTY: string;
    VOICE_RECORD_ERROR: string;
    VOICE_RECORD_START: string;
    VOICE_PLAY_ERROR: string;
    QUICK_REPLY_VALIDATION_ERROR: string;
    GENERIC_ITEM_VALIDATION_ERROR: string;
    WEBLINK_VALIDATION_ERROR: string;
    NO_ON_MESSAGE_NODE: string;
    MAX_QUICK_REPLY_OUTPUTS: string;
    MAX_GENERIC_OUTPUTS: string;
    SESSION_INVALID: string;
    SUBTITLE_SUCCESS: string;
    ADD_OUTPUT_ERROR: string;
  };
  INTERNAL_NOTIFICATIONS: {
    EMPTY_TITLE_FOR_FLOW: string;
    MULTIPLE_FLOW_FOR_PRIVATE_REPLY: string;
    SUCCESS: string;
  };
  NOTIFICATIONS: {
    UNEXPECTED_ERROR: string;
    VALIDATION_WARNING: string;
    SERVER_ERROR: string;
  };
  VALIDATION_DETAILS: {
    QUICK_REPLY_BLOCK_TITLE_EMPTY: string;
    QUICK_REPLY_OPTION_TITLE_EMPTY: string;
    GENERIC_ITEM_TITLE_EMPTY: string;
    GENERIC_ITEM_OUTPUT_TITLE_EMPTY: string;
    WEBLINK_EMPTY: string;
    WEBLINK_INCOMPLETE: string;
    WEBLINK_INVALID_FORMAT: string;
    WEBLINK_NON_ENGLISH: string;
    WEBLINK_HAS_HYPHEN: string;
    SUBTITLE_INPUT: string;
  };
};
// #endregion AI

// #region CustomerAds
export interface FilterProps {
  title: FilterNames;
  options: any[];
}

export interface ISideBar {
  sortBy: SortByNum;
  category: ICustomerAdCategory;
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

/** Was ICategory in customerAds/customerAd.ts */
export interface ICustomerAdCategory {
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

/** Was IShowMedia in customerAds/customerAd.ts */
export interface ICustomerAdShowMedia {
  media: string;
  mediaUri?: string;
  cover: string;
  coverUri?: string;
  mediaType: MediaType;
  error: string;
  tagPeaple: ICustomerAdMediaTag[];
  width: number;
  height: number;
}

/** Was IMediaTag in customerAds/customerAd.ts (PascalCase fields) */
export interface ICustomerAdMediaTag {
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

/** Was IPageInfo in customerAds/customerAd.ts */
export interface ICustomerAdPageInfo {
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
// #endregion CustomerAds

// #region HomeIndex
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
// #endregion HomeIndex

// #region Market
export interface IMarketInfo {
  marketId: number;
  profileUrl: string;
  fullname: string;
  username: string;
  rating: number;
  followers: number;
  post: number;
  bannerUrl: string;
  linkAddress: string;
  categorySection: CategorySection[];
  marketType: MarketType;
}

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
  createdDate?: number;
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

/** Was ILink (extends IFeatureInfo) in market/myLink.ts */
export interface IMyLinkFeatureSection extends IFeatureInfo {
  links: IServerLink[];
}

export interface IContactAndMap extends IFeatureInfo {
  contact: IContact;
}

export interface IMyLink {
  announcement: IClientAnnouncement | null;
  reviews: IReviews | null;
  onlineStreaming: IOnlineStreaming;
  lastVideo: ILastVideo;
  products: IProducts | null;
  timeline: ITimeline | null;
  faq: IFaq | null;
  link: IMyLinkFeatureSection | null;
  contactAndMap: IContactAndMap | null;
  orderItems: IOrderItems;
}

export interface IVideoChannel {
  youtubeChannel: IVideoBodyChannel | null;
  aparatChannel: IVideoBodyChannel | null;
  twitchChannel: IVideoBodyChannel | null;
}

export interface IVideoBodyChannel {
  video: IMyLinkChannelContent | null;
  embedVideo: boolean;
}

export interface ILiveChannel {
  youtubeChannel: ILiveBodyChannel | null;
  aparatChannel: ILiveBodyChannel | null;
  twitchChannel: ILiveBodyChannel | null;
}

export interface ILiveBodyChannel {
  live: IMyLinkChannelContent | null;
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

/** Was IChannel in market/myLink.ts */
export interface IMyLinkChannel {
  youtubeChannel: IMyLinkChannelBody | null;
  aparatChannel: IMyLinkChannelBody | null;
  twitchChannel: IMyLinkChannelBody | null;
}

/** Was IChannelBody in market/myLink.ts */
export interface IMyLinkChannelBody {
  video: IMyLinkChannelContent | null;
  live: IMyLinkChannelContent | null;
  embedVideo: boolean;
}

/** Was IChannelContent in market/myLink.ts */
export interface IMyLinkChannelContent {
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
  channel: IMyLinkChannel;
  faqs: IFaqServer[];
  banners: IBanner[];
  caption: ICaption;
  featureOrders: IOrderItems;
  terms: string[] | null;
}

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

/** Was ILink (extends INewLink) in market/properties.ts */
export interface ILink extends INewLink {
  id: number;
  orderId: number;
  iconUrl: string;
  clickCount: number;
}

export interface IOrderFeatures {
  isActiveFeatureBox: boolean;
  orderItems: IMarketFeatureItem[];
}

/** Was IFeatureItem in market/properties.ts */
export interface IMarketFeatureItem {
  featureType: FeatureType;
  isActive: boolean;
}

export interface IUpdateFeatureOrder {
  orderItems: IMarketFeatureItem[];
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

/** Was IChannel in market/properties.ts */
export interface IPropertiesChannel {
  youtubeChannel: IPropertiesChannelBody | null;
  aparatChannel: IPropertiesChannelBody | null;
  twitchChannel: IPropertiesChannelBody | null;
}

export interface IChannelBox {
  peopleLocked: boolean;
  showAddPeapleBox: boolean;
  channelInfo: IChannelInfo[];
  loading: boolean;
  notFound: boolean;
}

/** Was IChannelBody in market/properties.ts */
export interface IPropertiesChannelBody {
  video: IPropertiesChannelContent | null;
  live: IPropertiesChannelContent | null;
  embedVideo: boolean;
  isActive: boolean;
  id: string;
}

/** Was IChannelContent in market/properties.ts */
export interface IPropertiesChannelContent {
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

export interface IAcceptDomain {
  uri: string;
  fbId: number;
  isActive: boolean;
  createdTime: number;
  isSubDomain: boolean;
  status: number;
  registerType: RegisterType;
}

export interface IPendingDomain {
  fbId: number;
  uri: string;
  isSubDomain: boolean;
  createdTime: number;
  lastCheckTime: number;
  nameServers: string[];
  nameServerCompletedTime: number | null;
  registerType: RegisterType;
}

export interface IGetCustomDomain {
  acceptDomain: IAcceptDomain | null;
  pendingDomain: IPendingDomain | null;
}

/** Was IFeatureItem in market/statistics.ts */
export interface IStatisticsFeatureItem {
  x: number;
  totalCount: number;
}

export interface ITotalInsight {
  nbVisits: number;
  nbActions: number;
  nbVisitsConverted: number;
  bounceCount: number;
  sumVisitLength: number;
  maxActions: number;
  bounceRate: string;
  nbActionsPerVisit: number;
  avgTimeOnSite: number;
}

export interface ITotalInsightFigures {
  nbVisit: IMonthGraph[];
}

export interface ILinkInsight {
  id: string;
  title: string;
  insight: IMonthGraph[];
}

export interface ISubVideoInsight {
  label: string;
  category: number;
  action: number;
  value: null;
  nbVisits: number;
  nbEvents: number;
  nbEventsWithValue: number;
  sumEventValue: number;
  minEventValue: boolean;
  maxEventValue: boolean;
  sumDailyNbUniqVisitors: number;
  avgEventValue: number;
  idsubdatatable: number;
}

export interface IVideoInsight {
  lastPlayYoutube: ISubVideoInsight | null;
  lastRedirectYoutube: ISubVideoInsight | null;
  lastPlayAparat: ISubVideoInsight | null | [];
  lastRedirectAparat: ISubVideoInsight | null | [];
  lastPlayTwitch: ISubVideoInsight | null;
  lastRedirectTwitch: ISubVideoInsight | null;
}
// #endregion Market

// #region Messages
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
  item: IDirectMessageItem;
  direction: ChatDirection;
  chatBox: IThread;
  ownerInbox: IDirectOwnerInbox;
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
  handleSpecifyRepliedItemFullName: (itemId: string, repItem: IDirectMessageItem | null) => string;
  handleSpecifyRepliedItemType: (repItemId: string, repItem: IDirectMessageItem | null) => string;
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
  item: IDirectMessageItem;
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
  repliedToItem: IDirectMessageItem | null;
  direction: ChatDirection;
  handleSpecifyRepliedItemFullName: (itemId: string, repItem: IDirectMessageItem | null) => string;
  handleSpecifyRepliedItemType: (repItemId: string, repItem: IDirectMessageItem | null) => string;
}

export interface IInbox {
  threads: IThread[];
  ownerInbox: IDirectOwnerInbox;
  nextMaxId: string;
}

export interface IUserThread {
  username: string;
  fullName: string;
  pk: number;
  profileUrl: string;
  lastSeenUnix: number;
}

/** Was IOwnerInbox in messages/IMessage.ts */
export interface IDirectOwnerInbox {
  userId: string;
  name: string | null;
  profilePic: string;
  followerCount: number;
  followsCount: number;
  mediaCount: number;
  accountType: number;
  igId: string | null;
  username: string;
}

export interface IIsSendingMessage {
  message: string;
  threadId: string;
  itemType: ItemType;
  mediaType?: MediaType;
  igId: string;
  file: File;
  imageBase64?: string;
  imageUrl?: string;
}

export interface IThread {
  items: IDirectMessageItem[];
  recp: IRecp;
  graphThreadId: string;
  nextMaxId: string | null;
  nextMinId: string | null;
  threadId: string;
  ownerLastSeenUnix: number;
  recpLastSeenUnix: number;
  onCurrentSnapShot: boolean;
  categoryId: number;
  lastUpdate: number;
  isPin: boolean;
  isActive: boolean;
}

/** Was IItem in messages/IMessage.ts */
export interface IDirectMessageItem {
  repliedToItemId: string | null;
  repliedToItem: IDirectMessageItem | null;
  itemType: ItemType;
  createdTime: number;
  userId: string;
  itemId: string;
  graphItemId: string;
  text: string;
  replyStory: ReplyStory | null;
  mediaShares: MediaShare[];
  medias: IDirectMedia[];
  clientContext: null;
  audio: MediaShare | null;
  audioUrl?: { url: string; externalUrl: string } | null;
  isUnsupporeted: boolean;
  recpEmojiReaction: null | string;
  ownerEmojiReaction: null | string;
  buttons: null;
  payloadId: null | string;
  storyMention: IStoryMention | null;
  sentByOwner: boolean;
}

export interface IStoryMention {
  height: number;
  width: number;
  isSticker: boolean;
  maxHeight: number;
  maxWidth: number;
  previewUrl: MediaShare;
  url: MediaShare;
}

export interface MediaShare {
  id: string;
  url: string;
  externalUrl: string;
  title: string | null;
}

/** Was IMedia in messages/IMessage.ts */
export interface IDirectMedia {
  image: IImage | null;
  video: IImage | null;
}

export interface IImage {
  previewUrl: MediaShare;
  url: MediaShare;
  height: number;
  width: number;
  maxHeight: number;
  maxWidth: number;
  isSticker: boolean;
}

export interface ReplyStory {
  directStoryItemType: number;
  link: string;
  fbId: string;
  externalUrl: string;
}

export interface IRecp {
  isActive: any;
  name: string | null;
  profilePic: string;
  followerCount: number;
  isFollower: boolean;
  isFollowing: boolean;
  igId: string;
  username?: string;
}

export interface IShowMessage {
  chats: IDirectMessageItem[];
  username: string;
  profileUrl: string;
}

export interface ISendImage {
  imageBase64: string;
  imageUrl: string;
  imageName: string;
  imageSize: number;
  width: number;
  height: number;
}

export interface ISendVideo {
  videoBase64: string;
  videoUrl: string;
  videoName: string;
  videoSize: number;
  width: number;
  height: number;
  length: number;
}

export interface IHookItem {
  OwnerId: string;
  RecpId: string;
  ThreadId: string;
  SentByOwner: boolean;
  DirectItem: IHookDirectItem | null;
  Reaction: IHookReact | null;
  Read: IHookRead | null;
  PostBack: null;
  MessageEdit: { ItemId: string; Text: string } | null;
}

export interface IHookRead {
  TimeUnix: number;
  ItemId: string;
  GraphItemId: string;
  SentByOwner: boolean;
  ThreadId: string;
  RecpId: string | null;
}

export interface IHookMediaShare {
  Id: string;
  Url: string;
  ExternalUrl: string;
  Title: string | null;
}

/** Was the second IStoryMention in messages/IMessage.ts (PascalCase hook version) */
export interface IHookStoryMention {
  Height: number;
  Width: number;
  IsSticker: boolean;
  MaxHeight: number;
  MaxWidth: number;
  PreviewUrl: IHookMediaShare;
  Url: IHookMediaShare;
}

export interface IHookMedia {
  Image: IHookSubMedia | null;
  Video: IHookSubMedia | null;
}

export interface IHookSubMedia {
  Height: number;
  Width: number;
  MaxHeight: number;
  MaxWidth: number;
  IsSticker: boolean;
  PreviewUrl: IHookMediaShare;
  Url: IHookMediaShare;
}

export interface IHookReact {
  Emoji: string;
  Reaction: string;
  SentByOwner: boolean;
  UserId: string;
  Action: string;
  ThreadId: string;
  GraphItemId: string;
  ItemId: string;
}

export interface IHookDirectItem {
  ItemType: ItemType;
  CreatedTime: number;
  UserId: string;
  ItemId: string;
  GraphItemId: string;
  Text: string;
  ReplyStory: null;
  MediaShares: IHookMediaShare[];
  Medias: IHookMedia[];
  ClientContext: null;
  Audio: IHookMediaShare | null;
  IsUnsupporeted: boolean;
  RecpEmojiReaction: null;
  OwnerEmojiReaction: null;
  PayloadId: string | null;
  SentByOwner: boolean;
  GenericTemplate: null;
  StoryMention: IHookStoryMention | null;
  File: null;
  RepliedToItemId: string | null;
  IsDeleted: boolean;
  ThreadId: string;
}

export interface IUploadImage {
  threadId: string;
  clientContext: string;
  imageBase64: string;
  width: number;
  height: number;
}

export interface IUploadVideo {
  threadId: string;
  clientContext: string;
  videoBase64: string;
  width: number;
  height: number;
  lengthInMs: number;
}

export interface IUploadVoice {
  threadId: string;
  clientContext: string;
  voiceBase64: string | ArrayBuffer | null;
  waveformSamplingFrequencyHz: number;
  durationInMs: number;
  waveFormData: number[];
  isWave: boolean;
  file: File;
}

export interface IGetDirectInboxItems {
  threadId: string;
  oldCursor: string | null;
}

export interface IGetDirectInbox {
  categoryId: number;
  oldCursor: string | null;
  searchTerm: string | null;
}

export interface ITicketInbox {
  threads: IThread_Ticket[];
  ownerInbox: IDirectOwnerInbox;
  nextMaxId: string;
}

export interface IFbTicketInfo {
  oldCursor: string | null;
  searchTerm: string | null;
  isHidden: boolean;
}

export interface IThread_Ticket extends IThread {
  createdTime: number;
  subject: string;
  ticketId: number;
  actionTime: number;
  status: StatusReplied;
  nullItems: string[] | null;
  isHide: boolean;
  isSatisfied: boolean | null;
  lastSeenTicketUnix: number;
}

export interface IReplyTicket_Media extends IReplyTicket_Media_Server {
  mediaBase64: string | null;
}

export interface IReplyTicket_Media_Server {
  text: string | null;
  itemType: ItemType;
  mediaType: MediaType | null;
  mediaId: string | null;
}

export interface IReplyTicket {
  ticketId: number;
  medias: IReplyTicket_Media[];
}

export interface ICommetInbox {
  oldestCursor: string;
  hasOlder: boolean;
  medias: IMedia[];
  ownerInbox: IDirectOwnerInbox;
}

export interface IMedia {
  comments: IComment[];
  users: IUser[];
  productType: MediaProductType;
  lastCommentUnix: number;
  lastSeenUnix: number;
  mediaId: string;
  ownerId: string;
  isPin: boolean;
  nextMaxId: null | string;
  hasOlder: boolean;
  participantCount: number;
  unAnsweredCount: number;
  vanishMode: boolean;
  sign: string;
  signTime: number;
  commentCount: number;
  unSeenCount: number;
  newCommentCount: number;
  thumbnailMediaUrl: string | null;
  tempId: number | null;
  postId: number | null;
  commentEnabled: boolean;
  automaticCommentReply: IAutomaticReply | null;
}

export interface IComment {
  replys: IComment[] | null;
  id: string;
  mediaId: string;
  threadId: null | string;
  sentByOwner: boolean;
  isDeleted: boolean;
  createdTime: number;
  username: string;
  fullName: string | null;
  isIgnored: boolean;
  isAnswered: boolean;
  text: string;
  parentId: null | string;
  isHide: boolean;
  likeCount: number;
  profileUrl: string;
  sign: string;
  signTime: number;
  privateReply: IDirectMessageItem | null;
}

export interface IUser {
  username: string;
  profileUrl: string;
}

export interface IGetCommentBoxInfo {
  nextMaxId: string | null;
  searchTerm: string | null;
  productType: MediaProductType;
}

export interface IGetMediaCommentInfo {
  mediaId: string;
  searchInReplys: boolean;
  justUnAnswered: boolean;
  searchTerm: string | null;
  nextMaxId: string | null;
}

export interface IHookComment {
  IgId: string;
  Username: string;
  MediaId: string;
  MediaType: number;
  CommentId: string;
  Text: string;
  ParrentId: string | null;
  OwnerId: string;
  IsLive: boolean;
  SentByOwner: boolean;
  CreatedTime: number;
  ProfileUrl: string;
  ThreadId: string;
  Sign: string;
  SignTime: number;
}

export interface IReplyCommentInfo extends IActionCommentInfo {
  text: string;
  private: boolean;
}

export interface IReplyLiveCommentInfo extends IActionCommentInfo {
  text: string;
  private: boolean;
  sign: string;
  signTime: number;
  lastCommentId: string;
  lastSign: string;
  lastSignTime: number;
  lastCreatedTime: number;
}

export interface IActionCommentInfo {
  commentId: string;
  mediaId: string;
  sign: string;
  signTime: number;
  createdTime: number;
}

export interface IHookAction {
  ActionType: ActionType;
  CreatedTime: number;
  FbId: string;
  MediaId: string;
  CommentId: string;
}

export interface IHookPrivateReply {
  OwnerId: string;
  ParentCommentId: string;
  MediaId: string;
  ItemId: string;
  Text: string;
  IsLive: boolean;
}

export interface ICommentAndDirectReply {
  commentReplies: IAutoReply;
  directReplies: IAutoReply;
}

export interface IAutoReply {
  propmts: IPropmt[];
  activeReply: boolean;
}

export interface IPropmt {
  propmtId: number;
  incomeMsg: string;
  answer: string;
  activePrompt: boolean;
}

export interface IProfileButtons {
  specialPayload: SpecialPayLoad | null;
  title: string | null;
  additionalPayload: null;
  payloadType: PayloadType;
  masterFlowId: string | null;
  promptId: string | null;
  response: string | null;
  generalAIId: string | null;
  masterFlow: ITotalMasterFlow | null;
  prompt: ITotalPrompt | null;
}

export interface IUpdateProfileButton {
  specialPayload: SpecialPayLoad | null;
  title: string | null;
  additionalPayload: null;
  payloadType: PayloadType;
  masterFlowId: string | null;
  promptId: string | null;
  response: string | null;
  prompt: string | null;
}

export interface IIceBreaker {
  profileButtons: { items: IProfileButtons[] };
  isActive: boolean;
  updateTime: number;
}

export interface IAutoReplySetting {
  autoReplyCustomAction: {
    likeReply: boolean;
    hideComment: boolean;
    updateTime: number;
  };
  language: MessageLanguage;
  checkFollowerTemplate: {
    isActive: boolean;
    updateTime: number;
    ownerId: string;
    title: string;
    buttonText: string;
  } | null;
}

export interface IMessagePanel {
  language: number;
  robotReply: boolean;
  followTemplate: {
    isActive: boolean;
    title: string;
    content: string;
  };
  likeReplyStory: boolean;
}

export interface IPersistentMenu extends IIceBreaker {}

export interface ISpecialPayload {
  specialPayload: SpecialPayLoad;
  description: string;
}

export interface IUpdateIceBreaker {
  enabled: boolean;
  items: {
    question: string;
    response: string;
  }[];
}

export interface IWelcomingMessage_GetCondition {
  instagramerId: number;
  isActive: boolean;
  lastUpdate: number;
  text: string;
  lastDone: number;
}

export interface IWelcomingMessage_Update {
  isActive: boolean;
  text: string;
}

export interface IWelcomingMessage_GetSentMessage {
  instagramerId: number;
  text: string;
  createdTime: number;
  sentMessageId: number;
  username: string;
  pk: number;
  fullName: string;
  profileUrl: string;
}

export interface IWelcomingMessage_Figure extends SuperFigure {}

export interface IBusinessMessageFilter {
  activeBusinessFilter: boolean;
  businessMessageFilterType: BusinessFilterNumberType;
  message: string;
}

export interface IIceBreakerInfo {
  items: {
    question: string;
    response: string;
    isDefault: boolean;
    orderId: number;
  }[];
  enabled: boolean;
  instagramerId: number;
  lastUpdate: number;
}

export interface IGeneralAutoReply {
  items: { id: string; sendCount: number; text: string }[];
  sendCount: number;
  pauseTime: number | null;
  id: string;
  response: string | null;
  sendPr: boolean;
  shouldFollower: boolean;
  productType: MediaProductType;
  automaticType: AutoReplyPayLoadType;
  promptId: string | null;
  masterFlowId: string | null;
  masterFlow: ITotalMasterFlow | null;
  prompt: ITotalPrompt | null;
  title: string;
  replySuccessfullyDirected: boolean;
  customRepliesSuccessfullyDirected: string[];
}

export interface ICreateGeneralAutoReply {
  keys: string[];
  response: string | null;
  sendPr: boolean;
  shouldFollower: boolean;
  productType: MediaProductType | number | null;
  id: string | null;
  automaticType: AutoReplyPayLoadType;
  promptId: string | null;
  masterFlowId: string | null;
  title: string;
  replySuccessfullyDirected: boolean;
  customRepliesSuccessfullyDirected: string[];
}

export interface ITotalMasterFlow {
  fbId: string;
  masterFlowId: string;
  createdTime: number;
  initialFlowId: string;
  title: string;
  checkFollower: boolean;
  initalFlow: null;
  onMessagePosition: null;
}

export interface IMasterFlow {
  items: ITotalMasterFlow[];
  nextMaxId: string | null;
}
// #endregion Messages

// #region Page - Post
export interface IPageInfo {
  profileUrl: string;
  username: string;
  fullName: string;
}
export interface IShowMedia {
  media: string;
  mediaUri: string | null;
  cover: string;
  coverUri: string | null;
  mediaType: MediaType;
  error: string;
  tagPeaple: IMediaTag[];
  width: number;
  height: number;
  duration: number;
  size: number;
  mediaUploadId: string;
  coverId: string;
}
export interface IScheduledPost {
  info: IScheduledPostList[];
  totalPostCount: number;
}

export interface IScheduledPostList {
  second: number;
  minute: number;
  hour: number;
  day: number;
  postUrl: string;
  postNumber: number;
  postType: number;
  upingTime: number;
  prePostId: number;
}

export interface ICreatePrePost {
  mediaType: MediaType;
  image: IImageMedia;
  video: IImageMedia;
  carousel: IImageMedia[];
  caption: string;
  location: ILocation | null;
  firstComment: string | null;
  upingTime: number;
  hideLikeAndView: boolean;
  turnOffComment: boolean;
  addVideoAsReels: boolean;
}

export interface ILocation {
  externalId: number;
  name: string;
  lat: number;
  lng: number;
  address: string;
  externalSource: string;
}

export interface IShortLocation {
  pk: number;
  name: string;
  address: string;
  city: string;
  shortName: string;
  lng: number;
  lat: number;
  externalSource: string;
  facebookPlacesId: number;
}

export interface IImageMedia {
  data: string;
  tags: IMediaTag[] | null;
}

export interface IMediaTag {
  username: string;
  x: number;
  y: number;
}

/** Was IShowMedia in page/post/preposts.ts */
export interface IPostShowMedia {
  media: string;
  mediaUri: string | null;
  cover: string;
  coverUri: string | null;
  mediaType: MediaType;
  error: string;
  tagPeaple: IMediaTag[];
  width: number;
  height: number;
  duration: number;
  size: number;
  mediaUploadId: string;
  coverId: string;
}

export interface IChildrenDraft {
  draftId: number;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailMediaUrl: string;
  userTags: IMediaTag[];
}

export interface IChildrenPrePost {
  prePostId: number;
  mediaUrl: string;
  thumbnailMediaUrl: string;
  userTags: IMediaTag[];
  mediaType: MediaType;
}

export interface IDraftInfo {
  automaticMediaReply: IMediaUpdateAutoReply | null;
  caption: string;
  collaborators: string[];
  commentEnabled: boolean;
  createdTime: number;
  draftChildren: IChildrenDraft[];
  draftId: number;
  errorMessage: string | null;
  instagramerId: number;
  isProduct: boolean;
  location: null;
  mediaType: MediaType;
  mediaUrl: string | null;
  shareToFeed: boolean;
  statusCreatedTime: number;
  thumbnailMediaUrl: string;
  userTags: IMediaTag[];
  duration: number;
  uiParameters: string;
}

export interface IPrePostInfo {
  prePostChildren: IChildrenPrePost[];
  collaborators: string[];
  location: null;
  userTags: IMediaTag[];
  caption: string;
  automaticMediaReply: IAutomaticReply | null;
  commentEnabled: boolean;
  shareToFeed: boolean;
  uiParameters: string;
  statusMessage: string | null;
  statusCreatedTime: number;
  locationId: string | null;
  mediaUrl: string;
  isProduct: boolean;
  prePostId: number;
  thumbnailMediaUrl: string;
  mediaType: MediaType;
  upingTime: number;
  createdTime: number;
  instagramerId: number;
}

export interface IErrorPrePostInfo {
  ErrorType: ErrorPrePostType;
  ChildId: number;
  InvalidTags: string[];
  Message: string;
}

export interface IDraftChild {
  draftChildId: number;
  mediaType: MediaType;
  draftId: number;
  mediaUrl: string;
  thumbnailMediaUrl: string;
  userTags: IMediaTag[];
  mediaUploadId: string;
}

/** Was IPageInfo in page/post/preposts.ts */
export interface IPostPageInfo {
  profileUrl: string;
  username: string;
  fullName: string;
}

export interface IFullPageInfo extends IPostPageInfo {
  isLiked: boolean;
}

export interface IPrePost {
  prePostId: number;
  thumbnailMediaUrl: string;
  mediaType: MediaType;
  upingTime: number;
  createdTime: number;
  instagramerId: number;
}

export interface IPostImageInfo {
  draftId: number;
  prePostId: number;
  caption: string;
  uploadImage: {
    uploadImageUrl: string | null;
    imageUri: string | null;
    userTags: IMediaTag[];
  };
  collaborators: string[];
  automaticMediaReply: IMediaUpdateAutoReply | null;
  locationId: string;
  isProduct: boolean;
  commentEnabled: boolean;
  uiParameters: string;
}

export interface IUiParameter {
  width: number;
  height: number;
  size: number;
  duration: number;
}

export interface IPostVideoInfo {
  draftId: number;
  prePostId: number;
  caption: string;
  uploadVideo: {
    uploadVideoUrl: string | null;
    videoUri: string | null;
    userTags: IMediaTag[];
  };
  uploadCover: {
    uploadImageUrl: string | null;
    imageUri: string | null;
  } | null;
  collaborators: string[];
  automaticMediaReply: IMediaUpdateAutoReply | null;
  locationId: string;
  isProduct: boolean;
  commentEnabled: boolean;
  shareToFeed: boolean;
  uiParameters: string;
}

export interface IPostAlbumInfo {
  draftId: number;
  caption: string;
  albumItems: {
    video: {
      uploadVideoUrl: string | null;
      videoUri: string | null;
      userTags: string[];
    } | null;
    image: {
      uploadImageUrl: string | null;
      imageUri: string | null;
      userTags: {
        username: string;
        x: number;
        y: number;
      }[];
    } | null;
    mediaType: MediaType;
  }[];
  collaborators: string[];
  automaticMediaReply: IMediaUpdateAutoReply | null;
  locationId: string;
  isProduct: boolean;
  commentEnabled: boolean;
  uiParameters: string;
}

export interface IPostAlbumItem {
  image: {
    uploadImageUrl: string | null;
    imageUri: string | null;
    userTags: {
      username: string;
      x: number;
      y: number;
    }[];
  } | null;
  video: {
    uploadVideoUrl: string | null;
    videoUri: string | null;
    userTags: string[];
  } | null;
  mediaType: MediaType;
}

export interface IPrePostCount {
  totalPrePostCount: number;
  totalMediaCount: number;
}

export interface IPost {
  posts: IPostContent[] | null;
  prePosts: IPrePost[] | null;
  errorDrafts: IShortDraft[];
  nonErrorDrafts: IShortDraft[];
}

export interface IShortDraft {
  createdTime: number;
  draftId: number;
  instagramerId: number;
  mediaType: MediaType;
  thumbnailMediaUrl: string;
  statusCreatedTime: bigint;
  errorMessage: string;
  mediaUploadId: string;
}

export interface IPostContent {
  commentCount: number;
  createdTime: number;
  instaShareLink: string;
  instagramerId: number;
  isDeleted: boolean;
  deleteTimeUnix: number | null;
  lastSeenCommentTimeUnix: number;
  likeCount: number;
  mediaType: number;
  newCommentCount: number;
  nextUnSeenCommentId: number;
  pk: string;
  postId: number;
  saveCount: number;
  shareCount: number;
  reachCount: number;
  tempId: number;
  thumbnailMediaUrl: string;
  viewCount: number;
  commentEnabled: boolean;
  videoViewAverageTime: number | null;
  videoViewTotalTime: number | null;
  canDownload: boolean;
  mediaUrl: string;
  reelsSkipRate: number | null;
}

export interface IDetailsPost extends IPostContent {
  caption: string;
  isHideLikeViewCount: boolean;
  hashtags: ITopHashtag[];
  children: childMedia[];
  commentMedia?: IMedia;
  loginStatus: number;
}

export interface IInsightPost {
  superFigures: SuperFigure[];
  reachFollowerType: IFollowerTypeInsight;
  engagmentFollowerType: IFollowerTypeInsight;
  postImpressionInfo: IPostImpressionInfo;
  profileActivityInfo: IProfileActivityInfo;
}

export interface IProfileActivityInfo {
  postId: number;
  profileVisits: number;
  callButtonTaps: number;
  emailButtonTaps: number;
  follows: number;
  bussinessAddressTaps: number;
  externalLinkTaps: number;
  createdTimeUnix: number;
  totalCount: number;
}

export interface IPostImpressionInfo {
  home: number;
  postId: number;
  createdTimeUnix: number;
  profile: number;
  explorer: number;
  hashtag: number;
  other: number;
  totalImpression: number;
}

export interface IFollowerTypeInsight {
  followerCount: number;
  nonFollowerCount: number;
  postId: number;
  createdTimeUnix: number;
}

export interface IInteractionInsight {
  commentCount: number;
  saveCount: number;
  shareCount: number;
  likeCount: number;
}

export interface childMedia {
  childrenId: number;
  mediaUrl: string;
  postId: number;
  thumbnailMediaUrl: string;
  userTags: null;
  mediaType: number;
}

export interface IInsightsPost {}

export interface IShowPost {
  details: IDetailsPost;
  insights: IInsightsPost;
}

/** Was IHashtag in page/post/posts.ts */
export interface ITopHashtag {
  hashtag: string;
  useCount: number;
}

export interface ITopHashtag {
  hashtag: string;
  useCount: number;
}

export interface IAutomaticReply {
  mediaId: string;
  items: { id: string; sendCount: number; text: string }[];
  sendCount: number;
  pauseTime: number | null;
  response: string | null;
  sendPr: boolean;
  replySuccessfullyDirected: boolean;
  shouldFollower: boolean;
  productType: MediaProductType | null;
  automaticType: AutoReplyPayLoadType;
  promptId: string | null;
  masterFlowId: string | null;
  masterFlow: ITotalMasterFlow | null;
  prompt: ITotalPrompt | null;
}

export interface IMediaUpdateAutoReply {
  automaticType: AutoReplyPayLoadType;
  promptId: string | null;
  masterFlowId: string | null;
  sendPr: boolean;
  shouldFollower: boolean;
  response: string | null;
  replySuccessfullyDirected: boolean;
  keys: string[];
}

export interface IPublishLimit {
  usage: number;
  total: number;
  duration: number;
}

export interface ILotteryPost {
  url: string;
  randomCount: number;
  createdTime: number;
  randoms: {
    username: string;
    profileUrl: string;
  }[];
}
// #endregion Page - Post

// #region Page - Socket
export interface IUploadPost {
  UploadState: UploadPostSteps;
  EventGuid: string;
  UploadStateStr: string;
  Caption: string;
  Name: string;
  EventTime: number;
}
// #endregion Page - Socket

// #region Page - Statistics
export interface GraphLikesModel {
  allLikes: number;
  sixMounth: {
    mounthName: string;
    firstDay: number;
    lastDay: number;
  }[];
  componet: {
    newLikes: number;
    listPoint: {
      x: number;
      y: number;
    }[];
    likers: {
      profileUrl: string;
      username: string;
      name: string;
      date: string;
    }[];
  }[];
}

export interface IShortMonth {
  month: number;
  totalCount: number;
  year: number;
  plusCount: number;
}

export interface IMonthGraph extends IShortMonth {
  lastUpdate: number | null;
  previousPlusCount: undefined;
  dayList: DayCountUnix[];
  users: StatisticsUser[];
}

export interface Figure {
  firstIndex: string;
  secondIndex: string;
  days: DayCountUnix[];
  hours: HourCountUnix[];
}

export interface SuperFigure {
  title: string;
  firstIndexes: string[];
  secondIndexes: string[][];
  figures: Figure[];
}

export interface DayCountUnix {
  day: number;
  month: number;
  year: number;
  createdTime: number;
  count: number;
}

export interface HourCountUnix extends DayCountUnix {
  hourValue: number;
  relationHour: number;
}

export interface StatisticsUser {
  profileUrl: string;
  userName: string;
  fullName: string;
  pk: number;
  createdTime: number;
}

export interface GraphFollowersModel {
  allFollowers: number;
  sixMounth: {
    mounthName: string;
    firstDay: number;
    lastDay: number;
  }[];
  componet: {
    newFollowers: number;
    listPoint: {
      x: number;
      y: number;
    }[];
    followers: {
      profileUrl: string;
      username: string;
      name: string;
      date: string;
    }[];
  }[];
}

export interface GraphCommentsModel {
  allComments: number;
  sixMounth: {
    mounthName: string;
    firstDay: number;
    lastDay: number;
  }[];
  componet: {
    newComments: number;
    listPoint: {
      x: number;
      y: number;
    }[];
    comments: {
      profileUrl: string;
      username: string;
      name: string;
      date: string;
    }[];
  }[];
}

export interface GraphGhostViewersModel {
  allGhostViewers: number;
  newGhostViewers: number;
  componet: {
    listPoint: {
      x: number;
      y: number;
    }[];
  }[];
}

export interface GraphViewsModel {
  allViews: number;
  sixMounth: {
    mounthName: string;
    firstDay: number;
    lastDay: number;
  }[];
  componet: {
    newViews: number;
    listPoint: {
      x: number;
      y: number;
    }[];
    viewers: {
      profileUrl: string;
      username: string;
      name: string;
      date: string;
    }[];
  }[];
}

export interface GraphUnFollowersModel {
  allUnFollowers: number;
  sixMounth: {
    mounthName: string;
    firstDay: number;
    lastDay: number;
  }[];
  componet: {
    newUnFollowers: number;
    listPoint: {
      x: number;
      y: number;
    }[];
    unFollowers: {
      profileUrl: string;
      username: string;
      name: string;
      date: string;
    }[];
  }[];
}

export interface GraphViewsFourMonthModel {
  views: number;
  componet: {
    listPoint: {
      x: number;
      y: number;
    }[];
    tooltip: string;
  }[];
}

export interface IBestFollowers {
  profileUrl: string;
  fullName: string;
  username: string;
  count: number;
  pk: number;
}

export interface CardBestWorstModel {
  thirdyDays: {
    bestTime: number;
    worstTime: number;
  };
  nintyDays: {
    bestTime: number;
    worstTime: number;
  };
  oneTwoODays: {
    bestTime: number;
    worstTime: number;
  };
  sixtyDays: {
    bestTime: number;
    worstTime: number;
  };
}

export interface IBestTime {
  day30CountUnixes: HourCountUnix[];
  day60CountUnixes: HourCountUnix[];
  day90CountUnixes: HourCountUnix[];
  day120CountUnixes: HourCountUnix[];
}

export interface LikeAndCommentPopupModel {
  mediaUrl: string;
  likeCount: number;
  commentCount: number;
  saveCount: number;
}

export interface VeiwPopupModel {
  mediaUrl: string;
  saveCount: number;
  viewCount: number;
}

export interface IIngageBox {
  postCount: number;
  storyCount: number;
  posts: IPostContent[];
}

export interface IViewPopup {
  mediaUrl: string;
  viewCount: number;
  saveCount: number;
  postId: number;
}

export interface ICommentPopup {
  mediaUrl: string;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  likeComment: number;
  postId: number;
}

export interface EngagmentStatistics {
  likes: IMonthGraph[];
  comments: IMonthGraph[];
  shares: IMonthGraph[];
  engagement: IMonthGraph[];
  saves: IMonthGraph[];
  replies: IMonthGraph[];
  views: IMonthGraph[];
  followerViews: IMonthGraph[];
  nonFollowerViews: IMonthGraph[];
  totalTime: IMonthGraph[];
  reposts: IMonthGraph[];
}

export interface IFollowerStatistics {
  overallFollowers: IMonthGraph[] | null;
  unFollowers: IMonthGraph[] | null;
  mediaFollows: IMonthGraph[] | null;
  mediaProfileVisits: IMonthGraph[] | null;
  reach: IMonthGraph[] | null;
}

export interface TotalStatistics {
  statisticContent: {
    ghostViewerChart: GraphGhostViewersModel | null;
    ingageBoxes: IIngageBox | null;
    cardBestWorst: CardBestWorstModel | null;
    likes: IMonthGraph[] | null;
    followers: IMonthGraph[] | null;
    unFollowers: IMonthGraph[] | null;
    views: IMonthGraph[] | null;
    comments: IMonthGraph[] | null;
    fourMounthViews: GraphViewsFourMonthModel | null;
    bestFollowers: IBestFollowers[] | null;
  };
}
// #endregion Page - Statistics

// #region Page - Story
export interface IHighLight {
  coverMedia: string;
  title: string;
  pk: number;
  id: number;
}

export interface IScheduledStoryClient {
  info: ScheduledStoryList[];
  totalStoryCount: number;
}

export interface ScheduledStoryList {
  second: number;
  minute: number;
  hour: number;
  day: number;
  mediaUrl: string;
  preStoryId: number;
  storyType: number;
  mediaType: MediaType;
  upingTime: number;
}

export interface IScheduledStoryServer {
  instagramerId: number;
  preStoryId: number;
  status: number;
  thumbnailMediaUrl: string;
  upingTime: number;
  mediaType: MediaType;
}

export interface IStoryImageInfo {
  draftId: number;
  preStoryId: number;
  uploadImage: {
    uploadImageUrl: string | null;
    imageUri: string | null;
    userTags: [];
  };
  uiParameters: null;
  automaticMediaReply: IMediaUpdateAutoReply | null;
}

export interface IStoryVideoInfo {
  draftId: number;
  preStoryId: number;
  uploadVideo: {
    uploadVideoUrl: string | null;
    videoUri: string | null;
    userTags: [];
  };
  uiParameters: null;
  uploadCover: {
    uploadImageUrl: string | null;
    imageUri: string | null;
  } | null;
  automaticDirectReply: IMediaUpdateAutoReply | null;
}

export interface IPreStory {
  media: string;
  mediaUri: string | null;
  cover: string;
  coverUri: string | null;
  mediaType: MediaType;
  error: string;
  mediaUploadId: string;
  coverId: string;
}

export interface IStoryDraft {
  createdTime: number;
  draftId: number;
  errorMessage: null;
  instagramerId: number;
  mediaType: MediaType;
  statusCreatedTime: number;
  thumbnailMediaUrl: string;
}

export interface IStoryDraftInfo {
  automaticReplyInfo: IMediaUpdateAutoReply | null;
  createdTime: number;
  draftId: number;
  errorMessage: string | null;
  instagramerId: number;
  mediaType: MediaType;
  mediaUrl: string | null;
  shareToFeed: boolean;
  statusCreatedTime: number;
  thumbnailMediaUrl: string;
  uiParameters: string;
}

export interface IPreStoryInfo {
  automaticMediaReply: IMediaUpdateAutoReply | null;
  mediaUrl: string;
  status: number;
  mediaType: MediaType;
  preStoryId: number;
  thumbnailMediaUrl: string;
  upingTime: number;
  instagramerId: number;
}

export interface IStoryContent {
  code: string;
  autoReplyCommentInfo: IAutomaticReply | null;
  createdTime: number;
  expireTime: number;
  instaShareLink: string;
  instagramerId: number;
  mediaType: MediaType;
  pk: string;
  replyCount: number;
  shareCount: number;
  storyId: number;
  tempId: number;
  thumbnailMediaUrl: string;
  viewCount: number;
  mediaUrl: string;
}

export interface IStoryReply {
  threads: IThread[];
  nextMaxId: string | null;
  hasOlder: boolean;
}

export interface IStoryViewers {
  viewers: IStoryViewer[];
}

export interface IReachInfo {
  createdTimeUnix: number;
  followReach: number;
  nonFollowReach: number;
  storyId: number;
}

export interface IStoryViewer {
  profileUrl: string;
  storyViewerId: number;
  storyId: number;
  pk: number;
  username: string;
  fullName: string;
  isLiked: boolean;
  isFollowedBy: boolean;
}

export interface IQuestionInfo {
  storyId: number;
  storyQuestionId: number;
  totalCount: number;
  questionStr: number;
  responders: IReaction[];
}

export interface IReaction {
  username: string;
  fullName: string;
  pk: number;
  storyQuestionResponderId: number;
  responseStr: string;
  storyQuestionId: number;
  timeUnix: number;
  profileUrl: string;
}

export interface IStoryInsight {
  engagementFollowerType?: IEngagementFollowerType;
  interaction?: IInteraction;
  navigation?: INavigation;
  impression?: IImpression;
  reachFollowerType?: IReachFollowerType;
  stickerTapCounts?: IStickerTapCount[];
  profileActivity?: IProfileActivity;
  linkClicks?: ILinkClicks;
  superFigures?: SuperFigure[];
  reach?: number;
}

export interface IEngagementFollowerType {
  storyId: number;
  followEngaged: number;
  nonFollowEngaged: number;
  createdTimeUnix: number;
}

export interface IInteraction {
  storyId: number;
  likes: number;
  shares: number;
  replies: number;
  total: number;
}

export interface INavigation {
  storyId: number;
  forward: number;
  backward: number;
  nextStory: number;
  exited: number;
  total: number;
  id: number;
}

export interface IImpression {
  storyId: number;
  count: number;
  createdTimeUnix: number;
}

export interface IReachFollowerType {
  id: number;
  createdTimeUnix: number;
  followReach: number;
  nonFollowReach: number;
  storyId: number;
}

export interface IStickerTapCount {
  storyId: number;
  tapCount: number;
  id: number;
  title: number;
}

export interface IProfileActivity {
  storyId: number;
  follows: number;
  total: number;
  profileVisits: number;
  createdTimeUnix: number;
}

export interface ILinkClicks {
  storyId: number;
  count: number;
  createdTimeUnix: number;
}

export interface IStory {
  drafts: IStoryDraft[];
  errorDrafts: IStoryDraft[];
  scheduledStory: IScheduledStoryServer[] | null;
  storyContents: IStoryContent[] | null;
  preStoryTotalCount: number;
}

export interface IStory_Viewers_Server {
  viewers: IStory_Viewers[];
}

export interface IStory_Viewers {
  storyViewerId: number;
  storyId: number;
  pk: number;
  username: string;
  fullName: string;
  isLiked: boolean;
  isFollowedBy: boolean;
  profileUrl: string;
}

export interface ISendStoryAutomaticReply {
  keys: string[];
  response: string;
  shouldFollower: boolean;
}
// #endregion Page - Story

// #region Page - Tools
export interface IHashtag {
  hashtagList: HashtagListItem[] | null;
  lastPictureAnalysisHashtags: IPictureAnalysisHashtags[];
  lastPageAnalysisHashtags: IPageAnalysisHashtags[];
}
export interface IGetAnnouncementAndBannerInfo {
  addToPostChecked: boolean;
  addToStoryChecked: boolean;
  textArea: string;
  banners: {
    bannerId: number;
    bannerSrc: string;
  }[];
  customBanner: {
    bannerId: number;
    bannerSrc: string;
  } | null;
  fontColor: { hex: string };
  boxColor: { rgb: { r: number; g: number; b: number } };
  boxOpacity: number;
  isActive: boolean;
}

export interface ICreateAnnouncementAndBannerInfo {
  addToPostChecked: boolean;
  addToStoryChecked: boolean;
  textArea: string;
  bannerId: number | null;
  newBannerStr: string | null;
  fontColor: { hex: string };
  boxColor: { rgb: { r: number; g: number; b: number } };
  boxOpacity: number;
}

export interface ICreateTermsAndBanner {
  termsAndCondition: ICreateTermsAndConditionInfo | null;
  announcementAndBanner: ICreateAnnouncementAndBannerInfo | null;
}

export interface IGetTermsAndBanner {
  termsAndCondition: IGetTermsAndConditionInfo;
  announcementAndBanner: IGetAnnouncementAndBannerInfo;
}

export interface IHistoryLotteriesInfo {
  items: IHistoryLotteryInfo[];
}

export interface IShortLotteryInfo {
  lotteryId: number;
  dateAndTime: number;
  lotteryType: LotteryGroupType;
}

export interface IPendingLotteryInfo extends IShortLotteryInfo {}

export interface IDoneLotteryInfo extends IShortLotteryInfo {}

export interface IAbortLotteryInfo extends IShortLotteryInfo {
  error: string;
}

export interface IHistoryLotteryInfo extends IShortLotteryInfo {
  status: LotteryStatus;
  error: string;
}

export interface IWinnersLotteryInfo extends IShortLotteryInfo {
  winnerId: number;
  winners: {
    Username: string;
    ProfileUrl: string;
    FullName: string;
    Pk: number;
  }[];
}

export interface IFullLotteryInfo {
  termsAndBanner: IGetTermsAndBanner;
  likeChecked: boolean;
  mentionChecked: boolean;
  minMentionCount: number;
  ShouldFollowMyPage: boolean;
  ShouldFollowOtherPage: IShortPageInfo[] | null;
  dateAndTime: number | null;
  thumbnailUrl: string | null;
  winnerCount: number;
  postId: number;
  LotteryId: number;
  Error: string;
}

export interface IShortLottery {
  id: string;
  postId: number;
  thumbnailMediaUrl: string;
  startTime: number;
  status: LotteryStatus;
  failStatus: null | FailLotteryStatus;
  statusTime: number;
  winnerCount: number;
  instagramerId: number;
}

export interface IShortLotteriesInfo {
  items: IShortLottery[];
  nextMaxId: string | null;
}

export interface IFullLottery extends IShortLottery {
  createdTime: number;
  minMentionCount: number;
  filterText: string;
  isFollower: boolean;
  turnOffCommenting: boolean;
  successFollowerMessage: string;
  lotteryTerms: {
    lotteryId: string;
    bannerUrl: string;
    preStoryId: number;
    publishStory: boolean;
    uiInfo: string;
    termsType: TermsType;
    backgroundUrl: string;
    isActive: true;
    storyId: string | null;
  } | null;
  lotteryBanner: {
    lotteryId: string;
    bannerUrl: string;
    preStoryId: string | null;
    storyId: string | null;
    title: string;
    publishStory: boolean;
    isActive: boolean;
    fontColor: string;
    boxColor: string;
    boxOpacity: number;
    winnerBannerUrl: string | null;
  } | null;
  includeReplied: boolean;
  exportCommentUrl: string | null;
  winners: {
    username: string;
    fullName: string;
    lotteryId: string;
    profileUrl: string;
  }[];
}

export interface ITermsBanner {
  lotteryId: number;
  caption: string;
  bannerUrl: string;
  backgroundUrl: string;
  textColor: string;
  boxColor: string;
  boxOpacity: number;
  textOpacity: number;
  lastRemainingShareTime: number;
  termsShareTime: number;
}

export interface IWinnerBanner {
  url: string;
  lotteryId: number;
}

export interface ISimpleUser {
  username: string;
  pk: number;
  fullName: string;
  profileUrl: string;
}

export interface ILotteryWinner extends ISimpleUser {
  lotteryId: number;
}

export interface ScoreCondition {
  lotteryId: number;
  minScore: number;
  isMention: boolean;
  shouldFollower: boolean;
  postId: number;
  addToPost: number;
  thumbnailMediaUrl: string;
}

export interface NormalCondition {
  lotteryId: number;
  isMention: number;
  isFollower: boolean;
  isComment: boolean;
  addToPost: boolean;
  postId: number;
  terms?: string;
  termsUrl?: string;
  thumbnailMediaUrl: string;
}

export interface FollowerContion {
  followerLotteryType: FollowerLotteryType;
  lotteryId: number;
}

export interface ICreateLotteryInfo {
  termsAndBanner: ICreateTermsAndBanner;
  lotteryInfo: ILotteryInfo;
}

export interface ILotteryInfo {
  lotteryId: string | null;
  postId: number;
  isFollower: boolean;
  bannerUrl: string | null;
  termsUrl: string | null;
  termsBackgroundUrl: string | null;
  termsUIInfo: string | null;
  termsType: TermsType | null;
  winnerCount: number;
  lotteryType: LotteryType;
  minMentionCount: number;
  fontColor: string | null;
  boxColor: string | null;
  boxOpacity: number | null;
  publishBanner: boolean;
  filterText: string | null;
  publishTerms: boolean;
  turnOffCommenting: boolean;
  startTime: number;
  bannerTitle: string | null;
  successFollowerMessage: string;
  includeTerms: boolean;
  includeBanner: boolean;
}

export interface ICreateFollowerLotteryInfo {
  winnerCount: number;
  followerLotteryType: FollowerLotteryType;
  announcementAndBanner: ICreateAnnouncementAndBannerInfo | null;
}

export interface ILotterySponsor {
  userName: string;
  pk: number;
  profileUrl: string;
}

export interface IShortPostInfo {
  postId: number;
  thumbnailMediaUrl: string;
  createdTime: number;
}

export interface IShortPageInfo {
  pk: number;
  userProfile: string;
  username: string;
}

export interface IFollowerLottery {
  winnerCount: number;
  followerLotteryType: FollowerLotteryType;
}

export interface ICreateFollowerLottery extends IFollowerLottery {
  announcementAndBanner: ICreateAnnouncementAndBannerInfo | null;
}

export interface IGetTermsAndConditionInfo {
  background: IBackgroundInfo[];
  terms: string | null;
  backgroundType: TermsType;
  isActive: boolean;
}

export interface IGetLastTermsUi {
  instagramerId: number;
  info: string;
  termsType: TermsType;
  backgroundUrl: string;
}

export interface IGetLastBanner {
  fontColor: string;
  boxColor: string;
  boxOpacity: number;
  bannerUrls: string[];
}

export interface IGetDoneTermsAndCondition {
  background: IBackgroundInfo;
  terms: string;
}

export interface IBackgroundInfo {
  type: TermsType;
  backgroundId: number;
  deg: number;
  firstHexBackground: { hex: string };
  secondHexBackground: { hex: string };
  firstPercentageColor: number;
  secondPercentageColor: number;
  boxBackgroundColor: { rgb: { r: number; g: number; b: number } };
  fontBoxColor: { rgb: { r: number; g: number; b: number } };
  textBoxOpacity: number;
  fontOpacity: number;
  svgSrc: string;
}

export interface ICreateTermsAndConditionInfo {
  background: IBackgroundInfo;
  terms: string | null;
}

export interface IPreviousPictureAnalysis {
  hashtags: [];
  thumbnailMediaUrl: string;
  createdTime: bigint;
  instagramerId: number;
}

export interface IPreviousPageAnalysis {
  hashtags: [];
  profileUrl: string;
  username: string;
  fullName: string;
  instagramerId: number;
}

export interface IAutoInterAction {
  followerRequest: number;
  likeAllComments: number;
  likeFollowerPosts: number;
  unfollowAllUnfollowers: number;
  unfollowAllFollowing: number;
}

/** Was IHashtag in page/tools/tools.ts */
export interface IToolsHashtag {
  hashtagList: HashtagListItem[] | null;
  lastPictureAnalysisHashtags: IPictureAnalysisHashtags[];
  lastPageAnalysisHashtags: IPageAnalysisHashtags[];
}

export interface IPageAnalysisHashtags {
  hashtags: string[];
  username: string;
  fullName: string;
  profileUrl: string;
  createdTime: number;
  pk: number;
  id: number;
}

export interface IPictureAnalysisHashtags {
  hashtags: string[];
  thumbnailMediaUrl: string;
  createdTime: number;
  id: number;
}

export interface CreateHashtagListItem {
  listName: string;
  hashTags: string[];
}

export interface HashtagListItem {
  listName: string;
  hashtags: string[];
  listId: number;
}

export interface ITrendHashtag {
  name: string;
  mediaCount: number;
  hashtagId: number;
  pointId: number;
}

export interface IShortHashtag {
  id: number;
  name: string;
  mediaCount: number;
  profilePicture: string;
}

export interface IGetTermsAndBannerInfo {
  backgrounds: IGetTermsAndConditionInfo;
  banners: IGetAnnouncementAndBannerInfo;
}

export interface IFollowRequest_UpdateCondotion {
  reAcceptFollower: boolean;
  isPaused: boolean;
}

export interface ILikeComment_UpdateCondotion {
  includeClicked: boolean;
  isPaused: boolean;
}

export interface IUnFollowAllFollowing_UpdateCondotion {
  isPaused: boolean;
  waitSeconds: number;
}

export interface ILastPost_UpdateCondotion {
  includeClicked: boolean;
  isPaused: boolean;
  maxLikeCount: number;
}

export interface IFollowRequest_Condotion extends IFollowRequest_UpdateCondotion {
  instagramerId: number;
  lastUpdateTime: number;
}

export interface ILastPost_Condotion extends ILastPost_UpdateCondotion {
  instagramerId: number;
  lastUpdate: number;
}

export interface ILikeComment_Condotion extends ILikeComment_UpdateCondotion {
  instagramerId: number;
  lastUpdate: number;
}

export interface IUnFollowAllFollowing_Server_Condotion extends IUnFollowAllFollowing_UpdateCondotion {
  lastUpdate: number;
  lastDone: number;
  instagramerId: number;
}

export interface IUnFollowAllFollowing_Client_Condotion {
  lastUpdate: number;
  lastDone: number;
  instagramerId: number;
  isPaused: boolean;
  waitDays: number;
}

export interface IFollowRequest_AcceptedFollower {
  acceptedFollowerId: number;
  acceptedCount: number;
  instagramerId: number;
  createdTime: number;
  packageStr: string;
  username: string;
  pk: number;
  fullName: string;
  profileUrl: string;
}

export interface ILikeComment_GetLikeComments {
  acceptedFollowerId: number;
  acceptedCount: number;
  instagramerId: number;
  createdTime: number;
  packageStr: string;
  username: string;
  pk: number;
  fullName: string;
  profileUrl: string;
}

export interface ILikeComment_GetLikeFollowers {
  likeFollowerId: number;
  instagramerId: number;
  createdTime: number;
  username: string;
  pk: number;
  fullName: string;
  profileUrl: string;
}

export interface IUnFollowAllFollowing_GetUnFollowing {
  instagramerId: number;
  createdTime: number;
  unFollowCount: number;
  packageStr: string;
  id: number;
  pk: number;
  fullName: string;
  username: string;
  profileUrl: string;
}

export interface IFollowRequest_Figure extends SuperFigure {}
export interface ILikeComment_Figure extends SuperFigure {}
export interface ILastPost_Figure extends SuperFigure {}
export interface IUnFollowAllFollowing_Figure extends SuperFigure {}

export interface IShareremainingTime {
  backgroundUrl: string;
  timeUnix: number;
  lotteryId: number;
  textColor: string;
  boxColor: string;
  boxOpacity: number;
  textOpacity: number;
}
// #endregion Page - Tools

// #region PSG
export interface IBasePackage {
  instagramerId: number;
  beginUnix: number;
  endUnix: number;
}

export interface IPackageFeature {
  instagramerId: number;
  featureId: number;
  count: number;
  maxCount: number;
  createdTimeUnix: number;
  beginUnix: number;
  endUnix: number;
  id: number;
  ids: number[];
}

export interface IReserveFeature {
  instagramerId: number;
  featureId: PsgFeatureType;
  count: number;
  maxCount: number;
  createdTimeUnix: number;
  beginUnix: number;
  endUnix: number;
  unExpired: boolean;
  unLimited: boolean;
  id: number;
  ids: number[];
}

export interface IPsgFeature {
  featureId: PsgFeatureType;
  packageFeature: IPackageFeature | null;
  reserveFeature: IReserveFeature | null;
}

export interface IPsgFeatureInfo {
  followerCount: number;
  instagramerId: number;
  basePackage: IBasePackage | null;
  features: IPsgFeature[];
}

export interface IBaseFeature {
  id: PsgFeatureType;
  packagePriceType: PriceType;
  featureId: number;
  count: number;
  sliceMonth: boolean;
}

export interface IBasePackagePrice {
  accountType: number;
  price: number;
  id: number;
  packageMonthDuration: number;
  priceType: PriceType;
  description: string;
  minFollowerCount: number;
  maxFollowerCount: number;
  features: IBaseFeature[];
  discount: number | null;
}

export interface IReserveFeaturePrices {
  price: number;
  priceType: PriceType;
  reserveFeatureId: number;
  description: string;
  businessType: null;
  featureId: PsgFeatureType;
  count: number | null;
  seconds: number | null;
  minFollower: number | null;
  discount: number | null;
}
// #endregion PSG

// #region Push Notifications
export interface PushNotif extends NavBaseNotif {
  InstagramerId: number | number;
  IsNavbar: boolean;
  Message: string | null;
  ResponseType: PushResponseType;
  UserId: number | null;
}

export interface NavBaseNotif {
  ProfileUrl: string;
  RedirectUrl: string;
  Username: string | null;
  CreatedTime: number;
}
// #endregion Push Notifications

// #region Search Bar
export interface CategoryItemsModel {
  profileUrl: string;
  username: string;
  title: string;
  ads: boolean;
  type: string | null;
}

export interface CheckBoxModel {
  value: string;
  checked: boolean;
}

export interface HashtagItemsModel {
  hashtags: string;
}

export interface RecentSearchesModel {
  recentSearchs: string;
}

export interface SearchBarModel {
  searchContent: SearchContentModel;
  searchFilter: SearchFilterModel;
}

export interface SearchContentModel {
  categoryItems: CategoryItemsModel[];
  hashtagsItems: HashtagItemsModel[];
  stores: StoresModel[];
  recentSearchs: RecentSearchesModel[];
}

export interface SearchFilterModel {
  chekBox: CheckBoxModel[];
}

export interface StoresModel {
  profileUrl: string;
  title: string;
  point: number;
}
// #endregion Search Bar

// #region Setting
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
  ownerInbox: IDirectOwnerInbox;
  tickets: IPlatformTicket[];
  nextMaxId: string | null;
}

export interface ITicketInsights {
  actionStatus: StatusReplied;
  count: number;
}

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

export interface IAiModels {
  texModels: {
    name: string;
    id: AiTextModel;
    input: number;
    output: number;
  }[];
  voiceModels: {
    name: string;
    id: AiVoiceModel;
    input: number;
    output: number;
  }[];
}

export interface IGetAiModel {
  fbId: number;
  aiTextModel: AiTextModel;
  aiImageModel: number;
  aiVoice2TextModel: AiVoiceModel;
  aiText2VoiceModel: AiVoiceModel;
  aiVideoModel: number;
  aiVectorGenModel: number;
  isDirectImageSupport: boolean;
  isDirectVoiceSupport: boolean;
  businessType: BusinessType;
  countryCode: string;
}

export interface IGeneralAiModels {
  aiTextModel: AiTextModel;
  aiVoice2TextModel: AiVoiceModel;
  isDirectVoiceSupport: boolean;
}
// #endregion Setting

// #region Store
export interface IOrderPushNotifExtended {
  Order: IOrderPushNotifByStatusItemOrder;
  UserProfile: IPushNotifUserProfile;
  BusinessProfile: IPushNotiBusiness;
  NewStatus: number; // Using number instead of OrderStep enum
}
export interface IPushNotifUserProfile {
  PhoneNumber: string;
  Username: string;
  FullName: string;
  ProfileUrl: string;
  GoogleProfile: string | null;
  GoogleEmail: string | null;
  GoogleName: string | null;
}
export interface IPushNotiBusiness {
  IsSuspend: boolean;
  Username: string;
  ProfileUrl: string;
  FullName: string;
  FollowerCount: number;
  CountryId: number;
  BannerUrl: string | null;
  FullShop: IFullShop | null;
  Banners: IBanner[] | null;
  FullAdvertise: [] | null;
  FullVShop: [] | null;
  InstagramerId: number;
  FbId: number;
  PriceType: PriceType;
  BusinessType: BusinessType;
}
export interface IOrderPushNotifByStatusItemOrder {
  ItemCount: number;
  ShopAddressId: number;
  TrackingId: string | null;
  State: string | null;
  City: string | null;
  LogesticId: LogisticType | null;
  DeliveryType: ParcelPocketDeliveryType;
  ShortShop: IShopShortShop | null;
  Id: string;
  InvoiceId: string;
  CreatedTime: number;
  FbId: number;
  UserId: number;
  Status: number;
  StatusUpdateTime: number;
  TotalPrice: number;
  ExpireTime: number;
  PriceType: PriceType;
  Source: number;
}

export interface ILog {
  createdTime: number;
  location: string;
  workLevel: number;
  postMan: { profileUrl: string; name: string } | null;
}

export interface IParcelInfo {
  orderId: string;
  acceptTime: number;
  endTime: number;
  price: number;
  priceType: PriceType;
  sender: string;
  receiver: string;
  weight: number;
  isRejected: boolean;
  lastWorkLevel: number;
  lastUpdateTime: number;
  logesticType: number;
  logs: ILog[];
  from: string;
  to: string;
  id: string;
}

export interface IProduct_Candidate {
  postId: number;
  thumbnailMediaUrl: string;
  instagramerId: number;
  likeCount: number;
  isCandidate: boolean;
  productId: number | null;
  createdTime: number;
  viewCount: number;
  shareCount: number;
  commentCount: number;
  productTempId: number | null;
  postTempId: number;
}

export interface IProduct_ShortProduct {
  instagramerId: number;
  productId: number;
  tempId: number;
  variationCount: number;
  minStock: number;
  maxStock: number;
  productInId: number | null;
  thumbnailMediaUrl: string;
  postId: number;
  weight: number;
  availabilityStatus: AvailabilityStatus;
  minPrice: number;
  maxPrice: number;
  priceUnit: number;
  title: string | null;
  lastUpdate: number;
  inCardCount: number;
  priceType: PriceType;
}

export interface IProduct_MainCategory {
  isSecondary: boolean;
  isBrand: boolean;
  isColorVariation: boolean;
  children: IProduct_MainCategory[];
  id: number;
  name: string;
  langValue: string;
}

export interface IProduct_SecondaryCategory {
  dependentCategories: IDependentCategory[];
  brandCategories: IBrandCategory[];
}

export interface IBrandCategory {
  categoryId: number;
  brandId: number;
  langValue: string;
  name: string;
}

export interface IColorCategory {
  categoryId: number;
  colorId: number;
  hexCode: string;
  language: number;
  langValue: string;
}

export interface IDependentCategory {
  id: number;
  name: string;
  langValue: string;
}

export interface IProduct_Variation {
  variations: IVariation[];
  colorCategories: IColorCategory[];
}

export interface IVariation {
  langValue: string;
  id: number;
  title: string;
  categoryId: number;
  variations: IDetailedVariation[];
}

export interface IDetailedVariation {
  variationTitleId: number;
  variationId: number;
  categoryId: number;
  langValue: string;
  name: string;
  language: StoreLanguage;
}

export interface ISummaryProduct {
  productUrl: string;
  productName: string;
  productId: number;
  productPrice: number;
  productWeight: number;
  productSize: string[];
  productColor: string[];
  productStock: number;
  productActive: boolean;
}

export interface IProduct_CreateInstance {
  productId: number;
  title: string;
  evat: number;
  deliveryInfo: {
    weight: number | null;
    productBox: IProductBox | null;
    productEnvelope: {
      envelopeAvailableCount: number;
    } | null;
    deliveryType: ParcelPocketDeliveryType;
  };
  breakable: boolean;
  isLiquid: boolean;
  availabilityStatus: AvailabilityStatus;
  gauranteeStatus: GauranteeStatus;
  orginalityStatus: OrginalityStatus;
  gauranteeLength: GauranteeLength;
  maxInEachCard: number;
  readyForShipDayLong: number;
  categoryId: number;
  subCategoryId: number | null;
  brandId: number | null;
  isColorVariation: boolean;
  customTitleVariation: string | null;
  variationTitles: number[];
  specificationItems: {
    customSpecification: ICustomSpecificationItem | null;
    defaultSpecification: ISpecificationItem | null;
  }[];
  descriptions: string | null;
}

export interface IMaxSize {
  supportEnvelope: boolean;
  maxEnvelopeWeight: number;
  supportBox: boolean;
  limitBox: ILimitBox;
}

interface ILimitBox {
  length: number;
  width: number;
  height: number;
  totalLength: number;
  weight: number;
  supportSack: boolean;
  supportLiquid: boolean;
  supportBreakable: boolean;
  volume: number;
}

export interface IProduct_Setting {
  weight: number | null;
  productBox: IProductBox | null;
  availabilityStatus: AvailabilityStatus;
  gauranteeStatus: GauranteeStatus;
  maxInEachCard: number;
  readyForShipDayLong: number;
  guaranteeLenght: number;
  isLiquid: boolean;
  orginalityStatus: OrginalityStatus;
  breakable: boolean;
  deliveryType: ParcelPocketDeliveryType;
  envelopeAvailableCount: number | null;
  maxSize: IMaxSize | null;
}

export interface IProduct_Varisation_Client {
  subProducts: ISubProduct_Create[];
  categoryId: number;
}

export interface IProduct_CreateSubProduct {
  productId: number;
  subProducts: ISubProduct_Create[];
  deActiveSubProducts: number[];
}

export interface ISubProduct_Create {
  customVariation: string | null;
  colorVariation: number | null;
  variations: IVariation_Create[];
  stock: number;
  disCount: IDisCount | null;
  price: number;
}

export interface ISubProduct_CreateForInstance {
  customVariation: string | null;
  colorVariation: string | null;
  stock: number;
  disCount: IDisCount | null;
  price: number;
  id: number | null;
  productInId: number | null;
  createdTime: number | null;
  isActive: boolean;
  priceType: number;
  variations: ITitleVariationVariation[];
  colorId: number | null;
}

export interface ICreateInstance_ForVariation {
  customTitleVariation: string | null;
  isColorVariation: boolean | null;
  variationTitles: number[];
}

export interface ICreateInstance_ForSpecification {
  isColorVariation: boolean | null;
  variationTitles: number[];
  specificationItems: {
    customSpecification: ICustomSpecificationItem | null;
    defaultSpecification: ISpecificationItem | null;
  }[];
}

export interface IDisCount {
  value: number;
  maxCount: number | null;
  maxTime: number | null;
}

export interface IDiscount_ForClient extends IDisCount {
  index: number;
}

export interface IVariation_Create {
  variationTitleId: number;
  variationId: number;
}

export interface ILastCategory {
  categoryId: number | null;
  subCategoryId: number | null;
  brandId: number | null;
}

export interface ICustomSpecificationItem {
  key: string;
  value: string;
}

export interface IProductBox {
  width: number;
  height: number;
  length: number;
  isSack: boolean;
}

export interface ISpecificationItem {
  variationTitle: number;
  value: number;
}

export interface IGeneralInfo {
  createInstance: IGenera_CreateInstance;
  mainCategory: IProduct_MainCategory[];
  secondaryCategory: IProduct_SecondaryCategory;
  suggestionKey: string | null;
}

export interface IGenera_CreateInstance {
  brandId: number | null;
  subcategoryId: number | null;
  title: string;
  productId: number;
  categoryId: number;
}

export interface IProduct_FullProduct {
  shortProduct: IProduct_ShortProduct;
  productInstance: IProductInstance;
  specifications: IProductSpecification[];
  secondaryInfo: ISecondaryInfo;
  subProducts: ISubProduct_Info[];
  titleVariations: ITitleVariation_WithVarition[];
  medias: IMeidaInstance[];
  postChildrenMedias: any[];
}

/** Was ISpecification in store/IProduct.ts */
export interface ISuggestedCategory {
  categoryId: number;
  subCategoryId: number | null;
}
export interface IProductSpecification {
  id: string;
  index: number;
  defaultSpecification: ISpecification_Default | null;
  customSpecification: ISpecification_Custome | null;
  specificationType: number;
}

export interface IProduct_LastSpecification {
  shortProduct: IProduct_ShortProduct;
  customSpecifications: ISpecification_Custome[];
  specifications: ISpecification_Default[];
}

export interface ISpecification_Default extends ISpecification_Custome {
  variationId: number;
  variationTitleId: number;
  language: number;
}

export interface ISpecification_Custome {
  id: number;
  key: string;
  value: string;
  productInId: number;
}

export interface IProductInstance {
  productInId: number;
  productId: number;
  title: string;
  brandId: number | null;
  categoryId: number;
  isColorVariation: boolean;
  orginalityStatus: OrginalityStatus;
  createdTime: number;
  lastUpdate: number;
  language: StoreLanguage;
  subCategoryId: number | null;
  categoryLangValue: string;
  subCategoryLangValue: string | null;
  brandLangValue: string | null;
  customVariation: string | null;
  sendWithPost: boolean;
}

export interface ISecondaryInfo {
  isBreakable: boolean;
  isLiquid: boolean;
  insurance: boolean;
  evat: number;
  maxInEachCard: number;
  readyForShipDays: number;
  weight: number | null;
  gaurantee: GauranteeStatus;
  garanteeLength: GauranteeLength;
  description: string | null;
  deliveryInfo: {
    boxSize: BoxSize | null;
    deliveryType: ParcelPocketDeliveryType;
    envelopeAvailableCount: number | null;
    id: number;
    productInId: number;
  };
}

/** Shared BoxSize — same in store/IProduct.ts and store/orders.ts */
export interface BoxSize {
  id: number;
  productInId: number;
  width: number;
  height: number;
  length: number;
  isSack: boolean;
  createdTime: number;
}

export interface ISubProduct_Info {
  id: number;
  productInId: number;
  createdTime: number;
  isActive: boolean;
  stock: number;
  price: number;
  priceType: number;
  customVariation: string | null;
  variations: ISubProductVariation[];
  colorVariation: string | null;
  disCount: IDisCount_Info | null;
  colorId: number | null;
}

export interface IDisCount_Info {
  id: number;
  value: number;
  useCount: number;
  maxUseCount: number | null;
  maxTime: number | null;
  isActive: boolean;
  productInId: number;
  subProductId: number;
}

export interface ISubProductVariation {
  id: number;
  subProductId: number;
  productInId: number;
  variationId: number;
  titleVariation: ITitleVariation;
  variation: ITitleVariationVariation;
}

export interface ITitleVariation {
  id: number;
  productInId: number;
  variationTitleId: number;
  createdTime: number;
  langValue: string;
}

export interface ITitleVariation_WithVarition extends ITitleVariation {
  variations: ITitleVariationVariation[];
}

export interface ITitleVariationVariation {
  variationTitleId: number;
  variationId: number;
  categoryId: number;
  langValue: string;
  language: StoreLanguage;
}

export interface IProduct_Information {
  caption: string;
  description: string;
  sizeTable?: string;
  tableTitle?: string;
}

export interface ITempIdAndNonProductCount {
  lastTempId: number;
  nonProductCount: number;
}

export interface ISuggestedPrice {
  price: number;
  title: string;
  key: string;
}

export interface ISuggestedMedia {
  medias: { key: string; url: string; mediaId?: number | null }[];
}

export interface IProduct_Media extends IUploadMedia {
  isHidden: boolean;
  childrenId: number | null;
  isDefault: boolean;
  fromSuggestion?: boolean;
  key: string | null;
  suggestedIndex?: number;
  isUploading: boolean;
  uploadProgress: number;
}

export interface IUploadMedia {
  base64Url: string;
  mediaType: number;
  thumbnailMediaUrl: string;
  index: number;
}

export interface IMeidaInstance {
  childMedia: IChildMediaInstance | null;
  customMedia: ICustomeMediaInstance | null;
  index: number;
  isHidden: boolean;
  mediaType: number;
}

export interface IMediaInstanceInfo extends IMeidaInstance {
  uploadMedia: IUploadMedia | null;
  isUploading?: boolean;
  uploadProgress?: number;
}

export interface ICustomeMediaInstance {
  createdTime: number;
  id: number;
  index: number;
  isHidden: boolean;
  mediaType: number;
  mediaUrl: string;
  productId: number;
  isSuggested: boolean;
  thumbnailMediaUrl: string;
  key: string | null;
}

export interface IChildMediaInstance {
  childrenId: number;
  index: number;
  isHidden: boolean;
  mediaType: number;
  mediaUrl: string;
  postId: number;
  thumbnailMediaUrl: string;
  userTags: any;
  orderId: number;
}

export interface IDefaultMedia {
  childrenId: number;
  isHidden: boolean;
  index: number;
}

export interface ICustomMedia {
  id: number;
  isHidden: boolean;
  index: number;
}

export interface IProduct_UpdateChildrenMedia {
  items: IDefaultMedia[];
}

export interface IProduct_Update {
  subProductId: number;
  stock: number;
  price: number;
}

export interface IProduct_SettingUpdate {
  isBreakable: boolean;
  isLiquid: boolean;
  maxInEachCard: number;
  readyForShipDayLong: number;
  gauranteeStatus: GauranteeStatus;
  gauranteeLength: GauranteeLength;
  description: string;
  availabilityStatus: number;
  deliveryInfo: {
    weight: number | null;
    deliveryType: ParcelPocketDeliveryType;
    productEnvelope: {
      envelopeAvailableCount: number;
    } | null;
    productBox: {
      width: number;
      height: number;
      length: number;
      isSack: boolean;
    } | null;
  };
}

export interface ISpecificationOrder {
  items: {
    index: number;
    variationId: number | null;
    customSpecificationId: number | null;
  }[];
}

export interface IGetSuggestedPrice {
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
}

/** Common key-value specification (shared across store/orders, userPanel/orders, userPanel/shop) */
export interface ISpecification {
  key: string;
  value: string;
}

export interface IOrderByStatus {
  items: IOrderByStatusItem[];
  nextMaxId: string | null;
}

export interface IOrderByStatusItem {
  order: IOrderByStatusItemOrder;
  businessProfile: IBusiness | null;
  userProfile: IUserProfile | null;
}
export interface IUserProfile {
  phoneNumber: string;
  username: string;
  fullName: string;
  profileUrl: string;
  googleProfile: string | null;
  googleEmail: string | null;
  googleName: string | null;
}
export interface IOrderByStatusItemOrder {
  itemCount: number;
  shopAddressId: number;
  trackingId: string | null;
  state: string | null;
  city: string | null;
  logesticId: LogisticType | null;
  deliveryType: ParcelPocketDeliveryType;
  shortShop: IShopShortShop | null;
  id: string;
  invoiceId: string;
  createdTime: number;
  fbId: number;
  userId: number;
  status: OrderStep;
  statusUpdateTime: number;
  totalPrice: number;
  expireTime: number;
  priceType: PriceType;
  source: number;
}

/** Was IUserInfo in store/orders.ts */
export interface IOrderUserInfo {
  phoneNumber: string;
  username: string | null;
  fullName: string | null;
  profileUrl: string;
}

export interface IOrderDetail {
  orderId: string;
  userId?: number;
  instagramerId?: number;
  shippingRequestType?: ShippingRequestType;
  trackingId?: string | null;
}

export interface DeliveryInfo {
  id: number;
  productInId: number;
  deliveryType: ParcelPocketDeliveryType;
  envelopeAvailableCount?: any;
  boxSize: BoxSize;
}

export interface Variation {
  variationTitleId: number;
  variationId: number;
  categoryId: number;
  langValue: string;
  name: string;
  language: number;
}

/** Was IVariation in store/orders.ts (sub-product variation link) */
export interface IOrderVariationLink {
  id: number;
  subProductId: number;
  productInId: number;
  variationId: number;
  titleVariation: ITitleVariation;
  variation: Variation;
}

export interface DisCount {
  id: number;
  value: number;
  useCount: number;
  maxUseCount: number;
  maxTime: number;
  isActive: boolean;
  productInId: number;
  subProductId: number;
}

/** Was ISubProduct in store/orders.ts */
export interface IStoreSubProduct {
  id: number;
  productInId: number;
  createdTime: number;
  isActive: boolean;
  stock: number;
  price: number;
  stockId: number;
  priceId: number;
  priceType: number;
  customVariation: string;
  variations: IOrderVariationLink[];
  colorVariation?: string;
  disCount: DisCount;
  colorId?: number;
}

export interface CustomMedia {
  createdTime: number;
  thumbnailMediaUrl: string;
  mediaUrl: string;
  id: number;
  productId: number;
  index: number;
  isHidden: boolean;
  isSuggested: boolean;
  mediaType: number;
}

/** Was IMedia in store/orders.ts */
export interface IStoreMedia {
  customMedia: CustomMedia;
  index: number;
  isHidden: boolean;
  childMedia?: any;
  mediaType: number;
}

export interface ICustomSpecification {
  id: number;
  key: string;
  value: string;
  productInId: number;
  index: number;
}

/** Was IShortShop in store/orders.ts and userPanel/orders.ts (same structure) */
export interface IOrderShortShop {
  lastUpdate: number;
  instagramerId: number;
  username: string;
  fullName: string | null;
  productCount: number;
  followerCount: number;
  bannerUrl: string;
  priceType: number;
  profileUrl: string;
}

/** Was ICompleteProduct in store/orders.ts */
export interface IStoreCompleteProduct {
  shortProduct: IStoreOrderShortProduct;
  productInstance: IProductInstance;
  secondaryInfo: ISecondaryInfo;
  subProducts: IStoreSubProduct[];
  titleVariations: ITitleVariation_WithVarition[];
  medias: IStoreMedia[];
  specifications: IProductSpecification[];
}

/** Was IItem in store/orders.ts */
export interface IStoreOrderLineItem {
  orderId: string;
  subProductId: number;
  productId: number;
  productInId: number;
  count: number;
  stockId: number;
  priceId: number;
  discountId: number;
}

/** Was IOrderItem in store/orders.ts */
export interface IStoreOrderItem {
  completeProduct: IStoreCompleteProduct;
  items: IStoreOrderLineItem[];
}

export interface IOrder {
  itemCount: number;
  shortShop?: IOrderShortShop;
  userInfo?: IOrderUserInfo;
  state: string;
  city: string;
  logesticId: number;
  deliveryType: ParcelPocketDeliveryType;
  id: string;
  invoiceId: string;
  createdTime: number;
  instagramerId: number;
  userId: number;
  status: number;
  statusUpdateTime: number;
  totalPrice: number;
  priceType: number;
}

export interface IAddress {
  userId: number;
  id: number;
  isActive: boolean;
  isDefault: boolean;
  subject: string;
  note: string;
  receiver: string;
  url?: string;
  countryCode: string;
  state: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  postalCode: string;
  isPostalCodeUnqiue: boolean;
}

export interface ISubInvoice {
  id: string;
  invoiceId: string;
  itemType: number;
  price: number;
  priceType: number;
  cardNumber?: any;
}

export interface OrderInvoice {
  orderId: string;
  invoiceId: string;
  instagramerId: number;
  userId: number;
  prePaidLogesticId?: any;
}

export interface IInvoice {
  id: string;
  priceType: number;
  createdTime: number;
  accountId: number;
  successTransactionId?: number;
  accountType: number;
  expireTime: number;
  status: number;
  invoiceType: number;
  amount: number;
  subInvoices: ISubInvoice[];
  orderInvoice: OrderInvoice;
  packageInvoice?: any;
  customInvoices?: any;
}

export interface IBoxSize {
  orderId: string;
  boxId: string;
  length: number;
  width: number;
  height: number;
  weight: number;
}

/** Was IFullProduct in store/orders.ts */
export interface IOrderFullProduct {
  orderItems: IStoreOrderItem[];
  order: IOrder;
  address: IAddress;
  productCoupon?: string;
  invoice: IInvoice;
  box?: IBoxSize;
  systemTicketId: string | null;
  businessProfile: IBusiness | null;
  userProfile: IUserProfile | null;
}

export interface ILog {
  createdTime: number;
  location: string;
  workLevel: number;
  postMan: { profileUrl: string; name: string } | null;
}

export interface IParcelInfo {
  orderId: string;
  acceptTime: number;
  endTime: number;
  price: number;
  priceType: PriceType;
  sender: string;
  receiver: string;
  weight: number;
  isRejected: boolean;
  lastWorkLevel: number;
  lastUpdateTime: number;
  logesticType: number;
  logs: ILog[];
  from: string;
  to: string;
  id: string;
}

/** Was IStatisticsInfo in store/statistics.ts */
export interface IStoreStatisticsInfo {
  totalSalesStatistics: ISaleShortMonth[];
  twoMonth: ISaleMonth[];
  totalSalesReport: ITotalSalesReport[];
}

export interface ISaleMonth {
  month: number;
  totalCount: number;
  year: number;
  plusCount: number;
  lastUpdate: number | null;
  previousPlusCount: undefined;
  dayList: DayCountUnix[];
  users: StatisticsUser[];
  totalIncom: number;
}

export interface ISaleShortMonth {
  month: number;
  plusCount: number;
  totalCount: number;
  year: number;
  totalIncome: number;
}

export interface ITotalSalesReport {
  saleId: number;
  seller: {
    fullname: string;
    profileUrl: string;
    username: string;
  };
  saleType: MarketAdsType;
  date: number;
  fee: number;
  statusType: StatusType;
}

export interface INewOrder {
  orderId: number;
  orderNumber: number;
  productName: string;
  productUrl: string;
  subOrder: ISubOrder[] | null;
}

export interface IComplete extends INewOrder {}

export interface IInProgress extends INewOrder {
  orderProcedure: OrderProcedure;
}

export interface IFailed extends INewOrder {
  orderProcedure: OrderProcedure;
}

export interface IOrderStatus extends IOrderInfo {
  orderProcedure: OrderProcedure;
  orderProcedureStatus: OrderProcedureStatus;
}

export interface IShowSettingInfo extends IOrderInfo {
  index: number;
}

export interface IOrderInfo {
  orderId: number;
  orderType: OrderType;
}

interface ISubOrder {
  childrenOrderId: number;
  productName: string;
  productUrl: string;
}
// #endregion Store

// #region UserPanel
export interface IBusiness {
  isSuspend: boolean;
  username: string;
  profileUrl: string;
  fullName: string;
  followerCount: number;
  countryId: number;
  bannerUrl: string | null;
  fullShop: IFullShop | null;
  banners: IBanner[] | null;
  fullAdvertise: [] | null;
  fullVShop: [] | null;
  instagramerId: number;
  fbId: number;
  priceType: PriceType;
  businessType: BusinessType;
}

export interface IFavoriteBusiness {
  items: { product: IProductCard | null; businessProfile: IBusiness }[];
  nextMaxId: number | null;
}

export interface IBusinessResponse {
  items: IBusiness[];
  nextMaxId: string;
}

/** Was IUserInfo in userPanel/login.ts */
export interface ILoginUserInfo {
  phoneNumber: string;
  username: string;
  fullName: string | null;
  profileUrl: string;
}

export interface IIpCondition {
  code: string;
  isShaparakAuthorize: boolean;
  isFacebookAuthorize: boolean;
  isInstagramAuthorize: boolean;
}

/** Was IOwnerInbox in userPanel/message.ts */
export interface ITicketOwnerInbox {
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

/** Was IItem in userPanel/message.ts */
export interface IUserTicketItem {
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
  items: IUserTicketItem[];
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
  Items: IUserTicketItem[];
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
  ownerInbox: ITicketOwnerInbox;
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

export interface ICreateSystemTicket {
  text: string | null;
  imageUrl: string | null;
  itemType: ITicketMediaType;
}

/** Was IShortProduct in store/orders.ts */
export interface IStoreOrderShortProduct {
  username: string | undefined;
  maxInEachCard: number;
  instagramerId: number;
  productId: number;
  tempId: number;
  variationCount: number;
  minStock: number;
  maxStock: number;
  productInId: number;
  thumbnailMediaUrl: string;
  postId: number;
  weight: number;
  availabilityStatus: AvailabilityStatus;
  minPrice: number;
  maxPrice: number;
  maxDiscountPrice: number;
  minDiscountPrice: number;
  priceType: PriceType;
  lastUpdate: number;
  title: string;
  categoryId: number;
}

/** Was ISubProduct in userPanel/orders.ts */
export interface IUserSubProduct {
  subProductId: number;
  colorId: number;
  variations: string[];
  customVariation?: string;
  stock: number;
  price: number;
  priceType: PriceType;
  cardCount: number;
  mainPrice: number;
}

/** Was IShortProduct in userPanel/orders.ts */
export interface IUserOrderShortProduct {
  username: string | undefined;
  maxInEachCard: number;
  instagramerId: number;
  productId: number;
  tempId: number;
  variationCount: number;
  minStock: number;
  maxStock: number;
  productInId: number;
  thumbnailMediaUrl: string;
  postId: number;
  weight: number;
  availabilityStatus: AvailabilityStatus;
  minPrice: number;
  maxPrice: number;
  maxDiscountPrice: number;
  minDiscountPrice: number;
  priceType: PriceType;
  lastUpdate: number;
  title: string;
  categoryId: number;
}

/** Was ICompleteProduct in userPanel/orders.ts */
export interface IUserCompleteProduct {
  subProducts: IUserSubProduct[];
  shortProduct: IUserOrderShortProduct;
  shortShop?: IOrderShortShop;
  medias?: string[];
  isColorVariation: boolean;
  readyForShipDays: number;
  gaurantee: boolean;
  gauranteeLength: GauranteeLength;
  maxInEachCard: number;
  variations: string[];
  specifications: ISpecification[];
  productId: number;
  thumbnailMediaUrl: string;
  isFavorite: boolean;
  customVariation?: string;
}

export interface ICardItem {
  instagramerId: number;
  productId: number;
  subProductId: number;
  count: number;
  userId: number;
  createdTime: number;
  completeProduct: IUserCompleteProduct;
}

export interface CardItem {
  userId: number;
  instagramerId: number;
  productId: number;
  subProductId: number;
  count: number;
  createdTime: number;
  completeProduct: IUserCompleteProduct;
}

export interface IUserOrder {
  shopCards: IShopCard[];
  nextMaxId: string;
}

export interface IOptimizedBox {
  length: number;
  width: number;
  height: number;
  weight: number;
  id: string;
  volume: number;
  isOutOfStandard: boolean;
}

export interface IUpdateUserAddress {
  addressId: number;
  subject: string;
  receiver: string;
  note: string;
}

export default interface IUserCoupon {
  couponId: number;
  code: string;
  discount: number;
  expireTime: number;
  isDeleted: boolean;
  useCount: number;
  maxCount: number;
  userId: number | null;
  showInBio: boolean;
  instagramerId: number;
  createdTime: number;
  updateTime: number;
  maxDiscount: number | null;
}

export interface ILogistic {
  id: number;
  backUpId: null;
  optimizedBox: IOptimizedBox | null;
  price: number;
  isBreakable: boolean;
  isLiquid: boolean;
  totalPrice: number;
  weight: number;
  logo: string;
  name: string;
  langName: string;
  url: string;
  isPaymentOnArrival: boolean;
  isShopperGetValue: boolean;
  priceType: PriceType;
  deliveryType: ParcelPocketDeliveryType;
}

export interface ICreateOrder {
  items: {
    subProductId: number;
    cardCount: number;
  }[];
  logesticType: number | null;
  addressId: number;
  couponCode: string;
}

export interface IPartner_User {
  approved: boolean;
  createdTime: number;
  expireTime: number;
  fullName: string | null;
  id: string;
  instagramerId: number;
  pk: string;
  profileUrl: string;
  roles: number[];
  updateTime: number;
  userId: number;
  username: string;
}

/** Was IShortShop in userPanel/shop.ts */
export interface IShopShortShop {
  isSuspend: boolean;
  instagramerId: number;
  priceType: PriceType;
  productCount: number;
}

export interface IFavoriteCardCount {
  cardCount: number;
  isFavorite: boolean;
  productId: number;
}

export interface IProductCard {
  shortProduct: IShopShortProduct;
  favoriteCardCount: IFavoriteCardCount;
}

export interface IProduct {
  products: IProductCard[];
  totalCount: number;
}

export interface IBannerWithOrder {
  url: string;
  orderId: number;
}

export interface IPriceRange {
  maxPrice: number;
  minPrice: number;
}

export interface IShopCategory {
  categoryId: number;
  langValue: string;
  count: number;
}

export interface ITopHashtags {
  hashtagId: number;
  hashtag: string;
  count: number;
}

export interface IFullShop {
  shortShop: IShopShortShop;
  categories: IShopCategory[];
}

export interface IFilterInfo {
  topHashtags: ITopHashtags[];
  priceRange: IPriceRange | null;
}

export interface IFilter {
  minPrice: number;
  maxPrice: number;
  sortProductBy: ProductSortType;
  includeUnavailable: boolean;
}

/** Was ISubProduct in userPanel/shop.ts */
export interface IShopSubProduct {
  subProductId: number;
  colorId: number | null;
  variations: string[];
  customVariation: string | null;
  stock: number;
  price: number;
  priceType: PriceType;
  cardCount: number;
  mainPrice: number;
  remainingDiscountTime: number | null;
}

/** Merged IShortProduct from userPanel/shop.ts (extended version with more fields) */
export interface IShopShortProduct {
  maxInEachCard: number;
  instagramerId: number;
  productId: number;
  tempId: number;
  variationCount: number;
  minStock: number;
  maxStock: number;
  productInId: number;
  thumbnailMediaUrl: string;
  postId: number;
  weight: number;
  availabilityStatus: AvailabilityStatus;
  minPrice: number;
  maxPrice: number;
  maxDiscountPrice: number;
  minDiscountPrice: number;
  priceType: PriceType;
  lastUpdate: number;
  title: string;
  categoryId: number;
  likeCount: number;
  instagramUrl: string;
  caption: string;
  table: string;
}

/** Was IFullProduct in userPanel/shop.ts */
export interface IShopFullProduct {
  subProducts: IShopSubProduct[];
  shortProduct: IShopShortProduct;
  medias: string[];
  isColorVariation: boolean;
  readyForShipDays: number;
  gaurantee: boolean;
  gauranteeLength: GauranteeLength;
  maxInEachCard: number;
  variations: string[];
  specifications: ISpecification[];
  productId: number;
  thumbnailMediaUrl: string;
  isFavorite: boolean;
  customVariation: string | null;
  description: string | null;
}

export interface IVariationComparison {
  key: number;
  value: string;
}

export interface ISelectedProduct {
  colorId: number | null;
  customVariation: string | null;
  constVariation: string[];
  selectedVariation: IVariationComparison[];
}

export interface IAddToCard {
  subProductId: number;
  stock: number;
  price: number;
}

export interface IShopCard extends IOrderShortShop {
  totalDiscountPrice: number;
  totalPrice: number;
  bannerUrl: string;
  cardCount: number;
  products?: IUserCompleteProduct[];
}
// #endregion UserPanel

// #region MockData
export interface PackageExtension {
  id: number;
  duration: string;
  price: number;
  priceType: PriceType;
  description: string;
  features: string[];
  includedTokens: number;
  disabled?: boolean;
}

export interface PlanTier {
  model: string;
  level: number;
  followerRange: string;
  minFollowers: number;
  maxFollowers: number;
  prices: {
    month1: number;
    month3: number;
    month6: number;
    month9: number;
    month12: number;
  };
  pricesUsd: {
    month1: number;
    month3: number;
    month6: number;
    month9: number;
    month12: number;
  };
  tokensIncluded: {
    month1: number;
    month3: number;
    month6: number;
    month9: number;
    month12: number;
  };
  features: {
    hasBusiness: boolean;
    hasAI: boolean;
    hasAdvancedAnalytics: boolean;
    hasAIResponse: boolean;
    hasCustomSupport: boolean;
    hasCustomDomain: boolean;
    winnerPickerCount: number;
  };
}

export interface PlanFeature {
  key: string;
  label: string;
}

export interface UserProfileMockData {
  username: string;
  userId: string;
  followerCount: string;
  profileImage?: string;
}

export interface PaymentInfo {
  accountType: number;
  price: number;
  id: number;
  packageMonthDuration: number;
  priceType: PriceType;
  description: string;
  minFollowerCount: number;
  maxFollowerCount: number;
}

export interface TokenPackage {
  id: number;
  tokenCount: number;
  price: number;
  priceUsd: number;
  priceType: PriceType;
  description: string;
  validityDays: number;
  features?: string[];
}

export interface DomainPackage {
  id: number;
  domainType: string;
  price: number;
  priceUsd: number;
  priceType: PriceType;
  description: string;
  features: string[];
}

export interface AIPackage {
  id: number;
  name: string;
  price: number;
  priceType: PriceType;
  duration: number;
  tokenCount: number;
  description: string;
  features: string[];
}

export interface WinnerPickerPackage {
  id: number;
  count: number;
  price: number;
  priceUsd: number;
  priceType: PriceType;
  description: string;
  features?: string[];
}

export interface IPackage {
  sliderRemainingValue: number | null;
  sliderTotalValue: number;
  remainingTime: number | null;
}

export interface UserPackageInfo {
  packageRemainingTime: number;
  packageType: string;
  packageTotalDuration: number;
  packagePassedDuration: number;
  aiPackage: IPackage | null;
  aiReservePackage: IPackage | null;
  customDomainPackage: IPackage | null;
  customDomainReservePackage: IPackage | null;
  lotteryPackage: IPackage | null;
  lotteryReservePackage: IPackage | null;
  followerCount: number;
}
// #endregion MockData

// #region Wallet

export interface IBankCard {
  cardNumber: string;
  accountHolderName: string;
  accountNumber: number | null;
  iban: string;
  swiftBIC: string | null;
  routingNumber: number | null;
  bin: number;
  accountType: string | null;
  createdTime: number | null;
  suspendReasonId: string | null;
  suspendTime: number | null;
  unSuspendTime: number | null;
  suspendMessage: string | null;
  bankName: string;
  bankCountryCode: string;
  bankReasonId: string | null;
  bankSuspendMessage: string | null;
  fbId: number;
  isDefault: boolean;
  isActive: boolean;
  bankBranchSwiftBIC: string | null;
}
