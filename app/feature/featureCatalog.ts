export type FeatureRole = "instagramer" | "shopper" | "advertiser";
export type FeatureCategory =
  | "account"
  | "content"
  | "analytics"
  | "messaging"
  | "automation"
  | "ai"
  | "market"
  | "finance"
  | "commerce"
  | "orders"
  | "advertising"
  | "settings";
export type FeatureAccess = "free" | "package" | "feature" | "token" | "role" | "verification" | "unknown";
export type FeaturePrerequisite =
  | "instagramConnection"
  | "activePackage"
  | "pagePermission"
  | "messagePermission"
  | "commentPermission"
  | "insightPermission"
  | "automaticRole"
  | "bioRole"
  | "productRole"
  | "orderRole"
  | "shopperAccount"
  | "buyerMode"
  | "featureAi"
  | "featureLottery"
  | "featureDomain"
  | "authorization"
  | "payment"
  | "bankCard";
export type FeatureLimitation =
  | "backendDefined"
  | "noFrontendLimit"
  | "partnerLimit"
  | "persistentMenu"
  | "domain"
  | "bankCard"
  | "discount"
  | "discountUsage"
  | "productSpecification"
  | "backendFeature"
  | "prototype";
export type ContentIdea = "tutorial" | "demo" | "problemSolution" | "featureAnnouncement" | "comparison" | "workflow";
export type SourceKind = "route" | "component" | "api" | "permission" | "enum" | "translation";

export interface FeatureRecord {
  id: string;
  category: FeatureCategory;
  roles: FeatureRole[];
  access: FeatureAccess;
  prerequisites: FeaturePrerequisite[];
  limitation: FeatureLimitation;
  contentIdea: ContentIdea;
  routes: string[];
  sourceKinds: SourceKind[];
  isAi?: boolean;
}

export interface AuditRecord {
  id: string;
  routes: string[];
  sourceKinds: SourceKind[];
}

