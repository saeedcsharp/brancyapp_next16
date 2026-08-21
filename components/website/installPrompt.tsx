"use client";
import { LanguageKey } from "brancy/i18n";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./installPrompt.module.css";
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
    } catch (e) {}
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
      className={styles.shareIcon}
      xmlns="http://www.w3.org/2000/svg"
      color="currentColor"
      fill="none"
      stroke="var(--color-dark-blue)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24">
      <path d="M8 7s2.2-2.72 3.4-3.76a1 1 0 0 1 .63-.24q.3 0 .57.24C13.8 4.28 16 7 16 7m-3.97-3v11M8 11c-1.4 0-2.1 0-2.63.27a2.5 2.5 0 0 0-1.1 1.1C4 12.9 4 13.6 4 15v1c0 2.36 0 3.54.73 4.27S6.64 21 9 21h6c2.36 0 3.54 0 4.27-.73S20 18.36 20 16v-1c0-1.4 0-2.1-.27-2.63a2.5 2.5 0 0 0-1.1-1.1C18.1 11 17.4 11 16 11" />
    </svg>
  );
  // 'Add to Home Screen' small icon (a rounded square with a plus)
  const AddIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      color="currentColor"
      fill="none"
      stroke="var(--color-dark-blue)"
      strokeWidth="2"
      strokeLinecap="round"
      width="18"
      height="18"
      strokeLinejoin="round"
      viewBox="0 0 24 24">
      <path d="M2.5 12c0-4.5 0-6.7 1.4-8.1S7.5 2.5 12 2.5s6.7 0 8.1 1.4 1.4 3.6 1.4 8.1 0 6.7-1.4 8.1-3.6 1.4-8.1 1.4-6.7 0-8.1-1.4-1.4-3.6-1.4-8.1M12 8v8m4-4H8" />
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
          <span className={styles.addIconGroup}>
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
          <span className={styles.addIconGroup}>
            <span>{tail}</span>
            <AddIcon />
          </span>
        </>
      );
    }
    return (
      <span className={styles.addIconGroup}>
        <span>{txt}</span>
        <AddIcon />
      </span>
    );
  };
  const renderIOSFallback = () => (
    <div className={styles.container} dir={isRtl ? "rtl" : "ltr"}>
      <div className={styles.iosIconWrap}>
        <img src="/Brancy.svg" alt="Brancy" className={styles.iosIconImg} />
      </div>
      <div className={`${styles.iosTitle} ${isRtl ? styles.rtlText : styles.ltrText}`}>
        {t(LanguageKey.installPromptMessage)}
      </div>
      <ol className={`${styles.iosList} ${isRtl ? styles.rtlText : styles.ltrText}`}>
        <li>{insertIconAfterButton(t(LanguageKey.installStep1) as string)}</li>
        <li>
          <div className={styles.addIconLine}>{insertAddIcon(t(LanguageKey.installStep2) as string)}</div>
        </li>
        <li>{t(LanguageKey.installStep3)}</li>
      </ol>
      <button className="saveButton" onClick={onClose}>
        {t(LanguageKey.understood)}
      </button>
    </div>
  );
  const renderDefaultBanner = () => (
    <div className={styles.container} dir={isRtl ? "rtl" : "ltr"}>
      <div className={styles.iosIconWrap}>
        <img src="/Brancy.svg" alt="Brancy" className={styles.iosIconImg} />
      </div>
      <div className={`${styles.iosTitle} ${isRtl ? styles.rtlText : styles.ltrText}`}>
        {t(LanguageKey.installPromptMessage)}
      </div>
      <ol className={`${styles.iosList} ${isRtl ? styles.rtlText : styles.ltrText}`}>
        <li>{insertIconAfterButton(t(LanguageKey.installStep1) as string)}</li>
        <li>
          <div className={styles.addIconLine}>{insertAddIcon(t(LanguageKey.installStep2) as string)}</div>
        </li>
        <li>{t(LanguageKey.installStep3)}</li>
      </ol>
      <button className="saveButton" onClick={onInstallClick}>
        {t(LanguageKey.install)}
      </button>
    </div>
  );
  return isIOS ? renderIOSFallback() : renderDefaultBanner();
}
