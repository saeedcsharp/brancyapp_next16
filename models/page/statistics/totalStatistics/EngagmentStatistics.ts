import { IMonthGraph } from "../statisticsContent/GraphIngageBoxes/graphLikes";

export interface EngagmentStatistics {
  likes: IMonthGraph[];
  comments: IMonthGraph[];
  shares: IMonthGraph[];
  engagement: IMonthGraph[];
  saves: IMonthGraph[];
  replies: IMonthGraph[];
  views: IMonthGraph[];
  followerViews: IMonthGraph[];
  nonFollowerViews: IMonthGraph[];
  totalTime: IMonthGraph[];
  reposts: IMonthGraph[];
}
