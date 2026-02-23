import { PriceType } from "brancy/components/priceFormater";
import { AvailabilityStatus, GauranteeLength, ParcelPocketDeliveryType } from "brancy/models/store/enum";

export interface ICardItem {
  instagramerId: number;
  productId: number;
  subProductId: number;
  count: number;
  userId: number;
  createdTime: number;
  completeProduct: ICompleteProduct;
}

export interface ISubProduct {
  subProductId: number;
  colorId: number;
  variations: string[];
  customVariation?: string;
  stock: number;
  price: number;
  priceType: PriceType;
  cardCount: number;
  mainPrice: number;
}

export interface IShortProduct {
  username: string | undefined;
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

export interface ISpecification {
  key: string;
  value: string;
}

export interface ICompleteProduct {
  subProducts: ISubProduct[];
  shortProduct: IShortProduct;
  shortShop?: IShortShop;
  medias?: string[];
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
  customVariation?: string;
}

export interface CardItem {
  userId: number;
  instagramerId: number;
  productId: number;
  subProductId: number;
  count: number;
  createdTime: number;
  completeProduct: ICompleteProduct;
}

export interface IShortShop {
  lastUpdate: number;
  instagramerId: number;
  username: string;
  fullName: string | null;
  productCount: number;
  followerCount: number;
  bannerUrl: string;
  priceType: number;
  profileUrl: string;
}
export interface IShopCard extends IShortShop {
  totalDiscountPrice: number;
  totalPrice: number;
  bannerUrl: string;
  cardCount: number;
  products?: ICompleteProduct[];
}

export interface IUserOrder {
  shopCards: IShopCard[];
  nextMaxId: string;
}
export interface IOptimizedBox {
  length: number;
  width: number;
  height: number;
  weight: number;
  id: string;
  volume: number;
  isOutOfStandard: boolean;
}
export interface IAddress {
  userId: number;
  id: number;
  isActive: boolean;
  isDefault: boolean;
  url: string;
  state: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  postalCode: string;
  isPostalCodeUnqiue: boolean;
  note: string;
  receiver: string;
  subject: string;
}
export interface IUpdateUserAddress {
  addressId: number;
  subject: string;
  receiver: string;
  note: string;
}
export enum InputTypeAddress {
  PostalCode,
}
export default interface IUserCoupon {
  couponId: number;
  code: string;
  discount: number;
  expireTime: number;
  isDeleted: boolean;
  useCount: number;
  maxCount: number;
  userId: number | null;
  showInBio: boolean;
  instagramerId: number;
  createdTime: number;
  updateTime: number;
  maxDiscount: number | null;
}
export interface ILogistic {
  id: number;
  backUpId: null;
  optimizedBox: IOptimizedBox | null;
  price: number;
  isBreakable: boolean;
  isLiquid: boolean;
  totalPrice: number;
  weight: number;
  logo: string;
  name: string;
  langName: string;
  url: string;
  isPaymentOnArrival: boolean;
  isShopperGetValue: boolean;
  priceType: PriceType;
  deliveryType: ParcelPocketDeliveryType;
}
export interface ICreateOrder {
  items: {
    subProductId: number;
    cardCount: number;
  }[];
  logesticType: number | null;
  addressId: number;
  couponCode: string;
}
