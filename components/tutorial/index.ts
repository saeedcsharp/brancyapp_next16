// Tutorial exports for easier importing
export { useTutorial } from "brancy/components/tutorial/hooks/useTutorial";
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
} from "brancy/components/tutorial/helpers/tutorialStorage";
export {
  validateSelector,
  findTargetElement,
  clearHighlights,
  highlightElement,
  disableBodyScroll,
  enableBodyScroll,
} from "brancy/components/tutorial/helpers/tutorialTargeting";
export type { TutorialPageKey } from "brancy/components/tutorial/tutorialConfigs";
export { default as TutorialManager } from "brancy/components/tutorial/TutorialManager";
export { default as TutorialWrapper } from "brancy/components/tutorial/tutorialWrapper";
export { default as TutorialMobile } from "brancy/components/tutorial/tutorialMobile";
export { default as TutorialDesktop } from "brancy/components/tutorial/tutorialDesktop";
export { default as InitialSetup } from "brancy/components/tutorial/initialSetup/initialSetup";
