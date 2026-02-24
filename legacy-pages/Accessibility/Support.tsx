import Head from "next/head";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import SignIn, { RedirectType, SignInType } from "brancy/components/signIn/signIn";
import { LanguageKey } from "brancy/i18n";
import AccessibilityHeader from "brancy/components/Accessibility/AccessibilityHeader";
import styles from "./Support.module.css";

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

const Support: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInType, setSignInType] = useState(SignInType.Phonenumber);
  const [preUserToken, setPreUserToken] = useState("");
  const [hasMounted, setHasMounted] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    name: "",
    email: "",
    category: "",
    priority: "",
    subject: "",
    description: "",
  });

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

  const supportChannels = [
    {
      title: "Live Chat",
      icon: "💬",
      description: "Get instant help from our support team",
      availability: "24/7 Available",
      responseTime: "< 2 minutes",
      bestFor: "Quick questions, technical issues",
      color: "#10b981",
    },
    {
      title: "Email Support",
      icon: "📧",
      description: "Send detailed questions and get comprehensive answers",
      availability: "Mon-Sun, 24 hours",
      responseTime: "< 4 hours",
      bestFor: "Complex issues, account problems",
      color: "#3b82f6",
    },
    {
      title: "Phone Support",
      icon: "📞",
      description: "Speak directly with our support specialists",
      availability: "Mon-Fri, 9AM-6PM EST",
      responseTime: "< 1 minute",
      bestFor: "Urgent issues, payment problems",
      color: "#f59e0b",
    },
    {
      title: "Community Forum",
      icon: "👥",
      description: "Get help from other users and share experiences",
      availability: "Always Available",
      responseTime: "Varies",
      bestFor: "General questions, tips and tricks",
      color: "#8b5cf6",
    },
  ];

  const supportCategories = [
    { value: "account", label: "Account & Profile" },
    { value: "billing", label: "Billing & Payments" },
    { value: "technical", label: "Technical Issues" },
    { value: "selling", label: "Selling Questions" },
    { value: "buying", label: "Buying Questions" },
    { value: "security", label: "Security & Privacy" },
    { value: "other", label: "Other" },
  ];

  const priorityLevels = [
    { value: "low", label: "Low - General question", color: "#10b981" },
    { value: "medium", label: "Medium - Need help soon", color: "#f59e0b" },
    { value: "high", label: "High - Urgent issue", color: "#ef4444" },
    {
      value: "critical",
      label: "Critical - Site not working",
      color: "#7c2d12",
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTicketForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Support ticket submitted:", ticketForm);
    alert("Thank you! Your support ticket has been submitted. We'll get back to you soon.");
    setTicketForm({
      name: "",
      email: "",
      category: "",
      priority: "",
      subject: "",
      description: "",
    });
  };

  const systemStatus = [
    { service: "Website", status: "operational", uptime: "99.9%" },
    { service: "Mobile App", status: "operational", uptime: "99.8%" },
    { service: "Payment System", status: "operational", uptime: "99.9%" },
    { service: "API Services", status: "maintenance", uptime: "98.5%" },
    { service: "Email Notifications", status: "operational", uptime: "99.7%" },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      operational: "#10b981",
      maintenance: "#f59e0b",
      outage: "#ef4444",
    };
    return colors[status as keyof typeof colors] || "#6b7280";
  };

  return (
    <>
      <Head>
        <title>{t(LanguageKey.support)} - Brancy</title>
        <meta name="description" content={t(LanguageKey.supportDescription)} />
        <meta name="keywords" content={t(LanguageKey.supportKeywords)} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AccessibilityHeader themeState={themeState} dispatch={dispatch} onShowCreateSignIn={handleShowCreateSignIn} />
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>{t(LanguageKey.footer_Support)}</h1>
          <p className={styles.subtitle}>We're here to help! Choose the support option that works best for you.</p>
        </div>

        <div className={styles.content}>
          <div className={styles.channelsSection}>
            <h2 className={styles.sectionTitle}>How Can We Help You?</h2>
            <div className={styles.channelsGrid}>
              {supportChannels.map((channel, index) => (
                <div key={index} className={styles.channelCard}>
                  <div
                    className={styles.channelIcon}
                    style={{
                      backgroundColor: `${channel.color}20`,
                      color: channel.color,
                    }}>
                    {channel.icon}
                  </div>
                  <h3 className={styles.channelTitle}>{channel.title}</h3>
                  <p className={styles.channelDescription}>{channel.description}</p>

                  <div className={styles.channelDetails}>
                    <div className={styles.detail}>
                      <span className={styles.detailLabel}>Availability:</span>
                      <span className={styles.detailValue}>{channel.availability}</span>
                    </div>
                    <div className={styles.detail}>
                      <span className={styles.detailLabel}>Response Time:</span>
                      <span className={styles.detailValue}>{channel.responseTime}</span>
                    </div>
                    <div className={styles.detail}>
                      <span className={styles.detailLabel}>Best For:</span>
                      <span className={styles.detailValue}>{channel.bestFor}</span>
                    </div>
                  </div>

                  <button className={styles.channelButton} style={{ backgroundColor: channel.color }}>
                    {channel.title === "Live Chat"
                      ? "Start Chat"
                      : channel.title === "Email Support"
                        ? "Send Email"
                        : channel.title === "Phone Support"
                          ? "Call Now"
                          : "Visit Forum"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.ticketSection}>
            <h2 className={styles.sectionTitle}>Submit a Support Ticket</h2>
            <p className={styles.ticketDescription}>
              For complex issues or if you prefer written communication, submit a detailed support ticket.
            </p>

            <form onSubmit={handleSubmit} className={styles.ticketForm}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={ticketForm.name}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={ticketForm.email}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="category" className={styles.label}>
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={ticketForm.category}
                    onChange={handleInputChange}
                    className={styles.select}
                    required>
                    <option value="">Select a category</option>
                    {supportCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="priority" className={styles.label}>
                    Priority *
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={ticketForm.priority}
                    onChange={handleInputChange}
                    className={styles.select}
                    required>
                    <option value="">Select priority level</option>
                    {priorityLevels.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="subject" className={styles.label}>
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={ticketForm.subject}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="description" className={styles.label}>
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={ticketForm.description}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  rows={6}
                  placeholder="Please provide as much detail as possible about your issue..."
                  required
                />
              </div>

              <button type="submit" className={styles.submitButton}>
                Submit Support Ticket
              </button>
            </form>
          </div>

          <div className={styles.statusSection}>
            <h2 className={styles.sectionTitle}>System Status</h2>
            <p className={styles.statusDescription}>Check the current status of our services and systems.</p>

            <div className={styles.statusGrid}>
              {systemStatus.map((service, index) => (
                <div key={index} className={styles.statusCard}>
                  <div className={styles.statusHeader}>
                    <h3 className={styles.serviceName}>{service.service}</h3>
                    <div
                      className={styles.statusBadge}
                      style={{
                        backgroundColor: getStatusColor(service.status),
                      }}>
                      {service.status}
                    </div>
                  </div>
                  <div className={styles.uptimeInfo}>
                    <span className={styles.uptimeLabel}>Uptime:</span>
                    <span className={styles.uptimeValue}>{service.uptime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.resourcesSection}>
            <h2 className={styles.resourcesTitle}>Self-Help Resources</h2>
            <div className={styles.resourcesGrid}>
              <div className={styles.resourceCard}>
                <div className={styles.resourceIcon}>📚</div>
                <h3>Knowledge Base</h3>
                <p>Browse our comprehensive collection of help articles and guides</p>
                <button className={styles.resourceButton}>Browse Articles</button>
              </div>

              <div className={styles.resourceCard}>
                <div className={styles.resourceIcon}>❓</div>
                <h3>FAQ</h3>
                <p>Find quick answers to the most commonly asked questions</p>
                <button className={styles.resourceButton}>View FAQ</button>
              </div>

              <div className={styles.resourceCard}>
                <div className={styles.resourceIcon}>🎥</div>
                <h3>Video Tutorials</h3>
                <p>Watch step-by-step video guides for platform features</p>
                <button className={styles.resourceButton}>Watch Videos</button>
              </div>

              <div className={styles.resourceCard}>
                <div className={styles.resourceIcon}>📖</div>
                <h3>User Manual</h3>
                <p>Download the complete user manual in PDF format</p>
                <button className={styles.resourceButton}>Download PDF</button>
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

export default Support;
