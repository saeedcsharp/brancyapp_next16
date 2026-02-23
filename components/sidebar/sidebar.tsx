import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import InstagramerSidebar from "brancy/components/sidebar/instagramerSidbar/instagramerSidbar";
import UserSidebar from "brancy/components/sidebar/userSidebar/userSidebar";

const SideBar = () => {
  const router = useRouter();
  const { data: session } = useSession();
  let newRoute = router.route.replaceAll("/", "");

  return (
    <>
      {session &&
        session.user.currentIndex !== -1 &&
        newRoute !== InstagramerRoute.PagePostsCreatePost &&
        newRoute !== InstagramerRoute.PagePostsCreateStory &&
        newRoute !== InstagramerRoute.PagePostsPostInfo &&
        newRoute !== InstagramerRoute.PageStoriesStoryInfo &&
        newRoute !== InstagramerRoute.StoreProductsSelectProduct &&
        newRoute !== InstagramerRoute.StoreProductsProductDetail &&
        newRoute !== UserPanelRoute.CustomerAds &&
        newRoute !== UserPanelRoute.CustomerAdsProgress &&
        newRoute !== UserPanelRoute.UserPanel &&
        newRoute !== UserPanelRoute.UserPanelMessage &&
        newRoute !== UserPanelRoute.UserPanelOrders &&
        newRoute !== UserPanelRoute.UserPanelHome &&
        newRoute !== UserPanelRoute.UserPanelSetting &&
        newRoute !== "404" &&
        !newRoute.includes(UserPanelRoute.UserPanelShop) &&
        !newRoute.includes(InstagramerRoute.Invitation) &&
        newRoute !== "upgrade" &&
        newRoute !== "paymentpackagesuccessCheckout" && <InstagramerSidebar newRoute={newRoute} router={router} />}
      {session &&
        session.user.currentIndex === -1 &&
        (newRoute === UserPanelRoute.UserPanelMessage ||
          newRoute === UserPanelRoute.UserPanelOrders ||
          newRoute === UserPanelRoute.UserPanelHome ||
          newRoute === UserPanelRoute.UserPanelSetting ||
          newRoute === UserPanelRoute.UserPanelWallet ||
          newRoute === UserPanelRoute.UserPanelOrdersFailed ||
          newRoute === UserPanelRoute.UserPaneOrdersDelivered ||
          newRoute === UserPanelRoute.UserPanelOrdersSent ||
          newRoute === UserPanelRoute.UserPanelOrdersPickingup ||
          newRoute === UserPanelRoute.UserPanelOrdersInProgress ||
          newRoute === UserPanelRoute.UserPanelOrdersInQueue ||
          newRoute === UserPanelRoute.UserPanelShop ||
          newRoute.includes(UserPanelRoute.UserPanelOrdersCart)) &&
        newRoute !== "404" && <UserSidebar newRouth={newRoute} router={router} />}
    </>
  );
};

export default SideBar;

export enum InstagramerRoute {
  Home = "home",
  PagePost = "pageposts",
  PagePostsCreatePost = "pagepostscreatepost",
  PagePostsCreateStory = "pagestoriescreatestory",
  PagePostsPostInfo = "pagepostspostinfo",
  PageStories = "pagestories",
  PageAI = "pageai",
  PageStoriesStoryInfo = "pagestoriesstoryinfo",
  StoreProductsSelectProduct = "storeproductsselectproduct",
  StoreProductsProductDetail = "storeproductsproductDetail",
  PageStatistics = "pagestatistics",
  PageTools = "pagetools",
  MessageDirect = "messagedirect",
  MessageComments = "messagecomments",
  MessageTicket = "messageticket",
  MessageWhatsup = "messagewhatsup",
  MessageTelegram = "messagetelegram",
  MessageAIANDFlow = "messageAIAndFlow",
  MessageProperties = "messageProperties",
  WalletStatistics = "walletstatistics",
  WalletPayment = "walletpayment",
  WalletTitle = "wallettitle",
  MarketHome = "markethome",
  MarketmyLink = "marketmylink",
  MarketStatistics = "marketstatistics",
  MarketProperties = "marketproperties",
  AdvertiseCalendar = "advertisecalendar",
  AdvertiseStatistics = "advertisestatistics",
  AdvertiseAdlist = "advertiseadlist",
  AdvertiseProperties = "advertiseProperties",
  StoreProducts = "storeproducts",
  StoreOrders = "storeorders",
  StoreStatistics = "storestatistics",
  StoreProperties = "storeproperties",
  StoreTitle = "storetitle",
  StorePost = "storepost",
  Setting = "setting",
  SettingGeneral = "settinggeneral",
  SettingSubAdmin = "settingsubAdmin",
  Invitation = "invitation",
}
export enum UserPanelRoute {
  CustomerAds = "customerads",
  CustomerAdsProgress = "customeradsprogress",
  UserPanel = "user",
  UserPanelMessage = "usermessage",
  UserPanelOrders = "userorders",
  UserPanelHome = "userhome",
  UserPanelSetting = "usersetting",
  UserPanelWallet = "userwallet",
  UserPanelOrdersFailed = "userordersfailed",
  UserPaneOrdersDelivered = "userordersdelivered",
  UserPanelOrdersSent = "userorderssent",
  UserPanelOrdersPickingup = "userorderspickingup",
  UserPanelOrdersInProgress = "userordersinProgress",
  UserPanelOrdersInQueue = "userordersinQueue",
  UserPanelOrdersCart = "userorderscart",
  UserPanelShop = "usershop",
}
