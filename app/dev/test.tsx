"use client";
import React from "react";
import styles from "./test.module.css";

// ============================================================
//  DATA
// ============================================================

const STATS = [
  { label: "کل وابستگی مستقیم", value: "46", color: "colorPurple" },
  { label: "استفاده می‌شوند", value: "37", color: "colorGreen" },
  { label: "یتیم (Unused)", value: "7", color: "colorRed" },
  { label: "تأثیر bundle (حذف)", value: "~550KB", color: "colorOrange" },
  { label: "devDependencies", value: "8", color: "colorBlue" },
  { label: "نسخه تکراری (pako)", value: "3×", color: "colorYellow" },
];

type TierKey = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface DepRow {
  name: string;
  tier: TierKey;
  used: boolean;
  usedLabel: string;
  stars: number;
  safe: "no" | "yes" | "maybe";
  bundleLabel: string;
  note?: string;
  description?: string;
}

const DEPS: DepRow[] = [
  // Tier 1
  { name: "react", tier: 1, used: true, usedLabel: "Production", stars: 5, safe: "no", bundleLabel: "پایه" },
  { name: "react-dom", tier: 1, used: true, usedLabel: "Production", stars: 5, safe: "no", bundleLabel: "پایه" },
  { name: "next", tier: 1, used: true, usedLabel: "Production", stars: 5, safe: "no", bundleLabel: "پایه" },
  {
    name: "typescript",
    tier: 1,
    used: true,
    usedLabel: "Build-time",
    stars: 5,
    safe: "no",
    bundleLabel: "build-only",
    note: "⚠️ باید devDeps باشد",
  },
  // Tier 2
  { name: "next-auth", tier: 2, used: true, usedLabel: "Production", stars: 5, safe: "no", bundleLabel: "~100KB" },
  { name: "react-i18next", tier: 2, used: true, usedLabel: "Production", stars: 5, safe: "no", bundleLabel: "~55KB" },
  {
    name: "@microsoft/signalr",
    tier: 2,
    used: true,
    usedLabel: "Production",
    stars: 5,
    safe: "no",
    bundleLabel: "~110KB",
  },
  { name: "sass", tier: 2, used: true, usedLabel: "Build-time", stars: 5, safe: "no", bundleLabel: "build-only" },
  { name: "next-pwa", tier: 2, used: true, usedLabel: "Build-time", stars: 3, safe: "no", bundleLabel: "build-only" },
  {
    name: "terser-webpack-plugin",
    tier: 2,
    used: true,
    usedLabel: "Build-time",
    stars: 4,
    safe: "no",
    bundleLabel: "build-only",
  },
  {
    name: "autoprefixer",
    tier: 2,
    used: true,
    usedLabel: "Build-time",
    stars: 3,
    safe: "no",
    bundleLabel: "build-only",
  },
  {
    name: "postcss",
    tier: 2,
    used: true,
    usedLabel: "Build-time",
    stars: 3,
    safe: "maybe",
    bundleLabel: "build-only",
    note: "⚠️ Next.js نسخه داخلی دارد",
  },
  // Tier 3
  { name: "compressorjs", tier: 3, used: true, usedLabel: "Production", stars: 4, safe: "no", bundleLabel: "~30KB" },
  {
    name: "react-multi-date-picker",
    tier: 3,
    used: true,
    usedLabel: "Production",
    stars: 4,
    safe: "no",
    bundleLabel: "~120KB",
  },
  {
    name: "pako",
    tier: 3,
    used: true,
    usedLabel: "Production",
    stars: 3,
    safe: "no",
    bundleLabel: "~50KB",
    note: "⚠️ 3 نسخه در bundle",
  },
  {
    name: "date-fns",
    tier: 3,
    used: true,
    usedLabel: "Production",
    stars: 3,
    safe: "no",
    bundleLabel: "~60KB (treeshaked)",
  },
  {
    name: "react-input-emoji",
    tier: 3,
    used: true,
    usedLabel: "Production",
    stars: 4,
    safe: "no",
    bundleLabel: "~45KB",
  },
  {
    name: "satori",
    tier: 3,
    used: true,
    usedLabel: "Production",
    stars: 3,
    safe: "no",
    bundleLabel: "~100KB (server)",
  },
  {
    name: "heic2any",
    tier: 3,
    used: true,
    usedLabel: "Production",
    stars: 2,
    safe: "no",
    bundleLabel: "~2.5MB (lazy✅)",
  },
  // Tier 4
  {
    name: "apexcharts",
    tier: 4,
    used: true,
    usedLabel: "Production",
    stars: 4,
    safe: "no",
    bundleLabel: "~1MB (dynamic✅)",
  },
  {
    name: "react-apexcharts",
    tier: 4,
    used: true,
    usedLabel: "Production",
    stars: 4,
    safe: "no",
    bundleLabel: "با apexcharts",
  },
  {
    name: "swiper",
    tier: 4,
    used: true,
    usedLabel: "Production",
    stars: 4,
    safe: "no",
    bundleLabel: "~250KB (treeshaked)",
  },
  {
    name: "quill",
    tier: 4,
    used: true,
    usedLabel: "Indirect",
    stars: 3,
    safe: "no",
    bundleLabel: "~450KB (dynamic✅)",
  },
  {
    name: "react-quill-ver2",
    tier: 4,
    used: true,
    usedLabel: "Production",
    stars: 3,
    safe: "no",
    bundleLabel: "با quill",
    note: "پچ رسمی دارد",
  },
  { name: "react-toastify", tier: 4, used: true, usedLabel: "Production", stars: 4, safe: "no", bundleLabel: "~40KB" },
  { name: "leaflet", tier: 4, used: true, usedLabel: "Production", stars: 3, safe: "no", bundleLabel: "~150KB" },
  { name: "wavesurfer.js", tier: 4, used: true, usedLabel: "Production", stars: 3, safe: "no", bundleLabel: "~150KB" },
  {
    name: "@dnd-kit/core",
    tier: 4,
    used: true,
    usedLabel: "Production",
    stars: 3,
    safe: "no",
    bundleLabel: "~55KB combined",
  },
  {
    name: "@dnd-kit/sortable",
    tier: 4,
    used: true,
    usedLabel: "Production",
    stars: 3,
    safe: "no",
    bundleLabel: "با core",
  },
  {
    name: "@dnd-kit/utilities",
    tier: 4,
    used: true,
    usedLabel: "Production",
    stars: 2,
    safe: "no",
    bundleLabel: "با core",
  },
  { name: "react-draggable", tier: 4, used: true, usedLabel: "Production", stars: 2, safe: "no", bundleLabel: "~15KB" },
  { name: "react-color", tier: 4, used: true, usedLabel: "Production", stars: 2, safe: "no", bundleLabel: "~55KB" },
  {
    name: "react-phone-input-2",
    tier: 4,
    used: true,
    usedLabel: "Production",
    stars: 3,
    safe: "no",
    bundleLabel: "~60KB",
  },
  {
    name: "react-simple-star-rating",
    tier: 4,
    used: true,
    usedLabel: "Production",
    stars: 2,
    safe: "no",
    bundleLabel: "~8KB",
  },
  { name: "react-slider", tier: 4, used: true, usedLabel: "Production", stars: 2, safe: "no", bundleLabel: "~10KB" },
  // Tier 5
  {
    name: "@types/react",
    tier: 5,
    used: true,
    usedLabel: "Type-only",
    stars: 5,
    safe: "no",
    bundleLabel: "type-only",
    note: "⚠️ باید devDeps باشد",
  },
  {
    name: "@types/react-dom",
    tier: 5,
    used: true,
    usedLabel: "Type-only",
    stars: 4,
    safe: "no",
    bundleLabel: "type-only",
    note: "⚠️ باید devDeps باشد",
  },
  {
    name: "@types/wavesurfer.js",
    tier: 5,
    used: true,
    usedLabel: "Type-only",
    stars: 2,
    safe: "no",
    bundleLabel: "type-only",
    note: "⚠️ باید devDeps باشد",
  },
  {
    name: "patch-package",
    tier: 5,
    used: true,
    usedLabel: "Build-time",
    stars: 3,
    safe: "no",
    bundleLabel: "build-only",
  },
  { name: "next-router-mock", tier: 5, used: true, usedLabel: "Compat", stars: 3, safe: "no", bundleLabel: "compat" },
  {
    name: "braces",
    tier: 5,
    used: true,
    usedLabel: "Indirect",
    stars: 1,
    safe: "maybe",
    bundleLabel: "security override",
  },
  // Tier 7 (Unused)
  { name: "ws", tier: 7, used: false, usedLabel: "Unused", stars: 1, safe: "yes", bundleLabel: "~150KB" },
  { name: "jotai", tier: 7, used: false, usedLabel: "Unused", stars: 1, safe: "yes", bundleLabel: "~8KB" },
  {
    name: "pdf-lib",
    tier: 7,
    used: false,
    usedLabel: "Unused",
    stars: 1,
    safe: "yes",
    bundleLabel: "~450KB+",
    note: "🔴 بیشترین بار اضافه",
  },
  { name: "react-select", tier: 7, used: false, usedLabel: "Unused", stars: 1, safe: "yes", bundleLabel: "~28KB" },
  {
    name: "react-infinite-scroll-component",
    tier: 7,
    used: false,
    usedLabel: "Unused",
    stars: 1,
    safe: "yes",
    bundleLabel: "~12KB",
    note: "جایگزین: custom hook",
  },
  {
    name: "lodash.throttle",
    tier: 7,
    used: false,
    usedLabel: "Unused",
    stars: 1,
    safe: "yes",
    bundleLabel: "~2KB",
    note: "جایگزین: پیاده‌سازی دستی",
  },
  {
    name: "react-leaflet",
    tier: 7,
    used: false,
    usedLabel: "احتمالاً Unused",
    stars: 1,
    safe: "maybe",
    bundleLabel: "~25KB",
    note: "leaflet خام استفاده می‌شود",
  },
];

