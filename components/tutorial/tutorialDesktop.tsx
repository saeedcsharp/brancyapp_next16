import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "saeed/i18n";
import {
  clearHighlights,
  disableBodyScroll,
  enableBodyScroll,
  findTargetElement,
  highlightElement,
} from "./helpers/tutorialTargeting";
import styles from "./tutorialDesktop.module.css";
interface TutorialDesktopProps {
  onComplete: () => void;
  tutorialSteps: Array<{
    title: string;
    content: string;
    target?: string;
    position: {
      top?: string;
      left?: string;
      marginInlineStart?: string;
      marginInlineEnd?: string;
      bottom?: string;
      right?: string;
      transform?: string;
    };
  }>;
}
const TutorialDesktop: React.FC<TutorialDesktopProps> = ({ onComplete, tutorialSteps }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);

    // غیرفعال کردن اسکرول زمان نمایش tutorial
    disableBodyScroll();

    return () => {
      clearTimeout(timer);
      // فعال کردن مجدد اسکرول زمان unmount
      enableBodyScroll();
    };
  }, []);
  useEffect(() => {
    if (tutorialSteps[currentStep].target) {
      const targetElement = findTargetElement(tutorialSteps[currentStep].target!);
      if (targetElement) {
        highlightElement(targetElement, styles.highlighted);
      }
    }
    return () => {
      clearHighlights(styles.highlighted);
    };
  }, [currentStep, tutorialSteps]);
  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleComplete = () => {
    setIsVisible(false);
    clearHighlights(styles.highlighted);
    enableBodyScroll(); // فعال کردن اسکرول قبل از بسته شدن
    setTimeout(() => {
      onComplete();
    }, 300);
  };
  return (
    <>
      <div className={`${styles.tutorialOverlay} ${isVisible ? styles.visible : ""}`} onClick={handleComplete} />
      <div
        className={styles.tooltip}
        style={{
          top: tutorialSteps[currentStep].position.top,
          left: tutorialSteps[currentStep].position.left,
          marginInlineStart: tutorialSteps[currentStep].position.marginInlineStart,
          marginInlineEnd: tutorialSteps[currentStep].position.marginInlineEnd,
          bottom: tutorialSteps[currentStep].position.bottom,
          right: tutorialSteps[currentStep].position.right,
          transform: tutorialSteps[currentStep].position.transform,
        }}>
        <div className={styles.tooltipbackground} />
        <img
          className={styles.closeButton}
          onClick={handleComplete}
          role="button"
          title="ℹ️ close"
          src="/close-box.svg"
        />
        <div className="headerandinput">
          <h3 className={styles.tooltipTitle}>{tutorialSteps[currentStep].title}</h3>
          <p className={styles.tooltipText}>{tutorialSteps[currentStep].content}</p>
        </div>
        <div className={styles.navigation}>
          <div className={styles.stepIndicator}>
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                className={`${styles.stepDot} ${index === currentStep ? styles.active : ""} ${
                  index < currentStep ? styles.completed : ""
                }`}
                onClick={() => setCurrentStep(index)}
                aria-label={`go to ${index + 1}`}
              />
            ))}
          </div>
          <div className="ButtonContainer">
            {currentStep === 0 && (
              <button className="stopButton" onClick={handleComplete}>
                {t(LanguageKey.reject)}
              </button>
            )}
            {currentStep > 0 && (
              <button className="cancelButton" onClick={handlePrevious}>
                <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10" width="12" height="12">
                  <path
                    d="M2 6.5a1.5 1.5 0 0 1 0-3h6.8V2c0-.3.1-1.2 1-1.7s1.8 0 2 .2l1 .8 2.3 2.4q.3.4.4 1.3 0 .8-.4 1.4l-.7.8-1.6 1.5-1 .8c-.2.1-1 .7-2 .2s-1-1.4-1-1.7V6.5z"
                    fill="var(--color-dark-blue)"
                  />
                </svg>
                {t(LanguageKey.back)}
              </button>
            )}
            <button className="saveButton" style={{ minWidth: "100px" }} onClick={handleNext}>
              {currentStep < tutorialSteps.length - 1 ? t(LanguageKey.next) : t(LanguageKey.finish)}
              <svg fill="none" width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10">
                <path
                  d="M14 3.5a1.5 1.5 0 0 1 0 3H7.3V8C7.1 8.3 7 9.2 6 9.7s-1.7 0-2-.2l-.9-.8L.9 6.4Q.5 5.9.5 5t.4-1.3l.7-1 1.6-1.4 1-.8c.2-.1 1-.6 2-.2a2 2 0 0 1 1 1.7v1.5z"
                  fill="#fff"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorialDesktop;
