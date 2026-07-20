import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import RingLoader from "brancy/components/design/loader/ringLoder";
import Loading from "brancy/components/notOk/loading";
import PriceFormater, { PriceFormaterClassName, PriceType } from "brancy/components/priceFormater";
import initialzedTime from "brancy/helper/manageTimer";
import { useInfiniteScroll } from "brancy/helper/useInfiniteScroll";
import useHideDiv from "brancy/hook/useHide";
import { LanguageKey } from "brancy/i18n";

import styles from "./statistics.module.css";
import { IBuyerPurchaseReport } from "brancy/models/interfaces";

const TotalSalesReport = (props: {
  salesReports: IBuyerPurchaseReport[] | null;
  handleLoadMore: (pagination: number) => void;
  hasTotalMore: boolean;
}) => {
  const { hidePage, gridSpan, toggle } = useHideDiv(true, 57);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const { t } = useTranslation();

  const { containerRef, isLoadingMore } = useInfiniteScroll({
    hasMore: props.hasTotalMore,
    fetchMore: async () => {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      props.handleLoadMore(nextPage);
      return [];
    },
    onDataFetched: () => {},
    getItemId: (item: IBuyerPurchaseReport) => `${item.buyer.username}-${item.lastPurchase}`,
    currentData: props.salesReports || [],
    useContainerScroll: true,
  });

  useEffect(() => {
    if (props.salesReports) {
      setLoading(false);
    }
  }, [props.salesReports]);

  useEffect(() => {
    props.handleLoadMore(0);
  }, []);

  return (
    <>
      <section className={styles.salesreport} style={gridSpan}>
        <div onClick={toggle} className="headerChild" title="↕ Resize the Card">
          <div className="circle"></div>
          <h2 className="Title">{t(LanguageKey.storestatistics_totalsalesreport)}</h2>
        </div>
        <div>
          {/* ___table Header___*/}

          {hidePage && loading && <Loading />}
          {hidePage && !loading && props.salesReports && (
            <>
              <div className={styles.tableheader}>
                <div className={styles.header1}>#</div>
                <div className={styles.header3}>{t(LanguageKey.storestatistics_buyer)}</div>
                <div className={styles.header4}>{t(LanguageKey.storestatistics_totalPurchases)}</div>
                <div className={styles.header6}>{t(LanguageKey.storestatistics_totalAmount)}</div>
                <div className={styles.header7}>{t(LanguageKey.storestatistics_lastPurchase)}</div>
              </div>
              <div ref={containerRef} className={styles.table111} style={{ maxHeight: 600, overflow: "auto" }}>
                {props.salesReports &&
                  props.salesReports.map((v, i) => (
                    <div key={`${v.buyer.username}-${v.lastPurchase}`}>
                      <div className={styles.tablecolumn}>
                        <div className={styles.tablecounter}>{i + 1}</div>

                        <div className={styles.seller}>
                          <img
                            alt="profile image"
                            loading="lazy"
                            decoding="async"
                            title="ℹ️ profile image"
                            className={styles.instagramimage}
                            src={v.buyer.profileUrl}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/no-profile.svg";
                            }}
                          />
                          <div className={styles.instagramprofiledetail}>
                            <div className={styles.instagramusername}>{v.buyer.fullname}</div>
                            <div className={styles.instagramid}>{v.buyer.username}</div>
                          </div>
                        </div>

                        <div className={styles.saletype}>{v.totalPurchases}</div>

                        <div className={styles.fee}>
                          <PriceFormater
                            fee={v.totalAmount}
                            pricetype={PriceType.Toman}
                            className={PriceFormaterClassName.PostPrice}
                          />
                        </div>

                        <div className={styles.date}>
                          <span className={styles.day}>
                            {new DateObject({
                              date: v.lastPurchase,
                              calendar: initialzedTime().calendar,
                              locale: initialzedTime().locale,
                            }).format("YYYY")}
                          </span>
                          /
                          <span className={styles.day}>
                            {new DateObject({
                              date: v.lastPurchase,
                              calendar: initialzedTime().calendar,
                              locale: initialzedTime().locale,
                            }).format("MM")}
                          </span>
                          /
                          <span className={styles.day}>
                            {new DateObject({
                              date: v.lastPurchase,
                              calendar: initialzedTime().calendar,
                              locale: initialzedTime().locale,
                            }).format("DD")}
                          </span>
                          <br></br>
                          <span className={styles.hour}>
                            {new DateObject({
                              date: v.lastPurchase,
                              calendar: initialzedTime().calendar,
                              locale: initialzedTime().locale,
                            }).format("hh")}
                          </span>
                          :
                          <span className={styles.hour}>
                            {new DateObject({
                              date: v.lastPurchase,
                              calendar: initialzedTime().calendar,
                              locale: initialzedTime().locale,
                            }).format("mm A")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                {isLoadingMore && <RingLoader />}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default TotalSalesReport;
