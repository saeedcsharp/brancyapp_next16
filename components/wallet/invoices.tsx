import initialzedTime from "brancy/helper/manageTimer";
import { InvoiceStatus, InvoiceType } from "brancy/models/enums";
import { IGetInvoice, IInvoice } from "brancy/models/interfaces";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import { useCallback, useEffect, useState } from "react";
import styles from "./invoices.module.css";
import PriceFormater, { PriceFormaterClassName } from "../priceFormater";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { useSession } from "next-auth/react";
import { notify, NotifType, ResponseType } from "brancy/components/notifications/notificationBox";
import { useInfiniteScroll } from "brancy/helper/useInfiniteScroll";
import Loading from "../notOk/loading";
import { LanguageKey } from "brancy/i18n";
import DotLoaders from "../design/loader/dotLoaders";
type InvoicesProps = {
  openInvoicePopup?: (invoice: IInvoice) => void;
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
export default function Invoices({ openInvoicePopup }: InvoicesProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [invoices, setInvoices] = useState<IGetInvoice | null>(null);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const fetchInvoices = async () => {
    if (!session) return;
    setInvoicesLoading(true);
    try {
      const response = await clientFetchApi<null, IGetInvoice>("/api/wallet/getInvoices", {
        session,
        queries: [{ key: "nextMaxId", value: "" }],
      });
      if (response.succeeded) setInvoices(response.value);
      else {
        notify(response.info.responseType, NotifType.Warning);
        setInvoices({ items: [], nextMaxId: null });
      }
    } catch (error) {
      console.error("fetchInvoices error", error);
      notify(ResponseType.Unexpected, NotifType.Error);
      setInvoices({ items: [], nextMaxId: null });
    } finally {
      setInvoicesLoading(false);
    }
  };
  useEffect(() => {
    void fetchInvoices();
  }, [session]);
  const fetchMoreInvoices = useCallback(async (): Promise<IInvoice[]> => {
    const nextMaxId = invoices?.nextMaxId;
    if (!session || !nextMaxId) return [];
    try {
      const response = await clientFetchApi<null, IGetInvoice>("/api/wallet/getInvoices", {
        session,
        queries: [{ key: "nextMaxId", value: nextMaxId }],
      });
      if (!response.succeeded) {
        notify(response.info.responseType, NotifType.Warning);
        setInvoices((current) => (current ? { ...current, nextMaxId: null } : current));
        return [];
      }
      const nextPage = response.value ?? { items: [], nextMaxId: null };
      const nextItems = Array.isArray(nextPage.items) ? nextPage.items : [];
      setInvoices((current) =>
        current ? { ...current, nextMaxId: nextItems.length ? nextPage.nextMaxId : null } : current,
      );
      return nextItems;
    } catch (error) {
      console.error("fetchMoreInvoices error", error);
      notify(ResponseType.Unexpected, NotifType.Error);
      setInvoices((current) => (current ? { ...current, nextMaxId: null } : current));
      return [];
    }
  }, [invoices?.nextMaxId, session]);
  const { containerRef, isLoadingMore: invoicesLoadingMore } = useInfiniteScroll<IInvoice>({
    hasMore: Boolean(invoices?.nextMaxId),
    fetchMore: fetchMoreInvoices,
    onDataFetched: (newInvoices) => {
      setInvoices((current) => (current ? { ...current, items: [...current.items, ...newInvoices] } : current));
    },
    getItemId: (invoice) => invoice.id,
    currentData: invoices?.items ?? [],
    isLoading: invoicesLoading,
    enabled: Boolean(session && invoices),
  });
  const hasMore = Boolean(invoices?.nextMaxId);
  const items = invoices?.items ?? [];
  return (
    <section className={styles.invoicecontainer} ref={containerRef} aria-busy={invoicesLoading || invoicesLoadingMore}>
      {invoicesLoading ? (
        <>
          <Loading />
        </>
      ) : items.length > 0 ? (
        <>
          {items.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} openInvoicePopup={openInvoicePopup} />
          ))}
        </>
      ) : (
        <div className={styles.emptyState}>{t(LanguageKey.emptyInvoice)}</div>
      )}
      {!invoicesLoading && (invoicesLoadingMore || hasMore) && <>{invoicesLoadingMore && <DotLoaders />}</>}
    </section>
  );
}

