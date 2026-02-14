import Head from "next/head";
import { useRouter } from "next/router";
import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  type KeyboardEvent,
} from "react";
import styles from "../invitation.module.css";

const users = [
  { name: "ahooraniazi", username: "اهورا نیازی", profileImage: "/invitation/ahooraniazi.jpg" },
  { name: "adelkhaan", username: "عادل خان", profileImage: "/invitation/adelkhaan.jpg" },
  { name: "arianabrouni", username: "آرین ابرونی", profileImage: "/invitation/arianabrouni.jpg" },
  { name: "mygadgetnews", username: "گجت نیوز", profileImage: "/invitation/mygadgetnews.jpg" },
  { name: "hajimohamadiinsta", username: "علی حاجی محمدی", profileImage: "/invitation/hajimohamadiinsta.jpg" },
  { name: "kooroshchaichi", username: "کوروش چایچی", profileImage: "/invitation/kooroshchaichi.jpg" },
  { name: "mahdi_shajari", username: "مهدی شجاری", profileImage: "/invitation/mahdi_shajari.jpg" },
  { name: "zizi.salimi", username: "زی زی سلیمی", profileImage: "/invitation/zizi.salimi.jpg" },
  { name: "digiato.online", username: "دیجیاتو", profileImage: "/invitation/digiato.online.jpg" },
  { name: "hassan__khosrojerdi", username: "حسن خسروجردی", profileImage: "/invitation/hassan__khosrojerdi.jpg" },
  { name: "sepehrzamaani", username: "سپهر زمانی", profileImage: "/invitation/sepehrzamaani.jpg" },
  { name: "alireza.sokhanvaran", username: "علیرضا سخنوران", profileImage: "/invitation/alireza.sokhanvaran.jpg" },
  { name: "ccina.design", username: "سینا ایمانی", profileImage: "/invitation/ccina.design.jpg" },
  { name: "iotechoi", username: "عایوتک", profileImage: "/invitation/iotechoi.jpg" },
  { name: "behzad.marashian", username: "بهزاد مرعشیان", profileImage: "/invitation/behzad.marashian.jpg" },
  { name: "masoudtaghipur", username: "مسعود تقی پور", profileImage: "/invitation/masoudtaghipur.jpg" },
  { name: "hashem.alghaili", username: "هاشم عقیلی", profileImage: "/invitation/hashem.alghaili.jpg" },
  { name: "behzadvaredi", username: "بهزاد واردی", profileImage: "/invitation/behzadvaredi.jpg" },
  { name: "thezoomit", username: "زومیت", profileImage: "/invitation/thezoomit.jpg" },
];
type SlideState = {
  currentSlide: number;
};

type SlideAction =
  | { type: "NEXT_SLIDE"; slideCount: number }
  | { type: "PREV_SLIDE"; slideCount: number }
  | { type: "GO_TO_SLIDE"; index: number; slideCount: number };

type FAQState = {
  openFaq: number | null;
};

type FAQAction = { type: "TOGGLE_FAQ"; index: number };

const slideReducer = (state: SlideState, action: SlideAction): SlideState => {
  switch (action.type) {
    case "NEXT_SLIDE":
      return {
        ...state,
        currentSlide: (state.currentSlide + 1) % action.slideCount,
      };
    case "PREV_SLIDE":
      return {
        ...state,
        currentSlide: (state.currentSlide - 1 + action.slideCount) % action.slideCount,
      };
    case "GO_TO_SLIDE":
      return {
        ...state,
        currentSlide: (action.index + action.slideCount) % action.slideCount,
      };
    default:
      return state;
  }
};

const faqReducer = (state: FAQState, action: FAQAction): FAQState => {
  switch (action.type) {
    case "TOGGLE_FAQ":
      return {
        ...state,
        openFaq: state.openFaq === action.index ? null : action.index,
      };
    default:
      return state;
  }
};

