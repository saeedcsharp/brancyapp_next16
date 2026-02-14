export enum OrderProcedure {
  MoneyTick = 0,
  Collection = 1,
  Boxing = 2,
  Posting = 3,
  Reaching = 4,
}
//This enum is necessary for orderstatus component(client side)
export enum OrderProcedureStatus {
  Pending = 0,
  Failed = 1,
  Complete = 2,
}
export enum OrderType {
  NewOrder = 0,
  InProgress = 1,
  Completed = 2,
  Failed = 3,
}
export enum ProductDetailType {
  General,
  Variation,
  Specifications,
  Setting,
}
export enum OrderStep {
  Intialized = -1,
  Paid = 0,
  InstagramerAccepted = 1,
  ShippingRequest = 2,
  InShipping = 3,
  Delivered = 4,
  UserCanceled = 5,
  InstagramerCanceled = 6,
  Expired = 7,
  ShippingFailed = 8,
  Failed = 9,
}
export enum OrderStepStatus {
  Pending = 0,
  Inprogress = 1,
  Pickingup = 2,
  Sent = 3,
  Delivered = 4,
  Failed = 5,
  Incart = 6,
}
export enum OrderStatus {
  // Pending,
  // Confirmed,
  // Shipped,
  // Failed,

  printWaybill = 1,
  pickupRequest = 2,
  // PickingUp statuses
  RequestedPickup = 3,
  PickedUp = 4,
  // Sent statuses
  IssuingTrackingCode = 5,
  TrackingCodeIssued = 6,
  // Failed statuses
  Failed = 7,
  Canceled = 8,
  Returned = 9,
}
export enum AvailabilityStatus {
  Available = 0,
  Restocking = 1,
  OutOfStock = 2,
  Stopped = 3,
}
export enum PriceUnit {
  Dollar = 0,
  Euro = 1,
  Toman = 2,
}
export enum Language {
  English = 0,
  Persian = 1,
}
export enum GauranteeStatus {
  NotSet = 0,
  Yes = 1,
  No = 2,
}
export enum OrginalityStatus {
  Original,
  HighCopy,
  NotOriginal,
  Miscellaneous,
  Fake,
}
export enum ShowProductChildrenStatus {
  ShowMedia,
  ShowThumbnail,
  NotShow,
}
export enum GauranteeLength {
  NotSet = 0,
  ThreeDays = 3,
  OneWeek = 7,
  TwoWeek = 14,
  OneMonth = 30,
  TwoMonth = 60,
  ThreeMonth = 90,
  FourMonth = 120,
  FiveMonth = 150,
  SixMonth = 180,
  OneYear = 360,
  OneYearSixMonth = 540,
  TwoYear = 730,
  ThreeYear = 1080,
  FourYear = 1440,
  FiveYear = 1800,
}
export enum Steps {
  General = 1,
  Information = 2,
  Properties = 3,
  Specification = 4,
  Media = 5,
  Setting = 6,
}
export enum ParcelPocketDeliveryType {
  NotSet = -1,
  None = 0,
  PostEnvelope = 1,
  PostBox = 2,
}
export enum IdentityVerifyType {
  NationalCard = 0,
  RedirectUrl = 1,
}
export enum BusinessBankAccountType {
  CardNumber = 0,
  RedirectUrl = 1,
  StripeAccountId = 2,
}
export enum CreateShopStep {
  None = 0,
  UserAuthorize = 1,
  InstagramerAuthorize = 2,
  AddShopperAddress = 3,
  AddLogesticService = 4,
  CreateShopper = 5,
  CreateInfluencer = 6,
  TermsAndCondition = 7,
}
export enum CreateShopperSteps {
  AuthorizeUser = 0,
  CardNumber = 1,
  Address = 2,
  Shipping = 3,
  AddLogistic = 4,
  TermsAndCondition = 5,
}
export enum LogisticType {
  IRPost_Pishtaz,
  IRPost_Special,
  IRPost_Tipax,
}
export enum ShippingRequestType {
  None = -1,
  TrackingCode = 0,
  Platform = 1,
}
