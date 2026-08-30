import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import styles from "./commentPermissionState.module.css";

interface CommentPermissionStateProps {
  onEnablePermission: () => void;
}

export default function CommentPermissionState({ onEnablePermission }: CommentPermissionStateProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.permissionState} role="status">
      <svg className={styles.permissionIcon} viewBox="0 0 96 96" aria-hidden="true">
        <rect x="20" y="40" width="56" height="42" rx="8" fill="none" stroke="currentColor" strokeWidth="6" />
        <path
          d="M32 40V29a16 16 0 0 1 32 0v11"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="48" cy="60" r="5" fill="currentColor" />
        <path d="M48 65v8" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <path
          d="m68 22 5 5 10-11"
          fill="none"
          stroke="var(--color-green, #2eaa70)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h2>{t(LanguageKey.AccessAndManageComments)}</h2>
      <p>{t(LanguageKey.AccessAndManageCommentsExplain)}</p>
      <button type="button" className="saveButton" onClick={onEnablePermission}>
        {t(LanguageKey.EnablePermission)}
      </button>
    </div>
  );
}
