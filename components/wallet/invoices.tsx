import { IGetSubInvoice, ISubInvoice } from "brancy/models/interfaces";
import PriceFormater, { PriceFormaterClassName, PriceType } from "../priceFormater";
import styles from "./invoices.module.css";
import Loading from "../notOk/loading";
type SubInvoicesProps = {
  subInvoices: IGetSubInvoice;
  subInvoicesLoading?: boolean;
};
export default function SubInvoices({ subInvoices, subInvoicesLoading }: SubInvoicesProps) {
  return (
    <>
      {/* تاریخچه تراکنش‌ها */}
      <div className={styles.pinContainer1}>
        {subInvoicesLoading && <Loading />}
        {!subInvoicesLoading && (
          <div className="tooBigCard">
            <div className="headerChild">
              <div className="circle"></div>
              <div className="Title">تاریخچه تراکنش نمایشی</div>
            </div>
            <div className={styles.section4}>
              <div className={styles.sorting}>
                <div className={styles.calendar}>از تاریخ</div>
                <div className={styles.calendar}>تا تاریخ</div>
              </div>
            </div>
            <div className={styles.section5}>
              <div className={styles.table}>
                <div className={styles.tableheader}>
                  <div className={styles.header1}>#</div>
                  <div className={styles.header2}>کد تراکنش</div>
                  <div className={styles.header3}>شماره پرداخت</div>
                  <div className={styles.header4}>نوع</div>
                  <div className={styles.header5}>مبلغ (ریال)</div>
                  <div className={styles.header6}>وضعیت</div>
                  <div className={styles.header7}>زمان</div>
                  <div className={styles.header8}>اشتراک</div>
                </div>
                {subInvoices?.items.map((i, index) => (
                  <div key={i.id} className={styles.tableheader1}>
                    <div className={styles.tablecounter}>{index + 1}</div>
                    <div className={styles.orcernumber}>TRX{i.id}9824</div>
                    <div className={styles.orcernumber}>PMT{i.id}4561</div>
                    <div className={styles.viwes}>{index % 2 === 0 ? "برداشت" : "واریز"}</div>
                    <div className={styles.viwes}>
                      {
                        <PriceFormater
                          pricetype={PriceType.Dollar}
                          fee={0}
                          className={PriceFormaterClassName.PostPrice}
                        />
                      }
                    </div>
                    <div className={styles.confirmedstatus}>{index % 3 === 0 ? "تسویه شد" : "در انتظار"}</div>
                    <div className={styles.date}>
                      <div className={styles.day}>1404/08/2{index}</div>
                      <div className={styles.hour}>12:{40 + index} ق.ظ</div>
                    </div>
                    <div className={styles.share}>
                      <img className={styles.sharetype} src="/pdf.svg" />
                      <img className={styles.sharetype} src="/jpg.svg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.section4}>
              <div className={styles.calendar}>فیلتر پیشرفته</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
