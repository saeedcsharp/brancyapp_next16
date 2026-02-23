import { AdsType } from "brancy/models/advertise/AdEnums";
import { IBaseAds } from "brancy/models/advertise/adList";

export interface ICaledarAds extends IBaseAds {
  date: number;
  fullName: string;
  profileUrl: string;
  adType: AdsType;
}
