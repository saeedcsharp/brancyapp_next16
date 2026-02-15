import { useSession } from "next-auth/react";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import IncrementStepper from "saeed/components/design/incrementStepper";
import FlexibleToggleButton from "saeed/components/design/toggleButton/flexibleToggleButton";
import { ToggleOrder } from "saeed/components/design/toggleButton/types";
import ToggleCheckBoxButton from "saeed/components/design/toggleCheckBoxButton";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
} from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import InsightChart from "saeed/components/page/posts/insightChart";
import { convertArrayToLarray } from "saeed/helper/chunkArray";
import formatTimeAgo from "saeed/helper/formatTimeAgo";
import { LanguageKey } from "saeed/i18n";
import { GetServerResult, MethodType } from "saeed/helper/apihelper";
import {
  IUnFollowAllFollowing_Client_Condotion,
  IUnFollowAllFollowing_Figure,
  IUnFollowAllFollowing_GetUnFollowing,
  IUnFollowAllFollowing_Server_Condotion,
  IUnFollowAllFollowing_UpdateCondotion,
} from "saeed/models/page/tools/tools";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import styles from "./autointeraction.module.css";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const UnFollowAllFollowing = (props: {
  handleRemoveFollowing: (removeFollowing: IUnFollowAllFollowing_UpdateCondotion) => void;
  removeMask: () => void;
  data: number;
  id: string;
  name: string;
}) => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  let navigationPrevRef = React.useRef(null);
  let navigationNextRef = React.useRef(null);
  const [toggle, setToggle] = useState<ToggleOrder>(ToggleOrder.FirstToggle);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [condition, setCondition] = useState<IUnFollowAllFollowing_Client_Condotion>();
  const [figure, setFigure] = useState<IUnFollowAllFollowing_Figure>();
  const [unfollowAllFollowing, setUnfollowAllFollowing] = useState<IUnFollowAllFollowing_GetUnFollowing[]>();
  function handleChangeCondition(e: ChangeEvent<HTMLInputElement>) {
    setCondition((prev) => ({ ...prev!, [e.target.name]: e.target.checked }));
  }
  async function fetchData() {
    let instagramerId = session?.user.instagramerIds[session.user.currentIndex];
    try {
      const [checkRes, conditionRes, figureRes, acceptedFollowersRes] = await Promise.all([
        GetServerResult<boolean, boolean>(
          MethodType.get,
          session,
          "Instagramer" + instagramerId + "/UnfollowAllFollowing/CheckAvailability"
        ),
        GetServerResult<boolean, IUnFollowAllFollowing_Server_Condotion>(
          MethodType.get,
          session,
          "Instagramer" + instagramerId + "/UnfollowAllFollowing/GetCondition"
        ),
        GetServerResult<boolean, IUnFollowAllFollowing_Figure>(
          MethodType.get,
          session,
          "Instagramer" + "/UnfollowAllFollowing/GetFigure"
        ),
        GetServerResult<boolean, IUnFollowAllFollowing_GetUnFollowing[]>(
          MethodType.get,
          session,
          "Instagramer" + instagramerId + "/UnfollowAllFollowing/GetUnFollowings"
        ),
      ]);
      if (checkRes.value) {
        setLoadingStatus(false);
      }
    } catch (error) {
      console.error("One of the requests failed:", error);
      internalNotify(InternalResponseType.UnexpectedError, NotifType.Error);
    }
  }
  function handleIncrement() {
    setCondition((prevValue) => ({
      ...prevValue!,
      waitDays: prevValue!.waitDays + 1,
    }));
  }
  function handleDecrement() {
    setCondition((prevValue) => ({
      ...prevValue!,
      waitDays: prevValue!.waitDays > 1 ? prevValue!.waitDays - 1 : 0,
    }));
  }
  async function loadMore() {
    if (unfollowAllFollowing?.length === 0) return;
    let instagramerId = session?.user.instagramerIds[session.user.currentIndex];
    try {
      var res = await GetServerResult<boolean, IUnFollowAllFollowing_GetUnFollowing[]>(
        MethodType.get,
        session,
        "Instagramer" + instagramerId + "/AutoAcceptFollower/GetAcceptedFollowers",
        [
          {
            key: "nextId",
            value: unfollowAllFollowing![unfollowAllFollowing!.length - 1].id.toString(),
          },
        ]
      );
      if (res.succeeded) {
        setUnfollowAllFollowing((prev) => [...prev!, ...res.value]);
      } else notify(res.info.responseType, NotifType.Error);
    } catch (error) {
      console.error("One of the requests failed:", error);
      internalNotify(InternalResponseType.UnexpectedError, NotifType.Error);
    }
  }
  async function handleUpdate() {
    if (!condition?.isPaused) {
      let instagramerId = session?.user.instagramerIds[session.user.currentIndex];
      try {
        var res = await GetServerResult<IUnFollowAllFollowing_UpdateCondotion, boolean>(
          MethodType.post,
          session,
          "Instagramer" + instagramerId + "/UnfollowAllFollowing/UpdateCondition",
          {
            isPaused: true,
            waitSeconds: condition!.waitDays * 86400,
          }
        );
        if (res.succeeded) {
          internalNotify(InternalResponseType.Ok, NotifType.Success);
          props.removeMask();
        }
        if (!res.succeeded) notify(res.info.responseType, NotifType.Error);
      } catch (error) {
        internalNotify(InternalResponseType.UnexpectedError, NotifType.Error);
      }
    } else {
      props.handleRemoveFollowing({
        isPaused: false,
        waitSeconds: condition!.waitDays * 86400,
      });
    }
  }
  useEffect(() => {
    fetchData();
  }, []);
  // popup for username and picture
  const [showPopup, setShowPopup] = useState(false);
  const [popupImage, setPopupImage] = useState("");
  const [popupUsername, setPopupUsername] = useState(""); // New state for storing username

  const handleImageClick = (imageUrl: string, username: string) => {
    setPopupImage(imageUrl);
    setPopupUsername(username); // Store the username
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupImage("");
    setPopupUsername(""); // Clear the username
  };
  // popup for username and picture
  return (
    <>
      <div onClick={props.removeMask} className="dialogBg"></div>
      <div className="popup">
        {loadingStatus && <Loading />}
        {!loadingStatus && (
          <>
            <FlexibleToggleButton
              options={[
                { label: t(LanguageKey.pageTools_popup_detail), id: 0 },
                { label: t(LanguageKey.pageTools_popup_history), id: 1 },
              ]}
              onChange={setToggle}
              selectedValue={toggle}
            />
            {toggle === ToggleOrder.FirstToggle && condition && (
              <>
                <div className="headerandinput">
                  <div className="headerparent">
                    <div className="title">{t(LanguageKey.pageTools_RemoveAllFollowings)}</div>
                    <ToggleCheckBoxButton
                      handleToggle={handleChangeCondition}
                      checked={condition.isPaused}
                      name={"isPaused"}
                      title={"role"}
                      role={" switch button"}
                    />
                  </div>

                  <div className="explain">{t(LanguageKey.pageTools_RemoveAllFollowingsexplain)}</div>
                </div>
                <div className={`${styles.radioBoxContainer} ${!condition.isPaused && "fadeDiv"}`}>
                  <div className="title">{t(LanguageKey.AdvanceSettings)}</div>
                  <div className={styles.radioButtonsContainer}></div>
                  <div className="headerparent">
                    <div className={styles.radioBoxTitle}>{t(LanguageKey.waitday)}</div>
                    <IncrementStepper
                      data={condition.waitDays}
                      increment={handleIncrement}
                      decrement={handleDecrement}
                      id={"waitDays"}
                    />
                  </div>
                  <div className="explain">
                    {t(LanguageKey.waitdayexplain)}
                    <br />
                    ℹ️{t(LanguageKey.waitdayexplain2)}
                  </div>
                </div>
                <div className="ButtonContainer">
                  <button onClick={props.removeMask} className={"cancelButton"}>
                    {t(LanguageKey.close)}
                  </button>
                  <button onClick={handleUpdate} className={"saveButton"}>
                    {t(LanguageKey.update)}
                  </button>
                </div>
              </>
            )}
            {toggle === ToggleOrder.SecondToggle && unfollowAllFollowing && figure && (
              <>
                {showPopup && (
                  <>
                    <div className="dialogBg" onClick={handleClosePopup}></div>
                    <div className={styles.popupContent} role="dialog" aria-modal="true" aria-labelledby="popup-title">
                      <div className={`${styles.titlepopup} translate`} id="popup-title">
                        <div className={styles.username}>@ {popupUsername}</div>

                        <div
                          className={styles.closebtn}
                          onClick={handleClosePopup}
                          role="button"
                          aria-label="Close popup"
                          tabIndex={0}>
                          <img src="/close-box.svg" alt="Close" title="Close" loading="lazy" decoding="async" />
                        </div>
                      </div>
                      <img
                        loading="lazy"
                        decoding="async"
                        className={styles.profileimagebig}
                        src={popupImage}
                        alt="Popup profile"
                        title="profile picture"
                      />
                    </div>
                  </>
                )}

                <div className={`${styles.chart} translate`}>
                  <InsightChart superFigur={figure} />
                </div>
                <div className={`${styles.historylist} translate`}>
                  <Swiper
                    onReachEnd={loadMore}
                    className={styles.test}
                    slidesPerView={1}
                    spaceBetween={1}
                    modules={[Navigation, Pagination]}
                    navigation={{
                      prevEl: navigationPrevRef.current,
                      nextEl: navigationNextRef.current,
                    }}
                    pagination={{
                      clickable: true,
                      dynamicBullets: true,
                      renderBullet: function (index, className) {
                        return '<span class="' + className + '">' + (index + 1) + "</span>";
                      },
                    }}>
                    {convertArrayToLarray(unfollowAllFollowing, 5).map((v, i) => (
                      <>
                        <SwiperSlide key={i}>
                          <div className={styles.users}>
                            {v.map((u, j) => (
                              <div key={j} className={styles.profile}>
                                <img
                                  title="◰ resize the picture"
                                  className={styles.image}
                                  loading="lazy"
                                  alt="instagram profile picture"
                                  decoding="async"
                                  role="button"
                                  aria-label={`View profile of ${u.username}`}
                                  src={basePictureUrl + u.profileUrl}
                                  onClick={() => handleImageClick(basePictureUrl + u.profileUrl, u.username)}
                                />
                                <div className={styles.detail}>
                                  <div className={styles.name} title={u.fullName}>
                                    {u.fullName.length > 0 ? u.fullName : u.username}
                                  </div>
                                  <div className={styles.instaid} title={u.username}>
                                    @{u.username}
                                  </div>
                                  <div className={styles.time}>{formatTimeAgo(u.createdTime * 1000)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </SwiperSlide>
                      </>
                    ))}
                  </Swiper>
                </div>
              </>
            )}

            <div
              className={styles.navigation}
              style={toggle === ToggleOrder.FirstToggle ? { display: "none" } : undefined}>
              <svg
                ref={navigationPrevRef}
                className={styles.paginationvariant13Icon}
                width="21"
                height="21"
                viewBox="0 0 22 22"
                fill="none">
                <path stroke="var(--text-h2)" d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" opacity=".5" />
                <path
                  fill="var(--text-h1)"
                  d="m12.2 7 .6.2q.3.6 0 1l-2.2 2.2-.1.4.1.4 2.2 2.1q.3.6 0 1-.6.5-1 0l-2.2-2a2 2 0 0 1 0-2.9l2.1-2.2z"
                />
              </svg>
              <svg
                ref={navigationNextRef}
                className={styles.paginationvariant14Icon}
                width="21"
                height="21"
                viewBox="0 0 22 22"
                fill="none">
                <path stroke="var(--text-h2)" d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" opacity=".5" />
                <path
                  fill="var(--text-h1)"
                  d="M10 14.6q-.4 0-.6-.2a1 1 0 0 1 0-1l2.1-2.2.2-.4-.2-.4-2.1-2.1a1 1 0 0 1 0-1q.5-.5 1 0l2.1 2q.6.8.6 1.5 0 .8-.6 1.5l-2 2.1z"
                />
              </svg>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default UnFollowAllFollowing;
