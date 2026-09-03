import { useSession } from "next-auth/react";
import router, { useRouter } from "next/router";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import InputBox from "brancy/components/design/inputBox/inputBox";
import CheckBoxButton from "brancy/components/design/checkBoxButton/checkBoxButton";
import RingLoader from "brancy/components/design/loader/ringLoder";
import Modal from "brancy/components/design/modal";
import ToggleCheckBoxButton from "brancy/components/design/switchButton/switchButton";
import TextArea from "brancy/components/design/textArea/textArea";
import ToggleButton from "brancy/components/design/toggleButton/ToggleButton";
import { ToggleOrder } from "brancy/components/design/toggleButton/types";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import NotAllowed from "brancy/components/notOk/notAllowed";
import { getThumbnailStyle } from "brancy/helper/getThumbnailColor";
import { LoginStatus, RoleAccess } from "brancy/helper/loadingStatus";
import initialzedTime, { convertToMilliseconds } from "brancy/helper/manageTimer";
import { LanguageKey } from "brancy/i18n";
import { MethodType } from "brancy/helper/api";
import AIPromptBox from "brancy/components/messages/aiflow/aiPromptBox";
import Flow from "brancy/components/messages/aiflow/flow";
import styles from "./flowAndAIIBox.module.css";
import { LiveTestModal } from "brancy/components/messages/aiflow/flowNode";
import { TutorialModalContent } from "brancy/components/messages/aiflow/flowNode/NodeTutorials";
import { SettingModal } from "brancy/components/messages/aiflow/flowNode/settingmodal";
import AIToolsSettings from "brancy/components/messages/aiflow/popup/AIToolsSettings";
import LiveChat from "brancy/components/messages/aiflow/popup/liveChat";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { PartnerRole } from "brancy/models/enums";
import {
  IMasterFlow,
  IPrompts,
  IAITools,
  ITool,
  ICreatePrompt,
  ITotalPrompt,
  ITotalMasterFlow,
} from "brancy/models/interfaces";
import NotFeature from "brancy/components/notOk/notFeature";
import Tooltip from "brancy/components/design/tooltip/tooltip";

let firstTime = 0;
let touchMove = 0;
let touchStart = 0;
let firstPos = { x: 0, y: 0 };
let downFlagLeft = false;
let downFlagRight = false;
let hideDivIndex: string | number | null = null;

const NewFlowModal = (props: {
  open: boolean;
  onClose: () => void;
  onContinue: (settings: {
    title: string;
    checkFollower: boolean;
    snapToGridEnabled: boolean;
    panningBoundaryEnabled: boolean;
    editorState?: any;
  }) => void;
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("Flow_1");
  const [checkFollower, setCheckFollower] = useState(false);
  const [snapToGridEnabled, setSnapToGridEnabled] = useState(false);
  const [panningBoundaryEnabled, setPanningBoundaryEnabled] = useState(false);
  const [editorState, setEditorState] = useState<any>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!Array.isArray(imported.nodes) || !Array.isArray(imported.connections)) throw new Error("Invalid flow");
      setEditorState({
        nodes: imported.nodes,
        connections: imported.connections,
        scale: typeof imported.scale === "number" ? imported.scale : 1,
        pan: imported.pan || { x: 0, y: 0 },
      });
    } catch {
      notify(ResponseType.Unexpected, NotifType.Warning);
    } finally {
      event.target.value = "";
    }
  };

  return (
    <Modal closePopup={props.onClose} classNamePopup="popup" showContent={props.open}>
      <div className="title">{t(LanguageKey.CreateAutomationFlow)}</div>
      <div className="headerandinput">
        <div className="title">{t(LanguageKey.flowtitle)}</div>
        <InputBox
          id="new-flow-title"
          name="new-flow-title"
          className="textinputbox"
          placeHolder={t(LanguageKey.pageToolspopup_typehere)}
          dangerOnEmpty
          handleInputChange={(event) => setTitle(event.target.value)}
          value={title}
        />
      </div>
      <div className="headerandinput">
        <div className="headerparent">
          <div className="title2">{t(LanguageKey.shouldFollower)}</div>
          <ToggleCheckBoxButton
            title="Check Follower"
            name="new-flow-check-follower"
            role="switch"
            handleToggle={(event) => setCheckFollower(event.currentTarget.checked)}
            checked={checkFollower}
          />
        </div>
        <div className="explain" style={{ color: "var(--color-dark-yellow)" }}>
          {t(LanguageKey.flowProperties_notworking_privateReply)}
        </div>
      </div>
      <div className="headerandinput">
        <CheckBoxButton
          value={snapToGridEnabled}
          handleToggle={() => setSnapToGridEnabled((value) => !value)}
          textlabel={t(LanguageKey.snapGrid)}
          name="new-flow-snap-grid"
          title="switch"
        />
        <CheckBoxButton
          value={panningBoundaryEnabled}
          handleToggle={() => setPanningBoundaryEnabled((value) => !value)}
          textlabel={t(LanguageKey.PanningBoundary)}
          name="new-flow-panning-boundary"
          title="switch"
        />
      </div>
      <div className="headerparent">
        <div className="title">
          {t(LanguageKey.Data_Management)}
          <Tooltip
            tooltipValue={t(LanguageKey.Data_Management_explain)}
            triggerType="tooltip"
            onClick
            position="bottom"
          />
        </div>

        <input ref={fileInputRef} type="file" accept="application/json,.json" hidden onChange={handleImport} />
        <button
          style={{ minWidth: "max-content", maxWidth: "35%" }}
          className="cancelButton"
          onClick={() => fileInputRef.current?.click()}>
          {t(LanguageKey.importJSON)}
        </button>
      </div>
      <div className="ButtonContainer">
        <button
          className={`saveButton ${!title.trim() ? "fadeDiv" : ""}`}
          disabled={!title.trim()}
          title="Continue"
          onClick={() =>
            props.onContinue({
              title: title.trim(),
              checkFollower,
              snapToGridEnabled,
              panningBoundaryEnabled,
              editorState,
            })
          }>
          {t(LanguageKey.Continue)}
        </button>
        <button className="cancelButton" title="cancel" onClick={props.onClose}>
          {t(LanguageKey.cancel)}
        </button>
      </div>
    </Modal>
  );
};

