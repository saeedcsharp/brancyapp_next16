import { PriceType } from "brancy/components/priceFormater";

export interface IBusiness {
  isSuspend: boolean;
  username: string;
  profileUrl: string;
  fullName: string;
  followerCount: number;
  countryId: number;
  bannerUrl: string | null;
  fullShop: {
    shortShop: {
      isSuspend: boolean;
      fbId: number;
      productCount: number;
      instagramerId: number;
      priceType: number;
    };
    categories: {
      categoryId: number;
      langValue: string;
      count: number;
    }[];
  } | null;
  fullAdvertise: [] | null;
  fullVShop: [] | null;
  instagramerId: number;
  fbId: number;
  priceType: PriceType;
  businessType: BusinessType;
}

export interface IBusinessResponse {
  items: IBusiness[];
  nextMaxId: string;
}

export enum BusinessType {
  None = 0,
  Shop = 1,
  Advertise = 2,
  VShoper = 3,
}
