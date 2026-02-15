import { useSession } from "next-auth/react";
import router from "next/router";
import { useCallback, useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import AIButton from "saeed/components/design/ai/AIButton";
import InputText from "saeed/components/design/inputText";
import RingLoader from "saeed/components/design/loader/ringLoder";
import RadioButton from "saeed/components/design/radioButton";
import TextArea from "saeed/components/design/textArea/textArea";
import FlexibleToggleButton from "saeed/components/design/toggleButton/flexibleToggleButton";
import ToggleCheckBoxButton from "saeed/components/design/toggleCheckBoxButton";
import Tooltip from "saeed/components/design/tooltip/tooltip";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import { LanguageKey } from "saeed/i18n/languageKeys";
import { IAITools, IAnalysisPrompt, ICreatePrompt, IDetailPrompt, ITotalPrompt } from "saeed/models/AI/prompt";
import { MethodType } from "saeed/helper/apihelper";
import styles from "./aiPromptBox.module.css";
import LiveChat from "./popup/liveChat";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
const AIPromptBox = ({
  aiTools,
  userSelectId,
  showUserList,
  updateAIPrompt,
  showAIToolsSettings,
  setShowAIToolsSettings,
  selectedAITool,
  setSelectedAITool,
  onAddToPromptRef,
  showLiveChatPopup,
  setShowLiveChatPopup,
  promptInfo,
  setPromptInfo,
}: {
  aiTools: IAITools[];
  userSelectId: string | null;
  showUserList: () => void;
  updateAIPrompt: (prompt: ITotalPrompt) => void;
  showAIToolsSettings: boolean;
  setShowAIToolsSettings: (value: boolean) => void;
  selectedAITool: IAITools | null;
  setSelectedAITool: (tool: IAITools | null) => void;
  onAddToPromptRef: React.MutableRefObject<((text: string) => void) | null>;
  showLiveChatPopup: boolean;
  setShowLiveChatPopup: (value: boolean) => void;
  promptInfo: ICreatePrompt | null;
  setPromptInfo: React.Dispatch<React.SetStateAction<ICreatePrompt | null>>;
}) => {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const manualModeId = useId();
  const analysisModeId = useId();
  const [isPending, startTransition] = useTransition();
  const [detailedPrompt, setDetailedPrompt] = useState<IDetailPrompt>({
    createdTime: 0,
    fbId: "",
    promptId: "",
    promptStr: "",
    reNewForThread: false,
    shouldFollower: false,
    title: "",
    updatedTime: 0,
    customPromptAnalysis: null,
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [advancePrompt, setAdvancePrompt] = useState(false);
  const [loadingPromptAnalysis, setLoadingPromptAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isWideScreen, setIsWideScreen] = useState(true);
  const [promptMode, setPromptMode] = useState<"manual" | "analysis">("manual");
  const handleAddToPrompt = useCallback((text: string) => {
    setDetailedPrompt((prev) => ({
      ...prev,
      promptStr: prev.promptStr ? prev.promptStr + " " + text : text,
    }));
  }, []);

  const getDisplayName = useCallback(
    (name: string) => {
      switch (name) {
        case "send_sms_ir_code":
          return t(LanguageKey.sendsms);
        case "send_to_telegram":
          return t(LanguageKey.sendtotelegram);
        case "SENDER_USERNAME":
          return t(LanguageKey.senderusername);
        default:
          return name;
      }
    },
    [t]
  );

  useEffect(() => {
    if (onAddToPromptRef) {
      onAddToPromptRef.current = handleAddToPrompt;
    }
  }, [onAddToPromptRef, handleAddToPrompt]);

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setDetailedPrompt((prev) => ({ ...prev, customPromptAnalysis: null }));
        const res = await clientFetchApi<boolean, IDetailPrompt>("/api/ai/GetPrompt", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "promptId", value: userSelectId! }], onUploadProgress: undefined });
        if (!signal?.aborted) {
          if (res.succeeded) {
            setDetailedPrompt(res.value);
            const hasAnalysis = res.value.customPromptAnalysis !== null;
            setAdvancePrompt(hasAnalysis);
            setPromptMode(hasAnalysis ? "analysis" : "manual");
          } else notify(res.info.responseType, NotifType.Warning);
        }
      } catch (error) {
        if (!signal?.aborted) {
          notify(ResponseType.Unexpected, NotifType.Error);
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [session, userSelectId]
  );
  const checkCondition = useMemo(() => {
    return detailedPrompt.title.length > 0 && detailedPrompt.promptStr.length > 20 && !updateLoading;
  }, [detailedPrompt.title, detailedPrompt.promptStr, updateLoading]);
  const checkPromptAnalysisCondition = useMemo(() => {
    return detailedPrompt.promptStr.length > 0 && !loadingPromptAnalysis && advancePrompt;
  }, [detailedPrompt.promptStr, loadingPromptAnalysis, advancePrompt]);
  const handleCreateAIPrompt = useCallback(async () => {
    try {
      setUpdateLoading(true);
      const res = await clientFetchApi<ICreatePrompt, ITotalPrompt>("/api/ai/CreatePrompt", { methodType: MethodType.post, session: session, data: {
          prompt: detailedPrompt.promptStr,
          title: detailedPrompt.title,
          reNewForThread: detailedPrompt.reNewForThread,
          shouldFollower: detailedPrompt.shouldFollower,
          promptAnalysis: advancePrompt ? detailedPrompt.customPromptAnalysis : null,
        }, queries: [{ key: "promptId", value: userSelectId ? userSelectId : undefined }], onUploadProgress: undefined });
      if (res.succeeded) {
        updateAIPrompt(res.value);
        internalNotify(InternalResponseType.Ok, NotifType.Success);
        setShowAIToolsSettings(false);
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setUpdateLoading(false);
    }
  }, [session, detailedPrompt, advancePrompt, userSelectId, updateAIPrompt, setShowAIToolsSettings]);
  const handleGetPromptAnalysis = useCallback(async () => {
    setDetailedPrompt((prev) => ({ ...prev, customPromptAnalysis: null }));
    setLoadingPromptAnalysis(true);
    startTransition(async () => {
      try {
        const res = await clientFetchApi<string, IAnalysisPrompt>("/api/ai/GetPromptAnalysis", { methodType: MethodType.post, session: session, data: { str: detailedPrompt.promptStr }, queries: undefined, onUploadProgress: undefined });
        if (res.succeeded) {
          setDetailedPrompt((prev) => ({
            ...prev,
            customPromptAnalysis: res.value,
          }));
        } else {
          notify(res.info.responseType, NotifType.Warning);
          setPromptMode("manual");
          setAdvancePrompt(false);
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
        setPromptMode("manual");
        setAdvancePrompt(false);
      } finally {
        setLoadingPromptAnalysis(false);
      }
    });
  }, [session, detailedPrompt.promptStr, startTransition]);

  useEffect(() => {
    const abortController = new AbortController();
    if (userSelectId) {
      fetchData(abortController.signal).catch(() => {
        /* ignore errors handled inside fetchData */
      });
    } else {
      setAdvancePrompt(false);
      setPromptMode("manual");
      setDetailedPrompt({
        createdTime: 0,
        fbId: "",
        promptId: "",
        promptStr: "",
        reNewForThread: false,
        shouldFollower: false,
        title: "",
        updatedTime: 0,
        customPromptAnalysis: null,
      });
      setLoading(false);
    }
    return () => {
      abortController.abort();
    };
  }, [userSelectId, fetchData]);
  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 1440);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mergedAITools = useMemo(
    () => [
      {
        name: "SENDER_USERNAME",
        description: "Use username in your prompt",
        completeDescription: "Use username in your prompt",
        tokenUsage: 0,
        parameters: [],
      },
      ...aiTools,
    ],
    [aiTools]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (checkCondition) {
          handleCreateAIPrompt();
        }
      } else if (e.key === "Escape") {
        showUserList();
      }
    },
    [checkCondition, handleCreateAIPrompt, showUserList]
  );

  return (
    <>
      {loading && <Loading />}
      {/* ___header ___*/}
      {!loading && (
        <>
          <div className="headerandinput" onKeyDown={handleKeyDown}>
            <div className={styles.headerprompt}>
              <svg
                onClick={showUserList}
                className={styles.backicon}
                fill="none"
                viewBox="0 0 14 11"
                role="button"
                aria-label={t(LanguageKey.back) || "Back"}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && showUserList()}>
                <path
                  d="M13 4.4H3.3l3-3A1 1 0 0 0 5 0L.3 4.7A1 1 0 0 0 .3 6l4.6 4.7a1 1 0 0 0 1.4-1.4l-3-3H13a1 1 0 0 0 0-2"
                  fill="var(--color-light-blue)"
                />
              </svg>

              <h1 className="title">{t(LanguageKey.AIAssisment)}</h1>
              <Tooltip position="bottom" onHover tooltipValue={t(LanguageKey.AIAssismentexplain)}>
                <img
                  style={{ cursor: "pointer", width: "15px" }}
                  alt="Information"
                  src="/tooltip.svg"
                  role="img"
                  aria-label="AI Assisment Information"
                />
              </Tooltip>
            </div>

            {!isWideScreen && (
              <FlexibleToggleButton
                options={[
                  { id: 0, label: t(LanguageKey.General) },
                  { id: 1, label: t(LanguageKey.testlab) },
                ]}
                selectedValue={activeTab}
                onChange={setActiveTab}
              />
            )}
          </div>
          <div className={styles.aiPromptContainer}>
            {/* ------------------------- */}

            {/* ___chat___*/}
            {(isWideScreen || activeTab === 0) && (
              <section className={styles.AIgeneral} ref={chatBoxRef} role="region" aria-label="AI Prompt Settings">
                <div className="headerandinput">
                  <div className="headerparent">
                    <label htmlFor="prompt-title" className="headertext">
                      {t(LanguageKey.navbar_Title)}
                    </label>
                    <div className="counter" aria-live="polite">
                      {detailedPrompt.title.length}/50
                    </div>
                  </div>
                  <InputText
                    id="prompt-title"
                    dangerOnEmpty
                    maxLength={50}
                    className={"textinputbox"}
                    handleInputChange={(e) => {
                      setDetailedPrompt((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }));
                    }}
                    value={detailedPrompt.title}
                    aria-required="true"
                    aria-describedby="title-counter"
                  />
                </div>

                <div className={styles.promptModeparent}>
                  <div className={styles.promptheaderleft}>
                    <fieldset className={styles.promptMode} role="radiogroup" aria-labelledby="prompt-mode-label">
                      <legend id="prompt-mode-label" className="sr-only">
                        {t(LanguageKey.promptmode)}
                      </legend>
                      <RadioButton
                        name="promptMode"
                        id={manualModeId}
                        checked={promptMode === "manual"}
                        textlabel={t(LanguageKey.prompt)}
                        handleOptionChanged={(e) => {
                          if (e.target.checked) {
                            setPromptMode("manual");
                            setAdvancePrompt(false);
                          }
                        }}
                      />

                      <div
                        style={{ transition: "var(--transition3)" }}
                        className={
                          detailedPrompt.promptStr
                            .trim()
                            .split(/\s+/)
                            .filter((word) => word.length > 0).length < 2 || detailedPrompt.promptStr.length <= 20
                            ? "fadeDiv"
                            : ""
                        }>
                        <RadioButton
                          name="promptMode"
                          id={analysisModeId}
                          checked={promptMode === "analysis"}
                          textlabel={t(LanguageKey.promptanalysis)}
                          handleOptionChanged={(e) => {
                            if (e.target.checked) {
                              setPromptMode("analysis");
                              setAdvancePrompt(true);
                              if (detailedPrompt.promptStr.length > 0) {
                                handleGetPromptAnalysis();
                              }
                            }
                          }}
                        />
                      </div>
                      <Tooltip position="bottom" onHover tooltipValue={t(LanguageKey.promptanalysisexplain)}>
                        <img
                          style={{ cursor: "pointer", width: "15px" }}
                          alt="Information"
                          src="/tooltip.svg"
                          role="img"
                          aria-label="Prompt Analysis Information"
                        />
                      </Tooltip>
                    </fieldset>
                  </div>

                  {promptMode === "manual" && (
                    <div className={styles.promptModecontent}>
                      <TextArea
                        className="captiontextarea"
                        handleInputChange={(e) => {
                          setDetailedPrompt((prev) => ({
                            ...prev,
                            promptStr: e.target.value,
                          }));
                        }}
                        value={detailedPrompt.promptStr}
                        role={""}
                        title={""}
                      />
                      <div className={styles.promptModeoptionlist} role="list">
                        {mergedAITools.map((tool, index) => (
                          <div
                            key={`tool-${index}-${tool.name}`}
                            className={styles.promptModeoption}
                            onClick={() => {
                              setSelectedAITool(tool);
                              setShowAIToolsSettings(true);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedAITool(tool);
                                setShowAIToolsSettings(true);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label={`Add ${getDisplayName(tool.name)} to prompt`}
                            style={{ cursor: "pointer" }}>
                            <img
                              style={{ cursor: "pointer", width: "20px", height: "20px" }}
                              alt="Add"
                              title={tool.description}
                              src="/icon-plus.svg"
                              aria-hidden="true"
                            />
                            {getDisplayName(tool.name)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {promptMode === "analysis" && loadingPromptAnalysis && (
                    <div className={styles.promptModecontentloading}>
                      <AIButton
                        style={{ cursor: "default" }}
                        loading
                        onClick={function (): void {
                          throw new Error("Function not implemented.");
                        }}></AIButton>
                    </div>
                  )}
                  {promptMode === "analysis" && detailedPrompt.customPromptAnalysis && !loadingPromptAnalysis && (
                    <div className={`${styles.promptModecontentAnalysis} translate`} role="region" aria-live="polite">
                      {promptMode === "analysis" && !loadingPromptAnalysis && (
                        <button
                          className={styles.reanalize}
                          onClick={handleGetPromptAnalysis}
                          onKeyDown={(e) => e.key === "Enter" && handleGetPromptAnalysis()}
                          aria-label="Reanalyze prompt"
                          type="button">
                          <svg
                            fill="var(--color-dark-blue)"
                            height="20"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            aria-hidden="true">
                            <path
                              opacity=".4"
                              d="M10 6.3q-.5 0-.7.4l-.5 1.4c-.7 2-1 2.6-1.5 3.2-.6.5-1.3.8-3.2 1.5l-1.4.5a.8.8 0 0 0 0 1.4l1.4.5c2 .7 2.6 1 3.2 1.5.5.6.8 1.3 1.5 3.2l.5 1.4a.8.8 0 0 0 1.4 0l.5-1.4c.7-2 1-2.6 1.5-3.2.6-.5 1.3-.8 3.2-1.5l1.4-.5a.8.8 0 0 0 0-1.4l-1.4-.5c-2-.7-2.6-1-3.2-1.5-.5-.6-.8-1.3-1.5-3.2l-.5-1.4z"
                            />
                            <path d="M18 2.3q-.5 0-.7.4l-.2.6c-.3.9-.4 1-.6 1.2q0 .2-1.2.6l-.6.2a.8.8 0 0 0 0 1.4l.6.2c.9.3 1 .4 1.2.6q.2 0 .6 1.2l.2.6a.8.8 0 0 0 1.4 0l.2-.6c.3-.9.4-1 .6-1.2q0-.2 1.2-.6l.6-.2a.8.8 0 0 0 0-1.4l-.6-.2c-.9-.3-1-.4-1.2-.6q-.2 0-.6-1.2l-.2-.6-.7-.5" />
                          </svg>
                          <span>{t(LanguageKey.reanalyze)}</span>
                        </button>
                      )}
                      <div className="headerandinput">
                        <div className="title2">Description:</div>
                        <div className="explain" style={{ lineHeight: "16px" }}>
                          {detailedPrompt.customPromptAnalysis.description}
                        </div>
                      </div>

                      {detailedPrompt.customPromptAnalysis.rules.length > 0 && (
                        <div className="headerandinput">
                          <div className="title2">Rules:</div>
                          {detailedPrompt.customPromptAnalysis.rules.map((item, index) => (
                            <div key={index} className="explain" style={{ lineHeight: "16px" }}>
                              <strong>{index + 1}.</strong> {item}
                            </div>
                          ))}
                        </div>
                      )}

                      {detailedPrompt.customPromptAnalysis.tasks.length > 0 && (
                        <div className="headerandinput">
                          <div className="title2">Tasks:</div>
                          {detailedPrompt.customPromptAnalysis.tasks.map((item, index) => (
                            <div key={index} className="explain" style={{ lineHeight: "16px" }}>
                              <strong>{index + 1}.</strong> {item}
                            </div>
                          ))}
                        </div>
                      )}

                      {detailedPrompt.customPromptAnalysis.detectedCredentials.length > 0 && (
                        <div className="headerandinput">
                          <div className="title2">Detected Credentials:</div>
                          {detailedPrompt.customPromptAnalysis.detectedCredentials.map((item, index) => (
                            <div key={index} className="explain" style={{ lineHeight: "16px" }}>
                              <strong>{index + 1}.</strong> {item.type}: {item.value}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="headerandinput">
                  <div className="headerparent">
                    <div className="title2">{t(LanguageKey.shouldFollower)}</div>
                    <ToggleCheckBoxButton
                      handleToggle={(e) => {
                        setDetailedPrompt((prev) => ({
                          ...prev,
                          shouldFollower: e.target.checked,
                        }));
                      }}
                      checked={detailedPrompt.shouldFollower}
                      name="vanish-mode"
                      title="Toggle vanish mode"
                      aria-label="Toggle vanish mode"
                      role="switch"
                      aria-checked={detailedPrompt.shouldFollower}
                    />
                  </div>
                  <div className="explain">{t(LanguageKey.shouldFollowerexplain)}</div>
                </div>

                <div className="headerandinput">
                  <div className="headerparent">
                    <div className="title2">{t(LanguageKey.RenewForThread)}</div>
                    <ToggleCheckBoxButton
                      handleToggle={(e) => {
                        setDetailedPrompt((prev) => ({
                          ...prev,
                          reNewForThread: e.target.checked,
                        }));
                      }}
                      checked={detailedPrompt.reNewForThread}
                      name="vanish-mode"
                      title="Toggle vanish mode"
                      aria-label="Toggle vanish mode"
                      role="switch"
                      aria-checked={detailedPrompt.reNewForThread}
                    />
                  </div>
                  <div className="explain">{t(LanguageKey.RenewForThreadexplain)}</div>
                </div>
                <button
                  type="button"
                  style={{ minHeight: "48px" }}
                  className={`saveButton ${!checkCondition ? "fadeDiv" : ""}`}
                  onClick={handleCreateAIPrompt}
                  disabled={!checkCondition}
                  aria-label="Save AI prompt"
                  aria-busy={updateLoading}>
                  {updateLoading ? <RingLoader color="white" /> : t(LanguageKey.save)}
                </button>
              </section>
            )}
            {/* ___live test section___*/}
            {(isWideScreen || activeTab === 1) && (
              <section className={styles.AIlab} aria-label="Test lab" role="region">
                {checkCondition ? (
                  <LiveChat
                    promptInfo={{
                      prompt: detailedPrompt.promptStr,
                      promptAnalysis: detailedPrompt.customPromptAnalysis,
                      reNewForThread: detailedPrompt.reNewForThread,
                      shouldFollower: detailedPrompt.shouldFollower,
                      title: detailedPrompt.title,
                    }}
                  />
                ) : (
                  <div className={styles.emptyAI}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      stroke="var(--text-h1)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      width="40px"
                      height="40px"
                      fill="none"
                      viewBox="0 0 24 25">
                      <path d="M6.4 14.6h12.2M4.5 17.2l3.6-5q.4-.6.4-1.3V7q.1-.8.8-.8h6.4q.7 0 .8.8v4q0 .7.4 1.2l3.6 5.2A3 3 0 0 1 18 22H7a3 3 0 0 1-2.5-4.7m6.2-14q0 .2-.2.2t-.2-.2.2-.2.2.2m4.2-1q0 .2-.2.2l-.2-.2.2-.2q.2 0 .2.2" />
                    </svg>
                    <div className="title" role="alert" aria-live="polite">
                      {t(LanguageKey.InternalNotify_FillRedBorderFields)}
                    </div>
                    <div className="explain" role="alert" aria-live="polite">
                      {t(LanguageKey.AIFlow_live_test_block)}
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default AIPromptBox;
