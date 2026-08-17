const recordsEn = {
  accountConnection: {
    title: "Instagram connection and account context",
    description:
      "Connect an Instagram account, select the active account context, and handle collaboration invitations without sharing the account password.",
  },
  homeDashboard: {
    title: "Instagramer home dashboard",
    description:
      "Brings page tiles, recent messages and comments, demographics, active stories, and post cards into one operational overview.",
  },
  postPublishing: {
    title: "Posts, carousels, and Reels publishing",
    description:
      "Create feed images, carousels, or Reels with media, captions, locations, tags, collaborators, hashtags, drafts, and publishing feedback.",
  },
  postScheduling: {
    title: "Scheduled post publishing",
    description:
      "Save a post for a future Unix time and manage the scheduled and draft content shown in the post workspace.",
  },
  storyPublishing: {
    title: "Story publishing and scheduling",
    description:
      "Create image or video Stories, add available media settings, save drafts, and publish immediately or on a planned time.",
  },
  mediaInsights: {
    title: "Post and Story insights",
    description:
      "Open an individual post or Story to inspect available metrics, replies or viewers, comments, linked products, and its auto-reply configuration.",
  },
  pageAnalytics: {
    title: "Page analytics",
    description:
      "Review engagement, followers, reach, best followers, and best or worst publishing-time analyses from the connected account.",
  },
  directInbox: {
    title: "Direct inbox",
    description:
      "Manage General, Business, and Hidden direct-message threads with search, pinning, categories, text or media replies, reactions, and downloads.",
  },
  commentInbox: {
    title: "Comment inbox",
    description:
      "Review post and Story comments by media, search their threads, change available states, and configure related auto or private replies.",
  },
  supportTickets: {
    title: "Ticket inbox and platform support",
    description:
      "Manage inbound tickets and create platform-support tickets with text, image, video, audio, pin, hide, close, and seen workflows.",
  },
  responseRules: {
    title: "Reply rules and message controls",
    description:
      "Configure general auto replies, icebreakers, persistent menus, special payloads, follower checks, and reply settings for direct conversations.",
  },
  aiFlows: {
    title: "AI prompts and visual flows",
    description:
      "Build AI prompts, connect available tools, mention the sender with a manual-prompt placeholder, analyze prompts, test conversations, and compose node-based message flows for automated interactions.",
  },
  postCaptionAi: {
    title: "AI caption generation",
    description:
      "Use the post creation workspace to request a caption suggestion from the mapped caption-generation endpoint.",
  },
  aiImageStudio: {
    title: "AI image studio",
    description:
      "Choose an available image creator and model, configure backend-defined inputs, upload references, estimate usage, create images, and inspect completed results.",
  },
  hashtagTools: {
    title: "Hashtag lists and analysis tools",
    description:
      "Create and maintain hashtag lists, inspect trend or searched hashtags, and use image or public-page hashtag analysis where the backend returns data.",
  },
  winnerPicker: {
    title: "Winner picker and lottery workflow",
    description:
      "Select eligible post content, configure lottery details, publish terms or banners, and follow the created lottery through its available statuses.",
  },
  eventIdeas: {
    title: "AI event ideas",
    description:
      "Request event-idea content in the tools workspace and keep separate backend-provided and custom idea collections.",
  },
  myLinkManagement: {
    title: "MyLink and bio feature management",
    description:
      "Manage a public bio-link presentation with ordered modules, shortcut links, profile media, announcements, contact, FAQ, channels, products, and reviews.",
  },
  customDomain: {
    title: "Custom domain for MyLink",
    description:
      "Request, cancel, connect, and verify a custom domain for the MyLink surface, including DNS status and destination-link rules.",
  },
  marketInsights: {
    title: "MyLink and link analytics",
    description:
      "Review total site behavior, individual link performance, and configured YouTube, Aparat, or Twitch activity through market analytics.",
  },
  walletAndInvoices: {
    title: "Wallet, cards, invoices, and settlement",
    description:
      "Register and set a default bank card, review invoice and sub-invoice history, request settlement, inspect read-only order details, and view balance history.",
  },
  aiModelSettings: {
    title: "AI model preferences",
    description:
      "Load available text and voice models, select model preferences, and save direct-voice support preferences when the role is permitted.",
  },
  partnerManagement: {
    title: "Partner and sub-admin management",
    description:
      "Create, update, remove, and time-limit partner accounts while assigning the built-in functional roles used by the Instagramer panel.",
  },
  productCatalog: {
    title: "Seller product catalog",
    description:
      "Import eligible Instagram posts as products, search the catalog, page through results, and change product availability or unload eligible products.",
  },
  productAuthoring: {
    title: "Product authoring",
    description:
      "Create or edit product information, categories, descriptions, specifications, media, delivery data, and product presentation details.",
  },
  variantsInventory: {
    title: "Variants and inventory",
    description:
      "Manage variant selections, individual stock, price, activation, media visibility, and supported product specifications.",
  },
  discountManagement: {
    title: "Product price and discount management",
    description:
      "Set product or variant discounts and use the catalog bulk-update workflow for supported price and discount changes.",
  },
  sellerOrders: {
    title: "Seller order fulfilment",
    description:
      "Process pending, in-progress, pickup, sent, delivered, and failed orders with accept, prepare, ship, deliver, or reject actions.",
  },
  parcelTracking: {
    title: "Parcel tracking and order detail",
    description:
      "Open a seller order to view its full detail and the parcel-log timeline returned by the shipment information endpoint.",
  },
  buyerDiscovery: {
    title: "Buyer business discovery",
    description:
      "In buyer context, browse saved products and discover businesses or shops through the available explorer and business-search endpoints.",
  },
  shopCatalog: {
    title: "Buyer shop catalog",
    description:
      "Browse a selected shop, use category, availability, price, and search controls, and open product information with comments and price history.",
  },
  favoritesAndCart: {
    title: "Favorites, variants, and cart",
    description:
      "Save products, choose available variants and quantities, and maintain seller-specific carts while respecting stock and per-cart limits.",
  },
  checkout: {
    title: "Checkout, address, logistics, and payment handoff",
    description:
      "Choose an address and logistics option, create an order, and continue to the external payment link returned by the backend.",
  },
  couponValidation: {
    title: "Checkout coupon validation",
    description:
      "Validate a product coupon during checkout; the returned contract includes its expiry, usage, ownership, and discount fields.",
  },
  buyerOrders: {
    title: "Buyer order history and support",
    description:
      "Follow orders by queue, progress, pickup, sent, delivered, or failed status, with buyer cancellation where that workflow is available.",
  },
  advertiserEnrollment: {
    title: "Advertiser authorization",
    description:
      "Start the advertiser authorization flow after the required authorization level and user-type checks have been completed.",
  },
  advertiserDirectory: {
    title: "Advertiser directory search",
    description:
      "In buyer context, search the paginated advertiser business directory and inspect the listed business name, account, banner, and follower count.",
  },
  accountTagging: {
    title: "Account lookup for ad content tagging",
    description:
      "Search Instagram accounts from the customer-ad content composer and use the selected account in its available tagging context.",
  },
  accountSwitching: {
    title: "Multi-account switching and invitations",
    description:
      "Switch the selected Instagram account context and approve or reject partner collaboration invitations from the account switcher.",
  },
  languageTheme: {
    title: "Language, direction, calendar, and theme settings",
    description:
      "Select one of the configured languages, an available calendar, and light or dark theme preferences in the system settings surface.",
  },
  subscriptionAccess: {
    title: "Subscription and feature-access management",
    description:
      "Load package and reserve-feature pricing from the backend and continue to the backend-provided payment redirect for an eligible purchase.",
  },
  advertisingLifecyclePrototype: {
    title: "Advertising calendar, lists, and reports",
    description:
      "These routes exist, but their visible data and actions are locally seeded or marked with API placeholders. They are not documented as a live campaign lifecycle.",
  },
  customerAdsPrototype: {
    title: "Customer Ads campaign builder",
    description:
      "The multi-step customer-ad UI and related models are present, but selection, cart, coupon, payment, and publishing states are locally driven rather than mapped to a lifecycle API.",
  },
  storePropertiesPrototype: {
    title: "Store properties and logistics configuration",
    description:
      "The route contains store settings controls, but its save behavior is local and marked with TODO API comments. Separate authorization endpoints exist without a confirmed routed seller setup flow.",
  },
  storeReportsPrototype: {
    title: "Store sales and buyer CRM report",
    description:
      "The statistics route renders seeded sales and buyer-report data without an active reporting API call, so it remains an audit item.",
  },
  myLinkCouponPrototype: {
    title: "MyLink coupon display",
    description:
      "The displayed coupon code and countdown are static presentation data with clipboard copy only; no promotion endpoint or checkout effect is wired.",
  },
  videoCreationIncomplete: {
    title: "AI video creation",
    description:
      "Video-creator discovery appears in the image workspace, but the create action and usage call are incomplete or unmapped. Do not present video generation as an active feature.",
  },
  marketHomePrototype: {
    title: "Market home",
    description:
      "The market-home route renders hard-coded entries and has no backend fetch, so it is not documented as a live marketplace discovery capability.",
  },
  buyerFinanceStubs: {
    title: "Buyer wallet and payment-status routes",
    description:
      "Buyer wallet and order/ad payment-status routes exist as text or presentation shells without a connected wallet or payment-status workflow.",
  },
  messagingDownloadStubs: {
    title: "Telegram and WhatsApp download prompts",
    description:
      "These message routes prompt downloads only; no Telegram or WhatsApp account connection or messaging API is wired.",
  },
};

