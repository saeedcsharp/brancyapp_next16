import { LanguageKey } from "brancy/i18n";

export type FeatureSearchItem = {
  route: string;
  labelKey: LanguageKey;
  contextKeys?: LanguageKey[];
  keywords: string[];
};

export const featureSearchIndex: FeatureSearchItem[] = [
  { route: "/home", labelKey: LanguageKey.navbar_Home, keywords: ["dashboard", "خانه", "داشبورد"] },
  {
    route: "/page/posts",
    labelKey: LanguageKey.navbar_Post,
    contextKeys: [LanguageKey.sidebar_Page],
    keywords: ["post", "posts", "پست", "انتشار پست"],
  },
  {
    route: "/page/stories",
    labelKey: LanguageKey.navbar_Story,
    contextKeys: [LanguageKey.sidebar_Page],
    keywords: ["story", "stories", "استوری"],
  },
  {
    route: "/page/ai",
    labelKey: LanguageKey.navbar_ContentCreator,
    contextKeys: [LanguageKey.sidebar_Page],
    keywords: [
      "ai",
      "content creator",
      "create image",
      "generate image",
      "image creation",
      "create video",
      "generate video",
      "video creation",
      "هوش مصنوعی",
      "تولید محتوا",
      "ایجاد عکس",
      "ساخت عکس",
      "تولید عکس",
      "ایجاد تصویر",
      "ساخت تصویر",
      "تولید تصویر",
      "ایجاد ویدیو",
      "ساخت ویدیو",
      "تولید ویدیو",
      "إنشاء صورة",
      "توليد صورة",
      "إنشاء فيديو",
      "créer image",
      "générer image",
      "créer vidéo",
      "bild erstellen",
      "bild generieren",
      "video erstellen",
      "создать изображение",
      "генерация изображения",
      "создать видео",
      "görsel oluştur",
      "resim oluştur",
      "video oluştur",
      "şəkil yarat",
      "şəkil hazırla",
      "video yarat",
    ],
  },
  {
    route: "/page/statistics",
    labelKey: LanguageKey.navbar_Statistics,
    contextKeys: [LanguageKey.sidebar_Page],
    keywords: ["analytics", "insight", "statistics", "آمار", "آنالیز", "تحلیل"],
  },
  {
    route: "/page/tools",
    labelKey: LanguageKey.pageTools_WinnerPicker,
    contextKeys: [LanguageKey.sidebar_Page, LanguageKey.navbarTools],
    keywords: [
      "lottery",
      "winner picker",
      "giveaway",
      "tools",
      "قرعه کشی",
      "قرعه‌کشی",
      "انتخاب برنده",
      "مسابقه",
      "ابزار",
    ],
  },
  {
    route: "/message/direct",
    labelKey: LanguageKey.navbar_Direct,
    contextKeys: [LanguageKey.sidebar_Message],
    keywords: ["direct", "dm", "message", "دایرکت", "پیام"],
  },
  {
    route: "/message/comments",
    labelKey: LanguageKey.navbar_Comments,
    contextKeys: [LanguageKey.sidebar_Message],
    keywords: ["comments", "reply", "کامنت", "نظر"],
  },
  {
    route: "/message/ticket",
    labelKey: LanguageKey.navbar_Ticket,
    contextKeys: [LanguageKey.sidebar_Message],
    keywords: ["ticket", "support", "تیکت", "پشتیبانی"],
  },
  {
    route: "/message/AIAndFlow",
    labelKey: LanguageKey.navbar_AIAndFlow,
    contextKeys: [LanguageKey.sidebar_Message],
    keywords: ["ai", "flow", "agent", "automation", "هوش مصنوعی", "ایجنت", "اتوماسیون"],
  },
  {
    route: "/message/properties",
    labelKey: LanguageKey.navbar_Properties,
    contextKeys: [LanguageKey.sidebar_Message],
    keywords: ["message settings", "تنظیمات پیام"],
  },
  {
    route: "/wallet/statistics",
    labelKey: LanguageKey.navbar_Statistics,
    contextKeys: [LanguageKey.sidebar_Wallet],
    keywords: ["wallet", "balance", "finance", "کیف پول", "موجودی", "مالی"],
  },
  {
    route: "/wallet/payment",
    labelKey: LanguageKey.navbar_Payment,
    contextKeys: [LanguageKey.sidebar_Wallet],
    keywords: ["payment", "card", "bank", "پرداخت", "کارت بانکی"],
  },
  {
    route: "/wallet/title",
    labelKey: LanguageKey.navbar_Title,
    contextKeys: [LanguageKey.sidebar_Wallet],
    keywords: ["invoice", "transaction", "تراکنش", "صورتحساب"],
  },
  {
    route: "/market/home",
    labelKey: LanguageKey.navbar_Home,
    contextKeys: [LanguageKey.sidebar_Market],
    keywords: ["market", "bio", "بازار", "فروشگاه لینک"],
  },
  {
    route: "/market/mylink",
    labelKey: LanguageKey.navbar_MyLink,
    contextKeys: [LanguageKey.sidebar_Market],
    keywords: ["bio link", "link", "لینک من", "لینک بیو"],
  },
  {
    route: "/market/statistics",
    labelKey: LanguageKey.navbar_Statistics,
    contextKeys: [LanguageKey.sidebar_Market],
    keywords: ["market analytics", "آمار بازار", "آمار لینک"],
  },
  {
    route: "/market/properties",
    labelKey: LanguageKey.navbar_Properties,
    contextKeys: [LanguageKey.sidebar_Market],
    keywords: ["market settings", "تنظیمات بازار", "تنظیمات لینک"],
  },
  {
    route: "/advertise/calendar",
    labelKey: LanguageKey.navbar_Calendar,
    contextKeys: [LanguageKey.sidebar_Advertise],
    keywords: ["ads", "calendar", "تبلیغات", "تقویم"],
  },
  {
    route: "/advertise/adlist",
    labelKey: LanguageKey.navbar_AdList,
    contextKeys: [LanguageKey.sidebar_Advertise],
    keywords: ["advertisement", "ads list", "لیست تبلیغات", "آگهی"],
  },
  {
    route: "/advertise/statistics",
    labelKey: LanguageKey.navbar_Statistics,
    contextKeys: [LanguageKey.sidebar_Advertise],
    keywords: ["ads analytics", "آمار تبلیغات"],
  },
  {
    route: "/store/products",
    labelKey: LanguageKey.navbar_Products,
    contextKeys: [LanguageKey.sidebar_Store],
    keywords: ["store", "product", "shop", "محصول", "فروشگاه", "کالا"],
  },
  {
    route: "/store/orders",
    labelKey: LanguageKey.navbar_Orders,
    contextKeys: [LanguageKey.sidebar_Store],
    keywords: ["order", "sale", "سفارش", "فروش"],
  },
  {
    route: "/store/statistics",
    labelKey: LanguageKey.navbar_Statistics,
    contextKeys: [LanguageKey.sidebar_Store],
    keywords: ["store analytics", "sales report", "آمار فروشگاه", "گزارش فروش"],
  },
  {
    route: "/store/properties",
    labelKey: LanguageKey.navbar_Properties,
    contextKeys: [LanguageKey.sidebar_Store],
    keywords: ["store settings", "تنظیمات فروشگاه"],
  },
  {
    route: "/setting/general",
    labelKey: LanguageKey.navbar_General,
    contextKeys: [LanguageKey.sidebar_Setting],
    keywords: ["settings", "general", "تنظیمات", "عمومی"],
  },
  {
    route: "/setting/subAdmin",
    labelKey: LanguageKey.navbar_SubAdmin,
    contextKeys: [LanguageKey.sidebar_Setting],
    keywords: ["admin", "team", "ادمین", "همکار", "دسترسی"],
  },
  {
    route: "/setting/helpcenter",
    labelKey: LanguageKey.navbar_HelpCenter,
    contextKeys: [LanguageKey.sidebar_Setting],
    keywords: ["help", "support", "راهنما", "پشتیبانی"],
  },
];

export function normalizeFeatureSearch(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\p{M}\u200c]/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function filterFeatureSearch(query: string, getLabel: (key: LanguageKey) => string) {
  const normalizedQuery = normalizeFeatureSearch(query);
  if (!normalizedQuery) return [];

  const queryParts = normalizedQuery.split(" ");
  return featureSearchIndex.filter((item) => {
    const translatedContext = item.contextKeys?.map(getLabel).join(" ") ?? "";
    const searchableText = normalizeFeatureSearch(
      `${getLabel(item.labelKey)} ${translatedContext} ${item.route} ${item.keywords.join(" ")}`,
    );
    return queryParts.every((part) => searchableText.includes(part));
  });
}
