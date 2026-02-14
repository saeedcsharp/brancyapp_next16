export interface LoginResultInfo {
  token: string;
  role: UserRoll;
  id: number;
  socketAccessToken: string;
}
export interface UserRoll {
  instagramerIds: number[];
  shopperIds: number[];
  isPostBudget: boolean;
  isPostPeyk: boolean;
  fbIds: string[];
}
