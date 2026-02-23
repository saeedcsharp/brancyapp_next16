import Head from "next/head";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import styles from "brancy/components/messages/aiflow/popup/popup.module.css";

export type PopupType = "info" | "success" | "error" | "warning";
interface PopupProps {
  open: boolean;
  title?: string;
  message: string;
  type?: PopupType;
  confirmMode?: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  primaryLabel?: string;
  // If onPrimary returns/ resolves to false, keep popup open; any other return closes it.
  onPrimary?: () => void | boolean | Promise<void | boolean>;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

const Popup: React.FC<PopupProps> = ({
  open,
  title,
  message,
  type = "info",
  confirmMode = false,
  onClose,
  onConfirm,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}) => {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const getIcon = (kind: PopupType) => {
    switch (kind) {
      case "info":
        return (
          <svg className={styles.modalsvg} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
            <path opacity=".3" d="M1.88 18a16.12 16.12 0 1 0 32.24 0 16.12 16.12 0 0 0-32.24 0" />
            <path d="M17.52 16.54c.37.05.89.18 1.32.62.44.43.57.95.62 1.32.04.3.04.66.04.96v6.06a1.5 1.5 0 1 1-3 0v-6a1.5 1.5 0 1 1 0-3h.06zM16.5 12a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0" />
          </svg>
        );
      case "warning":
        return (
          <svg className={styles.modalsvg} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
            <path
              opacity=".3"
              d="m18.5 3 4.4.1q1.8 0 3 .9 1.4.8 2.4 2.2l2.2 3.6 1 1.7 1.9 3.5q.7 1.5.7 3t-.7 3l-2 3.5-.9 1.7-2.2 3.6q-1 1.5-2.3 2.2-1.5.8-3.1.9l-4.4.1h-1l-4.4-.1a8 8 0 0 1-3-.9q-1.4-.8-2.4-2.2l-2.2-3.6-1-1.7L2.6 21a7 7 0 0 1-.7-3q0-1.5.7-3l2-3.5.9-1.7q1.2-2.2 2.2-3.6Q8.7 4.7 10 4q1.5-.7 3.1-.9l4.4-.1z"
            />
            <path d="M16.5 24q0-1.4 1.5-1.5a1.5 1.5 0 1 1 0 3q-1.4 0-1.5-1.5m1.5-4.5q-1.4 0-1.5-1.5v-6a1.5 1.5 0 1 1 3 0v6q0 1.4-1.5 1.5" />
          </svg>
        );
      case "success":
        return (
          <svg className={styles.modalsvg} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
            <path opacity=".3" d="M1.88 18a16.12 16.12 0 1 0 32.24 0 16.12 16.12 0 0 0-32.24 0" />
            <path d="M27.474 13.353a2 2 0 1 0-2.95-2.704l-9.587 10.46-3.522-3.523a2 2 0 0 0-2.83 0 2 2 0 0 0 0 2.829l5 5a2 2 0 0 0 2.89-.063z" />
          </svg>
        );
      case "error":
        return (
          <svg className={styles.modalsvg} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
            <path
              opacity=".3"
              d="M1.875 18c0 8.906 7.22 16.125 16.125 16.125S34.125 26.905 34.125 18 26.905 1.875 18 1.875 1.875 9.095 1.875 18"
            />
            <path d="M23.56 12.44a1.5 1.5 0 0 1 0 2.12L20.12 18l3.44 3.44a1.5 1.5 0 1 1-2.122 2.12L18 20.122l-3.438 3.439a1.5 1.5 0 0 1-2.122-2.121L15.88 18l-3.44-3.44a1.501 1.501 0 0 1 1.636-2.446c.182.076.347.186.486.326L18 15.879l3.44-3.44a1.5 1.5 0 0 1 2.12 0" />
          </svg>
        );
      default:
        return null;
    }
  };
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && confirmMode) onConfirm?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, confirmMode, onClose, onConfirm]);

  // Lock background scroll while popup is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const content = (
    <>
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta
          name="description"
          content="Interactive confirmation dialog for user actions. Get user confirmation before proceeding with important operations in your application."
        />
        <meta name="theme-color" content="#007bff"></meta>
        <meta
          name="keywords"
          content="popup dialog, confirmation modal, user interface, React component, interactive dialog, user confirmation, modal window"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/popup/confirmation" />
        {/* Add other meta tags as needed */}
      </Head>
      <div className="dialogBg" onClick={onClose}>
        <div className={styles.modal} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
          <div className="headerandinput">
            {getIcon(type)}
            {title ? <div className="title">{title}</div> : null}
            <div className="title">{message}</div>
          </div>
          <div className="ButtonContainer">
            {confirmMode ? (
              <>
                <button className="cancelButton" onClick={onClose}>
                  {t(LanguageKey.cancel)}
                </button>
                <button className="saveButton" onClick={onConfirm}>
                  {t(LanguageKey.Continue)}
                </button>
              </>
            ) : secondaryLabel ? (
              <>
                <button className="saveButton" onClick={onPrimary || onClose}>
                  {primaryLabel ?? t(LanguageKey.Continue)}
                </button>
                <button className="stopButton" onClick={onSecondary}>
                  {secondaryLabel}
                </button>
              </>
            ) : (
              <button
                className="saveButton"
                onClick={() => {
                  if (!onPrimary) return onClose();
                  try {
                    const result = onPrimary();
                    const isPromiseLike =
                      result && typeof (result as any) === "object" && typeof (result as any).then === "function";
                    if (isPromiseLike) {
                      (result as Promise<any>)
                        .then((val) => {
                          if (val !== false) onClose();
                        })
                        .catch(() => onClose());
                    } else if (result !== false) {
                      onClose();
                    }
                  } catch {
                    onClose();
                  }
                }}>
                {primaryLabel ?? t(LanguageKey.Continue)}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );

  if (isClient) return createPortal(content, document.body);
  return content;
};

export default Popup;
