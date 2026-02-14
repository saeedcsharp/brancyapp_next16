import { IMonthGraph } from "../statisticsContent/GraphIngageBoxes/graphLikes";

export interface IFollowerStatistics {
  overallFollowers: IMonthGraph[] | null;
  unFollowers: IMonthGraph[] | null;
  mediaFollows: IMonthGraph[] | null;
  mediaProfileVisits: IMonthGraph[] | null;
  reach: IMonthGraph[] | null;
}
