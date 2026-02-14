import { GraphGhostViewersModel } from "../statisticsContent/GraphIngageBoxes/GraphGhostViewersModel";
import { GraphViewsFourMonthModel } from "../statisticsContent/GraphIngageBoxes/GraphViewsFourMonthModel";
import { IBestFollowers } from "../statisticsContent/GraphIngageBoxes/bestFollower";
import { CardBestWorstModel } from "../statisticsContent/GraphIngageBoxes/cardBestWorst";
import { IMonthGraph } from "../statisticsContent/GraphIngageBoxes/graphLikes";
import { IIngageBox } from "../statisticsContent/ingageBoxes/ingageBox";

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
