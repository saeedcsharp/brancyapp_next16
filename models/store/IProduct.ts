import { PriceType } from "../../components/priceFormater";
import {
  AvailabilityStatus,
  GauranteeLength,
  GauranteeStatus,
  Language,
  OrderProcedure,
  OrderProcedureStatus,
  OrderType,
  OrginalityStatus,
  ParcelPocketDeliveryType,
} from "./enum";
export interface IProduct_Candidate {
  postId: number;
  thumbnailMediaUrl: string;
  instagramerId: number;
  likeCount: number;
  isCandidate: boolean;
  productId: number | null;
  createdTime: number;
  viewCount: number;
  shareCount: number;
  commentCount: number;
  productTempId: number | null;
  postTempId: number;
}
export interface IProduct_ShortProduct {
  instagramerId: number;
  productId: number;
  tempId: number;
  variationCount: number;
  minStock: number;
  maxStock: number;
  productInId: number | null;
  thumbnailMediaUrl: string;
  postId: number;
  weight: number;
  availabilityStatus: AvailabilityStatus;
  minPrice: number;
  maxPrice: number;
  priceUnit: number;
  title: string | null;
  lastUpdate: number;
  inCardCount: number;
  priceType: PriceType;
}
export interface IProduct_MainCategory {
  isSecondary: boolean;
  isBrand: boolean;
  isColorVariation: boolean;
  children: IProduct_MainCategory[];
  id: number;
  name: string;
  langValue: string;
}
export interface IProduct_SecondaryCategory {
  dependentCategories: IDependentCategory[];
  brandCategories: IBrandCategory[];
}
export interface IBrandCategory {
  categoryId: number;
  brandId: number;
  langValue: string;
  name: string;
}
export interface IColorCategory {
  categoryId: number;
  colorId: number;
  hexCode: string;
  language: number;
  langValue: string;
}
export interface IDependentCategory {
  id: number;
  name: string;
  langValue: string;
}
export interface IProduct_Variation {
  variations: IVariation[];
  colorCategories: IColorCategory[];
}
export interface IVariation {
  langValue: string;
  id: number;
  title: string;
  categoryId: number;
  variations: IDetailedVariation[];
}
export interface IDetailedVariation {
  variationTitleId: number;
  variationId: number;
  categoryId: number;
  langValue: string;
  name: string;
  language: Language;
}
export interface ISummaryProduct {
  productUrl: string;
  productName: string;
  postNumber: Number;
  productId: number;
  productPrice: number;
  productWeight: number;
  productSize: string[];
  productColor: string[];
  productStock: number;
  productActive: boolean;
}
export interface IProduct_CreateInstance {
  productId: number;
  title: string;
  evat: number;
  deliveryInfo: {
    weight: number | null;
    productBox: IProductBox | null;
    productEnvelope: {
      envelopeAvailableCount: number;
    } | null;
    deliveryType: ParcelPocketDeliveryType;
  };
  breakable: boolean;
  isLiquid: boolean;
  availabilityStatus: AvailabilityStatus;
  gauranteeStatus: GauranteeStatus;
  orginalityStatus: OrginalityStatus;
  gauranteeLength: GauranteeLength;
  maxInEachCard: number;
  readyForShipDayLong: number;
  categoryId: number;
  subCategoryId: number | null;
  brandId: number | null;
  isColorVariation: boolean;
  customTitleVariation: string | null;
  variationTitles: number[];
  specificationItems: {
    customSpecification: ICustomSpecificationItem | null;
    defaultSpecification: ISpecificationItem | null;
  }[];
  descriptions: string | null;
}
export interface IMaxSize {
  supportEnvelope: boolean;
  maxEnvelopeWeight: number;
  supportBox: boolean;
  limitBox: {
    length: number;
    width: number;
    height: number;
    totalLength: number;
    weight: number;
    supportSack: boolean;
    supportLiquid: boolean;
    supportBreakable: boolean;
    volume: number;
  };
}
export interface IProduct_Setting {
  weight: number | null;
  productBox: IProductBox | null;
  availabilityStatus: AvailabilityStatus;
  gauranteeStatus: GauranteeStatus;
  maxInEachCard: number;
  readyForShipDayLong: number;
  guaranteeLenght: number;
  isLiquid: boolean;
  orginalityStatus: OrginalityStatus;
  breakable: boolean;
  deliveryType: ParcelPocketDeliveryType;
  envelopeAvailableCount: number | null;
  maxSize: IMaxSize | null;
}
export interface IProduct_Varisation_Client {
  subProducts: ISubProduct_Create[];
  categoryId: number;
}
export interface IProduct_CreateSubProduct {
  productId: number;
  subProducts: ISubProduct_Create[];
  deActiveSubProducts: number[];
}
export interface ISubProduct_Create {
  customVariation: string | null;
  colorVariation: number | null;
  variations: IVariation_Create[];
  stock: number;
  disCount: IDisCount | null;
  price: number;
}
export interface ISubProduct_CreateForInstance {
  customVariation: string | null;
  colorVariation: string | null;
  stock: number;
  disCount: IDisCount | null;
  price: number;
  id: number | null;
  productInId: number | null;
  createdTime: number | null;
  isActive: boolean;
  priceType: number;
  variations: ITitleVariationVariation[];
  colorId: number | null;
}
export interface ICreateInstance_ForVariation {
  customTitleVariation: string | null;
  isColorVariation: boolean | null;
  variationTitles: number[];
}
export interface ICreateInstance_ForSpecification {
  isColorVariation: boolean | null;
  variationTitles: number[];
  specificationItems: {
    customSpecification: ICustomSpecificationItem | null;
    defaultSpecification: ISpecificationItem | null;
  }[];
}
export interface IDisCount {
  value: number;
  maxCount: number | null;
  maxTime: number | null;
}
export interface IDiscount_ForClient extends IDisCount {
  index: number;
}

