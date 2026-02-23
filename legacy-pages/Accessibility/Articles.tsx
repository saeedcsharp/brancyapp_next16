import { useCallback, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import AccessibilityHeader from "brancy/components/Accessibility/AccessibilityHeader";
import SignIn, { RedirectType, SignInType } from "brancy/components/signIn/signIn";
import styles from "./Articles.module.css";

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

interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
  featured: boolean;
}

const Articles = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  const categories = [
    { id: "all", name: "All Articles", count: 24, icon: "📚" },
    { id: "product", name: "Product Updates", count: 8, icon: "🚀" },
    { id: "tutorials", name: "Tutorials", count: 6, icon: "📖" },
    { id: "insights", name: "Industry Insights", count: 5, icon: "💡" },
    { id: "tips", name: "Tips & Tricks", count: 3, icon: "⚡" },
    { id: "company", name: "Company News", count: 2, icon: "🏢" },
  ];

  const articles: Article[] = [
    {
      id: "1",
      title: "Building Scalable Web Applications with Modern Architecture",
      excerpt:
        "Learn how to design and implement scalable web applications using microservices, containerization, and cloud-native technologies.",
      author: "Sarah Johnson",
      date: "2024-03-15",
      readTime: "8 min read",
      category: "tutorials",
      tags: ["Architecture", "Scalability", "Cloud"],
      image: "🏗️",
      featured: true,
    },
    {
      id: "2",
      title: "Introducing Our New Dashboard: Better Performance, Better UX",
      excerpt:
        "We've completely redesigned our dashboard with performance and user experience at the forefront. Here's what's new.",
      author: "Mike Chen",
      date: "2024-03-10",
      readTime: "5 min read",
      category: "product",
      tags: ["Dashboard", "UX", "Performance"],
      image: "📊",
      featured: true,
    },
    {
      id: "3",
      title: "The Future of Remote Work: Trends and Predictions for 2024",
      excerpt:
        "Explore the evolving landscape of remote work and what businesses need to know to stay competitive in the digital age.",
      author: "Emily Rodriguez",
      date: "2024-03-08",
      readTime: "12 min read",
      category: "insights",
      tags: ["Remote Work", "Future", "Business"],
      image: "🌐",
      featured: false,
    },
    {
      id: "4",
      title: "10 Essential Productivity Hacks for Developers",
      excerpt:
        "Boost your development workflow with these proven productivity techniques and tools that top developers swear by.",
      author: "Alex Thompson",
      date: "2024-03-05",
      readTime: "6 min read",
      category: "tips",
      tags: ["Productivity", "Development", "Tools"],
      image: "⚡",
      featured: false,
    },
    {
      id: "5",
      title: "How to Master API Design: Best Practices and Common Pitfalls",
      excerpt:
        "A comprehensive guide to designing robust, scalable APIs that developers love to use. Learn from real-world examples.",
      author: "David Park",
      date: "2024-03-02",
      readTime: "15 min read",
      category: "tutorials",
      tags: ["API", "Design", "Best Practices"],
      image: "🔌",
      featured: false,
    },
    {
      id: "6",
      title: "Security First: Protecting Your Applications in 2024",
      excerpt:
        "Stay ahead of cyber threats with the latest security practices and tools every developer should implement.",
      author: "Jessica Kim",
      date: "2024-02-28",
      readTime: "10 min read",
      category: "insights",
      tags: ["Security", "Cybersecurity", "Development"],
      image: "🔒",
      featured: false,
    },
    {
      id: "7",
      title: "Behind the Scenes: How We Built Our Real-time Analytics Engine",
      excerpt:
        "Take a deep dive into the technical architecture and decisions behind our new real-time analytics platform.",
      author: "Ryan Foster",
      date: "2024-02-25",
      readTime: "11 min read",
      category: "product",
      tags: ["Analytics", "Real-time", "Engineering"],
      image: "📈",
      featured: false,
    },
    {
      id: "8",
      title: "Brancy Raises $25M Series B to Accelerate Global Expansion",
      excerpt:
        "We're excited to announce our Series B funding round and share our plans for international growth and product development.",
      author: "Lisa Zhang",
      date: "2024-02-20",
      readTime: "4 min read",
      category: "company",
      tags: ["Funding", "Growth", "Expansion"],
      image: "💰",
      featured: true,
    },
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = activeCategory === "all" || article.category === activeCategory;
    const matchesSearch =
      searchTerm === "" ||
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredArticles = articles.filter((article) => article.featured);

  return (
    <>
      <AccessibilityHeader themeState={themeState} dispatch={dispatch} onShowCreateSignIn={() => setShowSignIn(true)} />

      <div className={styles.container}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <h1 className={styles.title}>Articles & Insights</h1>
          <p className={styles.subtitle}>
            Discover the latest trends, tutorials, and insights from our team of experts. Stay informed about product
            updates, industry news, and best practices.
          </p>
        </div>

        {/* Search Bar */}
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Featured Articles */}
        {activeCategory === "all" && searchTerm === "" && (
          <div className={styles.featuredSection}>
            <h2 className={styles.sectionTitle}>Featured Articles</h2>
            <div className={styles.featuredGrid}>
              {featuredArticles.map((article) => (
                <div key={article.id} className={styles.featuredCard}>
                  <div className={styles.featuredImage}>
                    <span className={styles.featuredIcon}>{article.image}</span>
                    <div className={styles.featuredBadge}>Featured</div>
                  </div>
                  <div className={styles.featuredContent}>
                    <div className={styles.articleMeta}>
                      <span className={styles.category}>
                        {categories.find((cat) => cat.id === article.category)?.name}
                      </span>
                      <span className={styles.readTime}>{article.readTime}</span>
                    </div>
                    <h3 className={styles.featuredTitle}>{article.title}</h3>
                    <p className={styles.featuredExcerpt}>{article.excerpt}</p>
                    <div className={styles.articleFooter}>
                      <div className={styles.authorInfo}>
                        <span className={styles.author}>{article.author}</span>
                        <span className={styles.date}>{new Date(article.date).toLocaleDateString()}</span>
                      </div>
                      <button className={styles.readButton}>Read Article</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Filter */}
        <div className={styles.filterSection}>
          <div className={styles.categories}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`${styles.categoryButton} ${activeCategory === category.id ? styles.active : ""}`}>
                <span className={styles.categoryIcon}>{category.icon}</span>
                <span className={styles.categoryName}>{category.name}</span>
                <span className={styles.categoryCount}>({category.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className={styles.articlesSection}>
          <div className={styles.articlesHeader}>
            <h2 className={styles.sectionTitle}>
              {activeCategory === "all" ? "All Articles" : categories.find((cat) => cat.id === activeCategory)?.name}
            </h2>
            <div className={styles.resultsCount}>{filteredArticles.length} articles found</div>
          </div>

          {filteredArticles.length === 0 ? (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>📝</div>
              <h3>No articles found</h3>
              <p>Try adjusting your search terms or category filter.</p>
            </div>
          ) : (
            <div className={styles.articlesGrid}>
              {filteredArticles.map((article) => (
                <div key={article.id} className={styles.articleCard}>
                  <div className={styles.articleImage}>
                    <span className={styles.articleIcon}>{article.image}</span>
                  </div>
                  <div className={styles.articleContent}>
                    <div className={styles.articleMeta}>
                      <span className={styles.category}>
                        {categories.find((cat) => cat.id === article.category)?.name}
                      </span>
                      <span className={styles.readTime}>{article.readTime}</span>
                    </div>
                    <h3 className={styles.articleTitle}>{article.title}</h3>
                    <p className={styles.articleExcerpt}>{article.excerpt}</p>
                    <div className={styles.articleTags}>
                      {article.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className={styles.tag}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className={styles.articleFooter}>
                      <div className={styles.authorInfo}>
                        <span className={styles.author}>{article.author}</span>
                        <span className={styles.date}>{new Date(article.date).toLocaleDateString()}</span>
                      </div>
                      <button className={styles.readButton}>Read More</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Newsletter Subscription */}
        <div className={styles.newsletterSection}>
          <div className={styles.newsletterContent}>
            <h2 className={styles.newsletterTitle}>Stay Updated</h2>
            <p className={styles.newsletterDescription}>
              Subscribe to our newsletter and never miss the latest articles, insights, and product updates.
            </p>
            <div className={styles.newsletterForm}>
              <input type="email" placeholder="Enter your email address" className={styles.newsletterInput} />
              <button className={styles.subscribeButton}>
                <span className={styles.subscribeIcon}>📧</span>
                Subscribe
              </button>
            </div>
            <p className={styles.newsletterNote}>
              Join 10,000+ professionals who trust our insights. No spam, unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Popular Tags */}
        <div className={styles.tagsSection}>
          <h3 className={styles.tagsTitle}>Popular Topics</h3>
          <div className={styles.tagsList}>
            {[
              "Architecture",
              "Development",
              "Security",
              "Performance",
              "UX",
              "API",
              "Cloud",
              "Analytics",
              "Remote Work",
              "Productivity",
            ].map((tag, index) => (
              <button key={index} className={styles.popularTag}>
                #{tag}
              </button>
            ))}
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

export default Articles;
