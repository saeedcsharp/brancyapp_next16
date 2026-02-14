// Tutorial exports for easier importing
export { useTutorial } from "./hooks/useTutorial";
export {
  getTutorialState,
  saveTutorialState,
  isTutorialCompleted,
  markTutorialAsCompleted,
  resetTutorial,
  resetAllTutorials,
  getCompletedTutorials,
  getCompletedTutorialsCount,
  isFirstTimeUser,
  useTutorialState,
} from "./helpers/tutorialStorage";
export {
  validateSelector,
  findTargetElement,
  clearHighlights,
  highlightElement,
  disableBodyScroll,
  enableBodyScroll,
} from "./helpers/tutorialTargeting";
export type { TutorialPageKey } from "./tutorialConfigs";
export { default as TutorialManager } from "./TutorialManager";
export { default as TutorialWrapper } from "./tutorialWrapper";
export { default as TutorialMobile } from "./tutorialMobile";
export { default as TutorialDesktop } from "./tutorialDesktop";
export { default as InitialSetup } from "./initialSetup/initialSetup";
