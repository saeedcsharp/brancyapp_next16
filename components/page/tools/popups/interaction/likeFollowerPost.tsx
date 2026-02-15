import { useSession } from "next-auth/react";
import { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import IncrementStepper from "saeed/components/design/incrementStepper";
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
import { MethodType } from "saeed/helper/apihelper";
import {
  ILastPost_Condotion,
  ILastPost_Figure,
  ILastPost_UpdateCondotion,
  ILikeComment_GetLikeFollowers,
} from "saeed/models/page/tools/tools";
import styles from "./autointeraction.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const LikeFollowerPost = (props: { removeMask: () => void; data: number; id: string; name: string }) => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [toggle, setToggle] = useState<ToggleOrder>(ToggleOrder.FirstToggle);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [condition, setCondition] = useState<ILastPost_Condotion>();
  const [figure, setFigure] = useState<ILastPost_Figure>();
  const [lastPost, setLastPost] = useState<ILikeComment_GetLikeFollowers[]>();
  function handleChangeCondition(e: ChangeEvent<HTMLInputElement>) {
    setCondition((prev) => ({ ...prev!, [e.target.name]: e.target.checked }));
  }
  async function handleSaveButton() {
    let instagramerId = session?.user.instagramerIds[session.user.currentIndex];
    try {
      var res = await clientFetchApi<ILastPost_UpdateCondotion, boolean>("Instagramer" + instagramerId + "/LikeLastPostFollower/UpdateCondition", { methodType: MethodType.post, session: session, data: {
          isPaused: !condition?.isPaused,
          includeClicked: condition?.includeClicked,
          maxLikeCount: condition?.maxLikeCount,
        }, queries: undefined, onUploadProgress: undefined });
      if (res.succeeded) {
        internalNotify(InternalResponseType.Ok, NotifType.Success);
        props.removeMask();
      }
      if (!res.succeeded) notify(res.info.responseType, NotifType.Error);
    } catch (error) {
      internalNotify(InternalResponseType.UnexpectedError, NotifType.Error);
    }
  }
  async function fetchData() {
    let instagramerId = session?.user.instagramerIds[session.user.currentIndex];
    try {
      const [checkRes, conditionRes, figureRes, acceptedFollowersRes] = await Promise.all([
        clientFetchApi<boolean, boolean>("Instagramer" + instagramerId + "/LikeLastPostFollower/CheckAvailability", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined }),
        clientFetchApi<boolean, ILastPost_Condotion>("Instagramer" + instagramerId + "/LikeLastPostFollower/GetCondition", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined }),
        clientFetchApi<boolean, ILastPost_Figure>("Instagramer" + "/LikeLastPostFollower/GetFigure", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined }),
        clientFetchApi<boolean, ILikeComment_GetLikeFollowers[]>("Instagramer" + instagramerId + "/LikeLastPostFollower/GetLikedFollowers", { methodType: MethodType.get, session: session, data: undefined, queries: undefined, onUploadProgress: undefined }),
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
      maxLikeCount: prevValue!.maxLikeCount + 1,
    }));
  }
  function handleDecrement() {
    setCondition((prevValue) => ({
      ...prevValue!,
      maxLikeCount: prevValue!.maxLikeCount > 1 ? prevValue!.maxLikeCount - 1 : 0,
    }));
  }
  async function loadMore() {
    if (lastPost?.length === 0) return;
    let instagramerId = session?.user.instagramerIds[session.user.currentIndex];
    try {
      var res = await clientFetchApi<boolean, ILikeComment_GetLikeFollowers[]>("Instagramer" + instagramerId + "/AutoAcceptFollower/GetAcceptedFollowers", { methodType: MethodType.get, session: session, data: [
          {
            key: "nextId",
            value: lastPost![lastPost!.length - 1].likeFollowerId.toString(),
          },
        ], queries: undefined, onUploadProgress: undefined });
      if (res.succeeded) {
        setLastPost((prev) => [...prev!, ...res.value]);
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
                    <div className="title">{t(LanguageKey.pageTools_LikeNewFollowersPosts)}</div>
                    <ToggleCheckBoxButton
                      handleToggle={handleChangeCondition}
                      checked={condition.isPaused}
                      name={"isPaused"}
                      title={"isPaused"}
                      role={" switch button"}
                    />
                  </div>

                  <div className="explain">{t(LanguageKey.pageTools_LikeNewFollowersPostsexplain)}</div>
                </div>
                <div className={`${styles.radioBoxContainer} ${!condition.isPaused && "fadeDiv"}`}>
                  <div className="title">{t(LanguageKey.AdvanceSettings)}</div>
                  <div className={styles.radioButtonsContainer}>
                    <div className="headerparent">
                      <div className={styles.radioBoxTitle}>Include Clicked</div>
                      <ToggleCheckBoxButton
                        handleToggle={handleChangeCondition}
                        checked={condition.includeClicked}
                        name={"includeClicked"}
                        title={"  includeClicked"}
                        role={" switch button"}
                      />
                    </div>

                    <div className="headerparent">
                      <div className={styles.radioBoxTitle}>{t(LanguageKey.pageTools_MaxLike)}</div>

                      <IncrementStepper
                        data={condition.maxLikeCount}
                        increment={handleIncrement}
                        decrement={handleDecrement}
                        id={"maxLikeCount"}
                      />
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
            {toggle === ToggleOrder.SecondToggle && lastPost && figure && (
              <>
                {showPopup && (
                  <>
                    <div className="dialogBg" onClick={handleClosePopup}></div>
                    <div className="popup">
                      <div className={`${styles.titlepopup} translate`}>
                        <div className={styles.username}>@ {popupUsername}</div>

                        <div className={styles.closebtn} onClick={handleClosePopup}>
                          <img loading="lazy" decoding="async" src="/close-box.svg" alt="close" title="close" />
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
                  <Slider
                    className={styles.test}
                    itemsPerSlide={5}
                    navigation={lastPost.length > 5}
                    onReachEnd={loadMore}>
                    {lastPost.map((u, j) => (
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
                              {u.fullName.length > 0 ? u.fullName : u.username}
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
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default LikeFollowerPost;
