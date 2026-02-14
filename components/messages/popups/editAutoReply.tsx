import { useSession } from "next-auth/react";
import Head from "next/head";
import router from "next/router";
import React, { ChangeEvent, useCallback, useEffect, useId, useMemo, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import CheckBoxButton from "saeed/components/design/checkBoxButton";
import DragDrop from "saeed/components/design/dragDrop/dragDrop";
import InputText from "saeed/components/design/inputText";
import RingLoader from "saeed/components/design/loader/ringLoder";
import RadioButton from "saeed/components/design/radioButton";
import TextArea from "saeed/components/design/textArea/textArea";
import FlexibleToggleButton from "saeed/components/design/toggleButton/flexibleToggleButton";
import ToggleCheckBoxButton from "saeed/components/design/toggleCheckBoxButton";
import Tooltip from "saeed/components/design/tooltip/tooltip";
import Loading from "saeed/components/notOk/loading";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "saeed/components/notifications/notificationBox";

import { LanguageKey } from "saeed/i18n";
import { IDetailPrompt, IPrompts } from "saeed/models/AI/prompt";
import { GetServerResult, MethodType } from "saeed/models/IResult";
import { AutoReplyPayLoadType, MediaProductType } from "saeed/models/messages/enum";
import {
  ICreateGeneralAutoReply,
  IGeneralAutoReply,
  IMasterFlow,
  ITotalMasterFlow,
} from "saeed/models/messages/properies";

import styles from "./editAutoReply.module.css";
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
  setShowQuickReplyPopup: (show: string | null) => void;
  handleSaveAutoReply: (sendReply: ICreateGeneralAutoReply) => void;
  handleActiveAutoReply: (e: ChangeEvent<HTMLInputElement>, id: string) => void;
  autoReply: IGeneralAutoReply;
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
const mediaTypeOptions = [
  { id: MediaProductType.AllMedia, label: MediaProductType[MediaProductType.AllMedia] },
  { id: MediaProductType.All, label: MediaProductType[MediaProductType.All] },
  { id: MediaProductType.Feed, label: MediaProductType[MediaProductType.Feed] },
  { id: MediaProductType.Story, label: MediaProductType[MediaProductType.Story] },
  { id: MediaProductType.Reels, label: MediaProductType[MediaProductType.Reels] },
  { id: MediaProductType.Live, label: MediaProductType[MediaProductType.Live] },
];

const EditAutoReply: React.FC<QuickReplyPopupProps> = ({
  setShowQuickReplyPopup,
  handleSaveAutoReply,
  handleActiveAutoReply,
  autoReply,
}) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const componentId = useId();

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mediaType, setMediaType] = useState<MediaProductType>(autoReply.productType);
  const [specificKeywords, setSpecificKeywords] = useState("");
  const [autoReplyCustom, setAutoReplyCustom] = useState(autoReply.response);
  const [specificKeywordsList, setSpecificKeywordsList] = useState<{ id: string; text: string }[]>(
    autoReply.items.map((item) => {
      return { id: item.id, text: item.text };
    })
  );

  const addSpecificKeyword = useCallback(() => {
    if (specificKeywordsList.length > 10) {
      internalNotify(InternalResponseType.ExceedPermittedHashtagNumber, NotifType.Info);
      return;
    }
    const trimmed = specificKeywords.trim();
    if (!trimmed) return;
    // prevent duplicates (case-insensitive)
    const exists = specificKeywordsList.some((k) => k.text.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      internalNotify(InternalResponseType.ExceedPermittedHashtagNumber, NotifType.Info);
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      const inputElement = document.querySelector('input[name="specific-keywords"]');
      if (inputElement) {
        inputElement.classList.add("shake");
        shakeTimeoutRef.current = setTimeout(() => {
          inputElement.classList.remove("shake");
        }, 600);
      }
      return;
    }
    setSpecificKeywordsList((prev) => [
      ...prev,
      {
        id: "",
        text: trimmed,
      },
    ]);
    setSpecificKeywords("");
  }, [specificKeywords, specificKeywordsList]);
  const [replyMethod, setReplyMethod] = useState(autoReply.sendPr);
  const [shouldFollower, setShouldFollower] = useState(autoReply.shouldFollower);
  const [replySuccessfullyDirected, setReplySuccessfullyDirected] = useState(autoReply.replySuccessfullyDirected);
  const [customRepliesSuccessfullyDirected, setCustomRepliesSuccessfullyDirected] = useState(
    autoReply.customRepliesSuccessfullyDirected
  );
  const [activeAutoReply, setActiveAutoReply] = useState(autoReply.pauseTime === null || !autoReply.id);
  const [checkBox, dispatchCheckBox] = useReducer(checkBoxReducer, {
    Custom: autoReply.automaticType === AutoReplyPayLoadType.KeyWord,
    AI: autoReply.automaticType === AutoReplyPayLoadType.AI,
    Flow: autoReply.automaticType === AutoReplyPayLoadType.Flow,
    GeneralAI: autoReply.automaticType === AutoReplyPayLoadType.GeneralAI,
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
  const [autoReplytitle, setAutoReplyTitle] = useState(autoReply.title);
  const [selectedTab, setSelectedTab] = useState<number>(0);
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
    let sendAuto: ICreateGeneralAutoReply = {
      automaticType: AutoReplyPayLoadType.Flow,
      id: autoReply.id,
      keys: specificKeywordsList.map((x) => x.text),
      masterFlowId: null,
      productType: mediaType,
      promptId: null,
      response: null,
      sendPr: replyMethod,
      shouldFollower: replyMethod && shouldFollower,
      title: autoReplytitle,
      replySuccessfullyDirected: replySuccessfullyDirected,
      customRepliesSuccessfullyDirected: customRepliesSuccessfullyDirected,
    };
    if (checkBox.AI) {
      sendAuto = {
        ...sendAuto,
        automaticType: AutoReplyPayLoadType.AI,
        promptId: selectedPrompt?.promptId || autoReply.promptId || "",
      };
    } else if (checkBox.Flow) {
      sendAuto = {
        ...sendAuto,
        automaticType: AutoReplyPayLoadType.Flow,
        masterFlowId: selectedFlow?.masterFlowId || autoReply.masterFlowId || "",
      };
    } else if (checkBox.Custom) {
      sendAuto = {
        ...sendAuto,
        automaticType: AutoReplyPayLoadType.KeyWord,
        response: autoReplyCustom,
      };
    } else if (checkBox.GeneralAI) {
      sendAuto = {
        ...sendAuto,
        automaticType: AutoReplyPayLoadType.GeneralAI,
      };
    }
    handleSaveAutoReply(sendAuto);
  }, [
    handleSaveAutoReply,
    specificKeywordsList,
    autoReplyCustom,
    replyMethod,
    shouldFollower,
    autoReply.id,
    autoReply.promptId,
    autoReply.masterFlowId,
    mediaType,
    selectedFlow,
    selectedPrompt,
    checkBox,
    replySuccessfullyDirected,
    customRepliesSuccessfullyDirected,
    autoReplytitle,
  ]);
  const AITitles = useMemo(
    () => [
      <div key="NoSelect" id="NoSelect">
        <div>{t(LanguageKey.messagesetting_SelectYourPrompt)}</div>
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
        {t(LanguageKey.messagesetting_SelectYourPrompt)}
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
        {t(LanguageKey.messagesetting_SelectFlow)}
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
  const productType = useMemo(() => {
    switch (mediaType) {
      case MediaProductType.AllMedia:
        return 0;
      case MediaProductType.All:
        return 1;
      case MediaProductType.Feed:
        return 2;
      case MediaProductType.Story:
        return 3;
      case MediaProductType.Reels:
        return 4;
      case MediaProductType.Live:
        return 5;
      default:
        return 0;
    }
  }, [mediaType]);

  const mediaTypeArr = useMemo(
    () =>
      mediaTypeOptions.map((option) => (
        <div key={option.id.toString()} id={option.id.toString()}>
          {option.label}
        </div>
      )),
    []
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
          const res = await GetServerResult<boolean, IPrompts>(
            MethodType.get,
            session,
            "Instagramer/AI/GetPrompts",
            null,
            [
              { key: "query", value: searchTerm },
              { key: "nextMaxId", value: "" },
            ]
          );
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
          const res = await GetServerResult<boolean, IMasterFlow>(
            MethodType.get,
            session,
            "Instagramer/Flow/GetMasterFlows",
            null,
            [{ key: "query", value: searchTerm }]
          );
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
  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return;
    setDispatchLoading({ type: "SET_LOADING", payload: true });
    try {
      const [promptRes, flowRes] = await Promise.all([
        GetServerResult<boolean, IPrompts>(MethodType.get, session, "Instagramer/AI/GetPrompts", null, [
          { key: "query", value: "" },
          { key: "nextMaxId", value: "" },
        ]),
        GetServerResult<boolean, IMasterFlow>(MethodType.get, session, "Instagramer/Flow/GetMasterFlows", null, [
          { key: "query", value: "" },
          { key: "privateReply", value: "" },
          { key: "nextMaxId", value: "" },
        ]),
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
  }, [session]);
  const getMorePrompts = useCallback(
    async (nextMaxId: string | null) => {
      if (!nextMaxId || searchAIMode || !isMountedRef.current) return;
      setDispatchLoading({ type: "SET_LOADING_MORE_AI_ITEMS", payload: true });
      try {
        const res = await GetServerResult<boolean, IPrompts>(
          MethodType.get,
          session,
          "Instagramer/AI/GetPrompts",
          null,
          [
            { key: "query", value: "" },
            { key: "nextMaxId", value: nextMaxId },
          ]
        );
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
    [session, searchAIMode]
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
        const res = await GetServerResult<boolean, IDetailPrompt>(
          MethodType.get,
          session,
          `Instagramer/AI/GetPrompt`,
          null,
          [{ key: "promptId", value: promptId }]
        );
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
    if (!masterFlows?.nextMaxId || searchFlowMode || !isMountedRef.current) return;
    setDispatchLoading({
      type: "SET_LOADING_MORE_FLOW_ITEMS",
      payload: true,
    });
    try {
      const res = await GetServerResult<boolean, IMasterFlow>(
        MethodType.get,
        session,
        "Instagramer/Flow/GetMasterFlows",
        null,
        [
          { key: "query", value: "" },
          { key: "privateReply", value: "" },
          { key: "nextMaxId", value: masterFlows.nextMaxId },
        ]
      );
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
  }, [session, masterFlows, searchFlowMode]);
  const isFormValid = useMemo(() => {
    const isTitleValid = autoReplytitle.length > 0;
    const isCustomValid =
      checkBox.Custom && autoReplyCustom && autoReplyCustom.length > 0 && specificKeywordsList.length > 0;
    const isAIValid = checkBox.AI && selectedPrompt && specificKeywordsList.length > 0;
    const isGeneralAIValid = checkBox.GeneralAI && specificKeywordsList.length > 0;
    const isFlowValid = checkBox.Flow && selectedFlow && specificKeywordsList.length > 0;
    return (isCustomValid || isAIValid || isGeneralAIValid || isFlowValid) && isTitleValid;
  }, [checkBox, selectedPrompt, selectedFlow, specificKeywordsList, autoReplyCustom, autoReplytitle]);

  const shouldShowReplyMethod = useMemo(
    () =>
      mediaType === MediaProductType.AllMedia ||
      mediaType === MediaProductType.Feed ||
      mediaType === MediaProductType.Reels,
    [mediaType]
  );

  const hasChanges = useMemo(() => {
    // Check if any field has changed from original autoReply
    const titleChanged = autoReplytitle !== autoReply.title;
    const mediaTypeChanged = mediaType !== autoReply.productType;
    const keywordsChanged =
      JSON.stringify(specificKeywordsList.map((x) => x.text)) !== JSON.stringify(autoReply.items.map((x) => x.text));
    const customReplyChanged = autoReplyCustom !== autoReply.response;
    const replyMethodChanged = replyMethod !== autoReply.sendPr;
    const shouldFollowerChanged = shouldFollower !== autoReply.shouldFollower;
    const replySuccessfullyDirectedChanged = replySuccessfullyDirected !== autoReply.replySuccessfullyDirected;
    const customRepliesSuccessfullyDirectedChanged =
      customRepliesSuccessfullyDirected !== autoReply.customRepliesSuccessfullyDirected;

    // Check if automation type changed
    let autoTypeChanged = false;
    if (checkBox.Custom && autoReply.automaticType !== AutoReplyPayLoadType.KeyWord) autoTypeChanged = true;
    if (checkBox.AI && autoReply.automaticType !== AutoReplyPayLoadType.AI) autoTypeChanged = true;
    if (checkBox.Flow && autoReply.automaticType !== AutoReplyPayLoadType.Flow) autoTypeChanged = true;
    if (checkBox.GeneralAI && autoReply.automaticType !== AutoReplyPayLoadType.GeneralAI) autoTypeChanged = true;

    // Check if selected prompt/flow changed
    const promptChanged = checkBox.AI && selectedPrompt?.promptId !== autoReply.promptId;
    const flowChanged = checkBox.Flow && selectedFlow?.masterFlowId !== autoReply.masterFlowId;

    return (
      titleChanged ||
      mediaTypeChanged ||
      keywordsChanged ||
      customReplyChanged ||
      replyMethodChanged ||
      shouldFollowerChanged ||
      replySuccessfullyDirectedChanged ||
      customRepliesSuccessfullyDirectedChanged ||
      autoTypeChanged ||
      promptChanged ||
      flowChanged
    );
  }, [
    autoReplytitle,
    mediaType,
    specificKeywordsList,
    autoReplyCustom,
    replyMethod,
    shouldFollower,
    replySuccessfullyDirected,
    customRepliesSuccessfullyDirected,
    checkBox,
    selectedPrompt,
    selectedFlow,
    autoReply,
  ]);

  useEffect(() => {
    isMountedRef.current = true;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowQuickReplyPopup(null);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      isMountedRef.current = false;
      document.removeEventListener("keydown", handleEscape);

      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [setShowQuickReplyPopup]);

  useEffect(() => {
    setActiveAutoReply(autoReply.pauseTime === null || !autoReply.id);
  }, [autoReply.pauseTime, autoReply.id]);

  useEffect(() => {
    if (!session) return;
    void fetchData();
  }, [session, fetchData]);
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>
          Bran.cy ▸ {t(LanguageKey.automaticreply)} | {t(LanguageKey.AI)} و {t(LanguageKey.Flow)}
        </title>
        <meta
          name="description"
          content="تنظیمات پیشرفته پاسخ‌گویی خودکار به کامنت‌ها و دایرکت‌های اینستاگرام با هوش مصنوعی، فلوهای هوشمند و پاسخ‌های سفارشی. مدیریت کامل پیام‌های دریافتی با Brancy"
        />
        <meta
          name="keywords"
          content="instagram auto reply, پاسخگوی خودکار اینستاگرام, AI chatbot instagram, comment automation, DM automation, برنسی, هوش مصنوعی اینستاگرام, فلو مکالمه, کامنت خودکار, پاسخ هوشمند"
        />
        <meta name="robots" content="noindex, nofollow" />
        <meta property="og:title" content={`Brancy - ${t(LanguageKey.automaticreply)}`} />
        <meta
          property="og:description"
          content="تنظیمات پیشرفته پاسخ‌گویی خودکار اینستاگرام با هوش مصنوعی و فلوهای هوشمند"
        />
        <meta property="og:type" content="application" />
        <meta property="og:site_name" content="Brancy" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Brancy - ${t(LanguageKey.automaticreply)}`} />
        <meta name="twitter:description" content="تنظیمات پیشرفته پاسخ‌گویی خودکار اینستاگرام" />
        <meta name="application-name" content="Brancy Instagram Management" />
        <meta name="theme-color" content="#7C3AED" />
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
          {autoReply.id !== null && autoReply.id !== "" && (
            <ToggleCheckBoxButton
              handleToggle={(e) => {
                setActiveAutoReply(e.target.checked);
                handleActiveAutoReply(e, autoReply.id);
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
                {/* title Section */}
                <div className="headerandinput">
                  <div className="headertext">{t(LanguageKey.SettingGeneral_Title)}</div>
                  <InputText
                    dangerOnEmpty
                    placeHolder={t(LanguageKey.pageToolspopup_typehere)}
                    className="textinputbox"
                    handleInputChange={(e) => {
                      setAutoReplyTitle(e.target.value);
                    }}
                    value={autoReplytitle}
                    aria-label={t(LanguageKey.SettingGeneral_Title)}
                    aria-required="true"
                  />
                </div>

                {/* Media Type Section */}
                <div className="headerandinput" role="group">
                  <div className="headertext">{t(LanguageKey.autoReplyFor)}</div>
                  <DragDrop
                    data={mediaTypeArr}
                    handleOptionSelect={(id) => {
                      setMediaType(parseInt(id));
                    }}
                    item={productType}
                  />
                </div>

                {/* Keywords Section */}
                <div className="headerandinput" role="group">
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
                      ({specificKeywordsList.length}/10)
                    </div>
                  </div>
                  <div className="headerparent">
                    <InputText
                      fadeTextArea={false}
                      name="specific-keywords"
                      className={"textinputbox"}
                      placeHolder={t(LanguageKey.specifickeywords)}
                      handleInputChange={(e) => {
                        setSpecificKeywords(e.target.value);
                      }}
                      onKeyDown={(e) => {
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
                      const canAdd = specificKeywords.trim() !== "" && specificKeywordsList.length < 10;
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
                    {specificKeywordsList.map((word, index) => (
                      <div key={word.id || `keyword-${index}`} className={styles.specificword} role="listitem">
                        <span>{word.text}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSpecificKeywordsList((prev) => prev.filter((_, i) => i !== index));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Delete" || e.key === "Backspace") {
                              setSpecificKeywordsList((prev) => prev.filter((_, i) => i !== index));
                            }
                          }}
                          aria-label={`Remove keyword: ${word.text}`}
                          className="keyword-remove-btn"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
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
              </>
            )}

            {selectedTab === 1 && (
              <>
                {/* AI Section */}
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
                        {autoReply.prompt && (
                          <>
                            <div className="headertext">{t(LanguageKey.SettingGeneral_Title)}</div>
                            <InputText
                              className={"textinputbox"}
                              handleInputChange={() => {}}
                              value={autoReply.prompt.title}
                            />
                          </>
                        )}

                        {(searchAIMode ? searchPrompts?.items?.length ?? 0 : prompts?.items?.length ?? 0) > 0 ? (
                          <DragDrop
                            externalSearchMod={true}
                            data={searchAIMode ? AISearchTitles : AITitles}
                            handleOptionSelect={(id) => {
                              getPromptById(id);
                            }}
                            handleGetMoreItems={() => getMorePrompts(prompts!.nextMaxId)}
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
                                  opacity=".4"
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

                      {/* Reply Method for AI */}
                      {shouldShowReplyMethod && (
                        <div className="headerandinput">
                          <CheckBoxButton
                            handleToggle={(e) => setReplySuccessfullyDirected(e.target.checked)}
                            value={replySuccessfullyDirected}
                            title={t(LanguageKey.sendreplydirectedsuccessfully)}
                            textlabel={t(LanguageKey.sendreplydirectedsuccessfully)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Flow Section */}
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
                        {autoReply.masterFlow && (
                          <>
                            <div className="headertext">{t(LanguageKey.SettingGeneral_Title)}</div>
                            <InputText
                              className={"textinputbox"}
                              handleInputChange={() => {}}
                              value={autoReply.masterFlow.title}
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
                            handleGetMoreItems={() => handleGetMoreFlows()}
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
                                  opacity=".4"
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
                                opacity=".4"
                                fillRule="evenodd"
                                d="M18.2 4.5A1.5 1.5 0 0 1 16.5 6l-6.2.3q-2 .3-2.9 1.2t-1.3 3.3A61 61 0 0 0 6 18l.2 7.2q.4 2.4 1.3 3.3t3.3 1.3q2.5.2 7.2.2l7.2-.2q2.4-.4 3.3-1.3t1.2-3 .3-6.1a1.5 1.5 0 1 1 3 0l-.3 6.7a8 8 0 0 1-2.1 4.5 8 8 0 0 1-5 2.1q-3 .4-7.5.3H18q-4.6 0-7.5-.3t-5-2.1a8 8 0 0 1-2.1-5q-.4-3-.3-7.5v-.2l.3-7.5q.2-3 2.1-5a8 8 0 0 1 4.6-2q2.6-.5 6.7-.4a1.5 1.5 0 0 1 1.5 1.5"
                              />
                              <path d="M25 3a28 28 0 0 1 5.5.2q1 .2 1.6.8t.7 1.5c.3 1.6.2 4.3.1 5.6a2 2 0 0 1-3.3 1.2l-1.9-1.8-4.1 4a1.5 1.5 0 1 1-2.1-2.1l4-4-1.8-2a2 2 0 0 1 1.2-3.3" />
                            </svg>
                            {t(LanguageKey.messagesetting_ViewFlow)}
                          </button>
                        </div>
                      )}

                      {/* Reply Method for Flow */}
                      {shouldShowReplyMethod && (
                        <div className="headerandinput">
                          <CheckBoxButton
                            handleToggle={(e) => setReplySuccessfullyDirected(e.target.checked)}
                            value={replySuccessfullyDirected}
                            title={t(LanguageKey.sendreplydirectedsuccessfully)}
                            textlabel={t(LanguageKey.sendreplydirectedsuccessfully)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Custom Reply Section */}
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
                            ({autoReplyCustom?.length || 0}/800 )
                            <img
                              style={{
                                cursor: "pointer",
                                width: "16px",
                                height: "16px",
                              }}
                              title="ℹ️ paste"
                              src="/copy.svg"
                              onClick={async () => {
                                try {
                                  if (!navigator?.clipboard?.readText) return;
                                  const text = await navigator.clipboard.readText();
                                  if (text == null) return;
                                  const max = 800;
                                  setAutoReplyCustom(text.length > max ? text.slice(0, max) : text);
                                } catch {
                                  // silent fail per request
                                }
                              }}
                            />
                          </div>
                        </div>
                        <TextArea
                          className={"captiontextarea"}
                          placeHolder={t(LanguageKey.pageToolspopup_typehere)}
                          fadeTextArea={false}
                          handleInputChange={(e) => {
                            setAutoReplyCustom(e.target.value);
                          }}
                          value={autoReplyCustom ?? ""}
                          maxLength={800}
                          name="auto-reply-message"
                          role="textbox"
                          aria-label="Auto-reply message content"
                          title={""}
                          style={{ height: "120px" }}
                        />
                      </div>
                      {/* Reply Method for Custom */}
                      {shouldShowReplyMethod && (
                        <>
                          <div className="headerandinput">
                            <div className="headertext">{t(LanguageKey.replyMethod)}</div>
                            <RadioButton
                              name="reply-method"
                              id={t(LanguageKey.respondInSameComment)}
                              checked={!replyMethod}
                              handleOptionChanged={() => {
                                setReplyMethod(false);
                              }}
                              textlabel={t(LanguageKey.respondInSameComment)}
                              aria-checked={!replyMethod}
                              title={"Respond in the same comment"}
                            />
                            <RadioButton
                              name="reply-method"
                              id={t(LanguageKey.respondDirectly)}
                              checked={replyMethod}
                              handleOptionChanged={(e) => {
                                setReplyMethod(true);
                              }}
                              textlabel={t(LanguageKey.respondDirectly)}
                              aria-checked={replyMethod}
                              title={"Respond directly"}
                            />
                          </div>
                          {replyMethod && (
                            <div className={styles.replyMethodOptions}>
                              <CheckBoxButton
                                handleToggle={(e) => setReplySuccessfullyDirected(e.target.checked)}
                                value={replySuccessfullyDirected}
                                title={t(LanguageKey.sendreplydirectedsuccessfully)}
                                textlabel={t(LanguageKey.sendreplydirectedsuccessfully)}
                              />
                              <CheckBoxButton
                                handleToggle={(e) => setShouldFollower(e.target.checked)}
                                value={shouldFollower}
                                title={t(LanguageKey.shouldFollower)}
                                textlabel={t(LanguageKey.shouldFollower)}
                              />
                            </div>
                          )}
                        </>
                      )}{" "}
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
          onClick={() => setShowQuickReplyPopup(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowQuickReplyPopup(null);
            }
          }}
          aria-label="Cancel and close">
          {t(LanguageKey.cancel)}
        </button>
      </div>
    </>
  );
};

export default EditAutoReply;
