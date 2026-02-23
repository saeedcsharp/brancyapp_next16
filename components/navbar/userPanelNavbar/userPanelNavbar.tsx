import { t } from "i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { MouseEvent, useRef } from "react";
import { UserPanelRoute } from "brancy/components/sidebar/sidebar";
import { LanguageKey } from "brancy/i18n";
import styles from "brancy/components/navbar/userPanelNavbar/usePanelNavbar.module.css";
import UserPanelHeader from "brancy/components/navbar/userPanelNavbar/userPanelHeader";
interface INavbar {
  id: string;
  items: string[];
  indexValue: string;
  initialSlide: number;
}

const svgMapping: { [key: string]: React.JSX.Element } = {
  userorderscart: (
    <svg fill="none" viewBox="0 0 28 28">
      <path d="M17.63 10.28c0 1.12-.43 2.2-1.2 2.98a4.1 4.1 0 0 1-5.85 0 4.3 4.3 0 0 1-1.21-2.98" />
      <path
        d="M17.92 24c1.87 0 2.81 0 3.5-.38.6-.34 1.09-.87 1.36-1.52.32-.73.24-1.68.08-3.59l-.72-8.86c-.13-1.64-.2-2.46-.55-3.08a3 3 0 0 0-1.34-1.26C19.6 5 18.8 5 17.2 5H9.8c-1.61 0-2.41 0-3.05.31q-.85.42-1.34 1.26C5.06 7.19 5 8 4.86 9.65l-.72 8.86c-.16 1.9-.24 2.86.08 3.6.27.64.75 1.17 1.36 1.5.7.39 1.63.39 3.5.39z"
        strokeOpacity=".4"
      />
    </svg>
  ),
  userordersinQueue: (
    <svg fill="none" viewBox="0 0 28 28">
      <path
        d="M12.63 24.18H9.7a4.27 4.27 0 0 1-4.16-4.37V9.44A4.27 4.27 0 0 1 9.7 5.07m8.17-.01c2.3 0 4.16 1.96 4.16 4.37v5.16m-5.66-7.55h-5.16c-.83 0-1.5-.71-1.5-1.58v-.67c0-.87.67-1.58 1.5-1.58h5.16c.83 0 1.5.7 1.5 1.58v.67c0 .87-.67 1.58-1.5 1.58"
        strokeOpacity=".6"
      />
      <path d="M21.53 24.2a4 4 0 0 1-6.64-3m1.36-3a4 4 0 0 1 6.64 3" />
    </svg>
  ),
  userordersinProgress: (
    <svg fill="none" viewBox="0 0 28 28">
      <path
        opacity=".6"
        d="M10.4 26h7.2c6 0 8.4-2.4 8.4-8.4v-7.2c0-6-2.4-8.4-8.4-8.4h-7.2C4.4 2 2 4.4 2 10.4v7.2c0 6 2.4 8.4 8.4 8.4"
      />
      <path d="M16 11h6m-6 7.2h6M6 17l1.9 2 4.1-4m-6-5 2.2 2L13 8" />
    </svg>
  ),
  userorderspickingup: (
    <svg fill="none" viewBox="0 0 28 28">
      <path d="M7 20h8" />
      <path
        opacity=".6"
        d="M3 10h22m-9-6 1 4.89V14l-3-.95-3 .95V8.89L12 4M4.6 5.15 3.57 7.74c-.37.9-.55 1.88-.55 2.85L3 20.02c0 2.9 1.3 4.95 4.21 4.96L20.8 25c2.9 0 4.19-2.04 4.2-4.94l.01-9.44q0-1.51-.56-2.9L23.4 5.14A3.4 3.4 0 0 0 20.24 3H7.76A3.4 3.4 0 0 0 4.6 5.15"
      />
    </svg>
  ),
  userorderssent: (
    <svg fill="none" viewBox="0 0 28 28">
      <path
        d="M14 16.4h1.2c1.3 0 2.4-1 2.4-2.4m0 0V2H6.8Q4 2.1 2.6 4.5m15 9.5V5.6h2.2q1.4 0 2.1 1.2l2 3.6h-1.5q-1.1 0-1.2 1.2v3.6q0 1.1 1.2 1.2H26V20c0 2-1.6 3.6-3.6 3.6h-1.2c0-1.3-1-2.4-2.4-2.4s-2.4 1-2.4 2.4h-4.8c0-1.3-1-2.4-2.4-2.4s-2.4 1-2.4 2.4H5.6C3.6 23.6 2 22 2 20m9.6 3.6a2.4 2.4 0 1 1-4.8 0 2.4 2.4 0 0 1 4.8 0m9.6 0a2.4 2.4 0 1 1-4.8 0 2.4 2.4 0 0 1 4.8 0M26 14v2.4h-3.6q-1.1 0-1.2-1.2v-3.6q0-1.1 1.2-1.2h1.5z"
        strokeOpacity=".6"
      />
      <path d="M2 9h7m-7 3.5h4.7M2 16h2.3" />
    </svg>
  ),
  userordersdelivered: (
    <svg fill="none" viewBox="0 0 28 28">
      <path d="M12.19 19.08c1-.14 2.04 0 3.06-.02 2.38-.06 4.23-1.94 6.04-3.21a2.4 2.4 0 0 1 3.03.2c.9.85.9 2.24 0 3.09-1.95 1.83-3.67 3.53-6.32 4.5-3.66 1.33-7.07.68-10.78 0A23 23 0 0 0 3 23.35m10.28-4.28h1.89c1.35 0 2.45-.97 2.45-2.32 0-1.13-.77-2.03-1.86-2.3-1.56-.4-3.11-.7-4.74-.66-2.58.06-4.39 1.5-6.43 2.87" />
      <path
        d="m23 15-.02-7.66c0-2.8-1.36-4.35-4.14-4.34l-8.77.02C7.29 3.02 5.99 4.59 6 7.38l.02 7.36M16.12 3v5.99l-1.98-.73-2 .74-.01-5.98"
        strokeOpacity=".6"
      />
    </svg>
  ),
  userordersfailed: (
    <svg fill="none" viewBox="0 0 28 28">
      <path
        d="M17 22.93 10.08 16m6.84.07L10 23"
        stroke="var(--color-gray)"
        strokeWidth="1.6"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.83 3 5.67 7.17M17.17 3l4.16 4.17M5.35 22.14C5.7 24.37 6.6 26 9.89 26h6.93c3.58 0 4.1-1.56 4.52-3.73l1.93-10.07m-19.55 0 .8 4.89M2 9.73c0-2.13 1.14-2.3 2.55-2.3h17.9c1.41 0 2.55.17 2.55 2.3 0 2.47-1.14 2.3-2.55 2.3H4.55c-1.41 0-2.55.17-2.55-2.3Z"
        strokeOpacity=".6"
      />
    </svg>
  ),
};
const navbarMapping: { [key: string]: INavbar } = {
  userorderscart: {
    id: "userorderscart",
    indexValue: "user/orders",
    items: [
      "userorderscart",
      "userordersinQueue",
      "userordersinProgress",
      "userorderspickingup",
      "userorderssent",
      "userordersdelivered",
      "userordersfailed",
    ],
    initialSlide: 0,
  },
  userordersinQueue: {
    id: "userordersinQueue",
    indexValue: "user/orders",
    items: [
      "userorderscart",
      "userordersinQueue",
      "userordersinProgress",
      "userorderspickingup",
      "userorderssent",
      "userordersdelivered",
      "userordersfailed",
    ],
    initialSlide: 1,
  },
  userordersinProgress: {
    id: "userordersinProgress",
    indexValue: "user/orders",
    items: [
      "userorderscart",
      "userordersinQueue",
      "userordersinProgress",
      "userorderspickingup",
      "userorderssent",
      "userordersdelivered",
      "userordersfailed",
    ],
    initialSlide: 2,
  },
  userorderspickingup: {
    id: "userorderspickingup",
    indexValue: "user/orders",
    items: [
      "userorderscart",
      "userordersinQueue",
      "userordersinProgress",
      "userorderspickingup",
      "userorderssent",
      "userordersdelivered",
      "userordersfailed",
    ],
    initialSlide: 3,
  },
  userorderssent: {
    id: "userorderssent",
    indexValue: "user/orders",
    items: [
      "userorderscart",
      "userordersinQueue",
      "userordersinProgress",
      "userorderspickingup",
      "userorderssent",
      "userordersdelivered",
      "userordersfailed",
    ],
    initialSlide: 4,
  },
  userordersdelivered: {
    id: "userordersdelivered",
    indexValue: "user/orders",
    items: [
      "userorderscart",
      "userordersinQueue",
      "userordersinProgress",
      "userorderspickingup",
      "userorderssent",
      "userordersdelivered",
      "userordersfailed",
    ],
    initialSlide: 5,
  },
  userordersfailed: {
    id: "userordersfailed",
    indexValue: "user/orders",
    items: [
      "userorderscart",
      "userordersinQueue",
      "userordersinProgress",
      "userorderspickingup",
      "userorderssent",
      "userordersdelivered",
      "userordersfailed",
    ],
    initialSlide: 6,
  },
};
interface UserPanelNavbarProps {
  handleShowHamMenu: (ham: string) => void;
  handleShowNotifBar: (e: MouseEvent) => void;
  handleShowProfile: (e: MouseEvent) => void;
  handleShowSignOut: (e: MouseEvent) => void;
  handleShowSwitch: (e: MouseEvent) => void;
  showNotifBar: boolean;
  showProfile: boolean;
}

