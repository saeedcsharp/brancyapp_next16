import { SuperFigure } from "brancy/models/page/statistics/statisticsContent/GraphIngageBoxes/graphLikes";

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

// export interface INormalWinnerPickerResult {
//   normalWinnerPicker: INormalWinnerPicker;
//   commenWinnerPicker: ICommonWinnerPickerResult;
// }
// export interface IFollowerWinnerPickerResult {
//   FollowersWinnerPicker: IFollowersWinnerPicker;
//   commenWinnerPicker: ICommonWinnerPickerResult;
// }
// export interface IScoreWinnerPickerResult {
//   scoreWinnerPicker: IScoreWinnerPicker;
//   commenWinnerPicker: ICommonWinnerPickerResult;
// }
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

export interface IPendingLotteryInfo extends IShortLotteryInfo {}

export interface IDoneLotteryInfo extends IShortLotteryInfo {}

export interface IAbortLotteryInfo extends IShortLotteryInfo {
  error: string;
}

export interface IShortLotteryInfo {
  lotteryId: number;
  dateAndTime: number;
  lotteryType: LotteryType;
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

// export interface IWinnerPickerResult {
//   type: WinnerType;
//   likeChecked: boolean;
//   commentChecked: boolean;
//   mentionChecked: boolean;
//   winnerCount: string;
//   postUrl: string | null;
//   dateAndTime: number | null;
//   commenWinnerPicker: ICommonWinnerPickerResult; // TermAndBaner
// }
export enum LotteryType {
  score = 1,
  followers = 2,
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

// export interface ICreateLotteryInfo {
//   winnerCount: number;
//   scoreLottery: IScoreLottery;
// }

// export interface IScoreLottery {
//   termsAndBanner: ITermsAndBanner;
//   likeChecked: boolean;
//   mentionChecked: boolean;
//   minMentionCount: number;
//   ShouldFollowMyPage: boolean;
//   ShouldFollowOtherPage: IShortPageInfo[];
//   postId: number;
//   dateAndTime: number;
// }
// export interface IEditScoreLottery extends IScoreLottery {
//   thumbnailUrl: string;
// }

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
export enum lotterySpecificationType {
  SelectPost = 0,
  SetDateAndTime = 1,
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
export enum FollowerLotteryType {
  Randomly = 0,
  BestEngagment = 1,
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
  firstHexBackground: {
    hex: string;
  };
  secondHexBackground: {
    hex: string;
  };
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
export interface IHashtag {
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
