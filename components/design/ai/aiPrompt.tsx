import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import TextArea from "../textArea/textArea";
import { LanguageKey } from "../../../i18n";
import styles from "./aiPrompt.module.css";

export default function AiPrompt({
  aiLoading,
  handleAIPromptSubmit,
  onClose,
  tags,
}: {
  aiLoading: boolean;
  handleAIPromptSubmit: (prompt: string) => void;
  onClose?: () => void;
  tags: string[];
}) {
  const { t } = useTranslation();
  const [aiPrompt, setAiPrompt] = useState("");
  const popupRef = useRef<HTMLDivElement>(null);
  const handleAIPromptChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setAiPrompt(e.target.value);
  }, []);
  const handleAIKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        const value = e.currentTarget.value.trim();
        if (!value || aiLoading) return;
        e.preventDefault();
        handleAIPromptSubmit(value);
        setAiPrompt(""); // Clear input after submit
      } else if (e.key === "Escape") {
        onClose?.();
      }
    },
    [handleAIPromptSubmit, aiLoading, onClose]
  );
  const handleSubmit = useCallback(() => {
    const value = aiPrompt.trim();
    if (!value || aiLoading) return;
    handleAIPromptSubmit(value);
    setAiPrompt(""); // Clear input after submit
  }, [aiPrompt, handleAIPromptSubmit, aiLoading]);
  const handleTagClick = useCallback(
    (tagText: string) => {
      if (aiLoading) return;
      setAiPrompt((prevPrompt) => {
        const trimmedPrompt = prevPrompt.trim();
        return trimmedPrompt ? `${trimmedPrompt} ${tagText}` : tagText;
      });
    },
    [aiLoading]
  );
  // Handle clicks outside the popup to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);
  return (
    <div ref={popupRef} className={styles.aiPromptPopup}>
      <div className={styles.containerChatOptions}>
        <div className={styles.fadecircle} />

        {aiLoading ? (
          <div className={styles.loadingContainer}>
            <svg
              className={styles.sparkle}
              width="20px"
              style={{ zIndex: 5, position: "relative" }}
              fill="#FFF"
              stroke="#FFF"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24">
              <path d="m14.2 8.1.8-2.8.8 2.8a5 5 0 0 0 3.1 3l2.9.9-2.9.8a5 5 0 0 0-3 3.1l-.9 2.8-.8-2.8a5 5 0 0 0-3.1-3L8.3 12l2.8-.8a5 5 0 0 0 3-3.1" />
              <path d="m6 14.3-.3 1a3 3 0 0 1-2.4 2.4l-1 .3 1 .3a3 3 0 0 1 2.4 2.4l.3 1 .3-1a3 3 0 0 1 2.4-2.4l1-.3-1-.3a3 3 0 0 1-2.4-2.4z" />
              <path d="m6.5 4-.2.6a1 1 0 0 1-.7.7l-.6.2.6.2a1 1 0 0 1 .7.7l.2.6.2-.6a1 1 0 0 1 .7-.7l.6-.2-.6-.2a1 1 0 0 1-.7-.7z" />
            </svg>
            <span className={styles.loadingText}>{t(LanguageKey.Generating)}</span>
          </div>
        ) : (
          <TextArea
            id="ai-prompt-textarea"
            name="aiPrompt"
            className="captiontextarea"
            value={aiPrompt}
            handleInputChange={handleAIPromptChange}
            handleKeyDown={handleAIKeyDown}
            placeHolder={t(LanguageKey.ImagineSomething)}
            // className="textarea"
            role="textbox"
            title="AI Prompt Input"
            autoFocus
          />
        )}

        {!aiLoading && (
          <div className={styles.options}>
            <span className="explain">{t(LanguageKey.Aipromptexplain)}</span>

            {/* <div className={styles.btnsAdd}>
              <button type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 8v8a5 5 0 1 0 10 0V6.5a3.5 3.5 0 1 0-7 0V15a2 2 0 0 0 4 0V8"
                  />
                </svg>
              </button>
              <button type="button">
                <svg viewBox="0 0 24 24" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm0 10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zm0-8h6m-3-3v6"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                  />
                </svg>
              </button>
              <button type="button">
                <svg viewBox="0 0 24 24" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20m-2.3-2.3A18 18 0 0 1 8 13H4a8 8 0 0 0 5.7 6.7M10 13a16 16 0 0 0 2 6.8 16 16 0 0 0 2-6.8zm10 0h-4a18 18 0 0 1-1.7 6.7 8 8 0 0 0 5.6-6.7M4.1 11h4a18 18 0 0 1 1.6-6.7A8 8 0 0 0 4.1 11m6 0H14a16 16 0 0 0-2-6.8 16 16 0 0 0-2 6.8m4.3-6.7A18 18 0 0 1 16 11h4a8 8 0 0 0-5.7-6.7"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div> */}
            <button
              className={styles.btnSubmit}
              onClick={handleSubmit}
              disabled={!aiPrompt.trim()}
              title="Send AI prompt">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20"
                width="20"
                fill="none"
                color="#fff"
                viewBox="0 0 24 24">
                <path
                  opacity=".4"
                  d="M12 4.8c4.7-1.6 7-2.5 8.4-1.2 1.3 1.3.4 3.7-1.2 8.5l-1.1 3.2c-1.2 3.7-1.9 5.5-2.9 5.7h-.8c-1-.4-1.6-2.4-2.7-6.2q-.2-1.2-.6-1.6l-.3-.3q-.4-.4-1.6-.6c-3.8-1.1-5.8-1.6-6.1-2.7q-.2-.3 0-.8 0-1.3 5.6-2.9z"
                  fill="#fff"
                />
                <path
                  d="M12 4.8c4.7-1.6 7-2.5 8.4-1.2 1.3 1.3.4 3.7-1.2 8.5l-1.1 3.2c-1.2 3.7-1.9 5.5-2.9 5.7h-.8c-1-.4-1.6-2.4-2.7-6.2q-.2-1.2-.6-1.6l-.3-.3q-.4-.4-1.6-.6c-3.8-1.1-5.8-1.6-6.1-2.7q-.2-.3 0-.8 0-1.3 5.6-2.9z"
                  stroke="#fff"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
      <div className={styles.tags}>
        {tags.map((t, i) => (
          <span key={i} onClick={() => handleTagClick(t)}>
            {t}
          </span>
        ))}
        {/* <span
          onClick={() => handleTagClick(t(LanguageKey.WithStrongCallToAction))}
        >
          {t(LanguageKey.WithStrongCallToAction)}
        </span>
        <span onClick={() => handleTagClick(t(LanguageKey.WithProsAndCons))}>
          {t(LanguageKey.WithProsAndCons)}
        </span>
        <span onClick={() => handleTagClick(t(LanguageKey.ForComparison))}>
          {t(LanguageKey.ForComparison)}
        </span>
        <span onClick={() => handleTagClick(t(LanguageKey.WithKeyPoints))}>
          {t(LanguageKey.WithKeyPoints)}
        </span>
        <span onClick={() => handleTagClick(t(LanguageKey.ForPromotionalPost))}>
          {t(LanguageKey.ForPromotionalPost)}
        </span>
        <span
          onClick={() => handleTagClick(t(LanguageKey.WithDetailedExplanation))}
        >
          {t(LanguageKey.WithDetailedExplanation)}
        </span>
        <span onClick={() => handleTagClick(t(LanguageKey.PersuasiveStyle))}>
          {t(LanguageKey.PersuasiveStyle)}
        </span>
        <span
          onClick={() => handleTagClick(t(LanguageKey.ForProductIntroduction))}
        >
          {t(LanguageKey.ForProductIntroduction)}
        </span>
        <span onClick={() => handleTagClick(t(LanguageKey.LongText))}>
          {t(LanguageKey.LongText)}
        </span> */}
      </div>
    </div>
  );
}
