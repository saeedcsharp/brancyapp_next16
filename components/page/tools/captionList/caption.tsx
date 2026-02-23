import { MouseEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Dotmenu from "brancy/components/design/dotMenu/dotMenu";
import Slider, { SliderSlide } from "brancy/components/design/slider/slider";
import Loading from "brancy/components/notOk/loading";
import { IHashtag } from "brancy/models/page/tools/tools";
import styles from "brancy/components/page/tools/captionList/caption.module.css";
const Caption = (props: {
  data: IHashtag | null;
  showSetting: string;
  handleHashtagShowSetting: (e: MouseEvent) => void;
  displayNewList: (e: MouseEvent) => void;
  handleClickOnIcon: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  useEffect(() => {
    if (props.data) setLoading(false);
  }, [props.data]);
  const handleCircleClick = () => {
    setIsHidden(!isHidden);
  };
  return (
    <>
      <div className="tooBigCard" style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}>
        <div className="headerChild" onClick={handleCircleClick}>
          <div className="circle"></div>
          <div className="Title">caption list</div>
        </div>
        <div className={`${styles.all} ${isHidden ? "" : styles.show}`}>
          {loading && <Loading />}
          {!loading && (
            <>
              <div onClick={props.displayNewList} className={styles.addnewlink} title="◰ create new caption list">
                <div className={styles.addnewicon}>
                  <svg fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
                    <path
                      opacity=".4"
                      d="M5 23.21v-9l.17-5.59A7.3 7.3 0 0 1 6.6 4.71q.48-.6 1.09-1.1a7 7 0 0 1 3.88-1.44C13.04 2 15.13 2 17.4 2c.84 0 1.6 0 2.3.25q.22.07.43.18c.67.32 1.2.86 1.8 1.46l7.1 7.16c.7.7 1.32 1.31 1.65 2.12s.33 1.69.33 2.67v5.18l-.23 6.47c-.23 1.74-.72 3.21-1.88 4.38s-2.62 1.67-4.36 1.9c-1.67.23-3.79.23-6.43.23h-2.33v-4.1h2.6a3.35 3.35 0 1 0 0-6.7h-2.6v-2.6a3.34 3.34 0 1 0-6.68 0v2.6z"
                      fill="var(--color-dark-blue)"
                    />
                    <path
                      d="M19.02 2.2q.24.08.46.18c.72.32 1.28.84 1.92 1.43l7.56 7.02a7 7 0 0 1 1.75 2.08q.22.52.29 1.09h-3.13c-2.16 0-3.19 0-4.56-.17a6 6 0 0 1-3.57-1.43 5.2 5.2 0 0 1-1.56-3.3C18 7.84 18 6.88 18 4.9V2q.53.05 1.02.2"
                      fill="var(--color-dark-blue)"
                    />
                    <path
                      d="M12.5 33a1.3 1.3 0 0 0 1.3-1.3v-3.9h3.9a1.3 1.3 0 0 0 0-2.6h-3.9v-3.9a1.3 1.3 0 0 0-2.6 0v3.9H7.3a1.3 1.3 0 0 0 0 2.6h3.9v3.9a1.3 1.3 0 0 0 1.3 1.3"
                      fill="var(--color-dark-blue)"
                    />
                  </svg>
                </div>
                <div className={styles.addnewcontent}>
                  <div className={styles.addnewheader}>create aption list</div>
                  <div className="explain">create new caption with custom font</div>
                </div>
              </div>
              {props.data && props.data.hashtagList !== null && (
                <Slider className={styles.swiperContent} itemsPerSlide={2}>
                  {props.data.hashtagList.map((v) => (
                    <SliderSlide key={v.listId}>
                      <div className="headerandinput">
                        {/* HEADER */}
                        <div className="headerparent">
                          <div className="headertext">
                            {v.listName}
                            <div className="counter">
                              (<strong>{v.hashtags.length}</strong> / <strong>200</strong>)
                            </div>
                          </div>
                          <Dotmenu
                            showSetting={openMenuId === v.listId.toString()}
                            onToggle={() => {
                              setOpenMenuId((prev) => (prev === v.listId.toString() ? null : v.listId.toString()));
                              if (openMenuId !== v.listId.toString()) {
                                const fakeEvent = {
                                  stopPropagation: () => {},
                                  currentTarget: { id: v.listId.toString() },
                                } as unknown as MouseEvent;
                                props.handleHashtagShowSetting(fakeEvent);
                              }
                            }}
                            data={[
                              {
                                icon: "/edit-1.svg",
                                value: "Edit List",
                                onClick: () => {
                                  props.handleClickOnIcon("Edit List");
                                  setOpenMenuId(null);
                                },
                              },
                              {
                                icon: "/copy.svg",
                                value: "Copy All",
                                onClick: () => {
                                  props.handleClickOnIcon("Copy All");
                                  setOpenMenuId(null);
                                },
                              },
                              {
                                icon: "/delete.svg",
                                value: "Delete List",
                                onClick: () => {
                                  props.handleClickOnIcon("Delete List");
                                  setOpenMenuId(null);
                                },
                              },
                            ]}
                          />
                        </div>
                        {/* hashtagListItem */}
                        <div className={styles.myhashtagList}>
                          {v.hashtags.map((u, j) => (
                            <div
                              key={j}
                              className={`${styles.tagHashtag} ${/[\u0600-\u06FF]/.test(u) ? styles.rtlTag : ""}`}>
                              <img
                                className={styles.hashtagicon}
                                title="ℹ️ hashtag"
                                alt="Hashtag icon"
                                src="/icon-hashtag.svg"
                              />
                              <div className={styles.instagramer}>{u}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </SliderSlide>
                  ))}
                </Slider>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Caption;
