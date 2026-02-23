import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import MultipleColorCounterDown from "../../design/counterDown/multipleColorCounterDown";
import initialzedTime from "../../../helper/manageTimer";
import { LanguageKey } from "../../../i18n";
import { IWatingAds } from "../../../models/advertise/adList";
import styles from "../../../legacy-pages/advertise/adlist.module.css";
import AdsTypeComp from "../adsType";

const WaitingList = (props: {
  handleShowDetailAds: (advertiseId: number) => void;
  data: IWatingAds[];
  handleRemoveWatingItem: (itemId: number) => void;
}) => {
  const [isHidden, setIsHidden] = useState(false); // New state to toggle visibility and grid-row-end
  const handleCircleClick = () => {
    setIsHidden(!isHidden); // Toggle visibility and grid-row-end state
  };
  const { t } = useTranslation();
  return (
    <>
      <section className="tooBigCard" style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}>
        <div className="frameParent" onClick={handleCircleClick}>
          <div className="headerChild">
            <div className="circle"></div>
            <h2 className="Title">{t(LanguageKey.advertiseadlist_AwaitingApproval)}</h2>
          </div>
        </div>
        <div className={`${styles.all} ${isHidden ? "" : styles.show} `} style={{ overflowY: "scroll" }}>
          {props.data.map((v) => (
            <div
              key={v.advertiseId}
              className={styles.waitingads}
              onClick={() => props.handleShowDetailAds(v.advertiseId)}>
              <div className={styles.circle}>
                <MultipleColorCounterDown
                  itemId={v.advertiseId}
                  upingTime={v.expiredTime}
                  isDead={() => props.handleRemoveWatingItem(v.advertiseId)}
                  classNamewrapper={"countdownWrapperPost"}
                />
              </div>
              <div className={styles.waitingdetail}>
                <div className="headerparent">
                  <div className={styles.adnumber}>
                    <img alt="ad number" title="ℹ️ ad number" style={{ width: "20px" }} src="/adticket.svg" />
                    {v.advertiseId}
                  </div>
                  <AdsTypeComp adType={v.adsType} />
                </div>
                <div className={styles.adnumber}>
                  <img alt="time" title="ℹ️ time" style={{ width: "20px" }} src="/winner-picker-time.svg" />
                  <div className="date">
                    <span className="day">
                      {new DateObject({
                        date: v.expiredTime,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("YYYY")}
                    </span>
                    /
                    <span className="day">
                      {new DateObject({
                        date: v.expiredTime,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("MM")}
                    </span>
                    /
                    <span className="day">
                      {new DateObject({
                        date: v.expiredTime,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("DD")}
                    </span>
                     - 
                    <span className="hour">
                      {new DateObject({
                        date: v.expiredTime,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("hh")}
                    </span>
                    :
                    <span className="hour">
                      {new DateObject({
                        date: v.expiredTime,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("mm")}
                    </span>
                     
                    <span className="hour">
                      {new DateObject({
                        date: v.expiredTime,
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("a")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default WaitingList;
