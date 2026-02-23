import { SearchContentModel } from "brancy/models/searchBar/searchContent";
import { SearchFilterModel } from "brancy/models/searchBar/searchFilters";

export interface SearchBarModel {
  searchContent: SearchContentModel;
  searchFilter: SearchFilterModel;
}