function InvoiceCard({
  invoice,
  openInvoicePopup,
}: {
  invoice: IInvoice;
  openInvoicePopup?: (invoice: IInvoice) => void;
}) {
  const { t } = useTranslation();
  const status = getInvoiceStatus(invoice.status, t);
  const createdTime = new DateObject({
    date: invoice.createdTime * 1000,
    calendar: initialzedTime().calendar,
    locale: initialzedTime().locale,
  }).format("YYYY/MM/DD HH:mm");
  return (
    <div
      onClick={() => openInvoicePopup?.(invoice)}
      className={`${styles.invoiceCard} ${styles[invoiceStatusClassNames[invoice.status]]}`}>
      <div className={styles.invoiceTopRow}>
        <PriceFormater
          pricetype={invoice.priceType}
          fee={invoice.amount}
          className={PriceFormaterClassName.PostPrice}
        />
        <div className={styles.status}>{status}</div>
      </div>

      <div className={styles.invoiceDetails}>
        <div className={styles.detailcontainer}>
          <div className={styles.detailIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M16 2v4M8 2v4m5-2h-2C7.23 4 5.34 4 4.17 5.17S3 8.23 3 12v2c0 3.77 0 5.66 1.17 6.83S7.23 22 11 22h2c3.77 0 5.66 0 6.83-1.17S21 17.77 21 14v-2c0-3.77 0-5.66-1.17-6.83S16.77 4 13 4M3 10h18 M12.13 14H12m.13 4H12m-4.37-4H7.5m.13 4H7.5m9.13-4h-.13m-4.25 0a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0m0 4a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0m-4.5-4a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0m0 4a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0m9-4a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0" />
            </svg>
          </div>
          <div className={styles.detailitem}>
            <div className={styles.detailheader}>{t(LanguageKey.createtime)}</div>
            <div className={styles.detailvalue}>
              <time
                dateTime={new DateObject({
                  date: invoice.createdTime * 1000,
                  calendar: initialzedTime().calendar,
                  locale: initialzedTime().locale,
                }).format("YYYY/MM/DD  HH:mm:ss")}>
                {createdTime}
              </time>
            </div>
          </div>
        </div>
        <div className={styles.detailcontainer}>
          <div className={styles.detailIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M4 17.98V9.71c0-3.64 0-5.45 1.17-6.58S8.23 2 12 2s5.66 0 6.83 1.13S20 6.07 20 9.7v8.27c0 2.3 0 3.46-.77 3.87-1.5.8-4.3-1.86-5.64-2.67-.77-.46-1.16-.7-1.59-.7s-.82.24-1.59.7c-1.33.8-4.14 3.47-5.64 2.67C4 21.44 4 20.3 4 17.98" />
            </svg>
          </div>
          <div className={styles.detailitem}>
            <div className={styles.detailheader}>{t(LanguageKey.InvoiceID)}</div>
            <div className={styles.detailvalue}>{invoice.id}</div>
          </div>
        </div>
        <div className={styles.detailcontainer}>
          <div className={styles.detailIcon}>
            <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M13.3 13.1h2m-11 0h2m2-9h2m2 15h4.1q2.3-.1 2.4-2.5v-4q-.1-2.4-2.3-2.5h-4.2q-2.3.1-2.4 2.5v4q.1 2.3 2.3 2.5m-9 0h4.1q2.3-.1 2.4-2.5v-4q-.1-2.4-2.3-2.5H3.3Q1 10.2.9 12.6v4Q1 18.9 3.1 19m4-9h4.1q2.3-.1 2.4-2.5v-4c0-1.4-.9-2.5-2.3-2.5h-4Q5 1.2 4.9 3.6v4Q5 9.9 7.1 10" />
            </svg>
          </div>

          <div className={styles.detailitem}>
            <div className={styles.detailheader}>{t(LanguageKey.InvoiceType)}</div>
            <div className={styles.detailvalue}>{getInvoiceType(invoice.invoiceType, t)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
function getInvoiceStatus(status: InvoiceStatus, t: (key: string) => string) {
  const labels: Record<InvoiceStatus, string> = {
    [InvoiceStatus.Pending]: t(LanguageKey.Pending),
    [InvoiceStatus.Paid]: t(LanguageKey.Paid),
    [InvoiceStatus.Success]: t(LanguageKey.Success),
    [InvoiceStatus.WaitingForRefundRequest]: t(LanguageKey.RefundRequest),
    [InvoiceStatus.FastRefunding]: t(LanguageKey.Refunding),
    [InvoiceStatus.Refunded]: t(LanguageKey.Refunded),
    [InvoiceStatus.FailedRefaund]: t(LanguageKey.RefundFailed),
    [InvoiceStatus.Failed]: t(LanguageKey.Failed),
  };
  return labels[status] ?? t(LanguageKey.UnknownStatus);
}
function getInvoiceType(type: InvoiceType, t: (key: string) => string) {
  const labels: Record<InvoiceType, string> = {
    [InvoiceType.Package]: t(LanguageKey.Package),
    [InvoiceType.Product]: t(LanguageKey.Product),
    [InvoiceType.Feature]: t(LanguageKey.Feature),
    [InvoiceType.Custom]: t(LanguageKey.Custom),
  };
  return labels[type] ?? t(LanguageKey.Invoice);
}
