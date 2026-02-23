import { IAutomaticReply, IMediaUpdateAutoReply } from "brancy/models/page/post/posts";

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
  upingTime: number; //Unix;
  hideLikeAndView: boolean;
  turnOffComment: boolean;
  addVideoAsReels: boolean;
}
export enum MediaType {
  Image = 1,
  Video = 2,
  Carousel = 8,
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
export enum PostType {
  Single,
  Album,
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

export interface IPageInfo {
  profileUrl: string;
  username: string;
  fullName: string;
}
export interface IFullPageInfo extends IPageInfo {
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
