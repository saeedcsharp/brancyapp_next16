import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import initialzedTime from "brancy/helper/manageTimer";
import { useInfiniteScroll } from "brancy/helper/useInfiniteScroll";
import { SubInvoiceItemType, SubInvoiceStatus } from "brancy/models/enums";
import { IGetSubInvoice, ISubInvoice } from "brancy/models/interfaces";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import { NotifType, notify, ResponseType } from "../../notifications/notificationBox";
import Loading from "../../notOk/loading";
import PriceFormater, { PriceFormaterClassName } from "../../priceFormater";
import styles from "./subInvoicePopup.module.css";
import DotLoaders from "brancy/components/design/loader/dotLoaders";
type SubInvoicesPopupProps = {
  cardNumber: string;
  subInvoices: IGetSubInvoice | null;
  onClose: () => void;
  onSubInvoicesChange: (subInvoices: IGetSubInvoice) => void;
};
export default function SubInvoicesP({ cardNumber, subInvoices, onClose, onSubInvoicesChange }: SubInvoicesPopupProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [subInvoicesLoading, setSubInvoicesLoading] = useState(subInvoices === null);
  const downsectionDragRef = useRef({ startX: 0, startScrollLeft: 0, element: null as HTMLDivElement | null });
  function manageSubInvoiceType(type: SubInvoiceItemType): string {
    switch (type) {
      case SubInvoiceItemType.InstagramerLogestic:
        return t("Logestic Payment");
      case SubInvoiceItemType.InstagramerProduct:
        return t("Product Income");
      case SubInvoiceItemType.PlatformFeature:
        return t("Brancy Feature Income");
      case SubInvoiceItemType.PlatformLogestic:
        return t("Brancy Logestic Payment");
      case SubInvoiceItemType.PlatformPackage:
        return t("Brancy Package Income");
      case SubInvoiceItemType.PlatformProductFee:
        return t("Brancy Product Income");
      case SubInvoiceItemType.PlatformTransferFee:
        return t("Brancy Transfer payment");
    }
  }
  function manageSubInvoiceStatus(status: SubInvoiceStatus): { label: string; className: string } {
    switch (status) {
      case SubInvoiceStatus.None:
        return { label: t("Unsettled"), className: "IDblue" };
      case SubInvoiceStatus.AwaitingSettled:
        return { label: t("Awaiting Settled"), className: "IDpurple" };
      case SubInvoiceStatus.Settled:
        return { label: t("Settled"), className: "IDgreen" };
      case SubInvoiceStatus.Failed:
        return { label: t("Failed"), className: "IDred" };
      default:
        return { label: t("Unknown Status"), className: "IDgray" };
    }
  }
  const handleDownsectionPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const element = event.currentTarget;
    downsectionDragRef.current = {
      startX: event.clientX,
      startScrollLeft: element.scrollLeft,
      element,
    };
    element.setPointerCapture(event.pointerId);
    element.classList.add(styles.dragging);
  }, []);
  const handleDownsectionPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const { element, startX, startScrollLeft } = downsectionDragRef.current;
    if (!element || !element.hasPointerCapture(event.pointerId)) return;

    element.scrollLeft = startScrollLeft - (event.clientX - startX);
  }, []);
  const handleDownsectionPointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const element = downsectionDragRef.current.element;
    if (!element) return;

    if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
    element.classList.remove(styles.dragging);
    downsectionDragRef.current = { startX: 0, startScrollLeft: 0, element: null };
  }, []);
  async function getSubInvoices(cardNumber: string, nextMaxId?: string) {
    setSubInvoicesLoading(true);
    try {
      const res = await clientFetchApi<null, IGetSubInvoice>("/api/wallet/getSubInvoices", {
        session,
        methodType: MethodType.post,
        queries: [
          { key: "cardNumber", value: cardNumber },
          { key: "nextMaxId", value: nextMaxId ?? "" },
        ],
        data: [0, 1, 2, 3],
      });
      if (res && res.succeeded) {
        onSubInvoicesChange(res.value ?? { items: [], nextMaxId: null });
      } else {
        notify(res.info.responseType, NotifType.Warning);
        onSubInvoicesChange({ items: [], nextMaxId: null });
      }
    } catch (err) {
      console.error("getsubInvoices error", err);
      notify(ResponseType.Unexpected, NotifType.Error);
      onSubInvoicesChange({ items: [], nextMaxId: null });
    } finally {
      setSubInvoicesLoading(false);
    }
  }
  useEffect(() => {
    if (!session || subInvoices) return;
    getSubInvoices(cardNumber);
  }, [cardNumber, session, subInvoices]);
  const fetchMoreSubInvoices = useCallback(async (): Promise<ISubInvoice[]> => {
    const nextMaxId = subInvoices?.nextMaxId;
    if (!session || !nextMaxId) return [];
    try {
      const res = await clientFetchApi<null, IGetSubInvoice>("/api/wallet/getSubInvoices", {
        session,
        methodType: MethodType.post,
        queries: [
          { key: "cardNumber", value: cardNumber },
          { key: "nextMaxId", value: nextMaxId },
        ],
        data: [0, 1, 2, 3],
      });
      if (!res.succeeded) {
        notify(res.info.responseType, NotifType.Warning);
        if (subInvoices) onSubInvoicesChange({ ...subInvoices, nextMaxId: null });
        return [];
      }
      const nextPage = res.value ?? { items: [], nextMaxId: null };
      const nextItems = Array.isArray(nextPage.items) ? nextPage.items : [];
      if (subInvoices) {
        onSubInvoicesChange({ ...subInvoices, nextMaxId: nextItems.length > 0 ? nextPage.nextMaxId : null });
      }
      return nextItems;
    } catch (err) {
      console.error("fetchMoreSubInvoices error", err);
      notify(ResponseType.Unexpected, NotifType.Error);
      if (subInvoices) onSubInvoicesChange({ ...subInvoices, nextMaxId: null });
      return [];
    }
  }, [cardNumber, onSubInvoicesChange, session, subInvoices]);
  const { containerRef, isLoadingMore } = useInfiniteScroll<ISubInvoice>({
    hasMore: Boolean(subInvoices?.nextMaxId),
    fetchMore: fetchMoreSubInvoices,
    onDataFetched: (newItems) => {
      if (subInvoices) onSubInvoicesChange({ ...subInvoices, items: [...subInvoices.items, ...newItems] });
    },
    getItemId: (subInvoice) => subInvoice.id,
    currentData: subInvoices?.items ?? [],
    isLoading: subInvoicesLoading,
    enabled: Boolean(session && subInvoices),
    enableAutoLoad: subInvoices === null,
  });
  return (
    <>
      <div className="headerparent">
        <div className="headerChild">
          <div className="circle" />
          <div className="Title">{t("Sub Invoice History")}</div>
        </div>
        <img
          src="/close-box.svg"
          alt={t("close")}
          onClick={onClose}
          role="button"
          aria-label={t("close")}
          title={t("close")}
          style={{ width: "36px" }}
        />
      </div>
      <section ref={containerRef} className={styles.pinContainer} aria-busy={subInvoicesLoading || isLoadingMore}>
        {subInvoicesLoading && <Loading />}
        {!subInvoicesLoading && (
          <>
            {subInvoices?.items.map((i) => {
              const status = manageSubInvoiceStatus(i.status);
              return (
                <div key={i.id} className={styles.list}>
                  <div className={styles.upsection}>
                    <PriceFormater pricetype={i.priceType} fee={i.price} className={PriceFormaterClassName.PostPrice} />
                    <div
                      className={status.className}
                      style={{
                        fontSize: "var(--font-14)",
                        borderRadius: "var(--br10)",
                        padding: "var(--padding-5) var(--padding-8)",
                      }}>
                      {status.label}
                    </div>
                  </div>
                  <div
                    className={styles.downsection}
                    onPointerDown={handleDownsectionPointerDown}
                    onPointerMove={handleDownsectionPointerMove}
                    onPointerUp={handleDownsectionPointerUp}
                    onPointerCancel={handleDownsectionPointerUp}>
                    <div className={styles.detailcontainer}>
                      <div className={styles.detailIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path d="M4 17.98V9.71c0-3.64 0-5.45 1.17-6.58S8.23 2 12 2s5.66 0 6.83 1.13S20 6.07 20 9.7v8.27c0 2.3 0 3.46-.77 3.87-1.5.8-4.3-1.86-5.64-2.67-.77-.46-1.16-.7-1.59-.7s-.82.24-1.59.7c-1.33.8-4.14 3.47-5.64 2.67C4 21.44 4 20.3 4 17.98" />
                        </svg>
                      </div>
                      <div className={styles.detailitem}>
                        <div className={styles.detailheader}>{t("id")}</div>
                        <div className={styles.detailvalue}>{i.id}</div>
                      </div>
                    </div>
                    <div className={styles.detailcontainer}>
                      <div className={styles.detailIcon}>
                        <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path
                            d="M13.3 13.1h2m-11 0h2m2-9h2m2 15h4.1q2.3-.1 2.4-2.5v-4q-.1-2.4-2.3-2.5h-4.2q-2.3.1-2.4 2.5v4q.1 2.3 2.3 2.5m-9 0h4.1q2.3-.1 2.4-2.5v-4q-.1-2.4-2.3-2.5H3.3Q1 10.2.9 12.6v4Q1 18.9 3.1 19m4-9h4.1q2.3-.1 2.4-2.5v-4c0-1.4-.9-2.5-2.3-2.5h-4Q5 1.2 4.9 3.6v4Q5 9.9 7.1 10"

                          />
                        </svg>
                      </div>

                      <div className={styles.detailitem}>
                        <div className={styles.detailheader}>{t("type")}</div>
                        <div className={styles.detailvalue}>{manageSubInvoiceType(i.itemType)}</div>
                      </div>
                    </div>
                    <div className={styles.detailcontainer}>
                      <div className={styles.detailIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path d="M2 12c0-3.5 0-5.3 1-6.5l.6-.5C5 4 6.7 4 10.5 4h3c3.8 0 5.6 0 6.9 1l.5.5C22 6.7 22 8.5 22 12s0 5.3-1 6.5l-.6.5c-1.3 1-3.1 1-6.9 1h-3c-3.8 0-5.6 0-6.9-1l-.5-.5C2 17.3 2 15.5 2 12 M10 16h1.5m3 0H18 M2 9h20" />
                        </svg>
                      </div>
                      <div className={styles.detailitem}>
                        <div className={styles.detailheader}>{t("card number")}</div>
                        <div className={styles.detailvalue}>{i.cardNumber}</div>
                      </div>
                    </div>
                    <div className={styles.detailcontainer}>
                      <div className={styles.detailIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path d="M16 2v4M8 2v4m5-2h-2C7.23 4 5.34 4 4.17 5.17S3 8.23 3 12v2c0 3.77 0 5.66 1.17 6.83S7.23 22 11 22h2c3.77 0 5.66 0 6.83-1.17S21 17.77 21 14v-2c0-3.77 0-5.66-1.17-6.83S16.77 4 13 4M3 10h18 M12.13 14H12m.13 4H12m-4.37-4H7.5m.13 4H7.5m9.13-4h-.13m-4.25 0a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0m0 4a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0m-4.5-4a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0m0 4a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0m9-4a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0" />
                        </svg>
                      </div>
                      <div className={styles.detailitem}>
                        <div className={styles.detailheader}>{t("time")}</div>
                        <div className={styles.detailvalue}>
                          {new DateObject({
                            date: i.createdTime * 1000,
                            calendar: initialzedTime().calendar,
                            locale: initialzedTime().locale,
                          }).format("YYYY/MM/DD - HH:mm:ss")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {subInvoices?.items.length === 0 && (
              <div className={styles.emptyState}>{t("No invoices have been registered yet.")}</div>
            )}
            {isLoadingMore && (
              <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                <DotLoaders />
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
