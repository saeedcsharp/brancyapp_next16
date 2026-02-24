import type { Metadata, Viewport } from "next";
import "quill/dist/quill.snow.css";
import "brancy/components/page/statistics/sliderToFourBox.css";
import "brancy/app/globals.scss";
import Providers from "brancy/app/providers";

export const metadata: Metadata = {
  title: "Brancy",
  description: "Brancy application",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#edf4ff" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: setThemeAndManifestScript }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
