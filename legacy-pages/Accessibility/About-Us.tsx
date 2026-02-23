import Head from "next/head";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import SignIn, { RedirectType, SignInType } from "../../components/signIn/signIn";
import { LanguageKey } from "../../i18n";
import AccessibilityHeader from "../../components/Accessibility/AccessibilityHeader";
import styles from "./About-Us.module.css";

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

const AboutUs: React.FC = () => {
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
        <title>{t(LanguageKey.aboutUs_pageTitle)}</title>
        <meta name="description" content={t(LanguageKey.aboutUs_metaDescription)} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/Accessibility/About-Us" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="touch-action" content="manipulation" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Head>

      <AccessibilityHeader themeState={themeState} dispatch={dispatch} onShowCreateSignIn={handleShowCreateSignIn} />

      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>{t(LanguageKey.footer_AboutUs)}</h1>
          <p className={styles.subtitle}>{t(LanguageKey.aboutUs_subtitle)}</p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t(LanguageKey.aboutUs_ourStoryTitle)}</h2>
            <p className={styles.text}>{t(LanguageKey.aboutUs_ourStoryPara1)}</p>
            <p className={styles.text}>{t(LanguageKey.aboutUs_ourStoryPara2)}</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t(LanguageKey.aboutUs_innovationTitle)}</h2>
            <p className={styles.text}>{t(LanguageKey.aboutUs_innovationPara1)}</p>
            <p className={styles.text}>{t(LanguageKey.aboutUs_innovationPara2)}</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t(LanguageKey.aboutUs_globalImpactTitle)}</h2>
            <p className={styles.text}>{t(LanguageKey.aboutUs_globalImpactPara)}</p>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>2.5M+</span>
                <span className={styles.statLabel}>{t(LanguageKey.aboutUs_activeUsers)}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>85+</span>
                <span className={styles.statLabel}>{t(LanguageKey.aboutUs_countries)}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>99.9%</span>
                <span className={styles.statLabel}>{t(LanguageKey.aboutUs_uptime)}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>24/7</span>
                <span className={styles.statLabel}>{t(LanguageKey.aboutUs_support)}</span>
              </div>
            </div>
          </section>
          <section className={`${styles.section} ${styles.fullWidthSection}`}>
            <h2 className={styles.sectionTitle}>{t(LanguageKey.aboutUs_coreValuesTitle)}</h2>
            <div className={styles.valuesList}>
              <div className={styles.valueItem}>
                <h3>{t(LanguageKey.aboutUs_innovationFirstTitle)}</h3>
                <p>{t(LanguageKey.aboutUs_innovationFirstDesc)}</p>
              </div>
              <div className={styles.valueItem}>
                <h3>{t(LanguageKey.aboutUs_trustSecurityTitle)}</h3>
                <p>{t(LanguageKey.aboutUs_trustSecurityDesc)}</p>
              </div>
              <div className={styles.valueItem}>
                <h3>{t(LanguageKey.aboutUs_globalCommunityTitle)}</h3>
                <p>{t(LanguageKey.aboutUs_globalCommunityDesc)}</p>
              </div>
              <div className={styles.valueItem}>
                <h3>{t(LanguageKey.aboutUs_sustainableGrowthTitle)}</h3>
                <p>{t(LanguageKey.aboutUs_sustainableGrowthDesc)}</p>
              </div>
              <div className={styles.valueItem}>
                <h3>{t(LanguageKey.aboutUs_userEmpowermentTitle)}</h3>
                <p>{t(LanguageKey.aboutUs_userEmpowermentDesc)}</p>
              </div>
              <div className={styles.valueItem}>
                <h3>{t(LanguageKey.aboutUs_continuousEvolutionTitle)}</h3>
                <p>{t(LanguageKey.aboutUs_continuousEvolutionDesc)}</p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t(LanguageKey.aboutUs_teamTitle)}</h2>
            <p className={styles.text}>{t(LanguageKey.aboutUs_teamPara1)}</p>
            <p className={styles.text}>{t(LanguageKey.aboutUs_teamPara2)}</p>
          </section>
        </div>
      </div>

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

export default AboutUs;
