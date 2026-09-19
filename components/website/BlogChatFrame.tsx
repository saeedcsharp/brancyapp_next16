"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n/languageKeys";
import styles from "./BlogChatFrame.module.css";

export function SupportChatPanel({
  isOpen,
  onClose,
  className,
  panelId = "brancy-support-chat",
}: {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  panelId?: string;
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className={`${styles.chatPanel} ${className ?? ""}`} id={panelId}>
      <div className={styles.panelHeader}>
        <strong>{t(LanguageKey.page8_Support)}</strong>
        <button className={styles.closeButton} type="button" onClick={onClose} aria-label={t(LanguageKey.close)}>
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
  );
}

export default function BlogChatFrame() {
  const { t } = useTranslation();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const handleChatOpen = () => {
    setIsChatOpen((prev) => !prev);
  };
  return (
    <div className={styles.container}>
      <SupportChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <button
        className={styles.supportButton}
        type="button"
        onClick={handleChatOpen}
        aria-expanded={isChatOpen}
        aria-controls="brancy-support-chat"
        aria-label={t(LanguageKey.page8_Support)}>
        <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
          <path
            d="M31 17.97v-1.13a11.02 11.02 0 0 0-22 0v1.13q.97-.15 1.93.25A3.5 3.5 0 0 1 13 20.67L14.5 27a3.55 3.55 0 0 1-3.4 4.4h-.16a6.9 6.9 0 0 1-6.42-5.14 7 7 0 0 1 1.97-6.91v-2.51a13.51 13.51 0 0 1 27.01 0v2.5a6.96 6.96 0 0 1-4.17 12.03c-2.36 4-4.91 4.46-7.6 4.46l-1.2-.02h-.02l-1.32-.02a1.25 1.25 0 0 1 0-2.5l1.39.02c2.77.08 4.44.12 6.23-2.62A3.6 3.6 0 0 1 25.5 27l1.5-6.32a3.54 3.54 0 0 1 4-2.7"
            fill="#828a99"
          />
          <path
            opacity=".4"
            d="M19.88 21.23c-.68 0-1.24-.55-1.25-1.23-.02-1.72 1.37-2.5 2.12-2.92l.17-.1c.75-.41.84-.9.84-1.22a1.6 1.6 0 0 0-3.18 0 1.25 1.25 0 0 1-2.5 0 4.1 4.1 0 0 1 8.18 0 3.8 3.8 0 0 1-2.11 3.4l-.17.1c-.6.33-.85.5-.85.7 0 .7-.54 1.26-1.23 1.27zm0 3.37c-.7 0-1.25-.56-1.25-1.25s.56-1.26 1.25-1.26 1.25.54 1.25 1.23v.03c0 .69-.56 1.25-1.25 1.25"
            fill="#828a99"
          />
        </svg>
      </button>
    </div>
  );
}
