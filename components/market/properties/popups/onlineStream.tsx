import { useSession } from "next-auth/react";
import Head from "next/head";
import { ChangeEvent, SetStateAction, useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useTranslation } from "react-i18next";
import CheckBoxButton from "../../../design/checkBoxButton";
import InputText from "../../../design/inputText";
import RingLoader from "../../../design/loader/ringLoder";
import ToggleCheckBoxButton from "../../../design/toggleCheckBoxButton";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "../../../notifications/notificationBox";
import Loading from "../../../notOk/loading";
import { LanguageKey } from "../../../../i18n";
import { MethodType } from "../../../../helper/api";
import { IChannel, IChannelBox, IChannelInfo, ISearchChannel, IUpdateChannel } from "../../../../models/market/properties";
import styles from "./featureBoxPU.module.css";
import { clientFetchApi } from "../../../../helper/clientFetchApi";
const initialChannelSearchState: ISearchChannel = {
  searchAparatPage: "",
  searchYoutubePage: "",
  activeAparat: false,
  activeTwitch: false,
  activeYoutube: false,
  searchTwitchPage: "",
  embedAparat: false,
  embedTwitch: false,
  embedYoutube: false,
  aparatThumbnailUrl: "",
  twitchThumbnailUrl: "",
  youTubeThumbnailUrl: "",
};

const initialUpdateChannelState: IUpdateChannel = {
  embedVideo: false,
  id: "",
  isActive: false,
  username: "",
};

const initialChannelBoxState: IChannelBox = {
  channelInfo: [],
  peopleLocked: false,
  showAddPeapleBox: false,
  loading: false,
  notFound: false,
};

type StateAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CHANNEL_SEARCH"; payload: Partial<ISearchChannel> }
  | { type: "SET_UPDATE_YOUTUBE"; payload: Partial<IUpdateChannel> }
  | { type: "SET_UPDATE_APARAT"; payload: Partial<IUpdateChannel> }
  | { type: "SET_SELECTED_EMBED"; payload: string }
  | { type: "SET_CHANNEL_BOX"; payload: Partial<IChannelBox> }
  | { type: "RESET_CHANNEL_BOX" }
  | {
      type: "SET_INITIAL_DATA";
      payload: {
        channelSearch: ISearchChannel;
        updateYoutube: IUpdateChannel;
        updateAparat: IUpdateChannel;
      };
    };

const stateReducer = (state: any, action: StateAction) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_CHANNEL_SEARCH":
      return {
        ...state,
        channelSearch: { ...state.channelSearch, ...action.payload },
      };
    case "SET_UPDATE_YOUTUBE":
      return {
        ...state,
        updateYoutube: { ...state.updateYoutube, ...action.payload },
      };
    case "SET_UPDATE_APARAT":
      return {
        ...state,
        updateAparat: { ...state.updateAparat, ...action.payload },
      };
    case "SET_SELECTED_EMBED":
      return { ...state, selectedEmbed: action.payload };
    case "SET_CHANNEL_BOX":
      return {
        ...state,
        channelBox: { ...state.channelBox, ...action.payload },
      };
    case "RESET_CHANNEL_BOX":
      return { ...state, channelBox: initialChannelBoxState };
    case "SET_INITIAL_DATA":
      return {
        ...state,
        channelSearch: action.payload.channelSearch,
        updateYoutube: action.payload.updateYoutube,
        updateAparat: action.payload.updateAparat,
        loading: false,
      };
    default:
      return state;
  }
};

