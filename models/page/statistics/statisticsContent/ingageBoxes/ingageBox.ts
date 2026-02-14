import { IPostContent } from "saeed/models/page/post/posts";

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
