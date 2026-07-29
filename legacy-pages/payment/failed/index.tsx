import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import styles from "./fail.module.css";
import { useEffect, useState } from "react";

export default function FailedPaymentPage() {
  const { t } = useTranslation();
  const router = useRouter();

  // Read redirect params on client only to avoid SSR hydration mismatches
  const [redirectUrl, setRedirectUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setRedirectUrl(params.get("redirectUrl") ?? undefined);
  }, []);

  return (
    <div className={styles.paymentfailed}>
      <div className={styles.loader}>
        <div className={styles.box}>
          <div className={styles.logo}>
            <svg height="25" className={styles.svg} width="25" viewBox="0 0 35 35">
              <path stroke="#fff" strokeLinecap="round" strokeWidth="8" d="m4.7 4.7 25.6 25.6M30.3 4.7 4.7 30.3"></path>
            </svg>
          </div>
        </div>
        <div className={styles.box}></div>
        <div className={styles.box}></div>
        <div className={styles.box}></div>
        <div className={styles.box}></div>
      </div>
      <div className={styles.content}>
        <div className={styles.paymentfailedtext}>{t(LanguageKey.wearesorry)}</div>
        <div className={styles.paymentfailedtitle}>{t(LanguageKey.PaymentFailed)}</div>
        <button
          onClick={() => router.push(`/${redirectUrl || "/"}`)}
          className="saveButton"
          style={{ marginTop: "20px" }}>
          {t(LanguageKey.back)}
        </button>
      </div>
    </div>
  );
}