const DEV_DEPS = [
  { name: "@types/i18next", used: true, note: "لازم — type-only" },
  { name: "@types/node", used: true, note: "لازم — type-only" },
  { name: "@types/pako", used: true, note: "لازم — type-only" },
  { name: "@types/react-color", used: true, note: "لازم — type-only" },
  { name: "@types/react-i18next", used: true, note: "لازم — type-only" },
  { name: "@types/react-slider", used: true, note: "لازم — type-only" },
  { name: "next-router-mock", used: true, note: "لازم — compat layer" },
  { name: "patch-package", used: true, note: "لازم — پچ react-quill" },
  { name: "@types/react-beautiful-dnd", used: false, note: "🔴 یتیم — پکیج اصلی نصب نیست" },
];

const ORPHANS = [
  { name: "pdf-lib", reason: "هیچ import در کدبیس یافت نشد. کاملاً بلااستفاده است.", saving: "صرفه‌جویی ~450KB+" },
  { name: "jotai", reason: "هیچ import در کدبیس یافت نشد. State management استفاده نشده.", saving: "صرفه‌جویی ~8KB" },
  {
    name: "react-select",
    reason: "هیچ import در کدبیس یافت نشد. Select پیشرفته بلااستفاده.",
    saving: "صرفه‌جویی ~28KB",
  },
  {
    name: "react-infinite-scroll-component",
    reason: "یک custom hook (useInfiniteScroll.ts) جایگزین آن شده.",
    saving: "صرفه‌جویی ~12KB",
  },
  {
    name: "lodash.throttle",
    reason: "throttle به‌صورت دستی (native setTimeout) پیاده‌سازی شده.",
    saving: "صرفه‌جویی ~2KB",
  },
  {
    name: "ws",
    reason: "socket.ts از native browser WebSocket استفاده می‌کند. signalR نسخه خود ws را دارد.",
    saving: "صرفه‌جویی ~150KB",
  },
  {
    name: "react-leaflet",
    reason: "mainLeaftlet.jsx از leaflet خام استفاده می‌کند. هیچ import از react-leaflet یافت نشد.",
    saving: "⚠️ نیاز به تأیید نهایی",
  },
];