export const featureCatalog: FeatureRecord[] = [
  {
    id: "accountConnection",
    category: "account",
    roles: ["instagramer", "shopper", "advertiser"],
    access: "role",
    prerequisites: ["instagramConnection"],
    limitation: "backendDefined",
    contentIdea: "tutorial",
    routes: ["/user/instagramerLogin"],
    sourceKinds: ["route", "component", "api", "permission"],
  },
  {
    id: "homeDashboard",
    category: "analytics",
    roles: ["instagramer"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage"],
    limitation: "backendDefined",
    contentIdea: "demo",
    routes: ["/home"],
    sourceKinds: ["route", "component", "api", "permission"],
  },
  {
    id: "postPublishing",
    category: "content",
    roles: ["instagramer"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage", "pagePermission"],
    limitation: "backendDefined",
    contentIdea: "tutorial",
    routes: ["/page/posts", "/page/posts/createpost"],
    sourceKinds: ["route", "component", "api", "permission", "enum"],
  },
  {
    id: "postScheduling",
    category: "content",
    roles: ["instagramer"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage", "pagePermission"],
    limitation: "backendDefined",
    contentIdea: "workflow",
    routes: ["/page/posts", "/page/posts/createpost"],
    sourceKinds: ["route", "component", "api", "permission"],
  },
  {
    id: "storyPublishing",
    category: "content",
    roles: ["instagramer"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage", "pagePermission"],
    limitation: "backendDefined",
    contentIdea: "tutorial",
    routes: ["/page/stories", "/page/stories/createstory"],
    sourceKinds: ["route", "component", "api", "permission"],
  },
  {
    id: "mediaInsights",
    category: "analytics",
    roles: ["instagramer"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage", "pagePermission", "insightPermission"],
    limitation: "backendDefined",
    contentIdea: "problemSolution",
    routes: ["/page/posts/postinfo/[postid]", "/page/stories/storyinfo/[storyid]"],
    sourceKinds: ["route", "component", "api", "permission"],
  },
  {
    id: "pageAnalytics",
    category: "analytics",
    roles: ["instagramer"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage", "pagePermission", "insightPermission"],
    limitation: "backendDefined",
    contentIdea: "demo",
    routes: ["/page/statistics"],
    sourceKinds: ["route", "component", "api", "permission"],
  },
  {
    id: "directInbox",
    category: "messaging",
    roles: ["instagramer"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage", "messagePermission"],
    limitation: "backendDefined",
    contentIdea: "tutorial",
    routes: ["/message/direct"],
    sourceKinds: ["route", "component", "api", "permission", "enum"],
  },
  {
    id: "commentInbox",
    category: "messaging",
    roles: ["instagramer"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage", "commentPermission"],
    limitation: "backendDefined",
    contentIdea: "problemSolution",
    routes: ["/message/comments"],
    sourceKinds: ["route", "component", "api", "permission"],
  },
  {
    id: "supportTickets",
    category: "messaging",
    roles: ["instagramer"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage"],
    limitation: "backendDefined",
    contentIdea: "tutorial",
    routes: ["/message/ticket", "/setting/general"],
    sourceKinds: ["route", "component", "api", "permission"],
  },
  {
    id: "responseRules",
    category: "automation",
    roles: ["instagramer"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage", "messagePermission"],
    limitation: "persistentMenu",
    contentIdea: "workflow",
    routes: ["/message/Properties"],
    sourceKinds: ["route", "component", "api", "permission", "enum"],
  },
  {
    id: "aiFlows",
    category: "ai",
    roles: ["instagramer"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage", "messagePermission", "automaticRole"],
    limitation: "backendDefined",
    contentIdea: "featureAnnouncement",
    routes: ["/message/AIAndFlow"],
    sourceKinds: ["route", "component", "api", "permission", "enum"],
    isAi: true,
  },
  {
    id: "postCaptionAi",
    category: "ai",
    roles: ["instagramer"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage", "pagePermission"],
    limitation: "backendDefined",
    contentIdea: "demo",
    routes: ["/page/posts/createpost"],
    sourceKinds: ["route", "component", "api", "permission"],
    isAi: true,
  },
  {
    id: "aiImageStudio",
    category: "ai",
    roles: ["instagramer"],
    access: "token",
    prerequisites: ["instagramConnection", "activePackage", "automaticRole", "featureAi"],
    limitation: "backendFeature",
    contentIdea: "featureAnnouncement",
    routes: ["/page/ai"],
    sourceKinds: ["route", "component", "api", "permission", "enum"],
    isAi: true,
  },
  {
    id: "hashtagTools",
    category: "automation",
    roles: ["instagramer"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage", "pagePermission"],
    limitation: "backendDefined",
    contentIdea: "tutorial",
    routes: ["/page/tools"],
    sourceKinds: ["route", "component", "api", "permission", "translation"],
  },
  {
    id: "winnerPicker",
    category: "automation",
    roles: ["instagramer"],
    access: "feature",
    prerequisites: ["instagramConnection", "activePackage", "automaticRole", "featureLottery"],
    limitation: "backendFeature",
    contentIdea: "workflow",
    routes: ["/page/tools"],
    sourceKinds: ["route", "component", "api", "permission", "enum"],
  },
  {
    id: "eventIdeas",
    category: "ai",
    roles: ["instagramer"],
    access: "feature",
    prerequisites: ["instagramConnection", "activePackage", "pagePermission", "featureAi"],
    limitation: "backendFeature",
    contentIdea: "problemSolution",
    routes: ["/page/tools"],
    sourceKinds: ["route", "component", "api", "permission", "enum"],
    isAi: true,
  },
  {
    id: "myLinkManagement",
    category: "market",
    roles: ["instagramer", "shopper"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage", "bioRole"],
    limitation: "backendDefined",
    contentIdea: "featureAnnouncement",
    routes: ["/market/mylink", "/market/properties"],
    sourceKinds: ["route", "component", "api", "permission", "enum"],
  },
  {
    id: "customDomain",
    category: "market",
    roles: ["instagramer", "shopper"],
    access: "feature",
    prerequisites: ["instagramConnection", "activePackage", "bioRole", "featureDomain"],
    limitation: "domain",
    contentIdea: "tutorial",
    routes: ["/market/properties"],
    sourceKinds: ["route", "component", "api", "permission", "enum"],
  },
  {
    id: "marketInsights",
    category: "market",
    roles: ["instagramer", "shopper"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage", "bioRole"],
    limitation: "backendDefined",
    contentIdea: "comparison",
    routes: ["/market/statistics"],
    sourceKinds: ["route", "component", "api", "permission"],
  },
  {
    id: "walletAndInvoices",
    category: "finance",
    roles: ["instagramer", "shopper"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage", "bankCard"],
    limitation: "bankCard",
    contentIdea: "tutorial",
    routes: ["/wallet/payment", "/wallet/statistics"],
    sourceKinds: ["route", "component", "api", "enum"],
  },
  {
    id: "aiModelSettings",
    category: "settings",
    roles: ["instagramer"],
    access: "role",
    prerequisites: ["instagramConnection", "automaticRole"],
    limitation: "backendDefined",
    contentIdea: "demo",
    routes: ["/setting/general"],
    sourceKinds: ["component", "api", "permission", "enum"],
    isAi: true,
  },
  {
    id: "partnerManagement",
    category: "settings",
    roles: ["instagramer", "shopper", "advertiser"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage"],
    limitation: "partnerLimit",
    contentIdea: "workflow",
    routes: ["/setting/subAdmin"],
    sourceKinds: ["route", "component", "api", "permission", "enum"],
  },
  {
    id: "productCatalog",
    category: "commerce",
    roles: ["shopper"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage", "shopperAccount", "productRole"],
    limitation: "backendDefined",
    contentIdea: "tutorial",
    routes: ["/store/products", "/store/products/selectproduct"],
    sourceKinds: ["route", "component", "api", "permission", "enum"],
  },
  {
    id: "productAuthoring",
    category: "commerce",
    roles: ["shopper"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage", "shopperAccount", "productRole"],
    limitation: "productSpecification",
    contentIdea: "tutorial",
    routes: ["/store/products/productDetail"],
    sourceKinds: ["route", "component", "api", "permission"],
  },
  {
    id: "variantsInventory",
    category: "commerce",
    roles: ["shopper"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage", "shopperAccount", "productRole"],
    limitation: "backendDefined",
    contentIdea: "problemSolution",
    routes: ["/store/products/productDetail"],
    sourceKinds: ["route", "component", "api", "permission", "enum"],
  },
  {
    id: "discountManagement",
    category: "commerce",
    roles: ["shopper"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage", "shopperAccount", "productRole"],
    limitation: "discount",
    contentIdea: "comparison",
    routes: ["/store/products", "/store/products/productDetail"],
    sourceKinds: ["route", "component", "api", "permission"],
  },
  {
    id: "sellerOrders",
    category: "orders",
    roles: ["shopper"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage", "shopperAccount", "orderRole"],
    limitation: "backendDefined",
    contentIdea: "workflow",
    routes: ["/store/orders"],
    sourceKinds: ["route", "component", "api", "permission", "enum"],
  },
  {
    id: "parcelTracking",
    category: "orders",
    roles: ["shopper"],
    access: "package",
    prerequisites: ["instagramConnection", "activePackage", "shopperAccount", "orderRole"],
    limitation: "backendDefined",
    contentIdea: "demo",
    routes: ["/store/orders"],
    sourceKinds: ["component", "api", "permission"],
  },
  {
    id: "buyerDiscovery",
    category: "commerce",
    roles: ["shopper"],
    access: "role",
    prerequisites: ["buyerMode"],
    limitation: "backendDefined",
    contentIdea: "featureAnnouncement",
    routes: ["/user/home", "/user/business"],
    sourceKinds: ["route", "component", "api"],
  },
  {
    id: "shopCatalog",
    category: "commerce",
    roles: ["shopper"],
    access: "role",
    prerequisites: ["buyerMode"],
    limitation: "backendDefined",
    contentIdea: "tutorial",
    routes: ["/user/business/shop/[shopId]"],
    sourceKinds: ["route", "component", "api"],
  },
  {
    id: "favoritesAndCart",
    category: "commerce",
    roles: ["shopper"],
    access: "role",
    prerequisites: ["buyerMode"],
    limitation: "backendDefined",
    contentIdea: "problemSolution",
    routes: ["/user/business/shop/[shopId]/product/[productId]", "/user/orders/cart"],
    sourceKinds: ["route", "component", "api"],
  },
  {
    id: "checkout",
    category: "orders",
    roles: ["shopper"],
    access: "unknown",
    prerequisites: ["buyerMode", "payment"],
    limitation: "backendDefined",
    contentIdea: "workflow",
    routes: ["/user/orders/cart/[cardId]"],
    sourceKinds: ["route", "component", "api"],
  },
  {
    id: "couponValidation",
    category: "commerce",
    roles: ["shopper"],
    access: "role",
    prerequisites: ["buyerMode"],
    limitation: "backendDefined",
    contentIdea: "tutorial",
    routes: ["/user/orders/cart/[cardId]"],
    sourceKinds: ["component", "api", "enum"],
  },
  {
    id: "buyerOrders",
    category: "orders",
    roles: ["shopper"],
    access: "role",
    prerequisites: ["buyerMode"],
    limitation: "backendDefined",
    contentIdea: "workflow",
    routes: ["/user/orders/inQueue", "/user/orders/inProgress", "/user/orders/sent"],
    sourceKinds: ["route", "component", "api", "enum"],
  },
  {
    id: "advertiserEnrollment",
    category: "advertising",
    roles: ["advertiser"],
    access: "verification",
    prerequisites: ["instagramConnection", "authorization"],
    limitation: "backendDefined",
    contentIdea: "tutorial",
    routes: ["/advertise"],
    sourceKinds: ["component", "api", "enum"],
  },
  {
    id: "advertiserDirectory",
    category: "advertising",
    roles: ["advertiser"],
    access: "role",
    prerequisites: ["buyerMode"],
    limitation: "backendDefined",
    contentIdea: "comparison",
    routes: ["/user/business/advertise"],
    sourceKinds: ["route", "component", "api", "enum"],
  },
  {
    id: "accountTagging",
    category: "advertising",
    roles: ["advertiser"],
    access: "role",
    prerequisites: ["instagramConnection"],
    limitation: "backendDefined",
    contentIdea: "demo",
    routes: ["/customerads/progress"],
    sourceKinds: ["route", "component", "api"],
  },
  {
    id: "accountSwitching",
    category: "account",
    roles: ["instagramer", "shopper", "advertiser"],
    access: "role",
    prerequisites: ["instagramConnection"],
    limitation: "backendDefined",
    contentIdea: "workflow",
    routes: ["/home"],
    sourceKinds: ["component", "api", "permission"],
  },
  {
    id: "languageTheme",
    category: "settings",
    roles: ["instagramer", "shopper", "advertiser"],
    access: "free",
    prerequisites: [],
    limitation: "noFrontendLimit",
    contentIdea: "featureAnnouncement",
    routes: ["/setting/general"],
    sourceKinds: ["component", "api", "translation"],
  },
  {
    id: "subscriptionAccess",
    category: "finance",
    roles: ["instagramer", "shopper", "advertiser"],
    access: "unknown",
    prerequisites: ["instagramConnection", "payment"],
    limitation: "backendFeature",
    contentIdea: "comparison",
    routes: ["/upgrade"],
    sourceKinds: ["route", "component", "api", "enum"],
  },
];

export const auditRecords: AuditRecord[] = [
  {
    id: "advertisingLifecyclePrototype",
    routes: ["/advertise/calendar", "/advertise/adlist", "/advertise/Properties", "/advertise/statistics"],
    sourceKinds: ["route", "component", "translation"],
  },
  {
    id: "customerAdsPrototype",
    routes: ["/customerads", "/customerads/progress"],
    sourceKinds: ["route", "component", "enum", "translation"],
  },
  {
    id: "storePropertiesPrototype",
    routes: ["/store/properties"],
    sourceKinds: ["route", "component", "translation"],
  },
  {
    id: "storeReportsPrototype",
    routes: ["/store/statistics"],
    sourceKinds: ["route", "component", "translation"],
  },
  {
    id: "myLinkCouponPrototype",
    routes: ["/market/mylink"],
    sourceKinds: ["component", "translation"],
  },
  {
    id: "videoCreationIncomplete",
    routes: ["/page/ai"],
    sourceKinds: ["component", "api", "enum"],
  },
  {
    id: "marketHomePrototype",
    routes: ["/market/home"],
    sourceKinds: ["route", "component", "translation"],
  },
  {
    id: "buyerFinanceStubs",
    routes: ["/user/wallet", "/user/payment/orderstatus", "/user/payment/adstatus", "/wallet/title"],
    sourceKinds: ["route", "component", "translation"],
  },
  {
    id: "messagingDownloadStubs",
    routes: ["/message/telegram", "/message/whatsapp"],
    sourceKinds: ["route", "component", "translation"],
  },
  {
    id: "utilityStubs",
    routes: ["/password", "/setting/helpcenter"],
    sourceKinds: ["route", "component"],
  },
];
