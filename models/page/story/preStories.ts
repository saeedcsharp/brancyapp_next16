import { IMediaUpdateAutoReply } from "../post/posts";
import { MediaType } from "../post/preposts";

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