interface BundleBar {
  name: string;
  kb: number;
  maxKb: number;
  label: string;
  type: "danger" | "warn" | "ok" | "lazy" | "gray";
  tag?: string;
}

const BUNDLE_BARS: BundleBar[] = [
  { name: "heic2any", kb: 2500, maxKb: 3000, label: "~2.5MB", type: "warn", tag: "lazy" },
  { name: "apexcharts", kb: 1000, maxKb: 3000, label: "~1MB", type: "warn", tag: "dynamic" },
  { name: "quill (editor)", kb: 450, maxKb: 3000, label: "~450KB", type: "warn", tag: "dynamic" },
  { name: "pdf-lib (UNUSED)", kb: 450, maxKb: 3000, label: "~450KB", type: "danger", tag: undefined },
  { name: "@microsoft/signalr", kb: 110, maxKb: 3000, label: "~110KB", type: "ok", tag: undefined },
  { name: "swiper", kb: 250, maxKb: 3000, label: "~250KB", type: "ok", tag: undefined },
  { name: "leaflet", kb: 150, maxKb: 3000, label: "~150KB", type: "ok", tag: undefined },
  { name: "wavesurfer.js", kb: 150, maxKb: 3000, label: "~150KB", type: "ok", tag: undefined },
  { name: "ws (UNUSED)", kb: 150, maxKb: 3000, label: "~150KB", type: "danger", tag: undefined },
  { name: "react-multi-date-picker", kb: 120, maxKb: 3000, label: "~120KB", type: "ok", tag: undefined },
  { name: "next-auth", kb: 100, maxKb: 3000, label: "~100KB", type: "ok", tag: undefined },
  { name: "satori", kb: 100, maxKb: 3000, label: "~100KB", type: "gray", tag: "server" },
  { name: "react-color", kb: 55, maxKb: 3000, label: "~55KB", type: "ok", tag: undefined },
  { name: "react-i18next", kb: 55, maxKb: 3000, label: "~55KB", type: "ok", tag: undefined },
  { name: "react-phone-input-2", kb: 60, maxKb: 3000, label: "~60KB", type: "ok", tag: undefined },
  { name: "date-fns", kb: 60, maxKb: 3000, label: "~60KB", type: "lazy", tag: "lazy" },
  { name: "react-select (UNUSED)", kb: 28, maxKb: 3000, label: "~28KB", type: "danger", tag: undefined },
  { name: "jotai (UNUSED)", kb: 8, maxKb: 3000, label: "~8KB", type: "danger", tag: undefined },
];

