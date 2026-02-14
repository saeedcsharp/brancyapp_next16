import { HourCountUnix } from "./graphLikes";

export interface CardBestWorstModel {
  thirdyDays: {
    bestTime: number;
    worstTime: number;
  };
  nintyDays: {
    bestTime: number;
    worstTime: number;
  };
  oneTwoODays: {
    bestTime: number;
    worstTime: number;
  };
  sixtyDays: {
    bestTime: number;
    worstTime: number;
  };
}
export interface IBestTime {
  day30CountUnixes: HourCountUnix[];
  day60CountUnixes: HourCountUnix[];
  day90CountUnixes: HourCountUnix[];
  day120CountUnixes: HourCountUnix[];
}
