import { useSession } from "next-auth/react";
import { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Slider, { SliderSlide } from "saeed/components/design/slider/slider";
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
import formatTimeAgo from "saeed/helper/formatTimeAgo";
import { LanguageKey } from "saeed/i18n";
import { GetServerResult, MethodType } from "saeed/helper/apihelper";
import {
  IFollowRequest_AcceptedFollower,
  IFollowRequest_Condotion,
  IFollowRequest_Figure,
  IFollowRequest_UpdateCondotion,
} from "saeed/models/page/tools/tools";
import styles from "./autointeraction.module.css";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const Followrequests = (props: { removeMask: () => void }) => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [toggle, setToggle] = useState<ToggleOrder>(ToggleOrder.FirstToggle);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [condition, setCondition] = useState<IFollowRequest_Condotion>();
  const [figure, setFigure] = useState<IFollowRequest_Figure>();
  const [acceptedFollowers, setAcceptedFollowers] = useState<IFollowRequest_AcceptedFollower[]>();

  async function handleSaveButton() {
    let instagramerId = session?.user.instagramerIds[session.user.currentIndex];
    try {
      console.log("condition,", condition);
      var res = await GetServerResult<IFollowRequest_UpdateCondotion, boolean>(
        MethodType.post,
        session,
        "Instagramer" + "/AutoAcceptFollower/UpdateCondition",
        {
          isPaused: !condition?.isPaused,
          reAcceptFollower: condition?.reAcceptFollower,
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
  }
  function handleChangeCondition(e: ChangeEvent<HTMLInputElement>) {
    setCondition((prev) => ({ ...prev!, [e.target.name]: e.target.checked }));
  }
  async function fetchData() {
    try {
      const [checkRes, conditionRes, figureRes, acceptedFollowersRes] = await Promise.all([
        GetServerResult<boolean, boolean>(
          MethodType.get,
          session,
          "Instagramer" + "/AutoAcceptFollower/CheckAvailability"
        ),
        GetServerResult<boolean, IFollowRequest_Condotion>(
          MethodType.get,
          session,
          "Instagramer" + "/AutoAcceptFollower/GetCondition"
        ),
        GetServerResult<boolean, IFollowRequest_Figure>(
          MethodType.get,
          session,
          "Instagramer" + "/AutoAcceptFollower/GetFigure"
        ),
        GetServerResult<boolean, IFollowRequest_AcceptedFollower[]>(
          MethodType.get,
          session,
          "Instagramer" + "/AutoAcceptFollower/GetAcceptedFollowers"
        ),
      ]);
      if (checkRes.value) {
        setLoadingStatus(true);
        //   setCondition({
        //     instagramerId: conditionRes.value.instagramerId,
        //     isPaused: !conditionRes.value.isPaused,
        //     lastUpdateTime: conditionRes.value.lastUpdateTime,
        //     reAcceptFollower: conditionRes.value.reAcceptFollower,
        //   });
        //   setFigure(figureRes.value);
        //   setAcceptedFollowers(acceptedFollowersRes.value);
        //   setLoadingStatus((prev) => ({ ...prev, loading: false, ok: true }));
        // } else if (checkRes.info.responseType === ResponseType.PasswordRequired)
        //   setLoadingStatus((prev) => ({
        //     ...prev,
        //     loading: false,
        //     notPassword: true,
        //   }));
        // else if (
        //   checkRes.info.responseType === ResponseType.PackageRequiredInThisTime
        // )
        //   setLoadingStatus((prev) => ({
        //     ...prev,
        //     loading: false,
        //     notBasePackage: true,
        //   }));
        // else if (
        //   checkRes.info.responseType === ResponseType.FeatureRequiredInThisTime
        // )
        //   setLoadingStatus((prev) => ({
        //     ...prev,
        //     loading: false,
        //     notFeature: true,
        //   }));
      }
    } catch (error) {
      console.error("One of the requests failed:", error);
      internalNotify(InternalResponseType.UnexpectedError, NotifType.Error);
    }
  }
  async function loadMoreFollowers() {
    if (acceptedFollowers?.length === 0) return;
    let instagramerId = session?.user.instagramerIds[session.user.currentIndex];
    try {
      var res = await GetServerResult<boolean, IFollowRequest_AcceptedFollower[]>(
        MethodType.get,
        session,
        "Instagramer" + instagramerId + "/AutoAcceptFollower/GetAcceptedFollowers",
        [
          {
            key: "nextId",
            value: acceptedFollowers![acceptedFollowers!.length - 1].acceptedFollowerId.toString(),
          },
        ]
      );
      if (res.succeeded) {
        setAcceptedFollowers((prev) => [...prev!, ...res.value]);
      } else notify(res.info.responseType, NotifType.Error);
    } catch (error) {
      console.error("One of the requests failed:", error);
      internalNotify(InternalResponseType.UnexpectedError, NotifType.Error);
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
      {
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
                      <div className="title">{t(LanguageKey.pageTools_AcceptPendingRequests)}</div>
                      <ToggleCheckBoxButton
                        handleToggle={handleChangeCondition}
                        checked={condition.isPaused}
                        name={"isPaused"}
                        title={" isPaused"}
                        role={" switch button"}
                      />
                    </div>
                    <div className="explain">
                      {t(LanguageKey.pageTools_AcceptPendingRequestsexplain)}
                      <br />
                      ℹ️{t(LanguageKey.pageTools_onlyprivate)}
                    </div>
                  </div>
                  <div className={`${styles.radioBoxContainer} ${!condition.isPaused && "fadeDiv"}`}>
                    <div className="title">{t(LanguageKey.AdvanceSettings)}</div>
                    <div className={styles.radioButtonsContainer}>
                      <div className="headerandinput">
                        <div className="headerparent">
                          <div className={styles.radioBoxTitle}>{t(LanguageKey.pageTools_Reacceptfollower)}</div>

                          <ToggleCheckBoxButton
                            handleToggle={handleChangeCondition}
                            checked={condition.reAcceptFollower}
                            name={"reAcceptFollower"}
                            title={" reAcceptFollower"}
                            role={"  switch button"}
                          />
                        </div>
                        <div className="explain">{t(LanguageKey.pageTools_Reacceptfollowerexplain)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="ButtonContainer">
                    <button onClick={props.removeMask} className={"cancelButton"}>
                      {t(LanguageKey.close)}
                    </button>
                    <button onClick={handleSaveButton} className={"saveButton"}>
                      {t(LanguageKey.save)}
                    </button>
                  </div>
                </>
              )}
              {toggle === ToggleOrder.SecondToggle && (
                <>
                  {showPopup && (
                    <>
                      <div className="dialogBg" onClick={handleClosePopup}></div>
                      <div className="popup">
                        <div className={styles.titlepopup}>
                          <div className={styles.username}>@ {popupUsername}</div>

                          <div className={styles.closebtn} onClick={handleClosePopup}>
                            <img src="/close-box.svg" alt="close" title="close" />
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
                  {figure && (
                    <div className={styles.chart}>
                      <InsightChart superFigur={figure} />
                    </div>
                  )}
                  {acceptedFollowers && acceptedFollowers.length > 0 && (
                    <div className={styles.historylist}>
                      <Slider
                        className={styles.test}
                        itemsPerSlide={5}
                        navigation={acceptedFollowers.length > 5}
                        onReachEnd={loadMoreFollowers}>
                        {acceptedFollowers.map((u, j) => (
                          <SliderSlide key={j}>
                            <div className={styles.profile}>
                              <img
                                loading="lazy"
                                decoding="async"
                                title="◰ resize the picture"
                                className={styles.image}
                                alt="instagram profile picture"
                                src={basePictureUrl + u.profileUrl}
                                onClick={() => handleImageClick(basePictureUrl + u.profileUrl, u.username)}
                              />

                              <div className={styles.detail}>
                                <div className={styles.name} title={u.fullName}>
                                  {u.fullName}
                                </div>
                                <div className={styles.instaid} title={u.username}>
                                  @{u.username}
                                </div>
                                <div className={styles.time}>{formatTimeAgo(u.createdTime * 1000)}</div>
                              </div>
                            </div>
                          </SliderSlide>
                        ))}
                      </Slider>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      }
    </>
  );
};

export default Followrequests;
