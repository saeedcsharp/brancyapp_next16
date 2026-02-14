import { changeLanguage } from "i18next";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import "quill/dist/quill.snow.css";
import { MouseEvent, useContext, useEffect, useState } from "react";
import ConnectionStatusIndicator from "saeed/components/connectionStatus/ConnectionStatusIndicator";
import LeftHamMenue from "saeed/components/hambergurMenu/leftHamMenu";
import LeftUserHamMenue from "saeed/components/hambergurMenu/leftUserHamMenu";
import Navbar from "saeed/components/navbar/navbar";
import MobileNotificationBar from "saeed/components/navbar/userPanelNavbar/notifBar";
import Notification from "saeed/components/notifications/notificationBox";
import NotLogin from "saeed/components/notOk/notLogin";
import NotPackage from "saeed/components/notOk/notPackage";
import "saeed/components/page/statistics/sliderToFourBox.css";
import SignOut from "saeed/components/signout/signOut";
import SwitchAccount from "saeed/components/switchAccount/switchAccount";
import { applyDetectedLocale } from "saeed/helper/detectLocaleFromTimezone";
import "saeed/styles/globals.scss";
import SideBar from "../components/sidebar/sidebar";
import { DirectionProvider } from "../context/directionContext";
import { InstaInfoContext, InstaProvider } from "../context/instaInfoContext";
import i18n from "../i18n";
export default function App({ Component, pageProps }: AppProps) {
  // const [unShowPopup, setUnShowPopup] = useState(false);
  const router = useRouter();
  let newRoute = router.asPath.split("?")[0].replaceAll("/", "");
  const context = useContext(InstaInfoContext);
  const [showLeftHamMenu, setShowLeftHamMenu] = useState<boolean>(false);
  const [showLeftUserHamMenu, setShowLeftUserHamMenu] = useState<boolean>(false);
  const [showRightHamMenu, setShowRightHamMenu] = useState<boolean>(false);
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const [showNotifBar, setShowNotifBar] = useState<boolean>(false);
  const [showUserNotifBar, setShowUserNotifBar] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [showUserProfile, setShowUserProfile] = useState<boolean>(false);
  const [showSignOut, setShowSignOut] = useState<boolean>(false);
  const [showUpgrade, setShowUpgrade] = useState<boolean>(false);
  const [showSwitch, setShowSwitch] = useState<boolean>(false);
  const [showMobileNotif, setShowMobileNotif] = useState(false);
  const [darkTheme, setDarkTheme] = useState<boolean | undefined>(undefined);
  const [showNotPackage, setShowNotPackage] = useState<boolean>(false);
  const [showNotLogin, setShowNotLogin] = useState<boolean>(false);

  // Add useEffect for touch event listener to prevent multi-touch gestures جلوگیری از زوم در حالت موبایل
  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    // Only add the event listener on the client side
    if (typeof window !== "undefined") {
      document.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
    }

    // Clean up the event listener when component unmounts
    return () => {
      if (typeof window !== "undefined") {
        document.removeEventListener("touchstart", handleTouchStart);
      }
    };
  }, []);
  const handleShowNotPackage = () => {
    setShowNotPackage(true);
  };
  const handleShowNotLogin = (show: boolean) => {
    setShowNotLogin(show);
  };
  const handleShowHamMenu = (ham: string) => {
    if (ham === "left") {
      setShowLeftHamMenu(!showLeftHamMenu);
    } else if (ham === "right") {
      setShowRightHamMenu(!showRightHamMenu);
    }
  };
  const handleShowUserHamMenu = (ham: string) => {
    console.log("handleShowUserHamMenu", ham);
    if (ham === "left") {
      setShowLeftUserHamMenu(!showLeftUserHamMenu);
    } else if (ham === "right") {
    }
  };
  const handleShowSearchBar = (e: MouseEvent) => {
    e.stopPropagation();
    setShowSearchBar(!showSearchBar);
  };
  const handleShowNotifBar = (e: MouseEvent) => {
    e.stopPropagation();
    setShowNotifBar(!showNotifBar);
  };
  const handleShowUserNotifBar = (e: MouseEvent) => {
    console.log("handleShowUserNotifBar");
    e.stopPropagation();
    setShowUserNotifBar(!showUserNotifBar);
  };
  const handleShowProfile = (e: MouseEvent) => {
    e.stopPropagation();
    setShowProfile(!showProfile);
  };
  const handleShowUserProfile = (e: MouseEvent) => {
    console.log("handleShowUserProfile");
    e.stopPropagation();
    setShowUserProfile(!showUserProfile);
  };
  const handleShowSignOut = (e: MouseEvent) => {
    e.stopPropagation();
    setShowSignOut(true);
  };
  const handleShowUpgrade = (e: MouseEvent) => {
    e.stopPropagation();
    setShowUpgrade(true);
  };
  const handleShowSwitch = (e: MouseEvent) => {
    e.stopPropagation();
    setShowSwitch(true);
  };
  function handleShowNotifMobile(e: MouseEvent) {
    e.stopPropagation();
    setShowMobileNotif(true);
  }
  const handleShowInstaLogin = () => {
    console.log("instalogiiiiin");
    // e.stopPropagation();
  };
  const removeMask = () => {
    setShowSignOut(false);
    setShowUpgrade(false);
    setShowSwitch(false);
    setShowRightHamMenu(false);
  };
  const removeMask2 = () => {
    setShowSearchBar(false);
    setShowNotifBar(false);
    setShowUserNotifBar(false);
    setShowProfile(false);
    setShowUserProfile(false);
  };
  function mobileRemoveMask() {
    setShowSignOut(false);
    setShowUpgrade(false);
    setShowSwitch(false);
    setShowMobileNotif(false);
    setShowNotPackage(false);
    setShowNotLogin(false);
    setShowLeftHamMenu(false);
    setShowLeftUserHamMenu(false);
  }

  useEffect(() => {
    if (darkTheme !== undefined) {
      if (darkTheme) {
        document.documentElement.setAttribute("data-theme", "dark");
        window.localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
        window.localStorage.setItem("theme", "light");
      }
    }
  }, [darkTheme]);

  useEffect(() => {
    let lng = window.localStorage.getItem("language");
    let theme = window.localStorage.getItem("theme");
    let calendar = window.localStorage.getItem("calendar");

    // Auto-detect locale on first visit (only if no settings exist)
    if (!lng || !calendar) {
      applyDetectedLocale(changeLanguage);
      lng = window.localStorage.getItem("language");
      calendar = window.localStorage.getItem("calendar");
    }

    if (!calendar) window.localStorage.setItem("calendar", "Gregorian");
    setDarkTheme(theme === "dark" ? true : false);
    i18n.init();
    if (lng) changeLanguage(lng);
  }, []);
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload(); // Force reload when a new SW takes over
      });
    }
  }, []);
  const [toggleNotif, setToggleNotif] = useState(false);
  const isProd = process.env.NODE_ENV === "production";
  const loadInDev = process.env.NEXT_PUBLIC_LOAD_MATOMO_IN_DEV === "true";
  const shouldLoadMatomo = isProd || loadInDev;
  const matomoBase = isProd ? "https://mymatomo.brancy.app/" : "/api/matomo/";
  return (
    <main id="marketAds" className="marketAdsCart" onClick={removeMask2}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="touch-action" content="manipulation" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Head>
      {shouldLoadMatomo && (
        <>
          <Script id="matomo-init" strategy="afterInteractive">
            {`
              var _paq = window._paq = window._paq || [];
              _paq.push(['setCustomDimension', 1, window.location.hostname]);
              _paq.push(['trackPageView']);
              _paq.push(['enableLinkTracking']);
              var u = '${matomoBase}';
              _paq.push(['setTrackerUrl', u + 'matomo.php']);
              _paq.push(['setSiteId', '1']);
            `}
          </Script>
          <Script id="matomo-src" strategy="afterInteractive" src={`${matomoBase}matomo.js`} />
        </>
      )}

      <SessionProvider refetchOnWindowFocus={false} refetchInterval={0} refetchWhenOffline={false}>
        <DirectionProvider>
          <InstaProvider>
            <SideBar />
            <div className="frameGroup">
              <Navbar
                handleShowNotPackage={handleShowNotPackage}
                handleShowNotLogin={handleShowNotLogin}
                handleShowSearchBar={handleShowSearchBar}
                handleShowNotifBar={handleShowNotifBar}
                handleShowHamMenu={handleShowHamMenu}
                handleShowUserHamMenu={handleShowUserHamMenu}
                handleShowProfile={handleShowProfile}
                handleShowSignOut={handleShowSignOut}
                handleShowUpgrade={() => {
                  router.push("/upgrade");
                }}
                handleShowSwitch={handleShowSwitch}
                handleShowInstaLogin={handleShowInstaLogin}
                handleShowUserNotifBar={handleShowUserNotifBar}
                handleShowUserProfile={handleShowUserProfile}
                removeMask={mobileRemoveMask}
                showSearchBar={showSearchBar}
                showNotifBar={showNotifBar}
                showProfile={showProfile}
                showUserNotifBar={showUserNotifBar}
                showUserProfile={showUserProfile}
                toggleNotif={toggleNotif}
              />
              <Notification />
              {showLeftHamMenu && (
                <LeftHamMenue
                  removeMask={() => setShowLeftHamMenu(false)}
                  handleShowSignOut={handleShowSignOut}
                  handleShowUpgrade={() => {
                    setShowLeftHamMenu(false);
                    router.push("/upgrade");
                  }}
                  handleShowSwitch={handleShowSwitch}
                  handleRemoveNotifLogo={() => setToggleNotif((prev) => !prev)}
                />
              )}
              {showLeftUserHamMenu && (
                <LeftUserHamMenue
                  removeMask={() => setShowLeftUserHamMenu((prev) => !prev)}
                  handleShowSignOut={handleShowSignOut}
                  handleShowUpgrade={() => {
                    setShowLeftUserHamMenu(false);
                    router.push("/upgrade");
                  }}
                  handleShowSwitch={handleShowSwitch}
                />
              )}
              {/* {showRightHamMenu && (
                <RightHamMenue
                  removeMask={removeMask}
                  handleShowSignOut={handleShowSignOut}
                  handleShowUpgrade={handleShowUpgrade}
                  handleShowSwitch={handleShowSwitch}
                  handleShowNotifMobile={handleShowNotifMobile}
                />
              )} */}
              {showSignOut && <SignOut removeMask={mobileRemoveMask} />}
              {/* {showUpgrade && <Upgrade removeMask={mobileRemoveMask} />} */}
              {showSwitch && <SwitchAccount removeMask={mobileRemoveMask} />}
              {showNotPackage && newRoute !== "upgrade" && newRoute !== "paymentpackagesuccessCheckout" && (
                <NotPackage removeMask={mobileRemoveMask} />
              )}
              {showNotLogin && <NotLogin removeMask={mobileRemoveMask} />}
              {showMobileNotif && <MobileNotificationBar data={""} removeMask={mobileRemoveMask} />}
              {showUserNotifBar && <></>}
              {showUserProfile && <></>}
              <ConnectionStatusIndicator />
              <Component {...pageProps} />
            </div>
          </InstaProvider>
        </DirectionProvider>
      </SessionProvider>
    </main>
  );
}