const VideoAndMusic = (props: { removeMask: () => void }) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const [state, dispatch] = useReducer(stateReducer, {
    loading: true,
    channelSearch: initialChannelSearchState,
    updateYoutube: initialUpdateChannelState,
    updateAparat: initialUpdateChannelState,
    selectedEmbed: "searchYoutubePage",
    channelBox: initialChannelBoxState,
  });

  const { loading, channelSearch, updateYoutube, updateAparat, selectedEmbed, channelBox } = state;
  const handleStreamSelection = useCallback((event: { target: { value: SetStateAction<string> } }) => {
    dispatch({
      type: "SET_SELECTED_EMBED",
      payload: event.target.value as string,
    });
    dispatch({ type: "RESET_CHANNEL_BOX" });
  }, []);

  const saveCondition = useMemo(() => {
    return !(
      (updateYoutube.isActive && !updateYoutube.id && !updateYoutube.username) ||
      (updateAparat.isActive && !updateAparat.id && !updateAparat.username)
    );
  }, [updateYoutube, updateAparat]);

  const handleApiChannelSearch = useCallback(
    async (query: string) => {
      try {
        const res = await clientFetchApi<boolean, IChannelInfo[]>(`/api/bio/${selectedEmbed}`, {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: [{ key: "query", value: query }],
          onUploadProgress: undefined,
        });

        if (res.succeeded) {
          dispatch({
            type: "SET_CHANNEL_BOX",
            payload: {
              channelInfo: res.value,
              loading: false,
              notFound: res.value.length === 0,
            },
          });
        } else {
          notify(res.info.responseType, NotifType.Warning);
        }
      } catch {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    },
    [session, selectedEmbed],
  );

  const handleSearchChannel = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const query = e.currentTarget.value;

      dispatch({
        type: "SET_CHANNEL_BOX",
        payload: {
          channelInfo: [],
          showAddPeapleBox: true,
          loading: true,
          notFound: false,
        },
      });

      dispatch({
        type: "SET_CHANNEL_SEARCH",
        payload: { [selectedEmbed]: query },
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (query.length > 0) {
        timeoutRef.current = setTimeout(() => {
          if (query && !channelBox.peopleLocked) {
            if (!query.startsWith("uc") && !query.startsWith("UC")) {
              internalNotify(InternalResponseType.ChannelIdNotStartedWithUC, NotifType.Info);
              dispatch({ type: "RESET_CHANNEL_BOX" });
              return;
            }
            dispatch({
              type: "SET_CHANNEL_BOX",
              payload: { peopleLocked: true },
            });
            handleApiChannelSearch(query);
            setTimeout(() => {
              dispatch({
                type: "SET_CHANNEL_BOX",
                payload: { peopleLocked: false },
              });
            }, 2000);
          }
        }, 1000);
      }
    },
    [selectedEmbed, channelBox.peopleLocked, handleApiChannelSearch],
  );

  const handleSave = useCallback(async () => {
    if (channelSearch.activeYoutube && (updateYoutube.id || updateYoutube.username)) {
      try {
        const youtubeUpdateRes = await clientFetchApi<IUpdateChannel, boolean>("/api/bio/SaveYoutubePage", {
          methodType: MethodType.post,
          session: session,
          data: updateYoutube,
          queries: undefined,
          onUploadProgress: undefined,
        });

        if (!youtubeUpdateRes.succeeded) {
          notify(youtubeUpdateRes.info.responseType, NotifType.Warning);
        }
      } catch {
        notify(ResponseType.Unexpected, NotifType.Warning);
      }
    }

    if (channelSearch.activeAparat && (updateAparat.id || updateAparat.username)) {
      try {
        const aparatUpdateRes = await clientFetchApi<IUpdateChannel, boolean>("/api/bio/SaveAparatPage", {
          methodType: MethodType.post,
          session: session,
          data: updateAparat,
          queries: undefined,
          onUploadProgress: undefined,
        });

        if (!aparatUpdateRes.succeeded) {
          notify(aparatUpdateRes.info.responseType, NotifType.Warning);
        }
      } catch {
        notify(ResponseType.Unexpected, NotifType.Warning);
      }
    }

    props.removeMask();
  }, [channelSearch, updateYoutube, updateAparat, session, props]);

  const handleSelectYoutubeChannel = useCallback((v: IChannelInfo) => {
    console.log("=== handleSelectYoutubeChannel ===");
    console.log("Selected channel:", v);
    console.log("Channel title:", v.channelTitle);
    console.log("Thumbnail URL:", v.lastVideoThumbnail);

    const payload = {
      searchYoutubePage: v.channelTitle || v.lastVideoTitle || "",
      youTubeThumbnailUrl: v.lastVideoThumbnail || v.profilePicture || "",
    };
    console.log("Dispatching payload:", payload);

    dispatch({
      type: "SET_CHANNEL_SEARCH",
      payload: payload,
    });

    dispatch({
      type: "SET_UPDATE_YOUTUBE",
      payload: {
        id: v.channelId || "",
        username: v.channelTitle || v.lastVideoTitle || "",
      },
    });

    dispatch({
      type: "SET_CHANNEL_BOX",
      payload: {
        showAddPeapleBox: false,
        channelInfo: [],
        loading: false,
        notFound: false,
      },
    });
  }, []);

  const handleSelectAparatChannel = useCallback((v: IChannelInfo) => {
    dispatch({
      type: "SET_CHANNEL_SEARCH",
      payload: {
        searchAparatPage: v.channelTitle || v.lastVideoTitle || "",
        aparatThumbnailUrl: v.lastVideoThumbnail || v.profilePicture || "",
      },
    });

    dispatch({
      type: "SET_UPDATE_APARAT",
      payload: {
        id: v.channelId || "",
        username: v.channelTitle || v.lastVideoTitle || "",
      },
    });

    dispatch({
      type: "SET_CHANNEL_BOX",
      payload: {
        showAddPeapleBox: false,
        channelInfo: [],
        loading: false,
        notFound: false,
      },
    });
  }, []);

  const handleActiveYoutube = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const isActive = e.target.checked;
    dispatch({
      type: "SET_CHANNEL_SEARCH",
      payload: { activeYoutube: isActive },
    });
    dispatch({ type: "SET_UPDATE_YOUTUBE", payload: { isActive } });
  }, []);

  const handleEmbedYoutube = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const embedVideo = e.target.checked;
    dispatch({
      type: "SET_CHANNEL_SEARCH",
      payload: { embedYoutube: embedVideo },
    });
    dispatch({ type: "SET_UPDATE_YOUTUBE", payload: { embedVideo } });
  }, []);

  const handleActiveAparat = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const isActive = e.target.checked;
    dispatch({
      type: "SET_CHANNEL_SEARCH",
      payload: { activeAparat: isActive },
    });
    dispatch({ type: "SET_UPDATE_APARAT", payload: { isActive } });
  }, []);

  const handleEmbedAparat = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const embedVideo = e.target.checked;
    dispatch({
      type: "SET_CHANNEL_SEARCH",
      payload: { embedAparat: embedVideo },
    });
    dispatch({ type: "SET_UPDATE_APARAT", payload: { embedVideo } });
  }, []);

  const fetchChannelData = useCallback(async () => {
    try {
      const res = await clientFetchApi<boolean, IChannel>(`/api/bio/GetChannels`, {
        methodType: MethodType.get,
        session: session,
        data: undefined,
        queries: undefined,
        onUploadProgress: undefined,
      });

      if (res.succeeded) {
        const channelSearchData: ISearchChannel = {
          activeAparat: res.value.aparatChannel?.isActive || false,
          activeTwitch: res.value.twitchChannel?.isActive || false,
          activeYoutube: res.value.youtubeChannel?.isActive || false,
          searchTwitchPage: res.value.twitchChannel?.video?.channelTitle || "",
          searchAparatPage: res.value.aparatChannel?.video?.channelTitle || "",
          searchYoutubePage: res.value.youtubeChannel?.video?.channelTitle || "",
          embedAparat: res.value.aparatChannel?.embedVideo || false,
          embedTwitch: res.value.twitchChannel?.embedVideo || false,
          embedYoutube: res.value.youtubeChannel?.embedVideo || false,
          aparatThumbnailUrl: res.value.aparatChannel?.video?.thumbnailMediaUrl || "",
          twitchThumbnailUrl: res.value.twitchChannel?.video?.thumbnailMediaUrl || "",
          youTubeThumbnailUrl: res.value.youtubeChannel?.video?.thumbnailMediaUrl || "",
        };

        const youtubeData: IUpdateChannel = {
          embedVideo: res.value.youtubeChannel?.embedVideo || false,
          id: res.value.youtubeChannel?.id || null,
          isActive: res.value.youtubeChannel?.isActive || false,
          username: res.value.youtubeChannel?.video?.channelTitle || null,
        };

        const aparatData: IUpdateChannel = {
          embedVideo: res.value.aparatChannel?.embedVideo || false,
          id: res.value.aparatChannel?.id || null,
          isActive: res.value.aparatChannel?.isActive || false,
          username: res.value.aparatChannel?.video?.channelTitle || null,
        };

        dispatch({
          type: "SET_INITIAL_DATA",
          payload: {
            channelSearch: channelSearchData,
            updateYoutube: youtubeData,
            updateAparat: aparatData,
          },
        });
      }
    } catch {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [session]);

  useEffect(() => {
    fetchChannelData();
  }, [fetchChannelData]);
  return (
    <>
      {/* head for SEO */}
      <Head>
        {" "}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ {t(LanguageKey.marketPropertiesOnlineStream)}</title>
        <meta name="description" content="Advanced Instagram post management tool" />
        <meta
          name="keywords"
          content="instagram, manage, tools, Brancy,post create , story create , Lottery , insight , Graph , like , share, comment , view , tag , hashtag , "
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.Brancy.app/page/posts" />
        {/* Add other meta tags as needed */}
      </Head>
      {/* head for SEO */}
      <div className="headerandinput">
        <div className="title">{t(LanguageKey.marketPropertiesOnlineStream)}</div>
        <div className="explain">{t(LanguageKey.marketPropertiesOnlineStreamexplain)}</div>
        <div className={styles.radioinput}>
          <label className={styles.option}>
            <input
              value="searchYoutubePage"
              name="value-radio-Embed"
              id="searchYoutubePage"
              type="radio"
              onChange={handleStreamSelection}
              checked={selectedEmbed === "searchYoutubePage"}
            />
            <svg fill="red" viewBox="0 0 25 17">
              <path d="M24.5 2.7a3 3 0 0 0-.8-1.4L22.3.5c-2-.5-9.8-.5-9.8-.5S4.7 0 2.7.5q-.8.2-1.4.8a3 3 0 0 0-.8 1.4 33 33 0 0 0 0 11.6q.3.8.8 1.4t1.4.8c2 .5 9.8.5 9.8.5s7.8 0 9.8-.5q.8-.2 1.4-.8t.8-1.4a33 33 0 0 0 0-11.6M9.9 12V4.9l6.6 3.6z" />
            </svg>
            <span>Youtube</span>
          </label>

          <label className={styles.option}>
            <input
              value="twitchEmbed"
              name="value-radio-Embed"
              id="twitchEmbed"
              type="radio"
              onChange={handleStreamSelection}
              checked={selectedEmbed === "twitchEmbed"}
            />
            <svg fill="var(--color-purple)" viewBox="0 0 25 25">
              <path d="M5.2 0H25v12.5h-.1l-9.4 8h-4l-.1.1L6.3 25v-4.5H0V4.3zm1 1.8v13.4H11v3.1h.1l3.7-3.1h4.1l4.1-3.7V1.8zm8 2.9v6.2h-2.4V4.7zm5.7 0v6.2h-2.5V4.7z" />
            </svg>
            <span>Twitch</span>
          </label>
          <label className={styles.option}>
            <input
              value="searchAparatPage"
              name="value-radio-Embed"
              id="searchAparatPage"
              type="radio"
              onChange={handleStreamSelection}
              checked={selectedEmbed === "searchAparatPage"}
            />
            <svg fill="var(--color-dark-red)" viewBox="0 0 25 25">
              <path d="M12.5 1.7a10.8 10.8 0 1 0 0 21.6 10.8 10.8 0 0 0 0-21.6M6.4 7a3.1 3.1 0 1 1 6 1.1 3.1 3.1 0 0 1-6-1.1m4.5 9.3a3.1 3.1 0 1 1-6-1.2 3.1 3.1 0 0 1 6 1.2m1.3-2.5a1.4 1.4 0 1 1 .5-2.7 1.4 1.4 0 0 1-.5 2.7m6.5 4a3.1 3.1 0 1 1-6.1-1.2 3.1 3.1 0 0 1 6 1.2m-2-5.7a3.1 3.1 0 1 1 1-6 3.1 3.1 0 0 1-1 6m-2.5 12 2.3.7a4 4 0 0 0 4.8-2.8l.6-2.5a12 12 0 0 1-7.7 4.6m8-20.4L19.6 3a12 12 0 0 1 4.5 8l.7-2.6A4 4 0 0 0 22 3.7M.6 14.4l-.5 2.1a4 4 0 0 0 2.7 4.7l2.2.6Q1.5 19 .7 14.4M10.8.7 8.5.1A4 4 0 0 0 3.8 3l-.6 2q3-3.7 7.6-4.4" />
            </svg>
            <span>Aparat</span>
          </label>
        </div>
      </div>
      {loading && <Loading />}
      {!loading && (
        <>
          {selectedEmbed === "searchYoutubePage" && (
            <div className={styles.all}>
              <div className="headerandinput">
                <div className="headerparent">
                  <div className="title">{t(LanguageKey.activate)}</div>
                  <ToggleCheckBoxButton
                    name="youtubeToggle"
                    handleToggle={handleActiveYoutube}
                    checked={channelSearch.activeYoutube}
                    title="Toggle YouTube Channel"
                    role="switch"
                    aria-label="Toggle YouTube Channel"
                  />
                </div>
              </div>
              <div className={`headerandinput ${!channelSearch.activeYoutube && "fadeDiv"}`}>
                <div className="headerandinput">
                  <div className="title2">{t(LanguageKey.searchID)}</div>
                  <div className="explain">{t(LanguageKey.searchIDexplain)}</div>
                </div>
                <div className="headerparent">
                  <InputText
                    className={"textinputbox"}
                    placeHolder={t(LanguageKey.pageToolspopup_typehere)}
                    handleInputChange={handleSearchChannel}
                    value={channelSearch?.searchYoutubePage!}
                    maxLength={undefined}
                    name={""}
                  />
                  <img
                    onClick={() => {
                      navigator.clipboard.writeText(channelSearch?.searchYoutubePage!);
                    }}
                    style={{
                      cursor: "pointer",
                      width: "30px",
                      height: "30px",
                      padding: "5px",
                    }}
                    title="ℹ️ paste"
                    src="/copy.svg"
                  />
                </div>
                {channelSearch && channelSearch.searchYoutubePage.length > 0 && channelBox.showAddPeapleBox && (
                  <div className={styles.resultSearchmention}>
                    {!channelBox.notFound &&
                      !channelBox.loading &&
                      channelBox.channelInfo.map((v: IChannelInfo) => (
                        <div
                          onClick={() => handleSelectYoutubeChannel(v)}
                          key={v.channelId}
                          className={styles.searchContent}>
                          <img
                            loading="lazy"
                            decoding="async"
                            alt="profile"
                            className={styles.userProfile}
                            src={v.profilePicture ? v.profilePicture : "/no-profile.svg"}
                          />
                          <div className={styles.username}>{v.channelTitle}</div>
                        </div>
                      ))}
                    {!channelBox.loading && channelBox.notFound && (
                      <div className={styles.loading}>{t(LanguageKey.notfound)} </div>
                    )}
                    {channelBox.loading && (
                      <div className={styles.loading}>
                        <RingLoader />
                      </div>
                    )}
                  </div>
                )}
                {channelSearch.youTubeThumbnailUrl.length > 0 && (
                  <img
                    loading="lazy"
                    decoding="async"
                    alt="thumbnail"
                    src={channelSearch.youTubeThumbnailUrl}
                    className={styles.searchresult}
                  />
                )}
                {channelSearch.youTubeThumbnailUrl.length === 0 && <div className={styles.searchresult} />}
              </div>
              <div className={`headerandinput ${!channelSearch.activeYoutube && "fadeDiv"}`}>
                <CheckBoxButton
                  name="embedYoutube"
                  title="Toggle YouTube Embedding"
                  handleToggle={handleEmbedYoutube}
                  value={channelSearch.embedYoutube}
                  textlabel={t(LanguageKey.Embed)}
                />

                <div className="explain">{t(LanguageKey.Embedexplain)}</div>
              </div>
            </div>
          )}

          {selectedEmbed === "searchAparatPage" && (
            <div className={styles.all}>
              <div className="headerandinput">
                <div className="headerparent">
                  <div className="title">{t(LanguageKey.activate)}</div>
                  <ToggleCheckBoxButton
                    name="aparatToggle"
                    handleToggle={handleActiveAparat}
                    checked={channelSearch.activeAparat}
                    title="Toggle Aparat Channel"
                    role="switch"
                    aria-label="Toggle Aparat Channel"
                  />
                </div>
              </div>

              <div className={`headerandinput ${!channelSearch.activeAparat && "fadeDiv"}`}>
                <div className="headerandinput">
                  <div className="title2">{t(LanguageKey.searchID)}</div>
                  <div className="explain">{t(LanguageKey.searchIDexplain)}</div>
                </div>
                <div className="headerparent">
                  <InputText
                    className={"textinputbox"}
                    placeHolder={t(LanguageKey.pageToolspopup_typehere)}
                    handleInputChange={handleSearchChannel}
                    value={channelSearch?.searchAparatPage!}
                    maxLength={undefined}
                    name={"searchAparatPage"}
                  />
                  <img
                    onClick={() => {
                      navigator.clipboard.writeText(channelSearch?.searchAparatPage!);
                    }}
                    style={{
                      cursor: "pointer",
                      width: "30px",
                      height: "30px",
                      padding: "5px",
                    }}
                    title="ℹ️ paste"
                    src="/copy.svg"
                  />
                </div>
                {channelSearch && channelSearch.searchAparatPage.length > 0 && channelBox.showAddPeapleBox && (
                  <div className={styles.resultSearchmention}>
                    {!channelBox.notFound &&
                      !channelBox.loading &&
                      channelBox.channelInfo.map((v: IChannelInfo) => (
                        <div
                          onClick={() => handleSelectAparatChannel(v)}
                          key={v.channelId}
                          className={styles.searchContent}>
                          <img
                            loading="lazy"
                            decoding="async"
                            alt="profile"
                            className={styles.userProfile}
                            src={v.profilePicture ? v.profilePicture : "/no-profile.svg"}
                          />
                          <div className={styles.username}>{v.channelTitle}</div>
                        </div>
                      ))}
                    {!channelBox.loading && channelBox.notFound && (
                      <div className={styles.loading}>{t(LanguageKey.notfound)} </div>
                    )}
                    {channelBox.loading && (
                      <div className={styles.loading}>
                        <RingLoader />
                      </div>
                    )}
                  </div>
                )}
                {channelSearch.aparatThumbnailUrl.length > 0 && (
                  <img
                    loading="lazy"
                    decoding="async"
                    alt="thumbnail"
                    src={channelSearch.aparatThumbnailUrl}
                    className={styles.searchresult}
                  />
                )}
                {channelSearch.aparatThumbnailUrl.length === 0 && <div className={styles.searchresult} />}
              </div>
              <div className={`headerandinput ${!channelSearch.activeAparat && "fadeDiv"}`}>
                <CheckBoxButton
                  name="embedAparatToggle"
                  title="Toggle Aparat Embedding"
                  handleToggle={handleEmbedAparat}
                  value={channelSearch.embedAparat}
                  textlabel={t(LanguageKey.Embed)}
                />
                <div className="explain">{t(LanguageKey.Embedexplain)}</div>
              </div>
            </div>
          )}
          {selectedEmbed === "twitchEmbed" && (
            <div className={`${styles.all} fadeDiv `}>
              <div className="headerandinput">
                <div className="headerparent">
                  <div className="title">{t(LanguageKey.activate)}</div>
                  <ToggleCheckBoxButton name="" handleToggle={() => " "} checked={false} title={""} role={""} />
                </div>
              </div>

              <div className="headerandinput">
                <div className="headerandinput">
                  <div className="title2">{t(LanguageKey.searchID)}</div>
                  <div className="explain">{t(LanguageKey.searchIDexplain)}</div>
                </div>
                <div className="headerparent">
                  <InputText
                    className={"textinputbox"}
                    placeHolder={t(LanguageKey.pageToolspopup_typehere)}
                    name={"searchTwitchPage"}
                    handleInputChange={function (e: ChangeEvent<HTMLInputElement>): void {
                      throw new Error("Function not implemented.");
                    }}
                    value={""}
                  />
                  <img
                    style={{
                      cursor: "pointer",
                      width: "30px",
                      height: "30px",
                      padding: "5px",
                    }}
                    title="ℹ️ paste"
                    src="/copy.svg"
                  />
                </div>

                <img loading="lazy" decoding="async" alt="thumbnail" src="/soon.svg" className={styles.searchresult} />
              </div>
              <div className="headerandinput">
                <CheckBoxButton
                  name="embedTwitchToggle"
                  title="Toggle Twitch Embedding"
                  handleToggle={function (e: ChangeEvent<HTMLInputElement>): void {
                    throw new Error("Function not implemented.");
                  }}
                  value={false}
                  textlabel={t(LanguageKey.Embed)}
                />

                <div className="explain">{t(LanguageKey.Embedexplain)}</div>
              </div>
            </div>
          )}
          <div className="ButtonContainer">
            <div className="cancelButton" onClick={props.removeMask}>
              {t(LanguageKey.cancel)}
            </div>
            <button
              disabled={!saveCondition}
              onClick={handleSave}
              className={!saveCondition ? "disableButton" : "saveButton"}>
              {t(LanguageKey.save)}
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default VideoAndMusic;
