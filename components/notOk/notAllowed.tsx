import { useTranslation } from "react-i18next";
import { LanguageKey } from "../../i18n";
import styles from "./notAllowed.module.css";
export default function NotAllowed() {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.background}>
        <div className={styles.allnotpass}>
          <svg className={styles.icon} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
            <path
              opacity=".4"
              d="M11.3 12.52q6.7-.3 13.41 0a6.4 6.4 0 0 1 6 5.56c.23 1.65.41 3.39.41 5.17s-.18 3.52-.4 5.17a6.4 6.4 0 0 1-6 5.56q-6.7.3-13.43 0a6.4 6.4 0 0 1-6-5.56 39 39 0 0 1-.4-5.17c0-1.78.17-3.52.4-5.17a6.4 6.4 0 0 1 6-5.56"
              fill="var(--text-h1)"
            />

            <path
              d="M18 20.25c.83 0 1.5.67 1.5 1.5v3a1.5 1.5 0 1 1-3 0v-3c0-.83.67-1.5 1.5-1.5 M12.75 10.13a5.25 5.25 0 1 1 10.5 0v2.34l1.46.05a6 6 0 0 1 1.54.27v-2.66a8.25 8.25 0 1 0-16.5 0v2.66q.73-.23 1.54-.27l1.46-.05z"
              fill="var(--text-h1)"
            />
          </svg>

          <span>{t(LanguageKey.needPassExplain)} </span>
        </div>
      </div>
    </>
  );
}
