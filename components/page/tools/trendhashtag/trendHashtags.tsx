import { useSession } from "next-auth/react";
import { ChangeEvent, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import DragDrop from "brancy/components/design/dragDrop/dragDrop";
import RingLoader from "brancy/components/design/loader/ringLoder";
import Slider, { SliderSlide } from "brancy/components/design/slider/slider";
import Tooltip from "brancy/components/design/tooltip/tooltip";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "brancy/components/notifications/notificationBox";
import { LoginStatus, RoleAccess } from "brancy/helper/loadingStatus";
import { calculateSummary } from "brancy/helper/numberFormater";
import { LanguageKey } from "brancy/i18n";
import { PartnerRole } from "brancy/models/_AccountInfo/InstagramerAccountInfo";
import { MethodType } from "brancy/helper/api";
import { IShortHashtag, ITrendHashtag } from "brancy/models/page/tools/tools";
import styles from "brancy/components/page/tools/trendhashtag/trendHashtags.module.css";
import { clientFetchApi } from "brancy/helper/clientFetchApi";

// Using constants outside the component to avoid recreations
const INITIAL_LANGUAGE_ITEM = 0;
const INITIAL_TIME_ITEM = 0;

// Define reducer for complex state management
type HashtagsState = {
  trendHashtag: ITrendHashtag[];
  searchedHashtag: IShortHashtag[];
  selectedHashtags: string[];
  searchHashtagQuery: string;
  isSearchLoading: boolean;
  isSearchNoResult: boolean;
  index: string;
  hashtagSvg: string;
  isHidden: boolean;
  showPopup: boolean;
  searchLocked: boolean;
};

type HashtagsAction =
  | { type: "SET_TREND_HASHTAGS"; payload: ITrendHashtag[] }
  | { type: "SET_SEARCHED_HASHTAGS"; payload: IShortHashtag[] }
  | { type: "ADD_SELECTED_HASHTAG"; payload: string }
  | { type: "REMOVE_SELECTED_HASHTAG"; payload: string }
  | { type: "CLEAR_SELECTED_HASHTAGS" }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_SEARCH_LOADING"; payload: boolean }
  | { type: "SET_SEARCH_NO_RESULT"; payload: boolean }
  | { type: "SET_INDEX"; payload: string }
  | { type: "SET_HASHTAG_SVG"; payload: string }
  | { type: "TOGGLE_HIDDEN" }
  | { type: "SET_POPUP"; payload: boolean }
  | { type: "SET_SEARCH_LOCKED"; payload: boolean }
  | { type: "RESET_INDEX_AND_SVG" };

const hashtagsReducer = (state: HashtagsState, action: HashtagsAction): HashtagsState => {
  switch (action.type) {
    case "SET_TREND_HASHTAGS":
      return { ...state, trendHashtag: action.payload };
    case "SET_SEARCHED_HASHTAGS":
      return { ...state, searchedHashtag: action.payload };
    case "ADD_SELECTED_HASHTAG":
      return {
        ...state,
        selectedHashtags: [...state.selectedHashtags, action.payload],
        showPopup: true,
      };
    case "REMOVE_SELECTED_HASHTAG":
      return {
        ...state,
        selectedHashtags: state.selectedHashtags.filter((tag) => tag !== action.payload),
        showPopup: state.selectedHashtags.length > 1,
      };
    case "CLEAR_SELECTED_HASHTAGS":
      return { ...state, selectedHashtags: [], showPopup: false };
    case "SET_SEARCH_QUERY":
      return { ...state, searchHashtagQuery: action.payload };
    case "SET_SEARCH_LOADING":
      return { ...state, isSearchLoading: action.payload };
    case "SET_SEARCH_NO_RESULT":
      return { ...state, isSearchNoResult: action.payload };
    case "SET_INDEX":
      return { ...state, index: action.payload };
    case "SET_HASHTAG_SVG":
      return { ...state, hashtagSvg: action.payload };
    case "TOGGLE_HIDDEN":
      return { ...state, isHidden: !state.isHidden };
    case "SET_POPUP":
      return { ...state, showPopup: action.payload };
    case "SET_SEARCH_LOCKED":
      return { ...state, searchLocked: action.payload };
    case "RESET_INDEX_AND_SVG":
      return { ...state, index: "", hashtagSvg: "" };
    default:
      return state;
  }
};

const TrandHashtags = () => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  // Use refs for values that don't need to trigger re-renders
  const languageItemRef = useRef(INITIAL_LANGUAGE_ITEM);
  const timeItemRef = useRef(INITIAL_TIME_ITEM);
  const hashtagTimeoutIdRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const timerIdRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Complex state management with useReducer
  const [state, dispatch] = useReducer(hashtagsReducer, {
    trendHashtag: [],
    searchedHashtag: [],
    selectedHashtags: [],
    searchHashtagQuery: "",
    isSearchLoading: false,
    isSearchNoResult: false,
    index: "",
    hashtagSvg: "",
    isHidden: false,
    showPopup: false,
    searchLocked: false,
  });

  // Memoized values that depend on state
  const showSearchPeople = useMemo(
    () => ({
      loading: state.isSearchLoading,
      noResult: state.isSearchNoResult,
    }),
    [state.isSearchLoading, state.isSearchNoResult],
  );

  // Memoized options to prevent unnecessary re-renders
  const languageOptions = useMemo(
    () => [
      <div key="lang-0" id="0">
        {t(LanguageKey.pageTools_global)}
      </div>,
      <div key="lang-1" id="1">
        {t(LanguageKey.pageTools_FA_AR)}
      </div>,
    ],
    [t],
  );

  const timeOptions = useMemo(
    () => [
      <div key="time-0" id="0">
        {t(LanguageKey.pageTools_Overall)}
      </div>,
      <div key="time-1" id="1">
        {t(LanguageKey.pageTools_Month)}
      </div>,
      <div key="time-2" id="2">
        {t(LanguageKey.pageTools_Week)}
      </div>,
      <div key="time-3" id="3">
        {t(LanguageKey.pageTools_Day)}
      </div>,
    ],
    [t],
  );

  // Optimized API calls with useCallback
  const fetchData = useCallback(async () => {
    if (!session) return;

    try {
      let res = await clientFetchApi<string, ITrendHashtag[]>("/api/hashtag/GetTrendHashtag", {
        methodType: MethodType.get,
        session: session,
        data: null,
        queries: [
          { key: "languageId", value: languageItemRef.current.toString() },
          { key: "period", value: timeItemRef.current.toString() },
        ],
        onUploadProgress: undefined,
      });

      if (res.succeeded) {
        dispatch({ type: "SET_TREND_HASHTAGS", payload: res.value });
      } else {
        notify(res.info.responseType, NotifType.Warning);
      }
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    }
  }, [session]);

  const handleApiPeopleSearch = useCallback(
    async (query: string) => {
      if (!session || !query) return;

      try {
        var res = await clientFetchApi<boolean, IShortHashtag[]>("/api/hashtag/searchHashtag", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: [{ key: "query", value: query }],
          onUploadProgress: undefined,
        });

        if (res.succeeded) {
          dispatch({ type: "SET_SEARCHED_HASHTAGS", payload: res.value });
          dispatch({ type: "SET_SEARCH_LOADING", payload: false });
          dispatch({
            type: "SET_SEARCH_NO_RESULT",
            payload: res.value.length === 0,
          });
        } else {
          notify(res.info.responseType, NotifType.Warning);
        }
      } catch {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    },
    [session],
  );

  // Optimized event handlers with useCallback
  const handleSearchPeopleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: "SET_SEARCH_LOADING", payload: true });
      dispatch({ type: "SET_SEARCH_NO_RESULT", payload: false });
      dispatch({ type: "SET_SEARCHED_HASHTAGS", payload: [] });

      const query = e.currentTarget.value;
      dispatch({ type: "SET_SEARCH_QUERY", payload: query });

      if (hashtagTimeoutIdRef.current) clearTimeout(hashtagTimeoutIdRef.current);

      if (query.length > 0) {
        const timeoutId = setTimeout(() => {
          if (query && query.length > 0) {
            if (state.searchLocked) return;
            dispatch({ type: "SET_SEARCH_LOCKED", payload: true });
            handleApiPeopleSearch(query);
            setTimeout(() => {
              dispatch({ type: "SET_SEARCH_LOCKED", payload: false });
            }, 2000);
          }
        }, 1000);
        hashtagTimeoutIdRef.current = timeoutId;
      } else {
        dispatch({ type: "SET_SEARCH_LOADING", payload: false });
      }
    },
    [handleApiPeopleSearch, state.searchLocked],
  );

  const handlelanguageOptionSelect = useCallback(
    async (index: number) => {
      languageItemRef.current = index;
      await fetchData();
    },
    [fetchData],
  );

  const handleTimeOptionSelect = useCallback(
    async (index: number) => {
      timeItemRef.current = index;
      await fetchData();
    },
    [fetchData],
  );

  const handleOnMouseOver = useCallback(
    (index: number) => {
      if (state.hashtagSvg !== "/click-hashtag.svg") {
        dispatch({ type: "SET_INDEX", payload: index.toString() });
        dispatch({ type: "SET_HASHTAG_SVG", payload: "/copy-hashtag.svg" });
      }
    },
    [state.hashtagSvg],
  );

  const handleOnMouseLeave = useCallback(() => {
    if (state.hashtagSvg === "/copy-hashtag.svg") {
      dispatch({ type: "RESET_INDEX_AND_SVG" });
    }
  }, [state.hashtagSvg]);

  const handleCircleClick = useCallback(() => {
    dispatch({ type: "TOGGLE_HIDDEN" });
  }, []);

  const copyHashtagToClipboard = useCallback(
    (index: number, hashtag: string) => {
      if (timerIdRef.current) clearTimeout(timerIdRef.current);

      if (state.selectedHashtags.includes(hashtag)) {
        dispatch({ type: "REMOVE_SELECTED_HASHTAG", payload: hashtag });
        dispatch({ type: "SET_HASHTAG_SVG", payload: "/deleteHashtag.svg" });
      } else {
        dispatch({ type: "ADD_SELECTED_HASHTAG", payload: hashtag });
      }

      dispatch({ type: "SET_INDEX", payload: index.toString() });

      const newTimerId = setTimeout(() => {
        dispatch({ type: "RESET_INDEX_AND_SVG" });
      }, 1000);

      timerIdRef.current = newTimerId;
      navigator.clipboard.writeText(hashtag);
    },
    [state.selectedHashtags],
  );

  const clearHashtagList = useCallback(() => {
    dispatch({ type: "CLEAR_SELECTED_HASHTAGS" });
  }, []);

  const copyAllHashtagsToClipboard = useCallback(() => {
    const hashtags = state.selectedHashtags.map((tag) => `#${tag}`).join(" ");
    navigator.clipboard.writeText(hashtags);
    internalNotify(InternalResponseType.copy, NotifType.Success);
  }, [state.selectedHashtags]);

  // Memoized function to reduce calculations during render
  const selectHashtagIcon = useCallback(
    (index1: number, name: string) => {
      if (state.selectedHashtags.find((x) => x === name)) return "/click-hashtag.svg";
      else if (index1.toString() !== state.index) return "/icon-hashtag.svg";
      else return state.hashtagSvg;
    },
    [state.selectedHashtags, state.index, state.hashtagSvg],
  );

  // Effects
  useEffect(() => {
    if (state.selectedHashtags.length === 0) {
      dispatch({ type: "SET_POPUP", payload: false });
    }
  }, [state.selectedHashtags]);

  useEffect(() => {
    if (!session || !LoginStatus(session) || !RoleAccess(session, PartnerRole.PageView)) return;
    fetchData();
  }, [session, fetchData]);

  return (
    <div className="tooBigCard" style={{ gridRowEnd: state.isHidden ? "span 10" : "span 82" }}>
      <div className="headerChild" onClick={handleCircleClick}>
        <div className="circle"></div>
        <div className="Title">
          {state.searchHashtagQuery.length > 0
            ? t(LanguageKey.pageTools_SearchedHashtag)
            : t(LanguageKey.pageTools_TrendHashtags)}
        </div>
      </div>

      <div className={`${styles.trendHashtags} ${state.isHidden ? "" : styles.show}`}>
        <div className="headerparent">
          <DragDrop data={languageOptions} handleOptionSelect={handlelanguageOptionSelect} />
          <DragDrop data={timeOptions} handleOptionSelect={handleTimeOptionSelect} />
        </div>
        <div className="headerandinput" style={{ height: "100%" }}>
          <div className={styles.trendhashtagTitleContainer}>
            <div className={styles.symbol}>#</div>
            <div className={styles.hashtagtitle}>{t(LanguageKey.pageTools_hashtag)}</div>
            <div className={styles.used}>{t(LanguageKey.pageTools_USED)}</div>
          </div>
          <div className={styles.lineheader} />

          {showSearchPeople.loading && <RingLoader />}
          {showSearchPeople.noResult && <h1>{t(LanguageKey.pageStatistics_EmptyList)}</h1>}

          {!showSearchPeople.loading && !showSearchPeople.noResult && (
            <Slider itemsPerSlide={10}>
              {state.searchHashtagQuery.length > 0
                ? state.searchedHashtag.map((u, j) => (
                    <SliderSlide key={j}>
                      <div className={styles.trendHashtagContainer}>
                        <div className={styles.div4}>{j + 1}</div>
                        <div className={styles.hashtagtitle}>
                          <div className={styles.detail}>
                            <img
                              onMouseOver={() => handleOnMouseOver(j)}
                              onMouseLeave={handleOnMouseLeave}
                              onClick={() => copyHashtagToClipboard(j, u.name)}
                              className={styles.component9431}
                              title="ℹ️ Copy hashtag"
                              alt="Hashtag icon"
                              src={selectHashtagIcon(j, u.name)}
                            />
                            <div className={styles.instagramer}>{u.name}</div>
                          </div>
                        </div>

                        <Tooltip tooltipValue={u.mediaCount.toLocaleString()} position="RTL">
                          <div className={styles.k}>{calculateSummary(u.mediaCount)}</div>
                        </Tooltip>
                      </div>
                    </SliderSlide>
                  ))
                : state.trendHashtag.map((u, j) => (
                    <SliderSlide key={j}>
                      <div className={styles.trendHashtagContainer}>
                        <div className={styles.div4}>{j + 1}</div>
                        <div className={styles.hashtagtitle}>
                          <div className={styles.detail}>
                            <img
                              onMouseOver={() => handleOnMouseOver(j)}
                              onMouseLeave={handleOnMouseLeave}
                              onClick={() => copyHashtagToClipboard(j, u.name)}
                              className={styles.component9431}
                              title="Copy hashtag"
                              alt="Hashtag icon"
                              src={selectHashtagIcon(j, u.name)}
                            />
                            <div className={styles.instagramer}>{u.name}</div>
                          </div>
                        </div>
                        <Tooltip tooltipValue={u.mediaCount.toLocaleString()} position="RTL">
                          <div className={styles.k}>{calculateSummary(u.mediaCount)}</div>
                        </Tooltip>
                      </div>
                    </SliderSlide>
                  ))}
            </Slider>
          )}
        </div>
      </div>

      {state.showPopup && (
        <div className={styles.popupcopy}>
          <div className="headerparent">
            <div>
              {t(LanguageKey.messagesetting_selectedwords)} ( <strong>{state.selectedHashtags.length}</strong> )
            </div>
            <div className={styles.popupbtn}>
              <img
                onClick={copyAllHashtagsToClipboard}
                style={{
                  cursor: "pointer",
                  width: "25px",
                  height: "25px",
                }}
                title="Copy selected hashtags"
                alt="Copy icon"
                src="/copy.svg"
              />
              <img
                onClick={clearHashtagList}
                style={{
                  cursor: "pointer",
                  width: "25px",
                  height: "25px",
                }}
                title="Clear selected hashtags"
                alt="Delete icon"
                src="/delete.svg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrandHashtags;
