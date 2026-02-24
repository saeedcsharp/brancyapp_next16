import { useSession } from "next-auth/react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import InputText from "brancy/components/design/inputText";
import RadioButton from "brancy/components/design/radioButton";
import ToggleCheckBoxButton from "brancy/components/design/toggleCheckBoxButton";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import { LanguageKey } from "brancy/i18n";
import { InitialSetupState } from "brancy/models/homeIndex/home";
import { MethodType } from "brancy/helper/api";
import { ICalendar, ILangauge } from "brancy/models/setting/general";
import styles from "./general.module.css";
import { clientFetchApi } from "brancy/helper/clientFetchApi";

function System() {
  const { i18n, t } = useTranslation();
  const { data: session } = useSession();
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };
  const [language, setLanguage] = useState<ILangauge>({
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
  const [darkTheme, setDarkTheme] = useState<boolean | undefined>(undefined);
  const [calendar, setCalendar] = useState<ICalendar>({
    Gregorian: true,
    Hijri: false,
    Hindi: false,
    shamsi: false,
  });
  // Track initial theme application to avoid firing update on first mount
  const themeInitializedRef = useRef(false);
  function handleSelectTheme(e: ChangeEvent<HTMLInputElement>) {
    setThemeMode(e.target.name);
    setDarkTheme(e.target.name === "Dark mode");
  }
  function handleChnageLanguage(e: ChangeEvent<HTMLInputElement>) {
    switch (e.target.name) {
      case "english":
        setLanguage({
          arabic: false,
          english: true,
          french: false,
          german: false,
          persian: false,
          russian: false,
          turkey: false,
          azerbaijani: false,
        });
        changeLanguage("en");
        window.localStorage.setItem("language", "en");
        break;
      case "persian":
        setLanguage({
          arabic: false,
          english: false,
          french: false,
          german: false,
          persian: true,
          russian: false,
          turkey: false,
          azerbaijani: false,
        });
        changeLanguage("fa");
        window.localStorage.setItem("language", "fa");
        break;
      case "arabic":
        setLanguage({
          arabic: true,
          english: false,
          french: false,
          german: false,
          persian: false,
          russian: false,
          turkey: false,
          azerbaijani: false,
        });
        changeLanguage("ar");
        window.localStorage.setItem("language", "ar");
        break;
      case "french":
        setLanguage({
          arabic: false,
          english: false,
          french: true,
          german: false,
          persian: false,
          russian: false,
          turkey: false,
          azerbaijani: false,
        });
        changeLanguage("fr");
        window.localStorage.setItem("language", "fr");
        break;
      case "russian":
        setLanguage({
          arabic: false,
          english: false,
          french: false,
          german: false,
          persian: false,
          russian: true,
          turkey: false,
          azerbaijani: false,
        });
        changeLanguage("ru");
        window.localStorage.setItem("language", "ru");
        break;

      case "german":
        setLanguage({
          arabic: false,
          english: false,
          french: false,
          german: true,
          persian: false,
          russian: false,
          turkey: false,
          azerbaijani: false,
        });
        changeLanguage("gr");
        window.localStorage.setItem("language", "gr");
        break;
      case "turkey":
        setLanguage({
          arabic: false,
          english: false,
          french: false,
          german: false,
          persian: false,
          russian: false,
          turkey: true,
          azerbaijani: false,
        });
        changeLanguage("tr");
        window.localStorage.setItem("language", "tr");
        break;
      case "azerbaijani":
        setLanguage({
          arabic: false,
          english: false,
          french: false,
          german: false,
          persian: false,
          russian: false,
          turkey: false,
          azerbaijani: true,
        });
        changeLanguage("az");
        window.localStorage.setItem("language", "az");
        break;
    }
    // Update UI settings on language change
    handleUiSettingUpdate();
  }
  function handleChangeCalendar(e: ChangeEvent<HTMLInputElement>) {
    switch (e.target.name) {
      case "Gregorian":
        setCalendar({
          Gregorian: true,
          Hijri: false,
          Hindi: false,
          shamsi: false,
        });
        window.localStorage.setItem("calendar", "Gregorian");
        // Notify listeners within the app
        try {
          window.dispatchEvent(new CustomEvent("brancy:calendar-changed", { detail: "Gregorian" }));
        } catch {}
        break;
      case "shamsi":
        setCalendar({
          Gregorian: false,
          Hijri: false,
          Hindi: false,
          shamsi: true,
        });
        window.localStorage.setItem("calendar", "shamsi");
        try {
          window.dispatchEvent(new CustomEvent("brancy:calendar-changed", { detail: "shamsi" }));
        } catch {}
        break;
      case "Hijri":
        setCalendar({
          Gregorian: false,
          Hijri: true,
          Hindi: false,
          shamsi: false,
        });
        window.localStorage.setItem("calendar", "Hijri");
        try {
          window.dispatchEvent(new CustomEvent("brancy:calendar-changed", { detail: "Hijri" }));
        } catch {}
        break;
      case "Hindi":
        setCalendar({
          Gregorian: false,
          Hijri: false,
          Hindi: true,
          shamsi: false,
        });
        window.localStorage.setItem("calendar", "Hindi");
        try {
          window.dispatchEvent(new CustomEvent("brancy:calendar-changed", { detail: "Hindi" }));
        } catch {}
        break;
    }
    // Update UI settings on calendar change
    handleUiSettingUpdate();
  }
  async function handleUiSettingUpdate() {
    try {
      const settingUiUpdate: InitialSetupState = {
        calendar: window.localStorage.getItem("calendar") || "Gregorian",
        language: window.localStorage.getItem("language") || "en",
        theme: window.localStorage.getItem("theme") || "light",
      };
      const res = await clientFetchApi<InitialSetupState, boolean>("/api/uisetting/Update", {
        methodType: MethodType.post,
        session: session,
        data: settingUiUpdate,
        queries: undefined,
        onUploadProgress: undefined,
      });

      if (!res.succeeded) notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  useEffect(() => {
    if (darkTheme !== undefined) {
      if (darkTheme) {
        document.documentElement.setAttribute("data-theme", "dark");
        window.localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
        window.localStorage.setItem("theme", "light");
      }
      // Avoid calling update on initial mount; only on subsequent user-driven changes
      if (themeInitializedRef.current) {
        handleUiSettingUpdate();
      } else {
        themeInitializedRef.current = true;
      }
    }
  }, [darkTheme]);
  const [isHidden, setIsHidden] = useState(false); // New state to toggle visibility and grid-row-end
  const handleCircleClick = () => {
    setIsHidden(!isHidden); // Toggle visibility and grid-row-end state
  };
  useEffect(() => {
    let theme = window.localStorage.getItem("theme");
    let lng = window.localStorage.getItem("language");
    let calendar = window.localStorage.getItem("calendar");
    if (lng) changeLanguage(lng);
    setDarkTheme(theme === "dark" ? true : false);
    setThemeMode(theme === "dark" ? "Dark mode" : "light mode");
    setLanguage({
      arabic: lng === "ar",
      english: lng === "en",
      french: lng === "fr",
      german: lng === "gr",
      persian: lng === "fa",
      russian: lng === "ru",
      turkey: lng === "tr",
      azerbaijani: lng === "az",
    });
    setCalendar({
      Gregorian: calendar === "Gregorian",
      Hijri: calendar === "Hijri",
      Hindi: calendar === "Hindi",
      shamsi: calendar === "shamsi",
    });
  }, []);
  return (
    <>
      <div
        className="tooBigCard"
        role="region"
        aria-label={t(LanguageKey.SettingGeneralSystemTitle)}
        style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}>
        <div
          className="headerChild"
          title="↕ Resize the Card"
          onClick={handleCircleClick}
          role="button"
          aria-expanded={!isHidden}
          aria-label="Toggle settings visibility"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleCircleClick();
            }
          }}>
          <div className="circle" aria-hidden="true"></div>
          <div className="Title" role="heading" aria-level={2} aria-label={t(LanguageKey.SettingGeneralSystemTitle)}>
            {t(LanguageKey.SettingGeneralSystemTitle)}
          </div>
        </div>
        <div className={`${styles.all} ${isHidden ? "" : styles.show}`} aria-hidden={isHidden}>
          <div className={styles.content} role="group">
            {/* <div className="headerandinput">
              <div className="title">Features Display Model</div>
              <div className={styles.options}>
                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"Minimize"}
                    value={"Minimize"}
                    checked={false}
                    handleOptionChanged={function (
                      e: ChangeEvent<HTMLInputElement>
                    ): void {
                      throw new Error("Function not implemented.");
                    }}/>
                </div>
                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"Maximize"}
                    value={"Maximize"}
                    checked={true}
                    handleOptionChanged={function (
                      e: ChangeEvent<HTMLInputElement>
                    ): void {
                      throw new Error("Function not implemented.");
                    }}/>
                </div>
              </div>
            </div> */}
            <div className="headerandinput">
              <div className="title" role="heading" aria-level={3}>
                {t(LanguageKey.SettingGeneralSystemlanguage)}
              </div>
              <div
                className={styles.options}
                role="radiogroup"
                aria-label={t(LanguageKey.SettingGeneralSystemlanguage)}>
                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"english"}
                    id={"English "}
                    checked={language.english}
                    handleOptionChanged={handleChnageLanguage}
                    textlabel={"English"}
                    title={"English"}
                  />
                </div>

                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"persian"}
                    id={"فارسی "}
                    checked={language.persian}
                    handleOptionChanged={handleChnageLanguage}
                    textlabel={"فارسی"}
                    title={"فارسی"}
                  />
                </div>

                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"arabic"}
                    id={"العربية "}
                    checked={language.arabic}
                    handleOptionChanged={handleChnageLanguage}
                    textlabel={"العربية"}
                    title={"العربية"}
                  />
                </div>
                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"turkey"}
                    id={"Türkçe "}
                    checked={language.turkey}
                    handleOptionChanged={handleChnageLanguage}
                    textlabel={"Türkçe"}
                    title={"Türkçe"}
                  />
                </div>
                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"french"}
                    id={"Français "}
                    checked={language.french}
                    handleOptionChanged={handleChnageLanguage}
                    textlabel={"Français"}
                    title={"Français"}
                  />
                </div>

                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"russian"}
                    id={"Русский "}
                    checked={language.russian}
                    handleOptionChanged={handleChnageLanguage}
                    textlabel={"Русский"}
                    title={"Русский"}
                  />
                </div>
                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"german"}
                    id={"Deutsch"}
                    checked={language.german}
                    handleOptionChanged={handleChnageLanguage}
                    textlabel={"Deutsch"}
                    title={"Deutsch"}
                  />
                </div>
                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"azerbaijani"}
                    id={"Azərbaycan"}
                    checked={language.azerbaijani}
                    handleOptionChanged={handleChnageLanguage}
                    textlabel={"Azərbaycan"}
                    title={"Azərbaycan"}
                  />
                </div>
              </div>
            </div>
            <div className="headerandinput">
              <div className="title">{t(LanguageKey.SettingGeneralSystemcalendar)}</div>
              <div className={styles.options}>
                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"Gregorian"}
                    id={t(LanguageKey.SettingGeneralSystemGregorian)}
                    checked={calendar.Gregorian}
                    handleOptionChanged={handleChangeCalendar}
                    textlabel={t(LanguageKey.SettingGeneralSystemGregorian)}
                    title={"Gregorian"}
                  />
                </div>
                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"shamsi"}
                    id={t(LanguageKey.SettingGeneralSystemshamsi)}
                    checked={calendar.shamsi}
                    handleOptionChanged={handleChangeCalendar}
                    textlabel={t(LanguageKey.SettingGeneralSystemshamsi)}
                    title={t(LanguageKey.SettingGeneralSystemshamsi)}
                  />
                </div>
                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"Hijri"}
                    id={t(LanguageKey.SettingGeneralSystemHijri)}
                    checked={calendar.Hijri}
                    handleOptionChanged={handleChangeCalendar}
                    textlabel={t(LanguageKey.SettingGeneralSystemHijri)}
                    title={t(LanguageKey.SettingGeneralSystemHijri)}
                  />
                </div>
                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"Hindi"}
                    id={t(LanguageKey.SettingGeneralSystemHindi)}
                    checked={calendar.Hindi}
                    handleOptionChanged={handleChangeCalendar}
                    textlabel={t(LanguageKey.SettingGeneralSystemHindi)}
                    title={t(LanguageKey.SettingGeneralSystemHindi)}
                  />
                </div>
              </div>
            </div>
            {/* <div className="headerandinput">
              <div className="title">
                {t(LanguageKey.SettingGeneralSystemStartWeek)}
              </div>
              <div className={styles.options}>
                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"saturday"}
                    value={t(LanguageKey.SettingGeneralSystemsaturday)}
                    checked={false}
                    handleOptionChanged={function (
                      e: ChangeEvent<HTMLInputElement>
                    ): void {
                      throw new Error("Function not implemented.");
                    }}
                  />
                </div>
                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"monday"}
                    value={t(LanguageKey.SettingGeneralSystemmonday)}
                    checked={true}
                    handleOptionChanged={function (
                      e: ChangeEvent<HTMLInputElement>
                    ): void {
                      throw new Error("Function not implemented.");
                    }}
                  />
                </div>
              </div>
            </div> */}
            <div className="headerandinput">
              <div className="title">{t(LanguageKey.SettingGeneralSystemtheme)}</div>
              <div className={styles.options}>
                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"Dark mode"}
                    id={t(LanguageKey.SettingGeneralSystemDarkmode)}
                    checked={themeMode === "Dark mode"}
                    handleOptionChanged={handleSelectTheme}
                    textlabel={t(LanguageKey.SettingGeneralSystemDarkmode)}
                    title={t(LanguageKey.SettingGeneralSystemDarkmode)}
                  />
                </div>
                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"light mode"}
                    id={t(LanguageKey.SettingGeneralSystemlightmode)}
                    checked={themeMode === "light mode"}
                    handleOptionChanged={handleSelectTheme}
                    textlabel={t(LanguageKey.SettingGeneralSystemlightmode)}
                    title={t(LanguageKey.SettingGeneralSystemlightmode)}
                  />
                </div>
              </div>
            </div>
            {/* <div className="headerandinput">
              <div className="title">
                {t(LanguageKey.SettingGeneralSystemPrice)}
              </div>
              <div className={styles.options}>
                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"Dollar"}
                    value={t(LanguageKey.SettingGeneralSystemDollar)}
                    checked={true}
                    handleOptionChanged={function (
                      e: ChangeEvent<HTMLInputElement>
                    ): void {
                      throw new Error("Function not implemented.");
                    }}
                  />
                </div>
                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"euro"}
                    value={t(LanguageKey.SettingGeneralSystemeuro)}
                    checked={true}
                    handleOptionChanged={function (
                      e: ChangeEvent<HTMLInputElement>
                    ): void {
                      throw new Error("Function not implemented.");
                    }}
                  />
                </div>
                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"pound"}
                    value={t(LanguageKey.SettingGeneralSystempound)}
                    checked={true}
                    handleOptionChanged={function (
                      e: ChangeEvent<HTMLInputElement>
                    ): void {
                      throw new Error("Function not implemented.");
                    }}
                  />
                </div>
                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"rial"}
                    value={t(LanguageKey.SettingGeneralSystemrial)}
                    checked={true}
                    handleOptionChanged={function (
                      e: ChangeEvent<HTMLInputElement>
                    ): void {
                      throw new Error("Function not implemented.");
                    }}
                  />
                </div>
                <div className={styles.radiobtn}>
                  <RadioButton
                    name={"toman"}
                    value={t(LanguageKey.SettingGeneralSystemtoman)}
                    checked={true}
                    handleOptionChanged={function (
                      e: ChangeEvent<HTMLInputElement>
                    ): void {
                      throw new Error("Function not implemented.");
                    }}
                  />
                </div>
              </div>
            </div> */}
            <div className="headerandinput fadeDiv">
              <div className="headerparent">
                <div className="title">{t(LanguageKey.MobileNotification)}</div>
                <ToggleCheckBoxButton
                  handleToggle={function (e: ChangeEvent<HTMLInputElement>): void {
                    throw new Error("Function not implemented.");
                  }}
                  checked={false}
                  name={"mobileNotificationToggle"}
                  title={""}
                  role={""}
                />
              </div>
              <div className="explain"> {t(LanguageKey.MobileNotificationExplain)}</div>
              <InputText
                id="mobile-notification"
                name="mobileNotification"
                className="disable"
                handleInputChange={function (e: ChangeEvent<HTMLInputElement>): void {
                  throw new Error("Function not implemented.");
                }}
                value={""}
              />

              {/* <div className={styles.attention}>
                <img
                  style={{ width: "35px", height: "35px", padding: "5px" }}
                  title="ℹ️ attention"
                  src="/attention.svg"
                />
                <div className="explain">
                  This mobile number will not be displayed on your profile and users can’t see it.
                </div>
              </div> */}
            </div>
            <div className="headerandinput fadeDiv">
              <div className="headerparent">
                <div className="title">{t(LanguageKey.EmailNotification)}</div>

                <ToggleCheckBoxButton
                  handleToggle={function (e: ChangeEvent<HTMLInputElement>): void {
                    throw new Error("Function not implemented.");
                  }}
                  checked={false}
                  name={"emailNotificationToggle"}
                  title={""}
                  role={""}
                />
              </div>
              <div className="explain">{t(LanguageKey.EmailNotificationExplain)}</div>
              <InputText
                id="email-notification"
                name="emailNotification"
                className="disable"
                handleInputChange={function (e: ChangeEvent<HTMLInputElement>): void {
                  throw new Error("Function not implemented.");
                }}
                value={""}
              />
              {/* <div className={styles.attention}>
                <img
                  style={{ width: "35px", height: "35px", padding: "5px" }}
                  title="ℹ️ attention"
                  src="/attention.svg"
                />
                <div className="explain">
                  This mobile number will not be displayed on your profile and users can’t see it.
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default System;
