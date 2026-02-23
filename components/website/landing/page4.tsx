import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "../../../i18n";
import styles from "./page4.module.css";

const SLIDE_DURATION = 5000;
const ANIMATION_DURATION = 300;
const VISIBLE_ITEMS_COUNT = 7;

type State = {
  activeIndex: number;
  isAnimating: boolean;
  animationStates: {
    title: boolean;
    text: boolean;
    picture: boolean;
  };
  isPlaying: boolean;
  progress: number;
  iteration: number;
};

type Action =
  | { type: "SET_ACTIVE_INDEX"; payload: number }
  | { type: "SET_ANIMATING"; payload: boolean }
  | { type: "SET_ANIMATION_STATES"; payload: State["animationStates"] }
  | { type: "SET_PLAYING"; payload: boolean }
  | { type: "SET_PROGRESS"; payload: number }
  | { type: "SET_ITERATION"; payload: number };

const initialState: State = {
  activeIndex: 0,
  isAnimating: false,
  animationStates: { title: false, text: false, picture: false },
  isPlaying: true,
  progress: 0,
  iteration: 0,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_ACTIVE_INDEX":
      return { ...state, activeIndex: action.payload };
    case "SET_ANIMATING":
      return { ...state, isAnimating: action.payload };
    case "SET_ANIMATION_STATES":
      return { ...state, animationStates: action.payload };
    case "SET_PLAYING":
      return { ...state, isPlaying: action.payload };
    case "SET_PROGRESS":
      return { ...state, progress: action.payload };
    case "SET_ITERATION":
      return { ...state, iteration: action.payload };
    default:
      return state;
  }
};