export interface IVariation_Create {
  variationTitleId: number;
  variationId: number;
}

export interface ILastCategory {
  categoryId: number | null;
  subCategoryId: number | null;
  brandId: number | null;
}
export interface ICustomSpecificationItem {
  key: string;
  value: string;
}

export interface IProductBox {
  width: number;
  height: number;
  length: number;
  isSack: boolean;
}

export interface ISpecificationItem {
  variationTitle: number;
  value: number;
}
export interface IGeneralInfo {
  createInstance: IGenera_CreateInstance;
  mainCategory: IProduct_MainCategory[];
  secondaryCategory: IProduct_SecondaryCategory;
  suggestionKey: string | null;
}
export interface IGenera_CreateInstance {
  brandId: number | null;
  subcategoryId: number | null;
  title: string;
  productId: number;
  categoryId: number;
}
export interface IProduct_FullProduct {
  shortProduct: IProduct_ShortProduct;
  productInstance: IProductInstance;
  specifications: ISpecification[];
  secondaryInfo: ISecondaryInfo;
  subProducts: ISubProduct_Info[];
  titleVariations: ITitleVariation_WithVarition[];
  medias: IMeidaInstance[];
  postChildrenMedias: any[];
}
export interface ISpecification {
  id: string;
  index: number;
  defaultSpecification: ISpecification_Default | null;
  customSpecification: ISpecification_Custome | null;
  specificationType: number;
}
export interface IProduct_LastSpecification {
  shortProduct: IProduct_ShortProduct;
  customSpecifications: ISpecification_Custome[];
  specifications: ISpecification_Default[];
}

export interface ISpecification_Default extends ISpecification_Custome {
  variationId: number;
  variationTitleId: number;
  language: number;
}
export interface ISpecification_Custome {
  id: number;
  key: string;
  value: string;
  productInId: number;
}

export interface IProductInstance {
  productInId: number;
  productId: number;
  title: string;
  brandId: number | null;
  categoryId: number;
  isColorVariation: boolean;
  orginalityStatus: OrginalityStatus;
  createdTime: number;
  lastUpdate: number;
  language: Language;
  subCategoryId: number | null;
  categoryLangValue: string;
  subCategoryLangValue: string | null;
  brandLangValue: string | null;
  customVariation: string | null;
  sendWithPost: boolean;
}

export interface ISecondaryInfo {
  isBreakable: boolean;
  isLiquid: boolean;
  insurance: boolean;
  evat: number;
  maxInEachCard: number;
  readyForShipDays: number;
  weight: number | null;
  gaurantee: GauranteeStatus;
  garanteeLength: GauranteeLength;
  description: string | null;
  deliveryInfo: {
    boxSize: BoxSize | null;
    deliveryType: ParcelPocketDeliveryType;
    envelopeAvailableCount: number | null;
    id: number;
    productInId: number;
  };
}

export interface BoxSize {
  id: number;
  productInId: number;
  width: number;
  height: number;
  length: number;
  isSack: boolean;
  createdTime: number;
}

export interface ISubProduct_Info {
  id: number;
  productInId: number;
  createdTime: number;
  isActive: boolean;
  stock: number;
  price: number;
  priceType: number;
  customVariation: string | null;
  variations: ISubProductVariation[];
  colorVariation: string | null;
  disCount: IDisCount_Info | null;
  colorId: number | null;
}
export interface IDisCount_Info {
  id: number;
  value: number;
  useCount: number;
  maxUseCount: number | null;
  maxTime: number | null;
  isActive: boolean;
  productInId: number;
  subProductId: number;
}
export interface ISubProductVariation {
  id: number;
  subProductId: number;
  productInId: number;
  variationId: number;
  titleVariation: ITitleVariation;
  variation: ITitleVariationVariation;
}

