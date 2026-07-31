import initialzedTime from "brancy/helper/manageTimer";
import { SubInvoiceItemType, SubInvoiceStatus } from "brancy/models/enums";
import { IInvoice, ISubInvoice } from "brancy/models/interfaces";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import PriceFormater, { PriceFormaterClassName } from "../priceFormater";
import styles from "./subInvoicePopup.module.css";

type SubInvoicesPopupProps = {
  invoice: IInvoice;
  subInvoices: ISubInvoice[];
  getInvoice: (invoiceId: string) => void;
  onClose: () => void;
};

export default function InvoicePopup({ invoice, subInvoices, onClose, getInvoice }: SubInvoicesPopupProps) {
  const { t } = useTranslation();
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
  return (
    <>
      {/* تاریخچه تراکنش‌ها */}
      <section className={styles.pinContainer1}>
        <div className={styles.subInvoiceCard}>
          <div className="headerChild">
            <div className="circle"></div>
            <div className="Title">{t("Invoice History")}</div>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.orderDetailsButton}
                onClick={() => getInvoice?.(invoice.id)}
                aria-label={t("Order details")}
                title={t("Order details")}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 3h6l1 2h3v16H5V5h3l1-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M9 11h6M9 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
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
          </div>
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
              {subInvoices?.map((i, index) => (
                <div key={i.id} className={styles.tableheader1}>
                  <div className={styles.tablecounter}>{index + 1}</div>
                  <div className={styles.orcernumber}>{i.id}</div>
                  <div className={styles.orcernumber}>{i.cardNumber ?? "brancy"}</div>
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
            {subInvoices?.length === 0 && (
              <div className={styles.emptyState}>{t("No invoices have been registered yet.")}</div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
