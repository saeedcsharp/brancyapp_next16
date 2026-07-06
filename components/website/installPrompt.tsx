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

    // beforeinstallprompt on Android often fires before this component mounts.
    // A tiny inline script in <head> (see layout/document) captures it early
    // and stores it on window.__bipEvent. If it's already there, use it now.
    if ((window as any).__bipEvent) {
      setDeferredPrompt((window as any).__bipEvent);
      setVisible(true);
    }

    const beforeInstallHandler = (e: Event) => {
      // @ts-ignore
      e.preventDefault();
      (window as any).__bipEvent = e;
      setDeferredPrompt(e);
      setVisible(true);
    };

    const appInstalledHandler = () => {
      setVisible(false);
      setDeferredPrompt(null);
      (window as any).__bipEvent = null;
    };

    window.addEventListener("beforeinstallprompt", beforeInstallHandler as EventListener);
    window.addEventListener("appinstalled", appInstalledHandler as EventListener);

    const ua = window.navigator.userAgent || "";
    const isIosUA = /iPhone|iPad|iPod/.test(ua) && !window.MSStream;
    setIsIOS(isIosUA);

    const tId = window.setTimeout(() => {
      if (!(window as any).__bipEvent && isIosUA) {
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
        (window as any).__bipEvent = null;
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
        (window as any).__bipEvent = null;
      }
    } else {
      markDismissed();
      setVisible(false);
    }
  };

  const onClose = () => {
    markDismissed();
    setVisible(false);
  };

  const rtlLangs = ["fa", "ar", "he", "ur"];
  const isRtl = rtlLangs.includes((i18n && i18n.language) || "");

  // Words for "button" in different languages to locate where to insert the ShareIcon
  const BUTTON_WORDS: Record<string, string[]> = {
    fa: ["دکمهٔ", "دکمه"],
    ar: ["زر", "مشاركة"],
    en: ["button"],
    fr: ["bouton"],
    gr: ["Schaltfläche"],
    az: ["düymə", "düyməsinə"],
    tr: ["düğme", "düğmesine"],
    ru: ["кнопк", "кнопку", "кнопка"],
  };

  const insertIconAfterButton = (txt: string) => {
    const lang = (i18n && i18n.language) || "";
    const candidates = BUTTON_WORDS[lang] || [];
    for (const cand of candidates) {
      const idx = txt.indexOf(cand);
      if (idx !== -1) {
        const before = txt.slice(0, idx + cand.length);
        const after = txt.slice(idx + cand.length);
        return (
          <>
            <span>{before}</span>
            <ShareIcon />
            <span>{after}</span>
          </>
        );
      }
    }
    return txt;
  };

  // iOS Share icon (Apple's actual share glyph: square + arrow up)
  const ShareIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      style={{ display: "inline-block", verticalAlign: "-4px", margin: "0 4px" }}>
      <path d="M12 3v12" stroke="#0a84ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 7l4-4 4 4" stroke="#0a84ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M6 11v7a2 2 0 002 2h8a2 2 0 002-2v-7"
        stroke="#0a84ff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // 'Add to Home Screen' small icon (a rounded square with a plus)
  const AddIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      style={{ display: "inline-block", verticalAlign: "-3px", margin: "0 6px" }}>
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="#0a84ff" strokeWidth="1.6" />
      <path d="M12 8v8M8 12h8" stroke="#0a84ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const insertAddIcon = (txt: string) => {
    const target = "Add to Home Screen";
    const idx = txt.indexOf(target);
    if (idx !== -1) {
      const before = txt.slice(0, idx);
      const targetTxt = txt.slice(idx, idx + target.length);
      const after = txt.slice(idx + target.length);
      return (
        <>
          <span>{before}</span>
          <span style={{ display: "inline-flex", whiteSpace: "nowrap", alignItems: "center", gap: 6 }}>
            <span>{targetTxt}</span>
            <AddIcon />
          </span>
          {after ? <span>{after}</span> : null}
        </>
      );
    }
    // Fallback: attach icon to the last word without allowing it to wrap separately
    const lastSpace = txt.lastIndexOf(" ");
    if (lastSpace !== -1) {
      const head = txt.slice(0, lastSpace + 1);
      const tail = txt.slice(lastSpace + 1);
      return (
        <>
          <span>{head}</span>
          <span style={{ display: "inline-flex", whiteSpace: "nowrap", alignItems: "center", gap: 6 }}>
            <span>{tail}</span>
            <AddIcon />
          </span>
        </>
      );
    }
    return (
      <span style={{ display: "inline-flex", whiteSpace: "nowrap", alignItems: "center", gap: 6 }}>
        <span>{txt}</span>
        <AddIcon />
      </span>
    );
  };

  const renderIOSFallback = () => (
    <div style={containerStyle}>
      <div style={iosCardStyle} dir={isRtl ? "rtl" : "ltr"}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button aria-label="close" onClick={onClose} style={iosCloseBtn}>
            ×
          </button>
        </div>
        <div style={iosIconWrap}>
          <img src="/Brancy.svg" alt="Brancy" style={iosIconImg} />
        </div>
        <h3 style={{ margin: "6px 0 8px", textAlign: isRtl ? "right" : "left", fontSize: 20 }}>
          {t(LanguageKey.installPromptMessage)}
        </h3>
        <ol style={iosListStyle(isRtl)}>
          <li style={{ marginBottom: 8 }}>{insertIconAfterButton(t(LanguageKey.installStep1) as string)}</li>
          <li style={{ marginBottom: 8 }}>
            <div style={{ display: "inline-flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
              {isRtl ? (
                <>{insertAddIcon(t(LanguageKey.installStep2) as string)}</>
              ) : (
                <>{insertAddIcon(t(LanguageKey.installStep2) as string)}</>
              )}
            </div>
          </li>
          <li style={{ marginBottom: 8 }}>{t(LanguageKey.installStep3)}</li>
        </ol>
        <button style={iosPrimaryBtn} onClick={onClose}>
          {t(LanguageKey.understood)}
        </button>
      </div>
    </div>
  );

  const renderDefaultBanner = () => (
    <div style={containerStyle}>
      <div style={boxStyle} dir={isRtl ? "rtl" : "ltr"}>
        <div style={rowStyle}>
          <img src="/Brancy.svg" alt="Brancy" style={logoStyle} />
          <div style={textStyle}>{t(LanguageKey.installPromptMessage)}</div>
          <button aria-label="close" onClick={onClose} style={closeIconBtn}>
            ×
          </button>
        </div>
        <button style={installBtnStyle} onClick={onInstallClick}>
          {t(LanguageKey.install)}
        </button>
      </div>
    </div>
  );

  return isIOS ? renderIOSFallback() : renderDefaultBanner();
}

const containerStyle: React.CSSProperties = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  justifyContent: "center",
  zIndex: 9999,
  padding: "0 12px calc(16px + env(safe-area-inset-bottom, 0px))",
  boxSizing: "border-box",
};

const boxStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.98)",
  color: "#111",
  padding: "12px 14px",
  borderRadius: 14,
  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  display: "flex",
  flexDirection: "column",
  gap: 10,
  width: "100%",
  maxWidth: 420,
  boxSizing: "border-box",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
};

const logoStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 8,
  flexShrink: 0,
};

const textStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  fontSize: 14,
  lineHeight: 1.35,
  overflowWrap: "break-word",
};

const closeIconBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  fontSize: 20,
  lineHeight: 1,
  color: "#888",
  padding: 4,
  flexShrink: 0,
  cursor: "pointer",
};

const installBtnStyle: React.CSSProperties = {
  background: "#0b75ff",
  color: "#fff",
  border: "none",
  padding: "10px 12px",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  width: "100%",
  cursor: "pointer",
};

const iosCardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 20,
  width: "calc(100% - 24px)",
  maxWidth: 420,
  boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
  textAlign: "center",
  boxSizing: "border-box",
};

const iosIconWrap: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  marginBottom: 12,
};

const iosIconImg: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: 14,
};

const iosListStyle = (isRtl: boolean): React.CSSProperties => ({
  listStyleType: "decimal",
  // place marker outside and add padding so the marker and text stay on one line
  listStylePosition: "outside",
  padding: isRtl ? "0 20px 0 0" : "0 0 0 20px",
  marginTop: 8,
  marginBottom: 18,
  lineHeight: 1.6,
  textAlign: isRtl ? "right" : "left",
  fontSize: 15,
});

const iosPrimaryBtn: React.CSSProperties = {
  background: "#0a9f6e",
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: 10,
  fontSize: 16,
  width: "100%",
  cursor: "pointer",
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
