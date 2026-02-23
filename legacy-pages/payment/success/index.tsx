import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "../../../i18n";
import styles from "./success.module.css";
export default function SuccessfulPaymentPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { query } = router;
  const redirectUrl = query.redirectUrl as string;
  const transactionIdFromQuery = query.transactionId as string;
  const invoiceId = query.invoiceId as string;
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
              <path
                d="m5.64 18.97 8.72 8.55a1 1 0 0 0 1.4 0L33.4 10.03"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        <div className={styles.box}></div>
        <div className={styles.box}></div>
        <div className={styles.box}></div>
        <div className={styles.box}></div>
      </div>
      <div className={styles.content}>
        <div className={styles.paymentsuccesstext}>
          {t(LanguageKey.thankyou)}
        </div>
        <div className={styles.paymentsuccesstitle}>
          {t(LanguageKey.Paymentsuccess)}
        </div>
        <div className="title" style={{ marginTop: "10px", fontWeight: "500" }}>
          {t(LanguageKey.TransactionNumber)}: {transactionIdFromQuery}
        </div>
        {invoiceId && (
          <div className="title" style={{ fontWeight: "500" }}>
            {t(LanguageKey.InvoiceNumber)}: {invoiceId}
          </div>
        )}
        <button
          className="saveButton"
          style={{ marginTop: "20px" }}
          onClick={() => router.push(`/${redirectUrl || "upgrade"}`)}>
          {t(LanguageKey.back)}
        </button>
      </div>
    </div>
  );
}
