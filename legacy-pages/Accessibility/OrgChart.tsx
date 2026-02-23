import Head from "next/head";
import { useCallback, useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import SignIn, { RedirectType, SignInType } from "brancy/components/signIn/signIn";
import AccessibilityHeader from "brancy/components/Accessibility/AccessibilityHeader";
import Tooltip from "brancy/components/design/tooltip/tooltip";
import styles from "./OrgChart.module.css";
type ThemeState = {
  themeMode: string;
  darkTheme: boolean | undefined;
  language: string;
};
type ThemeAction =
  | { type: "SET_THEME"; payload: { themeMode: string; darkTheme: boolean } }
  | { type: "SET_LANGUAGE"; payload: string };
const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case "SET_THEME":
      return {
        ...state,
        themeMode: action.payload.themeMode,
        darkTheme: action.payload.darkTheme,
      };
    case "SET_LANGUAGE":
      return { ...state, language: action.payload };
    default:
      return state;
  }
};
interface TreeNodeType {
  label: string;
  tooltip?: string;
  children?: TreeNodeType[];
  level?: number;
  isExecutive?: boolean;
  expandAll?: boolean;
  code?: string; // کد سلسله‌مراتبی مانند "1-2-3"
}
const TreeNode = ({ label, children, tooltip, level = 0, isExecutive = false, expandAll = false }: TreeNodeType) => {
  const [open, setOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showChildren, setShowChildren] = useState(false);
  const hasChildren = children && children.length > 0;
  useEffect(() => {
    if (!hasChildren) return;
    setOpen(expandAll);
    setShowChildren(expandAll);
  }, [expandAll, hasChildren]);
  const handleNodeClick = () => {
    if (hasChildren && !isAnimating) {
      setIsAnimating(true);
      if (!open) {
        setShowChildren(true);
        setOpen(true);
        setTimeout(() => setIsAnimating(false), 400);
      } else {
        setOpen(false);
        setTimeout(() => {
          setShowChildren(false);
          setIsAnimating(false);
        }, 300);
      }
    }
  };
  const getNodeIcon = () => {
    if (!hasChildren) return null;
    return open ? "▲" : "▼";
  };
  const getDynamicStyles = () => {
    let className = styles.nodeLabelContainer;
    if (open && hasChildren) {
      className += " expanded";
    }
    if (isExecutive && styles.executiveNode) {
      className += ` ${styles.executiveNode}`;
    }
    if (level === 0 && styles.rootNode) {
      className += ` ${styles.rootNode}`;
    }
    const levelClass = (styles as any)[`level-${level}`];
    if (levelClass) {
      className += ` ${levelClass}`;
    }
    return className;
  };
  return (
    <div className={styles.treeNode} style={{ animationDelay: `${level * 0.1}s` }}>
      <div
        className={getDynamicStyles()}
        onClick={handleNodeClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleNodeClick();
          }
        }}
        aria-expanded={hasChildren ? open : undefined}
        aria-label={`${label}${hasChildren ? (open ? " - بسته شده" : " - باز شده") : ""}`}>
        {hasChildren && (
          <span
            className={`${styles.nodeIcon} ${styles.nodeIconRotating} ${open ? "expanded" : ""}`}
            aria-hidden="true">
            {getNodeIcon()}
          </span>
        )}
        <span>{label}</span>
        {tooltip && (
          <Tooltip tooltipValue={tooltip} position="right" onClick={true}>
            <img
              role="button"
              tabIndex={0}
              aria-label="نمایش اطلاعات بیشتر"
              style={{ cursor: "pointer", width: "18px", height: "18px" }}
              title="ℹ️ info"
              src="/attention.svg"
            />
          </Tooltip>
        )}
      </div>
      {showChildren && hasChildren && (
        <div
          className={`${styles.nodeChildrenAnimated} ${!open ? "collapsing" : ""}`}
          role="group"
          aria-label={`زیرمجموعه‌های ${label}`}>
          {children.map((child, index) => (
            <div
              key={`${child.label}-${index}`}
              className={styles.childNodeWrapper}
              style={{
                animationDelay: open ? `${index * 0.05}s` : "0s",
              }}>
              <TreeNode {...child} level={level + 1} isExecutive={level === 0} expandAll={expandAll} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
const orgChart: TreeNodeType = {
  label: "CEO (مدیرعامل)",
  tooltip: "راهبری کلان سازمان، تعیین استراتژی‌های اصلی و نظارت بر عملکرد کلی.",
  children: [
    {
      label: "CTO (مدیر ارشد فناوری)",
      tooltip: "راهبری استراتژی فناوری، نوآوری، معماری سیستم‌ها و مدیریت تیم‌های فنی.",
      children: [
        {
          label: "VP of Engineering (معاونت مهندسی)",
          tooltip: "مدیریت اجرایی توسعه نرم‌افزار، زیرساخت و فرآیندهای مهندسی.",
          children: [
            {
              label: "Software Development (توسعه نرم‌افزار)",
              tooltip: "طراحی، پیاده‌سازی، تست و نگهداری محصولات نرم‌افزاری.",
              children: [
                {
                  label: "Head of Software Development (مدیر توسعه نرم‌افزار)",
                  tooltip: "مدیریت تیم‌های توسعه (Frontend, Backend, Mobile, QA) و فرآیندهای تولید.",
                  children: [
                    {
                      label: "Frontend Team (تیم فرانت‌اند)",
                      tooltip: "توسعه رابط کاربری (UI) و تجربه کاربری (UX) برنامه‌ها.",
                      children: [
                        {
                          label: "Frontend Lead (سرپرست فرانت‌اند)",
                          tooltip: "هدایت فنی و معماری تیم فرانت‌اند.",
                          children: [],
                        },
                        {
                          label: "Senior Frontend Developer (توسعه‌دهنده ارشد فرانت‌اند)",
                          tooltip: "توسعه پیشرفته و راهبری فنی فرانت‌اند.",
                          children: [],
                        },
                        {
                          label: "Frontend Developer (توسعه‌دهنده فرانت‌اند)",
                          tooltip: "پیاده‌سازی و نگهداری رابط کاربری.",
                          children: [],
                        },
                      ],
                    },
                    {
                      label: "Backend Team (تیم بک‌اند)",
                      tooltip: "توسعه منطق سمت سرور، APIها، پایگاه داده و معماری میکروسرویس.",
                      children: [
                        {
                          label: "Backend Lead (سرپرست بک‌اند)",
                          tooltip: "هدایت فنی و معماری تیم بک‌اند.",
                          children: [],
                        },
                        {
                          label: "Senior Backend Developer (توسعه‌دهنده ارشد بک‌اند)",
                          tooltip: "توسعه پیشرفته و راهبری فنی بک‌اند.",
                          children: [],
                        },
                        {
                          label: "Backend Developer (توسعه‌دهنده بک‌اند)",
                          tooltip: "پیاده‌سازی و نگهداری منطق سرور و API.",
                          children: [],
                        },
                      ],
                    },
                    {
                      label: "Mobile Team (تیم موبایل)",
                      tooltip: "توسعه و نگهداری اپلیکیشن‌های موبایل (Android, iOS, Cross-Platform).",
                      children: [
                        {
                          label: "Mobile Lead (سرپرست موبایل)",
                          tooltip: "هدایت فنی و معماری تیم موبایل.",
                          children: [],
                        },
                        {
                          label: "Android Developer (توسعه‌دهنده اندروید)",
                          tooltip: "توسعه تخصصی اپلیکیشن‌های اندروید.",
                          children: [],
                        },
                        {
                          label: "iOS Developer (توسعه‌دهنده iOS)",
                          tooltip: "توسعه تخصصی اپلیکیشن‌های iOS.",
                          children: [],
                        },
                        {
                          label: "Cross-Platform Developer (توسعه‌دهنده چندسکویی)",
                          tooltip: "توسعه با ابزارهای چندسکویی (React Native, Flutter).",
                          children: [],
                        },
                        {
                          label: "Senior Mobile Developer (توسعه‌دهنده ارشد موبایل)",
                          tooltip: "توسعه پیشرفته، بازبینی کد و راهبری فنی در تیم موبایل.",
                          children: [],
                        },
                        {
                          label: "Mobile Developer (توسعه‌دهنده موبایل)",
                          tooltip: "پیاده‌سازی ویژگی‌ها و نگهداری اپلیکیشن‌های موبایل.",
                          children: [],
                        },
                      ],
                    },
                    {
                      label: "QA Team (تیم تضمین کیفیت)",
                      tooltip: "تضمین کیفیت نرم‌افزار از طریق تست‌های دستی و خودکار.",
                      children: [
                        {
                          label: "QA Manager (مدیر تضمین کیفیت)",
                          tooltip: "مدیریت استراتژی و فرآیندهای تضمین کیفیت.",
                          children: [],
                        },
                        {
                          label: "Automation Engineer (مهندس تست خودکار)",
                          tooltip: "طراحی و پیاده‌سازی تست‌های خودکار.",
                          children: [],
                        },
                        {
                          label: "Manual Tester (تستر دستی)",
                          tooltip: "اجرای تست‌های دستی، شناسایی و گزارش خطا.",
                          children: [],
                        },
                        {
                          label: "Performance Tester (تستر عملکرد)",
                          tooltip: "ارزیابی عملکرد، پایداری و مقیاس‌پذیری نرم‌افزار.",
                          children: [],
                        },
                        {
                          label: "QA Lead (سرپرست تضمین کیفیت)",
                          tooltip: "هدایت تیم QA، تعیین استراتژی تست و بهبود فرآیندها.",
                          children: [],
                        },
                        {
                          label: "Senior QA Engineer (مهندس ارشد QA)",
                          tooltip: "طراحی سناریوهای تست پیچیده و راهبری فنی تست.",
                          children: [],
                        },
                        {
                          label: "QA Engineer (مهندس QA)",
                          tooltip: "طراحی و اجرای تست‌ها، گزارش باگ و پیگیری اصلاحات.",
                          children: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              label: "DevOps & Infrastructure (دواپس و زیرساخت)",
              tooltip: "مدیریت زیرساخت ابری/محلی، CI/CD، مانیتورینگ و پایداری سیستم‌ها (SRE).",
              children: [
                {
                  label: "DevOps Lead (سرپرست دواپس)",
                  tooltip: "هدایت فنی تیم دواپس و استراتژی زیرساخت.",
                  children: [],
                },
                {
                  label: "DevOps Engineer (مهندس دواپس)",
                  tooltip: "پیاده‌سازی و نگهداری ابزارها و فرآیندهای دواپس.",
                  children: [],
                },
                {
                  label: "Cloud Engineer (مهندس ابر)",
                  tooltip: "مدیریت، بهینه‌سازی و امنیت زیرساخت‌های ابری.",
                  children: [],
                },
                {
                  label: "Site Reliability Engineer (SRE)",
                  tooltip: "تضمین پایداری، عملکرد و مقیاس‌پذیری سرویس‌ها.",
                  children: [],
                },
                {
                  label: "Database Administrator (DBA)",
                  tooltip: "مدیریت، نگهداری، پشتیبان‌گیری و بهینه‌سازی پایگاه‌داده.",
                  children: [],
                },
              ],
            },
            {
              label: "Architecture Team (تیم معماری)",
              tooltip: "طراحی معماری کلان سیستم‌ها، تعیین استانداردهای فنی و راهبری تکنولوژی.",
              children: [
                {
                  label: "Chief Architect (معمار ارشد)",
                  tooltip: "تعیین چشم‌انداز معماری و راهبری تکنولوژی‌های کلیدی.",
                  children: [],
                },
                {
                  label: "Software Architect (معمار نرم‌افزار)",
                  tooltip: "طراحی معماری سیستم‌ها و کامپوننت‌های نرم‌افزاری.",
                  children: [],
                },
              ],
            },
            {
              label: "Security Team (تیم امنیت)",
              tooltip: "تضمین امنیت سایبری برنامه‌ها، داده‌ها و زیرساخت‌ها.",
              children: [
                {
                  label: "Security Lead (سرپرست امنیت)",
                  tooltip: "هدایت استراتژی و تیم امنیت سایبری.",
                  children: [],
                },
                {
                  label: "Application Security Engineer (مهندس امنیت برنامه‌ها)",
                  tooltip: "تامین امنیت چرخه عمر توسعه نرم‌افزار (SDLC).",
                  children: [],
                },
                {
                  label: "Infrastructure Security Engineer (مهندس امنیت زیرساخت)",
                  tooltip: "تامین امنیت شبکه، سرورها و زیرساخت ابری.",
                  children: [],
                },
                {
                  label: "Penetration Tester (تستر نفوذ)",
                  tooltip: "ارزیابی امنیتی سیستم‌ها از طریق شبیه‌سازی حملات.",
                  children: [],
                },
                {
                  label: "Security Engineer (مهندس امنیت)",
                  tooltip: "پیاده‌سازی کنترل‌های امنیتی، مدیریت آسیب‌پذیری‌ها و پاسخ به رخدادها.",
                  children: [],
                },
              ],
            },
          ],
        },
        {
          label: "IT Department (فناوری اطلاعات داخلی)",
          tooltip: "مدیریت و پشتیبانی سیستم‌ها، شبکه و سخت‌افزار داخلی سازمان.",
          children: [
            {
              label: "IT Manager (مدیر IT)",
              tooltip: "مدیریت تیم و عملیات فناوری اطلاعات داخلی.",
              children: [],
            },
            {
              label: "System Administrator (مدیر سیستم)",
              tooltip: "مدیریت سرورها، سرویس‌ها و سیستم‌عامل‌ها.",
              children: [],
            },
            {
              label: "Network Administrator (مدیر شبکه)",
              tooltip: "مدیریت و نگهداری زیرساخت شبکه داخلی.",
              children: [],
            },
            {
              label: "IT Support Specialist (کارشناس پشتیبانی IT)",
              tooltip: "پشتیبانی فنی کاربران و رفع مشکلات سخت‌افزاری/نرم‌افزاری.",
              children: [],
            },
            {
              label: "IT Support (پشتیبانی IT)",
              tooltip: "پاسخگویی به مشکلات کاربران و ارجاع موارد پیچیده به تیم‌های تخصصی.",
              children: [],
            },
          ],
        },
      ],
    },
    // --- Product Branch ---
    {
      label: "CPO (مدیر ارشد محصول)",
      tooltip: "راهبری استراتژی محصول، مدیریت پورتفولیو و چرخه عمر محصولات.",
      children: [
        {
          label: "Product Management (مدیریت محصول)",
          tooltip: "تعریف، اولویت‌بندی و راهبری توسعه محصولات بر اساس نیاز بازار و اهداف کسب‌وکار.",
          children: [
            {
              label: "Director of Product (مدیر محصول)",
              tooltip: "مدیریت تیم مدیران محصول و استراتژی کلی محصول.",
              children: [],
            },
            {
              label: "Group Product Manager (مدیر گروه محصول)",
              tooltip: "مدیریت استراتژیک خطوط یا گروه‌های محصول.",
              children: [],
            },
            {
              label: "Senior Product Manager (مدیر محصول ارشد)",
              tooltip: "راهبری استراتژیک و توسعه محصولات کلیدی.",
              children: [],
            },
            {
              label: "Product Manager (مدیر محصول)",
              tooltip: "مسئولیت کامل چرخه عمر یک محصول یا ویژگی.",
              children: [],
            },
            {
              label: "Associate Product Manager (دستیار مدیر محصول)",
              tooltip: "پشتیبانی از مدیران محصول و یادگیری فرآیندها.",
              children: [],
            },
            {
              label: "Product Owner (مالک محصول - در اسکرام)",
              tooltip: "مدیریت بک‌لاگ محصول و نماینده کسب‌وکار در تیم اسکرام.",
              children: [],
            },
          ],
        },
        {
          label: "UX/UI Design (طراحی تجربه و رابط کاربری)",
          tooltip: "تحقیق، طراحی و بهینه‌سازی تجربه کاربری (UX) و رابط کاربری (UI) محصولات.",
          children: [
            {
              label: "Head of Design (مدیر طراحی)",
              tooltip: "راهبری تیم طراحی، استراتژی و استانداردهای طراحی.",
              children: [],
            },
            {
              label: "UX Lead (سرپرست UX)",
              tooltip: "هدایت راهبرد UX، تضمین کیفیت تجربه کاربری و همسویی با اهداف محصول.",
              children: [],
            },
            {
              label: "UX Researcher (پژوهشگر تجربه کاربری)",
              tooltip: "انجام تحقیقات کاربرمحور برای درک نیازها و رفتارها.",
              children: [],
            },
            {
              label: "UX Designer (طراح تجربه کاربری)",
              tooltip: "طراحی معماری اطلاعات، جریان‌های کاربری و وایرفریم‌ها.",
              children: [],
            },
            {
              label: "UI Designer (طراح رابط کاربری)",
              tooltip: "طراحی بصری رابط کاربری، سیستم‌های طراحی و المان‌های گرافیکی.",
              children: [],
            },
            {
              label: "Interaction Designer (طراح تعاملات)",
              tooltip: "طراحی نحوه تعامل کاربر با محصول و انیمیشن‌ها.",
              children: [],
            },
            {
              label: "UI/UX Designer (طراح UI/UX)",
              tooltip: "طراحی یکپارچه تجربه و رابط کاربری با تمرکز بر کارایی و زیبایی.",
              children: [],
            },
          ],
        },
        {
          label: "Data & Analytics (داده و تحلیل محصول)",
          tooltip: "تحلیل داده‌های محصول و رفتار کاربر برای پشتیبانی از تصمیم‌گیری محصول.",
          children: [
            {
              label: "Product Analyst (تحلیلگر محصول)",
              tooltip: "تحلیل داده‌های محصول، تعریف KPI و ارائه گزارش.",
              children: [],
            },
            {
              label: "Data Scientist (دانشمند داده - محصول)",
              tooltip: "استفاده از مدل‌های آماری و ML برای بهبود محصول.",
              children: [],
            },
          ],
        },
      ],
    },
    // --- Marketing Branch ---
    {
      label: "CMO (مدیر ارشد بازاریابی)",
      tooltip: "راهبری استراتژی بازاریابی، برندینگ، ارتباطات و رشد کسب‌وکار.",
      children: [
        {
          label: "Digital Marketing (بازاریابی دیجیتال)",
          tooltip: "اجرای استراتژی‌های بازاریابی آنلاین (SEO, SEM, Email, etc.).",
          children: [
            {
              label: "Marketing Manager (مدیر بازاریابی)",
              tooltip: "مدیریت برنامه‌ها و تیم‌های بازاریابی، هماهنگی بین کانال‌ها و کمپین‌ها.",
              children: [],
            },
            {
              label: "Digital Marketing Manager (مدیر بازاریابی دیجیتال)",
              tooltip: "مدیریت کانال‌ها و کمپین‌های بازاریابی دیجیتال.",
              children: [],
            },
            {
              label: "SEO Specialist (متخصص سئو)",
              tooltip: "بهینه‌سازی وب‌سایت و محتوا برای موتورهای جستجو.",
              children: [],
            },
            {
              label: "SEM/PPC Specialist (متخصص تبلیغات کلیکی)",
              tooltip: "مدیریت کمپین‌های تبلیغاتی پولی (Google Ads, etc.).",
              children: [],
            },
            {
              label: "Email Marketing Specialist (متخصص بازاریابی ایمیلی)",
              tooltip: "طراحی و اجرای کمپین‌های بازاریابی ایمیلی.",
              children: [],
            },
            {
              label: "Content Creator (تولیدکننده محتوا)",
              tooltip: "تولید محتوای متنی، تصویری و ویدیویی برای کمپین‌ها و شبکه‌های اجتماعی.",
              children: [],
            },
          ],
        },
        {
          label: "Market Research (تحقیقات بازار)",
          tooltip: "تحلیل بازار، رقبا و رفتار مشتری برای پشتیبانی تصمیمات بازاریابی.",
          children: [
            {
              label: "Market Analyst (تحلیلگر بازار)",
              tooltip: "جمع‌آوری و تحلیل داده‌های بازار و ارائه بینش‌های کلیدی.",
              children: [],
            },
          ],
        },
        {
          label: "Content Marketing (بازاریابی محتوا)",
          tooltip: "تولید و توزیع محتوای ارزشمند برای جذب و حفظ مخاطبان.",
          children: [
            {
              label: "Content Marketing Manager (مدیر بازاریابی محتوا)",
              tooltip: "راهبری استراتژی و تیم تولید محتوا.",
              children: [],
            },
            {
              label: "Content Strategist (استراتژیست محتوا)",
              tooltip: "برنامه‌ریزی، توسعه و مدیریت تقویم محتوایی.",
              children: [],
            },
            {
              label: "Content Writer/Copywriter (نویسنده محتوا/کپی‌رایتر)",
              tooltip: "تولید محتوای متنی جذاب و موثر.",
              children: [],
            },
            {
              label: "Graphic Designer (طراح گرافیک - بازاریابی)",
              tooltip: "طراحی المان‌های بصری برای کمپین‌های بازاریابی.",
              children: [],
            },
          ],
        },
        {
          label: "Social Media Marketing (بازاریابی شبکه‌های اجتماعی)",
          tooltip: "مدیریت حضور برند و تعامل با مخاطبان در شبکه‌های اجتماعی.",
          children: [
            {
              label: "Social Media Manager (مدیر شبکه‌های اجتماعی)",
              tooltip: "مدیریت استراتژی و اجرای کمپین‌ها در شبکه‌های اجتماعی.",
              children: [],
            },
            {
              label: "Community Manager (مدیر جامعه آنلاین)",
              tooltip: "ایجاد و مدیریت جوامع آنلاین حول برند یا محصول.",
              children: [],
            },
          ],
        },
        {
          label: "Product Marketing (بازاریابی محصول)",
          tooltip: "تدوین پیام، موقعیت‌یابی و استراتژی عرضه محصول به بازار (Go-to-Market).",
          children: [
            {
              label: "Product Marketing Manager (مدیر بازاریابی محصول)",
              tooltip: "راهبری استراتژی بازاریابی و عرضه محصولات.",
              children: [],
            },
          ],
        },
        {
          label: "PR & Communications (روابط عمومی و ارتباطات)",
          tooltip: "مدیریت ارتباطات خارجی، روابط با رسانه‌ها و تصویر برند.",
          children: [
            {
              label: "PR Manager (مدیر روابط عمومی)",
              tooltip: "مدیریت ارتباط با رسانه‌ها، انتشار اخبار و مدیریت بحران.",
              children: [],
            },
          ],
        },
      ],
    },
    // --- Sales Branch ---
    {
      label: "CSO / VP of Sales (مدیر ارشد فروش)",
      tooltip: "راهبری استراتژی فروش، مدیریت تیم‌ها و دستیابی به اهداف درآمدی.",
      children: [
        {
          label: "Sales Team (تیم فروش)",
          tooltip: "اجرای فرآیند فروش، مذاکره و بستن قرارداد با مشتریان جدید.",
          children: [
            {
              label: "Sales Director (مدیر فروش)",
              tooltip: "مدیریت استراتژیک تیم‌ها یا مناطق فروش.",
              children: [],
            },
            {
              label: "Sales Manager (سرپرست فروش)",
              tooltip: "مدیریت عملکرد و مربیگری تیم فروشندگان.",
              children: [],
            },
            {
              label: "Account Executive (مدیر حساب)",
              tooltip: "مسئولیت کامل فرآیند فروش به مشتریان بالقوه.",
              children: [],
            },
            {
              label: "Sales Development Representative (SDR)",
              tooltip: "شناسایی، ارزیابی و ایجاد سرنخ‌های فروش واجد شرایط.",
              children: [],
            },
            {
              label: "Sales Engineer / Pre-Sales Consultant (مهندس فروش)",
              tooltip: "ارائه فنی محصول و پشتیبانی از تیم فروش در معاملات پیچیده.",
              children: [],
            },
            {
              label: "Key Account Manager (مدیر حساب‌های کلیدی)",
              tooltip: "مدیریت و توسعه روابط با مشتریان کلیدی و قراردادهای بزرگ.",
              children: [],
            },
            {
              label: "Sales Representative (نماینده فروش)",
              tooltip: "پیگیری سرنخ‌ها، معرفی محصول و بستن فروش‌های روزمره.",
              children: [],
            },
          ],
        },
        {
          label: "Customer Success (موفقیت مشتری)",
          tooltip: "تضمین رضایت، حفظ و رشد مشتریان از طریق استفاده موثر از محصول.",
          children: [
            {
              label: "Customer Success Manager (CSM)",
              tooltip: "مدیریت روابط استراتژیک و موفقیت بلندمدت مشتریان.",
              children: [],
            },
            {
              label: "Account Manager (مدیر اکانت)",
              tooltip: "مدیریت مشتریان فعلی، شناسایی فرصت‌های Upsell/Cross-sell.",
              children: [],
            },
            {
              label: "Onboarding Specialist (متخصص راه‌اندازی مشتری)",
              tooltip: "راهنمایی و پشتیبانی مشتریان جدید در شروع استفاده از محصول.",
              children: [],
            },
            {
              label: "Support Specialist (کارشناس پشتیبانی)",
              tooltip: "پاسخگویی و حل مسائل مشتریان در همکاری با تیم پشتیبانی.",
              children: [],
            },
          ],
        },
        {
          label: "Sales Operations (عملیات فروش)",
          tooltip: "بهینه‌سازی فرآیندها، ابزارها (CRM) و تحلیل داده‌های فروش.",
          children: [
            {
              label: "Sales Operations Manager (مدیر عملیات فروش)",
              tooltip: "مدیریت و بهبود کارایی فرآیندهای فروش.",
              children: [],
            },
            {
              label: "Sales Analyst (تحلیلگر فروش)",
              tooltip: "تحلیل عملکرد فروش، پیش‌بینی و ارائه گزارشات.",
              children: [],
            },
            {
              label: "CRM Administrator (مدیر CRM)",
              tooltip: "مدیریت، پیکربندی و نگهداری سیستم CRM.",
              children: [],
            },
          ],
        },
      ],
    },
    // --- Finance Branch ---
    {
      label: "CFO (مدیر ارشد مالی)",
      tooltip: "راهبری استراتژی مالی، مدیریت ریسک، گزارش‌دهی مالی و تامین سرمایه.",
      children: [
        {
          label: "Accounting (حسابداری)",
          tooltip: "ثبت دقیق تراکنش‌ها، تهیه صورت‌های مالی مطابق استانداردها.",
          children: [
            {
              label: "Controller (کنترلر مالی)",
              tooltip: "نظارت بر عملیات حسابداری، گزارش‌دهی و کنترل‌های داخلی.",
              children: [],
            },
            {
              label: "Senior Accountant (حسابدار ارشد)",
              tooltip: "انجام امور پیچیده حسابداری، تحلیل و گزارش‌دهی.",
              children: [],
            },
            {
              label: "Accountant (حسابدار)",
              tooltip: "ثبت روزانه اسناد مالی و مغایرت‌گیری حساب‌ها.",
              children: [],
            },
            {
              label: "Accounts Payable Specialist (کارشناس پرداختنی‌ها)",
              tooltip: "مدیریت فرآیند پرداخت به تامین‌کنندگان و کنترل هزینه‌ها.",
              children: [],
            },
            {
              label: "Accounts Receivable Specialist (کارشناس دریافتنی‌ها)",
              tooltip: "مدیریت فرآیند صدور فاکتور و وصول مطالبات از مشتریان.",
              children: [],
            },
          ],
        },
        {
          label: "Financial Planning & Analysis (FP&A)",
          tooltip: "بودجه‌بندی، پیش‌بینی، تحلیل عملکرد مالی و پشتیبانی از تصمیمات استراتژیک.",
          children: [
            {
              label: "FP&A Manager (مدیر برنامه‌ریزی و تحلیل مالی)",
              tooltip: "راهبری فرآیندهای بودجه‌بندی، پیش‌بینی و تحلیل مالی.",
              children: [],
            },
            {
              label: "Financial Analyst (تحلیلگر مالی)",
              tooltip: "تحلیل داده‌های مالی، مدل‌سازی و تهیه گزارشات مدیریتی.",
              children: [],
            },
          ],
        },
        {
          label: "Treasury (خزانه‌داری)",
          tooltip: "مدیریت نقدینگی، روابط بانکی، سرمایه‌گذاری‌ها و ریسک‌های مالی.",
          children: [
            {
              label: "Treasurer (خزانه‌دار)",
              tooltip: "مدیریت جریان نقدینگی و استراتژی‌های تامین مالی.",
              children: [],
            },
          ],
        },
      ],
    },
    // --- Human Resources Branch ---
    {
      label: "CHRO (مدیر ارشد منابع انسانی)",
      tooltip: "راهبری استراتژی منابع انسانی، مدیریت استعداد، فرهنگ سازمانی و توسعه کارکنان.",
      children: [
        {
          label: "Talent Acquisition (جذب استعداد)",
          tooltip: "جذب، ارزیابی و استخدام بهترین استعدادها برای سازمان.",
          children: [
            {
              label: "Talent Acquisition Manager (مدیر جذب استعداد)",
              tooltip: "مدیریت استراتژی و فرآیندهای جذب و استخدام.",
              children: [],
            },
            {
              label: "Recruiter (کارشناس استخدام)",
              tooltip: "اجرای کامل فرآیند استخدام از منبع‌یابی تا پیشنهاد شغلی.",
              children: [],
            },
            {
              label: "Sourcer (کارشناس منبع‌یابی)",
              tooltip: "شناسایی و جذب کاندیداهای بالقوه از کانال‌های مختلف.",
              children: [],
            },
            {
              label: "Employer Branding Specialist (متخصص برند کارفرمایی)",
              tooltip: "تقویت و ترویج برند کارفرمایی برای جذب استعدادها.",
              children: [],
            },
          ],
        },
        {
          label: "HR Operations & Compensation/Benefits",
          tooltip: "مدیریت امور اداری کارکنان، حقوق و دستمزد، مزایا و سیستم‌های اطلاعاتی HR.",
          children: [
            {
              label: "HR Operations Manager (مدیر عملیات منابع انسانی)",
              tooltip: "مدیریت و بهینه‌سازی فرآیندهای اداری و سیستم‌های HR.",
              children: [],
            },
            {
              label: "HR Generalist (کارشناس عمومی منابع انسانی)",
              tooltip: "پشتیبانی در حوزه‌های مختلف HR مانند استخدام، روابط کارکنان و مزایا.",
              children: [],
            },
            {
              label: "Payroll Specialist (کارشناس حقوق و دستمزد)",
              tooltip: "محاسبه دقیق و پرداخت به‌موقع حقوق و مزایا.",
              children: [],
            },
            {
              label: "Compensation & Benefits Specialist (کارشناس جبران خدمات)",
              tooltip: "طراحی، پیاده‌سازی و مدیریت برنامه‌های حقوق، مزایا و پاداش.",
              children: [],
            },
            {
              label: "HRIS Analyst (تحلیلگر سیستم‌های HR)",
              tooltip: "مدیریت، تحلیل داده‌ها و گزارش‌گیری از سیستم‌های اطلاعاتی منابع انسانی.",
              children: [],
            },
            {
              label: "HR Manager (مدیر منابع انسانی)",
              tooltip: "مدیریت سیاست‌ها، فرآیندها و تیم‌های حوزه منابع انسانی.",
              children: [],
            },
            {
              label: "HR Specialist (کارشناس منابع انسانی)",
              tooltip: "اجرای فرآیندهای HR، پشتیبانی از کارکنان و همکاری بین واحدی.",
              children: [],
            },
          ],
        },
        {
          label: "Learning & Development (آموزش و توسعه)",
          tooltip: "طراحی و اجرای برنامه‌های آموزشی برای ارتقای مهارت‌ها و رشد کارکنان.",
          children: [
            {
              label: "L&D Manager (مدیر آموزش و توسعه)",
              tooltip: "راهبری استراتژی‌ها و برنامه‌های آموزش و توسعه کارکنان.",
              children: [],
            },
            {
              label: "Instructional Designer (طراح آموزشی)",
              tooltip: "طراحی و توسعه محتوای آموزشی جذاب و موثر.",
              children: [],
            },
            {
              label: "Trainer (مدرس)",
              tooltip: "اجرای برنامه‌ها و کارگاه‌های آموزشی.",
              children: [],
            },
          ],
        },
        {
          label: "Employee Relations & Culture",
          tooltip: "مدیریت روابط کارکنان، رسیدگی به مسائل، تقویت فرهنگ سازمانی مثبت.",
          children: [
            {
              label: "Employee Relations Specialist (کارشناس روابط کارکنان)",
              tooltip: "رسیدگی به مسائل کارکنان، مشاوره و اجرای سیاست‌ها.",
              children: [],
            },
            {
              label: "Culture Specialist (کارشناس فرهنگ سازمانی)",
              tooltip: "طراحی و اجرای برنامه‌های تقویت فرهنگ و تعلق سازمانی.",
              children: [],
            },
          ],
        },
      ],
    },
    // --- Operations & Support Branch ---
    {
      label: "COO (مدیر ارشد عملیات)",
      tooltip: "نظارت و بهینه‌سازی عملیات روزمره، فرآیندهای کسب‌وکار و پشتیبانی.",
      children: [
        {
          label: "Customer Support (پشتیبانی مشتری)",
          tooltip: "ارائه پشتیبانی فنی و غیرفنی به مشتریان برای حل مشکلات و پاسخ به سوالات.",
          children: [
            {
              label: "Support Manager (مدیر پشتیبانی)",
              tooltip: "مدیریت تیم، فرآیندها و کیفیت خدمات پشتیبانی.",
              children: [],
            },
            {
              label: "Tier 1 Support Specialist (کارشناس پشتیبانی سطح ۱)",
              tooltip: "پاسخگویی اولیه به مشتریان و حل مشکلات رایج.",
              children: [],
            },
            {
              label: "Tier 2 Support Specialist (کارشناس پشتیبانی سطح ۲)",
              tooltip: "رسیدگی به مشکلات فنی پیچیده‌تر و نیازمند تخصص.",
              children: [],
            },
            {
              label: "Tier 3 Support Specialist (مهندس پشتیبانی)",
              tooltip: "حل مشکلات بسیار پیچیده، همکاری با توسعه و تحلیل ریشه‌ای.",
              children: [],
            },
            {
              label: "Technical Writer (نویسنده فنی - مستندات)",
              tooltip: "تهیه و به‌روزرسانی پایگاه دانش، راهنماها و مستندات فنی.",
              children: [],
            },
            {
              label: "Support Operations Analyst (تحلیلگر عملیات پشتیبانی)",
              tooltip: "تحلیل داده‌های پشتیبانی، بهبود فرآیندها و ابزارها.",
              children: [],
            },
          ],
        },
        {
          label: "Business Operations (عملیات کسب‌وکار)",
          tooltip: "بهینه‌سازی فرآیندهای داخلی، مدیریت پروژه‌های عملیاتی و هماهنگی بین بخشی.",
          children: [
            {
              label: "Business Operations Manager (مدیر عملیات کسب‌وکار)",
              tooltip: "راهبری بهبود مستمر فرآیندها و کارایی عملیاتی.",
              children: [],
            },
            {
              label: "Process Improvement Specialist (کارشناس بهبود فرآیند)",
              tooltip: "شناسایی گلوگاه‌ها و پیاده‌سازی راهکارهای بهبود فرآیند.",
              children: [],
            },
            {
              label: "Project Manager (مدیر پروژه - عملیاتی)",
              tooltip: "مدیریت پروژه‌های داخلی مرتبط با بهبود عملیات.",
              children: [],
            },
          ],
        },
        {
          label: "Administration & Facilities (امور اداری و تاسیسات)",
          tooltip: "مدیریت امور دفتری، پشتیبانی اداری، نگهداری و مدیریت فضای فیزیکی شرکت.",
          children: [
            {
              label: "Office Manager (مدیر دفتر)",
              tooltip: "مدیریت امور اجرایی و پشتیبانی روزمره دفتر.",
              children: [],
            },
            {
              label: "Administrative Assistant (دستیار اداری)",
              tooltip: "ارائه پشتیبانی اداری به تیم‌ها و مدیریت.",
              children: [],
            },
            {
              label: "Receptionist (مسئول پذیرش)",
              tooltip: "مدیریت پذیرش، پاسخگویی تلفن‌ها و امور اولیه مراجعین.",
              children: [],
            },
            {
              label: "Facilities Coordinator (هماهنگ‌کننده تاسیسات)",
              tooltip: "مدیریت نگهداری، تعمیرات و خدمات مربوط به ساختمان.",
              children: [],
            },
            {
              label: "Office Helper / Tea Server (آبدارچی / خدمات)",
              tooltip: "انجام امور خدماتی، نظافت و پذیرایی در محیط کار.",
              children: [],
            },
          ],
        },
      ],
    },
    // --- Legal Branch ---
    {
      label: "General Counsel / Head of Legal (مدیر ارشد حقوقی)",
      tooltip: "ارائه مشاوره حقوقی استراتژیک، مدیریت ریسک‌های حقوقی و تطبیق با مقررات.",
      children: [
        {
          label: "Corporate Counsel (مشاور حقوقی شرکت)",
          tooltip: "رسیدگی به امور حقوقی شرکت، قراردادها و دعاوی.",
          children: [],
        },
        {
          label: "Contracts Manager (مدیر قراردادها)",
          tooltip: "بررسی، مذاکره و مدیریت چرخه عمر قراردادها.",
          children: [],
        },
        {
          label: "Compliance Officer (مسئول تطبیق با مقررات)",
          tooltip: "تضمین رعایت قوانین، مقررات و استانداردهای صنعت.",
          children: [],
        },
        {
          label: "Paralegal (دستیار حقوقی)",
          tooltip: "پشتیبانی تحقیقاتی و اجرایی از تیم حقوقی.",
          children: [],
        },
        {
          label: "Legal Advisor (مشاور حقوقی)",
          tooltip: "ارائه مشاوره حقوقی در قراردادها، دعاوی، مالکیت فکری و مدیریت ریسک‌ها.",
          children: [],
        },
      ],
    },
    // --- Data Branch ---
    {
      label: "CDO / Head of Data (مدیر ارشد داده)",
      tooltip: "راهبری استراتژی داده، مدیریت داده به عنوان دارایی، تضمین کیفیت و راهبری داده.",
      children: [
        {
          label: "Data Engineering (مهندسی داده)",
          tooltip: "طراحی، ساخت و نگهداری زیرساخت‌ها و پایپ‌لاین‌های پردازش داده.",
          children: [
            {
              label: "Data Engineering Manager (مدیر مهندسی داده)",
              tooltip: "مدیریت تیم و پروژه‌های مهندسی داده.",
              children: [],
            },
            {
              label: "Data Engineer (مهندس داده)",
              tooltip: "پیاده‌سازی ETL/ELT، انبار داده و دریاچه داده.",
              children: [],
            },
          ],
        },
        {
          label: "Data Science & Machine Learning",
          tooltip: "استخراج دانش و ساخت مدل‌های پیش‌بینی با استفاده از علم داده و ML.",
          children: [
            {
              label: "Data Science Manager (مدیر علم داده)",
              tooltip: "مدیریت تیم و پروژه‌های علم داده و یادگیری ماشین.",
              children: [],
            },
            {
              label: "Data Scientist (دانشمند داده)",
              tooltip: "تحلیل داده‌های پیچیده، توسعه و ارزیابی مدل‌های آماری و ML.",
              children: [],
            },
            {
              label: "Machine Learning Engineer (مهندس یادگیری ماشین)",
              tooltip: "پیاده‌سازی، استقرار و مانیتورینگ مدل‌های ML در محیط عملیاتی.",
              children: [],
            },
          ],
        },
        {
          label: "Business Intelligence & Analytics",
          tooltip: "تبدیل داده به اطلاعات کاربردی از طریق گزارشات، داشبوردها و تحلیل.",
          children: [
            {
              label: "BI Manager (مدیر هوش تجاری)",
              tooltip: "مدیریت تیم و استراتژی هوش تجاری و تحلیل.",
              children: [],
            },
            {
              label: "BI Developer/Analyst (توسعه‌دهنده/تحلیلگر BI)",
              tooltip: "طراحی و ساخت گزارشات، داشبوردها و مدل‌های داده BI.",
              children: [],
            },
            {
              label: "Data Analyst (تحلیلگر داده)",
              tooltip: "تحلیل داده‌ها برای پاسخ به سوالات کسب‌وکار و شناسایی روندها.",
              children: [],
            },
          ],
        },
        {
          label: "Data Governance (راهبری داده)",
          tooltip: "تعریف و اجرای سیاست‌ها برای تضمین کیفیت، امنیت و استفاده صحیح از داده.",
          children: [
            {
              label: "Data Governance Lead (سرپرست راهبری داده)",
              tooltip: "هدایت پیاده‌سازی چارچوب و فرآیندهای راهبری داده.",
              children: [],
            },
            {
              label: "Data Steward (متولی داده)",
              tooltip: "مسئولیت کیفیت، تعاریف و مدیریت داده در یک حوزه مشخص.",
              children: [],
            },
          ],
        },
      ],
    },
  ],
};

// تولید کدهای سلسله‌مراتبی برای هر نود (0 برای ریشه، 1..n برای فرزندان سطح اول، 1-1 برای فرزندان CTO و ...)
const assignCodes = (root: TreeNodeType): TreeNodeType => {
  const cloneNode = (node: TreeNodeType): TreeNodeType => ({
    label: node.label,
    tooltip: node.tooltip,
    children: node.children ? node.children.map(cloneNode) : undefined,
  });

  const cloned = cloneNode(root);

  const walk = (node: TreeNodeType, parentCode: string | null) => {
    if (parentCode === null) {
      node.code = "0";
    }
    const kids = node.children || [];
    kids.forEach((child, idx) => {
      const index = idx + 1; // از 1 شروع شود
      const code = parentCode === null ? String(index) : `${node.code}-${index}`;
      child.code = code;
      walk(child, code);
    });
  };

  walk(cloned, null);
  return cloned;
};

const rootWithCodes = assignCodes(orgChart);

// تخت کردن ساختار برای نمایش در جدول
type FlatRole = { code: string; label: string; tooltip?: string };
const flattenOrg = (node: TreeNodeType): FlatRole[] => {
  const acc: FlatRole[] = [];
  const dfs = (n: TreeNodeType) => {
    if (n.code) acc.push({ code: n.code, label: n.label, tooltip: n.tooltip });
    (n.children || []).forEach(dfs);
  };
  // افزودن ریشه با کد 0
  acc.push({ code: "0", label: node.label, tooltip: node.tooltip });
  (node.children || []).forEach(dfs);
  return acc;
};

const flatRoles = flattenOrg(rootWithCodes);

// نقشه‌ی کد → عنوان نقش (برای استفاده به عنوان enum در runtime)
export const OrgRoleEnumMap: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(flatRoles.map((r) => [r.code, r.label])) as Record<string, string>
);
// نوع کد نقش‌ها (می‌توانید اگر نسخه‌ی استاتیک نیاز دارید فایل جداگانه تولید کنیم)
export type OrgRoleCode = string;

function OrgChart() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandAll, setExpandAll] = useState(false);
  const [showEnumTable, setShowEnumTable] = useState(false);

  const filterNodes = (node: TreeNodeType, searchTerm: string): TreeNodeType | null => {
    if (!searchTerm.trim()) return node;

    const nodeMatches =
      node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (node.tooltip && node.tooltip.toLowerCase().includes(searchTerm.toLowerCase()));

    const filteredChildren =
      (node.children?.map((child) => filterNodes(child, searchTerm)).filter(Boolean) as TreeNodeType[]) || [];

    if (nodeMatches || filteredChildren.length > 0) {
      return {
        ...node,
        code: node.code,
        children: filteredChildren,
      };
    }

    return null;
  };

  const filteredOrgChart = searchTerm ? filterNodes(rootWithCodes, searchTerm) : rootWithCodes;

  return (
    <div className={styles.orgChartContainer}>
      <div className={styles.orgChartHeader}>
        <h1 className={styles.orgChartTitle}>چارت سازمانی برنسی</h1>

        <div className={styles.controlsContainer}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="جستجو در چارت سازمانی..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
              aria-label="جستجو در چارت سازمانی"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className={styles.clearButton} aria-label="پاک کردن جستجو">
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => setExpandAll(!expandAll)}
            className={styles.expandButton}
            aria-label={expandAll ? "بستن همه بخش‌ها" : "باز کردن همه بخش‌ها"}>
            {expandAll ? "بستن همه" : "باز کردن همه"}
          </button>

          <button
            onClick={() => setShowEnumTable((s) => !s)}
            className={styles.expandButton}
            aria-label={showEnumTable ? "پنهان کردن کدها" : "نمایش بر اساس کد سازمانی"}>
            {showEnumTable ? "پنهان کردن کدها" : "نمایش بر اساس کد سازمانی"}
          </button>
        </div>
      </div>

      {showEnumTable && (
        <div role="region" aria-label="جدول کد نقش‌ها" style={{ marginTop: "12px", color: "var(--text-h1)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid var(--border-color, #ccc)" }}>
                    کد
                  </th>
                  <th
                    style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid var(--border-color, #ccc)" }}>
                    نقش
                  </th>
                </tr>
              </thead>
              <tbody>
                {flatRoles.map((r) => (
                  <tr key={r.code}>
                    <td style={{ padding: "6px 8px" }}>{r.code}</td>
                    <td style={{ padding: "6px 8px" }}>{r.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className={styles.treeContainer} role="tree" aria-label="چارت سازمانی">
        {filteredOrgChart ? (
          <TreeNode {...filteredOrgChart} expandAll={expandAll} />
        ) : (
          <div className={styles.noResults}>هیچ نتیجه‌ای برای "{searchTerm}" یافت نشد</div>
        )}
      </div>
    </div>
  );
}
const OrgChartPage = () => {
  const { t, i18n } = useTranslation();
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInType, setSignInType] = useState(SignInType.Phonenumber);
  const [preUserToken, setPreUserToken] = useState("");
  const [hasMounted, setHasMounted] = useState(false);

  const [themeState, dispatch] = useReducer(themeReducer, {
    themeMode: "light mode",
    darkTheme: undefined,
    language: "en",
  });

  useEffect(() => {
    setHasMounted(true);
    const theme = window.localStorage.getItem("theme");
    const lng = window.localStorage.getItem("language");

    if (theme) {
      dispatch({
        type: "SET_THEME",
        payload: {
          themeMode: theme === "dark" ? "Dark mode" : "light mode",
          darkTheme: theme === "dark",
        },
      });
    }

    if (lng) {
      dispatch({ type: "SET_LANGUAGE", payload: lng });
      i18n.changeLanguage(lng);
    } else {
      dispatch({ type: "SET_LANGUAGE", payload: "en" });
      i18n.changeLanguage("en");
      window.localStorage.setItem("language", "en");
    }
  }, [i18n]);

  useEffect(() => {
    if (themeState.darkTheme !== undefined) {
      if (themeState.darkTheme) {
        document.documentElement.setAttribute("data-theme", "dark");
        window.localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
        window.localStorage.setItem("theme", "light");
      }
    }
  }, [themeState.darkTheme]);

  const handleShowCreateSignIn = useCallback(() => {
    setPreUserToken("");
    setSignInType(SignInType.Phonenumber);
    setShowSignIn(true);
  }, []);

  const removeMask = useCallback(() => {
    setShowSignIn(false);
  }, []);

  if (!hasMounted) return null;

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Organization Chart | Brancy</title>
        <meta name="description" content="Brancy organization chart and company structure" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/Accessibility/OrgChart" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="touch-action" content="manipulation" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Head>

      <AccessibilityHeader themeState={themeState} dispatch={dispatch} onShowCreateSignIn={handleShowCreateSignIn} />

      <OrgChart />

      {showSignIn && (
        <SignIn
          preUserToken={preUserToken}
          redirectType={RedirectType.Instagramer}
          signInType={signInType}
          removeMask={removeMask}
          removeMaskWithNotif={() => {}}
        />
      )}
    </>
  );
};

export default OrgChartPage;
