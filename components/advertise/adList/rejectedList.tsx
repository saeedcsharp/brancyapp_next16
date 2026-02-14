import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import Slider, { SliderSlide } from "saeed/components/design/slider/slider";
import initialzedTime from "saeed/helper/manageTimer";
import { LanguageKey } from "saeed/i18n";
import { RejectedType } from "saeed/models/advertise/AdEnums";
import { IRejectedAds } from "saeed/models/advertise/adList";
import styles from "../../../legacy-pages/advertise/adlist.module.css";
import AdsTypeComp from "../adsType";
import TimeTypeComp from "../timeType";
const RejectedList = (props: { data: IRejectedAds[] }) => {
  const { t } = useTranslation();
  const [isHidden, setIsHidden] = useState(false);
  const handleCircleClick = () => {
    setIsHidden(!isHidden);
  };
  return (
    <section
      className="tooBigCard"
      style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }} // Update gridRowEnd based on isHidden
    >
      <div className="frameParent" onClick={handleCircleClick}>
        <div className="headerChild">
          <div className="circle"></div>
          <h2 className="Title">{t(LanguageKey.advertiseadlist_rejectedlist)}</h2>
        </div>
      </div>
      <div className={`${styles.all} ${isHidden ? "" : styles.show}`}>
        <Slider className={styles.section} itemsPerSlide={5}>
          {props.data.map((u) => (
            <SliderSlide key={u.adsId}>
              <div className={styles.list}>
                <div className={styles.up}>
                  <div className={styles.rejectdetail}>
                    <div className="date">
                      <span className="day">
                        {new DateObject({
                          date: u.rejectedTime,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("YYYY")}
                      </span>
                      /
                      <span className="day">
                        {new DateObject({
                          date: u.rejectedTime,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("MM")}
                      </span>
                      /
                      <span className="day">
                        {new DateObject({
                          date: u.rejectedTime,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format(" DD")}
                      </span>
                       - 
                      <span className="hour">
                        {new DateObject({
                          date: u.rejectedTime,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("hh")}
                      </span>
                      :
                      <span className="hour">
                        {new DateObject({
                          date: u.rejectedTime,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("mm")}
                      </span>
                       
                      <span className="hour">
                        {new DateObject({
                          date: u.rejectedTime,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("a")}
                      </span>
                    </div>
                    <div className="IDred">{`rejected by ${
                      u.rejectedType === RejectedType.admin ? "admin" : "user"
                    }`}</div>
                  </div>
                  <div className={styles.option}>
                    <AdsTypeComp adType={u.adsType} />
                    <TimeTypeComp timeType={u.adsTimeType} />
                  </div>
                </div>
                <div className={styles.down}>
                  <div className={styles.instaid}>@{u.username}</div>
                  <div className="counter">
                    <img alt="ad number" title="ℹ️ ad number" style={{ width: "20px" }} src="/adticket.svg" />
                    <div className="explain">{u.adsId}</div>
                  </div>
                </div>
              </div>
            </SliderSlide>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default RejectedList;
