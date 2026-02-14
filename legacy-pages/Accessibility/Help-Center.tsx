import Head from "next/head";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import SignIn, { RedirectType, SignInType } from "saeed/components/signIn/signIn";
import { LanguageKey } from "saeed/i18n";
import AccessibilityHeader from "../../components/Accessibility/AccessibilityHeader";
import styles from "./Help-Center.module.css";

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

const HelpCenter: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInType, setSignInType] = useState(SignInType.Phonenumber);
  const [preUserToken, setPreUserToken] = useState("");
  const [hasMounted, setHasMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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

  const helpCategories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: "🚀",
      description: "New to Brancy? Learn the basics and get up to speed quickly.",
      articles: [
        {
          title: "How to Create Your First Account",
          description: "Step-by-step guide to setting up your Brancy account",
          readTime: "3 min",
          difficulty: "Beginner",
        },
        {
          title: "Understanding the Dashboard",
          description: "Navigate your way around the main dashboard features",
          readTime: "5 min",
          difficulty: "Beginner",
        },
        {
          title: "Setting Up Your Profile",
          description: "Complete your profile for better visibility and trust",
          readTime: "4 min",
          difficulty: "Beginner",
        },
      ],
    },
    {
      id: "selling",
      title: "Selling on Brancy",
      icon: "💰",
      description: "Everything you need to know about selling products and services.",
      articles: [
        {
          title: "How to List Your First Product",
          description: "Create compelling product listings that attract buyers",
          readTime: "8 min",
          difficulty: "Beginner",
        },
        {
          title: "Pricing Strategies That Work",
          description: "Learn how to price your products competitively",
          readTime: "10 min",
          difficulty: "Intermediate",
        },
        {
          title: "Managing Orders and Inventory",
          description: "Keep track of your sales and stock levels efficiently",
          readTime: "12 min",
          difficulty: "Intermediate",
        },
      ],
    },
    {
      id: "buying",
      title: "Buying Guide",
      icon: "🛒",
      description: "Tips and tricks for finding great deals and making secure purchases.",
      articles: [
        {
          title: "How to Search and Find Products",
          description: "Use our advanced search features to find exactly what you need",
          readTime: "6 min",
          difficulty: "Beginner",
        },
        {
          title: "Making Safe Purchases",
          description: "Protect yourself when buying from other users",
          readTime: "7 min",
          difficulty: "Beginner",
        },
        {
          title: "Understanding Seller Ratings",
          description: "How to evaluate sellers and read reviews effectively",
          readTime: "5 min",
          difficulty: "Beginner",
        },
      ],
    },
    {
      id: "payment",
      title: "Payment & Billing",
      icon: "💳",
      description: "Payment methods, billing questions, and transaction support.",
      articles: [
        {
          title: "Supported Payment Methods",
          description: "All the ways you can pay and get paid on Brancy",
          readTime: "4 min",
          difficulty: "Beginner",
        },
        {
          title: "Understanding Transaction Fees",
          description: "Breakdown of all fees and charges on the platform",
          readTime: "6 min",
          difficulty: "Intermediate",
        },
        {
          title: "Refunds and Dispute Resolution",
          description: "What to do when transactions don't go as planned",
          readTime: "9 min",
          difficulty: "Intermediate",
        },
      ],
    },
    {
      id: "security",
      title: "Security & Privacy",
      icon: "🔒",
      description: "Keep your account safe and protect your personal information.",
      articles: [
        {
          title: "Account Security Best Practices",
          description: "Tips to keep your account secure from unauthorized access",
          readTime: "7 min",
          difficulty: "Intermediate",
        },
        {
          title: "Two-Factor Authentication Setup",
          description: "Add an extra layer of security to your account",
          readTime: "5 min",
          difficulty: "Beginner",
        },
        {
          title: "Privacy Settings Guide",
          description: "Control what information you share and with whom",
          readTime: "6 min",
          difficulty: "Beginner",
        },
      ],
    },
    {
      id: "technical",
      title: "Technical Issues",
      icon: "🔧",
      description: "Troubleshooting common technical problems and errors.",
      articles: [
        {
          title: "Common Login Issues",
          description: "Solutions for when you can't access your account",
          readTime: "4 min",
          difficulty: "Beginner",
        },
        {
          title: "Mobile App Troubleshooting",
          description: "Fix common problems with the mobile application",
          readTime: "8 min",
          difficulty: "Intermediate",
        },
        {
          title: "Browser Compatibility Issues",
          description: "Ensure optimal performance across different browsers",
          readTime: "6 min",
          difficulty: "Intermediate",
        },
      ],
    },
  ];

  const popularQuestions = [
    {
      question: "How do I reset my password?",
      answer:
        "You can reset your password by clicking 'Forgot Password' on the login page and following the instructions sent to your email.",
    },
    {
      question: "What are the seller fees?",
      answer:
        "We charge a 3% transaction fee on successful sales, plus payment processing fees which vary by payment method.",
    },
    {
      question: "How long does it take to get paid?",
      answer: "Payments are typically processed within 2-3 business days after the buyer confirms receipt of the item.",
    },
    {
      question: "Can I cancel an order?",
      answer: "Orders can be cancelled within 24 hours of placement if the seller hasn't shipped the item yet.",
    },
  ];

  const filteredCategories =
    selectedCategory === "all" ? helpCategories : helpCategories.filter((category) => category.id === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      Beginner: "#10b981",
      Intermediate: "#f59e0b",
      Advanced: "#ef4444",
    };
    return colors[difficulty as keyof typeof colors] || "#6b7280";
  };

  if (!hasMounted) return null;

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Help Center | Brancy</title>
        <meta name="description" content="Find answers to your questions and get help with Brancy" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/Accessibility/Help-Center" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="touch-action" content="manipulation" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Head>

      <AccessibilityHeader themeState={themeState} dispatch={dispatch} onShowCreateSignIn={handleShowCreateSignIn} />

      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>{t(LanguageKey.footer_HelpCenter)}</h1>
          <p className={styles.subtitle}>
            Find answers to your questions and get the help you need to succeed on Brancy
          </p>

          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <button className={styles.searchButton}>🔍</button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.quickHelp}>
            <h2 className={styles.sectionTitle}>Popular Questions</h2>
            <div className={styles.questionsGrid}>
              {popularQuestions.map((item, index) => (
                <div key={index} className={styles.questionCard}>
                  <h3 className={styles.questionTitle}>{item.question}</h3>
                  <p className={styles.questionAnswer}>{item.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.categoriesSection}>
            <h2 className={styles.sectionTitle}>Browse Help Topics</h2>

            <div className={styles.categoryFilter}>
              <button
                onClick={() => setSelectedCategory("all")}
                className={`${styles.filterButton} ${selectedCategory === "all" ? styles.active : ""}`}>
                All Categories
              </button>
              {helpCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`${styles.filterButton} ${selectedCategory === category.id ? styles.active : ""}`}>
                  {category.icon} {category.title}
                </button>
              ))}
            </div>

            <div className={styles.categoriesGrid}>
              {filteredCategories.map((category) => (
                <div key={category.id} className={styles.categoryCard}>
                  <div className={styles.categoryHeader}>
                    <div className={styles.categoryIcon}>{category.icon}</div>
                    <div>
                      <h3 className={styles.categoryTitle}>{category.title}</h3>
                      <p className={styles.categoryDescription}>{category.description}</p>
                    </div>
                  </div>

                  <div className={styles.articlesList}>
                    {category.articles.map((article, index) => (
                      <div key={index} className={styles.articleItem}>
                        <div className={styles.articleInfo}>
                          <h4 className={styles.articleTitle}>{article.title}</h4>
                          <p className={styles.articleDescription}>{article.description}</p>
                        </div>
                        <div className={styles.articleMeta}>
                          <span className={styles.readTime}>{article.readTime}</span>
                          <span
                            className={styles.difficulty}
                            style={{
                              backgroundColor: getDifficultyColor(article.difficulty),
                            }}>
                            {article.difficulty}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.contactSection}>
            <h2 className={styles.contactTitle}>Still Need Help?</h2>
            <p className={styles.contactText}>
              Can't find what you're looking for? Our support team is here to help you succeed.
            </p>
            <div className={styles.contactOptions}>
              <div className={styles.contactOption}>
                <div className={styles.contactIcon}>💬</div>
                <h3>Live Chat</h3>
                <p>Chat with our support team in real-time</p>
                <button className={styles.contactButton}>Start Chat</button>
              </div>
              <div className={styles.contactOption}>
                <div className={styles.contactIcon}>📧</div>
                <h3>Email Support</h3>
                <p>Send us a detailed message about your issue</p>
                <button className={styles.contactButton}>Send Email</button>
              </div>
              <div className={styles.contactOption}>
                <div className={styles.contactIcon}>📞</div>
                <h3>Phone Support</h3>
                <p>Call us for urgent issues (Mon-Fri, 9AM-6PM)</p>
                <button className={styles.contactButton}>Call Now</button>
              </div>
            </div>
          </div>

          <div className={styles.resourcesSection}>
            <h2 className={styles.resourcesTitle}>Additional Resources</h2>
            <div className={styles.resourcesGrid}>
              <div className={styles.resourceCard}>
                <div className={styles.resourceIcon}>📚</div>
                <h3>User Guide</h3>
                <p>Comprehensive guide covering all platform features</p>
                <button className={styles.resourceButton}>Download PDF</button>
              </div>
              <div className={styles.resourceCard}>
                <div className={styles.resourceIcon}>🎥</div>
                <h3>Video Tutorials</h3>
                <p>Step-by-step video guides for visual learners</p>
                <button className={styles.resourceButton}>Watch Videos</button>
              </div>
              <div className={styles.resourceCard}>
                <div className={styles.resourceIcon}>👥</div>
                <h3>Community Forum</h3>
                <p>Connect with other users and share experiences</p>
                <button className={styles.resourceButton}>Join Forum</button>
              </div>
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

export default HelpCenter;
