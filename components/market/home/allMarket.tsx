import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Loading from "../../notOk/loading";
import { LoginStatus } from "../../../helper/loadingStatus";
import { calculateSummary } from "../../../helper/numberFormater";
import { LanguageKey } from "../../../i18n";
import { CategorySection, MarketType } from "../../../models/market/enums";
import { IMarketInfo } from "../../../models/market/home";
import styles from "./homeComponent.module.css";
function AllMarket(props: { data: IMarketInfo[] | undefined; fetchAllData: (pagination: string) => void }) {
  const { data: session } = useSession();
  const userRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const [loadingStatus, setLoadingStatus] = useState(LoginStatus(session));
  function handleScroll() {
    const container = userRef.current;
    if (container && container.scrollHeight - container.scrollTop === container.clientHeight) {
      props.fetchAllData("");
    }
  }
  useEffect(() => {
    // if (props.data.length < 10) props.fetchAllData("");
    if (props.data) {
      setLoadingStatus(false);
    }
  }, [props.data]);
  // if (session?.user.error) return console.log("erooooooooooooooooor");
  return (
    <div ref={userRef} onScroll={handleScroll} className={`${styles.swiper} translate`}>
      {loadingStatus && <Loading />}
      {loadingStatus &&
        props.data &&
        props.data.map((v) => (
          <div key={v.marketId} className={styles.page}>
            <div className={styles.background}>
              <img
                loading="lazy"
                decoding="async"
                className={styles.backgroundImage}
                src={v.bannerUrl}
                alt="background image"
              />
            </div>

            <div className={styles.profile}>
              <div className={styles.onlinestatus} style={{ border: "3px solid   var(--color-light-green)" }}>
                <img
                  loading="lazy"
                  decoding="async"
                  className={styles.instagramimage}
                  src={v.profileUrl}
                  alt="instagram profile picture"
                  title={v.fullname}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/no-profile.svg";
                  }}
                />
              </div>

              <div className={styles.instagramprofiledetail}>
                <div className={styles.instagramusername}>{v.fullname}</div>
                <div className={styles.instagramid}>{v.username}</div>
              </div>
            </div>

            <div className={styles.summary}>
              <div className={styles.summarydata}>
                <div className={styles.rating}>{v.rating}</div>
                {t(LanguageKey.markethomerating)}
              </div>

              <div className={styles.summarydata}>
                <div className={styles.follower}>{calculateSummary(v.followers)}</div>
                {t(LanguageKey.markethomefollower)}
              </div>

              <div className={styles.summarydata}>
                <div className={styles.post}>{v.post}</div>
                {t(LanguageKey.markethomepost)}
              </div>
            </div>

            <div className={styles.categorysection}>
              {v.categorySection.map((u, i) => (
                <div key={i} className={styles.category}>
                  {CategorySection[u]}
                </div>
              ))}
            </div>

            <img
              className={styles.accounttype}
              src={v.marketType === MarketType.Advertise ? "/icon-advertise.svg" : "/icon-store.svg"}
              alt="account type"
            />
          </div>
        ))}
    </div>
  );
}

export default AllMarket;
