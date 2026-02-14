import { PriceType } from "saeed/components/priceFormater";
import { AvailabilityStatus, GauranteeLength } from "../store/enum";

export interface IShortProduct {
  maxInEachCard: number;
  instagramerId: number;
  productId: number;
  tempId: number;
  variationCount: number;
  minStock: number;
  maxStock: number;
  productInId: number;
  thumbnailMediaUrl: string;
  postId: number;
  weight: number;
  availabilityStatus: AvailabilityStatus;
  minPrice: number;
  maxPrice: number;
  maxDiscountPrice: number;
  minDiscountPrice: number;
  priceType: PriceType;
  lastUpdate: number;
  title: string;
  categoryId: number;
}

export interface IFavoriteCardCount {
  cardCount: number;
  isFavorite: boolean;
  productId: number;
}

export interface IProductCard {
  shortProduct: IShortProduct;
  favoriteCardCount: IFavoriteCardCount;
  shopInfo: IShortShop;
}
export interface IFavoriteProduct {
  favoriteProducts: IProductCard[];
  nextMaxId: number | null;
}
export interface IProduct {
  products: IProductCard[];
  totalCount: number;
}
export interface IShortShop {
  instagramerId: number;
  username: string;
  fullName: string | null;
  priceType: number;
  profileUrl: string;
  productCount: number;
  followerCount: number;
  bannerUrl: string;
}

export interface IBanner {
  url: string;
  orderId: number;
}

export interface IPriceRange {
  maxPrice: number;
  minPrice: number;
}

export interface ICategory {
  categoryId: number;
  langValue: string;
  count: number;
}
export interface ITopHashtags {
  hashtagId: number;
  hashtag: string;
  count: number;
}
export interface IFullShop {
  shortShop: IShortShop;
  banners: IBanner[];
  categories: ICategory[];
}
export interface IFilterInfo {
  topHashtags: ITopHashtags[];
  priceRange: IPriceRange | null;
}
export interface IFilter {
  minPrice: number;
  maxPrice: number;
  sortProductBy: ProductSortType;
  includeUnavailable: boolean;
}
export enum ProductSortType {
  LastProduct,
  MaxPrice,
  MinPrice,
  MostDiscount,
}

//--------------ful product..............//
export interface ISubProduct {
  subProductId: number;
  colorId: number | null;
  variations: string[];
  customVariation: string | null;
  stock: number;
  price: number;
  priceType: PriceType;
  cardCount: number;
  mainPrice: number;
  remainingDiscountTime: number | null;
}

export interface IShortProduct {
  maxInEachCard: number;
  instagramerId: number;
  productId: number;
  tempId: number;
  variationCount: number;
  minStock: number;
  maxStock: number;
  productInId: number;
  thumbnailMediaUrl: string;
  postId: number;
  weight: number;
  availabilityStatus: AvailabilityStatus;
  minPrice: number;
  maxPrice: number;
  maxDiscountPrice: number;
  minDiscountPrice: number;
  priceType: PriceType;
  lastUpdate: number;
  title: string;
  categoryId: number;
  likeCount: number;
  instagramUrl: string;
  caption: string;
  table: string;
}

export interface ISpecification {
  key: string;
  value: string;
}

export interface IFullProduct {
  subProducts: ISubProduct[];
  shortProduct: IShortProduct;
  medias: string[];
  isColorVariation: boolean;
  readyForShipDays: number;
  gaurantee: boolean;
  gauranteeLength: GauranteeLength;
  maxInEachCard: number;
  variations: string[];
  specifications: ISpecification[];
  productId: number;
  thumbnailMediaUrl: string;
  isFavorite: boolean;
  customVariation: string | null;
  description: string | null;
}
export interface IVariationComparison {
  key: number;
  value: string;
}
export interface ISelectedProduct {
  colorId: number | null;
  customVariation: string | null;
  constVariation: string[];
  selectedVariation: IVariationComparison[];
}
export interface IAddToCard {
  subProductId: number;
  stock: number;
  price: number;
}
export enum ColorStr {
  "#e87109" = 1,
  "#810cc4" = 2,
  "#12b844" = 3,
  "#ffffff" = 4,
  "#2b2b2b" = 5,
  "#1c75d4" = 6,
  "#D3D3D3" = 7,
  "#8b4513" = 8,
  "#c70e0e" = 9,
  "#ff69b4" = 10,
  "#e6ce15" = 11,
  "#e6e7e8" = 12,
  "#000000" = 13,
}
