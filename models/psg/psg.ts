import { PriceType } from "saeed/components/priceFormater";

export interface IBasePackage {
  instagramerId: number;
  beginUnix: number;
  endUnix: number;
}

export interface IPackageFeature {
  instagramerId: number;
  featureId: number;
  count: number;
  maxCount: number;
  createdTimeUnix: number;
  beginUnix: number;
  endUnix: number;
  id: number;
  ids: number[];
}

export interface IReserveFeature {
  instagramerId: number;
  featureId: FeatureType;
  count: number;
  maxCount: number;
  createdTimeUnix: number;
  beginUnix: number;
  endUnix: number;
  unExpired: boolean;
  unLimited: boolean;
  id: number;
  ids: number[];
}

export interface IFeature {
  featureId: FeatureType;
  packageFeature: IPackageFeature | null;
  reserveFeature: IReserveFeature | null;
}

export interface IFeatureInfo {
  followerCount: number;
  instagramerId: number;
  basePackage: IBasePackage | null;
  features: IFeature[];
}
export interface IBaseFeature {
  id: FeatureType;
  packagePriceType: PriceType;
  featureId: number;
  count: number;
  sliceMonth: boolean;
}
export interface IBasePackagePrice {
  accountType: number;
  price: number;
  id: number;
  packageMonthDuration: number;
  priceType: PriceType;
  description: string;
  minFollowerCount: number;
  maxFollowerCount: number;
  features: IBaseFeature[];
  discount: number | null;
}
export interface IReserveFeaturePrices {
  price: number;
  priceType: PriceType;
  reserveFeatureId: number;
  description: string;
  businessType: null;
  featureId: FeatureType;
  count: number | null;
  seconds: number | null;
  minFollower: number | null;
  discount: number | null;
}
export enum FeatureType {
  AI = 1,
  Lottery = 2,
  CustomDomain = 3,
}
