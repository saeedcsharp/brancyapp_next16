import { useState } from "react";
import { useTranslation } from "react-i18next";
import CounterDown2, { ShowRings } from "../../design/counterDown/counterDown2";
import Slider, { SliderSlide } from "../../design/slider/slider";
import { LanguageKey } from "../../../i18n";
import { IActiveAds } from "../../../models/advertise/adList";
import styles from "../../../legacy-pages/advertise/adlist.module.css";
import AdsTypeComp from "../adsType";
import TimeTypeComp from "../timeType";

const ActiveList = (props: {
  data: IActiveAds[];
  handleRemoveActivetem: (itemId: string) => void;
  handleShowReport: (advertiseId: number) => void;
}) => {
  const { t } = useTranslation();
  const [isHidden, setIsHidden] = useState(false);

  const handleCircleClick = () => {
    setIsHidden(!isHidden);
  };
  return (
    <section className="tooBigCard" style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}>
      <div className="frameParent" onClick={handleCircleClick}>
        <div className="headerChild">
          <div className="circle"></div>
          <h2 className="Title">{t(LanguageKey.advertiseadlist_activeAd)}</h2>
        </div>
      </div>

      <div className={`${styles.all} ${isHidden ? "" : styles.show}`}>
        <Slider className={styles.section} itemsPerSlide={5}>
          {props.data.map((u) => (
            <SliderSlide key={u.adsId}>
              <div onClick={() => props.handleShowReport(u.adsId)} className={styles.list}>
                <div className={styles.up}>
                  <div className={styles.timer}>
                    <CounterDown2
                      upingTime={u.expiredTime}
                      isDead={() => props.handleRemoveActivetem(u.adsId.toString())}
                      classNamewrapper="countdownWrapperPost"
                      colorSvg="var(--color-dark-green)"
                      colorTimeTitle="var(--color-dark-green)"
                      showRings={ShowRings.All}
                    />
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

export default ActiveList;
