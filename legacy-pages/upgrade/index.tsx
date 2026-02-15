import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  KeyboardEvent,
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useRef,
  useTransition,
} from "react";
import { useTranslation } from "react-i18next";

import { RoleAccess } from "saeed/helper/loadingStatus";
import { convertMillisecondsToDays, convertToMilliseconds } from "saeed/helper/manageTimer";
import { LanguageKey } from "saeed/i18n";
import { MethodType } from "saeed/helper/apihelper";
import {
  generateMockFeaturesList,
  generateMockUserPackageInfo,
  getMockCurrentUserPlan,
  PlanTier,
  UserPackageInfo,
} from "saeed/models/mockData";
import { FeatureType, IBasePackagePrice, IFeatureInfo, IReserveFeaturePrices } from "saeed/models/psg/psg";

import ProgressBar from "saeed/components/design/progressBar/progressBar";
import Tooltip from "saeed/components/design/tooltip/tooltip";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import PriceFormater, { PriceFormaterClassName } from "saeed/components/priceFormater";

import styles from "./upgrade.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
type UpgradeState = {
  packageExtensions: IBasePackagePrice[];
  tokenPackages: IReserveFeaturePrices[];
  domainPackages: IReserveFeaturePrices[];
  winnerPickerPackages: IReserveFeaturePrices[];
  userPackageInfo: UserPackageInfo | null;
  currentUserPlan: PlanTier | null;
  loading: boolean;
  activeTab: "packages" | "tokens" | "ai" | "domain" | "winnerpicker";
  expandedSections: {
    packages: boolean;
    tokens: boolean;
    domain: boolean;
    winnerpicker: boolean;
  };
  yourPlanExpanded: boolean;
};
type UpgradeAction =
  | { type: "SET_PACKAGE_EXTENSIONS"; payload: IBasePackagePrice[] }
  | { type: "SET_TOKEN_PACKAGES"; payload: IReserveFeaturePrices[] }
  | { type: "SET_DOMAIN_PACKAGES"; payload: IReserveFeaturePrices[] }
  | { type: "SET_WINNER_PICKER_PACKAGES"; payload: IReserveFeaturePrices[] }
  | { type: "SET_USER_PACKAGE_INFO"; payload: UserPackageInfo | null }
  | { type: "SET_CURRENT_USER_PLAN"; payload: PlanTier }
  | { type: "SET_LOADING"; payload: boolean }
  | {
      type: "SET_ACTIVE_TAB";
      payload: "packages" | "tokens" | "ai" | "domain" | "winnerpicker";
    }
  | {
      type: "TOGGLE_SECTION";
      payload: "packages" | "tokens" | "domain" | "winnerpicker";
    }
  | {
      type: "SET_EXPANDED_SECTIONS";
      payload: Partial<UpgradeState["expandedSections"]>;
    }
  | { type: "TOGGLE_YOUR_PLAN" };
