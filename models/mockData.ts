import { convertToMilliseconds } from "../helper/manageTimer";
import { LanguageKey } from "../i18n";
import { PriceType } from "../components/priceFormater";
import { FeatureType, IFeatureInfo } from "./psg/psg";

// ============================================
// INTERFACES
// ============================================

export interface PackageExtension {
  id: number;
  duration: string;
  price: number;
  priceType: PriceType;
  description: string;
  features: string[];
  includedTokens: number;
  disabled?: boolean; // For items with price 0
}

export interface PlanTier {
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
  tokensIncluded: {
    month1: number;
    month3: number;
    month6: number;
    month9: number;
    month12: number;
  };
  features: {
    hasBusiness: boolean;
    hasAI: boolean;

    hasAdvancedAnalytics: boolean;
    hasAIResponse: boolean;
    hasCustomSupport: boolean;
    hasCustomDomain: boolean;
    winnerPickerCount: number;
  };
}

export interface PlanFeature {
  key: string;
  label: string;
}

export interface UserProfileMockData {
  username: string;
  userId: string;
  followerCount: string;
  profileImage?: string;
}

export interface PaymentInfo {
  accountType: number;
  price: number;
  id: number;
  packageMonthDuration: number;
  priceType: PriceType;
  description: string;
  minFollowerCount: number;
  maxFollowerCount: number;
}

export interface TokenPackage {
  id: number;
  tokenCount: number;
  price: number;
  priceUsd: number;
  priceType: PriceType;
  description: string;
  validityDays: number;
  features?: string[];
}

export interface DomainPackage {
  id: number;
  domainType: string;
  price: number;
  priceUsd: number;
  priceType: PriceType;
  description: string;
  features: string[];
}

export interface AIPackage {
  id: number;
  name: string;
  price: number;
  priceType: PriceType;
  duration: number;
  tokenCount: number;
  description: string;
  features: string[];
}

export interface WinnerPickerPackage {
  id: number;
  count: number;
  price: number;
  priceUsd: number;
  priceType: PriceType;
  description: string;
  features?: string[];
}

export interface IPackage {
  sliderRemainingValue: number | null;
  sliderTotalValue: number;
  remainingTime: number | null;
}

export interface UserPackageInfo {
  packageRemainingTime: number;
  packageType: string;
  packageTotalDuration: number;
  packagePassedDuration: number;
  aiPackage: IPackage | null;
  aiReservePackage: IPackage | null;
  customDomainPackage: IPackage | null;
  customDomainReservePackage: IPackage | null;
  lotteryPackage: IPackage | null;
  lotteryReservePackage: IPackage | null;
  followerCount: number;
}

// ============================================
// MOCK DATA
// ============================================

