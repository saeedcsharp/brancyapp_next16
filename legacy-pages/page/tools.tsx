import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import SetTimeAndDate from "saeed/components/dateAndTime/setTimeAndDate";
import Modal from "saeed/components/design/modal";
import {
  InternalResponseType,
  NotifType,
  ResponseType,
  internalNotify,
  notify,
} from "saeed/components/notifications/notificationBox";
import NotAllowed from "saeed/components/notOk/notAllowed";
import FontSelector from "saeed/components/page/tools/customFont/customFont";
import Hashtags from "saeed/components/page/tools/hashtaglist/hashtags";
import DeleteHashtagList from "saeed/components/page/tools/popups/hashtags/deleteHashtaglist";
import NewHashtagList from "saeed/components/page/tools/popups/hashtags/newHashtagList";
import NewPageAnalyzer from "saeed/components/page/tools/popups/hashtags/newPageAnalyzer";
import NewPictureAnalyzerList from "saeed/components/page/tools/popups/hashtags/newPictureAnalyzerList";
import UpdateHashtagList from "saeed/components/page/tools/popups/hashtags/updateHashtagList";
import DeleteLottery from "saeed/components/page/tools/popups/lottery/deleteLottery";
import LotteryHistory from "saeed/components/page/tools/popups/lottery/lotteryHistory";
import LotteryRunning from "saeed/components/page/tools/popups/lottery/lotteryRunning";
import ScoreLottery from "saeed/components/page/tools/popups/lottery/scoreLottery";
import SelectPost from "saeed/components/page/tools/popups/lottery/selectPost";
import ShareTermsAndCondition from "saeed/components/page/tools/popups/lottery/shareWinnerPickerTerms";
import TermsAndConditionWinnerPicker from "saeed/components/page/tools/popups/lottery/termsAndConditionWinnerPicker";
import WinnerAnnouncementAndBanner from "saeed/components/page/tools/popups/lottery/winnerAnnouncementAndBanner";
import WinnersList from "saeed/components/page/tools/popups/lottery/winnersList";
import TrendHashtags from "saeed/components/page/tools/trendhashtag/trendHashtags";
import WinnerPicker from "saeed/components/page/tools/winnerpicker/winnerPicker";
import { changePositionToFixed, changePositionToRelative } from "saeed/helper/changeMarketAdsStyle";
import { checkRemainingTimeFeature } from "saeed/helper/checkFeature";
import { LoginStatus, RoleAccess, packageStatus } from "saeed/helper/loadingStatus";
import { convertToMilliseconds, convertToSeconds } from "saeed/helper/manageTimer";
import { LanguageKey } from "saeed/i18n";
import { PartnerRole } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { GetServerResult, MethodType, UploadFile } from "saeed/models/IResult";
import {
  CreateHashtagListItem,
  FollowerLotteryType,
  HashtagListItem,
  IAutoInterAction,
  ICreateFollowerLottery,
  ICreateTermsAndConditionInfo,
  IFollowerLottery,
  IFullLottery,
  IGetAnnouncementAndBannerInfo,
  IGetTermsAndConditionInfo,
  IHashtag,
  ILotteryInfo,
  IShareremainingTime,
  IShortLottery,
  IShortPostInfo,
  IUnFollowAllFollowing_UpdateCondotion,
  LotteryStatus,
  LotteryType,
  ShowScoreLotteryType,
  TermsType,
  lotterySpecificationType,
} from "saeed/models/page/tools/tools";
import { FeatureType, IFeatureInfo } from "saeed/models/psg/psg";
function addHashPrefixOrSuffix(list: string[]) {
  const result = [];

  for (const str of list) {
    if (/[\u0600-\u06FF]/.test(str)) {
      // اگر رشته به زبان فارسی باشد، "#" را در انتهای رشته اضافه کنید
      result.push(str + "#");
    } else {
      // در غیر اینصورت "#" را در ابتدای رشته اضافه کنید
      result.push("#" + str);
    }
  }

  return result;
}
const Tools = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const isFetchingRef = useRef(false);
  const [hashtagData, setHashtagData] = useState<IHashtag | null>(null);
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [shortLotteryInfo, setshortLotteryInfo] = useState<IShortLottery>({
    failStatus: null,
    id: "",
    instagramerId: -1,
    postId: 0,
    startTime: 0,
    status: LotteryStatus.Upcoming,
    statusTime: 0,
    thumbnailMediaUrl: "",
    winnerCount: 0,
  });
  const [selectedWinnerPickerStatusType, setSelectedWinnerPickerStatusType] = useState<LotteryStatus>(
    LotteryStatus.Active
  );
  const [showHashatgSetting, setshowHashatgSetting] = useState("");
  const [showPictureAnalysisSetting, setshowPictureAnalysisSetting] = useState("");
  const [showPageAnalysisSetting, setshowPageAnalysisSetting] = useState("");
  const [showNewList, setShowNewList] = useState(false);
  const [showUpdateList, setShowUpdateList] = useState(false);
  const [showDeleteHashtagModal, setShowDeleteHashtagModal] = useState(false);
  const [showEditHashtagModal, setShowEditHashtagModal] = useState(false);
  const [selectedHashtagList, setSelectedHashtagList] = useState<{
    listId: number;
    hashtags: string[];
    hashtagTitle: string;
  } | null>(null);
  const { t } = useTranslation();
  const [showNewPictureAnalyzer, setShowNewPictureAnalyzer] = useState(false);
  const [showNewPageAnalyzer, setShowNewPageAnalyzer] = useState(false);
  const [showFollowerRequest, setShowFollowerRequest] = useState(false);
  const [showLikeAllComments, setShowLikeAllComments] = useState(false);
  const [showLikeFollowerPosts, setShowLikeFollowerPosts] = useState(false);
  const [showUnfollowAllFollowing, setShowUnfollowAllFollowing] = useState(false);
  const [showScoreLottery, setShowScoreLottery] = useState<ShowScoreLotteryType>(ShowScoreLotteryType.None);
  const [showFollowersLottery, setShowFollowersLottery] = useState(false);
  const [preSaveHashtagList, setPreSaveHashtagList] = useState<string[]>([]);
  const [showDataUpdate, setDataUpdate] = useState<{
    listId: number;
    hashtags: string[];
    hashtagTitle: string;
  }>({ listId: 0, hashtags: [], hashtagTitle: "" });
  const [showTermsAndConditionWinnerPicker, setShowTermsAndConditionWinnerPicker] = useState(false);
  const [showWinnerAnnounceAndBanner, setshowWinnerAnnounceAndBanner] = useState(false);
  const [showSetTimeAndDate, setshowSetTimeAndDate] = useState(false);
  const [showLotteryRunning, setShowLotteryRunning] = useState(false);
  const [showShareTermsAndCondition, setShowShareTermsAndCondition] = useState(false);
  const [showRemainingTime, setshowRemainingTime] = useState(false);
  const [showSelectPost, setShowSelectPost] = useState(false);
  const [showWinnersList, setShowWinnersList] = useState(false);
  const [showLotteryHistory, setShowLotteryHistory] = useState(false);
  const [autointeraction, setAutointeraction] = useState<IAutoInterAction>({
    followerRequest: 0,
    likeAllComments: 0,
    likeFollowerPosts: 0,
    unfollowAllFollowing: 0,
    unfollowAllUnfollowers: 0,
  });
  const [termsAndConditionInfo, setTermsAndConditionInfo] = useState<IGetTermsAndConditionInfo>({
    background: [],
    backgroundType: TermsType.Linear,
    isActive: true,
    terms: "",
  });
  const [lastTermsUi, setLastTermsUi] = useState<IGetTermsAndConditionInfo | null>(null);

  const [createTermsAndCondition, setCreateTermsAndCondition] = useState<ICreateTermsAndConditionInfo | null>(null);
  const [winnerAnnouncementAndBannerInfo, setWinnerAnnouncementAndBannerInfo] = useState<IGetAnnouncementAndBannerInfo>(
    {
      addToPostChecked: false,
      addToStoryChecked: false,
      banners: [],
      boxColor: { rgb: { b: 255, g: 255, r: 255 } },
      boxOpacity: 100,
      customBanner: { bannerId: 1, bannerSrc: "1" },
      fontColor: { hex: "var(--color-ffffff)" },
      isActive: true,
      textArea: "",
    }
  );
  const [lotteryInfo, setlotteryInfo] = useState<ILotteryInfo>({
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
  const [shortPostInfo, setShortPostInfo] = useState<IShortPostInfo | null>(null);
  const [followerLottery, setFollowerLottery] = useState<IFollowerLottery>({
    followerLotteryType: FollowerLotteryType.Randomly,
    winnerCount: 0,
  });
  const [createFollowerLottery, setCreateFollowerLottery] = useState<ICreateFollowerLottery>({
    followerLotteryType: FollowerLotteryType.Randomly,
    winnerCount: 0,
    announcementAndBanner: null,
  });
  const [shareTermsInfo, setShareTermsInfo] = useState({
    backgroundUrl: "",
    lotteryId: "0",
  });
  const [shareRemainingTimeInfo, setShareRemainingTimeInfo] = useState<IShareremainingTime>({
    backgroundUrl: "",
    lotteryId: 0,
    timeUnix: 0,
    boxColor: "",
    boxOpacity: 0,
    textColor: "",
    textOpacity: 0,
  });
  const [lotteryType, setLotteryType] = useState<LotteryType>(LotteryType.score);
  // const [fullLottery, setFullLottery] = useState<IFullLottery>({
  //   addToStory: false,
  //   bannerColor: "",
  //   bannerUrl: "",
  //   caption: "",
  //   errorMessage: "",
  //   fontColor: "",
  //   instagramerId: 100,
  //   lotteryId: -100,
  //   lotteryStatus: 0,
  //   lotteryType: LotteryType.Filter,
  //   sponsors: [],
  //   timeUnix: 100,
  //   winnerCount: 10,
  //   winners: [],
  //   termsBanner: null,
  // });
  const [isNewLottery, setIsNewLottery] = useState(false);
  const [lotteryId, setLotteryId] = useState("");

  // Authentication effect
  useEffect(() => {
    if (session && !LoginStatus(session)) router.push("/");
    if (session && !packageStatus(session)) router.push("/upgrade");
  }, [session, router]);

  // Data loading protection
  useEffect(() => {
    if (!isDataLoaded && !isFetchingRef.current) {
      // Initial state setup if needed
    }
  }, [isDataLoaded]);

  const unshowPopups = () => {
    setshowHashatgSetting("");
    setshowPageAnalysisSetting("");
    setshowPictureAnalysisSetting("");
  };
  const [unixDate, setUnixDate] = useState<number | null>(null);
  const [loadingSaveTerms, setLoadingSaveTerms] = useState(false);
  const [loadingStartLottery, setLoadingStartLottery] = useState(false);
  const [showDeleteLottery, setShowDeleteLottery] = useState(false);
  const [showRemoveUnFollowing, setShowRemoveUnFollowing] = useState(false);
  const [removeFollowing, setRemoveFollowing] = useState<IUnFollowAllFollowing_UpdateCondotion>({
    isPaused: false,
    waitSeconds: 0,
  });
  const handleHashtagShowSetting = (e: MouseEvent) => {
    e.stopPropagation();
    if (showHashatgSetting === e.currentTarget.id) {
      setshowHashatgSetting("");
      return;
    }
    setshowHashatgSetting(e.currentTarget.id);
    setshowPageAnalysisSetting("");
    setshowPictureAnalysisSetting("");

    // setServerHahstagListId(e.currentTarget.id);
  };
  const handlePageAnalysisShowSetting = (e: MouseEvent) => {
    e.stopPropagation();
    if (showPageAnalysisSetting === e.currentTarget.id) {
      setshowPageAnalysisSetting("");
      return;
    }
    setshowHashatgSetting("");
    setshowPictureAnalysisSetting("");
    setshowPageAnalysisSetting(e.currentTarget.id);

    // setServerHahstagListId(e.currentTarget.id);
  };
  const handlePictureAnalysisShowSetting = (e: MouseEvent) => {
    e.stopPropagation();
    if (showPictureAnalysisSetting === e.currentTarget.id) {
      setshowPictureAnalysisSetting("");
      return;
    }
    setshowHashatgSetting("");
    setshowPictureAnalysisSetting(e.currentTarget.id);
    setshowPageAnalysisSetting("");

    // setServerHahstagListId(e.currentTarget.id);
  };
  const handleDisplayNewList = (e: MouseEvent) => {
    setShowNewList(true);
  };

  const handleCopyHashtags = useCallback((hashtags: string[]) => {
    const hashtagsText = hashtags.map((tag) => `#${tag}`).join(" ");
    navigator.clipboard
      .writeText(hashtagsText)
      .then(() => {
        internalNotify(InternalResponseType.copy, NotifType.Success);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  }, []);

  const handleDeleteHashtagClick = useCallback((listId: number, listName: string, hashtags: string[]) => {
    setSelectedHashtagList({ listId, hashtags, hashtagTitle: listName });
    setShowDeleteHashtagModal(true);
  }, []);

  const handleEditHashtagClick = useCallback((listId: number, listName: string, hashtags: string[]) => {
    setSelectedHashtagList({ listId, hashtags, hashtagTitle: listName });
    setShowEditHashtagModal(true);
  }, []);

  const confirmDeleteHashtag = useCallback(async () => {
    if (!selectedHashtagList) return;
    try {
      const res = await GetServerResult<string, IHashtag>(
        MethodType.get,
        session,
        "Instagramer/hashtag/DeleteHashtagList",
        null,
        [{ key: "hashtagListId", value: selectedHashtagList.listId.toString() }]
      );
      if (res.succeeded) {
        setHashtagData(res.value);
        internalNotify(InternalResponseType.Ok, NotifType.Success);
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      internalNotify(InternalResponseType.Network, NotifType.Error);
    } finally {
      setShowDeleteHashtagModal(false);
      setSelectedHashtagList(null);
    }
  }, [selectedHashtagList, session]);

  const closeDeleteHashtagModal = useCallback(() => {
    setShowDeleteHashtagModal(false);
    setSelectedHashtagList(null);
  }, []);

  const closeEditHashtagModal = useCallback(() => {
    setShowEditHashtagModal(false);
    setSelectedHashtagList(null);
  }, []);

  const removeMask = () => {
    console.log("hello from mask");
    setshowPictureAnalysisSetting("");
    setshowPageAnalysisSetting("");
    setShowNewList(false);
    setshowHashatgSetting("");
    setshowPageAnalysisSetting("");
    setShowUpdateList(false);
    setShowNewPictureAnalyzer(false);
    setShowNewPageAnalyzer(false);
    setShowLikeFollowerPosts(false);
    setShowLikeAllComments(false);
    setShowUnfollowAllFollowing(false);
    setShowFollowerRequest(false);
    setShowTermsAndConditionWinnerPicker(false);
    setshowWinnerAnnounceAndBanner(false);
    setshowSetTimeAndDate(false);
    setShowLotteryRunning(false);
    setShowShareTermsAndCondition(false);
    setshowRemainingTime(false);
    setShowSelectPost(false);
    setShowScoreLottery(ShowScoreLotteryType.None);
    setShowFollowersLottery(false);
    setShowWinnersList(false);
    setShowLotteryHistory(false);
    setShowDeleteLottery(false);
    setShowRemoveUnFollowing(false);
    setShowDeleteHashtagModal(false);
    setShowEditHashtagModal(false);
    setSelectedHashtagList(null);
    setPreSaveHashtagList([]);
    changePositionToRelative();
  };
  const handleSaveHashtagList = async (hashtags: string[], hashtagsTitle: string) => {
    let hashtagListItem: CreateHashtagListItem = {
      hashTags: hashtags,
      listName: hashtagsTitle,
    };
    console.log("hashtagListItem", hashtagListItem);
    try {
      var res = await GetServerResult<CreateHashtagListItem, boolean>(
        MethodType.post,
        session,
        "Instagramer/hashtag/createHashtagList",
        hashtagListItem,
        []
      );
      if (res.succeeded) {
        GetHashtagList();
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      internalNotify(InternalResponseType.Network, NotifType.Error);
    } finally {
      removeMask();
    }
  };
  const handleUpdateHashtagList = async (hashtags: string[], listName: string, listId: number) => {
    let obj: HashtagListItem = {
      listId: listId,
      listName: listName,
      hashtags: hashtags,
    };
    console.log("HashtagListItem", obj);
    try {
      var res = await GetServerResult<HashtagListItem, boolean>(
        MethodType.post,
        session,
        "Instagramer/hashtag/UpdateHashtagList",
        obj
      );
      if (res.succeeded) {
        setHashtagData((prev) => ({
          ...prev!,
          hashtagList: prev!.hashtagList!.map((x) =>
            x.listId !== obj.listId ? x : { ...x, hashtags: obj.hashtags, listName: obj.listName }
          ),
        }));
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      internalNotify(InternalResponseType.Network, NotifType.Error);
    }

    removeMask();
  };
  const handleClickOnIcon = async (id: string) => {
    console.log("showSetting", showHashatgSetting);
    if (hashtagData !== null) {
      var hashtag = hashtagData.hashtagList?.find((e) => e.listId.toString() == showHashatgSetting);
      console.log("Hashtag On Update", hashtag);
      if (hashtag !== undefined) {
        {
          switch (id) {
            case "Edit List":
              {
                setDataUpdate({
                  hashtags: hashtag.hashtags,
                  hashtagTitle: hashtag.listName,
                  listId: hashtag.listId,
                });
                setShowUpdateList(true);
              }
              return;
            case "Copy All":
              {
                var list = addHashPrefixOrSuffix(hashtag?.hashtags);
                let str = list.length > 0 ? list[0] : "";
                for (let i = 1; i < list.length; i++) str += " " + list[i];
                navigator.clipboard.writeText(str);
              }
              return;
            case "Delete List":
              {
                var res = await GetServerResult<string, IHashtag>(
                  MethodType.get,
                  session,
                  "Instagramer/hashtag/DeleteHashtagList",
                  null,
                  [{ key: "hashtagListId", value: hashtag.listId.toString() }]
                );
                if (res.succeeded) {
                  setHashtagData(res.value);
                }
                removeMask();
              }
              return;
          }
        }
      }
    }
    removeMask();
  };
  const handleClickOnIconForPictureAnalyzer = async (id: string) => {
    var hashtag = hashtagData?.lastPictureAnalysisHashtags?.find((e) => e.id.toString() == showPictureAnalysisSetting);
    if (!hashtag) return;
    switch (id) {
      case "Copy All":
        {
          var list = addHashPrefixOrSuffix(hashtag.hashtags);
          let str = list.length > 0 ? list[0] : "";
          for (let i = 1; i < list.length; i++) str += " " + list[i];
          navigator.clipboard.writeText(str);
          // setShowNewPictureAnalyzer(true);
          // serverHahstagListId === "2" && setShowNewPageAnalyzer(true);
        }
        return;
      case "Delete List":
        {
          let instagramer = session?.user.instagramerIds[session.user.currentIndex];
          var res = await GetServerResult<string, IHashtag>(
            MethodType.get,
            session,
            "Instagramer" + instagramer + "/hashtag/HidePictureAnalysisHashtag",
            null,
            [{ key: "id", value: hashtag.id.toString() }]
          );
          if (res.succeeded) {
            setHashtagData((prev) => ({
              ...prev!,
              lastPictureAnalysisHashtags: prev!.lastPictureAnalysisHashtags.filter((x) => x.id !== hashtag?.id),
            }));
          }
          removeMask();
        }
        return;
    }
  };
  const handleClickOnIconForPageAnalyzer = async (id: string) => {
    var hashtag = hashtagData?.lastPageAnalysisHashtags?.find((e) => e.id.toString() == showPageAnalysisSetting);
    if (!hashtag) return;
    removeMask();
    switch (id) {
      case "Copy All":
        {
          var list = addHashPrefixOrSuffix(hashtag.hashtags);
          let str = list.length > 0 ? list[0] : "";
          for (let i = 1; i < list.length; i++) str += " " + list[i];
          navigator.clipboard.writeText(str);
        }
        return;
      case "Delete List":
        {
          let instagramer = session?.user.instagramerIds[session.user.currentIndex];
          var res = await GetServerResult<string, IHashtag>(
            MethodType.get,
            session,
            "Instagramer" + instagramer + "/hashtag/HidePageAnalysisHashtag",
            null,
            [{ key: "id", value: hashtag.id.toString() }]
          );
          if (res.succeeded) {
            setHashtagData((prev) => ({
              ...prev!,
              lastPageAnalysisHashtags: prev!.lastPageAnalysisHashtags.filter((x) => x.id !== hashtag?.id),
            }));
          }
          removeMask();
        }
        return;
    }
  };
  const saveHashtagPageAnalyzer = () => {
    GetHashtagList();
    removeMask();
  };
  const saveHashtagPictureAnalyzer = () => {
    GetHashtagList();
    removeMask();
  };
  const handleShowAutoInteractionPopup = (e: MouseEvent) => {
    switch (e.currentTarget.id) {
      case "Follow requests":
        {
          setShowFollowerRequest(true);
        }
        return;
      case "Like all comments":
        {
          setShowLikeAllComments(true);
        }
        return;
      case "Like follower posts":
        {
          setShowLikeFollowerPosts(true);
        }
        return;
      case "Unfollow all followings":
        {
          setShowUnfollowAllFollowing(true);
        }
        return;
    }
  };
  const handleShowWinnerPickerPopup = async (e: MouseEvent) => {
    if (!session?.user.commentPermission) {
      internalNotify(InternalResponseType.CommentDisabled, NotifType.Warning);
      return;
    }
    switch (e.currentTarget.id) {
      case "score":
        setlotteryInfo({
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
        setShortPostInfo(null);
        setUnixDate(null);
        setShowScoreLottery(ShowScoreLotteryType.Forward);
        return;
      // case "followers":
      //   {
      //     setShowFollowersLottery(true);
      //   }
      //return;
      case "result":
        {
          setShowLotteryHistory(true);
        }
        return;
    }
  };
  const handleShowSpecification = (lottery: ILotteryInfo, lotterySpecification: lotterySpecificationType) => {
    setlotteryInfo(lottery);
    setShowScoreLottery(ShowScoreLotteryType.None);
    changePositionToFixed();
    if (lotterySpecification === lotterySpecificationType.SetDateAndTime) {
      // setUnixDate(unixData);
      setshowSetTimeAndDate(true);
    } else if (lotterySpecification === lotterySpecificationType.SelectPost) setShowSelectPost(true);
  };
  const saveTermsAndCondition = async (
    terms: ILotteryInfo,
    termsBackgroundFile: File | null,
    termsUrlFile: File | null
  ) => {
    setBackgroundFile(termsBackgroundFile);
    setTermsUrlFile(termsUrlFile);
    setlotteryInfo((prev) => ({
      ...prev,
      termsUrl: terms.termsUrl,
      termsUIInfo: terms.termsUIInfo,
      termsType: terms.termsType,
      includeTerms: terms.includeTerms,
      publishTerms: terms.publishTerms,
    }));
    setShowTermsAndConditionWinnerPicker(false);
    setshowWinnerAnnounceAndBanner(true);
  };
  const saveDateAndTime = (date: string | undefined) => {
    if (date !== undefined) {
      let dateInt = parseInt(date);
      if (!featureInfo) return;
      const checkRemainingTime = checkRemainingTimeFeature(FeatureType.Lottery, dateInt, featureInfo);
      if (!checkRemainingTime) internalNotify(InternalResponseType.ExceedBasefeatureTime, NotifType.Warning);
      setlotteryInfo((prev) => ({ ...prev!, startTime: dateInt }));
      setUnixDate(dateInt);
      backToScoreWinnerPicker();
    }
  };
  const saveSelectPost = (post: IShortPostInfo) => {
    console.log("IShortPostInfo", post);
    setlotteryInfo((prev) => ({ ...prev!, postId: post.postId }));
    setShortPostInfo(post);
    backToScoreWinnerPicker();
  };
  const [termsBackgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [termsUrlFile, setTermsUrlFile] = useState<File | null>(null);
  const saveScoreLottery = async (score: ILotteryInfo) => {
    console.log("ILotteryInfo in score lottery", score);
    setlotteryInfo(score);
    setShowScoreLottery(ShowScoreLotteryType.None);
    setShowTermsAndConditionWinnerPicker(true);
  };
  // const saveFollowerLottery = async (followersLottery: IFollowerLottery) => {
  //   var createLottery = createFollowerLottery;
  //   createLottery.followerLotteryType = followersLottery.followerLotteryType;
  //   createLottery.winnerCount = followersLottery.winnerCount;
  //   setFollowerLottery(followersLottery);
  //   setCreateFollowerLottery(createLottery);
  //   setLotteryType(LotteryType.followers);
  //   setShowFollowersLottery(false);
  //   if (winnerAnnouncementAndBannerInfo.banners.length == 0) {
  //     console.log("hello from get banner");
  //     let res = await GetServerResult<string, IGetAnnouncementAndBannerInfo>(
  //       MethodType.get,
  //       session,
  //       "Instagramer" + "/lottery/GetLotteryBanners"
  //     );
  //     if (res.succeeded) setWinnerAnnouncementAndBannerInfo(res.value);
  //   }
  //   setshowWinnerAnnounceAndBanner(true);
  // };
  const backToScoreWinnerPicker = () => {
    setShowTermsAndConditionWinnerPicker(false);
    setshowSetTimeAndDate(false);
    setShowSelectPost(false);
    setShowScoreLottery(ShowScoreLotteryType.Back);
  };
  const backToTermsAndCondition = () => {
    setshowWinnerAnnounceAndBanner(false);
    if (lotteryType === LotteryType.score) setShowTermsAndConditionWinnerPicker(true);
    else if (lotteryType === LotteryType.followers) setShowFollowersLottery(true);
  };
  const handleViewAndDetails = async (lotteryId: string) => {
    setlotteryInfo((prev) => ({ ...prev, lotteryId: lotteryId }));
    setShowLotteryRunning(false);
    setShowScoreLottery(ShowScoreLotteryType.Forward);
  };
  const saveWinnerPickerToServer = async (announcementAndBanner: ILotteryInfo) => {
    console.log("ILotteryInfo in announcementAndBanner", announcementAndBanner);
    setLoadingStartLottery(true);
    let termsUrlId: string | null = null;
    let termsBackGroundId: string | null = null;
    if (termsUrlFile) {
      const uploadResult = await UploadFile(session, termsUrlFile);
      termsUrlId = uploadResult.fileName ?? null;
    }
    if (termsBackgroundFile) {
      const uploadBackgroundResult = await UploadFile(session, termsBackgroundFile);
      termsBackGroundId = uploadBackgroundResult.fileName ?? null;
    }
    setlotteryInfo((prev) => ({
      ...prev,
      bannerTitle: announcementAndBanner.bannerTitle,
      bannerUrl: announcementAndBanner.bannerUrl,
      boxColor: announcementAndBanner.boxColor,
      boxOpacity: announcementAndBanner.boxOpacity,
      fontColor: announcementAndBanner.fontColor,
      publishBanner: announcementAndBanner.publishBanner,
      includeBanner: announcementAndBanner.includeBanner,
    }));
    const cerateLottery: ILotteryInfo = {
      bannerTitle: announcementAndBanner.bannerTitle,
      bannerUrl: announcementAndBanner.bannerUrl,
      boxColor: announcementAndBanner.boxColor,
      boxOpacity: announcementAndBanner.boxOpacity,
      fontColor: announcementAndBanner.fontColor,
      publishBanner: announcementAndBanner.publishBanner,
      includeBanner: announcementAndBanner.includeBanner,
      startTime: convertToSeconds(lotteryInfo.startTime),
      filterText: lotteryInfo.filterText,
      includeTerms: lotteryInfo.includeTerms,
      isFollower: lotteryInfo.isFollower,
      lotteryId: lotteryInfo.lotteryId,
      lotteryType: lotteryInfo.lotteryType,
      minMentionCount: lotteryInfo.minMentionCount,
      postId: lotteryInfo.postId,
      publishTerms: lotteryInfo.publishTerms,
      successFollowerMessage: lotteryInfo.successFollowerMessage,
      termsBackgroundUrl: termsBackGroundId,
      termsType: lotteryInfo.termsType,
      termsUIInfo: lotteryInfo.termsUIInfo,
      termsUrl: termsUrlId,
      turnOffCommenting: lotteryInfo.turnOffCommenting,
      winnerCount: lotteryInfo.winnerCount,
    };
    try {
      const res = await GetServerResult<ILotteryInfo, boolean>(
        MethodType.post,
        session,
        "Instagramer/Lottery/CreateLottery",
        cerateLottery
      );
      if (res.succeeded) {
        internalNotify(InternalResponseType.Ok, NotifType.Success);
        setlotteryInfo({
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

        setTermsUrlFile(null);
        setBackgroundFile(null);
        setshowWinnerAnnounceAndBanner(false);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoadingStartLottery(false);
      changePositionToRelative();
    }
  };
  const handleShowShareTermsOrBanner = (backgroundUrl: string, lotteryId: string) => {
    setShareTermsInfo({ lotteryId: lotteryId, backgroundUrl: backgroundUrl });
    setShowLotteryRunning(false);
    setShowShareTermsAndCondition(true);
  };
  const handleShareTermsAsStory = async (lotteryId: string) => {
    try {
      var res = await GetServerResult<boolean, IFullLottery>(
        MethodType.get,
        session,
        "Instagramer/Lottery/PublishTerms",
        null,
        [
          {
            key: "lotteryId",
            value: lotteryId.toString(),
          },
        ]
      );
      if (res.succeeded) {
        internalNotify(InternalResponseType.Ok, NotifType.Success, ", Terms is stored successfully");
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      handleBackToWinnerRunning();
    }
  };
  // const handleShowRemainingTime = (data: IShareremainingTime) => {
  //   setShareRemainingTimeInfo(data);
  //   setShowLotteryRunning(false);
  //   setshowRemainingTime(true);
  // };
  // const handleShareRemainingTime = async (lotteryId: number) => {
  //   try {
  //     let instagramerId =
  //       session?.user.instagramerIds[session.user.currentIndex];
  //     var res = await GetServerResult<boolean, IFullLottery>(
  //       MethodType.get,
  //       session,
  //       "Instagramer" + "/lottery/ShareRemainingTime",
  //       null,
  //       [
  //         {
  //           key: "lotteryId",
  //           value: lotteryId.toString(),
  //         },
  //       ]
  //     );
  //     if (res.succeeded) {
  //       internalNotify(
  //         InternalResponseType.Ok,
  //         NotifType.Success,
  //         ", Remaining time is stored successfully"
  //       );
  //     } else {
  //       notify2(res.info.responseType, NotifType.Warning);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     notify(ResponseType.Unexpected, NotifType.Error);
  //   } finally {
  //     handleBackToWinnerRunning();
  //   }
  //   // setshowRemainingTime(false);
  //   // setShowLotteryRunning(true);
  // };
  const handleShowDeleteLottery = (lotteryId: string) => {
    setLotteryId(lotteryId);
    setShowLotteryRunning(false);
    setShowDeleteLottery(true);
  };
  const handleBackToWinnerRunning = () => {
    setShowShareTermsAndCondition(false);
    setshowRemainingTime(false);
    setShowLotteryRunning(true);
  };
  const handleBackToActiveLottery = () => {
    setShowLotteryRunning(false);
    setShowLotteryHistory(true);
  };
  const handleBackFromLotteryRunning = () => {
    isNewLottery ? removeMask() : handleBackToActiveLottery();
  };
  const handleShowLotteryRunning = (lotteryId: string) => {
    setLotteryId(lotteryId);
    setIsNewLottery(false);
    setShowLotteryHistory(false);
    setShowLotteryRunning(true);
  };
  const handleBackToLotteryHistory = () => {
    setShowWinnersList(false);
    setShowLotteryHistory(true);
  };
  const handleShowWinnersList = async (lotteryId: string) => {
    // let instagramerId = session?.user.instagramerIds[session.user.currentIndex];
    // var res = await GetServerResult<boolean, IFullLottery>(
    //   MethodType.get,
    //   session,
    //   "Instagramer"+ "/lottery/GetFullLottery",
    //   null,
    //   [
    //     {
    //       key: "lotteryId",
    //       value: lotteryId.toString(),
    //     },
    //   ]
    // );

    // setFullLottery(res.value);
    setLotteryId(lotteryId);
    setShowLotteryHistory(false);
    setShowWinnersList(true);
  };
  const GetHashtagList = useCallback(async () => {
    if (!session || !LoginStatus(session) || !RoleAccess(session, PartnerRole.PageView)) {
      return;
    }

    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    try {
      let hashtagList = await GetServerResult<string, IHashtag>(
        MethodType.get,
        session,
        "Instagramer/hashtag/GetHashtagList",
        null,
        []
      );
      if (hashtagList.succeeded) {
        setHashtagData(hashtagList.value);
        setIsDataLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching hashtag list:", error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [session]);

  function handleDeleteLottery() {
    setShowDeleteLottery(false);
    handleBackFromLotteryRunning();
  }
  function handleRemoveFollowing(removeFollowing: IUnFollowAllFollowing_UpdateCondotion) {
    setRemoveFollowing(removeFollowing);
    setShowRemoveUnFollowing(true);
  }
  function handleBackToUnfollowFollowing() {
    setShowRemoveUnFollowing(false);
    setShowUnfollowAllFollowing(true);
  }
  const [featureInfo, setFeatureInfo] = useState<IFeatureInfo | null>(null);
  async function handleGetFeature() {
    try {
      const res = await GetServerResult<boolean, IFeatureInfo>(
        MethodType.get,
        session,
        "Instagramer/PSG/GetPackageFeatureDetails"
      );
      if (res.succeeded) setFeatureInfo(res.value);
      else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  useEffect(() => {
    if (session && LoginStatus(session) && RoleAccess(session, PartnerRole.PageView) && !isDataLoaded) {
      GetHashtagList();
    }
  }, [session, GetHashtagList, isDataLoaded]);
  useEffect(() => {
    if (session && LoginStatus(session) && RoleAccess(session, PartnerRole.PageView) && !isDataLoaded) {
      handleGetFeature();
    }
  }, [session, isDataLoaded]);

  if (session?.user.currentIndex === -1) router.push("/user");
  return (
    <>
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <title>Bran.cy ▸ {t(LanguageKey.navbarTools)}</title>
        <meta name="description" content="Advanced Instagram post management tool" />
        <meta name="theme-color"></meta>
        <meta
          name="keywords"
          content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/page/posts" />
        {/* Add other meta tags as needed */}
      </Head>
      {session && session.user.currentIndex !== -1 && (
        <main>
          {!RoleAccess(session, PartnerRole.PageView) && <NotAllowed />}

          <div onClick={unshowPopups} className="pinContainer">
            {/* <Hashtags_analisys
                data={hashtagData}
                handlePageAnalysisShowSetting={handlePageAnalysisShowSetting}
                handlePictureAnalysisShowSetting={
                  handlePictureAnalysisShowSetting
                }
                showHashtagPageAnalysisSetting={showPageAnalysisSetting}
                showHashtagPictureAnalysisSetting={showPictureAnalysisSetting}
                displayNewList={handleDisplayNewList}
                handleClickForPictureAnalyser={
                  handleClickOnIconForPictureAnalyzer
                }
                handleClickForPageAnalyser={handleClickOnIconForPageAnalyzer}
                handleShowNewPage={() => setShowNewPageAnalyzer(true)}
                handleShowNewPicture={() => setShowNewPictureAnalyzer(true)}
              /> */}

            <Hashtags
              data={hashtagData}
              displayNewList={handleDisplayNewList}
              onCopyHashtags={handleCopyHashtags}
              onDeleteClick={handleDeleteHashtagClick}
              onEditClick={handleEditHashtagClick}
            />
            {/* <Caption
                data={{
                  hashtagList: [],
                  lastPageAnalysisHashtags: [],
                  lastPictureAnalysisHashtags: [],
                }}
                showSetting={showHashatgSetting}
                handleHashtagShowSetting={handleHashtagShowSetting}
                displayNewList={handleDisplayNewList}
                handleClickOnIcon={handleClickOnIcon}
              /> */}
            <TrendHashtags />
            <FontSelector />
            {/* <AutoInteraction
                data={autointeraction}
                handleShowPopup={handleShowAutoInteractionPopup}
              /> */}

            <WinnerPicker
              handleShowWinnerPickerPopup={handleShowWinnerPickerPopup}
              showLotteryRunning={handleShowLotteryRunning}
              showWinnersList={handleShowWinnersList}
              // handleShowActiveWinnerPicker={handleShowActiveWinnerPicker}
            />
          </div>

          <Modal closePopup={removeMask} classNamePopup={"popup"} showContent={showNewList}>
            <NewHashtagList
              data={{
                id: 0,
                hashtags: preSaveHashtagList,
              }}
              removeMask={removeMask}
              saveHashtagInfo={handleSaveHashtagList}
              hashtagTitleName={!hashtagData?.hashtagList ? "1" : (hashtagData.hashtagList.length + 1).toString()}
            />
          </Modal>
          <Modal closePopup={removeMask} classNamePopup={"popup"} showContent={showUpdateList}>
            <UpdateHashtagList
              data={showDataUpdate}
              removeMask={removeMask}
              updateHashtagInfo={handleUpdateHashtagList}
            />
          </Modal>
          <Modal closePopup={removeMask} classNamePopup={"popup"} showContent={showNewPictureAnalyzer}>
            <NewPictureAnalyzerList
              data={{
                id: 0,
                hashtags: null,
              }}
              removeMask={removeMask}
              saveHashtagAnalyzer={saveHashtagPictureAnalyzer}
            />
          </Modal>
          <Modal closePopup={removeMask} classNamePopup={"popup"} showContent={showNewPageAnalyzer}>
            <NewPageAnalyzer
              data={{
                id: 0,
                hashtags: null,
              }}
              removeMask={removeMask}
              saveHashtagAnalyzer={saveHashtagPageAnalyzer}
            />
          </Modal>
          {/* {showFollowerRequest && autointeraction && (
            <Followrequests removeMask={removeMask} />
          )}
          {showLikeAllComments && autointeraction && (
            <LikeAllComments removeMask={removeMask} />
          )}
          {showLikeFollowerPosts && autointeraction && (
            <LikeFollowerPost
              removeMask={removeMask}
              data={autointeraction.likeFollowerPosts}
              id={""}
              name={""}
            />
          )}
          {showUnfollowAllFollowing && autointeraction && (
            <UnfollowAllFollowing
              data={autointeraction.unfollowAllFollowing}
              removeMask={removeMask}
              handleRemoveFollowing={handleRemoveFollowing}
              id={""}
              name={""}
            />
          )} */}
          <Modal
            closePopup={removeMask}
            classNamePopup={"popupLarge"}
            showContent={
              showScoreLottery === ShowScoreLotteryType.Forward || showScoreLottery === ShowScoreLotteryType.Back
            }>
            <ScoreLottery
              removeMask={removeMask}
              showScoreLottery={showScoreLottery}
              lotteryInfo={lotteryInfo}
              featureInfo={featureInfo}
              saveScoreLottery={saveScoreLottery}
              showSpecification={handleShowSpecification}
              shortPost={shortPostInfo}
              unixData={unixDate}
            />
          </Modal>
          <Modal closePopup={removeMask} classNamePopup={"popupLarge"} showContent={showTermsAndConditionWinnerPicker}>
            <TermsAndConditionWinnerPicker
              removeMask={removeMask}
              backButton={backToScoreWinnerPicker}
              saveTermsAndCondition={saveTermsAndCondition}
              data={lotteryInfo}
              loadingToSave={loadingSaveTerms}
            />
          </Modal>
          <Modal closePopup={removeMask} classNamePopup={"popupLarge"} showContent={showWinnerAnnounceAndBanner}>
            <WinnerAnnouncementAndBanner
              removeMask={removeMask}
              backButton={backToTermsAndCondition}
              lotteryInfo={lotteryInfo}
              lotteryType={lotteryType}
              saveButton={saveWinnerPickerToServer}
              loadindTosave={loadingStartLottery}
              customImageBase64={customImageBase64}
            />
          </Modal>
          <Modal closePopup={removeMask} classNamePopup={"popup"} showContent={showSetTimeAndDate}>
            <SetTimeAndDate
              removeMask={removeMask}
              saveDateAndTime={saveDateAndTime}
              backToNormalPicker={backToScoreWinnerPicker}
              fromUnix={Date.now() + 23400000}
              startDay={
                lotteryInfo.startTime !== 0 ? convertToMilliseconds(lotteryInfo.startTime) : Date.now() + 23400000
              }
            />
          </Modal>
          <Modal closePopup={removeMask} classNamePopup={"popup"} showContent={showLotteryRunning}>
            <LotteryRunning
              removeMask={removeMask}
              handleBachFromLotteryRunning={handleBackFromLotteryRunning}
              lotteryId={lotteryId}
              isNewLottery={isNewLottery}
              handleViewAndDetails={handleViewAndDetails}
              handleShowShareTerms={handleShowShareTermsOrBanner}
              handleShowDeleteLottery={handleShowDeleteLottery}
            />
          </Modal>
          <Modal closePopup={removeMask} classNamePopup={"popup"} showContent={showShareTermsAndCondition}>
            <ShareTermsAndCondition
              shareTermsInfo={shareTermsInfo}
              removeMask={removeMask}
              backButton={handleBackToWinnerRunning}
              shareStory={handleShareTermsAsStory}
            />
          </Modal>
          {/* {showRemainingTime && (
            <ShareRemainingTime
              shareRemainingTimeInfo={shareRemainingTimeInfo}
              removeMask={removeMask}
              backButton={handleBackToWinnerRunning}
              shareRemainingTime={handleShareRemainingTime}
            />
          )} */}
          <Modal closePopup={removeMask} classNamePopup={"popup"} showContent={showSelectPost}>
            <SelectPost
              removeMask={removeMask}
              saveSelectPost={saveSelectPost}
              backToNormalPicker={backToScoreWinnerPicker}
            />
          </Modal>
          {/* {showFollowersLottery && (
            <FollowersLottery
              removeMask={removeMask}
              data={followerLottery}
              saveNormalWinnerPicker={saveFollowerLottery}
            />
          )}*/}
          <Modal closePopup={removeMask} classNamePopup={"popup"} showContent={showWinnersList}>
            <WinnersList
              removeMask={removeMask}
              lotteryId={lotteryId}
              handleBackToLotteryHistory={handleBackToLotteryHistory}
            />
          </Modal>
          <Modal closePopup={removeMask} classNamePopup={"popup"} showContent={showLotteryHistory}>
            <LotteryHistory
              removeMask={removeMask}
              lotteryId={lotteryInfo.lotteryId}
              setWinnerPickerStatus={(status) => setSelectedWinnerPickerStatusType(status)}
              showWinnersList={handleShowWinnersList}
              showLotteryRunning={handleShowLotteryRunning}
            />
          </Modal>
          <Modal
            closePopup={() => setShowDeleteLottery(false)}
            classNamePopup={"popupSendFile"}
            showContent={showDeleteLottery}>
            <DeleteLottery
              lotteryId={lotteryId}
              handleCancelDelete={() => {
                setShowDeleteLottery(false);
                setShowLotteryRunning(true);
              }}
              handleDeleteLottery={handleDeleteLottery}
            />
          </Modal>
          {/* {showRemoveUnFollowing && (
            <RemoveFollowing
              condition={removeFollowing}
              handleBackToUnfollowFollowing={handleBackToUnfollowFollowing}
              removeMask={removeMask}
            />
          )} */}

          {/* Delete Hashtag Confirmation Modal */}
          <Modal
            closePopup={closeDeleteHashtagModal}
            showContent={showDeleteHashtagModal}
            classNamePopup="popupSendFile">
            <DeleteHashtagList
              handleCancelDelete={closeDeleteHashtagModal}
              handleConfirmDelete={confirmDeleteHashtag}
            />
          </Modal>

          {/* Edit Hashtag Modal */}
          <Modal closePopup={closeEditHashtagModal} showContent={showEditHashtagModal} classNamePopup="popup">
            {selectedHashtagList && (
              <UpdateHashtagList
                data={selectedHashtagList}
                removeMask={closeEditHashtagModal}
                updateHashtagInfo={(hashtags, listName, listId) => {
                  handleUpdateHashtagList(hashtags, listName, listId);
                  closeEditHashtagModal();
                }}
              />
            )}
          </Modal>
        </main>
      )}
    </>
  );
};

export default Tools;
