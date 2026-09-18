import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { InstagramerRoute } from "brancy/components/sidebar/sidebar";
import { LanguageKey } from "brancy/i18n";
import styles from "./navbarheader.module.css";

const NavbarMobile = (prop: { handleShowHamMenu: (ham: string) => void; gooli: boolean }) => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const newRoute = (pathname || "").replaceAll("/", "");

  const getNavbarRoute = () => {
    if (newRoute === InstagramerRoute.Home) return "home";
    else if (
      newRoute === InstagramerRoute.PagePost ||
      newRoute === InstagramerRoute.PageStories ||
      newRoute.startsWith(InstagramerRoute.PageAI) ||
      newRoute === InstagramerRoute.PageStatistics ||
      newRoute === InstagramerRoute.PageTools
    )
      return "page";
    else if (
      newRoute === InstagramerRoute.MessageDirect ||
      newRoute === InstagramerRoute.MessageComments ||
      newRoute === InstagramerRoute.MessageTicket ||
      newRoute === InstagramerRoute.MessageAIANDFlow ||
      // newRoute === "messagewhatsapp" ||
      // newRoute === "messagetelegram" ||
      newRoute === InstagramerRoute.MessageProperties
    )
      return "message";
    else if (newRoute === InstagramerRoute.WalletPayment) return "wallet";
    else if (
      newRoute === InstagramerRoute.biolinkHome ||
      newRoute === InstagramerRoute.MarketmyLink ||
      newRoute === InstagramerRoute.biolinkStatistics ||
      newRoute === InstagramerRoute.biolinkProperties
    )
      return "market";
    else if (
      newRoute === InstagramerRoute.AdvertiseCalendar ||
      newRoute === InstagramerRoute.AdvertiseStatistics ||
      newRoute === InstagramerRoute.AdvertiseAdlist ||
      newRoute === InstagramerRoute.AdvertiseProperties
    )
      return "advertise";
    else if (
      newRoute === InstagramerRoute.StoreProducts ||
      newRoute === InstagramerRoute.StoreOrders ||
      newRoute === InstagramerRoute.StoreStatistics ||
      newRoute === InstagramerRoute.StorePost
    )
      return "store";
    else if (
      newRoute === InstagramerRoute.Setting ||
      newRoute === InstagramerRoute.SettingGeneral ||
      newRoute === InstagramerRoute.SettingSubAdmin
    )
      return "setting";
    return "";
  };
  const navbarRout = getNavbarRoute();
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
        return t(LanguageKey.sidebar_biolink);
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
              opacity=".3"
              fill="var(--color-ffffff)"
              d="M-.18 13.82c0-5.91 0-8.87 1.55-10.92q.67-.88 1.55-1.54C5-.18 7.98-.18 13.94-.18h4.78c5.97 0 8.95 0 11.02 1.54q.88.66 1.55 1.54c1.55 2.05 1.55 5 1.55 10.92v4.74c0 5.91 0 8.87-1.55 10.93q-.66.88-1.55 1.53c-2.07 1.54-5.05 1.54-11.02 1.54h-4.78c-5.96 0-8.95 0-11.02-1.54a8 8 0 0 1-1.55-1.53C-.18 27.43-.18 24.47-.18 18.56z"
            />
            <path
              fill="var(--color-ffffff)"
              d="M22.48 16.45a6.2 6.2 0 0 0-6.23-6.17 6.2 6.2 0 0 0-6.22 6.17 6.2 6.2 0 0 0 6.22 6.17v2.48a8.7 8.7 0 0 1-8.72-8.65c0-4.78 3.9-8.65 8.72-8.65a8.7 8.7 0 0 1 8.73 8.65c0 4.78-3.9 8.65-8.73 8.65v-2.48a6.2 6.2 0 0 0 6.23-6.17m1.75-10.49c0-1.02.84-1.84 1.87-1.84s1.87.82 1.87 1.84-.84 1.84-1.87 1.84a1.86 1.86 0 0 1-1.87-1.84"
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
              fill="var(--color-ffffff)"
              d="M11.01 22.07a3.34 3.34 0 0 1-4.7-4.71l1.21-1.22c.89-.89.89-2.33 0-3.22l-.55-.55a2.27 2.27 0 0 0-3.22 0L2.53 13.6a8.67 8.67 0 0 0 12.25 12.25L16 24.62c.89-.89.89-2.33 0-3.22l-.55-.55a2.27 2.27 0 0 0-3.22 0zM17.18 6.3a3.34 3.34 0 0 1 4.7 4.71l-1.21 1.22a2.27 2.27 0 0 0 0 3.22l.55.55c.89.89 2.33.89 3.22 0l1.22-1.22A8.67 8.67 0 0 0 13.4 2.53l-1.22 1.22a2.27 2.27 0 0 0 0 3.22l.55.55c.89.89 2.33.89 3.22 0z"
            />
            <path
              fill="var(--color-ffffff)"
              d="m20 17.63-1.29-1.18-.14-.14a1.67 1.67 0 0 0-2.38.17l-.14.15c-.57.64-.55 1.6.02 2.24l.15.14 1.28 1.18.15.14c.64.56 1.6.55 2.23-.03l.15-.14.14-.15c.56-.64.55-1.6-.03-2.24zm-7.91-8.11-1.26-1.2-.15-.13a1.67 1.67 0 0 0-2.23.02l-.15.15-.14.14a1.67 1.67 0 0 0 .17 2.38l1.26 1.2.15.14a1.67 1.67 0 0 0 2.38-.17l.14-.15c.56-.64.55-1.6-.03-2.24z"
              opacity=".4"
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
