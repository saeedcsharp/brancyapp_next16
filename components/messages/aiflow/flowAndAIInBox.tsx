import { useSession } from "next-auth/react";
import router, { useRouter } from "next/router";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import InputText from "saeed/components/design/inputText";
import RingLoader from "saeed/components/design/loader/ringLoder";
import Modal from "saeed/components/design/modal";
import FlexibleToggleButton from "saeed/components/design/toggleButton/flexibleToggleButton";
import { ToggleOrder } from "saeed/components/design/toggleButton/types";
import { NotifType, notify, ResponseType } from "saeed/components/notifications/notificationBox";
import Loading from "saeed/components/notOk/loading";
import NotAllowed from "saeed/components/notOk/notAllowed";
import { getThumbnailStyle } from "saeed/helper/getThumbnailColor";
import { LoginStatus, RoleAccess } from "saeed/helper/loadingStatus";
import initialzedTime, { convertToMilliseconds } from "saeed/helper/manageTimer";
import { LanguageKey } from "saeed/i18n";
import { PartnerRole } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { IAITools, ICreatePrompt, IPrompts, ITotalPrompt } from "saeed/models/AI/prompt";
import { GetServerResult, MethodType } from "saeed/models/IResult";
import { IMasterFlow, ITotalMasterFlow } from "saeed/models/messages/properies";
import AIPromptBox from "./aiPromptBox";
import Flow from "./flow";
import styles from "./flowAndAIIBox.module.css";
import { LiveTestModal } from "./flowNode";
import { TutorialModalContent } from "./flowNode/NodeTutorials";
import { SettingModal } from "./flowNode/settingmodal";
import AIToolsSettings from "./popup/AIToolsSettings";
import LiveChat from "./popup/liveChat";

let firstTime = 0;
let touchMove = 0;
let touchStart = 0;
let firstPos = { x: 0, y: 0 };
let downFlagLeft = false;
let downFlagRight = false;
let hideDivIndex: string | number | null = null;
const FlowAndAIInbox = () => {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const { t } = useTranslation();
  const routerHook = useRouter();
  const [searchMasterFlowInbox, setSearchMasterFlowInbox] = useState<IMasterFlow>();
  const [searchPromptInbox, setSearchPromptInbox] = useState<IPrompts>();
  const [loading, setLoading] = useState(LoginStatus(session) && RoleAccess(session, PartnerRole.SystemTicket));
  const [searchbox, setSearchbox] = useState("");
  const [toggleOrder, setToggleOrder] = useState<ToggleOrder>(ToggleOrder.FirstToggle);
  const [userSelectedId, setUserSelectedId] = useState<string | null>(null);
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

  // LiveChat related states
  const [showLiveChatPopup, setShowLiveChatPopup] = useState(false);
  const [promptInfo, setPromptInfo] = useState<ICreatePrompt | null>(null);

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

  const handleOpenLiveTest = () => {
    setLiveTestVisible(true);
  };

  const handleRegisterGetEditorState = (fn: () => { nodes: any[]; connections: any[]; title: string }) => {
    getEditorStateRef.current = fn;
  };

  // Callback refs to be set by Editor component
  const addToPromptRef = useRef<((text: string) => void) | null>(null);
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
        let flowRes = await GetServerResult<boolean, IMasterFlow>(
          MethodType.get,
          session,
          "Instagramer/Flow/GetMasterFlows",
          null,
          [
            { key: "query", value: query ? query : undefined },
            {
              key: "nextMaxId",
              value: nextMaxId ? nextMaxId : undefined,
            },
          ],
        );
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
        let promptRes = await GetServerResult<boolean, IPrompts>(
          MethodType.get,
          session,
          "Instagramer/AI/GetPrompts",
          null,
          [
            { key: "query", value: query ? query : undefined },
            {
              key: "nextMaxId",
              value: nextMaxId ? nextMaxId : undefined,
            },
          ],
        );
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
        GetServerResult<boolean, IMasterFlow>(MethodType.get, session, "Instagramer/Flow/GetMasterFlows", null),
        GetServerResult<boolean, IPrompts>(MethodType.get, session, "Instagramer/AI/GetPrompts"),
        GetServerResult<boolean, IAITools[]>(MethodType.get, session, "Instagramer/AI/GetTools"),
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
          items: [masterFlow, ...prev.items],
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

            <InputText
              className={"serachMenuBar"}
              placeHolder={t(LanguageKey.searchKeyword)}
              handleInputChange={handleSearchThreads}
              value={searchbox}
              maxLength={undefined}
              name="Search from People or Keyword"
            />

            {/* ___switch button ___*/}
            <FlexibleToggleButton
              onChange={handleToggleChange}
              selectedValue={toggleOrder}
              options={[
                { label: t(LanguageKey.Flow), id: 0 },
                { label: t(LanguageKey.AI), id: 1 },
              ]}
            />
            {toggleOrder === ToggleOrder.FirstToggle && (
              <>
                <div
                  onClick={() => {
                    setUserSelectedId("newFlow");
                  }}
                  className={styles.addnewlink}
                  title="◰ Create new Flow">
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
                onOpenLiveTest={handleOpenLiveTest}
                onOpenTutorial={handleOpenTutorial}
                onRegisterGetEditorState={handleRegisterGetEditorState}
                onRegisterReload={handleRegisterReload}
                existingFlows={masterFlow?.items || []}
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
                showLiveChatPopup={showLiveChatPopup}
                setShowLiveChatPopup={setShowLiveChatPopup}
                promptInfo={promptInfo}
                setPromptInfo={setPromptInfo}
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
            onAddToPrompt={(text: string) => {
              if (addToPromptRef.current) {
                addToPromptRef.current(text);
              }
            }}
          />
        </Modal>
      )}
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
    </>
  );
};

export default FlowAndAIInbox;
