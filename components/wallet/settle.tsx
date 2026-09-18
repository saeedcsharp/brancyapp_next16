import initialzedTime from "brancy/helper/manageTimer";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { useInfiniteScroll } from "brancy/helper/useInfiniteScroll";
import { SubInvoiceItemType, SubInvoiceStatus } from "brancy/models/enums";
import { IGetInvoice, IInvoice, ISubInvoice } from "brancy/models/interfaces";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import DotLoaders from "brancy/components/design/loader/dotLoaders";
import PriceFormater, { PriceFormaterClassName } from "../priceFormater";
import styles from "./settle.module.css";

type SettlementItem = ISubInvoice & { invoiceId: string };

const settlementStatuses = new Set<SubInvoiceStatus>([
  SubInvoiceStatus.AwaitingSettled,
  SubInvoiceStatus.Settled,
  SubInvoiceStatus.Failed,
]);

function toSettlementItems(invoices: IInvoice[]): SettlementItem[] {
  return invoices.flatMap((invoice) =>
    (invoice.subInvoices ?? [])
      .filter((subInvoice) => settlementStatuses.has(subInvoice.status))
      .map((subInvoice) => ({ ...subInvoice, invoiceId: invoice.id })),
  );
}

export default function Settle() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [invoices, setInvoices] = useState<IGetInvoice | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const response = await clientFetchApi<null, IGetInvoice>("/api/wallet/getInvoices", {
        session,
        queries: [{ key: "nextMaxId", value: "" }],
      });
      if (response.succeeded) setInvoices(response.value ?? { items: [], nextMaxId: null });
      else {
        notify(response.info.responseType, NotifType.Warning);
        setInvoices({ items: [], nextMaxId: null });
      }
    } catch (error) {
      console.error("fetchSettlementHistory error", error);
      notify(ResponseType.Unexpected, NotifType.Error);
      setInvoices({ items: [], nextMaxId: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchInvoices();
  }, [session]);

  const fetchMore = useCallback(async (): Promise<SettlementItem[]> => {
    if (!session || !invoices?.nextMaxId) return [];
    try {
      const response = await clientFetchApi<null, IGetInvoice>("/api/wallet/getInvoices", {
        session,
        queries: [{ key: "nextMaxId", value: invoices.nextMaxId }],
      });
      if (!response.succeeded) {
        notify(response.info.responseType, NotifType.Warning);
        setInvoices((current) => (current ? { ...current, nextMaxId: null } : current));
        return [];
      }
      const nextPage = response.value ?? { items: [], nextMaxId: null };
      setInvoices((current) => (current ? { ...current, nextMaxId: nextPage.nextMaxId } : current));
      return toSettlementItems(nextPage.items ?? []);
    } catch (error) {
      console.error("fetchMoreSettlementHistory error", error);
      notify(ResponseType.Unexpected, NotifType.Error);
      setInvoices((current) => (current ? { ...current, nextMaxId: null } : current));
      return [];
    }
  }, [invoices?.nextMaxId, session]);

  const items = toSettlementItems(invoices?.items ?? []);
  const { containerRef, isLoadingMore } = useInfiniteScroll<SettlementItem>({
    hasMore: Boolean(invoices?.nextMaxId),
    fetchMore,
    onDataFetched: (newItems) => {
      setInvoices((current) => {
        if (!current) return current;
        const existingIds = new Set(
          current.items.flatMap((invoice) => invoice.subInvoices ?? []).map((item) => item.id),
        );
        const newInvoices = newItems
          .filter((item) => !existingIds.has(item.id))
          .map((item) => ({ id: item.invoiceId, subInvoices: [item] }) as IInvoice);
        return { ...current, items: [...current.items, ...newInvoices] };
      });
    },
    getItemId: (item) => item.id,
    currentData: items,
    isLoading: loading,
    enabled: Boolean(session && invoices),
  });

  return (
    <section className={styles.settleContainer} ref={containerRef} aria-busy={loading || isLoadingMore}>
      {loading ? (
        <Loading />
      ) : items.length > 0 ? (
        items.map((item) => <SettlementCard key={item.id} item={item} t={t} />)
      ) : (
        <div className={styles.emptyState}>{t("No invoices have been registered yet.")}</div>
      )}
      {!loading && isLoadingMore && <DotLoaders />}
    </section>
  );
}

function SettlementCard({ item, t }: { item: SettlementItem; t: (key: string) => string }) {
  const status = getStatus(item.status, t);
  const date = new DateObject({
    date: item.createdTime * 1000,
    calendar: initialzedTime().calendar,
    locale: initialzedTime().locale,
  }).format("YYYY/MM/DD HH:mm");

  return (
    <div className={styles.settleCard}>
      <div className={styles.settleTopRow}>
        <PriceFormater pricetype={item.priceType} fee={item.price} className={PriceFormaterClassName.PostPrice} />
        <div className={status.className}>{status.label}</div>
      </div>
      <div className={styles.settleDetails}>
        <Detail label={t("Invoice ID")} value={item.invoiceId} />
        <Detail label={t("type")} value={getItemType(item.itemType, t)} />
        <Detail label={t("card number")} value={item.cardNumber ?? t("Unknown")} />
        <Detail label={t("time")} value={date} />
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.detailcontainer}>
      <div className={styles.detailIcon} aria-hidden="true" />
      <div className={styles.detailitem}>
        <div className={styles.detailheader}>{label}</div>
        <div className={styles.detailvalue}>{value}</div>
      </div>
    </div>
  );
}

function getStatus(status: SubInvoiceStatus, t: (key: string) => string) {
  const labels: Record<SubInvoiceStatus, string> = {
    [SubInvoiceStatus.None]: t("Unsettled"),
    [SubInvoiceStatus.AwaitingSettled]: t("Awaiting Settled"),
    [SubInvoiceStatus.Settled]: t("Settled"),
    [SubInvoiceStatus.Failed]: t("Failed"),
  };
  const classNames: Record<SubInvoiceStatus, string> = {
    [SubInvoiceStatus.None]: "IDblue",
    [SubInvoiceStatus.AwaitingSettled]: "IDpurple",
    [SubInvoiceStatus.Settled]: "IDgreen",
    [SubInvoiceStatus.Failed]: "IDred",
  };
  return { label: labels[status] ?? t("Unknown Status"), className: classNames[status] ?? "IDgray" };
}

function getItemType(type: SubInvoiceItemType, t: (key: string) => string) {
  const labels: Partial<Record<SubInvoiceItemType, string>> = {
    [SubInvoiceItemType.InstagramerLogestic]: t("Logestic Payment"),
    [SubInvoiceItemType.InstagramerProduct]: t("Product Income"),
    [SubInvoiceItemType.PlatformFeature]: t("Brancy Feature Income"),
    [SubInvoiceItemType.PlatformLogestic]: t("Brancy Logestic Payment"),
    [SubInvoiceItemType.PlatformPackage]: t("Brancy Package Income"),
    [SubInvoiceItemType.PlatformProductFee]: t("Brancy Product Income"),
    [SubInvoiceItemType.PlatformTransferFee]: t("Brancy Transfer payment"),
  };
  return labels[type] ?? t("Invoice");
}