export const featureKnowledgeEn = {
  title: "Brancy Features",
  subtitle:
    "An evidence-backed feature reference for content planning, training, and promotion. Availability reflects the current frontend source and does not invent backend business rules.",
  verifiedCaption: "Source-audited catalog",
  featureCount: "{{count}} verified features",
  overview: "Feature overview",
  totalFeatures: "Verified features",
  instagramerFeatures: "Instagramer",
  shopperFeatures: "Shopper",
  advertiserFeatures: "Advertiser",
  sharedFeatures: "Multi-role",
  aiFeatures: "AI-related",
  freeFeatures: "Confirmed free",
  paidFeatures: "Entitlement-controlled",
  roleNavigation: "Role navigation",
  filters: "Explore the catalog",
  search: "Search features",
  searchPlaceholder: "Search Direct, checkout, custom domain...",
  category: "Category",
  access: "Access",
  all: "All",
  clearFilters: "Clear filters",
  results: "{{count}} matching features",
  noResults: "No evidence-backed feature matches these filters.",
  columns: {
    feature: "Feature / option",
    description: "Short description",
    role: "Role",
    status: "Access status",
    details: "Details",
  },
  sort: {
    label: "Sort",
    title: "Feature name",
    category: "Category",
    access: "Access",
    ascending: "Ascending",
    descending: "Descending",
  },
  expand: "Show full feature details",
  collapse: "Hide full feature details",
  detail: {
    problem: "What it helps with",
    usage: "How to use it",
    prerequisites: "Prerequisites",
    access: "Access and cost",
    limitation: "Known limit or rule",
    contentIdea: "Content-team angle",
    evidence: "Evidence in source",
    route: "Start from this path and follow the controls for this feature.",
    noPrerequisites: "No frontend prerequisite was identified.",
    sourceNote: "This entry is included only because the indicated implementation evidence exists in the repository.",
  },
  role: {
    instagramer: "Instagramer",
    shopper: "Shopper",
    advertiser: "Advertiser",
  },
  categoryLabels: {
    account: "Account and access",
    content: "Content publishing",
    analytics: "Analytics",
    messaging: "Messages and support",
    automation: "Automation and tools",
    ai: "Artificial intelligence",
    market: "MyLink and market",
    finance: "Wallet and access",
    commerce: "Commerce and catalog",
    orders: "Orders and checkout",
    advertising: "Advertising",
    settings: "Settings and security",
  },
  accessLabels: {
    free: "Confirmed free in frontend",
    package: "Active subscription required",
    feature: "Specific feature entitlement required",
    token: "AI entitlement or token usage",
    role: "Role or account-context controlled",
    verification: "Authorization or verification required",
    unknown: "Needs Business Logic review",
  },
  accessFilters: {
    free: "Free",
    paid: "Paid / entitlement",
    subscription: "Subscription",
    token: "Token / AI",
    required: "Role / verification",
  },
  prerequisite: {
    instagramConnection: "Connected Instagram account",
    activePackage: "Active package",
    pagePermission: "PageView role or page permission",
    messagePermission: "Message role and message permission",
    commentPermission: "Comment role and comment permission",
    insightPermission: "Insight permission",
    automaticRole: "Automatics role",
    bioRole: "Bio role",
    productRole: "Products role",
    orderRole: "Orders role",
    shopperAccount: "Shopper account",
    buyerMode: "Buyer context (no selected Instagramer)",
    featureAi: "AI feature entitlement",
    featureLottery: "Lottery feature entitlement",
    featureDomain: "Custom-domain feature entitlement",
    authorization: "Backend authorization checks",
    payment: "Backend payment handoff",
    bankCard: "Registered bank card where required",
  },
  limitation: {
    backendDefined: "Exact quotas and eligibility are enforced by backend responses",
    noFrontendLimit: "No numeric frontend limit was identified.",
    partnerLimit: "The partner form caps the client-side list at 15; backend enforcement remains authoritative.",
    persistentMenu: "The persistent-menu interface caps its buttons at five.",
    domain:
      "Client validation allows one registrable domain: maximum 253 characters, labels up to 63, alphabetic TLD length 2-63; cooldown is 300 seconds.",
    bankCard: "Bank-card registration normalizes and accepts exactly 16 digits in the frontend.",
    discount: "The discount editor limits percentage discounts to 1-80 in the frontend.",
    discountUsage: "A limited discount-use count is constrained to 1-1000 in the frontend.",
    productSpecification:
      "Custom product specification keys and values are capped at 200 and 1000 characters respectively.",
    backendFeature:
      "Availability depends on backend feature count, time, and entitlement checks; no price or quantity is invented here.",
    prototype: "This route is retained for audit visibility only and is not presented as a live capability.",
  },
  contentIdea: {
    tutorial: "Tutorial: show the route, the setup decisions, and the visible outcome.",
    demo: "Product demo: contrast the manual task with the resulting workspace or report.",
    problemSolution: "Problem / solution: start with the operational friction the workspace reduces.",
    featureAnnouncement: "Feature introduction: explain who benefits and identify the evidence-backed prerequisite.",
    comparison: "Comparison: contrast available options or statuses without promising unavailable outcomes.",
    workflow: "Workflow Reel: present the real sequence from setup through the next action.",
  },
  evidence: {
    route: "Route",
    component: "Component",
    api: "API",
    permission: "Permission guard",
    enum: "Enum or typed contract",
    translation: "Translation or UI label",
  },
  audit: {
    title: "Coming soon",
    description: "",
    status: "under construction",
    route: "Observed route",
  },
  records: recordsEn,
};