const RISKS = [
  {
    title: "react-quill-ver2 + quill",
    level: "yellow",
    desc: "پچ رسمی در /patches/ اعمال شده است. بدون patch-package در postinstall، اجرا نمی‌شود.",
  },
  {
    title: "pako × 3 نسخه",
    level: "yellow",
    desc: "pdf-lib نسخه‌های v0.2، v1.x و v2.x از pako را به bundle اضافه می‌کند. حذف pdf-lib این مشکل را کاهش می‌دهد.",
  },
  {
    title: "@types/react-beautiful-dnd یتیم",
    level: "red",
    desc: "پروژه به @dnd-kit مهاجرت کرده اما type package قدیمی react-beautiful-dnd باقی مانده.",
  },
  {
    title: "ws override",
    level: "yellow",
    desc: "ws در dependencies احتمالاً برای override نسخه آسیب‌پذیر داخل @microsoft/signalr اضافه شده. بررسی npm audit لازم است.",
  },
  {
    title: "react-leaflet بدون استفاده",
    level: "yellow",
    desc: "mainLeaftlet.jsx از leaflet خام استفاده می‌کند. react-leaflet نصب است اما import نمی‌شود.",
  },
  {
    title: "postcss مستقل",
    level: "yellow",
    desc: "Next.js نسخه داخلی postcss دارد. تعریف مستقل ممکن است در آینده تعارض نسخه ایجاد کند.",
  },
  {
    title: "@types/* در dependencies",
    level: "yellow",
    desc: "@types/react، @types/react-dom، @types/wavesurfer.js و typescript در dependencies هستند نه devDependencies. با --production ممکن است مشکل ایجاد شود.",
  },
  {
    title: "react-color قدیمی",
    level: "yellow",
    desc: "آخرین update 2021 — پروژه inactive است. به colord یا @radix-ui/colors مهاجرت بررسی شود.",
  },
  {
    title: "dynamic import صحیح",
    level: "green",
    desc: "apexcharts، react-quill-ver2 و heic2any همه با dynamic import یا lazy load صحیح استفاده می‌شوند.",
  },
  {
    title: "PWA پیکربندی صحیح",
    level: "green",
    desc: "next-pwa در development غیرفعال است. service worker فقط در production فعال می‌شود.",
  },
];

const DUPLICATES = [
  {
    pkg: "pako",
    versions: "v0.2.5 / v1.0.x / v2.1.0",
    cause: "pdf-lib، @pdf-lib/standard-fonts، @pdf-lib/upng، wavesurfer.js",
    impact: "+150KB اضافه",
  },
  {
    pkg: "ws",
    versions: "v8.18.3 (direct) + (signalr internal)",
    cause: "@microsoft/signalr نسخه خود دارد",
    impact: "تعارض احتمالی",
  },
  {
    pkg: "ajv",
    versions: "چند نسخه مختلف",
    cause: "terser-webpack-plugin، ajv-formats",
    impact: "build-time only — بی‌خطر",
  },
];

// راه‌حل پیشنهادی برای نسخه‌های تکراری
const DUPLICATE_SOLUTIONS: Record<string, string> = {
  pako: "حذف یا جایگزینی pdf-lib، یا یکسان‌سازی نسخه‌ها با استفاده از overrides/resolutions در package.json و سپس نصب مجدد.",
  ws: "حذف dependency مستقیم ws یا تعیین نسخهٔ موردنظر در overrides؛ در صورت نیاز از نسخه‌ای که signalr انتظار دارد استفاده کنید.",
  ajv: "این نسخه‌ها مربوط به build-time هستند—آنها را در devDependencies نگه دارید یا با یک override نسخه‌ها را یکسان کنید.",
};

