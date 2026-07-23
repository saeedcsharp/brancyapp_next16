import { IGeneralBallance, IBankCard } from "brancy/models/interfaces";
import styles from "./inboxContainer.module.css";
import { SubInvoiceStatus } from "brancy/models/enums";
export default function InboxContainer({
  generalBalance,
  cards,
}: {
  generalBalance: IGeneralBallance[];
  cards: IBankCard[];
}) {
  const formatMoney = (v: number) => v.toLocaleString("fa-IR");
  const totalBalance = generalBalance
    .filter((item) => item.status === SubInvoiceStatus.None)
    .reduce((total, item) => total + item.totalPrice, 0);
  const totalSettledBalance = generalBalance
    .filter((item) => item.status === SubInvoiceStatus.Settled)
    .reduce((total, item) => total + item.totalPrice, 0);
  const totalFailedBalance = generalBalance
    .filter((item) => item.status === SubInvoiceStatus.Failed)
    .reduce((total, item) => total + item.totalPrice, 0);
  const totalAwaitingSettleBalance = generalBalance
    .filter((item) => item.status === SubInvoiceStatus.AwaitingSettled)
    .reduce((total, item) => total + item.totalPrice, 0);
  return (
    <div className={styles.inboxContainer}>
      <div className={styles.followers}>
        <div className={styles.title}>موجودی کیف پول</div>
        <div className={styles.div}>{formatMoney(totalBalance)}</div>
      </div>
      {/* <div className={styles.lastPost}>
        <div className={styles.rectangleImage}></div>
        <div className={styles.title}>درآمد این ماه</div>
        <div className={styles.div}>{formatMoney(5407)}</div>
        <div className={styles.title}>رشد لحظه‌ای</div>
      </div> */}
      <div className={styles.newlikes}>
        <div className={styles.title}>برداشت کل موجودی</div>
        <div className={styles.div}>{formatMoney(totalSettledBalance)}</div>
        <div className={styles.title}>ثبت شده</div>
      </div>
      {/* <div className={styles.newCommnet}>
        <div className={styles.title}>تراکنش‌های موفق</div>
        <div className={styles.div}>{formatMoney(totalSettledBalance)}</div>
        <div className={styles.title}>این ماه</div>
      </div> */}
      <div className={styles.postrequest}>
        <div className={styles.title}>تراکنش‌های برگشتی</div>
        <div className={styles.div}>{formatMoney(totalFailedBalance)}</div>
        <div className={styles.title}>کنترل ریسک</div>
      </div>
      {/* <div className={styles.followers}>
        <div className={styles.title}>تبدیل به رمزارز</div>
        <div className={styles.div}>{formatMoney(88855)}</div>
        <div className={styles.title}>در ماه جاری</div>
      </div> */}
      {/* <div className={styles.newlikes}>
        <div className={styles.title}>تعداد تسویه‌نشده</div>
        <div className={styles.div}>{7171}</div>
        <div className={styles.title}>در صف تسویه</div>
      </div> */}
      <div className={styles.lastPost}>
        <div className={styles.rectangleImage}></div>
        <div className={styles.title}>در حال تسویه</div>
        <div className={styles.div}>{formatMoney(totalAwaitingSettleBalance)}</div>
        <div className={styles.title}>چرخه تجمیع</div>
      </div>
    </div>
  );
}
