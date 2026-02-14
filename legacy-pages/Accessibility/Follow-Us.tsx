import React, { useCallback, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "saeed/i18n";
import AccessibilityHeader from "../../components/Accessibility/AccessibilityHeader";
import SignIn, { RedirectType, SignInType } from "../../components/signIn/signIn";
import styles from "./Follow-Us.module.css";

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
const FollowUs: React.FC = () => {
  const { t } = useTranslation();

  const [email, setEmail] = useState<string>("");

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

  const socialPlatforms = [
    {
      name: "Twitter",
      handle: "@BrancyOfficial",
      followers: "125K",
      description: "Get real-time updates, announcements, and engage with our community.",
      icon: "🐦",
      color: "#1da1f2",
      link: "https://twitter.com/brancyofficial",
      posts: [
        {
          text: "🚀 Exciting news! Our new AI recommendation system is now live. Discover products tailored just for you!",
          time: "2h ago",
        },
        {
          text: "🌱 Proud to announce we've achieved carbon neutrality! Thank you to our community for supporting sustainable commerce.",
          time: "1d ago",
        },
        {
          text: "🔒 Security update: New fraud detection system deployed with 99.7% accuracy. Your safety is our priority.",
          time: "3d ago",
        },
      ],
    },
    {
      name: "LinkedIn",
      handle: "Brancy",
      followers: "85K",
      description: "Professional insights, company updates, and industry thought leadership.",
      icon: "💼",
      color: "#0077b5",
      link: "https://linkedin.com/company/brancy",
      posts: [
        {
          text: "Thrilled to share our Q4 results: 78% revenue growth and 2.5M new users! Thank you to our amazing team.",
          time: "5h ago",
        },
        {
          text: "Hiring update: We're looking for talented developers and designers to join our growing team. Check out our careers page!",
          time: "2d ago",
        },
        {
          text: "Industry insight: How AI is transforming digital marketplaces. Read our latest blog post for expert analysis.",
          time: "4d ago",
        },
      ],
    },
    {
      name: "Instagram",
      handle: "@BrancyLife",
      followers: "95K",
      description: "Behind-the-scenes content, team highlights, and visual storytelling.",
      icon: "📷",
      color: "#E4405F",
      link: "https://instagram.com/brancylife",
      posts: [
        {
          text: "📸 Office tour: Take a peek at our new eco-friendly workspace designed for creativity and collaboration!",
          time: "3h ago",
        },
        {
          text: "🎉 Celebrating our amazing customer support team for their dedication to helping users every day!",
          time: "1d ago",
        },
        {
          text: "🌟 User spotlight: Meet Sarah, a small business owner who grew her sales by 300% using our platform!",
          time: "2d ago",
        },
      ],
    },
    {
      name: "Facebook",
      handle: "BrancyOfficial",
      followers: "150K",
      description: "Community discussions, product updates, and customer stories.",
      icon: "👥",
      color: "#1877f2",
      link: "https://facebook.com/brancyofficial",
      posts: [
        {
          text: "💬 Community question: What features would you like to see next? Share your ideas in the comments!",
          time: "4h ago",
        },
        {
          text: "📊 Infographic: How digital marketplaces are changing the way we shop. Swipe to see the latest statistics!",
          time: "2d ago",
        },
        {
          text: "🏆 Congratulations to this month's top sellers! Your success inspires our entire community.",
          time: "5d ago",
        },
      ],
    },
    {
      name: "YouTube",
      handle: "BrancyChannel",
      followers: "45K",
      description: "Product tutorials, webinars, and educational content for sellers and buyers.",
      icon: "📺",
      color: "#ff0000",
      link: "https://youtube.com/brancychannel",
      posts: [
        {
          text: "🎥 New video: 'How to Optimize Your Product Listings for Maximum Visibility' - 15 min tutorial",
          time: "6h ago",
        },
        {
          text: "📹 Live webinar tomorrow at 2 PM EST: 'Advanced Marketing Strategies for Digital Sellers'",
          time: "1d ago",
        },
        { text: "🔔 Subscribe and hit the bell for weekly tips on growing your online business!", time: "3d ago" },
      ],
    },
    {
      name: "TikTok",
      handle: "@BrancyTips",
      followers: "78K",
      description: "Quick tips, trends, and fun content about digital commerce.",
      icon: "🎵",
      color: "#000000",
      link: "https://tiktok.com/@brancytips",
      posts: [
        {
          text: "✨ Quick tip: Use these 3 keywords to boost your product visibility by 40%! #SellerTips #DigitalCommerce",
          time: "1h ago",
        },
        {
          text: "📱 Trending: How Gen Z is changing online shopping habits. What do you think? #GenZ #Shopping",
          time: "2d ago",
        },
        {
          text: "🚀 Behind the scenes: How our AI recommendation engine learns your preferences in 60 seconds!",
          time: "4d ago",
        },
      ],
    },
  ];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing with ${email}!`);
      setEmail("");
    }
  };

  return (
    <>
      <AccessibilityHeader themeState={themeState} dispatch={dispatch} onShowCreateSignIn={() => setShowSignIn(true)} />

      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>{t(LanguageKey.footer_FollowUs)}</h1>
          <p className={styles.subtitle}>
            Connect with us across social media platforms and stay updated with our latest news, tips, and community
            highlights
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.platformsGrid}>
            {socialPlatforms.map((platform, index) => (
              <div key={index} className={styles.platformCard}>
                <div className={styles.platformHeader}>
                  <div className={styles.platformIcon} style={{ backgroundColor: `${platform.color}20` }}>
                    <span style={{ color: platform.color }}>{platform.icon}</span>
                  </div>
                  <div className={styles.platformInfo}>
                    <h3 className={styles.platformName}>{platform.name}</h3>
                    <p className={styles.platformHandle}>{platform.handle}</p>
                    <div className={styles.followers}>{platform.followers} followers</div>
                  </div>
                  <a
                    href={platform.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.followButton}
                    style={{ backgroundColor: platform.color }}>
                    Follow
                  </a>
                </div>

                <p className={styles.platformDescription}>{platform.description}</p>

                <div className={styles.recentPosts}>
                  <h4 className={styles.postsTitle}>Recent Posts</h4>
                  {platform.posts.map((post, postIndex) => (
                    <div key={postIndex} className={styles.post}>
                      <p className={styles.postText}>{post.text}</p>
                      <span className={styles.postTime}>{post.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.newsletterSection}>
            <h2 className={styles.newsletterTitle}>Never Miss an Update</h2>
            <p className={styles.newsletterText}>
              Subscribe to our newsletter for exclusive content, early access to features, and curated updates from all
              our social channels.
            </p>
            <form onSubmit={handleEmailSubmit} className={styles.newsletterForm}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className={styles.emailInput}
                required
              />
              <button type="submit" className={styles.subscribeButton}>
                Subscribe Now
              </button>
            </form>
            <div className={styles.newsletterBenefits}>
              <div className={styles.benefit}>
                <span className={styles.benefitIcon}>📧</span>
                <span>Weekly digest of best content</span>
              </div>
              <div className={styles.benefit}>
                <span className={styles.benefitIcon}>🎁</span>
                <span>Exclusive offers and early access</span>
              </div>
              <div className={styles.benefit}>
                <span className={styles.benefitIcon}>🔒</span>
                <span>No spam, unsubscribe anytime</span>
              </div>
            </div>
          </div>

          <div className={styles.communitySection}>
            <h2 className={styles.communityTitle}>Join Our Community</h2>
            <p className={styles.communityText}>
              Be part of our growing community of sellers, buyers, and digital commerce enthusiasts.
            </p>
            <div className={styles.communityStats}>
              <div className={styles.stat}>
                <div className={styles.statNumber}>500K+</div>
                <div className={styles.statLabel}>Community Members</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>2.5M+</div>
                <div className={styles.statLabel}>Active Users</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>50K+</div>
                <div className={styles.statLabel}>Success Stories</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>150+</div>
                <div className={styles.statLabel}>Countries</div>
              </div>
            </div>
          </div>

          <div className={styles.hashtagSection}>
            <h2 className={styles.hashtagTitle}>Use Our Hashtags</h2>
            <p className={styles.hashtagText}>
              Join the conversation and share your experiences using our official hashtags:
            </p>
            <div className={styles.hashtags}>
              <span className={styles.hashtag}>#BrancySuccess</span>
              <span className={styles.hashtag}>#DigitalCommerce</span>
              <span className={styles.hashtag}>#BrancyCommunity</span>
              <span className={styles.hashtag}>#SellerLife</span>
              <span className={styles.hashtag}>#MarketplaceTips</span>
              <span className={styles.hashtag}>#BrancyFamily</span>
            </div>
          </div>

          <div className={styles.contactSection}>
            <h2 className={styles.contactTitle}>Get in Touch</h2>
            <p className={styles.contactText}>Have questions or want to collaborate? We'd love to hear from you!</p>
            <div className={styles.contactMethods}>
              <div className={styles.contactMethod}>
                <span className={styles.contactIcon}>📧</span>
                <div>
                  <strong>Email</strong>
                  <p>social@brancy.com</p>
                </div>
              </div>
              <div className={styles.contactMethod}>
                <span className={styles.contactIcon}>💬</span>
                <div>
                  <strong>Community Manager</strong>
                  <p>Direct message us on any platform</p>
                </div>
              </div>
              <div className={styles.contactMethod}>
                <span className={styles.contactIcon}>🤝</span>
                <div>
                  <strong>Partnerships</strong>
                  <p>partnerships@brancy.com</p>
                </div>
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

export default FollowUs;
