import Head from "next/head";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import AccessibilityHeader from "../../components/Accessibility/AccessibilityHeader";
import SignIn, { RedirectType, SignInType } from "../../components/signIn/signIn";
import { LanguageKey } from "../../i18n";
import styles from "./Terms-and-conditions.module.css";

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

const TermsAndConditions: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInType, setSignInType] = useState(SignInType.Phonenumber);
  const [preUserToken, setPreUserToken] = useState("");
  const [hasMounted, setHasMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("definitions");

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

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "definitions",
        "account-registration",
        "eligibility",
        "intellectual-property",
        "use-license",
        "user-accounts",
        "prohibited-uses",
        "content",
        "privacy-policy",
        "termination",
      ];

      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShowCreateSignIn = useCallback(() => {
    setPreUserToken("");
    setSignInType(SignInType.Phonenumber);
    setShowSignIn(true);
  }, []);

  const removeMask = useCallback(() => {
    setShowSignIn(false);
  }, []);

  return (
    <>
      <Head>
        <title>{t(LanguageKey.footer_TermsAndConditions)} - Brancy</title>
        <meta name="description" content="Terms and Conditions for Brancy platform" />
        <meta name="keywords" content="terms, conditions, legal, brancy" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AccessibilityHeader themeState={themeState} dispatch={dispatch} onShowCreateSignIn={handleShowCreateSignIn} />
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>{t(LanguageKey.footer_TermsAndConditions)}</h1>
          <p className={styles.subtitle}>Please read these terms and conditions carefully before using our service</p>
          <div className={styles.lastUpdated}>Last updated: January 2025</div>
        </div>

        <div className={styles.mainContent}>
          <aside className={styles.sidebar}>
            <h2 className={styles.tocTitle}>Table of Contents</h2>
            <ul className={styles.tableOfContents}>
              <li className={styles.tocItem}>
                <a
                  href="#definitions"
                  className={`${styles.tocLink} ${activeSection === "definitions" ? styles.active : ""}`}>
                  <span className={styles.tocNumber}>01</span>
                  <span className={styles.tocText}>Definitions</span>
                </a>
              </li>
              <li className={styles.tocItem}>
                <a
                  href="#account-registration"
                  className={`${styles.tocLink} ${activeSection === "account-registration" ? styles.active : ""}`}>
                  <span className={styles.tocNumber}>02</span>
                  <span className={styles.tocText}>Account and Registration</span>
                </a>
              </li>
              <li className={styles.tocItem}>
                <a
                  href="#eligibility"
                  className={`${styles.tocLink} ${activeSection === "eligibility" ? styles.active : ""}`}>
                  <span className={styles.tocNumber}>03</span>
                  <span className={styles.tocText}>Eligibility</span>
                </a>
              </li>
              <li className={styles.tocItem}>
                <a
                  href="#intellectual-property"
                  className={`${styles.tocLink} ${activeSection === "intellectual-property" ? styles.active : ""}`}>
                  <span className={styles.tocNumber}>04</span>
                  <span className={styles.tocText}>Intellectual Property</span>
                </a>
              </li>
              <li className={styles.tocItem}>
                <a
                  href="#use-license"
                  className={`${styles.tocLink} ${activeSection === "use-license" ? styles.active : ""}`}>
                  <span className={styles.tocNumber}>05</span>
                  <span className={styles.tocText}>Use License</span>
                </a>
              </li>
              <li className={styles.tocItem}>
                <a
                  href="#user-accounts"
                  className={`${styles.tocLink} ${activeSection === "user-accounts" ? styles.active : ""}`}>
                  <span className={styles.tocNumber}>06</span>
                  <span className={styles.tocText}>User Accounts</span>
                </a>
              </li>
              <li className={styles.tocItem}>
                <a
                  href="#prohibited-uses"
                  className={`${styles.tocLink} ${activeSection === "prohibited-uses" ? styles.active : ""}`}>
                  <span className={styles.tocNumber}>07</span>
                  <span className={styles.tocText}>Prohibited Uses</span>
                </a>
              </li>
              <li className={styles.tocItem}>
                <a href="#content" className={`${styles.tocLink} ${activeSection === "content" ? styles.active : ""}`}>
                  <span className={styles.tocNumber}>08</span>
                  <span className={styles.tocText}>Content</span>
                </a>
              </li>
              <li className={styles.tocItem}>
                <a
                  href="#privacy-policy"
                  className={`${styles.tocLink} ${activeSection === "privacy-policy" ? styles.active : ""}`}>
                  <span className={styles.tocNumber}>09</span>
                  <span className={styles.tocText}>Privacy Policy</span>
                </a>
              </li>
              <li className={styles.tocItem}>
                <a
                  href="#termination"
                  className={`${styles.tocLink} ${activeSection === "termination" ? styles.active : ""}`}>
                  <span className={styles.tocNumber}>10</span>
                  <span className={styles.tocText}>Termination</span>
                </a>
              </li>
            </ul>
          </aside>

          <div className={styles.content}>
            <section id="definitions" className={styles.section}>
              <h2 className={styles.sectionTitle}>01. Definitions</h2>
              <p className={styles.text}>
                <strong>Website:</strong> Refers to Brancy, accessible at [www.brancy.com].
                <br />
                <strong>User:</strong> Any individual or entity using the Website's services or content.
                <br />
                <strong>Content:</strong> Includes all text, images, videos, and other materials provided on the
                Website.
              </p>
              <p className={styles.text}>
                Users must use the Website in compliance with applicable laws, including those of the Islamic Republic
                of Iran. Unauthorized use, including attempts to access restricted systems or data, is prohibited. Users
                must not upload or share content that is illegal, offensive, or harmful.
              </p>
              <p className={styles.text}>
                All Content on the Website, including text, images, logos, and designs, is owned by Brancy or its
                partners and is protected by intellectual property laws. Copying, distributing, or using Content without
                written permission is prohibited. Some services may require creating a user account. Users are
                responsible for maintaining the security of their account information, such as passwords.
              </p>
              <p className={styles.text}>
                Any activity conducted through a user's account is attributed to the account holder.
              </p>
              <p className={styles.text}>
                <strong>Limitation of Liability:</strong>
                <br />
                Brancy is not liable for any direct or indirect damages arising from the use or inability to use the
                Website. While we strive to provide accurate and up-to-date information, we do not guarantee the
                accuracy or completeness of Content.
              </p>
              <p className={styles.text}>
                <strong>Privacy:</strong>
                <br />
                Personal information is collected and processed in accordance with Brancy's Privacy Policy and
                applicable Privacy Policy.
              </p>
            </section>

            <section id="account-registration" className={styles.section}>
              <h2 className={styles.sectionTitle}>02. Account and Registration</h2>
              <p className={styles.text}>
                When you create an account with us, you must provide information that is accurate, complete, and current
                at all times. You are responsible for safeguarding the password and for all activities that occur under
                your account.
              </p>
            </section>

            <section id="eligibility" className={styles.section}>
              <h2 className={styles.sectionTitle}>03. Eligibility</h2>
              <p className={styles.text}>
                You must be at least 18 years old or have reached the age of majority in your jurisdiction to use our
                services. By using our service, you represent and warrant that you meet these eligibility requirements.
              </p>
            </section>

            <section id="intellectual-property" className={styles.section}>
              <h2 className={styles.sectionTitle}>04. Intellectual Property</h2>
              <p className={styles.text}>
                The service and its original content, features, and functionality are and will remain the exclusive
                property of Brancy and its licensors. The service is protected by copyright, trademark, and other laws.
              </p>
            </section>
            <section id="use-license" className={styles.section}>
              <h2 className={styles.sectionTitle}>05. Use License</h2>
              <p className={styles.text}>
                Permission is granted to temporarily download one copy of the materials on Brancy's website for
                personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of
                title, and under this license you may not:
              </p>
              <ul className={styles.list}>
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section id="user-accounts" className={styles.section}>
              <h2 className={styles.sectionTitle}>06. User Accounts</h2>
              <p className={styles.text}>
                When you create an account with us, you must provide information that is accurate, complete, and current
                at all times. You are responsible for safeguarding the password and for all activities that occur under
                your account.
              </p>
            </section>

            <section id="prohibited-uses" className={styles.section}>
              <h2 className={styles.sectionTitle}>07. Prohibited Uses</h2>
              <p className={styles.text}>You may not use our service:</p>
              <ul className={styles.list}>
                <li>For any unlawful purpose or to solicit others to perform acts</li>
                <li>
                  To violate any international, federal, provincial, or state regulations, rules, laws, or local
                  ordinances
                </li>
                <li>
                  To infringe upon or violate our intellectual property rights or the intellectual property rights of
                  others
                </li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
              </ul>
            </section>

            <section id="content" className={styles.section}>
              <h2 className={styles.sectionTitle}>08. Content</h2>
              <p className={styles.text}>
                Our service allows you to post, link, store, share and otherwise make available certain information,
                text, graphics, videos, or other material. You are responsible for the content that you post to the
                service, including its legality, reliability, and appropriateness.
              </p>
            </section>

            <section id="privacy-policy" className={styles.section}>
              <h2 className={styles.sectionTitle}>09. Privacy Policy</h2>
              <p className={styles.text}>
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your
                information when you use our service. By using our service, you agree to the collection and use of
                information in accordance with our Privacy Policy.
              </p>
            </section>

            <section id="termination" className={styles.section}>
              <h2 className={styles.sectionTitle}>10. Termination</h2>
              <p className={styles.text}>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason
                whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>

            <section className={styles.contactSection}>
              <h2 className={styles.sectionTitle}>Contact Information</h2>
              <p className={styles.text}>
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <div className={styles.contactInfo}>
                <p>📧 legal@brancy.com</p>
                <p>📱 +1 (555) 123-4567</p>
                <p>📍 123 Business Street, Tech City, TC 12345</p>
              </div>
            </section>
          </div>
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

export default TermsAndConditions;
