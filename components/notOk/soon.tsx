import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import styles from "./notAllowed.module.css";
export default function Soon() {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.background}>
        <div className={styles.allnotpass}>
          <img className={styles.icon} title="ℹ️ Soon" src="/soon.svg" />
          <div className="headerandinput" style={{ alignItems: "center" }}>
            <div className="title">
              <img title="ℹ️ under develop" height="24" src="/develope.svg" />
              {t(LanguageKey.soon)}{" "}
            </div>

            <div className="explain" style={{ textAlign: "center" }}>
              {t(LanguageKey.underdevelop)}
              <br />
              {t(LanguageKey.soonExplain)}{" "}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
