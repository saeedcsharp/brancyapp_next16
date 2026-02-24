import Head from "next/head";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import AccessibilityHeader from "brancy/components/Accessibility/AccessibilityHeader";
import { LanguageKey } from "brancy/i18n";
import SignIn, { RedirectType, SignInType } from "brancy/components/signIn/signIn";
import styles from "./Report-an-Issue.module.css";

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
interface IssueForm {
  title: string;
  category: string;
  priority: string;
  description: string;
  steps: string;
  expectedBehavior: string;
  actualBehavior: string;
  environment: string;
  userEmail: string;
  attachments: File[];
}

const ReportAnIssue = () => {
  const { t, i18n } = useTranslation();
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

  const [formData, setFormData] = useState<IssueForm>({
    title: "",
    category: "bug",
    priority: "medium",
    description: "",
    steps: "",
    expectedBehavior: "",
    actualBehavior: "",
    environment: "",
    userEmail: "",
    attachments: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("report");

  const categories = [
    {
      value: "bug",
      label: "Bug Report",
      icon: "🐛",
      description: "Something isn't working as expected",
    },
    {
      value: "feature",
      label: "Feature Request",
      icon: "💡",
      description: "Suggest a new feature or improvement",
    },
    {
      value: "performance",
      label: "Performance Issue",
      icon: "⚡",
      description: "App is slow or unresponsive",
    },
    {
      value: "security",
      label: "Security Concern",
      icon: "🔒",
      description: "Report a security vulnerability",
    },
    {
      value: "ui",
      label: "UI/UX Issue",
      icon: "🎨",
      description: "Design or user experience problem",
    },
    {
      value: "data",
      label: "Data Issue",
      icon: "📊",
      description: "Data loss or corruption",
    },
  ];

  const priorities = [
    {
      value: "low",
      label: "Low",
      color: "#22c55e",
      description: "Minor issue, doesn't affect main functionality",
    },
    {
      value: "medium",
      label: "Medium",
      color: "#f59e0b",
      description: "Affects functionality but has workarounds",
    },
    {
      value: "high",
      label: "High",
      color: "#ef4444",
      description: "Major functionality is broken",
    },
    {
      value: "critical",
      label: "Critical",
      color: "#dc2626",
      description: "App is unusable or data loss occurred",
    },
  ];

  const handleInputChange = (field: keyof IssueForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isSubmitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>✅</div>
          <h1 className={styles.successTitle}>Issue Reported Successfully!</h1>
          <p className={styles.successMessage}>
            Thank you for reporting this issue. We've received your report and assigned it ticket ID{" "}
            <strong>#BR-{Math.floor(Math.random() * 10000)}</strong>.
          </p>
          <div className={styles.successDetails}>
            <div className={styles.successDetail}>
              <strong>What happens next?</strong>
              <ul>
                <li>Our team will review your report within 24 hours</li>
                <li>You'll receive an email confirmation with tracking details</li>
                <li>We'll keep you updated on the progress</li>
                <li>Expected resolution time: 2-5 business days</li>
              </ul>
            </div>
          </div>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                title: "",
                category: "bug",
                priority: "medium",
                description: "",
                steps: "",
                expectedBehavior: "",
                actualBehavior: "",
                environment: "",
                userEmail: "",
                attachments: [],
              });
            }}
            className={styles.newReportButton}>
            Report Another Issue
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{t(LanguageKey.reportIssue)} - Brancy</title>
        <meta name="description" content={t(LanguageKey.reportIssueDescription)} />
        <meta name="keywords" content={t(LanguageKey.reportIssueKeywords)} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AccessibilityHeader themeState={themeState} dispatch={dispatch} onShowCreateSignIn={handleShowCreateSignIn} />
      <div className={styles.container}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <h1 className={styles.title}>Report an Issue</h1>
          <p className={styles.subtitle}>
            Help us improve Brancy by reporting bugs, suggesting features, or sharing feedback. Your input helps us
            build a better product for everyone.
          </p>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            onClick={() => setActiveTab("report")}
            className={`${styles.tab} ${activeTab === "report" ? styles.activeTab : ""}`}>
            <span className={styles.tabIcon}>📋</span>
            Report Issue
          </button>
          <button
            onClick={() => setActiveTab("guidelines")}
            className={`${styles.tab} ${activeTab === "guidelines" ? styles.activeTab : ""}`}>
            <span className={styles.tabIcon}>📖</span>
            Guidelines
          </button>
          <button
            onClick={() => setActiveTab("status")}
            className={`${styles.tab} ${activeTab === "status" ? styles.activeTab : ""}`}>
            <span className={styles.tabIcon}>📊</span>
            Track Status
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "report" && (
          <div className={styles.formSection}>
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Issue Category */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Issue Category</h3>
                <div className={styles.categoryGrid}>
                  {categories.map((category) => (
                    <label
                      key={category.value}
                      className={`${styles.categoryCard} ${
                        formData.category === category.value ? styles.selected : ""
                      }`}>
                      <input
                        type="radio"
                        name="category"
                        value={category.value}
                        checked={formData.category === category.value}
                        onChange={(e) => handleInputChange("category", e.target.value)}
                        className={styles.hiddenRadio}
                      />
                      <div className={styles.categoryIcon}>{category.icon}</div>
                      <div className={styles.categoryContent}>
                        <h4 className={styles.categoryLabel}>{category.label}</h4>
                        <p className={styles.categoryDescription}>{category.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Basic Information */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Basic Information</h3>
                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Issue Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Brief description of the issue"
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Your Email *</label>
                    <input
                      type="email"
                      value={formData.userEmail}
                      onChange={(e) => handleInputChange("userEmail", e.target.value)}
                      placeholder="your.email@example.com"
                      className={styles.input}
                      required
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Priority Level</label>
                  <div className={styles.priorityGrid}>
                    {priorities.map((priority) => (
                      <label
                        key={priority.value}
                        className={`${styles.priorityCard} ${
                          formData.priority === priority.value ? styles.selected : ""
                        }`}>
                        <input
                          type="radio"
                          name="priority"
                          value={priority.value}
                          checked={formData.priority === priority.value}
                          onChange={(e) => handleInputChange("priority", e.target.value)}
                          className={styles.hiddenRadio}
                        />
                        <div className={styles.priorityIndicator} style={{ backgroundColor: priority.color }}></div>
                        <div className={styles.priorityContent}>
                          <span className={styles.priorityLabel}>{priority.label}</span>
                          <span className={styles.priorityDescription}>{priority.description}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed Description */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Detailed Description</h3>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Issue Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Provide a detailed description of the issue..."
                    className={styles.textarea}
                    rows={4}
                    required
                  />
                </div>

                {formData.category === "bug" && (
                  <>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Steps to Reproduce</label>
                      <textarea
                        value={formData.steps}
                        onChange={(e) => handleInputChange("steps", e.target.value)}
                        placeholder="1. Go to... 2. Click on... 3. See error..."
                        className={styles.textarea}
                        rows={3}
                      />
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Expected Behavior</label>
                        <textarea
                          value={formData.expectedBehavior}
                          onChange={(e) => handleInputChange("expectedBehavior", e.target.value)}
                          placeholder="What should happen..."
                          className={styles.textarea}
                          rows={2}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Actual Behavior</label>
                        <textarea
                          value={formData.actualBehavior}
                          onChange={(e) => handleInputChange("actualBehavior", e.target.value)}
                          placeholder="What actually happens..."
                          className={styles.textarea}
                          rows={2}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Environment Details</label>
                  <textarea
                    value={formData.environment}
                    onChange={(e) => handleInputChange("environment", e.target.value)}
                    placeholder="Browser: Chrome 100, OS: Windows 11, Device: Desktop..."
                    className={styles.textarea}
                    rows={2}
                  />
                </div>
              </div>

              {/* File Attachments */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Attachments (Optional)</h3>
                <p className={styles.sectionDescription}>
                  Upload screenshots, videos, or log files to help us understand the issue better.
                </p>

                <div className={styles.fileUpload}>
                  <input
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg,.gif,.mp4,.txt,.log,.pdf"
                    onChange={handleFileUpload}
                    className={styles.hiddenFileInput}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className={styles.fileUploadLabel}>
                    <span className={styles.uploadIcon}>📎</span>
                    <span>Choose Files or Drag & Drop</span>
                    <span className={styles.fileTypes}>PNG, JPG, GIF, MP4, TXT, LOG, PDF (Max 10MB each)</span>
                  </label>
                </div>

                {formData.attachments.length > 0 && (
                  <div className={styles.attachmentsList}>
                    {formData.attachments.map((file, index) => (
                      <div key={index} className={styles.attachmentItem}>
                        <span className={styles.fileName}>{file.name}</span>
                        <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                        <button type="button" onClick={() => removeAttachment(index)} className={styles.removeButton}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !formData.title || !formData.userEmail}
                className={styles.submitButton}>
                {isSubmitting ? (
                  <>
                    <span className={styles.spinner}></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span className={styles.submitIcon}>🚀</span>
                    Submit Issue Report
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {activeTab === "guidelines" && (
          <div className={styles.guidelinesSection}>
            <div className={styles.guideline}>
              <h3 className={styles.guidelineTitle}>📋 Before Reporting</h3>
              <ul className={styles.guidelineList}>
                <li>Search existing issues to avoid duplicates</li>
                <li>Make sure you're using the latest version</li>
                <li>Try reproducing the issue in an incognito window</li>
                <li>Gather relevant information and screenshots</li>
              </ul>
            </div>

            <div className={styles.guideline}>
              <h3 className={styles.guidelineTitle}>✅ Good Issue Reports Include</h3>
              <ul className={styles.guidelineList}>
                <li>Clear, descriptive title</li>
                <li>Step-by-step reproduction instructions</li>
                <li>Expected vs actual behavior</li>
                <li>Environment details (browser, OS, device)</li>
                <li>Screenshots or videos when relevant</li>
              </ul>
            </div>

            <div className={styles.guideline}>
              <h3 className={styles.guidelineTitle}>🔒 Security Issues</h3>
              <ul className={styles.guidelineList}>
                <li>Do not report security vulnerabilities publicly</li>
                <li>Use the "Security Concern" category</li>
                <li>Provide detailed steps but avoid public disclosure</li>
                <li>We'll contact you privately for sensitive issues</li>
              </ul>
            </div>

            <div className={styles.guideline}>
              <h3 className={styles.guidelineTitle}>⏱️ Response Times</h3>
              <ul className={styles.guidelineList}>
                <li>
                  <strong>Critical:</strong> Within 4 hours
                </li>
                <li>
                  <strong>High:</strong> Within 24 hours
                </li>
                <li>
                  <strong>Medium:</strong> Within 3 business days
                </li>
                <li>
                  <strong>Low:</strong> Within 1 week
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "status" && (
          <div className={styles.statusSection}>
            <div className={styles.statusCard}>
              <h3 className={styles.statusTitle}>Track Your Issue</h3>
              <p className={styles.statusDescription}>
                Enter your ticket ID to check the status of your reported issue.
              </p>
              <div className={styles.trackingForm}>
                <input type="text" placeholder="Enter ticket ID (e.g., BR-1234)" className={styles.trackingInput} />
                <button className={styles.trackingButton}>Track Status</button>
              </div>
            </div>

            <div className={styles.statusStats}>
              <div className={styles.stat}>
                <div className={styles.statNumber}>127</div>
                <div className={styles.statLabel}>Open Issues</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>89</div>
                <div className={styles.statLabel}>In Progress</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>2,341</div>
                <div className={styles.statLabel}>Resolved</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>96%</div>
                <div className={styles.statLabel}>Satisfaction</div>
              </div>
            </div>
          </div>
        )}
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

export default ReportAnIssue;
