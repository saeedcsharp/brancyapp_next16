import Head from "next/head";
import { IPaymentInfo } from "brancy/models/customerAds/customerAd";
import styles from "./progress.module.css";

function Publish(props: { paymentInfo: IPaymentInfo }) {
  const pageTitle = props.paymentInfo.success ? "Bran.cy ▸ ✅ Payment Successful" : "Bran.cy ▸ ❎ Payment Failed";

  return (
    <>
      <title>{pageTitle}</title>
      {/* head for SEO */}
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="description" content="Advanced Instagram post management tool" />
        <meta
          name="keywords"
          content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/page/posts" />
        {/* Add other meta tags as needed */}
      </Head>
      {/* head for SEO */}
      <div className={styles.stepcontainer6}>
        {!props.paymentInfo.success && (
          <div className={styles.paymentfailed}>
            <div className={styles.paymentbox0}>
              <div className={styles.paymentbox1} style={{ backgroundColor: "var(--color-dark-red10)" }}>
                <div className={styles.paymentbox2} style={{ backgroundColor: "var(--color-dark-red30)" }}>
                  <div className={styles.paymentbox3} style={{ backgroundColor: "var(--color-dark-red60)" }}>
                    <div className={styles.paymentbox4} style={{ backgroundColor: "var(--color-dark-red)" }}>
                      <svg height="25" width="25" viewBox="0 0 35 35">
                        <path
                          stroke="var(--color-ffffff)"
                          strokeLinecap="round"
                          strokeWidth="8"
                          d="m4.7 4.7 25.6 25.6M30.3 4.7 4.7 30.3"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <br></br>
            <div className={styles.paymentfailedtitle} style={{ color: "var(--color-light-red)" }}>
              Ops !
            </div>
            <div className={styles.adsno} style={{ fontSize: "var(--font-18)" }}>
              Payment Failed!
            </div>
            <br></br>
            <div className={styles.adstatustitle}>
              Transaction Number:
              <div className={styles.adsno}>{props.paymentInfo.transactionNumber}</div>
            </div>
            <div className={styles.adstatustitle}>
              Order Code:
              <div className={styles.adsno}>{props.paymentInfo.orderCode}</div>
            </div>
          </div>
        )}
        {props.paymentInfo.success && (
          <div className={styles.paymentsuccessful}>
            <div className={styles.paymentbox0}>
              <div className={styles.paymentbox1} style={{ backgroundColor: "var(--color-light-green10)" }}>
                <div className={styles.paymentbox2} style={{ backgroundColor: "var(--color-light-green30)" }}>
                  <div className={styles.paymentbox3} style={{ backgroundColor: "var(--color-light-green60)" }}>
                    <div className={styles.paymentbox4} style={{ backgroundColor: "var(--color-light-green)" }}>
                      <svg fill="none" height="25" width="25" viewBox="0 0 35 35">
                        <path
                          d="m4.7 17.2 7.9 8.6q.7.7 1.5 0l16.3-18"
                          stroke="var(--color-ffffff)"
                          strokeWidth="8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <br></br>
            <div className={styles.paymentfailedtitle} style={{ color: "var(--color-light-green)" }}>
              Thank You!
            </div>
            <div className={styles.adsno} style={{ fontSize: "var(--font-18)" }}>
              Payment Successful!
            </div>
            <br></br>
            <div className={styles.adstatustitle}>
              Transaction Number:
              <div className={styles.adsno}>{props.paymentInfo.transactionNumber}</div>
            </div>
            <div className={styles.adstatustitle}>
              Order Code:
              <div className={styles.adsno}>{props.paymentInfo.orderCode}</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Publish;
