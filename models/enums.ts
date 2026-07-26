// ============================================================
// CENTRALIZED ENUMS FILE
// All enums from the models folder are consolidated here.
// Organized by region/domain for easy navigation.
// ============================================================

// #region _AccountInfo
export enum LoginStatus {
  Initiaize = -1,
  Success = 0,
  BadPassword = 1,
  InvalidUser = 2,
  TwoFactorRequired = 3,
  Exception = 4,
  ChallengeRequired = 5,
  LimitError = 6,
  InactiveUser = 7,
  CheckpointLoggedOut = 8,
  InvalidCredentials = 9,
  OnTest = 100,
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
// #endregion _AccountInfo

// #region Advertise
export enum AdsType {
  PostAd = 0,
  StoryAd = 1,
  CampaignAd = 2,
}

export enum AdsTimeType {
  FullDay = 0,
  SemiDay = 1,
}

export enum RejectedType {
  admin = 0,
  user = 1,
  system = 2,
}

export enum DetailType {
  WatingList = 0,
  UpcomingList = 1,
}

/** Shared between Advertise and Market domains */
export enum BusinessDay {
  Monday = 0,
  Tuesday = 1,
  Wednesday = 2,
  Thursday = 3,
  Friday = 4,
  Saturday = 5,
  Sunday = 6,
}
// #endregion Advertise

// #region AI
export enum ToolType {
  SendTelegramMessage,
  SendSmsirVerification,
}

export enum PromptType {
  General,
  Structured,
  ImageGenerator,
}

export enum InputType {
  Text,
  EnumV1,
  Number,
  Range,
  EnumV2,
  Boolean,
  ImageArray,
  VideoArray,
}
// #endregion AI

// #region ApiModels
/** Merged from ApiModels/FirstPostPage, messages/enum, and page/post/preposts — all identical */
export enum MediaType {
  Image = 1,
  Video = 2,
  Carousel = 8,
}
// #endregion ApiModels

// #region CustomerAds
export enum AdvertiserStatus {
  Verified = 0,
  Rejected = 1,
  Pending = 2,
}

/** Was CategoryType in customerAds/customerAd.ts */
export enum CustomerAdCategoryType {
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

/** Was Steps in customerAds/customerAd.ts */
export enum CustomerAdSteps {
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
// #endregion CustomerAds

// #region HomeIndex
export enum EntryType {
  Ticket = 0,
  Direct = 1,
  Comment = 2,
}

export enum TopTileType {
  LastPost,
  LikeCount,
  NewCommentCount,
  FriendRequestCount,
  Reach,
  NewFollowers,
}
// #endregion HomeIndex

// #region Market
export enum Steps {
  General = 1,
  Information = 2,
  Properties = 3,
  Specification = 4,
  Media = 5,
  Setting = 6,
}
export enum FeatureType {
  FeaturesBox = 0,
  Reviews = 1,
  Announcements = 2,
  OnlineStream = 3,
  LastVideo = 4,
  Products = 5,
  AdsTimeline = 6,
  QandABox = 7,
  LinkShortcut = 8,
  ContactAndMap = 9,
  Banner = 10,
}

/** Was PriceType in market/enums.ts — different from components/priceFormater PriceType */
export enum MarketPriceType {
  Dollar = 0,
  Rial = 1,
  Toman = 2,
}

export enum PriceFormaterClassName {
  PostPrice = "postprice",
  PostPriceRed = "postpricered",
  PostPriceBlue = "postpriceblue",
}

/** Was AdsType in market/enums.ts — different from advertise/AdEnums AdsType */
export enum MarketAdsType {
  CampaignAd,
  PostAd,
  StoryAd,
}

export enum BannerType {
  Base64 = 0,
  Url = 1,
}

export enum TitleName {
  Custome = "Custome",
  GeneralLink = "General Link",
  PDFLink = "PDF Link",
  Contact = "Contact",
  RSSFeed = "RSS Feed",
  Instagram = "Instagram",
  ClubHouse = "Club House",
  Skype = "Skype",
  WhatsApp = "WhatsApp",
  Twitter = "Twitter",
  Dribbble = "Dribbble",
  Snapchat = "Snapchat",
  Pinterest = "Pinterest",
  Telegram = "Telegram",
  Facebook = "Facebook",
  Behance = "Behance",
  MetaMessenger = "Meta Messenger",
  Ticktok = "Ticktok",
  Linkedin = "Linkedin",
  x = "X",
  AppleMusic = "Apple Music",
  AmazonMusic = "Amazon Music",
  SoundCloud = "SoundCloud",
  Spotify = "Spotify",
  Aparat = "Aparat",
  twitch = "twitch",
  YouTube = "YouTube",
  Shazam = "Shazam",
  Discord = "Discord",
  vimeo = "vimeo",
  RadioJavan = "Radio Javan",
  Dropbox = "Dropbox",
  Mega = "Mega",
  IclouadDrive = "iCloud Drive",
  GoogleDrive = "Google Drive",
  MediaFire = "MediaFire",
  OneDrive = "OneDrive",
  PayPal = "PayPal",
  Square = " Square",
  Venmo = "Venmo",
  VisaCard = "VisaCard",
  TipJar = "TipJar",
  ZarinPal = "ZarinPal",
  AsanPardakht = "AsanPardakht",
  Zibal = "Zibal",
  Payir = "Pay.ir",
  NextPay = "NextPay",
  IDPay = "IDPay",
}

export enum TitleType {
  Custome = -1,
  GeneralLink = 0,
  PDFLink = 1,
  Contact = 2,
  RSSFeed = 3,
  Instagram = 4,
  ClubHouse = 5,
  Skype = 6,
  WhatsApp = 7,
  Twitter = 8,
  Dribbble = 9,
  Snapchat = 10,
  Pinterest = 11,
  Telegram = 12,
  Facebook = 13,
  Behance = 14,
  MetaMessenger = 15,
  Ticktok = 16,
  Linkedin = 17,
  x = 18,
  AppleMusic = 19,
  AmazonMusic = 20,
  SoundCloud = 21,
  Spotify = 22,
  Aparat = 23,
  twitch = 24,
  YouTube = 25,
  Shazam = 26,
  Discord = 27,
  vimeo = 28,
  RadioJavan = 29,
  Dropbox = 30,
  Mega = 31,
  IclouadDrive = 32,
  GoogleDrive = 33,
  MediaFire = 34,
  OneDrive = 35,
  PayPal = 36,
  Square = 37,
  Venmo = 38,
  VisaCard = 39,
  TipJar = 40,
  ZarinPal = 41,
  AsanPardakht = 42,
  Zibal = 43,
  Payir = 44,
  NextPay = 45,
  IDPay = 46,
}

export enum CategorySection {
  Entertaimet = 0,
  Game = 1,
  Fashion = 2,
}

export enum MarketType {
  Advertise = 0,
  Store = 1,
}

export enum SelectedMarketType {
  All = 0,
  Advertise = 1,
  Store = 2,
}

export enum CustomDomainStatus {
  Requested = 0,
  Checking = 1,
  Approved = 2,
  Rejected = 3,
}

export enum RegisterType {
  CloudFlare = 0,
  ArvanCloud = 1,
}

export enum InsightPeriod {
  Daily,
  Weekly,
  Monthly,
  Yearly,
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
// #endregion Market

// #region Messages
export enum Language {
  English,
  Persian,
  Arabic,
  Turkey,
  French,
  Russian,
  German,
}
export enum ItemType {
  Text,
  PlaceHolder,
  MediaShare,
  ReplyStory,
  Media,
  AudioShare,
  Buttons,
  Generic,
  StoryMention,
  FileShare,
}

export enum ItemTypeId {
  Text = 0,
  PlaceHolder = 1,
  MediaShare = 2,
  ReplyStory = 3,
  Media = 4,
  AudioShare = 5,
  Buttons = 6,
  Generic = 7,
  StoryMention = 8,
  FileShare = 9,
}

/** Was CategoryType in messages/enum.ts */
export enum MessageCategoryType {
  General = 0,
  Business = 3,
  Hide = 2,
}

export enum TicketType {
  Direct,
  InSys,
}

export enum AIAndFlowType {
  FLOW,
  AI,
}

export enum CommentType {
  Post,
  Story,
}

export enum JsonItemType {
  Text = "text",
  Media = "media",
  AnimatedMedia = "animated_media",
  VoiceMedia = "voice_media",
  MediaShare = "media_share",
  XmaStoryShare = "xma_story_share",
  XmaReelShare = "xma_reel_share",
  Clip = "clip",
  Link = "link",
}

export enum StatusReplied {
  JustCreated,
  InstagramerReplied,
  UserReplied,
  InstagramerClosed,
  UserClosed,
  TimerClosed,
}

export enum MediaProductType {
  Ad = 0,
  Feed = 1,
  Story = 2,
  Reels = 3,
  Unknow = 4,
  Live = 5,
  AllMedia = -1,
  All = -2,
}

export enum MediaProductTypeText {
  Ad = "Ad",
  Feed = "Feed",
  Story = "Story",
  Reels = "Reels",
  Unknow = "UnKnow",
  Live = "LIve",
}

export enum ActionType {
  Hide,
  Delete,
  UnHide,
  SelectToReply,
  UnSelectToReply,
  Ignore,
  Read,
  MediaDeleted,
  CommentingDesabled,
}

export enum SpecialPayLoad {
  CreateTicket,
  ChangeLanguage,
  ViewShop,
  ViewWebsite,
  ViewRole,
  ViewBusinessTime,
  ViewPrice,
  SearchProduct,
}

export enum SpecialPayLoadDesc {
  CreateTicket,
  ChangeLanguage,
  ViewShop,
  ViewWebsite,
  ViewRole,
  ViewBusinessTime,
  ViewPrice,
  SearchProduct,
}

export enum IceOrPersistent {
  IceBreaker,
  PersistentMenu,
}

/** Was Language in messages/enum.ts */
export enum MessageLanguage {
  English,
  Persian,
  Arabic,
  Turkey,
  French,
  Russian,
  German,
}

export enum PayloadType {
  Special,
  Custom,
  Flow,
  AI,
  GeneralAI,
}

export enum AutoReplyPayLoadType {
  KeyWord,
  Flow,
  AI,
  GeneralAI,
  Product,
}

export enum BusinessFilterNumberType {
  AI = 0,
  SpecificWords = 1,
}

export enum BusinessFilterMsgType {
  AI = "Automatic selection (AI)",
  SpecificWords = "specific words",
}
// #endregion Messages

// #region Page - Post
export enum PostType {
  Single,
  Album,
}

export enum ErrorPrePostType {
  UploadError,
  Unknown,
  InvalidTags,
  ConfigFailed,
  UserCancel,
  InvalidAspectRatio,
  SizeLimitExceed,
  UnSupportMediaType,
  NotPublishedAtTheTime,
  NotSuccessLogin,
}
// #endregion Page - Post

// #region Page - Socket
export enum UploadPostSteps {
  SendBackToServer = -2,
  DownloadFromMiddle = -1,
  Preparing = 0,
  Uploading = 1,
  Uploaded = 2,
  UploadingThumbnail = 3,
  ThumbnailUploaded = 4,
  Configuring = 5,
  Configured = 6,
  Completed = 7,
  Error = 8,
}
// #endregion Page - Socket

// #region Page - Statistics
export enum chartxType {
  month,
  day,
  hour,
}

export enum MonthName {
  January = "January",
  February = "February",
  March = "March",
  April = "April",
  May = "May",
  June = "June",
  July = "July",
  August = "August",
  September = "September",
  October = "October",
  November = "November",
  December = "December",
}
// #endregion Page - Statistics

// #region Page - Tools (Lottery)
/** Was the first LotteryType in tools.ts {score=1, followers=2} */
export enum LotteryGroupType {
  score = 1,
  followers = 2,
}
export enum lotterySpecificationType {
  SelectPost = 0,
  SetDateAndTime = 1,
}
/** Was lotterySpecificationType in tools.ts (casing fixed) */
export enum LotterySpecificationType {
  SelectPost = 0,
  SetDateAndTime = 1,
}

export enum FollowerLotteryType {
  Randomly = 0,
  BestEngagment = 1,
}

export enum TermsType {
  Solid = 0,
  Linear = 1,
  Radial = 2,
}

export enum LotteryStatus {
  Upcoming,
  Active,
  Ended,
  Failed,
}

export enum FailLotteryStatus {
  Expired,
  MissingPermission,
  MissingPackage,
  DeletedPost,
  Rejected,
  ExportFailed,
}

export enum FailLotteryStatusStr {
  Expired = "Expired",
  MissingPermission = "MissingPermission",
  MissingPackage = "MissingPackage",
  DeletedPost = "DeletedPost",
  Rejected = "Rejected",
  ExportFailed = "ExportFailed",
}

/** Was the second LotteryType in tools.ts {Score, Filter, None} */
export enum LotteryType {
  Score,
  Filter,
  None,
}

export enum TermsAndBannerType {
  None,
  Terms,
  Banner,
}

export enum ShowScoreLotteryType {
  None,
  Forward,
  Back,
}
// #endregion Page - Tools (Lottery)

// #region PSG
/** Was FeatureType in psg/psg.ts — different from market FeatureType */
export enum PsgFeatureType {
  AI = 1,
  Lottery = 2,
  CustomDomain = 3,
}
// #endregion PSG

// #region Push Notifications
export enum PushResponseType {
  UploadPostSuccess,
  UploadPostFailed,
  UploadStorySuccess,
  UploadStoryFailed,
  NewStoryAdded,
  NewPostAdded,
  DeauthorizedInstaAccount,
  PackageRenewal,
  UpdateSystemTicket,
  CreateSystemTicket,
  ChangeOrderStatus,
  AiImageSuccess,
  AiImageFail,
  TransferThread,
}

export enum PushResponseTitle {
  UploadPostSuccess = "New Post",
  UploadPostFailed = "Upload Post Failed",
  UploadStorySuccess = "New Story",
  UploadStoryFailed = "Upload Story Failed",
  UpdateSystemTicket = "New Message",
}

export enum PushResponseExplanation {
  UploadPostSuccess = "New Post successfully uploaded",
  UploadPostFailed = "Upload Post Failed",
  UploadStorySuccess = "New Story successfully uploaded",
  UploadStoryFailed = "Upload Story Failed",
  UpdateSystemTicket = "You have New Message",
  DeauthorizedInstaAccount = "Deauthorized Insta Account",
}
// #endregion Push Notifications

// #region Setting
export enum DeviceType {
  Unknown = 0,
  Desktop = 1,
  Mobile = 2,
  Tablet = 3,
}

export enum DeviceTypeStr {
  Unknown = "Unknown Device",
  Desktop = "Desktop",
  Mobile = "Mobile",
  Tablet = "Tablet",
}

export enum OsType {
  Unknown = 0,
  Windows = 1,
  Linux = 2,
  Ios = 3,
}

export enum OsTypeStr {
  Unknown = "Unknown OS",
  Windows = "Windows",
  Linux = "Linux",
  Ios = "Ios",
}

export enum BrowserType {
  Unknown = 0,
  Firfox = 1,
  Chrome = 2,
  Safari = 3,
  Edge = 4,
  InternetExplorer = 5,
  Opera = 6,
}

export enum BrowserTypeStr {
  Unknown = "Unknown Browser",
  Firfox = "Firfox",
  Chrome = "Chrome",
  Safari = "Safari",
  Edge = "Edge",
  InternetExplorer = "InternetExplorer",
  Opera = "Opera",
}

export enum PlatformTicketItemType {
  Text,
  Image,
}

export enum PlatformTicketType {
  BugReport,
  Wallet,
  Message,
  CustomerSupport,
  Ad,
  Shop,
  LinkMarket,
  Other,
}

export enum AiTextModel {
  Chatgpt4oMini = 0,
  Gemeni25Pro = 2,
}

export enum AiVoiceModel {
  ChatgptWhisper1 = 0,
  Chatgpt4oTranscrib = 1,
  Chatgpt4ominiTranscrib = 2,
}
// #endregion Setting

// #region Store
export enum OrderProcedure {
  MoneyTick = 0,
  Collection = 1,
  Boxing = 2,
  Posting = 3,
  Reaching = 4,
}

export enum OrderProcedureStatus {
  Pending = 0,
  Failed = 1,
  Complete = 2,
}

export enum OrderType {
  NewOrder = 0,
  InProgress = 1,
  Completed = 2,
  Failed = 3,
}

export enum ProductDetailType {
  General,
  Variation,
  Specifications,
  Setting,
}

export enum OrderStep {
  Intialized = -1,
  Paid = 0,
  InstagramerAccepted = 1,
  ShippingRequest = 2,
  InShipping = 3,
  Delivered = 4,
  UserCanceled = 5,
  InstagramerCanceled = 6,
  Expired = 7,
  ShippingFailed = 8,
  Failed = 9,
}

export enum OrderStepStatus {
  Pending = 0,
  Inprogress = 1,
  Pickingup = 2,
  Sent = 3,
  Delivered = 4,
  Failed = 5,
  Incart = 6,
}

export enum OrderStatus {
  printWaybill = 1,
  pickupRequest = 2,
  RequestedPickup = 3,
  PickedUp = 4,
  IssuingTrackingCode = 5,
  TrackingCodeIssued = 6,
  Failed = 7,
  Canceled = 8,
  Returned = 9,
}

export enum AvailabilityStatus {
  Available = 0,
  Restocking = 1,
  OutOfStock = 2,
  Stopped = 3,
}

export enum PriceUnit {
  Dollar = 0,
  Euro = 1,
  Toman = 2,
}

/** Was Language in store/enum.ts */
export enum StoreLanguage {
  English = 0,
  Persian = 1,
}

export enum GauranteeStatus {
  NotSet = 0,
  Yes = 1,
  No = 2,
}

export enum OrginalityStatus {
  Original,
  HighCopy,
  NotOriginal,
  Miscellaneous,
  Fake,
}

export enum ShowProductChildrenStatus {
  ShowMedia,
  ShowThumbnail,
  NotShow,
}

export enum GauranteeLength {
  NotSet = 0,
  ThreeDays = 3,
  OneWeek = 7,
  TwoWeek = 14,
  OneMonth = 30,
  TwoMonth = 60,
  ThreeMonth = 90,
  FourMonth = 120,
  FiveMonth = 150,
  SixMonth = 180,
  OneYear = 360,
  OneYearSixMonth = 540,
  TwoYear = 730,
  ThreeYear = 1080,
  FourYear = 1440,
  FiveYear = 1800,
}

/** Was Steps in store/enum.ts */
export enum StoreProductSteps {
  General = 1,
  Information = 2,
  Properties = 3,
  Specification = 4,
  Media = 5,
  Setting = 6,
}

export enum ParcelPocketDeliveryType {
  NotSet = -1,
  None = 0,
  PostEnvelope = 1,
  PostBox = 2,
}

export enum IdentityVerifyType {
  NationalCard = 0,
  RedirectUrl = 1,
}

export enum BusinessBankAccountType {
  CardNumber = 0,
  RedirectUrl = 1,
  StripeAccountId = 2,
}

export enum CreateShopStep {
  None = 0,
  UserAuthorize = 1,
  InstagramerAuthorize = 2,
  AddShopperAddress = 3,
  AddLogesticService = 4,
  CreateShopper = 5,
  CreateInfluencer = 6,
  TermsAndCondition = 7,
}

export enum CreateShopperSteps {
  AuthorizeUser = 0,
  CardNumber = 1,
  Address = 2,
  Shipping = 3,
  AddLogistic = 4,
  TermsAndCondition = 5,
}

export enum LogisticType {
  IRPost_Pishtaz,
  IRPost_Special,
  IRPost_Tipax,
}

export enum ShippingRequestType {
  None = -1,
  TrackingCode = 0,
  Platform = 1,
}

export enum ProductSortType {
  LastProduct,
  MaxPrice,
  MinPrice,
  MostDiscount,
}

export enum ColorStr {
  "#e87109" = 1,
  "#810cc4" = 2,
  "#12b844" = 3,
  "#ffffff" = 4,
  "#2b2b2b" = 5,
  "#1c75d4" = 6,
  "#D3D3D3" = 7,
  "#8b4513" = 8,
  "#c70e0e" = 9,
  "#ff69b4" = 10,
  "#e6ce15" = 11,
  "#e6e7e8" = 12,
  "#000000" = 13,
}
// #endregion Store

// #region UserPanel
export enum BusinessType {
  None = 0,
  Shop = 1,
  Advertise = 2,
  VShoper = 3,
}

export enum ITicketMediaType {
  Text = 0,
  Image = 1,
}

export enum InputTypeAddress {
  PostalCode,
}
// #endregion UserPanel

//#region Wallet
export enum SubInvoiceStatus {
  None = 0,
  AwaitingSettled = 1,
  Settled = 2,
  Failed = 3,
}
