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
import { ITotalSalesReport } from "brancy/models/store/statistics";
import styles from "brancy/components/store/statistics/statistics.module.css";

const TotalSalesReport = (props: {
  salesReports: ITotalSalesReport[] | null;
  showSaleReport: (saleId: number) => void;
  handleLoadMore: (pagination: number) => void;
  hasTotalMore: boolean;
}) => {
  const [refresh, setRefresh] = useState(false);
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
    getItemId: (item: any) => item?.saleId || Math.random(),
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
                <div className={styles.header2}>{t(LanguageKey.storestatistics_saleno)}</div>
                <div className={styles.header3}>{t(LanguageKey.storestatistics_seller)}</div>
                <div className={styles.header4}>{t(LanguageKey.storestatistics_type)}</div>
                <div className={styles.header5}>{t(LanguageKey.storestatistics_status)}</div>
                <div className={styles.header6}>{t(LanguageKey.storestatistics_price)}</div>
                <div className={styles.header7}>{t(LanguageKey.storestatistics_date)}</div>
                <div className={styles.header8}>{t(LanguageKey.storestatistics_share)}</div>
              </div>
              <div ref={containerRef} className={styles.table111} style={{ maxHeight: 600, overflow: "auto" }}>
                {props.salesReports &&
                  props.salesReports.map((v, i) => (
                    <div key={i}>
                      <div
                        className={styles.tablecolumn}
                        onClick={() => {
                          props.showSaleReport(v.saleId);
                        }}
                        key={v.saleId}>
                        <div className={styles.tablecounter}>{i + 1}</div>
                        <div className={styles.salenumber}>{v.saleId}</div>

                        <div className={styles.seller}>
                          <img
                            alt="profile image"
                            loading="lazy"
                            decoding="async"
                            title="ℹ️ profile image"
                            className={styles.instagramimage}
                            src={v.seller.profileUrl}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/no-profile.svg";
                            }}
                          />
                          <div className={styles.instagramprofiledetail}>
                            <div className={styles.instagramusername}>{v.seller.fullname}</div>
                            <div className={styles.instagramid}>{v.seller.username}</div>
                          </div>
                        </div>

                        <div className={styles.saletype}>{/* <SaleTypeComp saleType={v.saleType} /> */}</div>
                        <div className={styles.header5}>
                          <span className={`status-${v.statusType}`}>{v.statusType}</span>
                        </div>

                        <div className={styles.fee}>
                          <PriceFormater
                            fee={v.fee}
                            pricetype={PriceType.Toman}
                            className={PriceFormaterClassName.PostPrice}
                          />
                        </div>

                        <div className={styles.date}>
                          <span className={styles.day}>
                            {new DateObject({
                              date: v.date,
                              calendar: initialzedTime().calendar,
                              locale: initialzedTime().locale,
                            }).format("YYYY")}
                          </span>
                          /
                          <span className={styles.day}>
                            {new DateObject({
                              date: v.date,
                              calendar: initialzedTime().calendar,
                              locale: initialzedTime().locale,
                            }).format("MM")}
                          </span>
                          /
                          <span className={styles.day}>
                            {new DateObject({
                              date: v.date,
                              calendar: initialzedTime().calendar,
                              locale: initialzedTime().locale,
                            }).format("DD")}
                          </span>
                          <br></br>
                          <span className={styles.hour}>
                            {new DateObject({
                              date: v.date,
                              calendar: initialzedTime().calendar,
                              locale: initialzedTime().locale,
                            }).format("hh")}
                          </span>
                          :
                          <span className={styles.hour}>
                            {new DateObject({
                              date: v.date,
                              calendar: initialzedTime().calendar,
                              locale: initialzedTime().locale,
                            }).format("mm A")}
                          </span>
                        </div>

                        <div className={styles.share}>
                          <img alt="export PDF" title="ℹ️ export PDF" className={styles.sharetype} src="/pdf.svg" />
                          <img alt="export JPG" title="ℹ️ export JPG" className={styles.sharetype} src="/jpg.svg" />
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
