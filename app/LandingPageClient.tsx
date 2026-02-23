"use client";

import "brancy/i18n";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import SignIn, { RedirectType, SignInType } from "brancy/components/signIn/signIn";
import Footer from "brancy/components/website/landing/footer";
import LandingHeader from "brancy/components/website/landing/LandingHeader";
import Page1 from "brancy/components/website/landing/page1";
import Page2 from "brancy/components/website/landing/page2";
import Page4 from "brancy/components/website/landing/page4";
import Page5 from "brancy/components/website/landing/page5";
import Page8 from "brancy/components/website/landing/page8";
import Page9 from "brancy/components/website/landing/page9";
import { applyDetectedLocale } from "brancy/helper/detectLocaleFromTimezone";
import styles from "../legacy-pages/index.module.css";

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

export default function LandingPageClient() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInType, setSignInType] = useState(SignInType.Phonenumber);
  const [preUserToken, setPreUserToken] = useState("");
  const [hasMounted, setHasMounted] = useState(false);

  const page2Ref = useRef<HTMLDivElement>(null);
  const page4Ref = useRef<HTMLDivElement>(null);
  const page9Ref = useRef<HTMLDivElement>(null);

  const [themeState, dispatch] = useReducer(themeReducer, {
    themeMode: "light mode",
    darkTheme: undefined,
    language: "en",
  });

  useEffect(() => {
    setHasMounted(true);
    const theme = window.localStorage.getItem("theme");
    let lng = window.localStorage.getItem("language");

    if (!lng) {
      applyDetectedLocale(i18n.changeLanguage);
      lng = window.localStorage.getItem("language") || "en";
    }

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

  const scrollToSection = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  const handleMenuClickWithScroll = useCallback(
    (targetRef: React.RefObject<HTMLDivElement | null>) => {
      setTimeout(() => {
        scrollToSection(targetRef);
      }, 100);
    },
    [scrollToSection],
  );

  const handleShowCreateSignIn = useCallback(() => {
    setPreUserToken("");
    setSignInType(SignInType.Phonenumber);
    setShowSignIn(true);
  }, []);

  const removeMask = useCallback(() => {
    setShowSignIn(false);
  }, []);

  const handleShowVerification = useCallback((newPreUserToken: string) => {
    setPreUserToken(newPreUserToken);
    setSignInType(SignInType.VerificaionCode);
    setShowSignIn(true);
  }, []);

  const checkFirstLogin = useCallback(async () => {
    router.push("/user/instagramerLogin");
  }, [router]);

  const handleQueryInRoute = useCallback(async () => {
    if (!session) return;

    const params = new URLSearchParams(window.location.search);
    const role = params.get("role");
    const redirectUrl = params.get("redirectUrl");
    const source = params.get("source");

    if (role && redirectUrl) {
      if (role === "user") {
        try {
          if (session?.user.currentIndex > -1) {
            await update({
              ...session,
              user: {
                currentIndex: -1,
              },
            });
          }
          router.replace(redirectUrl);
          return;
        } catch (error) {
          console.error("Error storing role in localStorage:", error);
        }
      }
    }

    if (source === "pwa" || !role || !redirectUrl) {
      if (session?.user.currentIndex > -1) {
        router.push("/home");
      } else {
        checkFirstLogin();
      }
      return;
    }

    if (session?.user.currentIndex > -1) {
      router.push("/home");
    } else {
      checkFirstLogin();
    }
  }, [session, update, router, checkFirstLogin]);

  useEffect(() => {
    if (session && hasMounted) {
      handleQueryInRoute();
    }
  }, [session, hasMounted, handleQueryInRoute]);

  useEffect(() => {
    if (!session && hasMounted) {
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }, 100);
    }
  }, [session, hasMounted]);

  if (!hasMounted || status === "loading") return null;

  if (!session) {
    return (
      <>
        <LandingHeader
          themeState={themeState}
          dispatch={dispatch}
          onShowCreateSignIn={handleShowCreateSignIn}
          onMenuClickWithScroll={handleMenuClickWithScroll}
          onScrollToSection={scrollToSection}
          page2Ref={page2Ref}
          page4Ref={page4Ref}
          page9Ref={page9Ref}
        />

        <div className={styles.maincontainer}>
          <Page1 handleShowVerification={handleShowVerification} />
          <div style={{ width: "100%", justifyItems: "center" }} ref={page2Ref}>
            <Page2 />
          </div>
          <div style={{ width: "100%", justifyItems: "center" }} ref={page4Ref}>
            <Page4 />
          </div>
          <Page5 />
          <div style={{ justifyItems: "center" }} ref={page9Ref}>
            <Page9 handleShowCreateSignIn={handleShowCreateSignIn} />
          </div>
          <Page8 />
        </div>

        <Footer />

        {showSignIn && (signInType === SignInType.Phonenumber || signInType === SignInType.VerificaionCode) && (
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
  }

  return null;
}
