"use client";

import { useEffect, useState } from "react";

type Platform = "android" | "ios" | "other";

/**
 * When the redirect page is opened inside the Instagram (or any other) in-app
 * browser, payment / OAuth flows frequently break. This component tries to
 * force the URL open in the real system browser (Chrome on Android, Safari on
 * iOS) instead of the embedded WebView.
 */
export default function EscapeInAppBrowser({
  openUrl,
  platform,
}: {
  openUrl: string;
  platform: Platform;
}) {
  const [showManualHint, setShowManualHint] = useState(false);

  useEffect(() => {
    try {
      if (platform === "android") {
        // Build an Android intent URL that forces Chrome to handle the link.
        const url = new URL(openUrl);
        const scheme = url.protocol.replace(":", "");
        const withoutScheme = `${url.host}${url.pathname}${url.search}${url.hash}`;
        const intentUrl = `intent://${withoutScheme}#Intent;scheme=${scheme};package=com.android.chrome;end`;
        window.location.replace(intentUrl);

        // If Chrome is not installed / intent fails, fall back to a manual hint.
        const timer = setTimeout(() => setShowManualHint(true), 1500);
        return () => clearTimeout(timer);
      }

      if (platform === "ios") {
        // iOS in-app browsers cannot be programmatically forced into Safari.
        // We only show manual instructions to the user.
        setShowManualHint(true);
      }
    } catch {
      setShowManualHint(true);
    }
  }, [openUrl, platform]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        height: "100vh",
        textAlign: "center",
        padding: "1.5rem",
        direction: "rtl",
      }}>
      <p style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>
        برای ادامه، لطفاً این صفحه را در مرورگر باز کنید
      </p>

      {platform === "ios" ? (
        <p style={{ margin: 0, lineHeight: 1.8 }}>
          روی دکمهٔ منو (سه نقطه <span aria-hidden>•••</span> در گوشهٔ پایین) بزنید و گزینهٔ
          «Open in Safari / باز کردن در سافاری» را انتخاب کنید.
        </p>
      ) : (
        <p style={{ margin: 0, lineHeight: 1.8 }}>
          در حال انتقال به مرورگر... اگر به‌صورت خودکار باز نشد، از منوی مرورگر داخلی گزینهٔ
          «Open in Chrome / باز کردن در مرورگر» را انتخاب کنید.
        </p>
      )}

      {showManualHint && (
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginTop: "0.5rem",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            background: "#0095f6",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 600,
          }}>
          ادامه در مرورگر
        </a>
      )}
    </div>
  );
}
