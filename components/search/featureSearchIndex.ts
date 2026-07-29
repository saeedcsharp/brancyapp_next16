import ar from "brancy/i18n/ar";
import az from "brancy/i18n/az";
import en from "brancy/i18n/en";
import fa from "brancy/i18n/fa";
import fr from "brancy/i18n/fr";
import gr from "brancy/i18n/gr";
import { LanguageKey } from "brancy/i18n/languageKeys";
import ru from "brancy/i18n/ru";
import tr from "brancy/i18n/tr";

export type FeatureSearchItem = {
  route: string;
  labelKey: LanguageKey;
  contextKeys?: LanguageKey[];
  keywordKeys?: LanguageKey[];
  keywordGroups: FeatureSearchKeywordGroup[];
  keywords: string[];
};

type FeatureSearchLocale = "en" | "fa" | "ar" | "fr" | "gr" | "ru" | "tr" | "az";
type FeatureSearchKeywordGroup = keyof typeof localizedKeywordGroups;

const featureSearchTranslations = { en, fa, ar, fr, gr, ru, tr, az } as const;

const localizedKeywordGroups = {
  dashboard: {
    en: ["dashboard"],
    fa: ["داشبورد"],
    ar: ["لوحة التحكم"],
    fr: ["tableau de bord"],
    gr: ["übersicht"],
    ru: ["панель управления"],
    tr: ["kontrol paneli"],
    az: ["idarə paneli"],
  },
  publishing: {
    en: ["publish", "content publishing"],
    fa: ["انتشار", "انتشار محتوا"],
    ar: ["نشر", "نشر المحتوى"],
    fr: ["publier", "publication de contenu"],
    gr: ["veröffentlichen", "inhalte veröffentlichen"],
    ru: ["опубликовать", "публикация контента"],
    tr: ["yayınla", "içerik yayınlama"],
    az: ["dərc et", "məzmun dərc etmək"],
  },
  contentCreation: {
    en: ["content creator", "content creation"],
    fa: ["تولید محتوا"],
    ar: ["صانع المحتوى", "إنشاء المحتوى"],
    fr: ["créateur de contenu", "création de contenu"],
    gr: ["inhaltsersteller", "inhaltserstellung"],
    ru: ["создатель контента", "создание контента"],
    tr: ["içerik oluşturucu", "içerik oluşturma"],
    az: ["məzmun yaradıcısı", "məzmun yaratma"],
  },
  mediaCreation: {
    en: ["create image", "generate image", "create video"],
    fa: ["ساخت تصویر", "تولید عکس", "ساخت ویدیو"],
    ar: ["إنشاء صورة", "توليد صورة", "إنشاء فيديو"],
    fr: ["créer une image", "générer une image", "créer une vidéo"],
    gr: ["bild erstellen", "bild generieren", "video erstellen"],
    ru: ["создать изображение", "генерация изображения", "создать видео"],
    tr: ["görsel oluştur", "resim oluştur", "video oluştur"],
    az: ["şəkil yarat", "şəkil hazırla", "video yarat"],
  },
  analytics: {
    en: ["analytics", "insights", "statistics"],
    fa: ["آمار", "آنالیز", "تحلیل"],
    ar: ["تحليلات", "رؤى", "إحصاءات"],
    fr: ["analytique", "analyses", "statistiques"],
    gr: ["analysen", "einblicke", "statistiken"],
    ru: ["аналитика", "статистика", "анализ"],
    tr: ["analitik", "içgörüler", "istatistikler"],
    az: ["analitika", "təhlil", "statistika"],
  },
  giveaway: {
    en: ["lottery", "winner picker", "giveaway"],
    fa: ["قرعه کشی", "انتخاب برنده", "مسابقه"],
    ar: ["قرعة", "اختيار الفائز", "مسابقة"],
    fr: ["tirage au sort", "sélecteur de gagnant", "concours"],
    gr: ["verlosung", "gewinnerauswahl", "gewinnspiel"],
    ru: ["розыгрыш", "выбор победителя", "конкурс"],
    tr: ["çekiliş", "kazanan seçimi", "yarışma"],
    az: ["püşkatma", "qalib seçimi", "müsabiqə"],
  },
  artificialIntelligence: {
    en: ["ai", "artificial intelligence"],
    fa: ["هوش مصنوعی"],
    ar: ["الذكاء الاصطناعي"],
    fr: ["ia", "intelligence artificielle"],
    gr: ["ki", "künstliche intelligenz"],
    ru: ["ии", "искусственный интеллект"],
    tr: ["yapay zeka"],
    az: ["süni intellekt"],
  },
  messaging: {
    en: ["message", "messaging", "dm"],
    fa: ["پیام", "پیام رسانی"],
    ar: ["رسالة", "مراسلة"],
    fr: ["message", "messagerie"],
    gr: ["nachricht", "nachrichten"],
    ru: ["сообщение", "переписка"],
    tr: ["mesaj", "mesajlaşma"],
    az: ["mesaj", "mesajlaşma"],
  },
  comments: {
    en: ["comment", "reply"],
    fa: ["کامنت", "نظر", "پاسخ"],
    ar: ["تعليق", "رد"],
    fr: ["commentaire", "réponse"],
    gr: ["kommentar", "antwort"],
    ru: ["комментарий", "ответ"],
    tr: ["yorum", "yanıt"],
    az: ["şərh", "cavab"],
  },
  support: {
    en: ["support", "ticket"],
    fa: ["پشتیبانی", "تیکت"],
    ar: ["دعم", "تذكرة"],
    fr: ["assistance", "ticket"],
    gr: ["support", "ticket"],
    ru: ["поддержка", "тикет"],
    tr: ["destek", "bilet"],
    az: ["dəstək", "bilet"],
  },
  automation: {
    en: ["automation", "flow", "agent"],
    fa: ["اتوماسیون", "فلو", "ایجنت"],
    ar: ["أتمتة", "تدفق", "وكيل"],
    fr: ["automatisation", "flux", "agent"],
    gr: ["automatisierung", "ablauf", "agent"],
    ru: ["автоматизация", "поток", "агент"],
    tr: ["otomasyon", "akış", "ajan"],
    az: ["avtomatlaşdırma", "axın", "agent"],
  },
  settings: {
    en: ["settings", "properties"],
    fa: ["تنظیمات", "ویژگی ها"],
    ar: ["إعدادات", "خصائص"],
    fr: ["paramètres", "propriétés"],
    gr: ["einstellungen", "eigenschaften"],
    ru: ["настройки", "свойства"],
    tr: ["ayarlar", "özellikler"],
    az: ["ayarlar", "xüsusiyyətlər"],
  },
  walletFinance: {
    en: ["wallet", "balance", "finance"],
    fa: ["کیف پول", "موجودی", "مالی"],
    ar: ["محفظة", "رصيد", "مالية"],
    fr: ["portefeuille", "solde", "finance"],
    gr: ["brieftasche", "guthaben", "finanzen"],
    ru: ["кошелек", "баланс", "финансы"],
    tr: ["cüzdan", "bakiye", "finans"],
    az: ["cüzdan", "balans", "maliyyə"],
  },
  paymentBank: {
    en: ["payment", "card", "bank"],
    fa: ["پرداخت", "کارت", "بانک"],
    ar: ["دفع", "بطاقة", "بنك"],
    fr: ["paiement", "carte", "banque"],
    gr: ["zahlung", "karte", "bank"],
    ru: ["платеж", "карта", "банк"],
    tr: ["ödeme", "kart", "banka"],
    az: ["ödəniş", "kart", "bank"],
  },
  invoiceTransaction: {
    en: ["invoice", "transaction"],
    fa: ["صورتحساب", "تراکنش"],
    ar: ["فاتورة", "معاملة"],
    fr: ["facture", "transaction"],
    gr: ["rechnung", "transaktion"],
    ru: ["счет", "транзакция"],
    tr: ["fatura", "işlem"],
    az: ["faktura", "əməliyyat"],
  },
  marketBio: {
    en: ["market", "bio", "bio link"],
    fa: ["بازار", "بیو", "لینک بیو"],
    ar: ["سوق", "سيرة ذاتية", "رابط السيرة"],
    fr: ["marché", "bio", "lien bio"],
    gr: ["markt", "bio", "bio-link"],
    ru: ["рынок", "био", "ссылка в био"],
    tr: ["pazar", "biyografi", "bio bağlantısı"],
    az: ["bazar", "bio", "bio keçidi"],
  },
  links: {
    en: ["link", "my link"],
    fa: ["لینک", "لینک من"],
    ar: ["رابط", "رابطي"],
    fr: ["lien", "mon lien"],
    gr: ["link", "mein link"],
    ru: ["ссылка", "моя ссылка"],
    tr: ["bağlantı", "benim bağlantım"],
    az: ["keçid", "mənim keçidim"],
  },
  advertising: {
    en: ["advertisement", "ads"],
    fa: ["تبلیغات", "آگهی"],
    ar: ["إعلان", "إعلانات"],
    fr: ["publicité", "annonce"],
    gr: ["werbung", "anzeige"],
    ru: ["реклама", "объявление"],
    tr: ["reklam", "ilan"],
    az: ["reklam", "elan"],
  },
  storeProduct: {
    en: ["store", "shop", "product"],
    fa: ["فروشگاه", "محصول", "کالا"],
    ar: ["متجر", "منتج", "سلعة"],
    fr: ["boutique", "produit", "article"],
    gr: ["geschäft", "produkt", "artikel"],
    ru: ["магазин", "товар", "продукт"],
    tr: ["mağaza", "ürün", "mal"],
    az: ["mağaza", "məhsul", "mal"],
  },
  ordersSales: {
    en: ["order", "sale", "sales report"],
    fa: ["سفارش", "فروش", "گزارش فروش"],
    ar: ["طلب", "بيع", "تقرير المبيعات"],
    fr: ["commande", "vente", "rapport des ventes"],
    gr: ["bestellung", "verkauf", "verkaufsbericht"],
    ru: ["заказ", "продажа", "отчет о продажах"],
    tr: ["sipariş", "satış", "satış raporu"],
    az: ["sifariş", "satış", "satış hesabatı"],
  },
  general: {
    en: ["general"],
    fa: ["عمومی"],
    ar: ["عام"],
    fr: ["général"],
    gr: ["allgemein"],
    ru: ["общие"],
    tr: ["genel"],
    az: ["ümumi"],
  },
  teamAccess: {
    en: ["admin", "team", "access"],
    fa: ["ادمین", "همکار", "دسترسی"],
    ar: ["مدير", "فريق", "وصول"],
    fr: ["administrateur", "équipe", "accès"],
    gr: ["administrator", "team", "zugriff"],
    ru: ["администратор", "команда", "доступ"],
    tr: ["yönetici", "ekip", "erişim"],
    az: ["inzibatçı", "komanda", "giriş"],
  },
  help: {
    en: ["help", "guide"],
    fa: ["راهنما", "کمک"],
    ar: ["مساعدة", "دليل"],
    fr: ["aide", "guide"],
    gr: ["hilfe", "anleitung"],
    ru: ["помощь", "руководство"],
    tr: ["yardım", "rehber"],
    az: ["kömək", "bələdçi"],
  },
} satisfies Record<string, Record<FeatureSearchLocale, string[]>>;

