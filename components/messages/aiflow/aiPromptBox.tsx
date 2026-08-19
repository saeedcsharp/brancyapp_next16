import AIButton from "brancy/components/design/ai/AIButton";
import InputBox from "brancy/components/design/inputBox/inputBox";
import RingLoader from "brancy/components/design/loader/ringLoder";
import RadioButton from "brancy/components/design/radioButton/radioButton";
import TextArea from "brancy/components/design/textArea/textArea";
import ToggleButton from "brancy/components/design/toggleButton/ToggleButton";
import ToggleCheckBoxButton from "brancy/components/design/switchButton/switchButton";
import Tooltip from "brancy/components/design/tooltip/tooltip";
import LiveChat from "brancy/components/messages/aiflow/popup/liveChat";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import { MethodType } from "brancy/helper/api";
import { fetchAndCheckFeature } from "brancy/helper/checkFeature";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { LanguageKey } from "brancy/i18n/languageKeys";
import { PromptType, PsgFeatureType, ToolType } from "brancy/models/enums";
import { IAITools, IAnalysisPrompt, ICreatePrompt, IDetailPrompt, ITool, ITotalPrompt } from "brancy/models/interfaces";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import styles from "./aiPromptBox.module.css";
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
  onAddToolRef,
  showLiveChatPopup,
  setShowLiveChatPopup,
  promptInfo,
  setPromptInfo,
  tools,
  setTools,
  setShowNotFeature,
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
  onAddToolRef: React.MutableRefObject<((tool: ITool) => void) | null>;
  showLiveChatPopup: boolean;
  setShowLiveChatPopup: (value: boolean) => void;
  promptInfo: ICreatePrompt | null;
  setPromptInfo: React.Dispatch<React.SetStateAction<ICreatePrompt | null>>;
  tools: ITool[];
  setTools: React.Dispatch<React.SetStateAction<ITool[]>>;
  setShowNotFeature: (value: boolean) => void;
}) => {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const router = useRouter();
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();
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
  const [showAnalysisContent, setShowAnalysisContent] = useState(false);
  // tools state is managed by parent (flowAndAIInBox)

  const handleAddTool = useCallback(
    (tool: ITool) => {
      setTools((prev) => {
        const exists = prev.findIndex((t) => t.toolId === tool.toolId);
        if (exists !== -1) {
          const updated = [...prev];
          updated[exists] = tool;
          return updated;
        }
        return [...prev, tool];
      });
    },
    [setTools],
  );

  const handleAddToPrompt = useCallback((text: string) => {
    setDetailedPrompt((prev) => ({
      ...prev,
      promptStr: prev.promptStr ? prev.promptStr + " " + text : text,
    }));
  }, []);

  const getDisplayName = useCallback(
    (
      tool: Pick<IAITools, "name"> &
        Partial<
          Pick<
            IAITools,
            | "displayNameEn"
            | "displayNameFa"
            | "displayNameRu"
            | "displayNameDe"
            | "displayNameTr"
            | "displayNameAz"
            | "displayNameAr"
            | "displayNameFr"
          >
        >,
    ) => {
      if (tool.name === "SENDER_USERNAME") {
        return t(LanguageKey.senderusername);
      }

      const language = i18n.language.split("-")[0];
      const displayNameByLanguage = {
        en: tool.displayNameEn,
        fa: tool.displayNameFa,
        ru: tool.displayNameRu,
        de: tool.displayNameDe,
        gr: tool.displayNameDe,
        tr: tool.displayNameTr,
        az: tool.displayNameAz,
        ar: tool.displayNameAr,
        fr: tool.displayNameFr,
      } as const;

      return displayNameByLanguage[language as keyof typeof displayNameByLanguage] || tool.displayNameEn || tool.name;
    },
    [i18n.language, t],
  );

  useEffect(() => {
    if (onAddToPromptRef) {
      onAddToPromptRef.current = handleAddToPrompt;
    }
  }, [onAddToPromptRef, handleAddToPrompt]);

  useEffect(() => {
    if (onAddToolRef) {
      onAddToolRef.current = handleAddTool;
    }
  }, [onAddToolRef, handleAddTool]);

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setDetailedPrompt((prev) => ({ ...prev, customPromptAnalysis: null }));
        const res = await clientFetchApi<boolean, IDetailPrompt>("/api/ai/GetPrompt", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: [{ key: "promptId", value: userSelectId! }],
          onUploadProgress: undefined,
        });
        if (!signal?.aborted) {
          if (res.succeeded) {
            setDetailedPrompt(res.value);
            const hasAnalysis = res.value.customPromptAnalysis !== null;
            setAdvancePrompt(hasAnalysis);
            setPromptMode(hasAnalysis ? "analysis" : "manual");
            setShowAnalysisContent(hasAnalysis);
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
    [session, userSelectId],
  );
  const checkCondition = useMemo(() => {
    return detailedPrompt.title.length > 0 && detailedPrompt.promptStr.length > 20 && !updateLoading;
  }, [detailedPrompt.title, detailedPrompt.promptStr, updateLoading]);
  const checkPromptAnalysisCondition = useMemo(() => {
    return detailedPrompt.promptStr.length > 0 && !loadingPromptAnalysis && advancePrompt;
  }, [detailedPrompt.promptStr, loadingPromptAnalysis, advancePrompt]);
  const handleCreateAIPrompt = useCallback(async () => {
    const hasAccess = await fetchAndCheckFeature(PsgFeatureType.AI, session);
    if (!hasAccess) {
      setShowNotFeature(true);
      return;
    }
    try {
      setUpdateLoading(true);
      console.log("tools", tools);
      const res = await clientFetchApi<ICreatePrompt, ITotalPrompt>("/api/ai/CreatePrompt", {
        methodType: MethodType.post,
        session: session,
        data: {
          prompt: detailedPrompt.promptStr,
          title: detailedPrompt.title,
          reNewForThread: detailedPrompt.reNewForThread,
          shouldFollower: detailedPrompt.shouldFollower,
          promptAnalysis: advancePrompt ? detailedPrompt.customPromptAnalysis : null,
          tools: tools,
          promptImageGen: null,
          promptType: promptMode === "analysis" ? PromptType.Structured : PromptType.General,
        },
        queries: [{ key: "promptId", value: userSelectId ? userSelectId : undefined }],
        onUploadProgress: undefined,
      });
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
  }, [session, detailedPrompt, advancePrompt, userSelectId, updateAIPrompt, setShowAIToolsSettings, tools]);
  const handleGetPromptAnalysis = useCallback(async () => {
    const hasAccess = await fetchAndCheckFeature(PsgFeatureType.AI, session);
    if (!hasAccess) {
      setShowNotFeature(true);
      return;
    }
    setDetailedPrompt((prev) => ({ ...prev, customPromptAnalysis: null }));
    setLoadingPromptAnalysis(true);
    setShowAnalysisContent(false);
    startTransition(async () => {
      try {
        const res = await clientFetchApi<string, IAnalysisPrompt>("/api/ai/GetPromptAnalysis", {
          methodType: MethodType.post,
          session: session,
          data: { str: detailedPrompt.promptStr },
          queries: undefined,
          onUploadProgress: undefined,
        });
        if (res.succeeded) {
          setDetailedPrompt((prev) => ({
            ...prev,
            customPromptAnalysis: res.value,
          }));
          // show content with a tiny delay to allow CSS transitions
          setTimeout(() => setShowAnalysisContent(true), 5);
        } else {
          notify(res.info.responseType, NotifType.Warning);
          setPromptMode("manual");
          setAdvancePrompt(false);
          setShowAnalysisContent(false);
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
        setPromptMode("manual");
        setAdvancePrompt(false);
        setShowAnalysisContent(false);
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
      setShowAnalysisContent(false);
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
        completeDescriptionEn: "Use username in your prompt",
        completeDescriptionRu: "Use username in your prompt",
        completeDescriptionFa: "Use username in your prompt",
        completeDescriptionDe: "Use username in your prompt",
        completeDescriptionTr: "Use username in your prompt",
        completeDescriptionAz: "Use username in your prompt",
        completeDescriptionAr: "Use username in your prompt",
        completeDescriptionFr: "Use username in your prompt",
        displayNameEn: "",
        displayNameFa: "",
        displayNameRu: "",
        displayNameDe: "",
        displayNameTr: "",
        displayNameAz: "",
        displayNameAr: "",
        displayNameFr: "",
        tokenUsage: 0,
        parameters: [],
        toolType: ToolType.SendTelegramMessage,
      },
      ...aiTools,
    ],
    [aiTools],
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
    [checkCondition, handleCreateAIPrompt, showUserList],
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
              <Tooltip
                triggerType="tooltip"
                position="bottom"
                onHover
                tooltipValue={t(LanguageKey.AIAssismentexplain)}
              />
            </div>

            {!isWideScreen && (
              <ToggleButton
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
                  <InputBox
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
                  <div className="headerandinput">
                    <div id="prompt-mode-label" className="sr-only">
                      {t(LanguageKey.promptmode)}
                    </div>
                    <fieldset className={styles.promptMode} role="radiogroup" aria-labelledby="prompt-mode-label">
                      <RadioButton
                        name="promptMode"
                        id={manualModeId}
                        checked={promptMode === "manual"}
                        textlabel={t(LanguageKey.prompt)}
                        handleOptionChanged={(e) => {
                          if (e.target.checked) {
                            setPromptMode("manual");
                            setAdvancePrompt(false);
                            setShowAnalysisContent(false);
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
                              setShowAnalysisContent(false);
                              if (detailedPrompt.promptStr.length > 0) {
                                handleGetPromptAnalysis();
                              }
                            }
                          }}
                        />
                      </div>
                      <Tooltip
                        triggerType="tooltip"
                        position="bottom"
                        onHover
                        tooltipValue={t(LanguageKey.promptanalysisexplain)}
                      />
                    </fieldset>
                  </div>
                  <div className={styles.promptModecontent}>
                    {promptMode === "manual" && (
                      <>
                        <TextArea
                          className="TextArea"
                          handleInputChange={(e) => {
                            setDetailedPrompt((prev) => ({
                              ...prev,
                              promptStr: e.target.value,
                            }));
                          }}
                          value={detailedPrompt.promptStr}
                          role={""}
                          title={""}
                          autoExpandOnFocus
                          initialHeight={120}
                        />
                        <div className={styles.promptModeoptionlist} role="list">
                          {mergedAITools.map((tool, index) => {
                            const selectedToolIndex = tools.findIndex(
                              (selectedTool) => selectedTool.toolId === String(tool.toolType),
                            );
                            const isSelected = tool.name !== "SENDER_USERNAME" && selectedToolIndex !== -1;

                            return (
                              <div
                                key={`tool-${index}-${tool.name}`}
                                className={`${styles.promptModeoption} ${isSelected ? styles.promptModeoptionSelected : ""}`}
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
                                aria-pressed={isSelected}
                                aria-label={`${isSelected ? "Edit" : "Add"} ${getDisplayName(tool)}`}>
                                {!isSelected && (
                                  <img
                                    style={{ width: "20px", height: "20px" }}
                                    alt=""
                                    title={tool.description}
                                    src="/icon-plus.svg"
                                    aria-hidden="true"
                                  />
                                )}
                                <span>{getDisplayName(tool)}</span>
                                {isSelected && (
                                  <button
                                    type="button"
                                    className={styles.promptModeoptionRemove}
                                    aria-label={`Remove ${getDisplayName(tool)}`}
                                    onKeyDown={(event) => event.stopPropagation()}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setTools((prev) =>
                                        prev.filter((_, toolIndex) => toolIndex !== selectedToolIndex),
                                      );
                                    }}>
                                    <span aria-hidden="true">×</span>
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                    {promptMode === "analysis" && loadingPromptAnalysis && (
                      <>
                        <AIButton
                          style={{ cursor: "default" }}
                          loading
                          onClick={function (): void {
                            throw new Error("Function not implemented.");
                          }}></AIButton>
                      </>
                    )}
                    {promptMode === "analysis" &&
                      showAnalysisContent &&
                      detailedPrompt.customPromptAnalysis &&
                      !loadingPromptAnalysis && (
                        <div
                          className={`${styles.promptModecontentAnalysis} translate`}
                          role="region"
                          aria-live="polite">
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
                        </div>
                      )}
                    {promptMode === "analysis" && !loadingPromptAnalysis && showAnalysisContent && (
                      <>
                        <div className={styles.promptModeoptionlist} role="list">
                          {mergedAITools.map((tool, index) => {
                            const selectedToolIndex = tools.findIndex(
                              (selectedTool) => selectedTool.toolId === String(tool.toolType),
                            );
                            const isSelected = tool.name !== "SENDER_USERNAME" && selectedToolIndex !== -1;
                            const isDisabled = tool.name === "SENDER_USERNAME";

                            return (
                              <div
                                key={`tool-analysis-${index}-${tool.name}`}
                                className={`${styles.promptModeoption} ${isSelected ? styles.promptModeoptionSelected : ""} ${isDisabled ? styles.promptModeoptionDisabled : ""}`}
                                onClick={
                                  isDisabled
                                    ? undefined
                                    : () => {
                                        setSelectedAITool(tool);
                                        setShowAIToolsSettings(true);
                                      }
                                }
                                onKeyDown={
                                  isDisabled
                                    ? undefined
                                    : (e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                          e.preventDefault();
                                          setSelectedAITool(tool);
                                          setShowAIToolsSettings(true);
                                        }
                                      }
                                }
                                role="button"
                                tabIndex={isDisabled ? -1 : 0}
                                aria-disabled={isDisabled}
                                aria-pressed={isDisabled ? undefined : isSelected}
                                aria-label={`${isSelected ? "Edit" : "Add"} ${getDisplayName(tool)}`}>
                                {!isSelected && !isDisabled && (
                                  <img
                                    style={{ width: "20px", height: "20px" }}
                                    alt=""
                                    title={tool.description}
                                    src="/icon-plus.svg"
                                    aria-hidden="true"
                                  />
                                )}
                                <span>{getDisplayName(tool)}</span>
                                {isSelected && !isDisabled && (
                                  <button
                                    type="button"
                                    className={styles.promptModeoptionRemove}
                                    aria-label={`Remove ${getDisplayName(tool)}`}
                                    onKeyDown={(event) => event.stopPropagation()}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setTools((prev) =>
                                        prev.filter((_, toolIndex) => toolIndex !== selectedToolIndex),
                                      );
                                    }}>
                                    <span aria-hidden="true">×</span>
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
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
                  style={{ maxHeight: "42px" }}
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
                      promptImageGen: null,
                      tools: [],
                      promptType: PromptType.General,
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
