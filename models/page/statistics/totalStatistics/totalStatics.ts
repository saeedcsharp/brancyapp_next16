import { GraphGhostViewersModel } from "brancy/models/page/statistics/statisticsContent/GraphIngageBoxes/GraphGhostViewersModel";
import { GraphViewsFourMonthModel } from "brancy/models/page/statistics/statisticsContent/GraphIngageBoxes/GraphViewsFourMonthModel";
import { IBestFollowers } from "brancy/models/page/statistics/statisticsContent/GraphIngageBoxes/bestFollower";
import { CardBestWorstModel } from "brancy/models/page/statistics/statisticsContent/GraphIngageBoxes/cardBestWorst";
import { IMonthGraph } from "brancy/models/page/statistics/statisticsContent/GraphIngageBoxes/graphLikes";
import { IIngageBox } from "brancy/models/page/statistics/statisticsContent/ingageBoxes/ingageBox";

export interface TotalStatistics {
  statisticContent: {
    ghostViewerChart: GraphGhostViewersModel | null;
    ingageBoxes: IIngageBox | null;
    cardBestWorst: CardBestWorstModel | null;
    likes: IMonthGraph[] | null;
    followers: IMonthGraph[] | null;
    unFollowers: IMonthGraph[] | null;
    views: IMonthGraph[] | null;
    comments: IMonthGraph[] | null;
    fourMounthViews: GraphViewsFourMonthModel | null;
    bestFollowers: IBestFollowers[] | null;
  };
}