const featureSearchDefinitions: FeatureSearchItem[] = [
  {
    route: "/home",
    labelKey: LanguageKey.navbar_Home,
    keywordGroups: ["dashboard"],
    keywords: ["dashboard", "خانه", "داشبورد"],
  },
  {
    route: "/page/posts",
    labelKey: LanguageKey.navbar_Post,
    contextKeys: [LanguageKey.sidebar_Page],
    keywordGroups: ["publishing"],
    keywords: ["post", "posts", "پست", "انتشار پست"],
  },
  {
    route: "/page/stories",
    labelKey: LanguageKey.navbar_Story,
    contextKeys: [LanguageKey.sidebar_Page],
    keywordGroups: ["publishing"],
    keywords: ["story", "stories", "استوری"],
  },
  {
    route: "/page/ai",
    labelKey: LanguageKey.navbar_ContentCreator,
    contextKeys: [LanguageKey.sidebar_Page],
    keywordGroups: ["contentCreation", "mediaCreation", "artificialIntelligence"],
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
    keywordGroups: ["analytics"],
    keywords: ["analytics", "insight", "statistics", "آمار", "آنالیز", "تحلیل"],
  },
  {
    route: "/page/tools",
    labelKey: LanguageKey.pageTools_WinnerPicker,
    contextKeys: [LanguageKey.sidebar_Page, LanguageKey.navbarTools],
    keywordGroups: ["giveaway"],
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
    route: "/page/tools",
    labelKey: LanguageKey.pageTools_EventIdeas,
    contextKeys: [LanguageKey.sidebar_Page, LanguageKey.navbarTools],
    keywordKeys: [LanguageKey.page1_artificial_intelligence],
    keywordGroups: ["artificialIntelligence"],
    keywords: ["ai", "هوش مصنوعی"],
  },
  {
    route: "/message/direct",
    labelKey: LanguageKey.navbar_Direct,
    contextKeys: [LanguageKey.sidebar_Message],
    keywordGroups: ["messaging"],
    keywords: ["direct", "dm", "message", "دایرکت", "پیام"],
  },
  {
    route: "/message/comments",
    labelKey: LanguageKey.navbar_Comments,
    contextKeys: [LanguageKey.sidebar_Message],
    keywordGroups: ["comments"],
    keywords: ["comments", "reply", "کامنت", "نظر"],
  },
  {
    route: "/message/ticket",
    labelKey: LanguageKey.navbar_Ticket,
    contextKeys: [LanguageKey.sidebar_Message],
    keywordGroups: ["support"],
    keywords: ["ticket", "support", "تیکت", "پشتیبانی"],
  },
  {
    route: "/message/AIAndFlow",
    labelKey: LanguageKey.navbar_AIAndFlow,
    contextKeys: [LanguageKey.sidebar_Message],
    keywordGroups: ["artificialIntelligence", "automation"],
    keywords: ["ai", "flow", "agent", "automation", "هوش مصنوعی", "ایجنت", "اتوماسیون"],
  },
  {
    route: "/message/properties",
    labelKey: LanguageKey.navbar_Properties,
    contextKeys: [LanguageKey.sidebar_Message],
    keywordGroups: ["messaging", "settings"],
    keywords: ["message settings", "تنظیمات پیام"],
  },
  {
    route: "/wallet/statistics",
    labelKey: LanguageKey.navbar_Statistics,
    contextKeys: [LanguageKey.sidebar_Wallet],
    keywordGroups: ["walletFinance", "analytics"],
    keywords: ["wallet", "balance", "finance", "کیف پول", "موجودی", "مالی"],
  },
  {
    route: "/wallet/payment",
    labelKey: LanguageKey.navbar_Payment,
    contextKeys: [LanguageKey.sidebar_Wallet],
    keywordGroups: ["paymentBank"],
    keywords: ["payment", "card", "bank", "پرداخت", "کارت بانکی"],
  },
  {
    route: "/wallet/title",
    labelKey: LanguageKey.navbar_Title,
    contextKeys: [LanguageKey.sidebar_Wallet],
    keywordGroups: ["invoiceTransaction"],
    keywords: ["invoice", "transaction", "تراکنش", "صورتحساب"],
  },
  {
    route: "/market/home",
    labelKey: LanguageKey.navbar_Home,
    contextKeys: [LanguageKey.sidebar_Market],
    keywordGroups: ["marketBio"],
    keywords: ["market", "bio", "بازار", "فروشگاه لینک"],
  },
  {
    route: "/market/mylink",
    labelKey: LanguageKey.navbar_MyLink,
    contextKeys: [LanguageKey.sidebar_Market],
    keywordGroups: ["marketBio", "links"],
    keywords: ["bio link", "link", "لینک من", "لینک بیو"],
  },
  {
    route: "/market/statistics",
    labelKey: LanguageKey.navbar_Statistics,
    contextKeys: [LanguageKey.sidebar_Market],
    keywordGroups: ["marketBio", "analytics"],
    keywords: ["market analytics", "آمار بازار", "آمار لینک"],
  },
  {
    route: "/market/properties",
    labelKey: LanguageKey.navbar_Properties,
    contextKeys: [LanguageKey.sidebar_Market],
    keywordGroups: ["marketBio", "settings"],
    keywords: ["market settings", "تنظیمات بازار", "تنظیمات لینک"],
  },
  {
    route: "/advertise/calendar",
    labelKey: LanguageKey.navbar_Calendar,
    contextKeys: [LanguageKey.sidebar_Advertise],
    keywordGroups: ["advertising"],
    keywords: ["ads", "calendar", "تبلیغات", "تقویم"],
  },
  {
    route: "/advertise/adlist",
    labelKey: LanguageKey.navbar_AdList,
    contextKeys: [LanguageKey.sidebar_Advertise],
    keywordGroups: ["advertising"],
    keywords: ["advertisement", "ads list", "لیست تبلیغات", "آگهی"],
  },
  {
    route: "/advertise/statistics",
    labelKey: LanguageKey.navbar_Statistics,
    contextKeys: [LanguageKey.sidebar_Advertise],
    keywordGroups: ["advertising", "analytics"],
    keywords: ["ads analytics", "آمار تبلیغات"],
  },
  {
    route: "/store/products",
    labelKey: LanguageKey.navbar_Products,
    contextKeys: [LanguageKey.sidebar_Store],
    keywordGroups: ["storeProduct"],
    keywords: ["store", "product", "shop", "محصول", "فروشگاه", "کالا"],
  },
  {
    route: "/store/orders",
    labelKey: LanguageKey.navbar_Orders,
    contextKeys: [LanguageKey.sidebar_Store],
    keywordGroups: ["ordersSales"],
    keywords: ["order", "sale", "سفارش", "فروش"],
  },
  {
    route: "/store/statistics",
    labelKey: LanguageKey.navbar_Statistics,
    contextKeys: [LanguageKey.sidebar_Store],
    keywordGroups: ["storeProduct", "ordersSales", "analytics"],
    keywords: ["store analytics", "sales report", "آمار فروشگاه", "گزارش فروش"],
  },
  {
    route: "/store/properties",
    labelKey: LanguageKey.navbar_Properties,
    contextKeys: [LanguageKey.sidebar_Store],
    keywordGroups: ["storeProduct", "settings"],
    keywords: ["store settings", "تنظیمات فروشگاه"],
  },
  {
    route: "/setting/general",
    labelKey: LanguageKey.navbar_General,
    contextKeys: [LanguageKey.sidebar_Setting],
    keywordGroups: ["settings", "general"],
    keywords: ["settings", "general", "تنظیمات", "عمومی"],
  },
  {
    route: "/setting/subAdmin",
    labelKey: LanguageKey.navbar_SubAdmin,
    contextKeys: [LanguageKey.sidebar_Setting],
    keywordGroups: ["teamAccess"],
    keywords: ["admin", "team", "ادمین", "همکار", "دسترسی"],
  },
  {
    route: "/setting/helpcenter",
    labelKey: LanguageKey.navbar_HelpCenter,
    contextKeys: [LanguageKey.sidebar_Setting],
    keywordGroups: ["help", "support"],
    keywords: ["help", "support", "راهنما", "پشتیبانی"],
  },
];

export const featureSearchIndex: FeatureSearchItem[] = featureSearchDefinitions.map((item) => {
  const translationKeys = [item.labelKey, ...(item.contextKeys ?? []), ...(item.keywordKeys ?? [])];
  const translatedKeywords = Object.values(featureSearchTranslations).flatMap((resource) =>
    translationKeys
      .map((key) => (resource.translation as Partial<Record<LanguageKey, string>>)[key])
      .filter((keyword): keyword is string => Boolean(keyword)),
  );
  const groupedKeywords = item.keywordGroups.flatMap((group) => Object.values(localizedKeywordGroups[group]).flat());

  return {
    ...item,
    keywords: [...new Set([...item.keywords, ...translatedKeywords, ...groupedKeywords])],
  };
});

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
