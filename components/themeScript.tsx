// components/ThemeScript.tsx
"use client";

import { useServerInsertedHTML } from "next/navigation";

const setThemeAndManifestScript = `(function () {
  function getInitialTheme() {
    const stored = window.localStorage.getItem("theme");
    if (stored) return stored;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    return mql.matches ? "dark" : "light";
  }

  const theme = getInitialTheme();
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.setProperty("--initial-color-mode", theme);

  const link = document.createElement("link");
  link.rel = "manifest";
  link.href = theme === "dark" ? "/manifest-dark.json" : "/manifest-light.json";
  document.head.appendChild(link);

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", theme === "dark" ? "#161d1f" : "#edf4ff");
  }

  // Apply language direction before React hydration to prevent layout flash
  var lng = window.localStorage.getItem("language") || "en";
  var rtlLangs = ["fa", "ar"];
  document.documentElement.dir = rtlLangs.indexOf(lng) !== -1 ? "rtl" : "ltr";
  document.documentElement.lang = lng;
})();`;

export function ThemeScript() {
  useServerInsertedHTML(() => (
    <script id="set-theme-and-manifest" dangerouslySetInnerHTML={{ __html: setThemeAndManifestScript }} />
  ));

  return null;
}
