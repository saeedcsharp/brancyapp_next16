import { PriceType } from "saeed/components/priceFormater";
import { IShortProduct, IShortShop } from "../userPanel/shop";
import { LogisticType, OrderStep, ParcelPocketDeliveryType, ShippingRequestType } from "./enum";
import {
  IProductInstance,
  ISecondaryInfo,
  ISpecification,
  ITitleVariation,
  ITitleVariation_WithVarition,
} from "./IProduct";

export interface IOrderByStatus {
  items: IOrderByStatusItem[];
  nextMaxId: string | null;
}
export interface IOrderByStatusItem {
  id: string;
  invoiceId: string;
  createdTime: number;
  instagramerId: number;
  userId: number;
  shortShop: IShortShop | null;
  userInfo: IUserInfo | null;
  status: OrderStep;
  statusUpdateTime: number;
  systemTicketId: string | null;
  state: string | null;
  city: string | null;
  logesticId: LogisticType | null;
  deliveryType: ParcelPocketDeliveryType;
  totalPrice: number;
  priceType: PriceType;
  itemCount: number;
  trackingId: string | null;
}
export interface IUserInfo {
  phoneNumber: string;
  username: string | null;
  fullName: string | null;
  profileUrl: string;
}
export interface IOrderDetail {
  orderId: string;
  userId?: number;
  instagramerId?: number;
  shippingRequestType?: ShippingRequestType;
  trackingId?: string | null;
}

// -------------------------------fullproduct-------------------------------
// export interface IShortProduct {
// 	maxInEachCard: number;
// 	likeCount: number;
// 	caption: string;
// 	instagramUrl: string;
// 	instagramerId: number;
// 	productId: number;
// 	tempId: number;
// 	variationCount: number;
// 	minStock: number;
// 	maxStock: number;
// 	productInId: number;
// 	thumbnailMediaUrl: string;
// 	postId: number;
// 	weight: number;
// 	availabilityStatus: AvailabilityStatus;
// 	minPrice: number;
// 	maxPrice: number;
// 	maxDiscountPrice: number;
// 	minDiscountPrice: number;
// 	priceType: number;
// 	lastUpdate: number;
// 	title: string;
// 	categoryId: number;
// }

// export interface IProductInstance {
// 	productInId: number;
// 	productId: number;
// 	title: string;
// 	brandId: number;
// 	categoryId: number;
// 	isColorVariation: boolean;
// 	orginalityStatus: number;
// 	createdTime: number;
// 	lastUpdate: number;
// 	language: number;
// 	subCategoryId: number;
// 	categoryLangValue: string;
// 	subCategoryLangValue?: string;
// 	brandLangValue: string;
// 	customVariation: string;
// }

export interface BoxSize {
  id: number;
  productInId: number;
  width: number;
  height: number;
  length: number;
  isSack: boolean;
  createdTime: number;
}

export interface DeliveryInfo {
  id: number;
  productInId: number;
  deliveryType: ParcelPocketDeliveryType;
  envelopeAvailableCount?: any;
  boxSize: BoxSize;
}

// export interface ISecondaryInfo {
// 	isBreakable: boolean;
// 	maxInEachCard: number;
// 	readyForShipDays: number;
// 	weight: number;
// 	gaurantee: number;
// 	description: string;
// 	garanteeLength: number;
// 	deliveryInfo: DeliveryInfo;
// 	isLiquid: boolean;
// }

// export interface TitleVariation {
// 	id: number;
// 	productInId: number;
// 	variationTitleId: number;
// 	createdTime: number;
// 	langValue: string;
// }

export interface Variation {
  variationTitleId: number;
  variationId: number;
  categoryId: number;
  langValue: string;
  name: string;
  language: number;
}

export interface IVariation {
  id: number;
  subProductId: number;
  productInId: number;
  variationId: number;
  titleVariation: ITitleVariation;
  variation: Variation;
}

export interface DisCount {
  id: number;
  value: number;
  useCount: number;
  maxUseCount: number;
  maxTime: number;
  isActive: boolean;
  productInId: number;
  subProductId: number;
}

export interface ISubProduct {
  id: number;
  productInId: number;
  createdTime: number;
  isActive: boolean;
  stock: number;
  price: number;
  stockId: number;
  priceId: number;
  priceType: number;
  customVariation: string;
  variations: IVariation[];
  colorVariation?: string;
  disCount: DisCount;
  colorId?: number;
}

// export interface Variation {
// 	variationTitleId: number;
// 	variationId: number;
// 	categoryId: number;
// 	langValue: string;
// 	name: string;
// 	language: number;
// }

// export interface TitleVariation {
// 	variations: Variation[];
// 	id: number;
// 	productInId: number;
// 	variationTitleId: number;
// 	createdTime: number;
// 	langValue: string;
// }

