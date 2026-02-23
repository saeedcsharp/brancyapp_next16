import React from "react";
import { useTutorial } from "brancy/components/tutorial/hooks/useTutorial";
import { TutorialPageKey, tutorialConfigs } from "brancy/components/tutorial/tutorialConfigs";
import TutorialDesktop from "brancy/components/tutorial/tutorialDesktop";
import TutorialMobile from "brancy/components/tutorial/tutorialMobile";

interface TutorialManagerProps {
  pageKey: TutorialPageKey;
  children?: React.ReactNode;
}

/**
 * کامپوننت مدیریت tutorial که خودکار تشخیص می‌دهد:
 * - آیا tutorial این صفحه باید نمایش داده شود یا نه
 * - کدام نوع tutorial (mobile/desktop) نمایش داده شود
 * - وضعیت tutorial را مدیریت می‌کند
 */
const TutorialManager: React.FC<TutorialManagerProps> = ({ pageKey, children }) => {
  const { showTutorial, showInitialSetup, isFirstTime, screenType, completeInitialSetup, completeTutorial } =
    useTutorial({ pageKey });

  // اگر tutorial برای این صفحه تعریف نشده است
  if (!tutorialConfigs[pageKey]) {
    console.warn(`Tutorial config not found for page: ${pageKey}`);
    return <>{children}</>;
  }

  // اگر tutorial باید نمایش داده شود
  if (showTutorial) {
    const tutorialSteps = tutorialConfigs[pageKey][screenType];

    if (screenType === "mobile") {
      return (
        <>
          {children}
          <TutorialMobile onComplete={completeTutorial} tutorialSteps={tutorialSteps} />
        </>
      );
    } else {
      return (
        <>
          {children}
          <TutorialDesktop onComplete={completeTutorial} tutorialSteps={tutorialSteps} />
        </>
      );
    }
  }

  // اگر تنظیمات اولیه باید نمایش داده شود
  if (showInitialSetup) {
    // اینجا می‌توانید کامپوننت initial setup را render کنید
    return (
      <>
        {children}
        {/* InitialSetup component here */}
      </>
    );
  }

  // حالت عادی - فقط children را نمایش بده
  return <>{children}</>;
};

export default TutorialManager;