export const generateMockPricingPlans = (t: (key: string) => string): PlanTier[] => [
  {
    model: t(LanguageKey.Beginner),
    level: 1,
    followerRange: "100 – 1000",
    minFollowers: 100,
    maxFollowers: 999,
    prices: { month1: 470000, month3: 0, month6: 0, month9: 0, month12: 0 },
    pricesUsd: { month1: 15, month3: 0, month6: 0, month9: 0, month12: 0 },
    tokensIncluded: { month1: 0, month3: 0, month6: 0, month9: 0, month12: 0 },
    features: {
      hasBusiness: false,
      hasAI: true,

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
    prices: {
      month1: 680000,
      month3: 1938000,
      month6: 0,
      month9: 0,
      month12: 0,
    },
    pricesUsd: { month1: 25, month3: 70, month6: 0, month9: 0, month12: 0 },
    tokensIncluded: {
      month1: 100000,
      month3: 100000,
      month6: 0,
      month9: 0,
      month12: 0,
    },
    features: {
      hasBusiness: true,
      hasAI: true,

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
    prices: {
      month1: 1260000,
      month3: 3591000,
      month6: 0,
      month9: 0,
      month12: 0,
    },
    pricesUsd: { month1: 39, month3: 110, month6: 0, month9: 0, month12: 0 },
    tokensIncluded: {
      month1: 200000,
      month3: 200000,
      month6: 0,
      month9: 0,
      month12: 0,
    },
    features: {
      hasBusiness: true,
      hasAI: true,

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
    prices: {
      month1: 1650000,
      month3: 4702500,
      month6: 8910000,
      month9: 12622500,
      month12: 15840000,
    },
    pricesUsd: {
      month1: 59,
      month3: 165,
      month6: 320,
      month9: 460,
      month12: 590,
    },
    tokensIncluded: {
      month1: 500000,
      month3: 500000,
      month6: 500000,
      month9: 500000,
      month12: 500000,
    },
    features: {
      hasBusiness: true,
      hasAI: true,

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
    prices: {
      month1: 2100000,
      month3: 5985000,
      month6: 11340000,
      month9: 16065000,
      month12: 20160000,
    },
    pricesUsd: {
      month1: 79,
      month3: 225,
      month6: 430,
      month9: 620,
      month12: 790,
    },
    tokensIncluded: {
      month1: 1000000,
      month3: 1000000,
      month6: 1000000,
      month9: 1000000,
      month12: 1000000,
    },
    features: {
      hasBusiness: true,
      hasAI: true,

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
    maxFollowers: Number.MAX_SAFE_INTEGER, // Support unlimited followers for highest tier
    prices: {
      month1: 2950000,
      month3: 8407500,
      month6: 15930000,
      month9: 22567500,
      month12: 28320000,
    },
    pricesUsd: {
      month1: 109,
      month3: 310,
      month6: 590,
      month9: 850,
      month12: 1100,
    },
    tokensIncluded: {
      month1: 5000000,
      month3: 5000000,
      month6: 5000000,
      month9: 5000000,
      month12: 5000000,
    },
    features: {
      hasBusiness: true,
      hasAI: true,

      hasAdvancedAnalytics: true,
      hasAIResponse: true,
      hasCustomSupport: true,
      hasCustomDomain: true,
      winnerPickerCount: 4,
    },
  },
];

export const generateMockFeaturesList = (t: (key: string) => string): PlanFeature[] => [
  { key: "hasBusiness", label: t(LanguageKey.startbusiness) },
  { key: "hasAI", label: t(LanguageKey.AI) },
  { key: "hasAdvancedAnalytics", label: t(LanguageKey.AdvancedAnalytics) },
  { key: "hasAIResponse", label: t(LanguageKey.AIResponse) },
  { key: "hasCustomSupport", label: t(LanguageKey.CustomSupport) },
  { key: "hasCustomDomain", label: t(LanguageKey.CustomDomain) },
  { key: "winnerPickerCount", label: t(LanguageKey.WinnerPicker) },
];

// ============================================
// MOCK DATA GENERATION FUNCTIONS
// ============================================
// These functions simulate API calls and return mock data
// Replace these with actual API calls when connecting to server

// export const generateMockUserPackageInfo = (
//   t: (key: string) => string
// ): UserPackageInfo => {
//   // Domain: 365 days purchased, 10 days remaining
//   const totalDomainDays = 365;
//   const domainDaysRemaining = 10;
//   const domainDaysPassed = totalDomainDays - domainDaysRemaining;
//   const domainPurchaseDate =
//     Date.now() - domainDaysPassed * 24 * 60 * 60 * 1000;
//   const domainExpiryTime =
//     Date.now() + domainDaysRemaining * 24 * 60 * 60 * 1000;

//   // Calculate package expire time: 365 days total, 60 days passed = 305 days remaining
//   const totalPackageDays = 365;
//   const daysPassed = 300;
//   const daysRemaining = totalPackageDays - daysPassed;
//   const packageExpireTime = Math.floor(
//     (Date.now() + daysRemaining * 24 * 60 * 60 * 1000) / 1000
//   ); // Convert to seconds

//   return {
//     packageExpireTime: packageExpireTime,
//     packageType: t(LanguageKey.mainSubscriptionPlan),
//     packageTotalDuration: totalPackageDays, // 365 days total for main package
//     aiTokensRemaining: 50, // 50 tokens remaining out of 10000
//     aiTokensTotal: 10000, // 10000 tokens purchased
//     aiExpiryTime: packageExpireTime * 1000, // Same as main package (in milliseconds)
//     aiTotalDuration: totalPackageDays, // Same as main package - 365 days
//     hasCustomDomain: true, // For demo purposes
//     domainExpiryTime: domainExpiryTime,
//     domainPurchasedDuration: Math.ceil(totalDomainDays / 30), // Convert days to months (365/30 ≈ 12 months)
//     domainPurchaseDate: domainPurchaseDate,
//     winnerPickerActive: 2, // 1 active winner picker for testing attention state
//     winnerPickerTotal: 5, // 5 total purchased
//   };
// };
export const generateMockUserPackageInfo = (t: (key: string) => string, featureInfo: IFeatureInfo): UserPackageInfo => {
  // Domain: 365 days purchased, 10 days remaining
  const totalDomainDays = convertToMilliseconds(
    featureInfo.basePackage ? featureInfo.basePackage.endUnix - featureInfo.basePackage!.beginUnix : 0
  );
  const domainDaysRemaining =
    convertToMilliseconds(featureInfo.basePackage ? featureInfo.basePackage.endUnix : Date.now()) - 0;
  const domainDaysPassed = totalDomainDays - domainDaysRemaining;
  const aiPackage = featureInfo.features.find((x) => x.featureId === FeatureType.AI)?.packageFeature;
  const aiReservePackage = featureInfo.features.find((x) => x.featureId === FeatureType.AI)?.reserveFeature;
  const customDomainPackage = featureInfo.features.find(
    (x) => x.featureId === FeatureType.CustomDomain
  )?.packageFeature;
  const customDomainReservePackage = featureInfo.features.find(
    (x) => x.featureId === FeatureType.CustomDomain
  )?.reserveFeature;
  const lotteryPackage = featureInfo.features.find((x) => x.featureId === FeatureType.Lottery)?.packageFeature;
  const lotteryReservePackage = featureInfo.features.find((x) => x.featureId === FeatureType.Lottery)?.reserveFeature;
  return {
    followerCount: featureInfo.followerCount,
    packageRemainingTime: domainDaysRemaining,
    packageType: t(LanguageKey.mainSubscriptionPlan),
    packageTotalDuration: totalDomainDays,
    packagePassedDuration: domainDaysPassed,
    aiPackage: aiPackage
      ? {
          remainingTime:
            convertToMilliseconds(aiPackage.endUnix) - Date.now() > 0
              ? convertToMilliseconds(aiPackage.endUnix) - Date.now()
              : 0,
          sliderRemainingValue: aiPackage.maxCount - aiPackage.count,
          sliderTotalValue: aiPackage.maxCount,
        }
      : null,
    customDomainPackage: customDomainPackage
      ? {
          remainingTime:
            convertToMilliseconds(customDomainPackage.endUnix) - Date.now() > 0
              ? convertToMilliseconds(customDomainPackage.endUnix) - Date.now()
              : 0,
          sliderRemainingValue: customDomainPackage.maxCount - customDomainPackage.count,
          sliderTotalValue: customDomainPackage.maxCount,
        }
      : null,
    lotteryPackage: lotteryPackage
      ? {
          remainingTime:
            convertToMilliseconds(lotteryPackage.endUnix) - Date.now() > 0
              ? convertToMilliseconds(lotteryPackage.endUnix) - Date.now()
              : 0,
          sliderRemainingValue: lotteryPackage.maxCount - lotteryPackage.count,
          sliderTotalValue: lotteryPackage.maxCount,
        }
      : null,
    aiReservePackage: aiReservePackage
      ? {
          remainingTime: aiReservePackage.unExpired
            ? null
            : convertToMilliseconds(aiReservePackage.endUnix) - Date.now() > 0
            ? convertToMilliseconds(aiReservePackage.endUnix) - Date.now()
            : 0,
          sliderRemainingValue: aiReservePackage.unLimited
            ? aiReservePackage.maxCount
            : aiReservePackage.maxCount - aiReservePackage.count,
          sliderTotalValue: aiReservePackage.maxCount,
        }
      : null,
    customDomainReservePackage: customDomainReservePackage
      ? {
          remainingTime: customDomainReservePackage.unExpired
            ? null
            : convertToMilliseconds(customDomainReservePackage.endUnix) - Date.now() > 0
            ? convertToMilliseconds(customDomainReservePackage.endUnix) - Date.now()
            : 0,
          sliderRemainingValue: customDomainReservePackage.unLimited
            ? convertToMilliseconds(customDomainReservePackage.endUnix - customDomainReservePackage.beginUnix)
            : convertToMilliseconds(customDomainReservePackage.endUnix) - Date.now() > 0
            ? convertToMilliseconds(customDomainReservePackage.endUnix) - Date.now()
            : 0,
          sliderTotalValue: convertToMilliseconds(
            customDomainReservePackage.endUnix - customDomainReservePackage.beginUnix
          ),
        }
      : null,
    lotteryReservePackage: lotteryReservePackage
      ? {
          remainingTime: lotteryReservePackage.unExpired
            ? null
            : convertToMilliseconds(lotteryReservePackage.endUnix) - Date.now() > 0
            ? convertToMilliseconds(lotteryReservePackage.endUnix) - Date.now()
            : 0,
          sliderRemainingValue: lotteryReservePackage.unLimited
            ? lotteryReservePackage.maxCount
            : lotteryReservePackage.maxCount - lotteryReservePackage.count,
          sliderTotalValue: lotteryReservePackage.maxCount,
        }
      : null,
  };
};
export const generateMockTokenPackages = (t: (key: string) => string): TokenPackage[] => {
  return [
    {
      id: 1,
      tokenCount: 5000000,
      price: 100000,
      priceUsd: 3,
      priceType: PriceType.Toman,
      description: `100 ${t(LanguageKey.Tokens)}`,
      validityDays: 0, // No expiry for tokens
    },
    {
      id: 2,
      tokenCount: 20000000,
      price: 380000,
      priceUsd: 12,
      priceType: PriceType.Toman,
      description: `500 ${t(LanguageKey.Tokens)}`,
      validityDays: 0,
      features: ["5%"],
    },
    {
      id: 3,
      tokenCount: 50000000,
      price: 450000,
      priceUsd: 14,
      priceType: PriceType.Toman,
      description: `1000 ${t(LanguageKey.Tokens)}`,
      validityDays: 0,
      features: ["10%"],
    },
    {
      id: 4,
      tokenCount: 70000000,
      price: 560000,
      priceUsd: 18,
      priceType: PriceType.Toman,
      description: `2000 ${t(LanguageKey.Tokens)}`,
      validityDays: 0,
      features: ["20%"],
    },
    {
      id: 5,
      tokenCount: 100000000,
      price: 700000,
      priceUsd: 22,
      priceType: PriceType.Toman,
      description: `3000 ${t(LanguageKey.Tokens)}`,
      validityDays: 0,
      features: ["30%"],
    },
  ];
};

export const generateMockDomainPackages = (t: (key: string) => string): DomainPackage[] => {
  return [
    {
      id: 1,
      domainType: `12 ${t(LanguageKey.pageTools_Months)}`,
      price: 6000000,
      priceUsd: 12,
      priceType: PriceType.Toman,
      description: "",
      features: [""],
    },
  ];
};

export const generateMockWinnerPickerPackages = (t: (key: string) => string): WinnerPickerPackage[] => {
  return [
    {
      id: 1,
      count: 1,
      price: 100000,
      priceUsd: 3,
      priceType: PriceType.Toman,
      description: `1 ${t(LanguageKey.WinnerPicker)}`,
    },
    {
      id: 2,
      count: 2,
      price: 200000,
      priceUsd: 6,
      priceType: PriceType.Toman,
      description: `2 ${t(LanguageKey.WinnerPicker)}`,
    },
    {
      id: 3,
      count: 3,
      price: 300000,
      priceUsd: 9,
      priceType: PriceType.Toman,
      description: `3 ${t(LanguageKey.WinnerPicker)}`,
    },
    {
      id: 4,
      count: 4,
      price: 400000,
      priceUsd: 12,
      priceType: PriceType.Toman,
      description: `4 ${t(LanguageKey.WinnerPicker)}`,
    },
    {
      id: 5,
      count: 5,
      price: 500000,
      priceUsd: 15,
      priceType: PriceType.Toman,
      description: `5 ${t(LanguageKey.WinnerPicker)}`,
    },
  ];
};

export const generateMockPackageExtensions = (
  t: (key: string) => string,
  followerCount?: number
): PackageExtension[] => {
  const currentUserPlan = getMockCurrentUserPlan(t, followerCount);

  // Discount rates for different durations
  const discountRates = {
    1: 0, // No discount for 1 month
    3: 5, // 5% discount for 3 months
    6: 10, // 10% discount for 6 months
    9: 15, // 15% discount for 9 months
    12: 20, // 20% discount for 12 months
  };

  const durations = [1, 3, 6, 9, 12];
  const packageExtensions: PackageExtension[] = [];

  durations.forEach((duration, index) => {
    const priceKey = `month${duration}` as keyof typeof currentUserPlan.prices;
    const tokensKey = `month${duration}` as keyof typeof currentUserPlan.tokensIncluded;
    const basePrice = currentUserPlan.prices[priceKey];
    const includedTokens = currentUserPlan.tokensIncluded[tokensKey];
    const discountRate = discountRates[duration as keyof typeof discountRates];
    const isDisabled = basePrice === 0;

    packageExtensions.push({
      id: index + 1,
      duration:
        duration === 1 ? `1 ${t(LanguageKey.pageTools_Month)}` : `${duration} ${t(LanguageKey.pageTools_Months)}`,
      price: basePrice,
      priceType: PriceType.Toman,
      description: "",
      features: discountRate > 0 ? [`${discountRate}%`] : [""],
      includedTokens: includedTokens,
      disabled: isDisabled,
    });
  });

  return packageExtensions;
};

// Current user plan (level 1 - Beginner as default)
// This is used by generateMockPackageExtensions to get the base prices for extensions
export const getMockCurrentUserPlan = (t: (key: string) => string, followerCount?: number): PlanTier => {
  const mockPricingPlans = generateMockPricingPlans(t);

  // If followerCount is provided, find the appropriate plan based on follower range
  if (followerCount !== undefined) {
    // Find matching plan
    let matchingPlan = mockPricingPlans.find(
      (plan) => followerCount >= plan.minFollowers && followerCount <= plan.maxFollowers
    );

    // If no exact match and follower count is very high, return the highest tier
    if (!matchingPlan && followerCount > 500000) {
      matchingPlan = mockPricingPlans.find((plan) => plan.level === 6);
    }

    // If no exact match and follower count is very low, return the lowest tier
    if (!matchingPlan && followerCount < 100) {
      matchingPlan = mockPricingPlans.find((plan) => plan.level === 1);
    }

    if (matchingPlan) {
      return matchingPlan;
    }
  }

  // Default fallback
  return mockPricingPlans.find((plan) => plan.level === 5) || mockPricingPlans[0];
};

// Convert PlanTier to PaymentInfo for compatibility with existing API structure
export const generateMockPaymentInfo = (t: (key: string) => string): PaymentInfo[] => {
  const planTiers = generateMockPricingPlans(t);
  const paymentInfos: PaymentInfo[] = [];

  planTiers.forEach((plan) => {
    // Create PaymentInfo for each duration option
    [1, 3, 6, 9, 12].forEach((duration, index) => {
      const priceKey = `month${duration}` as keyof typeof plan.prices;
      paymentInfos.push({
        id: plan.level * 10 + index + 1,
        accountType: plan.level,
        packageMonthDuration: duration,
        price: plan.prices[priceKey],
        priceType: PriceType.Toman,
        description: `${plan.model} - ${duration} ${duration === 1 ? "month" : "months"}`,
        minFollowerCount: plan.minFollowers,
        maxFollowerCount: plan.maxFollowers,
      });
    });
  });

  return paymentInfos;
};
