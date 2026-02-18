import ImageCompressor from "compressorjs";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import SetTimeAndDate from "saeed/components/dateAndTime/setTimeAndDate";
import AIWithPrompt from "saeed/components/design/ai/AIWithPrompt";
import ConstantCounterDown from "saeed/components/design/counterDown/constantCounterDown";
import DragComponent from "saeed/components/design/dragComponent/dragComponent";
import DragDrop from "saeed/components/design/dragDrop/dragDrop";
import InputText from "saeed/components/design/inputText";
import RingLoader from "saeed/components/design/loader/ringLoder";
import Modal from "saeed/components/design/modal";
import ProgressBar from "saeed/components/design/progressBar/progressBar";
import TextArea from "saeed/components/design/textArea/textArea";
import ToggleCheckBoxButton from "saeed/components/design/toggleCheckBoxButton";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "saeed/components/notifications/notificationBox";
import NotAllowed from "saeed/components/notOk/notAllowed";
import NotPermission, { PermissionType } from "saeed/components/notOk/notPermission";
import ChangePostToAlbum from "saeed/components/page/popup/changePostToAlbum";
import DeleteDraft from "saeed/components/page/popup/deleteDraft";
import ErrorDraft from "saeed/components/page/popup/errorDraft";
import QuickReplyPopup from "saeed/components/page/popup/quickReply";
import SaveDraft from "saeed/components/page/popup/saveDraft";
import DeletePrePost from "saeed/components/page/scheduledPost/deletePrePost";
import { packageStatus, RoleAccess } from "saeed/helper/loadingStatus";
import initialzedTime from "saeed/helper/manageTimer";
import { LanguageKey } from "saeed/i18n";
import { PartnerRole } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { MethodType, UploadFile } from "saeed/helper/api";
import { AutoReplyPayLoadType, MediaProductType } from "saeed/models/messages/enum";
import { IAutomaticReply, IMediaUpdateAutoReply, IPublishLimit } from "saeed/models/page/post/posts";
import {
  IDraftInfo,
  IErrorPrePostInfo,
  ILocation,
  IPageInfo,
  IPostAlbumInfo,
  IPostAlbumItem,
  IPostImageInfo,
  IPostVideoInfo,
  IPrePostInfo,
  IShowMedia,
  IUiParameter,
  MediaType,
  PostType,
} from "saeed/models/page/post/preposts";
import { HashtagListItem, IHashtag } from "saeed/models/page/tools/tools";
import styles from "./createPost.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";

enum SearchType {
  CollaboratePeople,
  TagPeople,
}

// Media reducer types and actions
type MediaState = {
  showMedias: IShowMedia[];
  showMediaIndex: number;
  postType: PostType;
  loadingUpload: boolean;
  progress: number;
};

type MediaAction =
  | { type: "SET_SHOW_MEDIAS"; payload: IShowMedia[] }
  | { type: "ADD_MEDIA"; payload: IShowMedia }
  | {
      type: "UPDATE_MEDIA";
      payload: { index: number; media: Partial<IShowMedia> };
    }
  | { type: "DELETE_MEDIA"; payload: number }
  | { type: "SET_MEDIA_INDEX"; payload: number }
  | { type: "SET_POST_TYPE"; payload: PostType }
  | { type: "SET_LOADING_UPLOAD"; payload: boolean }
  | { type: "SET_PROGRESS"; payload: number }
  | {
      type: "UPDATE_MEDIA_TAGS";
      payload: {
        index: number;
        tags: Array<{ username: string; x: number; y: number }>;
      };
    }
  | { type: "CLEAR_MEDIAS" };

const mediaReducer = (state: MediaState, action: MediaAction): MediaState => {
  switch (action.type) {
    case "SET_SHOW_MEDIAS":
      return { ...state, showMedias: action.payload };
    case "ADD_MEDIA":
      return {
        ...state,
        showMedias: [...state.showMedias, action.payload],
        showMediaIndex: state.showMedias.length,
      };
    case "UPDATE_MEDIA":
      return {
        ...state,
        showMedias: state.showMedias.map((media, index) =>
          index === action.payload.index ? { ...media, ...action.payload.media } : media,
        ),
      };
    case "DELETE_MEDIA":
      return {
        ...state,
        showMedias: state.showMedias.filter((_, index) => index !== action.payload),
        showMediaIndex: 0,
      };
    case "SET_MEDIA_INDEX":
      return { ...state, showMediaIndex: action.payload };
    case "SET_POST_TYPE":
      return { ...state, postType: action.payload };
    case "SET_LOADING_UPLOAD":
      return { ...state, loadingUpload: action.payload };
    case "SET_PROGRESS":
      return { ...state, progress: action.payload };
    case "UPDATE_MEDIA_TAGS":
      return {
        ...state,
        showMedias: state.showMedias.map((media, index) =>
          index === action.payload.index ? { ...media, tagPeaple: action.payload.tags } : media,
        ),
      };
    case "CLEAR_MEDIAS":
      return { ...state, showMedias: [], showMediaIndex: 0 };
    default:
      return state;
  }
};

// UI reducer types and actions
type UIState = {
  showOptions: boolean;
  selectedOptions: number;
  showMediaIndex: number;
  showSetDateAndTime: boolean;
  showDraft: boolean;
  showDeleteDraft: boolean;
  showDeletePrepost: boolean;
  showTooltip: boolean;
  showQuickReplyPopup: boolean;
  showChangePostToAlbum: boolean;
  showDraftError: IErrorPrePostInfo | null;
  loacationBox: { active: boolean; loading: boolean; noresult: boolean };
  showAddPeapleBox: { active: boolean; loading: boolean; noresult: boolean };
  showAddTagPeapleBox: { active: boolean; loading: boolean; noresult: boolean };
  analizeProcessing: boolean;
};

type UIAction =
  | { type: "TOGGLE_OPTIONS"; payload?: boolean }
  | { type: "SET_SELECTED_OPTIONS"; payload: number }
  | { type: "SET_SHOW_MEDIA_INDEX"; payload: number }
  | { type: "TOGGLE_SET_DATE_TIME"; payload?: boolean }
  | { type: "TOGGLE_DRAFT"; payload?: boolean }
  | { type: "TOGGLE_DELETE_DRAFT"; payload?: boolean }
  | { type: "TOGGLE_DELETE_PREPOST"; payload?: boolean }
  | { type: "TOGGLE_TOOLTIP"; payload?: boolean }
  | { type: "TOGGLE_QUICK_REPLY_POPUP"; payload?: boolean }
  | { type: "TOGGLE_CHANGE_POST_TO_ALBUM"; payload?: boolean }
  | { type: "SET_DRAFT_ERROR"; payload: IErrorPrePostInfo | null }
  | {
      type: "SET_LOCATION_BOX";
      payload: { active: boolean; loading: boolean; noresult: boolean };
    }
  | {
      type: "SET_ADD_PEOPLE_BOX";
      payload: { active: boolean; loading: boolean; noresult: boolean };
    }
  | {
      type: "SET_ADD_TAG_PEOPLE_BOX";
      payload: { active: boolean; loading: boolean; noresult: boolean };
    }
  | { type: "SET_ANALIZE_PROCESSING"; payload: boolean }
  | { type: "RESET_UI" };

const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case "TOGGLE_OPTIONS":
      return { ...state, showOptions: action.payload ?? !state.showOptions };
    case "SET_SELECTED_OPTIONS":
      return { ...state, selectedOptions: action.payload };
    case "SET_SHOW_MEDIA_INDEX":
      return { ...state, showMediaIndex: action.payload };
    case "TOGGLE_SET_DATE_TIME":
      return {
        ...state,
        showSetDateAndTime: action.payload ?? !state.showSetDateAndTime,
      };
    case "TOGGLE_DRAFT":
      return { ...state, showDraft: action.payload ?? !state.showDraft };
    case "TOGGLE_DELETE_DRAFT":
      return {
        ...state,
        showDeleteDraft: action.payload ?? !state.showDeleteDraft,
      };
    case "TOGGLE_DELETE_PREPOST":
      return {
        ...state,
        showDeletePrepost: action.payload ?? !state.showDeletePrepost,
      };
    case "TOGGLE_TOOLTIP":
      return { ...state, showTooltip: action.payload ?? !state.showTooltip };
    case "TOGGLE_QUICK_REPLY_POPUP":
      return {
        ...state,
        showQuickReplyPopup: action.payload ?? !state.showQuickReplyPopup,
      };
    case "TOGGLE_CHANGE_POST_TO_ALBUM":
      return {
        ...state,
        showChangePostToAlbum: action.payload ?? !state.showChangePostToAlbum,
      };
    case "SET_DRAFT_ERROR":
      return { ...state, showDraftError: action.payload };
    case "SET_LOCATION_BOX":
      return { ...state, loacationBox: action.payload };
    case "SET_ADD_PEOPLE_BOX":
      return { ...state, showAddPeapleBox: action.payload };
    case "SET_ADD_TAG_PEOPLE_BOX":
      return { ...state, showAddTagPeapleBox: action.payload };
    case "SET_ANALIZE_PROCESSING":
      return { ...state, analizeProcessing: action.payload };
    case "RESET_UI":
      return {
        showOptions: false,
        selectedOptions: -1,
        showMediaIndex: 0,
        showSetDateAndTime: false,
        showDraft: false,
        showDeleteDraft: false,
        showDeletePrepost: false,
        showTooltip: false,
        showQuickReplyPopup: false,
        showChangePostToAlbum: false,
        showDraftError: null,
        loacationBox: { active: false, loading: false, noresult: false },
        showAddPeapleBox: { active: false, loading: false, noresult: false },
        showAddTagPeapleBox: { active: false, loading: false, noresult: false },
        analizeProcessing: false,
      };
    default:
      return state;
  }
};

// Form reducer types and actions
type FormState = {
  captionTextArea: string;
  hashtagsWord: string[];
  addToProduct: boolean;
  sharePreviewToFeed: boolean;
  turnOffComment: boolean;
  automaticPost: boolean;
  dateAndTime: number;
  activeLimitTime: boolean;
  recTimeSelect: number;
  QuickReply: boolean;
  searchLocation: string;
  searchPeaple: string;
  searchTagPeaple: string;
};

