import { SearchContentModel } from "./searchContent";
import { SearchFilterModel } from "./searchFilters";

export interface SearchBarModel {
  searchContent: SearchContentModel;
  searchFilter: SearchFilterModel;
}
