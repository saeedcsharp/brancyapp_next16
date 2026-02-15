import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Dotmenu from "saeed/components/design/dotMenu/dotMenu";
import RingLoader from "saeed/components/design/loader/ringLoder";
import Slider, { SliderSlide } from "saeed/components/design/slider/slider";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import { LanguageKey } from "saeed/i18n";
import { ILoadingStatus } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { IDetailPrompt } from "saeed/models/AI/prompt";
import { MethodType } from "saeed/helper/apihelper";
import { AutoReplyPayLoadType, MediaProductType } from "saeed/models/messages/enum";
import { IGeneralAutoReply } from "saeed/models/messages/properies";
import styles from "./properties.module.css";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
const containsFarsiOrArabic = (text: string): boolean => {
  const farsiArabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return farsiArabicRegex.test(text);
};
type AutoReplyAction =
  | { type: "TOGGLE_HIDDEN" }
  | { type: "TOGGLE_SETTINGS" }
  | { type: "SET_AUTO_DIRECT"; payload: boolean }
  | { type: "SET_LOADING_STATUS"; payload: Partial<ILoadingStatus> };
interface AutoReplyState {
  isHidden: boolean;
  showSetting: boolean;
  activeAutoDirect: boolean;
  loadingStatus: ILoadingStatus;
}
function autoReplyReducer(state: AutoReplyState, action: AutoReplyAction): AutoReplyState {
  switch (action.type) {
    case "TOGGLE_HIDDEN":
      return { ...state, isHidden: !state.isHidden };
    case "TOGGLE_SETTINGS":
      return { ...state, showSetting: !state.showSetting };
    case "SET_AUTO_DIRECT":
      return { ...state, activeAutoDirect: action.payload };
    case "SET_LOADING_STATUS":
      return {
        ...state,
        loadingStatus: { ...state.loadingStatus, ...action.payload },
      };
    default:
      return state;
  }
}
function AutoReply({
  autoReplies,
  handleShowEditAutoreply,
  handleGeneralActiveAutoreply,
  handleGetNextAutoreply,
}: {
  handleShowEditAutoreply: (id: string | null) => void;
  autoReplies: IGeneralAutoReply[];
  handleGeneralActiveAutoreply: (on: boolean) => void;
  handleGetNextAutoreply: (nextMaxId: string) => void;
}) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const mediaProductMapping = useMemo(
    () => ({
      [MediaProductType.Ad]: t(LanguageKey.everywhere),
      [MediaProductType.Feed]: t(LanguageKey.navbar_Feed),
      [MediaProductType.Story]: t(LanguageKey.navbar_Story),
      [MediaProductType.Reels]: t(LanguageKey.navbar_Reels),
      [MediaProductType.Unknow]: t(LanguageKey.Unknown),
      [MediaProductType.Live]: t(LanguageKey.navbar_Live),
    }),
    [t]
  );
  const [state, dispatch] = useReducer(autoReplyReducer, {
    isHidden: false,
    showSetting: false,
    activeAutoDirect: true,
    loadingStatus: {
      notShopper: false,
      notBasePackage: false,
      notFeature: false,
      loading: false,
      notPassword: false,
      ok: true,
      notBusiness: false,
      notLoginByFb: false,
    },
  });
  const { isHidden, showSetting, activeAutoDirect, loadingStatus } = state;
  const menuRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLDivElement>(null);
  const [explanationsVisible, setExplanationsVisible] = useState<string[]>([]);
  const [promptLoading, setPromptLoading] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<IDetailPrompt[]>([]);
  const handleCircleClick = useCallback(() => {
    dispatch({ type: "TOGGLE_HIDDEN" });
  }, []);
  const handleClickOnIcon = useCallback(
    (id: string) => {
      switch (id) {
        case t(LanguageKey.activateAll):
          handleGeneralActiveAutoreply(true);
          dispatch({ type: "TOGGLE_SETTINGS" });
          break;
        case t(LanguageKey.DeactivateAll):
          handleGeneralActiveAutoreply(false);
          dispatch({ type: "TOGGLE_SETTINGS" });
          break;
      }
    },
    [t, handleGeneralActiveAutoreply]
  );
  const handleShowEditAutoreplyCallback = useCallback(
    (id: string | null) => {
      console.log("handleShowEditAutoreplyCallback", id);
      handleShowEditAutoreply(id);
    },
    [handleShowEditAutoreply]
  );
  const handleSliderReachEnd = useCallback(() => {
    if (autoReplies && autoReplies.length > 0) {
      handleGetNextAutoreply(autoReplies[autoReplies.length - 1].id);
    }
  }, [autoReplies, handleGetNextAutoreply]);
  const toggleExplanationForAI = useCallback(
    async (promptId: string | null) => {
      if (!promptId) return;
      try {
        setPromptLoading(promptId);
        setExplanationsVisible((prev) => {
          const existedPromptId = prev.find((x) => x === promptId);
          if (existedPromptId) {
            return prev.filter((x) => x !== promptId);
          } else {
            return [...prev, promptId];
          }
        });
        if (selectedPrompt.find((p) => p.promptId === promptId)) return;
        const res = await clientFetchApi<boolean, IDetailPrompt>(`/api/ai/GetPrompt`, { methodType: MethodType.get, session: session, data: null, queries: [{ key: "promptId", value: promptId }], onUploadProgress: undefined });
        if (res.succeeded) {
          setSelectedPrompt((prev) => [...prev, res.value]);
        } else {
          notify(res.info.responseType, NotifType.Warning);
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      } finally {
        setPromptLoading(null);
      }
    },
    [session, selectedPrompt]
  );
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSetting &&
        menuRef.current &&
        settingsButtonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !settingsButtonRef.current.contains(event.target as Node)
      ) {
        dispatch({ type: "TOGGLE_SETTINGS" });
      }
    };
    if (showSetting) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSetting]);
  return (
    <div className="tooBigCard" style={{ gridRowEnd: isHidden ? "span 10" : "span 82" }}>
      <div className="headerparent">
        <div className="headerChild" onClick={handleCircleClick}>
          <div className="circle"></div>
          <div className="Title">{t(LanguageKey.automaticreply)}</div>
        </div>
        <Dotmenu
          showSetting={showSetting}
          onToggle={() => dispatch({ type: "TOGGLE_SETTINGS" })}
          handleClickOnIcon={handleClickOnIcon}
          data={[
            {
              icon: "/Activate_All.svg",
              value: t(LanguageKey.activateAll),
            },
            {
              icon: "/Deactive_All.svg",
              value: t(LanguageKey.DeactivateAll),
            },
          ]}
        />
      </div>
      <div className={`${styles.all} ${isHidden ? "" : styles.show}`}>
        {loadingStatus.loading && <Loading />}
        {loadingStatus.ok && (
          <>
            <div
              onClick={() => handleShowEditAutoreplyCallback("")}
              className={styles.addnewlink}
              title="◰ create new automatic reply">
              <div className={styles.addnewicon}>
                <svg width="22" height="22" viewBox="0 0 22 22">
                  <path
                    d="M22 11q-.1 1.5-1.6 1.6h-7.8v7.8a1.6 1.6 0 1 1-3.2 0v-7.8H1.6a1.6 1.6 0 1 1 0-3.2h7.8V1.6a1.6 1.6 0 1 1 3.2 0v7.8h7.8q1.5.1 1.6 1.6"
                    fill="var(--color-dark-blue)"
                  />
                </svg>
              </div>
              <div className={styles.addnewcontent}>
                <div className={styles.addnewheader}>{t(LanguageKey.add)}</div>
                <div className="explain">{t(LanguageKey.autocommentReplyExplain)}</div>
              </div>
            </div>
            <div
              className={`${styles.autoreply} ${!activeAutoDirect && "fadeDiv"}`}
              role="region"
              aria-label="Direct message prompts">
              <Slider className={styles.swiperContent} onReachEnd={handleSliderReachEnd} itemsPerSlide={2}>
                {autoReplies.map((u) => (
                  <SliderSlide key={u.id}>
                    <div className={styles.autoreplycontainer}>
                      <div className="headerparent" style={{ paddingInlineEnd: "10px" }}>
                        <div className="headertext">{u.title}</div>
                        <div className={styles.headermenu} onClick={() => handleShowEditAutoreplyCallback(u.id)}>
                          <svg className="twoDotIcon" fill="none" viewBox="0 0 14 5">
                            <path
                              fill="var(--color-gray)"
                              d="M2.5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m9 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"
                            />
                          </svg>
                        </div>
                      </div>
                      {u.automaticType === AutoReplyPayLoadType.KeyWord && (
                        <div
                          className={`${styles.responseparent} ${u.pauseTime !== null && "fadeDiv"}`}
                          role="group"
                          aria-labelledby="specific-keywords-title">
                          <div className={styles.headertitle2}>
                            {u.items.length > 1
                              ? t(LanguageKey.messagesetting_KeywordsSensitive)
                              : t(LanguageKey.messagesetting_KeywordSensitive)}
                          </div>
                          <div className={styles.wordpool}>
                            {u.items.map((item, index) => (
                              <div key={index} className={styles.specificword}>
                                {item.text}
                              </div>
                            ))}
                          </div>
                          <div className={styles.headertitle2}>{t(LanguageKey.reply)}</div>
                          <div
                            className={styles.responsetext}
                            style={{
                              textAlign: containsFarsiOrArabic(u.response ?? "") ? "right" : "left",
                            }}>
                            {u.response}
                          </div>
                        </div>
                      )}
                      {u.automaticType === AutoReplyPayLoadType.AI && u.prompt && (
                        <div
                          className={`${styles.responseparent} ${u.pauseTime !== null && "fadeDiv"}`}
                          role="group"
                          aria-labelledby="specific-keywords-title">
                          <div className={styles.headertitle2}>
                            {u.items.length > 1
                              ? t(LanguageKey.messagesetting_KeywordsSensitive)
                              : t(LanguageKey.messagesetting_KeywordSensitive)}
                          </div>
                          <div className={styles.wordpool}>
                            {u.items.map((item, index) => (
                              <div key={index} className={styles.specificword}>
                                {item.text}
                              </div>
                            ))}
                          </div>
                          <div className={styles.headertitle2}>{t(LanguageKey.AIFlow_item_title)}</div>
                          <div
                            className={styles.responsetext}
                            style={{
                              textAlign: containsFarsiOrArabic(u.response ?? "") ? "right" : "left",
                            }}>
                            {u.prompt.title}
                          </div>
                          <div className="headerandinput">
                            <div className={styles.seeanswer} onClick={() => toggleExplanationForAI(u.promptId)}>
                              {explanationsVisible.find((x) => x === u.promptId) ? (
                                <span>{t(LanguageKey.Hide)}</span>
                              ) : (
                                <span>{t(LanguageKey.show)}</span>
                              )}
                              {t(LanguageKey.Answer)}
                            </div>
                            {explanationsVisible.find((x) => x === u.promptId) && (
                              <div className="explain" role="textbox" aria-label="Answer for prompt">
                                {promptLoading && promptLoading === u.promptId && <RingLoader />}
                                {!promptLoading &&
                                  selectedPrompt.length > 0 &&
                                  selectedPrompt.find((p) => p.promptId === u.promptId)?.promptStr}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {u.automaticType === AutoReplyPayLoadType.Flow && u.masterFlow && (
                        <div
                          className={`${styles.responseparent} ${u.pauseTime !== null && "fadeDiv"}`}
                          role="group"
                          aria-labelledby="specific-keywords-title">
                          <div className={styles.headertitle2}>
                            {u.items.length > 1
                              ? t(LanguageKey.messagesetting_KeywordsSensitive)
                              : t(LanguageKey.messagesetting_KeywordSensitive)}
                          </div>
                          <div className={styles.wordpool}>
                            {u.items.map((item, index) => (
                              <div key={index} className={styles.specificword}>
                                {item.text}
                              </div>
                            ))}
                          </div>
                          <div className={styles.headertitle2}>{t(LanguageKey.AIFlow_item_title)}</div>
                          <div
                            className={styles.responsetext}
                            style={{
                              textAlign: containsFarsiOrArabic(u.response ?? "") ? "right" : "left",
                            }}>
                            {u.masterFlow.title}
                          </div>
                          <div className="headerandinput">
                            <button className="saveButton">show Flow Graph</button>
                          </div>
                        </div>
                      )}
                      {u.automaticType === AutoReplyPayLoadType.GeneralAI && (
                        <div
                          className={`${styles.responseparent} ${u.pauseTime !== null && "fadeDiv"}`}
                          role="group"
                          aria-labelledby="specific-keywords-title">
                          <div className={styles.headertitle2}>
                            {u.items.length > 1
                              ? t(LanguageKey.messagesetting_KeywordsSensitive)
                              : t(LanguageKey.messagesetting_KeywordSensitive)}
                          </div>
                          <div className={styles.wordpool}>
                            {u.items.map((item, index) => (
                              <div key={index} className={styles.specificword}>
                                {item.text}
                              </div>
                            ))}
                          </div>
                          <div className={styles.headertitle2}>{t(LanguageKey.reply)}</div>
                          <div
                            className={styles.responsetext}
                            style={{
                              textAlign: containsFarsiOrArabic(u.response ?? "") ? "right" : "left",
                            }}>
                            {"response by general AI"}
                          </div>
                        </div>
                      )}
                    </div>
                  </SliderSlide>
                ))}
              </Slider>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AutoReply;
