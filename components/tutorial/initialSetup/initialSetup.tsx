import { useSession } from "next-auth/react";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import RadioButton from "brancy/components/design/radioButton";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import { LanguageKey } from "brancy/i18n";
import { InitialSetupState } from "brancy/models/homeIndex/home";
import { MethodType } from "brancy/helper/api";
import styles from "brancy/components/tutorial/initialSetup/initialSetup.module.css";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
interface InitialSetupProps {
  onComplete: () => void;
}
interface ILanguage {
  arabic: boolean;
  english: boolean;
  french: boolean;
  german: boolean;
  persian: boolean;
  russian: boolean;
  turkey: boolean;
  azerbaijani: boolean;
}
interface ICalendar {
  Gregorian: boolean;
  Hijri: boolean;
  Hindi: boolean;
  shamsi: boolean;
}
const InitialSetup: React.FC<InitialSetupProps> = ({ onComplete }) => {
  const { data: session } = useSession();
  const { i18n, t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [language, setLanguage] = useState<ILanguage>({
    arabic: false,
    english: true,
    french: false,
    german: false,
    persian: false,
    russian: false,
    turkey: false,
    azerbaijani: false,
  });
  const [themeMode, setThemeMode] = useState<string>("light mode");
  const [calendar, setCalendar] = useState<ICalendar>({
    Gregorian: true,
    Hijri: false,
    Hindi: false,
    shamsi: false,
  });
  const setupSteps = [
    {
      title: t(LanguageKey.chooselanguage),
      subtitle: t(LanguageKey.chooselanguageExplain),
      component: "language",
    },
    {
      title: t(LanguageKey.chooseTheme),
      subtitle: t(LanguageKey.chooseThemeExplain),
      component: "theme",
    },
    {
      title: t(LanguageKey.chooseCalendar),
      subtitle: t(LanguageKey.chooseCalendarExplain),
      component: "calendar",
    },
  ];
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };
  const handleLanguageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedLang = e.target.name;
    const newLanguageState = {
      arabic: selectedLang === "arabic",
      english: selectedLang === "english",
      french: selectedLang === "french",
      german: selectedLang === "german",
      persian: selectedLang === "persian",
      russian: selectedLang === "russian",
      turkey: selectedLang === "turkey",
      azerbaijani: selectedLang === "azerbaijani",
    };
    setLanguage(newLanguageState);
    switch (selectedLang) {
      case "english":
        changeLanguage("en");
        window.localStorage.setItem("language", "en");
        break;
      case "persian":
        changeLanguage("fa");
        window.localStorage.setItem("language", "fa");
        break;
      case "arabic":
        changeLanguage("ar");
        window.localStorage.setItem("language", "ar");
        break;
      case "french":
        changeLanguage("fr");
        window.localStorage.setItem("language", "fr");
        break;
      case "russian":
        changeLanguage("ru");
        window.localStorage.setItem("language", "ru");
        break;
      case "german":
        changeLanguage("gr");
        window.localStorage.setItem("language", "gr");
        break;
      case "turkey":
        changeLanguage("tr");
        window.localStorage.setItem("language", "tr");
        break;
      case "azerbaijani":
        changeLanguage("az");
        window.localStorage.setItem("language", "az");
    }
  };
  const handleThemeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedTheme = e.target.name;
    setThemeMode(selectedTheme);
    const isDark = selectedTheme === "Dark mode";
    if (isDark) {
      document.documentElement.setAttribute("data-theme", "dark");
      window.localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      window.localStorage.setItem("theme", "light");
    }
  };
  const handleCalendarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedCalendar = e.target.name;
    const newCalendarState = {
      Gregorian: selectedCalendar === "Gregorian",
      Hijri: selectedCalendar === "Hijri",
      Hindi: selectedCalendar === "Hindi",
      shamsi: selectedCalendar === "shamsi",
    };
    setCalendar(newCalendarState);
    window.localStorage.setItem("calendar", selectedCalendar);
  };
  const handleNext = () => {
    if (currentStep < setupSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem("brancy_initial_setup_completed", "true");
    handleUiSettingUpdate();
    setTimeout(() => {
      onComplete();
    }, 300);
  };
  async function handleUiSettingUpdate() {
    try {
      const settingUiUpdate: InitialSetupState = {
        calendar: window.localStorage.getItem("calendar") || "Gregorian",
        language: window.localStorage.getItem("language") || "en",
        theme: window.localStorage.getItem("theme") || "light",
      };
      const res = await clientFetchApi<InitialSetupState, boolean>("/api/uisetting/Update", { methodType: MethodType.post, session: session, data: settingUiUpdate, queries: undefined, onUploadProgress: undefined });

      if (!res.succeeded) notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  const [showTitleTooltip, setTitleShowTooltip] = useState(false);
  const [showtitleTooltip, setpackagingweightsShowTooltip] = useState(false);
  const [showCustomTitleTooltip, setShowCustomTitleTooltip] = useState(false);
  const customTitleRef = useRef<HTMLDivElement>(null);
  const titleTooltipRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (customTitleRef.current && !customTitleRef.current.contains(event.target as Node)) {
        setShowCustomTitleTooltip(false);
      }
      if (titleTooltipRef.current && !titleTooltipRef.current.contains(event.target as Node)) {
        setTitleShowTooltip(false);
      }
    }
    if (showCustomTitleTooltip || showTitleTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCustomTitleTooltip, showTitleTooltip]);
  const renderLanguageStep = () => (
    <div className={styles.stepContent}>
      <div className={styles.optionsGrid}>
        <div
          className={styles.radioOption}
          onClick={() =>
            handleLanguageChange({
              target: { name: "english" },
            } as ChangeEvent<HTMLInputElement>)
          }>
          <RadioButton
            name="english"
            id="English"
            checked={language.english}
            handleOptionChanged={handleLanguageChange}
            textlabel="English"
            title="English"
          />
        </div>
        <div
          className={styles.radioOption}
          onClick={() =>
            handleLanguageChange({
              target: { name: "persian" },
            } as ChangeEvent<HTMLInputElement>)
          }>
          <RadioButton
            name="persian"
            id="فارسی"
            checked={language.persian}
            handleOptionChanged={handleLanguageChange}
            textlabel="فارسی"
            title="فارسی"
          />
        </div>
        <div
          className={styles.radioOption}
          onClick={() =>
            handleLanguageChange({
              target: { name: "arabic" },
            } as ChangeEvent<HTMLInputElement>)
          }>
          <RadioButton
            name="arabic"
            id="العربية"
            checked={language.arabic}
            handleOptionChanged={handleLanguageChange}
            textlabel="العربية"
            title="العربية"
          />
        </div>
        <div
          className={styles.radioOption}
          onClick={() =>
            handleLanguageChange({
              target: { name: "turkey" },
            } as ChangeEvent<HTMLInputElement>)
          }>
          <RadioButton
            name="turkey"
            id="Türkçe"
            checked={language.turkey}
            handleOptionChanged={handleLanguageChange}
            textlabel="Türkçe"
            title="Türkçe"
          />
        </div>
        <div
          className={styles.radioOption}
          onClick={() =>
            handleLanguageChange({
              target: { name: "french" },
            } as ChangeEvent<HTMLInputElement>)
          }>
          <RadioButton
            name="french"
            id="Français"
            checked={language.french}
            handleOptionChanged={handleLanguageChange}
            textlabel="Français"
            title="Français"
          />
        </div>
        <div
          className={styles.radioOption}
          onClick={() =>
            handleLanguageChange({
              target: { name: "russian" },
            } as ChangeEvent<HTMLInputElement>)
          }>
          <RadioButton
            name="russian"
            id="Русский"
            checked={language.russian}
            handleOptionChanged={handleLanguageChange}
            textlabel="Русский"
            title="Русский"
          />
        </div>
        <div
          className={styles.radioOption}
          onClick={() =>
            handleLanguageChange({
              target: { name: "german" },
            } as ChangeEvent<HTMLInputElement>)
          }>
          <RadioButton
            name="german"
            id="Deutsch"
            checked={language.german}
            handleOptionChanged={handleLanguageChange}
            textlabel="Deutsch"
            title="Deutsch"
          />
        </div>
        <div
          className={styles.radioOption}
          onClick={() =>
            handleLanguageChange({
              target: { name: "azerbaijani" },
            } as ChangeEvent<HTMLInputElement>)
          }>
          <RadioButton
            name="azerbaijani"
            id="Azərbaycan"
            checked={language.azerbaijani}
            handleOptionChanged={handleLanguageChange}
            textlabel="Azərbaycan"
            title="Azərbaycan"
          />
        </div>
      </div>
    </div>
  );
  const renderThemeStep = () => (
    <div className={styles.stepContent}>
      <div className={styles.themeOptions}>
        <div
          className={styles.themeCard}
          onClick={() =>
            handleThemeChange({
              target: { name: "light mode" },
            } as ChangeEvent<HTMLInputElement>)
          }>
          <div className={styles.themePreview}>
            <div className={styles.lightPreview}>
              <div className={styles.previewHeader}></div>
              <div className={styles.previewContent}></div>
            </div>
          </div>
          <RadioButton
            name="light mode"
            id={t(LanguageKey.SettingGeneralSystemlightmode)}
            checked={themeMode === "light mode"}
            handleOptionChanged={handleThemeChange}
            textlabel={t(LanguageKey.SettingGeneralSystemlightmode)}
            title={t(LanguageKey.SettingGeneralSystemlightmode)}
          />
        </div>
        <div
          className={styles.themeCard}
          onClick={() =>
            handleThemeChange({
              target: { name: "Dark mode" },
            } as ChangeEvent<HTMLInputElement>)
          }>
          <div className={styles.themePreview}>
            <div className={styles.darkPreview}>
              <div className={styles.previewHeader}></div>
              <div className={styles.previewContent}></div>
            </div>
          </div>
          <RadioButton
            name="Dark mode"
            id={t(LanguageKey.SettingGeneralSystemDarkmode)}
            checked={themeMode === "Dark mode"}
            handleOptionChanged={handleThemeChange}
            textlabel={t(LanguageKey.SettingGeneralSystemDarkmode)}
            title={t(LanguageKey.SettingGeneralSystemDarkmode)}
          />
        </div>
      </div>
    </div>
  );
  const renderCalendarStep = () => (
    <div className={styles.stepContent}>
      <div className={styles.optionsGrid}>
        <div
          className={styles.radioOption}
          onClick={() =>
            handleCalendarChange({
              target: { name: "Gregorian" },
            } as ChangeEvent<HTMLInputElement>)
          }>
          <RadioButton
            name="Gregorian"
            id={t(LanguageKey.SettingGeneralSystemGregorian)}
            checked={calendar.Gregorian}
            handleOptionChanged={handleCalendarChange}
            textlabel={t(LanguageKey.SettingGeneralSystemGregorian)}
            title={t(LanguageKey.SettingGeneralSystemGregorian)}
          />
        </div>
        <div
          className={styles.radioOption}
          onClick={() =>
            handleCalendarChange({
              target: { name: "shamsi" },
            } as ChangeEvent<HTMLInputElement>)
          }>
          <RadioButton
            name="shamsi"
            id={t(LanguageKey.SettingGeneralSystemshamsi)}
            checked={calendar.shamsi}
            handleOptionChanged={handleCalendarChange}
            textlabel={t(LanguageKey.SettingGeneralSystemshamsi)}
            title={t(LanguageKey.SettingGeneralSystemshamsi)}
          />
        </div>
        <div
          className={styles.radioOption}
          onClick={() =>
            handleCalendarChange({
              target: { name: "Hijri" },
            } as ChangeEvent<HTMLInputElement>)
          }>
          <RadioButton
            name="Hijri"
            id={t(LanguageKey.SettingGeneralSystemHijri)}
            checked={calendar.Hijri}
            handleOptionChanged={handleCalendarChange}
            textlabel={t(LanguageKey.SettingGeneralSystemHijri)}
            title={t(LanguageKey.SettingGeneralSystemHijri)}
          />
        </div>
        <div
          className={styles.radioOption}
          onClick={() =>
            handleCalendarChange({
              target: { name: "Hindi" },
            } as ChangeEvent<HTMLInputElement>)
          }>
          <RadioButton
            name="Hindi"
            id={t(LanguageKey.SettingGeneralSystemHindi)}
            checked={calendar.Hindi}
            handleOptionChanged={handleCalendarChange}
            textlabel={t(LanguageKey.SettingGeneralSystemHindi)}
            title={t(LanguageKey.SettingGeneralSystemHindi)}
          />
        </div>
      </div>
    </div>
  );
  const renderCurrentStep = () => {
    switch (setupSteps[currentStep].component) {
      case "language":
        return renderLanguageStep();
      case "theme":
        return renderThemeStep();
      case "calendar":
        return renderCalendarStep();
      default:
        return null;
    }
  };
  return (
    <div className={`dialogBg ${isVisible ? styles.visible : ""}`}>
      <div className={styles.backdrop} />
      <div className={styles.setupContainer}>
        <div className={styles.setupHeader}>
          <h2 className={styles.welcomeTitle}>{setupSteps[currentStep].title}</h2>
          <p className={styles.welcomeSubtitle}>
            {setupSteps[currentStep].subtitle}
            <svg
              onClick={() => setTitleShowTooltip((prev) => !prev)}
              style={{
                marginInline: "5px",
                cursor: "pointer",
                width: "20px",
                height: "20px",
              }}
              fill="#fff"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 34 34">
              <path opacity=".3" d="M.9 17A16.1 16.1 0 1 1 33 17a16.1 16.1 0 0 1-32 0" />
              <path d="M17 11.8a1.5 1.5 0 0 0-1.5 1.5 1.5 1.5 0 1 1-3 0 4.5 4.5 0 1 1 8.3 2.4l-.9 1.2-.1.1-.7.8q-.6 1-.6 1.4a1.5 1.5 0 1 1-3 0q.2-2 1.2-3.1l.7-1 .2-.1.7-1a1.5 1.5 0 0 0-1.3-2.2m-1.5 12q.1-1.4 1.5-1.5a1.5 1.5 0 0 1 0 3 1.5 1.5 0 0 1-1.5-1.5" />
            </svg>
            {showTitleTooltip && (
              <div
                ref={titleTooltipRef}
                className={styles.tooltip}
                onClick={() => setTitleShowTooltip(!showtitleTooltip)}>
                {t(LanguageKey.setupchooseexplain)}
              </div>
            )}
          </p>
        </div>
        <div className={styles.setupBody}>{renderCurrentStep()}</div>
        <div className={styles.setupFooter}>
          <div className={styles.stepIndicator}>
            {setupSteps.map((_, index) => (
              <div
                key={index}
                className={`${styles.stepDot} ${index === currentStep ? styles.active : ""} ${
                  index < currentStep ? styles.completed : ""
                }`}
              />
            ))}
          </div>
          {/* <div className={styles.stepCounter}>
            مرحله {currentStep + 1} از {setupSteps.length}
          </div> */}
          <div className={styles.buttonGroup}>
            {currentStep > 0 && (
              <button className={styles.prevButton} onClick={handlePrevious}>
                {t(LanguageKey.back)}
              </button>
            )}
            <button className={styles.nextButton} onClick={handleNext}>
              {currentStep < setupSteps.length - 1 ? t(LanguageKey.next) : t(LanguageKey.finish)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitialSetup;
