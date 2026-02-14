import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  const setThemeAndManifestScript = `
    (function () {
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
    })();
  `;

  return (
    <Html lang="en">
      <Head>
        <meta name="theme-color" content="#edf4ff" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        {/* manifest به‌صورت داینامیک لود میشه */}
      </Head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: setThemeAndManifestScript }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
