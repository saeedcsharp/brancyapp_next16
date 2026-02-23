import { CategoryItemsModel } from "brancy/models/searchBar/categoryItems";
import { HashtagItemsModel } from "brancy/models/searchBar/hashtagItems";
import { RecentSearchesModel } from "brancy/models/searchBar/recentSearches";
import { StoresModel } from "brancy/models/searchBar/store";

export interface SearchContentModel {
  categoryItems: CategoryItemsModel[];
  hashtagsItems: HashtagItemsModel[];
  stores: StoresModel[];
  recentSearchs: RecentSearchesModel[];
}
