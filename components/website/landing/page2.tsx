import { useCallback, useEffect, useId, useMemo, useReducer, useRef, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import styles from "brancy/components/website/landing/page2.module.css";

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  content?: React.ReactNode;
  picture?: string;
  servicedescription?: string;
}

type TabType = "ads" | "store" | "postchi" | "jobs" | "publish" | "Extension" | "ids";

interface State {
  activeTab: TabType;
  selectedService: string | null;
  animationState: "enter" | "exit" | "idle";
  displayedService: string | null;
  isHovered: boolean;
  textArray: string[];
  activeIndex: number;
  focusedTabIndex: number;
}

type Action =
  | { type: "SET_ACTIVE_TAB"; payload: TabType }
  | { type: "SET_SELECTED_SERVICE"; payload: string | null }
  | { type: "SET_ANIMATION_STATE"; payload: "enter" | "exit" | "idle" }
  | { type: "SET_DISPLAYED_SERVICE"; payload: string | null }
  | { type: "SET_HOVERED"; payload: boolean }
  | { type: "SET_TEXT_ARRAY"; payload: string[] }
  | { type: "SET_ACTIVE_INDEX"; payload: number }
  | { type: "SET_FOCUSED_TAB"; payload: number }
  | { type: "NEXT_SLIDE" }
  | { type: "PREV_SLIDE" };

const TAB_ORDER: TabType[] = ["ads", "store", "postchi", "publish", "Extension", "jobs", "ids"];

const TAB_COLORS = new Map<TabType, string>([
  ["ads", "var(--color-dark-yellow)"],
  ["store", "var(--color-light-red)"],
  ["postchi", "var(--color-dark-red)"],
  ["publish", "var(--color-purple)"],
  ["Extension", "#4545FF"],
  ["jobs", "var(--color-dark-blue)"],
  ["ids", "var(--color-light-blue)"],
]);

const initialState: State = {
  activeTab: "store",
  selectedService: null,
  animationState: "idle",
  displayedService: null,
  isHovered: false,
  textArray: [],
  activeIndex: 0,
  focusedTabIndex: 1,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_ACTIVE_TAB":
      return {
        ...state,
        activeTab: action.payload,
        focusedTabIndex: TAB_ORDER.indexOf(action.payload),
        selectedService: null,
        displayedService: null,
      };
    case "SET_SELECTED_SERVICE":
      return { ...state, selectedService: action.payload };
    case "SET_ANIMATION_STATE":
      return { ...state, animationState: action.payload };
    case "SET_DISPLAYED_SERVICE":
      return { ...state, displayedService: action.payload };
    case "SET_HOVERED":
      return { ...state, isHovered: action.payload };
    case "SET_TEXT_ARRAY":
      return { ...state, textArray: action.payload };
    case "SET_ACTIVE_INDEX":
      return { ...state, activeIndex: action.payload };
    case "SET_FOCUSED_TAB":
      return { ...state, focusedTabIndex: action.payload };
    case "NEXT_SLIDE":
      return {
        ...state,
        activeIndex: (state.activeIndex + 1) % state.textArray.length,
      };
    case "PREV_SLIDE":
      return {
        ...state,
        activeIndex: state.activeIndex > 0 ? state.activeIndex - 1 : state.textArray.length - 1,
      };
    default:
      return state;
  }
};