const FlowAndAIInbox = () => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const routerHook = useRouter();
  const [searchMasterFlowInbox, setSearchMasterFlowInbox] = useState<IMasterFlow>();
  const [searchPromptInbox, setSearchPromptInbox] = useState<IPrompts>();
  const [loading, setLoading] = useState(LoginStatus(session) && RoleAccess(session, PartnerRole.SystemTicket));
  const [searchbox, setSearchbox] = useState("");
  const [toggleOrder, setToggleOrder] = useState<ToggleOrder>(ToggleOrder.FirstToggle);
  const [userSelectedId, setUserSelectedId] = useState<string | null>(null);
  const [showNewFlowModal, setShowNewFlowModal] = useState(false);
  const [newFlowSettings, setNewFlowSettings] = useState<{
    title: string;
    checkFollower: boolean;
    snapToGridEnabled: boolean;
    panningBoundaryEnabled: boolean;
    editorState?: any;
  } | null>(null);
  const [newFlowDraft, setNewFlowDraft] = useState<ITotalMasterFlow | null>(null);
  const [searchLocked, setSearchLocked] = useState<boolean>(false);
  const [displayRight, setDisplayRight] = useState("");
  const [displayLeft, setDisplayLeft] = useState("");
  const userListRef = useRef<HTMLDivElement>(null);
  const [showDivIndex, setShowDivIndex] = useState<string | number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [timoutId, setTimeoutId] = useState<any>();
  const [showSearchThread, setShowSearchThread] = useState({
    searchMode: false,
    loading: false,
    noResult: false,
  });
  // AIToolsSettings related states
  const [showAIToolsSettings, setShowAIToolsSettings] = useState(false);
  const [selectedAITool, setSelectedAITool] = useState<IAITools | null>(null);
  const [aiPromptTools, setAIPromptTools] = useState<ITool[]>([]);
  const [aiToolParamValues, setAIToolParamValues] = useState<Record<string, Record<string, string>>>({});

  // LiveChat related states
  const [showLiveChatPopup, setShowLiveChatPopup] = useState(false);
  const [promptInfo, setPromptInfo] = useState<ICreatePrompt | null>(null);
  const [showPromptAnalysisModal, setShowPromptAnalysisModal] = useState(false);
  const [promptAnalysisText, setPromptAnalysisText] = useState("");
  const promptAnalysisAcceptRef = useRef<((text: string) => void) | null>(null);
  const promptAnalysisCloseRef = useRef<(() => void) | null>(null);

  const handleOpenPromptAnalysisModal = (
    initialText: string,
    onAccept: (text: string) => void,
    onClose: () => void,
  ) => {
    setPromptAnalysisText(initialText);
    promptAnalysisAcceptRef.current = onAccept;
    promptAnalysisCloseRef.current = onClose;
    setShowPromptAnalysisModal(true);
  };

  const handleClosePromptAnalysisModal = () => {
    setShowPromptAnalysisModal(false);
    promptAnalysisCloseRef.current?.();
    promptAnalysisAcceptRef.current = null;
    promptAnalysisCloseRef.current = null;
  };

  const handleAcceptPromptAnalysis = () => {
    if (promptAnalysisText.length <= 20) return;

    promptAnalysisAcceptRef.current?.(promptAnalysisText);
    setShowPromptAnalysisModal(false);
    promptAnalysisAcceptRef.current = null;
    promptAnalysisCloseRef.current = null;
  };

  // Settings Modal (lifted from Flow)
  const [settingModalVisible, setSettingModalVisible] = useState(false);
  const [settingModalProps, setSettingModalProps] = useState<any>(null);

  const handleOpenSettings = (payload: any) => {
    console.log("Opening settings with payload:", payload);
    setSettingModalProps(payload);
    setSettingModalVisible(true);
  };

  // Tutorial Modal handler
  const handleOpenTutorial = (nodeType: string) => {
    setTutorialModal({ visible: true, nodeType });
  };

  // LiveTest Modal states
  const [liveTestVisible, setLiveTestVisible] = useState(false);
  const getEditorStateRef = useRef<(() => { nodes: any[]; connections: any[]; title: string }) | null>(null);

  // Tutorial Modal state (moved from Flow)
  const [tutorialModal, setTutorialModal] = useState<{
    visible: boolean;
    nodeType: string | null;
  }>({
    visible: false,
    nodeType: null,
  });
  const [showNotFeature, setShowNotFeature] = useState(false);
  const handleOpenLiveTest = () => {
    setLiveTestVisible(true);
  };

  const handleRegisterGetEditorState = (fn: () => { nodes: any[]; connections: any[]; title: string }) => {
    getEditorStateRef.current = fn;
  };

  // Callback refs to be set by Editor component
  const addToPromptRef = useRef<((text: string) => void) | null>(null);
  const addToolRef = useRef<((tool: ITool) => void) | null>(null);
  const reloadFlowRef = useRef<((useLocalStorage: boolean) => void) | null>(null);
  const handleRegisterReload = (fn: (useLocalStorage: boolean) => void) => {
    reloadFlowRef.current = fn;
  };
  const handleShowFlow = async (id: string) => {
    let newTime = new Date().getTime();
    if (newTime - firstTime <= 110) {
      if (id === showDivIndex) {
        setTimeout(() => {
          hideDivIndex = id;
          touchMove = 0;
          setShowDivIndex(null);
        }, 700);
        return;
      }
      if (typeof window !== undefined && window.innerWidth <= 1024 && displayRight === "none") {
        setDisplayLeft("none");
        setDisplayRight("");
      }

      if (id === userSelectedId) return;
      setUserSelectedId(id);
    }
  };
  const handleMouseMove = (index: string | number) => {
    if (downFlagLeft && mousePos.x - firstPos.x < -10) {
      setShowDivIndex(index);
      downFlagLeft = false;
      downFlagRight = false;
    }
    if (downFlagRight && mousePos.x - firstPos.x > 10 && showDivIndex !== null) {
      downFlagRight = false;
      downFlagLeft = false;
      setTimeout(() => {
        hideDivIndex = index;
        setShowDivIndex(null);
      }, 700);
    }
  };
  const handleTouchEnd = (index: string | number) => {
    if (touchMove === 0) return;
    if (touchMove - touchStart < -35) {
      setShowDivIndex(index);
    } else if (touchMove - touchStart > 0) {
      setTimeout(() => {
        hideDivIndex = index;
        setShowDivIndex(null);
      }, 700);
    }
  };
  const handleMouseUp = () => {
    downFlagRight = false;
    downFlagLeft = false;
  };
  const handleMouseDown = () => {
    firstPos = mousePos;
    firstTime = new Date().getTime();
    downFlagLeft = true;
    downFlagRight = true;
  };
  const handleShowAI = async (id: string) => {
    let newTime = new Date().getTime();
    if (newTime - firstTime <= 110) {
      if (id === showDivIndex) {
        setTimeout(() => {
          hideDivIndex = id;
          touchMove = 0;
          setShowDivIndex(null);
        }, 700);
        return;
      }
      if (typeof window !== undefined && window.innerWidth <= 1024 && displayRight === "none") {
        setDisplayLeft("none");
        setDisplayRight("");
      }
      if (id === userSelectedId) return;

      setUserSelectedId(id);
    }
  };
  const handleToggleChange = (order: ToggleOrder) => {
    const container = userListRef.current;
    if (container) {
      container.scrollTop = 0;
    }
    setUserSelectedId(null);
    hideDivIndex = null;
    setToggleOrder(order);
  };
  const handleResize = () => {
    if (typeof window !== undefined) {
      var width = window.innerWidth;
      if (width < 1024 && userSelectedId !== null) {
        setDisplayLeft("none");
        setDisplayRight("");
      } else if (width < 1024 && userSelectedId === null) {
        setDisplayRight("none");
        setDisplayLeft("");
      } else if (width >= 1024) {
        setDisplayLeft("");
        setDisplayRight("");
      }
    }
  };
  const loadMoreItems = async () => {
    {
      if (toggleOrder === ToggleOrder.FirstToggle && !showSearchThread.searchMode && masterFlow?.nextMaxId) {
        fetchData(ToggleOrder.FirstToggle, masterFlow?.nextMaxId, null);
      } else if (toggleOrder === ToggleOrder.SecondToggle && !showSearchThread.searchMode && promptInbox?.nextMaxId) {
        fetchData(ToggleOrder.SecondToggle, promptInbox.nextMaxId, null);
      }
    }
  };
  const handleScroll = () => {
    const container = userListRef.current;
    if (container && container.scrollHeight - container.scrollTop === container.clientHeight) {
      loadMoreItems();
    }
  };
  const fetchData = async (ticketType: ToggleOrder, nextMaxId: string | null, query: string | null) => {
    if (ticketType === ToggleOrder.FirstToggle) {
      try {
        let flowRes = await clientFetchApi<boolean, IMasterFlow>("/api/flow/GetMasterFlows", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: [
            { key: "query", value: query ? query : undefined },
            {
              key: "nextMaxId",
              value: nextMaxId ? nextMaxId : undefined,
            },
          ],
          onUploadProgress: undefined,
        });
        console.log("flow boxxxxxxxx", flowRes);
        if (flowRes.succeeded && !query) {
          setMasterFlow((prev) => ({
            ...prev!,
            items: flowRes.value ? [...prev!.items, ...flowRes.value.items] : prev!.items,
            nextMaxId: flowRes.value ? flowRes.value.nextMaxId : null,
          }));
        } else if (flowRes.succeeded && query) {
          if (flowRes.value && flowRes.value.items.length > 0) {
            setSearchMasterFlowInbox(flowRes.value);
            setShowSearchThread((prev) => ({ ...prev, loading: false }));
          } else
            setShowSearchThread((prev) => ({
              ...prev,
              loading: false,
              noResult: true,
            }));
        } else if (!flowRes.succeeded) {
          setShowSearchThread((prev) => ({
            ...prev,
            loading: false,
            noResult: true,
          }));
          notify(flowRes.info.responseType, NotifType.Warning);
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    } else if (ticketType === ToggleOrder.SecondToggle) {
      try {
        let promptRes = await clientFetchApi<boolean, IPrompts>("/api/ai/GetPrompts", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: [
            { key: "query", value: query ? query : undefined },
            {
              key: "nextMaxId",
              value: nextMaxId ? nextMaxId : undefined,
            },
          ],
          onUploadProgress: undefined,
        });
        console.log("promptRes ", promptRes.value);
        if (promptRes.succeeded && !query) {
          setPromptInbox((prev) => ({
            ...prev!,
            nextMaxId: promptRes.value ? promptRes.value.nextMaxId : null,
            items: promptRes.value ? [...prev!.items, ...promptRes.value.items] : prev!.items,
          }));
        } else if (promptRes.succeeded && query) {
          if (promptRes.value && promptRes.value.items.length > 0) {
            setSearchPromptInbox(promptRes.value);
            setShowSearchThread((prev) => ({ ...prev, loading: false }));
          } else
            setShowSearchThread((prev) => ({
              ...prev,
              loading: false,
              noResult: true,
            }));
        } else if (!promptRes.succeeded) {
          setShowSearchThread((prev) => ({
            ...prev,
            loading: false,
            noResult: true,
          }));
          notify(promptRes.info.responseType, NotifType.Warning);
        }
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    }
  };
  const showUserList = () => {
    if (typeof window !== undefined && window.innerWidth <= 1024 && displayLeft === "none") {
      setDisplayLeft("");
      setDisplayRight("none");
    }
    setUserSelectedId(null);
  };
  const handleSearchThreads = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!LoginStatus(session)) return;
    setUserSelectedId(null);
    setShowSearchThread({ searchMode: true, loading: true, noResult: false });
    setSearchMasterFlowInbox((prev) => ({ ...prev!, items: [] }));
    const query = e.target.value;
    setSearchbox(query);
    if (timoutId) clearTimeout(timoutId);
    if (query.length > 0) {
      let timeOutId = setTimeout(() => {
        if (query && query.length > 0) {
          if (searchLocked) return;
          console.log("searchhhchhhhhhh");
          setSearchLocked(true);
          fetchData(toggleOrder, null, query);
          setTimeout(() => {
            setSearchLocked(false);
          }, 2000);
        }
      }, 1000);
      setTimeoutId(timeOutId);
    } else {
      setShowSearchThread({
        searchMode: false,
        loading: false,
        noResult: false,
      });
    }
  };
  const [masterFlow, setMasterFlow] = useState<IMasterFlow | null>(null);
  const [promptInbox, setPromptInbox] = useState<IPrompts | null>(null);
  const [aiTools, setAITools] = useState<IAITools[]>([]);
  function updateAIPrompt(prompt: ITotalPrompt) {
    const existedPrompt = promptInbox?.items.find((x) => x.promptId === prompt.promptId);
    if (existedPrompt) {
      setPromptInbox((prev) => ({
        ...prev!,
        items: prev!.items.map((x) => (x.promptId !== existedPrompt.promptId ? x : prompt)),
      }));
    } else {
      setPromptInbox((prev) => ({
        ...prev!,
        items: [prompt, ...prev!.items],
      }));
      setUserSelectedId(prompt.promptId);
    }
  }
  async function fetchFirstData() {
    try {
      const [flowRes, promptRes, aiToolRes] = await Promise.all([
        clientFetchApi<boolean, IMasterFlow>("/api/flow/GetMasterFlows", {
          methodType: MethodType.get,
          session: session,
          data: null,
          queries: undefined,
          onUploadProgress: undefined,
        }),
        clientFetchApi<boolean, IPrompts>("/api/ai/GetPrompts", {
          methodType: MethodType.get,
          session: session,
          data: undefined,
          queries: undefined,
          onUploadProgress: undefined,
        }),
        clientFetchApi<boolean, IAITools[]>("/api/ai/GetTools", {
          methodType: MethodType.get,
          session: session,
          data: undefined,
          queries: undefined,
          onUploadProgress: undefined,
        }),
      ]);
      if (!flowRes.succeeded) notify(flowRes.info.responseType, NotifType.Warning);
      if (flowRes.succeeded) setMasterFlow(flowRes.value);
      if (promptRes.succeeded) setPromptInbox(promptRes.value);
      if (aiToolRes.succeeded) setAITools(aiToolRes.value);
    } catch (error) {
      notify(ResponseType.Unexpected, NotifType.Error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (routerHook && routerHook.query && routerHook.query.flowId) {
      const fid = Array.isArray(routerHook.query.flowId) ? routerHook.query.flowId[0] : routerHook.query.flowId;
      if (fid) {
        setToggleOrder(ToggleOrder.FirstToggle);
        setUserSelectedId(String(fid));
      }
    }
    console.log(" ✅ Console ⋙ Session", session, session?.user.username);
    if (
      session === undefined ||
      session?.user.username === undefined ||
      !LoginStatus(session) ||
      !RoleAccess(session, PartnerRole.Automatics)
    )
      return;
    fetchFirstData();
    const handleMouseMove = (event: { clientX: number; clientY: number }) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };
    const handleTouchMove = (e: TouchEvent) => {
      touchMove = e.touches[0].clientX;
    };
    const handleTouchStart = (e: TouchEvent) => {
      touchStart = e.touches[0].clientX;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchstart", handleTouchStart);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchstart", handleTouchStart);
      hideDivIndex = null;
    };
  }, [session]);
  /* ___dragDropSidebar___ */
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [userSelectedId]);

  function handleUpdateFlow(masterFlow: ITotalMasterFlow, flowStr: string): void {
    // Update the masterFlow state with the updated flow
    console.log("masterFlowwwwwwww", masterFlow);
    setMasterFlow((prev) => {
      // If previous state is null, create a new IMasterFlow with this item
      if (!prev)
        return {
          ...({} as IMasterFlow),
          items: [masterFlow],
          nextMaxId: null,
        };
      const existedFlow = prev.items.find((item) => item.masterFlowId === masterFlow.masterFlowId);
      // If the flow does not exist, prepend it to the items array
      if (!existedFlow) {
        localStorage.removeItem("flowEditor_autoSave_newFlow");
        setUserSelectedId(masterFlow.masterFlowId);
        return {
          ...prev,
          items: [masterFlow, ...prev.items.filter((item) => item.masterFlowId !== "newFlow")],
        };
      }
      // Otherwise replace the existing item
      else {
        console.log("updating existing flow", JSON.parse(flowStr));
        localStorage.removeItem(`flowEditor_autoSave_${masterFlow.masterFlowId}`);
        return {
          ...prev,
          items: prev.items.map((item) => (item.masterFlowId === masterFlow.masterFlowId ? masterFlow : item)),
        };
      }
    });

    if (masterFlow.masterFlowId !== "newFlow") {
      setNewFlowDraft(null);
    }

    // Close the settings modal after successful update
    setSettingModalVisible(false);
  }

  return (
    <>
      {!RoleAccess(session, PartnerRole.Automatics) && <NotAllowed />}
      {loading && <Loading />}
      {!loading && (
        <div className={`pincontainerMSG translate`}>
          {/* ___left ___*/}
          <div className={styles.left} style={{ display: displayLeft }}>
            {/* ___search ___*/}

            <InputBox
              className={"serachMenuBar"}
              placeHolder={t(LanguageKey.searchKeyword)}
              handleInputChange={handleSearchThreads}
              value={searchbox}
              maxLength={undefined}
              name="Search from People or Keyword"
            />

            {/* ___switch button ___*/}
            <ToggleButton
              onChange={handleToggleChange}
              selectedValue={toggleOrder}
              options={[
                { label: t(LanguageKey.Flow), id: 0 },
                { label: t(LanguageKey.AI), id: 1 },
              ]}
            />
            {toggleOrder === ToggleOrder.FirstToggle && (
              <>
                <div onClick={() => setShowNewFlowModal(true)} className={styles.addnewlink} title="◰ Create new Flow">
                  <div className={styles.addnewicon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 36 36">
                      <path
                        d="m15.4 7.5 6 19M14.7 6.7l8 4"
                        stroke="var(--color-dark-blue)"
                        strokeOpacity=".4"
                        strokeWidth="4"
                      />
                      <path
                        d="M2 7.5c0-1.4 0-2 .2-2.7a4 4 0 0 1 2.6-2.6Q5.6 2 7.5 2h3c1.4 0 2 0 2.7.2a4 4 0 0 1 2.6 2.6q.3.8.2 2.7c0 1.4 0 2-.2 2.7a4 4 0 0 1-2.6 2.6q-.7.3-2.7.2h-3c-1.4 0-2 0-2.7-.2a4 4 0 0 1-2.6-2.6Q2 9.4 2 7.5m19 6c0-1.4 0-2 .2-2.7a4 4 0 0 1 2.6-2.6q.8-.2 2.7-.2h3c1.4 0 2 0 2.7.2a4 4 0 0 1 2.6 2.6q.3.7.2 2.7c0 1.4 0 2-.2 2.7a4 4 0 0 1-2.6 2.6q-.7.3-2.7.2h-3c-1.4 0-2 0-2.7-.2a4 4 0 0 1-2.6-2.6q-.2-.7-.2-2.7m-2 15c0-1.4 0-2 .2-2.7a4 4 0 0 1 2.6-2.6q.8-.2 2.7-.2h3c1.4 0 2 0 2.7.2a4 4 0 0 1 2.6 2.6q.3.8.2 2.7c0 1.4 0 2-.2 2.7a4 4 0 0 1-2.6 2.6q-.7.3-2.7.2h-3c-1.4 0-2 0-2.7-.2a4 4 0 0 1-2.6-2.6q-.2-.7-.2-2.7"
                        fill="var(--color-dark-blue)"
                      />
                    </svg>
                  </div>

                  <div className={styles.addnewcontent}>
                    <div className={styles.addnewheader}>{t(LanguageKey.CreateAutomationFlow)}</div>
                    <div className="explain">{t(LanguageKey.CreateAutomationFlowExplain)}</div>
                  </div>
                </div>
              </>
            )}
            {toggleOrder === ToggleOrder.SecondToggle && (
              <div onClick={() => setUserSelectedId("")} className={styles.addnewlink} title="◰ Create new Flow">
                <div className={styles.addnewicon}>
                  <svg width="36" height="36" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path
                      opacity=".2"
                      d="M14.2 20.9a8.4 8.4 0 0 0 7.8-8v-2.4a8.4 8.4 0 0 0-7.8-8H9.8a8.4 8.4 0 0 0-7.8 8V13q.3 2.3 1.6 4.2.6 1.3-.3 2.8-.6 1-.4 1.2.3.4 1.1.3 1.7 0 2.7-.8l.7-.4 1 .3 1.4.3z"
                      fill="var(--color-dark-blue)"
                    />
                    <path
                      d="m7.5 15 1.8-5.5a.7.7 0 0 1 1.4 0l1.8 5.5m3-6v6m-7-2h3m2.7 7.9a8.4 8.4 0 0 0 7.8-8v-2.4a8.4 8.4 0 0 0-7.8-8H9.8a8.4 8.4 0 0 0-7.8 8V13q.3 2.3 1.6 4.2.6 1.3-.3 2.8-.6 1-.4 1.2.3.4 1.1.3 1.7 0 2.7-.8l.7-.4 1 .3 1.4.3z"
                      stroke="var(--color-dark-blue)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className={styles.addnewcontent}>
                  <div className={styles.addnewheader}>{t(LanguageKey.CreateAutomationAI)}</div>
                  <div className="explain">{t(LanguageKey.CreateAutomationAIExplain)}</div>
                </div>
              </div>
            )}
            {/* ___list of user ___*/}
            <div className={styles.userslist} ref={userListRef} onScroll={handleScroll}>
              {toggleOrder === ToggleOrder.FirstToggle && newFlowDraft && !showSearchThread.searchMode && (
                <div
                  className={styles.userbackground}
                  style={userSelectedId === "newFlow" ? { background: "var(--color-gray30)" } : {}}
                  onMouseDown={() => handleMouseDown()}
                  onMouseUp={() => handleMouseUp()}
                  onMouseMove={() => handleMouseMove("newFlow")}
                  onTouchEnd={() => handleTouchEnd("newFlow")}
                  onClick={() => {
                    if (typeof window !== "undefined" && window.innerWidth <= 1024) {
                      setDisplayLeft("none");
                      setDisplayRight("");
                    }
                    setUserSelectedId("newFlow");
                  }}>
                  {(() => {
                    const thumbnailStyle = getThumbnailStyle(newFlowDraft.title, {
                      backgroundOpacity: 60,
                      characterCount: 2,
                      textColorMode: "background-dark",
                    });
                    return (
                      <div
                        className={styles.thumbnail}
                        style={{
                          background: thumbnailStyle.backgroundColor,
                          color: thumbnailStyle.color,
                        }}>
                        {thumbnailStyle.text}
                      </div>
                    );
                  })()}
                  <div className="instagramprofiledetail">
                    <div className="instagramusername" title={newFlowDraft.title}>
                      {newFlowDraft.title}
                    </div>
                    <div className="instagramid">
                      # {newFlowDraft.masterFlowId}
                      <div className="IDred">{t(LanguageKey.product_draft)}</div>
                    </div>
                    <div className={styles.chattime}>{new Date(newFlowDraft.createdTime).toLocaleString()}</div>
                  </div>
                </div>
              )}
              {toggleOrder === ToggleOrder.FirstToggle &&
                !showSearchThread.searchMode &&
                masterFlow &&
                masterFlow.items.map((v) => (
                  <div
                    className={styles.userbackground}
                    style={v.masterFlowId === userSelectedId ? { background: "var(--color-gray30)" } : {}}
                    key={v.masterFlowId}
                    onMouseDown={() => handleMouseDown()}
                    onMouseUp={() => handleMouseUp()}
                    onMouseMove={() => handleMouseMove(v.masterFlowId)}
                    onTouchEnd={() => handleTouchEnd(v.masterFlowId)}
                    onClick={() => {
                      handleShowFlow(v.masterFlowId);
                    }}>
                    {(() => {
                      const thumbnailStyle = getThumbnailStyle(v.title, {
                        backgroundOpacity: 60,
                        characterCount: 2,
                        textColorMode: "background-dark",
                      });
                      return (
                        <div
                          className={styles.thumbnail}
                          style={{
                            background: thumbnailStyle.backgroundColor,
                            color: thumbnailStyle.color,
                          }}>
                          {thumbnailStyle.text}
                        </div>
                      );
                    })()}
                    <div className="instagramprofiledetail">
                      <div className="instagramusername" title={v.title}>
                        {v.title}
                      </div>
                      <div className="instagramid" title="ℹ️ Flow ID">
                        # {v.masterFlowId}
                      </div>
                      <div className={styles.chattime}>
                        {new DateObject({
                          date: convertToMilliseconds(v.createdTime),
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("YYYY/MM/DD - h:mm a")}
                      </div>
                    </div>
                  </div>
                ))}
              {toggleOrder === ToggleOrder.SecondToggle &&
                !showSearchThread.searchMode &&
                promptInbox &&
                promptInbox.items.map((v) => (
                  <div
                    key={v.promptId}
                    onMouseDown={() => handleMouseDown()}
                    onMouseUp={() => handleMouseUp()}
                    onMouseMove={() => handleMouseMove(v.promptId)}
                    onTouchEnd={() => handleTouchEnd(v.promptId)}
                    onClick={() => handleShowAI(v.promptId)}
                    className={styles.userbackground}
                    style={v.promptId === userSelectedId ? { background: "var(--color-gray30)" } : {}}>
                    {(() => {
                      const thumbnailStyle = getThumbnailStyle(v.title, {
                        backgroundOpacity: 60,
                        characterCount: 2,
                        textColorMode: "background-dark",
                      });
                      return (
                        <div
                          className={styles.thumbnail}
                          style={{
                            background: thumbnailStyle.backgroundColor,
                            color: thumbnailStyle.color,
                          }}>
                          {thumbnailStyle.text}
                        </div>
                      );
                    })()}

                    <div className="instagramprofiledetail">
                      <div className="instagramusername" title={v.title}>
                        {v.title}
                      </div>
                      <div className="instagramid" title="ℹ️ Prompt ID">
                        # {v.promptId}
                      </div>
                      <div className={styles.chattime}>
                        {new DateObject({
                          date: convertToMilliseconds(v.updatedTime),
                          calendar: initialzedTime().calendar,
                          locale: initialzedTime().locale,
                        }).format("YYYY/MM/DD - h:mm a")}
                      </div>
                    </div>
                  </div>
                ))}
              {showSearchThread.searchMode &&
                toggleOrder === ToggleOrder.FirstToggle &&
                session?.user.messagePermission && (
                  <>
                    {showSearchThread.loading && <RingLoader />}
                    {showSearchThread.noResult && <h1 className="title2"> {t(LanguageKey.noresult)}</h1>}
                    {!showSearchThread.loading &&
                      !showSearchThread.noResult &&
                      searchMasterFlowInbox &&
                      searchMasterFlowInbox.items.map((v) => (
                        <div
                          className={styles.userbackground}
                          style={v.masterFlowId === userSelectedId ? { background: "var(--color-gray30)" } : {}}
                          key={v.masterFlowId}
                          onMouseDown={() => handleMouseDown()}
                          onMouseUp={() => handleMouseUp()}
                          onMouseMove={() => handleMouseMove(v.masterFlowId)}
                          onTouchEnd={() => handleTouchEnd(v.masterFlowId)}
                          onClick={() => {
                            handleShowFlow(v.masterFlowId);
                          }}>
                          {(() => {
                            const thumbnailStyle = getThumbnailStyle(v.title, {
                              backgroundOpacity: 60,
                              characterCount: 2,
                              textColorMode: "background-dark",
                            });
                            return (
                              <div
                                className={styles.thumbnail}
                                style={{
                                  background: thumbnailStyle.backgroundColor,
                                  color: thumbnailStyle.color,
                                }}>
                                {thumbnailStyle.text}
                              </div>
                            );
                          })()}
                          <div className="instagramprofiledetail">
                            <div className="instagramusername" title={v.title}>
                              {v.title}
                            </div>
                            <div className="instagramid" title="ℹ️ Flow ID">
                              # {v.masterFlowId}
                            </div>
                            <div className={styles.chattime}>
                              {new DateObject({
                                date: convertToMilliseconds(v.createdTime),
                                calendar: initialzedTime().calendar,
                                locale: initialzedTime().locale,
                              }).format("YYYY/MM/DD - h:mm a")}
                            </div>
                          </div>
                        </div>
                      ))}
                  </>
                )}
              {showSearchThread.searchMode && toggleOrder === ToggleOrder.SecondToggle && (
                <>
                  {showSearchThread.loading && <RingLoader />}
                  {showSearchThread.noResult && <h1 className="title2"> {t(LanguageKey.noresult)}</h1>}
                  {!showSearchThread.loading &&
                    !showSearchThread.noResult &&
                    searchPromptInbox?.items.map((v) => (
                      <div
                        key={v.promptId}
                        onMouseDown={() => handleMouseDown()}
                        onMouseUp={() => handleMouseUp()}
                        onMouseMove={() => handleMouseMove(v.promptId)}
                        onTouchEnd={() => handleTouchEnd(v.promptId)}
                        onClick={() => handleShowAI(v.promptId)}
                        className={styles.userbackground}
                        style={v.promptId === userSelectedId ? { background: "var(--color-gray30)" } : {}}>
                        {(() => {
                          const thumbnailStyle = getThumbnailStyle(v.title, {
                            backgroundOpacity: 60,
                            characterCount: 2,
                            textColorMode: "background-dark",
                          });
                          return (
                            <div
                              className={styles.thumbnail}
                              style={{
                                background: thumbnailStyle.backgroundColor,
                                color: thumbnailStyle.color,
                              }}>
                              {thumbnailStyle.text}
                            </div>
                          );
                        })()}

                        <div className="instagramprofiledetail">
                          <div className="instagramusername" title={v.title}>
                            {v.title}
                          </div>
                          <div className="instagramid" title="ℹ️ Prompt ID">
                            # {v.promptId}
                          </div>
                          <div className={styles.chattime}>
                            {new DateObject({
                              date: convertToMilliseconds(v.updatedTime),
                              calendar: initialzedTime().calendar,
                              locale: initialzedTime().locale,
                            }).format("YYYY/MM/DD - h:mm a")}
                          </div>
                        </div>
                      </div>
                    ))}
                </>
              )}
            </div>
          </div>
          {/* ___right ___*/}
          {userSelectedId !== null && toggleOrder === ToggleOrder.FirstToggle && (
            <div className={styles.right} style={{ display: displayRight }}>
              <Flow
                flowId={userSelectedId}
                showUserList={showUserList}
                onOpenSettings={handleOpenSettings}
                onSaveSuccess={(masterFlow, flowStr) => {
                  if (masterFlow && flowStr) {
                    handleUpdateFlow(masterFlow, flowStr);
                  }
                }}
                onOpenLiveTest={handleOpenLiveTest}
                onOpenTutorial={handleOpenTutorial}
                onRegisterGetEditorState={handleRegisterGetEditorState}
                onRegisterReload={handleRegisterReload}
                existingFlows={masterFlow?.items || []}
                initialSettings={userSelectedId === "newFlow" ? newFlowSettings || undefined : undefined}
                initialEditorState={userSelectedId === "newFlow" ? newFlowSettings?.editorState : undefined}
              />
            </div>
          )}
          {userSelectedId !== null && toggleOrder === ToggleOrder.SecondToggle && (
            <div className={styles.rightAI} style={{ display: displayRight }}>
              <AIPromptBox
                aiTools={aiTools}
                userSelectId={userSelectedId}
                showUserList={showUserList}
                updateAIPrompt={updateAIPrompt}
                showAIToolsSettings={showAIToolsSettings}
                setShowAIToolsSettings={setShowAIToolsSettings}
                selectedAITool={selectedAITool}
                setSelectedAITool={setSelectedAITool}
                onAddToPromptRef={addToPromptRef}
                onAddToolRef={addToolRef}
                showLiveChatPopup={showLiveChatPopup}
                setShowLiveChatPopup={setShowLiveChatPopup}
                promptInfo={promptInfo}
                setPromptInfo={setPromptInfo}
                tools={aiPromptTools}
                setTools={setAIPromptTools}
                setShowNotFeature={setShowNotFeature}
                openPromptAnalysisModal={handleOpenPromptAnalysisModal}
              />
            </div>
          )}
          {userSelectedId === null && (
            <div className={styles.disableRight} style={{ display: displayRight }}>
              <img className={styles.disableRightimage} alt="Welcome illustration" src="/disableright.svg" />
              <div>
                <h3>{t(LanguageKey.flowmanagement)}</h3>
              </div>
            </div>
          )}
        </div>
      )}

      {toggleOrder === ToggleOrder.SecondToggle && !loading && (
        <Modal
          closePopup={() => setShowAIToolsSettings(false)}
          classNamePopup={"popup"}
          showContent={showAIToolsSettings && toggleOrder === ToggleOrder.SecondToggle && !loading}>
          <AIToolsSettings
            onClose={() => setShowAIToolsSettings(false)}
            aiTools={aiTools}
            selectedAITool={selectedAITool}
            existingTools={aiPromptTools}
            paramValues={aiToolParamValues}
            setParamValues={setAIToolParamValues}
            onAddToPrompt={(text: string) => {
              if (addToPromptRef.current) {
                addToPromptRef.current(text);
              }
            }}
            onAddTool={(tool: ITool) => {
              if (addToolRef.current) {
                addToolRef.current(tool);
              }
            }}
          />
        </Modal>
      )}
      <NewFlowModal
        open={showNewFlowModal && toggleOrder === ToggleOrder.FirstToggle && !loading}
        onClose={() => setShowNewFlowModal(false)}
        onContinue={(settings) => {
          setNewFlowSettings(settings);
          setNewFlowDraft({
            fbId: "",
            masterFlowId: "newFlow",
            createdTime: Date.now(),
            initialFlowId: "",
            title: settings.title,
            checkFollower: settings.checkFollower,
            initalFlow: null,
            onMessagePosition: null,
          });
          setShowNewFlowModal(false);
          setUserSelectedId("newFlow");
        }}
      />
      <Modal
        closePopup={handleClosePromptAnalysisModal}
        classNamePopup="popup"
        showContent={showPromptAnalysisModal && toggleOrder === ToggleOrder.SecondToggle && !loading}>
        <div className={styles.promptAnalysisModal}>
          <h2 id="modal-title" className="title2">
            {t(LanguageKey.promptanalysis)}
          </h2>
          <TextArea
            className={"TextArea"}
            handleInputChange={(e) => setPromptAnalysisText(e.target.value)}
            value={promptAnalysisText}
            title={t(LanguageKey.promptanalysis)}
            autoExpandOnFocus
            initialHeight={500}
            placeholder={t(LanguageKey.promptanalysisplaceholder)}
          />
          <div className={styles.promptAnalysisModalActions}>
            <button type="button" className="cancelButton" onClick={handleClosePromptAnalysisModal}>
              {t(LanguageKey.close)}
            </button>
            <button
              type="button"
              className={`saveButton ${promptAnalysisText.length <= 20 ? "fadeDiv" : ""}`}
              onClick={handleAcceptPromptAnalysis}
              disabled={promptAnalysisText.length <= 20}>
              {t(LanguageKey.accept)}
            </button>
          </div>
        </div>
      </Modal>
      {/* ================================================================= */}
      {/* SETTINGS MODAL - مودال تنظیمات */}
      {/* ================================================================= */}
      {settingModalProps && (
        <Modal
          closePopup={() => setSettingModalVisible(false)}
          classNamePopup={"popup"}
          showContent={settingModalVisible && toggleOrder === ToggleOrder.FirstToggle && !loading}>
          <SettingModal
            masterFlowId={settingModalProps.masterFlowId}
            snapToGridEnabled={settingModalProps.snapToGridEnabled}
            setSnapToGridEnabled={settingModalProps.setSnapToGridEnabled}
            showMinimap={settingModalProps.showMinimap}
            setShowMinimap={settingModalProps.setShowMinimap}
            panningBoundaryEnabled={settingModalProps.panningBoundaryEnabled}
            setPanningBoundaryEnabled={settingModalProps.setPanningBoundaryEnabled}
            exportFlow={settingModalProps.exportFlow}
            importFlow={settingModalProps.importFlow}
            deleteAllNodes={settingModalProps.deleteAllNodes}
            editorState={settingModalProps.editorState}
            lastSaved={settingModalProps.lastSaved}
            historyIndex={settingModalProps.historyIndex}
            history={settingModalProps.history}
            flowTitle={settingModalProps.flowTitle}
            checkFollower={settingModalProps.checkFollower}
            setCheckFollower={settingModalProps.setCheckFollower}
            privateReplyCompability={settingModalProps.privateReplyCompability}
            isAutoSaving={settingModalProps.isAutoSaving}
            isValidFlow={settingModalProps.isValidFlow}
            onSaveSuccess={settingModalProps.onSaveSuccess}
            unsavedChanges={settingModalProps.unsavedChanges}
            updateFlow={handleUpdateFlow}
            cancelSave={() => setSettingModalVisible(false)}
          />
        </Modal>
      )}
      {/* LiveChat component for AI prompt testing */}
      {toggleOrder === ToggleOrder.SecondToggle && !loading && showLiveChatPopup && promptInfo && (
        <Modal
          closePopup={setShowLiveChatPopup.bind(this, false)}
          classNamePopup={"popup"}
          showContent={
            toggleOrder === ToggleOrder.SecondToggle && !loading && showLiveChatPopup && promptInfo !== null
          }>
          <LiveChat promptInfo={promptInfo} />
        </Modal>
      )}

      {/* ================================================================= */}
      {/* LIVE TEST MODAL - شبیه‌ساز دایرکت اینستاگرام */}
      {/* ================================================================= */}
      {liveTestVisible && getEditorStateRef.current && (
        <LiveTestModal
          isOpen={liveTestVisible}
          onClose={() => setLiveTestVisible(false)}
          editorState={{
            nodes: getEditorStateRef.current().nodes,
            connections: getEditorStateRef.current().connections,
          }}
          title={getEditorStateRef.current().title}
        />
      )}
      {/* ================================================================= */}
      {/* TUTORIAL MODAL - مودال آموزش (moved from Flow) */}
      {/* ================================================================= */}
      {tutorialModal.visible && tutorialModal.nodeType && (
        <Modal
          closePopup={() => setTutorialModal({ visible: false, nodeType: null })}
          classNamePopup="popup"
          showContent={tutorialModal.visible}>
          <TutorialModalContent
            nodeType={tutorialModal.nodeType}
            onClose={() => setTutorialModal({ visible: false, nodeType: null })}
          />
        </Modal>
      )}
      <Modal closePopup={() => setShowNotFeature(false)} classNamePopup="popupSendFile" showContent={showNotFeature}>
        <NotFeature onClose={() => setShowNotFeature(false)} />
      </Modal>
    </>
  );
};

export default FlowAndAIInbox;
