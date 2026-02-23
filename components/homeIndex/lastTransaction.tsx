import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import { LoginStatus } from "../../helper/loadingStatus";
import initialzedTime from "../../helper/manageTimer";
import { LanguageKey } from "../../i18n";
import { ILastTransaction } from "../../models/homeIndex/home";
import Loading from "../notOk/loading";
import styles from "./lastTransaction.module.css";

// const LastTransaction = () => {
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;

const LastTransaction = (props: { data: ILastTransaction[] | null }) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [transaction, setTransaction] = useState<ILastTransaction[] | null>(null);
  const [isHidden, setIsHidden] = useState(false);
  const handleCircleClick = () => {
    setIsHidden(!isHidden);
  };
  const [loadingStatus, setLoadingStaus] = useState(LoginStatus(session));
  useEffect(() => {
    async function fetchTransaction() {
      try {
        // Replace with actual API call
        const response = await fetch("/api/Transaction");
        const data = await response.json();
        setTransaction(data);
      } catch (error) {
        console.error("Failed to fetch Transaction", error);
      } finally {
        setLoadingStaus(false);
      }
    }

    fetchTransaction();
  }, []);
  return (
    <section className="tooBigCard" style={{ gridRowEnd: isHidden ? "span 10" : "span 62" }}>
      <div className={styles.contactBox}>
        <div className="frameParent" title="↕ Resize the Card">
          <div className="headerChild" onClick={handleCircleClick}>
            <div className="circle"></div>
            <h2 className="Title">{t(LanguageKey.lastTransaction)}</h2>
          </div>
        </div>
        {loadingStatus && <Loading />}
        {/* {loadingStatus.ok && ( */}

        {!loadingStatus && (
          <div className={`${styles.frameContainer} ${isHidden ? "" : styles.show}`}>
            {!props.data || props.data.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "var(----text-h2)" }}>
                <p>{t(LanguageKey.pageStatistics_EmptyList)}</p>
              </div>
            ) : (
              props.data.map((v, i) => (
                <div key={i} className={`${styles.groupWrapper} translate`}>
                  <div className={styles.orderinfo}>
                    <div className={styles.section}>
                      <div
                        className={styles.orderid}
                        //onClick={() => (window.location.href = v.orderUrl)}
                      >
                        {v.transactionPaymentId}
                      </div>
                      <div
                        className={styles.price}
                        style={{
                          color: v.income ? "var(--color-dark-green)" : "inherit",
                        }}>
                        {v.income ? (
                          <svg
                            aria-label="income"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            width="25"
                            stroke="var(----text-h2)"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                            strokeLinecap="round">
                            <path
                              opacity=".4"
                              d="M11.82 1.09a9.1 9.1 0 1 0 7.1 7.1M10 7.27c-1 0-1.82.61-1.82 1.37C8.18 9.39 9 10 10 10s1.82.61 1.82 1.36S11 12.73 10 12.73m0-5.46c.8 0 1.47.38 1.72.91M10 7.28v-.92m0 6.37c-.8 0-1.46-.38-1.71-.91m1.71.9v.92"
                            />
                            <path d="m19 1-4.18 4.18M14 1.52l.12 3.1c0 .72.43 1.18 1.23 1.23l3.12.15" />
                          </svg>
                        ) : (
                          <svg
                            aria-label="withdraw"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            width="25"
                            stroke="var(--color-silver)"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                            strokeLinecap="round">
                            <path
                              opacity=".4"
                              d="M11.82 1.09a9.1 9.1 0 1 0 7.1 7.1M10 7.27c-1 0-1.82.61-1.82 1.37C8.18 9.39 9 10 10 10s1.82.61 1.82 1.36S11 12.73 10 12.73m0-5.46c.8 0 1.47.38 1.72.91M10 7.28v-.92m0 6.37c-.8 0-1.46-.38-1.71-.91m1.71.9v.92"
                            />
                            <path d="m14 6 4.18-4.18M19 5.48l-.12-3.1c0-.72-.43-1.18-1.23-1.23L14.53 1" />
                          </svg>
                        )}
                        {v.transactionPrice}
                      </div>
                    </div>
                    <div className={styles.section}>
                      <div className={styles.date}>
                        <span className={styles.day}>
                          {new DateObject({
                            date: v.transactionDate,
                            calendar: initialzedTime().calendar,
                            locale: initialzedTime().locale,
                          }).format("YYYY")}
                        </span>
                        /
                        <span className={styles.day}>
                          {new DateObject({
                            date: v.transactionDate,
                            calendar: initialzedTime().calendar,
                            locale: initialzedTime().locale,
                          }).format("MM")}
                        </span>
                        /
                        <span className={styles.day}>
                          {new DateObject({
                            date: v.transactionDate,
                            calendar: initialzedTime().calendar,
                            locale: initialzedTime().locale,
                          }).format("DD")}
                        </span>
                        <br></br>
                        <span className={styles.hour}>
                          {new DateObject({
                            date: v.transactionDate,
                            calendar: initialzedTime().calendar,
                            locale: initialzedTime().locale,
                          }).format("hh")}
                        </span>
                        :
                        <span className={styles.hour}>
                          {new DateObject({
                            date: v.transactionDate,
                            calendar: initialzedTime().calendar,
                            locale: initialzedTime().locale,
                          }).format("mm A")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default LastTransaction;
