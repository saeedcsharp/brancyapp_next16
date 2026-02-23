import Head from "next/head";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import AccessibilityHeader from "brancy/components/Accessibility/AccessibilityHeader";
import SignIn, { RedirectType, SignInType } from "brancy/components/signIn/signIn";
import { LanguageKey } from "brancy/i18n";
import styles from "./Cookie-Notice.module.css";

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
      return { ...state, ...action.payload };
    case "SET_LANGUAGE":
      return { ...state, language: action.payload };
    default:
      return state;
  }
};

const CookieNotice: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [preferences, setPreferences] = useState({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });
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

  const handlePreferenceChange = (type: keyof typeof preferences) => {
    if (type === "necessary") return; // Cannot disable necessary cookies

    setPreferences((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleSavePreferences = () => {
    // Save preferences to localStorage or send to backend
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    alert("Cookie preferences saved successfully!");
  };

  return (
    <>
      <Head>
        <title>{t(LanguageKey.footer_CookieNotice)} - Brancy</title>
        <meta name="description" content="Cookie Notice for Brancy platform" />
        <meta name="keywords" content="cookies, privacy, data, brancy" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AccessibilityHeader themeState={themeState} dispatch={dispatch} onShowCreateSignIn={handleShowCreateSignIn} />
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>{t(LanguageKey.footer_CookieNotice)}</h1>
          <p className={styles.subtitle}>Learn about how we use cookies and manage your preferences</p>
          <div className={styles.lastUpdated}>Last updated: January 2025</div>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>What are Cookies?</h2>
            <p className={styles.text}>
              Cookies are small text files that are placed on your computer or mobile device when you visit a website.
              They are widely used to make websites work more efficiently and provide information to website owners
              about how users interact with their sites.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>How We Use Cookies</h2>
            <p className={styles.text}>
              We use cookies for various purposes to enhance your experience on our website:
            </p>

            <div className={styles.cookieTypes}>
              <div className={styles.cookieType}>
                <div className={styles.cookieHeader}>
                  <h3>🔒 Necessary Cookies</h3>
                  <span className={styles.required}>Required</span>
                </div>
                <p>
                  These cookies are essential for the website to function properly. They enable basic functions like
                  page navigation, access to secure areas, and remember your login status.
                </p>
                <div className={styles.examples}>
                  <strong>Examples:</strong> Session management, security tokens, user authentication
                </div>
              </div>

              <div className={styles.cookieType}>
                <div className={styles.cookieHeader}>
                  <h3>⚙️ Functional Cookies</h3>
                  <span className={styles.optional}>Optional</span>
                </div>
                <p>
                  These cookies enable enhanced functionality and personalization, such as remembering your preferences,
                  language settings, and region selections.
                </p>
                <div className={styles.examples}>
                  <strong>Examples:</strong> Language preferences, theme settings, form data
                </div>
              </div>

              <div className={styles.cookieType}>
                <div className={styles.cookieHeader}>
                  <h3>📊 Analytics Cookies</h3>
                  <span className={styles.optional}>Optional</span>
                </div>
                <p>
                  These cookies help us understand how visitors interact with our website by collecting and reporting
                  information anonymously to improve our services.
                </p>
                <div className={styles.examples}>
                  <strong>Examples:</strong> Google Analytics, page views, user behavior tracking
                </div>
              </div>

              <div className={styles.cookieType}>
                <div className={styles.cookieHeader}>
                  <h3>🎯 Marketing Cookies</h3>
                  <span className={styles.optional}>Optional</span>
                </div>
                <p>
                  These cookies are used to deliver relevant advertisements and track the effectiveness of our
                  advertising campaigns across different websites.
                </p>
                <div className={styles.examples}>
                  <strong>Examples:</strong> Ad targeting, conversion tracking, social media pixels
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Manage Your Cookie Preferences</h2>
            <p className={styles.text}>
              You can control which cookies you allow us to use. Please note that disabling certain cookies may affect
              the functionality of our website.
            </p>

            <div className={styles.preferencesPanel}>
              <div className={styles.preferenceItem}>
                <div className={styles.preferenceHeader}>
                  <h4>Necessary Cookies</h4>
                  <label className={styles.switch}>
                    <input type="checkbox" checked={preferences.necessary} disabled />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <p>Always enabled - Required for basic website functionality</p>
              </div>

              <div className={styles.preferenceItem}>
                <div className={styles.preferenceHeader}>
                  <h4>Functional Cookies</h4>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={() => handlePreferenceChange("functional")}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <p>Enable enhanced website features and personalization</p>
              </div>

              <div className={styles.preferenceItem}>
                <div className={styles.preferenceHeader}>
                  <h4>Analytics Cookies</h4>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => handlePreferenceChange("analytics")}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <p>Help us improve our website by analyzing usage patterns</p>
              </div>

              <div className={styles.preferenceItem}>
                <div className={styles.preferenceHeader}>
                  <h4>Marketing Cookies</h4>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => handlePreferenceChange("marketing")}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <p>Receive personalized advertisements and offers</p>
              </div>

              <button onClick={handleSavePreferences} className={styles.saveButton}>
                Save Preferences
              </button>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Third-Party Cookies</h2>
            <p className={styles.text}>
              Some cookies are placed by third-party services that appear on our pages. We use the following third-party
              services:
            </p>
            <ul className={styles.list}>
              <li>
                <strong>Google Analytics:</strong> For website traffic analysis
              </li>
              <li>
                <strong>Google Ads:</strong> For advertising and conversion tracking
              </li>
              <li>
                <strong>Facebook Pixel:</strong> For social media advertising
              </li>
              <li>
                <strong>Intercom:</strong> For customer support chat functionality
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Managing Cookies in Your Browser</h2>
            <p className={styles.text}>
              You can also control cookies through your browser settings. Here are links to cookie management guides for
              popular browsers:
            </p>
            <div className={styles.browserLinks}>
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
                Google Chrome
              </a>
              <a
                href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
                target="_blank"
                rel="noopener noreferrer">
                Mozilla Firefox
              </a>
              <a
                href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer">
                Safari
              </a>
              <a
                href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                target="_blank"
                rel="noopener noreferrer">
                Microsoft Edge
              </a>
            </div>
          </section>

          <section className={styles.contactSection}>
            <h2 className={styles.sectionTitle}>Questions About Cookies?</h2>
            <p className={styles.text}>If you have any questions about our use of cookies, please contact us:</p>
            <div className={styles.contactInfo}>
              <p>📧 privacy@brancy.com</p>
              <p>📱 +1 (555) 123-4567</p>
              <p>📍 123 Business Street, Tech City, TC 12345</p>
            </div>
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

export default CookieNotice;
