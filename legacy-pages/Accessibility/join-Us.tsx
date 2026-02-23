import Head from "next/head";
import React, {
  KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useTranslation } from "react-i18next";

import SignIn, { RedirectType, SignInType } from "../../components/signIn/signIn";
import { LanguageKey } from "../../i18n";
import AccessibilityHeader from "../../components/Accessibility/AccessibilityHeader";
import styles from "./join-Us.module.css";

interface Position {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}

interface ThemeState {
  themeMode: string;
  darkTheme: boolean;
  language: string;
}
const JoinUs: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInType, setSignInType] = useState(SignInType.Phonenumber);
  const [preUserToken, setPreUserToken] = useState("");
  const [hasMounted, setHasMounted] = useState(false);
  const [themeMode, setThemeMode] = useState("light mode");
  const [darkTheme, setDarkTheme] = useState(false);
  const [language, setLanguage] = useState("en");
  const [isPending, startTransition] = useTransition();

  const titleId = useId();
  const descriptionId = useId();

  const positions: Position[] = useMemo(
    () => [
      {
        title: t(LanguageKey.joinUs_frontendDeveloper),
        department: t(LanguageKey.joinUs_engineering),
        location: t(LanguageKey.joinUs_remote),
        type: t(LanguageKey.joinUs_fullTime),
        description: t(LanguageKey.joinUs_frontendDeveloperDescription),
      },
      {
        title: t(LanguageKey.joinUs_backendDeveloper),
        department: t(LanguageKey.joinUs_engineering),
        location: t(LanguageKey.joinUs_remote),
        type: t(LanguageKey.joinUs_fullTime),
        description: t(LanguageKey.joinUs_backendDeveloperDescription),
      },
      {
        title: t(LanguageKey.joinUs_uiUxDesigner),
        department: t(LanguageKey.joinUs_design),
        location: t(LanguageKey.joinUs_remote),
        type: t(LanguageKey.joinUs_fullTime),
        description: t(LanguageKey.joinUs_uiUxDesignerDescription),
      },
      {
        title: t(LanguageKey.joinUs_productManager),
        department: t(LanguageKey.joinUs_product),
        location: t(LanguageKey.joinUs_onsite),
        type: t(LanguageKey.joinUs_fullTime),
        description: t(LanguageKey.joinUs_productManagerDescription),
      },
      {
        title: t(LanguageKey.joinUs_marketingSpecialist),
        department: t(LanguageKey.joinUs_marketing),
        location: t(LanguageKey.joinUs_remote),
        type: t(LanguageKey.joinUs_fullTime),
        description: t(LanguageKey.joinUs_marketingSpecialistDescription),
      },
      {
        title: t(LanguageKey.joinUs_customerSupport),
        department: t(LanguageKey.joinUs_support),
        location: t(LanguageKey.joinUs_remote),
        type: t(LanguageKey.joinUs_partTimeFullTime),
        description: t(LanguageKey.joinUs_customerSupportDescription),
      },
    ],
    [t]
  );

  const themeState = useMemo(
    () => ({
      themeMode,
      darkTheme,
      language,
    }),
    [themeMode, darkTheme, language]
  );

  const dispatch = useCallback((action: { type: string; payload?: any }) => {
    startTransition(() => {
      switch (action.type) {
        case "SET_THEME":
          setThemeMode(action.payload.themeMode);
          setDarkTheme(action.payload.darkTheme);
          break;
        case "SET_LANGUAGE":
          setLanguage(action.payload);
          break;
      }
    });
  }, []);

  useLayoutEffect(() => {
    if (darkTheme !== undefined) {
      if (darkTheme) {
        document.documentElement.setAttribute("data-theme", "dark");
        window.localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
        window.localStorage.setItem("theme", "light");
      }
    }
  }, [darkTheme]);

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
  }, [i18n, dispatch]);

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

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>, action: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  }, []);

  const handleApplyPosition = useCallback(
    (positionIndex: number) => {
      console.log(`Applying for position: ${positions[positionIndex].title}`);
    },
    [positions]
  );

  const handleSendResume = useCallback(() => {
    console.log("Opening resume submission form");
  }, []);

  if (!hasMounted) return null;

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>{t(LanguageKey.footer_JoinUs)} | Brancy</title>
        <meta
          name="description"
          content="Join our team and build your career with innovative projects. We're hiring frontend developers, backend developers, UI/UX designers, and more."
        />
        <meta
          name="keywords"
          content="careers, jobs, frontend developer, backend developer, UI UX designer, remote work, Brancy careers"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/Accessibility/join-Us" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="touch-action" content="manipulation" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="author" content="Brancy" />
        <meta property="og:title" content={`${t(LanguageKey.footer_JoinUs)} | Brancy`} />
        <meta property="og:description" content="Join our innovative team and build amazing products together" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.Brancy.app/Accessibility/join-Us" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "JobPosting",
              hiringOrganization: {
                "@type": "Organization",
                name: "Brancy",
                sameAs: "https://www.Brancy.app",
              },
              jobLocation: {
                "@type": "Place",
                address: "Remote/Onsite",
              },
              title: "Multiple Positions Available",
              description: "Join our team in various roles including frontend, backend, design, and more",
            }),
          }}
        />
      </Head>

      <AccessibilityHeader themeState={themeState} dispatch={dispatch} onShowCreateSignIn={handleShowCreateSignIn} />

      <main className={styles.container} role="main">
        <header className={styles.hero}>
          <h1 className={styles.title} id={titleId}>
            {t(LanguageKey.footer_JoinUs)}
          </h1>
          <p className={styles.subtitle} id={descriptionId}>
            {t(LanguageKey.joinUs_subtitle)}
          </p>
        </header>

        <div className={styles.content} aria-labelledby={titleId} aria-describedby={descriptionId}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t(LanguageKey.joinUs_openPositions)}</h2>
            <p className={styles.text}>{t(LanguageKey.joinUs_openPositionsDescription)}</p>

            <div className={styles.positionsGrid} role="list">
              {positions.map((position, index) => (
                <article
                  key={`position-${index}`}
                  className={styles.positionCard}
                  role="listitem"
                  aria-labelledby={`position-title-${index}`}>
                  {/* Background Icons */}

                  <div className={styles.positionHeader}>
                    <h3 className={styles.positionTitle} id={`position-title-${index}`}>
                      {position.title}
                    </h3>
                    <div className={styles.positionMeta} aria-label="Position details">
                      <span className={styles.department} aria-label={`Department: ${position.department}`}>
                        {position.department}
                      </span>
                      <span className={styles.type} aria-label={`Type: ${position.type}`}>
                        {position.type}
                      </span>
                      <span className={styles.type} aria-label={`Location: ${position.location}`}>
                        {position.location}
                      </span>
                    </div>
                  </div>

                  <p className={styles.positionDescription}>{position.description}</p>
                  <button
                    className={styles.applyButton}
                    onClick={() => handleApplyPosition(index)}
                    onKeyDown={(e) => handleKeyDown(e, () => handleApplyPosition(index))}
                    aria-label={`Apply for ${position.title} position`}
                    type="button">
                    {t(LanguageKey.joinUs_applyNow)}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section} aria-label="Application process">
            <h2 className={styles.sectionTitle}>{t(LanguageKey.joinUs_applicationProcess)}</h2>
            <ol className={styles.processSteps} role="list">
              <li className={styles.step} role="listitem">
                <div className={styles.stepNumber} aria-label="Step 1">
                  1
                </div>
                <div className={styles.stepContent}>
                  <h3>{t(LanguageKey.joinUs_submitApplication)}</h3>
                  <p>{t(LanguageKey.joinUs_submitApplicationDescription)}</p>
                </div>
              </li>
              <li className={styles.step} role="listitem">
                <div className={styles.stepNumber} aria-label="Step 2">
                  2
                </div>
                <div className={styles.stepContent}>
                  <h3>{t(LanguageKey.joinUs_initialScreening)}</h3>
                  <p>{t(LanguageKey.joinUs_initialScreeningDescription)}</p>
                </div>
              </li>
              <li className={styles.step} role="listitem">
                <div className={styles.stepNumber} aria-label="Step 3">
                  3
                </div>
                <div className={styles.stepContent}>
                  <h3>{t(LanguageKey.joinUs_technicalInterview)}</h3>
                  <p>{t(LanguageKey.joinUs_technicalInterviewDescription)}</p>
                </div>
              </li>
              <li className={styles.step} role="listitem">
                <div className={styles.stepNumber} aria-label="Step 4">
                  4
                </div>
                <div className={styles.stepContent}>
                  <h3>{t(LanguageKey.joinUs_finalInterview)}</h3>
                  <p>{t(LanguageKey.joinUs_finalInterviewDescription)}</p>
                </div>
              </li>
              <li className={styles.step} role="listitem">
                <div className={styles.stepNumber} aria-label="Step 5">
                  5
                </div>
                <div className={styles.stepContent}>
                  <h3>{t(LanguageKey.joinUs_welcomeAboard)}</h3>
                  <p>{t(LanguageKey.joinUs_welcomeAboardDescription)}</p>
                </div>
              </li>
            </ol>
          </section>

          <section className={styles.ctaSection} aria-label="Call to action">
            <h2 className={styles.ctaTitle}>{t(LanguageKey.joinUs_readyToJoinUs)}</h2>
            <p className={styles.ctaText}>{t(LanguageKey.joinUs_readyToJoinUsDescription)}</p>
            <button
              className={styles.ctaButton}
              onClick={handleSendResume}
              onKeyDown={(e) => handleKeyDown(e, handleSendResume)}
              aria-label="Send your resume to join our team"
              type="button">
              {t(LanguageKey.joinUs_sendYourResume)}
            </button>
          </section>
        </div>
      </main>

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

export default JoinUs;
