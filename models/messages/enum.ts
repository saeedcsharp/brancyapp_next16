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

export enum CategoryType {
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
export enum MediaType {
  Image = 1,
  Video = 2,
  Carousel = 8,
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
  ViewShop, //Shop
  ViewWebsite,
  ViewRole, //Add+Shop
  ViewBusinessTime, //Ads+Shop
  ViewPrice, //Ads
  SearchProduct, //Shop
}
export enum SpecialPayLoadDesc {
  CreateTicket,
  ChangeLanguage,
  ViewShop, //Shop
  ViewWebsite,
  ViewRole, //Add+Shop
  ViewBusinessTime, //Ads+Shop
  ViewPrice, //Ads
  SearchProduct, //Shop
}
export enum IceOrPersistent {
  IceBreaker,
  PersistentMenu,
}
export enum Language {
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