const Page4 = () => {
  const { t, ready } = useTranslation();
  const [state, dispatch] = useReducer(reducer, initialState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLUListElement>(null);

  const menuItemKeys = useMemo(
    () =>
      [
        LanguageKey.page4_menu_instagram_management,
        LanguageKey.page4_menu_admin_subadmin,
        LanguageKey.page4_menu_store_shipping,
        LanguageKey.page4_menu_advertising,
        LanguageKey.page4_menu_hashtag_management,
        LanguageKey.page4_menu_ai_analysis,
        LanguageKey.page4_menu_ad_scheduling,
        LanguageKey.page4_menu_financial_wallet,
        LanguageKey.page4_menu_page_statistics,
        LanguageKey.page4_menu_professional_messaging,
      ] as const,
    []
  );

  const contentDataKeys = useMemo(
    () =>
      [
        {
          title: "",
          textKey: LanguageKey.page4_content_instagram_management_text,
          image: "./path-to-your-image.svg",
        },
        {
          title: "",
          textKey: LanguageKey.page4_content_admin_subadmin_text,
          image: "./path-to-your-image1.svg",
        },
        {
          title: "",
          textKey: LanguageKey.page4_content_store_shipping_text,
          image: "./path-to-your-image2.svg",
        },
        {
          title: "",
          textKey: LanguageKey.page4_content_advertising_text,
          image: "./path-to-your-image3.svg",
        },
        {
          title: "",
          textKey: LanguageKey.page4_content_hashtag_management_text,
          image: "./path-to-your-image4.svg",
        },
        {
          title: "",
          textKey: LanguageKey.page4_content_ai_analysis_text,
          image: "./path-to-your-image5.svg",
        },
        {
          title: "",
          textKey: LanguageKey.page4_content_ad_scheduling_text,
          image: "./path-to-your-image6.svg",
        },
        {
          title: "",
          textKey: LanguageKey.page4_content_financial_wallet_text,
          image: "./path-to-your-image7.svg",
        },
        {
          title: "",
          textKey: LanguageKey.page4_content_page_statistics_text,
          image: "./path-to-your-image8.svg",
        },
        {
          title: "",
          textKey: LanguageKey.page4_content_professional_messaging_text,
          image: "./path-to-your-image9.svg",
        },
      ] as const,
    []
  );
  // Convert menu items using translation
  const menuItems = useMemo(() => menuItemKeys.map((key) => t(key)), [t, menuItemKeys, ready]);

  // Convert content data using translation
  const contentData = useMemo(
    () =>
      contentDataKeys.map((item) => ({
        title: item.title,
        text: t(item.textKey),
        image: item.image,
      })),
    [t, contentDataKeys, ready]
  );

  const getVisibleItems = useCallback(() => {
    const half = Math.floor(VISIBLE_ITEMS_COUNT / 2);
    const start = state.activeIndex - half;

    return Array.from({ length: VISIBLE_ITEMS_COUNT }, (_, i) => {
      const index = (start + i + menuItems.length) % menuItems.length;
      const distance = Math.abs(start + i - state.activeIndex);

      return {
        index,
        item: menuItems[index],
        isActive: index === state.activeIndex,
        position: start + i - state.activeIndex,
        distance,
      };
    });
  }, [state.activeIndex, menuItems]);

  const handleAnimation = useCallback((callback: () => void) => {
    dispatch({ type: "SET_ANIMATING", payload: true });
    dispatch({ type: "SET_ANIMATION_STATES", payload: { title: true, text: true, picture: true } });

    const animationTimeout = setTimeout(() => {
      callback();
      dispatch({ type: "SET_ANIMATING", payload: false });
    }, ANIMATION_DURATION);

    const resetTimeout = setTimeout(() => {
      dispatch({ type: "SET_ANIMATION_STATES", payload: { title: false, text: false, picture: false } });
    }, ANIMATION_DURATION * 2);

    return () => {
      clearTimeout(animationTimeout);
      clearTimeout(resetTimeout);
    };
  }, []);

  const handleNext = useCallback(() => {
    if (!state.isAnimating) {
      handleAnimation(() => {
        dispatch({ type: "SET_ACTIVE_INDEX", payload: (state.activeIndex + 1) % menuItems.length });
        dispatch({ type: "SET_ITERATION", payload: (state.iteration + 1) % 10 });
      });
    }
  }, [state.isAnimating, state.activeIndex, state.iteration, handleAnimation, menuItems.length]);

  const handleBack = useCallback(() => {
    if (!state.isAnimating) {
      handleAnimation(() => {
        dispatch({ type: "SET_ACTIVE_INDEX", payload: (state.activeIndex - 1 + menuItems.length) % menuItems.length });
        dispatch({ type: "SET_ITERATION", payload: (state.iteration - 1 + 10) % 10 });
      });
    }
  }, [state.isAnimating, state.activeIndex, state.iteration, handleAnimation, menuItems.length]);

  const handlePaginationClick = useCallback(
    (index: number) => {
      if (!state.isAnimating && index !== state.activeIndex) {
        handleAnimation(() => {
          dispatch({ type: "SET_ACTIVE_INDEX", payload: index });
        });
      }
    },
    [state.isAnimating, state.activeIndex, handleAnimation]
  );

  const togglePlayPause = useCallback(() => {
    dispatch({ type: "SET_PLAYING", payload: !state.isPlaying });
  }, [state.isPlaying]);

  useEffect(() => {
    if (!state.isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = (elapsed / SLIDE_DURATION) * 100;
      dispatch({ type: "SET_PROGRESS", payload: newProgress });

      if (newProgress >= 100) {
        handleNext();
        startTimeRef.current = Date.now();
        dispatch({ type: "SET_PROGRESS", payload: 0 });
      }
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isPlaying, handleNext]);

  const visibleItems = useMemo(() => getVisibleItems(), [getVisibleItems]);

  const titleContent = useMemo(() => {
    const text = t(LanguageKey.page3_text1);
    const words = text.split(" ");
    if (words.length < 2) return text;

    return (
      <>
        {words[0] + " "}
        <span>{words[1]}</span>
        {words.length > 2 ? " " + words.slice(2).join(" ") : ""}
      </>
    );
  }, [t, ready]);

  const currentContent = useMemo(() => contentData[state.activeIndex], [state.activeIndex, contentData]);

  if (!ready) {
    return null; // or a loading component
  }

  return (
    <section className={styles.page4}>
      <div className={styles.ellipse} />
      <div className={styles.header}>
        <div className={styles.goli} />
        <div className={styles.title}>{titleContent}</div>
      </div>

      <div className={styles.container}>
        <button
          className={styles.playPauseButton}
          onClick={togglePlayPause}
          aria-label={state.isPlaying ? "Pause" : "Play"}
          style={
            { "--button-opacity": `${Math.round((1 - state.progress / 100) * 100) / 100}` } as React.CSSProperties
          }>
          <div className={`${styles.progressRing} ${state.isPlaying ? styles.playing : styles.paused}`}>
            <svg viewBox="0 0 100 100">
              <circle fill="none" className="bg" cx="50" cy="50" r="48" />
              <circle
                fill="none"
                className="progress"
                cx="50"
                cy="50"
                r="48"
                style={{ strokeDashoffset: `${360 - (360 * state.progress) / 100}` }}
              />
            </svg>
          </div>
          {state.isPlaying ? (
            <svg fillRule="evenodd" clipRule="evenodd" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
            </svg>
          ) : (
            <svg fillRule="evenodd" clipRule="evenodd" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div className={styles.sidebar}>
          <div className={styles.sidebararrow}>
            <svg
              fillRule="evenodd"
              clipRule="evenodd"
              onClick={handleBack}
              className={styles.arrowUp}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              width="30"
              viewBox="0 0 49 49">
              <circle strokeWidth="3" cx="24.5" cy="24.5" r="23.5" stroke="var(--color-gray60)" />
              <path
                fill="var(--color-gray)"
                d="m27.7 16.4-1-.8a3 3 0 0 0-3.6 0l-.8.9a38 38 0 0 0-6.7 10l-.6 2q0 .9.4 1.6.4 1 1.5 1.4c.4.2 1.7.4 1.7.4q2.4.5 6.4.5 3.8 0 6.1-.4s1.7-.3 2.2-.6a3 3 0 0 0 1.7-2.7v-.1l-.7-2.3c-1-2.6-4.4-7.8-6.6-9.9"
              />
            </svg>

            <div className={styles.circle}>
              {menuItems.map((_, index) => (
                <span
                  key={index}
                  className={`${index === state.activeIndex ? styles.active : ""} ${styles.paginationDot}`}
                  onClick={() => handlePaginationClick(index)}
                  style={
                    {
                      "--position": index - state.activeIndex,
                      "--distance": Math.abs(index - state.activeIndex),
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>

            <svg
              fillRule="evenodd"
              clipRule="evenodd"
              onClick={handleNext}
              className={styles.arrowDown}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              width="30"
              viewBox="0 0 49 49">
              <circle strokeWidth="3" cx="24.5" cy="24.5" r="23.5" stroke="var(--color-gray60)" />
              <path
                fill="var(--color-gray)"
                d="m27.7 16.4-1-.8a3 3 0 0 0-3.6 0l-.8.9a38 38 0 0 0-6.7 10l-.6 2q0 .9.4 1.6.4 1 1.5 1.4c.4.2 1.7.4 1.7.4q2.4.5 6.4.5 3.8 0 6.1-.4s1.7-.3 2.2-.6a3 3 0 0 0 1.7-2.7v-.1l-.7-2.3c-1-2.6-4.4-7.8-6.6-9.9"
              />
            </svg>
          </div>

          <ul className={`${styles.cards} ${state.isAnimating ? styles.animating : ""}`} ref={containerRef}>
            {visibleItems.map(({ index, item, isActive, position, distance }) => (
              <li
                key={index}
                className={`${isActive ? styles.active : ""} ${styles.menuItem}`}
                onClick={() => handlePaginationClick(index)}
                style={
                  {
                    "--position": position,
                    "--distance": distance,
                  } as React.CSSProperties
                }>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.content}>
          <div className={styles.contentdetail}>
            <h2 className={`${styles.page4title} ${state.animationStates.title ? styles.titleAnimate : ""}`}>
              {currentContent.title}
            </h2>
            <p className={`${styles.page4explain} ${state.animationStates.text ? styles.textAnimate : ""}`}>
              {currentContent.text}
            </p>
          </div>
          <div className={styles.contentimg}>
            <svg
              fillRule="evenodd"
              clipRule="evenodd"
              onClick={handleBack}
              className={styles.arrowLeft}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              width="30"
              viewBox="0 0 49 49">
              <circle strokeWidth="3" cx="24.5" cy="24.5" r="23.5" stroke="var(--color-gray60)" />
              <path
                fill="var(--color-gray)"
                d="m27.7 16.4-1-.8a3 3 0 0 0-3.6 0l-.8.9a38 38 0 0 0-6.7 10l-.6 2q0 .9.4 1.6.4 1 1.5 1.4c.4.2 1.7.4 1.7.4q2.4.5 6.4.5 3.8 0 6.1-.4s1.7-.3 2.2-.6a3 3 0 0 0 1.7-2.7v-.1l-.7-2.3c-1-2.6-4.4-7.8-6.6-9.9"
              />
            </svg>
            {/* <div className={`${styles.imageWrapper} ${state.animationStates.picture ? styles.picAnimate : ""}`}>
              <img

                className={styles.page2img}
                src={currentContent.image}
                alt={currentContent.title}
              />
            </div> */}
            <svg
              fillRule="evenodd"
              clipRule="evenodd"
              onClick={handleNext}
              className={styles.arrowRight}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              width="30"
              viewBox="0 0 49 49">
              <circle cx="24.5" cy="24.5" r="23.5" stroke="var(--color-gray60)" />
              <path
                fill="var(--color-gray)"
                d="m27.7 16.4-1-.8a3 3 0 0 0-3.6 0l-.8.9a38 38 0 0 0-6.7 10l-.6 2q0 .9.4 1.6.4 1 1.5 1.4c.4.2 1.7.4 1.7.4q2.4.5 6.4.5 3.8 0 6.1-.4s1.7-.3 2.2-.6a3 3 0 0 0 1.7-2.7v-.1l-.7-2.3c-1-2.6-4.4-7.8-6.6-9.9"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page4;