const initialState: UpgradeState = {
  packageExtensions: [],
  tokenPackages: [],
  domainPackages: [],
  winnerPickerPackages: [],
  userPackageInfo: null,
  currentUserPlan: null,
  loading: true,
  activeTab: "packages",
  expandedSections: {
    packages: false,
    tokens: false,
    domain: false,
    winnerpicker: false,
  },
  yourPlanExpanded: typeof window !== "undefined" && window.innerWidth >= 1024,
};
const upgradeReducer = (state: UpgradeState, action: UpgradeAction): UpgradeState => {
  switch (action.type) {
    case "SET_PACKAGE_EXTENSIONS":
      return { ...state, packageExtensions: action.payload };
    case "SET_TOKEN_PACKAGES":
      return { ...state, tokenPackages: action.payload };
    case "SET_DOMAIN_PACKAGES":
      return { ...state, domainPackages: action.payload };
    case "SET_WINNER_PICKER_PACKAGES":
      return { ...state, winnerPickerPackages: action.payload };
    case "SET_USER_PACKAGE_INFO":
      return { ...state, userPackageInfo: action.payload };
    case "SET_CURRENT_USER_PLAN":
      return { ...state, currentUserPlan: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };
    case "TOGGLE_SECTION":
      return {
        ...state,
        expandedSections: {
          ...state.expandedSections,
          [action.payload]: !state.expandedSections[action.payload],
        },
      };
    case "SET_EXPANDED_SECTIONS":
      return {
        ...state,
        expandedSections: { ...state.expandedSections, ...action.payload },
      };
    case "TOGGLE_YOUR_PLAN":
      return {
        ...state,
        yourPlanExpanded: !state.yourPlanExpanded,
      };
    default:
      return state;
  }
};
const Upgrade = memo(function Upgrade() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session } = useSession();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isPending, startTransition] = useTransition();
  const componentId = useId();
  const [state, dispatch] = useReducer(upgradeReducer, initialState);
  const deferredLoading = useDeferredValue(state.loading || isPending);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut({ redirect: false });
      router.replace("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, [router]);

  const getUserPackageInfo = useCallback(async () => {
    try {
      const res = await clientFetchApi<boolean, IFeatureInfo>("/api/psg/GetPackageFeatureDetails", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
      const currentPlan = getMockCurrentUserPlan(t, res.value.followerCount);
      dispatch({ type: "SET_CURRENT_USER_PLAN", payload: currentPlan });
      const userPackageInfo: UserPackageInfo = generateMockUserPackageInfo(t, res.value);

      dispatch({ type: "SET_USER_PACKAGE_INFO", payload: userPackageInfo });
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, [t, session]);

  const getTokenPackages = useCallback(async () => {
    try {
      if (!session) return;
      const res = await clientFetchApi<boolean, IReserveFeaturePrices[]>("/api/psg/GetReserveFeaturePrices", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
      if (res.succeeded) {
        const aiPackages = res.value.filter((x) => x.featureId === FeatureType.AI);
        const customPackage = res.value.filter((x) => x.featureId === FeatureType.CustomDomain);
        const lotteryPackage = res.value.filter((x) => x.featureId === FeatureType.Lottery);
        dispatch({ type: "SET_TOKEN_PACKAGES", payload: aiPackages });
        dispatch({ type: "SET_DOMAIN_PACKAGES", payload: customPackage });
        dispatch({
          type: "SET_WINNER_PICKER_PACKAGES",
          payload: lotteryPackage,
        });
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, [session]);
  const getPackageExtensions = useCallback(async () => {
    if (!session) return;
    try {
      const res = await clientFetchApi<boolean, IBasePackagePrice[]>("/api/psg/GetPackagePrices", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined });
      if (res.succeeded) {
        dispatch({ type: "SET_PACKAGE_EXTENSIONS", payload: res.value });
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, [session]);
  const handleTokenPurchase = useCallback(
    async (tokenPackageId: number) => {
      try {
        const res = await clientFetchApi<boolean, string>("/api/psg/GetRedirectReserveFeaturePrice", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "reserveFeatureId", value: tokenPackageId.toString() }], onUploadProgress: undefined });
        if (res.succeeded) {
          router.push(res.value);
        } else notify(res.info.responseType, NotifType.Warning);
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    },
    [session, router]
  );
  const handlePackageExtension = useCallback(
    async (monthCount: number) => {
      try {
        const res = await clientFetchApi<boolean, string>(`/api/psg/GetPackageRedirectUrl`, { methodType: MethodType.get, session: session, data: null, queries: [{ key: "monthCount", value: monthCount.toString() }], onUploadProgress: undefined });
        if (res.succeeded) router.push(res.value);
        else notify(res.info.responseType, NotifType.Warning);
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    },
    [session, router]
  );
  const winnerPickerWarningLevel = useMemo(() => {
    if (!state.userPackageInfo) return "normal";
    if (!state.userPackageInfo.lotteryPackage) return "normal";
    if (state.userPackageInfo.lotteryPackage.sliderRemainingValue === 0) return "danger";
    if (state.userPackageInfo.lotteryPackage.sliderRemainingValue === 1) return "attention";
    return "normal";
  }, [state.userPackageInfo]);

  const formatTimeRemaining = useCallback(
    (timestamp: number | null) => {
      if (timestamp === null) return "";
      const days = Math.max(0, Math.round(timestamp / (24 * 60 * 60 * 1000)));
      return `${days.toLocaleString()} ${t(LanguageKey.countdown_Days)} ${t(LanguageKey.remainingTime)} `;
    },
    [t]
  );
  const formatTokenRemaining = useCallback(
    (tokens: number | null) => {
      if (tokens === null) return "";
      const safeTokens = Math.max(0, tokens);
      return `${safeTokens.toLocaleString()} ${t(LanguageKey.Tokens)} `;
    },
    [t]
  );
  const formatNumberRemaining = useCallback(
    (tokens: number | null) => {
      if (tokens === null) return "";
      const safeNumber = Math.max(0, tokens);
      return `${safeNumber} `;
    },
    [t]
  );
  const aiTokenProgressPercentage = useMemo(() => {
    if (!state.userPackageInfo || !state.userPackageInfo.aiPackage) return 0;
    if (!state.userPackageInfo.aiPackage.sliderRemainingValue) return 100;
    return (
      (state.userPackageInfo.aiPackage.sliderRemainingValue / state.userPackageInfo.aiPackage.sliderTotalValue) * 100
    );
  }, [state.userPackageInfo]);
  const aiReserveTokenProgressPercentage = useMemo(() => {
    if (!state.userPackageInfo || !state.userPackageInfo.aiReservePackage) return 0;
    if (!state.userPackageInfo.aiReservePackage.sliderRemainingValue) return 100;
    return (
      (state.userPackageInfo.aiReservePackage.sliderRemainingValue /
        state.userPackageInfo.aiReservePackage.sliderTotalValue) *
      100
    );
  }, [state.userPackageInfo]);
  const customDomainTokenProgressPercentage = useMemo(() => {
    if (!state.userPackageInfo || !state.userPackageInfo.customDomainPackage) return 0;
    if (!state.userPackageInfo.customDomainPackage.sliderRemainingValue) return 100;
    return (
      (state.userPackageInfo.customDomainPackage.sliderRemainingValue /
        state.userPackageInfo.customDomainPackage.sliderTotalValue) *
      100
    );
  }, [state.userPackageInfo]);
  const reverseCustomDomainTokenProgressPercentage = useMemo(() => {
    if (!state.userPackageInfo || !state.userPackageInfo.customDomainReservePackage) return 0;
    if (!state.userPackageInfo.customDomainReservePackage.sliderRemainingValue) return 100;
    return (
      (state.userPackageInfo.customDomainReservePackage.sliderRemainingValue /
        state.userPackageInfo.customDomainReservePackage.sliderTotalValue) *
      100
    );
  }, [state.userPackageInfo]);
  const lotteryTokenProgressPercentage = useMemo(() => {
    if (
      !state.userPackageInfo ||
      !state.userPackageInfo.lotteryPackage ||
      state.userPackageInfo.lotteryPackage.sliderRemainingValue === null
    )
      return 0;

    const percentage =
      (state.userPackageInfo.lotteryPackage.sliderRemainingValue /
        state.userPackageInfo.lotteryPackage.sliderTotalValue) *
      100;

    return percentage;
  }, [state.userPackageInfo]);
  const reverseLotteryTokenProgressPercentage = useMemo(() => {
    if (
      !state.userPackageInfo ||
      !state.userPackageInfo.lotteryReservePackage ||
      state.userPackageInfo.lotteryReservePackage.sliderRemainingValue === null
    )
      return 0;

    const percentage =
      (state.userPackageInfo.lotteryReservePackage.sliderRemainingValue /
        state.userPackageInfo.lotteryReservePackage.sliderTotalValue) *
      100;

    return percentage;
  }, [state.userPackageInfo]);
  const packageTimeProgressPercentage = useMemo(() => {
    if (!state.userPackageInfo) return 0;
    if (state.userPackageInfo.packageRemainingTime <= 0) return 0;
    return Math.max(
      0,
      Math.min(100, (state.userPackageInfo.packageRemainingTime / state.userPackageInfo.packageTotalDuration) * 100)
    );
  }, [state.userPackageInfo]);
  const toggleSection = useCallback((section: "packages" | "tokens" | "domain" | "winnerpicker") => {
    dispatch({ type: "TOGGLE_SECTION", payload: section });
  }, []);
  const toggleYourPlan = useCallback(() => {
    dispatch({ type: "TOGGLE_YOUR_PLAN" });
  }, []);

  // Helper function to get effective percentage (checks main first, then reserve)
  const getEffectivePercentage = useCallback(
    (mainPercentage: number, reservePercentage: number | null = null): number => {
      // If main package exists and has value, use it
      if (mainPercentage > 0) {
        return mainPercentage;
      }
      // If main is empty/null and reserve exists, use reserve
      if (reservePercentage !== null && reservePercentage > 0) {
        return reservePercentage;
      }
      // If both are empty/null, return 0 (which triggers percentage < 1)
      return 0;
    },
    []
  );

  // Effective percentages for each section (main + reserve fallback)
  const effectiveAiPercentage = useMemo(
    () => getEffectivePercentage(aiTokenProgressPercentage, aiReserveTokenProgressPercentage),
    [aiTokenProgressPercentage, aiReserveTokenProgressPercentage]
  );

  const effectiveDomainPercentage = useMemo(
    () => getEffectivePercentage(customDomainTokenProgressPercentage, reverseCustomDomainTokenProgressPercentage),
    [customDomainTokenProgressPercentage, reverseCustomDomainTokenProgressPercentage]
  );

  const effectiveLotteryPercentage = useMemo(() => {
    return getEffectivePercentage(lotteryTokenProgressPercentage, reverseLotteryTokenProgressPercentage);
  }, [lotteryTokenProgressPercentage, reverseLotteryTokenProgressPercentage]);

  const getProgressBarColor = useCallback((percentage: number) => {
    if (percentage < 5) return "red";
    if (percentage < 20) return "orange";
    return "default";
  }, []);
  const getWarningMessage = useCallback(
    (percentage: number, sectionType?: "package" | "ai" | "domain" | "winnerpicker") => {
      const svgIcon = (
        <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="16" height="16">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.8 13.7a.8.8 0 0 1-1.5 0V9.4a.8.8 0 0 1 1.5 0zM9 6q0-.9 1-1 1 .1 1 1-.1.9-1 1a1 1 0 0 1-1-1m1-5.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19"
            fill="currentColor"
          />
        </svg>
      );

      if (percentage < 1) {
        let message = t(LanguageKey.subscriptionExpired);
        if (sectionType === "winnerpicker") {
          message = t(LanguageKey.winnerpickerexpired);
        } else if (sectionType === "ai") {
          message = t(LanguageKey.Aiexpired);
        }
        return (
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {svgIcon}
            {message}
          </span>
        );
      }
      if (percentage < 20) {
        let message = t(LanguageKey.subscriptionExpireSoon);
        if (sectionType === "winnerpicker") {
          message = t(LanguageKey.winnerpickerexpiresoon);
        } else if (sectionType === "ai") {
          message = t(LanguageKey.Aiexpiresoon);
        }
        return (
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {svgIcon}
            {message}
          </span>
        );
      }
      return null;
    },
    [t]
  );
  const getWarningStyle = useCallback((percentage: number) => {
    if (percentage < 5) return styles.danger;
    if (percentage < 20) return styles.attention;
    return "";
  }, []);
  const getSectionIconClass = useCallback((percentage: number) => {
    if (percentage < 5) return `${styles.sectionIcon} ${styles.danger}`;
    if (percentage < 20) return `${styles.sectionIcon} ${styles.attention}`;
    return styles.sectionIcon;
  }, []);
  const calculateOriginalPrice = useCallback((currentPrice: number, discount: number) => {
    const originalPrice = Math.round(currentPrice / (1 - discount / 100));
    return originalPrice;
  }, []);
  const getExpandIconClass = useCallback((isExpanded: boolean) => {
    return isExpanded ? styles.expandicon : `${styles.expandicon} ${styles.collapsed}`;
  }, []);
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLElement>, action: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        router.push("/home");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);
  useEffect(() => {
    if (!session || !RoleAccess(session)) return;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const loadData = async () => {
      if (controller.signal.aborted) return;
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        await Promise.all([getUserPackageInfo(), getPackageExtensions(), getTokenPackages()]);
      } catch (error) {
        if (!controller.signal.aborted) {
          notify(ResponseType.Unexpected, NotifType.Error);
        }
      } finally {
        if (!controller.signal.aborted) {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      }
    };
    startTransition(() => {
      loadData();
    });
    return () => {
      controller.abort();
      abortControllerRef.current = null;
    };
  }, [session, getUserPackageInfo, getTokenPackages, getPackageExtensions, startTransition]);

  useEffect(() => {
    if (!state.userPackageInfo) return;
    const packageProgress = packageTimeProgressPercentage;
    const tokenProgress = effectiveAiPercentage;
    const domainProgress = effectiveDomainPercentage;
    const winnerPickerProgress = effectiveLotteryPercentage;

    dispatch({
      type: "SET_EXPANDED_SECTIONS",
      payload: {
        packages: packageProgress < 20,
        tokens: tokenProgress < 20,
        domain: domainProgress < 20,
        winnerpicker: winnerPickerProgress < 20,
      },
    });
  }, [state.userPackageInfo, packageTimeProgressPercentage, effectiveAiPercentage, effectiveDomainPercentage, effectiveLotteryPercentage]);

  // مدیریت وضعیت yourPlanExpanded بر اساس عرض صفحه
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      // اگر در موبایل هستیم، فقط در بار اول بسته می‌شود
      // بعد از آن کاربر کنترل دارد
      if (isMobile && state.yourPlanExpanded && state.userPackageInfo === null) {
        dispatch({ type: "TOGGLE_YOUR_PLAN" });
      }
      // اگر به دسکتاپ برگشتیم، همیشه باز می‌شود
      else if (!isMobile && !state.yourPlanExpanded) {
        dispatch({ type: "TOGGLE_YOUR_PLAN" });
      }
    };

    handleResize(); // بررسی اولیه
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>{`Bran.cy ▸ ${t(LanguageKey.subscriptionManagement)}`}</title>
        <meta
          name="description"
          content={`${t(
            LanguageKey.subscriptionManagement
          )} - Manage your Instagram business subscription, AI tokens, custom domain, and winner picker packages`}
        />
        <meta name="theme-color" content="#2977ff" />
        <meta
          name="keywords"
          content="instagram, subscription, upgrade, AI tokens, custom domain, winner picker, package management, business tools, social media management"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/upgrade" />
        <meta property="og:title" content={`Bran.cy ▸ ${t(LanguageKey.subscriptionManagement)}`} />
        <meta
          property="og:description"
          content={`${t(
            LanguageKey.subscriptionManagement
          )} - Manage your Instagram business subscription and premium features`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.Brancy.app/upgrade" />
        <meta property="og:site_name" content="Brancy" />
        <meta property="og:image" content="https://www.Brancy.app/og-upgrade.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@BrancyApp" />
        <meta name="twitter:title" content={`Bran.cy ▸ ${t(LanguageKey.subscriptionManagement)}`} />
        <meta
          name="twitter:description"
          content={`${t(LanguageKey.subscriptionManagement)} - Manage your subscription`}
        />
      </Head>
      <div className="fullScreenPupup_bg">
        <div className="fullScreenPupup_header">
          <div className={styles.titleContainer}>{t(LanguageKey.subscriptionManagement)}</div>
          <div className={styles.buttonContainer}>
            <button
              className={styles.closeButton}
              onClick={() => router.push("/home")}
              onKeyDown={(e) => handleKeyDown(e, () => router.push("/home"))}
              aria-label={t(LanguageKey.close)}
              title={t(LanguageKey.close)}
              aria-describedby={`${componentId}-close-description`}>
              <img alt="" src="/close.svg" role="presentation" />
              <span id={`${componentId}-close-description`} className="sr-only"></span>
            </button>
            <button
              className={styles.exitButton}
              onClick={handleSignOut}
              onKeyDown={(e) => handleKeyDown(e, handleSignOut)}
              title={t(LanguageKey.signout)}
              aria-label={t(LanguageKey.signout)}>
              <svg fill="none" width="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="m19.786 12.84-3.1 3.1a.728.728 0 1 1-1.03-1.03l1.856-1.856h-6.285a.727.727 0 0 1 0-1.454h6.285l-1.856-1.855a.728.728 0 1 1 1.03-1.03l3.1 3.1a.73.73 0 0 1 0 1.024 M15.759 17.877a.767.767 0 0 1 1.308.547c0 2.177-1.73 3.226-4.208 3.226H8.208A4.213 4.213 0 0 1 4 17.441V7.208A4.213 4.213 0 0 1 8.208 3h4.651c2.46 0 4.179.694 4.179 2.913a.767.767 0 0 1-1.533 0c0-1.65-1.425-1.38-2.646-1.38H8.208a2.68 2.68 0 0 0-2.676 2.675v10.23a2.68 2.68 0 0 0 2.676 2.676h4.651c1.234 0 2.675-.095 2.675-1.695 0-.203.08-.398.225-.542"
                  fill="#fff"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          className={`${styles.fullScreenPupup_content} fullScreenPupup_content`}
          style={{
            flexDirection: "column",
            gap: "0px",
            overflow: "hidden",
            justifyContent: "flex-start",
          }}>
          {deferredLoading && <Loading />}

          {!deferredLoading && state.userPackageInfo && (
            <>
              <div className={styles.sidebar}>
                <div className="headerparent translate">
                  <div className="instagramprofile">
                    <img
                      className="instagramimage"
                      src={basePictureUrl! + session?.user.profileUrl}
                      alt={`${session?.user.username} profile`}
                      width="40"
                      height="40"
                      loading="lazy"
                    />
                    <div className="instagramprofiledetail">
                      <div className="instagramusername">{"@" + session?.user.username || ""}</div>
                      <div className="instagramid">{session?.user.fullName || ""}</div>
                    </div>
                  </div>
                  <div className="instagramprofiledetail" style={{ alignItems: "center", gap: "5px" }}>
                    <div className="title">{state.userPackageInfo.followerCount.toLocaleString()}</div>
                    <div className="instagramid">{t(LanguageKey.followercount)}</div>
                  </div>
                </div>
                <div className={styles.sidebarcontent}>
                  <div className={styles.yourplan}>
                    <div className={styles.yourplanheadertoggle} onClick={toggleYourPlan}>
                      <div className={styles.yourplanheader}>{t(LanguageKey.yourCurrentSubscription)}</div>
                      <svg
                        className={`${styles.yourplanexpandicon} ${!state.yourPlanExpanded ? styles.collapsed : ""}`}
                        width="24"
                        height="24"
                        viewBox="0 0 22 22"
                        fill="none"
                        aria-hidden="true">
                        <path stroke="var(--color-ffffff)" d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" opacity=".5" />
                        <path
                          fill="var(--color-ffffff)"
                          d="m12.2 7 .6.2q.3.6 0 1l-2.2 2.2-.1.4.1.4 2.2 2.1q.3.6 0 1-.6.5-1 0l-2.2-2a2 2 0 0 1 0-2.9l2.1-2.2z"
                        />
                      </svg>
                    </div>
                    <br />
                    {state.currentUserPlan && (
                      <>
                        <div className={styles.yourplanlevel}>
                          {t(LanguageKey.level)} {state.currentUserPlan.level} -{" "}
                          {state.currentUserPlan.model.toLowerCase()}
                        </div>
                        {/* <div className={styles.yourplanduration}>
                          {Math.round(
                            state.userPackageInfo.packageTotalDuration / 30
                          )}{" "}
                          {Math.round(
                            state.userPackageInfo.packageTotalDuration / 30
                          ) === 1
                            ? t(LanguageKey.pageTools_Month)
                            : t(LanguageKey.pageTools_Months)}
                        </div> */}
                        <div className={styles.yourplanfollowerlevel}>
                          {t(LanguageKey.followercount)} {state.currentUserPlan?.followerRange}
                        </div>

                        <div
                          className={`${styles.yourplanfeatureslist} ${!state.yourPlanExpanded ? styles.hidden : ""}`}>
                          <br />
                          {generateMockFeaturesList(t).map((feature) => {
                            const featureKey = feature.key as keyof typeof state.currentUserPlan.features;
                            const featureValue = state.currentUserPlan?.features[featureKey];

                            const isActive =
                              (typeof featureValue === "boolean" && featureValue) ||
                              (typeof featureValue === "number" && featureValue > 0);

                            return (
                              <div key={feature.key} className={styles.yourplanfeature}>
                                {isActive ? (
                                  <svg
                                    fill="none"
                                    width="14"
                                    height="14"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 14 14"
                                    aria-hidden="true">
                                    <path
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                      d="M7 .7a6.3 6.3 0 1 1 0 12.6A6.3 6.3 0 0 1 7 .7M9.7 5H9L6.2 7.8 5 6.6a.5.5 0 1 0-.7.8L6 8.9h.7l3-3q.5-.5 0-.8"
                                      fill="#fff"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    width="14"
                                    height="14"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 13 14"
                                    aria-hidden="true">
                                    <path
                                      opacity="0.5"
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                      d="M6.5.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13M4.9 4.8a.4.4 0 1 0-.6.6L5.9 7 4.3 8.6a.4.4 0 1 0 .6.6l1.6-1.6L8 9.2a.4.4 0 0 0 .6-.6L7.1 7l1.6-1.6a.4.4 0 0 0-.6-.6L6.5 6.4z"
                                      fill="#fff"
                                    />
                                  </svg>
                                )}
                                <span>
                                  {feature.label}
                                  {typeof featureValue === "number" && featureValue > 0 && `: ${featureValue}`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.contentArea}>
                {/* Section 1: Main Package */}
                <section className={styles.section}>
                  <div
                    className={styles.sectionHeader}
                    tabIndex={0}
                    aria-expanded={state.expandedSections.packages}
                    aria-controls={`${componentId}-packages-content`}
                    aria-labelledby={`${componentId}-packages-title`}>
                    <div
                      className="headerparent"
                      onClick={() => toggleSection("packages")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleSection("packages");
                        } else if (e.key === "ArrowDown") {
                          e.preventDefault();
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          nextElement?.focus();
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          const prevElement = e.currentTarget.previousElementSibling as HTMLElement;
                          prevElement?.focus();
                        }
                      }}
                      role="button">
                      <div className={styles.titlebody}>
                        <div className="title" id={`${componentId}-packages-title`}>
                          <div className={getSectionIconClass(packageTimeProgressPercentage)} />

                          {state.userPackageInfo.packageType}
                        </div>
                        {getWarningMessage(packageTimeProgressPercentage) && (
                          <span className={getWarningStyle(packageTimeProgressPercentage)}>
                            {getWarningMessage(packageTimeProgressPercentage)}
                          </span>
                        )}
                      </div>
                      <svg
                        className={getExpandIconClass(state.expandedSections.packages)}
                        width="28"
                        height="28"
                        viewBox="0 0 22 22"
                        fill="none"
                        aria-hidden="true">
                        <path stroke="var(--text-h2)" d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" opacity=".5" />
                        <path
                          fill="var(--text-h1)"
                          d="m12.2 7 .6.2q.3.6 0 1l-2.2 2.2-.1.4.1.4 2.2 2.1q.3.6 0 1-.6.5-1 0l-2.2-2a2 2 0 0 1 0-2.9l2.1-2.2z"
                        />
                      </svg>
                    </div>
                    <div className={styles.progressbody}>
                      <span className={styles.progressLabel}>{t(LanguageKey.timeperiod)} </span>
                      <div className={styles.progressContainer}>
                        <ProgressBar
                          width={packageTimeProgressPercentage}
                          color={getProgressBarColor(packageTimeProgressPercentage)}
                          aria-label="Package Time Progress"
                        />
                        <div className={styles.progressHeader}>
                          <span className={styles.progressValue}>
                            {formatTimeRemaining(state.userPackageInfo.packageRemainingTime)}
                          </span>
                          <span className={styles.progressValue}>
                            {convertMillisecondsToDays(state.userPackageInfo!.packageTotalDuration)}
                            {t(LanguageKey.countdown_Days)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`${styles.packageShop} ${!state.expandedSections.packages ? styles.hidden : ""}`}
                    id={`${componentId}-packages-content`}
                    role="region"
                    aria-labelledby={`${componentId}-packages-title`}>
                    {state.packageExtensions.length > 0 ? (
                      state.packageExtensions.map((pkg: IBasePackagePrice) => {
                        return (
                          <button
                            className={`${styles.packageOption}`}
                            key={pkg.id}
                            // disabled={pkg.disabled}
                            onClick={() => handlePackageExtension(pkg.packageMonthDuration)}
                            onKeyDown={(e) => handleKeyDown(e, () => handlePackageExtension(pkg.id))}
                            aria-label={`${pkg.packageMonthDuration} package extension`}>
                            <div className={styles.packagePrice}>
                              {pkg.discount ? (
                                <>
                                  <div className={styles.originalPrice}>
                                    <PriceFormater
                                      pricetype={pkg.priceType}
                                      fee={Math.round((pkg.price * pkg.discount) / 100)}
                                      className={PriceFormaterClassName.PostPrice}
                                    />
                                  </div>
                                  <div className={styles.discountedPrice}>
                                    <PriceFormater
                                      pricetype={pkg.priceType}
                                      fee={pkg.price}
                                      className={PriceFormaterClassName.PostPrice}
                                    />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className={styles.originalPrice}> </div>
                                  <div className={styles.discountedPrice}>
                                    <PriceFormater
                                      pricetype={pkg.priceType}
                                      fee={pkg.price}
                                      className={PriceFormaterClassName.PostPrice}
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                            <div className={styles.packageDuration}>
                              {pkg.packageMonthDuration}{" "}
                              {pkg.packageMonthDuration > 1
                                ? t(LanguageKey.pageTools_Months)
                                : t(LanguageKey.pageTools_Month)}
                              {pkg.discount && <div className={styles.discountBadge}>{pkg.discount}%</div>}
                            </div>
                            {pkg.features.map((f) => (
                              <div key={f.id} className={styles.packageTokens}>
                                {f.count} {t(LanguageKey.Tokens)} {t(LanguageKey.page9_monthly)} (
                                {t(LanguageKey.page9_freeplan)})
                              </div>
                            ))}
                          </button>
                        );
                      })
                    ) : (
                      <div className={styles.emptyStateMessage}>
                        <img
                          style={{
                            width: "38px",
                            height: "38px",
                            padding: "5px",
                          }}
                          src="/attention.svg"
                        />
                        {t(LanguageKey.noItemsAvailableContactSupport)}
                      </div>
                    )}
                  </div>
                </section>

                {/* Section 2: AI Services */}
                <section className={styles.section}>
                  <div
                    className={styles.sectionHeader}
                    tabIndex={0}
                    aria-expanded={state.expandedSections.tokens}
                    aria-controls={`${componentId}-tokens-content`}
                    aria-labelledby={`${componentId}-tokens-title`}>
                    <div
                      className="headerparent"
                      role="button"
                      onClick={() => toggleSection("tokens")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleSection("tokens");
                        } else if (e.key === "ArrowDown") {
                          e.preventDefault();
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          nextElement?.focus();
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          const prevElement = e.currentTarget.previousElementSibling as HTMLElement;
                          prevElement?.focus();
                        }
                      }}>
                      <div className={styles.titlebody}>
                        <div className="headerandinput">
                          <div className="title" id={`${componentId}-tokens-title`}>
                            <div className={getSectionIconClass(effectiveAiPercentage)} />
                            {t(LanguageKey.AIAssisment)}
                          </div>
                          <div className="explain" style={{ display: "flex", alignItems: "center" }}>
                            <img
                              src="/info.svg"
                              alt="Token information"
                              title="Token information"
                              width="15"
                              height="15"
                              style={{ marginInline: "5px", cursor: "pointer" }}
                            />
                            {t(LanguageKey.tokenExplain)}
                          </div>
                        </div>
                        {getWarningMessage(effectiveAiPercentage, "ai") && (
                          <span className={getWarningStyle(effectiveAiPercentage)}>
                            {getWarningMessage(effectiveAiPercentage, "ai")}
                          </span>
                        )}
                      </div>

                      <svg
                        className={getExpandIconClass(state.expandedSections.tokens)}
                        width="28"
                        height="28"
                        viewBox="0 0 22 22"
                        fill="none"
                        aria-hidden="true">
                        <path stroke="var(--text-h2)" d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" opacity=".5" />
                        <path
                          fill="var(--text-h1)"
                          d="m12.2 7 .6.2q.3.6 0 1l-2.2 2.2-.1.4.1.4 2.2 2.1q.3.6 0 1-.6.5-1 0l-2.2-2a2 2 0 0 1 0-2.9l2.1-2.2z"
                        />
                      </svg>
                    </div>
                    {state.userPackageInfo!.aiPackage || state.userPackageInfo!.aiReservePackage ? (
                      <>
                        {state.userPackageInfo!.aiPackage && (
                          <div className={styles.progressbody}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                              }}>
                              <span className={styles.progressLabel}>{t(LanguageKey.Tokens)} </span>
                              <Tooltip tooltipValue={t(LanguageKey.packageTokenExplain)} position="top" onClick={true}>
                                <img
                                  src="/tooltip.svg"
                                  alt="Token information"
                                  width="15"
                                  height="15"
                                  style={{ marginInline: "5px", cursor: "pointer" }}
                                />
                              </Tooltip>
                            </div>
                            <div className={styles.progressContainer}>
                              <ProgressBar
                                width={aiTokenProgressPercentage}
                                color={getProgressBarColor(aiTokenProgressPercentage)}
                                aria-label="AI Time Progress"
                              />
                              {state.userPackageInfo!.aiPackage && (
                                <div className={styles.progressHeader}>
                                  <span className={styles.progressValue}>
                                    {formatTokenRemaining(state.userPackageInfo!.aiPackage!.sliderRemainingValue!)} -{" "}
                                    {formatTimeRemaining(state.userPackageInfo!.aiPackage!.remainingTime!)}
                                  </span>

                                  <span className={styles.progressValue}>
                                    {state.userPackageInfo!.aiPackage!.sliderTotalValue.toLocaleString()}{" "}
                                    {t(LanguageKey.Tokens)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {state.userPackageInfo!.aiReservePackage && (
                          <div className={styles.progressbody}>
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <span className={styles.progressLabel}>{t(LanguageKey.ReserveToken)} </span>
                              <Tooltip tooltipValue={t(LanguageKey.ReserveTokenExplain)} position="top" onClick={true}>
                                <img
                                  src="/tooltip.svg"
                                  alt="Reserve token information"
                                  width="15"
                                  height="15"
                                  style={{ marginInline: "5px", cursor: "pointer" }}
                                />
                              </Tooltip>
                            </div>
                            <div className={styles.progressContainer}>
                              <ProgressBar
                                width={aiReserveTokenProgressPercentage}
                                color={getProgressBarColor(aiReserveTokenProgressPercentage)}
                                aria-label="AI Tokens Progress"
                              />
                              {state.userPackageInfo!.aiReservePackage && (
                                <div className={styles.progressHeader}>
                                  <span className={styles.progressValue}>
                                    {formatTokenRemaining(state.userPackageInfo.aiReservePackage.sliderRemainingValue)}
                                  </span>
                                  <span className={styles.progressValue}>
                                    {formatTimeRemaining(state.userPackageInfo!.aiReservePackage!.remainingTime!)}
                                  </span>
                                  <span className={styles.progressValue}>
                                    {state.userPackageInfo!.aiReservePackage!.sliderTotalValue!.toLocaleString()}{" "}
                                    {t(LanguageKey.Tokens)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className={styles.progressbody}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            position: "relative",
                          }}>
                          <span className={styles.progressLabel}>{t(LanguageKey.Tokens)} </span>
                        </div>
                        <div className={styles.progressContainer}>
                          <ProgressBar width={0} color="default" aria-label="AI Tokens Progress" />
                          <div className={styles.progressHeader}>
                            <span className={styles.progressValue}>0 {t(LanguageKey.Tokens)}</span>
                            <span className={styles.progressValue}>0 {t(LanguageKey.countdown_Days)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    className={`${styles.tokenShop} ${!state.expandedSections.tokens ? styles.hidden : ""}`}
                    id={`${componentId}-tokens-content`}
                    role="region"
                    aria-labelledby={`${componentId}-tokens-title`}>
                    {state.tokenPackages.length > 0 ? (
                      state.tokenPackages.map((pkg: IReserveFeaturePrices) => {
                        return (
                          <button
                            key={pkg.reserveFeatureId}
                            className={styles.packageOption}
                            onClick={() => handleTokenPurchase(pkg.reserveFeatureId)}
                            onKeyDown={(e) => handleKeyDown(e, () => handleTokenPurchase(pkg.reserveFeatureId))}
                            aria-label={`${pkg.count ? pkg.count.toLocaleString() : ""} tokens package`}>
                            <div className={styles.packagePrice}>
                              {pkg.discount ? (
                                <>
                                  <div className={styles.originalPrice}>
                                    <PriceFormater
                                      pricetype={pkg.priceType}
                                      fee={Math.round(pkg.price * (pkg.discount / 100))}
                                      className={PriceFormaterClassName.PostPrice}
                                    />
                                  </div>
                                  <div className={styles.discountedPrice}>
                                    <PriceFormater
                                      pricetype={pkg.priceType}
                                      fee={pkg.price}
                                      className={PriceFormaterClassName.PostPrice}
                                    />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className={styles.originalPrice}> </div>
                                  <div className={styles.discountedPrice}>
                                    <PriceFormater
                                      pricetype={pkg.priceType}
                                      fee={pkg.price}
                                      className={PriceFormaterClassName.PostPrice}
                                    />
                                  </div>
                                </>
                              )}
                            </div>

                            <div className={styles.packageDuration}>
                              {pkg.count && pkg.count.toLocaleString()}
                              {pkg.seconds && convertMillisecondsToDays(convertToMilliseconds(pkg.seconds))}{" "}
                              {t(LanguageKey.Tokens)}
                              {pkg.discount && <div className={styles.discountBadge}>{pkg.discount}</div>}
                            </div>
                            <div className={styles.packageTokens}>{t(LanguageKey.notimelimit)}</div>
                          </button>
                        );
                      })
                    ) : (
                      <div className={styles.emptyStateMessage}>
                        <img
                          src="/attention.svg"
                          alt="No token packages available"
                          width="38"
                          height="38"
                          style={{ padding: "5px" }}
                        />
                        {t(LanguageKey.noItemsAvailableContactSupport)}
                      </div>
                    )}
                  </div>
                </section>

                <section className={styles.section}>
                  <div
                    className={styles.sectionHeader}
                    tabIndex={0}
                    aria-expanded={state.expandedSections.domain}
                    aria-controls={`${componentId}-domain-content`}
                    aria-labelledby={`${componentId}-domain-title`}>
                    <div
                      className="headerparent"
                      role="button"
                      onClick={() => toggleSection("domain")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleSection("domain");
                        } else if (e.key === "ArrowDown") {
                          e.preventDefault();
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          nextElement?.focus();
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          const prevElement = e.currentTarget.previousElementSibling as HTMLElement;
                          prevElement?.focus();
                        }
                      }}>
                      <div className={styles.titlebody}>
                        <div className="title" id={`${componentId}-domain-title`}>
                          <div className={getSectionIconClass(effectiveDomainPercentage)} />

                          {t(LanguageKey.CustomDomain)}
                        </div>
                        {getWarningMessage(effectiveDomainPercentage) && (
                          <span className={getWarningStyle(effectiveDomainPercentage)}>
                            {getWarningMessage(effectiveDomainPercentage)}
                          </span>
                        )}
                      </div>

                      <svg
                        className={getExpandIconClass(state.expandedSections.domain)}
                        width="28"
                        height="28"
                        viewBox="0 0 22 22"
                        fill="none"
                        aria-hidden="true">
                        <path stroke="var(--text-h2)" d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" opacity=".5" />
                        <path
                          fill="var(--text-h1)"
                          d="m12.2 7 .6.2q.3.6 0 1l-2.2 2.2-.1.4.1.4 2.2 2.1q.3.6 0 1-.6.5-1 0l-2.2-2a2 2 0 0 1 0-2.9l2.1-2.2z"
                        />
                      </svg>
                    </div>
                    {state.userPackageInfo.customDomainPackage || state.userPackageInfo.customDomainReservePackage ? (
                      <>
                        {state.userPackageInfo.customDomainPackage && (
                          <div className={styles.progressbody}>
                            <span className={styles.progressLabel}>{t(LanguageKey.domain)}</span>
                            <div className={styles.progressContainer}>
                              <ProgressBar
                                width={customDomainTokenProgressPercentage}
                                color={getProgressBarColor(customDomainTokenProgressPercentage)}
                                aria-label="Domain Time Progress"
                              />
                              <div className={styles.progressHeader}>
                                <span className={styles.progressValue}>
                                  {formatTokenRemaining(
                                    state.userPackageInfo!.customDomainPackage!.sliderRemainingValue
                                  )}
                                </span>
                                <span className={styles.progressValue}>
                                  {convertMillisecondsToDays(
                                    state.userPackageInfo!.customDomainPackage!.sliderTotalValue
                                  )}
                                  {t(LanguageKey.remainingTime)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        {state.userPackageInfo.customDomainReservePackage && (
                          <div className={styles.progressbody}>
                            <span className={styles.progressLabel}>{t(LanguageKey.domain)}</span>
                            <div className={styles.progressContainer}>
                              <ProgressBar
                                width={reverseCustomDomainTokenProgressPercentage}
                                color={getProgressBarColor(reverseCustomDomainTokenProgressPercentage)}
                                aria-label="Domain Time Progress"
                              />
                              <div className={styles.progressHeader}>
                                <span className={styles.progressValue}>
                                  {formatTimeRemaining(
                                    state.userPackageInfo!.customDomainReservePackage!.sliderRemainingValue
                                  )}
                                </span>
                                <span className={styles.progressValue}>
                                  {convertMillisecondsToDays(
                                    state.userPackageInfo!.customDomainReservePackage!.sliderTotalValue
                                  )}
                                  {t(LanguageKey.countdown_Days)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className={styles.progressbody}>
                        <span className={styles.progressLabel}>{t(LanguageKey.domain)}</span>
                        <div className={styles.progressContainer}>
                          <ProgressBar width={0} color="default" aria-label="Domain Time Progress" />
                          <div className={styles.progressHeader}>
                            <span className={styles.progressValue}>
                              0 {t(LanguageKey.countdown_Days)} {t(LanguageKey.Remaining)}
                            </span>
                            <span className={styles.progressValue}>0 {t(LanguageKey.countdown_Days)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    className={`${styles.domainShop} ${!state.expandedSections.domain ? styles.hidden : ""}`}
                    id={`${componentId}-domain-content`}
                    role="region"
                    aria-labelledby={`${componentId}-domain-title`}>
                    {state.domainPackages.length > 0 ? (
                      state.domainPackages.map((pkg: IReserveFeaturePrices) => {
                        return (
                          <button
                            key={pkg.reserveFeatureId}
                            className={styles.packageOption}
                            onClick={() => handleTokenPurchase(pkg.reserveFeatureId)}
                            onKeyDown={(e) => handleKeyDown(e, () => handleTokenPurchase(pkg.reserveFeatureId))}
                            aria-label={`${pkg.seconds} domain package`}>
                            <div className={styles.packagePrice}>
                              {pkg.discount ? (
                                <>
                                  <div className={styles.originalPrice}>
                                    <PriceFormater
                                      pricetype={pkg.priceType}
                                      fee={Math.round(pkg.price * (pkg.discount / 100))}
                                      className={PriceFormaterClassName.PostPrice}
                                    />
                                  </div>
                                  <div className={styles.discountedPrice}>
                                    <PriceFormater
                                      pricetype={pkg.priceType}
                                      fee={pkg.price}
                                      className={PriceFormaterClassName.PostPrice}
                                    />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className={styles.originalPrice}> </div>
                                  <div className={styles.discountedPrice}>
                                    <PriceFormater
                                      pricetype={pkg.priceType}
                                      fee={pkg.price}
                                      className={PriceFormaterClassName.PostPrice}
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                            <div className={styles.packageDuration}>
                              {pkg.discount && <div className={styles.discountBadge}>{pkg.discount}</div>}
                            </div>
                            <div className={styles.packageTokens}> + {t(LanguageKey.CustomSupport)}</div>
                          </button>
                        );
                      })
                    ) : (
                      <div className={styles.emptyStateMessage}>
                        <img
                          src="/attention.svg"
                          alt="No domain packages available"
                          width="38"
                          height="38"
                          style={{ padding: "5px" }}
                        />
                        {t(LanguageKey.noItemsAvailableContactSupport)}
                      </div>
                    )}
                  </div>
                </section>
                {/* Section 4: Winner Picker */}
                <section className={styles.section}>
                  <div
                    className={styles.sectionHeader}
                    tabIndex={0}
                    aria-expanded={state.expandedSections.winnerpicker}
                    aria-controls={`${componentId}-winnerpicker-content`}
                    aria-labelledby={`${componentId}-winnerpicker-title`}>
                    <div
                      className="headerparent"
                      onClick={() => toggleSection("winnerpicker")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleSection("winnerpicker");
                        } else if (e.key === "ArrowDown") {
                          e.preventDefault();
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          nextElement?.focus();
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          const prevElement = e.currentTarget.previousElementSibling as HTMLElement;
                          prevElement?.focus();
                        }
                      }}
                      role="button">
                      <div className={styles.titlebody}>
                        <div className="title" id={`${componentId}-winnerpicker-title`}>
                          <div className={getSectionIconClass(effectiveLotteryPercentage)} />

                          {t(LanguageKey.WinnerPicker)}
                        </div>
                        {getWarningMessage(effectiveLotteryPercentage, "winnerpicker") && (
                          <span className={getWarningStyle(effectiveLotteryPercentage)}>
                            {getWarningMessage(effectiveLotteryPercentage, "winnerpicker")}
                          </span>
                        )}
                      </div>

                      <svg
                        className={getExpandIconClass(state.expandedSections.winnerpicker)}
                        width="28"
                        height="28"
                        viewBox="0 0 22 22"
                        fill="none"
                        aria-hidden="true">
                        <path stroke="var(--text-h2)" d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" opacity=".5" />
                        <path
                          fill="var(--text-h1)"
                          d="m12.2 7 .6.2q.3.6 0 1l-2.2 2.2-.1.4.1.4 2.2 2.1q.3.6 0 1-.6.5-1 0l-2.2-2a2 2 0 0 1 0-2.9l2.1-2.2z"
                        />
                      </svg>
                    </div>
                    {state.userPackageInfo.lotteryPackage || state.userPackageInfo.lotteryReservePackage ? (
                      <>
                        {state.userPackageInfo.lotteryPackage && (
                          <div className={styles.progressbody}>
                            <span className={styles.progressLabel}>{t(LanguageKey.WinnerPicker)}</span>
                            <div className={styles.progressContainer}>
                              <ProgressBar
                                width={lotteryTokenProgressPercentage}
                                color={getProgressBarColor(lotteryTokenProgressPercentage)}
                                aria-label="Winner Picker Progress"
                              />
                              <div className={styles.progressHeader}>
                                <span className={styles.progressValue}>
                                  {state.userPackageInfo.lotteryPackage?.sliderRemainingValue ?? 0}{" "}
                                  {t(LanguageKey.quantity)}
                                </span>
                                <span className={styles.progressValue}>
                                  {state.userPackageInfo.lotteryPackage?.sliderTotalValue ?? 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        {state.userPackageInfo.lotteryReservePackage && (
                          <div className={styles.progressbody}>
                            <span className={styles.progressLabel}>{t(LanguageKey.WinnerPickerReserve)}</span>
                            <div className={styles.progressContainer}>
                              <ProgressBar
                                width={reverseLotteryTokenProgressPercentage}
                                color={getProgressBarColor(reverseLotteryTokenProgressPercentage)}
                                aria-label="Winner Picker Progress"
                              />
                              <div className={styles.progressHeader}>
                                <span className={styles.progressValue}>
                                  {state.userPackageInfo.lotteryReservePackage?.sliderRemainingValue ?? 0}{" "}
                                  {t(LanguageKey.remainingquantity)}
                                </span>
                                {state.userPackageInfo.lotteryReservePackage?.remainingTime !== null && (
                                  <span className={styles.progressValue}>
                                    {formatTimeRemaining(state.userPackageInfo!.lotteryReservePackage!.remainingTime)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className={styles.progressbody}>
                        <span className={styles.progressLabel}>{t(LanguageKey.WinnerPicker)}</span>
                        <div className={styles.progressContainer}>
                          <ProgressBar width={0} color="default" aria-label="Winner Picker Progress" />
                          <div className={styles.progressHeader}>
                            <span className={styles.progressValue}>
                              0 {t(LanguageKey.quantity)} {t(LanguageKey.Remaining)}
                            </span>
                            <span className={styles.progressValue}>0 {t(LanguageKey.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    className={`${styles.winnerPickerShop} ${
                      !state.expandedSections.winnerpicker ? styles.hidden : ""
                    }`}
                    id={`${componentId}-winnerpicker-content`}
                    role="region"
                    aria-labelledby={`${componentId}-winnerpicker-title`}>
                    {state.winnerPickerPackages.length > 0 ? (
                      state.winnerPickerPackages.map((pkg: IReserveFeaturePrices) => {
                        return (
                          <button
                            key={pkg.reserveFeatureId}
                            className={styles.packageOption}
                            onClick={() => handleTokenPurchase(pkg.reserveFeatureId)}
                            onKeyDown={(e) => handleKeyDown(e, () => handleTokenPurchase(pkg.reserveFeatureId))}
                            aria-label={`${pkg.count} winner picker package`}>
                            <div className={styles.packagePrice}>
                              <div className="headerparent">
                                <PriceFormater
                                  pricetype={pkg.priceType}
                                  fee={pkg.price}
                                  className={PriceFormaterClassName.PostPrice}
                                />
                              </div>
                            </div>
                            <div className={styles.packageDuration}>
                              {pkg.count} {t(LanguageKey.WinnerPicker)}
                            </div>
                            <div className={styles.packageTokens}>{t(LanguageKey.notimelimit)}</div>
                          </button>
                        );
                      })
                    ) : (
                      <div className={styles.emptyStateMessage}>
                        <img
                          style={{
                            width: "38px",
                            height: "38px",
                            padding: "5px",
                          }}
                          src="/attention.svg"
                        />
                        {t(LanguageKey.noItemsAvailableContactSupport)}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
});

export default Upgrade;
