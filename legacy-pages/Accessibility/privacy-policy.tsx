import Head from "next/head";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import AccessibilityHeader from "brancy/components/Accessibility/AccessibilityHeader";
import SignIn, { RedirectType, SignInType } from "brancy/components/signIn/signIn";
import { LanguageKey } from "brancy/i18n";
import styles from "./privacy-policy.module.css";

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

const PrivacyPolicyPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeSection, setActiveSection] = useState<string>("compliance");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
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

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Close mobile sidebar when section is selected
  const handleSectionClick = (sectionId: string) => {
    scrollToSection(sectionId);
    setIsMobileSidebarOpen(false);
  };

  // Function to handle scroll and update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id], div[id]");
      const scrollPosition = window.scrollY + 150; // Add offset for better UX
      let currentSection = "";

      sections.forEach((section) => {
        const sectionElement = section as HTMLElement;
        const sectionTop = sectionElement.offsetTop;
        const sectionHeight = sectionElement.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSection = sectionElement.getAttribute("id") || "";
        }
      });

      // If we're at the top of the page, set first section as active
      if (window.scrollY < 100) {
        currentSection = "compliance";
      }

      if (currentSection && currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    // Throttle scroll events for better performance
    let timeoutId: NodeJS.Timeout;
    const throttledHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 50);
    };

    // Add scroll listener
    window.addEventListener("scroll", throttledHandleScroll);

    // Initial check
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [activeSection]);

  const sections = [
    {
      id: "compliance",
      title: "🛡️ Compliance",
      subsections: [],
    },
    {
      id: "privacy-policy",
      title: "🛂 Privacy Policy",
      subsections: [
        { id: "who-we-are", title: "1. Who We Are" },
        { id: "information-collect", title: "2. Information We Collect" },
        { id: "how-use-data", title: "3. How We Use Your Data" },
        { id: "sharing-data", title: "4. Sharing Your Data" },
        { id: "facebook-instagram", title: "5. Facebook & Instagram API Use" },
        { id: "cookies", title: "6. Cookies" },
        { id: "your-rights", title: "7. Your Rights" },
        { id: "data-retention", title: "8. Data Retention" },
        { id: "security", title: "9. Security" },
        { id: "policy-updates", title: "10. Updates to This Policy" },
        { id: "contact-us-privacy", title: "11. Contact Us" },
      ],
    },
    {
      id: "data-deletion",
      title: "✅ Data Deletion Instructions",
      subsections: [
        { id: "option-1", title: "Option 1: In-App Deletion" },
        { id: "option-2", title: "Option 2: Manual Request" },
      ],
    },
    {
      id: " terms-conditions",
      title: "ℹ️ Terms and Conditions",
      subsections: [
        { id: "legal-entity", title: "1. Legal Entity" },
        { id: "eligibility", title: "2. Eligibility" },
        { id: "use-services", title: "3. Use of Services" },
        { id: "user-content", title: "4. User Content" },
        { id: "third-party", title: "5. Third-Party Platforms" },
        { id: "data-privacy", title: "6. Data Privacy & Protection" },
        { id: "termination", title: "7. Termination" },
        { id: "liability", title: "8. Limitation of Liability" },
        { id: "changes-terms", title: "9. Changes to Terms" },
        { id: "contact-us", title: "10. Contact Us" },
        { id: "meta-notice", title: "Meta-Specific Notice" },
        { id: "jurisdiction", title: "Jurisdiction" },
      ],
    },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <Head>
        <title>{t(LanguageKey.footer_PrivacyNotice)} - Brancy</title>
        <meta name="description" content="Privacy Policy for Brancy platform" />
        <meta name="keywords" content="privacy, policy, data protection, brancy" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AccessibilityHeader themeState={themeState} dispatch={dispatch} onShowCreateSignIn={handleShowCreateSignIn} />
      <div className={styles.container}>
        <div className={styles.colorring}>
          <img className={styles.colorring1} src="/ring.svg" alt="ring1" />
          <img className={styles.colorring2} src="/ring.svg" alt="ring2" />
          <img className={styles.colorring3} src="/ring.svg" alt="ring3" />
          <img className={styles.colorring4} src="/ring.svg" alt="ring4" />
        </div>
        {/* Mobile Header */}
        <div className={styles.mobileHeader}>
          <button className={styles.backToHome} onClick={() => window.history.back()}>
            <img style={{ cursor: "pointer", width: "30px", height: "30px" }} title="ℹ️ paste" src="/back-box.svg" />{" "}
            Back to Home
          </button>
          <button className={styles.menuButton} onClick={toggleMobileSidebar}>
            <div className={`${styles.hamburgerIcon} ${isMobileSidebarOpen ? styles.open : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

        {/* Mobile Overlay */}
        <div
          className={`${styles.mobileOverlay} ${isMobileSidebarOpen ? styles.open : ""}`}
          onClick={() => setIsMobileSidebarOpen(false)}></div>

        {/* Mobile Sidebar */}
        <div className={`${styles.mobileSidebar} ${isMobileSidebarOpen ? styles.open : ""}`}>
          <h2 className={styles.sidebarTitle}>Table of Contents</h2>
          <nav className={styles.nav}>
            {sections.map((section) => (
              <div key={section.id} className={styles.navSection}>
                <button
                  className={`${styles.navTitle} ${activeSection === section.id ? styles.active : ""}`}
                  onClick={() => handleSectionClick(section.id)}>
                  {section.title}
                </button>
                {section.subsections && section.subsections.length > 0 && (
                  <ul className={styles.navSubsections}>
                    {section.subsections.map((subsection) => (
                      <li key={subsection.id}>
                        <button
                          className={`${styles.navSubtitle} ${activeSection === subsection.id ? styles.active : ""}`}
                          onClick={() => handleSectionClick(subsection.id)}>
                          {subsection.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Left Sidebar - Table of Contents */}
        <div className={styles.sidebar}>
          <button className={styles.backToHomedesktop} onClick={() => window.history.back()}>
            <img style={{ cursor: "pointer", width: "30px", height: "30px" }} title="ℹ️ paste" src="/back-box.svg" />{" "}
            Back to Home
          </button>
          <h2 className={styles.sidebarTitle}>Table of Contents</h2>
          <nav className={styles.nav}>
            {sections.map((section) => (
              <div key={section.id} className={styles.navSection}>
                <button
                  className={`${styles.navTitle} ${activeSection === section.id ? styles.active : ""}`}
                  onClick={() => scrollToSection(section.id)}>
                  {section.title}
                </button>
                {section.subsections && (
                  <ul className={styles.navSubsections}>
                    {section.subsections.map((subsection) => (
                      <li key={subsection.id}>
                        <button
                          className={`${styles.navSubtitle} ${activeSection === subsection.id ? styles.active : ""}`}
                          onClick={() => scrollToSection(subsection.id)}>
                          {subsection.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Right Content Area */}
        <div className={styles.content}>
          <div className={styles.contentWrapper}>
            {/* Compliance Section */}
            <section id="compliance" className={styles.section}>
              <h1 className={styles.mainTitle}>🛡️ Compliance</h1>
              <p className={styles.paragraph}>
                We ensure full compliance with the Meta Developer Policies and UK GDPR.
              </p>
              <p className={styles.paragraph}>User data is never retained beyond what is needed or legally allowed.</p>
            </section>

            {/* Privacy Policy Section */}
            <section id="privacy-policy" className={styles.section}>
              <h1 className={styles.mainTitle}>🛂 Privacy Policy</h1>
              <p className={styles.paragraph}>Last updated: July 7, 2025 </p>
              <p className={styles.paragraph}>
                This Privacy Policy explains how <strong>Brancy Ltd.</strong>, registered in the United Kingdom,
                collects, uses, discloses, and protects your personal information when you use our website or services,
                including integrations with third-party platforms like Facebook and Instagram.
              </p>

              <div id="who-we-are" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>1. Who We Are</h2>
                <ul className={styles.unorderedList}>
                  <li className={styles.listItem}>
                    Company Name: <strong>Brancy Ltd.</strong>
                  </li>
                  <li className={styles.listItem}>
                    Registered Address: <strong>128 City Rd, London EC1V 2NX, UK</strong>
                  </li>
                  <li className={styles.listItem}>
                    Email: <strong>Support@brancy.app</strong>
                  </li>
                </ul>
                <p className={styles.paragraph}>
                  We are committed to complying with the UK General Data Protection Regulation (UK GDPR) and Data
                  Protection Act 2018.
                </p>
              </div>

              <div id="information-collect" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>2. Information We Collect</h2>
                <p className={styles.paragraph}>We may collect the following information:</p>
                <ul className={styles.unorderedList}>
                  <li className={styles.listItem}>Basic user information (name, email, contact number)</li>
                  <li className={styles.listItem}>
                    Facebook/Instagram public profile information (via API, with consent)
                  </li>
                  <li className={styles.listItem}>Usage data (pages visited, clicks, IP address, device type)</li>
                  <li className={styles.listItem}>Cookies and similar tracking technologies</li>
                </ul>
                <p className={styles.paragraph}>
                  We do not collect or store sensitive personal data or login credentials from Facebook or Instagram.
                </p>
              </div>

              <div id="how-use-data" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>3. How We Use Your Data</h2>
                <p className={styles.paragraph}>We use your data to:</p>
                <ul className={styles.unorderedList}>
                  <li className={styles.listItem}>Provide and improve our services</li>
                  <li className={styles.listItem}>Customize user experience</li>
                  <li className={styles.listItem}>Respond to inquiries and support requests</li>
                  <li className={styles.listItem}>Authenticate users via Facebook/Instagram (only with permission)</li>
                  <li className={styles.listItem}>Comply with legal obligations</li>
                </ul>
              </div>

              <div id="sharing-data" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>4. Sharing Your Data</h2>
                <p className={styles.paragraph}>
                  We do not sell, rent, or share your personal data with third parties except:
                </p>
                <ul className={styles.unorderedList}>
                  <li className={styles.listItem}>When required by law</li>
                  <li className={styles.listItem}>When necessary to operate our service (e.g. hosting providers)</li>
                  <li className={styles.listItem}>With your explicit consent</li>
                </ul>
              </div>

              <div id="facebook-instagram" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>5. Facebook & Instagram API Use</h2>
                <p className={styles.paragraph}>When you connect your Facebook or Instagram account:</p>
                <ul className={styles.unorderedList}>
                  <li className={styles.listItem}>We only access the data you authorize via the Meta Graph API</li>
                  <li className={styles.listItem}>Data is used solely for providing the functionality you requested</li>
                  <li className={styles.listItem}>We never post content without your permission</li>
                  <li className={styles.listItem}>Data is stored securely and not shared with third parties</li>
                </ul>
              </div>

              <div id="cookies" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>6. Cookies</h2>
                <p className={styles.paragraph}>Our site uses cookies to:</p>
                <ul className={styles.unorderedList}>
                  <li className={styles.listItem}>Enable core functionality</li>
                  <li className={styles.listItem}>Analyze website usage</li>
                  <li className={styles.listItem}>Improve performance</li>
                </ul>
                <p className={styles.paragraph}>You can manage your cookie preferences in your browser settings.</p>
              </div>

              <div id="your-rights" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>7. Your Rights</h2>
                <p className={styles.paragraph}>You have the right to:</p>
                <ul className={styles.unorderedList}>
                  <li className={styles.listItem}>Access the data we hold about you</li>
                  <li className={styles.listItem}>Request correction or deletion</li>
                  <li className={styles.listItem}>Object to processing</li>
                  <li className={styles.listItem}>Withdraw consent at any time</li>
                </ul>
                <p className={styles.paragraph}>
                  To exercise these rights, contact us at <strong>Support@brancy.app</strong>.
                </p>
              </div>

              <div id="data-retention" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>8. Data Retention</h2>
                <p className={styles.paragraph}>
                  We retain your data only for as long as necessary to fulfill the purposes described above, or as
                  required by law.
                </p>
              </div>

              <div id="security" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>9. Security</h2>
                <p className={styles.paragraph}>
                  We implement appropriate technical and organizational measures to protect your data from unauthorized
                  access, disclosure, or destruction.
                </p>
              </div>

              <div id="policy-updates" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>10. Updates to This Policy</h2>
                <p className={styles.paragraph}>
                  We may update this policy periodically. Updates will be posted on this page with a revised "Last
                  updated" date.
                </p>
              </div>

              <div id="contact-us-privacy" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>11. Contact Us</h2>
                <p className={styles.paragraph}>For questions about this policy, or to make a data request:</p>
                <ul className={styles.unorderedList}>
                  <li className={styles.listItem}>
                    Email: <strong>Support@brancy.app</strong>
                  </li>
                  <li className={styles.listItem}>
                    Phone: <strong>+447767661603</strong>
                  </li>
                </ul>
              </div>
            </section>

            {/* Data Deletion Section */}
            <section id="data-deletion" className={styles.section}>
              <h1 className={styles.mainTitle}>✅ Data Deletion Instructions</h1>
              <p className={styles.paragraph}>Last updated: July 7, 2025</p>
              <p className={styles.paragraph}>
                In compliance with Meta's Data Deletion Policy, we provide users with clear instructions on how to
                request the deletion of their data collected through Facebook or Instagram integrations.
              </p>
              <p className={styles.paragraph}>
                If you wish to delete your data associated with your Facebook or Instagram account, follow these steps:
              </p>

              <div id="option-1" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>Option 1: In-App Deletion</h2>
                <p className={styles.paragraph}>If our app or platform provides an account deletion feature:</p>
                <ol className={styles.orderedList}>
                  <li className={styles.listItem}>
                    Log into your account on<strong>Brancy Ltd.</strong>
                  </li>
                  <li className={styles.listItem}>Go to Settings &gt; Privacy or Account &gt; Delete Account.</li>
                  <li className={styles.listItem}>
                    Confirm deletion. All associated Facebook/Instagram data will be removed.
                  </li>
                </ol>
              </div>

              <div id="option-2" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>Option 2: Manual Request</h2>
                <p className={styles.paragraph}>If you prefer manual removal:</p>
                <ol className={styles.orderedList}>
                  <li className={styles.listItem}>
                    Send an email to <strong>Support@brancy.app</strong> with the subject "Data Deletion Request".
                  </li>
                  <li className={styles.listItem}>
                    Include the following information:
                    <ul className={styles.unorderedList}>
                      <li className={styles.listItem}>Full Name</li>
                      <li className={styles.listItem}>Facebook/Instagram User ID (if available)</li>
                      <li className={styles.listItem}>Email linked to the account</li>
                    </ul>
                  </li>
                </ol>
                <p className={styles.paragraph}>
                  Our team will process your request within 7 business days, and all related data will be permanently
                  deleted from our servers.
                </p>
              </div>
            </section>

            <section id="terms-conditions" className={styles.section}>
              <h1 className={styles.mainTitle}>ℹ️ Terms and Conditions</h1>
              <p className={styles.paragraph}>
                <strong>Last updated:</strong> July 7, 2025
              </p>
              <p className={styles.paragraph}>
                Welcome to <strong>Brancy Ltd.</strong> ("we", "our", "us"). These Terms and Conditions govern your
                access to and use of our website and services. By using our platform, you agree to comply with and be
                bound by the following terms. If you do not agree, please do not use our services.
              </p>

              <div id="legal-entity" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>1. Legal Entity</h2>
                <p className={styles.paragraph}>
                  <strong>Brancy Ltd.</strong> is owned and operated by <strong>Brancy Ltd.</strong>, a company
                  registered in England and Wales under registration number <strong>+447767661603</strong>, with its
                  registered office at <strong>128 City Rd, London EC1V 2NX, UK</strong>.
                </p>
              </div>

              <div id="eligibility" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>2. Eligibility</h2>
                <p className={styles.paragraph}>
                  You must be at least 13 years old to use our services. By accessing our services, you confirm that you
                  meet the legal age requirement and that the information you provide is accurate and truthful.
                </p>
              </div>

              <div id="use-services" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>3. Use of Services</h2>
                <p className={styles.paragraph}>
                  You agree to use our platform in accordance with all applicable laws and not to:
                </p>
                <ul className={styles.unorderedList}>
                  <li className={styles.listItem}>
                    Violate any local, national, or international laws or regulations.
                  </li>
                  <li className={styles.listItem}>
                    Infringe upon the rights of others, including data protection and privacy rights.
                  </li>
                  <li className={styles.listItem}>Use our services for any unauthorized or illegal purposes.</li>
                </ul>
              </div>

              <div id="user-content" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>4. User Content</h2>
                <p className={styles.paragraph}>
                  You retain ownership of the content you create, post, or share through our services. However, by doing
                  so, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your
                  content in connection with operating and improving our services.
                </p>
              </div>

              <div id="third-party" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>5. Third-Party Platforms</h2>
                <p className={styles.paragraph}>
                  Our platform may interact with third-party services including but not limited to Facebook, Instagram,
                  and other Meta products. You acknowledge and agree that:
                </p>
                <ul className={styles.unorderedList}>
                  <li className={styles.listItem}>
                    We comply with Facebook Platform Policies and Meta's Developer Policies.
                  </li>
                  <li className={styles.listItem}>
                    We do not store or misuse any user data fetched from Facebook or Instagram APIs.
                  </li>
                  <li className={styles.listItem}>
                    You are responsible for your compliance with Facebook and Instagram Terms of Use.
                  </li>
                </ul>
              </div>

              <div id="data-privacy" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>6. Data Privacy & Protection</h2>
                <p className={styles.paragraph}>
                  We are fully compliant with UK GDPR and Data Protection Act 2018. To understand how we collect, use,
                  and protect your personal data, please refer to our Privacy Policy.
                </p>
                <p className={styles.paragraph}>By using our platform, you consent to:</p>
                <ul className={styles.unorderedList}>
                  <li className={styles.listItem}>
                    The collection and processing of your personal data as outlined in our privacy policy.
                  </li>
                  <li className={styles.listItem}>
                    Our use of cookies for functionality, analytics, and marketing purposes.
                  </li>
                </ul>
                <p className={styles.paragraph}>
                  We do not share user data with third parties without explicit user consent, and all data interactions
                  with Facebook/Instagram APIs are handled securely and in compliance with Meta's policies.
                </p>
              </div>

              <div id="termination" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>7. Termination</h2>
                <p className={styles.paragraph}>
                  We reserve the right to terminate or suspend access to our services immediately, without prior notice,
                  for conduct that we believe violates these Terms and Conditions or is harmful to other users or us.
                </p>
              </div>

              <div id="liability" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>8. Limitation of Liability</h2>
                <p className={styles.paragraph}>
                  To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special,
                  or consequential damages arising from your use of our services.
                </p>
              </div>

              <div id="changes-terms" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>9. Changes to Terms</h2>
                <p className={styles.paragraph}>
                  We may revise these terms at any time. Continued use of our services after changes become effective
                  constitutes your acceptance of the new terms.
                </p>
              </div>

              <div id="contact-us" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>10. Contact Us</h2>
                <p className={styles.paragraph}>If you have any questions about these Terms, please contact us at:</p>
                <ul className={styles.unorderedList}>
                  <li className={styles.listItem}>
                    <strong>Company Name:</strong> <strong>Brancy Ltd.</strong>
                  </li>
                  <li className={styles.listItem}>
                    <strong>Registered Address:</strong> <strong>128 City Rd, London EC1V 2NX, UK</strong>
                  </li>
                  <li className={styles.listItem}>
                    <strong>Email:</strong> <strong>Support@brancy.app</strong>
                  </li>
                  <li className={styles.listItem}>
                    <strong>Phone:</strong> <strong>+447767661603</strong>
                  </li>
                </ul>
              </div>

              <div id="meta-notice" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>Meta-Specific Notice</h2>
                <p className={styles.paragraph}>We acknowledge and agree that:</p>
                <ul className={styles.unorderedList}>
                  <li className={styles.listItem}>
                    Our platform uses Facebook and Instagram APIs in compliance with the Meta Platform Terms and
                    Developer Policies.
                  </li>
                  <li className={styles.listItem}>
                    We provide a clear Privacy Policy, Terms & Conditions, and Data Deletion Instructions publicly
                    available on our website.
                  </li>
                  <li className={styles.listItem}>
                    We do not use user data fetched from Meta for any unauthorized purposes or share it with third
                    parties.
                  </li>
                </ul>
              </div>

              <div id="jurisdiction" className={styles.subsection}>
                <h2 className={styles.sectionTitle}>Jurisdiction</h2>
                <p className={styles.paragraph}>
                  These Terms and Conditions are governed by the laws of England and Wales, and any disputes shall be
                  subject to the exclusive jurisdiction of its courts.
                </p>
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

export default PrivacyPolicyPage;
