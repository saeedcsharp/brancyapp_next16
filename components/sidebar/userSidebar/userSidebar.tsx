import Link from "next/link";
import { usePathname } from "next/navigation";
import { NextRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "../../../i18n";
import { UserPanelRoute } from "../sidebar";
import styles from "./userSidebar.module.css";

// Type for menu items
type MenuItem = {
  id: string;
  route: string;
  svgContent: React.JSX.Element;
  translationKey: LanguageKey;
  isActive: (currentRoute: string) => boolean;
  subRoutes?: string[];
};

// Constants for animation
const BASE_ITEM_SIZE = 50; // Base size for icons
const MAGNIFICATION = 70; // Maximum size when hovering
const DISTANCE = 150; // Distance of effect in pixels

function UserSidebar(props: { newRouth: string; router: NextRouter }) {
  const { t } = useTranslation();

  // Mouse tracking states and refs
  const [mouseY, setMouseY] = useState<number | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const requestRef = useRef<number | null>(null);
  const previousMouseY = useRef<number | null>(null);
  const lastCalculatedScales = useRef<Record<number, string>>({});
  const sidebarRect = useRef<DOMRect | null>(null);

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        id: "home",
        route: "/user/home",
        svgContent: (
          <svg viewBox="0 0 30 30" fill="none">
            <path
              opacity=".4"
              d="m27.8 8.3-9-7a6 6 0 0 0-7.6 0l-9 7A6 6 0 0 0 0 12.7v11C0 27.3 3 30 6.5 30h17c3.6 0 6.5-2.8 6.5-6.2V12.7q0-2.6-2.2-4.4"
            />
            <path d="M20 23.7q-.1 1.2-1.3 1.3h-7.4q-1.2-.1-1.3-1.3V19c0-2.7 2.2-4.9 5-4.9s5 2.2 5 4.9z" />
          </svg>
        ),
        translationKey: LanguageKey.sidebar_Home,
        isActive: (route: string) => route === "userhome",
      },
      {
        id: "page",
        route: "/user/orders",
        svgContent: (
          <svg fill="none" viewBox="0 0 30 31">
            <path
              opacity=".4"
              d="M28.3 27.7Q26 30 21.5 30h-13q-5 0-7-2.2-2-2.4-1.3-6.8l1.2-8.8C2.1 8.5 5 7 7 7h16c2.1 0 4.8 1.3 5.6 5l1.3 9q.6 4.2-1.6 6.6"
            />
            <path d="M23 7h-2.5A5.4 5.4 0 0 0 15 2.4c-3 0-5.3 2-5.5 4.7H7c.3-4 3.7-7 8-7s7.7 3 8 7 M19.9 24h.1q1-.1 1-1.3l-.8-7.5Q20 14 19 14c-1 0-1 .7-1 1.4l.8 7.5q.1 1 1 1m-9.7 0q1 0 1.1-1l.8-7.6q0-1-1-1.3-1 0-1.2 1L9 22.8q0 1.1 1 1.4z" />
          </svg>
        ),
        translationKey: LanguageKey.navbar_Orders,
        isActive: (route: string) => {
          return (
            route === "userorders" ||
            route.includes(UserPanelRoute.UserPanelOrdersCart) ||
            route === UserPanelRoute.UserPanelOrdersFailed.toLowerCase() ||
            route === UserPanelRoute.UserPanelOrdersInQueue.toLowerCase() ||
            route === UserPanelRoute.UserPanelOrdersInProgress.toLowerCase() ||
            route === UserPanelRoute.UserPanelOrdersPickingup.toLowerCase() ||
            route === UserPanelRoute.UserPanelOrdersSent.toLowerCase() ||
            route === UserPanelRoute.UserPaneOrdersDelivered.toLowerCase()
          );
        },
      },
      {
        id: "shop",
        route: "/user/shop",
        svgContent: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
            <path
              opacity=".4"
              d="M19.7 15h-.5a7 7 0 0 1-4.4 1.5q-2.4 0-4.3-1.4H10a7 7 0 0 1-7.3.7q-.6 0-.7.5V22c0 4.5 3 7.7 7.2 7.9q.5 0 .5-.5v-3c0-2.8 2.3-5.2 5.1-5.2a5 5 0 0 1 5.2 5.2v3q0 .5.4.5c4.4-.2 7.6-3.2 7.6-7.9v-6q-.1-.5-.7-.4a7 7 0 0 1-7.6-.6"></path>
            <path d="M15 24c-1.6 0-3 1.2-3 2.7v2.9q0 .3.5.4h5q.5 0 .5-.4v-2.9c0-1.5-1.3-2.7-3-2.7M30 8.4a33 33 0 0 0-1.5-5.2A5 5 0 0 0 24.1 0H5.9a5 5 0 0 0-4.5 3.2A35 35 0 0 0 0 8.4 4 4 0 0 0 1.2 12a6 6 0 0 0 4.4 2q2.6-.1 4.2-2a.6.6 0 0 1 1 0 5.5 5.5 0 0 0 8.5 0 1 1 0 0 1 .9 0 6 6 0 0 0 4.3 2 6 6 0 0 0 4.3-2A4 4 0 0 0 30 8.4"></path>
          </svg>
        ),
        translationKey: LanguageKey.sidebar_Stores,
        isActive: (route: string) => route === "usershop",
      },

      {
        id: "wallet",
        route: "/user/wallet",
        svgContent: (
          <svg fill="none" viewBox="0 0 30 31">
            <path
              opacity=".4"
              d="M27.7 11.2q0 .4-.5.5H2.8q-.5-.1-.5-.5V8.5c0-3.3 2.5-6 5.5-6h14.4c3 0 5.5 2.7 5.5 6zM22.2 0H7.8C3.5.1 0 3.9 0 8.5v13.2c0 4.6 3.5 8.4 7.8 8.4h14.4a8 8 0 0 0 6.5-3.8h.1V26a9 9 0 0 0 1.2-4.4V8.5C30 3.9 26.5.1 22.2.1"
            />
            <path d="m13.6 5.9-8.4 4.5q-.4.4.2.6h19q.8-.1.5-.7L23 7.7C21 5 16.8 4.2 13.6 6 M19 19.6a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0" />
          </svg>
        ),
        translationKey: LanguageKey.sidebar_Wallet,
        isActive: (route: string) => route === "userwallet",
      },
      {
        id: "messaging",
        route: "/user/message",
        svgContent: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 33">
            <path
              d="M26.7 14.6v-1.1a11 11 0 1 0-22 0v1.1l2 .3q1.5.7 2 2.4l1.5 6.4a4 4 0 0 1-.7 3 4 4 0 0 1-2.7 1.4l-1.2-.2a7 7 0 0 1-3.3-12v-2.4a13.5 13.5 0 0 1 27 0V16a7 7 0 0 1 1.9 7 7 7 0 0 1-5.3 5H25c-2.3 4-4.9 4.5-7.6 4.5H15a1.3 1.3 0 1 1 0-2.5h1.4c2.8 0 4.4 0 6.2-2.6l-.6-.6q-1.1-1.5-.7-3.1l1.5-6.4a4 4 0 0 1 2-2.4q.9-.5 1.9-.3"
              opacity=".4"
            />
            <path d="M15.6 17.9a1.3 1.3 0 0 1-1.3-1.2c0-1.7 1.4-2.5 2.2-3q1-.8 1-1.3a1.6 1.6 0 0 0-3.2 0 1.3 1.3 0 0 1-2.5 0 4.1 4.1 0 0 1 8.2 0q0 2.3-2.1 3.4l-.2.1q-.9.5-.9.7a1.3 1.3 0 0 1-1.2 1.3m0 3.4a1.3 1.3 0 0 1-1.3-1.3 1.3 1.3 0 0 1 1.3-1.2 1.2 1.2 0 0 1 1.2 1.2 1.3 1.3 0 0 1-1.2 1.3" />
          </svg>
        ),
        translationKey: LanguageKey.navbar_Ticket,
        isActive: (route: string) => route === "usermessage",
      },
      {
        id: "setting",
        route: "/user/setting",
        svgContent: (
          <svg fill="none" viewBox="0 0 28 30">
            <path
              opacity=".4"
              d="m23.3 4.7 2.3 1.4q1 .6 1.7 1.5.5 1 .6 2l.1 2.8v8q0 1.2-.6 2.2-.6.8-1.6 1.5l-2.3 1.4-4.8 2.7-2.4 1.3q-1 .5-2.1.5t-2.2-.6l-2.5-1.2-4.8-2.8L2.4 24q-1-.5-1.8-1.3a5 5 0 0 1-.6-2V9.5q0-1.2.6-2.2.7-.8 1.6-1.5l2.3-1.4 4.8-2.7L11.7.5q1-.5 2.1-.5t2.2.6l2.5 1.2z"
            />
            <path d="M18.3 17.5a5 5 0 1 1-8.6-5 5 5 0 0 1 8.6 5" />
          </svg>
        ),
        translationKey: LanguageKey.sidebar_Setting,
        isActive: (route: string) => route === "usersetting",
      },
    ],
    [],
  );

  // Throttle function to limit update frequency
  const throttle = <T extends (...args: any[]) => any>(func: T, delay: number) => {
    let lastCall = 0;
    return function (this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
      const now = performance.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func.apply(this, args);
      }
      return undefined;
    };
  };

  // Handle mouse movement over the sidebar
  const handleMouseMove = useCallback(
    throttle((event: React.MouseEvent<HTMLDivElement>) => {
      if (Math.abs((previousMouseY.current || 0) - event.pageY) > 3) {
        setMouseY(event.pageY);
      }
    }, 33),
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setMouseY(null);
  }, []);

  // Update sidebar rectangle on resize/scroll
  useEffect(() => {
    const updateSidebarRect = throttle(() => {
      if (sidebarRef.current) {
        sidebarRect.current = sidebarRef.current.getBoundingClientRect();
      }
    }, 100);

    updateSidebarRect();
    window.addEventListener("resize", updateSidebarRect);
    window.addEventListener("scroll", updateSidebarRect);

    return () => {
      window.removeEventListener("resize", updateSidebarRect);
      window.removeEventListener("scroll", updateSidebarRect);
    };
  }, []);

  // Animation effect based on mouse position
  useEffect(() => {
    if (previousMouseY.current === mouseY) return;
    previousMouseY.current = mouseY;

    const updateScales = (): boolean => {
      const currentItems = itemRefs.current;
      let needsUpdate = false;

      if (mouseY === null) {
        for (let i = 0; i < currentItems.length; i++) {
          const itemEl = currentItems[i];
          if (!itemEl) continue;
          if (lastCalculatedScales.current[i] !== "1.00") {
            itemEl.style.setProperty("--scale", "1.00");
            lastCalculatedScales.current[i] = "1.00";
            needsUpdate = true;
          }
        }
        return needsUpdate;
      }

      if (!sidebarRect.current) return false;

      for (let i = 0; i < currentItems.length; i++) {
        const itemEl = currentItems[i];
        if (!itemEl) continue;

        const itemRect = itemEl.getBoundingClientRect();
        const itemCenterY = itemRect.top + itemRect.height / 2;
        const dist = Math.abs(mouseY - itemCenterY);
        let scale = "1.00";

        if (dist <= DISTANCE) {
          const scaleFactor = 1 - dist / DISTANCE;
          const scaleMultiplier = MAGNIFICATION / BASE_ITEM_SIZE - 1;
          const finalScale = 1 + scaleMultiplier * scaleFactor;
          scale = (Math.floor(finalScale * 100) / 100).toFixed(2);
        }

        if (lastCalculatedScales.current[i] !== scale) {
          itemEl.style.setProperty("--scale", scale);
          lastCalculatedScales.current[i] = scale;
          needsUpdate = true;
        }
      }
      return needsUpdate;
    };

    const animate = () => {
      const needsNextFrame = updateScales();
      if (needsNextFrame || previousMouseY.current !== mouseY) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        requestRef.current = null;
      }
    };

    if (requestRef.current === null) {
      if (sidebarRef.current) {
        sidebarRect.current = sidebarRef.current.getBoundingClientRect();
      }
      requestRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [mouseY]);

  const pathname = usePathname();
  const currentRoute = (pathname || "").replaceAll("/", "").toLowerCase();

  const indicatorClass = useMemo(() => {
    // Map routes to their CSS indicator class names
    const routeToIndicatorMap: Record<string, string> = {
      userhome: UserPanelRoute.UserPanelHome,
      userorders: UserPanelRoute.UserPanelOrders,
      usershop: UserPanelRoute.UserPanelShop,
      userorderscart: UserPanelRoute.UserPanelOrdersCart,
      userordersfailed: UserPanelRoute.UserPanelOrdersFailed,
      userordersinqueue: UserPanelRoute.UserPanelOrdersInQueue,
      userordersinprogress: UserPanelRoute.UserPanelOrdersInProgress,
      userorderspickingup: UserPanelRoute.UserPanelOrdersPickingup,
      userordersdelivered: UserPanelRoute.UserPaneOrdersDelivered,
      userorderssent: UserPanelRoute.UserPanelOrdersSent,
      usermessage: UserPanelRoute.UserPanelMessage,
      userwallet: UserPanelRoute.UserPanelWallet,
      usersetting: UserPanelRoute.UserPanelSetting,
    };

    let route = currentRoute;
    // Check if the route includes userorderscart
    if (route.includes(UserPanelRoute.UserPanelOrdersCart)) {
      route = UserPanelRoute.UserPanelOrdersCart;
    }
    const cssClass = routeToIndicatorMap[route];
    return cssClass ? `${styles.menuIndicator} ${styles[`indicator-${cssClass}`]}` : "";
  }, [currentRoute]);

  // Function to get the fill color for a menu item
  const getMenuItemColor = (item: MenuItem): string => {
    return item.isActive(currentRoute) ? "var(--color-dark-blue)" : "var(--color-gray)";
  };

  return (
    <>
      <style
        precedence="default"
        href="svg-transition-style-user">{`.${styles.navSidebar} svg { transition: fill 0.3s ease-in-out; }`}</style>
      <aside className={styles.sidebarparent}>
        <div ref={sidebarRef} className={styles.sidebar} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          <div className={styles.menuCategoriesChild} />
          <svg className={styles.logosvg} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 118 157">
            <path d="M48 1h-2l-1 1q-9 10-20 17L8 30l-6 4-1 1v3h1l1-1 4-2 1-1Q33 22 50 3V1zm35 154 2-2q11-11 25-18l3-3 1-1-1-1h-2l-4 2-7 4a81 81 0 0 0-21 18v1zm31-36 2-2 1-2-1-2v-1h-3q-17 7-33 17-17 11-24 24v1h-1v2h5l3-2q12-16 30-25l1-1zm-33-4 33-16v-2l-1-5-2-1h-2l-21 10-27 13q-24 12-36 40v2l2 1h5l2-1 1-2c8-19 27-31 46-39ZM69 97l33-15 2-2-2-1-4-3h-5L63 89c-22 9-46 23-56 49l-3 12v2l2 3 3 1h2l1-1 5-16c9-22 31-33 52-42ZM24 1h-3l-1 1L1 16v2h2q12-6 20-15h1zm57 2-1-1h-4l-2 2Q64 22 42 32l-11 6Q16 45 3 54l-2 1v8h1l1-1q14-10 30-18h1q14-7 27-16Q76 18 81 3ZM50 58h1c20-8 41-17 52-37q2-1 1-3l-2-3v-1l-1-1h-2l-1 1C88 32 69 41 49 49l-5 2Q20 60 1 77v11h1l1-1q21-20 47-29Zm12 19 6-3q24-8 41-23h1v-4l1-7v-1l-1-1h-2Q87 59 57 68l-1 1c-20 8-40 16-54 32v1l-1 3v16l1-2c13-24 36-33 60-42Z" />
          </svg>
          <nav className={styles.navSidebar}>
            {menuItems.map((item, index) => (
              <div
                key={item.id}
                id={item.id}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className={styles[`${item.id}button`]}>
                <Link href={item.route} aria-label={t(item.translationKey)}>
                  {React.cloneElement(item.svgContent, {
                    className: styles.navicon,
                    fill: getMenuItemColor(item),
                  })}
                </Link>
                <div className={styles.buttonName}>{t(item.translationKey)}</div>
              </div>
            ))}
            <div className={indicatorClass}></div>
          </nav>
          <nav className={styles.path}></nav>
        </div>
      </aside>
    </>
  );
}

export default UserSidebar;
