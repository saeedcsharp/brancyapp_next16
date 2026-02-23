import React, { useCallback, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "../../i18n";
import AccessibilityHeader from "../../components/Accessibility/AccessibilityHeader";
import SignIn, { RedirectType, SignInType } from "../../components/signIn/signIn";
import styles from "./Product-Updates.module.css";

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
      return {
        ...state,
        language: action.payload,
      };
    default:
      return state;
  }
};
const ProductUpdates: React.FC = () => {
  const { t } = useTranslation();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [themeState, dispatch] = useReducer(themeReducer, {
    themeMode: "",
    darkTheme: undefined,
    language: "",
  });

  const [showSignIn, setShowSignIn] = useState(false);
  const [signInType, setSignInType] = useState(SignInType.Phonenumber);
  const [preUserToken, setPreUserToken] = useState("");

  const removeMask = useCallback(() => {
    setShowSignIn(false);
    setPreUserToken("");
    setSignInType(SignInType.Phonenumber);
  }, []);

  const updates = [
    {
      id: 1,
      title: "Enhanced Search Functionality",
      category: "feature",
      date: "2025-01-20",
      version: "v2.1.0",
      description:
        "We've completely redesigned our search experience with AI-powered suggestions and advanced filtering options.",
      highlights: [
        "AI-powered search suggestions",
        "Advanced filtering and sorting",
        "Faster search results",
        "Voice search capability",
      ],
      image: "🔍",
    },
    {
      id: 2,
      title: "Mobile App Performance Improvements",
      category: "improvement",
      date: "2025-01-15",
      version: "v2.0.5",
      description: "Significant performance optimizations for our mobile application, reducing load times by 40%.",
      highlights: [
        "40% faster app loading",
        "Improved battery efficiency",
        "Smoother animations",
        "Reduced data usage",
      ],
      image: "📱",
    },
    {
      id: 3,
      title: "Security Patch: Enhanced Data Protection",
      category: "security",
      date: "2025-01-10",
      version: "v2.0.4",
      description: "Critical security update implementing advanced encryption and multi-factor authentication.",
      highlights: [
        "End-to-end encryption",
        "Multi-factor authentication",
        "Improved password security",
        "Enhanced data protection",
      ],
      image: "🔒",
    },
    {
      id: 4,
      title: "New Dashboard Analytics",
      category: "feature",
      date: "2025-01-05",
      version: "v2.0.0",
      description: "Introducing comprehensive analytics dashboard with real-time insights and customizable reports.",
      highlights: [
        "Real-time analytics",
        "Customizable dashboards",
        "Export functionality",
        "Advanced reporting tools",
      ],
      image: "📊",
    },
    {
      id: 5,
      title: "Bug Fixes and Stability Improvements",
      category: "bugfix",
      date: "2024-12-28",
      version: "v1.9.8",
      description: "Various bug fixes and stability improvements based on user feedback.",
      highlights: ["Fixed login issues", "Resolved notification bugs", "Improved error handling", "Enhanced stability"],
      image: "🛠️",
    },
    {
      id: 6,
      title: "Dark Mode Support",
      category: "feature",
      date: "2024-12-20",
      version: "v1.9.0",
      description: "Added dark mode support across all platforms with automatic theme switching.",
      highlights: [
        "System theme detection",
        "Manual theme toggle",
        "Reduced eye strain",
        "Battery optimization for OLED screens",
      ],
      image: "🌙",
    },
  ];

  const categories = [
    { id: "all", label: "All Updates", icon: "📋" },
    { id: "feature", label: "New Features", icon: "✨" },
    { id: "improvement", label: "Improvements", icon: "⚡" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "bugfix", label: "Bug Fixes", icon: "🛠️" },
  ];

  const filteredUpdates =
    selectedCategory === "all" ? updates : updates.filter((update) => update.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const colors = {
      feature: "#10b981",
      improvement: "#3b82f6",
      security: "#ef4444",
      bugfix: "#f59e0b",
    };
    return colors[category as keyof typeof colors] || "#6b7280";
  };

  return (
    <>
      <AccessibilityHeader themeState={themeState} dispatch={dispatch} onShowCreateSignIn={() => setShowSignIn(true)} />

      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>{t(LanguageKey.footer_ProductUpdates)}</h1>
          <p className={styles.subtitle}>Stay up to date with the latest features, improvements, and fixes</p>
        </div>

        <div className={styles.content}>
          <div className={styles.filterSection}>
            <h2 className={styles.filterTitle}>Filter by Category</h2>
            <div className={styles.categoryFilters}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`${styles.categoryButton} ${selectedCategory === category.id ? styles.active : ""}`}>
                  <span className={styles.categoryIcon}>{category.icon}</span>
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.updatesGrid}>
            {filteredUpdates.map((update) => (
              <div key={update.id} className={styles.updateCard}>
                <div className={styles.updateHeader}>
                  <div className={styles.updateIcon}>{update.image}</div>
                  <div className={styles.updateMeta}>
                    <div className={styles.updateVersion}>{update.version}</div>
                    <div className={styles.updateDate}>
                      {new Date(update.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <div className={styles.categoryBadge} style={{ backgroundColor: getCategoryColor(update.category) }}>
                    {update.category}
                  </div>
                </div>

                <h3 className={styles.updateTitle}>{update.title}</h3>
                <p className={styles.updateDescription}>{update.description}</p>

                <div className={styles.highlights}>
                  <h4 className={styles.highlightsTitle}>Key Highlights:</h4>
                  <ul className={styles.highlightsList}>
                    {update.highlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.subscriptionSection}>
            <h2 className={styles.subscriptionTitle}>Stay Updated</h2>
            <p className={styles.subscriptionText}>
              Subscribe to our newsletter to receive the latest product updates directly in your inbox.
            </p>
            <div className={styles.subscriptionForm}>
              <input type="email" placeholder="Enter your email address" className={styles.emailInput} />
              <button className={styles.subscribeButton}>Subscribe</button>
            </div>
            <p className={styles.subscriptionNote}>
              You can unsubscribe at any time. We respect your privacy and will never share your email.
            </p>
          </div>

          <div className={styles.feedbackSection}>
            <h2 className={styles.feedbackTitle}>Have Feedback?</h2>
            <p className={styles.feedbackText}>
              We'd love to hear your thoughts on our latest updates. Your feedback helps us improve!
            </p>
            <div className={styles.feedbackButtons}>
              <button className={styles.feedbackButton}>💬 Send Feedback</button>
              <button className={styles.feedbackButton}>🐛 Report a Bug</button>
              <button className={styles.feedbackButton}>💡 Request Feature</button>
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

export default ProductUpdates;
