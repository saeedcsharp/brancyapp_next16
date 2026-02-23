import { useSession } from "next-auth/react";
import Head from "next/head";
import router from "next/router";
import React, { ChangeEvent, useCallback, useEffect, useId, useMemo, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import CheckBoxButton from "../../design/checkBoxButton";
import DragDrop from "../../design/dragDrop/dragDrop";
import InputText from "../../design/inputText";
import RingLoader from "../../design/loader/ringLoder";
import RadioButton from "../../design/radioButton";
import TextArea from "../../design/textArea/textArea";
import FlexibleToggleButton from "../../design/toggleButton/flexibleToggleButton";
import ToggleCheckBoxButton from "../../design/toggleCheckBoxButton";
import Tooltip from "../../design/tooltip/tooltip";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "../../notifications/notificationBox";
import Loading from "../../notOk/loading";
import { LanguageKey } from "../../../i18n";
import { IDetailPrompt, IPrompts, ITotalPrompt } from "../../../models/AI/prompt";
import { MethodType } from "../../../helper/api";
import { AutoReplyPayLoadType, MediaProductType } from "../../../models/messages/enum";
import { IMasterFlow, ITotalMasterFlow } from "../../../models/messages/properies";
import { IAutomaticReply, IMediaUpdateAutoReply } from "../../../models/page/post/posts";
import styles from "./editAutoReply.module.css";
import { clientFetchApi } from "../../../helper/clientFetchApi";
type CheckBoxState = {
  Custom: boolean;
  Flow: boolean;
  AI: boolean;
  GeneralAI: boolean;
};
type CheckBoxAction = { type: "SET_CUSTOM" } | { type: "SET_FLOW" } | { type: "SET_AI" } | { type: "SET_GENERAL_AI" };
type LoadingState = {
  isLoading: boolean;
  isLoadingMoreAIItems: boolean;
  isLoadingMoreFlowItems: boolean;
  isExternalSearchAILoading: boolean;
  isExternalSearchFlowLoading: boolean;
  isLoadingPrompt: boolean;
};
type LoadingAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_LOADING_MORE_AI_ITEMS"; payload: boolean }
  | { type: "SET_LOADING_MORE_FLOW_ITEMS"; payload: boolean }
  | { type: "SET_LOADING_PROMPT"; payload: boolean }
  | { type: "SET_EXTERNAL_SEARCH_FLOW_LOADING"; payload: boolean }
  | { type: "SET_EXTERNAL_SEARCH_AI_LOADING"; payload: boolean };
interface QuickReplyPopupProps {
  setShowQuickReplyPopup: (show: boolean) => void;
  handleSaveAutoReply: (sendReply: IMediaUpdateAutoReply) => void;
  handleActiveAutoReply: (e: ChangeEvent<HTMLInputElement>) => void;
  autoReply: IAutomaticReply;
  productType: MediaProductType;
  showActiveAutoreply: boolean;
}
const checkBoxReducer = (state: CheckBoxState, action: CheckBoxAction): CheckBoxState => {
  switch (action.type) {
    case "SET_CUSTOM":
      return {
        Custom: true,
        AI: false,
        Flow: false,
        GeneralAI: false,
      };
    case "SET_AI":
      return {
        Custom: false,
        AI: true,
        Flow: false,
        GeneralAI: false,
      };
    case "SET_FLOW":
      return {
        Custom: false,
        AI: false,
        Flow: true,
        GeneralAI: false,
      };
    case "SET_GENERAL_AI":
      return {
        Custom: false,
        AI: false,
        Flow: false,
        GeneralAI: true,
      };
    default:
      return state;
  }
};
const loadingReducer = (state: LoadingState, action: LoadingAction) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_LOADING_PROMPT":
      return { ...state, isLoadingPrompt: action.payload };
    case "SET_LOADING_MORE_AI_ITEMS":
      return { ...state, isLoadingMoreAIItems: action.payload };
    case "SET_LOADING_MORE_FLOW_ITEMS":
      return { ...state, isLoadingMoreFlowItems: action.payload };
    case "SET_EXTERNAL_SEARCH_AI_LOADING":
      return { ...state, isExternalSearchAILoading: action.payload };
    case "SET_EXTERNAL_SEARCH_FLOW_LOADING":
      return { ...state, isExternalSearchFlowLoading: action.payload };
    default:
      return state;
  }
};
const EditAutoReplyForMedia: React.FC<QuickReplyPopupProps> = ({
  setShowQuickReplyPopup,
  handleSaveAutoReply,
  handleActiveAutoReply,
  autoReply,
  productType,
  showActiveAutoreply,
}) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const componentId = useId();

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [shakeSpecificKeywordInput, setShakeSpecificKeywordInput] = useState(false);

  const [specificKeywords, setSpecificKeywords] = useState("");
  // const [autoReplyCustom, setAutoReplyCustom] = useState(autoReply.response);
  const [replyMethod, setReplyMethod] = useState<IAutomaticReply | null>({
    automaticType: 0,
    items: [],
    masterFlow: null,
    masterFlowId: null,
    mediaId: "",
    pauseTime: Date.now(),
    productType: 0,
    prompt: null,
    promptId: null,
    response: "",
    sendCount: 0,
    sendPr: false,
    shouldFollower: false,
    replySuccessfullyDirected: true,
  });
  // const [activeAutoReply, setActiveAutoReply] = useState(
  //   autoReply && autoReply.pauseTime === null
  // );
  const [checkBox, dispatchCheckBox] = useReducer(checkBoxReducer, {
    Custom: autoReply && autoReply.automaticType === AutoReplyPayLoadType.KeyWord,
    AI: autoReply && autoReply.automaticType === AutoReplyPayLoadType.AI,
    Flow: autoReply && autoReply.automaticType === AutoReplyPayLoadType.Flow,
    GeneralAI: autoReply && autoReply.automaticType === AutoReplyPayLoadType.GeneralAI,
  });
  const [loadingState, setDispatchLoading] = useReducer(loadingReducer, {
    isLoading: false,
    isLoadingMoreAIItems: false,
    isLoadingMoreFlowItems: false,
    isExternalSearchAILoading: false,
    isExternalSearchFlowLoading: false,
    isLoadingPrompt: false,
  });
  const [prompts, setPrompts] = useState<IPrompts | null>(null);
  const [searchPrompts, setSearchPrompts] = useState<IPrompts | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<IDetailPrompt | null>(null);
  const [masterFlows, setMasterFlows] = useState<IMasterFlow | null>(null);
  const [masterSearchFlows, setMasterSearchFlows] = useState<IMasterFlow | null>(null);
  const [selectedFlow, setSelectedFlow] = useState<ITotalMasterFlow | null>(null);
  const [searchFlowMode, setSearchFlowMode] = useState(false);
  const [searchAIMode, setSearchAIMode] = useState(false);
  const [autoReplyAll, setAutoReplyAll] = useState(autoReply.items.length === 0);
  const [activeAutoReply, setActiveAutoReply] = useState(false);
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const triggerSpecificKeywordShake = useCallback(() => {
    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    setShakeSpecificKeywordInput(false);
    window.requestAnimationFrame(() => {
      setShakeSpecificKeywordInput(true);
    });
    shakeTimeoutRef.current = setTimeout(() => {
      setShakeSpecificKeywordInput(false);
    }, 600);
  }, []);

  const addSpecificKeyword = useCallback(() => {
    if (!replyMethod) return;
    if (replyMethod.items.length > 10) {
      internalNotify(InternalResponseType.ExceedPermittedHashtagNumber, NotifType.Info);
      return;
    }
    const trimmed = specificKeywords.trim();
    if (!trimmed) return;
    const exists = replyMethod.items.some((k) => k.text.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      triggerSpecificKeywordShake();
      return;
    }
    setReplyMethod((prev) => ({
      ...prev!,
      items: [
        ...prev!.items,
        {
          sendCount: 0,
          text: trimmed,
          id: "",
        },
      ],
    }));
    setSpecificKeywords("");
    setShakeSpecificKeywordInput(false);
  }, [replyMethod, specificKeywords, triggerSpecificKeywordShake]);

  type AutoReplyMode = keyof CheckBoxState;
  const renderReplyMethodSection = useCallback(
    (mode: AutoReplyMode) => {
      const titleId = `reply-method-title-${mode}`;
      const radioName = `reply-method-${mode}`;

      if (productType === MediaProductType.Feed || productType === MediaProductType.Reels) {
        return (
          <div
            className={`headerandinput ${!activeAutoReply ? "fadeDiv" : ""}`}
            role="radiogroup"
            aria-labelledby={titleId}>
            <div className="headertext" id={titleId} role="heading" aria-level={2}>
              {t(LanguageKey.replyMethod)}
            </div>

            {replyMethod !== null && (mode === "GeneralAI" || mode === "Custom") && (
              <>
                <RadioButton
                  name={radioName}
                  id={`${mode}-respondInSameComment`}
                  checked={replyMethod !== null && !replyMethod.sendPr}
                  handleOptionChanged={() =>
                    setReplyMethod((prev) => ({
                      ...prev!,
                      sendPr: false,
                    }))
                  }
                  textlabel={t(LanguageKey.respondInSameComment)}
                  aria-checked={replyMethod !== null && !replyMethod.sendPr}
                  title={"Respond in the same comment"}
                />

                <RadioButton
                  name={radioName}
                  id={`${mode}-respondDirectly`}
                  checked={replyMethod !== null && replyMethod.sendPr}
                  handleOptionChanged={() => setReplyMethod((prev) => ({ ...prev!, sendPr: true }))}
                  textlabel={t(LanguageKey.respondDirectly)}
                  aria-checked={replyMethod !== null && replyMethod.sendPr}
                  title={"Respond directly"}
                />
              </>
            )}
            <div className={styles.replyMethodOptions}>
              {replyMethod && !((mode === "Custom" || mode === "GeneralAI") && !replyMethod.sendPr) && (
                <CheckBoxButton
                  handleToggle={(e) =>
                    setReplyMethod((prev) => ({
                      ...prev!,
                      replySuccessfullyDirected: e.target.checked,
                    }))
                  }
                  value={replyMethod.replySuccessfullyDirected}
                  title={t(LanguageKey.sendreplydirectedsuccessfully)}
                  textlabel={t(LanguageKey.sendreplydirectedsuccessfully)}
                />
              )}

              {replyMethod && (mode === "Custom" || mode === "GeneralAI") && replyMethod.sendPr && (
                <CheckBoxButton
                  handleToggle={(e) =>
                    setReplyMethod((prev) => ({
                      ...prev!,
                      shouldFollower: e.target.checked,
                    }))
                  }
                  value={replyMethod.shouldFollower}
                  title={t(LanguageKey.shouldFollower)}
                  textlabel={t(LanguageKey.shouldFollower)}
                />
              )}
            </div>
          </div>
        );
      }

      if (productType === MediaProductType.Live) {
        return (
          <div className={`headerandinput ${!activeAutoReply ? "fadeDiv" : ""}`} role="group" aria-labelledby={titleId}>
            <div className="title" id={titleId} role="heading" aria-level={2}>
              {t(LanguageKey.replyMethod)}
            </div>
            <CheckBoxButton
              handleToggle={(e) =>
                setReplyMethod((prev) => ({
                  ...prev!,
                  sendPr: e.target.checked,
                }))
              }
              value={replyMethod !== null && replyMethod.sendPr}
              title={t(LanguageKey.shouldFollower)}
              textlabel={t(LanguageKey.shouldFollower)}
            />
          </div>
        );
      }

      return null;
    },
    [activeAutoReply, productType, replyMethod, t]
  );
  const handleOptionChanged = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    switch (e.target.name) {
      case "custom":
        dispatchCheckBox({ type: "SET_CUSTOM" });
        break;
      case "AI":
        dispatchCheckBox({ type: "SET_AI" });
        break;
      case "Flow":
        dispatchCheckBox({ type: "SET_FLOW" });
        break;
      case "GeneralAI":
        dispatchCheckBox({ type: "SET_GENERAL_AI" });
        break;
    }
  }, []);
  const handleUpdateAutoReply = useCallback(() => {
    let sendAuto: IMediaUpdateAutoReply = {
      automaticType: AutoReplyPayLoadType.Flow,
      keys: autoReplyAll || !replyMethod ? [] : replyMethod.items.map((x) => x.text),
      masterFlowId: null,
      promptId: null,
      response: null,
      sendPr: replyMethod !== null && replyMethod.sendPr,
      replySuccessfullyDirected: replyMethod?.replySuccessfullyDirected ?? false,
      shouldFollower: replyMethod !== null && replyMethod.shouldFollower,
    };
    if (checkBox.AI) {
      sendAuto = {
        ...sendAuto,
        automaticType: AutoReplyPayLoadType.AI,
        promptId: selectedPrompt?.promptId || replyMethod?.promptId || "",
      };
    } else if (checkBox.Flow) {
      sendAuto = {
        ...sendAuto,
        automaticType: AutoReplyPayLoadType.Flow,
        masterFlowId: selectedFlow?.masterFlowId || replyMethod?.masterFlowId || "",
      };
    } else if (checkBox.Custom) {
      sendAuto = {
        ...sendAuto,
        automaticType: AutoReplyPayLoadType.KeyWord,
        response: replyMethod && replyMethod.response,
      };
    } else if (checkBox.GeneralAI) {
      sendAuto = {
        ...sendAuto,
        automaticType: AutoReplyPayLoadType.GeneralAI,
      };
    }
    console.log("sendAuto", sendAuto);
    handleSaveAutoReply(sendAuto);
  }, [handleSaveAutoReply, replyMethod, selectedFlow, selectedPrompt, checkBox]);
  const AITitles = useMemo(
    () => [
      <div key="NoSelect" id="NoSelect">
        {t(LanguageKey.Pleaseselect)}
      </div>,
      ...(prompts?.items || []).map((prompt) => (
        <div key={prompt.promptId.toString()} id={prompt.promptId.toString()}>
          {prompt.title}
        </div>
      )),
    ],
    [prompts, t]
  );
  const AISearchTitles = useMemo(
    () => [
      <div key="NoSelect" id="NoSelect">
        {t(LanguageKey.Pleaseselect)}
      </div>,
      ...(searchPrompts?.items || []).map((prompt) => (
        <div key={prompt.promptId.toString()} id={prompt.promptId.toString()}>
          {prompt.title}
        </div>
      )),
    ],
    [searchPrompts, t]
  );
  const flowTitles = useMemo(
    () => [
      <div key="NoSelect" id="NoSelect">
        {t(LanguageKey.Pleaseselect)}
      </div>,
      ...(masterFlows?.items || []).map((flow) => (
        <div key={flow.masterFlowId.toString()} id={flow.masterFlowId.toString()}>
          {flow.title}
        </div>
      )),
    ],
    [masterFlows, t]
  );
  const flowSearchTitles = useMemo(
    () => [
      <div key="NoSelect" id="NoSelect">
        {t(LanguageKey.Pleaseselect)}
      </div>,
      ...(masterSearchFlows?.items || []).map((flow) => (
        <div key={flow.masterFlowId.toString()} id={flow.masterFlowId.toString()}>
          {flow.title}
        </div>
      )),
    ],
    [masterSearchFlows, t]
  );
  const handleExternalAISearch = useCallback(
    async (searchTerm: string) => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      setSearchAIMode(searchTerm.length > 0);
      if (!searchTerm.trim()) {
        setSearchPrompts(null);
        return;
      }

      searchDebounceRef.current = setTimeout(async () => {
        if (!isMountedRef.current) return;
        setDispatchLoading({
          type: "SET_EXTERNAL_SEARCH_AI_LOADING",
          payload: true,
        });
        try {
          const res = await clientFetchApi<boolean, IPrompts>("/api/ai/GetPrompts", { methodType: MethodType.get, session: session, data: null, queries: [
              { key: "query", value: searchTerm },
              { key: "nextMaxId", value: "" },
            ], onUploadProgress: undefined });
          if (!isMountedRef.current) return;
          if (res.succeeded) {
            setSearchPrompts(res.value);
          } else {
            notify(res.info.responseType, NotifType.Warning);
          }
        } catch (error) {
          if (isMountedRef.current) {
            notify(ResponseType.Unexpected, NotifType.Error);
          }
        } finally {
          if (isMountedRef.current) {
            setDispatchLoading({
              type: "SET_EXTERNAL_SEARCH_AI_LOADING",
              payload: false,
            });
          }
        }
      }, 500);
    },
    [session]
  );

  const handleExternalFlowSearch = useCallback(
    async (searchTerm: string) => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      setSearchFlowMode(searchTerm.length > 0);
      if (!searchTerm.trim()) {
        setMasterSearchFlows(null);
        return;
      }

      searchDebounceRef.current = setTimeout(async () => {
        if (!isMountedRef.current) return;
        setDispatchLoading({
          type: "SET_EXTERNAL_SEARCH_FLOW_LOADING",
          payload: true,
        });
        try {
          const res = await clientFetchApi<boolean, IMasterFlow>("/api/flow/GetMasterFlows", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "query", value: searchTerm }], onUploadProgress: undefined });
          if (!isMountedRef.current) return;
          if (res.succeeded) {
            setMasterSearchFlows(res.value);
          } else {
            notify(res.info.responseType, NotifType.Warning);
          }
        } catch (error) {
          if (isMountedRef.current) {
            notify(ResponseType.Unexpected, NotifType.Error);
          }
        } finally {
          if (isMountedRef.current) {
            setDispatchLoading({
              type: "SET_EXTERNAL_SEARCH_FLOW_LOADING",
              payload: false,
            });
          }
        }
      }, 500);
    },
    [session]
  );

  const getMasterFlow = useCallback(
    async (masterFlowId: string) => {
      try {
        const res = await clientFetchApi<boolean, ITotalMasterFlow>("/api/flow/GetShortMasterFlow", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "id", value: masterFlowId }], onUploadProgress: undefined });
        if (res.succeeded) return res.value;
        notify(res.info.responseType, NotifType.Warning);
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
      return null;
    },
    [session]
  );

  const getPrompt = useCallback(
    async (promptId: string) => {
      try {
        const res = await clientFetchApi<boolean, ITotalPrompt>("/api/ai/GetPrompt", { methodType: MethodType.get, session: session, data: null, queries: [{ key: "promptId", value: promptId }], onUploadProgress: undefined });
        if (res.succeeded) return res.value;
        notify(res.info.responseType, NotifType.Warning);
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
      return null;
    },
    [session]
  );

  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return;
    setDispatchLoading({ type: "SET_LOADING", payload: true });

    try {
      // prepare initial reply method (enrich prompt/masterFlow if needed)
      const baseReplyMethod: IAutomaticReply = autoReply ?? {
        automaticType: 0,
        items: [],
        masterFlow: null,
        masterFlowId: null,
        mediaId: "",
        pauseTime: Date.now(),
        productType: 0,
        prompt: null,
        promptId: null,
        response: "",
        sendCount: 0,
        sendPr: false,
        shouldFollower: false,
        replySuccessfullyDirected: true,
      };

      let enriched: IAutomaticReply = { ...baseReplyMethod };
      if (enriched.masterFlowId && !enriched.masterFlow) {
        const flow = await getMasterFlow(enriched.masterFlowId);
        enriched = { ...enriched, masterFlow: flow };
      }
      if (enriched.promptId && !enriched.prompt) {
        const prompt = await getPrompt(enriched.promptId);
        enriched = { ...enriched, prompt };
      }
      if (isMountedRef.current) {
        setReplyMethod(enriched);
      }

      const [promptRes, flowRes] = await Promise.all([
        clientFetchApi<boolean, IPrompts>("/api/ai/GetPrompts", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "query", value: "" },
          { key: "nextMaxId", value: "" },
        ], onUploadProgress: undefined }),
        clientFetchApi<boolean, IMasterFlow>("/api/flow/GetMasterFlows", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "query", value: "" },
          { key: "privateReply", value: "true" },
          { key: "nextMaxId", value: "" },
        ], onUploadProgress: undefined }),
      ]);

      if (!isMountedRef.current) return;
      if (promptRes.succeeded) setPrompts(promptRes.value);
      else notify(promptRes.info.responseType, NotifType.Warning);
      if (flowRes.succeeded) setMasterFlows(flowRes.value);
      else notify(flowRes.info.responseType, NotifType.Warning);
    } catch (error) {
      if (isMountedRef.current) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    } finally {
      if (isMountedRef.current) {
        setDispatchLoading({ type: "SET_LOADING", payload: false });
      }
    }
  }, [autoReply, getMasterFlow, getPrompt, session]);

  const getMorePrompts = useCallback(
    async (nextMaxId: string | null) => {
      if (!nextMaxId || searchAIMode || !isMountedRef.current) return;
      setDispatchLoading({ type: "SET_LOADING_MORE_AI_ITEMS", payload: true });
      try {
        const res = await clientFetchApi<boolean, IPrompts>("/api/ai/GetPrompts", { methodType: MethodType.get, session: session, data: null, queries: [
            { key: "query", value: "" },
            { key: "nextMaxId", value: nextMaxId },
          ], onUploadProgress: undefined });
        if (!isMountedRef.current) return;
        if (res.succeeded)
          setPrompts((prev) => ({
            ...prev,
            nextMaxId: res.value.nextMaxId,
            items: [...prev!.items, ...res.value.items],
          }));
        else notify(res.info.responseType, NotifType.Warning);
      } catch (error) {
        if (isMountedRef.current) {
          notify(ResponseType.Unexpected, NotifType.Error);
        }
      } finally {
        if (isMountedRef.current) {
          setDispatchLoading({
            type: "SET_LOADING_MORE_AI_ITEMS",
            payload: false,
          });
        }
      }
    },
    [searchAIMode, session]
  );

  const getPromptById = useCallback(
    async (promptId: string) => {
      if (promptId === "NoSelect") {
        setSelectedPrompt(null);
        return;
      }
      if (!isMountedRef.current) return;
      setDispatchLoading({ type: "SET_LOADING_PROMPT", payload: true });
      try {
        const res = await clientFetchApi<boolean, IDetailPrompt>(`/api/ai/GetPrompt`, { methodType: MethodType.get, session: session, data: null, queries: [{ key: "promptId", value: promptId }], onUploadProgress: undefined });
        if (!isMountedRef.current) return;
        if (res.succeeded) setSelectedPrompt(res.value);
        else {
          notify(res.info.responseType, NotifType.Warning);
        }
      } catch (error) {
        if (isMountedRef.current) {
          notify(ResponseType.Unexpected, NotifType.Error);
        }
      } finally {
        if (isMountedRef.current) {
          setDispatchLoading({ type: "SET_LOADING_PROMPT", payload: false });
        }
      }
    },
    [session]
  );

  const handleGetMoreFlows = useCallback(async () => {
    try {
      if (!masterFlows?.nextMaxId || searchFlowMode || !isMountedRef.current) return;
      setDispatchLoading({
        type: "SET_LOADING_MORE_FLOW_ITEMS",
        payload: true,
      });
      const res = await clientFetchApi<boolean, IMasterFlow>("/api/flow/GetMasterFlows", { methodType: MethodType.get, session: session, data: null, queries: [
          { key: "query", value: "" },
          { key: "privateReply", value: "true" },
          { key: "nextMaxId", value: masterFlows.nextMaxId },
        ], onUploadProgress: undefined });
      if (!isMountedRef.current || !res.value) return;
      if (res.succeeded) {
        setMasterFlows((prev) => ({
          ...prev,
          nextMaxId: res.value.nextMaxId,
          items: [...prev!.items, ...res.value.items],
        }));
      } else notify(res.info.responseType, NotifType.Warning);
    } catch (error) {
      if (isMountedRef.current) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    } finally {
      if (isMountedRef.current) {
        setDispatchLoading({
          type: "SET_LOADING_MORE_FLOW_ITEMS",
          payload: false,
        });
      }
    }
  }, [masterFlows, searchFlowMode, session]);

  const isFormValid = useMemo(() => {
    const keywordValid = autoReplyAll || (replyMethod?.items?.length ?? 0) > 0;
    const isCustomValid = checkBox.Custom && (replyMethod?.response?.length ?? 0) > 0 && keywordValid;
    const isAIValid = checkBox.AI && !!(selectedPrompt?.promptId || replyMethod?.promptId) && keywordValid;
    const isGeneralAIValid = checkBox.GeneralAI && keywordValid;
    const isFlowValid = checkBox.Flow && !!(selectedFlow?.masterFlowId || replyMethod?.masterFlowId) && keywordValid;
    return activeAutoReply && (isCustomValid || isAIValid || isGeneralAIValid || isFlowValid);
  }, [activeAutoReply, autoReplyAll, checkBox, replyMethod, selectedFlow, selectedPrompt]);

  const hasChanges = useMemo(() => {
    const originalAll = (autoReply?.items?.length ?? 0) === 0;
    const allChanged = autoReplyAll !== originalAll;
    const keywordsChanged =
      JSON.stringify((replyMethod?.items ?? []).map((x) => x.text)) !==
      JSON.stringify((autoReply?.items ?? []).map((x) => x.text));
    const responseChanged = (replyMethod?.response ?? "") !== (autoReply?.response ?? "");
    const sendPrChanged = (replyMethod?.sendPr ?? false) !== (autoReply?.sendPr ?? false);
    const shouldFollowerChanged = (replyMethod?.shouldFollower ?? false) !== (autoReply?.shouldFollower ?? false);
    const replySuccessfullyDirectedChanged =
      (replyMethod?.replySuccessfullyDirected ?? false) !== (autoReply?.replySuccessfullyDirected ?? false);

    let autoTypeChanged = false;
    if (checkBox.Custom && autoReply?.automaticType !== AutoReplyPayLoadType.KeyWord) autoTypeChanged = true;
    if (checkBox.AI && autoReply?.automaticType !== AutoReplyPayLoadType.AI) autoTypeChanged = true;
    if (checkBox.Flow && autoReply?.automaticType !== AutoReplyPayLoadType.Flow) autoTypeChanged = true;
    if (checkBox.GeneralAI && autoReply?.automaticType !== AutoReplyPayLoadType.GeneralAI) autoTypeChanged = true;

    const promptChanged =
      checkBox.AI && (selectedPrompt?.promptId ?? replyMethod?.promptId) !== (autoReply?.promptId ?? null);
    const flowChanged =
      checkBox.Flow && (selectedFlow?.masterFlowId ?? replyMethod?.masterFlowId) !== (autoReply?.masterFlowId ?? null);

    return (
      allChanged ||
      keywordsChanged ||
      responseChanged ||
      sendPrChanged ||
      shouldFollowerChanged ||
      replySuccessfullyDirectedChanged ||
      autoTypeChanged ||
      promptChanged ||
      flowChanged
    );
  }, [autoReply, autoReplyAll, checkBox, replyMethod, selectedFlow, selectedPrompt]);

  useEffect(() => {
    isMountedRef.current = true;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowQuickReplyPopup(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      isMountedRef.current = false;
      document.removeEventListener("keydown", handleEscape);
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [setShowQuickReplyPopup]);

  useEffect(() => {
    setActiveAutoReply((autoReply && autoReply.pauseTime === null) || !showActiveAutoreply);
  }, [autoReply, showActiveAutoreply]);

  useEffect(() => {
    if (!session) return;
    void fetchData();
  }, [session, fetchData]);
  const pasteFromClipboard = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      alert("Clipboard not supported in this environment");
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      setReplyMethod((prev) => ({
        ...prev!,
        response: (prev?.response ?? "") + text,
      }));
    } catch (err) {
      console.error("Clipboard read failed", err);
      alert("Failed to read clipboard");
    }
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Bran.cy ▸ {t(LanguageKey.automaticreply)}</title>
        <meta
          name="description"
          content="Professional Instagram post creator and scheduler with advanced media management tools"
        />
        <meta
          name="keywords"
          content="instagram post creator, post scheduler, social media management, Brancy, hashtag manager, instagram tools"
        />
        <meta property="og:title" content="Bran.cy - Quick Reply" />
        <meta property="og:description" content="Professional Instagram post creator and scheduler" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.brancy.app/page/posts" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Bran.cy Quick Reply" />
        <meta name="twitter:description" content="Create and schedule Instagram posts professionally" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.brancy.app/page/posts" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="headerandinput" role="dialog" aria-modal="true" aria-labelledby="quick-reply-title">
        <div className="headerparent">
          <div className="title" id="quick-reply-title" role="heading" aria-level={1}>
            {t(LanguageKey.messagesetting_automaticreplysystem)}
            <Tooltip
              tooltipValue={t(LanguageKey.messagesetting_automaticreplysystemexplain)}
              position="bottom"
              onClick={true}>
              <img
                style={{
                  marginInline: "5px",
                  cursor: "pointer",
                  width: "15px",
                  height: "15px",
                }}
                alt="ℹ️ tooltip"
                src="/tooltip.svg"
              />
            </Tooltip>
          </div>
          {showActiveAutoreply && (
            <ToggleCheckBoxButton
              handleToggle={(e) => {
                handleActiveAutoReply(e);
              }}
              checked={activeAutoReply}
              name="toggleAutoReply"
              title="toggleAutoReply"
              role="switch"
            />
          )}
        </div>
      </div>

      {loadingState.isLoading && <Loading />}
      {!loadingState.isLoading && (
        <div className={activeAutoReply ? styles.content : `${styles.content} fadeDiv`}>
          <FlexibleToggleButton
            options={[
              { id: 0, label: t(LanguageKey.sidebar_Setting) },
              { id: 1, label: t(LanguageKey.replyMethod) },
            ]}
            selectedValue={selectedTab}
            onChange={(value) => setSelectedTab(value)}
          />

          <>
            {selectedTab === 0 && (
              <>
                {/* Keywords Mode */}
                <div className={`${styles.content} ${activeAutoReply ? "" : "fadeDiv"}`}>
                  <RadioButton
                    name="reply-type"
                    id={t(LanguageKey.respondToAllComments)}
                    checked={autoReplyAll}
                    handleOptionChanged={() => {
                      setAutoReplyAll(true);
                    }}
                    textlabel={t(LanguageKey.respondToAllComments)}
                    aria-checked={autoReplyAll}
                  />

                  <div className="headerandinput" role="group" aria-labelledby="specific-keywords-title">
                    <RadioButton
                      name="reply-type"
                      id={t(LanguageKey.sensitiveToSpecificKeywords)}
                      checked={!autoReplyAll}
                      handleOptionChanged={() => {
                        setAutoReplyAll(false);
                      }}
                      textlabel={t(LanguageKey.sensitiveToSpecificKeywords)}
                      aria-checked={!autoReplyAll}
                    />
                    {(() => {
                      const keywordsDisabled = autoReplyAll;
                      return (
                        <div className={`headerandinput ${keywordsDisabled ? "fadeDiv" : ""}`.trim()} role="group">
                          <div className="headerparent">
                            <div className="headertext">
                              {t(LanguageKey.messagesetting_KeywordsSensitive)}
                              <Tooltip
                                tooltipValue={t(LanguageKey.sensitiveToSpecificKeywordsExplain)}
                                position="bottom"
                                onClick={true}>
                                <img
                                  style={{
                                    marginInline: "5px",
                                    cursor: "pointer",
                                    width: "15px",
                                    height: "15px",
                                  }}
                                  alt="ℹ️ tooltip"
                                  src="/tooltip.svg"
                                />
                              </Tooltip>
                            </div>
                            <div className="counter" aria-live="polite">
                              ({replyMethod?.items.length ?? 0}/10)
                            </div>
                          </div>

                          <div className="headerparent">
                            <InputText
                              fadeTextArea={keywordsDisabled}
                              disabled={keywordsDisabled}
                              name={`specific-keywords-${componentId}`}
                              className={"textinputbox"}
                              placeHolder={t(LanguageKey.specifickeywords)}
                              shake={shakeSpecificKeywordInput && !keywordsDisabled}
                              handleInputChange={(e) => {
                                if (keywordsDisabled) return;
                                setSpecificKeywords(e.target.value);
                              }}
                              onKeyDown={(e) => {
                                if (keywordsDisabled) return;
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addSpecificKeyword();
                                }
                              }}
                              value={specificKeywords}
                              aria-label="Specific keywords for auto-reply"
                              aria-required="true"
                            />

                            {(() => {
                              const canAddRaw =
                                specificKeywords.trim() !== "" &&
                                (replyMethod?.items.length ?? 0) < 10 &&
                                !!replyMethod;
                              const canAdd = canAddRaw && !keywordsDisabled;
                              return (
                                <button
                                  disabled={!canAdd}
                                  className={canAdd ? "saveButton" : "disableButton"}
                                  style={{
                                    height: "42px",
                                    width: "max-content",
                                    paddingInline: "10px",
                                  }}
                                  onClick={() => {
                                    if (!canAdd) return;
                                    addSpecificKeyword();
                                  }}
                                  aria-label="Add specific keyword"
                                  aria-disabled={!canAdd}>
                                  {t(LanguageKey.add)}
                                </button>
                              );
                            })()}
                          </div>

                          <div className={styles.wordpool} role="list" aria-label="Selected keywords">
                            {(replyMethod?.items ?? []).map((word, index) => (
                              <div key={word.id || `keyword-${index}`} className={styles.specificword} role="listitem">
                                <span>{word.text}</span>
                                <button
                                  type="button"
                                  disabled={keywordsDisabled}
                                  onClick={() => {
                                    if (keywordsDisabled) return;
                                    setReplyMethod((prev) => ({
                                      ...prev!,
                                      items: prev!.items.filter((_, i) => i !== index),
                                    }));
                                  }}
                                  onKeyDown={(e) => {
                                    if (keywordsDisabled) return;
                                    if (e.key === "Delete" || e.key === "Backspace") {
                                      setReplyMethod((prev) => ({
                                        ...prev!,
                                        items: prev!.items.filter((_, i) => i !== index),
                                      }));
                                    }
                                  }}
                                  aria-label={`Remove keyword: ${word.text}`}
                                  aria-disabled={keywordsDisabled}
                                  className="keyword-remove-btn"
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: keywordsDisabled ? "not-allowed" : "pointer",
                                    padding: "2px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                  }}>
                                  <img
                                    style={{
                                      width: "15px",
                                      height: "15px",
                                      pointerEvents: "none",
                                    }}
                                    alt="Remove"
                                    src="/deleteHashtag.svg"
                                  />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </>
            )}

            {selectedTab === 1 && (
              <>
                {/* AI */}
                <div className="headerandinput">
                  <div className="headerandinput">
                    <RadioButton
                      name="AI"
                      id={"AI"}
                      checked={checkBox.AI}
                      handleOptionChanged={handleOptionChanged}
                      textlabel={t(LanguageKey.AI)}
                      title={t(LanguageKey.AI)}
                    />
                    <div className="explain">{t(LanguageKey.messagesetting_UseAIPromptsExplain)}</div>
                  </div>
                  {checkBox.AI && (
                    <div className={styles.optioncontainer}>
                      <div className="headerandinput">
                        {replyMethod?.prompt && (
                          <>
                            <div className="headertext">{t(LanguageKey.SettingGeneral_Title)}</div>
                            <InputText
                              className={"textinputbox"}
                              handleInputChange={() => {}}
                              value={replyMethod.prompt.title}
                            />
                          </>
                        )}

                        {(searchAIMode ? searchPrompts?.items?.length ?? 0 : prompts?.items?.length ?? 0) > 0 ? (
                          <DragDrop
                            externalSearchMod={true}
                            data={searchAIMode ? AISearchTitles : AITitles}
                            handleOptionSelect={(id) => {
                              void getPromptById(id);
                            }}
                            handleGetMoreItems={async () => {
                              await getMorePrompts(prompts!.nextMaxId);
                            }}
                            isLoadingMoreItems={loadingState.isLoadingMoreAIItems}
                            onExternalSearch={handleExternalAISearch}
                            externalSearchLoading={loadingState.isExternalSearchAILoading}
                            externalSearchText={searchAIMode ? selectedPrompt?.title : ""}
                          />
                        ) : null}

                        {(searchAIMode ? searchPrompts?.items?.length ?? 0 : prompts?.items?.length ?? 0) === 0 ? (
                          <div className="headerandinput">
                            <div className="explain">{t(LanguageKey.messagesetting_NoPromptsFound)}</div>
                            <button
                              onClick={() => {
                                try {
                                  void router.push({ pathname: "/message/AIAndFlow" });
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              className="saveButton">
                              <svg
                                width="16"
                                height="16"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="#fff"
                                viewBox="0 0 36 36">
                                <path
                                  opacity={0.4}
                                  fillRule="evenodd"
                                  d="M18.2 4.5A1.5 1.5 0 0 1 16.5 6l-6.2.3q-2 .3-2.9 1.2t-1.3 3.3A61 61 0 0 0 6 18l.2 7.2q.4 2.4 1.3 3.3t3.3 1.3q2.5.2 7.2.2l7.2-.2q2.4-.4 3.3-1.3t1.2-3 .3-6.1a1.5 1.5 0 1 1 3 0l-.3 6.7a8 8 0 0 1-2.1 4.5 8 8 0 0 1-5 2.1q-3 .4-7.5.3H18q-4.6 0-7.5-.3t-5-2.1a8 8 0 0 1-2.1-5q-.4-3-.3-7.5v-.2l.3-7.5q.2-3 2.1-5a8 8 0 0 1 4.6-2q2.6-.5 6.7-.4a1.5 1.5 0 0 1 1.5 1.5"
                                />
                                <path d="M25 3a28 28 0 0 1 5.5.2q1 .2 1.6.8t.7 1.5c.3 1.6.2 4.3.1 5.6a2 2 0 0 1-3.3 1.2l-1.9-1.8-4.1 4a1.5 1.5 0 1 1-2.1-2.1l4-4-1.8-2a2 2 0 0 1 1.2-3.3" />
                              </svg>
                              {t(LanguageKey.CreateAutomationAI)}
                            </button>
                          </div>
                        ) : null}
                      </div>

                      {loadingState.isLoadingPrompt && <RingLoader style={{ maxHeight: "14px" }} />}
                      {!loadingState.isLoadingPrompt && selectedPrompt && (
                        <div className="explain">{selectedPrompt.promptStr || ""}</div>
                      )}

                      {renderReplyMethodSection("AI")}
                    </div>
                  )}
                </div>
                {/* Flow */}
                <div className="headerandinput">
                  <div className="headerandinput">
                    <RadioButton
                      name="Flow"
                      id={"Flow"}
                      checked={checkBox.Flow}
                      handleOptionChanged={handleOptionChanged}
                      textlabel={t(LanguageKey.Flow)}
                      title={t(LanguageKey.Flow)}
                    />
                    <div className="explain">{t(LanguageKey.messagesetting_SelectPredefinedFlowExplain)}</div>
                  </div>
                  {checkBox.Flow && (
                    <div className={styles.optioncontainer}>
                      <div className="headerandinput">
                        {replyMethod?.masterFlow && (
                          <>
                            <div className="headertext">{t(LanguageKey.SettingGeneral_Title)}</div>
                            <InputText
                              className={"textinputbox"}
                              handleInputChange={() => {}}
                              value={replyMethod.masterFlow.title}
                            />
                          </>
                        )}

                        {(searchFlowMode ? masterSearchFlows?.items?.length ?? 0 : masterFlows?.items?.length ?? 0) >
                        0 ? (
                          <DragDrop
                            externalSearchMod={true}
                            data={searchFlowMode ? flowSearchTitles : flowTitles}
                            handleOptionSelect={(id) => {
                              if (!masterFlows) return;
                              setSelectedFlow(masterFlows.items.find((flow) => flow.masterFlowId === id) || null);
                            }}
                            handleGetMoreItems={async () => {
                              await handleGetMoreFlows();
                            }}
                            isLoadingMoreItems={loadingState.isLoadingMoreFlowItems}
                            onExternalSearch={handleExternalFlowSearch}
                            externalSearchLoading={loadingState.isExternalSearchFlowLoading}
                            externalSearchText={searchFlowMode ? selectedFlow?.title : ""}
                          />
                        ) : null}

                        {(searchFlowMode ? masterSearchFlows?.items?.length ?? 0 : masterFlows?.items?.length ?? 0) ===
                        0 ? (
                          <div className="headerandinput">
                            <div className="explain">{t(LanguageKey.messagesetting_NoFlowsFound)}</div>
                            <button
                              onClick={() => {
                                try {
                                  void router.push({ pathname: "/message/AIAndFlow" });
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              className="saveButton">
                              <svg
                                width="16"
                                height="16"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="#fff"
                                viewBox="0 0 36 36">
                                <path
                                  opacity={0.4}
                                  fillRule="evenodd"
                                  d="M18.2 4.5A1.5 1.5 0 0 1 16.5 6l-6.2.3q-2 .3-2.9 1.2t-1.3 3.3A61 61 0 0 0 6 18l.2 7.2q.4 2.4 1.3 3.3t3.3 1.3q2.5.2 7.2.2l7.2-.2q2.4-.4 3.3-1.3t1.2-3 .3-6.1a1.5 1.5 0 1 1 3 0l-.3 6.7a8 8 0 0 1-2.1 4.5 8 8 0 0 1-5 2.1q-3 .4-7.5.3H18q-4.6 0-7.5-.3t-5-2.1a8 8 0 0 1-2.1-5q-.4-3-.3-7.5v-.2l.3-7.5q.2-3 2.1-5a8 8 0 0 1 4.6-2q2.6-.5 6.7-.4a1.5 1.5 0 0 1 1.5 1.5"
                                />
                                <path d="M25 3a28 28 0 0 1 5.5.2q1 .2 1.6.8t.7 1.5c.3 1.6.2 4.3.1 5.6a2 2 0 0 1-3.3 1.2l-1.9-1.8-4.1 4a1.5 1.5 0 1 1-2.1-2.1l4-4-1.8-2a2 2 0 0 1 1.2-3.3" />
                              </svg>
                              {t(LanguageKey.CreateAutomationFlow)}
                            </button>
                          </div>
                        ) : null}
                      </div>

                      {selectedFlow && (
                        <div className="headerandinput">
                          <button className="saveButton">
                            {" "}
                            <svg
                              width="16"
                              height="16"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="#fff"
                              viewBox="0 0 36 36">
                              <path
                                opacity={0.4}
                                fillRule="evenodd"
                                d="M18.2 4.5A1.5 1.5 0 0 1 16.5 6l-6.2.3q-2 .3-2.9 1.2t-1.3 3.3A61 61 0 0 0 6 18l.2 7.2q.4 2.4 1.3 3.3t3.3 1.3q2.5.2 7.2.2l7.2-.2q2.4-.4 3.3-1.3t1.2-3 .3-6.1a1.5 1.5 0 1 1 3 0l-.3 6.7a8 8 0 0 1-2.1 4.5 8 8 0 0 1-5 2.1q-3 .4-7.5.3H18q-4.6 0-7.5-.3t-5-2.1a8 8 0 0 1-2.1-5q-.4-3-.3-7.5v-.2l.3-7.5q.2-3 2.1-5a8 8 0 0 1 4.6-2q2.6-.5 6.7-.4a1.5 1.5 0 0 1 1.5 1.5"
                              />
                              <path d="M25 3a28 28 0 0 1 5.5.2q1 .2 1.6.8t.7 1.5c.3 1.6.2 4.3.1 5.6a2 2 0 0 1-3.3 1.2l-1.9-1.8-4.1 4a1.5 1.5 0 1 1-2.1-2.1l4-4-1.8-2a2 2 0 0 1 1.2-3.3" />
                            </svg>
                            {t(LanguageKey.messagesetting_ViewFlow)}
                          </button>
                        </div>
                      )}

                      {renderReplyMethodSection("Flow")}
                    </div>
                  )}
                </div>
                {/* General AI */}
                {/* <div className="headerandinput">
                  <div className="headerandinput">
                    <RadioButton
                      name="GeneralAI"
                      id={"GeneralAI"}
                      checked={checkBox.GeneralAI}
                      handleOptionChanged={handleOptionChanged}
                      textlabel={"GeneralAI"}
                      title={"GeneralAI"}
                    />
                  </div>
                  {checkBox.GeneralAI && (
                    <div className={styles.optioncontainer}>{renderReplyMethodSection("GeneralAI")}</div>
                  )}
                </div> */}

                {/* Custom */}
                <div className="headerandinput">
                  <div className="headerandinput">
                    <RadioButton
                      name="custom"
                      id={t(LanguageKey.product_Definenew)}
                      checked={checkBox.Custom}
                      handleOptionChanged={handleOptionChanged}
                      textlabel={t(LanguageKey.AIFlow_quick_reply)}
                    />
                    <div className="explain">{t(LanguageKey.messagesetting_DefineCustomResponseExplain)}</div>
                  </div>
                  {checkBox.Custom && (
                    <div className={styles.optioncontainer}>
                      <div className="headerandinput">
                        <div className="headerparent">
                          <div className="headertext">{t(LanguageKey.Answer)}</div>
                          <div className="counter">
                            ({replyMethod?.response?.length ?? 0}/800)
                            <img
                              style={{
                                cursor: "pointer",
                                width: "16px",
                                height: "16px",
                              }}
                              title="ℹ️ paste"
                              src="/copy.svg"
                              role="button"
                              aria-label="Paste from clipboard"
                              onClick={() => {
                                void pasteFromClipboard();
                              }}
                            />
                          </div>
                        </div>
                        <TextArea
                          className={"captiontextarea"}
                          placeHolder={t(LanguageKey.pageToolspopup_typehere)}
                          fadeTextArea={false}
                          handleInputChange={(e) => {
                            setReplyMethod((prev) => ({
                              ...prev!,
                              response: e.target.value,
                            }));
                          }}
                          value={(replyMethod && replyMethod.response) ?? ""}
                          maxLength={800}
                          name="auto-reply-message"
                          role="textbox"
                          aria-label="Auto-reply message content"
                          title={""}
                          style={{ height: "120px" }}
                        />
                      </div>
                      {renderReplyMethodSection("Custom")}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        </div>
      )}

      <div className="ButtonContainer" role="group" aria-label="Form actions">
        <button
          type="submit"
          disabled={activeAutoReply ? !isFormValid : !hasChanges}
          className={
            activeAutoReply
              ? isFormValid
                ? "saveButton"
                : "disableButton"
              : hasChanges
              ? "saveButton"
              : "disableButton"
          }
          onClick={() => {
            handleUpdateAutoReply();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (activeAutoReply ? isFormValid : hasChanges)) {
              e.preventDefault();
              handleUpdateAutoReply();
            }
          }}
          aria-label="Save auto-reply settings"
          aria-disabled={activeAutoReply ? !isFormValid : !hasChanges}>
          {t(LanguageKey.save)}
        </button>
        <button
          type="button"
          className="cancelButton"
          onClick={() => setShowQuickReplyPopup(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowQuickReplyPopup(false);
            }
          }}
          aria-label="Cancel and close">
          {t(LanguageKey.cancel)}
        </button>
      </div>
    </>
  );
};

export default EditAutoReplyForMedia;
