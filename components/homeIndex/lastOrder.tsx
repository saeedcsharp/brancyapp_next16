import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LoginStatus } from "saeed/helper/loadingStatus";
import { LanguageKey } from "saeed/i18n";
import { ILastOrder } from "saeed/models/homeIndex/home";
import Loading from "../notOk/loading";
import styles from "./lastOrder.module.css";

// const LastOrder = () => {
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;

const LastOrder = (props: { data: ILastOrder[] | null }) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [isHidden, setIsHidden] = useState(false);
  const handleCircleClick = () => {
    setIsHidden(!isHidden);
  };
  const [loadingStatus, setLoadingStaus] = useState(LoginStatus(session));

  useEffect(() => {
    setLoadingStaus(false);
  }, []);

  return (
    <section className={`${styles.tooBigCard} ${isHidden ? styles.toobigcardclose : ""} tooBigCard`}>
      <div className={styles.contactBox}>
        <div className={styles.headersection} onClick={handleCircleClick}>
          <div className={styles.backdropfade} />
          <img style={{ height: "50px" }} src="/home-lastorder.svg" title="↕ Resize the Card" />
          <div className={styles.headerandinput}>
            <span className="title">---</span>
            <span className="explain" style={{ textAlign: "center" }}>
              {t(LanguageKey.navbar_Orders)}
            </span>
          </div>
          <div className={styles.headerandinput}>
            <span className="title">---</span>
            <span className="explain" style={{ textAlign: "center" }}>
              {t(LanguageKey.Storeproduct_inQueue)}
            </span>
          </div>
          <div className={styles.headerandinput}>
            <span className="title">---</span>
            <span className="explain" style={{ textAlign: "center" }}>
              {t(LanguageKey.lastTransaction)}
            </span>
          </div>
        </div>
        {loadingStatus && <Loading />}
        {/* {loadingStatus.ok && ( */}
        {!loadingStatus && (
          <div className={`${styles.frameContainer} ${isHidden ? "" : styles.show}`}>
            {!props.data || props.data.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--text-h2)" }}>
                <p>{t(LanguageKey.pageStatistics_EmptyList)}</p>
              </div>
            ) : (
              props.data.map((v, i) => (
                <div key={i} className={`${styles.groupWrapper} translate`}>
                  <div className={styles.orderinfo}>
                    <div className={styles.section}>
                      <div className={styles.orderid} onClick={() => (window.location.href = v.orderUrl)}>
                        {v.orderId}
                      </div>
                      <div className={`${styles.date} translate`}>
                        {(() => {
                          const orderDate = new Date(v.date);
                          const now = new Date();
                          const diffInMs = now.getTime() - orderDate.getTime();
                          const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
                          const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
                          const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

                          if (diffInDays > 0) {
                            return `${diffInDays} ${t(LanguageKey.daysAgo)}`;
                          } else if (diffInHours > 0) {
                            return `${diffInHours} ${t(LanguageKey.hoursAgo)}`;
                          } else if (diffInMinutes > 0) {
                            return `${diffInMinutes} ${t(LanguageKey.minutesAgo)}`;
                          } else {
                            return `${t(LanguageKey.justNow)}`;
                          }
                        })()}
                      </div>
                    </div>
                    <div className={styles.section}>
                      <div className="instagramprofile">
                        <img
                          className="instagramimage"
                          loading="lazy"
                          decoding="async"
                          alt="profile image"
                          src={basePictureUrl + v.profileUrl}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/no-profile.svg";
                          }}
                        />
                        <div className="instagramprofiledetail">
                          <div className="instagramid">@{v.username}</div>
                          <div className="instagramusername">{v.fullName}</div>
                        </div>
                      </div>
                      <div className="instagramprofile">
                        <img
                          style={{
                            width: "25px",
                            height: "25px",
                          }}
                          title="ℹ️ items"
                          src="/items.svg"
                        />
                        <div className="instagramprofiledetail">
                          <div className=" instagramid">{t(LanguageKey.Storeorder_ITEM)}</div>
                          <div className="instagramusername">---</div>
                        </div>
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

export default LastOrder;
