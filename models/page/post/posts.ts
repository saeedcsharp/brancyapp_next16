import { ITotalPrompt } from "brancy/models/AI/prompt";
import {
  AutoReplyPayLoadType,
  MediaProductType,
} from "brancy/models/messages/enum";
import { IMedia } from "brancy/models/messages/IMessage";
import { ITotalMasterFlow } from "brancy/models/messages/properies";
import { SuperFigure } from "brancy/models/page/statistics/statisticsContent/GraphIngageBoxes/graphLikes";
import { IPrePost, MediaType } from "brancy/models/page/post/preposts";
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
export interface IHashtag {
  hashtagId: number;
  hashtagListName: string;
  hashtagsList: string[];
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