const TabUnderline = ({ tabId }: { tabId: TabType }) => {
  const tabColor = useMemo(() => TAB_COLORS.get(tabId) || "var(--color-dark-blue)", [tabId]);
  const underlineId = useId();

  return (
    <>
      <svg
        id={`underline-${underlineId}`}
        xmlns="http://www.w3.org/2000/svg"
        className={styles.tabUnderline}
        fill="none"
        viewBox="0 0 72 15"
        role="img"
        aria-hidden="true">
        <path
          fill={tabColor}
          d="M0 3.3a198 198 0 0 1 72 0q-4 .1-5.7.5c-11.7 2.2-16.1 10-27.4 11l-3.7.2C23.6 14.5 20.5 7 8.5 4.3c-1.8-.4-4.7-1-8.5-1"
        />
      </svg>
      <svg
        className={styles.tabUnderlinefade}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 475 93"
        aria-hidden="true">
        <path
          stroke={tabColor}
          strokeWidth="2"
          d="M.9 1.8C44 12 72.6 29.9 99.5 46.8l8.1 5c29.4 18.2 58.2 38 103.5 40q14.3.6 28.4-.7c44.3-4.2 75-22.2 106.3-41.2l4.2-2.6C380 29 410.9 10 454.8 1.7"
          opacity=".1"
        />
      </svg>
    </>
  );
};

