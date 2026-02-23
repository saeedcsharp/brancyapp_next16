import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import RadioButton from "../../design/radioButton";
import { LanguageKey } from "../../../i18n";
import styles from "./LandingHeader.module.css";

type ThemeState = {
  themeMode: string;
  darkTheme: boolean | undefined;
  language: string;
};

type ThemeAction =
  | { type: "SET_THEME"; payload: { themeMode: string; darkTheme: boolean } }
  | { type: "SET_LANGUAGE"; payload: string };

const languageMap = {
  english: "en",
  persian: "fa",
  arabic: "ar",
  french: "fr",
  russian: "ru",
  german: "gr",
  turkey: "tr",
  azerbaijani: "az",
} as const;

interface LandingHeaderProps {
  themeState: ThemeState;
  dispatch: React.Dispatch<ThemeAction>;
  onShowCreateSignIn: () => void;
  onMenuClickWithScroll: (targetRef: React.RefObject<HTMLDivElement | null>) => void;
  onScrollToSection: (ref: React.RefObject<HTMLDivElement | null>) => void;
  page2Ref: React.RefObject<HTMLDivElement | null>;
  page4Ref: React.RefObject<HTMLDivElement | null>;
  page9Ref: React.RefObject<HTMLDivElement | null>;
}

const LandingHeader: React.FC<LandingHeaderProps> = ({
  themeState,
  dispatch,
  onShowCreateSignIn,
  onMenuClickWithScroll,
  onScrollToSection,
  page2Ref,
  page4Ref,
  page9Ref,
}) => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  const radioOptions = useMemo(
    () => [
      {
        name: "Dark mode",
        value: t(LanguageKey.SettingGeneralSystemDarkmode),
        checked: themeState.themeMode === "Dark mode",
      },
      {
        name: "light mode",
        value: t(LanguageKey.SettingGeneralSystemlightmode),
        checked: themeState.themeMode === "light mode",
      },
    ],
    [themeState.themeMode, t],
  );

  const languageOptions = useMemo(
    () => [
      {
        name: "english",
        value: "English",
        checked: themeState.language === "en",
      },
      {
        name: "persian",
        value: "فارسی",
        checked: themeState.language === "fa",
      },
      {
        name: "arabic",
        value: "العربية",
        checked: themeState.language === "ar",
      },
      {
        name: "turkey",
        value: "Türkçe",
        checked: themeState.language === "tr",
      },
      {
        name: "french",
        value: "Français",
        checked: themeState.language === "fr",
      },
      {
        name: "russian",
        value: "Русский",
        checked: themeState.language === "ru",
      },
      {
        name: "german",
        value: "Deutsch",
        checked: themeState.language === "gr",
      },
      {
        name: "azerbaijani",
        value: "Azərbaycan",
        checked: themeState.language === "az",
      },
    ],
    [themeState.language],
  );

  // Force rerender when settings dropdown is opened
  useEffect(() => {
    if (isSettingsOpen) {
      dispatch({
        type: "SET_THEME",
        payload: {
          themeMode: themeState.themeMode,
          darkTheme: themeState.darkTheme || false,
        },
      });

      dispatch({ type: "SET_LANGUAGE", payload: themeState.language });
    }
  }, [isSettingsOpen, themeState.darkTheme, themeState.language, themeState.themeMode, dispatch]);

  const handleSelectTheme = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const isDarkMode = e.target.name === "Dark mode";
      dispatch({
        type: "SET_THEME",
        payload: {
          themeMode: e.target.name,
          darkTheme: isDarkMode,
        },
      });
    },
    [dispatch],
  );

  const handleChangeLanguage = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedLang = e.target.name;
      const langCode = languageMap[selectedLang as keyof typeof languageMap] || "en";

      // ذخیره موقعیت اسکرول فعلی
      const currentScrollPosition = window.scrollY;

      dispatch({ type: "SET_LANGUAGE", payload: langCode });
      i18n.changeLanguage(langCode);
      window.localStorage.setItem("language", langCode);

      // بازگرداندن موقعیت اسکرول بعد از تغییر زبان
      requestAnimationFrame(() => {
        window.scrollTo({ top: currentScrollPosition, behavior: "auto" });
      });
    },
    [i18n, dispatch],
  );

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && isMenuOpen) {
        setIsMenuOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node) && isSettingsOpen) {
        setIsSettingsOpen(false);
      }
    },
    [isMenuOpen, isSettingsOpen],
  );

  useEffect(() => {
    if (isMenuOpen || isSettingsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, isSettingsOpen, handleClickOutside]);

  const toggleMobileMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const toggleSettings = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (settingsButtonRef.current) {
      settingsButtonRef.current.blur();
    }
    setIsSettingsOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (isSettingsOpen) {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement?.tagName === "INPUT") {
        activeElement.blur();
      }
    }
  }, [isSettingsOpen]);

  const handleMenuItemClick = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  return (
    <>
      {/* Mobile Header */}
      <header className={styles.headermobile}>
        <a href="/">
          {/* <img className={styles.BrancyLogoLTR} alt="brancy logo" src="/Brancylogo.svg" />
          <img className={styles.BrancyLogoRTL} alt="brancy logo" src="/Brancylogo-fa.svg" /> */}
          <svg className={styles.BrancyLogoLTR} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 745 212">
            <path
              fill="#2977ff"
              d="M28.7 190.3c34.7 29.6 125.8 29.2 160.3-2.7 31.3-35 30.2-126.2 0-160.4l-5.7-5.5C148.6-7.9 57.5-7.4 23 24.5c-31.3 35-30.1 126 .1 160.3z"
            />
            <path
              fill="#fff"
              stroke="#fff"
              d="M96.4 27.5c-.4 0-1.4.1-2.1.4a5 5 0 0 0-1.7 1.4 88 88 0 0 1-19.5 17q-8 5.3-16.7 10.3l-6.8 4v.1q-.7.8-1 1.8-.2 1 .2 1.8l.5.6h.7l1.2-.6 3.6-2 1.4-.8C72 52.2 87.6 43 97.5 29.6q.7-.7.4-1.5l-.3-.4-.4-.1h-.7zm34.1 154.4a7 7 0 0 0 2.5-1.7 79 79 0 0 1 25.2-18.2q1.4-.5 2.3-1.8l.8-1.2q.3-.8.2-1.4l-.5-.6h-.6l-1.4.3-4 1.8c-3 1.4-6 3.2-6.7 3.6l-.1.1a82 82 0 0 0-20.4 17.3l-.5.7-.2.6.3.7q.3.3.5.2h1.3zM162 146q1.3-.6 2-1.7c.6-1.1.5-1.6.5-2.6l-.3-2v-.2l-.1-.1q-.3-.4-.7-.4h-.8l-1.2.3h-.1c-11 4.3-23.5 10-33.8 17a82 82 0 0 0-23.7 24v.1l-.2.4-.1.1-.2.4-.2.5v.6q.2.7.8.8l1.3.2h1.6l.7-.1q2.3-.4 3.4-2.2a85 85 0 0 1 30.3-25.7h.3v-.2A194 194 0 0 1 162 146zm-33.5-4.1 6.6-3c8.6-3.9 17.4-7.8 25.2-11.9q.9-.3 1.5-1t.5-1.8a20 20 0 0 0-1.7-5.1q-.6-1.2-1.5-1.5c-1-.3-1.4-.1-2.2.2q-10.3 5.3-21.1 10l-3 1.4q-12.3 5.3-24 11.9A77 77 0 0 0 73 180.5v.2l-.3.8q-.2.4-.1 1 0 .5.6.8t1.3.2h5.7a3 3 0 0 0 2-.6q.7-.6 1-1.7c8.2-19.3 27-31.2 45.3-39.2zM117 124.3l5.3-2.2c9.6-4 19.4-8 28.2-12.9q1.2-.7 1.1-1.8-.2-1-1.2-1.6a34 34 0 0 0-4.7-3 5 5 0 0 0-4.2.2c-8 4-16.8 7.6-25.5 11.1l-4.9 2c-21.5 8.5-46.4 23.3-55.8 48.5a74 74 0 0 0-3.7 12.3 6 6 0 0 0 0 2.2q.7 2 2.4 2.8c1.7.8 2.2 1 3.3 1.3q1 .3 1.7 0 .8-.4 1.2-1.3l.1-.1a81 81 0 0 1 4.8-15.3c9.3-22.2 30.6-33.7 51.9-42.2zM72.3 28q-.5-.5-1-.5h-1q-.5.1-1 .5-.5.1-.9.6-7.9 7.5-18 13.2-.7.4-1.3 1.2l-.5.8v1l.1.1q.7.7 1.4.4l1-.5a91 91 0 0 0 20.3-15l.1-.2h.1l.4-.4q0-.2.3-.5zm56.7 2.3V30a2 2 0 0 0-1.3-1l-.7-.2h-.6q-1.3-.4-2.4.1c-1 .5-1.2 1-1.5 1.8-7 13-19 21.2-32.2 28.4l-11.6 6C69 70 59.1 74.9 50.8 81.3l-.2.1-1.2 1q-.6.7-.8 1.8v3.5q-.2 1 .1 1.9l.1.1.5.3h.5l1-.5c9-7.5 19.5-13 30-18.3l1.1-.6c9-4.5 18.9-9.5 27.4-15.7 9-6.5 16.4-14.4 19.7-24.5zm-30.8 55 .8-.4c19.8-8.4 40.6-17.1 52.4-36.6q1.3-1.8.9-3.3t-1.8-3l-.4-.5-.4-.5-1-1q-.7-.5-1.5-.2T146 41c-10 18.4-28.7 26.8-49 35.3l-4.7 2C77 85 61 91.7 49 103.7l-.1.1a5 5 0 0 0-.5 2.1v8.4l.3.6.6.2.5-.2.6-.6.3-.2.3-.3c12.5-14 30-21.3 47.1-28.4zm12 18.4 6-2.4c14.8-5.9 30.3-12 41.3-23.5a9 9 0 0 0 1-3.8q.4-3.7.2-7.2v-1q0-.4-.3-.9l-.4-.4-.6.1q-.5.2-1 .9c-13 15-32 22.3-51.4 29.8l-1.5.6c-19.8 7.7-39.7 15.7-53.2 32.5l-.3.4c-.6.9-1.2 1.6-1.2 2.9v16l1-1.8c13.1-23.5 36.4-33 60.4-42.2z"
            />
            <path
              fill="#2977ff"
              d="M337.3 70.8q-1.3 7.7-6.4 13a28 28 0 0 1-13.3 8.4c12.3 4.3 17.2 13.4 15.2 25.3-2 11.2-7.4 18.4-16.6 23.8s-21.6 8-37.1 8l-6.7-.1-8-.7-8-1.3a34 34 0 0 1-7-2.1q-8.7-3.6-7.1-12.4L256 53.5a9 9 0 0 1 3-5.5q2.2-2 5.8-3.1 6-2 14.9-3a169 169 0 0 1 17.9-.9q21.5 0 32 7.3t7.7 22.5m-57.8 13.3h12.3q7.2 0 11-2.8t4.7-8q.8-4.5-2.5-7.2t-11-2.7l-5.8.1-5.2.6zm23.5 31q1.8-10.5-12.1-10.4h-15l-3.6 20.7q2.3.7 5.9 1l7 .2q6.8 0 11.8-2.8 5-2.9 6-8.7m62.2 32.7q-2 .5-5.5 1a56 56 0 0 1-7.7.5q-8.6 0-11.8-2.8t-1.9-10.8l8.9-50.7q1-5 4-8.6c3-3.6 4.9-4.6 8.2-6.4q6.6-3.6 14.9-5.5c8.3-1.9 11.2-1.8 17-1.8q18.6 0 16.3 13.1-.5 3-1.8 5.7t-2.9 4.5a47 47 0 0 0-27.4 3.4zm85-85.1q9 0 16 1.8c7.1 1.9 8.6 3.1 11.7 5.6s5.2 5.7 6.4 9.6 1.4 8.4.5 13.6l-6.5 37.6q-.8 4.4-3.7 7.1-3 2.8-6.6 4.8a66 66 0 0 1-31.6 6.5q-8.8 0-15.6-1.6a31 31 0 0 1-11.3-5 18 18 0 0 1-6.3-8.6 24 24 0 0 1-.7-12q2-11.7 10-17.9c8-6.2 12.7-6.7 22.4-7.7l22.3-2.3.2-1.2q.8-4.8-3-7c-3.9-2.1-6.6-2-12-2q-6 0-12.4 1.3-6.3 1.4-11.5 3.3a9 9 0 0 1-2.9-4.6q-1-3-.4-6.4.8-4.4 3.3-7c2.5-2.6 4.1-3.2 7.2-4.4q5.1-1.8 11.9-2.7 6.7-.9 12.5-.8M440 128.5q2.9 0 6.4-.5 3.5-.7 5.4-1.6L454 113l-12.2 1q-4.7.3-8 2a7 7 0 0 0-3.9 5q-.6 3.3 1.7 5.4c2.3 2.1 4.2 2.1 8.3 2.1m125.4 19.3q-2 .5-5.5 1a56 56 0 0 1-7.7.5q-8.6 0-11.9-2.8-3.2-2.9-1.8-10.8l7-40.2q.9-5.2-1.8-7.7t-7.8-2.5q-3.4 0-6.6.9a40 40 0 0 0-6.1 2.2l-10.4 59.4q-2 .5-5.6 1s-5 .5-7.7.5q-8.6 0-11.8-2.8c-3.2-2.8-2.8-5.5-1.9-10.8l9-51.2q.8-4.6 3.3-7.5a27 27 0 0 1 6.3-5.3q6.5-4.1 15.8-6.6a78 78 0 0 1 20-2.4q19.3 0 28.3 8.4t6.3 23.6zM634 85.1a26 26 0 0 0-8.2 1.4 23 23 0 0 0-7.3 4q-3.3 2.7-5.7 6.7c-2.4 4-2.7 5.7-3.3 9.1q-1.8 10.5 3.2 15.5t13.8 5q5.1 0 9.2-1.3 4-1.2 7.2-2.6 2.8 2.4 4 5 1.1 2.8.4 6.6-1.1 6.8-8.6 10.8t-19.7 4q-10.5 0-18.7-2.7c-8.2-2.7-9.7-4.6-13-8.3s-5.7-8.1-6.9-13.4a48 48 0 0 1 0-18.6q2-11 7-19.3c5-8.3 7.6-10 12.4-13.6a52 52 0 0 1 15.8-8 60 60 0 0 1 17.8-2.7q12.1 0 18 4.3 5.8 4.5 4.6 11.3-.6 3.1-2.6 6c-2 2.8-2.8 3.4-4.4 4.7q-2.6-1.3-6.4-2.6-3.8-1.2-8.6-1.3m38 36.4-2.1-8.8a188 188 0 0 1-4-25.7l-1.6-18.8a25 25 0 0 1 15.1-5.5q5.6 0 8.8 2.3t4 8.6l2.4 21.9L697 117h.6l5.8-11.7 5.9-13 5.6-13.5 5-13.2a35 35 0 0 1 6-2.2 24 24 0 0 1 6.1-.8q5.6 0 9.3 2.3c3.7 2.3 3.4 4.4 2.7 8.3q-1.1 6.3-4.6 15c-3.5 8.8-5.2 12-8.4 18.3a254 254 0 0 1-21.2 34.2q-11.7 15.5-20.6 22.8-9 7.5-16.7 7.4-6.3 0-10-4-3.6-3.9-3.2-10.2a161 161 0 0 0 22.7-20.6q-2.6-.8-5.2-3.7a29 29 0 0 1-4.8-11"
            />
          </svg>
          <svg className={styles.BrancyLogoRTL} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 623 212">
            <path
              fill="#2977ff"
              d="M271 87.8a62 62 0 0 0 0-13.4 13 13 0 0 0-5.5-8.7 15 15 0 0 0-9.2-2.3l-12.7 1q0 3.5-.3 9.4l-.9 13.9a25 25 0 0 1-5.8 15 20 20 0 0 1-5.7 4.3c-9.4 5-19.9 1.5-22.6.7a34 34 0 0 1-5.6-2.4 64 64 0 0 0 4.2-17.5c.4-4.8.3-9.7 0-13.4a12 12 0 0 0-5.2-9 14 14 0 0 0-9.3-2l-13 1-.2 9.4-1 13.9a36 36 0 0 1-5.2 16.6c-2 2.8-3.9 3.8-4.8 4.3-4 1.9-8 1.1-9.3.9a16 16 0 0 1-5.6-2.4 80 80 0 0 0 4.5-18.7 89 89 0 0 0 .3-13.8c0-1-.3-5-3.8-8a14 14 0 0 0-11.1-3.2l-12.8 1.2V68l-.3 4-.6 8.4c-.7 7.6-3.3 21.9-6.2 24.8q-4.3 4.5-11.1 4.5l-2-.1q-1.3-.2-2.5-.6-2.7-1-3.8-2.5 1.5-3.8 2.5-7.8a78 78 0 0 0 2.2-19.2c-.1-6.8-.2-10.7-3-13.3-3.5-3.2-8.6-3-10.6-2.8l-13.6.8q0 3-.3 7.4l-.6 8.3c-1.2 10.8-2 19-6.5 22.9-1.5 1.4-5.2 4-12.7 3.9l-16.6-.2c-6.8 0-11 0-16.3 2.2-1 .4-4 1.7-8 4.7A55 55 0 0 0 1.6 146c-1.3 6.8-2 10.2-1.1 13.8 4.7 20.8 45.4 24.6 68.5 22.8 12.7-1 29.6-2.2 36-13.3 4.1-7 2.3-14.9.8-19.2-27 7-47.5 7-60.6 5.8-24.9-2.3-28.3-9-29.1-12-.2-.7-.7-3 0-5.4 2.6-7.8 16.8-9.6 36.6-8.5q5.8.5 11.8.5c6.1 0 8.2.2 14.3-2a34 34 0 0 0 11.4-6.6l1.7 1.7a29 29 0 0 0 6.6 4.2s6.5 3.1 15 3.1h1.3c10.5 0 19-3 25.8-7.7v.1a28 28 0 0 0 8 4.5 43 43 0 0 0 15.2 3.1c3.3 0 9.3-.6 16.3-3a42 42 0 0 0 9.4-4.8l5.2 2.8c12.3 5.7 24.5 5 29.4 5 6.4 0 21-.7 32.8-11.6s13.4-24.9 14.2-31.5m108.5-13.6q-.8-4.8-3-7.4a9 9 0 0 0-3.4-2.5l-1.6-.5a18 18 0 0 0-6.3-.4L352 64.8V74q-.2 5.8-.8 13.4-.7 10.1-5.7 16a17 17 0 0 1-12.7 6.3H331l-3-.1a62 62 0 0 1-8.6-1.2l1-6.8q.9-5.7 1-9.5c.7-9.4 0-14.8-.6-18.5a12 12 0 0 0-4-7.5 14 14 0 0 0-10.9-2.7L292.3 65a505 505 0 0 1-.4 21.6 144 144 0 0 1-3.7 31.8 39 39 0 0 1-7.2 14.1 50 50 0 0 1-22.3 16A42 42 0 0 1 248 150l1 7.5a15 15 0 0 0 5.4 9.6c3.7 3 8 3.2 11.6 3.3a44 44 0 0 0 27.9-9.7 45 45 0 0 0 10.7-12.2c3-5 9-13.3 10.5-20.7a51 51 0 0 0 6.8 1.7c4.8.9 8 1.4 12.3 1.3 13.3-.2 24-4.7 32-12.2s12.5-18 13.5-31.6q.5-8-.3-12.9m-36 78.2c-3.9-3.1-14-3-18 .3-3.4 3.6-3.3 13.2 0 16.8l.7.5c3.9 3.1 14 3 18-.3 3.4-3.6 3.3-13.2 0-16.8zm-108.6-117c-4-3.1-14.1-3-18 .3-3.5 3.6-3.3 13.2 0 16.8l.7.5c3.8 3.1 14 3 17.9-.2 3.5-3.7 3.4-13.3 0-16.8zm-88.2 120.6q-.3 1.6-1.4 2.7a6 6 0 0 1-2.7 1.8q3.8 1.3 3.1 5.2-.6 3.5-3.4 5a14 14 0 0 1-7.8 1.7H133l-1.6-.2-1.7-.3-1.4-.4q-1.8-.8-1.5-2.6l2.8-16.5q.2-.8.6-1.2.7-.5 1.3-.6 1.2-.4 3-.6l3.8-.2q4.5 0 6.7 1.5c2.1 1.5 2 2.6 1.6 4.7m-12 2.8h2.5q1.5 0 2.3-.6 1-.8 1-1.7.1-1-.6-1.5-.8-.7-2.2-.6h-1.3l-1 .2zm4.8 6.4q.4-2.1-2.5-2.1h-3.1l-.8 4.3 1.3.2h1.4q1.4 0 2.5-.6c1-.5 1-1 1.2-1.8m13 6.8-1.2.3h-1.6q-1.8 0-2.4-.5-.9-.8-.4-2.3l1.8-10.5q.2-1 .9-1.8c.6-.8 1-1 1.7-1.4q1.3-.7 3-1.1c1.8-.4 2.4-.4 3.6-.4q4 0 3.4 2.7 0 .7-.4 1.2l-.6 1-1.9-.2-2 .2c-1 .2-1.2.4-1.8.7zm17.7-17.7q1.9 0 3.3.4c1.5.4 1.8.6 2.5 1.1a4 4 0 0 1 1.3 2 6 6 0 0 1 .1 2.9l-1.3 7.8q-.2 1-.8 1.5l-1.4 1q-2.5 1.4-6.6 1.4-1.8 0-3.2-.4a5 5 0 0 1-2.4-1 4 4 0 0 1-1.3-1.8 5 5 0 0 1-.1-2.5q.4-2.4 2-3.7c1.7-1.3 2.7-1.4 4.7-1.6l4.6-.5.1-.3q.2-1-.6-1.4-1-.6-2.5-.5l-2.6.3-2.4.7-.6-1v-1.3q0-.9.6-1.4.7-.7 1.5-1 1-.4 2.5-.5zm-2.1 13.7h1.3l1.1-.4.5-2.8-2.5.2q-1 0-1.7.4c-.7.3-.7.6-.8 1s0 1 .3 1.2 1 .4 1.8.4m26.1 4-1.1.3h-1.6q-1.8 0-2.5-.5-.9-.8-.4-2.3l1.5-8.4q.2-1-.4-1.6-.8-.6-1.6-.5l-1.4.2-1.3.5L183 172l-1.1.2h-1.6q-1.8 0-2.5-.5-.9-.8-.4-2.3l1.9-10.7q.2-1 .7-1.5.7-.8 1.3-1.1 1.3-.9 3.3-1.4c1.9-.5 2.7-.5 4.1-.5q4 0 6 1.8c1.8 1.7 1.6 2.8 1.3 4.9zm14.3-13-1.7.3-1.5.8a5 5 0 0 0-1.9 3.3q-.4 2.2.7 3.2c1 1 1.6 1 2.8 1q1.1 0 2-.2l1.5-.5.8 1q.3.7 0 1.4-.2 1.4-1.7 2.2c-1.6.9-2.4.9-4.1.9q-2.2 0-4-.6c-1.6-.6-2-1-2.6-1.7s-1.2-1.7-1.5-2.8-.2-2.4 0-3.9q.5-2.3 1.5-4a8 8 0 0 1 2.6-2.9q1.5-1 3.3-1.6a10 10 0 0 1 3.7-.6q2.5 0 3.7.9c1.2.9 1.2 1.4 1 2.3l-.5 1.3-1 1-1.3-.6c-.8-.2-1.1-.2-1.8-.2m8 7.6-.5-1.9-.5-2.3-.4-3-.3-4 1.4-.8 1.8-.3q1.1 0 1.8.5c.7.4.7.9.8 1.8l.5 4.5.6 4.5 1.3-2.4 1.2-2.7 1.2-2.8 1-2.8 1.3-.5 1.3-.1q1.1 0 1.9.5c.8.5.7.9.6 1.7q-.3 1.3-1 3.1l-1.8 3.8-2.1 3.9-2.3 3.3q-2.4 3.2-4.3 4.7c-1.8 1.6-2.4 1.6-3.4 1.6q-1.4 0-2.1-.8c-.8-.9-.8-1.3-.7-2.2l2.5-2 2.2-2.3q-.5-.1-1-.8c-.6-.6-.8-1.1-1-2.3m222.4 23.9c34.7 29.6 125.8 29.1 160.3-2.8 31.3-35 30.2-126 0-160.3l-5.7-5.5C558.6-7.9 467.5-7.5 433 24.4c-31.3 35-30.1 126.1.1 160.4z"
            />
            <path
              fill="#fff"
              stroke="#fff"
              d="M506.4 27.5c-.4 0-1.4.1-2.1.4a5 5 0 0 0-1.7 1.4 87 87 0 0 1-19.5 17q-8 5.3-16.7 10.3l-6.7 4v.1h-.1a3 3 0 0 0-1 1.8 3 3 0 0 0 .1 1.8q.2.4.6.6h.7l1.2-.6 3.5-2 1.5-.8c15.8-9.3 31.4-18.5 41.3-31.9q.7-.7.4-1.5l-.3-.4-.4-.1zm34.2 154.4a7 7 0 0 0 2.4-1.7 79 79 0 0 1 25.2-18.2 6 6 0 0 0 3-3q.4-.8.3-1.4l-.5-.6h-.6q-.6 0-1.4.3l-4 1.8-6.7 3.6-.1.1a82 82 0 0 0-20.4 17.3l-.5.7q-.3.4-.2.7 0 .4.3.6l.5.2h1.3zM572 146q1.3-.6 2-1.7c.6-1.1.5-1.6.5-2.6l-.3-2v-.2l-.1-.1q-.4-.4-.7-.4h-.8l-1.2.3h-.1c-11 4.3-23.5 10-33.8 17q-15.1 10.4-23.7 24v.1l-.2.4-.1.1-.2.4-.2.5v.6q.2.7.8.8l1.3.1h2.3a4 4 0 0 0 3.4-2.2 85 85 0 0 1 30.3-25.6l.3-.2A194 194 0 0 1 572 146zm-33.5-4.1 6.6-3a541 541 0 0 0 25.2-11.9l1.5-1q.6-.7.5-1.8a20 20 0 0 0-1.7-5.1q-.6-1.2-1.5-1.5c-1-.3-1.4-.1-2.2.2q-10.3 5.3-21.1 10l-3 1.4q-12.3 5.3-24 11.9a77 77 0 0 0-35.8 39.3v.2l-.3.8q-.2.4-.1 1a1 1 0 0 0 .6.8q.5.2 1.3.2h5.7q1.2 0 2-.6.7-.6 1-1.7c8.2-19.3 27-31.2 45.3-39.2zM527 124.3l5.3-2.2c9.6-4 19.4-8 28.2-12.9q1.2-.7 1.1-1.8-.2-1-1.2-1.6a34 34 0 0 0-4.7-3 5 5 0 0 0-4.2.2c-8 4-16.8 7.6-25.5 11.1l-4.9 2c-21.5 8.5-46.4 23.3-55.8 48.5a74 74 0 0 0-3.7 12.3 6 6 0 0 0 0 2.2q.7 2 2.4 2.8c1.7.8 2.2 1 3.3 1.3q.9.3 1.7 0 .8-.4 1.2-1.3l.1-.1a81 81 0 0 1 4.8-15.3c9.3-22.2 30.6-33.7 51.9-42.2zM482.3 28q-.5-.6-1-.5h-1l-1 .5-.9.5a91 91 0 0 1-18 13.2q-.7.5-1.3 1.3-.4.4-.5.8v1l.1.1q.7.6 1.4.4l1-.5a91 91 0 0 0 20.3-15l.1-.2h.1l.4-.4.3-.5zm56.7 2.2V30a2 2 0 0 0-1.3-1l-.7-.2h-.6q-1.3-.4-2.4.1c-1 .5-1.2 1-1.5 1.8-7 13-19 21.2-32.2 28.4l-11.6 6c-9.7 4.9-19.6 9.8-27.9 16.2l-.2.1-1.2 1q-.6.7-.8 1.8v3.5q-.1 1 .1 1.9l.1.1.5.3h.5l1-.5c9-7.5 19.5-13 30-18.4l1.1-.5c9-4.5 18.9-9.5 27.4-15.7 9-6.5 16.4-14.4 19.7-24.5zm-30.8 55 .8-.4c19.8-8.4 40.6-17.1 52.4-36.6q1.3-1.8.9-3.3a8 8 0 0 0-1.8-3l-.4-.5-.4-.5-1-1q-.7-.5-1.5-.2T556 41c-10 18.3-28.7 26.7-48.9 35.2l-4.7 2C487 85 471 91.7 459 103.8h-.1a5 5 0 0 0-.5 2.1v8.4l.3.5q.3.3.6.3l.5-.2.6-.6.3-.2.3-.3c12.5-14 30-21.3 47.1-28.4zm12 18.4 6-2.4c14.8-5.9 30.3-12 41.3-23.5q.9-1.9 1-3.8.4-3.7.2-7.2v-1l-.3-.9-.4-.4-.6.1q-.5.2-1 .9c-13 15-32 22.3-51.4 29.8l-1.5.6c-19.8 7.7-39.7 15.7-53.2 32.5l-.3.4c-.6.9-1.2 1.6-1.2 2.9v16l1-1.8c13.1-23.5 36.4-33 60.4-42.2z"
            />
          </svg>
        </a>
        <div className={styles.settingmobileparent}>
          <div className={styles.settingsWrapper} ref={settingsRef}>
            <button
              className={styles.settingsButton}
              onClick={toggleSettings}
              aria-label="Settings"
              ref={settingsButtonRef}>
              <svg
                className={styles.menubtn}
                style={{
                  cursor: "pointer",
                  width: "32px",
                  height: "32px",
                  padding: "5px",
                }}
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a2 2 0 0 0 .3 1.8 2 2 0 0 1 0 3 2 2 0 0 1-2.7 0l-.1-.1a2 2 0 0 0-1.8-.4 2 2 0 0 0-1 1.5v.2a2 2 0 0 1-2 2 2 2 0 0 1-2-2A2 2 0 0 0 9 19.3a2 2 0 0 0-1.8.3 2 2 0 0 1-3 0 2 2 0 0 1 0-2.7l.1-.1a2 2 0 0 0 .4-1.8 2 2 0 0 0-1.5-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2 2 2 0 0 0 1.7-1 2 2 0 0 0-.3-1.8 2 2 0 0 1 0-3 2 2 0 0 1 2.7 0l.1.1a2 2 0 0 0 1.8.4 2 2 0 0 0 1-1.5V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 0 1 1.6 2 2 0 0 0 1.8-.3 2 2 0 0 1 3 0 2 2 0 0 1 0 2.7l-.1.1a2 2 0 0 0-.4 1.8V9a2 2 0 0 0 1.5 1h.2a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 0-1.6 1z" />
              </svg>
            </button>

            <div className={`${styles.settingsDropdown} ${isSettingsOpen ? styles.settingsDropdownOpen : ""}`}>
              <div className="title" style={{ height: "30px" }}>
                {t(LanguageKey.userpanel_Settings)}
              </div>

              <div className="headerandinput">
                <span className="title">{t(LanguageKey.SettingGeneralSystemtheme)}</span>
                <div className={styles.options}>
                  {radioOptions.map((option) => (
                    <div key={option.name} className={styles.radiobtn}>
                      <RadioButton
                        name={option.name}
                        id={option.value}
                        checked={option.checked}
                        handleOptionChanged={handleSelectTheme}
                        textlabel={option.value}
                        title={option.name}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="headerandinput">
                <span className="title">{t(LanguageKey.SettingGeneralSystemlanguage)}</span>
                <div className={styles.options}>
                  {languageOptions.map((option) => (
                    <div key={option.name} className={styles.radiobtn}>
                      <RadioButton
                        name={option.name}
                        id={option.value}
                        checked={option.checked}
                        handleOptionChanged={handleChangeLanguage}
                        textlabel={option.value}
                        title={option.value}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.mobileMenuContainer} ref={menuRef}>
            <button
              className={styles.menubtn}
              onClick={toggleMobileMenu}
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu">
              <svg
                strokeWidth="3"
                strokeLinecap="round"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="var(--color-gray)"
                viewBox="0 0 32 32">
                <path d="M15.7 26.2a.4.4 0 1 1 0-.8.4.4 0 0 1 0 .8" />
                <path d="M25.3 16.6a.4.4 0 1 1 0-.8.4.4 0 0 1 0 .8" />
                <path d="M15.7 7.1a.4.4 0 1 1 0-.8.4.4 0 0 1 0 .8" />
                <path d="M6.3 16.6a.4.4 0 1 1 0-.8.4.4 0 0 1 0 .8" />
                <path d="M15.7 16.6a.4.4 0 1 1 0-.8.4.4 0 0 1 0 .8" opacity=".4" />
                <path d="M25.3 26.2a.4.4 0 1 1 0-.8.4.4 0 0 1 0 .8" opacity=".4" />
                <path d="M25.3 7.1a.4.4 0 1 1 0-.8.4.4 0 0 1 0 .8" opacity=".4" />
                <path d="M6.3 26.2a.4.4 0 1 1 0-.8.4.4 0 0 1 0 .8" opacity=".4" />
                <path d="M6.3 7.1a.4.4 0 1 1 0-.8.4.4 0 0 1 0 .8" opacity=".4" />
              </svg>
            </button>
            <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ""}`}>
              <a
                href="#dashboard"
                className={styles.headermenulistmobile}
                onClick={(e) => {
                  e.preventDefault();
                  onShowCreateSignIn();
                  handleMenuItemClick();
                }}>
                {t(LanguageKey.Dashboard)}
              </a>
              <a href="/" className={styles.headermenulistmobile}>
                {t(LanguageKey.navbar_Home)}
              </a>
              <a
                href="#services"
                className={styles.headermenulistmobile}
                onClick={(e) => {
                  e.preventDefault();
                  onMenuClickWithScroll(page2Ref);
                }}>
                {t(LanguageKey.services)}
              </a>
              <a
                href="#markets"
                className={styles.headermenulistmobile}
                onClick={(e) => {
                  e.preventDefault();
                  onMenuClickWithScroll(page4Ref);
                }}>
                {t(LanguageKey.markets)}
              </a>
              <a
                href="#pricing"
                className={styles.headermenulistmobile}
                onClick={(e) => {
                  e.preventDefault();
                  onMenuClickWithScroll(page9Ref);
                }}>
                {t(LanguageKey.pricing)}
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className={styles.headerdesktop}>
        <a href="/">
          {/* <img className={styles.BrancyLogoLTR} alt="brancy logo" src="/Brancylogo.svg" />
          <img className={styles.BrancyLogoRTL} alt="brancy logo" src="/Brancylogo-fa.svg" /> */}
          <svg className={styles.BrancyLogoLTR} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 745 212">
            <path
              fill="#2977ff"
              d="M28.7 190.3c34.7 29.6 125.8 29.2 160.3-2.7 31.3-35 30.2-126.2 0-160.4l-5.7-5.5C148.6-7.9 57.5-7.4 23 24.5c-31.3 35-30.1 126 .1 160.3z"
            />
            <path
              fill="#fff"
              stroke="#fff"
              d="M96.4 27.5c-.4 0-1.4.1-2.1.4a5 5 0 0 0-1.7 1.4 88 88 0 0 1-19.5 17q-8 5.3-16.7 10.3l-6.8 4v.1q-.7.8-1 1.8-.2 1 .2 1.8l.5.6h.7l1.2-.6 3.6-2 1.4-.8C72 52.2 87.6 43 97.5 29.6q.7-.7.4-1.5l-.3-.4-.4-.1h-.7zm34.1 154.4a7 7 0 0 0 2.5-1.7 79 79 0 0 1 25.2-18.2q1.4-.5 2.3-1.8l.8-1.2q.3-.8.2-1.4l-.5-.6h-.6l-1.4.3-4 1.8c-3 1.4-6 3.2-6.7 3.6l-.1.1a82 82 0 0 0-20.4 17.3l-.5.7-.2.6.3.7q.3.3.5.2h1.3zM162 146q1.3-.6 2-1.7c.6-1.1.5-1.6.5-2.6l-.3-2v-.2l-.1-.1q-.3-.4-.7-.4h-.8l-1.2.3h-.1c-11 4.3-23.5 10-33.8 17a82 82 0 0 0-23.7 24v.1l-.2.4-.1.1-.2.4-.2.5v.6q.2.7.8.8l1.3.2h1.6l.7-.1q2.3-.4 3.4-2.2a85 85 0 0 1 30.3-25.7h.3v-.2A194 194 0 0 1 162 146zm-33.5-4.1 6.6-3c8.6-3.9 17.4-7.8 25.2-11.9q.9-.3 1.5-1t.5-1.8a20 20 0 0 0-1.7-5.1q-.6-1.2-1.5-1.5c-1-.3-1.4-.1-2.2.2q-10.3 5.3-21.1 10l-3 1.4q-12.3 5.3-24 11.9A77 77 0 0 0 73 180.5v.2l-.3.8q-.2.4-.1 1 0 .5.6.8t1.3.2h5.7a3 3 0 0 0 2-.6q.7-.6 1-1.7c8.2-19.3 27-31.2 45.3-39.2zM117 124.3l5.3-2.2c9.6-4 19.4-8 28.2-12.9q1.2-.7 1.1-1.8-.2-1-1.2-1.6a34 34 0 0 0-4.7-3 5 5 0 0 0-4.2.2c-8 4-16.8 7.6-25.5 11.1l-4.9 2c-21.5 8.5-46.4 23.3-55.8 48.5a74 74 0 0 0-3.7 12.3 6 6 0 0 0 0 2.2q.7 2 2.4 2.8c1.7.8 2.2 1 3.3 1.3q1 .3 1.7 0 .8-.4 1.2-1.3l.1-.1a81 81 0 0 1 4.8-15.3c9.3-22.2 30.6-33.7 51.9-42.2zM72.3 28q-.5-.5-1-.5h-1q-.5.1-1 .5-.5.1-.9.6-7.9 7.5-18 13.2-.7.4-1.3 1.2l-.5.8v1l.1.1q.7.7 1.4.4l1-.5a91 91 0 0 0 20.3-15l.1-.2h.1l.4-.4q0-.2.3-.5zm56.7 2.3V30a2 2 0 0 0-1.3-1l-.7-.2h-.6q-1.3-.4-2.4.1c-1 .5-1.2 1-1.5 1.8-7 13-19 21.2-32.2 28.4l-11.6 6C69 70 59.1 74.9 50.8 81.3l-.2.1-1.2 1q-.6.7-.8 1.8v3.5q-.2 1 .1 1.9l.1.1.5.3h.5l1-.5c9-7.5 19.5-13 30-18.3l1.1-.6c9-4.5 18.9-9.5 27.4-15.7 9-6.5 16.4-14.4 19.7-24.5zm-30.8 55 .8-.4c19.8-8.4 40.6-17.1 52.4-36.6q1.3-1.8.9-3.3t-1.8-3l-.4-.5-.4-.5-1-1q-.7-.5-1.5-.2T146 41c-10 18.4-28.7 26.8-49 35.3l-4.7 2C77 85 61 91.7 49 103.7l-.1.1a5 5 0 0 0-.5 2.1v8.4l.3.6.6.2.5-.2.6-.6.3-.2.3-.3c12.5-14 30-21.3 47.1-28.4zm12 18.4 6-2.4c14.8-5.9 30.3-12 41.3-23.5a9 9 0 0 0 1-3.8q.4-3.7.2-7.2v-1q0-.4-.3-.9l-.4-.4-.6.1q-.5.2-1 .9c-13 15-32 22.3-51.4 29.8l-1.5.6c-19.8 7.7-39.7 15.7-53.2 32.5l-.3.4c-.6.9-1.2 1.6-1.2 2.9v16l1-1.8c13.1-23.5 36.4-33 60.4-42.2z"
            />
            <path
              fill="#2977ff"
              d="M337.3 70.8q-1.3 7.7-6.4 13a28 28 0 0 1-13.3 8.4c12.3 4.3 17.2 13.4 15.2 25.3-2 11.2-7.4 18.4-16.6 23.8s-21.6 8-37.1 8l-6.7-.1-8-.7-8-1.3a34 34 0 0 1-7-2.1q-8.7-3.6-7.1-12.4L256 53.5a9 9 0 0 1 3-5.5q2.2-2 5.8-3.1 6-2 14.9-3a169 169 0 0 1 17.9-.9q21.5 0 32 7.3t7.7 22.5m-57.8 13.3h12.3q7.2 0 11-2.8t4.7-8q.8-4.5-2.5-7.2t-11-2.7l-5.8.1-5.2.6zm23.5 31q1.8-10.5-12.1-10.4h-15l-3.6 20.7q2.3.7 5.9 1l7 .2q6.8 0 11.8-2.8 5-2.9 6-8.7m62.2 32.7q-2 .5-5.5 1a56 56 0 0 1-7.7.5q-8.6 0-11.8-2.8t-1.9-10.8l8.9-50.7q1-5 4-8.6c3-3.6 4.9-4.6 8.2-6.4q6.6-3.6 14.9-5.5c8.3-1.9 11.2-1.8 17-1.8q18.6 0 16.3 13.1-.5 3-1.8 5.7t-2.9 4.5a47 47 0 0 0-27.4 3.4zm85-85.1q9 0 16 1.8c7.1 1.9 8.6 3.1 11.7 5.6s5.2 5.7 6.4 9.6 1.4 8.4.5 13.6l-6.5 37.6q-.8 4.4-3.7 7.1-3 2.8-6.6 4.8a66 66 0 0 1-31.6 6.5q-8.8 0-15.6-1.6a31 31 0 0 1-11.3-5 18 18 0 0 1-6.3-8.6 24 24 0 0 1-.7-12q2-11.7 10-17.9c8-6.2 12.7-6.7 22.4-7.7l22.3-2.3.2-1.2q.8-4.8-3-7c-3.9-2.1-6.6-2-12-2q-6 0-12.4 1.3-6.3 1.4-11.5 3.3a9 9 0 0 1-2.9-4.6q-1-3-.4-6.4.8-4.4 3.3-7c2.5-2.6 4.1-3.2 7.2-4.4q5.1-1.8 11.9-2.7 6.7-.9 12.5-.8M440 128.5q2.9 0 6.4-.5 3.5-.7 5.4-1.6L454 113l-12.2 1q-4.7.3-8 2a7 7 0 0 0-3.9 5q-.6 3.3 1.7 5.4c2.3 2.1 4.2 2.1 8.3 2.1m125.4 19.3q-2 .5-5.5 1a56 56 0 0 1-7.7.5q-8.6 0-11.9-2.8-3.2-2.9-1.8-10.8l7-40.2q.9-5.2-1.8-7.7t-7.8-2.5q-3.4 0-6.6.9a40 40 0 0 0-6.1 2.2l-10.4 59.4q-2 .5-5.6 1s-5 .5-7.7.5q-8.6 0-11.8-2.8c-3.2-2.8-2.8-5.5-1.9-10.8l9-51.2q.8-4.6 3.3-7.5a27 27 0 0 1 6.3-5.3q6.5-4.1 15.8-6.6a78 78 0 0 1 20-2.4q19.3 0 28.3 8.4t6.3 23.6zM634 85.1a26 26 0 0 0-8.2 1.4 23 23 0 0 0-7.3 4q-3.3 2.7-5.7 6.7c-2.4 4-2.7 5.7-3.3 9.1q-1.8 10.5 3.2 15.5t13.8 5q5.1 0 9.2-1.3 4-1.2 7.2-2.6 2.8 2.4 4 5 1.1 2.8.4 6.6-1.1 6.8-8.6 10.8t-19.7 4q-10.5 0-18.7-2.7c-8.2-2.7-9.7-4.6-13-8.3s-5.7-8.1-6.9-13.4a48 48 0 0 1 0-18.6q2-11 7-19.3c5-8.3 7.6-10 12.4-13.6a52 52 0 0 1 15.8-8 60 60 0 0 1 17.8-2.7q12.1 0 18 4.3 5.8 4.5 4.6 11.3-.6 3.1-2.6 6c-2 2.8-2.8 3.4-4.4 4.7q-2.6-1.3-6.4-2.6-3.8-1.2-8.6-1.3m38 36.4-2.1-8.8a188 188 0 0 1-4-25.7l-1.6-18.8a25 25 0 0 1 15.1-5.5q5.6 0 8.8 2.3t4 8.6l2.4 21.9L697 117h.6l5.8-11.7 5.9-13 5.6-13.5 5-13.2a35 35 0 0 1 6-2.2 24 24 0 0 1 6.1-.8q5.6 0 9.3 2.3c3.7 2.3 3.4 4.4 2.7 8.3q-1.1 6.3-4.6 15c-3.5 8.8-5.2 12-8.4 18.3a254 254 0 0 1-21.2 34.2q-11.7 15.5-20.6 22.8-9 7.5-16.7 7.4-6.3 0-10-4-3.6-3.9-3.2-10.2a161 161 0 0 0 22.7-20.6q-2.6-.8-5.2-3.7a29 29 0 0 1-4.8-11"
            />
          </svg>
          <svg className={styles.BrancyLogoRTL} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 623 212">
            <path
              fill="#2977ff"
              d="M271 87.8a62 62 0 0 0 0-13.4 13 13 0 0 0-5.5-8.7 15 15 0 0 0-9.2-2.3l-12.7 1q0 3.5-.3 9.4l-.9 13.9a25 25 0 0 1-5.8 15 20 20 0 0 1-5.7 4.3c-9.4 5-19.9 1.5-22.6.7a34 34 0 0 1-5.6-2.4 64 64 0 0 0 4.2-17.5c.4-4.8.3-9.7 0-13.4a12 12 0 0 0-5.2-9 14 14 0 0 0-9.3-2l-13 1-.2 9.4-1 13.9a36 36 0 0 1-5.2 16.6c-2 2.8-3.9 3.8-4.8 4.3-4 1.9-8 1.1-9.3.9a16 16 0 0 1-5.6-2.4 80 80 0 0 0 4.5-18.7 89 89 0 0 0 .3-13.8c0-1-.3-5-3.8-8a14 14 0 0 0-11.1-3.2l-12.8 1.2V68l-.3 4-.6 8.4c-.7 7.6-3.3 21.9-6.2 24.8q-4.3 4.5-11.1 4.5l-2-.1q-1.3-.2-2.5-.6-2.7-1-3.8-2.5 1.5-3.8 2.5-7.8a78 78 0 0 0 2.2-19.2c-.1-6.8-.2-10.7-3-13.3-3.5-3.2-8.6-3-10.6-2.8l-13.6.8q0 3-.3 7.4l-.6 8.3c-1.2 10.8-2 19-6.5 22.9-1.5 1.4-5.2 4-12.7 3.9l-16.6-.2c-6.8 0-11 0-16.3 2.2-1 .4-4 1.7-8 4.7A55 55 0 0 0 1.6 146c-1.3 6.8-2 10.2-1.1 13.8 4.7 20.8 45.4 24.6 68.5 22.8 12.7-1 29.6-2.2 36-13.3 4.1-7 2.3-14.9.8-19.2-27 7-47.5 7-60.6 5.8-24.9-2.3-28.3-9-29.1-12-.2-.7-.7-3 0-5.4 2.6-7.8 16.8-9.6 36.6-8.5q5.8.5 11.8.5c6.1 0 8.2.2 14.3-2a34 34 0 0 0 11.4-6.6l1.7 1.7a29 29 0 0 0 6.6 4.2s6.5 3.1 15 3.1h1.3c10.5 0 19-3 25.8-7.7v.1a28 28 0 0 0 8 4.5 43 43 0 0 0 15.2 3.1c3.3 0 9.3-.6 16.3-3a42 42 0 0 0 9.4-4.8l5.2 2.8c12.3 5.7 24.5 5 29.4 5 6.4 0 21-.7 32.8-11.6s13.4-24.9 14.2-31.5m108.5-13.6q-.8-4.8-3-7.4a9 9 0 0 0-3.4-2.5l-1.6-.5a18 18 0 0 0-6.3-.4L352 64.8V74q-.2 5.8-.8 13.4-.7 10.1-5.7 16a17 17 0 0 1-12.7 6.3H331l-3-.1a62 62 0 0 1-8.6-1.2l1-6.8q.9-5.7 1-9.5c.7-9.4 0-14.8-.6-18.5a12 12 0 0 0-4-7.5 14 14 0 0 0-10.9-2.7L292.3 65a505 505 0 0 1-.4 21.6 144 144 0 0 1-3.7 31.8 39 39 0 0 1-7.2 14.1 50 50 0 0 1-22.3 16A42 42 0 0 1 248 150l1 7.5a15 15 0 0 0 5.4 9.6c3.7 3 8 3.2 11.6 3.3a44 44 0 0 0 27.9-9.7 45 45 0 0 0 10.7-12.2c3-5 9-13.3 10.5-20.7a51 51 0 0 0 6.8 1.7c4.8.9 8 1.4 12.3 1.3 13.3-.2 24-4.7 32-12.2s12.5-18 13.5-31.6q.5-8-.3-12.9m-36 78.2c-3.9-3.1-14-3-18 .3-3.4 3.6-3.3 13.2 0 16.8l.7.5c3.9 3.1 14 3 18-.3 3.4-3.6 3.3-13.2 0-16.8zm-108.6-117c-4-3.1-14.1-3-18 .3-3.5 3.6-3.3 13.2 0 16.8l.7.5c3.8 3.1 14 3 17.9-.2 3.5-3.7 3.4-13.3 0-16.8zm-88.2 120.6q-.3 1.6-1.4 2.7a6 6 0 0 1-2.7 1.8q3.8 1.3 3.1 5.2-.6 3.5-3.4 5a14 14 0 0 1-7.8 1.7H133l-1.6-.2-1.7-.3-1.4-.4q-1.8-.8-1.5-2.6l2.8-16.5q.2-.8.6-1.2.7-.5 1.3-.6 1.2-.4 3-.6l3.8-.2q4.5 0 6.7 1.5c2.1 1.5 2 2.6 1.6 4.7m-12 2.8h2.5q1.5 0 2.3-.6 1-.8 1-1.7.1-1-.6-1.5-.8-.7-2.2-.6h-1.3l-1 .2zm4.8 6.4q.4-2.1-2.5-2.1h-3.1l-.8 4.3 1.3.2h1.4q1.4 0 2.5-.6c1-.5 1-1 1.2-1.8m13 6.8-1.2.3h-1.6q-1.8 0-2.4-.5-.9-.8-.4-2.3l1.8-10.5q.2-1 .9-1.8c.6-.8 1-1 1.7-1.4q1.3-.7 3-1.1c1.8-.4 2.4-.4 3.6-.4q4 0 3.4 2.7 0 .7-.4 1.2l-.6 1-1.9-.2-2 .2c-1 .2-1.2.4-1.8.7zm17.7-17.7q1.9 0 3.3.4c1.5.4 1.8.6 2.5 1.1a4 4 0 0 1 1.3 2 6 6 0 0 1 .1 2.9l-1.3 7.8q-.2 1-.8 1.5l-1.4 1q-2.5 1.4-6.6 1.4-1.8 0-3.2-.4a5 5 0 0 1-2.4-1 4 4 0 0 1-1.3-1.8 5 5 0 0 1-.1-2.5q.4-2.4 2-3.7c1.7-1.3 2.7-1.4 4.7-1.6l4.6-.5.1-.3q.2-1-.6-1.4-1-.6-2.5-.5l-2.6.3-2.4.7-.6-1v-1.3q0-.9.6-1.4.7-.7 1.5-1 1-.4 2.5-.5zm-2.1 13.7h1.3l1.1-.4.5-2.8-2.5.2q-1 0-1.7.4c-.7.3-.7.6-.8 1s0 1 .3 1.2 1 .4 1.8.4m26.1 4-1.1.3h-1.6q-1.8 0-2.5-.5-.9-.8-.4-2.3l1.5-8.4q.2-1-.4-1.6-.8-.6-1.6-.5l-1.4.2-1.3.5L183 172l-1.1.2h-1.6q-1.8 0-2.5-.5-.9-.8-.4-2.3l1.9-10.7q.2-1 .7-1.5.7-.8 1.3-1.1 1.3-.9 3.3-1.4c1.9-.5 2.7-.5 4.1-.5q4 0 6 1.8c1.8 1.7 1.6 2.8 1.3 4.9zm14.3-13-1.7.3-1.5.8a5 5 0 0 0-1.9 3.3q-.4 2.2.7 3.2c1 1 1.6 1 2.8 1q1.1 0 2-.2l1.5-.5.8 1q.3.7 0 1.4-.2 1.4-1.7 2.2c-1.6.9-2.4.9-4.1.9q-2.2 0-4-.6c-1.6-.6-2-1-2.6-1.7s-1.2-1.7-1.5-2.8-.2-2.4 0-3.9q.5-2.3 1.5-4a8 8 0 0 1 2.6-2.9q1.5-1 3.3-1.6a10 10 0 0 1 3.7-.6q2.5 0 3.7.9c1.2.9 1.2 1.4 1 2.3l-.5 1.3-1 1-1.3-.6c-.8-.2-1.1-.2-1.8-.2m8 7.6-.5-1.9-.5-2.3-.4-3-.3-4 1.4-.8 1.8-.3q1.1 0 1.8.5c.7.4.7.9.8 1.8l.5 4.5.6 4.5 1.3-2.4 1.2-2.7 1.2-2.8 1-2.8 1.3-.5 1.3-.1q1.1 0 1.9.5c.8.5.7.9.6 1.7q-.3 1.3-1 3.1l-1.8 3.8-2.1 3.9-2.3 3.3q-2.4 3.2-4.3 4.7c-1.8 1.6-2.4 1.6-3.4 1.6q-1.4 0-2.1-.8c-.8-.9-.8-1.3-.7-2.2l2.5-2 2.2-2.3q-.5-.1-1-.8c-.6-.6-.8-1.1-1-2.3m222.4 23.9c34.7 29.6 125.8 29.1 160.3-2.8 31.3-35 30.2-126 0-160.3l-5.7-5.5C558.6-7.9 467.5-7.5 433 24.4c-31.3 35-30.1 126.1.1 160.4z"
            />
            <path
              fill="#fff"
              stroke="#fff"
              d="M506.4 27.5c-.4 0-1.4.1-2.1.4a5 5 0 0 0-1.7 1.4 87 87 0 0 1-19.5 17q-8 5.3-16.7 10.3l-6.7 4v.1h-.1a3 3 0 0 0-1 1.8 3 3 0 0 0 .1 1.8q.2.4.6.6h.7l1.2-.6 3.5-2 1.5-.8c15.8-9.3 31.4-18.5 41.3-31.9q.7-.7.4-1.5l-.3-.4-.4-.1zm34.2 154.4a7 7 0 0 0 2.4-1.7 79 79 0 0 1 25.2-18.2 6 6 0 0 0 3-3q.4-.8.3-1.4l-.5-.6h-.6q-.6 0-1.4.3l-4 1.8-6.7 3.6-.1.1a82 82 0 0 0-20.4 17.3l-.5.7q-.3.4-.2.7 0 .4.3.6l.5.2h1.3zM572 146q1.3-.6 2-1.7c.6-1.1.5-1.6.5-2.6l-.3-2v-.2l-.1-.1q-.4-.4-.7-.4h-.8l-1.2.3h-.1c-11 4.3-23.5 10-33.8 17q-15.1 10.4-23.7 24v.1l-.2.4-.1.1-.2.4-.2.5v.6q.2.7.8.8l1.3.1h2.3a4 4 0 0 0 3.4-2.2 85 85 0 0 1 30.3-25.6l.3-.2A194 194 0 0 1 572 146zm-33.5-4.1 6.6-3a541 541 0 0 0 25.2-11.9l1.5-1q.6-.7.5-1.8a20 20 0 0 0-1.7-5.1q-.6-1.2-1.5-1.5c-1-.3-1.4-.1-2.2.2q-10.3 5.3-21.1 10l-3 1.4q-12.3 5.3-24 11.9a77 77 0 0 0-35.8 39.3v.2l-.3.8q-.2.4-.1 1a1 1 0 0 0 .6.8q.5.2 1.3.2h5.7q1.2 0 2-.6.7-.6 1-1.7c8.2-19.3 27-31.2 45.3-39.2zM527 124.3l5.3-2.2c9.6-4 19.4-8 28.2-12.9q1.2-.7 1.1-1.8-.2-1-1.2-1.6a34 34 0 0 0-4.7-3 5 5 0 0 0-4.2.2c-8 4-16.8 7.6-25.5 11.1l-4.9 2c-21.5 8.5-46.4 23.3-55.8 48.5a74 74 0 0 0-3.7 12.3 6 6 0 0 0 0 2.2q.7 2 2.4 2.8c1.7.8 2.2 1 3.3 1.3q.9.3 1.7 0 .8-.4 1.2-1.3l.1-.1a81 81 0 0 1 4.8-15.3c9.3-22.2 30.6-33.7 51.9-42.2zM482.3 28q-.5-.6-1-.5h-1l-1 .5-.9.5a91 91 0 0 1-18 13.2q-.7.5-1.3 1.3-.4.4-.5.8v1l.1.1q.7.6 1.4.4l1-.5a91 91 0 0 0 20.3-15l.1-.2h.1l.4-.4.3-.5zm56.7 2.2V30a2 2 0 0 0-1.3-1l-.7-.2h-.6q-1.3-.4-2.4.1c-1 .5-1.2 1-1.5 1.8-7 13-19 21.2-32.2 28.4l-11.6 6c-9.7 4.9-19.6 9.8-27.9 16.2l-.2.1-1.2 1q-.6.7-.8 1.8v3.5q-.1 1 .1 1.9l.1.1.5.3h.5l1-.5c9-7.5 19.5-13 30-18.4l1.1-.5c9-4.5 18.9-9.5 27.4-15.7 9-6.5 16.4-14.4 19.7-24.5zm-30.8 55 .8-.4c19.8-8.4 40.6-17.1 52.4-36.6q1.3-1.8.9-3.3a8 8 0 0 0-1.8-3l-.4-.5-.4-.5-1-1q-.7-.5-1.5-.2T556 41c-10 18.3-28.7 26.7-48.9 35.2l-4.7 2C487 85 471 91.7 459 103.8h-.1a5 5 0 0 0-.5 2.1v8.4l.3.5q.3.3.6.3l.5-.2.6-.6.3-.2.3-.3c12.5-14 30-21.3 47.1-28.4zm12 18.4 6-2.4c14.8-5.9 30.3-12 41.3-23.5q.9-1.9 1-3.8.4-3.7.2-7.2v-1l-.3-.9-.4-.4-.6.1q-.5.2-1 .9c-13 15-32 22.3-51.4 29.8l-1.5.6c-19.8 7.7-39.7 15.7-53.2 32.5l-.3.4c-.6.9-1.2 1.6-1.2 2.9v16l1-1.8c13.1-23.5 36.4-33 60.4-42.2z"
            />
          </svg>
        </a>
        <div className={styles.headermenudesktop}>
          <a href="/" className={styles.headermenulist}>
            {t(LanguageKey.navbar_Home)}
          </a>
          <a
            href="#markets"
            className={styles.headermenulist}
            onClick={(e) => {
              e.preventDefault();
              onScrollToSection(page2Ref);
            }}
            style={{ cursor: "pointer" }}>
            {t(LanguageKey.markets)}
          </a>
          <a
            href="#services"
            className={styles.headermenulist}
            onClick={(e) => {
              e.preventDefault();
              onScrollToSection(page4Ref);
            }}
            style={{ cursor: "pointer" }}>
            {t(LanguageKey.services)}
          </a>
          <a
            href="#pricing"
            className={styles.headermenulist}
            onClick={(e) => {
              e.preventDefault();
              onScrollToSection(page9Ref);
            }}
            style={{ cursor: "pointer" }}>
            {t(LanguageKey.pricing)}
          </a>
        </div>
        <div className={styles.getstart}>
          <div className={styles.settingsWrapper} ref={settingsRef}>
            <button
              className={styles.settingsButton}
              onClick={toggleSettings}
              aria-label="Settings"
              ref={settingsButtonRef}>
              <svg
                className={styles.menubtn}
                style={{
                  cursor: "pointer",
                  width: "38px",
                  height: "38px",
                  padding: "5px",
                }}
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.7 1.7 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.7 1.7 0 0 0-1.82-.33 1.7 1.7 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.7 1.7 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.7 1.7 0 0 0 .33-1.82 1.7 1.7 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.7 1.7 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.7 1.7 0 0 0 1.82.33H9a1.7 1.7 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.7 1.7 0 0 0 1 1.51 1.7 1.7 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.7 1.7 0 0 0-.33 1.82V9a1.7 1.7 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.7 1.7 0 0 0-1.51 1z" />
              </svg>
            </button>

            <div className={`${styles.settingsDropdown} ${isSettingsOpen ? styles.settingsDropdownOpen : ""}`}>
              <div className="title" style={{ height: "40px" }}>
                {t(LanguageKey.userpanel_Settings)}
              </div>

              <div className="headerandinput">
                <span className="title">{t(LanguageKey.SettingGeneralSystemtheme)}</span>
                <div className={styles.options}>
                  {radioOptions.map((option) => (
                    <div key={option.name} className={styles.radiobtn}>
                      <RadioButton
                        name={option.name}
                        id={option.value}
                        checked={option.checked}
                        handleOptionChanged={handleSelectTheme}
                        textlabel={option.value}
                        title={option.name}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="headerandinput">
                <span className="title">{t(LanguageKey.SettingGeneralSystemlanguage)}</span>
                <div className={styles.options}>
                  {languageOptions.map((option) => (
                    <div key={option.name} className={styles.radiobtn}>
                      <RadioButton
                        name={option.name}
                        id={option.value}
                        checked={option.checked}
                        handleOptionChanged={handleChangeLanguage}
                        textlabel={option.value}
                        title={option.value}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <button className={styles.button} onClick={onShowCreateSignIn}>
            {t(LanguageKey.Dashboard)}
            <svg
              className={styles.startsvg}
              xmlns="http://www.w3.org/2000/svg"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0-6.7-6.7m6.7 6.7-6.7 6.8" />
            </svg>
          </button>
        </div>
      </header>
    </>
  );
};

export default LandingHeader;
