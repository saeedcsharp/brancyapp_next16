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
import { LanguageKey } from "brancy/i18n";

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
        <div className={styles.emptyState}>{t(LanguageKey.NoSettlementsRegisteredYet)}</div>
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
        <Detail label={t(LanguageKey.InvoiceID)} value={item.invoiceId} />
        <Detail label={t(LanguageKey.InvoiceType)} value={getItemType(item.itemType, t)} />
        <Detail label={t(LanguageKey.CardBankNumber)} value={item.cardNumber ?? t(LanguageKey.Unknown)} />
        <Detail label={t(LanguageKey.createdtime)} value={date} />
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
    [SubInvoiceStatus.None]: t(LanguageKey.Unsettled),
    [SubInvoiceStatus.AwaitingSettled]: t(LanguageKey.AwaitingSettled),
    [SubInvoiceStatus.Settled]: t(LanguageKey.Settled),
    [SubInvoiceStatus.Failed]: t(LanguageKey.Failed),
  };
  const classNames: Record<SubInvoiceStatus, string> = {
    [SubInvoiceStatus.None]: "IDblue",
    [SubInvoiceStatus.AwaitingSettled]: "IDpurple",
    [SubInvoiceStatus.Settled]: "IDgreen",
    [SubInvoiceStatus.Failed]: "IDred",
  };
  return { label: labels[status] ?? t(LanguageKey.UnknownStatus), className: classNames[status] ?? "IDgray" };
}

function getItemType(type: SubInvoiceItemType, t: (key: string) => string) {
  const labels: Partial<Record<SubInvoiceItemType, string>> = {
    [SubInvoiceItemType.InstagramerLogestic]: t(LanguageKey.LogesticPayment),
    [SubInvoiceItemType.InstagramerProduct]: t(LanguageKey.ProductIncome),
    [SubInvoiceItemType.PlatformFeature]: t(LanguageKey.BrancyFeatureIncome),
    [SubInvoiceItemType.PlatformLogestic]: t(LanguageKey.BrancyLogesticPayment),
    [SubInvoiceItemType.PlatformPackage]: t(LanguageKey.BrancyPackageIncome),
    [SubInvoiceItemType.PlatformProductFee]: t(LanguageKey.BrancyProductIncome),
    [SubInvoiceItemType.PlatformTransferFee]: t(LanguageKey.BrancyTransferPayment),
  };
  return labels[type] ?? t(LanguageKey.Invoice);
}
