import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { DateObject } from "react-multi-date-picker";
import IncrementStepper from "../../../../design/incrementStepper";
import InputText from "../../../../design/inputText";
import RadioButton from "../../../../design/radioButton";
import ToggleCheckBoxButton from "../../../../design/toggleCheckBoxButton";
import { MethodType } from "../../../../../helper/api";

import { useSession } from "next-auth/react";
import router from "next/router";
import { useTranslation } from "react-i18next";
import {
  InternalResponseType,
  NotifType,
  ResponseType,
  internalNotify,
  notify,
} from "../../../../notifications/notificationBox";
import Loading from "../../../../notOk/loading";
import NotAllowed from "../../../../notOk/notAllowed";
import checkFeature from "../../../../../helper/checkFeature";
import { RoleAccess } from "../../../../../helper/loadingStatus";
import initialzedTime, { convertToMilliseconds } from "../../../../../helper/manageTimer";
import { LanguageKey } from "../../../../../i18n";
import { PartnerRole } from "../../../../../models/_AccountInfo/InstagramerAccountInfo";
import { IPageInfo } from "../../../../../models/customerAds/customerAd";
import {
  ILotteryInfo,
  IShortPostInfo,
  LotteryType,
  ShowScoreLotteryType,
  lotterySpecificationType,
} from "../../../../../models/page/tools/tools";
import { FeatureType, IFeatureInfo } from "../../../../../models/psg/psg";
import styles from "./scoreLottery.module.css";
import { clientFetchApi } from "../../../../../helper/clientFetchApi";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const ScoreLottery = (props: {
  removeMask: () => void;
  showScoreLottery: ShowScoreLotteryType;
  lotteryInfo: ILotteryInfo;
  shortPost: IShortPostInfo | null;
  unixData: number | null;
  featureInfo: IFeatureInfo | null;
  saveScoreLottery: (scoreLottery: ILotteryInfo) => Promise<void>;
  showSpecification: (scoreLottery: ILotteryInfo, lotterySpecification: lotterySpecificationType) => void;
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [peopleTimeOutId, setPeopleTimeOutId] = useState<any>();
  const [peopleLocked, setPeopleLocked] = useState(false);
  const handleSearchPeopleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setShowSearchPeople({
      loading: true,
      noResult: false,
    });
    setPageInfo([]);
    ///setSelectedPeaple(null);
    var query = e.currentTarget.value;
    setInputText(e.target.value);
    setSearchTerm(e.target.value);
    if (peopleTimeOutId) clearTimeout(peopleTimeOutId);
    if (query.length > 0) {
      let timeOutId = setTimeout(() => {
        if (query && query.length > 0) {
          if (peopleLocked) return;
          setPeopleLocked(true);
          handleApiPeopleSearch(query);
          setTimeout(() => {
            setPeopleLocked(false);
          }, 2000);
        }
      }, 1000);
      setPeopleTimeOutId(timeOutId);
    }
  };
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  // const [minMentionCount, setMinMentionCount] = useState(
  //   props.data.minMentionCount ? props.data.minMentionCount : 1
  // );

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [filterKeywords, setFilterKeywords] = useState<string[]>([]);
  const [lotteryInfo, setLotteryInfo] = useState<ILotteryInfo>({
    lotteryId: null,
    bannerTitle: "",
    bannerUrl: "",
    boxColor: "",
    boxOpacity: 0,
    filterText: "",
    fontColor: "",
    isFollower: false,
    lotteryType: LotteryType.None,
    minMentionCount: 0,
    postId: 0,
    publishBanner: false,
    publishTerms: false,
    startTime: 0,
    successFollowerMessage: "",
    termsBackgroundUrl: "",
    termsType: 0,
    termsUIInfo: "",
    termsUrl: "",
    turnOffCommenting: false,
    winnerCount: 1,
    includeBanner: true,
    includeTerms: true,
  });

  // Memoized disable condition for better performance
  const isDisabled = useMemo(() => {
    return (
      lotteryInfo.startTime === 0 ||
      !thumbnailUrl ||
      (lotteryInfo.lotteryType === LotteryType.Filter && lotteryInfo.filterText?.length === 0) ||
      (lotteryInfo.isFollower && lotteryInfo.successFollowerMessage.length === 0)
    );
  }, [
    lotteryInfo.startTime,
    thumbnailUrl,
    lotteryInfo.lotteryType,
    lotteryInfo.filterText,
    lotteryInfo.isFollower,
    lotteryInfo.successFollowerMessage,
  ]);

  // const [activeAlternativePage, setActiveAlternativePage] = useState(
  //   props.data.ShouldFollowOtherPage !== null
  // );
  const [inputText, setInputText] = useState("");
  const [pageInfo, setPageInfo] = useState<IPageInfo[]>();
  // const [selectedPages, setSelectedPages] = useState<IPageInfo[] | null>(
  //   props.data.ShouldFollowOtherPage?.map((x) => {
  //     let a: IPageInfo = {
  //       fullName: x.userName,
  //       isPrivate: false,
  //       userName: x.userName,
  //       isVerified: false,
  //       pk: x.pk,
  //       profilePicUrl: x.profileUrl,
  //     };
  //     return a;
  //   }) ?? []
  // );
  const [showSearchPeople, setShowSearchPeople] = useState({
    loading: false,
    noResult: false,
  });
  const [loadinStatus, setLoadinStatus] = useState(true);
  function handleActiveScore() {
    // setSelectedPages([]);
    // setFollowMyPage(false);
    // setActiveAlternativePage(false);
    // setSelectedPages(null);
    // setActiveScore(!aciveScore);
  }

  function handleShowSpeccification(lotterySpecification: lotterySpecificationType) {
    props.showSpecification(lotteryInfo, lotterySpecification);
  }

  async function handleNextStep() {
    console.log("lotteryInfo", lotteryInfo);
    await props.saveScoreLottery(lotteryInfo);
  }
  async function handleGetPostInfo(postInfo: number) {
    try {
      const res = await clientFetchApi<boolean, IShortPostInfo>("/api/post/GetShortPost", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "postId", value: postInfo.toString() }], onUploadProgress: undefined });
      if (res.succeeded) setThumbnailUrl(res.value.thumbnailMediaUrl);
      else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function handleApiPeopleSearch(query: string) {
    try {
      console.log("start searched people ", query);
      var res = await clientFetchApi<boolean, IPageInfo[]>("/api/instagramer/searchPeople", { methodType: MethodType.get, session: session, data: null, queries: [
        { key: "query", value: query },
      ], onUploadProgress: undefined });
      if (res.succeeded && res.value.length > 0) {
        let pages: IPageInfo[] = [];
        for (let i = 0; i < res.value.length; i++) {
          var item = res.value[i];
          let existed = false;
          // if (selectedPages)
          //   for (let j = 0; j < selectedPages?.length; j++) {
          //     if (selectedPages[j].pk == item.pk) {
          //       existed = true;
          //       break;
          //     }
          //   }
          if (item.pk != session?.user.pk && !existed) {
            pages.push(item);
          }
        }
        setPageInfo(pages);
        setShowSearchPeople({ loading: false, noResult: false });
      } else if (res.succeeded && res.value.length === 0) {
        console.log("ddddddddddddddddd", res.value);
        setShowSearchPeople({ loading: false, noResult: true });
      } else if (!res.succeeded) {
        notify(res.info.responseType, NotifType.Warning);
        setShowSearchPeople({ loading: false, noResult: false });
      }
    } catch {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  async function fetchData() {
    if (!session) return;
    if (!RoleAccess(session, PartnerRole.Automatics)) return;
    if (!props.featureInfo) {
      internalNotify(InternalResponseType.NotFeature, NotifType.Warning);
      props.removeMask();
      return;
    }
    const featureIsCheck = checkFeature(FeatureType.Lottery, props.featureInfo);
    if (!featureIsCheck) router.push("/upgrade");
    if (props.showScoreLottery === ShowScoreLotteryType.Back) {
      console.log("props.showScoreLottery", props.lotteryInfo);
      setLotteryInfo(props.lotteryInfo);
      setLoadinStatus(false);
      return;
    }
    if (props.lotteryInfo.lotteryId) handleGetLotteryInfo();
    else {
      setLotteryInfo(props.lotteryInfo);
      setLoadinStatus(false);
    }
  }
  async function handleGetLotteryInfo() {
    try {
      console.log("props.showScoreLottery", props.showScoreLottery);
      const res = await clientFetchApi<boolean, ILotteryInfo>("/api/lottery/GetLotteryInfo", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "id", value: props.lotteryInfo.lotteryId! }], onUploadProgress: undefined });
      if (res.succeeded) {
        setLotteryInfo(res.value);
        await handleGetPostInfo(res.value.postId);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoadinStatus(false);
    }
  }
  useEffect(() => {
    fetchData();
  }, [props.featureInfo]);
  useEffect(() => {
    if (props.shortPost) {
      setThumbnailUrl(props.shortPost.thumbnailMediaUrl);
      setLotteryInfo((prev) => ({ ...prev, postId: props.shortPost!.postId }));
    }
  }, [props.shortPost]);
  useEffect(() => {
    if (props.unixData) {
      setLotteryInfo((prev) => ({ ...prev, startTime: props.unixData! }));
    }
  }, [props.unixData]);

  // Initialize filterKeywords from existing filterText
  useEffect(() => {
    if (lotteryInfo.filterText) {
      const keywords = lotteryInfo.filterText.split(", ").filter((keyword) => keyword.trim().length > 0);
      setFilterKeywords(keywords);
    }
  }, [lotteryInfo.lotteryId]); // Only run when lottery loads

  if (!RoleAccess(session, PartnerRole.Automatics)) return <NotAllowed />;
  return (
    <>
      {loadinStatus && <Loading />}
      {/* {loadinStatus.notBasePackage && <NotBasePackage />} */}
      {/* {loadinStatus.notFeature && <NotFeature />} */}
      {!loadinStatus && (
        <>
          <div className={styles.scoreLotteryLeftContainer}>
            <div className="frameParent">
              <div className="title">{t(LanguageKey.pageTools_WinnerPicker)}</div>
              <b className={styles.step}>{t(LanguageKey.pageLottery_Step)} 1/3</b>
            </div>
            <div className="headerandinput">
              <b className="title">{t(LanguageKey.pageLottery_Specifications)}</b>
              <div className={styles.selection}>
                {thumbnailUrl !== null ? (
                  <div
                    onClick={() => handleShowSpeccification(lotterySpecificationType.SelectPost)}
                    className={styles.select}>
                    <img className={styles.seticon} src={basePictureUrl + thumbnailUrl} />
                  </div>
                ) : (
                  <div
                    onClick={() => handleShowSpeccification(lotterySpecificationType.SelectPost)}
                    className={styles.select}>
                    <img
                      style={{
                        cursor: "pointer",
                        width: "60px",
                        height: "60px",
                      }}
                      title="ℹ️ select post"
                      src="/icon-plus2.svg"
                    />
                    {/* <svg
                          className={styles.seticon}
                          style={{ width: "30%", height: "30%" }}
                          fill="none"
                          viewBox="0 0 66 66"
                        >
                          <path
                            fill="var(--text-h2)"
                            d="M33 4A29 29 0 0 0 4 33a29 29 0 0 0 29 29 29 29 0 0 0 29-29A29 29 0 0 0 33 4m0-4a33 33 0 1 1 0 66 33 33 0 0 1 0-66m-9.8 35.1H31v8q.1 1.9 2 2.2h.1q.9 0 1.4-.6.7-.6.7-1.6v-8h7.7a2.2 2.2 0 0 0 .1-4.3h-7.8v-8c0-1.1-1-2-2.1-2.1a2 2 0 0 0-1.5.6Q31 22 31 23v8h-7.7a2 2 0 0 0-2.1 2q0 1 .6 1.6t1.5.6"
                          />
                        </svg> */}

                    <div className={styles.selecttext}>{t(LanguageKey.pageLottery_SelectaPost)}</div>
                  </div>
                )}

                {lotteryInfo.startTime !== 0 ? (
                  <div
                    className={styles.selected}
                    onClick={() => handleShowSpeccification(lotterySpecificationType.SetDateAndTime)}>
                    <div className={styles.text1}>
                      {new DateObject({
                        date: convertToMilliseconds(lotteryInfo.startTime),
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("DD")}
                    </div>
                    <div className={styles.text2}>
                      {new DateObject({
                        date: convertToMilliseconds(lotteryInfo.startTime),
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("MMMM YYYY")}
                    </div>

                    <div className={styles.text1}>
                      {new DateObject({
                        date: convertToMilliseconds(lotteryInfo.startTime),
                        calendar: initialzedTime().calendar,
                        locale: initialzedTime().locale,
                      }).format("hh:mm A")}
                    </div>
                  </div>
                ) : (
                  <div
                    className={styles.select}
                    onClick={() => handleShowSpeccification(lotterySpecificationType.SetDateAndTime)}>
                    <img
                      style={{
                        cursor: "pointer",
                        width: "60px",
                        height: "60px",
                      }}
                      title="ℹ️ select time"
                      src="/calendar-select.svg"
                    />
                    {/* <svg
                          fill="none"
                          viewBox="0 0 64 64"
                          className={styles.seticon}
                          style={{ width: "30%", height: "30%" }}>
                          <path
                            fill="var(--text-h2)"
                            d="M60.6 10.3c-2.8-3.1-6.7-5-10.9-5h-1V2.7a2.2 2.2 0 0 0-4.5 0v2.6h-10V2.7c0-1.2-1-2.2-2.2-2.2q-2 .2-2.2 2.2v2.6H18.5V2.8a2.2 2.2 0 0 0-4.4 0v2.7h-.6q-6.1.4-10.1 5A14 14 0 0 0 0 19.4V46c0 9.6 7.8 17.3 17.3 17.3h29.3C56.2 63.3 64 55.5 64 46V19.5q0-5.2-3.4-9.2M60.1 46c0 7.5-6 13.5-13.5 13.5H17.3A13.5 13.5 0 0 1 4 46V23.6h56zM4 19.5A10 10 0 0 1 14 9.2V13a2.2 2.2 0 0 0 4.4 0V9.2h11.2V13a2.2 2.2 0 0 0 4.4 0V9.2h10.1V13a2.2 2.2 0 0 0 4.4 0V9.2h1.2c5.7 0 10.3 4.6 10.3 10.3zm18.2 23.2H30v8q.1 1.8 2 2.1h.1q.9 0 1.4-.5.7-.7.7-1.6v-8h7.7a2.2 2.2 0 0 0 .1-4.3h-7.8v-8c0-1.2-1-2.1-2.1-2.1a2 2 0 0 0-1.5.6q-.6.7-.6 1.5v8h-7.7c-1.2 0-2.1 1-2.1 2.1q0 .9.6 1.6.7.6 1.5.6"
                          />
                        </svg> */}

                    <div className={styles.selecttext}>{t(LanguageKey.pageLottery_SetDateTime)}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="headerandinput">
              <div className={`frameParent ${!session?.user.commentPermission && "fadeDiv"}`}>
                <div className="title">{t(LanguageKey.pageToolspopup_TurnoffCommenting)}</div>
                <div>
                  <ToggleCheckBoxButton
                    handleToggle={(e) => {
                      if (!session?.user.commentPermission) return;
                      setLotteryInfo((prev) => ({
                        ...prev,
                        turnOffCommenting: e.target.checked,
                      }));
                    }}
                    checked={lotteryInfo.turnOffCommenting}
                    name=""
                    title={""}
                    role={""}
                  />
                </div>
              </div>
              <div className="explain">{t(LanguageKey.pageToolspopup_TurnoffCommentingexplainforlottery)}</div>
            </div>
            <div className="headerandinput">
              <b className="title">{t(LanguageKey.pageLottery_NumberofWinners)}</b>
              <div className={styles.options}>
                <div className={styles.number}>
                  <RadioButton
                    name="winnerCount"
                    id={"1"}
                    textlabel="1"
                    checked={1 === lotteryInfo.winnerCount}
                    handleOptionChanged={() =>
                      setLotteryInfo((prev) => ({
                        ...prev,
                        winnerCount: 1,
                      }))
                    }
                  />
                </div>
                <div className={styles.number}>
                  <RadioButton
                    name="winnerCount"
                    id={"2"}
                    textlabel={"2"}
                    checked={2 === lotteryInfo.winnerCount}
                    handleOptionChanged={() =>
                      setLotteryInfo((prev) => ({
                        ...prev,
                        winnerCount: 2,
                      }))
                    }
                  />
                </div>
                <div className={styles.number}>
                  <RadioButton
                    name="winnerCount"
                    id={"3"}
                    textlabel={"3"}
                    checked={3 === lotteryInfo.winnerCount}
                    handleOptionChanged={() =>
                      setLotteryInfo((prev) => ({
                        ...prev,
                        winnerCount: 3,
                      }))
                    }
                  />
                </div>
                <div className={styles.number}>
                  <RadioButton
                    name="winnerCount"
                    id={"4"}
                    textlabel={"4"}
                    checked={4 === lotteryInfo.winnerCount}
                    handleOptionChanged={() =>
                      setLotteryInfo((prev) => ({
                        ...prev,
                        winnerCount: 4,
                      }))
                    }
                  />
                </div>
                <div className={styles.number}>
                  <RadioButton
                    name="winnerCount"
                    id={"5"}
                    textlabel={"5"}
                    checked={5 === lotteryInfo.winnerCount}
                    handleOptionChanged={() =>
                      setLotteryInfo((prev) => ({
                        ...prev,
                        winnerCount: 5,
                      }))
                    }
                  />
                </div>
                <div className={styles.number}>
                  <RadioButton
                    name="winnerCount"
                    id={"6"}
                    textlabel={"6"}
                    checked={6 === lotteryInfo.winnerCount}
                    handleOptionChanged={() =>
                      setLotteryInfo((prev) => ({
                        ...prev,
                        winnerCount: 6,
                      }))
                    }
                  />
                </div>
                <div className={styles.number}>
                  <RadioButton
                    name="winnerCount"
                    id={"7"}
                    textlabel={"7"}
                    checked={7 === lotteryInfo.winnerCount}
                    handleOptionChanged={() =>
                      setLotteryInfo((prev) => ({
                        ...prev,
                        winnerCount: 7,
                      }))
                    }
                  />
                </div>
                <div className={styles.number}>
                  <RadioButton
                    name="winnerCount"
                    id={"8"}
                    textlabel={"8"}
                    checked={8 === lotteryInfo.winnerCount}
                    handleOptionChanged={() =>
                      setLotteryInfo((prev) => ({
                        ...prev,
                        winnerCount: 8,
                      }))
                    }
                  />
                </div>
                <div className={styles.number}>
                  <RadioButton
                    name="winnerCount"
                    id={"9"}
                    textlabel={"9"}
                    checked={9 === lotteryInfo.winnerCount}
                    handleOptionChanged={() =>
                      setLotteryInfo((prev) => ({
                        ...prev,
                        winnerCount: 9,
                      }))
                    }
                  />
                </div>
                <div className={styles.number}>
                  <RadioButton
                    name="winnerCount"
                    id={"10"}
                    textlabel={"10"}
                    checked={10 === lotteryInfo.winnerCount}
                    handleOptionChanged={() =>
                      setLotteryInfo((prev) => ({
                        ...prev,
                        winnerCount: 10,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.scoreLotteryRightContainer}>
            <div className="headerandinput">
              <div className="frameParent">
                <div className="title">{t(LanguageKey.pageLottery_SetScoreForLottery)}</div>
                <ToggleCheckBoxButton
                  handleToggle={(e) => {
                    setLotteryInfo((prev) => ({
                      ...prev,
                      lotteryType: e.target.checked ? LotteryType.Score : LotteryType.None,
                    }));
                  }}
                  checked={lotteryInfo.lotteryType === LotteryType.Score}
                  name="scoreToggle"
                  title="Enable Score Mode"
                  role=""
                />
              </div>
              <div className="explain">{t(LanguageKey.pageLottery_SetScoreForLotteryexplain)}</div>
              <div className={`frameParent ${lotteryInfo.lotteryType !== LotteryType.Score ? "fadeDiv" : ""}`}>
                <b className="title2">{t(LanguageKey.pageLottery_MinimumMentionexplain)}</b>
                <IncrementStepper
                  data={lotteryInfo.minMentionCount}
                  increment={() =>
                    setLotteryInfo((prev) => ({
                      ...prev,
                      minMentionCount: prev.minMentionCount + 1,
                    }))
                  }
                  decrement={() =>
                    setLotteryInfo((prev) => ({
                      ...prev,
                      minMentionCount: prev.minMentionCount > 1 ? prev.minMentionCount - 1 : 0,
                    }))
                  }
                  id={""}
                />
              </div>
            </div>
            <div className="headerandinput">
              <div className="frameParent">
                <div className="title">{t(LanguageKey.specifickeywords)}</div>
                <ToggleCheckBoxButton
                  handleToggle={(e) => {
                    setLotteryInfo((prev) => ({
                      ...prev,
                      lotteryType: e.target.checked ? LotteryType.Filter : LotteryType.None,
                    }));
                  }}
                  checked={lotteryInfo.lotteryType === LotteryType.Filter}
                  name="Filter"
                  title="text Filter"
                  role=""
                />
              </div>
              <div className="explain">{t(LanguageKey.pageLottery_specifickeywordexplain)}</div>
              <div className="frameParent" style={{ gap: "10px" }}>
                <InputText
                  className={"textinputbox"}
                  disabled={lotteryInfo.lotteryType !== LotteryType.Filter}
                  handleInputChange={(e) => {
                    setLotteryInfo((prev) => ({
                      ...prev,
                      filterText: e.target.value,
                    }));
                  }}
                  value={lotteryInfo.filterText || ""}
                  placeHolder={t(LanguageKey.pageToolspopup_typehere)}
                />
              </div>
            </div>
            <div className={`headerandinput ${!session?.user.messagePermission && "fadeDiv"}`}>
              <div className="frameParent">
                <div className="title">{t(LanguageKey.pageLottery_FollowmyPage)}</div>
                <ToggleCheckBoxButton
                  handleToggle={(e) => {
                    if (!session?.user.messagePermission) return;
                    setLotteryInfo((prev) => ({
                      ...prev,
                      isFollower: e.target.checked,
                    }));
                  }}
                  checked={lotteryInfo.isFollower}
                  name=""
                  title={t(LanguageKey.pageLottery_FollowmyPage)}
                  role=""
                />
              </div>

              <div className="explain">{t(LanguageKey.pageLottery_FollowmyPageexplain)}</div>
              <InputText
                className={"textinputbox"}
                disabled={!lotteryInfo.isFollower}
                handleInputChange={(e) =>
                  setLotteryInfo((prev) => ({
                    ...prev,
                    successFollowerMessage: e.target.value,
                  }))
                }
                value={lotteryInfo.successFollowerMessage || ""}
              />
            </div>

            <div className="ButtonContainer">
              <button onClick={props.removeMask} className="cancelButton">
                {t(LanguageKey.cancel)}
              </button>
              <button
                disabled={isDisabled}
                onClick={handleNextStep}
                className={isDisabled ? "disableButton" : "saveButton"}>
                {t(LanguageKey.next)}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ScoreLottery;
