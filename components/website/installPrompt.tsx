"use client";

import { LanguageKey } from "brancy/i18n";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function InstallPrompt() {
  const { t, i18n } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const DISMISS_KEY = "brancy_install_prompt_dismissed_v1";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (!isMobile) return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    if (isStandalone) return;

    const urlParams = new URLSearchParams(window.location.search || "");
    const forceShow = urlParams.get("showInstallPrompt") === "1";
    const dismissed = window.localStorage.getItem(DISMISS_KEY);
    if (dismissed === "1" && !forceShow) return;

    const beforeInstallHandler = (e: Event) => {
      // @ts-ignore
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    const appInstalledHandler = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", beforeInstallHandler as EventListener);
    window.addEventListener("appinstalled", appInstalledHandler as EventListener);

    // If `beforeinstallprompt` never fires (iOS), show a small hint for iOS users
    const ua = window.navigator.userAgent || "";
    const isIosUA = /iPhone|iPad|iPod/.test(ua) && !window.MSStream;
    setIsIOS(isIosUA);

    // Wait a moment in case beforeinstallprompt fires shortly
    const tId = window.setTimeout(() => {
      if (!deferredPrompt && isIosUA) {
        setVisible(true);
      }
    }, 600);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallHandler as EventListener);
      window.removeEventListener("appinstalled", appInstalledHandler as EventListener);
      window.clearTimeout(tId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  const renderIOSFallback = () => {
    const rtlLangsLocal = ["fa", "ar", "he", "ur"];
    const isRtl = rtlLangsLocal.includes((i18n && i18n.language) || "");

    return (
      <div style={containerStyle}>
        <div style={iosCardStyle} dir={isRtl ? "rtl" : "ltr"}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button aria-label="close" onClick={onClose} style={iosCloseBtn}>
              ×
            </button>
          </div>
          <div style={iosIconWrap}>
            <img src="./Brancy.svg" alt="Install Icon" style={iosIcon} />
          </div>
          <h3 style={{ margin: "6px 0 8px", textAlign: isRtl ? "right" : "left", fontSize: 20 }}>
            {t(LanguageKey.installPromptMessage)}
          </h3>
          <ol
            style={{
              listStyleType: "decimal",
              listStylePosition: "inside",
              padding: 0,
              marginTop: 8,
              marginBottom: 18,
              lineHeight: 1.9,
              textAlign: isRtl ? "right" : "left",
              fontSize: 16,
            }}>
            <li style={{ marginBottom: 8 }}>{t(LanguageKey.installStep1)}</li>
            <li style={{ marginBottom: 8 }}>{t(LanguageKey.installStep2)}</li>
            <li style={{ marginBottom: 8 }}>{t(LanguageKey.installStep3)}</li>
          </ol>
          <button style={iosPrimaryBtn} onClick={onClose}>
            {t(LanguageKey.understood)}
          </button>
        </div>
      </div>
    );
  };

  const markDismissed = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch (e) {
      /* ignore */
    }
  };

  const onInstallClick = async () => {
    if (deferredPrompt) {
      try {
        // @ts-ignore
        deferredPrompt.prompt();
        // @ts-ignore
        const choiceResult = await deferredPrompt.userChoice;
        markDismissed();
        if (choiceResult && choiceResult.outcome === "accepted") {
          setVisible(false);
          setDeferredPrompt(null);
        } else {
          setVisible(false);
        }
      } catch (err) {
        markDismissed();
        setVisible(false);
        setDeferredPrompt(null);
      }
    } else {
      // Fallback for iOS: show brief instruction by opening an alert or leaving the visible hint
      // We'll mark dismissed so user won't see it repeatedly
      markDismissed();
      setVisible(false);
    }
  };

  const onClose = () => {
    markDismissed();
    setVisible(false);
  };

  // render either iOS fallback card or the default install banner
  const rtlLangs = ["fa", "ar", "he", "ur"];
  const isRtlLang = rtlLangs.includes((i18n && i18n.language) || "");

  return isIOS ? (
    renderIOSFallback()
  ) : (
    <div style={containerStyle}>
      <div style={boxStyle}>
        <div style={{ flex: 1 }}>{t(LanguageKey.installPromptMessage)}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={installBtnStyle} onClick={onInstallClick}>
            {t(LanguageKey.install)}
          </button>
          <button style={closeBtnStyle} onClick={onClose}>
            {t(LanguageKey.close)}
          </button>
        </div>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 16,
  display: "flex",
  justifyContent: "center",
  zIndex: 9999,
  pointerEvents: "auto",
};

const boxStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.98)",
  color: "#111",
  padding: "10px 12px",
  borderRadius: 10,
  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
  display: "flex",
  alignItems: "center",
  gap: 12,
  maxWidth: 960,
  width: "calc(100% - 32px)",
};

const installBtnStyle: React.CSSProperties = {
  background: "#0b75ff",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: 6,
};

const closeBtnStyle: React.CSSProperties = {
  background: "transparent",
  color: "#333",
  border: "1px solid #ddd",
  padding: "6px 10px",
  borderRadius: 6,
};

const iosCardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 20,
  width: "calc(100% - 40px)",
  maxWidth: 520,
  boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  textAlign: "center",
};

const iosIconWrap: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  marginBottom: 12,
};

const iosIcon: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: 32,
  background: "#e8f9f0",
  color: "#0a9f6e",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 28,
};

const iosPrimaryBtn: React.CSSProperties = {
  background: "#0a9f6e",
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: 10,
  fontSize: 16,
};

const iosCloseBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  fontSize: 22,
  lineHeight: 1,
  padding: "4px 8px",
  cursor: "pointer",
  color: "#666",
};