// توضیح کوتاه (کارایی) برای هر پکیج که در جداول نمایش داده می‌شود
const PKG_DESC: Record<string, string> = {
  react: "هستهٔ کتابخانهٔ React برای ساخت رابط کاربری.",
  "react-dom": "بکارگیری React در مرورگر (rendering DOM).",
  next: "فریم‌ورک Next.js برای SSR/سروینگ صفحات و مسیرها.",
  typescript: "ابزار تایپ‌چکینگ و توسعه با TypeScript.",
  "next-auth": "احراز هویت و مدیریت سشن‌ها در Next.js.",
  "react-i18next": "کتابخانهٔ بین‌المللی‌سازی (i18n) برای React.",
  "@microsoft/signalr": "کلاینت real-time برای اتصال به سرویس‌های SignalR.",
  sass: "پردازش فایل‌های SCSS/SASS در زمان build.",
  "next-pwa": "افزودن PWA و service worker به اپ Next.js.",
  "terser-webpack-plugin": "مینیمایز کردن کد جاوااسکریپت در فرایند build.",
  autoprefixer: "اضافه کردن خودکار پیش‌وندهای CSS برای مرورگرها.",
  postcss: "پلتفرم پردازش CSS؛ پلاگین‌هایی مثل autoprefixer را اجرا می‌کند.",
  compressorjs: "فشرده‌سازی تصاویر در سمت کلاینت.",
  "react-multi-date-picker": "کامپوننت تقویم و انتخاب چندتاریخ برای React.",
  pako: "فشرده‌سازی/decompression (zlib) در مرورگر — مورد استفاده در چند بسته.",
  "date-fns": "توابع کمکی کار با تاریخ به صورت ماژولار و tree-shakable.",
  "react-input-emoji": "کامپوننت ورودی متن با پشتیبانی از ایموجی‌ها.",
  satori: "کتابخانهٔ رندر گرافیکی برای تولید تصاویر (سرور-side).",
  heic2any: "تبدیل تصاویر HEIC به فرمت‌های وب مثل JPEG در مرورگر.",
  apexcharts: "کتابخانهٔ رسم چارت‌های تعاملی در جاوااسکریپت.",
  "react-apexcharts": "بایندینگ React برای ApexCharts.",
  swiper: "اسلایدر/کاروسل مدرن و سبک برای وب.",
  quill: "ادیتور متن غنی (Rich text editor).",
  "react-quill-ver2": "ورژن سازگار React از Quill برای ادیتور متن.",
  "react-toastify": "نمایش نوتیفیکیشن‌های Toast در رابط کاربری.",
  leaflet: "کتابخانهٔ نقشه‌بری سبک برای مرورگرها.",
  "wavesurfer.js": "کتابخانهٔ نمایش و پخش ویوفرم‌های صوتی.",
  "@dnd-kit/core": "هستهٔ Drag & Drop مدرن برای React.",
  "@dnd-kit/sortable": "افزونه مرتب‌سازی برای dnd-kit.",
  "@dnd-kit/utilities": "ابزارهای کمکی برای dnd-kit.",
  "react-draggable": "درگ کردن سادهٔ کامپوننت‌ها در React.",
  "react-color": "پالت و اجزای انتخاب رنگ برای React.",
  "react-phone-input-2": "فیلد ورودی شماره تلفن با فرمتینگ و پرچم‌ها.",
  "react-simple-star-rating": "کامپوننت رتبه‌دهی ستاره‌ای ساده.",
  "react-slider": "اسلایدر عددی/مقداری برای رابط‌های کاربری.",
  "@types/react": "تعاریف TypeScript برای React (type-only).",
  "@types/react-dom": "تعاریف TypeScript برای react-dom (type-only).",
  "@types/wavesurfer.js": "تعاریف TypeScript برای wavesurfer (type-only).",
  "patch-package": "ابزار اعمال پچ محلی روی node_modules بعد از نصب.",
  "next-router-mock": "ابزار شبیه‌سازی router در تست‌ها برای Next.js.",
  braces: "کتابخانهٔ کمکی پردازش الگوهای رشته‌ای — وابستهٔ فرعی.",
  ws: "کتابخانهٔ WebSocket برای Node.js (معمولاً سمت سرور).",
  jotai: "کتابخانهٔ سبک state management برای React.",
  "pdf-lib": "کتابخانهٔ ایجاد/ویرایش فایل‌های PDF در جاوااسکریپت.",
  "react-select": "کامپوننت select پیشرفته برای فرم‌ها.",
  "react-infinite-scroll-component": "کامپوننت پیمایش بی‌نهایت ساده برای لیست‌ها.",
  "lodash.throttle": "تابع throttle برای محدود کردن فراخوانی توابع.",
  "react-leaflet": "بایندینگ React برای کتابخانهٔ Leaflet (نقشه).",
  "@types/i18next": "تعاریف TypeScript برای i18next.",
  "@types/node": "تعاریف TypeScript برای محیط Node.js.",
  "@types/pako": "تعاریف TypeScript برای pako.",
  "@types/react-color": "تعاریف TypeScript برای react-color.",
  "@types/react-i18next": "تعاریف TypeScript برای react-i18next.",
  "@types/react-slider": "تعاریف TypeScript برای react-slider.",
  "@types/react-beautiful-dnd": "تعاریف قدیمی برای react-beautiful-dnd (احتمالاً یتیم).",
};