const InvitationPage: React.FC = () => {
  const componentId = useId();
  const router = useRouter();
  const { username } = router.query;
  const user = users.find((u) => u.name.toLowerCase().replace(/\s+/g, "") === (username as string)?.toLowerCase());
  // if (!user) {
  //   return <h1>User not found</h1>;
  // }
  const slideContainerRef = useRef<HTMLDivElement>(null);

  const [slideState, slideDispatch] = useReducer(slideReducer, {
    currentSlide: 0,
  });
  const [faqState, faqDispatch] = useReducer(faqReducer, { openFaq: null });

  const toggleFaq = useCallback((index: number) => {
    faqDispatch({ type: "TOGGLE_FAQ", index });
  }, []);

  const createStars = useCallback(
    (count: number, sectionKey: string) => {
      return Array.from({ length: count }).map((_, index) => ({
        id: `${componentId}-${sectionKey}-${index}`,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 3,
      }));
    },
    [componentId]
  );

  const headerStars = useMemo(() => createStars(30, "header"), [createStars]);

  const fixedStarts = useMemo(
    () => [
      { x: -1100, y: -200 },
      { x: -1100, y: -100 },
      { x: -1100, y: 0 },
      { x: -1100, y: 100 },
      { x: -1100, y: 200 },
      { x: 1100, y: -200 },
      { x: 1100, y: -100 },
      { x: 1100, y: 0 },
      { x: 1100, y: 100 },
      { x: 1100, y: 200 },
      { x: -950, y: -150 },
      { x: -950, y: 150 },
      { x: 950, y: -150 },
      { x: 950, y: 150 },
    ],
    []
  );

  const faqData = useMemo(
    () => [
      {
        question: "برنسی چیست؟",
        answer:
          "برنسی یک سوپراپلیکیشن یکپارچه است که تمام نیازهای کسب‌وکار دیجیتال شما در اینستاگرم را در یک پلتفرم واحد ارائه می‌دهد. از مدیریت فروشگاه آنلاین گرفته تا شبکه‌سازی اجتماعی، تبلیغات هوشمند و سیستم‌های پرداخت امن.",
      },
      {
        question: "چه خدماتی ارائه می‌دهد؟",
        answer:
          "مدیریت پیج و محتوای پیج برنسی شامل مدیریت فروشگاه و محصولات، سیستم  مدیریت سفارش‌ها و پرداخت، تبلیغات و بازاریابی هوشمند، شبکه اجتماعی داخلی، گزارش‌گیری و آمار دقیق، سیستم درآمدزایی با هوش مثصنوعی",
      },
      {
        question: "چطور ثبت‌نام کنیم؟",
        answer:
          "شما می‌توانید باشماره موبایل خود و اتصال پیج خود بدون درج پسورد برای ‌ثبت‌نام اقدام کرده و جزو اولین کاربرانی باشید که از مزایای ویژه به تمامی آپشن ها به صورت رایگان بهره‌مند می‌شوند.",
      },
      {
        question: "امنیت اطلاعات چطور تضمین می‌شود؟",
        answer:
          "برنسی توسط متا تایید شده و پارتنر رسمی متا می باشد لذا امنیت اطلاعات شما با امنیت کامل متا می باشد و برنسی به اطلاعات حساس شما دسترسی ندارد",
      },
      {
        question: "برنسی چه کسب و کار هایی را پوشش میدهد",
        answer:
          "برنسی طیف گسترده ای از کسب و کار های آنلاین اعم از اینفلوِنسر ها و فروشگاه های اینترنتی و آژانس های تبلیغاتی و تولید کنندگان محتوا و ادمین ها و گردانندگان پیج ها را پوشش میدهد",
      },
    ],
    []
  );

  const appPreviewImages = useMemo(
    () => [
      { src: "/landing/Page_Statistics.png", alt: "صفحه آمار اپلیکیشن برنسی" },
      { src: "/landing/admin-subadmin.png", alt: "مدیریت ادمین و ساب ادمین" },
      { src: "/landing/ads_adlist.png", alt: "لیست تبلیغات" },
      { src: "/landing/Page_Post.png", alt: "مدیریت پست ها" },
      { src: "/landing/Page_insight.png", alt: "بینش ها و اینسایت" },
      { src: "/landing/Page_AutomaticPost.png", alt: "پست خودکار" },
      { src: "/landing/Page_tools.png", alt: "ابزارها" },
      { src: "/landing/Product_List.png", alt: "لیست محصولات" },
    ],
    []
  );

  const avatarsData = useMemo(() => {
    // فیلتر کردن کاربران برای حذف کاربر فعلی
    const otherUsers = users.filter((u) => u.name !== user?.name);

    // تبدیل کاربران دیگر به فرمت avatarsData
    return otherUsers.map((u, index) => ({
      src: u.profileImage,
      className: `avatar${index + 1}`,
    }));
  }, [user]);

  const featuresData = useMemo(
    () => [
      {
        icon: "/invitation/graph.svg",
        title: "ابزارهای آماری و تحلیلی پیج",
        description: `رصد پیج، رفتار کاربران، تحلیل اطلاعات مختلف بصورت حرفه ای
گزارش‌های تحلیلی اختصاصی برای هر محتوا با نمودارهای مقایسه‌ای
تحلیل دقیق و لحظه‌ای ریچ، ایمپرشن و نرخ تعامل و ارائه بینش قدرتمند`,
        cardClass: "storeCard",
        alt: "آیکون آمار و تحلیل وب‌سایت",
      },
      {
        icon: "/invitation/admin.svg",
        title: "تعیین ادمین و مدیر پیج",
        description: `عدم نیاز ادمین‌ها به پسوورد و لاگین
تعیین دسترسی اختصاصی برای هر ادمین
جلوگیری از لیمیت شدن اکانت
استخدام ادمین
تعیین ساعت کاری`,
        cardClass: "customerCard",
        alt: "آیکون مدیریت مشتریان",
      },
      {
        icon: "/invitation/ads.svg",
        title: "مدیریت سفارش‌ها و تبلیغات",
        description: `مدیریت سفارشات تبلیغ و زمانبدی خودکار
امکان بررسی بهتر پیج توسط کاربران و افزایش نرخ سفارشات موفق
تقویم محتوایی قابل ویرایش و قابل اشتراک‌گذاری برای تیم‌های محتوایی
بیش از ده ابزار دیگر خدمات تبلیغ و بلاگری`,
        cardClass: "orderCard",
        alt: "آیکون مدیریت سفارشات و تبلیغات",
      },
      {
        icon: "/invitation/store.svg",
        title: "مدیریت محصولات و فروشگاه",
        description: `مدیریت سفارشات، محصولات و گزارشات
انبارداری و حسابداری و مدیریت مشتریان
افزایش بازدید و فروش حتی بین غیرفالوئرها
طبقه بندی و ارائه حرفه‌ای توضیحات، تصاویر و جزئیات محصولات`,
        cardClass: "marketingCard",
        alt: "آیکون فروشگاه و بازاریابی",
      },
      {
        icon: "/invitation/engage.svg",
        title: "مدیریت سریع محتوا و تعاملات",
        description: `برنامه‌ریزی انتشار برای پست‌ها، ریلز و استوری
پلتفرم اختصاصی و قدرتمند پیامرسانی و کاتمنت‌ها
پاسخ‌دهی خودکار به کامنت‌ها و دایرکت‌ها
تقویم محتوایی قابل ویرایش و قابل اشتراک‌گذاری برای تیم‌های تولید محتوایی`,
        cardClass: "socialCard",
        alt: "آیکون تعامل و شبکه اجتماعی",
      },
      {
        icon: "/invitation/website.svg",
        title: "وب سایت اختصاصی (مارکت لینک)",
        description: `وبسایت اختصاصی با آدرس متناسب با پیج اینستاگرام
شخصی سازی و سازماندهی لندینگ پیج متناسب با نیاز
لینک‌های کوتاه با قابلیت حذف خودکار و یک‌بار مصرف،
آمار کامل رفتار کاربران روی لینک بایو (کلیک‌ها، منابع، نرخ تعامل)`,
        cardClass: "analyticsCard",
        alt: "آیکون نمودار مدیریت فروشگاه",
      },
      {
        icon: "/invitation/lottory.svg",
        title: "مدیریت قرعه کشی و رویدادها",
        description: `امکان برگزاری انواع قرعه کشی عادلانه و شفاف
اشتراک گذاری راحت و حرفه ای نتایج قرعه کشی و سایر رویدادها
دریافت گزارش های مختلف از عملکرد کاربران، کامنت کاربران و...
وضوح بیشتر و افزایش اعتماد و رضایت کاربران`,
        cardClass: "LotteryCard",
        alt: "آیکون قرعه‌کشی و مسابقات",
      },
      {
        icon: "/invitation/ai.svg",
        title: "فعالیت سریع تر با هوش مصنوعی",
        description: `مدیریت هوشمند محتوای تقویمی با اولویت‌بندی خودکار
یشنهاد زمان طلایی انتشار بر اساس رفتار مخاطبان و الگوریتم‌ها
تحلیل پست‌ها و ارائه پیشنهاد بهبود
تعامل و پاسخ خودکار با کاربران`,
        cardClass: "aiCard",
        alt: "آیکون هوش مصنوعی",
      },
    ],
    []
  );

  const horizontalCardsData = useMemo(
    () => [
      {
        title: "رابط کاربری مدرن و منعطف",
        cardClass: "aiCard",
        hasGlow: true,
        features: [
          "حداکثر کاربردپذیری و سهولت استفاده",
          "ورژن موبایل، دسکتاپ و تبلت کاملا استاندارد",
          "طراحی بر اساس نیاز و بازخورد کاربران",
          "بر اساس آخرین ترند روز دنیا",
        ],
        image: "/invitation/1000.png",
        imageAlt: "تصویر رابط کاربری مدرن برنسی",
      },
      {
        title: "یکپارچگی و سرعت",
        cardClass: "",
        hasGlow: false,
        features: ["پوشش انواع نیازها", "آپدیت های دائمی", "کاملا بهینه و سریع", "عدم محدودیت تعداد اکانت ها"],
        image: "/invitation/1001.png",
        imageAlt: "تصویر یکپارچگی و سرعت برنسی",
      },
      {
        title: "چندزبانه و منعطف",
        cardClass: "",
        hasGlow: false,
        features: ["تقویم میلادی و شمسی", "دسترسی بین المللی", "عدم محدودیت کاربران", "سیستم مالی منعطف"],
        image: "/invitation/1002.png",
        imageAlt: "تصویر قابلیت چندزبانه برنسی",
      },
      {
        title: "امنیت و اطمینان کامل",
        cardClass: "",
        hasGlow: false,
        features: [
          "دارای مجوز رسمی از اینستاگرام و متا",
          "بدون نیاز به پسوورد پیج",
          "بدون لیمیت و محدودیت‌های رایج",
          "همگام با آخرین آپدیت اینستاگرام",
        ],
        image: "/invitation/1003.png",
        imageAlt: "تصویر امنیت و اطمینان برنسی",
        imageStyle: { width: "350px" },
      },
      {
        title: "قیمت بصرفه در برابر خدماتی فراتر از تصور",
        cardClass: "",
        hasGlow: false,
        features: [
          "خدمات تمام اپلیکیشن ها و وب سایت‌ها در یک پلتفرم",
          "حداقل ده برابر کاهش هزینه برای مدیریت پیج",
          "ارایه ی تمامی فیچر های پولی به صورت رایگان",
          "ارتباط تمامی بخش ها با یکدیگر و پیج به صورت یکپارچه",
        ],
        image: "/invitation/1004.png",
        imageAlt: "تصویر قیمت بصرفه برنسی",
      },
      {
        title: "یک قدم تا شروع",
        cardClass: "",
        hasGlow: false,
        features: [
          "ثبت نام رایگان و سریع",
          "پوشش کسب کار داخل اینستاگرام",
          "چهل روز استفاده فول به صورت رایگان",
          "پوشش کامل مالی و شغلی",
        ],
        image: null,
        imageAlt: null,
      },
    ],
    []
  );

  const slideCount = appPreviewImages.length;
  const autoPlayInterval = 5000;

  const goToSlide = useCallback(
    (index: number) => {
      slideDispatch({ type: "GO_TO_SLIDE", index, slideCount });
    },
    [slideCount]
  );

  const goNext = useCallback(() => {
    slideDispatch({ type: "NEXT_SLIDE", slideCount });
  }, [slideCount]);

  const goPrev = useCallback(() => {
    slideDispatch({ type: "PREV_SLIDE", slideCount });
  }, [slideCount]);

  useEffect(() => {
    const id = setInterval(goNext, autoPlayInterval);
    return () => clearInterval(id);
  }, [goNext, autoPlayInterval]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
      }
      if (e.key === "ArrowRight") {
        goNext();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      } else if (e.key === "Escape") {
        if (slideContainerRef.current) {
          slideContainerRef.current.blur();
        }
      }
    },
    [goNext, goPrev]
  );

  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

  useLayoutEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
        }
      });
    };

    intersectionObserverRef.current = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: "50px",
    });

    const animatedElements = document.querySelectorAll("[data-animate]");
    animatedElements.forEach((el) => {
      intersectionObserverRef.current?.observe(el);
    });

    return () => {
      intersectionObserverRef.current?.disconnect();
    };
  }, []);

  const handleFAQKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleFaq(index);
      }
    },
    [toggleFaq]
  );

  return (
    <>
      <Head>
        <title>برنسی - سوپراپلیکیشن مدیریت کسب‌وکار اینستاگرام | Brancy</title>
        <meta
          name="description"
          content="برنسی، اولین سوپراپلیکیشن ایرانی برای مدیریت کامل کسب‌وکار در اینستاگرام. ابزارهای حرفه‌ای CRM، فروشگاه آنلاین، تبلیغات هوشمند و تحلیل آمار در یک پلتفرم یکپارچه و امن. دارای مجوز رسمی از متا و اینستاگرام."
        />
        <meta
          name="keywords"
          content="برنسی, اینستاگرام, CRM, فروشگاه آنلاین, مدیریت کسب‌وکار, تبلیغات اینستاگرام, آمار اینستاگرام, سوپراپلیکیشن"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Brancy Team" />
        <link rel="canonical" href="https://brancy.app/invitation" />

        <meta property="og:title" content="برنسی - سوپراپلیکیشن مدیریت کسب‌وکار اینستاگرام" />
        <meta
          property="og:description"
          content="اولین سوپراپلیکیشن ایرانی برای مدیریت کامل کسب‌وکار در اینستاگرام. دارای مجوز رسمی از متا و اینستاگرام."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://brancy.app/invitation" />
        <meta property="og:image" content="https://brancy.app/landing/og-image.png" />
        <meta property="og:site_name" content="Brancy" />
        <meta property="og:locale" content="fa_IR" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="برنسی - سوپراپلیکیشن مدیریت کسب‌وکار اینستاگرام" />
        <meta
          name="twitter:description"
          content="اولین سوپراپلیکیشن ایرانی برای مدیریت کامل کسب‌وکار در اینستاگرام. دارای مجوز رسمی از متا و اینستاگرام."
        />
        <meta name="twitter:image" content="https://brancy.app/landing/og-image.png" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "برنسی",
              applicationCategory: "BusinessApplication",
              description: "سوپراپلیکیشن مدیریت کسب‌وکار اینستاگرام",
              url: "https://brancy.app",
              operatingSystem: "Web, iOS, Android",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "IRR",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "1247",
              },
            }),
          }}
        />
      </Head>
      <main className={`${styles.container} translate`}>
        <div className={styles.starsBackground}>
          {headerStars.map((star) => (
            <div
              key={star.id}
              className={styles.star}
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}
        </div>

        <header className={styles.header} role="banner">
          <div className={styles.headerContent} data-animate>
            <svg fill="none" xmlns="http://www.w3.org/2000/svg" width="80px" viewBox="0 0 74 75" aria-hidden="true">
              <path
                d="M55.36 61.46a32 32 0 0 0-8.57 7.48q.92-.14 1.8-.34a31 31 0 0 1 11.23-8.1q.38-.73.68-1.53-2.56.95-5.14 2.5m-3.02-3.37a81 81 0 0 1 9.24-4.14q.07-.96.07-1.98v-.35a86 86 0 0 0-10.28 4.54c-6.61 3.5-11.5 7.91-14.5 13.15h2.5c2.82-4.4 7.18-8.18 12.97-11.23m-5.27-5.49 2.6-1.18c3.91-1.74 7.7-3.43 11.21-5.28a16 16 0 0 0-1.32-3.28c-3.49 1.87-7.31 3.57-11.26 5.34l-2.62 1.17c-6.87 3.08-14.5 7.31-18.94 15.16a32 32 0 0 0-2.21 4.8h3.72q.62-1.51 1.48-3.02c3.94-6.97 10.98-10.84 17.34-13.7z"
                fill="#EBEBEB"
              />
              <path
                d="m42.3 45.39 1.34-.56c4.51-1.85 8.91-3.65 12.88-5.9a16 16 0 0 0-3.22-2.26 129 129 0 0 1-10.94 4.88L41 42.1c-7.87 3.24-16.7 7.45-21.68 16.3a32 32 0 0 0-3.44 9.4 4.3 4.3 0 0 0 3.23 1.52c.52-3 1.5-6.13 3.2-9.15 4.44-7.88 12.3-11.63 19.97-14.78zM24.15 6.41h-1.1a35 35 0 0 1-8.25 6.02v.88a35 35 0 0 0 9.35-6.9m10.5 0H33.1c-4.01 5.2-10.27 8.8-16.8 12.55l-1.5.87v1.43l2.1-1.21c6.96-4.01 13.62-7.85 17.74-13.64m12.76.82q-1-.27-2.12-.44c-3.38 7.25-10.46 10.8-17.95 14.58-4.27 2.15-8.65 4.35-12.53 7.33v2.75c4.02-3.4 8.8-5.8 13.46-8.14 8-4.02 15.54-7.81 19.15-16.08M34.73 29.38c8.6-3.53 17.47-7.18 22.2-15.66q-.88-1.36-2.08-2.52c-4.05 8.25-12.4 11.7-21.24 15.33-6.65 2.74-13.48 5.55-18.8 10.57v4.4c5.13-6.03 12.64-9.12 19.92-12.12m4.9 7.58c6.95-2.62 14.07-5.31 19.43-10.23a21 21 0 0 0 .3-5.45c-4.86 6.31-12.7 9.26-20.92 12.37-8.66 3.28-17.59 6.65-23.63 14.2v6.35l.35-.66c5.23-9.31 15.02-13 24.48-16.57z"
                fill="#EBEBEB"
              />
            </svg>
            <div className={styles.starsvg} aria-hidden="true">
              <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2106 2106">
                <path
                  d="m1052.6 72 32.6 607.5L1223 86.9l-73.4 603.9L1388 131l-177.1 582 332-509.7-275.5 542.4L1683 301.4l-365.5 486.3 486.3-365.4-444.3 415.4 542.4-275.4-509.8 332 582-177.1-559.6 238.4 603.9-73.3-592.6 137.6 607.5 32.7-607.5 32.6 592.6 137.7-604-73.4L1974 1388l-582-177.1 509.8 332-542.4-275.5 444.3 415.5-486.3-365.5 365.5 486.3-415.5-444.3 275.5 542.4-332-509.8 177 582-238.4-559.6 73.4 603.9-137.7-592.6-32.6 607.5-32.7-607.5-137.6 592.6 73.3-604L717.2 1974l177-582-332 509.8 275.5-542.4-415.4 444.3 365.4-486.3L301.4 1683l444.4-415.5L203.4 1543l509.7-332-582 177 559.7-238.4L86.9 1223l592.6-137.7L72 1052.6l607.5-32.7L86.9 882.3l603.9 73.3L131 717.2l582 177-509.7-332 542.4 275.5-444.4-415.4 486.3 365.4-365.4-486.3 415.4 444.4-275.4-542.4 332 509.7-177.1-582 238.4 559.7-73.3-603.9 137.6 592.6z"
                  fill="#65768E50"
                />
              </svg>
            </div>

            <h1 className={styles.mainTitle}>
              ،یک سوپر اپلیکیشن یکپارچه و امن
              <br />
              بجای ده‌ها اپلیکیشن متفرقه
            </h1>

            <p className={styles.subtitle}>
              برنسی تمام ابزارهای مورد نیاز روزانه شما را در یک پلتفرم واحد جمع کرده است
              <br />
              امن، سریع و کاربرپسند - تجربه‌ای نو از دنیای دیجیتال
            </p>

            <div className={styles.VerifiedBadge}>
              <svg width="24" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 21" aria-hidden="true">
                <path
                  d="M9.3 1c1-1 2.6-1 3.5-.1l.9.8q.6.7 1.7.7h1.2c1.4 0 2.5 1.2 2.5 2.6v1q0 1 .7 1.8l.8.8c1 1 1 2.6 0 3.6l-.8.8q-.6.8-.7 1.8V16q-.2 2.3-2.5 2.5h-1.2q-1 0-1.7.8l-.8.8c-1 1-2.6 1-3.6 0l-.8-.8q-.7-.8-1.8-.8H5.6A2.5 2.5 0 0 1 3 16v-1q0-1-.8-1.8l-.8-.8a2.5 2.5 0 0 1 0-3.6l.8-.8q.8-.7.8-1.8V4.8a2.5 2.5 0 0 1 2.5-2.2h1.1q1 0 1.8-.8zm6 6.5a1 1 0 0 0-1.4 0l-4 4-1.5-1.6a1 1 0 0 0-1.5 1.4l2.3 2.3a1 1 0 0 0 1.4 0l4.7-4.7q.6-.8 0-1.4"
                  fill="#3CCC67"
                />
              </svg>
              Verified by Meta & Instagram
            </div>

            <div className={styles.logoSection}>
              <div className={styles.appIconsContainer}>
                {fixedStarts.slice(0, 12).map((start, i) => {
                  const isLeft = start.x < 0;
                  const angleDeg = (Math.atan2(-start.y, -start.x) * 180) / Math.PI;
                  const styleVars: React.CSSProperties = {
                    ["--from-x" as any]: `${start.x}px`,
                    ["--from-y" as any]: `${start.y}px`,
                    ["--angle" as any]: `${angleDeg.toFixed(2)}deg`,
                    ["--trail-length" as any]: `${140 + (i % 5) * 12}px`,
                    ["--trail-duration" as any]: `${6 + (i % 4) * 0.9}s`,
                    ["--trail-delay" as any]: `${(i % 6) * 0.45}s`,
                  };
                  return (
                    <div
                      key={`trail-${i}`}
                      className={styles.trail}
                      data-side={isLeft ? "left" : "right"}
                      style={styleVars}
                    />
                  );
                })}
                {Array.from({ length: 10 }).map((_, i) => {
                  const start = fixedStarts[i % fixedStarts.length];
                  const isLeft = start.x < 0;
                  const jitter = (seed: number) => (seed % 3) * 0.07;
                  const styleVars: React.CSSProperties = {
                    ["--from-x" as any]: `${start.x}px`,
                    ["--from-y" as any]: `${start.y}px`,
                    ["--mid-x" as any]: `${Math.round(start.x * 0.2)}px`,
                    ["--mid-y" as any]: `${Math.round(start.y * 0.08)}px`,
                    ["--duration" as any]: `${(isLeft ? 11.5 : 12.5) + (i % 5) * (isLeft ? 1.1 : 0.95)}s`,
                    ["--delay" as any]: `${((i % 4) * 0.8 + (isLeft ? jitter(i) : jitter(i + 1))).toFixed(2)}s`,
                  };
                  const imgIndex = (i % 10) + 1;
                  return (
                    <div
                      key={`magnet-${i}`}
                      className={styles.appIcon}
                      data-side={isLeft ? "left" : "right"}
                      style={styleVars}>
                      <img src={`/invitation/svgservice${imgIndex}.svg`} alt={`service icon ${imgIndex}`} />
                    </div>
                  );
                })}
              </div>

              <div className={styles.brancyLogo}>
                <button className={styles.uiverse} type="button" aria-label="Brancy">
                  <div className={styles.wrapper}>
                    <a href="https://brancy.app">
                      <span>Brancy</span>
                    </a>
                    {Array.from({ length: 12 }, (_, i) => (
                      <div key={i} className={`${styles.circle} ${styles[`circle-${12 - i}`]}`}></div>
                    ))}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className={styles.introSection} data-animate>
          <div className={styles.gradientBackground}>
            <div className={styles.gradientShape1}></div>
            <div className={styles.gradientShape2}></div>
            <div className={styles.gradientShape3}></div>
          </div>
          <div className={styles.introContainer}>
            <h2 className={styles.mainTitle}>{user?.username} عزیز</h2>
            <h2 className={styles.mainTitle}> به آنباکسینگ برنسی خوش آمدید</h2>

            <p className={styles.subtitle}>
              اکنون به عنوان اولین اینستاگرمر های منتخب، با دسترسی پریمیوم به نسخه ی بتا برنسی دعوت شدید
            </p>
            <div className={styles.networkContainer}>
              <div className={styles.communityAvatars}>
                <div className={styles.avatarNewparent}>
                  <img
                    className={styles.avatarNew}
                    style={{ width: "120px", height: "120px" }}
                    src={user?.profileImage || "/no-profile.svg"}
                    alt="کاربر جدید در جامعه برنسی"
                    loading="eager"
                  />
                  <span />
                </div>
                {avatarsData.map((avatar, index) => (
                  <img
                    key={index}
                    className={`${styles.avatarCircle} ${styles[avatar.className]}`}
                    src={avatar.src}
                    alt="عضو جامعه برنسی"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
            <a href="https://brancy.app" aria-label="ورود به محیط کاربری برنسی">
              <button className={styles.ctaButton}>ورود به محیط کاربری</button>{" "}
            </a>
          </div>
        </section>

        <section className={styles.featuresSection} data-animate>
          <div className={styles.featuresContainer}>
            <div className={styles.featuresTitleContainer}>
              <h2 className={styles.mainTitle}>ویژگی‌های منحصر به فرد برنسی</h2>
              <p className={styles.subtitle}>
                تمامی ابزار هایی که برای مدیریت پیج اینستاگرم و یا کسب و کار آنلاین خود در اینستاگرم نیاز دارید را برنسی
                به شما ارایه میدهد{" "}
              </p>
            </div>

            <div className={styles.featuresGrid}>
              {featuresData.map((feature, index) => (
                <article key={index} className={`${styles.featureCard} ${styles[feature.cardClass]}`}>
                  <div className={styles.featureCardGlow}></div>
                  <img className={styles.featureIcon} src={feature.icon} alt={feature.alt} loading="lazy" />
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>
                    {feature.description.split("\n").map((line, lineIndex) => (
                      <span key={lineIndex}>
                        {line}
                        {lineIndex < feature.description.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Why Brancy is Different Section */}
        <section className={styles.whyDifferentSection}>
          <div className={styles.whyDifferentContainer}>
            {/* Section Title */}
            <div className={styles.whyDifferentTitleContainer}>
              <h2 className={styles.whyDifferentTitle}>چرا برنسی یک تحول متفاوت است؟</h2>
              <p className={styles.subtitle}>نیم نگاهی به بخشی از مهمترین ویژگی‌های سوپراپلیکیشن برنسی </p>
            </div>

            {/* Horizontal Cards */}
            <div className={styles.horizontalCards}>
              {horizontalCardsData.map((card, index) => (
                <div key={index} className={`${styles.horizontalCard} ${card.cardClass ? styles[card.cardClass] : ""}`}>
                  {card.hasGlow && <div className={styles.horizontalCardGlow}></div>}
                  <div className={styles.horizontalCardContent}>
                    <img
                      className={styles.horizontalCardIcon}
                      src="/invitation/safe.svg"
                      alt="آیکون امنیت و ایمنی"
                      loading="lazy"
                    />
                    <h3 className={styles.horizontalCardTitle}>{card.title}</h3>
                  </div>
                  <div className={styles.cardlist}>
                    {card.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className={styles.horizontalCardText}>
                        <img style={{ width: "16px" }} src="/invitation/star.svg" alt="ستاره" loading="lazy" />
                        <p className={styles.horizontalCardDescription}>{feature}</p>
                      </div>
                    ))}
                  </div>
                  {card.image && (
                    <img
                      className={styles.horizontalCardIconpng}
                      src={card.image}
                      alt={card.imageAlt}
                      style={card.imageStyle || {}}
                      loading="lazy"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <div className={styles.faqContainer}>
            {/* FAQ Title */}
            <div className={styles.faqTitleContainer}>
              <h2 className={styles.faqTitle}>سوالات متداول </h2>
              <h2 className={styles.faqTitle} style={{ fontSize: "5rem" }}>
                {" "}
                FAQ
              </h2>
              <p className={styles.faqSubtitle}>
                پاسخی به سوالات متداول و پرتکرار در مورد برنسی، که می‌تواند به راحتی مطالعه نمایید
              </p>
            </div>

            {/* FAQ List */}
            <div className={styles.faqList}>
              {faqData.map((faq, index) => (
                <div key={index} className={styles.faqItem}>
                  <button
                    className={styles.faqQuestion}
                    onClick={() => toggleFaq(index)}
                    onKeyDown={(e) => handleFAQKeyDown(e, index)}
                    aria-expanded={faqState.openFaq === index}
                    aria-controls={`faq-answer-${componentId}-${index}`}
                    style={faqState.openFaq === index ? { background: "#65768e30" } : {}}>
                    <div
                      className={styles.faqIcon}
                      style={faqState.openFaq === index ? { transform: "rotate(180deg)" } : {}}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                      </svg>
                    </div>
                    <span className={styles.horizontalCardTitle}>{faq.question}</span>
                  </button>
                  <div
                    id={`faq-answer-${componentId}-${index}`}
                    className={styles.faqAnswer}
                    style={{
                      maxHeight: faqState.openFaq === index ? "500px" : "0",
                    }}
                    aria-hidden={faqState.openFaq !== index}>
                    <div className={styles.faqAnswerContent}>
                      <img
                        className={styles.faqAnswerContentback}
                        src="/invitation/background1.png"
                        alt="تصویر پس‌زمینه محتوای پاسخ"
                        loading="lazy"
                      />
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* App Preview Section */}
        <section className={styles.appPreviewSection}>
          <img
            className={styles.appPreviewback}
            src="/invitation/background.png"
            alt="تصویر پس‌زمینه پیش‌نمایش اپلیکیشن"
            loading="lazy"
          />

          <div className={styles.appPreviewContainer}>
            <div className={styles.appPreviewTitleContainer}>
              <h2 className={styles.mainTitle}>پیش‌نمایش اپلیکیشن برنسی</h2>
              <p className={styles.subtitle}>تجربه‌ای نوین از مدیریت کسب‌وکار دیجیتال در دستان شما</p>
            </div>
            <div
              className={styles.appSlideshow}
              role="region"
              aria-label="پیش نمایش اسلاید اپلیکیشن"
              tabIndex={0}
              onKeyDown={handleKeyDown}
              ref={slideContainerRef}>
              <button
                type="button"
                aria-label="قبلی"
                className={`${styles.slideNavBtn} ${styles.prevBtn}`}
                onClick={goPrev}>
                ‹
              </button>
              <button
                type="button"
                aria-label="بعدی"
                className={`${styles.slideNavBtn} ${styles.nextBtn}`}
                onClick={goNext}>
                ›
              </button>
              <div className={styles.slidesTrack} style={{ ["--current-index" as any]: slideState.currentSlide }}>
                {appPreviewImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`${styles.slide} ${idx === slideState.currentSlide ? styles.activeSlide : ""}`}
                    aria-hidden={idx === slideState.currentSlide ? "false" : "true"}>
                    <div className={styles.slideImgWrapper}>
                      <img
                        src={img.src}
                        alt={img.alt}
                        className={styles.appScreenshot}
                        loading={idx === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.dots} role="tablist" aria-label="ناوبری اسلایدها">
                {appPreviewImages.map((_, idx) => (
                  <button
                    key={idx}
                    role="tab"
                    aria-selected={idx === slideState.currentSlide}
                    aria-label={`اسلاید ${idx + 1}`}
                    className={`${styles.dot} ${idx === slideState.currentSlide ? styles.activeDot : ""}`}
                    onClick={() => goToSlide(idx)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Secondary CTA Section */}
        <section className={styles.secondaryCtaSection}>
          {/* Gradient Background */}

          <div className={styles.secondaryCtaContainer}>
            {/* CTA Content */}
            <div className={styles.secondaryCtaContent}>
              <h2 className={styles.mainTitle}>آماده تجربه برنسی هستید؟</h2>

              <p className={styles.subtitle}>
                در جهان پرسرعت، شتاب خودت رو با مدیریت هوشمند بیشتر کن
                <br />
                همین الان وارد شوید و جزو اولین کاربران باشید
              </p>

              {/* Main CTA Button */}

              <a href="https://brancy.app" aria-label="ورود به پنل برنسی">
                <button className={styles.secondaryCtaButton}>
                  <span className={styles.secondaryCtaButtonText}>ورود به پنل</span>

                  <div className={styles.secondaryCtaButtonIcon}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z" />
                    </svg>
                  </div>
                </button>
              </a>
            </div>
          </div>
        </section>

        {/* Footer Section */}
        <section className={styles.footerSection}>
          <div className={styles.footerContainer}>
            {/* Main Footer Content */}

            <div className={styles.orbitalNetwork}>
              <div className={styles.footerLogoContainer}>
                <div className={styles.footerLogo}>
                  <div className={styles.footerLogoGlow}></div>
                  <img
                    style={{ position: "relative" }}
                    src="/invitation/brancyLogo.png"
                    alt="Brancy Logo"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className={styles.orbitalRing1}>
                <div className={styles.orbitalDot1}></div>
                <div className={styles.orbitalDot2}></div>
              </div>
              <div className={styles.orbitalRing2}>
                <div className={styles.orbitalDot3}></div>
                <div className={styles.orbitalDot4}></div>
                <div className={styles.orbitalDot5}></div>
              </div>
              <div className={styles.orbitalRing3}>
                <div className={styles.orbitalDot6}></div>
                <div className={styles.orbitalDot7}></div>
                <div className={styles.orbitalDot8}></div>
                <div className={styles.orbitalDot9}></div>
              </div>
              <img
                className={styles.footerLogoflow1}
                src="/invitation/instagram.png"
                alt="لوگو اینستاگرام"
                loading="lazy"
              />
              <img className={styles.footerLogoflow2} src="/invitation/meta.png" alt="لوگو متا" loading="lazy" />
            </div>

            {/* Footer Bottom */}
          </div>
        </section>
        <footer className={styles.footerparent}>
          <div className={styles.legalText}>
            <div className={styles.legalLinks}>
              <a href="https://brancy.app">امکانات</a>
              <span>|</span>
              <a href="https://brancy.app">ارتباط با ما</a>
              <span>|</span>
              <a href="https://brancy.app">خدمات ما</a>
            </div>
            <p>&copy; 2025 برنسی (Brancy). تمامی حقوق محفوظ است.</p>
          </div>
          <div className={styles.companyId}>
            برنسی، نخستین پلتفرم ایرانی تحلیل‌محور اینفلوئنسر مارکتینگ با بهره‌گیری از هوش مصنوعی است. ما با پردازش
            داده‌های واقعی و رفتار کاربران در شبکه‌های اجتماعی، به برندها کمک می‌کنیم تا هوشمندانه‌تر، سریع‌تر و دقیق‌تر
            با اینفلوئنسرهای مناسب همکاری کنند. در برنسی، اثربخشی تبلیغات دیجیتال را قابل سنجش و قابل پیش‌بینی کرده‌ایم.
          </div>
        </footer>
      </main>
    </>
  );
};

export default InvitationPage;
