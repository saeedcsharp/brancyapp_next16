import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserPanelRoute } from "brancy/components/sidebar/sidebar";
import { LanguageKey } from "brancy/i18n";
import styles from "brancy/components/navbar/instagramerNavbar/navbarheader.module.css";
const NavbarUserMobile = (prop: { handleShowHamMenu: (ham: string) => void }) => {
  const { t } = useTranslation();
  const router = useRouter();
  let newRoute = router.route.replaceAll("/", "");
  const [navbarRout, setNavbarRout] = useState("");
  useEffect(() => {
    if (newRoute === UserPanelRoute.UserPanelHome) setNavbarRout("home");
    else if (
      newRoute === UserPanelRoute.UserPanelOrders ||
      newRoute === UserPanelRoute.UserPanelOrdersCart ||
      newRoute === UserPanelRoute.UserPanelOrdersInQueue ||
      newRoute === UserPanelRoute.UserPanelOrdersInProgress ||
      newRoute === UserPanelRoute.UserPanelOrdersPickingup ||
      newRoute === UserPanelRoute.UserPanelOrdersSent ||
      newRoute === UserPanelRoute.UserPaneOrdersDelivered ||
      newRoute === UserPanelRoute.UserPanelOrdersFailed
    )
      setNavbarRout("orders");
    else if (newRoute === UserPanelRoute.UserPanelShop) setNavbarRout("shop");
    else if (newRoute === UserPanelRoute.UserPanelWallet) setNavbarRout("wallet");
    else if (newRoute === UserPanelRoute.UserPanelMessage) setNavbarRout("message");
    else if (newRoute === UserPanelRoute.UserPanelSetting) setNavbarRout("setting");
  }, [router]);
  const getTranslatedText = () => {
    switch (navbarRout) {
      case "home":
        return t(LanguageKey.sidebar_Home);

      case "wallet":
        return t(LanguageKey.sidebar_Wallet);
      case "orders":
        return t(LanguageKey.sidebar_Market);
      case "shop":
        return t(LanguageKey.sidebar_Stores);
      case "message":
        return t(LanguageKey.sidebar_Message);
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
      case "orders":
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
      case "shop":
        return (
          <>
            <path
              fill="var(--color-ffffff)"
              opacity=".4"
              d="M19.7 15h-.5a7 7 0 0 1-4.4 1.5q-2.4 0-4.3-1.4H10a7 7 0 0 1-7.3.7q-.6 0-.7.5V22c0 4.5 3 7.7 7.2 7.9q.5 0 .5-.5v-3c0-2.8 2.3-5.2 5.1-5.2a5 5 0 0 1 5.2 5.2v3q0 .5.4.5c4.4-.2 7.6-3.2 7.6-7.9v-6q-.1-.5-.7-.4a7 7 0 0 1-7.6-.6"></path>
            <path
              fill="var(--color-ffffff)"
              d="M15 24c-1.6 0-3 1.2-3 2.7v2.9q0 .3.5.4h5q.5 0 .5-.4v-2.9c0-1.5-1.3-2.7-3-2.7M30 8.4a33 33 0 0 0-1.5-5.2A5 5 0 0 0 24.1 0H5.9a5 5 0 0 0-4.5 3.2A35 35 0 0 0 0 8.4 4 4 0 0 0 1.2 12a6 6 0 0 0 4.4 2q2.6-.1 4.2-2a.6.6 0 0 1 1 0 5.5 5.5 0 0 0 8.5 0 1 1 0 0 1 .9 0 6 6 0 0 0 4.3 2 6 6 0 0 0 4.3-2A4 4 0 0 0 30 8.4"></path>
          </>
        );
      case "message":
        return (
          <>
            <path
              fill="var(--color-ffffff)"
              d="M26.7 14.6v-1.1a11 11 0 1 0-22 0v1.1l2 .3q1.5.7 2 2.4l1.5 6.4a4 4 0 0 1-.7 3 4 4 0 0 1-2.7 1.4l-1.2-.2a7 7 0 0 1-3.3-12v-2.4a13.5 13.5 0 0 1 27 0V16a7 7 0 0 1 1.9 7 7 7 0 0 1-5.3 5H25c-2.3 4-4.9 4.5-7.6 4.5H15a1.3 1.3 0 1 1 0-2.5h1.4c2.8 0 4.4 0 6.2-2.6l-.6-.6q-1.1-1.5-.7-3.1l1.5-6.4a4 4 0 0 1 2-2.4q.9-.5 1.9-.3"
              opacity=".4"
            />
            <path
              fill="var(--color-ffffff)"
              d="M15.6 17.9a1.3 1.3 0 0 1-1.3-1.2c0-1.7 1.4-2.5 2.2-3q1-.8 1-1.3a1.6 1.6 0 0 0-3.2 0 1.3 1.3 0 0 1-2.5 0 4.1 4.1 0 0 1 8.2 0q0 2.3-2.1 3.4l-.2.1q-.9.5-.9.7a1.3 1.3 0 0 1-1.2 1.3m0 3.4a1.3 1.3 0 0 1-1.3-1.3 1.3 1.3 0 0 1 1.3-1.2 1.2 1.2 0 0 1 1.2 1.2 1.3 1.3 0 0 1-1.2 1.3"
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
      <div className={styles.rightmenu} onClick={() => prop.handleShowHamMenu("left")} aria-label={getTranslatedText()}>
        <div className={styles.rightmenuicon}>
          <svg width="28" height="28" viewBox="0 0 30 30" aria-hidden="true" role="img">
            <title>{getTranslatedText()}</title>
            {getIconPath()}
          </svg>
        </div>
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
export default NavbarUserMobile;
