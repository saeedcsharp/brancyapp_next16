import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Loading from "brancy/components/notOk/loading";
import { LoginStatus, RoleAccess } from "brancy/helper/loadingStatus";
import { calculateSummary } from "brancy/helper/numberFormater";
import { LanguageKey } from "brancy/i18n";
import { PartnerRole } from "brancy/models/_AccountInfo/InstagramerAccountInfo";
import { CategorySection } from "brancy/models/market/enums";
import { IMarketInfo } from "brancy/models/market/home";
import styles from "./homeComponent.module.css";
function Advertise(props: { data: IMarketInfo[] | undefined; fetchAdvertiseData: (pagination: string) => void }) {
  const { data: session } = useSession();
  const userRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const [loadingStatus, setLoadingStatus] = useState(LoginStatus(session) && RoleAccess(session, PartnerRole.Ads));
  const handleScroll = () => {
    const container = userRef.current;
    if (container && container.scrollHeight - container.scrollTop === container.clientHeight) {
      props.fetchAdvertiseData("");
    }
  };
  useEffect(() => {
    // if (props.data.length < 10) props.fetchAdvertiseData("");
    if (props.data) {
      setLoadingStatus(false);
    }
  }, [props.data]);
  return (
    <div ref={userRef} onScroll={handleScroll} className={`${styles.swiper} translate`}>
      {loadingStatus && <Loading />}
      {!loadingStatus &&
        props.data!.map((v) => (
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
                  className={styles.instagramimage}
                  src={v.profileUrl}
                  alt="instagram profile picture"
                  loading="lazy"
                  decoding="async"
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
            <div className={styles.line}> </div>
            <div className={styles.categorysection}>
              {v.categorySection.map((u, i) => (
                <div key={i} className={styles.category}>
                  {CategorySection[u]}
                </div>
              ))}
            </div>
            <div className={styles.accounttype}>
              <img className={styles.accounttype} src={"/icon-advertise.svg"} alt="account type" />
            </div>
          </div>
        ))}
    </div>
  );
}

export default Advertise;
