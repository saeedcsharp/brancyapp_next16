import { AdsType } from "./AdEnums";
import { IBaseAds } from "./adList";

export interface ICaledarAds extends IBaseAds {
  date: number;
  fullName: string;
  profileUrl: string;
  adType: AdsType;
}