type FormAction =
  | { type: "SET_CAPTION"; payload: string }
  | { type: "SET_HASHTAGS_WORD"; payload: string[] }
  | { type: "TOGGLE_ADD_TO_PRODUCT"; payload?: boolean }
  | { type: "TOGGLE_SHARE_PREVIEW"; payload?: boolean }
  | { type: "TOGGLE_TURN_OFF_COMMENT"; payload?: boolean }
  | { type: "SET_TURN_OFF_COMMENT"; payload: boolean }
  | { type: "TOGGLE_AUTOMATIC_POST"; payload?: boolean }
  | { type: "SET_DATE_TIME"; payload: number }
  | { type: "TOGGLE_ACTIVE_LIMIT_TIME"; payload?: boolean }
  | { type: "SET_REC_TIME_SELECT"; payload: number }
  | { type: "TOGGLE_QUICK_REPLY"; payload?: boolean }
  | { type: "SET_SEARCH_LOCATION"; payload: string }
  | { type: "SET_SEARCH_PEOPLE"; payload: string }
  | { type: "SET_SEARCH_TAG_PEOPLE"; payload: string }
  | { type: "RESET_FORM" };

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "SET_CAPTION":
      return { ...state, captionTextArea: action.payload };
    case "SET_HASHTAGS_WORD":
      return { ...state, hashtagsWord: action.payload };
    case "TOGGLE_ADD_TO_PRODUCT":
      return { ...state, addToProduct: action.payload ?? !state.addToProduct };
    case "TOGGLE_SHARE_PREVIEW":
      return {
        ...state,
        sharePreviewToFeed: action.payload ?? !state.sharePreviewToFeed,
      };
    case "TOGGLE_TURN_OFF_COMMENT":
      return {
        ...state,
        turnOffComment: action.payload ?? !state.turnOffComment,
      };
    case "SET_TURN_OFF_COMMENT":
      return { ...state, turnOffComment: action.payload };
    case "TOGGLE_AUTOMATIC_POST":
      return {
        ...state,
        automaticPost: action.payload ?? !state.automaticPost,
      };
    case "SET_DATE_TIME":
      return { ...state, dateAndTime: action.payload };
    case "TOGGLE_ACTIVE_LIMIT_TIME":
      return {
        ...state,
        activeLimitTime: action.payload ?? !state.activeLimitTime,
      };
    case "SET_REC_TIME_SELECT":
      return { ...state, recTimeSelect: action.payload };
    case "TOGGLE_QUICK_REPLY":
      return { ...state, QuickReply: action.payload ?? !state.QuickReply };
    case "SET_SEARCH_LOCATION":
      return { ...state, searchLocation: action.payload };
    case "SET_SEARCH_PEOPLE":
      return { ...state, searchPeaple: action.payload };
    case "SET_SEARCH_TAG_PEOPLE":
      return { ...state, searchTagPeaple: action.payload };
    case "RESET_FORM":
      return {
        captionTextArea: "",
        hashtagsWord: [],
        addToProduct: false,
        sharePreviewToFeed: true,
        turnOffComment: false,
        automaticPost: false,
        dateAndTime: Date.now() + 86400000,
        activeLimitTime: false,
        recTimeSelect: -1,
        QuickReply: false,
        searchLocation: "",
        searchPeaple: "",
        searchTagPeaple: "",
      };
    default:
      return state;
  }
};
const CreatePost = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
  const { query } = router;

  // Handle authentication check
  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
  }, [status, router]);

  // Initialize reducers
  const [mediaState, mediaDispatch] = useReducer(mediaReducer, {
    showMedias: [],
    showMediaIndex: 0,
    postType: PostType.Single,
    loadingUpload: false,
    progress: 0,
  });

  const [uiState, uiDispatch] = useReducer(uiReducer, {
    showOptions: false,
    selectedOptions: -1,
    showMediaIndex: 0,
    showSetDateAndTime: false,
    showDraft: false,
    showDeleteDraft: false,
    showDeletePrepost: false,
    showTooltip: false,
    showQuickReplyPopup: false,
    showChangePostToAlbum: false,
    showDraftError: null,
    loacationBox: { active: false, loading: false, noresult: false },
    showAddPeapleBox: { active: false, loading: false, noresult: false },
    showAddTagPeapleBox: { active: false, loading: false, noresult: false },
    analizeProcessing: false,
  });

  const [formState, formDispatch] = useReducer(formReducer, {
    captionTextArea: "",
    hashtagsWord: [],
    addToProduct: false,
    sharePreviewToFeed: true,
    turnOffComment: false,
    automaticPost: query.newschedulepost === "true",
    dateAndTime: Date.now() + 86400000,
    activeLimitTime: false,
    recTimeSelect: -1,
    QuickReply: false,
    searchLocation: "",
    searchPeaple: "",
    searchTagPeaple: "",
  });

  // Extract values from state for easier access
  const { showMedias, showMediaIndex, postType, loadingUpload, progress } = mediaState;
  const {
    showOptions,
    selectedOptions,
    showSetDateAndTime,
    showDraft,
    showDeleteDraft,
    showDeletePrepost,
    showTooltip,
    showQuickReplyPopup,
    showChangePostToAlbum,
    showDraftError,
    loacationBox,
    showAddPeapleBox,
    showAddTagPeapleBox,
    analizeProcessing,
  } = uiState;
  const {
    captionTextArea,
    hashtagsWord,
    addToProduct,
    sharePreviewToFeed,
    turnOffComment,
    automaticPost,
    dateAndTime,
    activeLimitTime,
    recTimeSelect,
    QuickReply,
    searchLocation,
    searchPeaple,
    searchTagPeaple,
  } = formState;

  // Add loading and data states - keeping these as simple useState
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputCoverRef = useRef<HTMLInputElement | null>(null);
  const inputReplaceRef = useRef<HTMLInputElement | null>(null);

  // Simple states that don't need reducer complexity
  const [hashtags, setHashtags] = useState<HashtagListItem[] | null>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [recommendedTime, setRecommendedTime] = useState<number[]>([
    Date.now() / 1000 + 172800,
    Date.now() / 1000 + 172800,
    Date.now() / 1000 + 172800,
    Date.now() / 1000 + 172800,
  ]);
  const defaultTags = [
    t(LanguageKey.WithStrongCallToAction),
    t(LanguageKey.WithProsAndCons),
    t(LanguageKey.ForComparison),
    t(LanguageKey.WithKeyPoints),
    t(LanguageKey.ForPromotionalPost),
    t(LanguageKey.WithDetailedExplanation),
    t(LanguageKey.PersuasiveStyle),
    t(LanguageKey.ForProductIntroduction),
    t(LanguageKey.LongText),
  ];
  const [collabratorPages, setCollabratorPages] = useState<string[]>([]);
  const [autoReply, setAutoReply] = useState<IAutomaticReply>({
    items: [],
    response: "",
    sendPr: false,
    shouldFollower: false,
    automaticType: AutoReplyPayLoadType.AI,
    masterFlow: null,
    masterFlowId: null,
    mediaId: "",
    pauseTime: Date.now(),
    productType: MediaProductType.Feed,
    prompt: null,
    promptId: null,
    sendCount: 0,
    replySuccessfullyDirected: false,
  });
  const [hashtagList, setHashtagList] = useState<string[]>([]);
  const [renderWidthSize, setRenderwidthSize] = useState(333);
  const [tempId, setTempId] = useState(0);
  const [draftId, setDraftId] = useState(-1);
  const [locationInfo, setLocationInfo] = useState<ILocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<ILocation | null>(null);
  const [pageInfo, setPageInfo] = useState<IPageInfo[]>([]);
  const [tagPeaple, setTagPeaple] = useState<IPageInfo[]>([]);
  const [selectedPeaple, setSelectedPeaple] = useState<IPageInfo | null>(null);
  const [selectedTagPeaple, setSelectedTagPeaple] = useState<IPageInfo | null>(null);
  const [locationTimeOutId, setLocationTimeOutId] = useState<any>();
  const [peopleTimeOutId, setPeopleTimeOutId] = useState<any>();
  const [locationLocked, setLocationLocked] = useState(false);
  const [peopleLocked, setPeopleLocked] = useState(false);
  const [prePostId, setPrePostId] = useState(-1);

  // AI Caption Generator states
  const [showAIInput, setShowAIInput] = useState(false);
  // const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Memoized computed values
  const divArray = useMemo(
    () =>
      Array.from({ length: 9 - (showMedias ? showMedias.length : 0) }, (_, index) => (
        <div key={index} className={styles.posts1}></div>
      )),
    [showMedias?.length],
  );

  const disableDivArray = useMemo(
    () => Array.from({ length: 9 }, (_, index) => <div key={index} className={styles.disablePosts1}></div>),
    [],
  );

  // Memoized filtered hashtag list
  const filteredHashtagList = useMemo(() => {
    return hashtags && hashtags.length > 0 ? hashtags[0].hashtags : [];
  }, [hashtags]);

  // Memoized tag people count calculation
  const totalTaggedPeopleCount = useMemo(() => {
    return showMedias.reduce((sum, media) => sum + media.tagPeaple.length, 0);
  }, [showMedias]);

  // Memoized current media constraints check
  const currentMediaConstraints = useMemo(() => {
    if (showMedias.length === 0 || showMediaIndex >= showMedias.length) return null;

    const currentMedia = showMedias[showMediaIndex];
    return {
      canUploadCover:
        currentMedia.mediaType === MediaType.Video && showMediaIndex === 0 && postType === PostType.Single,
      isVideo: currentMedia.mediaType === MediaType.Video,
      isImage: currentMedia.mediaType === MediaType.Image,
    };
  }, [showMedias, showMediaIndex, postType]);

  // Memoized hashtag dropdown data for DragDrop component
  const hashtagDropdownData = useMemo(() => {
    const defaultOption = (
      <div key="-1" id="-1" className={styles.option}>
        {t(LanguageKey.Pleaseselect)}
      </div>
    );

    if (!hashtags || hashtags.length === 0) {
      return [defaultOption];
    }

    const options = hashtags.map((v, index) => (
      <div key={v.listId} className={`${styles.option} ${selectedOptions === index ? "selected" : ""}`}>
        {v.listName}
      </div>
    ));

    return [defaultOption, ...options];
  }, [hashtags, selectedOptions, styles.option, t]);

  // Update hashtagList when hashtags change
  useEffect(() => {
    if (hashtags && hashtags.length > 0 && selectedOptions >= 0) {
      setHashtagList(hashtags[selectedOptions].hashtags);
    } else {
      setHashtagList([]);
    }
  }, [hashtags, selectedOptions]);
  // const checkCanCreatePrePost = async () => {
  //   var instagramerId = session?.user.instagramerIds[session.user.currentIndex];
  //   var res = await GetServerResult<boolean, IPrePostCount>(
  //     MethodType.get,
  //     session,
  //     "Instagramer"+ "/GetNextPostTempId",
  //     null
  //   );
  //   if (res.statusCode == 401) {
  //     console.log("login status not success");
  //   }
  //   if (res.statusCode == 429) {
  //     console.log("exceed max prePost");
  //   }
  //   if (res.succeeded) {
  //     console.log(res);
  //     setTempId(res.value.totalMediaCount + 1);
  //     settotalPrePostCount(res.value.totalPrePostCount);
  //   }
  //   setRefresh(!refresh);
  // };
  const GetNextBestTimes = useCallback(async () => {
    if (!session) return;
    try {
      var res = await clientFetchApi<boolean, number[]>("Instagramer" + "/Post/GetBestPublishTime", {
        methodType: MethodType.get,
        session: session,
        data: undefined,
        queries: undefined,
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        setRecommendedTime(res.value);
      }
    } catch (error) {
      console.error("Error fetching best times:", error);
    }
  }, [session]);

  const getHashtagList = useCallback(async () => {
    if (!session) return;
    try {
      console.log("hello before get hashtags");
      var res = await clientFetchApi<boolean, IHashtag>("/api/hashtag/GetHashtagList", {
        methodType: MethodType.get,
        session: session,
        data: undefined,
        queries: undefined,
        onUploadProgress: undefined,
      });

      if (res.succeeded) {
        console.log("hashtagssssssssssssssssssssssssssssss", res);
        setHashtags(res.value.hashtagList);
        if (res.value.hashtagList && res.value.hashtagList.length > 0)
          uiDispatch({ type: "SET_SELECTED_OPTIONS", payload: 0 });
      }
    } catch (error) {
      console.error("Error fetching hashtags:", error);
    }
  }, [session]);
  const getCaptionPrompt = useCallback(async () => {
    if (!session) return;
    try {
      var res = await clientFetchApi<boolean, string[]>("/api/post/GetCaptionPromptExamples", {
        methodType: MethodType.get,
        session: session,
        data: undefined,
        queries: undefined,
        onUploadProgress: undefined,
      });

      if (res.succeeded) setTags(res.value);
      else setTags(defaultTags);
    } catch (error) {
      console.error("Error fetching hashtags:", error);
    }
  }, [session]);

  const handleApiLocationSearch = useCallback(
    async (query: string) => {
      if (!session) return;
      try {
        console.log("start searched location ", query);
        var res = await clientFetchApi<boolean, ILocation[]>("Instagramer" + "/searchLocations", {
          methodType: MethodType.get,
          session: session,
          data: undefined,
          queries: [{ key: "query", value: query }],
          onUploadProgress: undefined,
        });
        if (res.succeeded) {
          uiDispatch({
            type: "SET_LOCATION_BOX",
            payload: {
              ...loacationBox,
              loading: false,
              noresult: res.value.length === 0,
            },
          });
          setLocationInfo(res.value);
        } else {
          uiDispatch({
            type: "SET_LOCATION_BOX",
            payload: { active: false, loading: false, noresult: false },
          });
          notify(res.info.responseType, NotifType.Error);
        }
      } catch (error) {
        console.error("Error searching location:", error);
      }
    },
    [session],
  );

  const handleApiPeopleSearch = useCallback(
    async (query: string, searchType: SearchType) => {
      if (!session) return;
      try {
        console.log("start searched people ", query);
        var res = await clientFetchApi<boolean, IPageInfo[]>("Instagramer" + "/Users/searchPeople", {
          methodType: MethodType.get,
          session: session,
          data: undefined,
          queries: [{ key: "query", value: query }],
          onUploadProgress: undefined,
        });
        console.log(res);
        if (res.succeeded && searchType == SearchType.CollaboratePeople) {
          if (showMedias.length > 0)
            setPageInfo(
              res.value.filter(
                (x) =>
                  !showMedias[0].tagPeaple.map((z) => z.username).includes(x.username) &&
                  x.username !== session?.user.username &&
                  x.username !== searchTagPeaple,
              ),
            );
          else setPageInfo(res.value.filter((x) => x.username !== session?.user.username));
          uiDispatch({
            type: "SET_ADD_PEOPLE_BOX",
            payload: {
              ...showAddPeapleBox,
              loading: false,
              noresult: res.value.length === 0,
            },
          });
        } else if (res.succeeded && searchType == SearchType.TagPeople) {
          console.log("tag people", res.value);
          if (showMedias.length > 0 && showMediaIndex === 0)
            setTagPeaple(
              res.value.filter(
                (x) =>
                  !collabratorPages.includes(x.username) &&
                  x.username !== session?.user.username &&
                  x.username !== searchPeaple,
              ),
            );
          else setTagPeaple(res.value.filter((x) => x.username !== session?.user.username));
          uiDispatch({
            type: "SET_ADD_TAG_PEOPLE_BOX",
            payload: {
              ...showAddTagPeapleBox,
              loading: false,
              noresult: res.value.length === 0,
            },
          });
        } else {
          uiDispatch({
            type: "SET_ADD_PEOPLE_BOX",
            payload: { active: false, loading: false, noresult: false },
          });
          uiDispatch({
            type: "SET_ADD_TAG_PEOPLE_BOX",
            payload: { active: false, loading: false, noresult: false },
          });
          notify(res.info.responseType, NotifType.Error);
        }
      } catch (error) {
        console.error("Error searching people:", error);
      }
    },
    [session, showMedias, showMediaIndex, searchTagPeaple, collabratorPages, searchPeaple],
  );
  function handleSaveAutoReply(sendAutoReply: IMediaUpdateAutoReply) {
    setAutoReply({
      automaticType: sendAutoReply.automaticType,
      items: sendAutoReply.keys.map((x) => ({ id: "", sendCount: 0, text: x })),
      response: sendAutoReply.response,
      sendPr: sendAutoReply.sendPr,
      shouldFollower: sendAutoReply.shouldFollower,
      mediaId: "",
      pauseTime: Date.now(),
      productType: MediaProductType.Feed,
      prompt: null,
      promptId: sendAutoReply.promptId,
      masterFlow: null,
      masterFlowId: sendAutoReply.masterFlowId,
      sendCount: 0,
      replySuccessfullyDirected: false,
    });
    uiDispatch({ type: "TOGGLE_QUICK_REPLY_POPUP", payload: false });
  }

  const closeCreatePost = useCallback(() => {
    if (typeof window !== "undefined") {
      const modalWindow = window as Window & { __closeInterceptedModal?: () => void };
      if (typeof modalWindow.__closeInterceptedModal === "function") {
        modalWindow.__closeInterceptedModal();
        return;
      }
    }
    router.push("/page/posts");
  }, [router]);

  const HandleUpload = useCallback(
    async (isDraft: boolean) => {
      console.log("upload entry");
      console.log("showMedias:", showMedias);
      console.log("timeUnix", dateAndTime);
      console.log("QuickReply", QuickReply);
      console.log("collabratorPages", collabratorPages);
      console.log("collabratorPages", addToProduct);
      if (showMedias.length == 0) return;
      uiDispatch({ type: "SET_ANALIZE_PROCESSING", payload: true });
      const params: IUiParameter[] = showMedias.map((x) => ({
        duration: x.duration,
        height: x.height,
        size: x.size,
        width: x.width,
      }));
      if (showMedias.length == 1) {
        var media = showMedias[0];
        if (media.mediaType === MediaType.Image) {
          var data: IPostImageInfo = {
            draftId: draftId,
            prePostId: 0,
            caption: captionTextArea,
            uploadImage: {
              imageUri: media.mediaUri ? media.mediaUploadId : null,
              uploadImageUrl: !media.mediaUri ? media.mediaUploadId : null,
              userTags: media.tagPeaple,
            },
            automaticMediaReply: QuickReply
              ? {
                  automaticType: autoReply.automaticType,
                  keys: autoReply.items.map((x) => x.text),
                  masterFlowId: autoReply.masterFlowId,
                  promptId: autoReply.promptId,
                  response: autoReply.response,
                  sendPr: autoReply.sendPr,
                  shouldFollower: autoReply.shouldFollower,
                  replySuccessfullyDirected: autoReply.replySuccessfullyDirected,
                }
              : null,
            collaborators: collabratorPages,
            commentEnabled: !turnOffComment,
            isProduct: addToProduct,
            locationId: "",
            uiParameters: JSON.stringify(params),
          };
          console.log("dataImage", data);
          var res = await clientFetchApi<IPostImageInfo, number>(`/api/post/PublishImageFeed`, {
            methodType: MethodType.post,
            session: session,
            data: data,
            queries: [
              { key: "isDraft", value: isDraft ? "true" : "false" },
              {
                key: "timeUnix",
                value: !automaticPost ? "0" : Math.floor(dateAndTime / 1e3).toString(),
              },
            ],
            onUploadProgress: undefined,
          });
          if (res.succeeded && res.value > 0) {
            setDraftId(res.value);
          }
        } else {
          var vData: IPostVideoInfo = {
            draftId: draftId,
            prePostId: 0,
            caption: captionTextArea,
            uploadVideo: {
              videoUri: media.mediaUri ? media.mediaUploadId! : null, //it might be changed//
              uploadVideoUrl: !media.mediaUri ? media.mediaUploadId : null,
              userTags: media.tagPeaple,
            },
            uploadCover:
              media.coverId.length > 0
                ? {
                    imageUri: media.coverUri ? media.coverId : null,
                    uploadImageUrl: !media.coverUri ? media.coverId : null,
                  }
                : null,
            automaticMediaReply: QuickReply
              ? {
                  automaticType: autoReply.automaticType,
                  keys: autoReply.items.map((x) => x.text),
                  masterFlowId: autoReply.masterFlowId,
                  promptId: autoReply.promptId,
                  response: autoReply.response,
                  sendPr: autoReply.sendPr,
                  shouldFollower: autoReply.shouldFollower,
                  replySuccessfullyDirected: autoReply.replySuccessfullyDirected,
                }
              : null,

            collaborators: collabratorPages,
            commentEnabled: !turnOffComment,
            isProduct: addToProduct,
            locationId: "",
            shareToFeed: sharePreviewToFeed,
            uiParameters: JSON.stringify(params),
          };

          console.log("dataVideo", vData);
          var res = await clientFetchApi<IPostVideoInfo, number>(`/api/post/PublishReels`, {
            methodType: MethodType.post,
            session: session,
            data: vData,
            queries: [
              { key: "isDraft", value: isDraft ? "true" : "false" },
              {
                key: "timeUnix",
                value: !automaticPost ? "0" : Math.floor(dateAndTime / 1e3).toString(),
              },
            ],
            onUploadProgress: undefined,
          });
          if (res.succeeded && res.value > 0) {
            setDraftId(res.value);
          }
        }
      } else if (showMedias.length > 1) {
        let items: IPostAlbumItem[] = [];
        for (let i = 0; i < showMedias.length; i++) {
          let media = showMedias[i];
          if (media.mediaType === MediaType.Image) {
            items.push({
              mediaType: MediaType.Image,
              image: {
                imageUri: media.mediaUri ? media.mediaUploadId : null,
                uploadImageUrl: !media.mediaUri ? media.mediaUploadId : null,
                userTags: media.tagPeaple,
              },
              video: null,
            });
          } else {
            items.push({
              mediaType: MediaType.Video,
              video: {
                uploadVideoUrl: !media.mediaUri ? media.mediaUploadId : null,
                userTags: media.tagPeaple.map((x) => x.username),
                videoUri: media.mediaUri ? media.mediaUploadId : null,
              },
              image: null,
            });
          }
        }
        var data5: IPostAlbumInfo = {
          draftId: draftId,
          caption: captionTextArea,
          albumItems: items,
          automaticMediaReply: QuickReply
            ? {
                automaticType: autoReply.automaticType,
                keys: autoReply.items.map((x) => x.text),
                masterFlowId: autoReply.masterFlowId,
                promptId: autoReply.promptId,
                response: autoReply.response,
                sendPr: autoReply.sendPr,
                shouldFollower: autoReply.shouldFollower,
                replySuccessfullyDirected: autoReply.replySuccessfullyDirected,
              }
            : null,
          collaborators: collabratorPages,
          commentEnabled: !turnOffComment,
          isProduct: addToProduct,
          locationId: "",
          uiParameters: JSON.stringify(params),
        };
        console.log("data55555555555555", data5);
        var res = await clientFetchApi<IPostAlbumInfo, number>("/api/post/PublishCarousel", {
          methodType: MethodType.post,
          session: session,
          data: data5,
          queries: [
            { key: "isDraft", value: isDraft ? "true" : "false" },
            {
              key: "timeUnix",
              value: !automaticPost ? "0" : Math.floor(dateAndTime / 1e3).toString(),
            },
          ],
          onUploadProgress: (progress) => mediaDispatch({ type: "SET_PROGRESS", payload: progress }),
        });
        if (res.succeeded && res.value > 0) {
          setDraftId(res.value);
        }
      }
      uiDispatch({ type: "SET_ANALIZE_PROCESSING", payload: false });
      closeCreatePost();
    },
    [
      showMedias,
      dateAndTime,
      QuickReply,
      collabratorPages,
      addToProduct,
      draftId,
      captionTextArea,
      autoReply,
      turnOffComment,
      automaticPost,
      sharePreviewToFeed,
      session,
      closeCreatePost,
    ],
  );

  const HandleDelete = useCallback(async () => {
    try {
      if (draftId > 0) {
        var res = await clientFetchApi<boolean, boolean>("/api/post/deleteDraft", {
          methodType: MethodType.get,
          session: session,
          data: undefined,
          queries: [{ key: "draftId", value: draftId.toString() }],
          onUploadProgress: undefined,
        });
        if (res.succeeded) closeCreatePost();
        else notify(res.info.responseType, NotifType.Warning);
      } else if (prePostId > 0) {
        var res = await clientFetchApi<boolean, boolean>("/api/post/deletePrePost", {
          methodType: MethodType.get,
          session: session,
          data: undefined,
          queries: [{ key: "prePostId", value: prePostId.toString() }],
          onUploadProgress: undefined,
        });
        if (res.succeeded) closeCreatePost();
        else notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, [session, draftId, prePostId, closeCreatePost]);
  const handleSearchLocationInputChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      return;
      uiDispatch({
        type: "SET_LOCATION_BOX",
        payload: { ...loacationBox, active: true, loading: true },
      });
      setLocationInfo([]);
      setSelectedLocation(null);
      var query = e.currentTarget.value;
      // setLocationTypingStopped(false);
      formDispatch({ type: "SET_SEARCH_LOCATION", payload: query });
      if (locationTimeOutId) clearTimeout(locationTimeOutId);
      let timeOutId = setTimeout(() => {
        if (query && query.length > 0) {
          if (locationLocked) return;
          setLocationLocked(true);
          handleApiLocationSearch(query);
          setTimeout(() => {
            setLocationLocked(false);
          }, 2000);
        }
      }, 1000);
      setLocationTimeOutId(timeOutId);
      if (e.currentTarget.value === "") {
        // if (chatBox) setUserSelectedId(constUserSelected);
        setLocationInfo([]);
      }
    },
    [loacationBox, locationTimeOutId, locationLocked, handleApiLocationSearch],
  );

  const handleSearchPeopleInputChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>, searchType: SearchType) => {
      if (searchType === SearchType.CollaboratePeople) {
        uiDispatch({
          type: "SET_ADD_PEOPLE_BOX",
          payload: { ...showAddPeapleBox, active: true, loading: true },
        });
        setPageInfo([]);
        setSelectedPeaple(null);
      } else if (searchType === SearchType.TagPeople) {
        uiDispatch({
          type: "SET_ADD_TAG_PEOPLE_BOX",
          payload: { ...showAddTagPeapleBox, active: true, loading: true },
        });
        setTagPeaple([]);
        setSelectedTagPeaple(null);
      }
      var query = e.currentTarget.value;
      // setPeopleTypingStopped(false);
      if (searchType === SearchType.CollaboratePeople) formDispatch({ type: "SET_SEARCH_PEOPLE", payload: query });
      if (searchType === SearchType.TagPeople) formDispatch({ type: "SET_SEARCH_TAG_PEOPLE", payload: query });
      if (peopleTimeOutId) clearTimeout(peopleTimeOutId);
      if (query.length > 0) {
        let timeOutId = setTimeout(() => {
          if (query && query.length > 0) {
            if (peopleLocked) return;
            setPeopleLocked(true);
            handleApiPeopleSearch(query, searchType);
            setTimeout(() => {
              setPeopleLocked(false);
            }, 2000);
          }
        }, 1000);
        setPeopleTimeOutId(timeOutId);
      }
    },
    [showAddPeapleBox, showAddTagPeapleBox, peopleTimeOutId, peopleLocked, handleApiPeopleSearch],
  );
  const handleOptionSelect = useCallback(
    (id: number) => {
      const selectedIndex = id - 1; // Adjust for the "Please select" option at index 0
      if (selectedIndex === -1) {
        setHashtagList([]);
      } else {
        const hashtag = hashtags?.[selectedIndex];
        if (hashtag) {
          setHashtagList(hashtag.hashtags);
        }
      }
      uiDispatch({ type: "SET_SELECTED_OPTIONS", payload: selectedIndex });
      uiDispatch({ type: "TOGGLE_OPTIONS", payload: false });
    },
    [hashtags],
  );

  const handleChangeCaptionTextarea = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    var value = e.target.value;
    const hashtagMatches = value.match(/#(\w+|[\u0600-\u06FF]+)/g);
    if (hashtagMatches) {
      formDispatch({ type: "SET_HASHTAGS_WORD", payload: hashtagMatches });
    } else {
      formDispatch({ type: "SET_HASHTAGS_WORD", payload: [] });
    }
    formDispatch({ type: "SET_CAPTION", payload: value });
  }, []);

  const handleKeyDownCaptionTextarea = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (hashtagsWord?.length > 31 && e.key === "#") {
        internalNotify(InternalResponseType.ExceedSelectedMaxHashtags, NotifType.Info);
        e.preventDefault();
      }
    },
    [hashtagsWord],
  );

  const handleAddHashtag = useCallback(
    (hashtag: string) => {
      console.log("Adding hashtag:", hashtag);
      if (hashtagsWord.length <= 31) {
        var newHashtagWord = [...hashtagsWord];
        newHashtagWord.push("#" + hashtag);
        formDispatch({ type: "SET_HASHTAGS_WORD", payload: newHashtagWord });
        var newCaptionWord = captionTextArea;
        newCaptionWord = newCaptionWord + " " + `#${hashtag}`;
        formDispatch({ type: "SET_CAPTION", payload: newCaptionWord });
      }
    },
    [hashtagsWord, captionTextArea],
  );

  const handleAIPromptSubmit = useCallback(
    async (aiPrompt: string) => {
      console.log("aiPrompt", aiPrompt);
      if (!aiPrompt.trim() || aiLoading) return;

      setAiLoading(true);
      try {
        const response = await clientFetchApi<boolean, string>("/api/post/GenerateCaptionWithAI", {
          methodType: MethodType.get,
          session: session,
          data: undefined,
          queries: [{ key: "prompt", value: aiPrompt }],
          onUploadProgress: undefined,
        });
        if (response.succeeded) {
          const hashtagMatches = response.value.match(/#(\w+|[\u0600-\u06FF]+)/g);
          if (hashtagMatches) {
            formDispatch({ type: "SET_HASHTAGS_WORD", payload: hashtagMatches });
          } else {
            formDispatch({ type: "SET_HASHTAGS_WORD", payload: [] });
          }
          formDispatch({ type: "SET_CAPTION", payload: response.value });
        } else notify(response.info.responseType, NotifType.Warning);
        // Reset AI states
        setShowAIInput(false);
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      } finally {
        setAiLoading(false);
      }
    },
    [aiLoading, captionTextArea, session],
  );

  const checkSpecVideo = useCallback(
    (width: number, height: number, duration: number, size: number, postTypeInput?: PostType) => {
      const type = postTypeInput ? postTypeInput : postType;
      const ALBUM_CONSTRAINTS = {
        aspectRatioMin: 0.8,
        aspectRatioMax: 1.91,
        durationMin: 3,
        durationMax: 60,
        maxSizeBytes: 25 * 1024 * 1000, // 25MB
      };

      const SINGLE_CONSTRAINTS = {
        aspectRatioMin: 0.1,
        aspectRatioMax: 10,
        durationMin: 3,
        durationMax: 900,
        maxSizeBytes: 150 * 1024 * 1000, // 150MB
      };
      if (!width || !height || !duration || isNaN(duration)) {
        internalNotify(InternalResponseType.InvalidMetaData, NotifType.Warning);
        return;
      }
      const checkAspectRatio = (width: number, height: number, min: number, max: number) => {
        const ratio = width / height;
        return ratio >= min && ratio <= max;
      };

      const checkDuration = (duration: number, min: number, max: number) => {
        return duration >= min && duration <= max;
      };

      const checkSize = (size: number, maxSize: number) => {
        return size <= maxSize;
      };

      if (type === PostType.Album) {
        const constraints = ALBUM_CONSTRAINTS;
        if (!checkAspectRatio(width, height, constraints.aspectRatioMin, constraints.aspectRatioMax)) {
          internalNotify(InternalResponseType.ExceedPermittedAspectRatioAlbum, NotifType.Warning);
          return false;
        }
        if (!checkDuration(duration, constraints.durationMin, constraints.durationMax)) {
          internalNotify(InternalResponseType.ExceedPermittedDurationOfVideoAlbum, NotifType.Warning);

          return false;
        }
        if (!checkSize(size, constraints.maxSizeBytes)) {
          internalNotify(InternalResponseType.ExceedPermittedSizeOfVideoAlbum, NotifType.Warning);

          return false;
        }
        if (width > 1920) {
          internalNotify(InternalResponseType.ExceedPermittedWidthOfVideo, NotifType.Warning);

          return false;
        }
      } else if (type === PostType.Single) {
        const constraints = SINGLE_CONSTRAINTS;
        if (!checkAspectRatio(width, height, constraints.aspectRatioMin, constraints.aspectRatioMax)) {
          internalNotify(InternalResponseType.ExceedPermittedAspectRatioReels, NotifType.Warning);

          return false;
        }
        if (!checkDuration(duration, constraints.durationMin, constraints.durationMax)) {
          internalNotify(InternalResponseType.ExceedPermittedDurationOfVideoReels, NotifType.Warning);

          return false;
        }
        if (!checkSize(size, constraints.maxSizeBytes)) {
          internalNotify(InternalResponseType.ExceedPermittedSizeOfVideoReels, NotifType.Warning);

          return false;
        }
        if (width > 1920) {
          internalNotify(InternalResponseType.ExceedPermittedWidthOfVideo, NotifType.Warning);

          return false;
        }
      }

      return true;
    },
    [postType],
  );

  const checkSpecImage = useCallback((width: number, height: number, size: number) => {
    if (size > 8192000) {
      internalNotify(InternalResponseType.ExceedPermittedSizeOfImage, NotifType.Warning);
      return false;
    }
    return true;
  }, []);

  const checkChangePostToAlbum = useCallback(() => {
    if (showMedias.length > 0 && showMedias[0].mediaType === MediaType.Video) {
      mediaDispatch({
        type: "UPDATE_MEDIA",
        payload: {
          index: 0,
          media: {
            coverId: "",
            cover: "",
            coverUri: null,
          },
        },
      });
      if (
        !checkSpecVideo(
          showMedias[0].width,
          showMedias[0].height,
          showMedias[0].duration,
          showMedias[0].size,
          PostType.Album,
        )
      ) {
        uiDispatch({ type: "TOGGLE_CHANGE_POST_TO_ALBUM", payload: true });
      }
    }
  }, [showMedias, checkSpecVideo]);
  const handleSelectAlbumMedia = (e: ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (file == undefined) return;
    console.log("fileeeeeeeeeeeeeeeeeeee", file);
    if (file) {
      const reader = new FileReader();
      const extension = file.name.split(".").pop()?.toLowerCase();
      reader.onload = () => {
        var selectedMedia1 = reader.result as string;
        let mediaType: MediaType;
        // console.log("handleSelectAlbumMedia", file.type);
        if (file === undefined) return;
        if (file.type.startsWith("image/") || file.type.length === 0) {
          new ImageCompressor(file, {
            quality: 0.95,
            maxWidth: 700,
            maxHeight: 700,
            mimeType: "image/jpeg",
            success(result) {
              const reader = new FileReader();
              reader.onload = () => {
                const selectedMedia1 = reader.result as string;
                mediaType = MediaType.Image;
                const img = new Image();
                img.onload = async () => {
                  const width = img.width;
                  const height = img.height;
                  if (!file) return;
                  if (!checkSpecImage(width, height, file.size)) return;
                  if (width / height < 0.8 || width / height > 1.91) {
                    // Crop the image to the allowed aspect ratio (0.8 - 1.91)
                    const allowedMin = 0.8;
                    const allowedMax = 1.91;
                    let newWidth = width;
                    let newHeight = height;

                    if (width / height < allowedMin) {
                      newWidth = width;
                      newHeight = Math.round(width / allowedMin);
                    } else if (width / height > allowedMax) {
                      newHeight = height;
                      newWidth = Math.round(height * allowedMax);
                    }

                    const sx = Math.floor((width - newWidth) / 2);
                    const sy = Math.floor((height - newHeight) / 2);

                    const canvas = document.createElement("canvas");
                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                      ctx.drawImage(img, sx, sy, newWidth, newHeight, 0, 0, newWidth, newHeight);
                      const croppedDataUrl = canvas.toDataURL("image/jpeg");
                      canvas.toBlob(async (blob) => {
                        if (!blob) return;
                        mediaDispatch({
                          type: "SET_LOADING_UPLOAD",
                          payload: true,
                        });
                        if (!file) return;
                        const croppedFile = new File([blob], file.name, {
                          type: "image/jpeg",
                        });
                        const res = await UploadFile(session, croppedFile);
                        mediaDispatch({
                          type: "SET_LOADING_UPLOAD",
                          payload: false,
                        });
                        mediaDispatch({
                          type: "ADD_MEDIA",
                          payload: {
                            mediaUri: null,
                            error: "",
                            mediaType: mediaType,
                            media: croppedDataUrl,
                            tagPeaple: [],
                            cover: "",
                            width: newWidth,
                            height: newHeight,
                            mediaUploadId: res ? res.fileName : "",
                            coverId: "",
                            duration: 0,
                            size: blob.size,
                            coverUri: null,
                          },
                        });
                        mediaDispatch({
                          type: "SET_MEDIA_INDEX",
                          payload: showMedias.length,
                        });
                      }, "image/jpeg");
                    }
                    return;
                  }
                  mediaDispatch({ type: "SET_LOADING_UPLOAD", payload: true });
                  const res = await UploadFile(session, file!);
                  mediaDispatch({ type: "SET_LOADING_UPLOAD", payload: false });
                  mediaDispatch({
                    type: "ADD_MEDIA",
                    payload: {
                      mediaUri: null,
                      error: "",
                      mediaType: mediaType,
                      media: selectedMedia1,
                      tagPeaple: [],
                      cover: "",
                      width: width,
                      height: height,
                      mediaUploadId: res ? res.fileName : "",
                      coverId: "",
                      duration: 0,
                      size: file ? file.size : 0,
                      coverUri: null,
                    },
                  });
                  mediaDispatch({
                    type: "SET_MEDIA_INDEX",
                    payload: showMedias.length,
                  });
                };
                img.src = selectedMedia1;
              };
              reader.readAsDataURL(result);
            },
            error(err) {
              internalNotify(InternalResponseType.NotPermittedMediaType, NotifType.Warning);
            },
          });
        } else if (
          file.type === "video/mp4" ||
          file.type === "video/quicktime" ||
          extension === "mp4" ||
          extension === "mov"
        ) {
          mediaType = MediaType.Video;
          const video = document.createElement("video");
          video.onloadedmetadata = async () => {
            const width = video.videoWidth;
            const height = video.videoHeight;
            if (file === undefined) return;
            if (!checkSpecVideo(width, height, video.duration, file.size)) return;
            mediaDispatch({ type: "SET_LOADING_UPLOAD", payload: true });
            // console.log("video file", file);
            const res = await UploadFile(session, file!);
            mediaDispatch({ type: "SET_LOADING_UPLOAD", payload: false });
            mediaDispatch({
              type: "ADD_MEDIA",
              payload: {
                mediaUri: null,
                error: "",
                mediaType: mediaType,
                media: selectedMedia1,
                tagPeaple: [],
                cover: "",
                height: width,
                width: height,
                mediaUploadId: res ? res.fileName : "",
                coverId: "",
                duration: video.duration,
                size: file !== undefined ? file.size : 0,
                coverUri: null,
              },
            });
            mediaDispatch({
              type: "SET_MEDIA_INDEX",
              payload: showMedias.length,
            });
            // setRefresh(!refresh);
          };
          video.src = selectedMedia1;
        } else {
          internalNotify(InternalResponseType.NotPermittedMediaType, NotifType.Warning);
          return;
        }
      };
      reader.readAsDataURL(file);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };
  const handleSelectCover = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && showMediaIndex === 0 && postType === PostType.Single) {
      if (file.type !== "image/jpeg" && file.type !== "image/jpg") {
        internalNotify(InternalResponseType.NotPermittedMediaType, NotifType.Warning);
        return;
      }
      mediaDispatch({ type: "SET_LOADING_UPLOAD", payload: true });
      const res = await UploadFile(session, file);
      mediaDispatch({ type: "SET_LOADING_UPLOAD", payload: false });
      console.log("coverrrrrrrrrrrrr", res);
      // You can display a preview of the selected image if needed.
      const reader = new FileReader();
      const img = new Image();
      reader.onload = () => {
        const width = img.width;
        const height = img.height;
        if (!checkSpecImage(width, height, file.size)) return;
        var selectedMedia1 = reader.result as string;
        mediaDispatch({
          type: "UPDATE_MEDIA",
          payload: {
            index: 0,
            media: {
              cover: selectedMedia1,
              coverId: res ? res.fileName : "",
              coverUri: null,
            },
          },
        });
      };
      reader.readAsDataURL(file);
      if (inputCoverRef.current) {
        inputCoverRef.current.value = "";
      }
    }
  };
  const handleDeleteCover = () => {
    if (showMedias.length > 0 && showMedias[0].coverId.length === 0) return;
    mediaDispatch({
      type: "UPDATE_MEDIA",
      payload: {
        index: 0,
        media: {
          cover: "",
          coverId: "",
          coverUri: null,
        },
      },
    });
  };
  const handleReplaceMedia = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        var selectedMedia1 = reader.result as string;
        let mediaType: MediaType;
        if (file === undefined) return;
        console.log("handleReplaceMedia", file.type);
        if (file.type.startsWith("image/") || file.type.length === 0) {
          new ImageCompressor(file, {
            quality: 0.95,
            maxWidth: 700,
            maxHeight: 700,
            mimeType: "image/jpeg",
            success(result) {
              const reader = new FileReader();
              reader.onload = () => {
                const selectedMedia1 = reader.result as string;
                mediaType = MediaType.Image;
                const img = new Image();
                img.onload = async () => {
                  const width = img.width;
                  const height = img.height;
                  if (!file) return;
                  if (!checkSpecImage(width, height, file.size)) return;
                  if (width / height < 0.8 || width / height > 1.91) {
                    // Crop the image to the allowed aspect ratio (0.8 - 1.91)
                    const allowedMin = 0.8;
                    const allowedMax = 1.91;
                    let newWidth = width;
                    let newHeight = height;

                    if (width / height < allowedMin) {
                      newWidth = width;
                      newHeight = Math.round(width / allowedMin);
                    } else if (width / height > allowedMax) {
                      newHeight = height;
                      newWidth = Math.round(height * allowedMax);
                    }

                    const sx = Math.floor((width - newWidth) / 2);
                    const sy = Math.floor((height - newHeight) / 2);

                    const canvas = document.createElement("canvas");
                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                      ctx.drawImage(img, sx, sy, newWidth, newHeight, 0, 0, newWidth, newHeight);
                      const croppedDataUrl = canvas.toDataURL("image/jpeg");
                      canvas.toBlob(async (blob) => {
                        if (!blob) return;
                        mediaDispatch({
                          type: "SET_LOADING_UPLOAD",
                          payload: true,
                        });
                        if (!file) return;
                        const croppedFile = new File([blob], file.name, {
                          type: "image/jpeg",
                        });
                        const res = await UploadFile(session, croppedFile);
                        mediaDispatch({
                          type: "SET_LOADING_UPLOAD",
                          payload: false,
                        });
                        mediaDispatch({
                          type: "UPDATE_MEDIA",
                          payload: {
                            index: showMediaIndex,
                            media: {
                              error: "",
                              mediaType: mediaType,
                              media: croppedDataUrl,
                              tagPeaple: [],
                              cover: "",
                              width: newWidth,
                              height: newHeight,
                              mediaUploadId: res ? res.fileName : "",
                              coverId: "",
                              duration: 0,
                              size: blob.size,
                              mediaUri: null,
                              coverUri: null,
                            },
                          },
                        });
                      }, "image/jpeg");
                    }
                    return;
                  }
                  mediaDispatch({ type: "SET_LOADING_UPLOAD", payload: true });
                  const res = await UploadFile(session, file!);
                  mediaDispatch({ type: "SET_LOADING_UPLOAD", payload: false });
                  mediaDispatch({
                    type: "UPDATE_MEDIA",
                    payload: {
                      index: showMediaIndex,
                      media: {
                        error: "",
                        mediaType: mediaType,
                        media: selectedMedia1,
                        tagPeaple: [],
                        cover: "",
                        width: width,
                        height: height,
                        mediaUploadId: res ? res.fileName : "",
                        coverId: "",
                        duration: 0,
                        size: file.size,
                        mediaUri: null,
                        coverUri: null,
                      },
                    },
                  });
                };
                img.src = selectedMedia1;
              };
              reader.readAsDataURL(result);
            },
            error(err) {
              internalNotify(InternalResponseType.NotPermittedMediaType, NotifType.Warning);
            },
          });
        } else if (file.type == "video/mp4") {
          mediaType = MediaType.Video;
          const video = document.createElement("video");
          video.onloadedmetadata = async () => {
            const width = video.videoWidth;
            const height = video.videoHeight;
            if (!checkSpecVideo(width, height, video.duration, file.size)) return;
            mediaDispatch({ type: "SET_LOADING_UPLOAD", payload: true });
            const res = await UploadFile(session, file!);
            mediaDispatch({ type: "SET_LOADING_UPLOAD", payload: false });
            mediaDispatch({
              type: "UPDATE_MEDIA",
              payload: {
                index: showMediaIndex,
                media: {
                  error: "",
                  mediaType: mediaType,
                  media: selectedMedia1,
                  tagPeaple: [],
                  cover: "",
                  width: width,
                  height: height,
                  mediaUploadId: res ? res.fileName : "",
                  coverId: "",
                  duration: video.duration,
                  size: file.size,
                  mediaUri: null,
                  coverUri: null,
                },
              },
            });
          };
          video.src = selectedMedia1;
        } else {
          internalNotify(InternalResponseType.NotPermittedMediaType, NotifType.Warning);
        }
      };
      reader.readAsDataURL(file);
    }
    if (inputReplaceRef.current) {
      inputReplaceRef.current.value = "";
    }
  };
  const handleUploadImage = useCallback(() => {
    console.log("clickkkkkkkkkkk22222");

    const uploadElement = document.getElementById("AddMedia");
    if (uploadElement) {
      uploadElement.click();
    }
  }, []);

  const handleUploadCoverImage = useCallback(() => {
    if (!currentMediaConstraints?.canUploadCover) return;
    if (inputCoverRef.current) {
      inputCoverRef.current.click();
    }
  }, [currentMediaConstraints]);

  const handleUploadRepalceMedia = useCallback(() => {
    if (inputReplaceRef.current) {
      inputReplaceRef.current.click();
    }
  }, []);

  const handleDedleteMedia = useCallback(() => {
    console.log("showMediaIndex", showMediaIndex);
    mediaDispatch({ type: "DELETE_MEDIA", payload: showMediaIndex });
  }, [showMediaIndex]);

  const handleSelectLocation = useCallback((e: MouseEvent<HTMLDivElement>, location: ILocation) => {
    e.stopPropagation();
    setSelectedLocation(location);
    formDispatch({ type: "SET_SEARCH_LOCATION", payload: location.name });
    uiDispatch({
      type: "SET_LOCATION_BOX",
      payload: { active: false, loading: false, noresult: false },
    });
  }, []);

  const handleSelectPage = useCallback(
    (e: MouseEvent<HTMLDivElement>, page: IPageInfo) => {
      e.stopPropagation();

      // Check collaborator constraints before setting selection
      if (collabratorPages.length > 4) {
        internalNotify(InternalResponseType.ExceedSelectedCollaboratorPage, NotifType.Warning);
        return;
      }

      if (collabratorPages.find((x) => x === page.username)) {
        internalNotify(InternalResponseType.RepetitiveCollaboratorPage, NotifType.Warning);
        return;
      }

      // Auto-add the selected collaborator
      setCollabratorPages((prev) => [...prev, page.username]);
      formDispatch({ type: "SET_SEARCH_PEOPLE", payload: "" });
      uiDispatch({
        type: "SET_ADD_PEOPLE_BOX",
        payload: { active: false, loading: false, noresult: false },
      });
    },
    [collabratorPages],
  );

  const handleSelectTag = useCallback(
    (e: MouseEvent<HTMLDivElement>, page: IPageInfo) => {
      if (totalTaggedPeopleCount > 30) {
        internalNotify(InternalResponseType.ExceedSelectedMaxTaggedPeople, NotifType.Warning);
        return;
      }
      e.stopPropagation();
      setSelectedTagPeaple(page);
      formDispatch({ type: "SET_SEARCH_TAG_PEOPLE", payload: page.username });
      uiDispatch({
        type: "SET_ADD_TAG_PEOPLE_BOX",
        payload: { active: false, loading: false, noresult: false },
      });
    },
    [totalTaggedPeopleCount],
  );

  const handleTagPeaple = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (showMediaIndex === 0 && collabratorPages.includes(searchTagPeaple)) {
        internalNotify(InternalResponseType.ExistedInCollaborate, NotifType.Info);
        return;
      }
      formDispatch({ type: "SET_SEARCH_TAG_PEOPLE", payload: "" });
      mediaDispatch({
        type: "UPDATE_MEDIA_TAGS",
        payload: {
          index: showMediaIndex,
          tags:
            selectedTagPeaple &&
            !showMedias[showMediaIndex].tagPeaple.find((z) => z.username === selectedTagPeaple.username)
              ? [...showMedias[showMediaIndex].tagPeaple, { username: selectedTagPeaple.username, x: 0.5, y: 0.5 }]
              : showMedias[showMediaIndex].tagPeaple,
        },
      });
    },
    [showMediaIndex, collabratorPages, searchTagPeaple, selectedTagPeaple, showMedias],
  );
  const handleStopDrag = useCallback(
    (username: string, position: { x: number; y: number }, deltaX: number, deltaY: number) => {
      if (prePostId > 0) return;
      var nShowMedias = [...showMedias];
      var currentShowMedia = showMedias[showMediaIndex];
      var indexCurrentTag = currentShowMedia.tagPeaple?.findIndex((x) => x.username === username);
      var currentTag = currentShowMedia.tagPeaple?.find((x) => x.username === username);
      if (currentTag && indexCurrentTag !== undefined && indexCurrentTag >= 0) {
        let minX =
          showMedias[showMediaIndex].width < showMedias[showMediaIndex].height
            ? renderWidthSize * (0.5 - (0.5 * showMedias[showMediaIndex].width) / showMedias[showMediaIndex].height)
            : 0;
        let maxX =
          showMedias[showMediaIndex].width < showMedias[showMediaIndex].height
            ? renderWidthSize * (0.5 + (0.5 * showMedias[showMediaIndex].width) / showMedias[showMediaIndex].height)
            : renderWidthSize;
        let minY =
          showMedias[showMediaIndex].height < showMedias[showMediaIndex].width
            ? renderWidthSize * (0.5 - (0.5 * showMedias[showMediaIndex].height) / showMedias[showMediaIndex].width)
            : 0;
        let maxY =
          showMedias[showMediaIndex].height < showMedias[showMediaIndex].width
            ? renderWidthSize * (0.5 + (0.5 * showMedias[showMediaIndex].height) / showMedias[showMediaIndex].width)
            : renderWidthSize;
        console.log("maxY-MinY", maxY - minY);
        console.log("Position", position);
        let _x = (position.x + deltaX - minX) / (maxX - minX);
        let _y = (position.y + deltaY - minY) / (maxY - minY);
        console.log("Current position ", username, _x, _y);
        if (_x < 0) _x = 0;
        if (_x > 1) _x = 1;
        if (_y < 0) _y = 0;
        if (_y > 1) _y = 1;
        currentTag.x = _x;
        currentTag.y = _y;

        currentShowMedia.tagPeaple[indexCurrentTag] = currentTag;
        nShowMedias[showMediaIndex] = currentShowMedia;
        mediaDispatch({ type: "SET_SHOW_MEDIAS", payload: nShowMedias });
      }
      console.log(showMedias);
    },
    [prePostId, showMedias, showMediaIndex, renderWidthSize],
  );

  const handleChangeAlbumChildren = useCallback(
    (index: number) => {
      mediaDispatch({ type: "SET_MEDIA_INDEX", payload: index });
      var nTagPeaples = showMedias[index].tagPeaple;
      // Removed setRefresh call as it's no longer needed
    },
    [showMedias],
  );

  const handleDeleteTag = useCallback(
    (username: string) => {
      if (prePostId > 0) return;
      const newTags = showMedias[showMediaIndex].tagPeaple?.filter((x) => x.username !== username) || [];
      mediaDispatch({
        type: "UPDATE_MEDIA_TAGS",
        payload: {
          index: showMediaIndex,
          tags: newTags,
        },
      });
    },
    [prePostId, showMedias, showMediaIndex],
  );

  const removeMask = useCallback(() => {
    uiDispatch({ type: "TOGGLE_SET_DATE_TIME", payload: false });
    uiDispatch({ type: "TOGGLE_DRAFT", payload: false });
    uiDispatch({ type: "SET_DRAFT_ERROR", payload: null });
    uiDispatch({ type: "TOGGLE_DELETE_DRAFT", payload: false });
  }, []);

  const saveDateAndTime = useCallback(
    (date: string | undefined) => {
      formDispatch({ type: "SET_REC_TIME_SELECT", payload: -1 });
      if (date !== undefined) {
        let dateInt = parseInt(date);
        formDispatch({ type: "SET_DATE_TIME", payload: dateInt });
        removeMask();
      }
    },
    [removeMask],
  );

  const handleShowDraft = useCallback(() => {
    if (showMedias.length > 0 && prePostId <= 0) uiDispatch({ type: "TOGGLE_DRAFT", payload: true });
    else closeCreatePost();
  }, [showMedias, prePostId, closeCreatePost]);

  const handleShowDeleteDraft = useCallback(() => {
    if (draftId > 0) uiDispatch({ type: "TOGGLE_DELETE_DRAFT", payload: true });
    else if (prePostId > 0) uiDispatch({ type: "TOGGLE_DELETE_PREPOST", payload: true });
    else closeCreatePost();
  }, [draftId, prePostId, closeCreatePost]);
  const handleGetDraftPost = async (draftId: string) => {
    console.log("draftId", draftId);
    try {
      let draftRes = await clientFetchApi<boolean, IDraftInfo>("/api/post/GetDraft", {
        methodType: MethodType.get,
        session: session,
        data: undefined,
        queries: [{ key: "draftId", value: draftId }],
        onUploadProgress: undefined,
      });
      if (draftRes.succeeded) {
        const draft = draftRes.value;
        setDraftId(Number(draftId));
        if (draft.errorMessage) {
          const errorMsg: IErrorPrePostInfo = JSON.parse(draft.errorMessage);
          uiDispatch({ type: "SET_DRAFT_ERROR", payload: errorMsg });
        }
        formDispatch({
          type: "TOGGLE_QUICK_REPLY",
          payload: draft.automaticMediaReply ? true : false,
        });
        setAutoReply({
          items: draft.automaticMediaReply
            ? draft.automaticMediaReply.keys.map((x) => ({
                id: "",
                sendCount: 0,
                text: x,
              }))
            : [],
          replySuccessfullyDirected: draft.automaticMediaReply
            ? draft.automaticMediaReply.replySuccessfullyDirected
            : false,
          response: draft.automaticMediaReply ? draft.automaticMediaReply.response : "",
          sendPr: draft.automaticMediaReply ? draft.automaticMediaReply.sendPr : false,
          shouldFollower: draft.automaticMediaReply ? draft.automaticMediaReply.shouldFollower : false,
          automaticType: draft.automaticMediaReply
            ? draft.automaticMediaReply.automaticType
            : AutoReplyPayLoadType.KeyWord,
          masterFlow: null,
          masterFlowId: draft.automaticMediaReply ? draft.automaticMediaReply.masterFlowId : "",
          mediaId: "",
          pauseTime: Date.now(),
          productType: MediaProductType.Feed,
          prompt: null,
          promptId: draft.automaticMediaReply ? draft.automaticMediaReply.promptId : "",
          sendCount: 0,
        });
        setCollabratorPages(draft.collaborators);
        formDispatch({ type: "SET_CAPTION", payload: draft.caption });
        setSelectedLocation(draft.location);
        formDispatch({
          type: "TOGGLE_TURN_OFF_COMMENT",
          payload: !draft.commentEnabled,
        });
        formDispatch({
          type: "TOGGLE_ADD_TO_PRODUCT",
          payload: draft.isProduct,
        });
        mediaDispatch({
          type: "SET_POST_TYPE",
          payload: draft.draftChildren.length > 0 ? PostType.Album : PostType.Single,
        });
        console.log("mediaType", draft.mediaType);
        const params: IUiParameter[] = JSON.parse(draft.uiParameters);
        if (draft.mediaType == MediaType.Image) {
          let media = [
            {
              cover: "",
              error: "",
              height: params[0].height,
              mediaUri: basePictureUrl + draft.mediaUrl!,
              media: basePictureUrl + draft.mediaUrl!,
              mediaType: MediaType.Image,
              tagPeaple: draft.userTags,
              width: params[0].width,
              mediaUploadId: draft.mediaUrl!,
              coverId: "",
              duration: params[0].duration,
              size: params[0].size,
              coverUri: null,
            },
          ];
          console.log("media image", media);
          mediaDispatch({ type: "SET_SHOW_MEDIAS", payload: media });
        } else if (draft.mediaType == MediaType.Video) {
          // setSharePreviewToFeed(draft.sendPreviewToFeed);
          let media = [
            {
              coverUri: basePictureUrl + draft.thumbnailMediaUrl,
              error: "",
              height: params[0].height,
              mediaUri: basePictureUrl + draft.mediaUrl!,
              media: basePictureUrl + draft.mediaUrl!,
              cover: basePictureUrl + draft.thumbnailMediaUrl,
              mediaType: MediaType.Video,
              tagPeaple: draft.userTags,
              width: params[0].width,
              mediaUploadId: draft.mediaUrl!,
              coverId: draft.thumbnailMediaUrl,
              duration: params[0].duration,
              size: params[0].size,
            },
          ];
          mediaDispatch({ type: "SET_SHOW_MEDIAS", payload: media });
          console.log("videoMedia", media);
        } else if (draft.mediaType == MediaType.Carousel) {
          let medias: IShowMedia[] = [];
          for (let i = 0; i < draft?.draftChildren.length; i++) {
            let child = draft.draftChildren[i];
            medias.push({
              coverUri: child.mediaType == MediaType.Video ? basePictureUrl + child.thumbnailMediaUrl : null,
              cover: child.mediaType == MediaType.Video ? basePictureUrl + child.thumbnailMediaUrl : "",
              height: params[i].height,
              mediaUri: basePictureUrl + child.mediaUrl,
              media: basePictureUrl + child.mediaUrl,
              error: "",
              mediaType: child.mediaType,
              tagPeaple: child.userTags,
              width: params[i].width,
              mediaUploadId: child.mediaUrl,
              coverId: child.mediaType == MediaType.Video ? child.thumbnailMediaUrl : "",
              duration: params[i].duration,
              size: params[i].size,
            });
          }
          mediaDispatch({ type: "SET_SHOW_MEDIAS", payload: medias });
        }
        console.log("draftId", draftId);
        console.log("draft from server", draftRes.value);
      } else notify(draftRes.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  };
  async function handleGetPrePost(prePostId: string) {
    try {
      const res = await clientFetchApi<boolean, IPrePostInfo>("Instagramer" + "" + "/Post/GetPrePost", {
        methodType: MethodType.get,
        session: session,
        data: undefined,
        queries: [{ key: "prePostId", value: prePostId?.toString() }],
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        const prePost = res.value;
        setDraftId(Number(draftId));
        formDispatch({
          type: "TOGGLE_QUICK_REPLY",
          payload: prePost.automaticMediaReply ? true : false,
        });
        setAutoReply(
          prePost.automaticMediaReply
            ? prePost.automaticMediaReply
            : {
                items: [],
                response: "",
                sendPr: false,
                shouldFollower: false,
                automaticType: AutoReplyPayLoadType.AI,
                masterFlow: null,
                masterFlowId: null,
                replySuccessfullyDirected: false,
                mediaId: "",
                pauseTime: Date.now(),
                productType: MediaProductType.Feed,
                prompt: null,
                promptId: null,
                sendCount: 0,
              },
        );
        setCollabratorPages(prePost.collaborators);
        formDispatch({ type: "SET_CAPTION", payload: prePost.caption });
        setSelectedLocation(prePost.location);
        formDispatch({
          type: "TOGGLE_TURN_OFF_COMMENT",
          payload: !prePost.commentEnabled,
        });
        formDispatch({
          type: "TOGGLE_ADD_TO_PRODUCT",
          payload: prePost.isProduct,
        });
        mediaDispatch({
          type: "SET_POST_TYPE",
          payload: prePost.prePostChildren.length > 0 ? PostType.Album : PostType.Single,
        });
        formDispatch({
          type: "SET_DATE_TIME",
          payload: prePost.upingTime * 1e3,
        });
        formDispatch({ type: "TOGGLE_AUTOMATIC_POST", payload: true });
        console.log("mediaType", prePost.mediaType);
        const params: IUiParameter[] = JSON.parse(prePost.uiParameters);
        if (prePost.mediaType == MediaType.Image) {
          let media = [
            {
              cover: "",
              error: "",
              height: params[0].height,
              mediaUri: basePictureUrl + prePost.mediaUrl!,
              media: basePictureUrl + prePost.mediaUrl!,
              mediaType: MediaType.Image,
              tagPeaple: prePost.userTags,
              width: params[0].width,
              mediaUploadId: prePost.mediaUrl!,
              coverId: "",
              duration: params[0].duration,
              size: params[0].size,
              coverUri: null,
            },
          ];
          console.log("media image", media);
          mediaDispatch({ type: "SET_SHOW_MEDIAS", payload: media });
        } else if (prePost.mediaType == MediaType.Video) {
          let media = [
            {
              coverUri: basePictureUrl + prePost.thumbnailMediaUrl,
              error: "",
              height: params[0].height,
              mediaUri: basePictureUrl + prePost.mediaUrl!,
              media: basePictureUrl + prePost.mediaUrl!,
              cover: basePictureUrl + prePost.thumbnailMediaUrl,
              mediaType: MediaType.Video,
              tagPeaple: prePost.userTags,
              width: params[0].width,
              mediaUploadId: prePost.mediaUrl!,
              coverId: prePost.thumbnailMediaUrl,
              duration: params[0].duration,
              size: params[0].size,
            },
          ];
          mediaDispatch({ type: "SET_SHOW_MEDIAS", payload: media });
          console.log("videoMedia", media);
        } else if (prePost.mediaType == MediaType.Carousel) {
          let medias: IShowMedia[] = [];
          for (let i = 0; i < prePost?.prePostChildren.length; i++) {
            let child = prePost.prePostChildren[i];
            medias.push({
              coverUri: child.mediaType == MediaType.Video ? basePictureUrl + child.thumbnailMediaUrl : null,
              cover: child.mediaType == MediaType.Video ? basePictureUrl + child.thumbnailMediaUrl : "",
              height: params[i].height,
              mediaUri: basePictureUrl + child.mediaUrl,
              media: basePictureUrl + child.mediaUrl,
              error: "",
              mediaType: child.mediaType,
              tagPeaple: child.userTags,
              width: params[i].width,
              mediaUploadId: child.mediaUrl,
              coverId: child.mediaType == MediaType.Video ? child.thumbnailMediaUrl : "",
              duration: params[i].duration,
              size: params[i].size,
            });
          }
          mediaDispatch({ type: "SET_SHOW_MEDIAS", payload: medias });
        }
        setPrePostId(res.value.prePostId);
        console.log("prePostId", draftId);
        console.log("prePost from server", res.value);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }
  // function initialzedTime() {
  //   const lng = window.localStorage.getItem("language");
  //   const calendar = window.localStorage.getItem("calendar");
  //   switch (lng) {
  //     case "en":
  //       setLocale(english);
  //       break;
  //     case "fa":
  //       setLocale(persian_fa);
  //       break;
  //     case "ar":
  //       setLocale(arabic_ar);
  //       break;
  //     default:
  //       setLocale(english);
  //       break;
  //   }
  //   switch (calendar) {
  //     case "Gregorian":
  //       setCalendar(gregorian);
  //       break;
  //     case "shamsi":
  //       setCalendar(persian);
  //       break;
  //     case "Hijri":
  //       setCalendar(arabic);
  //       break;
  //     case "Hindi":
  //       setCalendar(indian);
  //       break;
  //   }
  // }
  const getPublishLimitContent = useCallback(async () => {
    if (!session) return;
    try {
      var res = await clientFetchApi<boolean, IPublishLimit>("Instagramer" + "" + "/Post/GetPublishLimitContent", {
        methodType: MethodType.get,
        session: session,
        data: undefined,
        queries: undefined,
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        if (res.value.total === res.value.usage) {
          formDispatch({ type: "TOGGLE_AUTOMATIC_POST", payload: true });
          formDispatch({ type: "TOGGLE_ACTIVE_LIMIT_TIME", payload: true });
        }
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, [session]);
  const handleSelectCollabratorPage = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!selectedPeaple) return;
      e.stopPropagation();
      if (collabratorPages.length > 4) {
        internalNotify(InternalResponseType.ExceedSelectedCollaboratorPage, NotifType.Warning);
        formDispatch({ type: "SET_SEARCH_PEOPLE", payload: "" });
        setSelectedPeaple(null);
      } else if (collabratorPages.find((x) => x === selectedPeaple!.username)) {
        internalNotify(InternalResponseType.RepetitiveCollaboratorPage, NotifType.Warning);
        formDispatch({ type: "SET_SEARCH_PEOPLE", payload: "" });
        setSelectedPeaple(null);
      } else if (!collabratorPages.find((x) => x === selectedPeaple!.username)) {
        setCollabratorPages((prev) => [...prev, selectedPeaple!.username]);
        formDispatch({ type: "SET_SEARCH_PEOPLE", payload: "" });
        setSelectedPeaple(null);
      }
    },
    [collabratorPages, selectedPeaple],
  );

  const handleVerifyDeleteReels = useCallback((): void => {
    mediaDispatch({ type: "CLEAR_MEDIAS" });
    uiDispatch({ type: "TOGGLE_CHANGE_POST_TO_ALBUM", payload: false });
  }, []);

  const handleCanselDeleteReels = useCallback((): void => {
    mediaDispatch({ type: "SET_POST_TYPE", payload: PostType.Single });
    uiDispatch({ type: "TOGGLE_CHANGE_POST_TO_ALBUM", payload: false });
  }, []);

  const handleDeletePrePost = useCallback(async () => {
    try {
      const res = await clientFetchApi<boolean, boolean>("Instagramer" + "" + "/Post/DeletePrePost", {
        methodType: MethodType.get,
        session: session,
        data: undefined,
        queries: [{ key: "prePostId", value: prePostId.toString() }],
        onUploadProgress: undefined,
      });
      if (res.succeeded) {
        closeCreatePost();
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, [session, prePostId, closeCreatePost]);
  useEffect(() => {
    if (!session || status !== "authenticated") return;
    if (!isDataLoaded && router.isReady) {
      // checkCanCreatePrePost();
      if (query.draftId !== undefined) {
        handleGetDraftPost(query.draftId as string);
      } else if (query.prePostId !== undefined) handleGetPrePost(query.prePostId as string);
      getCaptionPrompt();
      getHashtagList();
      GetNextBestTimes();
      getPublishLimitContent();
      setIsDataLoaded(true);
    }
  }, [
    session,
    status,
    router.isReady,
    query.draftId,
    query.prePostId,
    isDataLoaded,
    getHashtagList,
    GetNextBestTimes,
    getPublishLimitContent,
  ]);
  const handleMainContentClick = useCallback(() => {
    uiDispatch({
      type: "SET_ADD_PEOPLE_BOX",
      payload: { active: false, loading: false, noresult: false },
    });
    uiDispatch({
      type: "SET_ADD_TAG_PEOPLE_BOX",
      payload: { active: false, loading: false, noresult: false },
    });
    uiDispatch({
      type: "SET_LOCATION_BOX",
      payload: { active: false, loading: false, noresult: false },
    });
    formDispatch({
      type: "SET_SEARCH_LOCATION",
      payload: selectedLocation ? selectedLocation.name : "",
    });
    formDispatch({
      type: "SET_SEARCH_PEOPLE",
      payload: selectedPeaple ? selectedPeaple.username : "",
    });
    formDispatch({
      type: "SET_SEARCH_TAG_PEOPLE",
      payload: selectedTagPeaple ? selectedTagPeaple.username : "",
    });
  }, [selectedLocation, selectedPeaple, selectedTagPeaple]);

  const handleToggleTurnOffComment = useCallback(() => {
    if (prePostId > 0) return;
    let value = !turnOffComment;
    formDispatch({ type: "SET_TURN_OFF_COMMENT", payload: value });
  }, [prePostId, turnOffComment]);

  const handleToggleAutomaticPost = useCallback(() => {
    if (prePostId > 0) return;
    let value = !automaticPost;
    formDispatch({ type: "SET_REC_TIME_SELECT", payload: -1 });
    formDispatch({ type: "TOGGLE_AUTOMATIC_POST", payload: value });
  }, [prePostId, automaticPost]);

  const handleOpenDateTimePicker = useCallback(() => {
    if (prePostId > 0) return;
    uiDispatch({ type: "TOGGLE_SET_DATE_TIME", payload: true });
  }, [prePostId]);

  const handlePublishPost = useCallback(() => {
    if (prePostId > 0) return;
    HandleUpload(false);
    closeCreatePost();
  }, [prePostId, HandleUpload, closeCreatePost]);

  const handleSaveDraft = useCallback(async () => HandleUpload(true), [HandleUpload]);

  const handleCancelDraft = useCallback(() => closeCreatePost(), [closeCreatePost]);

  const handleToggleDeletePrepost = useCallback(() => {
    uiDispatch({ type: "TOGGLE_DELETE_PREPOST", payload: false });
  }, []);
  if (session?.user.currentIndex === -1) router.push("/user");
  if (session && !packageStatus(session)) router.push("/upgrade");
  return (
    session &&
    session.user.currentIndex !== -1 &&
    query.newschedulepost && (
      <>
        {/* head for SEO */}
        <Head>
          {" "}
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
          <title>{`Bran.cy ▸ Create Post #${tempId}`}</title>
          {/* Primary meta tags */}
          <meta
            name="description"
            content="Professional Instagram post creator and scheduler with advanced media management tools"
          />
          <meta
            name="keywords"
            content="instagram post creator, post scheduler, social media management, Brancy, hashtag manager, instagram tools"
          />
          {/* OpenGraph meta tags */}
          <meta name="theme-color" content="#2977ff"></meta>
          <meta property="og:title" content={`Bran.cy - Create Post #${tempId}`} />
          <meta property="og:description" content="Professional Instagram post creator and scheduler" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://www.brancy.app/page/posts" />
          {/* Twitter meta tags */}
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content="Bran.cy Post Creator" />
          <meta name="twitter:description" content="Create and schedule Instagram posts professionally" />
          {/* Other meta tags */}
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://www.brancy.app/page/posts" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        {/* head for SEO */}

        <div onClick={handleMainContentClick} className="fullScreenPupup_bg">
          <div className="fullScreenPupup_header">
            <div className={styles.titlecontainer} title={`ℹ️ Post no. ${tempId}`}>
              {t(LanguageKey.CreateNewPost)}
              {/* <span style={{ fontSize: "12px" }}>({tempId})</span> */}
            </div>
            <div className={styles.titleCard}>
              {draftId > 0 || prePostId > 0 ? (
                <div title="ℹ️ Delete" onClick={handleShowDeleteDraft} className={styles.headerIconcontainer}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="var(--text-h1)" viewBox="0 0 36 36">
                    <path
                      opacity=".4"
                      d="M29.4 23.5 29 28a7 7 0 0 1-1.1 3 7 7 0 0 1-2.2 2.1q-1.3.8-3.1 1h-9.2a7 7 0 0 1-3.2-1 7 7 0 0 1-2-2A7 7 0 0 1 7 28l-.4-4.5L5.6 7h24.8z"
                    />
                    <path
                      fillRule="evenodd"
                      d="M14.3 27a1 1 0 0 1-1.2-1.2v-9a1.1 1.1 0 0 1 2.3 0v9q0 1-1.2 1.1m7.6-11.2q1 .1 1 1.1v9a1.1 1.1 0 0 1-2.2 0v-9a1 1 0 0 1 1.1-1.1M20 1.9a5 5 0 0 1 2.3.9q.8.6 1.2 1.3l.9 1.7.6 1.3h6.5a1.5 1.5 0 0 1 0 3h-27a1.5 1.5 0 1 1 0-3h6.6l.6-1.1.8-1.8q.4-.8 1.2-1.4 1-.8 2.3-.9zm-5.6 5.2h7.3l-.8-1.4a1.4 1.4 0 0 0-1.2-.8h-3.4q-.8 0-1.2.8z"
                    />
                  </svg>
                </div>
              ) : (
                <></>
              )}
              <div title="ℹ️ Close" onClick={handleShowDraft} className={styles.headerIconcontainer}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 170 180">
                  <path
                    d="m100 85 66-67c2-2 3-5 3-8 0-5-5-10-10-10a10 10 0 0 0-8 3L84 70 18 3a10 10 0 0 0-8-3A10 10 0 0 0 0 10c0 3 1 6 3 8l67 67-4 3-63 65a10 10 0 0 0 7 17c3 0 6-1 8-3l12-13 54-54 67 67c4 5 10 5 15 0 4-4 4-10 0-15L99 85z"
                    fill="var(--text-h1)"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="fullScreenPupup_content">
            {!RoleAccess(session, PartnerRole.PageView) && <NotAllowed />}
            {!session.user.publishPermission && <NotPermission permissionType={PermissionType.Content} />}
            {RoleAccess(session, PartnerRole.PageView) && session.user.publishPermission && (
              <>
                <div className={`${styles.container} ${loadingUpload && "fadeDiv"}`}>
                  <div className={`${styles.cardPost} translate`}>
                    {showMedias.length === 0 ? (
                      <>
                        <div
                          title="ℹ️ Click for add media"
                          className={`${styles.picturenopost} ${isDragging ? styles.dragover : ""}`}
                          onClick={() => {
                            if (prePostId > 0) return;
                            handleUploadImage();
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsDragging(true);
                          }}
                          onDragEnter={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsDragging(true);
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsDragging(false);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsDragging(false);
                            if (prePostId > 0) return;

                            const files = e.dataTransfer.files;
                            if (files && files.length > 0) {
                              const file = files[0];
                              // Check if file is image or video
                              if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
                                // Create a synthetic event to pass to handleSelectAlbumMedia
                                const syntheticEvent = {
                                  target: { files: [file] },
                                  currentTarget: { files: [file] },
                                } as any;
                                handleSelectAlbumMedia(syntheticEvent);
                              }
                            }
                          }}>
                          <input
                            id="AddMedia"
                            type="file"
                            accept="image/* ,video/* "
                            onChange={(e) => {
                              if (prePostId > 0) return;
                              handleSelectAlbumMedia(e);
                            }}
                            ref={inputRef}
                            style={{ display: "none" }}
                          />
                          {!loadingUpload ? (
                            <>
                              <img style={{ width: "80px" }} alt="Add new media button" src="/icon-plus2.svg" />

                              <div className="explain" style={{ textAlign: "center" }}>
                                {t(LanguageKey.supportedformat)}
                                <br />
                                <strong>Video (MP4), Image (JPG)</strong>
                                <br />
                                <br />
                                {t(LanguageKey.limitsize)}
                                <br />
                                8MB per image
                                <br />
                                100MB per video
                                <br />
                                1GB for Reels (3s - 15m)
                              </div>
                            </>
                          ) : (
                            <>
                              <div
                                style={{
                                  position: "relative",
                                  width: "120px",
                                  height: "120px",
                                }}>
                                <svg
                                  style={{ transform: "rotate(-90deg)" }}
                                  width="120"
                                  height="120"
                                  viewBox="0 0 120 120">
                                  {/* Background circle */}
                                  <circle
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    fill="none"
                                    stroke="var(--content-box)"
                                    strokeWidth="8"
                                  />
                                  {/* Progress circle */}
                                  <circle
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    fill="none"
                                    stroke="var(--color-dark-blue)"
                                    strokeWidth="8"
                                    strokeDasharray={`${2 * Math.PI * 50}`}
                                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                                    strokeLinecap="round"
                                    style={{
                                      transition: "stroke-dashoffset 0.3s ease",
                                    }}
                                  />
                                </svg>
                                <div
                                  style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    fontSize: "24px",
                                    fontWeight: "bold",
                                    color: "var(--color-dark-blue)",
                                  }}>
                                  {Math.round(progress)}%
                                </div>
                              </div>
                              <div
                                className="explain"
                                style={{
                                  textAlign: "center",
                                  marginTop: "20px",
                                }}>
                                {t(LanguageKey.loading) || "Uploading..."}
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        {showMedias[showMediaIndex].mediaType == MediaType.Image ||
                        showMedias[showMediaIndex].coverUri ||
                        showMedias[showMediaIndex].cover.length != 0 ? (
                          <img
                            className={styles.pictureMaskIcon}
                            alt="added media"
                            src={
                              showMedias[showMediaIndex].mediaType == MediaType.Image
                                ? (showMedias[showMediaIndex].mediaUri ?? showMedias[showMediaIndex].media)
                                : (showMedias[showMediaIndex].coverUri ?? showMedias[showMediaIndex].cover)
                            }
                          />
                        ) : (
                          <video className={styles.pictureMaskIcon} src={showMedias[showMediaIndex].media} />
                        )}

                        <div className={styles.filter} />
                        {showMedias[showMediaIndex].tagPeaple?.map((v, i) => (
                          <div key={showMediaIndex * 1e20 + i + v.username}>
                            <DragComponent
                              key={i + "_" + v.username}
                              handleStopDrag={handleStopDrag}
                              handleDeleteTag={handleDeleteTag}
                              username={v.username}
                              x={v.x * renderWidthSize}
                              y={renderWidthSize * v.y}
                              minX={
                                showMedias[showMediaIndex].width < showMedias[showMediaIndex].height
                                  ? renderWidthSize *
                                    (0.5 - (0.5 * showMedias[showMediaIndex].width) / showMedias[showMediaIndex].height)
                                  : 0
                              }
                              maxX={
                                showMedias[showMediaIndex].width < showMedias[showMediaIndex].height
                                  ? renderWidthSize *
                                    (0.5 + (0.5 * showMedias[showMediaIndex].width) / showMedias[showMediaIndex].height)
                                  : renderWidthSize
                              }
                              minY={
                                showMedias[showMediaIndex].height < showMedias[showMediaIndex].width
                                  ? renderWidthSize *
                                    (0.5 - (0.5 * showMedias[showMediaIndex].height) / showMedias[showMediaIndex].width)
                                  : 0
                              }
                              maxY={
                                showMedias[showMediaIndex].height < showMedias[showMediaIndex].width
                                  ? renderWidthSize *
                                    (0.5 + (0.5 * showMedias[showMediaIndex].height) / showMedias[showMediaIndex].width)
                                  : renderWidthSize
                              }
                            />
                          </div>
                        ))}
                      </>
                    )}
                    {automaticPost && (
                      <div className={styles.postdetail}>
                        <div className={styles.postTimer}>
                          <ConstantCounterDown
                            unixTime={dateAndTime}
                            // classNameSvg="var(--color-ffffff)"
                            // classNameTime="timeValue"
                            //  clssNameTitle="timeTitle"
                            colorSvg="var(--color-ffffff)"
                            colorTimeTitle="var(--color-ffffff)"
                            classNamewrapper={"countdownWrapperWinnerPicker"}
                          />
                          {/* <div className={styles.div}>[ 0 / {totalPrePostCount + 1} ]</div> */}
                        </div>
                      </div>
                    )}
                    <div className={styles.optionCard}>
                      <div className={showMedias.length > 0 ? styles.cardPostChild : styles.disableCardPostChild}>
                        <div
                          title="ℹ️ Delete this media"
                          onClick={() => {
                            if (prePostId > 0) return;
                            handleDedleteMedia();
                          }}
                          className={`${styles.postoption} ${prePostId > 0 && "fadeDiv"}`}>
                          <img className={styles.postoptionicon} alt="Delete media button" src="/delete.svg" />

                          <div className={styles.postoptionicontext}>{t(LanguageKey.delete)}</div>
                        </div>

                        <div
                          title="ℹ️ Delete this media"
                          onClick={() => {
                            if (prePostId > 0) return;
                            handleDeleteCover();
                          }}
                          className={`${styles.postoption} ${
                            ((showMedias.length > 0 && showMedias[0].coverId.length === 0) || prePostId > 0) &&
                            "fadeDiv"
                          }`}>
                          <img className={styles.postoptionicon} alt="Delete media button" src="/delete.svg" />

                          <div className={styles.postoptionicontext}>{t(LanguageKey.deletecover)}</div>
                        </div>
                        <div
                          title="ℹ️ Add cover to this media"
                          onClick={() => {
                            if (prePostId > 0) return;
                            handleUploadCoverImage();
                          }}
                          className={`${styles.postoption} ${
                            ((showMedias.length > 0 &&
                              showMediaIndex !== 0 &&
                              showMedias[showMediaIndex].mediaType === MediaType.Video) ||
                              (showMedias.length > 0 && showMedias[showMediaIndex].mediaType === MediaType.Image) ||
                              postType === PostType.Album ||
                              prePostId > 0) &&
                            "fadeDiv"
                          }`}>
                          <input
                            type="file"
                            accept="image/* ,video/* "
                            onChange={(e) => {
                              if (prePostId > 0) return;
                              handleSelectCover(e);
                            }}
                            ref={inputCoverRef}
                            style={{ display: "none" }}
                          />

                          <img className={styles.postoptionicon} alt="Add cover button" src="/cover.svg" />
                          <div className={styles.postoptionicontext}>{t(LanguageKey.cover)}</div>
                        </div>

                        <div
                          title="ℹ️ replace this media"
                          onClick={() => {
                            if (prePostId > 0) return;
                            handleUploadRepalceMedia();
                          }}
                          className={`${styles.postoption} ${prePostId > 0 && "fadeDiv"}`}>
                          <input
                            type="file"
                            accept="image/* ,video/* "
                            onChange={(e) => {
                              if (prePostId > 0) return;
                              handleReplaceMedia(e);
                            }}
                            ref={inputReplaceRef}
                            style={{ display: "none" }}
                          />
                          <img className={styles.postoptionicon} alt="Replace media button" src="/replace.svg" />
                          <div className={styles.postoptionicontext}>{t(LanguageKey.replace)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="headerandinput">
                    <div className="headerparent">
                      <div className="title">
                        {t(LanguageKey.pageLottery_model)}
                        <div className={styles.tooltipContainer}>
                          <img
                            title="ℹ️ size of content"
                            src="/tooltip.svg"
                            onClick={() => uiDispatch({ type: "TOGGLE_TOOLTIP" })}
                          />
                          {showTooltip && (
                            <div className={styles.tooltip}>
                              <div className={styles.postscalechild}>
                                <div className={styles.postscalebutton3}>16:9</div>
                                <div className={styles.postscaleheader}>
                                  <strong>Landscape</strong>
                                  <br></br>(1080x680)
                                </div>
                              </div>
                              <div className={styles.postscalechild}>
                                <div className={styles.postscalebutton2}>1:1</div>
                                <div className={styles.postscaleheader}>
                                  <strong>Square</strong>
                                  <br></br>(1080x1080)
                                </div>
                              </div>
                              <div className={styles.postscalechild}>
                                <div className={styles.postscalebutton1}>4:5</div>
                                <div className={styles.postscaleheader}>
                                  <strong>Portrait</strong>
                                  <br></br>(1080x1350)
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={styles.typeparent}>
                        <div
                          title="ℹ️ change to POST"
                          onClick={() => {
                            if (postType === PostType.Single || prePostId > 0) return;
                            mediaDispatch({
                              type: "SET_POST_TYPE",
                              payload: PostType.Single,
                            });
                            uiDispatch({
                              type: "SET_SHOW_MEDIA_INDEX",
                              payload: 0,
                            });
                            mediaDispatch({
                              type: "SET_SHOW_MEDIAS",
                              payload: showMedias.length > 0 ? [showMedias[0]] : [],
                            });
                          }}
                          className={postType == PostType.Single ? styles.selectedType : styles.type}>
                          {t(LanguageKey.markethomepost)}
                        </div>
                        <div
                          title="ℹ️ change to ALBUM"
                          onClick={() => {
                            if (postType === PostType.Album || prePostId > 0) return;
                            checkChangePostToAlbum();
                            mediaDispatch({
                              type: "SET_POST_TYPE",
                              payload: PostType.Album,
                            });
                            mediaDispatch({
                              type: "SET_SHOW_MEDIAS",
                              payload: showMedias.length > 0 ? [showMedias[0]] : [],
                            });
                          }}
                          className={postType === PostType.Album ? styles.selectedType : styles.type}>
                          {t(LanguageKey.Album)}
                        </div>
                      </div>
                    </div>

                    {postType === PostType.Album && (
                      <div
                        className={styles.postpreview}
                        onMouseDown={(e) => {
                          const ele = e.currentTarget;
                          const startPos = {
                            left: ele.scrollLeft,
                            x: e.clientX,
                          };

                          const mouseMoveHandler = function (this: Document, e: globalThis.MouseEvent) {
                            const dx = e.clientX - startPos.x;
                            ele.scrollLeft = startPos.left - dx;
                          };

                          const mouseUpHandler = () => {
                            document.removeEventListener("mousemove", mouseMoveHandler);
                            document.removeEventListener("mouseup", mouseUpHandler);
                          };

                          document.addEventListener("mousemove", mouseMoveHandler);
                          document.addEventListener("mouseup", mouseUpHandler);
                        }}
                        style={{ cursor: "grab", userSelect: "none" }}>
                        {showMedias.map((v, i) =>
                          v.mediaType == MediaType.Image || v.coverUri || v.cover.length != 0 ? (
                            <img
                              onClick={() => {
                                handleChangeAlbumChildren(i);
                              }}
                              key={i}
                              className={styles.postpicture}
                              alt="Post picture"
                              src={v.mediaType == MediaType.Image ? (v.mediaUri ?? v.media) : (v.coverUri ?? v.cover)}
                            />
                          ) : (
                            <video
                              onClick={() => {
                                handleChangeAlbumChildren(i);
                              }}
                              key={i}
                              className={styles.postpicture}
                              src={v.mediaUri ?? v.media}
                            />
                          ),
                        )}

                        {showMedias.length <= 9 && prePostId <= 0 && (
                          <div
                            title="ℹ️ upload media"
                            onClick={() => {
                              if (prePostId > 0) return;
                              handleUploadImage();
                            }}
                            className={styles.addnew}>
                            <input
                              id="AddMedia"
                              type="file"
                              accept="image/* ,video/* "
                              onChange={(e) => {
                                if (prePostId > 0) return;
                                handleSelectAlbumMedia(e);
                              }}
                              ref={inputRef}
                              style={{ display: "none" }}
                            />
                            <img
                              title="ℹ️ upload media"
                              className={styles.addnewicon}
                              alt="Add new media button"
                              src="/plus.svg"
                            />
                          </div>
                        )}
                        {divArray}
                      </div>
                    )}

                    {postType === PostType.Single && (
                      <>
                        <div className={styles.postpreview}>
                          {showMedias.map((v, i) =>
                            v.mediaType == MediaType.Image || v.coverUri || v.cover.length > 0 ? (
                              <img
                                onClick={() => {
                                  uiDispatch({
                                    type: "SET_SHOW_MEDIA_INDEX",
                                    payload: i,
                                  });
                                }}
                                key={i}
                                className={styles.postpicture}
                                alt="Post picture"
                                src={v.mediaType == MediaType.Image ? (v.mediaUri ?? v.media) : (v.coverUri ?? v.cover)}
                              />
                            ) : (
                              <video
                                onClick={() => {
                                  uiDispatch({
                                    type: "SET_SHOW_MEDIA_INDEX",
                                    payload: i,
                                  });
                                }}
                                key={i}
                                className={styles.postpicture}
                                src={v.mediaUri ?? v.media}
                              />
                            ),
                          )}
                          {showMedias.length === 0 && (
                            <div
                              onClick={() => {
                                if (prePostId > 0) return;
                                handleUploadImage();
                              }}
                              className={styles.addnew}>
                              <input
                                type="file"
                                accept="image/* ,video/* "
                                onChange={(e) => {
                                  if (prePostId > 0) return;
                                  handleSelectAlbumMedia(e);
                                }}
                                ref={inputRef}
                                style={{ display: "none" }}
                              />
                              <img className={styles.addnewicon} alt="Add new media button" src="/plus.svg" />
                            </div>
                          )}

                          {disableDivArray}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="headerandinput">
                    <div className="title">{t(LanguageKey.TagMention)}</div>
                    <div className="ButtonContainer fadeDiv" style={{ height: "40px" }}>
                      <InputText
                        name="search-location"
                        className={"serachMenuBar"}
                        placeHolder={t(LanguageKey.searchLocation)}
                        handleInputChange={(e) => {
                          handleSearchLocationInputChange(e);
                        }}
                        value={searchLocation}
                        maxLength={undefined}
                      />
                      {searchLocation.length > 0 && loacationBox.active && (
                        <div className={styles.resultSearchtag}>
                          {loacationBox.loading && <RingLoader />}
                          {loacationBox.noresult && <h1 className="title2"> {t(LanguageKey.noresult)}</h1>}
                          {!loacationBox.noresult &&
                            locationInfo?.map((v, i) => (
                              <div
                                onClick={(e) => {
                                  if (prePostId > 0) return;
                                  handleSelectLocation(e, v);
                                }}
                                key={i}
                                className={styles.searchContent1}>
                                <img className={styles.locationicon} alt="Location icon" src="/Icon_location.svg"></img>
                                {v.name}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    <div className={`headerandinput ${showMedias.length === 0 && "fadeDiv"}`}>
                      <div className="headerparent" style={{ height: "40px", padding: "3px" }}>
                        <InputText
                          name="search-people"
                          className={"serachMenuBar"}
                          placeHolder={t(LanguageKey.searchPeople)}
                          handleInputChange={(e) => {
                            handleSearchPeopleInputChange(e, SearchType.TagPeople);
                          }}
                          value={searchTagPeaple}
                          fadeTextArea={prePostId > 0}
                        />
                        {searchTagPeaple.length > 0 && showAddTagPeapleBox.active && (
                          <div className={styles.resultSearchmention}>
                            {showAddTagPeapleBox.loading && <RingLoader />}
                            {showAddTagPeapleBox.noresult && <h1 className="title2"> {t(LanguageKey.noresult)}</h1>}
                            {!showAddTagPeapleBox.noresult &&
                              tagPeaple?.map((v) => (
                                <div
                                  onClick={(e) => handleSelectTag(e, v)}
                                  key={v.username}
                                  className={styles.searchContent}>
                                  <img
                                    className={styles.userProfile}
                                    alt={`${v.username}'s profile picture`}
                                    src={basePictureUrl + v.profileUrl}
                                  />
                                  <div className={styles.username}>{v.username}</div>
                                </div>
                              ))}
                          </div>
                        )}
                        <div
                          style={{ height: "40px" }}
                          onClick={(e) => handleTagPeaple(e)}
                          className={showMedias.length > 0 && selectedTagPeaple ? "cancelButton" : "disableButton"}>
                          {t(LanguageKey.add)}
                        </div>
                      </div>
                      <div className="explain">{t(LanguageKey.Addpeopleexplain)}</div>
                    </div>
                  </div>
                </div>
                <div className={styles.container} role="region" aria-label="Caption and hashtags section">
                  <div className={`headerandinput `}>
                    <div className="headerparent">
                      <div className="title" role="heading" aria-level={2}>
                        {t(LanguageKey.collaborator)}
                      </div>
                      <div className="explain ">({collabratorPages.length}/5)</div>
                    </div>
                    <div className="explain ">{t(LanguageKey.CollaboratorExplain)}</div>
                    {/* باید برای collaborator کد ها تغییر پیدا کنند */}
                    <div className="headerparent">
                      <InputText
                        fadeTextArea={prePostId > 0 || collabratorPages.length >= 5}
                        name="search-people"
                        className={"serachMenuBar"}
                        placeHolder={t(LanguageKey.searchPeople)}
                        handleInputChange={(e) => {
                          handleSearchPeopleInputChange(e, SearchType.CollaboratePeople);
                        }}
                        value={searchPeaple}
                      />
                      {searchPeaple.length > 0 && showAddPeapleBox.active && (
                        <div className={styles.resultSearchmention}>
                          {showAddPeapleBox.loading && <RingLoader />}
                          {showAddPeapleBox.noresult && <h1 className="title2"> {t(LanguageKey.noresult)}</h1>}
                          {!showAddPeapleBox.noresult &&
                            pageInfo?.map((v) => (
                              <div
                                onClick={(e) => handleSelectPage(e, v)}
                                key={v.username}
                                className={styles.searchContent}>
                                <img
                                  className={styles.userProfile}
                                  alt={`${v.username}'s profile picture`}
                                  src={basePictureUrl + v.profileUrl}
                                />
                                <div className={styles.username}>{v.username}</div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    <div className={styles.wordpool}>
                      {collabratorPages.map((word, index) => (
                        <div key={index} className={styles.specificword}>
                          {word}
                          <img
                            onClick={() => setCollabratorPages((prev) => prev.filter((x) => x !== word))}
                            aria-label={`Remove ${word}`}
                            style={{
                              cursor: "pointer",
                              width: "15px",
                              height: "15px",
                            }}
                            title="ℹ️ Remove keyword from list "
                            src="/deleteHashtag.svg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="headerandinput" style={{ minHeight: "300px" }}>
                    <div className="headerparent">
                      <div className="title" role="heading" aria-level={2}>
                        {t(LanguageKey.caption)}
                      </div>
                      <div className={styles.titleCard}>
                        <div className="counter" role="status" aria-label="Caption character count">
                          <div className={styles.icon}>
                            {" "}
                            <img className={styles.hashtagicon} alt="Character Count" src={"/T.svg"} />
                          </div>
                          (<strong style={{ minWidth: "20px" }}>{captionTextArea.length}</strong> /<strong>2200</strong>
                          )
                        </div>
                        <div className="counter" role="status" aria-label="Hashtag count">
                          <img
                            className={styles.icon}
                            alt="Hashtag indicator"
                            src="/icon-hashtag.svg"
                            width="16"
                            height="16"
                          />
                          (<strong>{hashtagsWord.length}</strong> /<strong>30</strong>)
                        </div>
                        <AIWithPrompt aiLoading={aiLoading} handleAIPromptSubmit={handleAIPromptSubmit} tags={tags} />
                      </div>
                    </div>

                    {/* AI Caption Generator Input */}

                    <TextArea
                      className="captiontextarea"
                      placeHolder={""}
                      fadeTextArea={prePostId > 0 || aiLoading}
                      handleInputChange={(e) => {
                        if (prePostId > 0) return;
                        handleChangeCaptionTextarea(e);
                      }}
                      handleKeyDown={(e) => {
                        if (prePostId > 0) return;
                        handleKeyDownCaptionTextarea(e);
                      }}
                      value={captionTextArea}
                      maxLength={2200}
                      name="caption-textarea"
                      title="Enter your post caption"
                      role="textbox"
                      aria-label="Post caption input area"
                      aria-multiline="true"
                      aria-required="true"
                      aria-describedby="caption-counter"
                    />
                  </div>
                  <div
                    className="headerandinput"
                    style={{ minHeight: "200px" }}
                    role="region"
                    aria-label="Hashtag selection section">
                    <div className="headerandinput">
                      <div className="title" role="heading" aria-level={3}>
                        {t(LanguageKey.SavedHashtagList)}
                      </div>

                      <div className="explain" role="note">
                        {t(LanguageKey.SavedHashtagListexplain)}
                      </div>
                      <DragDrop data={hashtagDropdownData} handleOptionSelect={handleOptionSelect} />
                    </div>
                    <div className={styles.hashtagField} role="group" aria-label="Available hashtags">
                      {hashtagList.map((u, j) => (
                        <div key={j} className={styles.tagHashtag} role="button" aria-label={`Add hashtag ${u}`}>
                          <img
                            onClick={() => {
                              if (prePostId > 0) return;
                              handleAddHashtag(u);
                            }}
                            className={styles.hashtagicon}
                            alt={`${hashtagsWord.includes("#" + u) ? "Selected" : "Add"} hashtag ${u}`}
                            src={hashtagsWord.includes("#" + u) ? "/click-hashtag.svg" : "/icon-hashtag.svg"}
                            width="16"
                            height="16"
                          />
                          {u}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* <div className="headerandinput" style={{ height: "100%" }}>
                  <div className="headerparent">
                  <div className={styles.titleCard}>
                    <div className="title">{t(LanguageKey.FirstComment)}</div>
                    <div className="counter">
                    (<strong>{firstCommentTextArea.length}</strong> /
                    <strong>2200</strong>)
                    </div>
                  </div>
                  <ToggleCheckBoxButton
                    name="first-comment"
                    handleToggle={() => {
                    let value = !firstComment;
                    if (value) {
                      if (turnOffComment) setTurnOffComment(false);
                    }
                    setFirstComment(!firstComment);
                    }}
                    checked={firstComment}
                  />
                  </div>

                  <TextArea
                  name="first-comment-textarea"
                  className={"captiontextarea"}
                  fadeTextArea={!firstComment}
                  placeHolder={""}
                  handleInputChange={handleChangeFirstCommentTextarea}
                  handleKeyDown={undefined}
                  value={firstCommentTextArea}
                  maxLength={2200}
                  />
                  <div
                  className={`${styles.header} ${!firstComment && "fadeDiv"
                    }`}>
                  <CheckBoxButton
                    handleToggle={() => setPinFirstComment(!pinFirstComment)}
                    value={pinFirstComment}
                    textlabel={t(LanguageKey.PinFirstComment)}
                    name="pin-first-comment"
                  />
                  </div>
                </div> */}
                </div>
                <div className={styles.container}>
                  <div className="title">{t(LanguageKey.AdvanceSettings)}</div>

                  <div className="headerandinput">
                    <div className="headerparent" role="group" aria-label="Product settings">
                      <div className="title2" role="heading" aria-level={3}>
                        {t(LanguageKey.autocommentReply)}
                      </div>
                      <ToggleCheckBoxButton
                        name="quick-reply"
                        handleToggle={() => {
                          if (prePostId > 0) return;
                          formDispatch({ type: "TOGGLE_QUICK_REPLY" });
                        }}
                        checked={QuickReply}
                        title="Toggle quick reply"
                        role="switch"
                        aria-checked={QuickReply}
                        aria-label="Quick reply toggle"
                      />
                    </div>
                    <div className="explain">{t(LanguageKey.QuickReplyexplain)}</div>
                    <button
                      className={`cancelButton ${QuickReply ? "" : "fadeDiv"}`}
                      onClick={() => {
                        if (QuickReply) {
                          uiDispatch({
                            type: "TOGGLE_QUICK_REPLY_POPUP",
                            payload: true,
                          });
                        }
                      }}
                      disabled={!QuickReply}>
                      {t(LanguageKey.marketstatisticsfeatures)}
                    </button>
                  </div>

                  {showMedias.length == 1 && showMedias[0].mediaType == MediaType.Video && (
                    <>
                      <div className="headerandinput">
                        <div className="headerparent" role="group" aria-label="Share preview settings">
                          <div className="title2" title="Share preview to feed setting">
                            {t(LanguageKey.sharepreviewtofeed)}
                          </div>
                          <ToggleCheckBoxButton
                            name="share-preview-toggle"
                            handleToggle={(e) => {
                              if (prePostId > 0) return;
                              formDispatch({
                                type: "TOGGLE_SHARE_PREVIEW",
                                payload: e.target.checked,
                              });
                            }}
                            checked={sharePreviewToFeed}
                            title="Toggle share preview to feed"
                            role="switch"
                            aria-checked={sharePreviewToFeed}
                            aria-label="Share preview to feed toggle"
                          />
                        </div>
                        <div className={styles.typeparent}>
                          <div
                            title="ℹ️ change to automatic"
                            onClick={() => {
                              formDispatch({
                                type: "TOGGLE_AUTOMATIC_POST",
                                payload: true,
                              });
                            }}
                            className={automaticPost ? styles.selectedType : styles.type}>
                            {t(LanguageKey.automatic)}
                          </div>
                          <div
                            title="ℹ️ change to manual"
                            onClick={() => {
                              formDispatch({
                                type: "TOGGLE_AUTOMATIC_POST",
                                payload: false,
                              });
                            }}
                            className={!automaticPost ? styles.selectedType : styles.type}>
                            {t(LanguageKey.manual)}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {/* add to product Section */}
                  {session.user.isShopper && (
                    <div className="headerandinput">
                      <div className="headerparent" role="group" aria-label="Product settings">
                        <div className="title2" role="heading" aria-level={3}>
                          {t(LanguageKey.addtoproduct)}
                        </div>
                        <ToggleCheckBoxButton
                          name="copyright-bypass"
                          handleToggle={() => {
                            if (prePostId > 0) return;
                            formDispatch({ type: "TOGGLE_ADD_TO_PRODUCT" });
                          }}
                          checked={addToProduct}
                          title="Toggle add to product"
                          role="switch"
                          aria-checked={addToProduct}
                          aria-label="Add to product toggle"
                        />
                      </div>
                      <div className="explain">{t(LanguageKey.addtoproductexplain)}</div>
                    </div>
                  )}
                  {/* Turn off Commenting Section */}
                  <div className="headerandinput">
                    <div className="headerparent" role="group" aria-label="Comment settings">
                      <div className="title2" role="heading" aria-level={3}>
                        {t(LanguageKey.pageToolspopup_TurnoffCommenting)}
                      </div>
                      <ToggleCheckBoxButton
                        name="turn-off-comment"
                        handleToggle={handleToggleTurnOffComment}
                        checked={turnOffComment}
                        title="Toggle comments"
                        role="switch"
                        aria-checked={turnOffComment}
                        aria-label="Turn off commenting toggle"
                      />
                    </div>
                    <div className="explain">{t(LanguageKey.TurnoffCommentingexplain)}</div>
                  </div>
                  <div className={styles.Section}>
                    {/* Set Scheduled Post Section */}
                    <div className="headerandinput" role="region">
                      <div className="headerparent" role="group" aria-label="Schedule settings">
                        <div className="title2" role="heading" aria-level={3}>
                          {t(LanguageKey.SetScheduledPost)}
                          <div className="counter" role="note">
                            ({t(LanguageKey.max)} 30)
                          </div>
                        </div>

                        <ToggleCheckBoxButton
                          name="automatic-post"
                          handleToggle={handleToggleAutomaticPost}
                          checked={automaticPost}
                          title="Toggle scheduled posting"
                          role="switch"
                          aria-checked={automaticPost}
                          aria-label="Set scheduled post toggle"
                        />
                      </div>
                      <div className="explain">{t(LanguageKey.SetScheduledPostexplain)}</div>
                    </div>
                    <div
                      className={`headerparent ${!automaticPost ? "fadeDiv" : ""}`}
                      role="group"
                      aria-label="Date and time selection">
                      <div className={styles.input} role="presentation">
                        {new DateObject({
                          date: dateAndTime,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("MM/DD/YYYY")}
                      </div>
                      <div className={styles.input} role="presentation">
                        {new DateObject({
                          date: dateAndTime,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("hh:mm")}
                      </div>
                      <div className={styles.input} role="presentation">
                        {new DateObject({
                          date: dateAndTime,
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("A")}
                      </div>
                      {prePostId <= 0 && (
                        <div
                          onClick={handleOpenDateTimePicker}
                          className="saveButton"
                          role="button"
                          aria-label="Open date and time picker"
                          title="Select date and time"
                          style={{
                            position: "relative",
                            height: "40px",
                            width: "40px",
                            maxWidth: "40px",
                            minWidth: "40px",
                            maxHeight: "40px",
                            minHeight: "40px",
                            borderRadius: "10px",
                            padding: "var(--padding-10)",
                          }}>
                          <img
                            className={styles.Calendaricon}
                            alt="Calendar icon for date/time selection"
                            src="/selectDate-item.svg"
                            width="15"
                            height="15"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {prePostId <= 0 && (
                    <div className={styles.Section}>
                      {recommendedTime.length > 0 && (
                        <div
                          className={`${styles.setting} ${!automaticPost && "fadeDiv"}`}
                          role="region"
                          aria-label="Recommended posting times">
                          <div className="headerandinput">
                            <div className="title" role="heading" aria-level={3}>
                              {t(LanguageKey.RecommendedDateTime)}
                            </div>
                            <div className="explain" role="note">
                              {t(LanguageKey.RecommendedDateTimeexplain)}
                            </div>
                          </div>
                          <div
                            className="headerparent"
                            style={{ flexWrap: "wrap" }}
                            role="group"
                            aria-label="Recommended time slots">
                            {recommendedTime.slice(0, 4).map(
                              (time, index) =>
                                time && (
                                  <div
                                    key={`time-${index}`}
                                    onClick={() => {
                                      if (prePostId > 0) return;
                                      formDispatch({
                                        type: "SET_REC_TIME_SELECT",
                                        payload: index,
                                      });
                                      formDispatch({
                                        type: "SET_DATE_TIME",
                                        payload: time * 1000,
                                      });
                                    }}
                                    className={styles.timeButtons}
                                    role="button"
                                    aria-pressed={recTimeSelect === index}
                                    title={`Select recommended time slot ${index + 1}`}>
                                    <div className={recTimeSelect === index ? styles.selectedTime : styles.time}>
                                      {[
                                        new DateObject({
                                          date: time * 1000,
                                          calendar: initialzedTime().calendar,
                                          locale: initialzedTime().locale,
                                        }).format("YYYY/MM/DD"),
                                        new DateObject({
                                          date: time * 1000,
                                          calendar: initialzedTime().calendar,
                                          locale: initialzedTime().locale,
                                        }).format("hh:mm A"),
                                      ].join(" | ")}
                                    </div>
                                  </div>
                                ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {prePostId <= 0 && (
                    <>
                      {showMedias[0] ? (
                        <>
                          {!analizeProcessing && (
                            <div
                              style={{ marginBottom: "30px" }}
                              className="saveButton"
                              onClick={handlePublishPost}
                              role="button"
                              aria-label="Publish post"
                              title="Click to publish post">
                              {t(LanguageKey.publish)}
                            </div>
                          )}
                          {analizeProcessing && (
                            <ProgressBar
                              width={progress}
                              role="progressbar"
                              aria-valuenow={progress}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label="Upload progress"
                            />
                          )}
                        </>
                      ) : (
                        <div
                          className="saveButton"
                          style={{
                            pointerEvents: "none",
                            marginBottom: "30px",
                            opacity: "0.3",
                          }}
                          role="button"
                          aria-disabled="true"
                          aria-label="Publish button (disabled)"
                          title="Add media to enable publishing">
                          {t(LanguageKey.publish)}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <Modal closePopup={removeMask} classNamePopup={"popup"} showContent={showSetDateAndTime}>
          <SetTimeAndDate
            removeMask={removeMask}
            saveDateAndTime={saveDateAndTime}
            backToNormalPicker={removeMask}
            startDay={dateAndTime}
            fromUnix={activeLimitTime ? Date.now() + 90000000 : undefined}
          />
        </Modal>
        <Modal closePopup={removeMask} classNamePopup={"popupSendFile"} showContent={showDraft}>
          <SaveDraft removeMask={removeMask} saveDraft={handleSaveDraft} cancelDraft={handleCancelDraft} />
        </Modal>
        <Modal closePopup={removeMask} classNamePopup={"popupSendFile"} showContent={showDeleteDraft}>
          <DeleteDraft removeMask={removeMask} deleteDraft={HandleDelete} cancelDraft={handleCancelDraft} />
        </Modal>
        <Modal
          closePopup={() => uiDispatch({ type: "TOGGLE_QUICK_REPLY_POPUP", payload: false })}
          classNamePopup={"popup"}
          showContent={showQuickReplyPopup}>
          <QuickReplyPopup
            setShowQuickReplyPopup={(value) => uiDispatch({ type: "TOGGLE_QUICK_REPLY_POPUP", payload: value })}
            handleSaveAutoReply={handleSaveAutoReply}
            handleActiveAutoReply={(e) => {
              if (prePostId > 0) return;
            }}
            autoReply={autoReply}
          />
        </Modal>
        <Modal
          closePopup={handleCanselDeleteReels}
          classNamePopup={"popupSendFile"}
          showContent={showChangePostToAlbum}>
          <ChangePostToAlbum
            handleVerifyDeleteReels={handleVerifyDeleteReels}
            handleCanselDeleteReels={handleCanselDeleteReels}
          />
        </Modal>
        <Modal closePopup={removeMask} classNamePopup={"popupSendFile"} showContent={showDraftError !== null}>
          <ErrorDraft data={showDraftError!} removeMask={removeMask} />
        </Modal>
        <Modal closePopup={handleToggleDeletePrepost} classNamePopup={"popupSendFile"} showContent={showDeletePrepost}>
          <DeletePrePost removeMask={handleToggleDeletePrepost} deletePrePost={handleDeletePrePost} />
        </Modal>
      </>
    )
  );
};

export default CreatePost;