export interface ITitleVariation {
  id: number;
  productInId: number;
  variationTitleId: number;
  createdTime: number;
  langValue: string;
}
export interface ITitleVariation_WithVarition extends ITitleVariation {
  variations: ITitleVariationVariation[];
}
export interface ITitleVariationVariation {
  variationTitleId: number;
  variationId: number;
  categoryId: number;
  langValue: string;
  language: Language;
}

export interface IProduct_Information {
  caption: string;
  description: string;
  sizeTable?: string;
  tableTitle?: string;
}
export interface ITempIdAndNonProductCount {
  lastTempId: number;
  nonProductCount: number;
}
// export interface IProduct_InsertMedia {
//   uploadMedia: IUploadMedia[];
//   defaultMedia: IDefaultMedia[];
// }
export interface ISuggestedPrice {
  price: number;
  title: string;
  key: string;
}
export interface ISuggestedMedia {
  medias: { key: string; url: string; mediaId?: number | null }[];
}
export interface IProduct_Media extends IUploadMedia {
  isHidden: boolean;
  childrenId: number | null;
  isDefault: boolean;
  fromSuggestion?: boolean;
  key: string | null;
  suggestedIndex?: number; // Add this new property
}
export interface IUploadMedia {
  base64Url: string;
  mediaType: number;
  thumbnailMediaUrl: string;
  index: number;
}
export interface IMeidaInstance {
  childMedia: IChildMediaInstance | null;
  customMedia: ICustomeMediaInstance | null;
  index: number;
  isHidden: boolean;
  mediaType: number;
}
export interface IMediaInstanceInfo extends IMeidaInstance {
  uploadMedia: IUploadMedia | null;
}
export interface ICustomeMediaInstance {
  createdTime: number;
  id: number;
  index: number;
  isHidden: boolean;
  mediaType: number;
  mediaUrl: string;
  productId: number;
  isSuggested: boolean;
  thumbnailMediaUrl: string;
  key: string | null;
}
export interface IChildMediaInstance {
  childrenId: number;
  index: number;
  isHidden: boolean;
  mediaType: number;
  mediaUrl: string;
  postId: number;
  thumbnailMediaUrl: string;
  userTags: any;
  orderId: number;
}
export interface IDefaultMedia {
  childrenId: number;
  isHidden: boolean;
  index: number;
}
export interface ICustomMedia {
  id: number;
  isHidden: boolean;
  index: number;
}
export interface IProduct_UpdateChildrenMedia {
  items: IDefaultMedia[];
}
export interface IProduct_Update {
  subProductId: number;
  stock: number;
  price: number;
}
export interface IProduct_SettingUpdate {
  isBreakable: boolean;
  isLiquid: boolean;
  maxInEachCard: number;
  readyForShipDayLong: number;
  gauranteeStatus: GauranteeStatus;
  gauranteeLength: GauranteeLength;
  description: string;
  availabilityStatus: number;
  deliveryInfo: {
    weight: number | null;
    deliveryType: ParcelPocketDeliveryType;
    productEnvelope: {
      envelopeAvailableCount: number;
    } | null;
    productBox: {
      width: number;
      height: number;
      length: number;
      isSack: boolean;
    } | null;
  };
}
export interface ISpecificationOrder {
  productId: number;
  items: {
    index: number;
    defaultSpecificationId: number | null;
    customSpecificationId: number | null;
  }[];
}
export interface IGetSuggestedPrice {
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
}

export interface INewOrder extends IBaseOrder {}
export interface IComplete extends IBaseOrder {}
export interface IInProgress extends IBaseOrder {
  orderProcedure: OrderProcedure;
}
export interface IFailed extends IBaseOrder {
  orderProcedure: OrderProcedure;
}
export interface IOrderStatus extends IOrderInfo {
  orderProcedure: OrderProcedure;
  orderProcedureStatus: OrderProcedureStatus;
}
export interface IShowSettingInfo extends IOrderInfo {
  index: number;
}
export interface IOrderInfo {
  orderId: number;
  orderType: OrderType;
}
export interface IMaxSize {
  supportEnvelope: boolean;
  maxEnvelopeWeight: number;
  supportBox: boolean;
  limitBox: ILimitBox;
}
interface ILimitBox {
  length: number;
  width: number;
  height: number;
  totalLength: number;
  weight: number;
  supportSack: boolean;
  supportLiquid: boolean;
  supportBreakable: boolean;
  volume: number;
}
interface IBaseOrder {
  orderId: number;
  orderNumber: number;
  productName: string;
  productUrl: string;
  subOrder: ISubOrder[] | null;
}
interface ISubOrder {
  childrenOrderId: number;
  productName: string;
  productUrl: string;
}