const UserPanelNavbar = (props: UserPanelNavbarProps) => {
  const fullscreenButtonRef = useRef(null);
  const router = useRouter();
  let newRoute = router.route.replaceAll("/", "");
  if (newRoute.includes(UserPanelRoute.UserPanelOrdersCart)) {
    newRoute = UserPanelRoute.UserPanelOrdersCart;
  }
  const navbar2 = navbarMapping[newRoute] || null;

  const labelMapping: { [key: string]: string } = {
    userorderscart: t(LanguageKey.Storeproduct_incart),
    userordersinQueue: t(LanguageKey.Storeproduct_inQueue),
    userordersinProgress: t(LanguageKey.Storeproduct_inprogress),
    userorderspickingup: t(LanguageKey.Storeproduct_pickingup),
    userorderssent: t(LanguageKey.Storeproduct_sent),
    userordersdelivered: t(LanguageKey.Storeproduct_delivered),
    userordersfailed: t(LanguageKey.Storeproduct_failed),
  };

  return (
    <>
      <header className="headerTab">
        {navbar2 && (
          <nav className={styles.pageTitleSet}>
            {navbar2.items.map((v, i) => (
              <Link
                href={`/${navbar2.indexValue}/${v.replace("userorders", "")}`}
                id={v}
                key={i}
                className={styles.pageTitle}>
                {/* {i === 0 && value && (
                  <div className={styles.reddot}>{value}</div>
                )} */}
                {v === navbar2.id ? (
                  <>
                    <b className={styles.title1}>
                      {svgMapping[v]}
                      {labelMapping[v]}
                    </b>
                  </>
                ) : (
                  <div className={styles.title2}>
                    {svgMapping[v]}
                    {labelMapping[v]}
                  </div>
                )}
              </Link>
            ))}
          </nav>
        )}
        {!navbar2 && <div className={styles.pageTitleSet}></div>}
        <UserPanelHeader
          handleShowHamMenu={props.handleShowHamMenu}
          handleShowNotifBar={props.handleShowNotifBar}
          handleShowProfile={props.handleShowProfile}
          handleShowSignOut={props.handleShowSignOut}
          handleShowSwitch={props.handleShowSwitch}
          handleShowUpgrade={() => {}}
          showNotifBar={props.showNotifBar}
          showProfile={props.showProfile}
        />
      </header>
    </>
  );
};

export default UserPanelNavbar;
