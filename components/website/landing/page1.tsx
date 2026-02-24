import Head from "next/head";
import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { detectLocaleFromTimezone } from "brancy/helper/detectLocaleFromTimezone";
import { LanguageKey } from "brancy/i18n";
import styles from "./page1.module.css";

const LandingSignIn = lazy(() => import("brancy/components/signIn/landingSignIn"));
const GoogleLoginButton = lazy(() => import("brancy/components/signIn/googleLoginPopup"));
interface Page1Props {
  handleShowVerification: (preUserToken: string) => void;
}

const Page1 = ({ handleShowVerification }: Page1Props) => {
  const { t, i18n } = useTranslation();

  // Refs
  const sectionRef = useRef<HTMLElement>(null);
  const currentIndexRef = useRef(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isUnmountedRef = useRef(false);

  // State
  const [isVisible, setIsVisible] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [currentFocusIndex, setCurrentFocusIndex] = useState(-1);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isIranTimezone, setIsIranTimezone] = useState(false);
  const [showLandingSignIn, setShowLandingSignIn] = useState(false);
  const [hideGoogleSpan, setHideGoogleSpan] = useState(false);

  // Memoized values
  const rotatingTexts = useMemo(
    () => [
      t(LanguageKey.page1_services),
      t(LanguageKey.page1_analytics),
      t(LanguageKey.page1_transportation),
      t(LanguageKey.page1_financial_solutions),
      t(LanguageKey.page1_customer_communication),
      t(LanguageKey.page1_content_management),
      t(LanguageKey.page1_artificial_intelligence),
      t(LanguageKey.page1_tools),
      t(LanguageKey.page1_advertises),
    ],
    [t, i18n.language]
  );

  const rotatingContainerStyle = useMemo<React.CSSProperties>(
    () => ({
      display: "flex",

      position: "relative",
      overflow: "hidden",
      transition: "opacity 0.3s ease-in-out",
    }),
    []
  );

  const svgLineElements = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => (
        <img
          key={`svgline-${i + 1}`}
          className={styles[`svgline${i + 1}`]}
          src={`/landing/hiro_svgline${i + 1}.svg`}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />
      )),
    []
  );

  const heroElements = useMemo(() => {
    const elements = [
      {
        key: "element1",
        className: styles.element1,
        iconClass: styles.svgicon5,
        imgClass: styles.svgimg1,
        imgSrc: "/landing/hiroimg1.png",
        imgAlt: "Hero interface screenshot showing main dashboard",
        icons: [1, 2, 3, 1, 2, 3].map((num, index) => ({
          key: `svgicon1_${index}`,
          src: `/landing/svgicon_1_${num}.svg`,
        })),
      },
      {
        key: "element2",
        className: styles.element2,
        iconClass: styles.svgicon4,
        imgClass: styles.svgimg2,
        imgSrc: "/landing/hiroimg2.png",
        imgAlt: "Dashboard analytics view with charts and graphs",
        icons: Array(6)
          .fill(0)
          .map((_, i) => ({
            key: `svgicon2_${i}`,
            src: "/landing/svgicon_2_1.svg",
          })),
      },
      {
        key: "element3",
        className: styles.element3,
        iconClass: styles.svgicon2,
        imgClass: styles.svgimg3,
        imgSrc: "/landing/hiroimg3.png",
        imgAlt: "Transport management interface with logistics tracking",
        icons: Array(2)
          .fill([1, 2, 3])
          .flat()
          .map((num, index) => ({
            key: `svgicon3_${index}`,
            src: `/landing/svgicon_3_${num}.svg`,
          })),
      },
      {
        key: "element4",
        className: styles.element4,
        iconClass: styles.svgicon3,
        imgClass: styles.svgimg4,
        imgSrc: "/landing/hiroimg4.png",
        imgAlt: "Financial solutions dashboard with payment processing",
        icons: Array(6)
          .fill(0)
          .map((_, i) => ({
            key: `svgicon4_${i}`,
            src: "/landing/svgicon_4_1.svg",
          })),
      },
      {
        key: "element5",
        className: styles.element5,
        iconClass: styles.svgicon1,
        imgClass: styles.svgimg5,
        imgSrc: "/landing/hiroimg5.png",
        imgAlt: "AI tools interface with machine learning features",
        icons: [1, 2, 3, 4, 5, 6].map((num) => ({
          key: `svgicon5_${num}`,
          src: `/landing/svgicon_5_${num}.svg`,
        })),
      },
    ];

    return elements;
  }, []);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    if (isUnmountedRef.current) return;

    entries.forEach((entry) => {
      setIsVisible(entry.isIntersecting);
    });
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isUnmountedRef.current) return;

      switch (event.key) {
        case "ArrowDown":
        case "ArrowRight":
          event.preventDefault();
          setCurrentFocusIndex((prev) => Math.min(prev + 1, heroElements.length - 1));
          break;
        case "ArrowUp":
        case "ArrowLeft":
          event.preventDefault();
          setCurrentFocusIndex((prev) => Math.max(prev - 1, -1));
          break;
        case "Escape":
          event.preventDefault();
          setCurrentFocusIndex(-1);
          break;
        case "Enter":
        case " ":
          if (currentFocusIndex >= 0 && currentFocusIndex < heroElements.length) {
            event.preventDefault();
            // Focus on the selected element
            const element = document.querySelector(`[data-hero-index="${currentFocusIndex}"]`) as HTMLElement;
            element?.focus();
          }
          break;
      }
    },
    [currentFocusIndex, heroElements.length]
  );

  // Effects
  useLayoutEffect(() => {
    if (rotatingTexts.length > 0) {
      setCurrentTextIndex(0);
      setDisplayText(rotatingTexts[0]);
    }
  }, [rotatingTexts]);

  useEffect(() => {
    if (rotatingTexts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % rotatingTexts.length;

        setDisplayText(rotatingTexts[newIndex]);
        return newIndex;
      });
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [rotatingTexts]);

  useEffect(() => {
    if (!sectionRef.current || isUnmountedRef.current) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: "100px",
    });

    observerRef.current.observe(sectionRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [handleIntersection]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    // Check if user is in Iran timezone
    const localeSettings = detectLocaleFromTimezone();
    setIsIranTimezone(localeSettings.countryCode === "ir");

    return () => {
      isUnmountedRef.current = true;
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <>
      <Head>
        <link rel="preload" as="image" href="/landing/hiroimg1.png" />
        <link rel="preload" as="image" href="/landing/hiroimg2.png" />
        <link rel="preload" as="image" href="/landing/hiroimg3.png" />
      </Head>
      <main ref={sectionRef} className={styles.page1} role="main" aria-label={t(LanguageKey.page1_text1)}>
        <section className={styles.hiroesignin} aria-labelledby="hero-title">
          <header className={styles.hirotitleall}>
            <h1 id="hero-title" className="sr-only">
              {t(LanguageKey.page1_text1)}
            </h1>
            {t(LanguageKey.page1_text1)}
            <div className={styles.test}>
              <span> {t(LanguageKey.page1_text2)}</span>
              <div style={rotatingContainerStyle} role="status" aria-live="polite" aria-label="Rotating services text">
                <span className={styles.text1}>{displayText}</span>
              </div>
            </div>
          </header>
          <div className={styles.quicksigninparent}>
            <div className={styles.quicksignin}>
              <div className={styles.quicksignintext}>{t(LanguageKey.page1_StartNow)}</div>
              <Suspense fallback={<div aria-label="Loading">{t(LanguageKey.loading)}</div>}>
                {isIranTimezone ? (
                  <LandingSignIn handleShowVerification={handleShowVerification} />
                ) : (
                  <div className={styles.twowaysignin} aria-label="Sign in options">
                    <GoogleLoginButton
                      googleAuthUrl={`https://accounts.google.com/o/oauth2/v2/auth?client_id=${
                        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
                      }&redirect_uri=${encodeURIComponent(
                        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}googleoauth`
                      )}&response_type=code&scope=${encodeURIComponent(
                        "openid email profile"
                      )}&access_type=offline&prompt=consent`}
                      onSuccess={() => {
                        console.log("Google login successful");
                      }}
                      onError={(error) => {
                        console.error("Google login error:", error);
                      }}>
                      <div className={styles.googlesigninbutton}>
                        <img src="/google.png" alt="Google" style={{ width: "20px", height: "20px" }} />
                        {!hideGoogleSpan && <span>{t(LanguageKey.loginWithGoogle)}</span>}
                      </div>
                    </GoogleLoginButton>

                    {showLandingSignIn && <LandingSignIn handleShowVerification={handleShowVerification} />}
                    {!showLandingSignIn && (
                      <div
                        onClick={() => {
                          setShowLandingSignIn(true);
                          setHideGoogleSpan(true);
                        }}
                        className={styles.googlesigninbutton}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="25"
                          fill="none"
                          fillRule="evenodd"
                          clipRule="evenodd">
                          <path
                            opacity=".4"
                            d="M12 1.3H7q-1.5.2-2.5 1.2T3.4 5l-.1 3.8v10q.2 1.6 1.2 2.6T7 22.6l4 .1h3.8q1.6-.2 2.6-1.2t1.1-2.6l.1-3.8v-4l-1.3.7-.9.2-.9-.2-2-1.2A6 6 0 0 1 11 5.5V3a2 2 0 0 1 1-1.7 M9.3 20q0-.7.7-.8h2a.8.8 0 0 1 0 1.5h-2a1 1 0 0 1-.7-.7"
                            fill="var(--background-root)"
                          />
                          <path
                            d="M16.5 1.3h.4l.9.5a6 6 0 0 0 2.2.5q.7 0 .8.7v2.5c0 2-1 3.4-2 4.2l-1.4.8-.9.2-.9-.2-1.3-.8c-1-.8-2-2.2-2-4.2V3q0-.6.7-.7a6 6 0 0 0 3-1z"
                            fill="var(--background-root)"
                          />
                        </svg>
                        <span>{t(LanguageKey.loginWithMobile)}</span>
                      </div>
                    )}
                  </div>
                )}
              </Suspense>
            </div>
            <div className={styles.rainbowbackground} aria-hidden="true"></div>
            <div className={styles.quicksigninfade} aria-hidden="true"></div>
          </div>
        </section>

        <section className={styles.hiroelements} aria-label="Platform features showcase">
          <div className={styles.hirosvg} aria-hidden="true">
            {svgLineElements}
          </div>
          <div className={styles.hiroimg}>
            {heroElements.map((element, index) => (
              <div
                key={element.key}
                className={element.className}
                data-hero-index={index}
                tabIndex={currentFocusIndex === index ? 0 : -1}
                role="img"
                aria-label={element.imgAlt}
                onFocus={() => setCurrentFocusIndex(index)}
                onBlur={() => setCurrentFocusIndex(-1)}>
                <div className={element.iconClass} aria-hidden="true">
                  {element.icons.map((icon) => (
                    <img
                      key={icon.key}
                      className={styles.svgiconchild}
                      src={icon.src}
                      alt=""
                      aria-hidden="true"
                      width={30}
                      height={30}
                      loading="lazy"
                      decoding="async"
                    />
                  ))}
                </div>
                <img
                  className={element.imgClass}
                  src={element.imgSrc}
                  alt={element.imgAlt}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
};
Page1.displayName = "Page1";
export default Page1;
