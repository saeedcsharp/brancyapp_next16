import { CategoryItemsModel } from "./categoryItems";
import { HashtagItemsModel } from "./hashtagItems";
import { RecentSearchesModel } from "./recentSearches";
import { StoresModel } from "./store";

export interface SearchContentModel {
  categoryItems: CategoryItemsModel[];
  hashtagsItems: HashtagItemsModel[];
  stores: StoresModel[];
  recentSearchs: RecentSearchesModel[];
}
