import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { MouseEvent, useEffect, useState } from "react";
import { InstagramerAccountInfo } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { InstagramerRoute, UserPanelRoute } from "../sidebar/sidebar";
import NavbarHeader from "./instagramerNavbar/navbarHeader";
import NavbarTabs from "./instagramerNavbar/navbarTabs";
import UserPanelNavbar from "./userPanelNavbar/userPanelNavbar";
const Navbar = (props: {
  handleShowHamMenu: (ham: string) => void;
  handleShowUserHamMenu: (ham: string) => void;
  handleShowSearchBar: (e: MouseEvent) => void;
  handleShowNotifBar: (e: MouseEvent) => void;
  handleShowUserNotifBar: (e: MouseEvent) => void;
  handleShowProfile: (e: MouseEvent) => void;
  handleShowUserProfile: (e: MouseEvent) => void;
  handleShowSignOut: (e: MouseEvent) => void;
  handleShowUpgrade: (e: MouseEvent) => void;
  handleShowSwitch: (e: MouseEvent) => void;
  handleShowInstaLogin: () => void;
  handleShowNotPackage: () => void;
  handleShowNotLogin: (show: boolean) => void;
  removeMask: () => void;
  showSearchBar: boolean;
  showNotifBar: boolean;
  showUserNotifBar: boolean;
  showProfile: boolean;
  showUserProfile: boolean;
  toggleNotif: boolean;
}) => {
  const { data: session } = useSession();
  const [InstagramerAccountInfo, setInstagramerAccountInfo] = useState<InstagramerAccountInfo>();
  const router = useRouter();
  let newRoute = router.route.replaceAll("/", "");
  useEffect(() => {
    console.log("sesionnnnnnnnnnn", newRoute);
    if (session && !session.user.isPartner) {
      if (session.user.loginByInsta === false && session.user.currentIndex !== -1) props.handleShowNotLogin(true);
      else props.handleShowNotLogin(false);
    } else if (session && Number(session.user.packageExpireTime) * 1e3 < Date.now() && !session.user.isPartner) {
      props.handleShowNotPackage();
    }
  }, [session]);
  return (
    <>
      {session &&
        session.user.currentIndex !== -1 &&
        // newRoute !== InstagramerRoute.PagePostsCreatePost &&
        // newRoute !== InstagramerRoute.PagePostsCreateStory &&
        // newRoute !== InstagramerRoute.PagePostsPostInfo &&
        newRoute !== UserPanelRoute.CustomerAds &&
        newRoute !== UserPanelRoute.CustomerAdsProgress &&
        newRoute !== UserPanelRoute.UserPanel &&
        newRoute !== UserPanelRoute.UserPanelHome &&
        newRoute !== UserPanelRoute.UserPanelOrders &&
        newRoute !== UserPanelRoute.UserPanelMessage &&
        newRoute !== UserPanelRoute.UserPanelSetting &&
        newRoute !== "404" &&
        !newRoute.includes(InstagramerRoute.Invitation) &&
        !newRoute.includes(UserPanelRoute.UserPanelShop) && (
          <header className="headerTab">
            <NavbarTabs />
            <NavbarHeader
              handleShowHamMenu={props.handleShowHamMenu}
              handleShowSearchBar={props.handleShowSearchBar}
              handleShowNotifBar={props.handleShowNotifBar}
              handleShowProfile={props.handleShowProfile}
              handleShowSignOut={props.handleShowSignOut}
              handleShowUpgrade={props.handleShowUpgrade}
              handleShowSwitch={props.handleShowSwitch}
              removeMask={props.removeMask}
              showSearchBar={props.showSearchBar}
              showNotifBar={props.showNotifBar}
              showProfile={props.showProfile}
              profile={InstagramerAccountInfo?.profileUrl ?? ""}
              toggleNotif={props.toggleNotif}
            />
          </header>
        )}
      {session &&
        session.user.currentIndex === -1 &&
        (newRoute === UserPanelRoute.UserPanel ||
          newRoute === UserPanelRoute.UserPanelHome ||
          newRoute === UserPanelRoute.UserPanelOrders ||
          newRoute === UserPanelRoute.UserPanelMessage ||
          newRoute === UserPanelRoute.UserPanelSetting ||
          newRoute === UserPanelRoute.UserPanelWallet ||
          newRoute === UserPanelRoute.UserPanelOrdersFailed ||
          newRoute === UserPanelRoute.UserPaneOrdersDelivered ||
          newRoute === UserPanelRoute.UserPanelOrdersSent ||
          newRoute === UserPanelRoute.UserPanelOrdersPickingup ||
          newRoute === UserPanelRoute.UserPanelOrdersInProgress ||
          newRoute === UserPanelRoute.UserPanelOrdersInQueue ||
          newRoute.includes(UserPanelRoute.UserPanelShop) ||
          newRoute.includes(UserPanelRoute.UserPanelOrdersCart)) &&
        newRoute !== "404" && (
          <UserPanelNavbar
            handleShowHamMenu={props.handleShowUserHamMenu}
            handleShowNotifBar={props.handleShowUserNotifBar}
            handleShowProfile={props.handleShowUserProfile}
            handleShowSignOut={props.handleShowSignOut}
            handleShowSwitch={props.handleShowSwitch}
            showNotifBar={props.showUserNotifBar}
            showProfile={props.showUserProfile}
          />
        )}
    </>
  );
};

export default Navbar;
