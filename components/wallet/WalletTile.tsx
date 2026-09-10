import { IGeneralBallance, IBankCard } from "brancy/models/interfaces";
import styles from "./WalletTile.module.css";
import { SubInvoiceStatus } from "brancy/models/enums";
import { useTranslation } from "react-i18next";
export default function WalletTile({
  generalBalance,
  cards,
}: {
  generalBalance: IGeneralBallance[];
  cards: IBankCard[];
}) {
  const { t } = useTranslation();
  const formatMoney = (v: number) => v.toLocaleString("en-US");
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
    <div className={styles.tileContainer}>
      <div className={styles.tileCard}>
        <div className={styles.tileheader}>
          <svg className={styles.tileheaderIcon} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56">
            <path d="M32.38 22.75a2.63 2.63 0 1 1 0 5.25 2.63 2.63 0 0 1 0-5.25 M44.63 5.25A8.75 8.75 0 0 1 53.37 14v22.75c0 4.23-3 7.76-7 8.57V49a1.75 1.75 0 1 1-3.5 0v-3.5H13.14V49a1.76 1.76 0 0 1-3.5 0v-3.68c-4-.8-7-4.34-7-8.57V14a8.75 8.75 0 0 1 8.75-8.75zm-31.5 25.38c-.97 0-1.76.78-1.76 1.75v3.5a1.76 1.76 0 0 0 3.5 0v-3.5c0-.97-.78-1.76-1.74-1.76m19.24-17.5c-.96 0-1.74.78-1.74 1.74v1.93a8.8 8.8 0 0 0-6.83 6.82h-1.93c-.96 0-1.75.8-1.75 1.75 0 .97.8 1.75 1.75 1.75h1.93a8.8 8.8 0 0 0 6.82 6.83v1.92c0 .97.8 1.76 1.75 1.76.97 0 1.76-.8 1.76-1.76v-1.92a8.8 8.8 0 0 0 6.82-6.83h1.92c.97 0 1.76-.78 1.76-1.75 0-.96-.8-1.75-1.76-1.75h-1.92a8.8 8.8 0 0 0-6.83-6.82v-1.93c0-.96-.78-1.74-1.74-1.74m-19.24 0c-.97 0-1.76.78-1.76 1.74v3.5a1.76 1.76 0 0 0 3.5 0v-3.5c0-.96-.78-1.74-1.74-1.74" />
          </svg>
          {/* <div className={styles.chart}></div> */}
        </div>
        <div className={styles.tiledetail}>
          <div className="title2">{t("Wallet Balance")}</div>
          <div className="title">{formatMoney(totalBalance)}</div>
        </div>
      </div>

      <div className={styles.tileCard}>
        <div className={styles.tileheader}>
          <svg className={styles.tileheaderIcon} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44">
            <path d="M35.56 0H7.63A7.63 7.63 0 0 0 6.3 15.14v21.62a6.45 6.45 0 0 0 6.48 6.49H30.4a6.5 6.5 0 0 0 6.48-6.48V15.14A7.64 7.64 0 0 0 35.56 0m-7.23 32.44-5.6 5.6a1.6 1.6 0 0 1-2.28 0l-5.6-5.6a1.6 1.6 0 0 1 0-2.28 1.6 1.6 0 0 1 2.28 0l2.85 2.85v-9.9a1.6 1.6 0 1 1 3.22 0V33l2.85-2.85a1.6 1.6 0 0 1 2.28 0 1.6 1.6 0 0 1 0 2.28m-11.6-17.07c0-.89.73-1.6 1.62-1.6h6.48a1.6 1.6 0 1 1 0 3.21h-6.48a1.6 1.6 0 0 1-1.61-1.6m20.15-3.54v-2.6h.17a1.6 1.6 0 1 0 0-3.21H6.13a1.6 1.6 0 1 0 0 3.22h.18v2.59a4.4 4.4 0 0 1 1.32-8.6h27.93a4.41 4.41 0 0 1 1.32 8.6" />
          </svg>
          {/* <div className={styles.chart}></div> */}
        </div>
        <div className={styles.tiledetail}>
          <div className="title2">{t("Total Withdrawn")}</div>
          <div className="title">{formatMoney(totalSettledBalance)}</div>
        </div>
      </div>

      <div className={styles.tileCard}>
        <div className={styles.tileheader}>
          <svg className={styles.tileheaderIcon} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 46">
            <path d="M39.56 3.24a1 1 0 0 0-1.09-.08l-2.62 1.57c-.57.34-1.27.34-1.84 0L31.4 3.16a.9.9 0 0 0-.98 0l-2.59 1.56c-.57.35-1.28.35-1.85 0l-2.59-1.56a.9.9 0 0 0-.98 0l-2.6 1.57a1.8 1.8 0 0 1-1.85 0l-2.57-1.58a.9.9 0 0 0-.98 0l-2.59 1.56c-.57.35-1.28.35-1.85 0L7.38 3.15a1 1 0 0 0-.55-.14 1 1 0 0 0-.53.23q-.24.2-.38.52-.15.31-.15.68V41.3q0 .37.14.69t.38.52.53.22.55-.14l3.51-2.12 3.51 2.12q.24.14.5.14.25 0 .48-.14l3.51-2.12 3.54 2.12a.9.9 0 0 0 .98 0l3.51-2.12 3.51 2.12a.9.9 0 0 0 .98 0l3.54-2.12 3.54 2.12a.9.9 0 0 0 1.08-.08q.25-.2.38-.52.14-.32.14-.69V4.44q0-.37-.14-.69a1.4 1.4 0 0 0-.38-.52zM15.58 17.65h11.46l-3.53-3.9a1.56 1.56 0 0 1 0-2.1q.19-.21.44-.33t.52-.11.52.11q.24.12.44.33l5.81 6.44q.3.32.36.77.07.45-.08.86t-.5.66-.75.25H15.58q-.56-.01-.95-.44a1.6 1.6 0 0 1-.39-1.05c0-.39.14-.77.4-1.05q.38-.43.94-.44m3.23 9.22 3.53 3.9q.2.2.3.48a1.6 1.6 0 0 1-.3 1.62q-.4.43-.94.45-.27 0-.52-.12a1 1 0 0 1-.44-.33l-5.8-6.44a1.5 1.5 0 0 1-.37-.77q-.07-.44.08-.86.16-.41.5-.66t.75-.25h14.7c.35 0 .7.16.94.44a1.6 1.6 0 0 1 0 2.1q-.4.43-.95.44z" />
          </svg>
          {/* <div className={styles.chart}></div> */}
        </div>
        <div className={styles.tiledetail}>
          <div className="title2">{t("Failed Transactions")}</div>
          <div className="title">{formatMoney(totalFailedBalance)}</div>
        </div>
      </div>

      <div className={styles.tileCard}>
        <div className={styles.tileheader}>
          <svg className={styles.tileheaderIcon} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 40">
            <path d="M34.38 15.72c2.25 0 4.37.55 6.23 1.5v-4.44c0-.65-.46-1.16-1.04-1.16H1.04c-.58 0-1.04.53-1.04 1.16v9.87c0 4.82 3.5 8.72 7.8 8.72h13.48q-.25-1.27-.27-2.58c0-7.22 5.98-13.05 13.37-13.05zM1.12 8.13h38.36a1 1 0 0 0 .96-1.22C39.69 2.97 36.57 0 32.8 0h-25C4.07 0 .93 2.97.18 6.9a1 1 0 0 0 .95 1.23 M35.07 18.67a10.8 10.8 0 0 0-10.94 10.66c0 5.9 4.9 10.67 10.94 10.67A10.8 10.8 0 0 0 46 29.33c0-5.89-4.9-10.64-10.93-10.66m4.52 13.37c-.25.52-.8.85-1.4.85q-.37 0-.7-.16l-3.13-1.53a1.5 1.5 0 0 1-.85-1.36v-4.57c0-.83.7-1.52 1.56-1.52.85 0 1.56.69 1.56 1.52v3.64L38.9 30a1.5 1.5 0 0 1 .67 2.03z" />
          </svg>
          {/* <div className={styles.chart}></div> */}
        </div>
        <div className={styles.tiledetail}>
          <div className="title2">{t("Pending Settlement")}</div>
          <div className="title">{formatMoney(totalAwaitingSettleBalance)}</div>
        </div>
      </div>
    </div>
  );
}
