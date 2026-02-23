import { useSession } from "next-auth/react";
import React, { use, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Loading from "../../notOk/loading";
import { InstaInfoContext } from "../../../context/instaInfoContext";
import { LoginStatus, RoleAccess } from "../../../helper/loadingStatus";
import { LanguageKey } from "../../../i18n";
import { PartnerRole } from "../../../models/_AccountInfo/InstagramerAccountInfo";
import { IHighLight } from "../../../models/page/story/hightLight";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { A11y, Navigation, Pagination, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import styles from "./highLight.module.css";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const HighLight = ({ data }: { data: IHighLight[] | null }) => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const instaInfo = use(InstaInfoContext);
  const [highLights, setHighLights] = useState<IHighLight[] | null>(null);
  const [loadingStatus, setLoadingStaus] = useState(LoginStatus(session) && RoleAccess(session, PartnerRole.PageView));
  useEffect(() => {
    if (data) {
      setHighLights(data);
      setLoadingStaus(false);
    }
  }, [data, instaInfo]);
  let navigationPrevRef = React.useRef(null);
  let navigationNextRef = React.useRef(null);
  return (
    <>
      <section className={styles.highlightStories}>
        <div className="headerChild" title="↕ Resize the Card">
          <div className="circle"></div>
          <h2 className="Title">{t(LanguageKey.pageStory_HighlightTitle)}</h2>
        </div>
        {loadingStatus && <Loading />}
        {!loadingStatus && (
          <div className={`${styles.highlights} translate`}>
            <div className={styles.btn}>
              {highLights?.length !== 0 && (
                <div title="ℹ️ Show previous highlight" className={styles.backbutton} ref={navigationPrevRef}>
                  <img className={styles.path517Icon} alt="previous" src="/back-white.svg" />
                </div>
              )}
            </div>
            <div className={styles.cardStoryTimerParent}>
              {highLights?.length === 0 ? (
                <div className={styles.nostory}>
                  <img style={{ width: "50px", height: "50px" }} title="ℹ️ paste" src="/info.svg" />
                  {t(LanguageKey.pageStory_thereAreNoHighlight)}

                  {/* <div
                  title="🔗 Manage your highlight"
                  className="disableButton"
                  style={{ paddingLeft: "20px", paddingRight: "20px" }}>
                  {t(LanguageKey.pageStory_highlightManagement)}
                </div> */}
                </div>
              ) : (
                <Swiper
                  id="highlights"
                  className={styles.storylist}
                  modules={[Navigation, Pagination, Scrollbar, A11y]}
                  spaceBetween={10}
                  slidesPerView={1}
                  //spaceBetween={0}
                  //slidesPerView={5}
                  // onUpdate={(a) => {
                  //   let swiperd = document.getElementById("highlights");
                  //   if (swiperd)
                  //     if (window.getComputedStyle(swiperd).overflow === "visible") {
                  //       swiperd.classList.add("swiper2");
                  //       let swiperWrapper = swiperd.children[0];
                  //       swiperWrapper.classList.add("swiper-wrapper2");
                  //       for (let i = 0; i < swiperWrapper.children.length; i++) {
                  //         let childD = swiperWrapper.children[i];
                  //         childD.classList.add("swiper-slide2");
                  //       }

                  //       // console.log("ffffffffffff ", f.overflow);
                  //       // if (!classes.contains("swiper-backface-hidden")) {
                  //       //   classes.add("swiper");
                  //     }
                  //   // }
                  // }}
                  navigation={{
                    prevEl: navigationPrevRef.current,
                    nextEl: navigationNextRef.current,
                    disabledClass: `${styles.disableNavigation}`,
                  }}
                  breakpoints={{
                    480: { slidesPerView: 2, spaceBetween: 0 },
                    640: { slidesPerView: 3, spaceBetween: 0 },
                    860: { slidesPerView: 4, spaceBetween: 0 },
                    1000: { slidesPerView: 5, spaceBetween: 0 },
                    1330: { slidesPerView: 6, spaceBetween: 0 },
                    1530: { slidesPerView: 7, spaceBetween: 0 },
                    1730: { slidesPerView: 8, spaceBetween: 0 },
                    1930: { slidesPerView: 9, spaceBetween: 0 },
                    2130: { slidesPerView: 10, spaceBetween: 0 },
                    2330: { slidesPerView: 11, spaceBetween: 0 },
                    2530: { slidesPerView: 12, spaceBetween: 0 },
                    2730: { slidesPerView: 13, spaceBetween: 0 },
                    2930: { slidesPerView: 14, spaceBetween: 0 },
                    3130: { slidesPerView: 15, spaceBetween: 0 },
                    3330: { slidesPerView: 16, spaceBetween: 0 },
                    3530: { slidesPerView: 17, spaceBetween: 0 },
                    3730: { slidesPerView: 18, spaceBetween: 0 },
                    3930: { slidesPerView: 19, spaceBetween: 0 },
                    4130: { slidesPerView: 20, spaceBetween: 0 },
                    4330: { slidesPerView: 21, spaceBetween: 0 },
                    4530: { slidesPerView: 22, spaceBetween: 0 },
                    4730: { slidesPerView: 23, spaceBetween: 0 },
                    4930: { slidesPerView: 24, spaceBetween: 0 },
                    5130: { slidesPerView: 25, spaceBetween: 0 },
                    5330: { slidesPerView: 26, spaceBetween: 0 },
                    5530: { slidesPerView: 27, spaceBetween: 0 },
                    5730: { slidesPerView: 28, spaceBetween: 0 },
                    5930: { slidesPerView: 29, spaceBetween: 0 },
                    6130: { slidesPerView: 30, spaceBetween: 0 },
                  }}>
                  <>
                    {highLights?.length !== 0 &&
                      highLights?.map((v, i) => (
                        <SwiperSlide key={i}>
                          <div className={styles.story}>
                            <img
                              loading="lazy"
                              decoding="async"
                              className={styles.highlightimage}
                              src={basePictureUrl + v.coverMedia}
                              alt="highlight image"
                            />
                            {v.title}
                          </div>
                        </SwiperSlide>
                      ))}
                  </>
                </Swiper>
              )}
            </div>
            <div className={styles.btn}>
              {highLights?.length !== 0 && (
                <div title="ℹ️ Show next Highlight" className={styles.forwardbutton} ref={navigationNextRef}>
                  <img className={styles.path517Icon1} alt="next" src="/next-white.svg" />
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default HighLight;
