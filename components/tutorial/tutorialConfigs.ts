export interface TutorialStep {
  title: string;
  content: string;
  target?: string; // CSS selector برای نشان دادن المنت مربوطه
  position: {
    top?: string;
    left?: string;
    marginInlineStart?: string;
    marginInlineEnd?: string;
    bottom?: string;
    right?: string;
    transform?: string;
  };
}
export interface TutorialConfig {
  mobile: TutorialStep[];
  desktop: TutorialStep[];
}

// توتریال صفحه اصلی✅
export const homeTutorial: TutorialConfig = {
  mobile: [
    {
      title: "navigation menu",
      content: "you can access navigate in system",
      target: "header ",
      position: {
        top: "100px",
      },
    },
    // {
    //   title: "داشبورد آماری",
    //   content: "در این قسمت می‌توانید آمار کلی حساب کاربری، تعداد فالوورها، لایک‌ها و عملکرد کلی را مشاهده کنید",
    //   target: "#hometiles",
    //   position: { top: "100px" },
    // },
    // {
    //   title: "کارت های محتوای اصلی",
    //   content:
    //     "در این بخش می‌توانید آخرین پیام‌های دریافتی، کامنت‌ها و پاسخ‌های خود و یا سایر محتواها را مشاهده و مدیریت کنید",
    //   target: ".pinContainer",
    //   position: { top: "100px" },
    // },
    // {
    //   title: "کوچک کردن کارت ها",
    //   content: "برای راحتی بیشتر میتوانید کارت ها را کوچک و یا بزرگ کنید",
    //   target: ".pinContainer > section >div >header",
    //   position: { top: "100px" },
    // },
  ],
  desktop: [
    {
      title: "navigation menu",
      content: "you can access navigate in system",
      target: "nav ",
      position: { top: "100px", left: "50%", transform: "translateX(-50%)" },
    },
    // {
    //   title: "منو کاربری و بخش اعلان ها ",
    //   content: "از طریق این منو می‌توانید به تنظیمات و سایر بخش‌ها دسترسی پیدا کنید",
    //   target: "header > div:nth-child(3) ",
    //   position: { top: "100px", left: "50%", transform: "translateX(-50%)" },
    // },
    // {
    //   title: "داشبورد آماری",
    //   content: "در این قسمت می‌توانید آمار کلی حساب کاربری، تعداد فالوورها، لایک‌ها و عملکرد کلی را مشاهده کنید",
    //   target: "#hometiles",
    //   position: { top: "300px", right: "50%", transform: "translateX(50%)" },
    // },
    // {
    //   title: "کارت های محتوای اصلی",
    //   content:
    //     "در این بخش می‌توانید آخرین پیام‌های دریافتی، کامنت‌ها و پاسخ‌های خود و یا سایر محتواها را مشاهده و مدیریت کنید",
    //   target: ".pinContainer",
    //   position: { top: "50px", right: "50%", transform: "translateX(50%)" },
    // },
    // {
    //   title: "کوچک کردن کارت ها",
    //   content: "برای راحتی بیشتر میتوانید کارت ها را کوچک و یا بزرگ کنید",
    //   target: ".pinContainer > section >div >header",
    //   position: { top: "50px", right: "50%", transform: "translateX(50%)" },
    // },
  ],
};
// توتریال هدر اصلی
export const headerTutorial: TutorialConfig = {
  mobile: [
    {
      title: "navigation menu",
      content: "you can access navigate in system",
      target: "#menuparentleft",
      position: {
        top: "300px",
      },
    },
    // {
    //   title: "بخش اعلان ها",
    //   content: "در این بخش می‌توانید اعلان‌های جدید و مهم را مشاهده کنید",
    //   target: "#notification",
    //   position: {
    //     top: "100px",
    //   },
    // },
    // {
    //   title: "منوی کاربری",
    //   content: "در این منو میتوانید منو مربوط به تغییر حساب کاربری و نیز ارتقائ اکانت و منو خروج را مشاهده کنید",
    //   target: "#usermenu",
    //   position: {
    //     top: "100px",
    //   },
    // },
  ],
  desktop: [],
};

// فهرست تمام توتریال‌ها
export const tutorialConfigs = {
  home: homeTutorial,
  header: headerTutorial,

  // سایر صفحات را می‌توان در اینجا اضافه کرد
};

export type TutorialPageKey = keyof typeof tutorialConfigs;
