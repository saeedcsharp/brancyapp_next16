import React, { useCallback, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import AccessibilityHeader from "brancy/components/Accessibility/AccessibilityHeader";
import SignIn, { RedirectType, SignInType } from "brancy/components/signIn/signIn";
import styles from "./Latest-news.module.css";

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
const LatestNews: React.FC = () => {
  const { t } = useTranslation();

  const [selectedFilter, setSelectedFilter] = useState<string>("all");

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

  const newsItems = [
    {
      id: 1,
      headline: "Brancy Launches Revolutionary AI-Powered Recommendation Engine",
      category: "product",
      date: "2025-01-25",
      readTime: "3 min read",
      summary: "Our new AI system increases user engagement by 45% and helps sellers reach more targeted customers.",
      content:
        "Today we're excited to announce the launch of our advanced AI-powered recommendation engine that transforms how users discover products on our platform...",
      image: "🤖",
      tags: ["AI", "Innovation", "Product Launch"],
      priority: "high",
    },
    {
      id: 2,
      headline: "Brancy Achieves Carbon Neutral Status Across All Operations",
      category: "company",
      date: "2025-01-23",
      readTime: "4 min read",
      summary:
        "We're proud to announce our commitment to environmental sustainability with 100% carbon neutral operations.",
      content:
        "Environmental responsibility is at the core of our values. After 18 months of dedicated effort, we've achieved carbon neutrality...",
      image: "🌍",
      tags: ["Sustainability", "Environment", "CSR"],
      priority: "medium",
    },
    {
      id: 3,
      headline: "Security Enhancement: Advanced Fraud Detection System Deployed",
      category: "security",
      date: "2025-01-20",
      readTime: "2 min read",
      summary: "New machine learning algorithms detect and prevent fraudulent activities with 99.7% accuracy.",
      content:
        "User security is our top priority. Our latest fraud detection system uses advanced machine learning to identify suspicious patterns...",
      image: "🛡️",
      tags: ["Security", "Machine Learning", "Protection"],
      priority: "high",
    },
    {
      id: 4,
      headline: "Partnership Announcement: Integration with Global Payment Providers",
      category: "partnership",
      date: "2025-01-18",
      readTime: "5 min read",
      summary: "Strategic partnerships with leading payment providers enable seamless transactions in 150+ countries.",
      content:
        "We're thrilled to announce our strategic partnerships with major global payment providers, expanding our reach to over 150 countries...",
      image: "🤝",
      tags: ["Partnership", "Global Expansion", "Payments"],
      priority: "medium",
    },
    {
      id: 5,
      headline: "Q4 2024 Financial Results: Record Growth and User Acquisition",
      category: "financial",
      date: "2025-01-15",
      readTime: "6 min read",
      summary: "Strong Q4 performance with 78% revenue growth and 2.5 million new users joining the platform.",
      content:
        "We're pleased to share our Q4 2024 results, marking another quarter of exceptional growth and user engagement...",
      image: "📊",
      tags: ["Financial Results", "Growth", "Quarterly Report"],
      priority: "medium",
    },
    {
      id: 6,
      headline: "Mobile App Update: Enhanced User Interface and Performance",
      category: "product",
      date: "2025-01-12",
      readTime: "3 min read",
      summary: "Latest mobile app update delivers 40% faster loading times and an intuitive new design.",
      content:
        "Our development team has been working tirelessly to improve the mobile experience. The latest update includes...",
      image: "📱",
      tags: ["Mobile", "UI/UX", "Performance"],
      priority: "low",
    },
    {
      id: 7,
      headline: "Community Initiative: Supporting Local Small Businesses",
      category: "community",
      date: "2025-01-10",
      readTime: "4 min read",
      summary: "New program provides free marketplace access and marketing support to local small businesses.",
      content:
        "Supporting small businesses is essential for healthy economic growth. Our new community initiative offers...",
      image: "🏪",
      tags: ["Community", "Small Business", "Support"],
      priority: "medium",
    },
    {
      id: 8,
      headline: "Industry Recognition: Named Best Digital Marketplace Platform 2024",
      category: "awards",
      date: "2025-01-08",
      readTime: "2 min read",
      summary: "Brancy receives prestigious industry award for innovation and user experience excellence.",
      content:
        "We're honored to receive the 'Best Digital Marketplace Platform 2024' award from the Digital Commerce Association...",
      image: "🏆",
      tags: ["Awards", "Recognition", "Industry"],
      priority: "low",
    },
  ];

  const categories = [
    { id: "all", label: "All News", icon: "📰" },
    { id: "product", label: "Product Updates", icon: "🚀" },
    { id: "company", label: "Company News", icon: "🏢" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "partnership", label: "Partnerships", icon: "🤝" },
    { id: "financial", label: "Financial", icon: "💰" },
    { id: "community", label: "Community", icon: "👥" },
    { id: "awards", label: "Awards", icon: "🏆" },
  ];

  const filteredNews =
    selectedFilter === "all" ? newsItems : newsItems.filter((item) => item.category === selectedFilter);

  const getCategoryColor = (category: string) => {
    const colors = {
      product: "#3b82f6",
      company: "#10b981",
      security: "#ef4444",
      partnership: "#8b5cf6",
      financial: "#f59e0b",
      community: "#06b6d4",
      awards: "#f97316",
    };
    return colors[category as keyof typeof colors] || "#6b7280";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "#ef4444",
      medium: "#f59e0b",
      low: "#10b981",
    };
    return colors[priority as keyof typeof colors] || "#6b7280";
  };

  return (
    <>
      <AccessibilityHeader themeState={themeState} dispatch={dispatch} onShowCreateSignIn={() => setShowSignIn(true)} />

      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>{t(LanguageKey.footer_LatestNews)}</h1>
          <p className={styles.subtitle}>
            Stay informed with the latest updates, announcements, and developments from Brancy
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.filterSection}>
            <h2 className={styles.filterTitle}>Filter by Category</h2>
            <div className={styles.categoryFilters}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedFilter(category.id)}
                  className={`${styles.categoryButton} ${selectedFilter === category.id ? styles.active : ""}`}>
                  <span className={styles.categoryIcon}>{category.icon}</span>
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.newsGrid}>
            {filteredNews.map((news, index) => (
              <article key={news.id} className={`${styles.newsCard} ${index === 0 ? styles.featured : ""}`}>
                <div className={styles.newsHeader}>
                  <div className={styles.newsIcon}>{news.image}</div>
                  <div className={styles.newsMeta}>
                    <div className={styles.categoryBadge} style={{ backgroundColor: getCategoryColor(news.category) }}>
                      {news.category}
                    </div>
                    <div className={styles.priorityBadge} style={{ backgroundColor: getPriorityColor(news.priority) }}>
                      {news.priority}
                    </div>
                  </div>
                </div>

                <h3 className={styles.newsHeadline}>{news.headline}</h3>
                <p className={styles.newsSummary}>{news.summary}</p>

                <div className={styles.newsInfo}>
                  <div className={styles.dateInfo}>
                    <span className={styles.date}>
                      {new Date(news.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className={styles.readTime}>{news.readTime}</span>
                  </div>
                </div>

                <div className={styles.tags}>
                  {news.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>

                <button className={styles.readMoreButton}>Read Full Story →</button>
              </article>
            ))}
          </div>

          <div className={styles.pressSection}>
            <h2 className={styles.pressTitle}>Press & Media</h2>
            <p className={styles.pressText}>
              For press inquiries, media kits, and official statements, please contact our press team.
            </p>
            <div className={styles.pressButtons}>
              <button className={styles.pressButton}>📎 Download Media Kit</button>
              <button className={styles.pressButton}>📧 Contact Press Team</button>
              <button className={styles.pressButton}>📋 View Press Releases</button>
            </div>
          </div>

          <div className={styles.subscriptionSection}>
            <h2 className={styles.subscriptionTitle}>Stay Updated</h2>
            <p className={styles.subscriptionText}>
              Subscribe to our newsletter and be the first to know about important company updates and news.
            </p>
            <div className={styles.subscriptionForm}>
              <input type="email" placeholder="Enter your email address" className={styles.emailInput} />
              <button className={styles.subscribeButton}>Subscribe to News</button>
            </div>
            <div className={styles.socialLinks}>
              <p>Follow us on social media:</p>
              <div className={styles.socialButtons}>
                <button className={styles.socialButton}>Twitter</button>
                <button className={styles.socialButton}>LinkedIn</button>
                <button className={styles.socialButton}>Facebook</button>
                <button className={styles.socialButton}>Instagram</button>
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

export default LatestNews;