const Page2 = () => {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isPending, startTransition] = useTransition();
  const sectionId = useId();
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const serviceContainerRef = useRef<HTMLDivElement>(null);

  const servicesMap = useMemo(() => {
    const serviceData: Record<TabType, Service[]> = {
      ads: [
        {
          id: "ads-1",
          title: t(LanguageKey.page2_ads_statistics_title),
          description: t(LanguageKey.page2_ads_statistics_description),
          icon: "/landing/page2_statistic.svg",
          picture: "/landing/ads_statistics.png",
          servicedescription: t(LanguageKey.page2_ads_statistics_servicedescription),
        },
        {
          id: "ads-2",
          title: t(LanguageKey.page2_ads_calendar_title),
          description: t(LanguageKey.page2_ads_calendar_description),
          icon: "/landing/page2_calendar.svg",
          picture: "/landing/ads_timeline.png",
          servicedescription: t(LanguageKey.page2_ads_calendar_servicedescription),
        },
        {
          id: "ads-3",
          title: t(LanguageKey.page2_ads_adlist_title),
          description: t(LanguageKey.page2_ads_adlist_description),
          icon: "/landing/page2_adlist.svg",
          picture: "/landing/ads_adlist.png",
          servicedescription: t(LanguageKey.page2_ads_adlist_servicedescription),
        },
      ],
      store: [
        {
          id: "store-1",
          title: t(LanguageKey.page2_store_addproduct_title),
          description: t(LanguageKey.page2_store_addproduct_description),
          icon: "/landing/page2_addproduct.svg",
          picture: "/landing/Store_selection.png",
          servicedescription: t(LanguageKey.page2_store_addproduct_servicedescription),
        },
        {
          id: "store-2",
          title: t(LanguageKey.page2_store_productlist_title),
          description: t(LanguageKey.page2_store_productlist_description),
          icon: "/landing/page2_productlist.svg",
          picture: "/landing/Product_List.png",
          servicedescription: t(LanguageKey.page2_store_productlist_servicedescription),
        },
        {
          id: "store-3",
          title: t(LanguageKey.page2_store_orders_title),
          description: t(LanguageKey.page2_store_orders_description),
          icon: "/landing/page2_orders.svg",
          picture: "/landing/Store_orders.png",
          servicedescription: t(LanguageKey.page2_store_orders_servicedescription),
        },
        {
          id: "store-4",
          title: t(LanguageKey.page2_store_statistics_title),
          description: t(LanguageKey.page2_store_statistics_description),
          icon: "/landing/page2_statistics.svg",
          picture: "/landing/Store_stastistics.png",
          servicedescription: t(LanguageKey.page2_store_statistics_servicedescription),
        },
      ],
      postchi: [
        {
          id: "delivery-1",
          title: t(LanguageKey.page2_delivery_smartshipping_title),
          description: t(LanguageKey.page2_delivery_smartshipping_description),
          icon: "/landing/page2_smartshipping.svg",
          picture: "/landing/Delivery_size.png",
          servicedescription: t(LanguageKey.page2_delivery_smartshipping_servicedescription),
        },
        {
          id: "delivery-2",
          title: t(LanguageKey.page2_delivery_postalservice_title),
          description: t(LanguageKey.page2_delivery_postalservice_description),
          icon: "/landing/page2_postalservice.svg",
          picture: "/landing/Delivery_pickup.png",
          servicedescription: t(LanguageKey.page2_delivery_postalservice_servicedescription),
        },
        {
          id: "delivery-3",
          title: t(LanguageKey.page2_delivery_tracking_title),
          description: t(LanguageKey.page2_delivery_tracking_description),
          icon: "/landing/page2_Deliverytracking.svg",
          picture: "/landing/Delivery_tracking.png",
          servicedescription: t(LanguageKey.page2_delivery_tracking_servicedescription),
        },
      ],
      jobs: [
        {
          id: "jobs-1",
          title: t(LanguageKey.page2_jobs_subadmin_title),
          description: t(LanguageKey.page2_jobs_subadmin_description),
          icon: "/landing/page2_subadmin.svg",
          picture: "/landing/admin-subadmin.png",
          servicedescription: t(LanguageKey.page2_jobs_subadmin_servicedescription),
        },
      ],
      ids: [
        {
          id: "ids-verification",
          title: t(LanguageKey.page2_ids_store_title),
          description: t(LanguageKey.page2_ids_store_description),
          icon: "/landing/page2_ids.svg",
          picture: "/soon.svg",
          servicedescription: t(LanguageKey.page2_ids_store_servicedescription),
        },
      ],
      publish: [
        {
          id: "ids-Publish-1",
          title: t(LanguageKey.page2_publish_contentmanagement_title),
          description: t(LanguageKey.page2_publish_contentmanagement_description),
          icon: "/landing/page2_contentmanagement.svg",
          picture: "/landing/Page_Post.png",
          servicedescription: t(LanguageKey.page2_publish_contentmanagement_servicedescription),
        },
        {
          id: "ids-Publish-2",
          title: t(LanguageKey.page2_publish_contentpublishing_title),
          description: t(LanguageKey.page2_publish_contentpublishing_description),
          icon: "/landing/page2_contentpublishing.svg",
          picture: "/landing/Page_AutomaticPost.png",
          servicedescription: t(LanguageKey.page2_publish_contentpublishing_servicedescription),
        },
        {
          id: "ids-Publish-3",
          title: t(LanguageKey.page2_publish_analytics_title),
          description: t(LanguageKey.page2_publish_analytics_description),
          icon: "/landing/page2_analytics.svg",
          picture: "/landing/Page_insight.png",
          servicedescription: t(LanguageKey.page2_publish_analytics_servicedescription),
        },
        {
          id: "ids-Publish-4",
          title: t(LanguageKey.page2_publish_statistics_title),
          description: t(LanguageKey.page2_publish_statistics_description),
          icon: "/landing/page2_pagestatistics.svg",
          picture: "/landing/Page_Statistics.png",
          servicedescription: t(LanguageKey.page2_publish_statistics_servicedescription),
        },
      ],
      Extension: [
        {
          id: "extension-1",
          title: t(LanguageKey.page2_extension_biolink_title),
          description: t(LanguageKey.page2_extension_biolink_description),
          icon: "/landing/page2_biolink.svg",
          picture: "/landing/Extension.png",
          servicedescription: t(LanguageKey.page2_extension_biolink_servicedescription),
        },
        {
          id: "extension-2",
          title: t(LanguageKey.page2_extension_paymentgateway_title),
          description: t(LanguageKey.page2_extension_paymentgateway_description),
          icon: "/landing/page2_paymentgateway.svg",
          picture: "/landing/Extension.png",
          servicedescription: t(LanguageKey.page2_extension_paymentgateway_servicedescription),
        },
        {
          id: "extension-3",
          title: t(LanguageKey.page2_extension_customwebsite_title),
          description: t(LanguageKey.page2_extension_customwebsite_description),
          icon: "/landing/page2_customwebsite.svg",
          picture: "/landing/Extension.png",
          servicedescription: t(LanguageKey.page2_extension_customwebsite_servicedescription),
        },
      ],
    };

    return new Map(Object.entries(serviceData) as [TabType, Service[]][]);
  }, [t]);

  const tabsConfig = useMemo(
    () => [
      { id: "ads" as TabType, label: t(LanguageKey.sidebar_Advertise) },
      { id: "store" as TabType, label: t(LanguageKey.sidebar_Store) },
      { id: "postchi" as TabType, label: t(LanguageKey.shipping) },
      {
        id: "publish" as TabType,
        label: t(LanguageKey.page1_content_management),
      },
      // { id: "Extension" as TabType, label: t(LanguageKey.footer_Brancy) + " +" },
      // { id: "jobs" as TabType, label: t(LanguageKey.jobs) },
      { id: "ids" as TabType, label: t(LanguageKey.IDstore) },
    ],
    [t]
  );

  const currentServices = useMemo(() => servicesMap.get(state.activeTab) || [], [servicesMap, state.activeTab]);

  const currentService = useMemo(
    () => currentServices.find((s) => s.id === state.displayedService),
    [currentServices, state.displayedService]
  );

  const titleContent = useMemo(() => {
    const fullText = t(LanguageKey.page2_text1);
    const words = fullText.split(" ");
    if (words.length < 2) return fullText;
    return (
      <>
        {words[0]} <span>{words[1]}</span>
        {words.length > 2 ? " " + words.slice(2).join(" ") : ""}
      </>
    );
  }, [t]);

  const clearTimers = useCallback(() => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = null;
    }
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
  }, []);

  const setupAutoSlide = useCallback(() => {
    clearTimers();
    if (!state.isHovered && currentServices.length > 1) {
      autoSlideRef.current = setInterval(() => {
        startTransition(() => {
          const currentIndex = currentServices.findIndex((s) => s.id === state.selectedService);
          const nextIndex = (currentIndex + 1) % currentServices.length;
          dispatch({
            type: "SET_SELECTED_SERVICE",
            payload: currentServices[nextIndex].id,
          });
        });
      }, 10000);
    }
  }, [state.isHovered, state.selectedService, currentServices, clearTimers]);

  const handleTabClick = useCallback((tabId: TabType) => {
    startTransition(() => {
      dispatch({ type: "SET_ACTIVE_TAB", payload: tabId });
    });
  }, []);

  const handleServiceClick = useCallback((serviceId: string) => {
    startTransition(() => {
      dispatch({ type: "SET_SELECTED_SERVICE", payload: serviceId });
    });
  }, []);

  const navigateSlide = useCallback(
    (direction: "next" | "prev") => {
      if (currentServices.length === 0) return;

      startTransition(() => {
        const currentIndex = currentServices.findIndex((s) => s.id === state.selectedService);
        const newIndex =
          direction === "next"
            ? (currentIndex + 1) % currentServices.length
            : (currentIndex - 1 + currentServices.length) % currentServices.length;

        dispatch({
          type: "SET_SELECTED_SERVICE",
          payload: currentServices[newIndex].id,
        });
      });
    },
    [currentServices, state.selectedService]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const { key, target } = event;
      const element = target as HTMLElement;

      if (element.closest('[role="tablist"]')) {
        switch (key) {
          case "ArrowRight":
          case "ArrowLeft":
            event.preventDefault();
            const direction = key === "ArrowRight" ? 1 : -1;
            const currentIndex = state.focusedTabIndex;
            const newIndex = (currentIndex + direction + tabsConfig.length) % tabsConfig.length;
            dispatch({ type: "SET_FOCUSED_TAB", payload: newIndex });
            handleTabClick(tabsConfig[newIndex].id);
            break;
          case "Enter":
          case " ":
            event.preventDefault();
            handleTabClick(tabsConfig[state.focusedTabIndex].id);
            break;
          case "Home":
            event.preventDefault();
            dispatch({ type: "SET_FOCUSED_TAB", payload: 0 });
            handleTabClick(tabsConfig[0].id);
            break;
          case "End":
            event.preventDefault();
            const lastIndex = tabsConfig.length - 1;
            dispatch({ type: "SET_FOCUSED_TAB", payload: lastIndex });
            handleTabClick(tabsConfig[lastIndex].id);
            break;
        }
      } else {
        switch (key) {
          case "ArrowRight":
            event.preventDefault();
            navigateSlide("next");
            break;
          case "ArrowLeft":
            event.preventDefault();
            navigateSlide("prev");
            break;
          case "Escape":
            event.preventDefault();
            if (serviceContainerRef.current) {
              serviceContainerRef.current.focus();
            }
            break;
        }
      }
    },
    [state.focusedTabIndex, tabsConfig, handleTabClick, navigateSlide]
  );

  const handleMouseEnter = useCallback(() => {
    dispatch({ type: "SET_HOVERED", payload: true });
  }, []);

  const handleMouseLeave = useCallback(() => {
    dispatch({ type: "SET_HOVERED", payload: false });
  }, []);

  useEffect(() => {
    setupAutoSlide();
    return clearTimers;
  }, [setupAutoSlide, clearTimers]);

  useEffect(() => {
    if (currentServices.length > 0) {
      const firstServiceId = currentServices[0].id;
      dispatch({ type: "SET_SELECTED_SERVICE", payload: firstServiceId });
      dispatch({ type: "SET_DISPLAYED_SERVICE", payload: firstServiceId });
    }
  }, [currentServices]);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (state.selectedService === null) {
      if (currentServices.length > 0) {
        dispatch({
          type: "SET_SELECTED_SERVICE",
          payload: currentServices[0].id,
        });
        return;
      }
      dispatch({ type: "SET_ANIMATION_STATE", payload: "exit" });
      animationTimerRef.current = setTimeout(() => {
        dispatch({ type: "SET_DISPLAYED_SERVICE", payload: null });
        dispatch({ type: "SET_ANIMATION_STATE", payload: "idle" });
      }, 300);
      return;
    }

    if (state.displayedService !== state.selectedService) {
      if (state.displayedService !== null) {
        dispatch({ type: "SET_ANIMATION_STATE", payload: "exit" });
        animationTimerRef.current = setTimeout(() => {
          if (!abortControllerRef.current?.signal.aborted) {
            dispatch({
              type: "SET_DISPLAYED_SERVICE",
              payload: state.selectedService,
            });
            dispatch({ type: "SET_ANIMATION_STATE", payload: "enter" });
          }
        }, 300);
        return;
      }
      dispatch({
        type: "SET_DISPLAYED_SERVICE",
        payload: state.selectedService,
      });
      dispatch({ type: "SET_ANIMATION_STATE", payload: "enter" });
    }
  }, [state.selectedService, state.displayedService, currentServices]);

  useEffect(() => {
    if (currentService?.servicedescription) {
      const words = currentService.servicedescription.split(/(\s+)/).filter((word: string) => word.length > 0);
      dispatch({ type: "SET_TEXT_ARRAY", payload: words });
    }
  }, [currentService]);

  useEffect(() => {
    return () => {
      clearTimers();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [clearTimers]);

  return (
    <section
      className={styles.page2}
      id={`page2-${sectionId}`}
      onKeyDown={handleKeyDown}
      aria-labelledby={`page2-title-${sectionId}`}>
      <header className={styles.header}>
        <h1 id={`page2-title-${sectionId}`} className={styles.title}>
          {titleContent}
        </h1>
        <p className={styles.explain}>{t(LanguageKey.page2_text2)}</p>
      </header>

      <div className={styles.backgroundfade} aria-hidden="true">
        <div className={styles.ellipse4} />
        <div className={styles.ellipse3} />
        <div className={styles.ellipse2} />
        <div className={styles.ellipse1} />
      </div>

      <nav className={styles.tabContainer} ref={tabContainerRef} role="tablist" aria-label={t(LanguageKey.page2_text1)}>
        {tabsConfig.map((tab, index) => (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            className={`${styles.tab} ${state.activeTab === tab.id ? styles.tabActive : ""}`}
            onClick={() => handleTabClick(tab.id)}
            role="tab"
            aria-selected={state.activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}-${sectionId}`}
            tabIndex={state.focusedTabIndex === index ? 0 : -1}
            id={`tab-${tab.id}-${sectionId}`}>
            {tab.label}
            {state.activeTab === tab.id && <TabUnderline tabId={tab.id} />}
          </button>
        ))}
      </nav>

      <div
        className={styles.serviceContainer}
        ref={serviceContainerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="tabpanel"
        id={`tabpanel-${state.activeTab}-${sectionId}`}
        aria-labelledby={`tab-${state.activeTab}-${sectionId}`}
        tabIndex={-1}>
        <ul className={styles.carouselList} role="list">
          {currentServices.map((service) => (
            <li
              key={service.id}
              className={styles.carouselItem}
              data-active={state.selectedService === service.id ? true : undefined}
              onClick={() => handleServiceClick(service.id)}
              role="listitem"
              aria-pressed={state.selectedService === service.id}
              tabIndex={0}>
              <div className={styles.carouselBox}>
                {state.selectedService !== service.id && service.icon && (
                  <div className={styles.serviceIcon} aria-hidden="true">
                    <img src={service.icon} alt="" loading="lazy" decoding="async" />
                  </div>
                )}
                <div className={styles.carouselContents}>
                  <h2 className={styles.userName}>{service.title}</h2>
                  <h3 className={styles.userTitle}>{service.description}</h3>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <nav className={styles.carouselNav} aria-label="Service navigation">
          <button
            className={styles.prev}
            onClick={() => navigateSlide("prev")}
            aria-label="Previous service"
            disabled={isPending}>
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9.6 4 3 10.6a2 2 0 0 0 0 2.8L9.6 20a2 2 0 0 0 2.2.4h.1a2 2 0 0 0 1.1-1.8V16h7a2 2 0 0 0 2-2V9.8A2 2 0 0 0 20 8h-7V5.4A2 2 0 0 0 9.6 4" />
            </svg>
          </button>

          {!state.isHovered && (
            <div
              className={styles.autoSlideProgress}
              role="progressbar"
              aria-label="Auto-slide progress"
              aria-valuenow={0}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          )}

          <button
            className={styles.next}
            onClick={() => navigateSlide("next")}
            aria-label="Next service"
            disabled={isPending}>
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3.6a2 2 0 0 0-1 1.8V8H4a2 2 0 0 0-2 2v4.2A2 2 0 0 0 4 16h7v2.6a2 2 0 0 0 3.4 1.4l6.6-6.6a2 2 0 0 0 0-2.8L14.4 4a2 2 0 0 0-2.2-.4z" />
            </svg>
          </button>
        </nav>
      </div>

      <div className={styles.contentAreaParent}>
        {state.displayedService && currentService && (
          <article
            key={`${state.activeTab}-${state.displayedService}`}
            className={`${styles.contentArea} ${styles[`animation-${state.animationState}`]}`}
            aria-live="polite"
            aria-atomic="true">
            <p className={styles.serviceText}>
              {state.textArray.map((word: string, index: number) => (
                <span
                  key={`${state.displayedService}-${index}`}
                  className={`${styles.letter} ${word.trim() === "" ? styles.space : ""}`}
                  style={{ animationDelay: `${index * 50}ms` }}>
                  {word}
                </span>
              ))}
            </p>
            {currentService.picture && (
              <img
                className={styles.servicepicture}
                src={currentService.picture}
                alt={currentService.title}
                loading="lazy"
                decoding="async"
              />
            )}
          </article>
        )}
      </div>
    </section>
  );
};

export default Page2;
