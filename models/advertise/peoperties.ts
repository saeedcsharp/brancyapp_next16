export interface IAdvertisingTerms {
  term1: string;
  activeTerm1: boolean;
  term2: string;
  activeTerm2: boolean;
  term3: string;
  activeTerm3: boolean;
  term4: string;
  activeTerm4: boolean;
}
export interface ITariff {
  todayTariff: IPriceNonCamp;
  basicTariif: IPriceNonCamp;
  campaign: IPriceCamp;
}
export interface IEditTariff {
  todayPostSemiDay: string;
  todayPostFullDay: string;
  todayStorySemiDay: string;
  todayStoryFullDay: string;
  basicPostSemiDay: string;
  basicPostFullday: string;
  basicStorySemiDay: string;
  basicStoryFullDay: string;
  campaignPostFullDay: string;
  campaignStoryFullDay: string;
}
export interface IBusinessHour {
  dayName: BusinessDay;
  timerInfo: ITimerInfo | null;
}
export interface IActiveBusinessHour {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}
export interface INotifications {
  sms: boolean;
  email: boolean;
  systemNotification: boolean;
  instagramDirect: boolean;
  systemMessage: boolean;
}
export interface IAdsOption {
  concurrentAds: number;
  AdsPageNumber: number;
  capmpaign: boolean;
}
interface IFullDayPrice {
  fullDayPrice: number;
}
interface IFullAndSemiDayPrice extends IFullDayPrice {
  semiDayPrice: number;
}
interface IPriceNonCamp {
  post: IFullAndSemiDayPrice;
  story: IFullAndSemiDayPrice;
}
interface IPriceCamp {
  post: IFullDayPrice;
  story: IFullDayPrice;
}

export interface ITimerInfo {
  startTime: number;
  endTime: number;
}
export enum BusinessDay {
  Monday = 0,
  Tuesday = 1,
  Wednesday = 2,
  Thursday = 3,
  Friday = 4,
  Saturday = 5,
  Sunday = 6,
}
