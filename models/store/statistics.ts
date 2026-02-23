import { StatusType } from "brancy/components/confirmationStatus/confirmationStatus";
import { AdsType } from "brancy/models/advertise/AdEnums";
import {
  DayCountUnix,
  StatisticsUser,
} from "brancy/models/page/statistics/statisticsContent/GraphIngageBoxes/graphLikes";

export interface ISaleMonth {
  month: number;
  totalCount: number;
  year: number;
  plusCount: number;
  lastUpdate(lastUpdate: any): import("react").ReactNode;
  previousPlusCount: undefined;
  dayList: DayCountUnix[];
  users: StatisticsUser[];
  totalIncom: number;
}

export interface ISaleShortMonth {
  month: number;
  plusCount: number;
  totalCount: number;
  year: number;
  totalIncome: number;
}

export interface ITotalSalesReport {
  saleId: number;
  seller: {
    fullname: string;
    profileUrl: string;
    username: string;
  };
  saleType: AdsType;
  date: number;
  fee: number;
  statusType: StatusType;
}

export interface IStatisticsInfo {
  totalSalesStatistics: ISaleShortMonth[];
  twoMonth: ISaleMonth[];
  totalSalesReport: ITotalSalesReport[];
}
