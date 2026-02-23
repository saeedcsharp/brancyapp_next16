import { StatusType } from "../../components/confirmationStatus/confirmationStatus";
import { IMonthGraph, IShortMonth } from "../page/statistics/statisticsContent/GraphIngageBoxes/graphLikes";
import { AdsType } from "./AdEnums";

export interface IAdMonth extends IMonthGraph {
  totalIncom: number;
}

export interface IAdShortMonth extends IShortMonth {
  totalIncome: number;
}

export interface IStatisticsInfo {
  twoMonth: IAdMonth[];
  totalAdsStatistics: IAdShortMonth[];
  totalAdsReport: ITotalAdsReport[];
}

export interface ITotalAdsReport {
  advertiseId: number;
  advertiser: {
    profileUrl: string;
    fullname: string;
    username: string;
  };
  advertiseType: AdsType;
  statusType: StatusType;

  fee: number;
  date: number;
}
