import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./i18n/ar";
import az from "./i18n/az";
import en from "./i18n/en";
import fa from "./i18n/fa";
import fr from "./i18n/fr";
import gr from "./i18n/gr";
import { LanguageKey } from "./i18n/languageKeys";
import ru from "./i18n/ru";
import tr from "./i18n/tr";

// برای سازگاری با نسخه‌های قبلی export می‌کنیم
// ولی در نسخه‌های جدید می‌توانید مستقیماً از کلیدهای رشته‌ای استفاده کنید
export { LanguageKey };

const resources = {
  en,
  fa,
  ar,
  fr,
  ru,
  tr,
  gr,
  az,
};
i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});
export default i18n;

//  قدیمی
// <h1>{t(LanguageKey.services)}</h1>

//  جدید
// <h1>{t('services')}</h1>

//  دیگر نیازی به import کردن LanguageKey نیست

// import { useTranslation } from 'react-i18next';
// const MyComponent = () => {
//   const { t } = useTranslation();
//   return (
//     <div>
//       <h1>{t('services')}</h1>
//       <p>{t('page1_text1')}</p>
//     </div>
//   );
// };
