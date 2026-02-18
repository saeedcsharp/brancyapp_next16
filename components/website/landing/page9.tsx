import React, { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "saeed/i18n";
import PriceFormater, { PriceFormaterClassName, PriceType } from "../../priceFormater";
import FeatureList from "./featurelist";
import styles from "./page9.module.css";

// تعریف انواع پلن‌ها
interface PlanTier {
  model: string;
  level: number;
  followerRange: string;
  minFollowers: number;
  maxFollowers: number;
  prices: {
    month1: number;
    month3: number;
    month6: number;
    month9: number;
    month12: number;
  };
  pricesUsd: {
    month1: number;
    month3: number;
    month6: number;
    month9: number;
    month12: number;
  };
  features: {
    hasBusiness: boolean;
    hasAI: boolean;
    aiTokens: number; // Monthly AI token allowance
    hasAdvancedAnalytics: boolean;
    hasAIResponse: boolean;
    hasCustomSupport: boolean;
    hasCustomDomain: boolean;
    winnerPickerCount: number; // Monthly winner picker allowance
  };
}

const discounts = {
  month1: 0,
  month3: 5,
  month6: 10,
  month9: 15,
  month12: 20,
} as const;

type PlanState = {
  isPopupOpen: boolean;
  isAnimatingOut: boolean;
  selectedFollowers: number;
  selectedDuration: keyof typeof discounts;
  tooltipPosition: number;
  isInitialLoad: boolean;
  sliderValue: number;
};

type PlanAction =
  | { type: "TOGGLE_POPUP"; payload: boolean }
  | { type: "SET_ANIMATING_OUT"; payload: boolean }
  | { type: "SET_SELECTED_FOLLOWERS"; payload: number }
  | { type: "SET_SELECTED_DURATION"; payload: keyof typeof discounts }
  | { type: "SET_TOOLTIP_POSITION"; payload: number }
  | { type: "SET_INITIAL_LOAD"; payload: boolean }
  | { type: "SET_SLIDER_VALUE"; payload: number };

const planReducer = (state: PlanState, action: PlanAction): PlanState => {
  switch (action.type) {
    case "TOGGLE_POPUP":
      return { ...state, isPopupOpen: action.payload };
    case "SET_ANIMATING_OUT":
      return { ...state, isAnimatingOut: action.payload };
    case "SET_SELECTED_FOLLOWERS":
      return { ...state, selectedFollowers: action.payload };
    case "SET_SELECTED_DURATION":
      return { ...state, selectedDuration: action.payload };
    case "SET_TOOLTIP_POSITION":
      return { ...state, tooltipPosition: action.payload };
    case "SET_INITIAL_LOAD":
      return { ...state, isInitialLoad: action.payload };
    case "SET_SLIDER_VALUE":
      return { ...state, sliderValue: action.payload };
    default:
      return state;
  }
};

interface Page9Props {
  handleShowCreateSignIn: () => void;
}

const Page9: React.FC<Page9Props> = ({ handleShowCreateSignIn }) => {
  const { t, i18n } = useTranslation();

  // ریف‌ها برای مدیریت فوکوس و DOM
  const planCardsRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // تشخیص زبان فعلی و انتخاب نوع قیمت و واحد پول
  const currentLanguage = i18n.language;
  const isPersian = currentLanguage === "fa";
  const priceType = isPersian ? PriceType.Toman : PriceType.Dollar;

  // انتخاب قیمت‌های مناسب بر اساس زبان
  const getPriceForPlan = useCallback(
    (plan: PlanTier, duration: keyof typeof discounts) => {
      return isPersian ? plan.prices[duration] : plan.pricesUsd[duration];
    },
    [isPersian],
  );

  // تعریف پلن‌ها با استفاده از translation - memoized برای بهینه‌سازی رندر
  const pricingPlans: PlanTier[] = useMemo(
    () => [
      {
        model: t(LanguageKey.Beginner),
        level: 1,
        followerRange: "100 – 1K",
        minFollowers: 100,
        maxFollowers: 999,
        prices: { month1: 470000, month3: 0, month6: 0, month9: 0, month12: 0 },
        pricesUsd: { month1: 15, month3: 0, month6: 0, month9: 0, month12: 0 },
        features: {
          hasBusiness: false,
          hasAI: true,
          aiTokens: 0,
          hasAdvancedAnalytics: true,
          hasAIResponse: true,
          hasCustomSupport: false,
          hasCustomDomain: false,
          winnerPickerCount: 0,
        },
      },
      {
        model: t(LanguageKey.Basic),
        level: 2,
        followerRange: "1K – 10K",
        minFollowers: 1000,
        maxFollowers: 9999,
        prices: { month1: 680000, month3: 2040000, month6: 0, month9: 0, month12: 0 },
        pricesUsd: { month1: 25, month3: 70, month6: 0, month9: 0, month12: 0 },
        features: {
          hasBusiness: true,
          hasAI: true,
          aiTokens: 100000,
          hasAdvancedAnalytics: true,
          hasAIResponse: true,
          hasCustomSupport: false,
          hasCustomDomain: false,
          winnerPickerCount: 0,
        },
      },
      {
        model: t(LanguageKey.Growing),
        level: 3,
        followerRange: "10K – 50K",
        minFollowers: 10000,
        maxFollowers: 49999,
        prices: { month1: 1260000, month3: 3780000, month6: 0, month9: 0, month12: 0 },
        pricesUsd: { month1: 39, month3: 110, month6: 0, month9: 0, month12: 0 },
        features: {
          hasBusiness: true,
          hasAI: true,
          aiTokens: 200000,
          hasAdvancedAnalytics: true,
          hasAIResponse: true,
          hasCustomSupport: false,
          hasCustomDomain: true,
          winnerPickerCount: 1,
        },
      },
      {
        model: t(LanguageKey.Advanced),
        level: 4,
        followerRange: "50K – 100K",
        minFollowers: 50000,
        maxFollowers: 99999,
        prices: { month1: 1650000, month3: 4950000, month6: 9900000, month9: 14850000, month12: 19800000 },
        pricesUsd: { month1: 59, month3: 165, month6: 320, month9: 460, month12: 590 },
        features: {
          hasBusiness: true,
          hasAI: true,
          aiTokens: 500000,
          hasAdvancedAnalytics: true,
          hasAIResponse: true,
          hasCustomSupport: true,
          hasCustomDomain: true,
          winnerPickerCount: 2,
        },
      },
      {
        model: t(LanguageKey.Professional),
        level: 5,
        followerRange: "100K–500K",
        minFollowers: 100000,
        maxFollowers: 499999,
        prices: { month1: 2100000, month3: 6300000, month6: 12600000, month9: 18900000, month12: 25200000 },
        pricesUsd: { month1: 79, month3: 225, month6: 430, month9: 620, month12: 790 },
        features: {
          hasBusiness: true,
          hasAI: true,
          aiTokens: 1000000,
          hasAdvancedAnalytics: true,
          hasAIResponse: true,
          hasCustomSupport: true,
          hasCustomDomain: true,
          winnerPickerCount: 3,
        },
      },
      {
        model: t(LanguageKey.Special),
        level: 6,
        followerRange: "+500K",
        minFollowers: 500000,
        maxFollowers: 1000000,
        prices: { month1: 2950000, month3: 8850000, month6: 17700000, month9: 26550000, month12: 35400000 },
        pricesUsd: { month1: 109, month3: 310, month6: 590, month9: 850, month12: 1100 },
        features: {
          hasBusiness: true,
          hasAI: true,
          aiTokens: 5000000,
          hasAdvancedAnalytics: true,
          hasAIResponse: true,
          hasCustomSupport: true,
          hasCustomDomain: true,
          winnerPickerCount: 4,
        },
      },
    ],
    [t],
  );

  const [state, dispatch] = useReducer(planReducer, {
    isPopupOpen: false,
    isAnimatingOut: false,
    selectedFollowers: 5000,
    selectedDuration: "month1" as keyof typeof discounts,
    tooltipPosition: 0,
    isInitialLoad: true,
    sliderValue: 16.67, // تقریباً موقعیت 500 فالوور
  });
  // این قسمت برای مدیریت وضعیت نمایش پلن‌ها و انیمیشن‌های مربوط به آن‌ها استفاده می‌شود

  // SubAdmin state

  // تعریف آرایه ویژگی‌ها برای استفاده در map
  const featuresList = [
    { key: "hasBusiness", label: t(LanguageKey.startbusiness) },
    { key: "hasAI", label: t(LanguageKey.AI) },
    { key: "hasAdvancedAnalytics", label: t(LanguageKey.AdvancedAnalytics) },
    { key: "hasAIResponse", label: t(LanguageKey.AIResponse) },
    { key: "hasCustomSupport", label: t(LanguageKey.CustomSupport) },
    { key: "hasCustomDomain", label: t(LanguageKey.CustomDomain) },
    { key: "winnerPickerCount", label: t(LanguageKey.WinnerPicker) },
  ] as const;

  // پیدا کردن پلن مناسب بر اساس تعداد فالوور - memoized
  const currentPlan = useMemo(() => {
    return (
      pricingPlans.find(
        (plan) => state.selectedFollowers >= plan.minFollowers && state.selectedFollowers <= plan.maxFollowers,
      ) || pricingPlans[0]
    );
  }, [state.selectedFollowers, pricingPlans]);

  // تغییر خودکار مدت زمان به اولین گزینه موجود اگر انتخاب فعلی موجود نباشد
  useEffect(() => {
    const isCurrentDurationAvailable = getPriceForPlan(currentPlan, state.selectedDuration) > 0;
    if (!isCurrentDurationAvailable) {
      // پیدا کردن اولین مدت زمان موجود
      const availableDuration = Object.keys(discounts).find(
        (duration) => getPriceForPlan(currentPlan, duration as keyof typeof discounts) > 0,
      ) as keyof typeof discounts;
      if (availableDuration) {
        dispatch({ type: "SET_SELECTED_DURATION", payload: availableDuration });
      }
    }
  }, [currentPlan, state.selectedDuration, getPriceForPlan]);
  // اسکرول خودکار به پلن فعال
  useEffect(() => {
    // در بارگذاری اولیه اسکرول نکن
    if (state.isInitialLoad) {
      dispatch({ type: "SET_INITIAL_LOAD", payload: false });
      return;
    }
    if (planCardsRef.current) {
      const currentPlanIndex = pricingPlans.findIndex(
        (plan) => state.selectedFollowers >= plan.minFollowers && state.selectedFollowers <= plan.maxFollowers,
      );
      if (currentPlanIndex !== -1) {
        const cardElement = planCardsRef.current.children[currentPlanIndex] as HTMLElement;
        if (cardElement) {
          cardElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }
      }
    }
  }, [state.selectedFollowers, state.selectedDuration, pricingPlans]);
  // Constants memoized برای بهبود عملکرد
  const followerSteps = useMemo(() => [100, 1000, 10000, 50000, 100000, 500000, 1000000], []);
  // تبدیل موقعیت اسلایدر به مقدار واقعی فالوور - optimized
  const sliderToFollowerValue = useCallback(
    (sliderValue: number) => {
      const totalSegments = 6;
      const segmentIndex = Math.floor((sliderValue / 100) * totalSegments);
      if (segmentIndex >= totalSegments) {
        return followerSteps[followerSteps.length - 1];
      }
      const segmentProgress = (sliderValue / 100) * totalSegments - segmentIndex;
      const stepMin = followerSteps[segmentIndex];
      const stepMax = followerSteps[segmentIndex + 1];
      return Math.round(stepMin + segmentProgress * (stepMax - stepMin));
    },
    [followerSteps],
  );
  // تبدیل مقدار فالوور به موقعیت اسلایدر - optimized
  const followerValueToSlider = useCallback(
    (followerValue: number) => {
      // پیدا کردن بازه مناسب
      for (let i = 0; i < followerSteps.length - 1; i++) {
        if (followerValue >= followerSteps[i] && followerValue <= followerSteps[i + 1]) {
          const stepMin = followerSteps[i];
          const stepMax = followerSteps[i + 1];
          const stepProgress = (followerValue - stepMin) / (stepMax - stepMin);
          const segmentProgress = (i + stepProgress) / 6;
          return segmentProgress * 100;
        }
      }
      // برای مقادیر خارج از بازه
      if (followerValue <= followerSteps[0]) return 0;
      if (followerValue >= followerSteps[followerSteps.length - 1]) return 100;
      return 0;
    },
    [followerSteps],
  );
  // محاسبه قیمت با تخفیف - memoized
  const calculatePrice = useCallback((basePrice: number, duration: keyof typeof discounts) => {
    if (basePrice === 0) return 0;
    const discount = discounts[duration];
    return Math.round(basePrice * (1 - discount / 100));
  }, []);
  // فرمت کردن تعداد فالوور برای تولتیپ - optimized
  const formatFollowersForTooltip = useCallback((followers: number) => {
    if (followers >= 1000000) {
      return "♾️";
    } else if (followers >= 1000) {
      return (followers / 1000).toFixed(0) + "K";
    } else {
      return followers.toString();
    }
  }, []);
  // تعیین بازه فعال بر اساس مقدار فالوور - optimized
  const getActiveSegment = useCallback(
    (followerValue: number) => {
      for (let i = 0; i < followerSteps.length - 1; i++) {
        if (followerValue >= followerSteps[i] && followerValue <= followerSteps[i + 1]) {
          return {
            index: i,
            startPosition: (i / 6) * 100,
            endPosition: ((i + 1) / 6) * 100,
            width: (1 / 6) * 100,
          };
        }
      }
      // برای مقادیر خارج از بازه
      if (followerValue <= followerSteps[0]) {
        return { index: 0, startPosition: 0, endPosition: (1 / 6) * 100, width: (1 / 6) * 100 };
      }
      return { index: 5, startPosition: (5 / 6) * 100, endPosition: 100, width: (1 / 6) * 100 };
    },
    [followerSteps],
  );
  // آپدیت موقعیت تولتیپ هنگام تغییر slider
  useEffect(() => {
    dispatch({ type: "SET_TOOLTIP_POSITION", payload: state.sliderValue });
  }, [state.sliderValue]);
  // محاسبه موقعیت‌های استپ‌ها - memoized برای بهبود عملکرد
  const stepPositions = useMemo(
    () => [
      { value: 100, label: "100", position: 0 },
      { value: 1000, label: "1K", position: (1 / 6) * 100 },
      { value: 10000, label: "10K", position: (2 / 6) * 100 },
      { value: 50000, label: "50K", position: (3 / 6) * 100 },
      { value: 100000, label: "100K", position: (4 / 6) * 100 },
      { value: 500000, label: "500K", position: (5 / 6) * 100 },
      { value: 1000000, label: "♾️", position: 100 },
    ],
    [],
  );
  // آپدیت slider value هنگام تغییر selectedFollowers
  useEffect(() => {
    const newSliderValue = followerValueToSlider(state.selectedFollowers);
    if (Math.abs(newSliderValue - state.sliderValue) > 0.01) {
      // جلوگیری از تغییرات ریز
      dispatch({ type: "SET_SLIDER_VALUE", payload: newSliderValue });
    }
  }, [state.selectedFollowers, state.sliderValue]);
  // Prevent background scroll when popup is open - با cleanup بهتر
  useLayoutEffect(() => {
    if (state.isPopupOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [state.isPopupOpen]);
  const openPopup = useCallback(() => {
    dispatch({ type: "TOGGLE_POPUP", payload: true });
  }, []);
  const closePopup = useCallback(() => {
    dispatch({ type: "SET_ANIMATING_OUT", payload: true });
    // cleanup قبلی timeout اگر وجود دارد
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      dispatch({ type: "TOGGLE_POPUP", payload: false });
      dispatch({ type: "SET_ANIMATING_OUT", payload: false });
      timeoutRef.current = undefined;
    }, 150);
  }, []);
  // cleanup timeout در unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  // Handler برای کلیک بر روی کارت پلن
  const handlePlanCardClick = useCallback((plan: PlanTier) => {
    // تنظیم اسلایدر در وسط بازه پلن انتخاب شده
    const midpoint = Math.floor((plan.minFollowers + plan.maxFollowers) / 2);
    const newSliderValue = followerValueToSlider(midpoint);
    dispatch({ type: "SET_SLIDER_VALUE", payload: newSliderValue });
    dispatch({ type: "SET_SELECTED_FOLLOWERS", payload: midpoint });
  }, []);
  // Handler های drag-to-scroll (موس و تاچ)
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!planCardsRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - planCardsRef.current.offsetLeft;
    scrollLeftRef.current = planCardsRef.current.scrollLeft;
    planCardsRef.current.style.cursor = "grabbing";
    planCardsRef.current.style.userSelect = "none";
  }, []);
  const handleMouseLeave = useCallback(() => {
    if (!planCardsRef.current) return;
    isDraggingRef.current = false;
    planCardsRef.current.style.cursor = "grab";
    planCardsRef.current.style.userSelect = "auto";
  }, []);
  const handleMouseUp = useCallback(() => {
    if (!planCardsRef.current) return;
    isDraggingRef.current = false;
    planCardsRef.current.style.cursor = "grab";
    planCardsRef.current.style.userSelect = "auto";
  }, []);
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !planCardsRef.current) return;
    e.preventDefault();
    const x = e.pageX - planCardsRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 2; // ضریب سرعت اسکرول
    planCardsRef.current.scrollLeft = scrollLeftRef.current - walk;
  }, []);
  // Touch handlers برای موبایل
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!planCardsRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.touches[0].pageX - planCardsRef.current.offsetLeft;
    scrollLeftRef.current = planCardsRef.current.scrollLeft;
  }, []);
  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !planCardsRef.current) return;
    const x = e.touches[0].pageX - planCardsRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 2;
    planCardsRef.current.scrollLeft = scrollLeftRef.current - walk;
  }, []);
  // Keyboard navigation handler - بهبود دسترسی‌پذیری
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          if (state.isPopupOpen) {
            closePopup();
          }
          break;
        case "Enter":
        case " ":
          if (e.target === e.currentTarget) {
            e.preventDefault();
            openPopup();
          }
          break;
      }
    },
    [state.isPopupOpen, closePopup, openPopup],
  );
  // Slider keyboard navigation
  const handleSliderKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentValue = state.sliderValue;
      let newValue = currentValue;
      switch (e.key) {
        case "ArrowLeft":
        case "ArrowDown":
          e.preventDefault();
          newValue = Math.max(0, currentValue - 5);
          break;
        case "ArrowRight":
        case "ArrowUp":
          e.preventDefault();
          newValue = Math.min(100, currentValue + 5);
          break;
        case "Home":
          e.preventDefault();
          newValue = 0;
          break;
        case "End":
          e.preventDefault();
          newValue = 100;
          break;
      }
      if (newValue !== currentValue) {
        dispatch({ type: "SET_SLIDER_VALUE", payload: newValue });
        dispatch({ type: "SET_SELECTED_FOLLOWERS", payload: sliderToFollowerValue(newValue) });
      }
    },
    [state.sliderValue],
  );
  const titleContent = useMemo(() => {
    const text = t(LanguageKey.page9_planheader);
    const words = text.split(" ");
    if (words.length < 2) return text;
    return (
      <>
        {words[0] + " "}
        <span>{words[1]}</span>
        {words.length > 2 ? " " + words.slice(2).join(" ") : ""}
      </>
    );
  }, [t]);
  return (
    <section className={styles.page9} role="main" aria-labelledby="pricing-title">
      <div className={styles.header}>
        <div id="pricing-title">{titleContent}</div>
        <div className={styles.explain}>{t(LanguageKey.page9_planexplain)}</div>
        <div className={styles.title}>{t(LanguageKey.page9_plantitle)}</div>
      </div>
      <>
        <div className={styles.pricingCard}>
          {/* نوار اسلایدر برای انتخاب تعداد فالوور */}
          <div
            className={`headerandinput translate ${styles.headerandinput}`}
            role="group"
            aria-labelledby="follower-selector">
            <div className={styles.sliderContainer}>
              <div
                className={styles.sliderTooltip}
                style={{ left: `${state.tooltipPosition}%` }}
                role="tooltip"
                aria-live="polite">
                {formatFollowersForTooltip(state.selectedFollowers)}
              </div>
              <input
                ref={sliderRef}
                type="range"
                min={0}
                max={100}
                step="0.1"
                value={state.sliderValue}
                onChange={(e) => {
                  const sliderValue = Number(e.target.value);
                  dispatch({ type: "SET_SLIDER_VALUE", payload: sliderValue });
                  dispatch({ type: "SET_SELECTED_FOLLOWERS", payload: sliderToFollowerValue(sliderValue) });
                }}
                onKeyDown={handleSliderKeyDown}
                className={styles.slider}
                aria-label={`انتخاب تعداد فالوورها: ${formatFollowersForTooltip(state.selectedFollowers)}`}
                aria-valuemin={100}
                aria-valuemax={1000000}
                aria-valuenow={state.selectedFollowers}
                aria-valuetext={formatFollowersForTooltip(state.selectedFollowers)}
              />
            </div>
            <div className={styles.sliderMarks}>
              {stepPositions.map((step, index) => (
                <span key={index} style={{ left: `${step.position}%` }}>
                  {step.label}
                </span>
              ))}
            </div>
          </div>
          {/* انتخاب مدت زمان */}
          <div className={styles.durationSwitch} role="tablist" aria-label="انتخاب مدت زمان پلن">
            {Object.entries(discounts).map(([duration, discount]) => {
              const isAvailable = getPriceForPlan(currentPlan, duration as keyof typeof currentPlan.prices) > 0;
              const isSelected = state.selectedDuration === duration;
              return (
                <button
                  key={duration}
                  role="tab"
                  disabled={!isAvailable}
                  aria-selected={isSelected}
                  aria-controls={`plan-content-${duration}`}
                  className={`${styles.switchButton} ${isSelected ? styles.active : ""} ${
                    !isAvailable ? styles.disabled : ""
                  }`}
                  onClick={() =>
                    isAvailable &&
                    dispatch({ type: "SET_SELECTED_DURATION", payload: duration as keyof typeof discounts })
                  }>
                  {discount > 0 && (
                    <span className={styles.discountLabel} aria-label={`${discount} درصد تخفیف`}>
                      {discount}%
                    </span>
                  )}
                  <div className={styles.labelContainer}>
                    <span> {duration.replace("month", "")}</span> <span> {t(LanguageKey.pageTools_Month)}</span>
                  </div>
                </button>
              );
            })}
          </div>
          {/* کارت‌های پلن‌ها */}
          <div
            ref={planCardsRef}
            className={styles.planCards}
            role="group"
            aria-label="پلن‌های قیمت‌گذاری"
            id={`plan-content-${state.selectedDuration}`}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            style={{ cursor: "grab" }}>
            {pricingPlans.map((plan, index) => {
              const price = getPriceForPlan(plan, state.selectedDuration);
              const isAvailable = price > 0;
              const finalPrice = calculatePrice(price, state.selectedDuration);
              const isCurrentPlan =
                state.selectedFollowers >= plan.minFollowers && state.selectedFollowers <= plan.maxFollowers;
              const isSuitable = true;
              const hasHighlightedPlan = pricingPlans.some(
                (p) => state.selectedFollowers >= p.minFollowers && state.selectedFollowers <= p.maxFollowers,
              );
              const shouldDim = hasHighlightedPlan && !isCurrentPlan;
              return (
                <article
                  key={index}
                  className={`${styles.planCard} ${isCurrentPlan ? styles.highlighted : ""} ${
                    !isSuitable ? styles.unsuitable : ""
                  } ${shouldDim ? styles.dimmed : ""}`}
                  role="article"
                  aria-labelledby={`plan-title-${index}`}
                  aria-describedby={`plan-features-${index}`}
                  onClick={() => handlePlanCardClick(plan)}
                  style={{ cursor: "pointer" }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handlePlanCardClick(plan);
                    }
                  }}>
                  <header className={`${styles.planHeader} ${isCurrentPlan ? styles.highlighted : ""}`}>
                    <h4 className={styles.planModel} id={`plan-title-${index}`}>
                      <span> {plan.followerRange}</span> {t(LanguageKey.markethomefollower)}
                    </h4>
                    <div className="headerandinput" style={{ gap: "1px", height: "45px" }}>
                      <div className="title">
                        {t(LanguageKey.level)} {plan.level}
                      </div>
                      <div className="title" style={{ fontWeight: "400", fontSize: "14px" }}>
                        {plan.model}
                      </div>
                    </div>
                    <div className="headerandinput" style={{ gap: "1px", height: "45px" }}>
                      {isAvailable ? (
                        <>
                          <div className={styles.originalPrice}>
                             
                            {discounts[state.selectedDuration] > 0 && (
                              <>
                                <PriceFormater
                                  pricetype={priceType}
                                  fee={price}
                                  className={PriceFormaterClassName.PostPrice}
                                />
                              </>
                            )}
                          </div>
                          <div className={styles.finalPrice}>
                            <PriceFormater
                              pricetype={priceType}
                              fee={finalPrice}
                              className={PriceFormaterClassName.PostPrice}
                            />
                          </div>
                        </>
                      ) : (
                        <div className={styles.planUnavailable}>{t(LanguageKey.Unavailable)}</div>
                      )}
                    </div>
                  </header>{" "}
                  <div className={styles.planFeatures} id={`plan-features-${index}`}>
                    {featuresList.map((feature, featureIndex) => {
                      let isActive: boolean;
                      let featureText: React.ReactNode = feature.label;
                      // Handle special cases for numeric features
                      if (feature.key === "winnerPickerCount") {
                        const count = plan.features[feature.key] as number;
                        isActive = count > 0;
                        featureText =
                          count > 0 ? (
                            <>
                              <span>{feature.label}</span>
                              <span className={styles.planExplain}>
                                {" "}
                                ({t(LanguageKey.page9_monthly)} {count})
                              </span>
                            </>
                          ) : (
                            <span>{feature.label}</span>
                          );
                      } else if (feature.key === "hasAI") {
                        // Show AI with token information
                        const hasAI = plan.features[feature.key] as boolean;
                        const tokens = plan.features.aiTokens;
                        isActive = hasAI;
                        if (hasAI && tokens > 0) {
                          const requests = tokens / 1000;
                          featureText = (
                            <>
                              <span>{feature.label}</span>
                              {/* <span className={styles.planExplain}>
                                {" "}
                                ({requests} {t(LanguageKey.marketProperties_Request)}/{t(LanguageKey.page9_monthly)})
                              </span> */}
                            </>
                          );
                        } else {
                          featureText = <span>{feature.label}</span>;
                        }
                      } else {
                        isActive = plan.features[feature.key] as boolean;
                        featureText = <span>{feature.label}</span>;
                      }

                      return (
                        <div
                          key={featureIndex}
                          className={`${styles.planFeature} ${isActive ? styles.active : styles.inactive}`}>
                          <span className={styles.featureIcon} aria-hidden="true">
                            {isActive ? (
                              <svg
                                fill="none"
                                width="14"
                                height="14"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 14 14">
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M7 .7a6.3 6.3 0 1 1 0 12.6A6.3 6.3 0 0 1 7 .7M9.7 5H9L6.2 7.8 5 6.6a.5.5 0 1 0-.7.8L6 8.9h.7l3-3q.5-.5 0-.8"
                                  fill="var(--text-h1)"
                                />
                              </svg>
                            ) : (
                              <svg
                                width="14"
                                height="14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 13 14">
                                <path
                                  opacity="0.5"
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M6.5.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13M4.9 4.8a.4.4 0 1 0-.6.6L5.9 7 4.3 8.6a.4.4 0 1 0 .6.6l1.6-1.6L8 9.2a.4.4 0 0 0 .6-.6L7.1 7l1.6-1.6a.4.4 0 0 0-.6-.6L6.5 6.4z"
                                  fill="var(--text-h2)"
                                />
                              </svg>
                            )}
                          </span>
                          <span>{featureText}</span>
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </>

      <button
        className={styles.planshowmore}
        onClick={openPopup}
        onKeyDown={handleKeyDown}
        aria-label={t(LanguageKey.page9_Compare)}
        type="button">
        <svg xmlns="http://www.w3.org/2000/svg" fill="var(--color-light-blue)" width="24px" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 6q0-1 1-1h10a1 1 0 1 1 0 2H11a1 1 0 0 1-1-1m0 6q0-1 1-1h10a1 1 0 1 1 0 2H11a1 1 0 0 1-1-1m0 6q0-1 1-1h10a1 1 0 1 1 0 2H11a1 1 0 0 1-1-1M9.1 3.2q.7.7.2 1.4l-4 5a1 1 0 0 1-1.5.1L2.3 8.2a1 1 0 0 1 1.4-1.4l.7.7 3.3-4.1a1 1 0 0 1 1.4-.2m0 11q.7.7.2 1.4l-4 5a1 1 0 0 1-1.5.1l-1.5-1.5a1 1 0 1 1 1.4-1.4l.7.7 3.3-4.1a1 1 0 0 1 1.4-.2"
          />
        </svg>
        {t(LanguageKey.page9_Compare)}
      </button>
      <FeatureList isPopupOpen={state.isPopupOpen} isAnimatingOut={state.isAnimatingOut} onClose={closePopup} />
    </section>
  );
};

export default React.memo(Page9);