export const featureKnowledgeFa = {
  ...featureKnowledgeEn,
  title: "قابلیت‌های برنسی",
  subtitle:
    "اینجا همه قابلیت‌های برنسی را ساده و روشن معرفی کرده‌ایم تا راحت‌تر برای محتوا، آموزش و معرفی محصول از آن‌ها استفاده کنید.",
  verifiedCaption: "فهرست قابلیت‌های بررسی‌شده",
  featureCount: "{{count}} قابلیت فعال",
  overview: "خلاصه قابلیت‌ها",
  totalFeatures: "قابلیت‌های فعال",
  instagramerFeatures: "ادمین اینستاگرم",
  shopperFeatures: "فروشنده",
  advertiserFeatures: "تبلیغ‌کننده",
  sharedFeatures: "برای چند نقش",
  aiFeatures: "هوش مصنوعی",
  freeFeatures: "رایگان",
  paidFeatures: "نیازمند دسترسی",
  roleNavigation: "من چه نقشی دارم؟",
  filters: "پیدا کردن قابلیت‌ها",
  search: "جست‌وجوی قابلیت",
  searchPlaceholder: "مثلاً دایرکت، پرداخت، دامنه اختصاصی...",
  category: "دسته‌بندی",
  access: "دسترسی",
  all: "همه",
  clearFilters: "پاک کردن فیلترها",
  results: "{{count}} قابلیت پیدا شد",
  noResults: "با این فیلترها چیزی پیدا نشد.",
  columns: {
    feature: "قابلیت",
    description: "خلاصه",
    role: "نقش",
    status: "دسترسی",
    details: "بیشتر بدانید",
  },
  sort: {
    label: "مرتب‌سازی",
    title: "نام قابلیت",
    category: "دسته‌بندی",
    access: "دسترسی",
    ascending: "صعودی",
    descending: "نزولی",
  },
  expand: "نمایش جزئیات کامل قابلیت",
  collapse: "بستن جزئیات کامل قابلیت",
  detail: {
    problem: "توضیح قابلیت",
    usage: "چطور استفاده کنیم؟",
    prerequisites: "قبلش چی لازم داریم؟",
    access: "دسترسی و هزینه",
    limitation: "نکته یا محدودیت",
    contentIdea: "ایده برای محتوا",
    evidence: "از کجا مطمئن شدیم؟",
    route: "از مسیر زیر وارد شوید و از همان‌جا شروع کنید:",
    noPrerequisites: "چیز خاصی لازم نیست.",
    sourceNote: "این قابلیت در کد برنامه دیده و بررسی شده است.",
  },
  role: {
    instagramer: "ادمین اینستاگرم",
    shopper: "فروشنده",
    advertiser: "تبلیغ‌کننده",
  },
  categoryLabels: {
    account: "حساب کاربری",
    content: "انتشار محتوا",
    analytics: "آمار و گزارش",
    messaging: "دایرکت ها و کامنت ها",
    automation: "ابزارهای خودکار",
    ai: "هوش مصنوعی",
    market: "مای‌لینک و بازار",
    finance: "کیف پول و پرداخت",
    commerce: "فروش و کاتالوگ",
    orders: "سفارش و خرید",
    advertising: "تبلیغات",
    settings: "تنظیمات و امنیت",
  },
  accessLabels: {
    free: "رایگان است",
    package: "اشتراک ماهانه لازم است",
    feature: "باید این قابلیت را فعال کنید",
    token: "به اعتبار هوش مصنوعی نیاز دارد",
    role: "به نقش یا حساب شما بستگی دارد",
    verification: "تأیید هویت لازم است",
    unknown: "هنوز باید بررسی شود",
  },
  accessFilters: {
    free: "رایگان",
    paid: "پولی یا نیازمند دسترسی",
    subscription: "اشتراک",
    token: "اعتبار هوش مصنوعی",
    required: "نقش یا تأیید هویت",
  },
  prerequisite: {
    instagramConnection: "حساب اینستاگرام وصل باشد",
    activePackage: "اشتراک فعال",
    pagePermission: "اجازه دسترسی به صفحه",
    messagePermission: "اجازه مدیریت پیام‌ها",
    commentPermission: "اجازه مدیریت کامنت ها",
    insightPermission: "اجازه دیدن آمار",
    automaticRole: "دسترسی ابزارهای خودکار",
    bioRole: "دسترسی معرفی‌نامه",
    productRole: "دسترسی محصولات",
    orderRole: "دسترسی سفارش‌ها",
    shopperAccount: "حساب فروشنده",
    buyerMode: "حالت خریدار، بدون انتخاب ادمین اینستاگرم",
    featureAi: "قابلیت هوش مصنوعی فعال باشد",
    featureLottery: "قابلیت قرعه‌کشی فعال باشد",
    featureDomain: "قابلیت دامنه اختصاصی فعال باشد",
    authorization: "تأیید هویت توسط سامانه",
    payment: "پرداخت از راه سامانه",
    bankCard: "کارت بانکی ثبت‌شده، اگر لازم باشد",
  },
  limitation: {
    backendDefined: "تعداد و شرایط دقیق هوشمند مشخص میشود.",
    noFrontendLimit: "محدودیت عددی خاصی پیدا نشد.",
    partnerLimit: "در فرم همکار می‌شود حداکثر ۱۵ نفر اضافه کرد.",
    persistentMenu: "منوی پایدار حداکثر پنج دکمه دارد.",
    domain: "دامنه باید معتبر باشد؛ حداکثر ۲۵۳ نویسه و هر بخش حداکثر ۶۳ نویسه. فاصله بررسی دوباره هم ۳۰۰ ثانیه است.",
    bankCard: "شماره کارت باید ۱۶ رقم باشد.",
    discount: "درصد تخفیف از ۱ تا ۸۰ است.",
    discountUsage: "تعداد استفاده از تخفیف می‌تواند از ۱ تا ۱۰۰۰ باشد.",
    productSpecification: "نام مشخصه محصول حداکثر ۲۰۰ و مقدار آن حداکثر ۱۰۰۰ نویسه است.",
    backendFeature: "فعال‌بودن این قابلیت به وضعیت حساب و اشتراک شما بستگی دارد.",
    prototype: "این بخش هنوز کامل نیست و فقط برای بررسی نگه داشته شده است.",
  },
  contentIdea: {
    tutorial: "آموزش: قدم‌به‌قدم نشان دهید از کجا شروع کنیم و آخرش چه می‌شود.",
    demo: "نمایش واقعی: کار سخت قبلی را با نتیجه جدید مقایسه کنید.",
    problemSolution: "مسئله و راه‌حل: اول مشکل روزمره را بگویید، بعد راه‌حل را نشان دهید.",
    featureAnnouncement: "معرفی قابلیت: بگویید این قابلیت به درد چه کسی می‌خورد.",
    comparison: "مقایسه: گزینه‌ها را ساده کنار هم بگذارید و وعده الکی ندهید.",
    workflow: "ویدئوی فرایند: مسیر کار را از شروع تا نتیجه نشان دهید.",
  },
  evidence: {
    route: "صفحه برنامه",
    component: "بخش برنامه",
    api: "ارتباط با سامانه",
    permission: "قانون دسترسی",
    enum: "نوع داده",
    translation: "ترجمه یا نوشته صفحه",
  },
  audit: {
    title: "به‌زودی",
    description: "",
    status: "در حال ساخت",
    route: "صفحه پیدا‌شده",
  },
  records: {
    ...recordsEn,
    accountConnection: {
      title: "اتصال اینستاگرام و حساب",
      description:
        "اینستاگرامتان را وصل کنید، حساب فعال را انتخاب کنید و دعوت‌های همکاری را بدون دادن رمز مدیریت کنید.",
      descriptionDetail:
        "اینستاگرامتان را به برنسی وصل کنید، حسابی را که می‌خواهید مدیریت کنید انتخاب کنید و وضعیت اتصال را ببینید. از همین بخش می‌توانید دعوت‌های همکاری را بررسی و قبول یا رد کنید، بدون اینکه لازم باشد رمز حساب را در اختیار کسی بگذارید.",
    },
    homeDashboard: {
      title: "صفحه اصلی ادمین اینستاگرم",
      description: "پیام‌ها، کامنت ها، آمار، استوری‌های فعال و پست‌ها را یک‌جا ببینید.",
      descriptionDetail:
        "در صفحه اصلی، یک نمای سریع از پیام‌ها، کامنت ها، آمار، استوری‌های فعال و پست‌ها دارید. اینجا کمک می‌کند قبل از ورود به هر بخش بفهمید چه چیزی نیاز به پاسخ، بررسی یا پیگیری دارد و سریع‌تر به کار مهم‌تر برسید.",
    },
    postPublishing: {
      title: "ساخت و انتشار پست",
      description: "پست عکس، چندعکسی یا ویدیوی کوتاه بسازید و برایش متن، مکان، برچسب و همکار اضافه کنید.",
      descriptionDetail:
        "پست عکس، چندعکسی یا ویدیوی کوتاه بسازید، رسانه‌ها را مرتب کنید و پیش از انتشار نتیجه را بررسی کنید. می‌توانید متن، مکان، برچسب، هشتگ و همکار را اضافه کنید و در صورت آماده نبودن، محتوا را به‌عنوان پیش‌نویس نگه دارید.",
    },
    postScheduling: {
      title: "انتشار زمان‌بندی‌شده پست",
      description: "پست را برای زمان دلخواه آماده کنید تا خودش منتشر شود.",
      descriptionDetail:
        "پست را کامل کنید و به‌جای انتشار فوری، زمان دلخواه را برای انتشار مشخص کنید. محتوای زمان‌بندی‌شده و پیش‌نویس‌ها از فضای پست‌ها قابل پیگیری هستند تا بدانید چه چیزی منتظر انتشار است و چه چیزی هنوز نیاز به ویرایش دارد.",
    },
    storyPublishing: {
      title: "ساخت و زمان‌بندی استوری",
      description: "استوری عکس یا ویدیو بسازید، ذخیره‌اش کنید و همان لحظه یا بعداً منتشرش کنید.",
      descriptionDetail:
        "استوری عکس یا ویدیو بسازید و تنظیمات رسانه را تا جایی که حساب و سامانه اجازه می‌دهد انجام دهید. می‌توانید آن را همان لحظه منتشر کنید، برای زمان دیگری زمان‌بندی کنید یا به‌صورت پیش‌نویس نگه دارید تا بعداً ادامه‌اش دهید.",
    },
    mediaInsights: {
      title: "آمار پست و استوری",
      description: "ببینید هر پست یا استوری چقدر دیده شده، چه واکنشی گرفته و چه کامنت هایی دارد.",
      descriptionDetail:
        "با باز کردن جزئیات هر پست یا استوری، آمار و واکنش‌های ثبت‌شده را بررسی کنید. بسته به داده‌ای که از حساب برمی‌گردد، می‌توانید بازدید، پاسخ‌ها، بیننده‌ها، کامنت ها، محصول مرتبط و تنظیمات پاسخ خودکار همان محتوا را یک‌جا ببینید.",
    },
    pageAnalytics: {
      title: "آمار صفحه",
      description: "رشد صفحه، دنبال‌کننده‌ها و بهترین زمان انتشار را راحت بررسی کنید.",
      descriptionDetail:
        "روند رشد صفحه و وضعیت دنبال‌کننده‌ها را در بازه‌های قابل بررسی دنبال کنید. این بخش کمک می‌کند میزان تعامل و دسترسی را بهتر بفهمید و از تحلیل بهترین یا ضعیف‌ترین زمان انتشار برای برنامه‌ریزی محتوای بعدی استفاده کنید.",
    },
    directInbox: {
      title: "صندوق  دایرکت ها",
      description: "همه گفت‌وگوهایتان را پیدا کنید، دسته‌بندی کنید، سنجاق کنید و جواب بدهید.",
      descriptionDetail:
        "گفت‌وگوهای دایرکت را در بخش‌های عمومی، کاری و پنهان پیدا و جست‌وجو کنید. گفت‌وگوهای مهم را دسته‌بندی یا سنجاق کنید، پیام متنی یا رسانه‌ای بفرستید، واکنش نشان دهید و پاسخ‌های قبلی را برای پیگیری بهتر کنار هم داشته باشید.",
    },
    commentInbox: {
      title: "صندوق کامنت ها",
      description: "کامنت های پست و استوری را یک‌جا ببینید، جست‌وجو کنید و جواب خودکار یا خصوصی تنظیم کنید.",
      descriptionDetail:
        "کامنت های پست و استوری را بر اساس محتوای مربوط به آن‌ها یک‌جا ببینید و بین گفت‌وگوها جست‌وجو کنید. سپس می‌توانید وضعیت کامنت را مدیریت کنید و برای پاسخ عمومی، خودکار یا خصوصی، گزینه مناسب را تنظیم کنید.",
    },
    supportTickets: {
      title: "درخواست پشتیبانی",
      description: "درخواست‌های پشتیبانی را پیگیری کنید و همراهشان متن، عکس، ویدیو یا صدا بفرستید.",
      descriptionDetail:
        "درخواست‌های پشتیبانی را از زمان ایجاد تا بسته‌شدن دنبال کنید و برای توضیح بهتر، متن، عکس، ویدیو یا صدا بفرستید. امکان سنجاق‌کردن، پنهان‌کردن و علامت‌زدن وضعیت دیده‌شدن هم کمک می‌کند درخواست‌های مهم را گم نکنید.",
    },
    responseRules: {
      title: "قوانین پاسخ به پیام",
      description: "برای پیام‌ها جواب خودکار، شروع‌کننده گفت‌وگو و منوی آماده بسازید.",
      descriptionDetail:
        "برای مدیریت پیام‌های تکراری، جواب خودکار و شروع‌کننده گفت‌وگو بسازید و منوی آماده در اختیار مخاطب بگذارید. می‌توانید قوانین پاسخ، بررسی دنبال‌کردن حساب و تنظیمات مربوط به هر گفت‌وگو را هماهنگ کنید تا پاسخ‌گویی منظم‌تر شود.",
    },
    aiFlows: {
      title: "دستورها و جریان‌های هوش مصنوعی",
      description: "با هوش مصنوعی گفت‌وگو بسازید، ابزار اضافه کنید و روند پاسخ‌گویی را تنظیم کنید.",
      descriptionDetail:
        "برای پاسخ‌گویی هوشمند، دستورهای دلخواهتان را بنویسید و ابزارهای در دسترس را به آن‌ها وصل کنید. گفت‌وگو را آزمایش کنید و با کنار هم گذاشتن مرحله‌ها، روندی بسازید که پاسخ‌ها و مسیر تعامل با مخاطب را منظم‌تر و قابل کنترل‌تر کند.",
    },
    postCaptionAi: {
      title: "نوشتن متن پست با هوش مصنوعی",
      description: "از هوش مصنوعی بخواهید برای پستتان متن پیشنهادی بنویسد.",
      descriptionDetail:
        "در فضای ساخت پست، موضوع یا اطلاعات اصلی محتوا را وارد کنید و از هوش مصنوعی بخواهید متن پیشنهادی بسازد. متن تولیدشده نقطه شروعی برای ویرایش لحن، اضافه‌کردن جزئیات و آماده‌سازی کپشن نهایی است، نه جایگزین بررسی شما.",
    },
    aiImageStudio: {
      title: "ساخت تصویر با هوش مصنوعی",
      description: "مدل تصویر را انتخاب کنید، تنظیمات را انجام دهید و تصویر جدید بسازید.",
      descriptionDetail:
        "مدل تصویر و سازنده موردنظر را انتخاب کنید، ورودی‌های لازم را تنظیم کنید و در صورت نیاز تصویر مرجع بفرستید. پیش از ساخت می‌توانید برآورد مصرف را ببینید و بعد از پایان فرایند، تصویر تولیدشده و اطلاعات مربوط به آن را بررسی یا دریافت کنید.",
    },
    hashtagTools: {
      title: "ابزار برچسب موضوعی",
      description: "برچسب‌های موضوعی را پیدا و دسته‌بندی کنید و ببینید کدام‌ها بیشتر دیده می‌شوند.",
      descriptionDetail:
        "برای پیدا کردن برچسب مناسب، فهرست‌های خودتان را بسازید و برچسب‌های جست‌وجوشده یا پرطرفدار را بررسی کنید. تحلیل تصویر یا صفحه عمومی، وقتی داده‌اش در دسترس باشد، کمک می‌کند برچسب‌ها را موضوعی‌تر انتخاب و برای محتوای بعدی مرتب کنید.",
    },
    winnerPicker: {
      title: "انتخاب برنده و قرعه‌کشی",
      description:
        "پست یا محتوایی را که می‌خواهید قرعه‌کشی روی آن انجام شود انتخاب کنید، شرط‌های شرکت و زمان قرعه‌کشی را مشخص کنید، قوانین یا بنر معرفی را منتشر کنید و بعد وضعیت قرعه‌کشی و برنده را از همین بخش دنبال کنید.",
      descriptionDetail:
        "پست یا محتوایی را که می‌خواهید قرعه‌کشی روی آن انجام شود انتخاب کنید و شرط‌های شرکت، زمان اجرا و جزئیات رویداد را مشخص کنید. بعد می‌توانید قوانین یا بنر معرفی را منتشر کنید و از همین بخش وضعیت قرعه‌کشی، روند انتخاب و نتیجه برنده را تا پایان دنبال کنید.",
    },
    eventIdeas: {
      title: "ایده رویداد با هوش مصنوعی",
      description: "برای رویدادتان از هوش مصنوعی ایده بگیرید و ایده‌های خودتان را هم کنارشان نگه دارید.",
      descriptionDetail:
        "موضوع و حال‌وهوای رویدادتان را مشخص کنید و از هوش مصنوعی ایده‌های قابل استفاده بگیرید. ایده‌های تولیدشده را کنار ایده‌های خودتان نگه دارید تا بتوانید آن‌ها را مقایسه، انتخاب و برای برنامه‌ریزی رویداد آماده کنید.",
    },
    myLinkManagement: {
      title: "مدیریت مای‌لینک و معرفی‌نامه",
      description: "صفحه معرفی خودتان را با لینک‌ها، عکس، اطلاعیه، راه‌های تماس، محصولات و کامنت ها بچینید.",
      descriptionDetail:
        "صفحه معرفی مای‌لینک را با عکس و اطلاعات پروفایل، لینک‌های مهم و اطلاعیه‌های تازه مرتب کنید. راه‌های تماس، کانال‌ها، پرسش‌های متداول، محصولات و کامنت ها را هم اضافه یا مدیریت کنید تا مخاطب همه مسیرهای ارتباط و خرید را در یک صفحه ببیند.",
    },
    customDomain: {
      title: "دامنه اختصاصی مای‌لینک",
      description: "برای صفحه مای‌لینک یک دامنه مخصوص بگیرید و وضعیت وصل‌شدنش را ببینید.",
      descriptionDetail:
        "برای صفحه مای‌لینک درخواست دامنه اختصاصی بدهید و مرحله‌های تأیید، اتصال و وضعیت دی‌ان‌اس را دنبال کنید. پس از آماده‌شدن دامنه، لینک مقصد عمومی صفحه بر اساس وضعیت تأیید و اتصال نمایش داده می‌شود.",
    },
    marketInsights: {
      title: "آمار مای‌لینک و لینک‌ها",
      description: "ببینید صفحه و لینک‌هایتان چقدر دیده شده‌اند.",
      descriptionDetail:
        "آمار کلی صفحه مای‌لینک و عملکرد هر لینک را بررسی کنید تا بفهمید مخاطب بیشتر با کدام بخش‌ها تعامل دارد. فعالیت لینک‌های ویدیو و رسانه‌های متصل هم، هرجا داده‌اش از سامانه برگردد، در همین نمای تحلیلی قابل پیگیری است.",
    },
    walletAndInvoices: {
      title: "کیف پول و فاکتورها",
      description: "کارت بانکی اضافه کنید، فاکتورها و موجودی را ببینید و درخواست تسویه بدهید.",
      descriptionDetail:
        "کارت بانکی را ثبت و در صورت نیاز کارت پیش‌فرض را انتخاب کنید، سپس فاکتورها و زیر‌فاکتورها را بررسی کنید. موجودی و سابقه تغییرات آن را ببینید و برای تسویه درخواست بدهید؛ جزئیات سفارش مرتبط نیز در حالت فقط‌خواندنی قابل مشاهده است.",
    },
    aiModelSettings: {
      title: "تنظیمات هوش مصنوعی",
      description: "مدل متن یا صدا را انتخاب کنید و تنظیمات دلخواهتان را ذخیره کنید.",
      descriptionDetail:
        "مدل‌های متنی و صوتی در دسترس را ببینید و گزینه مناسب نقش و نیازتان را انتخاب کنید. تنظیمات انتخاب‌شده را ذخیره کنید تا ابزارهای هوش مصنوعی در استفاده‌های بعدی با همان ترجیح‌ها آماده شوند.",
    },
    partnerManagement: {
      title: "مدیریت همکاران",
      description: "همکار اضافه کنید، سطح دسترسی‌اش را مشخص کنید یا حسابش را ویرایش و حذف کنید.",
      descriptionDetail:
        "برای تقسیم کار، همکار اضافه کنید و نقش‌های کاربردی او را مشخص کنید تا فقط به بخش‌های لازم دسترسی داشته باشد. حساب همکاران را ویرایش، محدود یا حذف کنید و در صورت نیاز برای دسترسی آن‌ها بازه زمانی تعیین کنید.",
    },
    productCatalog: {
      title: "فروشگاه محصولات",
      description: "پست‌های اینستاگرام را به محصول تبدیل کنید، محصولات را جست‌وجو کنید و موجودی‌شان را تغییر دهید.",
      descriptionDetail:
        "پست‌های واجد شرایط اینستاگرام را به محصول فروشگاه تبدیل کنید و در فهرست محصولات جست‌وجو کنید. نتیجه‌ها را صفحه‌به‌صفحه ببینید، در دسترس‌بودن محصول را تغییر دهید یا محصولی را که دیگر نمی‌خواهید عرضه شود از حالت فعال خارج کنید.",
    },
    productAuthoring: {
      title: "ساخت و ویرایش محصول",
      description: "اسم، عکس، توضیح، قیمت و اطلاعات محصول را وارد یا ویرایش کنید.",
      descriptionDetail:
        "برای محصول نام، عکس، توضیح، دسته، مشخصات، اطلاعات ارسال و قیمت را وارد کنید. هنگام ویرایش می‌توانید اطلاعات نمایشی و رسانه‌های محصول را به‌روزرسانی کنید تا صفحه محصول برای خریدار کامل و قابل فهم باشد.",
    },
    variantsInventory: {
      title: "مدیریت مدل‌ها و موجودی",
      description: "مدل‌های مختلف محصول، قیمت و تعداد موجود را مدیریت کنید.",
      descriptionDetail:
        "برای هر محصول مدل‌ها یا گزینه‌های متفاوت را تعریف کنید و قیمت و تعداد موجودی هرکدام را جداگانه مدیریت کنید. فعال یا غیرفعال‌کردن مدل، نمایش رسانه و مشخصات آن کمک می‌کند خریدار گزینه درست را انتخاب کند.",
    },
    discountManagement: {
      title: "قیمت و تخفیف محصول",
      description: "برای یک یا چند محصول تخفیف بگذارید و قیمت‌ها را سریع تغییر دهید.",
      descriptionDetail:
        "برای یک محصول یا چند محصول، قیمت و تخفیف را تنظیم کنید و تغییرهای تکراری را از راه ویرایش گروهی سریع‌تر انجام دهید. مقدار نهایی را پیش از ثبت بررسی کنید تا تخفیف و قیمت نمایش‌داده‌شده با برنامه فروش شما هماهنگ باشد.",
    },
    sellerOrders: {
      title: "مدیریت سفارش‌های فروشنده",
      description: "سفارش‌ها را ببینید، آماده کنید، بفرستید و وضعیتشان را به‌روز کنید.",
      descriptionDetail:
        "سفارش‌های فروشگاه را بر اساس مرحله‌هایی مثل در انتظار، آماده‌سازی، تحویل به ارسال، ارسال‌شده یا تحویل‌شده بررسی کنید. هر سفارش را قبول، آماده، ارسال، تحویل یا در صورت نیاز رد کنید و وضعیت آن را برای پیگیری خریدار به‌روز نگه دارید.",
    },
    parcelTracking: {
      title: "رهگیری بسته و سفارش",
      description: "جزئیات سفارش و مسیر بسته را تا رسیدن به دست مشتری ببینید.",
      descriptionDetail:
        "جزئیات کامل سفارش را باز کنید و گزارش مرحله‌به‌مرحله حرکت بسته را ببینید. این اطلاعات کمک می‌کند وضعیت ارسال را از زمان ثبت تا رسیدن به مشتری بررسی کنید و هنگام پاسخ‌گویی، تصویر دقیق‌تری از سفارش داشته باشید.",
    },
    buyerDiscovery: {
      title: "پیدا کردن فروشگاه برای خریدار",
      description: "محصول‌های ذخیره‌شده و فروشگاه‌های مختلف را پیدا و بررسی کنید.",
      descriptionDetail:
        "در فضای خرید، محصولات ذخیره‌شده و کسب‌وکارها یا فروشگاه‌های مختلف را جست‌وجو و بررسی کنید. نتیجه‌های صفحه‌به‌صفحه کمک می‌کنند گزینه‌های بیشتری پیدا کنید و پیش از ورود به فروشگاه، دید اولیه‌ای از محصولات و اطلاعات آن داشته باشید.",
    },
    shopCatalog: {
      title: "فروشگاه برای خریدار",
      description: "محصول‌ها را بر اساس دسته، قیمت یا موجودی پیدا کنید و کامنت هایشان را بخوانید.",
      descriptionDetail:
        "وارد فروشگاه انتخاب‌شده شوید و محصولات را بر اساس دسته، موجودی، قیمت یا عبارت جست‌وجو محدود کنید. جزئیات محصول، کامنت ها و سابقه قیمت را بخوانید تا پیش از انتخاب، اطلاعات کافی برای خرید داشته باشید.",
    },
    favoritesAndCart: {
      title: "علاقه‌مندی و سبد خرید",
      description: "محصول‌ها را ذخیره کنید، مدل دلخواهتان را بردارید و به سبد خرید اضافه کنید.",
      descriptionDetail:
        "محصول مورد علاقه را ذخیره کنید تا بعداً دوباره پیدایش کنید، سپس مدل و تعداد دلخواه را انتخاب کنید. کالاها در سبد جداگانه هر فروشنده نگه داشته می‌شوند و موجودی و محدودیت تعداد هنگام انتخاب بررسی می‌شود.",
    },
    checkout: {
      title: "خرید و پرداخت",
      description: "نشانی و روش ارسال را انتخاب کنید، سفارش بدهید و پرداخت را کامل کنید.",
      descriptionDetail:
        "در مرحله خرید، نشانی دریافت و روش ارسال مناسب را انتخاب کنید و جزئیات سفارش را قبل از ثبت مرور کنید. سپس سفارش ساخته می‌شود و برای تکمیل پرداخت به لینک پرداختی هدایت می‌شوید که سامانه برمی‌گرداند.",
    },
    couponValidation: {
      title: "بررسی کد تخفیف",
      description: "قبل از پرداخت، کد تخفیف را وارد کنید تا ببینید قابل استفاده است یا نه.",
      descriptionDetail:
        "کد تخفیف را پیش از پرداخت وارد کنید تا سامانه اعتبار و شرایط استفاده از آن را بررسی کند. نتیجه می‌تواند شامل زمان پایان، میزان تخفیف، دفعات استفاده و وضعیت تعلق کد باشد و به شما نشان می‌دهد روی این خرید قابل اعمال هست یا نه.",
    },
    buyerOrders: {
      title: "سفارش‌های خریدار",
      description: "سفارش‌ها را از لحظه ثبت تا تحویل دنبال کنید و در صورت امکان لغوشان کنید.",
      descriptionDetail:
        "سفارش‌های خود را بر اساس مرحله ثبت، آماده‌سازی، ارسال و تحویل دنبال کنید و جزئیات هرکدام را ببینید. اگر شرایط سفارش اجازه دهد، درخواست لغو را از همین مسیر انجام دهید تا وضعیت جدید برای پیگیری روشن باشد.",
    },
    advertiserEnrollment: {
      title: "فعال‌سازی تبلیغ‌کننده",
      description: "اطلاعات لازم را تأیید کنید تا بتوانید از بخش تبلیغات استفاده کنید.",
      descriptionDetail:
        "اطلاعات و سطح دسترسی لازم برای ورود به بخش تبلیغات را بررسی و تأیید کنید. بعد از کامل‌شدن احراز مورد نیاز، می‌توانید وارد روندهای تبلیغاتی مجاز برای حساب شوید؛ دسترسی نهایی همچنان به تأیید سامانه وابسته است.",
    },
    advertiserDirectory: {
      title: "پیدا کردن تبلیغ‌کننده",
      description: "کسب‌وکارهای تبلیغ‌کننده را جست‌وجو کنید و اطلاعاتشان را ببینید.",
      descriptionDetail:
        "فهرست کسب‌وکارهای تبلیغ‌کننده را جست‌وجو و صفحه‌به‌صفحه بررسی کنید. نام کسب‌وکار، حساب، بنر و تعداد دنبال‌کننده‌ها را ببینید تا برای انتخاب تبلیغ‌کننده، اطلاعات مقایسه‌ای در اختیار داشته باشید.",
    },
    accountTagging: {
      title: "پیدا کردن حساب برای تبلیغ",
      description: "حساب اینستاگرام موردنظرتان را پیدا کنید و در محتوای تبلیغ تگ کنید.",
      descriptionDetail:
        "در سازنده محتوای تبلیغ، حساب اینستاگرام موردنظر را با جست‌وجو پیدا کنید و نتیجه مناسب را انتخاب کنید. حساب انتخاب‌شده در جایگاه تگ محتوای تبلیغ قرار می‌گیرد تا مخاطب و حساب مرتبط با تبلیغ درست نمایش داده شوند.",
    },
    accountSwitching: {
      title: "جابه‌جایی بین حساب‌ها",
      description: "بین حساب‌های اینستاگرام جابه‌جا شوید و دعوت‌های همکاری را قبول یا رد کنید.",
      descriptionDetail:
        "اگر چند حساب اینستاگرام دارید، حساب فعال را عوض کنید تا داشبورد و عملیات روی همان حساب انجام شود. دعوت‌های همکاری را هم در همین جریان ببینید و بر اساس نیاز قبول یا رد کنید، بدون اینکه تنظیمات حساب دیگر با حساب فعلی قاطی شود.",
    },
    languageTheme: {
      title: "زبان و ظاهر برنامه",
      description: "زبان، تقویم و حالت روشن یا تاریک برنامه را انتخاب کنید.",
      descriptionDetail:
        "زبان و جهت نمایش برنامه را انتخاب کنید و در صورت پشتیبانی، تقویم مناسب را فعال کنید. حالت روشن یا تاریک را هم تغییر دهید تا خواندن و کارکردن با بخش‌های مختلف برنامه با ترجیح شما هماهنگ باشد.",
    },
    subscriptionAccess: {
      title: "اشتراک و قابلیت‌ها",
      description: "بسته مناسب را ببینید و در صورت نیاز اشتراکتان را فعال کنید.",
      descriptionDetail:
        "بسته‌ها و قابلیت‌های قابل خرید را بر اساس اطلاعاتی که سامانه برمی‌گرداند بررسی کنید. اگر گزینه مناسبی پیدا کردید، فرایند فعال‌سازی اشتراک را ادامه دهید تا به مسیر پرداخت رسمی هدایت شوید؛ قیمت و محدودیت‌ها از خودمان حدس زده نمی‌شوند.",
    },
    advertisingLifecyclePrototype: {
      title: "تقویم و گزارش تبلیغات",
      description: "این بخش هنوز کامل و آماده استفاده نیست؛ فعلاً فقط برای بررسی در برنامه مانده است.",
      descriptionDetail:
        "مسیرهای تقویم، فهرست و گزارش تبلیغات در برنامه دیده می‌شوند، اما داده‌ها یا عملیات آن‌ها هنوز کامل به سامانه وصل نیستند. بنابراین فعلاً نمی‌توان از این بخش برای مدیریت واقعی چرخه تبلیغ استفاده کرد و فقط به‌عنوان مورد نیازمند بررسی نگه داشته شده است.",
    },
    customerAdsPrototype: {
      title: "ساخت تبلیغ مشتری",
      description: "صفحه ساخت تبلیغ وجود دارد، اما مراحل انتخاب، پرداخت و انتشار هنوز کامل نشده‌اند.",
      descriptionDetail:
        "صفحه چندمرحله‌ای ساخت تبلیغ و مدل‌های مربوط به آن وجود دارند، اما انتخاب نهایی، سبد، کد تخفیف، پرداخت و انتشار هنوز یک فرایند کامل و متصل نمی‌سازند. بخش زیادی از وضعیت فعلی محلی یا نمونه‌ای است و نباید به‌عنوان قابلیت آماده معرفی شود.",
    },
    storePropertiesPrototype: {
      title: "تنظیمات فروشگاه و ارسال",
      description: "تنظیمات فروشگاه دیده می‌شود، اما ذخیره و راه‌اندازی کامل هنوز آماده نیست.",
      descriptionDetail:
        "تنظیمات فروشگاه و ارسال در رابط کاربری دیده می‌شوند، اما ذخیره‌سازی و راه‌اندازی کامل آن‌ها هنوز آماده استفاده نیست. وجود چند مسیر دسترسی جداگانه به‌تنهایی برای تأیید یک جریان کامل فروشنده کافی نیست، پس این مورد در فهرست ممیزی باقی می‌ماند.",
    },
    storeReportsPrototype: {
      title: "گزارش فروش فروشگاه",
      description: "این صفحه نمونه‌ای از گزارش فروش نشان می‌دهد و هنوز به گزارش واقعی وصل نیست.",
      descriptionDetail:
        "صفحه آمار فروش و گزارش خریداران یک نمای نمونه از داده‌ها نشان می‌دهد، اما داده‌های فعلی از اطلاعات آماده‌شده در خود رابط می‌آیند و درخواست فعال گزارش‌گیری ندارند. تا زمان اتصال به گزارش واقعی، این صفحه برای تصمیم‌گیری تجاری قابل استناد نیست.",
    },
    myLinkCouponPrototype: {
      title: "نمایش کد تخفیف در مای‌لینک",
      description: "کد تخفیف فعلاً نمایشی است و روی خرید اثر واقعی ندارد.",
      descriptionDetail:
        "کد تخفیف و شمارش معکوس مای‌لینک فعلاً فقط برای نمایش ساخته شده‌اند و کپی‌کردن کد به یک پیشنهاد واقعی یا تغییر قیمت خرید وصل نیست. تا وقتی مسیر تبلیغ و اثر آن در پرداخت تأیید نشود، نباید آن را تخفیف فعال معرفی کرد.",
    },
    videoCreationIncomplete: {
      title: "ساخت ویدیو با هوش مصنوعی",
      description: "بخش ساخت ویدیو دیده می‌شود، اما هنوز کامل و قابل استفاده نیست.",
      descriptionDetail:
        "گزینه‌های مربوط به ساخت ویدیو در فضای تصویر دیده می‌شوند، اما عملیات ساخت و برآورد مصرف هنوز کامل یا به مسیر مشخص سامانه وصل نیستند. به همین دلیل فعلاً امکان معرفی ساخت ویدیوی هوش مصنوعی به‌عنوان قابلیت فعال وجود ندارد.",
    },
    marketHomePrototype: {
      title: "صفحه اصلی بازار",
      description: "این صفحه فعلاً چند مورد نمونه نشان می‌دهد و به اطلاعات واقعی وصل نیست.",
      descriptionDetail:
        "صفحه اصلی بازار چند مورد از پیش‌نوشته‌شده را نمایش می‌دهد، اما برای بارگذاری اطلاعات واقعی درخواست سامانه ندارد. ظاهر این صفحه برای بررسی رابط کاربری مفید است، ولی هنوز نشان‌دهنده یک بازار زنده یا جست‌وجوی واقعی نیست.",
    },
    buyerFinanceStubs: {
      title: "کیف پول و وضعیت پرداخت خریدار",
      description: "این صفحه‌ها فعلاً فقط ظاهر اولیه دارند و فرایند کامل پرداخت در آن‌ها نیست.",
      descriptionDetail:
        "صفحه‌های کیف پول خریدار و وضعیت پرداخت فعلاً بیشتر نقش پوسته یا نمایش متن را دارند و جریان کامل کیف پول، پرداخت و پیگیری تراکنش در آن‌ها وصل نشده است. بنابراین وضعیت واقعی مالی خریدار را نباید از این بخش‌ها نتیجه گرفت.",
    },
    messagingDownloadStubs: {
      title: "دریافت تلگرام و واتساپ",
      description: "این بخش‌ها فقط پیشنهاد دریافت برنامه را نشان می‌دهند و هنوز به پیام‌رسان‌ها وصل نیستند.",
      descriptionDetail:
        "این مسیرها فقط پیام یا پیشنهاد دریافت تلگرام و واتساپ را نشان می‌دهند و اتصال حساب، ارسال پیام یا دریافت گفت‌وگو از این پیام‌رسان‌ها در برنامه وجود ندارد. در نتیجه، آن‌ها فعلاً راهنمای دانلود هستند نه صندوق پیام‌رسان.",
    },
  },
};
