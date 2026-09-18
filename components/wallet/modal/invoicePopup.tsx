import initialzedTime from "brancy/helper/manageTimer";
import { SubInvoiceItemType, SubInvoiceStatus } from "brancy/models/enums";
import { IInvoice, ISubInvoice } from "brancy/models/interfaces";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import PriceFormater, { PriceFormaterClassName } from "../../priceFormater";
import styles from "./invoicePopup.module.css";
import ToggleButton from "brancy/components/design/toggleButton/ToggleButton";
import OrderDetailPopup from "brancy/components/wallet/modal/orderDetailPopup";
import { useEffect, useState } from "react";

type SubInvoicesPopupProps = {
  invoice: IInvoice;
  subInvoices: ISubInvoice[];
  getInvoice: (invoiceId: string) => Promise<IInvoice | undefined>;
  onClose: () => void;
};

export default function InvoicePopup({ invoice, subInvoices, onClose, getInvoice }: SubInvoicesPopupProps) {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(0);
  const [orderDetailsInvoice, setOrderDetailsInvoice] = useState<IInvoice | null>(null);
  const orderInvoice = invoice.orderInvoice;
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
  useEffect(() => {
    if (selectedTab !== 1 || orderDetailsInvoice) return;

    let isActive = true;
    void getInvoice(invoice.id).then((fullInvoice) => {
      if (isActive && fullInvoice) setOrderDetailsInvoice(fullInvoice);
    });

    return () => {
      isActive = false;
    };
  }, [getInvoice, invoice.id, orderDetailsInvoice, selectedTab]);
  return (
    <div className={styles.container}>
      <div className="headerparent">
        <div className="headerChild">
          <div className="circle"></div>
          <div className="Title">{t("Invoice History")}</div>
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

      <ToggleButton
        options={[
          { id: 0, label: t("Invoice details") },
          { id: 1, label: t("Order details") },
        ]}
        selectedValue={selectedTab}
        onChange={setSelectedTab}
        ariaLabel={t("Invoice sections")}
        className={styles.tabs}
      />

      {selectedTab === 0 ? (
        <div className={styles.InvoiceDetails}>
          <div className={styles.table}>
            <div className={styles.tableheader}>
              <div className={styles.header}>#</div>
              <div className={styles.header}>{t("id")}</div>
              <div className={styles.header}>{t("card number")}</div>
              <div className={styles.header}>{t("type")}</div>
              <div className={styles.header}>{t("amount")}</div>
              <div className={styles.header}>{t("status")}</div>
              <div className={styles.header}>{t("time")}</div>
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
          {subInvoices?.length === 0 && (
            <div className={styles.emptyState}>{t("No invoices have been registered yet.")}</div>
          )}
        </div>
      ) : orderDetailsInvoice ? (
        <div className={styles.orderDetails}>
          <OrderDetailPopup
            invoice={orderDetailsInvoice}
            onClose={() => setOrderDetailsInvoice(null)}
            backToInvoiceList={() => setOrderDetailsInvoice(null)}
          />
        </div>
      ) : (
        <div className={styles.orderDetails}>
          <div className={styles.orderSummary}>
            <div className={styles.orderSummaryRow}>
              <span>{t("Invoice")}</span>
              <strong>{invoice.id}</strong>
            </div>
            <div className={styles.orderSummaryRow}>
              <span>{t("Order")}</span>
              <strong>{orderInvoice?.orderId ?? t("Not available")}</strong>
            </div>
            <div className={styles.orderSummaryRow}>
              <span>{t("User")}</span>
              <strong>{orderInvoice?.userId ?? t("Not available")}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
