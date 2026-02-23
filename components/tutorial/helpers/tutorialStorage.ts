import { TutorialPageKey } from "brancy/components/tutorial/tutorialConfigs";

// کلید localStorage برای ذخیره وضعیت tutorials
const TUTORIAL_STORAGE_KEY = "brancy_tutorial_completed";

interface TutorialState {
  [key: string]: boolean; // key = tutorial page name, value = completed status
}

/**
 * دریافت وضعیت تمام tutorials از localStorage
 */
export const getTutorialState = (): TutorialState => {
  try {
    const saved = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.warn("Could not load tutorial state from localStorage", error);
    return {};
  }
};

/**
 * ذخیره وضعیت تمام tutorials در localStorage
 */
export const saveTutorialState = (state: TutorialState): void => {
  try {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Could not save tutorial state to localStorage", error);
  }
};

/**
 * بررسی اینکه آیا tutorial خاصی تکمیل شده است یا نه
 */
export const isTutorialCompleted = (tutorialKey: TutorialPageKey): boolean => {
  const state = getTutorialState();
  return state[tutorialKey] === true;
};

/**
 * علامت‌گذاری tutorial خاص به عنوان تکمیل شده
 */
export const markTutorialAsCompleted = (tutorialKey: TutorialPageKey): void => {
  const state = getTutorialState();
  state[tutorialKey] = true;
  saveTutorialState(state);
  console.log(`Tutorial "${tutorialKey}" marked as completed`);
};

/**
 * بازنشانی وضعیت tutorial خاص (برای تست یا reset)
 */
export const resetTutorial = (tutorialKey: TutorialPageKey): void => {
  const state = getTutorialState();
  delete state[tutorialKey];
  saveTutorialState(state);
  console.log(`Tutorial "${tutorialKey}" reset`);
};

/**
 * بازنشانی تمام tutorials
 */
export const resetAllTutorials = (): void => {
  localStorage.removeItem(TUTORIAL_STORAGE_KEY);
  console.log("All tutorials reset");
};

/**
 * دریافت لیست tutorials تکمیل شده
 */
export const getCompletedTutorials = (): TutorialPageKey[] => {
  const state = getTutorialState();
  return Object.keys(state).filter((key) => state[key] === true) as TutorialPageKey[];
};

/**
 * شمارش tutorials تکمیل شده
 */
export const getCompletedTutorialsCount = (): number => {
  return getCompletedTutorials().length;
};

/**
 * بررسی اینکه آیا این اولین بار ورود کاربر است یا نه
 */
export const isFirstTimeUser = (): boolean => {
  const state = getTutorialState();
  return Object.keys(state).length === 0;
};

/**
 * hook برای استفاده در کامپوننت‌های React
 */
export const useTutorialState = () => {
  return {
    isTutorialCompleted,
    markTutorialAsCompleted,
    resetTutorial,
    resetAllTutorials,
    getCompletedTutorials,
    getCompletedTutorialsCount,
    isFirstTimeUser,
  };
};
