import { IMonthGraph } from "brancy/models/page/statistics/statisticsContent/GraphIngageBoxes/graphLikes";

export interface IFeatureItem {
  x: number;
  totalCount: number;
}
export interface ITotalInsight {
  nbVisits: number;
  nbActions: number;
  nbVisitsConverted: number;
  bounceCount: number;
  sumVisitLength: number;
  maxActions: number;
  bounceRate: string;
  nbActionsPerVisit: number;
  avgTimeOnSite: number;
}
export interface ITotalInsightFigures {
  nbVisit: IMonthGraph[];
}
export interface ILinkInsight {
  id: string;
  title: string;
  insight: IMonthGraph[];
}
export interface ISubVideoInsight {
  label: string;
  category: number;
  action: number;
  value: null;
  nbVisits: number;
  nbEvents: number;
  nbEventsWithValue: number;
  sumEventValue: number;
  minEventValue: boolean;
  maxEventValue: boolean;
  sumDailyNbUniqVisitors: number;
  avgEventValue: number;
  idsubdatatable: number;
}
export interface IVideoInsight {
  lastPlayYoutube: ISubVideoInsight | null;
  lastRedirectYoutube: ISubVideoInsight | null;
  lastPlayAparat: ISubVideoInsight | null | [];
  lastRedirectAparat: ISubVideoInsight | null | [];
  lastPlayTwitch: ISubVideoInsight | null;
  lastRedirectTwitch: ISubVideoInsight | null;
}
