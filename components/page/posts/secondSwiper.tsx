import { useRef, useState } from "react";
import { numberToFormattedString } from "../../../helper/numberFormater";
import { SuperFigure } from "../../../models/page/statistics/statisticsContent/GraphIngageBoxes/graphLikes";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import styles from "./insightChart.module.css";
function SecondSwiper(props: {
  superFigur: SuperFigure;
  indexValue: number;
  changeSecondIndex: (index: number) => void;
}) {
  let navigationPreRefSeconds = useRef(null);
  let navigationNextRefSeconds = useRef(null);
  const [onReachEndSeconds, setOnReachEndSeconds] = useState<boolean>(true);
  const [onreachBeginSeconds, setonreachBeginSeconds] = useState<boolean>(true);
  const [secondIndexValue, setSecondIndexValue] = useState<number>(0);
  const setFromEdgeSecond = () => {
    console.log("setFromEdgeSeconds", onreachBeginSeconds);
    if (props.superFigur.secondIndexes[props.indexValue].length === 2) {
      setonreachBeginSeconds(secondIndexValue === 1);
      setOnReachEndSeconds(secondIndexValue === 0);
      return;
    }
    setonreachBeginSeconds(false);
    setOnReachEndSeconds(false);
  };
  return (
    <>
      <div className={styles.pagination}>
        {props.superFigur.secondIndexes[props.indexValue].length > 1 && (
          <img
            ref={navigationPreRefSeconds}
            alt="back"
            src={onreachBeginSeconds ? "/backwardAD.svg" : "/back-forward.svg"}
            className={styles.backForwardIcon}
          />
        )}

        <Swiper
          slidesPerView={1}
          spaceBetween={1}
          modules={[Navigation]}
          navigation={{
            prevEl: navigationPreRefSeconds.current,
            nextEl: navigationNextRefSeconds.current,
            // disabledClass: `${styles.disableNavigation}`,
          }}
          initialSlide={0}
          //   onRealIndexChange={(swiper) =>
          //     setIndexValue(swiper.realIndex)
          //   }
          //onActiveIndexChange={(swiper) => fetchData(swiper.realIndex)}
          onReachEnd={() => setOnReachEndSeconds(true)}
          onReachBeginning={() => setonreachBeginSeconds(true)}
          onFromEdge={() => setFromEdgeSecond()}
          onInit={() => setOnReachEndSeconds(props.superFigur.secondIndexes[props.indexValue].length <= 1)}
          onRealIndexChange={(swiper) => {
            setSecondIndexValue(swiper.realIndex);
            props.changeSecondIndex(swiper.realIndex);
          }}>
          <>
            {props.superFigur.secondIndexes[props.indexValue].map((v, i) => (
              <SwiperSlide key={i}>
                <div className={styles.textWrapper}>
                  {v.split("\n").map((x, j) => (
                    <span key={j}> {numberToFormattedString(x)}</span>
                  ))}
                </div>
              </SwiperSlide>
            ))}
          </>
        </Swiper>
        {props.superFigur.secondIndexes[props.indexValue].length > 1 && (
          <img
            ref={navigationNextRefSeconds}
            className={styles.forwardIcon}
            alt=" forward"
            src={onReachEndSeconds ? "/forwardAD.svg" : "/back-forward1.svg"}
          />
        )}
      </div>
    </>
  );
}

export default SecondSwiper;