// ============================================================
//  HELPERS ☆
// ============================================================

function Stars({ n }: { n: number }) {
  return <span className={styles.stars}>{"★".repeat(n) + "".repeat(5 - n)}</span>;
}

function TierBadge({ tier }: { tier: TierKey }) {
  const cls = `tier${tier}` as keyof typeof styles;
  return <span className={`${styles.tierBadge} ${styles[cls]}`}>{tier}</span>;
}

function UsedBadge({ used, label }: { used: boolean; label: string }) {
  if (label === "Unused") return <span className={`${styles.badge} ${styles.badgeRed}`}>❌ یافت نشد</span>;
  if (label === "احتمالاً Unused") return <span className={`${styles.badge} ${styles.badgeYellow}`}>⚠️ احتمالی</span>;
  if (label === "Build-time") return <span className={`${styles.badge} ${styles.badgePurple}`}>🔧 Build</span>;
  if (label === "Indirect") return <span className={`${styles.badge} ${styles.badgeGray}`}>↩ غیرمستقیم</span>;
  if (label === "Type-only") return <span className={`${styles.badge} ${styles.badgeBlue}`}>T Type</span>;
  if (label === "Compat") return <span className={`${styles.badge} ${styles.badgeBlue}`}>🔗 Compat</span>;
  return <span className={`${styles.badge} ${styles.badgeGreen}`}>✅ فعال</span>;
}

function SafeBadge({ safe }: { safe: "no" | "yes" | "maybe" }) {
  if (safe === "yes") return <span className={`${styles.badge} ${styles.badgeGreen}`}>✅ بله</span>;
  if (safe === "maybe") return <span className={`${styles.badge} ${styles.badgeYellow}`}>⚠️ بررسی</span>;
  return <span className={`${styles.badge} ${styles.badgeRed}`}>❌ خیر</span>;
}

const TIER_LABELS: Record<TierKey, string> = {
  1: "Critical Runtime",
  2: "Core Framework & Infra",
  3: "Business Logic & State",
  4: "UI & Styling",
  5: "Tooling & DX",
  6: "Test-only",
  7: "🗑 Unused / Removable",
};

const TIER_DESCS: Record<TierKey, string> = {
  1: "بسته‌ها و ابزارهایی که در زمان اجرا (runtime) بحرانی هستند و حذف‌شان باعث شکست شدن اپ می‌شود.",
  2: "هسته فریم‌ورک و زیرساخت (auth, i18n, real-time) — اجزای مهم بستر.",
  3: "کتابخانه‌های مربوط به منطق تجاری و مدیریت state و تاریخ/زمان.",
  4: "کتابخانه‌های رابط کاربری، استایل‌ها و اجزای دیداری که UX را شکل می‌دهند.",
  5: "ابزارهای توسعه و تجربهٔ توسعه (type, patching, mocking).",
  6: "بسته‌های مخصوص تست که فقط در جریان تست/CI لازم هستند.",
  7: "بسته‌های بلااستفاده یا قابل حذف که وزن اضافه به bundle اضافه می‌کنند.",
};

// ============================================================
//  MAIN COMPONENT
// ============================================================

