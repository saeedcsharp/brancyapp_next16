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
export enum MediaType {
  Image = 1,
  Video = 2,
  Carousel = 8,
}
