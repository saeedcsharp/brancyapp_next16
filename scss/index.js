/**
 * SCSS Styles Export
 * This file allows easy importing of SCSS modules in components
 */

// The main stylesheet is imported in globals.scss, so we don't need to import it here
// Components can import specific SCSS modules when needed

export const styleModules = {
  variables: "_variables.scss",
  reset: "_reset.scss",
  animations: "_animations.scss",
  typography: "_typography.scss",
  layout: "_layout.scss",
  buttons: "_buttons.scss",
  icons: "_icons.scss",
  profile: "_profile.scss",
  charts: "_charts.scss",
  notifications: "_notifications.scss",
  scrollbars: "_scrollbars.scss",
  aiFlow: "_aiFlow.scss",
};

// For convenience, also export path to the main SCSS file
export const mainStyle = "main.scss";
