/**
 * Maps local API paths (/api/{scope}/{action}) to backend sub-URLs on https://api.brancy.app/
 * Used by clientFetchApi to call the backend directly (bypassing Next.js API proxy)
 * for all routes EXCEPT /api/user/*.
 */
export const API_ROUTE_MAP: Record<string, string> = {
  // ── account ───────────────────────────────────────────
  "/api/account/createPartner": "Instagramer/Account/CreatePartner",
  "/api/account/getInfo": "Instagramer/Account/GetInfo",
  "/api/account/getPartners": "Instagramer/Account/GetPartners",
  "/api/account/getTitleInfo": "User/Account/GetTitleInfo",
  "/api/account/removePartner": "Instagramer/Account/RemovePartner",
  "/api/account/updatePartner": "Instagramer/Account/UpdatePartner",

  // ── address ───────────────────────────────────────────
  "/api/address/createAddressByPostalCode": "User/Address/CreateAddressByPostalCode",
  "/api/address/getAddresses": "User/Address/GetAddresses",
  "/api/address/getAddressInputType": "User/Address/GetAddressInputType",
  "/api/address/updateUserAddress": "User/Address/UpdateUserAddress",

  // ── ai ────────────────────────────────────────────────
  "/api/ai/createPrompt": "Instagramer/AI/CreatePrompt",
  "/api/ai/getPrompt": "Instagramer/AI/GetPrompt",
  "/api/ai/getPromptAnalysis": "Instagramer/AI/GetPromptAnalysis",
  "/api/ai/getPrompts": "Instagramer/AI/GetPrompts",
  "/api/ai/getTools": "Instagramer/AI/GetTools",
  "/api/ai/sendTestMessage": "Instagramer/AI/SendTestMessage",

  // ── authorize ─────────────────────────────────────────
  "/api/authorize/authorizeInstagramerByCardNumber": "Business/Authorize/AuthorizeInstagramerByCardNumber",
  "/api/authorize/createShopper": "Business/Authorize/CreateShopper",
  "/api/authorize/getAuthorizeLevel": "Business/Authorize/GetAuthorizeLevel",
  "/api/authorize/getAuthorizeUserType": "Business/Authorize/GetAuthorizeUserType",
  "/api/authorize/getInstagramerAuthorizeType": "Business/Authorize/GetInstagramerAuthorizeType",
  "/api/authorize/getShopLogestics": "Business/Authorize/GetShopLogestics",
  "/api/authorize/saveSupportLogestic": "Business/Authorize/SaveSupportLogestic",
  "/api/authorize/setShopAddress": "Business/Authorize/SetShopAddress",
  "/api/authorize/userAuthorizeByNationalCard": "Business/Authorize/UserAuthorizeByNationalCard",

  // ── bio ───────────────────────────────────────────────
  "/api/bio/getAnnouncement": "Instagramer/bio/GetAnnouncement",
  "/api/bio/getContact": "Instagramer/bio/GetContact",
  "/api/bio/getCustomBanners": "Instagramer/Bio/GetCustomBanners",
  "/api/bio/getCustomProfile": "Instagramer/Bio/GetCustomProfile",
  "/api/bio/getFaqs": "Instagramer/bio/GetFaqs",
  "/api/bio/getMyLink": "Instagramer/Bio/GetMyLink",
  "/api/bio/getOrderItems": "Instagramer/Bio/GetOrderItems",
  "/api/bio/getTotalInsight": "Instagramer/Bio/GetTotalInsight",
  "/api/bio/getTotalInsightFigures": "Instagramer/Bio/GetTotalInsightFigures",
  "/api/bio/getVideoInsight": "Instagramer/Bio/GetVideoInsight",
  "/api/bio/saveAparatPage": "instagramer/Bio/SaveAparatPage",
  "/api/bio/saveYoutubePage": "instagramer/Bio/SaveYoutubePage",
  "/api/bio/toggleFeatureBox": "Instagramer/Bio/ToggleFeatureBox",
  "/api/bio/updateContact": "Instagramer/bio/UpdateContact",
  "/api/bio/updateCustomBanners": "Instagramer/Bio/UpdateCustomBanners",
  "/api/bio/updateCustomProfile": "Instagramer/Bio/UpdateCustomProfile",
  "/api/bio/updateFaqs": "Instagramer/bio/UpdateFaqs",
  "/api/bio/updateOrderItems": "Instagramer/Bio/UpdateOrderItems",

  // ── comment ───────────────────────────────────────────
  "/api/comment/generateCommentBaseAI": "Instagramer/Comment/GenerateCommentBaseAI",
  "/api/comment/getInbox": "Instagramer/Comment/GetInbox",
  "/api/comment/getMediaComments": "Instagramer/Comment/GetMediaComments",
  "/api/comment/updateLiveAutoReply": "Instagramer/Comment/UpdateLiveAutoReply",

  // ── dayevent ──────────────────────────────────────────
  "/api/dayevent/getEvents": "Instagramer/DayEvent/GetEvents",

  // ── flow ──────────────────────────────────────────────
  "/api/flow/createMasterFlow": "Instagramer/Flow/CreateMasterFlow",
  "/api/flow/getMasterFlow": "Instagramer/Flow/GetMasterFlow",
  "/api/flow/getMasterFlows": "Instagramer/Flow/GetMasterFlows",
  "/api/flow/getShortMasterFlow": "Instagramer/Flow/GetShortMasterFlow",

  // ── hashtag ───────────────────────────────────────────
  "/api/hashtag/createHashtagList": "Instagramer/hashtag/createHashtagList",
  "/api/hashtag/deleteHashtagList": "Instagramer/hashtag/DeleteHashtagList",
  "/api/hashtag/getHashtagList": "Instagramer/hashtag/GetHashtagList",
  "/api/hashtag/getHashtagsByImage": "Instagramer/hashtag/GetHashtagsByImage",
  "/api/hashtag/getTrendHashtag": "Instagramer/hashtag/GetTrendHashtag",
  "/api/hashtag/searchHashtag": "Instagramer/hashtag/searchHashtag",
  "/api/hashtag/updateHashtagList": "Instagramer/hashtag/UpdateHashtagList",

  // ── home ──────────────────────────────────────────────
  "/api/home/getLastComments": "Instagramer/Home/GetLastComments",
  "/api/home/getLastMessages": "Instagramer/Home/GetLastMessages",
  "/api/home/getPageSummary": "Instagramer/Home/GetPageSummary",
  "/api/home/getTiles": "Instagramer/Home/GetTiles",

  // ── instagramer ───────────────────────────────────────
  "/api/instagramer/searchPeople": "instagramer/searchPeople",

  // ── link ──────────────────────────────────────────────
  "/api/link/createLink": "Instagramer/link/CreateLink",
  "/api/link/deleteLink": "Instagramer/link/deleteLink",
  "/api/link/getAllLinkInsight": "Instagramer/Link/GetAllLinkInsight",
  "/api/link/getAllLinks": "Instagramer/link/GetAllLinks",
  "/api/link/getLinkInsight": "Instagramer/Link/GetLinkInsight",
  "/api/link/updateLink": "Instagramer/link/UpdateLink",
  "/api/link/updateOrders": "Instagramer/link/UpdateOrders",

  // ── lottery ───────────────────────────────────────────
  "/api/lottery/createLottery": "Instagramer/Lottery/CreateLottery",
  "/api/lottery/getFullLottery": "Instagramer/Lottery/GetFullLottery",
  "/api/lottery/getLastBannerSetting": "Instagramer/Lottery/GetLastBannerSetting",
  "/api/lottery/getLastTermsUis": "Instagramer/Lottery/GetLastTermsUis",
  "/api/lottery/getLotteryInfo": "Instagramer/Lottery/GetLotteryInfo",
  "/api/lottery/getShortLotteries": "Instagramer/Lottery/GetShortLotteries",
  "/api/lottery/publishBanner": "Instagramer/Lottery/PublishBanner",
  "/api/lottery/publishTerms": "Instagramer/Lottery/PublishTerms",
  "/api/lottery/rejectLottery": "Instagramer/Lottery/RejectLottery",

  // ── message ───────────────────────────────────────────
  "/api/message/createGeneralAutoReply": "Instagramer/Message/CreateGeneralAutoReply",
  "/api/message/getAutoReplySetting": "Instagramer/Message/GetAutoReplySetting",
  "/api/message/getDirectInbox": "Instagramer/Message/GetDirectInbox",
  "/api/message/getDirectParentItem": "Instagramer/Message/GetDirectParentItem",
  "/api/message/getGeneralAutoReplies": "Instagramer/Message/GetGeneralAutoReplies",
  "/api/message/getIceBreaker": "Instagramer/Message/GetIceBreaker",
  "/api/message/getPersistentMenu": "Instagramer/Message/GetPersistentMenu",
  "/api/message/getThread": "Instagramer/Message/GetThread",
  "/api/message/setDefaultLanguage": "Instagramer/Message/SetDefaultLanguage",
  "/api/message/toggleCheckFollowerTemplate": "Instagramer/Message/ToggleCheckFollowerTemplate",
  "/api/message/toggleHideCommentAutoReply": "Instagramer/Message/ToggleHideCommentAutoReply",
  "/api/message/toggleIceBreaker": "Instagramer/Message/ToggleIceBreaker",
  "/api/message/toggleLikeReplyAutoReply": "Instagramer/Message/ToggleLikeReplyAutoReply",
  "/api/message/togglePersistentMenu": "Instagramer/Message/TogglePersistentMenu",
  "/api/message/updateCheckFollowerTemplate": "Instagramer/Message/UpdateCheckFollowerTemplate",
  "/api/message/updateIceBreaker": "Instagramer/Message/UpdateIceBreaker",
  "/api/message/updatePersistentMenu": "Instagramer/Message/UpdatePersistentMenu",

  // ── order ─────────────────────────────────────────────
  "/api/order/acceptOrder": "Shopper/Order/AcceptOrder",
  "/api/order/createOrder": "User/Order/CreateOrder",
  "/api/order/getFullOrder": "Shopper/Order/GetFullOrder",
  "/api/order/getOrderPaymentLink": "User/Order/GetOrderPaymentLink",
  "/api/order/getOrdersByStatus": "Shopper/Order/GetOrdersByStatus",
  "/api/order/getOrdersByStatuses": "Shopper/Order/GetOrdersByStatuses",
  "/api/order/getParcelInfo": "Shopper/Order/GetParcelInfo",
  "/api/order/getShippingRequestType": "Shopper/Order/GetShippingRequestType",
  "/api/order/readyOrderForShipping": "Shopper/Order/ReadyOrderForShipping",
  "/api/order/rejectOrder": "Shopper/Order/RejectOrder",
  "/api/order/sentOrderByNonRequestType": "Shopper/Order/SentOrderByNonRequestType",
  "/api/order/sentOrderByParcelId": "Shopper/Order/SentOrderByParcelId",
  "/api/order/setNonTrackingIdOrderDelivered": "Shopper/Order/SetNonTrackingIdOrderDelivered",

  // ── post ──────────────────────────────────────────────
  "/api/post/deleteDraft": "Instagramer/Post/deleteDraft",
  "/api/post/deletePrePost": "Instagramer/Post/deletePrePost",
  "/api/post/generateCaptionWithAI": "Instagramer/Post/GenerateCaptionWithAI",
  "/api/post/getBestPublishTime": "Instagramer/Post/GetBestPublishTime",
  "/api/post/getCaptionPromptExamples": "Instagramer/Post/GetCaptionPromptExamples",
  "/api/post/getDraft": "Instagramer/Post/GetDraft",
  "/api/post/getPostByGuid": "Instagramer/Post/GetPostByGuid",
  "/api/post/getPostByScrollingDown": "Instagramer/Post/GetPostByScrollingDown",
  "/api/post/getPostCards": "Instagramer/Post/GetPostCards",
  "/api/post/getPostInfo": "Instagramer/Post/GetPostInfo",
  "/api/post/getPostInsightInfo": "Instagramer/Post/GetPostInsightInfo",
  "/api/post/getPosts": "Instagramer/Post/GetPosts",
  "/api/post/getPublishLimitContent": "Instagramer/Post/GetPublishLimitContent",
  "/api/post/getShortPost": "Instagramer/Post/GetShortPost",
  "/api/post/publishCarousel": "Instagramer/Post/PublishCarousel",
  "/api/post/updateAutoReply": "Instagramer/Post/UpdateAutoReply",

  // ── preinstagramer ────────────────────────────────────
  "/api/preinstagramer/getFacebookRedirect": "PreInstagramer/GetFacebookRedirect",
  "/api/preinstagramer/getInstagramRedirect": "PreInstagramer/GetInstagramRedirect",
  "/api/preinstagramer/sendCode": "PreInstagramer/SendCode",
  "/api/preinstagramer/verifyCode": "PreInstagramer/VerifyCode",

  // ── product ───────────────────────────────────────────
  "/api/product/createSubProducts": "shopper/Product/CreateSubProducts",
  "/api/product/getFullProductList": "shopper/Product/GetFullProductList",
  "/api/product/getLastTempIdAndNonProductsCount": "shopper/Product/GetLastTempIdAndNonProductsCount",
  "/api/product/getMaxSize": "Shopper/Product/GetMaxSize",
  "/api/product/getMediaSuggestion": "shopper/Product/GetMediaSuggestion",
  "/api/product/getProductByTempId": "shopper/Product/GetProductByTempId",
  "/api/product/getProductList": "shopper/Product/GetProductList",
  "/api/product/insertProductMedia": "shopper/Product/InsertProductMedia",
  "/api/product/saveProductSuggestion": "shopper/Product/SaveProductSuggestion",
  "/api/product/searchProducts": "shopper/Product/SearchProducts",
  "/api/product/unLoadProduct": "shopper/Product/UnLoadProduct",
  "/api/product/updateChildrenMediaStatus": "shopper/Product/UpdateChildrenMediaStatus",
  "/api/product/updateSecondaryProductDetails": "shopper/Product/UpdateSecondaryProductDetails",
  "/api/product/updateSelfMediaStatus": "shopper/Product/UpdateSelfMediaStatus",
  "/api/product/updateSpecificationOrder": "shopper/Product/UpdateSpecificationOrder",

  // ── psg ───────────────────────────────────────────────
  "/api/psg/getPackageFeatureDetails": "Instagramer/PSG/GetPackageFeatureDetails",
  "/api/psg/getPackagePrices": "Instagramer/PSG/GetPackagePrices",
  "/api/psg/getRedirectReserveFeaturePrice": "Instagramer/PSG/GetRedirectReserveFeaturePrice",
  "/api/psg/getReserveFeaturePrices": "Instagramer/PSG/GetReserveFeaturePrices",

  // ── session ───────────────────────────────────────────
  "/api/session/approvePartnerRequest": "user/Session/ApprovePartnerRequest",
  "/api/session/deleteSession": "User/Session/DeleteSession",
  "/api/session/getPartners": "user/Session/GetPartners",
  "/api/session/getSessions": "User/Session/GetSessions",
  "/api/session/rejectPartnerRequest": "user/Session/RejectPartnerRequest",

  // ── shop ──────────────────────────────────────────────
  "/api/shop/addCard": "user/shop/AddCard",
  "/api/shop/getAllCard": "user/shop/GetAllCard",
  "/api/shop/getExplorer": "user/shop/GetExplorer",
  "/api/shop/getFavoriteProducts": "user/shop/GetFavoriteProducts",
  "/api/shop/getfilters": "user/shop/getfilters",
  "/api/shop/getfullproduct": "user/shop/getfullproduct",
  "/api/shop/getfullshop": "user/shop/getfullshop",
  "/api/shop/getInstagramerCard": "user/shop/GetInstagramerCard",
  "/api/shop/getLogesticPrice": "user/shop/GetLogesticPrice",
  "/api/shop/getPriceHistory": "user/shop/GetPriceHistory",
  "/api/shop/getProductComments": "user/shop/GetProductComments",
  "/api/shop/getProductCoupon": "user/shop/GetProductCoupon",
  "/api/shop/getproducthashtags": "user/shop/getproducthashtags",
  "/api/shop/getshopproducts": "user/shop/getshopproducts",
  "/api/shop/reportProduct": "user/shop/ReportProduct",
  "/api/shop/searchshop": "user/shop/searchshop",
  "/api/shop/searchshopproducts": "user/shop/searchshopproducts",
  "/api/shop/updateFavoriteProduct": "user/shop/UpdateFavoriteProduct",

  // ── statistics ────────────────────────────────────────
  "/api/statistics/getBestFollowers": "Instagramer/Statistics/GetBestFollowers",
  "/api/statistics/getDemographicInsight": "Instagramer/Statistics/GetDemographicInsight",
  "/api/statistics/getEngagmentStatistics": "Instagramer/Statistics/GetEngagmentStatistics",
  "/api/statistics/getFollowerStatistics": "Instagramer/Statistics/GetFollowerStatistics",
  "/api/statistics/getOverview": "Instagramer/Statistics/GetOverview",
  "/api/statistics/getTimeAnalysis": "Instagramer/Statistics/GetTimeAnalysis",

  // ── story ─────────────────────────────────────────────
  "/api/story/getLastActiveStories": "Instagramer/Story/GetLastActiveStories",
  "/api/story/getNextStories": "Instagramer/Story/GetNextStories",
  "/api/story/getPreStory": "Instagramer/Story/GetPreStory",
  "/api/story/getStory": "Instagramer/Story/GetStory",
  "/api/story/getStoryInsight": "Instagramer/Story/GetStoryInsight",
  "/api/story/getStoryReplies": "Instagramer/Story/GetStoryReplies",
  "/api/story/loadingStoryPage": "Instagramer/Story/LoadingStoryPage",
  "/api/story/searchViewers": "Instagramer/Story/SearchViewers",
  "/api/story/updateAutoReply": "Instagramer/Story/UpdateAutoReply",

  // ── systemticket ──────────────────────────────────────
  "/api/systemticket/addSystemTicketItem": "User/SystemTicket/AddSystemTicketItem",
  "/api/systemticket/createSystemTicketBaseOrderId": "User/SystemTicket/CreateSystemTicketBaseOrderId",
  "/api/systemticket/getSystemInbox": "User/SystemTicket/GetSystemInbox",
  "/api/systemticket/getSystemTicket": "User/SystemTicket/GetSystemTicket",
  "/api/systemticket/reportToAdmin": "User/SystemTicket/ReportToAdmin",
  "/api/systemticket/seenSystemTicket": "User/SystemTicket/SeenSystemTicket",
  "/api/systemticket/updateSystemTicketHideStatus": "User/SystemTicket/UpdateSystemTicketHideStatus",
  "/api/systemticket/updateSystemTicketPinStatus": "User/SystemTicket/UpdateSystemTicketPinStatus",

  // ── ticket ────────────────────────────────────────────
  "/api/ticket/addSystemTicketItem": "Instagramer/Ticket/AddSystemTicketItem",
  "/api/ticket/closeFbTicket": "Instagramer/Ticket/CloseFbTicket",
  "/api/ticket/closePlatformTicket": "Instagramer/Ticket/ClosePlatformTicket",
  "/api/ticket/createPlatformTicket": "Instagramer/Ticket/CreatePlatformTicket",
  "/api/ticket/getFbInbox": "Instagramer/Ticket/GetFbInbox",
  "/api/ticket/getFbTicketItems": "Instagramer/Ticket/GetFbTicketItems",
  "/api/ticket/getPlatformTicket": "Instagramer/Ticket/GetPlatformTicket",
  "/api/ticket/getPlatformTicketInbox": "Instagramer/Ticket/GetPlatformTicketInbox",
  "/api/ticket/getPlatformTicketInsight": "Instagramer/Ticket/GetPlatformTicketInsight",
  "/api/ticket/getSystemInbox": "Instagramer/Ticket/GetSystemInbox",
  "/api/ticket/getSystemTicket": "Instagramer/Ticket/GetSystemTicket",
  "/api/ticket/readFbTicket": "Instagramer/Ticket/ReadFbTicket",
  "/api/ticket/seenPlatformTicket": "Instagramer/Ticket/SeenPlatformTicket",
  "/api/ticket/seenSystemTicket": "Instagramer/Ticket/SeenSystemTicket",
  "/api/ticket/updateFbTicketItems": "Instagramer/Ticket/UpdateFbTicketItems",
  "/api/ticket/updatePlatformTicket": "Instagramer/Ticket/UpdatePlatformTicket",
  "/api/ticket/updatePlatformTicketPinStatus": "Instagramer/Ticket/UpdatePlatformTicketPinStatus",
  "/api/ticket/updateSystemTicketHideStatus": "Instagramer/Ticket/UpdateSystemTicketHideStatus",
  "/api/ticket/updateSystemTicketPinStatus": "Instagramer/Ticket/UpdateSystemTicketPinStatus",

  // ── uisetting ─────────────────────────────────────────
  "/api/uisetting/get": "Instagramer/UiSetting/Get",
  "/api/uisetting/update": "Instagramer/UiSetting/Update",
};

/**
 * Look up the backend sub-URL for a given local API path.
 * Returns null if the path is not found (caller should fall back to proxy or dynamic catch-all).
 */
export function resolveBackendSubUrl(localPath: string): string | null {
  // Normalize: remove query string, lowercase for lookup
  const clean = localPath.split("?")[0];
  // Try exact match first
  if (API_ROUTE_MAP[clean]) return API_ROUTE_MAP[clean];

  // Try case-insensitive match
  const lower = clean.toLowerCase();
  for (const [key, value] of Object.entries(API_ROUTE_MAP)) {
    if (key.toLowerCase() === lower) return value;
  }

  return null;
}
