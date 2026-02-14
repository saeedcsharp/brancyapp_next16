export interface IIpCondition {
  code: string;
  isShaparakAuthorize: boolean;
  isFacebookAuthorize: boolean;
  isInstagramAuthorize: boolean;
}
export interface IUserInfo {
  phoneNumber: string;
  username: string;
  fullName: string | null;
  profileUrl: string;
}
