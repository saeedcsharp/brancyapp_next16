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
