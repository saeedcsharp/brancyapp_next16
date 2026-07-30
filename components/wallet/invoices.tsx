import initialzedTime from "brancy/helper/manageTimer";
import { InvoiceStatus, InvoiceType } from "brancy/models/enums";
import { IGetInvoice, IInvoice } from "brancy/models/interfaces";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import { RefObject } from "react";
import styles from "./invoices.module.css";
import PriceFormater, { PriceFormaterClassName } from "../priceFormater";

type InvoicesProps = {
  invoices: IGetInvoice | null;
  invoicesLoading?: boolean;
  invoicesLoadingMore?: boolean;
  hasMore?: boolean;
  containerRef?: RefObject<HTMLDivElement | null>;
  openOrderDetails?: (invoiceId: string) => void;
};

const invoiceStatusClassNames: Record<InvoiceStatus, string> = {
  [InvoiceStatus.Pending]: "pending",
  [InvoiceStatus.Paid]: "paid",
  [InvoiceStatus.Success]: "success",
  [InvoiceStatus.WaitingForRefundRequest]: "refund",
  [InvoiceStatus.FastRefunding]: "refund",
  [InvoiceStatus.Refunded]: "refund",
  [InvoiceStatus.FailedRefaund]: "failed",
  [InvoiceStatus.Failed]: "failed",
};

export default function Invoices({
  invoices,
  invoicesLoading = false,
  invoicesLoadingMore = false,
  hasMore = false,
  containerRef,
  openOrderDetails,
}: InvoicesProps) {
  const { t } = useTranslation();
  const items = invoices?.items ?? [];
  return (
    <section ref={containerRef} className={styles.invoicesSection} aria-busy={invoicesLoading || invoicesLoadingMore}>
      <header className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>{t("Payment")}</p>
          <h2 className={styles.sectionTitle}>{t("Invoice History")}</h2>
          <p className={styles.sectionDescription}>{t("Latest invoices and payment status")}</p>
        </div>
        <span className={styles.invoiceCount}>{invoicesLoading ? "..." : items.length}</span>
      </header>

      {invoicesLoading ? (
        <div className={styles.invoiceGrid} aria-label={t("Loading")}>
          {[0, 1, 2].map((index) => (
            <div key={index} className={styles.invoiceSkeleton} />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className={styles.invoiceGrid}>
          {items.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} openOrderDetails={openOrderDetails} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>{t("No invoices have been registered yet.")}</div>
      )}

      {!invoicesLoading && (invoicesLoadingMore || hasMore) && (
        <div className={styles.loadMoreIndicator} aria-live="polite">
          {invoicesLoadingMore && <div className={styles.loadMoreSpinner} aria-label={t("Loading")} />}
        </div>
      )}
    </section>
  );
}

function InvoiceCard({
  invoice,
  openOrderDetails,
}: {
  invoice: IInvoice;
  openOrderDetails?: (invoiceId: string) => void;
}) {
  const { t } = useTranslation();
  const status = getInvoiceStatus(invoice.status, t);
  const createdTime = new DateObject({
    date: invoice.createdTime * 1000,
    calendar: initialzedTime().calendar,
    locale: initialzedTime().locale,
  }).format("YYYY/MM/DD HH:mm");
  return (
    <article
      onClick={() => openOrderDetails?.(invoice.id)}
      className={`${styles.invoiceCard} ${styles[invoiceStatusClassNames[invoice.status]]}`}>
      <div className={styles.invoiceTopRow}>
        <span className={styles.status}>{status}</span>
        <span className={styles.invoiceType}>{getInvoiceType(invoice.invoiceType, t)}</span>
      </div>
      <div className={styles.amountBlock}>
        <span className={styles.amountLabel}>{t("Amount")}</span>
        <div className={styles.amount} dir="ltr">
          <PriceFormater
            pricetype={invoice.priceType}
            fee={invoice.amount}
            className={PriceFormaterClassName.PostPrice}
          />
        </div>
      </div>
      <div className={styles.invoiceDetails}>
        <div className={styles.invoiceMeta}>
          <span>{t("Invoice ID")}</span>
          <code>{invoice.id}</code>
        </div>
        <div className={styles.invoiceMeta}>
          <span>{t("Time")}</span>
          <time
            dateTime={new DateObject({
              date: invoice.createdTime * 1000,
              calendar: initialzedTime().calendar,
              locale: initialzedTime().locale,
            }).format("YYYY/MM/DD HH:mm:ss")}>
            {createdTime}
          </time>
        </div>
      </div>
    </article>
  );
}

function getInvoiceStatus(status: InvoiceStatus, t: (key: string) => string) {
  const labels: Record<InvoiceStatus, string> = {
    [InvoiceStatus.Pending]: t("Pending"),
    [InvoiceStatus.Paid]: t("Paid"),
    [InvoiceStatus.Success]: t("Success"),
    [InvoiceStatus.WaitingForRefundRequest]: t("Refund request"),
    [InvoiceStatus.FastRefunding]: t("Refunding"),
    [InvoiceStatus.Refunded]: t("Refunded"),
    [InvoiceStatus.FailedRefaund]: t("Refund failed"),
    [InvoiceStatus.Failed]: t("Failed"),
  };

  return labels[status] ?? t("Unknown Status");
}

function getInvoiceType(type: InvoiceType, t: (key: string) => string) {
  const labels: Record<InvoiceType, string> = {
    [InvoiceType.Package]: t("Package"),
    [InvoiceType.Product]: t("Product"),
    [InvoiceType.Feature]: t("Feature"),
    [InvoiceType.Custom]: t("Custom"),
  };

  return labels[type] ?? t("Invoice");
}