export default function DependencyReport() {
  const tiers = ([1, 2, 3, 4, 5, 7] as TierKey[]).map((t) => ({
    tier: t,
    label: TIER_LABELS[t],
    rows: DEPS.filter((d) => d.tier === t),
  }));

  return (
    <div className={styles.root}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerBadge}>Dependency Analysis Report</div>
        <h1 className={styles.headerTitle}>گزارش تحلیل وابستگی‌های پروژه</h1>
        <p className={styles.headerSub}>brancyui-next-app · Next.js 16 · تاریخ: ۲۳ فوریه ۲۰۲۶</p>
      </div>

      {/* STATS */}
      <div className={styles.statsGrid}>
        {STATS.map((s) => (
          <div className={styles.statCard} key={s.label}>
            <div className={`${styles.statNumber} ${styles[s.color as keyof typeof styles]}`}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ORPHAN ALERT */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>🗑</span>
          پکیج‌های یتیم — قابل حذف (Unused / Orphaned)
        </div>
        <div className={styles.orphanGrid}>
          {ORPHANS.map((o) => (
            <div className={styles.orphanCard} key={o.name}>
              <div className={styles.orphanName}>{o.name}</div>
              <div className={styles.orphanReason}>{o.reason}</div>
              <div className={styles.orphanSaving}>{o.saving}</div>
            </div>
          ))}
        </div>
      </div>

      {/* BUNDLE IMPACT */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>📦</span>
          تخمین تأثیر Bundle — بزرگترین پکیج‌ها
        </div>
        <div className={styles.bundleList}>
          {BUNDLE_BARS.map((b) => {
            const pct = Math.round((b.kb / b.maxKb) * 100);
            const barCls = `bundleBar${b.type.charAt(0).toUpperCase() + b.type.slice(1)}` as keyof typeof styles;
            const sizeCls = `bundleSize${b.type.charAt(0).toUpperCase() + b.type.slice(1)}` as keyof typeof styles;
            return (
              <div className={styles.bundleRow} key={b.name}>
                <div className={styles.bundleName}>
                  {b.name}
                  {b.tag === "lazy" && <span className={`${styles.tag} ${styles.tagLazy}`}>lazy</span>}
                  {b.tag === "dynamic" && <span className={`${styles.tag} ${styles.tagDynamic}`}>dynamic</span>}
                  {b.tag === "server" && <span className={`${styles.tag} ${styles.tagServer}`}>server</span>}
                </div>
                <div className={styles.bundleBarOuter}>
                  <div className={`${styles.bundleBarInner} ${styles[barCls]}`} style={{ width: `${pct}%` }} />
                </div>
                <div className={`${styles.bundleSize} ${styles[sizeCls]}`}>{b.label}</div>
              </div>
            );
          })}
        </div>
        <p className={styles.dimText} style={{ marginTop: 12 }}>
          🔴 قرمز = بلااستفاده &nbsp;|&nbsp; 🟡 زرد = lazy/dynamic load &nbsp;|&nbsp; 🔵 آبی = production &nbsp;|&nbsp;
          🟢 سبز = treeshaked &nbsp;|&nbsp; ⚫ خاکستری = server-only
        </p>
      </div>

      {/* FULL TABLE BY TIER */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>📋</span>
          جدول کامل طبقه‌بندی‌شده بر اساس تیر
        </div>
        {tiers.map(({ tier, label, rows }) => (
          <div key={tier} style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <TierBadge tier={tier} />
              <span style={{ fontWeight: 700, fontSize: 15 }}>{label}</span>
              <span className={styles.dimText}>({rows.length} پکیج)</span>
            </div>
            <div className={styles.dimText} style={{ marginBottom: 12 }}>
              {TIER_DESCS[tier]}
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>نام پکیج</th>
                    <th>وضعیت استفاده</th>
                    <th>اهمیت</th>
                    <th>حذف ایمن؟</th>
                    <th>تأثیر Bundle</th>
                    <th>کارایی</th>
                    <th>توضیح</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((d) => (
                    <tr key={d.name} className={!d.used ? styles.highlightRow : undefined}>
                      <td>
                        <span className={styles.mono}>{d.name}</span>
                      </td>
                      <td>
                        <UsedBadge used={d.used} label={d.usedLabel} />
                      </td>
                      <td>
                        <Stars n={d.stars} />
                      </td>
                      <td>
                        <SafeBadge safe={d.safe} />
                      </td>
                      <td className={styles.dimText}>{d.bundleLabel}</td>
                      <td className={styles.dimText}>{PKG_DESC[d.name] ?? ""}</td>
                      <td className={styles.dimText}>{d.note ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* DEVDEPS TABLE */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>🛠</span>
          devDependencies
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>نام پکیج</th>
                <th>وضعیت</th>
                <th>کارایی</th>
                <th>توضیح</th>
              </tr>
            </thead>
            <tbody>
              {DEV_DEPS.map((d) => (
                <tr key={d.name} className={!d.used ? styles.highlightRow : undefined}>
                  <td>
                    <span className={styles.mono}>{d.name}</span>
                  </td>
                  <td>
                    {d.used ? (
                      <span className={`${styles.badge} ${styles.badgeGreen}`}>✅ لازم</span>
                    ) : (
                      <span className={`${styles.badge} ${styles.badgeRed}`}>❌ یتیم</span>
                    )}
                  </td>
                  <td className={styles.dimText}>{PKG_DESC[d.name] ?? d.note ?? ""}</td>
                  <td className={styles.dimText}>{d.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DUPLICATES */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>🔄</span>
          نسخه‌های تکراری (Duplicate Versions)
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>پکیج</th>
                <th>نسخه‌های موجود</th>
                <th>علت</th>
                <th>تأثیر</th>
                <th>راه‌حل</th>
              </tr>
            </thead>
            <tbody>
              {DUPLICATES.map((d) => (
                <tr key={d.pkg} className={styles.dupRow}>
                  <td>{d.pkg}</td>
                  <td className={styles.dimText}>{d.versions}</td>
                  <td className={styles.dimText}>{d.cause}</td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeYellow}`}>{d.impact}</span>
                  </td>
                  <td className={styles.dimText}>{DUPLICATE_SOLUTIONS[d.pkg] ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RISKS */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>⚠️</span>
          تحلیل ریسک و نکات مهم
        </div>
        <div className={styles.riskGrid}>
          {RISKS.map((r) => {
            const cardCls =
              r.level === "red"
                ? styles.riskCardRed
                : r.level === "green"
                  ? styles.riskCardGreen
                  : styles.riskCardYellow;
            const icon = r.level === "red" ? "🔴" : r.level === "green" ? "✅" : "⚠️";
            return (
              <div key={r.title} className={`${styles.riskCard} ${cardCls}`}>
                <div className={styles.riskTitle}>
                  {icon} {r.title}
                </div>
                <div className={styles.riskDesc}>{r.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FINAL SUMMARY */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>🎯</span>
          خلاصه اجرایی و پیشنهاد اقدام
        </div>
        <div className={styles.finalBox}>
          <div>
            <div className={styles.finalBoxTitle}>✅ وضعیت خوب — ادامه دهید</div>
            <ul className={styles.finalBoxList}>
              <li>
                <span className={`${styles.dot} ${styles.dotGreen}`} />
                apexcharts با dynamic import — bundle تمیز
              </li>
              <li>
                <span className={`${styles.dot} ${styles.dotGreen}`} />
                heic2any با lazy import — بارگذاری درست
              </li>
              <li>
                <span className={`${styles.dot} ${styles.dotGreen}`} />
                react-quill-ver2 با ssr:false + پچ رسمی
              </li>
              <li>
                <span className={`${styles.dot} ${styles.dotGreen}`} />
                useInfiniteScroll custom hook — جایگزین عالی
              </li>
              <li>
                <span className={`${styles.dot} ${styles.dotGreen}`} />
                PWA در dev غیرفعال — پیکربندی درست
              </li>
              <li>
                <span className={`${styles.dot} ${styles.dotGreen}`} />
                terser drop_console — production تمیز
              </li>
            </ul>
          </div>
          <div>
            <div className={styles.finalBoxTitle}>🗑 اقدام پیشنهادی — حذف ایمن</div>
            <ul className={styles.finalBoxList}>
              <li>
                <span className={`${styles.dot} ${styles.dotRed}`} />
                <strong>pdf-lib</strong> — هیچ استفاده‌ای ندارد، ~450KB صرفه‌جویی
              </li>
              <li>
                <span className={`${styles.dot} ${styles.dotRed}`} />
                <strong>jotai</strong> — state manager بلااستفاده
              </li>
              <li>
                <span className={`${styles.dot} ${styles.dotRed}`} />
                <strong>react-select</strong> — هیچ import ندارد
              </li>
              <li>
                <span className={`${styles.dot} ${styles.dotRed}`} />
                <strong>react-infinite-scroll-component</strong> — custom hook جایگزین شده
              </li>
              <li>
                <span className={`${styles.dot} ${styles.dotRed}`} />
                <strong>lodash.throttle</strong> — دستی پیاده‌سازی شده
              </li>
              <li>
                <span className={`${styles.dot} ${styles.dotYellow}`} />
                <strong>@types/react-beautiful-dnd</strong> — پکیج اصلی نصب نیست
              </li>
            </ul>
          </div>
          <div>
            <div className={styles.finalBoxTitle}>⚠️ نیاز به بررسی بیشتر</div>
            <ul className={styles.finalBoxList}>
              <li>
                <span className={`${styles.dot} ${styles.dotYellow}`} />
                <strong>react-leaflet</strong> — تأیید کنید هیچ import پنهانی ندارد
              </li>
              <li>
                <span className={`${styles.dot} ${styles.dotYellow}`} />
                <strong>ws</strong> — آیا برای security override است؟ npm audit بررسی شود
              </li>
              <li>
                <span className={`${styles.dot} ${styles.dotYellow}`} />
                <strong>postcss</strong> — تعارض با نسخه داخلی Next.js بررسی شود
              </li>
            </ul>
          </div>
          <div>
            <div className={styles.finalBoxTitle}>🔧 بهبود ساختاری (بدون تغییر فوری)</div>
            <ul className={styles.finalBoxList}>
              <li>
                <span className={`${styles.dot} ${styles.dotBlue}`} />
                @types/react، @types/react-dom، typescript → devDeps
              </li>
              <li>
                <span className={`${styles.dot} ${styles.dotBlue}`} />
                @types/wavesurfer.js → devDeps
              </li>
              <li>
                <span className={`${styles.dot} ${styles.dotBlue}`} />
                react-color → بررسی جایگزین فعال‌تر
              </li>
              <li>
                <span className={`${styles.dot} ${styles.dotBlue}`} />
                حذف pdf-lib → مشکل پاکو سه‌نسخه‌ای را برطرف می‌کند
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
