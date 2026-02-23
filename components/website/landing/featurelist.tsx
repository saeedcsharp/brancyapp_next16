import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import styles from "brancy/components/website/landing/featurelist.module.css";
interface FeatureListProps {
  isPopupOpen: boolean;
  isAnimatingOut: boolean;
  onClose: () => void;
}
interface Plan {
  name: string;
  price: string;
  level: string;
  bgColor: string;
  textColor: string;
}
interface Feature {
  name: string;
  tooltip: string;
  plans: boolean[];
}
interface FeatureCategory {
  name: string;
  features: Feature[];
  isOpen: boolean;
}
const FeatureList: React.FC<FeatureListProps> = ({ isPopupOpen, isAnimatingOut, onClose }) => {
  const { t } = useTranslation();
  const [openTooltips, setOpenTooltips] = useState<Set<number>>(new Set());
  const [openCategories, setOpenCategories] = useState<Set<number>>(new Set([0]));
  const toggleTooltip = (index: number) => {
    setOpenTooltips((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };
  const toggleCategory = (categoryIndex: number) => {
    setOpenCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryIndex)) {
        newSet.delete(categoryIndex);
      } else {
        newSet.add(categoryIndex);
      }
      return newSet;
    });
  };
  useEffect(() => {
    if (!isPopupOpen) {
      setOpenTooltips(new Set());
      setOpenCategories(new Set([0]));
    }
  }, [isPopupOpen]);
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isPopupOpen) {
        onClose();
      }
    };
    if (isPopupOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isPopupOpen, onClose]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`.${styles.tooltip}`) && !target.closest(`.${styles.tooltipContent}`)) {
        setOpenTooltips(new Set());
      }
    };
    if (isPopupOpen && openTooltips.size > 0) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isPopupOpen, openTooltips.size]);
  const plans: Plan[] = [
    {
      name: t(LanguageKey.Beginner),
      price: "100 – 1K",
      level: t(LanguageKey.level) + " 1",
      bgColor: "#B3FFD6",
      textColor: "#4CAF50",
    },
    {
      name: t(LanguageKey.Basic),
      price: "1K – 10K",
      level: t(LanguageKey.level) + " 2",
      bgColor: "#B3E5FF",
      textColor: "#2196F3",
    },
    {
      name: t(LanguageKey.Growing),
      price: "10K – 50K",
      level: t(LanguageKey.level) + " 3",
      bgColor: "#C3B3FF",
      textColor: "#673AB7",
    },
    {
      name: t(LanguageKey.Advanced),
      price: "50K – 100K",
      level: t(LanguageKey.level) + " 4",
      bgColor: "#DDB3FF",
      textColor: "#9C27B0",
    },
    {
      name: t(LanguageKey.Professional),
      price: "100K–500K",
      level: t(LanguageKey.level) + " 5",
      bgColor: "#FFB3D6",
      textColor: "#E91E63",
    },
    {
      name: t(LanguageKey.Special),
      price: "+500K",
      level: t(LanguageKey.level) + " 6",
      bgColor: "#FFB08A",
      textColor: "#FF6B35",
    },
  ];
  const featureCategories: FeatureCategory[] = [
    {
      name: "Account Management",
      isOpen: false,
      features: [
        {
          name: "Instagram Connection",
          tooltip:
            "اتصال پیج اینستاگرام بدون نیاز به پسورد به صورت امن و همگام سازی خودکار امکانات بر اساس آخرین نسخه ی اینستاگرم",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Multi-Account",
          tooltip: "مدیریت 10+ پیج همزمان و سوئیچ سریع بین اکانت‌های مختلف",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Team Management",
          tooltip: "افزودن ادمین همکار بدون نیاز به پسورد، با محدود کردن میزان دسترسی ها و به صورت زمانبندی محدود ",
          plans: [true, true, true, true, true, true],
        },
      ],
    },
    {
      name: "Directs Management",
      isOpen: false,
      features: [
        {
          name: "Direct Messages",
          tooltip:
            "دسترسی به دایرکت های پیج و امکان پاسخدهی به هر دایرکت، امکان دسته بندی پیام های کار ی وعمومی و مهم و با امکان آرشیو کردن پیام ها",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Auto-Reply Messages",
          tooltip: "تنظیم کردن پاسخ خودکار به دایرکت های پیج به صورت اتوماتیک با استفاده از متن های از پیش تعریف شده",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Flow Auto-Reply",
          tooltip:
            "امکان ساخت جریان و فلو برای پاسخدهی دایرکت ها به صورت هدفمند با امکان ارسال عکس و ویدیو و صدا و غیره",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "AI Auto-Reply",
          tooltip:
            "ایجاد پرامپ هدفمند برای تعامل با کاربران در دایرکت (هوش مصنوعی اختصاصی برنسی بر اساس لحن و نوع تعامل شما با کاربران پیج شما آموزش داده شده است)",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Direct properties",
          tooltip:
            "امکان ساخت منو دائمی دایرکت پیام و منو خوش آمدگویی و دیگر امکانات مربوط بر اساس آخرین امکانات اینستاگرم",
          plans: [true, true, true, true, true, true],
        },
      ],
    },
    {
      name: "Comments Management",
      isOpen: false,
      features: [
        {
          name: "Real-Time Comments",
          tooltip: "امکان مشاهده و دریافت و حذف و پاسخ به کامنت ها به صورت آنی و مشاهده ی کامنت ها به صورت لیست پست ها",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "manage Comments",
          tooltip: "امکان فیلتر کردن پاسخ های رباتی کامنت ها و جست و جو کردن در بین کامنت ها و آمارگیری کامنت ها ",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Vanish Mode",
          tooltip: "امکان نمایش کامنت های پاسخ داده نشده (کامنت های پاسخ داده شده مخفی میشوند اما حذف نمیشوند)",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Auto-Reply Comments",
          tooltip: "تنظیم کردن پاسخ خودکار به کامنت های یک پست به صورت اتوماتیک با استفاده از متن های از پیش تعریف شده",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Flow Auto-Reply",
          tooltip:
            "امکان ساخت جریان و فلو برای پاسخدهی کامنت های یک پست به صورت هدفمند با امکان ارسال عکس و ویدیو و صدا و غیره",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "AI Auto-Reply",
          tooltip:
            "امکان پاسخ دهی هر کامنت به صورت خودکار با استفاده از هوش مصنوعی (هوش مصنوعی اختصاصی برنسی بر اساس لحن و نوع تعامل شما با کاربران پیج شما آموزش داده شده است)",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Export Comments",
          tooltip: "امکان خروجی گرفتن از تمام کامنت ها به صورت لحظه ای و برگذاری قرعه کشی بر روی آن",
          plans: [true, true, true, true, true, true],
        },
      ],
    },
    {
      name: "Page Management",
      isOpen: false,
      features: [
        {
          name: "Page Overall Info",
          tooltip:
            "نمایش جمعیت‌شناسی (سن، جنسیت) و نمایش موقعیت مکانی کاربران پیج به تفکیک شهر و کشور و اطلاعات جامع و کامل پیج اینستاگرم ",
          plans: [false, true, true, true, true, true],
        },
        {
          name: "Post lists",
          tooltip: "نمایش لیست تمام پست های پیج با آمار های لایک و کامنت و اشتراک و کامنت",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Create Post",
          tooltip:
            "ساخت پست و ریلز با امکان نوشتن کپشن با هوش مصنوعی و افزودن هشتگ های ترند و تگ کردن افراد و افزودن موقعیت مکانی و امکان غیرفعال کردن کامنت و مخفی کردن تعداد لایک و بازدید",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Publish Post/Reels",
          tooltip:
            "انتشار پست به صورت لحظه ای و زمانبندی شده و پیشنهاد بهترین زمان های انتشار پست بر اساس بازخورد مخاطبین و امکان ذخیره ی پیشنویس ",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Post Insights",
          tooltip:
            "کاملترین آمار هر پست (لایک، کامنت، اشتراک،زمان بازدید و ریچ، ایمپرشن) به صورت لیستی و گراف های ماهانه و فصلی",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Export Comments",
          tooltip: "خروجی کل کامنت ها به صورت لحظه ای و ایجاد قرعه کشی از بین کامنت ها",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Auto-Reply Post Comment",
          tooltip: "پاسخ خودکار به کامنت های پست و لایو و استوری",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Story lists",
          tooltip: "نمایش لیست تمام استوری های پیج با آمار های لایک و کامنت",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Publish Story",
          tooltip: "امکان انتشار استوری ها به صورت لحظه ای و زمانبدی برای انتشار",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Story Insights",
          tooltip:
            "کاملترین آمار هر استوری (لایک، کامنت، اشتراک،زمان بازدید و ریچ، ایمپرشن) به صورت لیستی و گراف های روزانه",
          plans: [true, true, true, true, true, true],
        },
      ],
    },
    {
      name: "Page Analytics",
      isOpen: false,
      features: [
        {
          name: "Top Posts list",
          tooltip:
            "نمایش و لیست پست ها به صورت مرتب شده بر اساس بیشترین و کمترین ریچ و بیشترین و کمترین تعداد کامنت و لایک",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Best and Wort Time",
          tooltip:
            "نمایش بهترین و بدترین زمان پست گذاری بر اساس تحلیل پیج و نوع رفتار کاربران پیج به صورت روزانه و ساعتی در بازه های یک ماهه و فصلی و پیشنهادات هوش مصنوعی برای بیشترین تعامل",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Follower/Unfollower",
          tooltip:
            "نمایش گراف و آمار میزان اضافه و یا کم شدتن فالورهای پیج و مقایسه آنها نسبت به ماهای گذشته و پیشنهادات هوش مصنوعی برای مدیریت آن",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Media Follow",
          tooltip:
            "نمایش گراف و آمار میزان افرادی که به خاطر محتوای منتشر شده پیج را فالو کرده اند و مقایسه آنها نسبت به ماهای گذشته و پیشنهادات هوش مصنوعی برای مدیریت آن",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Profile Visit",
          tooltip:
            "نمایش گراف و آمار میزان افرادی که به خاطر محتوای منتشر شده پروفایل شما را مشاهده کرده اند و مقایسه آنها نسبت به ماهای گذشته و پیشنهادات هوش مصنوعی برای مدیریت آن",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Comments",
          tooltip:
            " نمایش گراف و آمار میزان کامنتهای دریافت شده در کل پیج و مقایسه آنها نسبت به ماهای گذشته و پیشنهادات هوش مصنوعی برای مدیریت آن",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Share",
          tooltip:
            " نمایش گراف و آمار میزان پست های به اشتراک گذاشته شده در کل پیج و مقایسه آنها نسبت به ماهای گذشته و پیشنهادات هوش مصنوعی برای مدیریت آن",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Replies",
          tooltip:
            " نمایش گراف و آمار میزان ریپلای های انجام شده در کل پیج و مقایسه آنها نسبت به ماهای گذشته و پیشنهادات هوش مصنوعی برای مدیریت آن",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Repost",
          tooltip:
            " نمایش گراف و آمار میزان ریپست های انجام شده در کل پیج و مقایسه آنها نسبت به ماهای گذشته و پیشنهادات هوش مصنوعی برای مدیریت آن",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Reach",
          tooltip:
            " نمایش گراف و آمار میزان ریچ های ثبت شده در کل پیج و مقایسه آنها نسبت به ماهای گذشته و پیشنهادات هوش مصنوعی برای مدیریت آن",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Likes",
          tooltip:
            " نمایش گراف و آمار میزان لایک های ثبت شده در کل پیج و مقایسه آنها نسبت به ماهای گذشته و پیشنهادات هوش مصنوعی برای مدیریت آن",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Views",
          tooltip:
            " نمایش گراف و آمار میزان بازدید های ثبت شده در کل پیج و مقایسه آنها نسبت به ماهای گذشته و پیشنهادات هوش مصنوعی برای مدیریت آن",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Ghost Viewer",
          tooltip:
            " نمایش گراف و آمار میزان بازدیدکنندگان روح (غیر فالور) ثبت شده در کل پیج و مقایسه آنها نسبت به ماهای گذشته و پیشنهادات هوش مصنوعی برای مدیریت آن",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Engagements",
          tooltip:
            " نمایش گراف و آمار میزان انگیجمنت ثبت شده در کل پیج و مقایسه آنها نسبت به ماهای گذشته و پیشنهادات هوش مصنوعی برای مدیریت آن",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Engagements",
          tooltip:
            " نمایش گراف و آمار میزان انگیجمنت ثبت شده در کل پیج و مقایسه آنها نسبت به ماهای گذشته و پیشنهادات هوش مصنوعی برای مدیریت آن",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Visitor Follower",
          tooltip:
            "نمایش گراف و آمار میزان فالورهایی که به محتوای پیج را مشاهده میکنند و مقایسه آنها نسبت به ماهای گذشته و پیشنهادات هوش مصنوعی برای مدیریت آن",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Media Follow",
          tooltip:
            "نمایش گراف و آمار میزان افرادی که به خاطر محتوای منتشر شده پیج را فالو کرده اند و مقایسه آنها نسبت به ماهای گذشته و پیشنهادات هوش مصنوعی برای مدیریت آن",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Best Follower",
          tooltip: "لیست بهترین فالور های پیج که بیشترین تعامل را با پیج شما داشته اند",
          plans: [true, true, true, true, true, true],
        },
      ],
    },
    {
      name: "Tools & Utilities",
      isOpen: false,
      features: [
        {
          name: "Custom Fonts",
          tooltip:
            "امکان نوشتن متن با فونت های سفارشی وکاراکتر خاص که در داخل اینستاگرم پشتیبانی میشوند و استفاده از انها در زمان ساخت و انتشار محتوا",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Trend Hashtags",
          tooltip:
            "لیست هشتگ های پر استفاده در کل فضای اینستاگرم به تفکیک زبان و زمان های روزانه و هفتگی و ماهانه و کلی",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Hashtag lists",
          tooltip: "امکان ساخت لیست هشتگ های دلخواه و ذخیره ی آنها و استفاده از آن لیست در زمان ساخت و انتشار محتوا",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "AI Caption Generator",
          tooltip:
            "تولید کپشن با هوش مصنوعی با توجه به نوع لحن شما در دیگر پست ها و تعاملات شما با فالورهایتان در محتواهای پیج بر اساس ماهیت پیج شما",
          plans: [true, true, true, true, true, true],
        },
        {
          name: "Winner Picker",
          tooltip:
            "ایجاد قرعه کشی بر روی یک پست خاص با امکان ایجاد زمانبدی و امکان تخصیص امتیار برای کاربران بر طبق قوانین شما برای قرعه کشی و انتشار لیست برنده ها و ایجاد لینک یکتا برای راستی آزمایی قابل انتشار ",
          plans: [true, true, true, true, true, true],
        },
      ],
    },
  ];

  if (!isPopupOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="dialogBg" onClick={handleOverlayClick}>
      <div className={`${styles.modal} ${isAnimatingOut ? styles.animatingOut : ""}`}>
        <img className={styles.closeButton} onClick={onClose} title="ℹ️ close" src="/close-box.svg" />

        <div className={styles.background}>
          <div className={styles.backgroundfade} />
          <div className={styles.backgroundfade1} />
          <div className={styles.backgroundfade2} />
          <div className={styles.backgroundfade3} />
          <div className={styles.backgroundfade4} />
          <div className={styles.backgroundfade5} />
          <div className={styles.backgroundfade6} />
        </div>
        {/* Header with plans */}
        <div className={styles.header}>
          <div className={styles.planCarddesktop} />
          {plans.map((plan, index) => (
            <>
              <div
                className={styles.planCard}
                key={index}
                style={{
                  backgroundColor: plan.bgColor,
                }}>
                <div className={styles.planLevel} style={{ color: plan.textColor }}>
                  {plan.level}
                </div>
                <div className={styles.planInfo}>
                  <div className={styles.planName}>{plan.name}</div>
                  <div className={styles.planPrice}>{plan.price}</div>
                </div>
                <div className={styles.planInfomobile}>
                  <div className={styles.planNamemobile}>{plan.name}</div>
                  <div className={styles.planPricemobile}>{plan.price}</div>
                </div>
              </div>
            </>
          ))}
        </div>

        {/* Features list */}
        <div className={styles.featuresContainer}>
          {featureCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className={styles.categoryContainer}>
              {/* Category Header */}
              <div className={styles.categoryHeader} onClick={() => toggleCategory(categoryIndex)}>
                <div className={styles.categoryTitle}>
                  <svg
                    className={`${styles.chevron} ${openCategories.has(categoryIndex) ? styles.chevronOpen : ""}`}
                    width="20"
                    height="20"
                    viewBox="0 0 22 22"
                    fill="none">
                    <path stroke="var(--text-h2)" d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" opacity=".5" />
                    <path
                      strokeWidth="3"
                      fill="var(--text-h1)"
                      d="m12.2 7 .6.2q.3.6 0 1l-2.2 2.2-.1.4.1.4 2.2 2.1q.3.6 0 1-.6.5-1 0l-2.2-2a2 2 0 0 1 0-2.9l2.1-2.2z"
                    />
                  </svg>

                  {category.name}
                </div>
              </div>

              {/* Category Features */}
              {openCategories.has(categoryIndex) && (
                <div className={styles.categoryFeatures}>
                  {category.features.map((feature, featureIndex) => {
                    const globalFeatureIndex = categoryIndex * 100 + featureIndex; // Unique index
                    return (
                      <div key={featureIndex} className={styles.featureflex}>
                        {/* featureName with tooltip */}
                        <div className={styles.featureName}>
                          <div className={styles.featureNameContent}>
                            {feature.name}
                            <img
                              className={`${styles.tooltip} ${
                                openTooltips.has(globalFeatureIndex) ? styles.tooltipActive : ""
                              }`}
                              onClick={() => toggleTooltip(globalFeatureIndex)}
                              style={{ padding: "1px", width: "18px", height: "18px" }}
                              title="ℹ️ tooltip"
                              src="/tooltip.svg"
                            />
                          </div>
                          <div
                            className={`${styles.tooltipContent} ${
                              openTooltips.has(globalFeatureIndex) ? styles.tooltipVisible : ""
                            }`}>
                            {feature.tooltip}
                          </div>
                        </div>

                        <div className={styles.featureChecks}>
                          {feature.plans.map((hasFeature, planIndex) => (
                            <div key={planIndex} className={styles.checkCell}>
                              {hasFeature ? (
                                <svg
                                  className={styles.checkmark}
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  viewBox="0 0 25 24">
                                  <path d="M24.67 12a12 12 0 1 0-24 0 12 12 0 0 0 24 0" />
                                  <path
                                    d="m8.05 12 3.08 3.08 6.15-6.16"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className={styles.cross}
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  viewBox="0 0 25 24">
                                  <path d="M24.67 12a12 12 0 1 0-24 0 12 12 0 0 0 24 0" />
                                  <path
                                    d="m15.9 9.08-6.47 6.47m6.47 0L9.44 9.08"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureList;
