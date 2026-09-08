"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n/languageKeys";
import styles from "./BlogChatFrame.module.css";

export default function BlogChatFrame() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleChatOpen = () => {
    setIsChatOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <div className={styles.container}>
      {isChatOpen && (
        <div className={styles.chatPanel} id="brancy-support-chat">
          <div className={styles.panelHeader}>
            <strong>{t(LanguageKey.support_Online)}</strong>
            <button
              className={styles.closeButton}
              type="button"
              onClick={() => setIsChatOpen(false)}
              aria-label={t(LanguageKey.close)}>
              ×
            </button>
          </div>
          <iframe
            className={styles.frame}
            src="https://www.goftino.com/c/9u6Fje"
            title="Brancy live chat"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
            allow="camera 'none'; microphone 'none'; geolocation 'none'; payment 'none'; usb 'none'"
          />
        </div>
      )}

      {isMenuOpen && (
        <div className={styles.menu} role="menu" aria-label={t(LanguageKey.page8_Support)}>
          <a
            className={styles.menuItem}
            href="https://blog.brancy.app/"
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem">
            {t(LanguageKey.support_EnterBlog)}
          </a>
          <button className={styles.menuItem} type="button" onClick={handleChatOpen} role="menuitem">
            {t(LanguageKey.support_Online)}
          </button>
        </div>
      )}

      <button
        className={styles.supportButton}
        type="button"
        onClick={() => setIsMenuOpen((open) => !open)}
        aria-expanded={isMenuOpen}
        aria-controls="brancy-support-chat"
        aria-label={t(LanguageKey.page8_Support)}>
        <img src="/landing/page8_support.png" alt="" />
      </button>
    </div>
  );
}
