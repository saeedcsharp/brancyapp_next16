import Head from "next/head";
import { useCallback, useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import AccessibilityHeader from "brancy/components/Accessibility/AccessibilityHeader";
import { LanguageKey } from "brancy/i18n";
import SignIn, { RedirectType, SignInType } from "brancy/components/signIn/signIn";
import styles from "./FAQ.module.css";

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

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

const FAQ = () => {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
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

  const categories: Category[] = [
    { id: "all", name: t(LanguageKey.allCategories) || "All Categories", icon: "📂" },
    { id: "financial", name: t(LanguageKey.financial) || "Financial", icon: "💰" },
    { id: "account", name: t(LanguageKey.account) || "Account & Profile", icon: "👤" },
    { id: "payments", name: t(LanguageKey.payments) || "Payments & Billing", icon: "💳" },
    { id: "security", name: t(LanguageKey.security) || "Security & Privacy", icon: "🔒" },
    { id: "features", name: t(LanguageKey.features) || "Features & Usage", icon: "⚙️" },
    { id: "technical", name: t(LanguageKey.technical) || "Technical Issues", icon: "🔧" },
  ];

  const faqItems: FAQItem[] = [
    {
      id: "financial-1",
      category: "financial",
      question: t(LanguageKey.faq_q1) || "What is the difference between needs and wants in the context of shopping?",
      answer:
        t(LanguageKey.faq_a1) ||
        "Do you still think Instagram hashtags are a walkover? Well, you may be treading a tightrope. Before you go for it, make sure everything is in balance. Creative, yet unpopular hashtags aren't worth the effort.",
    },
    {
      id: "financial-2",
      category: "financial",
      question: t(LanguageKey.faq_q2) || "What is the significance of understanding consumer behavior in shopping?",
      answer:
        t(LanguageKey.faq_a2) ||
        "Understanding consumer behavior helps businesses create better products and marketing strategies that resonate with their target audience.",
    },
    {
      id: "financial-3",
      category: "financial",
      question: t(LanguageKey.faq_q3) || "How do personal factors play a role in shaping shopping behavior?",
      answer:
        t(LanguageKey.faq_a3) ||
        "Personal factors such as age, income, lifestyle, and personal preferences significantly influence shopping decisions and purchasing patterns.",
    },
    {
      id: "financial-4",
      category: "financial",
      question:
        t(LanguageKey.faq_q4) || "How do consumers assess and compare different options during the shopping process?",
      answer:
        t(LanguageKey.faq_a4) ||
        "Consumers typically evaluate products based on price, quality, features, brand reputation, and reviews from other customers.",
    },
    {
      id: "financial-5",
      category: "financial",
      question:
        t(LanguageKey.faq_q5) ||
        "What is the post-purchase evaluation and how does it influence future buying behavior?",
      answer:
        t(LanguageKey.faq_a5) ||
        "Post-purchase evaluation involves assessing satisfaction with the purchase, which directly impacts brand loyalty and future purchasing decisions.",
    },
    {
      id: "account-1",
      category: "account",
      question: t(LanguageKey.faq_account_q1) || "How do I create a new account?",
      answer:
        t(LanguageKey.faq_account_a1) ||
        'Creating an account is simple! Click the "Sign Up" button in the top right corner, enter your email address, create a secure password, and verify your email. You\'ll be ready to start using Brancy in minutes.',
    },
    {
      id: "account-2",
      category: "account",
      question: t(LanguageKey.faq_account_q2) || "How can I reset my password?",
      answer:
        t(LanguageKey.faq_account_a2) ||
        "If you've forgotten your password, click \"Forgot Password\" on the login page. Enter your email address, and we'll send you a secure reset link. Follow the instructions in the email to create a new password.",
    },
    {
      id: "payments-1",
      category: "payments",
      question: t(LanguageKey.faq_payments_q1) || "What payment methods do you accept?",
      answer:
        t(LanguageKey.faq_payments_a1) ||
        "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, bank transfers, and digital wallets like Apple Pay and Google Pay. All payments are processed securely through encrypted connections.",
    },
    {
      id: "security-1",
      category: "security",
      question: t(LanguageKey.faq_security_q1) || "How secure is my data?",
      answer:
        t(LanguageKey.faq_security_a1) ||
        "Your data security is our top priority. We use industry-standard encryption, secure data centers, regular security audits, and comply with international privacy standards including GDPR and CCPA.",
    },
    {
      id: "features-1",
      category: "features",
      question: t(LanguageKey.faq_features_q1) || "How do I invite team members?",
      answer:
        t(LanguageKey.faq_features_a1) ||
        'To invite team members, go to your workspace settings and click "Invite Members." Enter their email addresses and select their permission level. They\'ll receive an invitation email to join your workspace.',
    },
    {
      id: "technical-1",
      category: "technical",
      question: t(LanguageKey.faq_technical_q1) || "The app is running slowly. What should I do?",
      answer:
        t(LanguageKey.faq_technical_a1) ||
        "Slow performance can be caused by several factors. Try clearing your browser cache, disabling browser extensions, checking your internet connection, or using an incognito/private browsing window. If issues persist, contact support.",
    },
  ];

  const filteredFAQs = faqItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      searchTerm === "" ||
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (itemId: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId);
    } else {
      newOpenItems.add(itemId);
    }
    setOpenItems(newOpenItems);
  };

  const expandAll = () => {
    const allIds = new Set(filteredFAQs.map((item) => item.id));
    setOpenItems(allIds);
  };

  const collapseAll = () => {
    setOpenItems(new Set());
  };

  return (
    <>
      <Head>
        <title>{t(LanguageKey.faq)} - Brancy</title>
        <meta name="description" content={t(LanguageKey.faqDescription)} />
        <meta name="keywords" content={t(LanguageKey.faqKeywords)} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AccessibilityHeader themeState={themeState} dispatch={dispatch} onShowCreateSignIn={handleShowCreateSignIn} />
      <div className={styles.container}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <h1 className={styles.title}>{t(LanguageKey.footer_FAQ) || "FAQ"}</h1>
          <p className={styles.subtitle}>{t(LanguageKey.page8_FAQExplain) || "All Questions"}</p>
        </div>

        {/* Search Bar */}
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder={t(LanguageKey.searchFAQ) || "write a question or problem"}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Categories */}
        <div className={styles.categoriesSection}>
          <div className={styles.categories}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`${styles.categoryButton} ${activeCategory === category.id ? styles.categoryActive : ""}`}>
                <span className={styles.categoryIcon}>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.controlsLeft}>
            <span className={styles.resultsCount}>
              {filteredFAQs.length} {t(LanguageKey.questionsFound) || "questions found"}
            </span>
          </div>
          <div className={styles.controlsRight}>
            <button onClick={expandAll} className={styles.controlButton}>
              {t(LanguageKey.expandAll) || "Expand All"}
            </button>
            <button onClick={collapseAll} className={styles.controlButton}>
              {t(LanguageKey.collapseAll) || "Collapse All"}
            </button>
          </div>
        </div>

        {/* FAQ Items */}
        <div className={styles.faqSection}>
          {filteredFAQs.length === 0 ? (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>❓</div>
              <h3>{t(LanguageKey.noQuestionsFound) || "No questions found"}</h3>
              <p>{t(LanguageKey.tryAdjustingSearch) || "Try adjusting your search terms or category filter."}</p>
            </div>
          ) : (
            <div className={styles.faqList}>
              {filteredFAQs.map((item) => {
                const isOpen = openItems.has(item.id);
                const categoryInfo = categories.find((cat) => cat.id === item.category);

                return (
                  <div key={item.id} className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}>
                    <button onClick={() => toggleItem(item.id)} className={styles.faqQuestion}>
                      <div className={styles.questionContent}>
                        <div className={styles.questionHeader}>
                          <span className={styles.categoryTag}>
                            {categoryInfo?.icon} {categoryInfo?.name}
                          </span>
                        </div>
                        <h3 className={styles.questionText}>{item.question}</h3>
                      </div>
                      <span className={`${styles.toggleIcon} ${isOpen ? styles.toggleIconRotated : ""}`}>▼</span>
                    </button>
                    <div className={`${styles.faqAnswer} ${isOpen ? styles.faqAnswerExpanded : ""}`}>
                      <p>{item.answer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className={styles.contactSection}>
          <h2 className={styles.contactTitle}>{t(LanguageKey.stillHaveQuestions) || "Still have questions?"}</h2>
          <p className={styles.contactDescription}>
            {t(LanguageKey.supportTeamHelp) ||
              "Our support team is here to help you with any questions not covered in our FAQ."}
          </p>
          <div className={styles.contactButtons}>
            <button className={styles.contactButton}>
              <span className={styles.buttonIcon}>💬</span>
              {t(LanguageKey.startLiveChat) || "Start Live Chat"}
            </button>
            <button className={styles.contactButton}>
              <span className={styles.buttonIcon}>📧</span>
              {t(LanguageKey.sendEmail) || "Send Email"}
            </button>
            <button className={styles.contactButton}>
              <span className={styles.buttonIcon}>📞</span>
              {t(LanguageKey.callSupport) || "Call Support"}
            </button>
          </div>
        </div>

        {/* Popular Topics */}
        <div className={styles.popularSection}>
          <h2 className={styles.popularTitle}>{t(LanguageKey.popularHelpTopics) || "Popular Help Topics"}</h2>
          <div className={styles.topicsGrid}>
            <div className={styles.topicCard}>
              <div className={styles.topicIcon}>🚀</div>
              <h3>{t(LanguageKey.gettingStarted) || "Getting Started"}</h3>
              <p>{t(LanguageKey.gettingStartedDesc) || "Learn the basics of using Brancy"}</p>
              <button className={styles.topicButton}>{t(LanguageKey.viewGuide) || "View Guide"}</button>
            </div>
            <div className={styles.topicCard}>
              <div className={styles.topicIcon}>👥</div>
              <h3>{t(LanguageKey.teamManagement) || "Team Management"}</h3>
              <p>{t(LanguageKey.teamManagementDesc) || "Invite and manage team members"}</p>
              <button className={styles.topicButton}>{t(LanguageKey.viewGuide) || "View Guide"}</button>
            </div>
            <div className={styles.topicCard}>
              <div className={styles.topicIcon}>🔧</div>
              <h3>{t(LanguageKey.integrations) || "Integrations"}</h3>
              <p>{t(LanguageKey.integrationsDesc) || "Connect your favorite tools"}</p>
              <button className={styles.topicButton}>{t(LanguageKey.viewGuide) || "View Guide"}</button>
            </div>
            <div className={styles.topicCard}>
              <div className={styles.topicIcon}>📊</div>
              <h3>{t(LanguageKey.analytics) || "Analytics"}</h3>
              <p>{t(LanguageKey.analyticsDesc) || "Understanding your data"}</p>
              <button className={styles.topicButton}>{t(LanguageKey.viewGuide) || "View Guide"}</button>
            </div>
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

export default FAQ;
