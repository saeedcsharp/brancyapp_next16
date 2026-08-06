import type { Metadata, Viewport } from "next";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import "brancy/components/page/statistics/sliderToFourBox.css";
import "brancy/app/globals.scss";
import Providers from "brancy/app/providers";
import { ThemeScript } from "brancy/components/themeScript";

export const metadata: Metadata = {
  title: "Brancy",
  description: "Brancy application",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
};

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#edf4ff" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
      </head>
      <body>
        <ThemeScript />
        <GoogleTagManager gtmId="GTM-PLFD6SZ4" />
        <GoogleAnalytics gaId="G-BSQ8WGVTN1" />
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PLFD6SZ4"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}></iframe>
        </noscript>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
