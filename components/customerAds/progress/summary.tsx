import Head from "next/head";
import { useState } from "react";
import { DateObject } from "react-multi-date-picker";
import AdsTypeComp from "brancy/components/advertise/adsType";
import TimeTypeComp from "brancy/components/advertise/timeType";
import PriceFormater, { PriceFormaterClassName, PriceType } from "brancy/components/priceFormater";
import initialzedTime from "brancy/helper/manageTimer";
import { ICustomer } from "brancy/models/customerAds/customerAd";
import styles from "./progress.module.css";
function Summary(prop: { customer: ICustomer; handleShowSummaryTerms: (terms: string) => void }) {
  const [customerAd, setCustomerAd] = useState<ICustomer>(prop.customer);
  return (
    <>
      {/* head for SEO */}
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ 📜 Summary Check</title>
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

      <div className={styles.stepcontainer3}>
        <div className={styles.top}>
          <div className={styles.chartcolumnheader}>
            <div className={styles.adcharttitle}>type</div>
            <div className={styles.adcharttitle}>date & time</div>
            <div className={styles.adcharttitle}>Ad No.</div>
          </div>
          <div className={styles.chartcolumn}>
            <div className={styles.addetailcontentheader}>
              <span className={styles.day}>
                <AdsTypeComp adType={customerAd.adType} />
              </span>

              <span className={styles.day}>
                <TimeTypeComp timeType={customerAd.adTimeType} />
              </span>
            </div>
            <div className={styles.addetailcontentheader}>
              <div className={styles.date}>
                <span className={styles.day}>
                  {new DateObject({
                    date: customerAd.adTime,
                    calendar: initialzedTime().calendar,
                    locale: initialzedTime().locale,
                  }).format("YYYY/MM/DD")}
                </span>
                <br></br>
                <span className={styles.hour}>
                  {new DateObject({
                    date: customerAd.adTime,
                    calendar: initialzedTime().calendar,
                    locale: initialzedTime().locale,
                  }).format("hh:mm A")}
                </span>
              </div>
            </div>
            <div className={styles.addetailcontentheader}>
              <div className={styles.span}>
                ( <span className={styles.day}>{customerAd.customerAdId}</span> )
              </div>
            </div>
          </div>
        </div>
        <div className={styles.down}>
          <div className={styles.chartcolumnheader}>
            <div className={styles.adcharttitle} style={{ maxWidth: "10%" }}>
              #
            </div>
            <div className={styles.adcharttitle} style={{ maxWidth: "45%" }}>
              target page
            </div>
            <div className={styles.adcharttitle} style={{ maxWidth: "30%" }}>
              Price
            </div>
            <div className={styles.adcharttitle} style={{ maxWidth: "15%" }}>
              Terms
            </div>
          </div>

          <div className={styles.chartcolumnscroll}>
            {customerAd.advertisers.map((v) => (
              <div key={v.asvertiseId} className={styles.chartcolumn}>
                <div className={styles.addetailcontent} style={{ maxWidth: "10%" }}>
                  {customerAd.advertisers.indexOf(v) + 1}
                </div>
                <div title={`ℹ️ @${v.username}`} className={styles.addetailcontent} style={{ maxWidth: "45%" }}>
                  {v.username}
                </div>
                <div title="ℹ️ price" className={styles.addetailcontent} style={{ maxWidth: "30%" }}>
                  <PriceFormater
                    pricetype={PriceType.Toman}
                    fee={v.price}
                    className={PriceFormaterClassName.PostPrice}
                  />
                </div>
                <div
                  title="ℹ️ see terms"
                  onClick={() => prop.handleShowSummaryTerms(v.terms)}
                  className={styles.addetailcontent}
                  style={{
                    maxWidth: "15%",
                    cursor: "pointer",
                  }}>
                  <svg fill="none" width="30" viewBox="0 0 24 6">
                    <path
                      fill="var(--text-h2)"
                      d="M.5 3a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0m9 0a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0m9 0a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0"></path>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Summary;
