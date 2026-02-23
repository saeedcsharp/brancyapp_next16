import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useTranslation } from "react-i18next";
import { LanguageKey } from "../../../i18n";
import { FeatureType } from "../../../models/market/enums";
import { IFeatureInfo } from "../../../models/market/myLink";
import styles from "./menubar.module.css";

interface MenubarProps {
  data: IFeatureInfo[];
  featureType: number;
  onFeatureChange?: (featureType: number) => void;
}
const FEATURE_ELEMENT_MAP = new Map([
  [FeatureType.FeaturesBox, "featureBox"],
  [FeatureType.Announcements, "announcement"],
  [FeatureType.Reviews, "reviews"],
  [FeatureType.OnlineStream, "onlinestreaming"],
  [FeatureType.LastVideo, "LastVideo"],
  [FeatureType.Products, "product"],
  [FeatureType.AdsTimeline, "timeline"],
  [FeatureType.QandABox, "faq"],
  [FeatureType.LinkShortcut, "link"],
  [FeatureType.ContactAndMap, "contact"],
]);

const ELEMENT_TO_FEATURE_MAP = new Map(Array.from(FEATURE_ELEMENT_MAP, ([k, v]) => [v, k]));

const FEATURE_LANGUAGE_KEY_MAP = new Map([
  [FeatureType.FeaturesBox, LanguageKey.navbar_Home],
  [FeatureType.Announcements, LanguageKey.marketPropertiesAnnouncements],
  [FeatureType.Reviews, LanguageKey.marketPropertiesReviews],
  [FeatureType.OnlineStream, LanguageKey.marketPropertiesOnlineStream],
  [FeatureType.LastVideo, LanguageKey.marketPropertiesLastVideo],
  [FeatureType.Products, LanguageKey.marketPropertiesProducts],
  [FeatureType.AdsTimeline, LanguageKey.marketPropertiesAdsTimeline],
  [FeatureType.QandABox, LanguageKey.marketPropertiesQandABox],
  [FeatureType.LinkShortcut, LanguageKey.marketPropertieslinks],
  [FeatureType.ContactAndMap, LanguageKey.marketPropertiesContactAndMap],
]);
const Menubar = memo(({ data, featureType, onFeatureChange }: MenubarProps) => {
  const { t } = useTranslation();
  const menuId = useId();
  const [featureId, setFeatureId] = useState(featureType);
  const deferredFeatureId = useDeferredValue(featureId);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menubarRef = useRef<HTMLElement>(null);
  const focusedIndexRef = useRef(-1);
  const loaderStyle = useMemo(() => `loader${deferredFeatureId}`, [deferredFeatureId]);

  const getMenuTitle = useCallback(
    (featureType: number) => {
      const languageKey = FEATURE_LANGUAGE_KEY_MAP.get(featureType);
      return languageKey ? t(languageKey) : `Feature ${featureType}`;
    },
    [t]
  );
  const updateActiveFeature = useCallback(
    (newFeatureId: number) => {
      if (newFeatureId !== featureId) {
        setFeatureId(newFeatureId);
        onFeatureChange?.(newFeatureId);
      }
    },
    [featureId, onFeatureChange]
  );
  const handleSlideToFeature = useCallback((elementId: string) => {
    isScrollingRef.current = true;
    const element = document.getElementById(elementId);
    element?.scrollIntoView({ behavior: "smooth" });
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 1000);
  }, []);
  const handleSelectFeature = useCallback(
    (selectedFeatureId: number) => {
      updateActiveFeature(selectedFeatureId);
      const elementId = FEATURE_ELEMENT_MAP.get(selectedFeatureId);
      if (elementId) {
        handleSlideToFeature(elementId);
      }
    },
    [updateActiveFeature, handleSlideToFeature]
  );

  const handleKeyboardNavigation = useCallback(
    (event: React.KeyboardEvent) => {
      const { key } = event;
      const currentIndex = data.findIndex((item) => item.featureType === featureId);
      let newIndex = currentIndex;

      switch (key) {
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          newIndex = currentIndex < data.length - 1 ? currentIndex + 1 : 0;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : data.length - 1;
          break;
        case "Home":
          event.preventDefault();
          newIndex = 0;
          break;
        case "End":
          event.preventDefault();
          newIndex = data.length - 1;
          break;
        case "Escape":
          event.preventDefault();
          (event.target as HTMLElement)?.blur();
          return;
        default:
          return;
      }

      if (newIndex !== currentIndex && data[newIndex]) {
        handleSelectFeature(data[newIndex].featureType);
        focusedIndexRef.current = newIndex;

        setTimeout(() => {
          const menuItem = document.getElementById(`${menuId}-${data[newIndex].featureType}`);
          menuItem?.focus();
        }, 0);
      }
    },
    [data, featureId, handleSelectFeature, menuId]
  );
  const setupIntersectionObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    const options: IntersectionObserverInit = {
      threshold: [0.1, 0.3, 0.5],
      rootMargin: "-80px 0px -40% 0px",
    };
    observerRef.current = new IntersectionObserver((entries) => {
      if (isScrollingRef.current) return;

      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visibleEntry) {
        const elementId = visibleEntry.target.id;
        const featureType = ELEMENT_TO_FEATURE_MAP.get(elementId);
        if (featureType !== undefined) {
          updateActiveFeature(featureType);
        }
      }
    }, options);

    FEATURE_ELEMENT_MAP.forEach((elementId) => {
      const element = document.getElementById(elementId);
      if (element) {
        observerRef.current?.observe(element);
      }
    });
  }, [updateActiveFeature]);
  useEffect(() => {
    setFeatureId(featureType);
  }, [featureType]);
  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      setupIntersectionObserver();
    }, 50);
    return () => {
      clearTimeout(timer);
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    };
  }, [setupIntersectionObserver]);
  const memoizedMenuItems = useMemo(
    () =>
      data.map((item, index) => {
        const isActive = item.featureType === deferredFeatureId;
        const itemId = `${menuId}-${item.featureType}`;

        return (
          <button
            className={styles.menuitem}
            id={itemId}
            key={item.featureType}
            onClick={() => handleSelectFeature(item.featureType)}
            onKeyDown={handleKeyboardNavigation}
            type="button"
            aria-pressed={isActive}
            aria-current={isActive ? "page" : undefined}
            aria-label={`Navigate to ${getMenuTitle(item.featureType)}. ${isActive ? "Currently active" : ""}`}
            aria-describedby={isActive ? `${itemId}-loader` : undefined}
            aria-live="polite"
            aria-hidden={isActive ? "false" : "true"}
            aria-orientation="horizontal">
            {isActive ? (
              <>
                <b className={`${styles.active} title`} aria-live="polite">
                  {getMenuTitle(item.featureType)}
                </b>
                <div className={styles[loaderStyle]} id={`${itemId}-loader`} aria-hidden="true" />
              </>
            ) : (
              <span className={`${styles.title} title`}>{getMenuTitle(item.featureType)}</span>
            )}
          </button>
        );
      }),
    [data, deferredFeatureId, loaderStyle, handleSelectFeature, handleKeyboardNavigation, menuId, getMenuTitle]
  );
  return (
    <nav
      ref={menubarRef}
      className={styles.menubar}
      role="navigation"
      aria-label="Feature navigation"
      aria-orientation="horizontal"
      onKeyDown={handleKeyboardNavigation}
      suppressHydrationWarning>
      {memoizedMenuItems}
    </nav>
  );
});
Menubar.displayName = "Menubar";
export default Menubar;
