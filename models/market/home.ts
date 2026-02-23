import { CategorySection, MarketType } from "brancy/models/market/enums";

export interface IMarketInfo {
  marketId: number;
  profileUrl: string;
  fullname: string;
  username: string;
  rating: number;
  followers: number;
  post: number;
  bannerUrl: string;
  linkAddress: string;
  categorySection: CategorySection[];
  marketType: MarketType;
}