export interface CustomMedia {
  createdTime: number;
  thumbnailMediaUrl: string;
  mediaUrl: string;
  id: number;
  productId: number;
  index: number;
  isHidden: boolean;
  isSuggested: boolean;
  mediaType: number;
}

export interface IMedia {
  customMedia: CustomMedia;
  index: number;
  isHidden: boolean;
  childMedia?: any;
  mediaType: number;
}

export interface ICustomSpecification {
  id: number;
  key: string;
  value: string;
  productInId: number;
  index: number;
}

// export interface ISpecification {
// 	index: number;
// 	defaultSpecification?: any;
// 	customSpecification: ICustomSpecification;
// 	specificationType: number;
// }

export interface ICompleteProduct {
  shortProduct: IShortProduct;
  productInstance: IProductInstance;
  secondaryInfo: ISecondaryInfo;
  subProducts: ISubProduct[];
  titleVariations: ITitleVariation_WithVarition[];
  medias: IMedia[];
  specifications: ISpecification[];
}

export interface IItem {
  orderId: string;
  subProductId: number;
  productId: number;
  productInId: number;
  count: number;
  stockId: number;
  priceId: number;
  discountId: number;
}

export interface IOrderItem {
  completeProduct: ICompleteProduct;
  items: IItem[];
}

export interface IOrder {
  itemCount: number;
  shortShop?: IShortShop;
  userInfo?: IUserInfo;
  state: string;
  city: string;
  logesticId: number;
  deliveryType: ParcelPocketDeliveryType;
  id: string;
  invoiceId: string;
  createdTime: number;
  instagramerId: number;
  userId: number;
  status: number;
  statusUpdateTime: number;
  totalPrice: number;
  priceType: number;
}

export interface IAddress {
  userId: number;
  id: number;
  isActive: boolean;
  isDefault: boolean;
  subject: string;
  note: string;
  receiver: string;
  url?: string;
  countryCode: string;
  state: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  postalCode: string;
  isPostalCodeUnqiue: boolean;
}

export interface ISubInvoice {
  id: string;
  invoiceId: string;
  itemType: number;
  price: number;
  priceType: number;
  cardNumber?: any;
}

export interface OrderInvoice {
  orderId: string;
  invoiceId: string;
  instagramerId: number;
  userId: number;
  prePaidLogesticId?: any;
}

export interface IInvoice {
  id: string;
  priceType: number;
  createdTime: number;
  accountId: number;
  successTransactionId?: number;
  accountType: number;
  expireTime: number;
  status: number;
  invoiceType: number;
  amount: number;
  subInvoices: ISubInvoice[];
  orderInvoice: OrderInvoice;
  packageInvoice?: any;
  customInvoices?: any;
}
export interface IBoxSize {
  orderId: string;
  boxId: string;
  length: number;
  width: number;
  height: number;
  weight: number;
}
export interface IFullProduct {
  orderItems: IOrderItem[];
  order: IOrder;
  address: IAddress;
  productCoupon?: string;
  invoice: IInvoice;
  box?: IBoxSize;
}
// ---------------------Push notif---------------------------//
export interface IOrderPushNotifExtended {
  ShortOrder: {
    TrackingId: string | null;
    CouponId: string | null;
    ItemCount: number;
    ShortShop: {
      InstagramerId: number;
      Username: string;
      FullName: string | null;
      PriceType: number;
      ProfileUrl: string;
      ProductCount: number;
      FollowerCount: number;
      BannerUrl: string;
    } | null;
    UserInfo: {
      PhoneNumber: string;
      Username: string;
      FullName: string;
      ProfileUrl: string;
    } | null;
    State: string;
    City: string;
    LogesticId: number;
    DeliveryType: number;
    Id: string;
    InvoiceId: string;
    CreatedTime: number;
    InstagramerId: number;
    UserId: number;
    Status: number; // Using number instead of OrderStep to match your JSON
    StatusUpdateTime: number;
    TotalPrice: number;
    ExpireTime: number;
    PriceType: number; // Using number instead of PriceType enum
    SystemTicketId: string | null;
  };
  NewStatus: number; // Using number instead of OrderStep enum
}

export interface ILog {
  createdTime: number;
  location: string;
  workLevel: number;
  postMan: { profileUrl: string; name: string } | null;
}

export interface IParcelInfo {
  orderId: string;
  acceptTime: number;
  endTime: number;
  price: number;
  priceType: PriceType;
  sender: string;
  receiver: string;
  weight: number;
  isRejected: boolean;
  lastWorkLevel: number;
  lastUpdateTime: number;
  logesticType: number;
  logs: ILog[];
  from: string;
  to: string;
  id: string;
}
