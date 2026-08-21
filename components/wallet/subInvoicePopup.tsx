import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import initialzedTime from "brancy/helper/manageTimer";
import { useInfiniteScroll } from "brancy/helper/useInfiniteScroll";
import ToggleButton from "brancy/components/design/toggleButton/ToggleButton";
import { ToggleOrder } from "brancy/components/design/toggleButton/types";
import { SubInvoiceItemType, SubInvoiceStatus } from "brancy/models/enums";
import { IGeneralBallance, IGetSubInvoice, ISubInvoice } from "brancy/models/interfaces";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import { NotifType, notify, ResponseType } from "../notifications/notificationBox";
import Loading from "../notOk/loading";
import PriceFormater, { PriceFormaterClassName } from "../priceFormater";
import styles from "./subInvoicePopup.module.css";

type SubInvoicesPopupProps = {
  cardNumber: string;
  subInvoices: IGetSubInvoice | null;
  generalBalance: IGeneralBallance[];
  onClose: () => void;
  onSubInvoicesChange: (subInvoices: IGetSubInvoice) => void;
  changeDefaultCard: (cardNumber: string) => void;
};

export default function SubInvoicesP({
  cardNumber,
  subInvoices,
  generalBalance,
  onClose,
  onSubInvoicesChange,
  changeDefaultCard,
}: SubInvoicesPopupProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const total = generalBalance
    .filter((item) => item.cardNumber === cardNumber && item.status === SubInvoiceStatus.None)
    .reduce((sum, item) => sum + item.totalPrice, 0);
  const totalPriceType =
    generalBalance.find((item) => item.cardNumber === cardNumber && item.status === SubInvoiceStatus.None)?.priceType ??
    generalBalance.find((item) => item.cardNumber === cardNumber)?.priceType ??
    2;
  const [activeTab, setActiveTab] = useState<ToggleOrder>(ToggleOrder.FirstToggle);
  const [subInvoicesLoading, setSubInvoicesLoading] = useState(subInvoices === null);
  const [setDefaultCardLoading, setSetDefaultCardLoading] = useState(false);
  const [settleLoading, setSettleLoading] = useState(false);
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
  function manageSubInvoiceStatus(status: SubInvoiceStatus): string {
    switch (status) {
      case SubInvoiceStatus.None:
        return t("Unsettled");
      case SubInvoiceStatus.AwaitingSettled:
        return t("Awaiting Settled");
      case SubInvoiceStatus.Settled:
        return t("Settled");
      case SubInvoiceStatus.Failed:
        return t("Failed");
      default:
        return t("Unknown Status");
    }
  }
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

  async function setDefaultCard() {
    if (!session || setDefaultCardLoading) return;

    setSetDefaultCardLoading(true);
    try {
      const res = await clientFetchApi<null, boolean>("/api/wallet/setDefaultCard", {
        session,
        queries: [{ key: "cardNumber", value: cardNumber }],
      });

      if (res.succeeded) {
        notify(ResponseType.Ok, NotifType.Success);
        changeDefaultCard(cardNumber);
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (err) {
      console.error("setDefaultCard error", err);
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setSetDefaultCardLoading(false);
    }
  }

  async function settleCard() {
    if (!session || settleLoading) return;

    setSettleLoading(true);
    try {
      const res = await clientFetchApi<null, boolean>("/api/wallet/settleRequest", {
        session,
        methodType: MethodType.get,
        queries: [{ key: "cardNumber", value: cardNumber }],
        data: undefined,
      });

      if (res.succeeded) {
        notify(ResponseType.Ok, NotifType.Success);
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (err) {
      console.error("settleCard error", err);
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setSettleLoading(false);
    }
  }

  const tabIcons = {
    firstIcon: {
      active: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 7v5l3 2M4 12a8 8 0 1 0 2.34-5.66L4 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      diactive: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 7v5l3 2M4 12a8 8 0 1 0 2.34-5.66L4 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    secondIcon: {
      active: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0-6v2m0 14v2m9-9h-2M5 12H3m15.36-6.36-1.42 1.42M7.05 16.95l-1.41 1.41m12.72 0-1.42-1.41M7.05 7.05 5.64 5.64"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
      diactive: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0-6v2m0 14v2m9-9h-2M5 12H3m15.36-6.36-1.42 1.42M7.05 16.95l-1.41 1.41m12.72 0-1.42-1.41M7.05 7.05 5.64 5.64"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  };

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
      {/* تاریخچه تراکنش‌ها */}
      <section ref={containerRef} className={styles.pinContainer1} aria-busy={subInvoicesLoading || isLoadingMore}>
        {subInvoicesLoading && <Loading />}
        {!subInvoicesLoading && (
          <div className={styles.subInvoiceCard}>
            <div className="headerChild">
              <div className="circle"></div>
              <div className="Title">{t("Sub Invoice History")}</div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label={t("close")}
                title={t("close")}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <ToggleButton
              data={{ firstToggle: t("History"), secondToggle: t("Setting") }}
              values={{ firstToggle: t("History"), secondToggle: t("Setting") }}
              dataIcon={tabIcons}
              setChangeToggle={setActiveTab}
              toggleValue={activeTab}
            />
            {activeTab === ToggleOrder.FirstToggle ? (
              <div className={styles.section5}>
                <div className={styles.table}>
                  <div className={styles.tableheader}>
                    <div className={styles.header1}>#</div>
                    <div className={styles.header2}>{t("id")}</div>
                    <div className={styles.header3}>{t("card number")}</div>
                    <div className={styles.header4}>{t("type")}</div>
                    <div className={styles.header5}>{t("amount")}</div>
                    <div className={styles.header6}>{t("status")}</div>
                    <div className={styles.header7}>{t("time")}</div>
                    {/* <div className={styles.header8}>اشتراک</div> */}
                  </div>
                  {subInvoices?.items.map((i, index) => (
                    <div key={i.id} className={styles.tableheader1}>
                      <div className={styles.tablecounter}>{index + 1}</div>
                      <div className={styles.orcernumber}>{i.id}</div>
                      <div className={styles.orcernumber}>{i.cardNumber}</div>
                      <div className={styles.viwes}>{manageSubInvoiceType(i.itemType)}</div>
                      <div className={styles.viwes}>
                        {
                          <PriceFormater
                            pricetype={i.priceType}
                            fee={i.price}
                            className={PriceFormaterClassName.PostPrice}
                          />
                        }
                      </div>
                      <div className={styles.confirmedstatus}>{manageSubInvoiceStatus(i.status)}</div>
                      <div className={styles.date}>
                        <div className={styles.day}>
                          {new DateObject({
                            date: i.createdTime * 1000,
                            calendar: initialzedTime().calendar,
                            locale: initialzedTime().locale,
                          }).format("YYYY/MM/DD HH:mm:ss")}
                        </div>
                      </div>
                      {/* <div className={styles.share}>
                      <img className={styles.sharetype} src="/pdf.svg" />
                      <img className={styles.sharetype} src="/jpg.svg" />
                    </div> */}
                    </div>
                  ))}
                </div>
                {subInvoices?.items.length === 0 && (
                  <div className={styles.emptyState}>{t("No invoices have been registered yet.")}</div>
                )}
              </div>
            ) : (
              <div className={styles.defaultCardSettings}>
                <div className={styles.defaultCardNumber}>{cardNumber.replace(/(.{4})/g, "$1 ").trim()}</div>
                <div className={styles.settingsActions}>
                  <section className={styles.settingsAction}>
                    <div className={styles.settingsActionIcon} aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 12.5 9.5 17 19 7.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className={styles.settingsActionContent}>
                      <strong>{t("Default Card")}</strong>
                      <span>{t("Use this card as your default payout account.")}</span>
                    </div>
                    <button
                      type="button"
                      className={styles.defaultCardButton}
                      onClick={setDefaultCard}
                      disabled={!session || setDefaultCardLoading}>
                      {setDefaultCardLoading ? t("Loading...") : t("Set Default Card")}
                    </button>
                  </section>
                  <section className={styles.settingsAction}>
                    <div className={`${styles.settingsActionIcon} ${styles.settleIcon}`} aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 3v18m4-14.5c-.7-.9-2-1.5-4-1.5-2.2 0-4 1.1-4 3s1.8 3 4 3 4 1.1 4 3-1.8 3-4 3c-2 0-3.3-.6-4-1.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className={styles.settingsActionContent}>
                      <strong>{t("Settle")}</strong>
                      <span>{t("Request settlement for the balance assigned to this card.")}</span>
                      <PriceFormater
                        pricetype={totalPriceType}
                        fee={total}
                        className={PriceFormaterClassName.PostPrice}
                      />
                    </div>
                    <button
                      type="button"
                      className={styles.settleButton}
                      onClick={settleCard}
                      disabled={!session || settleLoading || total <= 0}>
                      {settleLoading ? t("Loading...") : t("Settle")}
                    </button>
                  </section>
                </div>
              </div>
            )}
            {isLoadingMore && <Loading />}
          </div>
        )}
      </section>
    </>
  );
}
