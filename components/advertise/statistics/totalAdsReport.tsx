import { useEffect, useState } from "react";
import { DateObject } from "react-multi-date-picker";
import PriceFormater, { PriceFormaterClassName, PriceType } from "../../priceFormater";
import useHideDiv from "../../../hook/useHide";
import { ITotalAdsReport } from "../../../models/advertise/statistics";
import ConfirmationStatus, { StatusType } from "../../confirmationStatus/confirmationStatus";
import AdsTypeComp from "../adsType";
import styles from "./statistics.module.css";

import { useTranslation } from "react-i18next";
import RingLoader from "../../design/loader/ringLoder";
import Loading from "../../notOk/loading";
import initialzedTime from "../../../helper/manageTimer";
import { useInfiniteScroll } from "../../../helper/useInfiniteScroll";
import { LanguageKey } from "../../../i18n";

const TotalAdsReport = (props: {
  adsReports: ITotalAdsReport[] | null;
  showAdReport: (advertiseId: number) => void;
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
    getItemId: (item: any) => item?.advertiseId || Math.random(),
    currentData: props.adsReports || [],
    useContainerScroll: true,
  });

  useEffect(() => {
    if (props.adsReports) {
      setLoading(false);
    }
  }, [props.adsReports]);

  useEffect(() => {
    props.handleLoadMore(0);
  }, []);

  return (
    <section className={styles.adsreport} style={gridSpan}>
      <div onClick={toggle} className="headerChild" title="↕ Resize the Card">
        <div className="circle"></div>
        <h2 className="Title">{t(LanguageKey.advertisestatistics_totaladsreport)}</h2>
      </div>
      <div>
        {/* ___table Header___*/}

        {hidePage && loading && <Loading />}
        {hidePage && !loading && props.adsReports && (
          <>
            <div className={styles.tableheader}>
              <div className={styles.header1}>#</div>
              <div className={styles.header2}>{t(LanguageKey.advertisestatistics_adno)}</div>
              <div className={styles.header3}>{t(LanguageKey.advertisestatistics_advertiser)}</div>
              <div className={styles.header4}>{t(LanguageKey.advertisestatistics_type)}</div>
              <div className={styles.header5}>{t(LanguageKey.advertisestatistics_status)}</div>
              <div className={styles.header6}>{t(LanguageKey.advertisestatistics_price)}</div>
              <div className={styles.header7}>{t(LanguageKey.advertisestatistics_date)}</div>
              <div className={styles.header8}>{t(LanguageKey.advertisestatistics_share)}</div>
            </div>
            <div ref={containerRef} className={styles.table111} style={{ maxHeight: 600, overflow: "auto" }}>
              {props.adsReports &&
                props.adsReports.map((v, i) => (
                  <div key={i}>
                    <div
                      className={styles.tablecolumn}
                      onClick={() => {
                        if (v.statusType === StatusType.Canceled) return;
                        props.showAdReport(v.advertiseId);
                      }}
                      key={v.advertiseId}>
                      <div className={styles.tablecounter}>{i + 1}</div>
                      <div className={styles.adnumber}>{v.advertiseId}</div>

                      <div className={styles.advertiser}>
                        <img
                          alt="profile image"
                          loading="lazy"
                          decoding="async"
                          title="ℹ️ profile image"
                          className={styles.instagramimage}
                          src={v.advertiser.profileUrl}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/no-profile.svg";
                          }}
                        />
                        <div className={styles.instagramprofiledetail}>
                          <div className={styles.instagramusername}>{v.advertiser.fullname}</div>
                          <div className={styles.instagramid}>{v.advertiser.username}</div>
                        </div>
                      </div>

                      <div className={styles.adtype}>
                        <AdsTypeComp adType={v.advertiseType} />
                      </div>
                      <ConfirmationStatus statusType={v.statusType} />

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
  );
};

export default TotalAdsReport;
