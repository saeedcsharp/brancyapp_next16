import { MouseEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import Dotmenu from "../../../design/dotMenu/dotMenu";
import Slider, { SliderSlide } from "../../../design/slider/slider";
import FlexibleToggleButton from "../../../design/toggleButton/flexibleToggleButton";
import { ToggleOrder } from "../../../design/toggleButton/types";
import Loading from "../../../notOk/loading";
import initialzedTime from "../../../../helper/manageTimer";
import { LanguageKey } from "../../../../i18n";
import { IHashtag } from "../../../../models/page/tools/tools";
import styles from "./hashtags.module.css";
const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const Hashtags = (props: {
  data: IHashtag | null;
  showHashtagPageAnalysisSetting: string;
  showHashtagPictureAnalysisSetting: string;
  handlePictureAnalysisShowSetting: (e: MouseEvent) => void;
  handlePageAnalysisShowSetting: (e: MouseEvent) => void;
  displayNewList: (e: MouseEvent) => void;
  handleClickForPictureAnalyser: (id: string) => void;
  handleClickForPageAnalyser: (id: string) => void;
  handleShowNewPicture: () => void;
  handleShowNewPage: () => void;
}) => {
  const { t } = useTranslation();
  const [toggle, setToggle] = useState<ToggleOrder>(ToggleOrder.FirstToggle);
  const [loading, setLoading] = useState(true);
  const [isHidden, setIsHidden] = useState(false);

  const handleCircleClick = () => {
    setIsHidden(!isHidden); // Toggle visibility and grid-row-end state
  };
  useEffect(() => {
    if (props.data) setLoading(false);
  }, [props.data]);

  // popup for  picture
  const [showPopup, setShowPopup] = useState(false);
  const [popupImage, setPopupImage] = useState("");

  const handleImageClick = (imageUrl: string) => {
    setPopupImage(imageUrl);

    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupImage("");
  };
  // popup for  picture

  return (
    <>
      <div
        className="tooBigCard"
        style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }} // Update gridRowEnd based on isHidden
      >
        {showPopup && (
          <>
            <div className="dialogBg" onClick={handleClosePopup}></div>
            <div className="popup">
              <div className="headerparent">
                <div className={styles.closebtn} onClick={handleClosePopup}>
                  <img src="/close-box.svg" alt="close" title="close" />
                </div>
              </div>
              <img className={styles.profileimagebig} src={popupImage} alt="Popup picture" title="picture" />
            </div>
          </>
        )}
        <div className="headerChild" onClick={handleCircleClick}>
          <div className="circle"></div>
          <div className="Title">
            {t(LanguageKey.Analyzer)} {t(LanguageKey.pageTools_hashtags)}
          </div>
        </div>
        <div className={`${styles.all} ${isHidden ? "" : styles.show}`}>
          <FlexibleToggleButton
            options={[
              { label: t(LanguageKey.pageTools_pictureanAnalyzer), id: 0 },
              { label: t(LanguageKey.pageTools_pageanAnalyzer), id: 1 },
            ]}
            onChange={setToggle}
            selectedValue={toggle}
          />
          {/* photo analyzer */}
          {toggle === ToggleOrder.FirstToggle && (
            <>
              {!loading && props.data && (
                <>
                  <div onClick={props.handleShowNewPicture} className={styles.addnewlink} title="◰ create new # list">
                    <div className={styles.addnewicon}>
                      <svg fill="none" width="36" height="36" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
                        <path
                          d="M14.25 12.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0m13.5-10.87c.47 0 .9.3 1.06.73l.38 1.05c.54 1.46.72 1.86 1 2.15.28.3.69.46 2.15 1l1.05.38a1.13 1.13 0 0 1 0 2.12l-1.05.38c-1.46.54-1.86.72-2.15 1s-.46.7-1 2.15l-.38 1.05a1.13 1.13 0 0 1-2.12 0l-.38-1.05c-.54-1.46-.72-1.86-1-2.15s-.69-.46-2.15-1l-1.05-.38a1.13 1.13 0 0 1 0-2.12l1.05-.38c1.46-.54 1.86-.72 2.15-1s.46-.69 1-2.15l.38-1.05c.17-.44.59-.73 1.06-.73"
                          fill="var(--color-dark-blue)"
                        />
                        <path
                          opacity=".4"
                          d="M17.25 3.38h-.1l-7.73.26c-2.05.28-3.74.87-5.08 2.2-1.33 1.34-1.92 3.03-2.2 5.08-.27 2-.27 4.53-.27 7.72v.22a63 63 0 0 0 .27 7.72c.28 2.05.87 3.74 2.2 5.08 1.34 1.33 3.03 1.92 5.08 2.2 2 .27 4.53.27 7.72.27h.22l7.72-.27c2.05-.28 3.74-.87 5.08-2.2 1.33-1.34 1.92-3.03 2.2-5.08.27-2 .27-4.53.27-7.72v-2.3a1.47 1.47 0 0 0-2.94 0v3.5C20.56 15.6 13.97 23.52 8.12 30.6a4 4 0 0 1-1.7-1c-.7-.7-1.14-1.67-1.37-3.4a63 63 0 0 1-.25-7.44c0-3.32 0-5.66.25-7.44.23-1.73.66-2.7 1.36-3.4s1.67-1.13 3.4-1.36a62 62 0 0 1 7.44-.25h2.19a1.46 1.46 0 1 0 .01-2.92z"
                          fill="var(--color-dark-blue)"
                        />
                      </svg>
                    </div>

                    <div className={styles.addnewcontent}>
                      <div className={styles.addnewheader}>{t(LanguageKey.pageTools_CreateNewListpic)}</div>
                      <div className="explain">{t(LanguageKey.pageTools_CreateNewListpicexplain)}</div>
                    </div>
                  </div>

                  <Slider
                    className={styles.swiperContent}
                    slidesPerView={1}
                    spaceBetween={10}
                    itemsPerSlide={2}
                    navigation={props.data.lastPictureAnalysisHashtags.length > 2}
                    pagination={{
                      clickable: true,
                      dynamicBullets: true,
                      renderBullet: (index, className) => `<span class="${className}">${index + 1}</span>`,
                    }}>
                    {props.data.lastPictureAnalysisHashtags.map((u, i) => (
                      <SliderSlide key={i}>
                        <div className="headerandinput">
                          <div className="headerparent">
                            {/* 1. hashtagList011 */}
                            <div className="headertext">
                              <div className={styles.searchContent}>
                                <img
                                  title="◰ resize the picture"
                                  className={styles.userpicture}
                                  alt="analized"
                                  src={baseMediaUrl + u.thumbnailMediaUrl}
                                  onClick={() => handleImageClick(baseMediaUrl + u.thumbnailMediaUrl)}
                                />

                                <div className={styles.userProfiledetail}>
                                  <div className={styles.searchContent}>
                                    <div className={styles.date} title="ℹ️ analize date">
                                      <span className={styles.day}>
                                        {new DateObject({
                                          date: u.createdTime * 1000,
                                          calendar: initialzedTime().calendar,
                                          locale: initialzedTime().locale,
                                        }).format("YYYY")}
                                      </span>
                                      /
                                      <span className={styles.day}>
                                        {new DateObject({
                                          date: u.createdTime * 1000,
                                          calendar: initialzedTime().calendar,
                                          locale: initialzedTime().locale,
                                        }).format("MM")}
                                      </span>
                                      /
                                      <span className={styles.day}>
                                        {new DateObject({
                                          date: u.createdTime * 1000,
                                          calendar: initialzedTime().calendar,
                                          locale: initialzedTime().locale,
                                        }).format("DD")}
                                      </span>
                                      -
                                      <span className={styles.hour}>
                                        {new DateObject({
                                          date: u.createdTime * 1000,
                                          calendar: initialzedTime().calendar,
                                          locale: initialzedTime().locale,
                                        }).format("hh")}
                                      </span>
                                      :
                                      <span className={styles.hour}>
                                        {new DateObject({
                                          date: u.createdTime * 1000,
                                          calendar: initialzedTime().calendar,
                                          locale: initialzedTime().locale,
                                        }).format("mm A")}
                                      </span>
                                    </div>
                                    <div className="counter">
                                      (<strong>{u.hashtags.length ?? "0"}</strong>/ <strong>200</strong> )
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 3. Dotmenu Component */}
                            <Dotmenu
                              data={[
                                { icon: "/copy.svg", value: "Copy All" },
                                { icon: "/delete.svg", value: "Delete List" },
                              ]}
                              handleClickOnIcon={props.handleClickForPictureAnalyser}
                            />
                          </div>
                          <div className={styles.hashtagListItem}>
                            {u.hashtags.map((h, l) => (
                              <div
                                key={l}
                                className={`${styles.tagHashtag} ${/[\u0600-\u06FF]/.test(h) ? styles.rtlTag : ""}`}>
                                <img
                                  className={styles.hashtagicon}
                                  title="ℹ️ hashtag"
                                  alt="#"
                                  src="/icon-hashtag.svg"
                                />
                                <div className={styles.instagramer}>{h}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </SliderSlide>
                    ))}
                  </Slider>
                </>
              )}
              {loading && <Loading />}
            </>
          )}

          {/* page analyzer */}
          {toggle === ToggleOrder.SecondToggle && (
            <>
              {!loading && props.data && (
                <>
                  <div onClick={props.handleShowNewPage} className={styles.addnewlink} title="◰ create new # list">
                    <div className={styles.addnewicon}>
                      <svg fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
                        <path
                          d="M27 1.88c.47 0 .9.3 1.06.73l.44 1.2c.61 1.66.82 2.15 1.18 2.51s.85.57 2.52 1.18l1.19.44a1.13 1.13 0 0 1 0 2.12l-1.2.44c-1.66.61-2.15.82-2.51 1.18s-.57.85-1.18 2.52l-.44 1.2a1.13 1.13 0 0 1-2.12 0l-.44-1.2c-.61-1.67-.82-2.16-1.18-2.52s-.85-.57-2.52-1.18l-1.19-.44a1.13 1.13 0 0 1 0-2.12l1.2-.44c1.66-.6 2.15-.82 2.51-1.18s.57-.85 1.18-2.52l.44-1.19c.17-.44.59-.73 1.06-.73"
                          fill="var(--color-dark-blue)"
                        />
                        <path
                          opacity=".4"
                          d="M18.22 7.88h-3.3l-6.65.22c-1.76.24-3.2.74-4.3 1.86-1.13 1.12-1.63 2.55-1.87 4.3-.23 1.72-.23 4.07-.23 6.82l.23 6.65c.24 1.76.74 3.19 1.86 4.3 1.12 1.13 2.55 1.63 4.3 1.87 1.72.23 3.9.23 6.66.23h6.16l6.65-.23c1.76-.24 3.19-.74 4.3-1.86 1.13-1.12 1.63-2.55 1.87-4.3.23-1.72.23-3.9.23-6.66l-.23-6.81a10 10 0 0 0-.53-2.2l-.52.19-1.88.75c-.14.3-.4.99-.71 1.84l-.45 1.2a3 3 0 0 1-5.62 0l-.45-1.2-.7-1.84c-.3-.14-1.04-.44-1.9-.75l-1.2-.45a3 3 0 0 1-1.72-3.94"
                          fill="var(--color-dark-blue)"
                        />
                      </svg>
                    </div>

                    <div className={styles.addnewcontent}>
                      <div className={styles.addnewheader}>{t(LanguageKey.pageTools_CreateNewListpage)}</div>
                      <div className="explain">{t(LanguageKey.pageTools_CreateNewListpageexplain)}</div>
                    </div>
                  </div>

                  <Slider
                    className={styles.swiperContent}
                    itemsPerSlide={2}
                    navigation={props.data.lastPageAnalysisHashtags.length > 2}>
                    {props.data.lastPageAnalysisHashtags.map((u, i) => (
                      <SliderSlide key={i}>
                        <div className="headerandinput">
                          <div className="headerparent">
                            {/* 1. hashtagList011 */}
                            <div className="headertext">
                              <div className={styles.searchContent}>
                                <img
                                  title="◰ resize the picture"
                                  className={styles.userProfile}
                                  alt="instagram profile picture"
                                  src={baseMediaUrl + u.profileUrl}
                                  onClick={() => handleImageClick(baseMediaUrl + u.profileUrl)}
                                />
                                <div className={styles.userProfiledetail}>
                                  <div className={styles.username} style={{ color: "var(--text-h1)" }}>
                                    @ {u.username}
                                  </div>

                                  <div className={styles.searchContent}>
                                    <div className="date" title="ℹ️ analize date">
                                      <span className="day">
                                        {new DateObject({
                                          date: u.createdTime * 1000,
                                          calendar: initialzedTime().calendar,
                                          locale: initialzedTime().locale,
                                        }).format("YYYY")}
                                      </span>
                                      /
                                      <span className="day">
                                        {new DateObject({
                                          date: u.createdTime * 1000,
                                          calendar: initialzedTime().calendar,
                                          locale: initialzedTime().locale,
                                        }).format("MM")}
                                      </span>
                                      /
                                      <span className="day">
                                        {new DateObject({
                                          date: u.createdTime * 1000,
                                          calendar: initialzedTime().calendar,
                                          locale: initialzedTime().locale,
                                        }).format("DD")}
                                      </span>
                                      -
                                      <span className="hour">
                                        {new DateObject({
                                          date: u.createdTime * 1000,
                                          calendar: initialzedTime().calendar,
                                          locale: initialzedTime().locale,
                                        }).format("hh")}
                                      </span>
                                      :
                                      <span className="hour">
                                        {new DateObject({
                                          date: u.createdTime * 1000,
                                          calendar: initialzedTime().calendar,
                                          locale: initialzedTime().locale,
                                        }).format("mm a")}
                                      </span>
                                    </div>
                                    <div className="counter">
                                      (<strong>{u.hashtags.length ?? "0"}</strong>/ <strong> 200</strong>)
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 3. Dotmenu Component */}
                            <Dotmenu
                              data={[
                                { icon: "/copy.svg", value: "Copy All" },
                                { icon: "/delete.svg", value: "Delete List" },
                              ]}
                              handleClickOnIcon={props.handleClickForPageAnalyser}
                            />
                          </div>
                          <div className={styles.hashtagListItem}>
                            {u.hashtags.map((m, n) => (
                              <div
                                key={n}
                                className={`${styles.tagHashtag} ${/[\u0600-\u06FF]/.test(m) ? styles.rtlTag : ""}`}>
                                <img
                                  className={styles.hashtagicon}
                                  title="ℹ️ hashtag"
                                  alt="#"
                                  src="/icon-hashtag.svg"
                                />
                                <div className={styles.instagramer}>{m}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </SliderSlide>
                    ))}
                  </Slider>
                </>
              )}
              {loading && <Loading />}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Hashtags;
