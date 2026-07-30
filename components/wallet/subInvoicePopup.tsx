import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import initialzedTime from "brancy/helper/manageTimer";
import { SubInvoiceItemType, SubInvoiceStatus } from "brancy/models/enums";
import { IGetSubInvoice } from "brancy/models/interfaces";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import { NotifType, notify, ResponseType } from "../notifications/notificationBox";
import Loading from "../notOk/loading";
import PriceFormater, { PriceFormaterClassName } from "../priceFormater";
import styles from "./subInvoices.module.css";

export default function SubInvoicesP({ cardNumber }: { cardNumber: string }) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [subInvoices, setSubInvoices] = useState<IGetSubInvoice | null>(null);
  const [subInvoicesLoading, setSubInvoicesLoading] = useState(true);
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
  async function getsubInvoices(cardNumber: string, nextMaxId?: number) {
    setSubInvoicesLoading(true);
    try {
      const res = await clientFetchApi<null, IGetSubInvoice>("/api/wallet/getSubInvoices", {
        session,
        methodType: MethodType.post,
        queries: [
          { key: "cardNumber", value: cardNumber },
          { key: "nextMaxId", value: nextMaxId?.toString() ?? "" },
        ],
        data: [0, 1, 2, 3],
      });
      if (res && res.succeeded) {
        setSubInvoices(res.value);
      } else {
        notify(res.info.responseType, NotifType.Warning);
        setSubInvoices({ items: [], nextMaxId: null });
      }
    } catch (err) {
      console.error("getsubInvoices error", err);
      notify(ResponseType.Unexpected, NotifType.Error);
      setSubInvoices({ items: [], nextMaxId: null });
    } finally {
      setSubInvoicesLoading(false);
    }
  }
  useEffect(() => {
    if (!session) return;
    getsubInvoices(cardNumber);
  }, [session]);

  return (
    <>
      {/* تاریخچه تراکنش‌ها */}
      <div className={styles.pinContainer1}>
        {subInvoicesLoading && <Loading />}
        {!subInvoicesLoading && (
          <div className="tooBigCard">
            <div className="headerChild">
              <div className="circle"></div>
              <div className="Title">{t("Sub Invoice History")}</div>
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
            </div>
          </div>
        )}
      </div>
    </>
  );
}
