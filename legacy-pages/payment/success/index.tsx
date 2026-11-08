import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { use, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { LanguageKey } from "brancy/i18n";
import { InstaInfoContext } from "brancy/context/instaInfoContext";
import styles from "./success.module.css";
export default function SuccessfulPaymentPage() {
  const { t } = useTranslation();
  const router = useRouter();

  // Read search params only on the client to prevent SSR/client hydration mismatch.
  const [redirectUrl, setRedirectUrl] = useState<string | undefined>(undefined);
  const [transactionIdFromQuery, setTransactionIdFromQuery] = useState<string | undefined>(undefined);
  const [invoiceId, setInvoiceId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setRedirectUrl(params.get("redirectUrl") ?? undefined);
    setTransactionIdFromQuery(params.get("transactionId") ?? undefined);
    setInvoiceId(params.get("invoiceId") ?? undefined);
  }, []);

  const { data: session } = useSession();
  const { refreshAccountInfo } = use(InstaInfoContext) ?? {};
  const accountRefreshedRef = useRef(false);
  const accountRefreshingRef = useRef(false);

  // Persist the newly purchased package into the session; retried on the next session change if skipped.
  useEffect(() => {
    if (!session || !refreshAccountInfo || session.user.currentIndex < 0) return;
    if (accountRefreshedRef.current || accountRefreshingRef.current) return;
    accountRefreshingRef.current = true;
    refreshAccountInfo()
      .then((ran) => {
        if (ran) accountRefreshedRef.current = true;
      })
      .finally(() => {
        accountRefreshingRef.current = false;
      });
  }, [session, refreshAccountInfo]);
  return (
    <div className={styles.paymentsuccess}>
      <div className={styles.loader}>
        <div className={styles.box}>
          <div className={styles.logo}>
            <svg
              fill="#fff"
              stroke="#fff"
              height="25"
              width="25"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 38 38">
              <path d="m5.64 18.97 8.72 8.55a1 1 0 0 0 1.4 0L33.4 10.03" strokeWidth="8" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div className={styles.box}></div>
        <div className={styles.box}></div>
        <div className={styles.box}></div>
        <div className={styles.box}></div>
      </div>
      <div className={styles.content}>
        <div className={styles.paymentsuccesstext}>{t(LanguageKey.thankyou)}</div>
        <div className={styles.paymentsuccesstitle}>{t(LanguageKey.Paymentsuccess)}</div>
        {transactionIdFromQuery && (
          <div className="title" style={{ marginTop: "10px", fontWeight: "500" }}>
            {t(LanguageKey.TransactionNumber)}: {transactionIdFromQuery}
          </div>
        )}
        {invoiceId && (
          <div className="title" style={{ fontWeight: "500" }}>
            {t(LanguageKey.InvoiceNumber)}: {invoiceId}
          </div>
        )}
        <button
          className="saveButton"
          style={{ marginTop: "20px" }}
          onClick={() => router.push(`/${redirectUrl || "/"}`)}>
          {t(LanguageKey.back)}
        </button>
      </div>
    </div>
  );
}
