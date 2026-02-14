import { useEffect, useState } from "react";
import {
  isFirstTimeUser,
  isTutorialCompleted,
  markTutorialAsCompleted,
  resetAllTutorials as resetAllTutorialsStorage,
  resetTutorial as resetTutorialStorage,
} from "../helpers/tutorialStorage";
import { TutorialPageKey } from "../tutorialConfigs";
interface TutorialHookProps {
  pageKey: TutorialPageKey; // کلید منحصر بفرد هر صفحه مثل 'home', 'profile', 'messages'
}
export const useTutorial = ({ pageKey }: TutorialHookProps) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showInitialSetup, setShowInitialSetup] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [screenType, setScreenType] = useState<"mobile" | "desktop">("mobile");

  const INITIAL_SETUP_KEY = "brancy_initial_setup_completed";
  useEffect(() => {
    // بررسی اندازه صفحه نمایش
    const checkScreenSize = () => {
      const isDesktop = window.innerWidth >= 768;
      setScreenType(isDesktop ? "desktop" : "mobile");
      return isDesktop;
    };
    // بررسی اولیه
    const isDesktop = checkScreenSize();

    // بررسی اینکه آیا کاربر تنظیمات اولیه را انجام داده یا نه
    const initialSetupCompleted = localStorage.getItem(INITIAL_SETUP_KEY);

    // بررسی اینکه آیا کاربر قبلاً توتریال این صفحه را دیده یا نه
    const tutorialCompleted = isTutorialCompleted(pageKey);
    const isFirstTimeUserCheck = isFirstTimeUser();

    if (!initialSetupCompleted) {
      // اگر تنظیمات اولیه انجام نشده، ابتدا آن را نمایش بده
      setShowInitialSetup(true);
      setIsFirstTime(true);
    } else if (!tutorialCompleted) {
      // اگر تنظیمات اولیه انجام شده ولی توتریال این صفحه ندیده، توتریال را نمایش بده
      setIsFirstTime(isFirstTimeUserCheck);
      setShowTutorial(true);
    }
    // listener برای تغییر اندازه صفحه
    const handleResize = () => {
      const newIsDesktop = checkScreenSize();
      // اگر اندازه صفحه تغییر کرد و توتریال باز است، آن را ببند
      if (showTutorial && ((isDesktop && !newIsDesktop) || (!isDesktop && newIsDesktop))) {
        setShowTutorial(false);
        setTimeout(() => setShowTutorial(true), 100);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pageKey, INITIAL_SETUP_KEY, showTutorial]);
  const completeInitialSetup = () => {
    setShowInitialSetup(false);
    // بعد از تکمیل تنظیمات اولیه، توتریال را نمایش بده
    setTimeout(() => {
      setShowTutorial(true);
    }, 300);
  };
  const completeTutorial = () => {
    markTutorialAsCompleted(pageKey);
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    resetTutorialStorage(pageKey);
    setIsFirstTime(true);
    setShowTutorial(true);
  };
  const resetInitialSetup = () => {
    localStorage.removeItem(INITIAL_SETUP_KEY);
    setShowInitialSetup(true);
    setShowTutorial(false);
  };
  const resetAllTutorials = () => {
    resetAllTutorialsStorage();
    localStorage.removeItem(INITIAL_SETUP_KEY);
    setIsFirstTime(true);
    setShowInitialSetup(true);
    setShowTutorial(false);
  };
  return {
    showTutorial,
    showInitialSetup,
    isFirstTime,
    screenType,
    completeInitialSetup,
    completeTutorial,
    resetTutorial,
    resetInitialSetup,
    resetAllTutorials,
  };
};
