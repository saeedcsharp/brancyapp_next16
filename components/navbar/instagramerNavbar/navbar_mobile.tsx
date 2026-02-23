import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { InstagramerRoute } from "brancy/components/sidebar/sidebar";
import { LanguageKey } from "brancy/i18n";
import styles from "brancy/components/navbar/instagramerNavbar/navbarheader.module.css";

const NavbarMobile = (prop: { handleShowHamMenu: (ham: string) => void; gooli: boolean }) => {
  const { t } = useTranslation();
  const router = useRouter();
  let newRoute = router.route.replaceAll("/", "");
  const [navbarRout, setNavbarRout] = useState("");
  useEffect(() => {
    if (newRoute === InstagramerRoute.Home) setNavbarRout("home");
    else if (
      newRoute === InstagramerRoute.PagePost ||
      newRoute === InstagramerRoute.PageStories ||
      newRoute === InstagramerRoute.PageStatistics ||
      newRoute === InstagramerRoute.PageTools
    )
      setNavbarRout("page");
    else if (
      newRoute === InstagramerRoute.MessageDirect ||
      newRoute === InstagramerRoute.MessageComments ||
      newRoute === InstagramerRoute.MessageTicket ||
      newRoute === InstagramerRoute.MessageAIANDFlow ||
      // newRoute === "messagewhatsapp" ||
      // newRoute === "messagetelegram" ||
      newRoute === InstagramerRoute.MessageProperties
    )
      setNavbarRout("message");
    else if (
      newRoute === InstagramerRoute.WalletStatistics ||
      newRoute === InstagramerRoute.WalletPayment ||
      newRoute === InstagramerRoute.WalletTitle
    )
      setNavbarRout("wallet");
    else if (
      newRoute === InstagramerRoute.MarketHome ||
      newRoute === InstagramerRoute.MarketmyLink ||
      newRoute === InstagramerRoute.MarketStatistics ||
      newRoute === InstagramerRoute.MarketProperties
    )
      setNavbarRout("market");
    else if (
      newRoute === InstagramerRoute.AdvertiseCalendar ||
      newRoute === InstagramerRoute.AdvertiseStatistics ||
      newRoute === InstagramerRoute.AdvertiseAdlist ||
      newRoute === InstagramerRoute.AdvertiseProperties
    )
      setNavbarRout("advertise");
    else if (
      newRoute === InstagramerRoute.StoreProducts ||
      newRoute === InstagramerRoute.StoreOrders ||
      newRoute === InstagramerRoute.StoreStatistics ||
      newRoute === InstagramerRoute.StoreProperties ||
      newRoute === InstagramerRoute.StorePost
    )
      setNavbarRout("store");
    else if (
      newRoute === InstagramerRoute.Setting ||
      newRoute === InstagramerRoute.SettingGeneral ||
      newRoute === InstagramerRoute.SettingSubAdmin
    )
      setNavbarRout("setting");
  }, [router]);
  const getTranslatedText = () => {
    switch (navbarRout) {
      case "home":
        return t(LanguageKey.sidebar_Home);
      case "page":
        return t(LanguageKey.sidebar_Page);
      case "message":
        return t(LanguageKey.sidebar_Message);
      case "wallet":
        return t(LanguageKey.sidebar_Wallet);
      case "market":
        return t(LanguageKey.sidebar_Market);
      case "advertise":
        return t(LanguageKey.sidebar_Advertise);
      case "store":
        return t(LanguageKey.sidebar_Store);
      case "setting":
        return t(LanguageKey.sidebar_Setting);
      default:
        return "";
    }
  };

  const getIconPath = () => {
    switch (navbarRout) {
      case "home":
        return (
          <>
            <path
              opacity=".4"
              fill="var(--color-ffffff)"
              d="m27.8 8.3-9-7a6 6 0 0 0-7.6 0l-9 7A6 6 0 0 0 0 12.7v11C0 27.3 3 30 6.5 30h17c3.6 0 6.5-2.8 6.5-6.2V12.7q0-2.6-2.2-4.4"
            />
            <path
              fill="var(--color-ffffff)"
              d="M20 23.7q-.1 1.2-1.3 1.3h-7.4q-1.2-.1-1.3-1.3V19c0-2.7 2.2-4.9 5-4.9s5 2.2 5 4.9z"
            />
          </>
        );
      case "page":
        return (
          <>
            <path
              d="M8 1H4.2A4 4 0 0 0 0 5v4a4 4 0 0 0 4.1 4.1h4A4 4 0 0 0 12 9V5a4 4 0 0 0-4-4m16.8 16.8H21a4 4 0 0 0-4.1 4.1v4a4 4 0 0 0 4 4.1h4a4 4 0 0 0 4.2-4.1v-4a4 4 0 0 0-4.2-4m-16.8 0H4a4 4 0 0 0-4.1 4v4A4 4 0 0 0 4.1 30h4a4 4 0 0 0 4-4.1v-4a4 4 0 0 0-4-4"
              fillOpacity=".4"
              fill="var(--color-ffffff)"
            />
            <path
              d="M20 12.8a4 4 0 0 0 6 0l2.8-2.8a4 4 0 0 0 0-6l-2.9-2.8a4.3 4.3 0 0 0-5.9 0L17.2 4a4 4 0 0 0 0 6z"
              fill="var(--color-ffffff)"
            />
          </>
        );
      case "message":
        return (
          <>
            <path
              opacity=".4"
              fill="var(--color-ffffff)"
              d="M15.6 18.4q-1.5-.2-1.7-1.8.2-1.7 1.7-1.8 1.7.1 1.8 1.8c0 1.7-.8 1.8-1.8 1.8m-7.7 0q-1.7-.2-1.8-1.8.2-1.7 1.8-1.8 1.5.1 1.7 1.8c.2 1.7-.8 1.8-1.7 1.8M18.5 6h-13A5.6 5.6 0 0 0 0 11.7V21a5.6 5.6 0 0 0 5.5 5.7h1.4q1 0 1.6.7l1.9 1.9a2.3 2.3 0 0 0 3.3 0l1.8-2a2 2 0 0 1 1.6-.6h1.4A5.6 5.6 0 0 0 24 21v-9.3A5.6 5.6 0 0 0 18.5 6"
            />
            <path
              fill="var(--color-ffffff)"
              d="M25.5 0H12.3A5.5 5.5 0 0 0 7 4q0 .2.3.3h10.2c6-.4 8.7 2.7 8.7 8.2v7.2q0 .3.4.3a5.6 5.6 0 0 0 4.4-5.4v-9A5.6 5.6 0 0 0 25.5 0"
            />
          </>
        );
      case "wallet":
        return (
          <>
            <path
              opacity=".4"
              fill="var(--color-ffffff)"
              d="M27.7 11.2q0 .4-.5.5H2.8q-.5-.1-.5-.5V8.5c0-3.3 2.5-6 5.5-6h14.4c3 0 5.5 2.7 5.5 6zM22.2 0H7.8C3.5.1 0 3.9 0 8.5v13.2c0 4.6 3.5 8.4 7.8 8.4h14.4a8 8 0 0 0 6.5-3.8h.1V26a9 9 0 0 0 1.2-4.4V8.5C30 3.9 26.5.1 22.2.1"
            />
            <path
              fill="var(--color-ffffff)"
              d="m13.6 5.9-8.4 4.5q-.4.4.2.6h19q.8-.1.5-.7L23 7.7C21 5 16.8 4.2 13.6 6 M19 19.6a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0"
            />
          </>
        );
      case "market":
        return (
          <>
            <path
              opacity=".4"
              fill="var(--color-ffffff)"
              d="M19.7 15h-.5a7 7 0 0 1-4.4 1.5q-2.4 0-4.3-1.4H10a7 7 0 0 1-7.3.7q-.6 0-.7.5V22c0 4.5 3 7.7 7.2 7.9q.5 0 .5-.5v-3c0-2.8 2.3-5.2 5.1-5.2a5 5 0 0 1 5.2 5.2v3q0 .5.4.5c4.4-.2 7.6-3.2 7.6-7.9v-6q-.1-.5-.7-.4a7 7 0 0 1-7.6-.6"
            />
            <path
              fill="var(--color-ffffff)"
              d="M15 24c-1.6 0-3 1.2-3 2.7v2.9q0 .3.5.4h5q.5 0 .5-.4v-2.9c0-1.5-1.3-2.7-3-2.7M30 8.4a33 33 0 0 0-1.5-5.2A5 5 0 0 0 24.1 0H5.9a5 5 0 0 0-4.5 3.2A35 35 0 0 0 0 8.4 4 4 0 0 0 1.2 12a6 6 0 0 0 4.4 2q2.6-.1 4.2-2a.6.6 0 0 1 1 0 5.5 5.5 0 0 0 8.5 0 1 1 0 0 1 .9 0 6 6 0 0 0 4.3 2 6 6 0 0 0 4.3-2A4 4 0 0 0 30 8.4"
            />
          </>
        );
      case "advertise":
        return (
          <>
            <path
              d="M20 1.7a2 2 0 0 0-2.4.1l-7.3 6.6 3.8 13.9 9.7 2a2 2 0 0 0 2.1-1c3.5-7.7 1-16.7-5.8-21.6"
              fillOpacity=".6"
              fill="var(--color-ffffff)"
            />
            <path
              fill="var(--color-ffffff)"
              d="M14.2 25.9a3 3 0 0 1-1.6 4.2c-1.6.7-3.5 0-4.2-1.6l-2.4-5A7 7 0 0 1 2 19c-1.2-3.9 1.3-8.4 5.7-9.6L9.2 9 13 23.5z"
            />
          </>
        );
      case "store":
        return (
          <>
            <path
              opacity=".4"
              fill="var(--color-ffffff)"
              d="M28.3 27.7Q26 30 21.5 30h-13q-5 0-7-2.2-2-2.4-1.3-6.8l1.2-8.8C2.1 8.5 5 7 7 7h16c2.1 0 4.8 1.3 5.6 5l1.3 9q.6 4.2-1.6 6.6"
            />
            <path
              fill="var(--color-ffffff)"
              d="M23 7h-2.5A5.4 5.4 0 0 0 15 2.4c-3 0-5.3 2-5.5 4.7H7c.3-4 3.7-7 8-7s7.7 3 8 7 M19.9 24h.1q1-.1 1-1.3l-.8-7.5Q20 14 19 14c-1 0-1 .7-1 1.4l.8 7.5q.1 1 1 1m-9.7 0q1 0 1.1-1l.8-7.6q0-1-1-1.3-1 0-1.2 1L9 22.8q0 1.1 1 1.4z"
            />
          </>
        );
      case "setting":
        return (
          <>
            <path
              opacity=".4"
              fill="var(--color-ffffff)"
              d="m23.3 4.7 2.3 1.4q1 .6 1.7 1.5.5 1 .6 2l.1 2.8v8q0 1.2-.6 2.2-.6.8-1.6 1.5l-2.3 1.4-4.8 2.7-2.4 1.3q-1 .5-2.1.5t-2.2-.6l-2.5-1.2-4.8-2.8L2.4 24q-1-.5-1.8-1.3a5 5 0 0 1-.6-2V9.5q0-1.2.6-2.2.7-.8 1.6-1.5l2.3-1.4 4.8-2.7L11.7.5q1-.5 2.1-.5t2.2.6l2.5 1.2z"
            />
            <path fill="var(--color-ffffff)" d="M18.3 17.5a5 5 0 1 1-8.6-5 5 5 0 0 1 8.6 5" />
          </>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 28 28">
            <g fill="#fff">
              <use href="#a" fillOpacity=".4" />
              <use href="#a" x="11.2" />
              <use href="#a" x="22.4" fillOpacity=".4" />
              <use href="#a" x="22.4" y="11.2" />
              <use href="#a" x="11.2" y="11.2" fillOpacity=".4" />
              <path d="M5.6 14A2.8 2.8 0 1 1 0 14a2.8 2.8 0 0 1 5.6 0" />
              <use href="#a" y="22.4" fillOpacity=".4" />
              <use href="#a" x="11.2" y="22.4" />
              <use href="#a" x="22.4" y="22.4" fillOpacity=".4" />
            </g>
            <defs>
              <path id="a" d="M5.6 2.8a2.8 2.8 0 1 1-5.6 0 2.8 2.8 0 0 1 5.6 0" />
            </defs>
          </svg>
        );
    }
  };

  return (
    <>
      <div
        className={styles.rightmenu}
        onClick={() => {
          prop.handleShowHamMenu("left");
        }}
        aria-label={getTranslatedText()}>
        <div className={styles.rightmenuicon}>
          <svg width="28" height="28" viewBox="0 0 30 30" aria-hidden="true" role="img">
            <title>{getTranslatedText()}</title>
            {getIconPath()}
          </svg>
        </div>
        {prop.gooli && <div className={styles.gooli} />}
        {/* <div className={styles.rightmenutext}>{getTranslatedText()}</div> */}
      </div>

      {/* <div onClick={() => prop.handleShowHamMenu("right")} className={styles.leftmenu} aria-label="Menu">
        <svg
          width="60"
          height="60"
          viewBox="0 0 20 24"
          fill="none"
          className={styles.hamicon}
          aria-hidden="true"
          role="img">
          <title>Menu</title>
          <path d="M4 18h16M4 12h16M4 6h16" stroke="var(--color-ffffff)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div> */}
    </>
  );
};

export default NavbarMobile;
