import initialzedTime from "brancy/helper/manageTimer";
import { PartnerRole, SubInvoiceItemType, SubInvoiceStatus } from "brancy/models/enums";
import { IInvoice, ISubInvoice } from "brancy/models/interfaces";
import { RoleAccess } from "brancy/helper/loadingStatus";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import PriceFormater, { PriceFormaterClassName } from "../../priceFormater";
import styles from "./invoicePopup.module.css";
import ToggleButton from "brancy/components/design/toggleButton/ToggleButton";
import OrderDetailPopup from "brancy/components/wallet/modal/orderDetailPopup";
import NotAllowedCard from "brancy/components/notOk/notAllowedCard";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { LanguageKey } from "brancy/i18n";

type SubInvoicesPopupProps = {
  invoice: IInvoice;
  subInvoices: ISubInvoice[];
  getInvoice: (invoiceId: string) => Promise<IInvoice | undefined>;
  onClose: () => void;
};

export default function InvoicePopup({ invoice, subInvoices, onClose, getInvoice }: SubInvoicesPopupProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [selectedTab, setSelectedTab] = useState(0);
  const [orderDetailsInvoice, setOrderDetailsInvoice] = useState<IInvoice | null>(null);
  const orderInvoice = invoice.orderInvoice;
  const hasOrderAccess = RoleAccess(session, PartnerRole.Orders);
  function manageSubInvoiceType(type: SubInvoiceItemType): string {
    switch (type) {
      case SubInvoiceItemType.InstagramerLogestic:
        return t(LanguageKey.LogesticPayment);
      case SubInvoiceItemType.InstagramerProduct:
        return t(LanguageKey.ProductIncome);
      case SubInvoiceItemType.PlatformFeature:
        return t(LanguageKey.BrancyFeatureIncome);
      case SubInvoiceItemType.PlatformLogestic:
        return t(LanguageKey.BrancyLogesticPayment);
      case SubInvoiceItemType.PlatformPackage:
        return t(LanguageKey.BrancyPackageIncome);
      case SubInvoiceItemType.PlatformProductFee:
        return t(LanguageKey.BrancyProductIncome);
      case SubInvoiceItemType.PlatformTransferFee:
        return t(LanguageKey.BrancyTransferPayment);
    }
  }
  function manageSubInvoiceStatus(status: SubInvoiceStatus): { label: string; className: string } {
    switch (status) {
      case SubInvoiceStatus.None:
        return { label: t(LanguageKey.Unsettled), className: "IDblue" };
      case SubInvoiceStatus.AwaitingSettled:
        return { label: t(LanguageKey.AwaitingSettled), className: "IDpurple" };
      case SubInvoiceStatus.Settled:
        return { label: t(LanguageKey.Settled), className: "IDgreen" };
      case SubInvoiceStatus.Failed:
        return { label: t(LanguageKey.Failed), className: "IDred" };
      default:
        return { label: t(LanguageKey.UnknownStatus), className: "IDgray" };
    }
  }
  useEffect(() => {
    if (selectedTab !== 1 || !hasOrderAccess || orderDetailsInvoice) return;

    let isActive = true;
    void getInvoice(invoice.id).then((fullInvoice) => {
      if (isActive && fullInvoice) setOrderDetailsInvoice(fullInvoice);
    });

    return () => {
      isActive = false;
    };
  }, [getInvoice, hasOrderAccess, invoice.id, orderDetailsInvoice, selectedTab]);
  return (
    <div className={styles.container}>
      <div className="headerparent">
        <div className="headerChild">
          <div className="circle"></div>
          <div className="Title">{t(LanguageKey.InvoiceHistory)}</div>
        </div>
        <img
          src="/close-box.svg"
          alt={t(LanguageKey.close)}
          onClick={onClose}
          role="button"
          aria-label={t(LanguageKey.close)}
          title={t(LanguageKey.close)}
          style={{ width: "36px" }}
        />
      </div>

      <ToggleButton
        options={[
          { id: 0, label: t(LanguageKey.InvoiceDetails) },
          { id: 1, label: t(LanguageKey.OrderDetails) },
        ]}
        selectedValue={selectedTab}
        onChange={setSelectedTab}
        className={styles.tabs}
      />

      {selectedTab === 0 ? (
        <div className={styles.InvoiceDetails}>
          <div className={styles.table}>
            <div className={styles.tableheader}>
              <div className={styles.header}>#</div>
              <div className={styles.header}>{t(LanguageKey.InvoiceID)}</div>
              <div className={styles.header}>{t(LanguageKey.CardNumber)}</div>
              <div className={styles.header}>{t(LanguageKey.Type)}</div>
              <div className={styles.header}>{t(LanguageKey.Amount)}</div>
              <div className={styles.header}>{t(LanguageKey.status)}</div>
              <div className={styles.header}>{t(LanguageKey.Time)}</div>
            </div>
            {subInvoices?.map((i, index) => (
              <div key={i.id} className={styles.tablecontent}>
                <div className={styles.orcernumber}>{index + 1}</div>
                <div className={styles.orcernumber}>{i.id}</div>
                <div className={styles.orcernumber}>{i.cardNumber ?? "Brancy"}</div>
                <div className={`${styles.orcernumber} IDgray`}>{manageSubInvoiceType(i.itemType)}</div>
                <div className={styles.orcernumber}>
                  <PriceFormater pricetype={i.priceType} fee={i.price} className={PriceFormaterClassName.PostPrice} />
                </div>
                <div className={`${styles.orcernumber} ${manageSubInvoiceStatus(i.status).className}`}>
                  {manageSubInvoiceStatus(i.status).label}
                </div>
                <div className={styles.date}>
                  <div className="day">
                    {new DateObject({
                      date: i.createdTime * 1000,
                      calendar: initialzedTime().calendar,
                      locale: initialzedTime().locale,
                    }).format("YYYY/MM/DD")}
                  </div>
                  <div className="hour">
                    {new DateObject({
                      date: i.createdTime * 1000,
                      calendar: initialzedTime().calendar,
                      locale: initialzedTime().locale,
                    }).format("HH:mm:ss")}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {subInvoices?.length === 0 && <div className={styles.emptyState}>{t(LanguageKey.emptyInvoice)}</div>}
        </div>
      ) : !hasOrderAccess ? (
        <div className={styles.orderDetails}>
          <NotAllowedCard />
        </div>
      ) : orderDetailsInvoice ? (
        <div className={styles.orderDetails}>
          <div className={styles.orderPopup}>
            <OrderDetailPopup
              invoice={orderDetailsInvoice}
              onClose={() => setOrderDetailsInvoice(null)}
              backToInvoiceList={() => setOrderDetailsInvoice(null)}
            />
          </div>
        </div>
      ) : (
        <div className={styles.orderDetails}>
          <div className={styles.orderSummary}>
            <div className={styles.orderSummaryRow}>
              <span>{t(LanguageKey.Invoice)}</span>
              <strong>{invoice.id}</strong>
            </div>
            <div className={styles.orderSummaryRow}>
              <span>{t(LanguageKey.Order)}</span>
              <strong>{orderInvoice?.orderId ?? t(LanguageKey.NotAvailable)}</strong>
            </div>
            <div className={styles.orderSummaryRow}>
              <span>{t(LanguageKey.User)}</span>
              <strong>{orderInvoice?.userId ?? t(LanguageKey.NotAvailable)}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
