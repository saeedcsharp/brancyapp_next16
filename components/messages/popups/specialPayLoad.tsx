import { useSession } from "next-auth/react";
import Head from "next/head";
import router from "next/router";
import React, { ChangeEvent, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import DragDrop from "saeed/components/design/dragDrop/dragDrop";
import InputText from "saeed/components/design/inputText";
import RingLoader from "saeed/components/design/loader/ringLoder";
import RadioButton from "saeed/components/design/radioButton";
import TextArea from "saeed/components/design/textArea/textArea";
import Loading from "saeed/components/notOk/loading";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import { LanguageKey } from "saeed/i18n";
import { IDetailPrompt, IPrompts } from "saeed/models/AI/prompt";
import { GetServerResult, MethodType } from "saeed/helper/apihelper";
import { PayloadType, SpecialPayLoad } from "saeed/models/messages/enum";
import {
  IMasterFlow,
  IProfileButtons,
  ISpecialPayload,
  ITotalMasterFlow,
  IUpdateProfileButton,
} from "saeed/models/messages/properies";
import styles from "./specialPayLoad.module.css";
// Reducer for checkbox state
type CheckBoxState = {
  custom: boolean;
  default: boolean;
  AI: boolean;
  Flow: boolean;
  GeneralAI: boolean;
};
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
type CheckBoxAction =
  | { type: "SET_CUSTOM" }
  | { type: "SET_DEFAULT" }
  | { type: "SET_AI" }
  | { type: "SET_FLOW" }
  | { type: "SET_GENERAL_AI" };
const checkBoxReducer = (state: CheckBoxState, action: CheckBoxAction): CheckBoxState => {
  switch (action.type) {
    case "SET_CUSTOM":
      return {
        custom: true,
        default: false,
        AI: false,
        Flow: false,
        GeneralAI: false,
      };
    case "SET_DEFAULT":
      return {
        custom: false,
        default: true,
        AI: false,
        Flow: false,
        GeneralAI: false,
      };
    case "SET_AI":
      return {
        custom: false,
        default: false,
        AI: true,
        Flow: false,
        GeneralAI: false,
      };
    case "SET_FLOW":
      return {
        custom: false,
        default: false,
        AI: false,
        Flow: true,
        GeneralAI: false,
      };
    case "SET_GENERAL_AI":
      return {
        custom: false,
        default: false,
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
const SpecialPayLoadComp = React.memo(
  ({
    specialPayloads,
    removeMask,
    handleSaveSpecialPayLoad,
  }: {
    specialPayloads: ISpecialPayload[];
    removeMask: () => void;
    handleSaveSpecialPayLoad: (addNewObj: IUpdateProfileButton) => void;
  }) => {
    const { t } = useTranslation();
    const { data: session } = useSession();
    const isMountedRef = useRef(true);
    const abortControllerRef = useRef<AbortController | null>(null);
    const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
    const [checkBox, dispatchCheckBox] = useReducer(checkBoxReducer, {
      custom: false,
      default: true,
      AI: false,
      Flow: false,
      GeneralAI: false,
    });
    const [profileButton, setProfileButton] = useState<IProfileButtons>({
      additionalPayload: null,
      specialPayload: null,
      generalAIId: null,
      masterFlow: null,
      masterFlowId: null,
      payloadType: PayloadType.Special,
      prompt: null,
      promptId: null,
      response: null,
      title: null,
    });
    const [masterFlows, setMasterFlows] = useState<IMasterFlow | null>(null);
    const [masterSearchFlows, setMasterSearchFlows] = useState<IMasterFlow | null>(null);
    const [prompts, setPrompts] = useState<IPrompts | null>(null);
    const [searchPrompts, setSearchPrompts] = useState<IPrompts | null>(null);
    const [selectedPrompt, setSelectedPrompt] = useState<IDetailPrompt | null>(null);
    const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
    const [selectedFlow, setSelectedFlow] = useState<ITotalMasterFlow | null>(null);
    const [loadingState, setDispatchLoading] = useReducer(loadingReducer, {
      isLoading: false,
      isLoadingMoreAIItems: false,
      isLoadingMoreFlowItems: false,
      isExternalSearchAILoading: false,
      isExternalSearchFlowLoading: false,
      isLoadingPrompt: false,
    });
    const [searchFlowMode, setSearchFlowMode] = useState(false);
    const [searchAIMode, setSearchAIMode] = useState(false);
    const [title, setTitle] = useState("");
    const handleOptionChanged = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      switch (e.target.name) {
        case "custom":
          dispatchCheckBox({ type: "SET_CUSTOM" });
          break;
        case "default":
          dispatchCheckBox({ type: "SET_DEFAULT" });
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
    const specialPayloadTextMap = useMemo(
      () => ({
        [SpecialPayLoad.CreateTicket]: {
          title: t(LanguageKey.messagesetting_Createanewsupportticket),
          explain: t(LanguageKey.messagesetting_CreateanewsupportticketExplain),
        },
        [SpecialPayLoad.ChangeLanguage]: {
          title: t(LanguageKey.messagesetting_Changeapplicationlanguage),
          explain: t(LanguageKey.messagesetting_ChangeapplicationlanguageExplain),
        },
        [SpecialPayLoad.ViewShop]: {
          title: t(LanguageKey.messagesetting_ViewStoreandproducts),
          explain: t(LanguageKey.messagesetting_ViewStoreandproductsExplain),
        },
        [SpecialPayLoad.ViewWebsite]: {
          title: t(LanguageKey.messagesetting_Visityourwebsite),
          explain: t(LanguageKey.messagesetting_VisityourwebsiteExplain),
        },
        [SpecialPayLoad.ViewRole]: {
          title: t(LanguageKey.messagesetting_Viewuserrolesandpermissions),
          explain: t(LanguageKey.messagesetting_ViewuserrolesandpermissionsExplain),
        },
        [SpecialPayLoad.ViewBusinessTime]: {
          title: t(LanguageKey.messagesetting_Viewbusinesshourschart),
          explain: t(LanguageKey.messagesetting_ViewbusinesshourschartExplain),
        },
        [SpecialPayLoad.ViewPrice]: {
          title: t(LanguageKey.messagesetting_Viewpricinginformation),
          explain: t(LanguageKey.messagesetting_ViewpricinginformationExplain),
        },
        [SpecialPayLoad.SearchProduct]: {
          title: t(LanguageKey.messagesetting_Searchforproducts),
          explain: t(LanguageKey.messagesetting_SearchforproductsExplain),
        },
      }),
      [t]
    );
    const getDefaultSpecialPayload = useCallback(
      () => [
        <div key="NoSelect" id="NoSelect">
          {t(LanguageKey.Pleaseselect)}
        </div>,
        ...specialPayloads.map((payload) => (
          <div key={payload.specialPayload.toString()} id={payload.specialPayload.toString()}>
            {specialPayloadTextMap[payload.specialPayload as SpecialPayLoad].title}
          </div>
        )),
      ],
      [specialPayloads, t, specialPayloadTextMap]
    );
    const getAITitles = useCallback(
      () => [
        <div key="NoSelect" id="NoSelect">
          {t(LanguageKey.messagesetting_SelectYourPrompt)}
        </div>,
        ...(prompts?.items || []).map((prompt) => (
          <div key={prompt.promptId.toString()} id={prompt.promptId.toString()}>
            {prompt.title}
          </div>
        )),
      ],
      [prompts, t]
    );
    const getAISearchTitles = useCallback(
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
    const getFlowTitles = useCallback(
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
    const getFlowSearchTitles = useCallback(
      () => [
        <div key="NoSelect" id="NoSelect">
          {t(LanguageKey.messagesetting_SelectFlow)}
        </div>,
        ...(masterSearchFlows?.items || []).map((flow) => (
          <div key={flow.masterFlowId.toString()} id={flow.masterFlowId.toString()}>
            {flow.title}
          </div>
        )),
      ],
      [masterSearchFlows, t]
    );
    const checkCondition = useCallback(() => {
      const isCustomValid =
        checkBox.custom &&
        profileButton &&
        profileButton.response &&
        title.trim().length > 0 &&
        profileButton.response.trim().length > 0;
      const isDefaultValid =
        checkBox.default && typeof profileButton.specialPayload === "number" && !isNaN(profileButton.specialPayload);
      const isAIValid = checkBox.AI && selectedPrompt && title.trim().length > 0;
      const isGeneralAIValid = checkBox.GeneralAI && title.trim().length > 0;
      const isFlowValid = checkBox.Flow && selectedFlow && title.trim().length > 0;
      return isCustomValid || isDefaultValid || isAIValid || isGeneralAIValid || isFlowValid;
    }, [checkBox, profileButton, selectedPrompt, selectedFlow, title]);
    const handleSaveNewVariation = useCallback(() => {
      const newProfile: IUpdateProfileButton = {
        additionalPayload: null,
        specialPayload: null,
        masterFlowId: null,
        payloadType: PayloadType.Special,
        prompt: null,
        promptId: null,
        response: null,
        title: null,
      };
      if (checkBox.AI && selectedPrompt) {
        newProfile.title = title;
        newProfile.promptId = selectedPrompt.promptId;
        newProfile.payloadType = PayloadType.AI;
      } else if (checkBox.Flow && selectedFlow) {
        newProfile.masterFlowId = selectedFlow.masterFlowId;
        newProfile.title = title;
        newProfile.payloadType = PayloadType.Flow;
      } else if (checkBox.GeneralAI) {
        newProfile.title = title;
        newProfile.payloadType = PayloadType.GeneralAI;
      } else if (checkBox.custom && profileButton) {
        newProfile.title = title;
        newProfile.response = profileButton.response;
        newProfile.payloadType = PayloadType.Custom;
      } else if (checkBox.default && profileButton) {
        newProfile.specialPayload = profileButton.specialPayload;
        newProfile.payloadType = PayloadType.Special;
      }
      handleSaveSpecialPayLoad(newProfile);
    }, [checkBox, profileButton, selectedFlow, selectedPrompt, title, handleSaveSpecialPayLoad]);
    const handlePasteFromClipboard = useCallback(async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          setProfileButton((prev) => ({
            ...prev,
            question: prev.title || "",
            response: (prev.response || "") + text,
          }));
        }
      } catch (error) {
        console.error("Failed to read clipboard contents: ", error);
      }
    }, []);
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
          if (res.succeeded) {
            setPrompts((prev) => ({
              ...prev,
              nextMaxId: res.value.nextMaxId,
              items: [...prev!.items, ...res.value.items],
            }));
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
          setSelectedPromptId(null);
          return;
        }
        if (!isMountedRef.current) return;
        setDispatchLoading({ type: "SET_LOADING_PROMPT", payload: true });
        try {
          const res = await GetServerResult<boolean, IDetailPrompt>(
            MethodType.get,
            session,
            "Instagramer/AI/GetPrompt",
            null,
            [{ key: "promptId", value: promptId }]
          );
          if (!isMountedRef.current) return;
          if (res.succeeded) {
            setSelectedPrompt(res.value);
            setSelectedPromptId(promptId);
          } else {
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
    useEffect(() => {
      if (checkBox.AI) {
        setSelectedPrompt(null);
        setSelectedPromptId(null);
      }
    }, [checkBox.AI]);
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          removeMask();
        } else if (e.key === "Enter" && e.ctrlKey) {
          e.preventDefault();
          if (checkCondition()) {
            handleSaveNewVariation();
          }
        }
      },
      [removeMask, checkCondition, handleSaveNewVariation]
    );
    useEffect(() => {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [handleKeyDown]);
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
            type: "SET_LOADING_MORE_FLOW_ITEMS",
            payload: false,
          });
        }
      }
    }, [session, masterFlows, searchFlowMode]);
    useEffect(() => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
        if (searchDebounceRef.current) {
          clearTimeout(searchDebounceRef.current);
        }
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }, []);
    useEffect(() => {
      if (!session) return;
      void fetchData();
    }, [session, fetchData]);

    return (
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
          <title>Bran.cy ▸ {t(LanguageKey.messagesetting_addNewButton)}</title>
          <meta
            name="description"
            content="افزودن دکمه‌های هوشمند به پروفایل اینستاگرام برای پاسخگویی خودکار، فلوهای مکالمه، و استفاده از هوش مصنوعی در پیام‌رسانی"
          />
          <meta
            name="keywords"
            content="instagram, message automation, AI chatbot, flow automation, custom buttons, instagram DM, profile buttons, برنسی, اتوماسیون پیام, دکمه پروفایل"
          />
          <meta name="robots" content="noindex, nofollow" />
          <meta property="og:title" content={`Bran.cy - ${t(LanguageKey.messagesetting_addNewButton)}`} />
          <meta property="og:description" content="افزودن دکمه‌های هوشمند به پروفایل اینستاگرام برای پاسخگویی خودکار" />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary" />
        </Head>
        <div className="title">{t(LanguageKey.messagesetting_addNewButton)}</div>
        {loadingState.isLoading && <Loading />}
        {!loadingState.isLoading && (
          <>
            <div className={styles.content}>
              {/*systemlist  */}
              <div className="headerandinput">
                <div className="headerandinput">
                  <RadioButton
                    name="default"
                    id={t(LanguageKey.product_systemlist)}
                    checked={checkBox.default}
                    handleOptionChanged={handleOptionChanged}
                    textlabel={t(LanguageKey.product_systemlist)}
                    title="system list"
                  />
                  <div className="explain">{t(LanguageKey.messagesetting_UseSystemButtonsExplain)}</div>
                </div>
                {checkBox.default && (
                  <div className={styles.optioncontainer}>
                    <DragDrop
                      data={getDefaultSpecialPayload()}
                      handleOptionSelect={(id) => {
                        setProfileButton((prev) => ({
                          ...prev,
                          specialPayload: parseInt(id, 10),
                        }));
                      }}
                    />
                    {profileButton.specialPayload != null && profileButton.specialPayload.toString() !== "NoSelect" && (
                      <div className="explain">
                        {specialPayloadTextMap[profileButton.specialPayload as SpecialPayLoad]?.explain || ""}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* AI  */}
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
                      <div className="headertext">{t(LanguageKey.messagesetting_ButtonTitle)}</div>
                      <InputText
                        dangerOnEmpty
                        className="textinputbox"
                        handleInputChange={(e) => setTitle(e.target.value)}
                        value={title}
                        placeHolder={t(LanguageKey.pageToolspopup_typehere)}
                        fadeTextArea={checkBox.default}
                      />
                    </div>

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
                    ) : (
                      <DragDrop
                        externalSearchMod={true}
                        data={searchAIMode ? getAISearchTitles() : getAITitles()}
                        handleOptionSelect={(id) => {
                          void getPromptById(id);
                        }}
                        handleGetMoreItems={() => getMorePrompts(prompts!.nextMaxId)}
                        isLoadingMoreItems={loadingState.isLoadingMoreAIItems}
                        onExternalSearch={handleExternalAISearch}
                        externalSearchLoading={loadingState.isExternalSearchAILoading}
                        externalSearchText={searchAIMode ? selectedPrompt?.title : ""}
                      />
                    )}

                    {loadingState.isLoadingPrompt && <RingLoader style={{ maxHeight: "14px" }} />}
                    {!loadingState.isLoadingPrompt && selectedPrompt && selectedPromptId && (
                      <div className="explain">{selectedPrompt.promptStr || ""}</div>
                    )}
                  </div>
                )}
              </div>

              {/* custom */}
              <div className="headerandinput">
                <div className="headerandinput">
                  <RadioButton
                    name="custom"
                    id={t(LanguageKey.product_Definenew)}
                    checked={checkBox.custom}
                    handleOptionChanged={handleOptionChanged}
                    textlabel={t(LanguageKey.AIFlow_quick_reply)}
                  />
                  <div className="explain">{t(LanguageKey.messagesetting_DefineCustomResponseExplain)}</div>
                </div>
                {checkBox.custom && (
                  <div className={styles.optioncontainer}>
                    <div className="headerandinput">
                      <div className="headertext">{t(LanguageKey.messagesetting_ButtonTitle)}</div>
                      <InputText
                        dangerOnEmpty
                        className="textinputbox"
                        handleInputChange={(e) => setTitle(e.target.value)}
                        value={title}
                        placeHolder={t(LanguageKey.pageToolspopup_typehere)}
                        fadeTextArea={checkBox.default}
                      />
                    </div>
                    <div className="headerandinput">
                      <div className="headerparent">
                        <div className="headertext">{t(LanguageKey.Answer)}</div>
                        <div className="counter">
                          ({profileButton.response?.length || 0}/800 )
                          <img
                            style={{
                              cursor: "pointer",
                              width: "16px",
                              height: "16px",
                            }}
                            title="ℹ️ paste"
                            src="/copy.svg"
                            onClick={handlePasteFromClipboard}
                          />
                        </div>
                      </div>
                      <TextArea
                        className="captiontextarea"
                        style={{ height: "200px" }}
                        handleInputChange={(e) =>
                          setProfileButton((prev) => ({
                            ...prev,
                            question: prev.title || "",
                            response: e.target.value,
                          }))
                        }
                        value={profileButton.response || ""}
                        placeHolder={t(LanguageKey.pageToolspopup_typehere)}
                        fadeTextArea={checkBox.default}
                        role="textbox"
                        title="Prompt Answer Input"
                        maxLength={800}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Flow  */}
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
                      <div className="headertext">{t(LanguageKey.messagesetting_ButtonTitle)}</div>
                      <InputText
                        dangerOnEmpty
                        className="textinputbox"
                        handleInputChange={(e) => setTitle(e.target.value)}
                        value={title}
                        placeHolder={t(LanguageKey.pageToolspopup_typehere)}
                        fadeTextArea={checkBox.default}
                      />
                    </div>

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
                    ) : (
                      <DragDrop
                        externalSearchMod={true}
                        data={searchFlowMode ? getFlowSearchTitles() : getFlowTitles()}
                        handleOptionSelect={(id) => {
                          if (id === "NoSelect") {
                            setSelectedFlow(null);
                            setProfileButton((prev) => ({ ...prev, masterFlowId: null }));
                            return;
                          }
                          if (!masterFlows) {
                            setSelectedFlow(null);
                            setProfileButton((prev) => ({ ...prev, masterFlowId: null }));
                            return;
                          }
                          const found = masterFlows.items.find(
                            (flow) => flow.masterFlowId === id || flow.masterFlowId?.toString() === id
                          );
                          setSelectedFlow(found || null);
                          setProfileButton((prev) => ({ ...prev, masterFlowId: found?.masterFlowId || null }));
                        }}
                        handleGetMoreItems={() => handleGetMoreFlows()}
                        isLoadingMoreItems={loadingState.isLoadingMoreFlowItems}
                        onExternalSearch={handleExternalFlowSearch}
                        externalSearchLoading={loadingState.isExternalSearchFlowLoading}
                        externalSearchText={searchFlowMode ? selectedFlow?.title : ""}
                      />
                    )}

                    {loadingState.isLoadingPrompt && <RingLoader style={{ maxHeight: "14px" }} />}
                    {!loadingState.isLoadingPrompt && selectedFlow && (
                      <button
                        onClick={() => {
                          try {
                            void router.push({
                              pathname: "/message/AIAndFlow",
                              query: { flowId: selectedFlow.masterFlowId },
                            });
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="saveButton">
                        <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="#fff" viewBox="0 0 36 36">
                          <path
                            opacity=".4"
                            fillRule="evenodd"
                            d="M18.2 4.5A1.5 1.5 0 0 1 16.5 6l-6.2.3q-2 .3-2.9 1.2t-1.3 3.3A61 61 0 0 0 6 18l.2 7.2q.4 2.4 1.3 3.3t3.3 1.3q2.5.2 7.2.2l7.2-.2q2.4-.4 3.3-1.3t1.2-3 .3-6.1a1.5 1.5 0 1 1 3 0l-.3 6.7a8 8 0 0 1-2.1 4.5 8 8 0 0 1-5 2.1q-3 .4-7.5.3H18q-4.6 0-7.5-.3t-5-2.1a8 8 0 0 1-2.1-5q-.4-3-.3-7.5v-.2l.3-7.5q.2-3 2.1-5a8 8 0 0 1 4.6-2q2.6-.5 6.7-.4a1.5 1.5 0 0 1 1.5 1.5"
                          />
                          <path d="M25 3a28 28 0 0 1 5.5.2q1 .2 1.6.8t.7 1.5c.3 1.6.2 4.3.1 5.6a2 2 0 0 1-3.3 1.2l-1.9-1.8-4.1 4a1.5 1.5 0 1 1-2.1-2.1l4-4-1.8-2a2 2 0 0 1 1.2-3.3" />
                        </svg>
                        {t(LanguageKey.messagesetting_ViewFlow)}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* GeneralAI */}
              {/* <div className="headerandinput">
                <div className="headerandinput">
                  <RadioButton
                    name="GeneralAI"
                    id={"GeneralAI"}
                    checked={checkBox.GeneralAI}
                    handleOptionChanged={handleOptionChanged}
                    textlabel="GeneralAI"
                  />
                  <div className="explain">{t(LanguageKey.messagesetting_UseGeneralAIExplain)}</div>
                </div>
                {checkBox.GeneralAI && (
                  <div className={styles.optioncontainer}>
                    <div className="headerandinput">
                      <div className="headertext">{t(LanguageKey.messagesetting_ButtonTitle)}</div>
                      <InputText
                        dangerOnEmpty
                        className="textinputbox"
                        handleInputChange={(e) => setTitle(e.target.value)}
                        value={title}
                        fadeTextArea={checkBox.default}
                      />
                    </div>
                  </div>
                )}
              </div> */}
            </div>

            <div className="ButtonContainer" role="group" aria-label="Action buttons">
              <button onClick={removeMask} className="cancelButton" type="button" aria-label={t(LanguageKey.cancel)}>
                {t(LanguageKey.cancel)}
              </button>
              <button
                disabled={!checkCondition()}
                onClick={handleSaveNewVariation}
                className={!checkCondition() ? "disableButton" : "saveButton"}
                type="button"
                aria-label={t(LanguageKey.save)}>
                {t(LanguageKey.save)}
              </button>
            </div>
          </>
        )}
      </>
    );
  }
);

export default SpecialPayLoadComp;
