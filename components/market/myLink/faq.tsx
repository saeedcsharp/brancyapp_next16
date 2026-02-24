import React, { memo, useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import { IFaq } from "brancy/models/market/myLink";
import styles from "./faq.module.css";

// Types
interface FaqItem {
  id: string;
  question: string;
  answer: string;
  counter: number;
}

interface FaqState {
  isContentVisible: boolean;
  selectedQuestion: string | null;
}

type FaqAction =
  | { type: "TOGGLE_CONTENT_VISIBILITY" }
  | { type: "SELECT_QUESTION"; payload: string }
  | { type: "CLOSE_ALL_QUESTIONS" };

// Reducer
const faqReducer = (state: FaqState, action: FaqAction): FaqState => {
  switch (action.type) {
    case "TOGGLE_CONTENT_VISIBILITY":
      return { ...state, isContentVisible: !state.isContentVisible };
    case "SELECT_QUESTION":
      return {
        ...state,
        selectedQuestion: state.selectedQuestion === action.payload ? null : action.payload,
      };
    case "CLOSE_ALL_QUESTIONS":
      return { ...state, selectedQuestion: null };
    default:
      return state;
  }
};

const initialState: FaqState = {
  isContentVisible: true,
  selectedQuestion: null,
};

const Faq = memo(({ data }: { data: IFaq | null }) => {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(faqReducer, initialState);
  const faqRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentFocusIndex = useRef<number>(-1);

  // Memoized data
  const faqHeaderText = useMemo(() => {
    const faqText = t(LanguageKey.footer_FAQ);
    const words = faqText.split(" ");
    return {
      mainText: words.slice(0, -1).join(" "),
      highlightedText: words.slice(-1)[0],
    };
  }, [t]);

  const faqItems = useMemo((): FaqItem[] => {
    if (!data?.faqs?.length) return [];
    return data.faqs.slice(0, 4).map((faq, index) => ({
      id: `faq${index + 1}`,
      question: faq.question,
      answer: faq.answer,
      counter: index + 1,
    }));
  }, [data?.faqs]);

  // Event handlers
  const toggleContentVisibility = useCallback(() => {
    dispatch({ type: "TOGGLE_CONTENT_VISIBILITY" });
  }, []);

  const handleQuestionClick = useCallback((questionId: string) => {
    dispatch({ type: "SELECT_QUESTION", payload: questionId });
  }, []);

  // Convert URLs in plain text to clickable links
  const convertLinksToClickable = useCallback((text?: string) => {
    if (!text) return null;
    const regex =
      /(https?:\/\/[\w\-._~:/?#\[\]@!$&'()*+,;=%]+|www\.[^\s]+|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
    const elements: Array<string | React.JSX.Element> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const url = match[0];
      if (start > lastIndex) {
        elements.push(text.slice(lastIndex, start));
      }
      const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      elements.push(
        <a key={`a-${start}`} href={href} target="_blank" rel="noopener noreferrer">
          {url}
        </a>,
      );
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }
    return elements;
  }, []);

  // Keyboard navigation handlers
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          const nextIndex = (index + 1) % faqItems.length;
          faqRefs.current[nextIndex]?.focus();
          currentFocusIndex.current = nextIndex;
          break;
        case "ArrowUp":
          e.preventDefault();
          const prevIndex = index === 0 ? faqItems.length - 1 : index - 1;
          faqRefs.current[prevIndex]?.focus();
          currentFocusIndex.current = prevIndex;
          break;
        case "Home":
          e.preventDefault();
          faqRefs.current[0]?.focus();
          currentFocusIndex.current = 0;
          break;
        case "End":
          e.preventDefault();
          const lastIndex = faqItems.length - 1;
          faqRefs.current[lastIndex]?.focus();
          currentFocusIndex.current = lastIndex;
          break;
        case "Escape":
          e.preventDefault();
          dispatch({ type: "CLOSE_ALL_QUESTIONS" });
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          handleQuestionClick(faqItems[index].id);
          break;
      }
    },
    [faqItems, handleQuestionClick],
  );

  // Update refs array length when items change
  useEffect(() => {
    faqRefs.current = faqRefs.current.slice(0, faqItems.length);
  }, [faqItems.length]);

  if (!data?.faqs?.length) {
    return null;
  }

  return (
    <div key="faq" id="faq" className={styles.all}>
      <header
        className={styles.header}
        onClick={toggleContentVisibility}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleContentVisibility();
          }
        }}
        aria-expanded={state.isContentVisible}
        aria-controls="faq-content"
        aria-labelledby="faq-header">
        <img
          className={styles.headerimg}
          alt=""
          loading="lazy"
          decoding="async"
          src="/marketlink/market-FAQ.webp"
          role="presentation"
          aria-hidden="true"
        />
        <h2 id="faq-header" className={styles.headertext}>
          {faqHeaderText.mainText} <strong className={styles.headertextblue}>{faqHeaderText.highlightedText}</strong>
        </h2>
      </header>
      <section
        id="faq-content"
        className={`${styles.content} ${state.isContentVisible ? styles.show : ""}`}
        aria-hidden={!state.isContentVisible}
        aria-labelledby="faq-header">
        {faqItems.map(({ id, question, answer, counter }, index) => (
          <article key={id} className={styles.faqboxparent}>
            <div className={styles.faqcounter} aria-hidden="true">
              {counter}
            </div>
            <div
              ref={(el) => {
                faqRefs.current[index] = el;
              }}
              className={`${styles.faqbox} ${state.selectedQuestion === id ? styles.active : ""}`}
              onClick={() => handleQuestionClick(id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, index)}
              aria-expanded={state.selectedQuestion === id}
              aria-controls={`${id}-answer`}
              aria-labelledby={`${id}-question`}>
              <div className={styles.question}>
                <span id={`${id}-question`}>{question}</span>
                <img
                  alt={state.selectedQuestion === id ? "Hide answer" : "Show answer"}
                  src="/backSliderStatistics.svg"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div id={`${id}-answer`} className={styles.answer} aria-hidden={state.selectedQuestion !== id}>
                {convertLinksToClickable(answer)}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
});
Faq.displayName = "Faq";
export default Faq;
