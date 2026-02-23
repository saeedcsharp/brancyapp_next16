import { IThread } from "../../messages/IMessage";
import { IAutomaticReply } from "../post/posts";
import { MediaType } from "../post/preposts";
import { SuperFigure } from "../statistics/statisticsContent/GraphIngageBoxes/graphLikes";
import { IScheduledStoryServer, IStoryDraft } from "./preStories";

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
