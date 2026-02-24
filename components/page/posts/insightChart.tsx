import { useRef, useState } from "react";
import { ToggleOrder } from "brancy/components/design/toggleButton/types";
import { LineChart } from "brancy/components/graphs/lineChart";
import { SuperFigure, chartxType } from "brancy/models/page/statistics/statisticsContent/GraphIngageBoxes/graphLikes";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import styles from "./insightChart.module.css";
import SecondSwiper from "brancy/components/page/posts/secondSwiper";

function InsightChart(props: { superFigur: SuperFigure; toggleOrder?: ToggleOrder }) {
  // console.log(props.superFigur.figures[0].secondIndex);
  let navigationPrevRef = useRef(null);
  let navigationNextRef = useRef(null);
  const [onReachEnd, setOnReachEnd] = useState<boolean>(true);
  const [onReachBegin, setOnReachBegin] = useState<boolean>(true);
  const [indexValue, setIndexValue] = useState<number>(0);
  const [secondIndexValue, setSecondIndexValue] = useState<number>(0);
  const [refresh, setRefresh] = useState<boolean>(false);
  const setFromEdge = () => {
    console.log("setFromEdge", onReachBegin);
    if (props.superFigur.firstIndexes.length === 2) {
      setOnReachBegin(indexValue === 1);
      setOnReachEnd(indexValue === 0);
      return;
    }
    setOnReachBegin(false);
    setOnReachEnd(false);
  };

  const handleGetsuperFigurIndex = (superFigur: SuperFigure, firstIndex: number, secondIndex: number): number => {
    const firstIndexStr = superFigur.firstIndexes[firstIndex];
    const secondIndexStr = superFigur.secondIndexes[firstIndex][secondIndex];
    for (let i = 0; i < superFigur.figures.length; i++) {
      if (superFigur.figures[i].firstIndex == firstIndexStr && superFigur.figures[i].secondIndex == secondIndexStr) {
        return i;
      }
    }
    return 0;
  };
  return (
    <>
      <div className="headerandinput">
        <div className={styles.rowheader}>{props.superFigur.title}</div>

        <div className={styles.graph}>
          {props.superFigur.figures.length > 0 && (
            <LineChart
              items={
                props.superFigur.figures[handleGetsuperFigurIndex(props.superFigur, indexValue, secondIndexValue)]
                  .days ??
                props.superFigur.figures[handleGetsuperFigurIndex(props.superFigur, indexValue, secondIndexValue)].hours
              }
              chartId={props.superFigur.title}
              chartxType={
                props.superFigur.figures[handleGetsuperFigurIndex(props.superFigur, indexValue, secondIndexValue)]
                  .days != null
                  ? chartxType.day
                  : chartxType.hour
              }
              key={1}
            />
          )}
        </div>
        <div className="headerparent" style={{ marginTop: "30px" }}>
          <div className={styles.pagination}>
            <>
              {props.superFigur.firstIndexes.length > 1 && (
                <img
                  ref={navigationPrevRef}
                  alt="back"
                  src={onReachBegin ? "/backwardAD.svg" : "/back-forward.svg"}
                  className={styles.backForwardIcon}
                />
              )}
              <Swiper
                slidesPerView={1}
                spaceBetween={1}
                modules={[Navigation]}
                navigation={{
                  prevEl: navigationPrevRef.current,
                  nextEl: navigationNextRef.current,
                  // disabledClass: `${styles.disableNavigation}`,
                }}
                initialSlide={0}
                onRealIndexChange={(swiper) => {
                  setIndexValue(swiper.realIndex);
                  setRefresh(!refresh);
                }}
                //onActiveIndexChange={(swiper) => fetchData(swiper.realIndex)}
                onReachEnd={() => {
                  setOnReachEnd(true);
                }}
                onReachBeginning={() => setOnReachBegin(true)}
                onFromEdge={() => setFromEdge()}
                onInit={() => {
                  // setOnReachBegin(true);
                  setOnReachEnd(props.superFigur.firstIndexes.length <= 1);
                }}>
                <>
                  {props.superFigur.firstIndexes.map((v, i) => (
                    <SwiperSlide key={i}>
                      <div className={styles.textWrapper}>
                        {v.split("\r\n").map((x, j) => (
                          <span key={j}>{x}</span>
                        ))}
                      </div>
                    </SwiperSlide>
                  ))}
                </>
              </Swiper>
              {props.superFigur.firstIndexes.length > 1 && (
                <img
                  ref={navigationNextRef}
                  alt=" forward"
                  src={onReachEnd ? "/forwardAD.svg" : "/back-forward1.svg"}
                  className={styles.forwardIcon}
                />
              )}
            </>
            {/* {props.superFigur.figures[firstSwiperIndex].firstIndex} */}
          </div>

          <>
            {refresh && props.superFigur.figures.length > 0 && (
              <SecondSwiper
                superFigur={props.superFigur}
                indexValue={indexValue}
                changeSecondIndex={(index: number) => {
                  setSecondIndexValue(index);
                }}
              />
            )}
            {!refresh && props.superFigur.figures.length > 0 && (
              <SecondSwiper
                superFigur={props.superFigur}
                indexValue={indexValue}
                changeSecondIndex={(index: number) => {
                  setSecondIndexValue(index);
                }}
              />
            )}
          </>
        </div>
      </div>
    </>
  );
}

export default InsightChart;
