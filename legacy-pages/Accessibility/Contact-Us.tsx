import Head from "next/head";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import SignIn, { RedirectType, SignInType } from "saeed/components/signIn/signIn";
import AccessibilityHeader from "../../components/Accessibility/AccessibilityHeader";
import styles from "./Contact-Us.module.css";

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

const ContactUs: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInType, setSignInType] = useState(SignInType.Phonenumber);
  const [preUserToken, setPreUserToken] = useState("");
  const [hasMounted, setHasMounted] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
  });

  const [searchQuery, setSearchQuery] = useState("");

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", formData);
    alert("Thank you for your message! We will get back to you soon.");

    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      message: "",
    });
  };

  if (!hasMounted) return null;

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Contact Us | Brancy</title>
        <meta name="description" content="Get in touch with us. We'd love to hear from you!" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/Accessibility/Contact-Us" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="touch-action" content="manipulation" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Head>

      <AccessibilityHeader themeState={themeState} dispatch={dispatch} onShowCreateSignIn={handleShowCreateSignIn} />

      <div className={styles.container}>
        <header className={styles.headerandinput}>
          <div className={styles.backdrop} />
          <h2 className={styles.contactSubtitle}>Contact us</h2>
          <h1 className={styles.contactTitle}>We'd love to hear from you</h1>
        </header>

        <div className={styles.content}>
          <div className={styles.contactInfo}>
            <div className={styles.contactTitleparent}>
              <h3 className={styles.contactTitle}>Contact</h3>
              <h2 className={styles.formTitle}>You can easily contact us here</h2>
            </div>

            <div className={styles.contactDetails}>
              <div className={styles.contactItem}>
                <svg width="32" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 20">
                  <path
                    d="M8 .8h6q2.2 0 3.7.2t2.6 1.3 1.2 2.5q.3 1.5.2 3.6v3.1q0 2.2-.2 3.7t-1.2 2.5-2.6 1.3l-3.7.2H8q-2.2 0-3.7-.2t-2.6-1.3-1.2-2.5q-.3-1.5-.2-3.6V8.5q0-2.2.2-3.7t1.2-2.5T4.3 1zM17 6a1 1 0 0 0-1.4-.4l-3 1.8Q11.4 8 11 8t-1.5-.6l-3-1.8a1 1 0 0 0-1 1.8l3 1.7a5 5 0 0 0 2.5.9 5 5 0 0 0 2.6-.9l3-1.7q.6-.6.3-1.4"
                    fill="#fff"
                  />
                </svg>

                <span>contact.Brancy.com</span>
              </div>
              <div className={styles.contactItem}>
                <svg width="32" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 33">
                  <path
                    d="M16 0C7.2 0 0 7.4 0 16.5S7.2 33 16 33s16-7.4 16-16.5S24.8 0 16 0m8.5 23.2a5 5 0 0 1-4.2 2.2q-1.5 0-2.9-.8a19 19 0 0 1-9.9-11q-.9-3.6 2.1-6h.5l1.5.1.3.2 1.4 4.5-1.2 1.7q-.5.6 0 1.3a11 11 0 0 0 5.2 5.3h.7l1.9-1.4h.5l4 1.7.2 1.5z"
                    fill="#fff"
                  />
                </svg>{" "}
                <span>whatsapp</span>
              </div>
              <div className={styles.contactItem}>
                {" "}
                <svg width="32" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
                  <path
                    d="M15 9.2A5.7 5.7 0 0 0 9.1 15c0 3.2 2.5 5.7 5.8 5.8 3.4-.2 5.8-2.6 5.8-5.9q0-2.4-1.8-4-1.6-1.6-4-1.7"
                    fill="#fff"
                  />
                  <path
                    d="M30 12V9.3q-.2-1.9-.6-3.5A8 8 0 0 0 26 1.4 9 9 0 0 0 21.5 0H9.8l-1 .1-2 .2A8 8 0 0 0 1.4 4 10 10 0 0 0 .1 8.6L0 14.8v6q0 2 .6 3.5 1 3.2 4 4.7 1.7 1 4.2 1h11.7q1.5 0 2.9-.3a8 8 0 0 0 5.3-3.7q1-1.7 1.2-4.4a71 71 0 0 0 0-9.6M15 22.6a7.6 7.6 0 0 1-7.6-7.5A7.6 7.6 0 0 1 15 7.4a7.5 7.5 0 0 1 7.6 7.7c0 4.2-3.4 7.5-7.6 7.5m9.7-15.8q0 .8-.5 1.3t-1 .4q-1.5 0-1.7-1.6 0-.7.4-1 .5-.6 1.3-.6.6 0 1.1.6.4.4.4.9"
                    fill="#fff"
                  />
                </svg>{" "}
                <span>instagram</span>
              </div>
              <div className={styles.contactItem}>
                {" "}
                <svg width="32" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29 23">
                  <path
                    d="M29 1.4q0 1-.3 1.9l-1 6.5L27 15l-1 5.5-.1.8-.3.9q-.6 1-1.8.8l-1.2-.4q-1-.3-1.7-.9l-3-1.8-3.8-2.7-.8-.5-.5-.6a1 1 0 0 1 0-1l.6-.7 5.6-5 2.1-2q.5-.4.7-1l.1-.3q0-.4-.3-.3l-.5.1-1.3.7L17.3 8l-8.2 5.4q-.9.5-1.8.5t-2-.3L.8 12.3l-.5-.4q-.4-.4 0-1l.5-.4 1-.4 17.1-6.8 7.5-3 1.4-.3Q29 0 29 1.2z"
                    fill="#fff"
                  />
                </svg>{" "}
                <span>telegram</span>
              </div>
            </div>
          </div>
          <div className={styles.formSection}>
            <h2 className={styles.formTitle}>Contact Form</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <textarea
                id="message"
                name="message"
                placeholder="Message"
                value={formData.message}
                onChange={handleInputChange}
                className={styles.textarea}
                rows={6}
                required
              />

              <button type="submit" className={styles.submitButton}>
                Send Message
              </button>
            </form>
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

export default ContactUs;
